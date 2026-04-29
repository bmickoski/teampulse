"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { PanelLeft, LayoutDashboard, Zap, Users, Settings, Activity } from "lucide-react";

const links = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Pulses", href: "/dashboard/pulses", icon: Zap },
  { title: "Activity", href: "/dashboard/activity", icon: Activity },
  { title: "Team", href: "/dashboard/team", icon: Users },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function NavLinks() {
  const pathname = usePathname();
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const toggle = useSidebarStore((state) => state.toggle);

  return (
    <>
      <button
        onClick={toggle}
        className="flex items-center justify-center w-8 h-8 mb-4 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <PanelLeft size={16} />
      </button>

      <ul className="space-y-0.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                title={link.title}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <link.icon size={16} className="shrink-0" />
                {!isCollapsed && <span>{link.title}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
