import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Safe diagnostic endpoint — shows env var presence, not values
// Remove this file after debugging is complete
export async function GET() {
  const envStatus = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL ?? "(not set)",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "(not set)",
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST ?? "(not set)",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL ?? "(not set)",
    VERCEL_URL: process.env.VERCEL_URL ?? "(not set)",
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "(not set)",
  };

  let dbStatus: { ok: boolean; userCount?: number; error?: string } = { ok: false };
  try {
    const count = await prisma.user.count();
    dbStatus = { ok: true, userCount: count };
  } catch (e) {
    dbStatus = { ok: false, error: String(e) };
  }

  return NextResponse.json({ env: envStatus, db: dbStatus });
}
