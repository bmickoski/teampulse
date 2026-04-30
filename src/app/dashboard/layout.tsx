import { Dashboard } from "@/components/dashboard/layout";
import { getCurrentUserWithOrg, getUserOrgs } from "@/lib/organizations";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function DashboardLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const [ctx, orgs] = await Promise.all([
    getCurrentUserWithOrg(),
    getUserOrgs(),
  ]);

  if (!ctx) redirect("/sign-in");
  if (!ctx.orgId) redirect("/create-organization");

  const initials =
    ctx.user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Dashboard
        name={ctx.user.name ?? "User"}
        email={ctx.user.email ?? ""}
        initials={initials}
        orgs={orgs}
        currentOrgId={ctx.orgId}
      >
        {children}
      </Dashboard>
      <Suspense fallback={null}>{modal}</Suspense>
    </div>
  );
}
