import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const rateLimits = sqliteTable("rate_limits", {
  ipHash: text("ip_hash").primaryKey(),
  count: integer("count").notNull(),
  lastReset: text("last_reset").notNull(), // ISO date YYYY-MM-DD
});

export const tacos = sqliteTable("tacos", {
  id: integer().primaryKey({ autoIncrement: true }),
  query: text("query").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients"),
  verdict: text("verdict").notNull(),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const recipes = sqliteTable("recipes", {
  id: integer().primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  tacoId: integer("taco_id")
    .references(() => tacos.id)
    .notNull(),
  instructions: text("instructions").notNull(),
  ingredients: text("ingredients").notNull(),
  createdAt: integer("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const votes = sqliteTable(
  "votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    recipeUuid: text("recipe_uuid").notNull(),
    ipHash: text("ip_hash").notNull(),
    vote: integer("vote").notNull(), // 1 = like, 0 = dislike
  },
  (t) => [uniqueIndex("idx_votes_recipe_ip").on(t.recipeUuid, t.ipHash)]
);
