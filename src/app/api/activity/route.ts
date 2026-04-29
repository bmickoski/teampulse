import { db } from "@/db";
import { activityLogsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { desc, eq, count } from "drizzle-orm";
import { ACTIVITY_LOG_LIMIT, ACTIVITY_PAGE_SIZE } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");

  if (!page) {
    const logs = await db
      .select()
      .from(activityLogsTable)
      .where(eq(activityLogsTable.organizationId, ctx.orgId))
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(ACTIVITY_LOG_LIMIT);

    return NextResponse.json(logs);
  }

  const logs = await db
    .select()
    .from(activityLogsTable)
    .where(eq(activityLogsTable.organizationId, ctx.orgId))
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(ACTIVITY_PAGE_SIZE)
    .offset((page - 1) * ACTIVITY_PAGE_SIZE);

  const [{ total }] = await db
    .select({ total: count() })
    .from(activityLogsTable)
    .where(eq(activityLogsTable.organizationId, ctx.orgId));

  return NextResponse.json({ logs, hasMore: page * ACTIVITY_PAGE_SIZE < total, page });
}
