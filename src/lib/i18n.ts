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
      subtitle: "系统化资本运作课程、专业计算工具、一对一顾问咨询。\n帮你建立可靠、可投、可扩展的企业。",
      cta_primary: "立即免费开始",
      cta_secondary: "查看课程体系 →",
    },
    footer: {
      tagline: "掌握资本之道，创建可靠、可投、可扩展企业",
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
      tagline: "Master Capital Strategy. Build Reliable, Investable, Scalable Enterprises.",
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
