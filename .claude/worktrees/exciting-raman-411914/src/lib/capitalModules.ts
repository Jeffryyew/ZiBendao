export interface CapitalModule {
  id: string;
  icon: string;
  zhName: string;
  enName: string;
  desc: { zh: string; en: string };
  href: string | null;
  layer: 1 | 2 | 3;
  levelRequired: number;
}

export const capitalModules: CapitalModule[] = [
  // ── Layer 1: Business Foundation ──────────────────────────────────────────
  {
    id: "financial-roadmap",
    icon: "🗺",
    zhName: "金融路线图方程式",
    enName: "Financial Roadmap",
    desc: {
      zh: "规划财务目标，预测未来财富增长轨迹",
      en: "Plan financial goals and project future wealth growth",
    },
    href: "/tools/financial-roadmap",
    layer: 1,
    levelRequired: 1,
  },
  {
    id: "pricing-system",
    icon: "💰",
    zhName: "产品服务报价系统",
    enName: "Smart Quotation System",
    desc: {
      zh: "快速生成专业报价单，动态项目管理",
      en: "Generate professional quotations with dynamic line items",
    },
    href: "/tools/pricing-system",
    layer: 1,
    levelRequired: 2,
  },
  {
    id: "market-cap",
    icon: "📊",
    zhName: "企业估值系统",
    enName: "Valuation Engine",
    desc: {
      zh: "多维度企业估值分析：PE、PB、PS",
      en: "Multi-dimensional valuation: PE, PB, PS analysis",
    },
    href: "/tools/market-cap",
    layer: 1,
    levelRequired: 2,
  },
  {
    id: "pat-kpi",
    icon: "📈",
    zhName: "企业绩效系统",
    enName: "Performance Intelligence",
    desc: {
      zh: "完整损益表分解，PAT/ROE/ROA 计算",
      en: "Full P&L breakdown with PAT, ROE, ROA calculation",
    },
    href: "/tools/pat-kpi",
    layer: 1,
    levelRequired: 2,
  },
  {
    id: "startup-expense",
    icon: "🧾",
    zhName: "创业费用规划",
    enName: "Startup Expense Planner",
    desc: {
      zh: "计算创业启动成本、月燃烧率与资金跑道",
      en: "Calculate startup costs, monthly burn rate & runway",
    },
    href: "/tools/startup-expense",
    layer: 1,
    levelRequired: 1,
  },
  {
    id: "sales-forecast",
    icon: "📉",
    zhName: "销售预测系统",
    enName: "Sales Forecast",
    desc: {
      zh: "12个月收入预测，增长率分析与图表",
      en: "12-month revenue projection with growth analysis",
    },
    href: "/tools/sales-forecast",
    layer: 1,
    levelRequired: 1,
  },
  {
    id: "cash-flow",
    icon: "💸",
    zhName: "现金流分析",
    enName: "Cash Flow Analysis",
    desc: {
      zh: "12个月现金流预测，余额追踪",
      en: "12-month cash flow projection and balance tracking",
    },
    href: "/tools/cash-flow",
    layer: 1,
    levelRequired: 1,
  },
  {
    id: "income-statement",
    icon: "📋",
    zhName: "利润表",
    enName: "Income Statement",
    desc: {
      zh: "完整损益表，毛利率、净利率分析",
      en: "Full P&L statement with margin analysis",
    },
    href: "/tools/income-statement",
    layer: 1,
    levelRequired: 1,
  },
  {
    id: "breakeven-analysis",
    icon: "⚖️",
    zhName: "损益平衡分析",
    enName: "Breakeven Analysis",
    desc: {
      zh: "计算保本点销量、收入与贡献毛益",
      en: "Calculate breakeven units, revenue & contribution margin",
    },
    href: "/tools/breakeven-analysis",
    layer: 1,
    levelRequired: 1,
  },
  {
    id: "balance-sheet",
    icon: "🏦",
    zhName: "资产负债表",
    enName: "Balance Sheet",
    desc: {
      zh: "资产、负债、权益完整呈现，财务比率计算",
      en: "Full balance sheet with financial ratio analysis",
    },
    href: "/tools/balance-sheet",
    layer: 1,
    levelRequired: 1,
  },
];

export function getModuleById(id: string): CapitalModule | undefined {
  return capitalModules.find((m) => m.id === id);
}
