import { createContext, use } from "react";

type User = {
  name: string;
  email: string;
  initials: string;
};

export const UserContext = createContext<User | null>(null);

export function useUser() {
  const ctx = use(UserContext);
  if (!ctx) throw new Error("useUser must be used inside Dashboard");
  return ctx;
}
