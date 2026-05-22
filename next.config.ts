import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling Prisma -- it uses native binaries
  // that must be loaded at runtime, not bundled at build time.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  // Skip TS and ESLint checks 