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
import { PulseComments } from "@/components/dashboard/pulse-comments";
import type { getPulseComments } from "@/lib/pulses";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const statusColor = {
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  archived: "bg-gray-100 text-gray-600",
} as const;

type HistoryEntry = { id: string; message: string; createdAt: Date };
type Comment = Awaited<ReturnType<typeof getPulseComments>>[number];

type Props = {
  result: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    creatorName: string | null;
  };
  history: HistoryEntry[];
  initialComments: Comment[];
  authorName: string;
};

export function PulseModal({
  result,
  history,
  initialComments,
  authorName,
}: Props) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
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

        <Separator />
        <Accordion>
          <AccordionItem value="history">
            <AccordionTrigger>History ({history.length})</AccordionTrigger>
            <AccordionContent>
              {history.length === 0 ? (
                <p className="text-sm text-gray-400">No history yet.</p>
              ) : (
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
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="comments">
            <AccordionTrigger>
              Comments ({initialComments.length})
            </AccordionTrigger>
            <AccordionContent>
              <PulseComments
                pulseId={result.id}
                initialComments={initialComments}
                authorName={authorName}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
