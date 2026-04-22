import { db } from "@/db";
import { pulsesTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { desc, isNull, and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pulses = await db
    .select()
    .from(pulsesTable)
    .where(and(isNull(pulsesTable.deletedAt), eq(pulsesTable.organizationId, ctx.orgId)))
    .orderBy(desc(pulsesTable.createdAt));

  return NextResponse.json(pulses);
}
