import { db } from "@/db";
import { pulseAssignmentsTable, pulsesTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import {
  desc,
  isNull,
  and,
  eq,
  count,
  inArray,
  or,
  ilike,
  sql,
} from "drizzle-orm";
import { NextResponse } from "next/server";

import { PULSES_PAGE_SIZE as PAGE_SIZE } from "@/lib/constants";

function statusFilter(status: string, myPulseIds: string[]) {
  if (status === "all") return undefined;
  if (status === "mine") {
    return myPulseIds.length > 0
      ? inArray(pulsesTable.id, myPulseIds)
      : sql`false`;
  }
  if (status === "overdue") {
    return sql`${pulsesTable.dueDate} < now() and ${pulsesTable.status} not in ('completed', 'archived')`;
  }
  return eq(pulsesTable.status, status);
}

function priorityFilter(priority: string) {
  if (priority === "all") return undefined;
  return eq(pulsesTable.priority, priority);
}

export async function GET(request: Request) {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "all";
  const priority = searchParams.get("priority") ?? "all";
  const q = searchParams.get("q")?.trim() ?? "";

  let myPulseIds: string[] = [];
  if (status === "mine") {
    const rows = await db
      .select({ pulseId: pulseAssignmentsTable.pulseId })
      .from(pulseAssignmentsTable)
      .where(eq(pulseAssignmentsTable.userId, String(ctx.user.id)));
    myPulseIds = rows.map((r) => r.pulseId);
  }

  const pulses = await db
    .select()
    .from(pulsesTable)
    .where(
      and(
        isNull(pulsesTable.deletedAt),
        eq(pulsesTable.organizationId, ctx.orgId),
        statusFilter(status, myPulseIds),
        priorityFilter(priority),
        q
          ? or(
              ilike(pulsesTable.title, `%${q}%`),
              ilike(pulsesTable.description, `%${q}%`),
            )
          : undefined,
      ),
    )
    .orderBy(desc(pulsesTable.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const pulseIds = pulses.map((p) => p.id);

  const assignments =
    pulseIds.length > 0
      ? await db
          .select()
          .from(pulseAssignmentsTable)
          .where(inArray(pulseAssignmentsTable.pulseId, pulseIds))
      : [];

  const pulsesWithAssignees = pulses.map((p) => ({
    ...p,
    assigneeIds: assignments
      .filter((a) => a.pulseId === p.id)
      .map((a) => a.userId),
  }));

  const [{ total }] = await db
    .select({ total: count() })
    .from(pulsesTable)
    .where(
      and(
        isNull(pulsesTable.deletedAt),
        eq(pulsesTable.organizationId, ctx.orgId),
        statusFilter(status, myPulseIds),
        priorityFilter(priority),
        q
          ? or(
              ilike(pulsesTable.title, `%${q}%`),
              ilike(pulsesTable.description, `%${q}%`),
            )
          : undefined,
      ),
    );

  const hasMore = page * PAGE_SIZE < total;
  return NextResponse.json({ pulses: pulsesWithAssignees, hasMore, page });
}
