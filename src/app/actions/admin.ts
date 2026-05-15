"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

type ActionResult = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const role = session.user.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") throw new Error("Forbidden");
}

//  Users 

export async function updateUserRole(
  userId: string,
  role: string,
  studentLevel?: number,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as never,
        studentLevel: role === "ONLINE_STUDENT" ? (studentLevel ?? 1) : null,
      },
    });
    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.user.update({ where: { id: userId }, data: { isActive } });
    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

export async function createClientUser(
  name: string,
  email: string,
  password: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!name || !email || !password) return { error: "所有字段为必填" };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "此邮箱已被注册" };
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, email, hashedPassword, role: "ENTERPRISE_CLIENT" } });
    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "创建失败" };
  }
}

//  Tool access 

export async function grantToolAccess(userId: string, toolId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.clientToolAccess.upsert({
      where: { userId_toolId: { userId, toolId } },
      create: { userId, toolId },
      update: {},
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin/tools");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

export async function revokeToolAccess(userId: string, toolId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.clientToolAccess.deleteMany({ where: { userId, toolId } });
    revalidatePath("/admin/users");
    revalidatePath("/admin/tools");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

//  Courses 

export async function createModule(
  title: string,
  description: string,
  order: number,
  requiredLevel: number,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!title) return { error: "请填写模块名称" };
    await prisma.module.create({ data: { title, description, order, requiredLevel } });
    revalidatePath("/admin/courses");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "创建失败" };
  }
}

export async function toggleModulePublished(
  moduleId: string,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.module.update({ where: { id: moduleId }, data: { isPublished } });
    revalidatePath("/admin/courses");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

export async function deleteModule(moduleId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.lesson.deleteMany({ where: { moduleId } });
    await prisma.module.delete({ where: { id: moduleId } });
    revalidatePath("/admin/courses");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "删除失败" };
  }
}

export async function createLesson(
  moduleId: string,
  title: string,
  type: string,
  order: number,
  points: number,
  contentText: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!title) return { error: "请填写课节标题" };
    await prisma.lesson.create({
      data: {
        moduleId,
        title,
        type: type as never,
        order,
        points,
        content: { text: contentText },
      },
    });
    revalidatePath(`/admin/courses/${moduleId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "创建失败" };
  }
}

export async function deleteLesson(lessonId: string, moduleId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.lessonProgress.deleteMany({ where: { lessonId } });
    await prisma.lesson.delete({ where: { id: lessonId } });
    revalidatePath(`/admin/courses/${moduleId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "删除失败" };
  }
}

//  Tools 

export async function createTool(
  name: string,
  slug: string,
  description: string,
  requiredLevel: number,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!name || !slug) return { error: "请填写工具名称和标识" };
    const existing = await prisma.tool.findUnique({ where: { slug } });
    if (existing) return { error: "此工具标识已存在" };
    await prisma.tool.create({ data: { name, slug, description, requiredLevel } });
    revalidatePath("/admin/tools");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "创建失败" };
  }
}

export async function toggleToolActive(toolId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.tool.update({ where: { id: toolId }, data: { isActive } });
    revalidatePath("/admin/tools");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}

export async function seedDefaultTools(): Promise<ActionResult> {
  try {
    await requireAdmin();
    const defaults = [
      { name: "金融路线图方程式", slug: "financial-roadmap", description: "复利增长与长期财富规划", requiredLevel: 1 },
      { name: "产品服务报价系统", slug: "pricing-system", description: "动态报价单生成与PDF导出", requiredLevel: 1 },
      { name: "市值/市盈率计算器", slug: "market-cap", description: "PE/PB/PS估值分析与行业对比", requiredLevel: 2 },
      { name: "PAT & KPI 计算器", slug: "pat-kpi", description: "税后利润与关键指标追踪", requiredLevel: 2 },
    ];
    for (const tool of defaults) {
      await prisma.tool.upsert({
        where: { slug: tool.slug },
        create: tool,
        update: { name: tool.name, description: tool.description },
      });
    }
    revalidatePath("/admin/tools");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "初始化失败" };
  }
}
