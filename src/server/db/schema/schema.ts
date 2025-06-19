import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns.helpers";
import { relations } from "drizzle-orm";
import { users } from "./auth";

export const postTypeEnum = pgEnum("post_types", [
  "regular",
  "collaborative",
  "recruiting",
]);

export const posts = pgTable(
  "posts",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    ...timestamps,
    authorId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    caption: d.text().notNull(),
    videoUrl: d.text().notNull(),
    remakePostId: d
      .uuid()
      .references((): AnyPgColumn => posts.id, { onDelete: "set null" }),
    musicTitle: d.text(),
    musicArtist: d.text(),
    type: postTypeEnum().notNull(),
  }),
  (t) => [index().on(t.authorId)],
);

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  remadePost: one(posts, {
    fields: [posts.remakePostId],
    references: [posts.id],
  }),
  dedications: many(postDedications),
  categories: many(postCategories),
  inspirations: many(postInspirations),
  artCredits: many(artistCredits),
  likes: many(likes),
  comments: many(comments),
}));

export const reposts = pgTable(
  "reposts",
  (d) => ({
    postId: d
      .uuid()
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    userId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const postDedications = pgTable("post_dedications", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  postId: d
    .uuid()
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  dedicatedToUserId: d
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  isSpecial: d.boolean().notNull(),
}));

export const postDedicationRelations = relations(
  postDedications,
  ({ one }) => ({
    post: one(posts, {
      fields: [postDedications.postId],
      references: [posts.id],
    }),
    user: one(users, {
      fields: [postDedications.dedicatedToUserId],
      references: [users.id],
    }),
  }),
);

export const postInspirations = pgTable(
  "post_inspirations",
  (d) => ({
    postId: d
      .uuid()
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    inspiredByUserId: d
      .text()
      .references(() => users.id, { onDelete: "set null" })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.postId, t.inspiredByUserId] })],
);

export const postInspirationRelations = relations(
  postInspirations,
  ({ one }) => ({
    post: one(posts, {
      fields: [postInspirations.postId],
      references: [posts.id],
    }),
    user: one(users, {
      fields: [postInspirations.inspiredByUserId],
      references: [users.id],
    }),
  }),
);

export const categories = pgTable("categories", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  name: d.text().notNull().unique(),
}));

export const postCategories = pgTable("post_categories", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  postId: d
    .uuid()
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  categoryId: d
    .uuid()
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
}));

export const postCategoryRelations = relations(postCategories, ({ one }) => ({
  post: one(posts, {
    fields: [postCategories.postId],
    references: [posts.id],
  }),
  category: one(categories, {
    fields: [postCategories.categoryId],
    references: [categories.id],
  }),
}));

export const likes = pgTable(
  "likes",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    ...timestamps,
    deletedAt: d.timestamp({ withTimezone: true }),
    userId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: d
      .uuid()
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
  }),
  (t) => [index().on(t.postId), unique().on(t.userId, t.postId)],
);

export const likeRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
}));

export const comments = pgTable(
  "comments",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    ...timestamps,
    authorId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: d
      .uuid()
      .references(() => posts.id, { onDelete: "cascade" })
      .notNull(),
    content: d.text().notNull(),
    parentCommentId: d
      .uuid()
      .references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
    originalCommentId: d
      .uuid()
      .references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
  }),
  (t) => [index().on(t.postId)],
);

export const commentRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
  }),
  originalComment: one(comments, {
    fields: [comments.originalCommentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const saves = pgTable(
  "saves",
  (d) => ({
    userId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    postId: d
      .uuid()
      .references(() => posts.id)
      .notNull(),
    collectionId: d
      .uuid()
      .references(() => collections.id)
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.userId, t.postId, t.collectionId] })],
);

export const collections = pgTable("collections", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  userId: d
    .text()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: d.text().notNull(),
}));

export const artistCredits = pgTable("artist_credits", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  postId: d
    .uuid()
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  artistHandle: d.text().notNull(),
  artUrl: d.text().notNull(),
}));

export const artistCreditRelations = relations(artistCredits, ({ one }) => ({
  post: one(posts, {
    fields: [artistCredits.postId],
    references: [posts.id],
  }),
}));

export const userFollows = pgTable(
  "user_follows",
  (d) => ({
    followerId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    followedId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  }),
  (t) => [
    index().on(t.followedId),
    index().on(t.followerId),
    unique().on(t.followerId, t.followedId),
  ],
);

export const userFollowRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
  }),
  followed: one(users, {
    fields: [userFollows.followedId],
    references: [users.id],
  }),
}));

export const userBlocks = pgTable(
  "user_blocks",
  (d) => ({
    blockerId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    blockedId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.blockerId, t.blockedId] })],
);

export const groups = pgTable("groups", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  name: d.text().notNull(),
  description: d.text(),
  logoUrl: d.text(),
}));

export const membershipTypeEnum = pgEnum("membership_types", [
  "lead",
  "member",
]);

export const groupMemberships = pgTable(
  "group_memberships",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    ...timestamps,
    userId: d
      .text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    groupId: d
      .uuid()
      .references(() => groups.id, { onDelete: "cascade" })
      .notNull(),
    membershipType: membershipTypeEnum().notNull(),
  }),
  (t) => [unique().on(t.userId, t.groupId)],
);

export const groupFollows = pgTable("group_follows", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  userId: d
    .text()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  groupId: d
    .uuid()
    .references(() => groups.id, { onDelete: "cascade" })
    .notNull(),
}));

export const messages = pgTable("messages", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  senderId: d
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  receiverId: d
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
  content: d.text().notNull(),
}));

export const collaborativePosts = pgTable("collaborative_posts", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  postId: d
    .uuid()
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  collaboratorId: d
    .text()
    .references(() => users.id, { onDelete: "set null" })
    .notNull(),
}));

export const recruitingPosts = pgTable("recruiting_posts", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  postId: d
    .uuid()
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  applicationId: d
    .uuid()
    .references(() => groupApplications.id, { onDelete: "cascade" })
    .notNull(),
}));

export const applicationForms = pgTable("application_forms", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  groupId: d
    .uuid()
    .references(() => groups.id, { onDelete: "cascade" })
    .notNull(),
  postId: d
    .uuid()
    .references(() => posts.id, { onDelete: "cascade" })
    .notNull(),
  deadline: d.timestamp({ withTimezone: true }).notNull(),
}));

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const groupApplications = pgTable("group_applications", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  applicationFormId: d
    .uuid()
    .references(() => applicationForms.id)
    .notNull(),
  applicantId: d
    .text()
    .references(() => users.id)
    .notNull(),
  status: applicationStatusEnum().notNull(),
}));

export const questionTypeEnum = pgEnum("question_type", [
  "free_response",
  "multiple_choice",
  "post",
]);

export const formQuestions = pgTable("form_questions", (d) => ({
  id: d.uuid().primaryKey().defaultRandom(),
  ...timestamps,
  question: d.text().notNull(),
  applicationFormId: d
    .uuid()
    .references(() => applicationForms.id)
    .notNull(),
  type: questionTypeEnum().notNull(),
  answerLimit: d.integer(),
}));

export const formQuestionResponses = pgTable(
  "form_question_responses",
  (d) => ({
    id: d.uuid().primaryKey().defaultRandom(),
    ...timestamps,
    formQuestionId: d
      .uuid()
      .references(() => formQuestions.id)
      .notNull(),
    payload: d.jsonb().notNull(),
    applicantId: d
      .text()
      .references(() => users.id)
      .notNull(),
  }),
  (t) => [unique().on(t.formQuestionId, t.applicantId)],
);
