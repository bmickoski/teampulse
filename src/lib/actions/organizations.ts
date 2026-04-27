"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  type OrganizationsActionState,
  organizationsFormSchema,
} from "../validations/organizations";
import { membershipsTable, organizationsTable } from "@/db/schema";
import { getCurrentUser } from "../auth";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { getCurrentUserWithOrg } from "../organizations";

export async function organizationsAction(
  _prev: OrganizationsActionState,
  formData: FormData,
): Promise<OrganizationsActionState> {
  const loggedUser = await getCurrentUser().then((user) => user?.id);
  if (!loggedUser) {
    return {
      error: "Unauthorized",
    };
  }
  const form = Object.fromEntries(formData);
  const validationResult = organizationsFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: z.flattenError(validationResult.error).fieldErrors,
    };
  }
  const { name, slug } = validationResult.data;

  try {
    const [org] = await db
      .insert(organizationsTable)
      .values({ name, slug })
      .returning();
    await db.insert(membershipsTable).values({
      organizationId: org.id,
      role: "owner",
      userId: loggedUser,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { errors: { slug: ["Slug already in use"] } };
    }
    return { error: message };
  }

  redirect("/dashboard");
}

export async function updateOrganizationAction(
  _prev: OrganizationsActionState,
  formData: FormData,
): Promise<OrganizationsActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return { error: "Unauthorized" };
  if (ctx.role !== "owner") return { error: "Only the organization owner can update organization settings" };

  const orgId = ctx.orgId;

  const form = Object.fromEntries(formData);
  const validationResult = organizationsFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: z.flattenError(validationResult.error).fieldErrors,
    };
  }
  const { name, slug } = validationResult.data;

  try {
    await db
      .update(organizationsTable)
      .set({ name, slug })
      .where(eq(organizationsTable.id, orgId));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { errors: { slug: ["Slug already in use"] } };
    }
    return { error: message };
  }

  redirect("/dashboard/settings");
}
