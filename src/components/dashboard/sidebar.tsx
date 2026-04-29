"use client";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { NavLinks } from "./nav-links";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useUser } from "@/context/user-context";
import { NotificationBell } from "./notification-bell";

export function Sidebar() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const user = useUser();
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      <div className="px-5 py-4 flex items-center justify-center">
        {isCollapsed ? (
          <span className="font-bold text-lg text-indigo-600">T</span>
        ) : (
          <span className="font-bold text-lg tracking-tight text-indigo-600">
            TeamPulse
          </span>
        )}
      </div>
      <Separator />
      <nav className="flex-1 px-3 py-4">
        <NavLinks />
      </nav>
      <Separator />
      <div className="px-4 py-4 flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <NotificationBell />
        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
