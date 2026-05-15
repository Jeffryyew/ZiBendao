import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const FREE_LESSONS = [
  { id: 1, title: "什么是财务自由？", type: "视频", duration: "8 分钟", icon: "" },
  { id: 2, title: "资产与负债的秘密", type: "阅读", duration: "5 分钟", icon: "≡" },
  { id: 3, title: "现金流管理技巧", type: "测验", duration: "10 分钟", icon: "" },
];

const LOCKED_TOOLS = [
  { name: "金融路线图方程式", icon: "FV", desc: "复利增长路径规划" },
  { name: "产品服务报价系统", icon: "QT", desc: "专业报价单生成" },
  { name: "市值/市盈率计算器", icon: "PE", desc: "PE/PB/PS 估值分析" },
  { name: "PAT & KPI 计算器", icon: "KPI", desc: "税后利润与指标追踪" },
];

export default async function MemberDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  let completedCount = 0;
  let totalXP = 0;
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      include: { lesson: { select: { points: true } } },
    });
    completedCount = progress.length;
    totalXP = progress.reduce((s, p) => s + (p.lesson.points ?? 0), 0);
  } catch { /* DB not seeded */ }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-7">

      {/*  Header  */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm mb-1" style={{ color: "#666660" }}>{greeting}，</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {firstName}
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: "rgba(102,102,96,0.15)", border: "1px solid #2A2A28", color: "#888880" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#666660" }} />
          学员
        </div>
      </div>

      {/*  Stats row  */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "体验课程", value: "3", unit: "关可学", icon: "" },
          { label: "已完成", value: String(completedCount), unit: "关", icon: "" },
          { label: "累计积分", value: String(totalXP), unit: "XP", icon: "" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {s.value}
              <span className="text-xs font-normal ml-0.5" style={{ color: "#555550" }}>{s.unit}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/*  Upgrade Banner  */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, #141410 0%, #1A1A14 100%)",
          border: "1px solid rgba(201,168,76,0.3)",
          boxShadow: "0 0 40px rgba(201,168,76,0.06)",
        }}
      >
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(circle at 90% 50%, rgba(201,168,76,0.07) 0%, transparent 60%)" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
                升级解锁
              </span>
            </div>
            <h2 className="text-base font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              完整课程 · 专业工具 · 成就系统
            </h2>
            <p className="text-sm" style={{ color: "#666660" }}>
              你目前可体验前 3 关免费内容。升级后解锁全部课程与 4 个专业工具。
            </p>
          </div>
          <Link
            href="/courses"
            className="relative flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
          >
            了解课程 →
          </Link>
        </div>
      </div>

      {/*  Free Lessons  */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-wide" style={{ color: "#A0A09A" }}>
            免费体验课程
          </h2>
          <Link href="/member/learn" className="text-xs transition-colors" style={{ color: "#C9A84C" }}>
            全部课程 →
          </Link>
        </div>

        <div className="space-y-2">
          {FREE_LESSONS.map((lesson, i) => {
            const done = i < completedCount;
            return (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{
                  backgroundColor: done ? "rgba(76,175,130,0.04)" : "#111111",
                  border: `1px solid ${done ? "rgba(76,175,130,0.15)" : "#1A1A1A"}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    backgroundColor: done ? "rgba(76,175,130,0.12)" : "#1A1A1A",
                    color: done ? "#4CAF82" : "#C9A84C",
                  }}
                >
                  {done ? "" : String(i + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: done ? "#888880" : "#F5F5F0" }}>
                    {lesson.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: "#444440" }}>{lesson.icon} {lesson.type}</span>
                    <span className="text-xs" style={{ color: "#333330" }}>·</span>
                    <span className="text-xs" style={{ color: "#444440" }}>{lesson.duration}</span>
                  </div>
                </div>
                <Link
                  href="/member/learn"
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={done
                    ? { color: "#555550", backgroundColor: "#1A1A1A", border: "1px solid #222222" }
                    : { color: "#C9A84C", backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)" }
                  }
                >
                  {done ? "复习" : "开始"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/*  Locked Tools  */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-wide" style={{ color: "#A0A09A" }}>
            专业工具 <span className="ml-1 text-xs" style={{ color: "#333330" }}>升级后解锁</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {LOCKED_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ backgroundColor: "#0D0D0D", border: "1px solid #161616", opacity: 0.55 }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: "#141414" }}
              >
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "#666660" }}>{tool.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#333330" }}>{tool.desc}</div>
              </div>
              <span className="text-xs" style={{ color: "#2A2A28" }}>锁定</span>
            </div>
          ))}
        </div>
      </div>

      {/*  Bottom CTA  */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
      >
        <p className="text-sm mb-4" style={{ color: "#666660" }}>
          准备好开始你的资本成长之旅了吗？
        </p>
        <Link
          href="/courses"
          className="inline-block px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
        >
          立即升级
        </Link>
      </div>
    </div>
  );
}
