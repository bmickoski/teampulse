import { getCurrentUserWithOrg, getOrganization } from "@/lib/organizations";
import ProfileSettings from "./profile";
import OrganizationSettings from "./organization";

export default async function SettingsPage() {
  const ctx = await getCurrentUserWithOrg();
  if (!ctx) {
    return null;
  }
  const org = await getOrganization(ctx.orgId);
  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <h1>Settings</h1>
      <ProfileSettings name={ctx.user.name ?? ""} />
      <OrganizationSettings name={org.name} defaultSlug={org.slug} />
    </div>
  );
}
