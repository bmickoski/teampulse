"use server";
import { z } from "zod";
import { db } from "@/db";
import {
  type PulsesActionState,
  pulsesFormSchema,
} from "../validations/pulses";
import { getCurrentUser } from "../auth";
import { activityLogsTable, pulsesTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { getUserOrganization } from "../organizations";

export async function pulsesAction(
  _prev: PulsesActionState,
  formData: FormData,
): Promise<PulsesActionState> {
  const loggedUser = await getCurrentUser().then((user) => user?.id);
  if (!loggedUser) {
    return {
      error: "Unauthorized",
    };
  }
  const form = Object.fromEntries(formData);
  const validationResult = pulsesFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: z.flattenError(validationResult.error).fieldErrors,
    };
  }
  const { title, description, status, dueDate } = validationResult.data;

  try {
    const orgId = await getUserOrganization(loggedUser);
    if (!orgId) {
      return { error: "User does not belong to an organization" };
    }
    const [insertedPulse] = await db
      .insert(pulsesTable)
      .values({
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: loggedUser,
        organizationId: orgId,
      })
      .returning({ id: pulsesTable.id });
    await db.insert(activityLogsTable).values({
      action: "pulse_created",
      message: `Pulse "${title}" created`,
      userId: loggedUser,
      organizationId: orgId,
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
  const loggedUser = await getCurrentUser().then((user) => user?.id);
  if (!loggedUser) return { error: "Unauthorized" };

  const pulseId = formData.get("pulseId") as string;
  if (!pulseId) return { error: "Missing pulse ID" };

  try {
    const orgId = await getUserOrganization(loggedUser);
    if (!orgId) {
      return { error: "User does not belong to an organization" };
    }
    const [pulse] = await db
      .select({ title: pulsesTable.title })
      .from(pulsesTable)
      .where(eq(pulsesTable.id, pulseId));

    await db
      .update(pulsesTable)
      .set({ deletedAt: new Date() })
      .where(eq(pulsesTable.id, pulseId));

    await db.insert(activityLogsTable).values({
      action: "pulse_deleted",
      message: `Pulse "${pulse?.title ?? "Unknown"}" was deleted`,
      userId: loggedUser,
      organizationId: orgId,
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
  const loggedUser = await getCurrentUser().then((user) => user?.id);
  if (!loggedUser) return { error: "Unauthorized" };

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
  const { title, description, status, dueDate } = validationResult.data;

  try {
    const orgId = await getUserOrganization(loggedUser);
    if (!orgId) {
      return { error: "User does not belong to an organization" };
    }

    await db
      .update(pulsesTable)
      .set({
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
      })
      .where(eq(pulsesTable.id, pulseId));

    try {
      await db.insert(activityLogsTable).values({
        action: "pulse_updated",
        message: `Pulse "${title ?? "Unknown"}" was updated`,
        userId: loggedUser,
        organizationId: orgId,
        pulseId,
      });
    } catch {}

    return { success: true };
  } catch {
    return { error: "Failed to edit pulse" };
  }
}
