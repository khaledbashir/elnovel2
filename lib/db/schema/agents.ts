import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, timestamp, boolean } from "drizzle-orm/mysql-core";

/**
 * Custom AI Agents Table
 * Stores user-defined agents with custom system instructions
 */
export const agents = mysqlTable("agents", {
    id: varchar("id", { length: 191 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    systemInstructions: text("system_instructions").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    icon: varchar("icon", { length: 50 }), // Emoji or icon identifier
    createdAt: timestamp("created_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .onUpdateNow()
        .notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
