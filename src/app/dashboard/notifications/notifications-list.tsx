"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AtSign, Bell, MessageSquare, UserCheck } from "lucide-react";
import { relativeTime } from "@/lib/utils/time";
import { type NotificationType } from "@/lib/types";

type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  pulseId: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationsPage = {
  notifications: Notification[];
  hasMore: boolean;
  page: number;
};

async function fetchNotifications(page: number): Promise<NotificationsPage> {
  const res = await fetch(`/api/notifications?page=${page}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

function getNotificationIcon(type: Notification["type"]) {
  if (type === "mention") return AtSign;
  if (type === "comment") return MessageSquare;
  if (type === "assignment") return UserCheck;
  return Bell;
}

export default function NotificationsList({
  initialData,
}: {
  initialData: Notification[];
}) {
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["notifications-page"],
      queryFn: ({ pageParam }) => fetchNotifications(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
      initialData: {
        pages: [{ notifications: initialData, hasMore: false, page: 1 }],
        pageParams: [1],
      },
    });

  const notifications = data.pages.flatMap((p) => p.notifications);

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-xl">
        <p className="text-gray-400 text-sm">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
        {notifications.map((n) => {
          const Icon = getNotificationIcon(n.type);

          return (
            <button
              key={n.id}
              type="button"
              onClick={() =>
                n.pulseId && router.push(`/dashboard/pulses/${n.pulseId}`)
              }
              disabled={!n.pulseId}
              className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                n.pulseId ? "cursor-pointer hover:bg-gray-50" : ""
              } ${!n.read ? "bg-indigo-50/40" : "bg-white"}`}
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  !n.read
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-gray-700">{n.message}</span>
                <span className="mt-0.5 block text-xs text-gray-400">
                  {relativeTime(n.createdAt)}
                </span>
              </span>
              {!n.read && (
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-2">
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
