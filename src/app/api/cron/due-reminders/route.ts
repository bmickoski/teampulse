import { db } from "@/db";
import { pulseAssignmentsTable, pulsesTable } from "@/db/schema";
import { createNotifications } from "@/lib/notifications";
import { and, eq, gte, isNull, lte, notInArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setUTCDate(now.getUTCDate() + 1);
  tomorrowStart.setUTCHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);

  const pulses = await db
    .select({
      id: pulsesTable.id,
      title: pulsesTable.title,
      createdById: pulsesTable.createdById,
    })
    .from(pulsesTable)
    .where(
      and(
        isNull(pulsesTable.deletedAt),
        gte(pulsesTable.dueDate, tomorrowStart),
        lte(pulsesTable.dueDate, tomorrowEnd),
        notInArray(pulsesTable.status, ["completed", "archived"]),
      ),
    );

  for (const pulse of pulses) {
    const assignees = await db
      .select({ userId: pulseAssignmentsTable.userId })
      .from(pulseAssignmentsTable)
      .where(eq(pulseAssignmentsTable.pulseId, pulse.id));

    const recipientIds = [
      ...assignees.map((a) => a.userId),
      pulse.createdById,
    ].filter((id): id is string => !!id);

    await createNotifications(
      [...new Set(recipientIds)],
      `"${pulse.title}" is due tomorrow`,
      pulse.id,
      "general",
    );
  }

  return NextResponse.json({
    pulses: pulses,
  });
}
