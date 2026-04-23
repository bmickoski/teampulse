import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PulsesChart } from "@/components/dashboard/pulses-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithOrg, getOrgMemberCount } from "@/lib/organizations";
import { getStatusCounts } from "@/lib/pulses";

export default async function DashboardPage() {
  const statusCounts = await getStatusCounts();
  const ctx = await getCurrentUserWithOrg();
  const user = ctx?.user;

  const memberCount = ctx?.orgId ? await getOrgMemberCount(ctx.orgId) : 0;

  const activePulses =
    statusCounts.find((s) => s.status === "active")?.count ?? 0;
  const completed =
    statusCounts.find((s) => s.status === "completed")?.count ?? 0;
  const stats = [
    { label: "Active Pulses", value: String(activePulses) },
    { label: "Team Members", value: String(memberCount) },
    { label: "Tasks Completed", value: String(completed) },
    { label: "Hours Logged", value: "0" },
  ];
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      <PulsesChart data={statusCounts} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-none border-gray-200">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
}
