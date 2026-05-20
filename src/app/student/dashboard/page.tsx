import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CAPITAL_LAUNCH_MODULES } from "@/lib/capitalLaunchCourse";
import DashboardClient from "./DashboardClient";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? session.user.name ?? "用户";

  const modules = CAPITAL_LAUNCH_MODULES.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({ id: l.id, points: l.xpReward })),
  }));

  const lessonXpMap = new Map(
    CAPITAL_LAUNCH_MODULES.flatMap((m) => m.lessons.map((l) => [l.id, l.xpReward]))
  );

  let completedIds: string[] = [];
  let totalXP = 0;

  try {
    const progress = await prisma.onlineLessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { lessonId: true },
    });
    completedIds = progress.map((p) => p.lessonId);
    totalXP = completedIds.reduce((sum, id) => sum + (lessonXpMap.get(id) ?? 0), 0);
  } catch {
    // DB not migrated yet
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
