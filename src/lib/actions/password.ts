"use server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  updatePasswordActionState,
  updatePasswordSchema,
} from "../validations/password";
import { activityLogsTable, usersTable } from "@/db/schema";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithOrg } from "../organizations";

export async function updatePasswordAction(
  _prev: updatePasswordActionState,
  formData: FormData,
): Promise<updatePasswordActionState> {
  const ctx = await getCurrentUserWithOrg();
  const orgId = ctx?.orgId;
  const userId = ctx?.user.id;
  if (!userId) return { error: "Unauthorized" };

  const form = Object.fromEntries(formData);

  const validationResult = updatePasswordSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
  const { password, currentPassword } = validationResult.data;

  const [userRecord] = await db
    .select({ passwordHash: usersTable.passwordHash })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!userRecord?.passwordHash) {
    return { error: "No password set for this account" };
  }

  const verifyPassword = await bcrypt.compare(currentPassword, userRecord.passwordHash);

  if (!verifyPassword) {
    return { error: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db
      .update(usersTable)
      .set({ passwordHash })
      .where(eq(usersTable.id, userId));

    await db.insert(activityLogsTable).values({
      action: "user_password_updated",
      message: `User "${ctx.user.name ?? "Unknown"}" updated their password`,
      userId: userId,
      organizationId: orgId,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { error: "Failed to update password" };
  }
}
