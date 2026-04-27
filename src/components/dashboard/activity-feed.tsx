"use client";

import { useEffect, useState } from "react";
import {
  Zap,
  Trash2,
  Pencil,
  UserPlus,
  UserMinus,
  Lock,
  ClipboardList,
} from "lucide-react";
import { type ActivityLog } from "@/lib/types";
import { relativeTime } from "@/lib/utils/time";

const iconMap: Record<string, React.ElementType> = {
  pulse_created: Zap,
  pulse_deleted: Trash2,
  pulse_updated: Pencil,
  member_invited: UserPlus,
  member_removed: UserMinus,
  user_password_updated: Lock,
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
      {logs.map((log) => {
        const Icon = iconMap[log.action] ?? ClipboardList;
        return (
          <li key={log.id} className="flex items-start gap-3 text-sm">
            <Icon size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-700">{log.message}</p>
              <p className="text-xs text-gray-400">
                {relativeTime(log.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
