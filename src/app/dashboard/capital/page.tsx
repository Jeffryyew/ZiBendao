import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import { getXPProgress } from "@/lib/capitalLevels";
import { ACHIEVEMENTS } from "@/lib/achievements";
import AchievementBadge from "@/components/AchievementBadge";
import NotificationBanner from "@/components/NotificationBanner";
import type { LayerId } from "@/lib/capitalModules";

const MOCK_XP = 820;
const MOCK_HEALTH_SCORE = 42;
const MOCK_TODAY_PROGRESS = 72;

const LAYER_DISPLAY: Record<LayerId, { zh: string; en: string }> = {
  1: { zh: "商业基础能力", en: "Business Foundation Skills" },
  2: { zh: "资本成长能力", en: "Capital Growth Skills" },
  3: { zh: "资本架构能力", en: "Capital Architecture Skills" },
};

const LAYER_TIER: Record<LayerId, string | null> = {
  1: null,
  2: "PRO",
  3: "Enterprise",
};

// SVG health score circle
function HealthCircle({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1A1A1A" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke="#C9A84C"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="55" textAnchor="middle" fill="#F5F5F0" fontSize="22" fontWeight="bold" fontFamily="var(--font-mono)">{score}</text>
      <text x="60" y="72" textAnchor="middle" fill="#555550" fontSize="10">/100</text>
    </svg>
  );
}

export default async function CapitalDashboardPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const layers = [1, 2, 3] as const;
  const { current, next, progressPct } = getXPProgress(MOCK_XP);
  const featuredAchievements = ACHIEVEMENTS.slice(0, 4);

  const STAGE_LABELS = [
    { zh: "商业基础能力", en: "Business Foundation Skills" },
    { zh: "资本成长能力", en: "Capital Growth Skills" },
    { zh: "资本架构能力", en: "Capital Architecture Skills" },
  ];

  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh", color: "#F5F5F0" }}>

      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-30"
        style={{ backgroundColor: "rgba(10,10,10,0.95)", borderBottom: "1px solid #1A1A1A", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
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
            {isEn ? "Capital Operating System" : "#企业资本成长操作系统"}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {CAPITAL_MODULES.length} {isEn ? "Modules" : "模块"}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* ── 1. Hero Section ── */}
        <div className="pb-2">
          <p className="text-sm mb-1" style={{ color: "#666660" }}>
            {isEn ? "Welcome back, Capitalist." : "欢迎回来，资本家。"}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
            {isEn
              ? <>You&apos;re advancing toward: <span style={{ color: "#C9A84C" }}>&ldquo;Capital Architect&rdquo;</span></>
              : <>你正在迈向：<span style={{ color: "#C9A84C" }}>「资本架构师」</span></>
            }
          </h1>
          <p className="text-xs mb-3 mt-3" style={{ color: "#555550" }}>
            {isEn ? "Today's Capital Growth Progress" : "今日资本成长进度"} · {MOCK_TODAY_PROGRESS}%
          </p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A", maxWidth: 400 }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${MOCK_TODAY_PROGRESS}%`, background: "linear-gradient(90deg, #B8943A, #C9A84C)" }}
            />
          </div>
        </div>

        {/* ── 2. Notification Banner ── */}
        <NotificationBanner isEn={isEn} />

        {/* ── 3. Level Card + Health Score ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Level Card */}
          <div
            className="p-6 rounded-2xl"
            style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono mb-3"
                  style={{ backgroundColor: `${current.color}15`, color: current.color, border: `1px solid ${current.color}30` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
                  Level {current.level}
                </div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {isEn ? current.en : current.zh}
                </h2>
                <p className="text-xs mt-1" style={{ color: "#666660" }}>
                  {isEn ? current.description_en : current.description_zh}
                </p>
              </div>
              <div
                className="text-3xl font-bold font-mono flex-shrink-0"
                style={{ color: current.color }}
              >
                L{current.level}
              </div>
            </div>

            {/* XP progress to next level */}
            {next && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs" style={{ color: "#555550" }}>
                    {MOCK_XP} XP → {next.minXP} XP
                  </span>
                  <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>{progressPct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%`, backgroundColor: current.color }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: "#444440" }}>
                  {isEn
                    ? `Next unlock: ${next.en} · ${next.minXP - MOCK_XP} XP to go`
                    : `下一阶段解锁：${next.zh} · 还需 ${next.minXP - MOCK_XP} XP`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Capital Health Score */}
          <div
            className="p-6 rounded-2xl flex items-center gap-6"
            style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}
          >
            <HealthCircle score={MOCK_HEALTH_SCORE} />
            <div>
              <p className="text-xs mb-1" style={{ color: "#555550" }}>
                {isEn ? "Capital Health Score" : "资本健康评分"}
              </p>
              <p className="text-3xl font-bold font-mono" style={{ color: "#C9A84C" }}>
                {MOCK_HEALTH_SCORE}
                <span className="text-sm font-normal ml-1" style={{ color: "#444440" }}>/100</span>
              </p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "#666660" }}>
                {isEn
                  ? "Complete your cash flow data to push this above 60."
                  : "完善现金流数据，可突破 60 分。"}
              </p>
              <div
                className="inline-flex items-center gap-1 mt-3 text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: "rgba(251,191,36,0.08)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.15)" }}
              >
                ⚠ {isEn ? "Needs attention" : "需要完善"}
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Stats Row ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              value: "0",
              unit: isEn ? "" : "个",
              label: isEn ? "Capital Skills Mastered" : "已掌握资本技能",
              sub: isEn ? "skills" : "项技能",
            },
            {
              value: isEn ? "Foundation" : "商业基础",
              unit: "",
              label: isEn ? "Current Growth Stage" : "当前能力阶段",
              sub: "",
            },
            {
              value: isEn ? "Valuation" : "企业估值",
              unit: "",
              label: isEn ? "Next Capability" : "下一阶段能力",
              sub: isEn ? "Engine" : "引擎",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl text-center"
              style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
            >
              <div className="text-lg font-bold font-mono" style={{ color: "#C9A84C" }}>
                {s.value}
                {s.sub && <span className="text-xs font-normal ml-1" style={{ color: "#444440" }}>{s.sub}</span>}
              </div>
              <div className="text-xs mt-1.5" style={{ color: "#555550" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── 5. Achievement Strip ── */}
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#A0A09A" }}>
            {isEn ? "Recent Achievements" : "最新成就"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredAchievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} isEn={isEn} size="md" />
            ))}
          </div>
        </div>

        {/* ── 6. AI Insight Panel ── */}
        <div
          className="px-5 py-4 rounded-xl"
          style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E", borderLeft: "3px solid rgba(201,168,76,0.5)" }}
        >
          <div className="flex items-start gap-3">
            <span className="text-base flex-shrink-0 mt-0.5">💡</span>
            <div>
              <p className="text-sm" style={{ color: "#D0D0CA" }}>
                {isEn
                  ? <><strong style={{ color: "#F5F5F0" }}>Capitalist</strong>, your cash flow data is incomplete.</>
                  : <><strong style={{ color: "#F5F5F0" }}>资本家</strong>，你的现金流数据还未完善。</>
                }
              </p>
              <p className="text-xs mt-1" style={{ color: "#666660" }}>
                {isEn
                  ? "Completing it will push your Capital Health Score above 60."
                  : "完善数据后，你的资本健康评分将突破 60+。"}
              </p>
            </div>
          </div>
        </div>

        {/* ── 7. Module Grid ── */}
        <div className="space-y-14">
          {layers.map((layer) => {
            const meta = LAYER_META[layer];
            const modules = getModulesByLayer(layer);
            const displayName = LAYER_DISPLAY[layer];
            const tierBadge = LAYER_TIER[layer];

            return (
              <div key={layer}>
                {/* Layer header */}
                <div className="flex items-center gap-3 mb-6">
                  <span
                    className="text-xs font-mono font-bold px-3 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                  >
                    L{layer}
                  </span>
                  <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {isEn ? displayName.en : displayName.zh}
                  </h2>
                  {tierBadge && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{ backgroundColor: "rgba(168,139,250,0.08)", color: "#A78BFA", border: "1px solid rgba(168,139,250,0.2)" }}
                    >
                      {tierBadge}
                    </span>
                  )}
                  <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "#3A3A3A" }}>
                    {modules.length} {isEn ? "tools" : "模块"}
                  </span>
                </div>

                {/* Module grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {modules.map((mod) => {
                    const t = isEn ? mod.en : mod.zh;
                    const isUnlocked = layer === 1;
                    return (
                      <Link
                        key={mod.id}
                        href={mod.href}
                        className="group block rounded-xl p-5 transition-all duration-200"
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
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-2xl">{mod.icon}</span>
                          {isUnlocked && (
                            <span className="text-xs" style={{ color: "#34D39988" }}>🔓</span>
                          )}
                        </div>
                        <div className="text-sm font-semibold mb-1.5" style={{ color: "#F5F5F0" }}>
                          {t.name}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "#666660" }}>
                          {t.desc}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 8. Progress Timeline ── */}
        <div
          className="p-6 rounded-2xl"
          style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
        >
          <p className="text-xs mb-5 font-semibold" style={{ color: "#A0A09A" }}>
            {isEn ? "Capital Growth Path" : "资本成长路径"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {STAGE_LABELS.map((stage, i) => {
              const isActive = i === 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: isActive ? "rgba(201,168,76,0.08)" : "#141414",
                      border: `1px solid ${isActive ? "rgba(201,168,76,0.25)" : "#1E1E1E"}`,
                    }}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#C9A84C" }} />
                    )}
                    <span
                      className="text-xs font-medium"
                      style={{ color: isActive ? "#C9A84C" : "#444440" }}
                    >
                      {isEn ? stage.en : stage.zh}
                    </span>
                  </div>
                  {i < STAGE_LABELS.length - 1 && (
                    <span className="text-xs" style={{ color: "#2A2A2A" }}>→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: "#2A2A2A" }}>
          {isEn
            ? "All calculations run locally in your browser · Data never uploaded to servers"
            : "所有计算在浏览器本地完成 · 数据不上传服务器"}
        </p>

      </div>
    </div>
  );
}
