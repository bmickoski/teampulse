import { db } from "@/db";
import {
  activityLogsTable,
  pulseAssignmentsTable,
  pulseCommentsTable,
  pulsesTable,
  usersTable,
} from "@/db/schema";
import { count } from "drizzle-orm/sql/functions/aggregate";
import { getCurrentUser } from "./auth";
import { getUserOrganization } from "./organizations";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

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

export async function getPulseComments(pulseId: string) {
  return (
    db
      .select({
        id: pulseCommentsTable.id,
        content: pulseCommentsTable.content,
        createdAt: pulseCommentsTable.createdAt,
        authorName: usersTable.name,
      })
      .from(pulseCommentsTable)
      // left join because user id is nullable, even if user is
      // deleted left join keeps the comment row
      // and get null for author
      .leftJoin(usersTable, eq(pulseCommentsTable.userId, usersTable.id))
      .where(eq(pulseCommentsTable.pulseId, pulseId))
      .orderBy(desc(pulseCommentsTable.createdAt))
  );
}

export async function getAssignees(pulseId: string) {
  return db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(pulseAssignmentsTable)
    .innerJoin(usersTable, eq(pulseAssignmentsTable.userId, usersTable.id))
    .where(eq(pulseAssignmentsTable.pulseId, pulseId));
}

export async function getPulse(id: string) {
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
    .where(eq(pulsesTable.id, id))
    .then((r) => r[0]);
}

export async function getPulseHistory(id: string) {
  return db
    .select({
      id: activityLogsTable.id,
      message: activityLogsTable.message,
      createdAt: activityLogsTable.createdAt,
    })
    .from(activityLogsTable)
    .where(eq(activityLogsTable.pulseId, id))
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
