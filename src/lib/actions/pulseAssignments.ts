"use server";

import { db } from "@/db";
import { pulseAssignmentsTable, pulsesTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  assignmentActionSchema,
  AssignmentActionState,
} from "../validations/pulseAssignments";

export async function updatePulseAssignees(
  _prev: AssignmentActionState,
  formData: FormData,
): Promise<AssignmentActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return { error: "Unauthorized" };

  const result = assignmentActionSchema.safeParse({
    pulseId: formData.get("pulseId"),
    userIds: formData.getAll("userId"),
  });
  if (!result.success) return { error: "Invalid data" };

  const { pulseId, userIds } = result.data;

  const [pulse] = await db
    .select({ organizationId: pulsesTable.organizationId })
    .from(pulsesTable)
    .where(eq(pulsesTable.id, pulseId));

  if (!pulse || pulse.organizationId !== ctx.orgId)
    return { error: "Pulse not found" };

  await db
    .delete(pulseAssignmentsTable)
    .where(eq(pulseAssignmentsTable.pulseId, pulseId));

  if (userIds.length > 0) {
    await db
      .insert(pulseAssignmentsTable)
      .values(userIds.map((userId) => ({ pulseId, userId })));
  }

  revalidatePath(`/dashboard/pulses/${pulseId}`);
  return { success: true };
}
