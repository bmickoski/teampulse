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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { statusColor, priorityColor } from "@/lib/utils/pulse";

const STATUS_OPTIONS = [
  "all",
  "active",
  "completed",
  "archived",
  "mine",
  "overdue",
] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const PRIORITY_OPTIONS = ["all", "low", "medium", "high"] as const;
type PriorityFilter = (typeof PRIORITY_OPTIONS)[number];

import { Member, type Pulse } from "@/lib/types";
import { isOverdue } from "@/lib/utils/time";
import { ArrowUp } from "lucide-react";

type PulsesPage = {
  pulses: Pulse[];
  hasMore: boolean;
  page: number;
  total: number;
};

async function fetchPulses(
  page: number,
  status: StatusFilter,
  priority: PriorityFilter,
  q: string,
): Promise<PulsesPage> {
  const response = await fetch(
    `/api/pulses?page=${page}&status=${status}&priority=${priority}&q=${encodeURIComponent(q)}`,
  );
  if (!response.ok) throw new Error("Failed to fetch pulses");
  return response.json();
}

function formatFilterLabel(value: string) {
  if (value === "mine") return "Assigned to me";
  return value[0].toUpperCase() + value.slice(1);
}

export default function PulsesList({
  initialData,
  members,
  role,
  total,
}: {
  initialData: Pulse[];
  members: Member[] | null;
  role: "owner" | "member";
  total: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_OPTIONS).withDefault("all"),
  );
  const [priority, setPriority] = useQueryState(
    "priority",
    parseAsStringLiteral(PRIORITY_OPTIONS).withDefault("all"),
  );
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(inputValue || null), 300);
    return () => clearTimeout(timer);
  }, [inputValue, setSearch]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["pulses", status, priority, search],
      queryFn: ({ pageParam }) =>
        fetchPulses(pageParam, status, priority, search),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
      initialData: {
        pages: [
          {
            pulses: initialData,
            hasMore: initialData.length < total,
            page: 1,
            total: total,
          },
        ],
        pageParams: [1],
      },
    });

  const pulses = data.pages.flatMap((p) => p.pulses);
  const totalPulses = data.pages[0]?.total ?? pulses.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pulses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalPulses} pulse{totalPulses !== 1 ? "s" : ""} in your
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {formatFilterLabel(s)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="Search pulses..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Select
          value={priority}
          onValueChange={(value) =>
            setPriority(value === "all" ? null : (value as PriorityFilter))
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority">
              {priority === "all"
                ? "Any priority"
                : formatFilterLabel(priority)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p === "all" ? "Any priority" : formatFilterLabel(p)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {pulses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-sm font-medium">
            {search || status !== "all" || priority !== "all"
              ? "No pulses match these filters"
              : "No pulses yet"}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {search || status !== "all" || priority !== "all"
              ? "Try a different search, status, or priority."
              : 'Click "+ New Pulse" to create your first one'}
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
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      className={
                        statusColor[pulse.status as keyof typeof statusColor]
                      }
                    >
                      {formatFilterLabel(pulse.status)}
                    </Badge>
                    <Badge
                      className={
                        priorityColor[
                          pulse.priority as keyof typeof priorityColor
                        ]
                      }
                    >
                      <ArrowUp size={10} className="mr-0.5" />
                      {formatFilterLabel(pulse.priority)}
                    </Badge>
                  </div>

                  <CardTitle className="text-base leading-snug mt-2 line-clamp-2">
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
                      <DeletePulseButton
                        pulseId={pulse.id}
                        pulseTitle={pulse.title}
                      />
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
