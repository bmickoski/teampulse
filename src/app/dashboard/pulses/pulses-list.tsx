"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import { DeletePulseButton } from "./delete-pulse-button";
import { CreatePulseDialog } from "./create-pulse-dialog";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { EditPulseDialog } from "./edit-pulse-dialog";
import { useQueryState, parseAsStringLiteral, parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const statusColor = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
} as const;

const STATUS_OPTIONS = [
  "all",
  "active",
  "completed",
  "archived",
  "mine",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

import { Member, type Pulse } from "@/lib/types";
import { isOverdue } from "@/lib/utils/time";

type PulsesPage = {
  pulses: Pulse[];
  hasMore: boolean;
  page: number;
};

async function fetchPulses(
  page: number,
  status: StatusFilter,
  q: string,
): Promise<PulsesPage> {
  const response = await fetch(
    `/api/pulses?page=${page}&status=${status}&q=${encodeURIComponent(q)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch pulses");
  return response.json();
}

export default function PulsesList({
  initialData,
  members,
  role,
}: {
  initialData: Pulse[];
  members: Member[] | null;
  role: "owner" | "member";
}) {
  const router = useRouter();
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_OPTIONS).withDefault("all"),
  );
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue || null), 300);
    return () => clearTimeout(timer);
  }, [inputValue, setSearch]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["pulses", status, search],
      queryFn: ({ pageParam }) => fetchPulses(pageParam, status, search),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
      initialData: {
        pages: [{ pulses: initialData, hasMore: false, page: 1 }],
        pageParams: [1],
      },
    });

  const pulses = data.pages.flatMap((p) => p.pulses);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pulses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pulses.length} pulse{pulses.length !== 1 ? "s" : ""} in your
            organization
          </p>
        </div>
        {role === "owner" && <CreatePulseDialog />}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s === "all" ? null : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search pulses..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {pulses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No pulses yet</p>
          <p className="text-gray-400 text-xs mt-1">
            {'Click "+ New Pulse" to create your first one'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pulses.map((pulse) => (
              <Card
                key={pulse.id}
                className="border-gray-200 shadow-none hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/pulses/${pulse.id}`)}
              >
                <CardHeader className="pb-2">
                  <Badge
                    className={
                      statusColor[pulse.status as keyof typeof statusColor]
                    }
                  >
                    {pulse.status}
                  </Badge>
                  <CardTitle className="text-base mt-2">
                    {pulse.title}
                  </CardTitle>
                  {pulse.dueDate && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        Due{" "}
                        {new Date(pulse.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {isOverdue(pulse.dueDate, pulse.status) && (
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                  )}
                  {pulse.assigneeIds.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {pulse.assigneeIds.slice(0, 3).map((aid) => {
                        const name =
                          members?.find((m) => m.userId === aid)?.name ?? "?";
                        const initials = name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2);
                        return (
                          <span
                            key={aid}
                            title={name}
                            className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                          >
                            {initials}
                          </span>
                        );
                      })}
                      {pulse.assigneeIds.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{pulse.assigneeIds.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {role === "owner" && (
                    <CardAction
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EditPulseDialog {...pulse} members={members} />
                      <DeletePulseButton pulseId={pulse.id} />
                    </CardAction>
                  )}
                </CardHeader>
              </Card>
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
        </>
      )}
    </div>
  );
}
