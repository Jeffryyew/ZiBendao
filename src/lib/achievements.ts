export type Achievement = {
  id: string;
  zh: string;
  en: string;
  icon: string;
  unlockedBy: string;
  tier: "bronze" | "silver" | "gold";
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "cashflow-master", zh: "已掌握现金流管理", en: "Cash Flow Mastered", icon: "", unlockedBy: "cash-flow", tier: "bronze" },
  { id: "valuation-unlocked", zh: "已解锁企业估值", en: "Valuation Unlocked", icon: "", unlockedBy: "valuation-engine", tier: "bronze" },
  { id: "roadmap-complete", zh: "完成融资路线图", en: "Fundraising Roadmap Complete", icon: "", unlockedBy: "capital-roadmap", tier: "silver" },
  { id: "spv-builder", zh: "建立第一个SPV", en: "First SPV Built", icon: "", unlockedBy: "spv-structure", tier: "gold" },
  { id: "equity-architect", zh: "完成投资架构设计", en: "Investment Architecture Complete", icon: "", unlockedBy: "equity-structure", tier: "gold" },
  { id: "dd-ready", zh: "尽职调查就绪", en: "Due Diligence Ready", icon: "", unlockedBy: "due-diligence", tier: "silver" },
  { id: "data-room", zh: "数据室已建立", en: "Data Room Established", icon: "", unlockedBy: "data-room", tier: "silver" },
  { id: "risk-controller", zh: "风控系统激活", en: "Risk Control Active", icon: "", unlockedBy: "risk-control", tier: "gold" },
  { id: "portfolio-manager", zh: "投资组合已建立", en: "Portfolio Established", icon: "", unlockedBy: "portfolio-management", tier: "gold" },
  { id: "income-statement", zh: "财务报表完整", en: "Financial Statement Complete", icon: "", unlockedBy: "income-statement", tier: "bronze" },
  { id: "balance-sheet", zh: "资产负债表就绪", en: "Balance Sheet Ready", icon: "", unlockedBy: "balance-sheet", tier: "bronze" },
  { id: "breakeven", zh: "损益平衡点已知", en: "Break-even Point Known", icon: "", unlockedBy: "breakeven-analysis", tier: "bronze" },
];
