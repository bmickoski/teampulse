import { getCurrentUserWithOrg, getOrgMembers } from "@/lib/organizations";
import { InviteMemberDialog } from "./invite-member-form";
import { RemoveMemberButton } from "./remove-member-form";

export default async function TeamPage() {
  const [members, ctx] = await Promise.all([getOrgMembers(), getCurrentUserWithOrg()]);
  const isOwner = ctx?.role === "owner";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-500">
            Manage your organization members
          </p>
        </div>

        {isOwner && <InviteMemberDialog />}
      </div>

      <div className="space-y-3">
        {members?.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div>
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 capitalize">
                {member.role}
              </span>
              {isOwner && (
                <RemoveMemberButton
                  memberId={member.userId}
                  memberName={member.name}
                  memberEmail={member.email}
                  memberRole={member.role}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
