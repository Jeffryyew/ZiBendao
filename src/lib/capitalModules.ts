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
    id: "financial-ratios", icon: "", layer: 1, href: "/tools/financial-ratios",
    zh: { name: "财务比率分析", desc: "全面计算流动性、盈利性、杠杆与效率比率" },
    en: { name: "Financial Ratios", desc: "Calculate liquidity, profitability, leverage and efficiency ratios" },
  },
  {
    id: "pl-builder", icon: "", layer: 1, href: "/tools/pl-builder",
    zh: { name: "损益表构建", desc: "专业损益表模板，自动计算各层级利润与利润率" },
    en: { name: "P&L Builder", desc: "Professional P&L template with automatic profit and margin calculations" },
  },
  {
    id: "working-capital", icon: "", layer: 1, href: "/tools/working-capital",
    zh: { name: "营运资金管理", desc: "分析应收应付账款和存货周转，优化资金使用效率" },
    en: { name: "Working Capital", desc: "Analyze receivables, payables and inventory turnover to optimize capital efficiency" },
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
    id: "dcf-valuation", icon: "", layer: 2, href: "/tools/dcf-valuation",
    zh: { name: "DCF估值模型", desc: "现金流折现估值，计算企业内在价值与安全边际" },
    en: { name: "DCF Valuation", desc: "Discounted cash flow valuation to calculate intrinsic value and margin of safety" },
  },
  {
    id: "business-model", icon: "", layer: 2, href: "/tools/business-model",
    zh: { name: "商业模式画布", desc: "系统梳理价值主张、客户细分、收入来源与成本结构" },
    en: { name: "Business Model Canvas", desc: "Map value propositions, customer segments, revenue streams and cost structure" },
  },
  {
    id: "competitive-analysis", icon: "", layer: 2, href: "/tools/competitive-analysis",
    zh: { name: "竞争格局分析", desc: "多维度竞争对手对比，识别差异化优势与市场定位" },
    en: { name: "Competitive Analysis", desc: "Multi-dimensional competitor comparison to identify differentiation and positioning" },
  },
  {
    id: "financial-projection", icon: "", layer: 2, href: "/tools/financial-projection",
    zh: { name: "财务预测", desc: "3至5年财务预测模型，多情景假设与敏感性分析" },
    en: { name: "Financial Projection", desc: "3-5 year financial projection model with scenario assumptions and sensitivity analysis" },
  },
  {
    id: "fundraising-navigator", icon: "", layer: 2, href: "/tools/fundraising-navigator",
    zh: { name: "融资导航", desc: "融资阶段规划、投资人策略与估值谈判框架" },
    en: { name: "Fundraising Navigator", desc: "Fundraising stage planning, investor strategy and valuation negotiation framework" },
  },
  {
    id: "investor-briefing", icon: "", layer: 2, href: "/tools/investor-briefing",
    zh: { name: "投资人简报", desc: "专业投资简报生成器，系统呈现融资亮点与关键数据" },
    en: { name: "Investor Briefing", desc: "Professional investor briefing generator to present fundraising highlights systematically" },
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
