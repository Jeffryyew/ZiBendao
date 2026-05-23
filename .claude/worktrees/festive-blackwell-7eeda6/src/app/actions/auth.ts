"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "../../../auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { sendVerificationEmail, sendWelcomeEmail, sendOtpEmail } from "@/lib/email";
import { randomBytes } from "crypto";

const RegisterSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少8位"),
});

const LoginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(1, "请输入密码"),
});

type ActionResult = { error?: string; success?: string; unverified?: boolean };

export async function register(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "此邮箱已被注册" };

  const hashedPassword = await bcrypt.hash(password, 12);
  const verifyToken = randomBytes(32).toString("hex");
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.create({
    data: { name, email, hashedPassword, role: "FREE_MEMBER", verifyToken, verifyTokenExpiry },
  });

  sendVerificationEmail(email, name, verifyToken).catch(() => {});

  return { success: "verification_sent" };
}

export async function resendVerification(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "请输入邮箱地址" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "此邮箱未注册" };
  if (user.emailVerified) return { success: "already_verified" };

  const verifyToken = randomBytes(32).toString("hex");
  const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken, verifyTokenExpiry },
  });

  sendVerificationEmail(email, user.name, verifyToken).catch(() => {});

  return { success: "verification_sent" };
}

export async function login(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user && !user.emailVerified) {
    return { error: "请先验证你的邮箱", unverified: true };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "邮箱或密码错误" };
        default:
          return { error: "登录失败，请重试" };
      }
    }
    throw error;
  }

  return { success: "登录成功" };
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function sendOtp(email: string): Promise<ActionResult> {
  const parsed = z.string().email("请输入有效邮箱").safeParse(email.trim().toLowerCase());
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cleanEmail = parsed.data;

  // Delete any existing OTP for this email
  await prisma.verificationToken.deleteMany({ where: { identifier: `otp_${cleanEmail}` } });

  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.verificationToken.create({
    data: { identifier: `otp_${cleanEmail}`, token: otp, expires },
  });

  sendOtpEmail(cleanEmail, otp).catch(() => {});

  return { success: "otp_sent" };
}

export async function verifyEmailToken(token: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.user.findUnique({ where: { verifyToken: token } });

  if (!user) return { success: false, error: "链接无效或已失效" };
  if (!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
    return { success: false, error: "验证链接已过期，请重新发送" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verifyToken: null, verifyTokenExpiry: null },
  });

  sendWelcomeEmail(user.email, user.name).catch(() => {});

  return { success: true };
}
