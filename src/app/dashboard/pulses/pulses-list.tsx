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
const statusColor = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
} as const;
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
  // Queries
  const { data: pulses } = useQuery<Pulse[]>({
    queryKey: ["pulses"],
    queryFn: fetchPulses,
    initialData,
  });
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pulses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pulses.length} pulse{pulses.length !== 1 ? "s" : ""} in your
            organization
          </p>
        </div>
        <CreatePulseDialog />
      </div>

      {pulses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No pulses yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Click &quot;+ New Pulse&quot; to create your first one
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pulses.map((pulse) => (
            <Card
              key={pulse.id}
              className="border-gray-200 shadow-none hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <Badge
                  className={
                    statusColor[pulse.status as keyof typeof statusColor]
                  }
                >
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
