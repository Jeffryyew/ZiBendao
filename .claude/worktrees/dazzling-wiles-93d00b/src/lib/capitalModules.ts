export interface CapitalModule {
  id: string;
  slug: string;
  href: string | null;
  icon: string;
  layer: 1 | 2;
  levelRequired: number;
  zh: { name: string; desc: string };
  en: { name: string; desc: string };
}

export const LAYER1_MODULES: CapitalModule[] = [
  {
    id: "financial-roadmap",
    slug: "financial-roadmap",
    href: "/tools/financial-roadmap",
    icon: "🗺",
    layer: 1,
    levelRequired: 1,
    zh: { name: "金融路线图方程式", desc: "复利增长路径规划" },
    en: { name: "Financial Roadmap", desc: "Compound growth path planning" },
  },
  {
    id: "pricing-system",
    slug: "pricing-system",
    href: "/tools/pricing-system",
    icon: "💰",
    layer: 1,
    levelRequired: 2,
    zh: { name: "产品服务报价系统", desc: "专业报价单生成" },
    en: { name: "Pricing System", desc: "Professional quotation generator" },
  },
  {
    id: "market-cap",
    slug: "market-cap",
    href: "/tools/market-cap",
    icon: "📊",
    layer: 1,
    levelRequired: 2,
    zh: { name: "市值/市盈率计算器", desc: "PE/PB/PS 估值分析" },
    en: { name: "Market Cap Calculator", desc: "PE/PB/PS valuation analysis" },
  },
  {
    id: "pat-kpi",
    slug: "pat-kpi",
    href: "/tools/pat-kpi",
    icon: "📈",
    layer: 1,
    levelRequired: 3,
    zh: { name: "PAT & KPI 计算器", desc: "税后利润与指标追踪" },
    en: { name: "PAT & KPI Calculator", desc: "After-tax profit & KPI tracking" },
  },
];

export const LAYER2_MODULES: CapitalModule[] = [
  {
    id: "capital-roadmap",
    slug: "capital-roadmap",
    href: "/tools/capital-roadmap",
    icon: "🗺️",
    layer: 2,
    levelRequired: 1,
    zh: { name: "资本路线图", desc: "企业资本旅程阶段规划" },
    en: { name: "Capital Roadmap", desc: "Company capital journey stage planning" },
  },
  {
    id: "fundraising-system",
    slug: "fundraising-system",
    href: "/tools/fundraising-system",
    icon: "💼",
    layer: 2,
    levelRequired: 1,
    zh: { name: "融资系统", desc: "融资计算器与投资人管道追踪" },
    en: { name: "Fundraising System", desc: "Fundraising calculator & investor pipeline" },
  },
  {
    id: "investor-relations",
    slug: "investor-relations",
    href: "/tools/investor-relations",
    icon: "🤝",
    layer: 2,
    levelRequired: 1,
    zh: { name: "投资关系", desc: "投资人沟通与汇报工具" },
    en: { name: "Investor Relations", desc: "Investor communication & reporting" },
  },
  {
    id: "due-diligence",
    slug: "due-diligence",
    href: "/tools/due-diligence",
    icon: "🔍",
    layer: 2,
    levelRequired: 1,
    zh: { name: "尽职调查", desc: "DD 清单与准备度评分" },
    en: { name: "Due Diligence", desc: "DD checklist & readiness scorer" },
  },
  {
    id: "deal-flow",
    slug: "deal-flow",
    href: "/tools/deal-flow",
    icon: "🔀",
    layer: 2,
    levelRequired: 1,
    zh: { name: "交易流", desc: "投资机会跟踪与管理" },
    en: { name: "Deal Flow", desc: "Investment opportunity tracking" },
  },
  {
    id: "data-room",
    slug: "data-room",
    href: "/tools/data-room",
    icon: "🗂️",
    layer: 2,
    levelRequired: 1,
    zh: { name: "数据室", desc: "投资人就绪数据室组织系统" },
    en: { name: "Data Room", desc: "Investor-ready data room organizer" },
  },
];

export const ALL_MODULES = [...LAYER1_MODULES, ...LAYER2_MODULES];
