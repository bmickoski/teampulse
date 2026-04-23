import { db } from "@/db";
import { activityLogsTable } from "@/db/schema";
import { getCurrentUserWithOrg } from "@/lib/organizations";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return new Response("Unauthorized", { status: 401 });

  let intervalId: NodeJS.Timeout;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const logs = await db
          .select()
          .from(activityLogsTable)
          .where(eq(activityLogsTable.organizationId, ctx.orgId))
          .orderBy(desc(activityLogsTable.createdAt))
          .limit(20);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(logs)}\n\n`));
      };
      await send();
      intervalId = setInterval(send, 3000);
    },
    cancel() {
      clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
