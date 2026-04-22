"use client";

import { useQuery } from "@tanstack/react-query";

type ActivityLog = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
};

async function fetchActivity(): Promise<ActivityLog[]> {
  const res = await fetch("/api/activity");
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}

export function ActivityFeed() {
  const { data: logs = [] } = useQuery({
    queryKey: ["activity"],
    queryFn: fetchActivity,
    refetchInterval: 5000, // this is the entire polling config
  });

  if (logs.length === 0)
    return (
      <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
    );

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li key={log.id} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 text-lg">
            {log.action === "pulse_created" ? "⚡" : "🗑️"}
          </span>
          <div>
            <p className="text-gray-700">{log.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(log.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
