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
  thumbnails,
} from "~/server/db/schema/schema";
import { users } from "~/server/db/schema/auth";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod/v4";
import { and, desc, eq, ilike, inArray, lt, or, sql } from "drizzle-orm";

export const postsSchema = createSelectSchema(posts);
export const usersSchema = createSelectSchema(users);
export const postDedicationsSchema = createSelectSchema(postDedications);
export const postCategoriesSchema = createSelectSchema(postCategories);
export const categoriesSchema = createSelectSchema(categories);
const postTypeEnumSchema = createSelectSchema(postTypeEnum);
const cursorSchema = z
  .object({ id: z.string(), createdAt: z.date() })
  .optional();
const cursorFilter = (cursor: z.infer<typeof cursorSchema>) =>
  cursor
    ? or(
        lt(posts.createdAt, cursor.createdAt),
        and(eq(posts.createdAt, cursor.createdAt), lt(posts.id, cursor.id)),
      )
    : undefined;

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
  id: z.uuid().optional(),
  videoUrl: z.url().min(1, "Video URL is missing"),
  thumbnailUrls: z.url().array().min(1, "Missing at least 1 thumbnail URL"),
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
      const { db, auth } = ctx;
      const {
        id,
        videoUrl,
        musicTitle,
        musicArtist,
        caption,
        remakePostId,
        type,
      } = input;
      await db.transaction(async (tx) => {
        const insertedPosts = await tx
          .insert(posts)
          .values({
            id,
            authorId: auth.id,
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
        const thumbnailData = input.thumbnailUrls.map((url) => ({
          postId: insertedPostId,
          url,
        }));
        await tx.insert(thumbnails).values(thumbnailData);
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
        cursor: cursorSchema,
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
        where: cursorFilter(input.cursor),
        with: {
          dedications: { with: { user: true } },
          author: true,
          categories: { with: { category: true } },
          inspirations: { with: { user: true } },
          artCredits: true,
          remadePost: true,
          comments: true,
          thumbnails: true,
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
      const nextCursor =
        items.length === input.limit ? items[items.length - 1] : undefined;

      return {
        nextCursor: nextCursor
          ? { id: nextCursor.id, createdAt: nextCursor.createdAt }
          : undefined,
        items,
      };
    }),

  getPostsByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
        cursor: cursorSchema,
        limit: z.number().default(9),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { username, cursor } = input;

      const userPosts = await db
        .select({
          id: posts.id,
          createdAt: posts.createdAt,
          thumbnailUrl: thumbnails.url,
        })
        .from(posts)
        .innerJoin(users, eq(users.id, posts.authorId))
        .innerJoin(thumbnails, eq(thumbnails.postId, posts.id))
        .where(and(eq(users.username, username), cursorFilter(cursor)))
        .orderBy(desc(posts.createdAt))
        .limit(input.limit);

      return {
        items: userPosts,
        nextCursor:
          userPosts.length === input.limit
            ? userPosts[userPosts.length - 1]
            : undefined,
      };
    }),

  getPostById: publicProcedure.input(z.uuid()).query(async ({ ctx, input }) => {
    const { db } = ctx;
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, input),
      with: {
        dedications: { with: { user: true } },
        author: true,
        categories: { with: { category: true } },
        inspirations: { with: { user: true } },
        artCredits: true,
        remadePost: true,
        comments: { with: { author: true } },
        thumbnails: true,
      },
      extras: {
        likeCount:
          sql<number>`(SELECT COUNT(*) FROM ${likes} WHERE ${likes}.post_id = ${posts}.id)`
            .mapWith(Number)
            .as("likeCount"),
      },
      orderBy: desc(posts.createdAt),
    });
    if (!post) throw new Error("Post not found");
    return post;
  }),
});
