"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type ActivityLog = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
};

export function ActivityFeed() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/activity/stream");
    eventSource.onmessage = (event) => {
      const newLogs: ActivityLog[] = JSON.parse(event.data);
      setLogs(newLogs);
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, []);

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
