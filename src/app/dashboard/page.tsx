import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { PulsesChart } from "@/components/dashboard/pulses-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserWithOrg, getOrgMemberCount } from "@/lib/organizations";
import { getStatusCounts } from "@/lib/pulses";
import { Zap, Users, CheckCircle } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const statusCounts = await getStatusCounts();
  const ctx = await getCurrentUserWithOrg();
  const user = ctx?.user;

  const memberCount = ctx?.orgId ? await getOrgMemberCount(ctx.orgId) : 0;

  const activePulses = statusCounts.find((s) => s.status === "active")?.count ?? 0;
  const completed = statusCounts.find((s) => s.status === "completed")?.count ?? 0;

  const stats = [
    { label: "Active Pulses", value: String(activePulses), icon: Zap, color: "text-indigo-600" },
    { label: "Team Members", value: String(memberCount), icon: Users, color: "text-blue-600" },
    { label: "Completed", value: String(completed), icon: CheckCircle, color: "text-green-600" },
  ];

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

      <PulsesChart data={statusCounts} />

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
