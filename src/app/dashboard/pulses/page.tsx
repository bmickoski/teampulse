import { db } from "@/db";
import { pulsesTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { desc, eq, isNull, and } from "drizzle-orm";
import { PULSES_PAGE_SIZE } from "@/lib/constants";
import { redirect } from "next/navigation";
import PulsesList from "./pulses-list";
import { getUserOrganization } from "@/lib/organizations";

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

  return <PulsesList initialData={pulses} />;
}
