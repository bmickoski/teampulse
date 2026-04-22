"use server";
import { getCurrentUser } from "@/lib/auth";
import { ProfileActionState, profileFormSchema } from "../validations/profile";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { activityLogsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function profileEditAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const loggedUser = await getCurrentUser().then((user) => user?.id);
  if (!loggedUser) return { error: "Unauthorized" };

  const form = Object.fromEntries(formData);

  const validationResult = profileFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
  const { name } = validationResult.data;

  try {
    await db
      .update(usersTable)
      .set({ name })
      .where(eq(usersTable.id, loggedUser));

    await db.insert(activityLogsTable).values({
      action: "user_updated",
      message: `User "${name ?? "Unknown"}" was updated`,
      userId: loggedUser,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch {
    return { error: "Failed to edit profile" };
  }
}
