"use client";
import { useSidebarStore } from "@/lib/stores/sidebar";
import { Sidebar } from "./sidebar";
import { PropsWithChildren } from "react";
import { UserContext } from "../../../src/context/user-context";

type Props = PropsWithChildren<{
  name: string;
  email: string;
  initials: string;
}>;

export function Dashboard({ name, email, initials, children }: Props) {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed);

  return (
    <>
      <UserContext value={{ name, email, initials }}>
        <Sidebar />
        <main
          className={`flex-1 p-8 transition-all duration-200 ${isCollapsed ? "ml-16" : "ml-64"}`}
        >
          {" "}
          {children}
        </main>
      </UserContext>
    </>
  );
}
