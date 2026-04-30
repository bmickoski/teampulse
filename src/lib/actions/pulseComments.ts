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
  membershipsTable,
  pulseAssignmentsTable,
  pulseCommentMentionsTable,
  pulseCommentsTable,
  pulsesTable,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
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

  const { content, pulseId, mentionedUserIds } = result.data;

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

  const requestedMentionIds = [...new Set(mentionedUserIds)].filter(
    (userId) => userId !== ctx.user.id,
  );

  const validMentionedUsers =
    requestedMentionIds.length > 0
      ? await db
          .select({ userId: membershipsTable.userId })
          .from(membershipsTable)
          .where(
            and(
              eq(membershipsTable.organizationId, ctx.orgId),
              inArray(membershipsTable.userId, requestedMentionIds),
            ),
          )
      : [];
  const validMentionedUserIds = validMentionedUsers.map((user) => user.userId);

  const [comment] = await db
    .insert(pulseCommentsTable)
    .values({
      pulseId,
      userId: ctx.user.id,
      content,
    })
    .returning({ id: pulseCommentsTable.id });

  if (validMentionedUserIds.length > 0) {
    await db.insert(pulseCommentMentionsTable).values(
      validMentionedUserIds.map((userId) => ({
        commentId: comment.id,
        userId,
      })),
    );
  }

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

  const generalCommentUserIds = [
    ...assignees.map((a) => a.userId),
    pulse.createdById,
  ].filter(
    (id): id is string =>
      !!id && id !== ctx.user.id && !validMentionedUserIds.includes(id),
  );

  await createNotifications(
    validMentionedUserIds,
    `${ctx.user.name} mentioned you in a comment on "${pulse.title}"`,
    pulseId,
    "mention",
  );

  await createNotifications(
    [...new Set(generalCommentUserIds)],
    `${ctx.user.name} commented on "${pulse.title}"`,
    pulseId,
    "comment",
  );

  revalidatePath(`/dashboard/pulses/${pulseId}`);
  return { success: true };
}
