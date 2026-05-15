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
  1: { zh: "资本基础", en: "Capital Foundations", color: "#C9A84C", bg: "rgba(201,168,76,0.08)", border: "rgba(201,168,76,0.2)" },
  2: { zh: "资本智慧", en: "Capital Intelligence", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" },
  3: { zh: "资本架构", en: "Capital Structure", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
};

export const CAPITAL_MODULES: CapitalModule[] = [
  // Layer 1 — Capital Foundations (8 modules)
  {
    id: "financial-roadmap", icon: "", layer: 1, href: "/tools/financial-roadmap",
    zh: { name: "企业财务路线图", desc: "用复利公式规划财务目标，预测未来财富增长轨迹" },
    en: { name: "Financial Roadmap", desc: "Plan financial goals and project wealth growth using compound interest formulas" },
  },
  {
    id: "pricing-system", icon: "", layer: 1, href: "/tools/pricing-system",
    zh: { name: "智能报价系统", desc: "快速生成专业报价单，动态项目管理，支持折扣和税务计算" },
    en: { name: "Pricing System", desc: "Generate professional quotations with dynamic line items, discounts and tax" },
  },
  {
    id: "market-cap", icon: "", layer: 1, href: "/tools/market-cap",
    zh: { name: "企业估值系统", desc: "PE、PB、PS多维度估值分析，与行业均值对比识别价值" },
    en: { name: "Valuation Engine", desc: "Multi-dimensional PE, PB, PS valuation analysis vs industry benchmarks" },
  },
  {
    id: "pat-kpi", icon: "", layer: 1, href: "/tools/pat-kpi",
    zh: { name: "绩效分析系统", desc: "完整损益表分解，计算PAT、ROE、ROA，KPI目标追踪" },
    en: { name: "Performance Intelligence", desc: "Full P&L breakdown, calculate PAT, ROE, ROA and track KPI targets" },
  },
  {
    id: "cash-flow", icon: "", layer: 1, href: "/tools/cash-flow",
    zh: { name: "现金流规划", desc: "现金流入流出预测，识别资金缺口，优化营运资金管理" },
    en: { name: "Cash Flow Planner", desc: "Forecast cash inflows and outflows, identify funding gaps and optimize working capital" },
  },
  {
    id: "balance-sheet", icon: "", layer: 1, href: "/tools/balance-sheet",
    zh: { name: "资产负债表", desc: "资产、负债、权益完整呈现，财务比率计算" },
    en: { name: "Balance Sheet", desc: "Full balance sheet with financial ratio analysis" },
  },
  {
    id: "income-statement", icon: "", layer: 1, href: "/tools/income-statement",
    zh: { name: "利润表", desc: "完整损益表，毛利率、净利率分析" },
    en: { name: "Income Statement", desc: "Full P&L statement with margin analysis" },
  },
  {
    id: "breakeven-analysis", icon: "", layer: 1, href: "/tools/breakeven-analysis",
    zh: { name: "损益平衡分析", desc: "计算保本点销量、收入与贡献毛益" },
    en: { name: "Breakeven Analysis", desc: "Calculate breakeven units, revenue and contribution margin" },
  },

  // Layer 2 — Capital Intelligence (8 modules)
  {
    id: "due-diligence", icon: "", layer: 2, href: "/tools/due-diligence",
    zh: { name: "尽职调查", desc: "系统化投资前调查框架，全面评估目标企业各维度风险" },
    en: { name: "Due Diligence", desc: "Systematic pre-investment investigation framework for comprehensive target assessment" },
  },
  {
    id: "data-room", icon: "", layer: 2, href: "/tools/data-room",
    zh: { name: "数据室管理", desc: "数字化文件组织与分类，结构化呈现投资人关键文件" },
    en: { name: "Data Room", desc: "Digital document organization and categorization for structured investor file presentation" },
  },
  {
    id: "sales-forecast", icon: "", layer: 2, href: "/tools/sales-forecast",
    zh: { name: "销售预测系统", desc: "12个月收入预测，增长率分析与图表" },
    en: { name: "Sales Forecast", desc: "12-month revenue projection with growth analysis" },
  },
  {
    id: "startup-expense", icon: "", layer: 2, href: "/tools/startup-expense",
    zh: { name: "创业费用规划", desc: "计算创业启动成本、月燃烧率与资金跑道" },
    en: { name: "Startup Expense Planner", desc: "Calculate startup costs, monthly burn rate and runway" },
  },
  {
    id: "deal-flow", icon: "", layer: 2, href: "/tools/deal-flow",
    zh: { name: "交易流", desc: "追踪和管理多个投资机会的完整流程" },
    en: { name: "Deal Flow", desc: "Track and manage investment opportunities across your pipeline" },
  },
  {
    id: "capital-roadmap", icon: "", layer: 2, href: "/tools/capital-roadmap",
    zh: { name: "资本路线图", desc: "规划企业从天使前到上市准备的完整资本旅程" },
    en: { name: "Capital Roadmap", desc: "Navigate your company's capital journey from Pre-Seed to IPO-Ready" },
  },
  {
    id: "fundraising-system", icon: "", layer: 2, href: "/tools/fundraising-system",
    zh: { name: "融资系统", desc: "计算融资条款，追踪投资人管道进展" },
    en: { name: "Fundraising System", desc: "Calculate raise terms and track your investor pipeline" },
  },
  {
    id: "investor-relations", icon: "", layer: 2, href: "/tools/investor-relations",
    zh: { name: "投资关系", desc: "撰写投资人月报，追踪KPI，管理投资人名册" },
    en: { name: "Investor Relations", desc: "Build investor updates, track KPIs and manage your investor registry" },
  },

  // Layer 3 — Capital Structure (6 modules)
  {
    id: "spv-structure", icon: "", layer: 3, href: "/tools/spv-structure",
    zh: { name: "SPV架构", desc: "特殊目的载体架构设计，计算投资人回报与文件清单" },
    en: { name: "SPV Structure", desc: "Special purpose vehicle design with investor return calculation and document checklist" },
  },
  {
    id: "equity-structure", icon: "", layer: 3, href: "/tools/equity-structure",
    zh: { name: "股权架构", desc: "股权表构建、稀释分析、退出瀑布与股权分配可视化" },
    en: { name: "Equity Structure", desc: "Cap table builder, dilution analysis, exit waterfall and equity distribution visualization" },
  },
  {
    id: "capital-structure", icon: "", layer: 3, href: "/tools/capital-structure",
    zh: { name: "资本架构", desc: "债务与股权资本组合优化，计算WACC与税盾效益" },
    en: { name: "Capital Structure", desc: "Optimize debt-equity capital mix, calculate WACC and tax shield benefits" },
  },
  {
    id: "investment-committee", icon: "", layer: 3, href: "/tools/investment-committee",
    zh: { name: "投资委员会", desc: "IC备忘录构建器、评分矩阵与投资决策治理框架" },
    en: { name: "Investment Committee", desc: "IC memo builder, scoring matrix and investment decision governance framework" },
  },
  {
    id: "risk-control", icon: "", layer: 3, href: "/tools/risk-control",
    zh: { name: "风控系统", desc: "企业风险登记册、5×5风险矩阵与热力图分析" },
    en: { name: "Risk Control", desc: "Enterprise risk register, 5x5 risk matrix and category heat map analysis" },
  },
  {
    id: "portfolio-management", icon: "", layer: 3, href: "/tools/portfolio-management",
    zh: { name: "投资组合", desc: "多投资组合追踪器，计算MOIC、IRR与行业分布分析" },
    en: { name: "Portfolio Management", desc: "Multi-investment portfolio tracker with MOIC, IRR and industry distribution analysis" },
  },
];

export function getModulesByLayer(layer: LayerId): CapitalModule[] {
  return CAPITAL_MODULES.filter((m) => m.layer === layer);
}
