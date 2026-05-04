import { db } from "@/db";
import { pulsesTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { SEARCH_PULSES_LIMIT } from "@/lib/constants";

export async function GET(request: Request) {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({
      pulses: [],
    });
  }
  const pulses = await db
    .select({
      id: pulsesTable.id,
      title: pulsesTable.title,
      status: pulsesTable.status,
      priority: pulsesTable.priority,
    })
    .from(pulsesTable)
    .where(
      and(
        isNull(pulsesTable.deletedAt),
        eq(pulsesTable.organizationId, ctx.orgId),
        or(
          ilike(pulsesTable.title, `%${q}%`),
          ilike(pulsesTable.description, `%${q}%`),
        ),
      ),
    )
    .orderBy(desc(pulsesTable.createdAt))
    .limit(SEARCH_PULSES_LIMIT);

  return NextResponse.json({
    pulses: pulses,
  });
}
