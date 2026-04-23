"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeletePulseButton } from "./delete-pulse-button";
import { CreatePulseDialog } from "./create-pulse-dialog";
import { useQuery } from "@tanstack/react-query";
import { EditPulseDialog } from "./edit-pulse-dialog";
import { useQueryState, parseAsStringLiteral } from "nuqs";

const statusColor = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
} as const;

const STATUS_OPTIONS = ["all", "active", "completed", "archived"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

type Pulse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
};

async function fetchPulses(): Promise<Pulse[]> {
  const response = await fetch("/api/pulses");
  if (!response.ok) throw new Error("Failed to fetch pulses");
  return response.json();
}

export default function PulsesList({ initialData }: { initialData: Pulse[] }) {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_OPTIONS).withDefault("all"),
  );

  const { data: pulses } = useQuery<Pulse[]>({
    queryKey: ["pulses"],
    queryFn: fetchPulses,
    initialData,
  });

  const filtered = status === "all" ? pulses : pulses.filter((p) => p.status === status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pulses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} pulse{filtered.length !== 1 ? "s" : ""} in your organization
          </p>
        </div>
        <CreatePulseDialog />
      </div>

      <div className="flex gap-2">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s === "all" ? null : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No pulses yet</p>
          <p className="text-gray-400 text-xs mt-1">
            {'Click "+ New Pulse" to create your first one'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((pulse) => (
            <Card
              key={pulse.id}
              className="border-gray-200 shadow-none hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <Badge className={statusColor[pulse.status as keyof typeof statusColor]}>
                  {pulse.status}
                </Badge>
                <CardTitle className="text-base mt-2">{pulse.title}</CardTitle>
                <CardAction className="flex items-center gap-2">
                  <EditPulseDialog {...pulse} />
                  <DeletePulseButton pulseId={pulse.id} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{pulse.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
