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
  pulseCommentsTable,
  pulsesTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  revalidatePath(`/dashboard/pulses/${pulseId}`);
  return { success: true };
}
