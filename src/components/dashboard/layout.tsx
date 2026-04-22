"use client";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { Sidebar } from "./sidebar";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  name: string;
  email: string;
  initials: string;
}>;

export function Dashboard({ name, email, initials, children }: Props) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <>
      <Sidebar name={name ?? "User"} email={email ?? ""} initials={initials} />
      <main
        className={`flex-1 p-8 transition-all duration-200 ${isCollapsed ? "ml-16" : "ml-64"}`}
      >
        {children}
      </main>
    </>
  );
}
