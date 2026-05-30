import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // DATABASE_URL is used locally; on Vercel the integration sets POSTGRES_URL_NON_POOLING
  // (direct connection, no pgBouncer) which is correct for PrismaPg driver adapter.
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL, POSTGRES_URL_NON_POOLING, or POSTGRES_URL."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
