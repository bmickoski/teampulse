"use server";
import { db } from "@/db";
import { activityLogsTable, membershipsTable, usersTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithOrg } from "../organizations";
import { and, eq } from "drizzle-orm";
import {
  InviteTeamActionState,
  inviteTeamMemberSchema,
} from "../validations/team";

export async function inviteMemberAction(
  _prev: InviteTeamActionState,
  formData: FormData,
): Promise<InviteTeamActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return {
      error: "Unauthorized",
    };
  }
  const orgId = ctx.orgId;
  const userId = ctx.user.id;

  const form = Object.fromEntries(formData);
  const validationResult = inviteTeamMemberSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
  const { email } = validationResult.data;

  if (!email) {
    return { error: "Email is required" };
  }

  // find user by given email
  const userByEmail = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .then((r) => r[0]);
  if (!userByEmail) {
    return { error: "User with this email does not exist" };
  }

  // check if user is already a member of the organization
  const alreadyMember = await db
    .select()
    .from(membershipsTable)
    .where(
      and(
        eq(membershipsTable.organizationId, orgId),
        eq(membershipsTable.userId, userByEmail.id),
      ),
    );
  if (alreadyMember.length > 0) {
    return { error: "User is already a member of this organization" };
  }

  // insert in membership table with role member
  try {
    await db.insert(membershipsTable).values({
      userId: userByEmail.id,
      organizationId: orgId,
    });
    await db.insert(activityLogsTable).values({
      action: "member_invited",
      message: `Member "${userByEmail.name}" was invited to the organization`,
      userId: userId,
      organizationId: orgId,
    });
    revalidatePath("/dashboard/team");
    return { success: true };
  } catch {
    return { error: "An error occurred while inviting the member" };
  }
}
