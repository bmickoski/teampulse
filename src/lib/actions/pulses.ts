"use server";
import { z } from "zod";
import { db } from "@/db";
import {
  type PulsesActionState,
  pulsesFormSchema,
} from "../validations/pulses";
import {
  activityLogsTable,
  membershipsTable,
  pulseAssignmentsTable,
  pulsesTable,
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { getCurrentUserWithOrg } from "../organizations";
import { createNotifications } from "../notifications";

export async function pulsesAction(
  _prev: PulsesActionState,
  formData: FormData,
): Promise<PulsesActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return {
      error: "Unauthorized",
    };
  }
  if (ctx.role !== "owner") return { error: "Forbidden" };

  const form = Object.fromEntries(formData);
  const validationResult = pulsesFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: z.flattenError(validationResult.error).fieldErrors,
    };
  }
  const { title, description, status, dueDate, priority } =
    validationResult.data;

  try {
    const [insertedPulse] = await db
      .insert(pulsesTable)
      .values({
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: ctx.user.id,
        organizationId: ctx.orgId,
        priority: priority,
      })
      .returning({ id: pulsesTable.id });
    await db.insert(activityLogsTable).values({
      action: "pulse_created",
      message: `Pulse "${title}" created`,
      userId: ctx.user.id,
      organizationId: ctx.orgId,
      pulseId: insertedPulse.id,
    });
    revalidatePath("/dashboard/pulses");
    return { success: true };
  } catch {
    return { errors: { description: ["Failed to create pulse"] } };
  }
}

export async function pulseDeleteAction(
  _prev: PulsesActionState,
  formData: FormData,
): Promise<PulsesActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return { error: "Unauthorized" };
  if (ctx.role !== "owner") return { error: "Forbidden" };

  const pulseId = formData.get("pulseId") as string;
  if (!pulseId) return { error: "Missing pulse ID" };

  try {
    const [pulse] = await db
      .select({ title: pulsesTable.title })
      .from(pulsesTable)
      .where(
        and(
          eq(pulsesTable.id, pulseId),
          eq(pulsesTable.organizationId, ctx.orgId),
          isNull(pulsesTable.deletedAt),
        ),
      );

    if (!pulse) return { error: "Pulse not found" };

    await db
      .update(pulsesTable)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(pulsesTable.id, pulseId),
          eq(pulsesTable.organizationId, ctx.orgId),
          isNull(pulsesTable.deletedAt),
        ),
      );

    await db.insert(activityLogsTable).values({
      action: "pulse_deleted",
      message: `Pulse "${pulse.title}" was deleted`,
      userId: ctx.user.id,
      organizationId: ctx.orgId,
      pulseId,
    });
    revalidatePath("/dashboard/pulses");
    return { success: true };
  } catch {
    return { error: "Failed to delete pulse" };
  }
}

export async function pulseEditAction(
  _prev: PulsesActionState,
  formData: FormData,
): Promise<PulsesActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return { error: "Unauthorized" };
  if (ctx.role !== "owner") return { error: "Forbidden" };

  const form = Object.fromEntries(formData);

  const pulseId = formData.get("pulseId") as string;
  if (!pulseId) return { error: "Missing pulse ID" };

  const validationResult = pulsesFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: z.flattenError(validationResult.error).fieldErrors,
    };
  }
  const { title, description, status, dueDate, priority } =
    validationResult.data;

  try {
    const [pulse] = await db
      .select({
        id: pulsesTable.id,
        status: pulsesTable.status,
        createdById: pulsesTable.createdById,
        title: pulsesTable.title,
      })
      .from(pulsesTable)
      .where(
        and(
          eq(pulsesTable.id, pulseId),
          eq(pulsesTable.organizationId, ctx.orgId),
          isNull(pulsesTable.deletedAt),
        ),
      );

    if (!pulse) return { error: "Pulse not found" };
    const requestedUserIds = [
      ...new Set(formData.getAll("userId") as string[]),
    ];
    const validAssignees =
      requestedUserIds.length > 0
        ? await db
            .select({ userId: membershipsTable.userId })
            .from(membershipsTable)
            .where(
              and(
                eq(membershipsTable.organizationId, ctx.orgId),
                inArray(membershipsTable.userId, requestedUserIds),
              ),
            )
        : [];
    const userIds = validAssignees.map((assignee) => assignee.userId);

    if (requestedUserIds.length !== userIds.length) {
      return { error: "Invalid assignees" };
    }

    await db
      .update(pulsesTable)
      .set({
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority,
      })
      .where(
        and(
          eq(pulsesTable.id, pulseId),
          eq(pulsesTable.organizationId, ctx.orgId),
          isNull(pulsesTable.deletedAt),
        ),
      );

    if (pulse.status !== status) {
      const statusNotifyIds = [
        ...new Set([...userIds, pulse.createdById]),
      ].filter((id): id is string => !!id && id !== ctx.user.id);

      await createNotifications(
        statusNotifyIds,
        `${ctx.user.name} moved "${title}" to ${status}`,
        pulseId,
        "status_change",
      );
    }

    await db.insert(activityLogsTable).values({
      action: "pulse_updated",
      message: `Pulse "${title ?? "Unknown"}" was updated`,
      userId: ctx.user.id,
      organizationId: ctx.orgId,
      pulseId,
    });

    const previousAssignees = await db
      .select({ userId: pulseAssignmentsTable.userId })
      .from(pulseAssignmentsTable)
      .where(eq(pulseAssignmentsTable.pulseId, pulseId));
    const previousIds = previousAssignees.map((a) => a.userId);

    await db
      .delete(pulseAssignmentsTable)
      .where(eq(pulseAssignmentsTable.pulseId, pulseId));

    if (userIds.length > 0) {
      await db
        .insert(pulseAssignmentsTable)
        .values(userIds.map((userId) => ({ pulseId, userId })));
    }

    const newlyAssigned = userIds.filter(
      (id) => !previousIds.includes(id) && id !== ctx.user.id,
    );
    await createNotifications(
      newlyAssigned,
      `You were assigned to "${title}"`,
      pulseId,
      "assignment",
    );

    const removed = previousIds.filter(
      (id) => !userIds.includes(id) && id !== ctx.user.id,
    );
    await createNotifications(
      removed,
      `You were removed from "${title}"`,
      pulseId,
      "assignment",
    );

    return { success: true };
  } catch {
    return { error: "Failed to edit pulse" };
  }
}
