"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Notification = {
  id: string;
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
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => n.pulseId && router.push(`/dashboard/pulses/${n.pulseId}`)}
            className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors ${
              n.pulseId ? "cursor-pointer hover:bg-gray-50" : ""
            } ${!n.read ? "bg-indigo-50/40" : "bg-white"}`}
          >
            {!n.read && (
              <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            )}
            <div className={!n.read ? "" : "ml-5"}>
              <p className="text-gray-700">{n.message}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(n.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
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
