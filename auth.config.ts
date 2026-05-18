import type { NextAuthConfig } from "next-auth";

const DAY = 60 * 60 * 24;

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 30 * DAY },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, account }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "FREE_MEMBER";
        token.studentLevel = (user as { studentLevel?: number | null }).studentLevel ?? null;
        // remember=false → 1-day session; default (remember=true) → 30 days
        const creds = (account as { remember?: boolean } | null);
        if (creds?.remember === false) {
          token.exp = Math.floor(Date.now() / 1000) + DAY;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as never;
        session.user.studentLevel = token.studentLevel as number | null;
      }
      return session;
    },
  },
  providers: [],
};
