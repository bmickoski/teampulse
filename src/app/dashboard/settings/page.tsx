import { getCurrentUserWithOrg, getOrganization } from "@/lib/organizations";
import ProfileSettings from "./profile";
import OrganizationSettings from "./organization";
import { Separator } from "@/components/ui/separator";
import PasswordChange from "./password";

export default async function SettingsPage() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) return null;

  const org = await getOrganization(ctx.orgId);
  const isOwner = ctx.role === "owner";

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile and organization preferences.
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">Update your display name.</p>
        </div>
        <ProfileSettings name={ctx.user.name ?? ""} />
      </section>

      {isOwner && (
        <>
          <Separator />
          <section className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Organization</h2>
              <p className="text-sm text-gray-500">
                Update your organization name and slug.
              </p>
            </div>
            <OrganizationSettings name={org.name} defaultSlug={org.slug} />
          </section>
        </>
      )}

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Change password
          </h2>
          <p className="text-sm text-gray-500">Change your account password</p>
        </div>
        <PasswordChange />
      </section>
    </div>
  );
}
