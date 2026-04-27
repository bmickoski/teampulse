import { PulseModal } from "@/components/dashboard/pulse-modal";
import { db } from "@/db";
import { pulsesTable, usersTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function PulseModalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) notFound();

  const result = await db
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
    .then((r) => r[0]);

  if (!result || result.organizationId !== ctx.orgId) notFound();

  return <PulseModal result={result} />;
}
