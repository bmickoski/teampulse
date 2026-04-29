import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/constants";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import NotificationsList from "./notifications-list";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) redirect("/sign-in");

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, String(ctx.user.id)))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(NOTIFICATIONS_PAGE_SIZE);

  const serialized = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </p>
      </div>
      <NotificationsList initialData={serialized} />
    </div>
  );
}
