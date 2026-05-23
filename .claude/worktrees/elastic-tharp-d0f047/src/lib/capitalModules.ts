import type { Tier } from "@/lib/featureFlags";

export interface CapitalModule {
  slug: string;
  zhName: string;
  enName: string;
  icon: string;
  tier: Tier;
  href: string | null;
}

export interface CapitalLayer {
  id: number;
  zhName: string;
  enName: string;
  color: string;
  modules: CapitalModule[];
}

export const capitalLayers: CapitalLayer[] = [
  {
    id: 1,
    zhName: "商业基础",
    enName: "Business Foundation",
    color: "#C9A84C",
    modules: [
      { slug: "financial-roadmap",   zhName: "资本路线图",  enName: "Financial Roadmap",   icon: "💰", tier: "FREE", href: "/tools/financial-roadmap" },
      { slug: "smart-quotation",     zhName: "智能报价",    enName: "Smart Quotation",     icon: "📋", tier: "FREE", href: "/tools/pricing-system"   },
      { slug: "business-performance",zhName: "业绩分析",    enName: "Business Performance",icon: "📊", tier: "FREE", href: "/tools/pat-kpi"           },
      { slug: "valuation-engine",    zhName: "企业估值",    enName: "Business Valuation",  icon: "🏢", tier: "FREE", href: "/tools/market-cap"        },
      { slug: "startup-expense",     zhName: "创业费用",    enName: "Startup Expense",     icon: "💸", tier: "FREE", href: null },
      { slug: "sales-forecast",      zhName: "销售预测",    enName: "Sales Forecast",      icon: "📈", tier: "FREE", href: null },
      { slug: "cash-flow",           zhName: "现金流",      enName: "Cash Flow",           icon: "🔄", tier: "FREE", href: null },
      { slug: "income-statement",    zhName: "利润表",      enName: "Income Statement",    icon: "📑", tier: "FREE", href: null },
      { slug: "breakeven-analysis",  zhName: "损益平衡",    enName: "Breakeven Analysis",  icon: "⚖️", tier: "FREE", href: null },
      { slug: "balance-sheet",       zhName: "资产负债表",  enName: "Balance Sheet",       icon: "🏦", tier: "FREE", href: null },
    ],
  },
  {
    id: 2,
    zhName: "资本成长",
    enName: "Capital Growth",
    color: "#3B82F6",
    modules: [
      { slug: "capital-roadmap",     zhName: "资本路线图",  enName: "Capital Roadmap",      icon: "🗺️", tier: "PRO", href: null },
      { slug: "fundraising-system",  zhName: "融资系统",    enName: "Fundraising System",   icon: "💼", tier: "PRO", href: null },
      { slug: "investor-relations",  zhName: "投资关系",    enName: "Investor Relations",   icon: "🤝", tier: "PRO", href: null },
      { slug: "due-diligence",       zhName: "尽职调查",    enName: "Due Diligence",        icon: "🔍", tier: "PRO", href: null },
      { slug: "deal-flow",           zhName: "交易流",      enName: "Deal Flow",            icon: "🔀", tier: "PRO", href: null },
      { slug: "data-room",           zhName: "数据室",      enName: "Data Room",            icon: "🗂️", tier: "PRO", href: null },
    ],
  },
  {
    id: 3,
    zhName: "资本架构",
    enName: "Capital Structure",
    color: "#8B5CF6",
    modules: [
      { slug: "spv-structure",          zhName: "SPV架构",   enName: "SPV Structure",          icon: "🏗️", tier: "ENTERPRISE", href: null },
      { slug: "equity-structure",       zhName: "股权架构",  enName: "Equity Structure",        icon: "🔺", tier: "ENTERPRISE", href: null },
      { slug: "capital-structure",      zhName: "资本架构",  enName: "Capital Structure",       icon: "🏛️", tier: "ENTERPRISE", href: null },
      { slug: "investment-committee",   zhName: "投资委员会",enName: "Investment Committee",    icon: "👥", tier: "ENTERPRISE", href: null },
      { slug: "risk-control",           zhName: "风控系统",  enName: "Risk Control",            icon: "🛡️", tier: "ENTERPRISE", href: null },
      { slug: "portfolio-management",   zhName: "投资组合",  enName: "Portfolio Management",    icon: "📂", tier: "ENTERPRISE", href: null },
    ],
  },
];
