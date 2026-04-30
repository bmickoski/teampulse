import { getCurrentUser } from "@/lib/auth";
import { consumeInviteTokenAction } from "@/lib/actions/inviteToken";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-up?callbackUrl=/join/${token}`);

  try {
    const orgId = await consumeInviteTokenAction(token, String(user.id));

    // set as active org
    await db
      .update(usersTable)
      .set({ activeOrgId: orgId })
      .where(eq(usersTable.id, String(user.id)));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Something went wrong";
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{message}</p>
      </div>
    );
  }

  redirect("/dashboard");
}
