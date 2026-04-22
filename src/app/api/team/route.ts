import { db } from "@/db";
import { membershipsTable, usersTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgMembers = await db
    .select({
      userId: membershipsTable.userId,
      role: membershipsTable.role,
      name: usersTable.name,
      email: usersTable.email,
    })
    .from(membershipsTable)
    .innerJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
    .where(eq(membershipsTable.organizationId, String(ctx.orgId)));

  return NextResponse.json(orgMembers);
}
