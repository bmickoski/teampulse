import { db } from "@/db";
import { pulseCommentsTable, pulsesTable, usersTable } from "@/db/schema";
import { count } from "drizzle-orm/sql/functions/aggregate";
import { getCurrentUser } from "./auth";
import { getUserOrganization } from "./organizations";
import { and, desc, eq, isNull } from "drizzle-orm";

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
