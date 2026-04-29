import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  passwordHash: text("password_hash"),
});

export const organizationsTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const membershipsTable = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
});

export const pulsesTable = pgTable("pulses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdById: uuid("created_by_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  deletedAt: timestamp("deleted_at"),
  dueDate: timestamp("due_date"),
});

export const activityLogsTable = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: text("action").notNull(), // "pulse_created" | "pulse_deleted"
  message: text("message").notNull(),
  userId: uuid("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  organizationId: uuid("organization_id").references(
    () => organizationsTable.id,
    { onDelete: "cascade" },
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  pulseId: uuid("pulse_id").references(() => pulsesTable.id, {
    onDelete: "set null",
  }),
});

export const pulseCommentsTable = pgTable("pulse_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  pulseId: uuid("pulse_id")
    .notNull()
    .references(() => pulsesTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "set null" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pulseAssignmentsTable = pgTable(
  "pulse_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pulseId: uuid("pulse_id")
      .notNull()
      .references(() => pulsesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [uniqueIndex("pulse_user_unique").on(table.pulseId, table.userId)],
);
