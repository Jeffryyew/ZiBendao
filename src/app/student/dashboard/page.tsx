import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getRoleLabel } from "@/lib/roles";

const TOOLS = [
  { label: "企业财务路线图", href: "/tools/financial-roadmap" },
  { label: "智能报价系统", href: "/tools/pricing-system" },
  { label: "企业估值系统", href: "/tools/market-cap" },
  { label: "绩效分析系统", href: "/tools/pat-kpi" },
  { label: "现金流规划", href: "/tools/cash-flow" },
  { label: "资产负债表", href: "/tools/balance-sheet" },
  { label: "利润表", href: "/tools/income-statement" },
  { label: "损益平衡分析", href: "/tools/breakeven-analysis" },
  { label: "尽职调查", href: "/tools/due-diligence" },
  { label: "数据室管理", href: "/tools/data-room" },
  { label: "销售预测系统", href: "/tools/sales-forecast" },
  { label: "创业费用规划", href: "/tools/startup-expense" },
  { label: "交易流", href: "/tools/deal-flow" },
  { label: "资本路线图", href: "/tools/capital-roadmap" },
  { label: "融资系统", href: "/tools/fundraising-system" },
  { label: "投资关系", href: "/tools/investor-relations" },
  { label: "SPV架构", href: "/tools/spv-structure" },
  { label: "股权架构", href: "/tools/equity-structure" },
  { label: "资本架构", href: "/tools/capital-structure" },
  { label: "投资委员会", href: "/tools/investment-committee" },
  { label: "风控系统", href: "/tools/risk-control" },
  { label: "投资组合", href: "/tools/portfolio-management" },
];

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const firstName = session.user.name.split(" ")[0];

  let completedCount = 0;
  let totalXP = 0;
  let modules: { id: string; title: string; lessons: { id: string; points: number | null }[] }[] = [];
  let completedIds = new Set<string>();

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
    completedCount = progress.length;
    totalXP = progress.reduce((sum, p) => sum + (p.lesson.points ?? 0), 0);
    completedIds = new Set(progress.map((p) => p.lessonId));
    modules = moduleData;
  } catch {
    // DB might not be seeded yet
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-sm mb-0.5" style={{ color: "var(--color-text-muted)" }}>欢迎回来，</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {firstName}
          </h1>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-medium self-start sm:self-auto"
          style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
        >
          {getRoleLabel(role)}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已完成课程", value: completedCount.toString(), unit: "关" },
          { label: "累计积分", value: totalXP.toString(), unit: "XP" },
          { label: "可用工具", value: TOOLS.length.toString(), unit: "个" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {stat.value}
              <span className="text-xs font-normal ml-0.5" style={{ color: "var(--color-text-muted)" }}>{stat.unit}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Learning Status */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>学习状况</h2>
          <div className="flex items-center gap-2.5">
            <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0D9CE" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${overallPct}%`, background: "linear-gradient(to right, #9A7A32, #C9A84C)" }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: "var(--color-text-secondary)" }}>
              {completedCount}/{totalLessons} 关 · {overallPct}%
            </span>
          </div>
        </div>

        {modules.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px dashed #E0D9CE" }}
          >
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>课程准备中，敬请期待</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {modules.map((mod) => {
              const done = mod.lessons.filter((l) => completedIds.has(l.id)).length;
              const total = mod.lessons.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={mod.id}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                      {mod.title}
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0D9CE" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: pct === 100 ? "#C9A84C" : undefined,
                          background: pct < 100 && pct > 0 ? "linear-gradient(to right, #9A7A32, #C9A84C)" : undefined,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="text-xs font-mono flex-shrink-0 w-14 text-right"
                    style={{ color: pct === 100 ? "#C9A84C" : "var(--color-text-muted)" }}
                  >
                    {done}/{total}
                  </div>
                  <Link
                    href="/student/learn"
                    className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 transition-colors"
                    style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
                  >
                    继续
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>资本工具</h2>
          <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>{TOOLS.length} 个工具</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#68625C" }}
            >
              <span className="flex-1 leading-snug">{tool.label}</span>
              <span className="flex-shrink-0 text-xs" style={{ color: "#C9A84C" }}>→</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
