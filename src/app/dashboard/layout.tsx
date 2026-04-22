import { Dashboard } from "@/components/dashboard/layout";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Dashboard
        name={user?.name ?? "User"}
        email={user?.email ?? ""}
        initials={initials}
      >
        {children}
      </Dashboard>
    </div>
  );
}
