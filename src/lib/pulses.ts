import { db } from "@/db";
import {
  activityLogsTable,
  pulseAssignmentsTable,
  pulseCommentMentionsTable,
  pulseCommentsTable,
  pulsesTable,
  usersTable,
} from "@/db/schema";
import { count } from "drizzle-orm/sql/functions/aggregate";
import { getCurrentUser } from "./auth";
import { getUserOrganization } from "./organizations";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export async function getStatusCounts() {
  const user = await getCurrentUser();
  if (!user) return [];

  const orgId = await getUserOrganization(String(user.id));
  if (!orgId) return [];

  const statusCounts = await db
    .select({ status: pulsesTable.status, count: count() })
    .from(pulsesTable)
    .where(
      and(eq(pulsesTable.organizationId, orgId), isNull(pulsesTable.deletedAt)),
    )
    .groupBy(pulsesTable.status);

  return statusCounts;
}

export async function getPulseComments(pulseId: string, orgId?: string) {
  const mentionUser = alias(usersTable, "mention_user");

  return db
    .select({
      id: pulseCommentsTable.id,
      content: pulseCommentsTable.content,
      createdAt: pulseCommentsTable.createdAt,
      authorName: usersTable.name,
      mentions: sql<{ userId: string; name: string | null }[]>`
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'userId', ${pulseCommentMentionsTable.userId},
              'name', ${mentionUser.name}
            )
          ) FILTER (WHERE ${pulseCommentMentionsTable.id} IS NOT NULL),
          '[]'::jsonb
        )
      `,
    })
    .from(pulseCommentsTable)
    .leftJoin(usersTable, eq(pulseCommentsTable.userId, usersTable.id))
    .innerJoin(pulsesTable, eq(pulseCommentsTable.pulseId, pulsesTable.id))
    .leftJoin(
      pulseCommentMentionsTable,
      eq(pulseCommentMentionsTable.commentId, pulseCommentsTable.id),
    )
    .leftJoin(mentionUser, eq(mentionUser.id, pulseCommentMentionsTable.userId))
    .where(
      and(
        eq(pulseCommentsTable.pulseId, pulseId),
        orgId ? eq(pulsesTable.organizationId, orgId) : undefined,
        isNull(pulsesTable.deletedAt),
      ),
    )
    .groupBy(
      pulseCommentsTable.id,
      pulseCommentsTable.content,
      pulseCommentsTable.createdAt,
      usersTable.name,
    )
    .orderBy(desc(pulseCommentsTable.createdAt));
}

export async function getAssignees(pulseId: string, orgId?: string) {
  return db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(pulseAssignmentsTable)
    .innerJoin(usersTable, eq(pulseAssignmentsTable.userId, usersTable.id))
    .innerJoin(pulsesTable, eq(pulseAssignmentsTable.pulseId, pulsesTable.id))
    .where(
      and(
        eq(pulseAssignmentsTable.pulseId, pulseId),
        orgId ? eq(pulsesTable.organizationId, orgId) : undefined,
        isNull(pulsesTable.deletedAt),
      ),
    );
}

export async function getPulse(id: string, orgId?: string) {
  return db
    .select({
      id: pulsesTable.id,
      title: pulsesTable.title,
      description: pulsesTable.description,
      status: pulsesTable.status,
      createdAt: pulsesTable.createdAt,
      creatorName: usersTable.name,
      organizationId: pulsesTable.organizationId,
      dueDate: pulsesTable.dueDate,
      priority: pulsesTable.priority,
    })
    .from(pulsesTable)
    .leftJoin(usersTable, eq(pulsesTable.createdById, usersTable.id))
    .where(
      and(
        eq(pulsesTable.id, id),
        orgId ? eq(pulsesTable.organizationId, orgId) : undefined,
        isNull(pulsesTable.deletedAt),
      ),
    )
    .then((r) => r[0]);
}

export async function getPulseHistory(id: string, orgId?: string) {
  return db
    .select({
      id: activityLogsTable.id,
      message: activityLogsTable.message,
      createdAt: activityLogsTable.createdAt,
    })
    .from(activityLogsTable)
    .where(
      and(
        eq(activityLogsTable.pulseId, id),
        orgId ? eq(activityLogsTable.organizationId, orgId) : undefined,
      ),
    )
    .orderBy(desc(activityLogsTable.createdAt));
}

export async function getMemberWorkload(orgId: string) {
  return db
    .select({
      name: usersTable.name,
      count: count(pulseAssignmentsTable.pulseId),
    })
    .from(pulseAssignmentsTable)
    .innerJoin(usersTable, eq(pulseAssignmentsTable.userId, usersTable.id))
    .innerJoin(pulsesTable, eq(pulseAssignmentsTable.pulseId, pulsesTable.id))
    .where(
      and(eq(pulsesTable.organizationId, orgId), isNull(pulsesTable.deletedAt)),
    )
    .groupBy(usersTable.name);
}

export async function getPulsesOverTime(orgId: string) {
  return db
    .select({
      week: sql<string>`date_trunc('week', ${pulsesTable.createdAt})`.as(
        "week",
      ),
      count: count(),
    })
    .from(pulsesTable)
    .where(
      and(
        eq(pulsesTable.organizationId, orgId),
        isNull(pulsesTable.deletedAt),
        sql`${pulsesTable.createdAt} >= now() - interval '6 weeks'`,
      ),
    )
    .groupBy(sql`date_trunc('week', ${pulsesTable.createdAt})`)
    .orderBy(sql`date_trunc('week', ${pulsesTable.createdAt})`);
}
