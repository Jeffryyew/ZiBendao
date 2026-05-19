import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const COURSE_ROLE: Record<string, string> = {
  CAPITAL_MAP:  "ZIBENTONG_GRAD",
  CAPITAL_CODE: "QIDONG_GRAD",
  CAPITAL_DAO:  "ZIBENDAO_GRAD",
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { accountNo, otp } = await req.json();
  if (!accountNo?.trim() || !otp?.trim()) {
    return NextResponse.json({ error: "请提供账号和验证码" }, { status: 400 });
  }

  const account = await prisma.offlineStudentAccount.findUnique({
    where: { accountNo: accountNo.trim() },
  });
  if (!account) return NextResponse.json({ error: "学员账号不存在" }, { status: 404 });

  if (account.linkedUserId && account.linkedUserId !== session.user.id) {
    return NextResponse.json({ error: "该学员账号已被其他用户绑定" }, { status: 409 });
  }

  const identifier = `otp_sa_${account.phone}`;
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token: otp.trim(), expires: { gt: new Date() } },
  });
  if (!record) return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  await prisma.$transaction([
    prisma.offlineStudentAccount.update({
      where: { accountNo: account.accountNo },
      data: { linkedUserId: session.user.id },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { studentAccountNo: account.accountNo },
    }),
  ]);

  return NextResponse.json({
    success: true,
    accountNo: account.accountNo,
    course: account.course,
    holderName: account.holderName,
    pendingRole: COURSE_ROLE[account.course] ?? null,
  });
}
