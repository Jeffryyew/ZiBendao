export type LayerId = 1 | 2 | 3;

export interface CapitalModule {
  id: string;
  icon: string;
  layer: LayerId;
  href: string;
  zh: { name: string; desc: string };
  en: { name: string; desc: string };
}

export const LAYER_META: Record<LayerId, { zh: string; en: string; color: string; bg: string; border: string }> = {
  1: { zh: "财务规范化", en: "Financial Normalization", color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.2)" },
  2: { zh: "企业资本化", en: "Enterprise Capitalization", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" },
  3: { zh: "融资架构", en: "Fundraising Structure", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
};

export const CAPITAL_MODULES: CapitalModule[] = [
  // Layer 1 — 财务规范化 (T01–T06)
  {
    id: "income-statement", icon: "", layer: 1, href: "/tools/income-statement",
    zh: { name: "T01 利润表", desc: "从产品定价出发，完整核算营收、成本与净利润（PAT）" },
    en: { name: "T01 Income Statement", desc: "Full P&L from product pricing to PAT with margin analysis" },
  },
  {
    id: "balance-sheet", icon: "", layer: 1, href: "/tools/balance-sheet",
    zh: { name: "T02 资产负债表", desc: "资产、负债、权益完整呈现，财务健康比率一键计算" },
    en: { name: "T02 Balance Sheet", desc: "Full balance sheet with financial ratio analysis" },
  },
  {
    id: "cash-flow", icon: "", layer: 1, href: "/tools/cash-flow",
    zh: { name: "T03 现金流规划", desc: "现金流入流出预测，识别资金缺口，优化营运资金管理" },
    en: { name: "T03 Cash Flow Planner", desc: "Forecast cash inflows and outflows, identify funding gaps" },
  },
  {
    id: "pat-kpi", icon: "", layer: 1, href: "/tools/pat-kpi",
    zh: { name: "T04 PAT绩效系统", desc: "完整损益分解，计算PAT、ROE、ROA，追踪KPI目标" },
    en: { name: "T04 PAT & KPI", desc: "Full P&L breakdown, PAT, ROE, ROA and KPI target tracking" },
  },
  {
    id: "valuation", icon: "", layer: 1, href: "/tools/valuation",
    zh: { name: "T05 企业估值系统", desc: "PE、PB、PS多维度估值分析，目标估值与融资路径规划" },
    en: { name: "T05 Valuation Engine", desc: "Multi-method valuation: PE, PB, PS with target and fundraising path" },
  },
  {
    id: "financial-roadmap", icon: "", layer: 1, href: "/tools/financial-roadmap",
    zh: { name: "T06 融资路线图", desc: "模拟融资轮次、股权稀释、估值成长与 IPO 路径" },
    en: { name: "T06 Fundraising Roadmap", desc: "Simulate funding rounds, equity dilution and IPO path" },
  },

  // Layer 2 — 企业资本化 (T07, T08, T10, T12, T13)
  {
    id: "store-expansion", icon: "", layer: 2, href: "/tools/store-expansion",
    zh: { name: "T07 门店扩张系统", desc: "门店扩张资本规划，回本周期与投资回报分析" },
    en: { name: "T07 Store Expansion", desc: "Capital planning for store rollout with payback and ROI analysis" },
  },
  {
    id: "fundraising-plan", icon: "", layer: 2, href: "/tools/fundraising-plan",
    zh: { name: "T08 融资计划", desc: "多轮融资规划（Seed→IPO），稀释瀑布与资金用途拆解" },
    en: { name: "T08 Fundraising Plan", desc: "Multi-round planner Seed→IPO with dilution waterfall and fund use" },
  },
  {
    id: "investor-relations", icon: "", layer: 2, href: "/tools/investor-relations",
    zh: { name: "T10 投资关系管理", desc: "投资人管道漏斗，阶段追踪与目标进度管理" },
    en: { name: "T10 Investor Relations", desc: "Investor pipeline funnel, stage tracker and target progress" },
  },
  {
    id: "financial-forecast", icon: "", layer: 2, href: "/tools/financial-forecast",
    zh: { name: "T12 财务预测", desc: "3年财务预测（Year 1月度 / Year 2-3季度），实际对比预测" },
    en: { name: "T12 Financial Forecast", desc: "3-year forecast with monthly Y1, quarterly Y2-3, actual vs forecast" },
  },
  {
    id: "risk-control", icon: "", layer: 2, href: "/tools/risk-control",
    zh: { name: "T13 风控系统", desc: "财务与融资风险矩阵，Pre-DD准备度评估" },
    en: { name: "T13 Risk Control", desc: "Financial and fundraising risk matrix with Pre-DD readiness checklist" },
  },

  // Layer 3 — 融资架构 (T09, T11)
  {
    id: "equity-structure", icon: "", layer: 3, href: "/tools/equity-structure",
    zh: { name: "T09 股权架构", desc: "股权表构建、稀释分析、退出瀑布与股权分配可视化" },
    en: { name: "T09 Equity Structure", desc: "Cap table builder, dilution analysis and exit waterfall" },
  },
  {
    id: "capital-structure", icon: "", layer: 3, href: "/tools/capital-structure",
    zh: { name: "T11 资本架构", desc: "债务与股权组合优化，计算WACC（CAPM）与DSCR分析" },
    en: { name: "T11 Capital Structure", desc: "Debt-equity mix optimization, WACC (CAPM) and DSCR analysis" },
  },
];

export function getModulesByLayer(layer: LayerId): CapitalModule[] {
  return CAPITAL_MODULES.filter((m) => m.layer === layer);
}
