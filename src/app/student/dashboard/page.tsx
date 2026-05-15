import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getRoleLabel } from "@/lib/roles";

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const firstName = session.user.name.split(" ")[0];

  let completedCount = 0;
  let totalXP = 0;

  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      include: { lesson: { select: { points: true } } },
    });
    completedCount = progress.length;
    totalXP = progress.reduce((sum, p) => sum + (p.lesson.points ?? 0), 0);
  } catch {
    // DB might not be seeded yet
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm mb-0.5" style={{ color: "var(--color-text-muted)" }}>欢迎回来，</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {firstName}
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 self-start sm:self-auto"
          style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
        >
          {getRoleLabel(role)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已完成课程", value: completedCount.toString(), unit: "关", icon: "✓" },
          { label: "累计积分", value: totalXP.toString(), unit: "XP", icon: "XP" },
          { label: "可用工具", value: "22", unit: "个", icon: "◈" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <div className="text-base mb-1" style={{ color: "var(--color-text-muted)" }}>{stat.icon}</div>
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {stat.value}
              {stat.unit && (
                <span className="text-xs font-normal ml-0.5" style={{ color: "var(--color-text-muted)" }}>{stat.unit}</span>
              )}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/student/learn"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:border-[#C9A84C]/40"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
          >
            课程
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>学习中心</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {completedCount > 0 ? `已完成 ${completedCount} 关，继续学习` : "开始你的学习之旅"}
            </div>
          </div>
          <span style={{ color: "#C9A84C" }}>→</span>
        </Link>

        <Link
          href="/student/tools"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:border-[#C9A84C]/40"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "#EEE9E0", border: "1px solid #D8D1C6", color: "#68625C" }}
          >
            工具
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>计算工具</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>4 个专业金融计算工具</div>
          </div>
          <span style={{ color: "#C9A84C" }}>→</span>
        </Link>

        <Link
          href="/dashboard/capital"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:border-[#C9A84C]/40"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
          >
            COS
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>企业资本系统</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>22 个企业级资本工具</div>
          </div>
          <span style={{ color: "#C9A84C" }}>→</span>
        </Link>

        <Link
          href="/tools/guide"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:border-[#C9A84C]/40"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "#EEE9E0", border: "1px solid #D8D1C6", color: "#68625C" }}
          >
            指南
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-text-primary)" }}>工具使用指南</div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>了解如何使用各项工具</div>
          </div>
          <span style={{ color: "#C9A84C" }}>→</span>
        </Link>
      </div>

    </div>
  );
}
