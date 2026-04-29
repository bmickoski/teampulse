import { db } from "@/db";
import { notificationsTable } from "@/db/schema";

export async function createNotifications(
  userIds: string[],
  message: string,
  pulseId?: string,
) {
  if (userIds.length === 0) return;
  await db.insert(notificationsTable).values(
    userIds.map((userId) => ({
      userId,
      message,
      pulseId,
    })),
  );
}
