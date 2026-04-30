import { PulseModal } from "@/components/dashboard/pulse-modal";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import {
  getAssignees,
  getPulse,
  getPulseComments,
  getPulseHistory,
} from "@/lib/pulses";
import { Priority } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function PulseModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const result = await getPulse(id, ctx.orgId);

  if (!result) notFound();

  const [history, initialComments, assignees] = await Promise.all([
    getPulseHistory(id, ctx.orgId),
    getPulseComments(id, ctx.orgId),
    getAssignees(id, ctx.orgId),
  ]);

  return (
    <PulseModal
      result={{
        ...result,
        priority: (result.priority ?? "medium") as Priority,
      }}
      history={history}
      initialComments={initialComments}
      authorName={ctx.user.name ?? "You"}
      assignees={assignees}
    />
  );
}
