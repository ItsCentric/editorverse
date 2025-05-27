import { createSelectSchema } from "drizzle-zod";
import {
  artistCredits,
  categories,
  postCategories,
  postDedications,
  postInspirations,
  posts,
  postTypeEnum,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod/v4";
import { currentUser } from "@clerk/nextjs/server";
import { ilike, inArray } from "drizzle-orm";

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
        if (input.dedicatedToUserIds) {
          const data = input.dedicatedToUserIds.map((userId) => ({
            postId: insertedPostId,
            dedicatedToUserId: userId,
            isSpecial: false,
          }));
          await tx.insert(postDedications).values(data);
        }
        if (input.specialDedicatedToUserIds) {
          const data = input.specialDedicatedToUserIds.map((userId) => ({
            postId: insertedPostId,
            dedicatedToUserId: userId,
            isSpecial: true,
          }));
          await tx.insert(postDedications).values(data);
        }
        if (input.inspiredByUserIds) {
          const data = input.inspiredByUserIds.map((userId) => ({
            postId: insertedPostId,
            inspiredByUserId: userId,
          }));
          await tx.insert(postInspirations).values(data);
        }
        if (input.artCredits) {
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
});
