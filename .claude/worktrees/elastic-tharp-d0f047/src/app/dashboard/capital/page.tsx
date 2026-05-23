import { auth } from "../../../../auth";
import { getLocale } from "@/lib/i18n";
import SharedNav from "@/components/SharedNav";
import Link from "next/link";
import { capitalLayers, type CapitalModule } from "@/lib/capitalModules";
import type { Tier } from "@/lib/featureFlags";

const SCORE = 42;
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "PRO") {
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wide flex-shrink-0"
        style={{
          color: "#3B82F6",
          backgroundColor: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
        }}
      >
        PRO
      </span>
    );
  }
  if (tier === "ENTERPRISE") {
    return (
      <span
        className="text-[10px] px-1.5 py-0.5 rounded font-mono tracking-wide flex-shrink-0"
        style={{
          color: "#8B5CF6",
          backgroundColor: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        Ent
      </span>
    );
  }
  return null;
}

function ModuleCard({
  mod,
  isEn,
  layerColor,
}: {
  mod: CapitalModule;
  isEn: boolean;
  layerColor: string;
}) {
  const title = isEn ? mod.enName : mod.zhName;
  const subtitle = isEn ? mod.zhName : mod.enName;
  const available = mod.href !== null;

  const inner = (
    <div
      className={`relative flex flex-col gap-2 p-4 rounded-xl transition-all duration-200 h-full ${
        available
          ? "hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(201,168,76,0.12)]"
          : "opacity-50 cursor-not-allowed"
      }`}
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: "120px",
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-2xl leading-none">{mod.icon}</span>
        <TierBadge tier={mod.tier} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium leading-snug" style={{ color: "#F5F5F0" }}>
          {title}
        </p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.35)" }}>
          {subtitle}
        </p>
      </div>
      {available ? (
        <span className="text-sm self-end" style={{ color: layerColor, opacity: 0.7 }}>
          →
        </span>
      ) : (
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
          Coming Soon
        </span>
      )}
    </div>
  );

  if (mod.href !== null) {
    return (
      <Link href={mod.href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

const STAGES = [
  { zh: "商业基础", en: "Business Foundation", active: true,  color: "#C9A84C" },
  { zh: "资本成长", en: "Capital Growth",       active: false, color: "#3B82F6" },
  { zh: "资本架构", en: "Capital Structure",    active: false, color: "#8B5CF6" },
] as const;

export default async function CapitalDashboardPage() {
  const [locale, session] = await Promise.all([getLocale(), auth()]);
  const isEn = locale === "en";
  const isLoggedIn = !!session?.user;

  const dash = (SCORE / 100) * CIRCUMFERENCE;

  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh", color: "#F5F5F0" }}>
      <SharedNav locale={locale} activeHref="/dashboard/capital" isLoggedIn={isLoggedIn} />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16 space-y-8">

        {/* ── Hero row ── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
            >
              {isEn ? "Capital Operating System" : "资本运营系统"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              {isEn ? "资本运营系统" : "Capital Operating System"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-3 py-1.5 rounded-full font-mono"
              style={{
                backgroundColor: "rgba(201,168,76,0.1)",
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {isEn ? "Business Foundation" : "商业基础"}
            </span>
            <span
              className="text-xs px-3 py-1.5 rounded-full font-mono"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              FREE
            </span>
          </div>
        </div>

        {/* ── Health Score + Stats ── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Health Score card */}
          <div
            className="flex flex-col items-center justify-center gap-6 p-8 rounded-2xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="relative w-48 h-48">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="100" cy="100" r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                />
                <circle
                  cx="100" cy="100" r={RADIUS}
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-5xl font-bold"
                  style={{ color: "#C9A84C", fontVariantNumeric: "tabular-nums" }}
                >
                  {SCORE}
                </span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>/ 100</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "#F5F5F0" }}>资本健康评分</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Capital Health Score
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="flex flex-col gap-4">
            {(
              [
                {
                  icon: "🏗️",
                  label: isEn ? "Current Stage" : "当前阶段",
                  value: isEn ? "Business Foundation" : "商业基础",
                  valueColor: "#C9A84C",
                },
                {
                  icon: "📦",
                  label: isEn ? "Modules Completed" : "完成模块",
                  value: "0 / 22",
                  valueColor: "#F5F5F0",
                },
                {
                  icon: "🎯",
                  label: isEn ? "Next Milestone" : "下一里程碑",
                  value: isEn ? "Business Valuation Engine" : "企业估值引擎",
                  valueColor: "#F5F5F0",
                },
              ] as const
            ).map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-2xl flex-shrink-0">{stat.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {stat.label}
                  </p>
                  <p
                    className="text-sm font-semibold mt-0.5 truncate"
                    style={{ color: stat.valueColor }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Progress timeline ── */}
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.35)" }}>
            {isEn ? "Capital Journey Progress" : "资本成长进度"}
          </p>
          <div className="flex items-start gap-0">
            {STAGES.map((stage, i) => (
              <div key={stage.zh} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1 gap-2">
                  <div
                    className="w-full h-1.5 rounded-full"
                    style={{
                      backgroundColor: stage.active ? stage.color : "rgba(255,255,255,0.08)",
                    }}
                  />
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: stage.active ? stage.color : "rgba(255,255,255,0.15)",
                      }}
                    />
                    <p
                      className="text-xs font-medium"
                      style={{
                        color: stage.active ? stage.color : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {isEn ? stage.en : stage.zh}
                    </p>
                  </div>
                </div>
                {i < STAGES.length - 1 && (
                  <span
                    className="text-xs mx-3 mt-0"
                    style={{ color: "rgba(255,255,255,0.15)", lineHeight: "6px" }}
                  >
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Insight ── */}
        <div
          className="flex gap-4 p-5 rounded-xl"
          style={{
            backgroundColor: "rgba(201,168,76,0.05)",
            border: "1px solid rgba(201,168,76,0.15)",
            borderLeft: "3px solid #C9A84C",
          }}
        >
          <span className="text-xl flex-shrink-0">💡</span>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#C9A84C" }}>
              AI Insight
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
              {isEn
                ? "Complete your cash flow data to push Capital Health Score above 60"
                : "完善你的现金流数据，提升资本健康评分至 60+"}
            </p>
          </div>
        </div>

        {/* ── Module Grid ── */}
        <div className="space-y-10">
          {capitalLayers.map((layer) => (
            <section key={layer.id}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-1 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "#F5F5F0" }}>
                    {isEn ? layer.enName : layer.zhName}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {isEn ? layer.zhName : layer.enName} · {layer.modules.length}{" "}
                    {isEn ? "modules" : "个模块"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {layer.modules.map((mod) => (
                  <ModuleCard
                    key={mod.slug}
                    mod={mod}
                    isEn={isEn}
                    layerColor={layer.color}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
