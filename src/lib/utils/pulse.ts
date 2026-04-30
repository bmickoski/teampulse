import { Priority } from "@/lib/types";

export const statusColor: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
};

export const priorityColor: Record<Priority, string> = {
  low: "bg-yellow-100 text-yellow-700",
  medium: "bg-green-100 text-green-700",
  high: "bg-red-100 text-red-600",
};

export const statusChartColor: Record<string, string> = {
  active: "#22c55e",
  completed: "#3b82f6",
  archived: "#9ca3af",
};
