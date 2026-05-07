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
      badge: "企业资本化平台 · Capital Transformation Platform",
      title_1: "帮企业从经营，",
      title_2: "进入资本时代",
      subtitle: "学习融资、SPV、企业估值、股权架构与资本策略。\n帮助企业成为可被投资的商业体。",
      cta_primary: "开始资本之旅",
      cta_secondary: "企业咨询 →",
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
      badge: "Capital Transformation Platform",
      title_1: "Transform Businesses",
      title_2: "Into Investable Enterprises",
      subtitle: "Learn fundraising, SPV, enterprise valuation, equity structure & capital strategy.\nHelp your business become investable.",
      cta_primary: "Start Your Journey",
      cta_secondary: "Corporate Advisory →",
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
