export type CapitalLevel = {
  level: number;
  zh: string;
  en: string;
  minXP: number;
  color: string;
  description_zh: string;
  description_en: string;
};

export const CAPITAL_LEVELS: CapitalLevel[] = [
  { level: 1, zh: "资本新手", en: "Capital Beginner", minXP: 0, color: "#9CA3AF", description_zh: "开始你的资本之旅", description_en: "Beginning your capital journey" },
  { level: 2, zh: "资本学徒", en: "Capital Apprentice", minXP: 100, color: "#60A5FA", description_zh: "掌握商业基础", description_en: "Mastering business fundamentals" },
  { level: 3, zh: "资本构建者", en: "Capital Builder", minXP: 300, color: "#34D399", description_zh: "构建资本结构", description_en: "Building capital structure" },
  { level: 4, zh: "资本操盘手", en: "Capital Operator", minXP: 600, color: "#FBBF24", description_zh: "运作企业资本", description_en: "Operating business capital" },
  { level: 5, zh: "资本架构师", en: "Capital Architect", minXP: 1000, color: "#C9A84C", description_zh: "设计资本架构", description_en: "Architecting capital structure" },
  { level: 6, zh: "资本投资人", en: "Capital Investor", minXP: 1500, color: "#F97316", description_zh: "主动资本运作", description_en: "Active capital operations" },
  { level: 7, zh: "机构资本家", en: "Institutional Capitalist", minXP: 2500, color: "#A78BFA", description_zh: "机构级资本运营", description_en: "Institutional capital mastery" },
];

export function getLevelByXP(xp: number): CapitalLevel {
  let current = CAPITAL_LEVELS[0];
  for (const lvl of CAPITAL_LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
    else break;
  }
  return current;
}

export function getNextLevel(currentLevel: number): CapitalLevel | null {
  return CAPITAL_LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
}

export function getXPProgress(xp: number): {
  current: CapitalLevel;
  next: CapitalLevel | null;
  progressPct: number;
} {
  const current = getLevelByXP(xp);
  const next = getNextLevel(current.level);
  if (!next) return { current, next: null, progressPct: 100 };
  const progressPct = Math.round(((xp - current.minXP) / (next.minXP - current.minXP)) * 100);
  return { current, next, progressPct };
}
