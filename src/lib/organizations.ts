import { db } from "@/db";
import { membershipsTable, organizationsTable, usersTable } from "@/db/schema";
import { count, eq } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export async function getUserOrganization(userId: string) {
  const memberships = await db
    .select()
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, userId));

  const membership =
    memberships.find((m) => m.role !== "owner") ?? memberships[0];
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

  const memberships = await db
    .select()
    .from(membershipsTable)
    .where(eq(membershipsTable.userId, String(user.id)));

  // prefer invited (member) membership over own org (owner)
  const membership =
    memberships.find((m) => m.role !== "owner") ?? memberships[0];

  if (!membership) return null;

  return { user, orgId: membership.organizationId, role: membership.role as "owner" | "member" };
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
