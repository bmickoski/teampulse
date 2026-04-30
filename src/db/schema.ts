import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { type NotificationType } from "@/lib/types";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  passwordHash: text("password_hash"),
  activeOrgId: uuid("active_org_id").references(() => organizationsTable.id, {
    onDelete: "set null",
  }),
  dashboardLayout: jsonb("dashboard_layout").$type<string[]>(),
});

export const organizationsTable = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const membershipsTable = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizationsTable.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"),
  },
  (table) => [
    index("memberships_user_idx").on(table.userId),
    index("memberships_org_idx").on(table.organizationId),
  ],
);

export const pulsesTable = pgTable(
  "pulses",
  {
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
    priority: text("priority").notNull().default("medium"),
  },
  (table) => [
    index("pulses_org_created_idx").on(table.organizationId, table.createdAt),
    index("pulses_org_status_idx").on(table.organizationId, table.status),
    index("pulses_org_priority_idx").on(table.organizationId, table.priority),
    index("pulses_org_deleted_idx").on(table.organizationId, table.deletedAt),
  ],
);

export const activityLogsTable = pgTable(
  "activity_logs",
  {
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
  },
  (table) => [
    index("activity_logs_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("activity_logs_pulse_created_idx").on(table.pulseId, table.createdAt),
  ],
);

export const pulseCommentsTable = pgTable(
  "pulse_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pulseId: uuid("pulse_id")
      .notNull()
      .references(() => pulsesTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "set null" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("pulse_comments_pulse_created_idx").on(
      table.pulseId,
      table.createdAt,
    ),
  ],
);

export const pulseCommentMentionsTable = pgTable(
  "pulse_comment_mentions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => pulseCommentsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("comment_mention_unique").on(table.commentId, table.userId),
  ],
);

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
  (table) => [
    uniqueIndex("pulse_user_unique").on(table.pulseId, table.userId),
    index("pulse_assignments_user_idx").on(table.userId),
  ],
);

export const notificationsTable = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    pulseId: uuid("pulse_id").references(() => pulsesTable.id, {
      onDelete: "cascade",
    }),
    type: text("type").$type<NotificationType>().notNull().default("general"),
    message: text("message").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_user_read_idx").on(table.userId, table.read),
  ],
);

export const inviteTokensTable = pgTable("invite_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});
