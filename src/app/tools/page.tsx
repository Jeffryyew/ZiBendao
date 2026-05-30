import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import { getLocale } from "@/lib/i18n";
import { auth } from "@/lib/auth";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import type { LayerId } from "@/lib/capitalModules";

const LAYERS: {
  id: LayerId;
  zh: {
    name: string;
    subtitle: string;
    desc: string;
    abilities: string[];
  };
  en: {
    name: string;
    subtitle: string;
    desc: string;
    abilities: string[];
  };
}[] = [
  {
    id: 1,
    zh: {
      name: "商业基础层",
      subtitle: "Business Foundation",
      desc: "为企业建立扎实的财务语言基础。从损益表、现金流到估值，每一个工具都帮助你看清企业真实状况，做出有据可依的经营决策。",
      abilities: [
        "建立完整的企业财务视图",
        "计算企业合理估值区间",
        "规划现金流与保本点",
        "生成专业财务报告",
      ],
    },
    en: {
      name: "Business Foundation",
      subtitle: "Layer 1 · 10 Tools",
      desc: "Build a solid financial language for your business. From P&L to cash flow and valuation — every tool helps you see your business clearly and make evidence-based decisions.",
      abilities: [
        "Build a complete financial view of your business",
        "Calculate fair enterprise valuation ranges",
        "Plan cash flow and breakeven points",
        "Generate professional financial reports",
      ],
    },
  },
  {
    id: 2,
    zh: {
      name: "资本成长层",
      subtitle: "Capital Growth",
      desc: "系统化推进企业融资准备。从资本路线图、尽职调查到投资人管理，帮助企业在正确的时间，以正确的方式接触资本市场。",
      abilities: [
        "规划从天使轮到上市的资本路径",
        "完成投资人看重的尽职调查准备",
        "建立数据室与投资人沟通系统",
        "追踪融资进度与投资人关系",
      ],
    },
    en: {
      name: "Capital Growth",
      subtitle: "Layer 2 · 8 Tools",
      desc: "Systematically prepare your business for fundraising. From capital roadmap to due diligence and investor management — approach the capital market at the right time, the right way.",
      abilities: [
        "Plan your capital journey from angel round to listing",
        "Complete due diligence preparation investors expect",
        "Build a data room and investor communication system",
        "Track fundraising progress and investor relationships",
      ],
    },
  },
  {
    id: 3,
    zh: {
      name: "资本架构层",
      subtitle: "Capital Structure",
      desc: "构建可持续的企业资本结构。从 SPV 设计、股权架构到风控体系，帮助企业建立机构级别的资本治理能力，具备被投资的完整条件。",
      abilities: [
        "设计 SPV 与股权架构方案",
        "优化债务与股权资本组合",
        "建立企业风险控制体系",
        "管理投资组合与 IRR 分析",
      ],
    },
    en: {
      name: "Capital Structure",
      subtitle: "Layer 3 · 6 Tools",
      desc: "Build a sustainable capital structure. From SPV design and equity structure to risk control — establish institutional-grade capital governance and become truly investable.",
      abilities: [
        "Design SPV and equity structure arrangements",
        "Optimise your debt-equity capital mix",
        "Build an enterprise risk control framework",
        "Manage portfolio and IRR analysis",
      ],
    },
  },
];

const OUTCOMES = {
  zh: [
    { text: "用财务数据说话，而不是凭感觉经营企业" },
    { text: "看懂投资人的逻辑，知道他们在评估什么" },
    { text: "随时具备融资条件，不在需要资金时才准备" },
    { text: "建立可持续的资本架构，支撑企业长期增长" },
  ],
  en: [
    { text: "Operate with data, not gut feel — speak the language of capital" },
    { text: "Understand investor logic and know exactly what they evaluate" },
    { text: "Stay fundraising-ready at any time, not only when you need capital" },
    { text: "Build a sustainable capital structure to support long-term growth" },
  ],
};

export default async function ToolsPage() {
  const locale = await getLocale();
  const session = await auth();
  const isEn = locale === "en";
  const outcomes = isEn ? OUTCOMES.en : OUTCOMES.zh;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F4EF", color: "#1C1814" }}>
      <SharedNav locale={locale} activeHref="/tools" isLoggedIn={!!session?.user} />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
          >
            {isEn
              ? `${CAPITAL_MODULES.length} Professional Tools · 3 Layers`
              : `${CAPITAL_MODULES.length} 个专业工具 · 3 大能力层`}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {isEn ? "Capital Tools" : "资本工具系统"}
            <br />
            <span style={{ color: "#8B6514" }}>
              {isEn ? "Your Business Operating Arsenal" : "企业资本化的操作武器库"}
            </span>
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-2xl mx-auto" style={{ color: "#68625C" }}>
            {isEn
              ? "From financial statements to SPV structure — 22 professional tools that cover every stage of enterprise capitalisation."
              : "从财务报表到 SPV 架构，22 个专业工具覆盖企业资本化的每一个关键环节。"}
          </p>
          <Link
            href={session?.user ? "/dashboard/capital" : "/login"}
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            {isEn ? "Start Using →" : "立即使用 →"}
          </Link>
        </div>
      </section>

      {/* Outcomes */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
            <div className="sm:col-span-2 mb-2">
              <h2 className="font-bold text-sm" style={{ color: "#8B6514" }}>
                {isEn ? "With these tools, you will be able to:" : "使用这套工具，你将能够："}
              </h2>
            </div>
            {outcomes.map((o) => (
              <div key={o.text} className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }}>✓</span>
                <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Layers */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1" style={{ backgroundColor: "#E0D9CE" }} />
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)" }}>
              {isEn ? "3 Capability Layers" : "3 大能力层"}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E0D9CE" }} />
          </div>

          <div className="space-y-5">
            {LAYERS.map((layer) => {
              const meta = LAYER_META[layer.id];
              const modules = getModulesByLayer(layer.id);
              const l = isEn ? layer.en : layer.zh;

              return (
                <div
                  key={layer.id}
                  className="rounded-2xl p-7 relative overflow-hidden"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${meta.color}80, transparent)` }} />

                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                    >
                      {l.name}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F7F4EF", color: "#9A9490", border: "1px solid #E0D9CE" }}>
                      {modules.length} {isEn ? "tools" : "个工具"}
                    </span>
                  </div>

                  <div className="text-xs mb-1" style={{ color: "#9A9490" }}>{l.subtitle}</div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#1C1814" }}>{l.name}</h3>
                  <p className="text-sm mb-5 leading-relaxed" style={{ color: "#68625C" }}>{l.desc}</p>

                  {/* Abilities */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-6">
                    {l.abilities.map((ability) => (
                      <div key={ability} className="flex items-start gap-2 text-xs" style={{ color: "#68625C" }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: meta.color }}>✓</span>
                        {ability}
                      </div>
                    ))}
                  </div>

                  {/* Tool pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {modules.map((mod) => (
                      <Link
                        key={mod.id}
                        href={`/tools/guide#${mod.id}`}
                        className="text-xs px-3 py-1 rounded-full transition-colors"
                        style={{ backgroundColor: `${meta.color}10`, color: meta.color, border: `1px solid ${meta.color}25` }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${meta.color}20`; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${meta.color}10`; }}
                      >
                        {isEn ? mod.en.name : mod.zh.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ backgroundColor: "#1C1814" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#F0EBE1" }}>
            {isEn ? "Ready to Build Capital-Ready Business?" : "准备好建立具备资本能力的企业了吗？"}
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#9A9490" }}>
            {isEn
              ? "22 tools. Start with the foundation layer and build up."
              : "22 个工具，从商业基础层开始，逐步建立完整资本能力。"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={session?.user ? "/dashboard/capital" : "/login"}
              className="inline-block px-10 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
            >
              {isEn ? "Open Tool System →" : "进入资本工具系统 →"}
            </Link>
            <Link
              href="/courses"
              className="inline-block px-10 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "transparent", color: "#9A9490", border: "1px solid #302B26" }}
            >
              {isEn ? "View Courses →" : "查看课程 →"}
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #E0D9CE", backgroundColor: "#F7F4EF" }}>
        <p className="text-xs" style={{ color: "#C0B8B0" }}>
          {isEn ? "© 2026 Eutopos Equity Sdn Bhd. All Rights Reserved." : "© 2026 Eutopos Equity Sdn Bhd. 保留所有权利。"}
        </p>
      </footer>
    </div>
  );
}
