import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? session.user.name ?? "用户";

  let completedIds: string[] = [];
  let totalXP = 0;
  let modules: { id: string; title: string; lessons: { id: string; points: number | null }[] }[] = [];

  try {
    const [progress, moduleData] = await Promise.all([
      prisma.lessonProgress.findMany({
        where: { userId: session.user.id, completed: true },
        include: { lesson: { select: { points: true } } },
      }),
      prisma.module.findMany({
        where: { isPublished: true },
        include: { lessons: { select: { id: true, points: true } } },
        orderBy: { order: "asc" },
      }),
    ]);
    completedIds = progress.map((p) => p.lessonId);
    totalXP = progress.reduce((sum, p) => sum + (p.lesson.points ?? 0), 0);
    modules = moduleData;
  } catch {
    // DB might not be seeded yet
  }

  return (
    <DashboardClient
      data={{
        firstName,
        completedIds,
        totalXP,
        modules,
        role: (session.user.role as string) ?? "FREE_MEMBER",
      }}
    />
  );
}
