"use client";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { Sidebar } from "./sidebar";
import { PropsWithChildren, useEffect } from "react";
import { UserContext } from "../../../src/context/user-context";
import { Menu } from "lucide-react";
import { useSearchStore } from "@/lib/stores/search";
import { SearchModal } from "./search-modal";

type Org = { orgId: string; name: string; role: string };

type Props = PropsWithChildren<{
  name: string;
  email: string;
  initials: string;
  orgs: Org[];
  currentOrgId: string;
}>;

export function Dashboard({
  name,
  email,
  initials,
  orgs,
  currentOrgId,
  children,
}: Props) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);
  const openMobile = useSidebarStore((state) => state.openMobile);
  const openSearch = useSearchStore((state) => state.openSearch);
  const isSearchOpen = useSearchStore((state) => state.open);
  const closeSearch = useSearchStore((state) => state.closeSearch);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  return (
    <>
      <UserContext value={{ name, email, initials }}>
        <Sidebar orgs={orgs} currentOrgId={currentOrgId} />
        <main
          className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-64"}`}
        >
          <div className="md:hidden flex items-center gap-3 mb-6">
            <button
              onClick={openMobile}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-indigo-600">TeamPulse</span>
          </div>
          {children}
        </main>
      </UserContext>
      <SearchModal open={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
