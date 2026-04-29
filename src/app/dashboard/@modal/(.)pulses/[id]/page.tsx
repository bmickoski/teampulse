import { PulseModal } from "@/components/dashboard/pulse-modal";
import { db } from "@/db";
import { activityLogsTable, pulsesTable, usersTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { getPulseComments } from "@/lib/pulses";
import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function PulseModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const [result, history, initialComments] = await Promise.all([
    db
      .select({
        id: pulsesTable.id,
        title: pulsesTable.title,
        description: pulsesTable.description,
        status: pulsesTable.status,
        createdAt: pulsesTable.createdAt,
        creatorName: usersTable.name,
        organizationId: pulsesTable.organizationId,
      })
      .from(pulsesTable)
      .leftJoin(usersTable, eq(pulsesTable.createdById, usersTable.id))
      .where(eq(pulsesTable.id, id))
      .then((r) => r[0]),
    db
      .select({
        id: activityLogsTable.id,
        message: activityLogsTable.message,
        createdAt: activityLogsTable.createdAt,
      })
      .from(activityLogsTable)
      .where(eq(activityLogsTable.pulseId, id))
      .orderBy(desc(activityLogsTable.createdAt)),
    getPulseComments(id),
  ]);

  if (!result || result.organizationId !== ctx.orgId) notFound();

  return (
    <PulseModal
      result={result}
      history={history}
      initialComments={initialComments}
      authorName={ctx.user.name ?? "You"}
    />
  );
}
