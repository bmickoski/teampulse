import { db } from "@/db";
import { activityLogsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await db
    .select()
    .from(activityLogsTable)
    .where(eq(activityLogsTable.organizationId, ctx.orgId))
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(20);

  return NextResponse.json(logs);
}
