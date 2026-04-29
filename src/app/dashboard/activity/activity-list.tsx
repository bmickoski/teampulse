"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { type ActivityLog } from "@/lib/types";
import { relativeTime } from "@/lib/utils/time";
import {
  Zap,
  Trash2,
  Pencil,
  UserPlus,
  UserMinus,
  Lock,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  pulse_created: Zap,
  pulse_deleted: Trash2,
  pulse_updated: Pencil,
  member_invited: UserPlus,
  member_removed: UserMinus,
  user_password_updated: Lock,
  comment_added: MessageSquare,
};

type ActivityPage = { logs: ActivityLog[]; hasMore: boolean; page: number };

async function fetchActivity(page: number): Promise<ActivityPage> {
  const res = await fetch(`/api/activity?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}

export function ActivityList({ initialData }: { initialData: ActivityLog[] }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["activity"],
      queryFn: ({ pageParam }) => fetchActivity(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
      initialData: {
        pages: [{ logs: initialData, hasMore: true, page: 1 }],
        pageParams: [1],
      },
    });

  const logs = data.pages.flatMap((p) => p.logs);

  if (logs.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-12">No activity yet.</p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-gray-100">
        {logs.map((log) => {
          const Icon = iconMap[log.action] ?? ClipboardList;
          return (
            <li key={log.id} className="flex items-start gap-3 py-4 text-sm">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Icon size={13} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700">{log.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {relativeTime(log.createdAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
