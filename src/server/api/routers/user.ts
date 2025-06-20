import z from "zod/v4";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { userFollows } from "~/server/db/schema/schema";
import { users } from "~/server/db/schema/auth";
import { and, ilike, inArray, ne, eq, aliasedTable, or } from "drizzle-orm";

const followersTable = aliasedTable(users, "followers");
const followingTable = aliasedTable(users, "following");

export const userRouter = createTRPCRouter({
  searchForUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { db, auth } = ctx;
      const searchResults = await db
        .select({ id: users.id, username: users.username })
        .from(users)
        .where(
          auth?.id
            ? and(ne(users.id, auth.id), ilike(users.username, `%${input}%`))
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
      return usersByUsername;
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
      return followers;
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
      return following;
    }),

  getUserByEmail: publicProcedure
    .input(z.email())
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, input))
        .limit(1);
      return user[0] ?? null;
    }),

  checkForExistingAccount: publicProcedure
    .input(z.object({ username: z.string(), email: z.email() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const existingUser = await db
        .select()
        .from(users)
        .where(
          or(eq(users.username, input.username), eq(users.email, input.email)),
        )
        .limit(1);
      return {
        username: existingUser[0]?.username === input.username,
        email: existingUser[0]?.email === input.email,
      };
    }),
});
