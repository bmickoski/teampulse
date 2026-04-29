import { Suspense } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PulsesChart } from "@/components/dashboard/pulses-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithOrg, getOrgMemberCount } from "@/lib/organizations";
import {
  getMemberWorkload,
  getPulsesOverTime,
  getStatusCounts,
} from "@/lib/pulses";
import { getGreeting } from "@/lib/utils/greeting";
import { Zap, Users, CheckCircle } from "lucide-react";
import Link from "next/link";
import { WorkloadChart } from "@/components/dashboard/workload-chart";
import { TimelineChart } from "@/components/dashboard/timeline-chart";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardLayoutPicker } from "@/components/dashboard/dashboard-layout-picker";

export const metadata = { title: "Dashboard" };

async function DashboardStats() {
  const [statusCounts, ctx] = await Promise.all([
    getStatusCounts(),
    getCurrentUserWithOrg(),
  ]);

  const memberCount = ctx?.orgId ? await getOrgMemberCount(ctx.orgId) : 0;
  const activePulses =
    statusCounts.find((s) => s.status === "active")?.count ?? 0;
  const completed =
    statusCounts.find((s) => s.status === "completed")?.count ?? 0;

  const stats = [
    {
      label: "Active Pulses",
      value: String(activePulses),
      icon: Zap,
      color: "text-indigo-600",
    },
    {
      label: "Team Members",
      value: String(memberCount),
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Completed",
      value: String(completed),
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-none border-gray-200">
          <CardHeader className="pb-1 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {stat.label}
            </CardTitle>
            <stat.icon size={16} className={stat.color} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function DashboardChart() {
  const statusCounts = await getStatusCounts();
  return <PulsesChart data={statusCounts} />;
}

async function DashboardWorkload() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return null;
  const data = await getMemberWorkload(ctx.orgId);
  return <WorkloadChart data={data} />;
}

async function DashboardTimeline() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return null;
  const data = await getPulsesOverTime(ctx.orgId);
  return <TimelineChart data={data} />;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-xl p-4 space-y-3"
        >
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-48 w-full bg-gray-100 rounded-xl animate-pulse" />;
}

export default async function DashboardPage() {
  const ctx = await getCurrentUserWithOrg();
  const user = ctx?.user;
  const userRow = ctx
    ? await db
        .select({ dashboardLayout: usersTable.dashboardLayout })
        .from(usersTable)
        .where(eq(usersTable.id, String(ctx.user.id)))
        .then((r) => r[0])
    : null;

  const layout = userRow?.dashboardLayout ?? ["status", "workload", "timeline"];
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {"Here's what's happening with your team today."}
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <DashboardLayoutPicker initialLayout={layout} />

      {layout.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="text-sm text-gray-400">No charts selected</p>
          <p className="text-xs text-gray-400 mt-1">
            Click <span className="font-medium text-gray-500">Customize</span> to configure your dashboard
          </p>
        </div>
      ) : (
        <>
          {layout.includes("status") && (
            <Suspense fallback={<ChartSkeleton />}>
              <DashboardChart />
            </Suspense>
          )}
          {layout.includes("workload") && (
            <Suspense fallback={<ChartSkeleton />}>
              <DashboardWorkload />
            </Suspense>
          )}
          {layout.includes("timeline") && (
            <Suspense fallback={<ChartSkeleton />}>
              <DashboardTimeline />
            </Suspense>
          )}
        </>
      )}

      <Card className="shadow-none border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-700">
            Recent activity
          </CardTitle>
          <Link
            href="/dashboard/activity"
            className="text-xs text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
}
