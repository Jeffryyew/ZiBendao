import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSmsOtp } from "@/lib/sms";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { accountNo } = await req.json();
  if (!accountNo?.trim()) return NextResponse.json({ error: "请输入学员账号" }, { status: 400 });

  const account = await prisma.offlineStudentAccount.findUnique({
    where: { accountNo: accountNo.trim() },
  });

  if (!account) return NextResponse.json({ error: "学员账号不存在，请确认后重试" }, { status: 404 });

  if (account.linkedUserId && account.linkedUserId !== session.user.id) {
    return NextResponse.json({ error: "该学员账号已被其他用户绑定" }, { status: 409 });
  }

  if (account.linkedUserId === session.user.id) {
    return NextResponse.json({ error: "该学员账号已绑定到您的账户" }, { status: 409 });
  }

  const otp = String(Math.floor(100000 + crypto.randomInt(900000)));
  const identifier = `otp_sa_${account.phone}`;
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token: otp, expires } });

  await sendSmsOtp(account.phone, otp);

  const masked = account.phone.replace(/(\d{3})\d+(\d{4})$/, "$1****$2");
  return NextResponse.json({ phoneMasked: masked });
}
