import { db } from "@/db";
import { notificationsTable } from "@/db/schema";
import { type NotificationType } from "@/lib/types";

export async function createNotifications(
  userIds: string[],
  message: string,
  pulseId?: string,
  type: NotificationType = "general",
) {
  if (userIds.length === 0) return;
  await db.insert(notificationsTable).values(
    userIds.map((userId) => ({
      userId,
      message,
      pulseId,
      type,
    })),
  );
}
