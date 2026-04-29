import { PulseModal } from "@/components/dashboard/pulse-modal";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { getAssignees, getPulse, getPulseComments, getPulseHistory } from "@/lib/pulses";
import { notFound } from "next/navigation";

export default async function PulseModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const [result, history, initialComments, assignees] = await Promise.all([
    getPulse(id),
    getPulseHistory(id),
    getPulseComments(id),
    getAssignees(id),
  ]);

  if (!result || result.organizationId !== ctx.orgId) notFound();

  return (
    <PulseModal
      result={result}
      history={history}
      initialComments={initialComments}
      authorName={ctx.user.name ?? "You"}
      assignees={assignees}
    />
  );
}
