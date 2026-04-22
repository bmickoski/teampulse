import { db } from "@/db";
import { pulsesTable } from "@/db/schema";
import { count } from "drizzle-orm/sql/functions/aggregate";
import { getCurrentUser } from "./auth";
import { getUserOrganization } from "./organizations";
import { and, eq, isNull } from "drizzle-orm";

export async function getStatusCounts() {
  const user = await getCurrentUser();
  if (!user) return [];

  const orgId = await getUserOrganization(String(user.id));
  if (!orgId) return [];

  const statusCounts = await db
    .select({ status: pulsesTable.status, count: count() })
    .from(pulsesTable)
    .where(and(eq(pulsesTable.organizationId, orgId), isNull(pulsesTable.deletedAt)))
    .groupBy(pulsesTable.status);

  return statusCounts;
}
