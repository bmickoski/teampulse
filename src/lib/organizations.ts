import { db } from "@/db";
import { membershipsTable, organizationsTable, usersTable } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export async function getUserOrganization(userId: string) {
  const membership = await db
    .select()
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, userId))
    .then((r) => r[0]);
  return membership?.organizationId ?? null;
}

export async function getOrganization(orgId: string) {
  return db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .then((r) => r[0] ?? null);
}

export async function getCurrentUserWithOrg() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orgId = await getUserOrganization(String(user.id));
  if (!orgId) return null;

  return { user, orgId };
}

export async function getOrgMemberCount(orgId: string) {
  const totalCount = await db
    .select({ count: count() })
    .from(membershipsTable)
    .where(eq(membershipsTable.organizationId, orgId));

  return totalCount[0]?.count ?? 0;
}

export async function getOrgMembers() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return null;
  }
  const members = await db
    .select({
      userId: membershipsTable.userId,
      role: membershipsTable.role,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(membershipsTable)
    .innerJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
    .where(eq(membershipsTable.organizationId, String(ctx.orgId)));

  return members;
}
