"use server";
import { z } from "zod";
import { db } from "@/db";
import { activityLogsTable, membershipsTable, usersTable } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getCurrentUserWithOrg } from "../organizations";
import { and, eq } from "drizzle-orm";
import { TeamActionState, inviteTeamMemberSchema } from "../validations/team";

export async function inviteMemberAction(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return {
      error: "Unauthorized",
    };
  }
  const orgId = ctx.orgId;
  const userId = ctx.user.id;

  if (ctx.role !== "owner") {
    return { error: "Only the organization owner can invite members" };
  }

  const form = Object.fromEntries(formData);
  const validationResult = inviteTeamMemberSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      form,
      errors: z.flattenError(validationResult.error).fieldErrors,
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

export async function removeMemberAction(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return {
      error: "Unauthorized",
    };
  }
  const orgId = ctx.orgId;
  const userId = ctx.user.id;

  if (ctx.role !== "owner") {
    return { error: "Only the organization owner can remove members" };
  }

  const memberId = formData.get("memberId") as string;

  if (!memberId) {
    return { error: "Member ID is required" };
  }

  const memberRecord = await db
    .select({
      role: membershipsTable.role,
      name: usersTable.name,
    })
    .from(membershipsTable)
    .innerJoin(usersTable, eq(membershipsTable.userId, usersTable.id))
    .where(
      and(
        eq(membershipsTable.organizationId, orgId),
        eq(membershipsTable.userId, memberId),
      ),
    )
    .then((rows) => rows[0]);

  if (!memberRecord) {
    return { error: "User is not a member of this organization" };
  }

  if (memberRecord.role === "owner") {
    return { error: "The organization owner cannot be removed" };
  }

  // remove from membership table with role member
  try {
    await db
      .delete(membershipsTable)
      .where(
        and(
          eq(membershipsTable.organizationId, orgId),
          eq(membershipsTable.userId, memberId),
        ),
      );

    await db.insert(activityLogsTable).values({
      action: "member_removed",
      message: `Member "${memberRecord.name}" was removed from the organization`,
      userId,
      organizationId: orgId,
    });

    revalidatePath("/dashboard/team");
    return { success: true };
  } catch {
    return { error: "An error occurred while removing the member" };
  }
}
