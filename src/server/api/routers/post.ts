import { createSelectSchema } from "drizzle-zod";
import {
  artistCredits,
  categories,
  likes,
  postCategories,
  postDedications,
  postInspirations,
  posts,
  postTypeEnum,
  users,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod/v4";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { and, desc, eq, ilike, inArray, lt, or, sql } from "drizzle-orm";

export const postsSchema = createSelectSchema(posts);
export const usersSchema = createSelectSchema(users);
export const postDedicationsSchema = createSelectSchema(postDedications);
export const postCategoriesSchema = createSelectSchema(postCategories);
export const categoriesSchema = createSelectSchema(categories);
const postTypeEnumSchema = createSelectSchema(postTypeEnum);

const emptyStringToUndefined = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() === "") {
    return undefined;
  } else {
    return val;
  }
}, z.string().optional());

const emptyUuidToUndefined = z.preprocess((val) => {
  if (typeof val === "string" && val.trim() === "") {
    return undefined;
  } else {
    return val;
  }
}, z.uuid().optional());

const createPostInputSchema = z.object({
  videoUrl: z.url().min(1, "Video URL is missing"),
  musicTitle: emptyStringToUndefined,
  musicArtist: emptyStringToUndefined,
  caption: z.string(),
  remakePostId: emptyUuidToUndefined.optional(),
  type: z.enum(postTypeEnumSchema.options),
  dedicatedToUserIds: z.array(z.uuid()).optional(),
  specialDedicatedToUserIds: z.array(z.uuid()).optional(),
  categories: z.array(z.object({ id: z.uuid().nullable(), name: z.string() })),
  inspiredByUserIds: z.uuid().array().optional(),
  artCredits: z
    .array(z.object({ artistHandle: z.string(), artUrl: z.url() }))
    .optional(),
});

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(createPostInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const user = await currentUser();
      if (!user) {
        throw new Error("User not found");
      }
      const userId = user.privateMetadata.dbUserId;
      if (!userId || typeof userId !== "string") {
        throw new Error("User ID not set in private metadata");
      }
      const { videoUrl, musicTitle, musicArtist, caption, remakePostId, type } =
        input;
      await db.transaction(async (tx) => {
        const insertedPosts = await tx
          .insert(posts)
          .values({
            authorId: userId,
            videoUrl,
            musicTitle,
            musicArtist,
            caption,
            remakePostId,
            type,
          })
          .returning({ postId: posts.id });
        const insertedPostId = insertedPosts[0]?.postId;
        if (!insertedPostId) {
          throw new Error("Failed to insert post");
        }
        const nonexistingCategories = input.categories
          .filter((category) => !category.id)
          .map((category) => category.name.toLowerCase());
        const existingCategories = input.categories
          .filter((category) => category.id)
          .map((category) => category.id!);
        const categoriesData = nonexistingCategories.map((category) => ({
          name: category,
        }));
        await tx
          .insert(categories)
          .values(categoriesData)
          .onConflictDoNothing();
        const categoriesResult = await tx
          .select({ id: categories.id })
          .from(categories)
          .where(inArray(categories.name, nonexistingCategories));
        const allCategoryIds = [
          ...existingCategories,
          ...categoriesResult.map((category) => category.id),
        ];
        const postCategoryData = allCategoryIds.map((categoryId) => ({
          postId: insertedPostId,
          categoryId,
        }));
        await tx.insert(postCategories).values(postCategoryData);
        if (input.dedicatedToUserIds && input.dedicatedToUserIds.length > 0) {
          const data = input.dedicatedToUserIds.map((userId) => ({
            postId: insertedPostId,
            dedicatedToUserId: userId,
            isSpecial: false,
          }));
          await tx.insert(postDedications).values(data);
        }
        if (
          input.specialDedicatedToUserIds &&
          input.specialDedicatedToUserIds.length > 0
        ) {
          const data = input.specialDedicatedToUserIds.map((userId) => ({
            postId: insertedPostId,
            dedicatedToUserId: userId,
            isSpecial: true,
          }));
          await tx.insert(postDedications).values(data);
        }
        if (input.inspiredByUserIds && input.inspiredByUserIds.length > 0) {
          const data = input.inspiredByUserIds.map((userId) => ({
            postId: insertedPostId,
            inspiredByUserId: userId,
          }));
          await tx.insert(postInspirations).values(data);
        }
        if (input.artCredits && input.artCredits.length > 0) {
          if (!input.musicTitle || !input.musicArtist) {
            throw new Error("Both music title and artist must be provided");
          }
          const artistCreditData = input.artCredits.map((credit) => ({
            postId: insertedPostId,
            artistHandle: credit.artistHandle,
            artUrl: credit.artUrl,
          }));
          await tx.insert(artistCredits).values(artistCreditData);
        }
      });
    }),

  searchPostCategories: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const searchResults = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(ilike(categories.name, `%${input}%`))
        .limit(10);
      return searchResults;
    }),

  getPosts_TESTING: publicProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
        limit: z.number().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      console.warn(
        "\x1b[43m",
        "\x1b[30m",
        "`getPosts_TESTING` is a test endpoint and should not be used in production.",
        "\x1b[0m",
      );
      const { db } = ctx;
      const items = await db.query.posts.findMany({
        where: input.cursor
          ? or(
              lt(posts.createdAt, input.cursor.createdAt),
              and(
                eq(posts.createdAt, input.cursor.createdAt),
                lt(posts.id, input.cursor.id),
              ),
            )
          : undefined,
        with: {
          dedications: { with: { user: true } },
          author: true,
          categories: { with: { category: true } },
          inspirations: { with: { user: true } },
          artCredits: true,
          remadePost: true,
          comments: true,
        },
        extras: {
          likeCount:
            sql<number>`(SELECT COUNT(*) FROM ${likes} WHERE ${likes}.post_id = ${posts}.id)`
              .mapWith(Number)
              .as("likeCount"),
        },
        orderBy: desc(posts.createdAt),
        limit: input.limit,
      });
      const clerkIdSet = new Set<string>();
      for (const item of items) {
        clerkIdSet.add(item.author.clerkId);
        for (const dedication of item.dedications) {
          clerkIdSet.add(dedication.user.clerkId);
        }
        for (const inspiration of item.inspirations) {
          clerkIdSet.add(inspiration.user.clerkId);
        }
      }
      const clerk = await clerkClient();
      const { data: clerkUsers } = await clerk.users.getUserList({
        userId: Array.from(clerkIdSet),
      });
      const clerkMap = new Map(
        clerkUsers.map((user) => [user.id, user.imageUrl]),
      );
      const mappedItems = items.map((item) => {
        const authorAvatar = clerkMap.get(item.author.clerkId);
        if (!authorAvatar)
          throw new Error("Could not map clerk user to database user (author)");
        const dedicationAvatar = clerkMap.get(item.author.clerkId);
        if (!dedicationAvatar)
          throw new Error(
            "Could not map clerk user to database user (dedication)",
          );
        const inspirationAvatar = clerkMap.get(item.author.clerkId);
        if (!inspirationAvatar)
          throw new Error(
            "Could not map clerk user to database user (inspiration)",
          );
        return {
          ...item,
          author: {
            ...item.author,
            imageUrl: authorAvatar,
          },
          dedications: item.dedications.map((dedication) => ({
            ...dedication,
            user: {
              ...dedication.user,
              imageUrl: dedicationAvatar,
            },
          })),
          inspirations: item.inspirations.map((inspiration) => ({
            ...inspiration,
            user: {
              ...inspiration.user,
              imageUrl: inspirationAvatar,
            },
          })),
        };
      });
      const nextCursor =
        mappedItems.length === input.limit
          ? mappedItems[mappedItems.length - 1]
          : undefined;

      return {
        nextCursor: nextCursor
          ? { id: nextCursor.id, createdAt: nextCursor.createdAt }
          : undefined,
        items: mappedItems,
      };
    }),
});
