import { db } from "@/db";
import { pulsesTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { desc, isNull, and, eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

import { PULSES_PAGE_SIZE as PAGE_SIZE } from "@/lib/constants";

export async function GET(request: Request) {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "all";

  const pulses = await db
    .select()
    .from(pulsesTable)
    .where(
      and(
        isNull(pulsesTable.deletedAt),
        eq(pulsesTable.organizationId, ctx.orgId),
        status === "all" ? undefined : eq(pulsesTable.status, status),
      ),
    )
    .orderBy(desc(pulsesTable.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(pulsesTable)
    .where(
      and(
        isNull(pulsesTable.deletedAt),
        eq(pulsesTable.organizationId, ctx.orgId),
        status === "all" ? undefined : eq(pulsesTable.status, status),
      ),
    );

  const hasMore = page * PAGE_SIZE < total;
  return NextResponse.json({ pulses, hasMore, page });
}
