"use server";

import z from "zod";
import { getCurrentUserWithOrg } from "../organizations";
import {
  PulseCommentActionState,
  pulseCommentSchema,
} from "../validations/pulseComments";
import { db } from "@/db";
import {
  activityLogsTable,
  pulseAssignmentsTable,
  pulseCommentsTable,
  pulsesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotifications } from "../notifications";

export async function createPulseComment(
  _prev: PulseCommentActionState,
  formData: FormData,
): Promise<PulseCommentActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return {
      error: "Unauthorized",
    };
  }

  const result = pulseCommentSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { errors: z.flattenError(result.error).fieldErrors };
  }

  const { content, pulseId } = result.data;

  const [pulse] = await db
    .select({
      organizationId: pulsesTable.organizationId,
      title: pulsesTable.title,
      createdById: pulsesTable.createdById,
    })
    .from(pulsesTable)
    .where(eq(pulsesTable.id, pulseId));

  if (!pulse || pulse.organizationId !== ctx.orgId) {
    return { error: "Pulse not found" };
  }

  await db.insert(pulseCommentsTable).values({
    pulseId,
    userId: ctx.user.id,
    content,
  });

  await db.insert(activityLogsTable).values({
    action: "comment_added",
    message: `${ctx.user.name} commented on "${pulse.title}"`,
    userId: ctx.user.id,
    organizationId: ctx.orgId,
    pulseId,
  });

  const assignees = await db
    .select({ userId: pulseAssignmentsTable.userId })
    .from(pulseAssignmentsTable)
    .where(eq(pulseAssignmentsTable.pulseId, pulseId));

  const toNotify = [
    ...assignees.map((a) => a.userId),
    pulse.createdById,
  ].filter((id): id is string => !!id && id !== ctx.user.id);

  await createNotifications(
    [...new Set(toNotify)],
    `${ctx.user.name} commented on "${pulse.title}"`,
    pulseId,
  );

  revalidatePath(`/dashboard/pulses/${pulseId}`);
  return { success: true };
}
