import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getRoleLabel, isGraduate, ROLE_COLOR } from "@/lib/roles";

const GRAD_INFO: Record<string, { icon: string; course: string; color: string }> = {
  ZIBENTONG_GRAD: { icon: "优", course: "资本通", color: "#C9A84C" },
  QIDONG_GRAD: { icon: "启", course: "启动资本", color: "#A88C3A" },
  ZIBENDAO_GRAD: { icon: "道", course: "资本道", color: "#F5E6C8" },
};

const LEVEL_INFO = {
  1: { label: "第1阶", title: "入门学者", color: "#8B7355", nextLevel: "第2阶", xpNeeded: 200 },
  2: { label: "第2阶", title: "进阶分析师", color: "#C9A84C", nextLevel: "第3阶", xpNeeded: 400 },
  3: { label: "第3阶", title: "资本策略家", color: "#F5E6C8", nextLevel: null, xpNeeded: null },
};

const ACHIEVEMENTS = [
  { id: "first-lesson", icon: "①", title: "第一步", desc: "完成第一关课程", xp: 50 },
  { id: "module-1", icon: "◈", title: "财务启蒙", desc: "完成财务基础模块", xp: 100 },
  { id: "streak-7", icon: "→", title: "连续7天", desc: "连续学习7天", xp: 75 },
  { id: "tools-user", icon: "✦", title: "工具达人", desc: "使用3种计算工具", xp: 50 },
];

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const grad = isGraduate(role);
  const gradInfo = GRAD_INFO[role];
  const level = session.user.studentLevel ?? 1;
  const levelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO] ?? LEVEL_INFO[1];
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

  const xpPercent = levelInfo.xpNeeded
    ? Math.min((totalXP / levelInfo.xpNeeded) * 100, 100)
    : 100;

  const badgeColor = grad ? (gradInfo?.color ?? "#C9A84C") : levelInfo.color;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm mb-0.5" style={{ color: "#A0A09A" }}>欢迎回来，</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {firstName}
          </h1>
        </div>

        {/* Badge */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-2xl self-start sm:self-auto"
          style={{
            background: "linear-gradient(135deg, #1A1A1A, #222218)",
            border: `1px solid ${badgeColor}40`,
            boxShadow: `0 0 20px ${badgeColor}15`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${badgeColor}20`, color: badgeColor }}
          >
            {grad ? gradInfo?.icon : levelInfo.label}
          </div>
          <div>
            <div className="text-xs" style={{ color: "#A0A09A" }}>
              {grad ? "毕业证书" : "当前进度"}
            </div>
            <div className="text-sm font-semibold" style={{ color: badgeColor }}>
              {getRoleLabel(role)}
            </div>
          </div>
        </div>
      </div>

      {/* Graduate banner */}
      {grad && (
        <div
          className="p-5 rounded-2xl flex items-center gap-4"
          style={{
            background: `linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))`,
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <span className="text-3xl">{gradInfo?.icon}</span>
          <div>
            <div className="font-semibold text-sm" style={{ color: "#F5E6C8" }}>
              恭喜完成 {gradInfo?.course} 课程！
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#A0A09A" }}>
              您已解锁全部计算工具及相关资源
            </div>
          </div>
        </div>
      )}

      {/* XP Progress (only for ONLINE_STUDENT) */}
      {!grad && levelInfo.xpNeeded && (
        <div
          className="p-5 rounded-2xl"
          style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-medium">{levelInfo.label} → {levelInfo.nextLevel}</span>
              <span className="text-xs ml-2" style={{ color: "#666660" }}>升级进度</span>
            </div>
            <span className="text-sm font-mono" style={{ color: "#C9A84C" }}>
              {totalXP} / {levelInfo.xpNeeded} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#222222" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${xpPercent}%`,
                background: "linear-gradient(to right, #9A7A32, #C9A84C, #F5E6C8)",
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "#555550" }}>
            还需 {levelInfo.xpNeeded - totalXP} XP 升级
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已完成课程", value: completedCount.toString(), unit: "关", icon: "✓" },
          { label: "累计积分", value: totalXP.toString(), unit: "XP", icon: "XP" },
          { label: "当前身份", value: grad ? "毕业生" : `第${level}阶`, unit: "", icon: "◈" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {stat.value}
              {stat.unit && (
                <span className="text-xs font-normal ml-0.5" style={{ color: "#666660" }}>{stat.unit}</span>
              )}
            </div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/student/learn"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all"
          style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}
          >
            课程
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5">{grad ? "回顾课程" : "继续学习"}</div>
            <div className="text-xs" style={{ color: "#A0A09A" }}>
              {grad ? `${gradInfo?.course} 课程内容` : `当前进度：第${level}阶`}
            </div>
          </div>
          <span style={{ color: "#C9A84C" }}>→</span>
        </Link>

        <Link
          href="/student/tools"
          className="flex items-center gap-4 p-5 rounded-2xl transition-all"
          style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#808080" }}
          >
            工具
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5">计算工具</div>
            <div className="text-xs" style={{ color: "#A0A09A" }}>
              {grad ? "完整工具访问权限" : "按阶段解锁"}
            </div>
          </div>
          <span style={{ color: "#C9A84C" }}>→</span>
        </Link>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="font-semibold text-base mb-4">成就徽章</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((ach, i) => {
            const unlocked = (i === 0 && completedCount > 0) || grad;
            return (
              <div
                key={ach.id}
                className="flex flex-col items-center text-center p-4 rounded-2xl"
                style={{
                  backgroundColor: unlocked ? "#1A1A1A" : "#0F0F0F",
                  border: `1px solid ${unlocked ? "rgba(201,168,76,0.3)" : "#1A1A1A"}`,
                  opacity: unlocked ? 1 : 0.45,
                }}
              >
                <div className="text-3xl mb-2">{ach.icon}</div>
                <div className="text-xs font-semibold mb-1" style={{ color: unlocked ? "#F5F5F0" : "#555550" }}>
                  {ach.title}
                </div>
                <div className="text-xs leading-snug" style={{ color: "#555550" }}>{ach.desc}</div>
                <div className="text-xs mt-2 font-mono" style={{ color: unlocked ? "#C9A84C" : "#333330" }}>
                  +{ach.xp} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
