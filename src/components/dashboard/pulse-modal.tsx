"use client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, User } from "lucide-react";

const statusColor = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
} as const;

type HistoryEntry = { id: string; message: string; createdAt: Date };

type Props = {
  result: {
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    creatorName: string | null;
  };
  history: HistoryEntry[];
};

export function PulseModal({ result, history }: Props) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <Badge
            className={statusColor[result.status as keyof typeof statusColor]}
          >
            {result.status}
          </Badge>
          <DialogTitle className="text-xl">{result.title}</DialogTitle>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User size={12} /> {result.creatorName ?? "Unknown"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(result.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </DialogHeader>

        {result.description && (
          <>
            <Separator />
            <p className="text-sm text-gray-600 leading-relaxed">
              {result.description}
            </p>
          </>
        )}

        {history.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">History</p>
              <ul className="space-y-2">
                {history.map((entry) => (
                  <li key={entry.id} className="text-sm">
                    <p className="text-gray-700">{entry.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
