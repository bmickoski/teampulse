import { db } from "@/db";
import { activityLogsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ACTIVITY_PAGE_SIZE } from "@/lib/constants";
import { ActivityList } from "./activity-list";

export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const initialData = await db
    .select()
    .from(activityLogsTable)
    .where(eq(activityLogsTable.organizationId, ctx.orgId))
    .orderBy(desc(activityLogsTable.createdAt))
    .limit(ACTIVITY_PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Full history of activity in your organization.
        </p>
      </div>

      <ActivityList initialData={initialData} />
    </div>
  );
}
