import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRoleLabel, isGraduate } from "@/lib/roles";

const LEVEL_INFO = {
  1: { label: "L1", title: "入门学者", desc: "开始你的金融学习之旅", color: "#8B7355", max: 200 },
  2: { label: "L2", title: "进阶分析师", desc: "掌握投资基础，深入市场分析", color: "#C9A84C", max: 400 },
  3: { label: "L3", title: "资本策略家", desc: "精通高级资本运作与咨询方法", color: "#F5E6C8", max: null },
};

const ACHIEVEMENTS = [
  { id: "register", icon: "✦", title: "欢迎加入", desc: "完成注册，开始学习之旅", unlocked: true },
  { id: "first-lesson", icon: "①", title: "第一步", desc: "完成第一关课程" },
  { id: "module-done", icon: "◈", title: "财务启蒙", desc: "完成财务基础模块" },
  { id: "streak-7", icon: "→", title: "学习达人", desc: "连续学习7天" },
  { id: "tools-3", icon: "✓", title: "工具专家", desc: "使用3种计算工具" },
  { id: "level-2", icon: "▲", title: "进阶成就", desc: "升级至 L2 学生" },
];

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const grad = isGraduate(role);
  const level = session.user.studentLevel ?? 1;
  const levelInfo = LEVEL_INFO[level as keyof typeof LEVEL_INFO] ?? LEVEL_INFO[1];

  let completedCount = 0;
  let totalXP = 0;
  let memberSince = new Date();

  try {
    const [progress, user] = await Promise.all([
      prisma.lessonProgress.findMany({
        where: { userId: session.user.id, completed: true },
        include: { lesson: { select: { points: true } } },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { createdAt: true },
      }),
    ]);
    completedCount = progress.length;
    totalXP = progress.reduce((sum, p) => sum + (p.lesson.points ?? 0), 0);
    if (user?.createdAt) memberSince = user.createdAt;
  } catch {
    // DB not seeded
  }

  const initials = session.user.name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const joinDate = memberSince.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const xpPercent = levelInfo.max ? Math.min((totalXP / levelInfo.max) * 100, 100) : 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10 space-y-6">
      {/* Profile Card */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5"
        style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #1A1A1A, #222218)",
            border: `2px solid ${levelInfo.color}50`,
            color: levelInfo.color,
            boxShadow: `0 0 20px ${levelInfo.color}15`,
          }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-xl font-bold mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
            {session.user.name}
          </h1>
          <p className="text-sm mb-3" style={{ color: "#666660" }}>{session.user.email}</p>

          {/* Role badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{
            backgroundColor: `${levelInfo.color}15`,
            border: `1px solid ${levelInfo.color}30`,
          }}>
            <span className="text-xs font-mono font-bold" style={{ color: levelInfo.color }}>
              {grad ? "毕业" : levelInfo.label}
            </span>
            <span className="text-xs font-medium" style={{ color: levelInfo.color }}>
              {grad ? getRoleLabel(role) : levelInfo.title}
            </span>
          </div>

          <p className="text-xs mt-3" style={{ color: "#444440" }}>
            加入于 {joinDate}
          </p>
        </div>
      </div>

      {/* XP & Level Progress */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">等级进度</h2>
          <span className="text-sm font-mono" style={{ color: "#C9A84C" }}>
            {totalXP} {levelInfo.max ? `/ ${levelInfo.max}` : ""} XP
          </span>
        </div>

        <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#222222" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${xpPercent}%`,
              background: "linear-gradient(to right, #9A7A32, #C9A84C, #F5E6C8)",
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#555550" }}>{levelInfo.label} — {levelInfo.title}</span>
          {levelInfo.max ? (
            <span className="text-xs" style={{ color: "#555550" }}>
              还需 {levelInfo.max - totalXP} XP 升级
            </span>
          ) : (
            <span className="text-xs" style={{ color: "#C9A84C" }}>最高等级 ✓</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "完成课程", value: completedCount, unit: "关", icon: "✓" },
          { label: "累计积分", value: totalXP, unit: "XP", icon: "XP" },
          { label: "学习等级", value: level, unit: "", icon: "◈" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <div className="text-base mb-1">{s.icon}</div>
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {s.label === "学习等级" ? `L${s.value}` : s.value}
              {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "#666660" }}>{s.unit}</span>}
            </div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* About level */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
      >
        <h2 className="text-sm font-semibold mb-2">关于你的等级</h2>
        <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>
          {levelInfo.desc}
        </p>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-base font-semibold mb-4">成就徽章</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = ach.unlocked === true;
            return (
              <div
                key={ach.id}
                className="flex flex-col items-center text-center p-3 rounded-xl"
                title={`${ach.title}: ${ach.desc}`}
                style={{
                  backgroundColor: unlocked ? "#1A1A1A" : "#0F0F0F",
                  border: `1px solid ${unlocked ? "rgba(201,168,76,0.25)" : "#161616"}`,
                  opacity: unlocked ? 1 : 0.4,
                  cursor: "help",
                }}
              >
                <span className="text-2xl mb-1.5">{ach.icon}</span>
                <span className="text-xs font-medium leading-snug" style={{ color: unlocked ? "#F5F5F0" : "#444440" }}>
                  {ach.title}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-center mt-3" style={{ color: "#333330" }}>
          悬停查看成就详情
        </p>
      </div>
    </div>
  );
}
