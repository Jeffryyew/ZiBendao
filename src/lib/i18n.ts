import { cookies } from "next/headers";

export type Locale = "zh" | "en";

const dict = {
  zh: {
    nav: {
      courses: "课程",
      tools: "工具",
      pricing: "定价",
      about: "关于",
      login: "登录",
      register: "免费注册",
    },
    hero: {
      badge: "金融教育 · 智能工具 · 资本咨询",
      title_1: "掌握资本之道，",
      title_2: "实现财务自由",
      subtitle: "系统化金融课程、智能计算工具、专业资本咨询。\n从入门到精通，一步步建立你的财务知识体系。",
      cta_primary: "立即免费开始",
      cta_secondary: "查看课程体系 →",
    },
    footer: {
      tagline: "专业金融教育与资本咨询平台",
      copyright: "© 2025 资本道 ZiBenDao. 保留所有权利。",
    },
  },
  en: {
    nav: {
      courses: "Courses",
      tools: "Tools",
      pricing: "Pricing",
      about: "About",
      login: "Login",
      register: "Get Started Free",
    },
    hero: {
      badge: "Financial Education · Smart Tools · Capital Advisory",
      title_1: "Master Capital Markets,",
      title_2: "Unlock Your Wealth",
      subtitle: "Systematic financial courses, smart calculation tools, professional advisory.\nFrom beginner to expert — build your financial knowledge step by step.",
      cta_primary: "Start for Free",
      cta_secondary: "View Courses →",
    },
    footer: {
      tagline: "Professional Financial Education & Capital Advisory Platform",
      copyright: "© 2025 ZiBenDao Capital. All rights reserved.",
    },
  },
};

export type Dict = typeof dict.zh;

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get("locale")?.value as Locale) ?? "zh";
}

export async function getT(): Promise<Dict> {
  const locale = await getLocale();
  return dict[locale];
}
