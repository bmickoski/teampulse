import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { NOTIFICATIONS_BELL_LIMIT, NOTIFICATIONS_PAGE_SIZE } from "@/lib/constants";
import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "0");
  const isBell = page === 0;

  const limit = isBell ? NOTIFICATIONS_BELL_LIMIT : NOTIFICATIONS_PAGE_SIZE;
  const offset = isBell ? 0 : (page - 1) * NOTIFICATIONS_PAGE_SIZE;

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, String(ctx.user.id)))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  if (isBell) return NextResponse.json(notifications);

  const [{ total }] = await db
    .select({ total: count() })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, String(ctx.user.id)));

  const hasMore = page * NOTIFICATIONS_PAGE_SIZE < total;
  return NextResponse.json({ notifications, hasMore, page });
}

export async function PATCH() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, String(ctx.user.id)));

  return NextResponse.json({ success: true });
}
