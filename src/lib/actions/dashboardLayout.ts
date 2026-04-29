"use server";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveDashboardLayout(layout: string[]) {
  const user = await getCurrentUser();
  if (!user) return;
  await db
    .update(usersTable)
    .set({ dashboardLayout: layout })
    .where(eq(usersTable.id, String(user.id)));
  revalidatePath("/dashboard");
}
