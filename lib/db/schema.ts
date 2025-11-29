import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import type { InferSelectModel } from "drizzle-orm";

export const user = mysqlTable("User", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  email: varchar("email", { length: 64 }).notNull(),
  password: varchar("password", { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = mysqlTable("Chat", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
  userId: varchar("userId", { length: 36 })
    .notNull()
    .references(() => user.id),
  visibility: mysqlEnum("visibility", ["public", "private"])
    .notNull()
    .default("private"),
  lastContext: json("lastContext"),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = mysqlTable("Message", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  chatId: varchar("chatId", { length: 36 })
    .notNull()
    .references(() => chat.id),
  role: varchar("role", { length: 20 }).notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = mysqlTable(
  "Vote",
  {
    chatId: varchar("chatId", { length: 36 })
      .notNull()
      .references(() => chat.id),
    messageId: varchar("messageId", { length: 36 })
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;

export const document = mysqlTable(
  "Document",
  {
    id: varchar("id", { length: 36 }).notNull(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: mysqlEnum("kind", ["text", "code", "image", "sheet"])
      .notNull()
      .default("text"),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = mysqlTable(
  "Suggestion",
  {
    id: varchar("id", { length: 36 }).notNull(),
    documentId: varchar("documentId", { length: 36 }).notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: varchar("userId", { length: 36 })
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = mysqlTable(
  "Stream",
  {
    id: varchar("id", { length: 36 }).notNull(),
    chatId: varchar("chatId", { length: 36 }).notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
  })
);

export type Stream = InferSelectModel<typeof stream>;

export const slashCommand = mysqlTable("SlashCommand", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  searchTerms: text("searchTerms"),
  prompt: text("prompt").notNull(),
  model: varchar("model", { length: 50 }).default("gpt-4"),
  provider: varchar("provider", { length: 50 }).default("openai"),
  isActive: boolean("isActive").default(true),
  isSystem: boolean("isSystem").default(false),
  userId: varchar("userId", { length: 36 }).references(() => user.id),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export type SlashCommand = InferSelectModel<typeof slashCommand>;
