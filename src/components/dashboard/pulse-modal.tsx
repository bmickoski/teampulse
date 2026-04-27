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

type Props = {
  result: {
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    creatorName: string | null;
  };
};

export function PulseModal({ result }: Props) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="sm:max-w-lg">
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
      </DialogContent>
    </Dialog>
  );
}
