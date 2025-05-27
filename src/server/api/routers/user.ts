import z from "zod/v4";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { and, ilike, inArray, ne } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        clerkId: z.string().min(1),
        username: z.string().min(1),
        email: z.email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const insertResults = await db
        .insert(users)
        .values(input)
        .returning({ id: users.id });
      const insertResult = insertResults[0];
      if (!insertResult) {
        throw new Error("Failed to create user");
      }
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(input.clerkId, {
        privateMetadata: { dbUserId: insertResult.id },
        publicMetadata: { onboarded: true },
      });
      return insertResult.id;
    }),
  searchForUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { db, auth } = ctx;
      const searchResults = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(
          auth.userId
            ? and(
                ne(users.clerkId, auth.userId),
                ilike(users.username, `%${input}%`),
              )
            : ilike(users.username, `%${input}%`),
        )
        .limit(10);
      return searchResults;
    }),
  getUsersByUsername: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const usersByUsername = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(inArray(users.username, input));
      return usersByUsername;
    }),
});
