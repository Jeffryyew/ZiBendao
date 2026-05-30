import NextAuth from "next-auth";

// Fix AUTH_URL for Vercel: NEXTAUTH_URL in .env is localhost which breaks Google OAuth.
// Only override when the current value is not already a production https URL.
if (process.env.VERCEL) {
  const currentUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
  if (!currentUrl.startsWith("https://")) {
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
    if (host) process.env.AUTH_URL = `https://${host}`;
  }
}
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";


export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Google has already verified the user's email — mark it verified for
      // existing accounts that were created before this logic existed.
      if (account?.provider === "google" && user.email) {
        await prisma.user.updateMany({
          where: { email: user.email, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      checks: ["state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: (profile.name as string | undefined) ?? (profile.email as string).split("@")[0],
          email: profile.email,
          // Google verifies emails on their end; new users created via Google
          // should always have emailVerified set.
          emailVerified: new Date(),
          role: "FREE_MEMBER" as const,
          studentLevel: null,
        };
      },
    }),
    Credentials({
      id: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.hashedPassword || !user.isActive) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.hashedPassword);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role, studentLevel: user.studentLevel };
      },
    }),
    Credentials({
      id: "otp",
      credentials: { email: {}, otp: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;
        const email = (credentials.email as string).toLowerCase().trim();
        const record = await prisma.verificationToken.findFirst({
          where: {
            identifier: `otp_${email}`,
            token: credentials.otp as string,
            expires: { gt: new Date() },
          },
        });
        if (!record) return null;

        await prisma.verificationToken.deleteMany({ where: { identifier: `otp_${email}` } });

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              role: "FREE_MEMBER",
              emailVerified: new Date(),
              isActive: true,
            },
          });
        } else {
          if (!user.isActive) return null;
          if (!user.emailVerified) {
            await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
          }
        }

        return { id: user.id, email: user.email, name: user.name, role: user.role, studentLevel: user.studentLevel };
      },
    }),
  ],
});
