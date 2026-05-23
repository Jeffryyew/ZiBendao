"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isStudentArea, isGraduate } from "@/lib/roles";

export async function completeLesson(lessonId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  if (!isStudentArea(role) && !isGraduate(role)) return { error: "无访问权限" };

  try {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
      create: {
        userId: session.user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });
    revalidatePath("/student/learn");
    revalidatePath("/student/dashboard");
    revalidatePath("/student/profile");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "操作失败" };
  }
}
