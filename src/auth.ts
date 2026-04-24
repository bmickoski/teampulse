import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { membershipsTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      if (userRole === "member" && nextUrl.pathname === "/dashboard/settings") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      const isProtected = nextUrl.pathname.startsWith("/dashboard");
      if (isProtected) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const role = await db
          .select({ role: membershipsTable.role })
          .from(membershipsTable)
          .where(eq(membershipsTable.id, user.id ?? ""))
          .then((r) => r[0]?.role);
        token.role = role;
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .then((r) => r[0]);
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
