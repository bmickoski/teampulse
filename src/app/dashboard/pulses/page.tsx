import { db } from "@/db";
import { pulseAssignmentsTable, pulsesTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq, isNull, and, inArray } from "drizzle-orm";
import { PULSES_PAGE_SIZE } from "@/lib/constants";
import { redirect } from "next/navigation";
import PulsesList from "./pulses-list";
import { getOrgMembers, getUserOrganization } from "@/lib/organizations";

export const metadata = { title: "Pulses" };

export default async function PulsesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const orgId = await getUserOrganization(String(user.id));
  if (!orgId) redirect("/create-organization");

  const pulses = await db
    .select()
    .from(pulsesTable)
    .where(
      and(isNull(pulsesTable.deletedAt), eq(pulsesTable.organizationId, orgId)),
    )
    .orderBy(desc(pulsesTable.createdAt))
    .limit(PULSES_PAGE_SIZE);

  const pulseIds = pulses.map((p) => p.id);
  const assignments =
    pulseIds.length > 0
      ? await db
          .select()
          .from(pulseAssignmentsTable)
          .where(inArray(pulseAssignmentsTable.pulseId, pulseIds))
      : [];

  const members = await getOrgMembers();

  const initialData = pulses.map((p) => ({
    ...p,
    assigneeIds: assignments
      .filter((a) => a.pulseId === p.id)
      .map((a) => a.userId),
  }));

  return <PulsesList initialData={initialData} members={members} />;
}
