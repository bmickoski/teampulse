import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { notFound } from "next/navigation";
import { CalendarDays, User } from "lucide-react";
import Link from "next/link";
import {
  getAssignees,
  getPulse,
  getPulseComments,
  getPulseHistory,
} from "@/lib/pulses";
import { PulseComments } from "@/components/dashboard/pulse-comments";
import { isOverdue } from "@/lib/utils/time";
import { statusColor, priorityColor } from "@/lib/utils/pulse";

export default async function PulseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const result = await getPulse(id, ctx.orgId);

  if (!result) notFound();

  const [history, comments, assignees] = await Promise.all([
    getPulseHistory(id, ctx.orgId),
    getPulseComments(id, ctx.orgId),
    getAssignees(id, ctx.orgId),
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/pulses"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Pulses
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600">{result.title}</span>
      </div>

      <Card className="shadow-none border-gray-200">
        <CardHeader className="space-y-3">
          <Badge
            className={statusColor[result.status as keyof typeof statusColor]}
          >
            {result.status}
          </Badge>
          <Badge
            className={
              priorityColor[result.priority as keyof typeof priorityColor]
            }
          >
            {result.priority}
          </Badge>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {result.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <User size={12} />
              {result.creatorName ?? "Unknown"}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(result.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {result.dueDate && (
              <span className="flex items-center gap-1">
                <CalendarDays size={12} />
                Due{" "}
                {new Date(result.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {isOverdue(result.dueDate, result.status) && (
                  <span className="font-medium text-red-600 ml-1">
                    · Overdue
                  </span>
                )}
              </span>
            )}
            {assignees.length > 0 && (
              <span className="flex items-center gap-1">
                {assignees.slice(0, 3).map((a) => {
                  const initials =
                    a.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) ?? "?";
                  return (
                    <span
                      key={a.id}
                      title={a.name ?? ""}
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium"
                    >
                      {initials}
                    </span>
                  );
                })}
                {assignees.length > 3 && <span>+{assignees.length - 3}</span>}
              </span>
            )}
          </div>
        </CardHeader>

        {result.description && (
          <>
            <Separator />
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.description}
              </p>
            </CardContent>
          </>
        )}
      </Card>
      {history.length > 0 && (
        <Card className="shadow-none border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">
              History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {history.map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700">{entry.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card className="shadow-none border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PulseComments
            pulseId={id}
            initialComments={comments}
            authorName={ctx.user.name ?? "You"}
          />
        </CardContent>
      </Card>
    </div>
  );
}
