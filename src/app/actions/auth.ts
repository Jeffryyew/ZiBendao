"use server";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "../../../auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { sendWelcomeEmail } from "@/lib/email";

const RegisterSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少8位"),
});

const LoginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(1, "请输入密码"),
});

type ActionResult = { error?: string; success?: string };

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

  await prisma.user.create({
    data: { name, email, hashedPassword, role: "FREE_MEMBER" },
  });

  sendWelcomeEmail(email, name).catch(() => {});

  return { success: "注册成功，请登录" };
}

export async function login(_prev: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
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
