import { cookies } from "next/headers";

export type Locale = "zh" | "en";

const dict = {
  zh: {
    nav: {
      courses: "课程",
      tools: "工具",
      about: "关于",
      login: "登录",
      register: "免费注册",
    },
    hero: {
      badge: "企业资本操作系统 · Capital Operating System",
      title_1: "帮企业从经营，进入",
      title_2: "资本时代",
      subtitle: "学习资本策略、企业估值、SPV 架构与融资方法。\n建立投资人信任的企业结构。",
      cta_primary: "Start Capital Journey",
      cta_secondary: "Explore Capital Tools →",
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
      about: "About",
      login: "Login",
      register: "Get Started Free",
    },
    hero: {
      badge: "Capital Operating System",
      title_1: "Transform Businesses Into",
      title_2: "Investable Enterprises",
      subtitle: "Learn capital strategy, valuation, SPV, fundraising & enterprise structuring.\nBuild businesses investors trust.",
      cta_primary: "Start Capital Journey",
      cta_secondary: "Explore Capital Tools →",
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
