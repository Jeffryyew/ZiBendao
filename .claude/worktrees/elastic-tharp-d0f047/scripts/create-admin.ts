/**
 * 创建或升级管理员账号
 * 用法: npx tsx scripts/create-admin.ts
 *
 * 如账号已存在 → 直接升级为 SUPER_ADMIN
 * 如账号不存在 → 创建新账号并设为 SUPER_ADMIN
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const EMAIL = "admin@capitalmastery.net";   // ← 可修改
const PASSWORD = "Admin@1234";              // ← 可修改
const NAME = "Super Admin";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = new PrismaClient({ adapter } as any);

  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });

  if (existing) {
    await prisma.user.update({
      where: { email: EMAIL },
      data: { role: "SUPER_ADMIN", isActive: true },
    });
    console.log(`✅ 已将 ${EMAIL} 升级为 SUPER_ADMIN`);
  } else {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: EMAIL,
        name: NAME,
        hashedPassword: hashed,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
    console.log(`✅ 已创建管理员账号`);
    console.log(`   邮箱：${EMAIL}`);
    console.log(`   密码：${PASSWORD}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
