import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import { ACHIEVEMENTS } from "@/lib/achievements";
import AchievementBadge from "@/components/AchievementBadge";
import NotificationBanner from "@/components/NotificationBanner";
import type { LayerId } from "@/lib/capitalModules";

const MOCK_HEALTH_SCORE = 42;
const MOCK_TOOLS_USED = 3;
const MOCK_TODAY_PROGRESS = 72;

const LAYER_DISPLAY: Record<LayerId, { zh: string; en: string }> = {
  1: { zh: "商业基础层", en: "Business Foundation" },
  2: { zh: "资本成长层", en: "Capital Growth" },
  3: { zh: "资本架构层", en: "Capital Structure" },
};

// SVG health score circle
function HealthCircle({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <svg viewBox="0 0 90 90" width="90" height="90" aria-hidden>
      <circle cx="45" cy="45" r={r} fill="none" stroke="#1A1A1A" strokeWidth="8" />
      <circle
        cx="45" cy="45" r={r}
        fill="none"
        stroke="#C9A84C"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 45 45)"
      />
      <text x="45" y="41" textAnchor="middle" fill="#F5F5F0" fontSize="16" fontWeight="bold" fontFamily="var(--font-mono)">{score}</text>
      <text x="45" y="55" textAnchor="middle" fill="#555550" fontSize="8">/100</text>
    </svg>
  );
}

export default async function CapitalDashboardPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const layers = [1, 2, 3] as const;
  const featuredAchievements = ACHIEVEMENTS.slice(0, 3);

  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh", color: "#F5F5F0" }}>

      {/* Top bar */}
      <div
        className="sticky top-0 z-30"
        style={{ backgroundColor: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1A1A1A", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm transition-colors"
            style={{ color: "#666660" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#A0A09A")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#666660")}
          >
            ← {isEn ? "Back" : "返回"}
          </Link>
          <span style={{ color: "#2A2A2A" }}>·</span>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: "#F5F5F0" }}>
            {isEn ? "Capital Operating System" : "企业资本成长操作系统"}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {CAPITAL_MODULES.length} {isEn ? "Modules" : "模块"}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Welcome */}
        <div className="mb-6">
          <p className="text-xs mb-1" style={{ color: "#666660" }}>
            {isEn ? "Welcome back, Capitalist." : "欢迎回来，资本家。"}
          </p>
          <h1 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {isEn
              ? <><span style={{ color: "#C9A84C" }}>Capital Operating System</span> · 22 Modules</>
              : <><span style={{ color: "#C9A84C" }}>资本操作系统</span> · 22 个模块</>
            }
          </h1>
        </div>

        {/* Notification */}
        <div className="mb-8">
          <NotificationBanner isEn={isEn} />
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT: 22 Tools */}
          <div className="flex-1 min-w-0 space-y-10">
            <p className="text-xs font-semibold" style={{ color: "#A0A09A" }}>
              {isEn ? "Capital Tools" : "资本工具"}
            </p>
            {layers.map((layer) => {
              const meta = LAYER_META[layer];
              const modules = getModulesByLayer(layer);
              const displayName = LAYER_DISPLAY[layer];

              return (
                <div key={layer}>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                    >
                      {isEn ? displayName.en : displayName.zh}
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
                    <span className="text-xs font-mono" style={{ color: "#3A3A3A" }}>
                      {modules.length} {isEn ? "tools" : "工具"}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {modules.map((mod) => {
                      const t = isEn ? mod.en : mod.zh;
                      return (
                        <Link
                          key={mod.id}
                          href={mod.href}
                          className="group block rounded-xl p-4 transition-all duration-200 relative overflow-hidden"
                          style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${meta.color}50`;
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#181818";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E1E1E";
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#141414";
                          }}
                        >
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: meta.color, opacity: 0.4 }} />
                          <div className="text-sm font-semibold mb-1 mt-0.5" style={{ color: "#F5F5F0" }}>{t.name}</div>
                          <p className="text-xs leading-relaxed" style={{ color: "#555550" }}>{t.desc}</p>
                          <div className="mt-2 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: meta.color }}>
                            {isEn ? "Open →" : "使用 →"}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>

          {/* RIGHT: Progress + Stats Sidebar */}
          <div className="lg:w-72 xl:w-80 flex-shrink-0 space-y-4">

            {/* Capital Health Score */}
            <div className="p-5 rounded-2xl flex items-center gap-4" style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}>
              <HealthCircle score={MOCK_HEALTH_SCORE} />
              <div>
                <p className="text-xs mb-1" style={{ color: "#555550" }}>
                  {isEn ? "Capital Health" : "资本健康评分"}
                </p>
                <p className="text-2xl font-bold font-mono" style={{ color: "#C9A84C" }}>{MOCK_HEALTH_SCORE}<span className="text-xs font-normal ml-1" style={{ color: "#444440" }}>/100</span></p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "#555550" }}>
                  {isEn ? "Complete cash flow to reach 60+" : "完善现金流数据，突破 60 分"}
                </p>
              </div>
            </div>

            {/* Tool Usage Stats */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-semibold mb-4" style={{ color: "#A0A09A" }}>
                {isEn ? "Tool Usage" : "工具使用数据"}
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: isEn ? "Tools Used" : "已使用工具",
                    value: `${MOCK_TOOLS_USED} / ${CAPITAL_MODULES.length}`,
                    pct: Math.round((MOCK_TOOLS_USED / CAPITAL_MODULES.length) * 100),
                    color: "#C9A84C",
                  },
                  {
                    label: isEn ? "Foundation Layer" : "商业基础层",
                    value: `${MOCK_TOOLS_USED} / ${getModulesByLayer(1).length}`,
                    pct: Math.round((MOCK_TOOLS_USED / getModulesByLayer(1).length) * 100),
                    color: "#C9A84C",
                  },
                  {
                    label: isEn ? "Growth Layer" : "资本成长层",
                    value: `0 / ${getModulesByLayer(2).length}`,
                    pct: 0,
                    color: "#3B82F6",
                  },
                  {
                    label: isEn ? "Structure Layer" : "资本架构层",
                    value: `0 / ${getModulesByLayer(3).length}`,
                    pct: 0,
                    color: "#8B5CF6",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs" style={{ color: "#555550" }}>{stat.label}</span>
                      <span className="text-xs font-mono" style={{ color: stat.color }}>{stat.value}</span>
                    </div>
                    <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
                      <div className="h-full rounded-full" style={{ width: `${stat.pct}%`, backgroundColor: stat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Progress */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: "#A0A09A" }}>
                  {isEn ? "Today's Progress" : "今日进度"}
                </p>
                <span className="text-sm font-mono font-bold" style={{ color: "#C9A84C" }}>{MOCK_TODAY_PROGRESS}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: "#1A1A1A" }}>
                <div className="h-full rounded-full" style={{ width: `${MOCK_TODAY_PROGRESS}%`, background: "linear-gradient(90deg, #B8943A, #C9A84C)" }} />
              </div>
              <p className="text-xs" style={{ color: "#444440" }}>
                {isEn ? "Capital growth activity score" : "资本成长活跃评分"}
              </p>
            </div>

            {/* Achievements */}
            <div className="p-5 rounded-2xl" style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-semibold mb-4" style={{ color: "#A0A09A" }}>
                {isEn ? "Recent Achievements" : "最新成就"}
              </p>
              <div className="space-y-2">
                {featuredAchievements.map((a) => (
                  <AchievementBadge key={a.id} achievement={a} isEn={isEn} size="sm" />
                ))}
              </div>
            </div>

            {/* AI Insight */}
            <div
              className="px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E", borderLeft: "3px solid rgba(201,168,76,0.5)" }}
            >
              <p className="text-xs font-bold mb-1" style={{ color: "#C9A84C" }}>!</p>
              <p className="text-xs" style={{ color: "#D0D0CA" }}>
                {isEn
                  ? <><strong style={{ color: "#F5F5F0" }}>Capitalist</strong>, complete your cash flow data to push your Capital Health Score above 60.</>
                  : <><strong style={{ color: "#F5F5F0" }}>资本家</strong>，完善现金流数据可将健康评分提升至 60+。</>
                }
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
