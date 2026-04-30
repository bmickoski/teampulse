"use server";
import { db } from "@/db";
import { inviteTokensTable, membershipsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function createInviteTokenAction() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx || ctx.role !== "owner") throw new Error("Unauthorized");

  const token = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(inviteTokensTable).values({
    token,
    orgId: ctx.orgId,
    expiresAt,
  });

  return token;
}

export async function consumeInviteTokenAction(token: string, userId: string) {
  // User is authenticated but may have no org yet,
  //  get user directly after login so user exists
  const row = await db
    .select()
    .from(inviteTokensTable)
    .where(eq(inviteTokensTable.token, token))
    .then((r) => r[0] ?? null);

  if (!row) throw new Error("Invalid invite link");
  if (row.usedAt) throw new Error("Invite link already used");
  if (row.expiresAt < new Date()) throw new Error("Invite link expired");

  const existing = await db
    .select()
    .from(membershipsTable)
    .where(
      and(
        eq(membershipsTable.userId, String(userId)),
        eq(membershipsTable.organizationId, row.orgId),
      ),
    )
    .then((r) => r[0] ?? null);

  // Already a member — don't consume the token, just return the orgId
  if (existing) return row.orgId;

  await db.insert(membershipsTable).values({
    userId: String(userId),
    organizationId: row.orgId,
    role: "member",
  });

  await db
    .update(inviteTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(inviteTokensTable.token, token));

  return row.orgId;
}
