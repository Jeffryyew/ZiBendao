import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import BackNav from "@/components/BackNav";
import { getLocale } from "@/lib/i18n";

const TOOLS = [
  {
    slug: "financial-roadmap",
    icon: "🗺",
    level: "L1+",
    accent: "#4CAF82",
    zh: {
      name: "Capital Roadmap",
      nameZh: "资本路线图",
      desc: "系统化规划财务目标，用复利公式预测未来财富增长轨迹。",
      features: ["FV 复利计算", "目标反推月存款", "增长曲线图表", "CSV 导出"],
    },
    en: {
      name: "Capital Roadmap",
      nameZh: "Financial Goal Planner",
      desc: "Systematically plan financial goals using compound interest formulas to project future wealth growth trajectories.",
      features: ["FV Compound Calculation", "Reverse Goal Savings", "Growth Curve Chart", "CSV Export"],
    },
  },
  {
    slug: "pricing-system",
    icon: "💰",
    level: "L1+",
    accent: "#6B8FD4",
    zh: {
      name: "Smart Quotation",
      nameZh: "智能报价系统",
      desc: "快速生成专业报价单，动态项目管理，支持折扣和税务计算。",
      features: ["动态行项目", "折扣 / 税务", "报价单预览", "打印 PDF"],
    },
    en: {
      name: "Smart Quotation",
      nameZh: "Professional Quoting",
      desc: "Quickly generate professional quotations with dynamic line item management, discount and tax calculations.",
      features: ["Dynamic Line Items", "Discount & Tax", "Quote Preview", "Print PDF"],
    },
  },
  {
    slug: "market-cap",
    icon: "📊",
    level: "L2+",
    accent: "#C9A84C",
    zh: {
      name: "Valuation Engine",
      nameZh: "企业估值引擎",
      desc: "多维度企业估值分析：PE、PB、PS 与行业均值对比，识别价值高低。",
      features: ["PE / PB / PS 计算", "行业均值对比", "估值评级", "Bar Chart"],
    },
    en: {
      name: "Valuation Engine",
      nameZh: "Enterprise Valuation",
      desc: "Multi-dimensional enterprise valuation analysis: PE, PB, PS vs industry averages to identify over/undervaluation.",
      features: ["PE / PB / PS Calc", "Industry Benchmarks", "Valuation Rating", "Bar Chart"],
    },
  },
  {
    slug: "pat-kpi",
    icon: "📈",
    level: "L3+",
    accent: "#A084D4",
    zh: {
      name: "KPI Intelligence",
      nameZh: "KPI 智能分析",
      desc: "完整损益表分解，计算税后净利润 PAT、ROE、ROA，目标达成追踪。",
      features: ["损益表分解", "PAT 计算", "ROE / ROA", "KPI 目标追踪"],
    },
    en: {
      name: "KPI Intelligence",
      nameZh: "Profit & KPI Tracker",
      desc: "Full P&L breakdown, calculate PAT (profit after tax), ROE, ROA and track KPI target achievement.",
      features: ["P&L Breakdown", "PAT Calculation", "ROE / ROA", "KPI Target Tracking"],
    },
  },
];

export default async function ToolsPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0", minHeight: "100vh" }}>
      <SharedNav locale={locale} activeHref="/tools" />

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <div className="mb-8 flex justify-center">
          <BackNav />
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333333", color: "#C9A84C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
            Capital Apps Ecosystem
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {isEn ? "Professional Capital Tools" : "专业资本工具"}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#A0A09A" }}>
            {isEn
              ? "4 SaaS-grade professional tools covering wealth planning, enterprise valuation, and profit analysis. Export results as PDF / Excel with local data processing."
              : "4 款 SaaS 级专业工具，涵盖财富规划、企业估值、利润分析。结果支持导出 PDF / Excel，数据本地计算。"}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {TOOLS.map((tool) => {
            const t = isEn ? tool.en : tool.zh;
            return (
              <div
                key={tool.slug}
                className="rounded-2xl p-7 flex flex-col relative overflow-hidden"
                style={{ backgroundColor: "#0C0C0C", border: "1px solid #1A1A1A" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${tool.accent}60, transparent)` }} />

                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: `${tool.accent}12`, border: `1px solid ${tool.accent}25` }}>
                      {tool.icon}
                    </div>
                    <div>
                      <div className="font-bold text-base" style={{ color: "#E8E8E4" }}>{t.name}</div>
                      <div className="text-xs" style={{ color: "#555550" }}>{t.nameZh}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0" style={{ backgroundColor: `${tool.accent}12`, color: tool.accent, border: `1px solid ${tool.accent}25` }}>
                    {tool.level}
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "#888880" }}>{t.desc}</p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-6">
                  {t.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "#555550" }}>
                      <span style={{ color: tool.accent }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="block text-center py-2.5 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#141414", color: "#888880", border: "1px solid #242424" }}
                >
                  {isEn ? "Register to Use →" : "注册即可使用 →"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center p-10 rounded-3xl" style={{ background: "linear-gradient(135deg, #0E0E0C, #161610)", border: "1px solid rgba(201,168,76,0.2)" }}>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            {isEn ? "Unlock All Tools Now" : "立即解锁全部工具"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "#A0A09A" }}>
            {isEn
              ? "Register to start using them. Contact us to activate enterprise advisory tools."
              : "注册即可开始使用，企业顾问工具可联系我们开通专属权限。"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-block px-8 py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
              {isEn ? "Register Free →" : "免费注册 →"}
            </Link>
            <Link href="/about" className="inline-block px-8 py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#141414", color: "#888880", border: "1px solid #242424" }}>
              {isEn ? "Contact Advisor" : "联系顾问"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
