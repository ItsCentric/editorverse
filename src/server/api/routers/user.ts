import z from "zod/v4";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { userFollows, users } from "~/server/db/schema";
import { and, ilike, inArray, ne, eq, aliasedTable } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

const followersTable = aliasedTable(users, "followers");
const followingTable = aliasedTable(users, "following");

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
        .select()
        .from(users)
        .where(inArray(users.username, input));
      const clerk = await clerkClient();
      const clerkIds = usersByUsername.map((user) => user.clerkId);
      const { data: clerkUsers } = await clerk.users.getUserList({
        userId: clerkIds,
      });
      return usersByUsername.map((user) => {
        const clerkUser = clerkUsers.find((c) => c.id === user.clerkId);
        if (!clerkUser) throw new Error("Clerk user not found");
        return {
          ...user,
          avatarUrl: clerkUser.imageUrl,
          bio: clerkUser.publicMetadata?.bio as string | undefined,
        };
      });
    }),

  getFollowersByUsername: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const followers = await db
        .select({ user: followersTable })
        .from(userFollows)
        .innerJoin(
          followersTable,
          eq(followersTable.id, userFollows.followerId),
        )
        .innerJoin(
          followingTable,
          eq(followingTable.id, userFollows.followedId),
        )
        .where(eq(followingTable.username, input));
      const followerClerkIds = followers.map((follow) => follow.user.clerkId);
      const clerk = await clerkClient();
      const { data: clerkUsers } = await clerk.users.getUserList({
        userId: followerClerkIds,
      });
      return followers.map((follower) => {
        const clerkUser = clerkUsers.find(
          (c) => c.id === follower.user.clerkId,
        );
        if (!clerkUser) throw new Error("Clerk user not found");

        return {
          username: follower.user.username,
          imageUrl: clerkUser.imageUrl,
        };
      });
    }),

  getFollowingByUsername: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const following = await db
        .select({ user: followingTable })
        .from(userFollows)
        .innerJoin(
          followersTable,
          eq(followersTable.id, userFollows.followerId),
        )
        .innerJoin(
          followingTable,
          eq(followingTable.id, userFollows.followedId),
        )
        .where(eq(followersTable.username, input));
      const followingClerkIds = following.map((follow) => follow.user.clerkId);
      const clerk = await clerkClient();
      const { data: clerkUsers } = await clerk.users.getUserList({
        userId: followingClerkIds,
      });
      return following.map((follow) => {
        const clerkUser = clerkUsers.find((c) => c.id === follow.user.clerkId);
        if (!clerkUser) throw new Error("Clerk user not found");

        return {
          username: follow.user.username,
          imageUrl: clerkUser.imageUrl,
        };
      });
    }),
});
