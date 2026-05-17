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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)", color: "#1C1