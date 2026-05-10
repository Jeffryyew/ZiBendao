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
      dashboard: "进入平台",
    },
    hero: {
      badge: "企业资本操作系统 · Capital Operating System",
      title_1: "帮企业从经营，进入",
      title_2: "资本时代",
      subtitle: "学习资本策略、企业估值、SPV 架构与融资方法。\n建立投资人信任的企业结构。",
      cta_primary: "开启资本之旅",
      cta_secondary: "探索资本工具 →",
    },
    courses: {
      badge: "3 阶段线下课程 + 1 线上课程",
      title_1: "企业资本运作",
      title_2: "完整知识体系",
      desc: "由 Jeffry Yew（姚国雄）主导设计，融合 25 年商业发展与 13 年融资专业经验，系统教授马来西亚中小企业主掌握资本运作的完整路径。",
      cta_start: "立即开始 →",
      outcomes_title: "学完之后，你将能够：",
      outcomes: [
        "掌握企业估值核心方法，知道自己公司值多少钱",
        "设计合理股权架构，避免稀释与纠纷风险",
        "制定融资策略，与投资人建立有效沟通框架",
        "规划清晰资本退出路径，从并购到 IPO 逐步推进",
      ],
      section_online: "线上课程 · Online",
      section_offline: "线下课程 · Offline Programmes",
      enroll: "立即报名 →",
      free_trial: "免费体验",
      hrdf_title: "HRDF Claimable",
      hrdf_desc: "部分线下课程支持 HRDF（人力资源发展基金）报销，马来西亚企业主可凭此减轻培训成本。详情请联系",
      hrdf_email: "info@capitalmastery.net",
      hrdf_suffix: "查询资格条件。",
      cta_title: "从这里开始你的资本之旅",
      cta_desc: "线上课程随时免费体验，线下课程立即报名锁定席位。",
      cta_enroll: "立即报名 →",
      cta_trial: "免费体验线上课程",
      tag_offline: "线下课程",
      tag_online: "线上课程",
    },
    tools: {
      badge: "Capital Apps Ecosystem",
      title: "专业资本工具",
      desc: "4 款 SaaS 级专业工具，涵盖财富规划、企业估值、利润分析。结果支持导出 PDF / Excel，数据本地计算。",
      enroll: "注册即可使用 →",
      cta_title: "立即解锁全部工具",
      cta_desc: "注册即可开始使用，企业顾问工具可联系我们开通专属权限。",
      cta_register: "免费注册 →",
      cta_contact: "联系顾问",
      level: "级别",
    },
    about: {
      badge: "关于我们",
      title: "帮企业主",
      title_2: "掌握资本之道",
      desc: "资本道（Capital Mastery）由姚国雄（Jeffry Yew）创立，致力于将复杂的资本运作知识系统化，帮助中小企业主从经营者成为资本家。",
      founder_title: "创始人 & 首席导师",
      values_title: "我们的核心价值",
      programs_title: "课程体系",
      testimonials_title: "学员心声",
      cta_title: "准备开始你的资本之旅？",
      cta_desc: "免费注册体验课程内容，或联系我们了解企业定制顾问服务。",
      cta_register: "免费注册 →",
      cta_contact: "联系我们",
    },
    footer: {
      tagline: "掌握资本之道，创建可靠、可投、可扩展企业",
      copyright: "© 2025 资本道 ZiBenDao. 保留所有权利。",
      platform: "平台",
      address_title: "地址",
    },
  },
  en: {
    nav: {
      courses: "Courses",
      tools: "Tools",
      about: "About",
      login: "Login",
      register: "Get Started Free",
      dashboard: "Enter Platform",
    },
    hero: {
      badge: "Capital Operating System",
      title_1: "Transform Businesses Into",
      title_2: "Investable Enterprises",
      subtitle: "Learn capital strategy, valuation, SPV, fundraising & enterprise structuring.\nBuild businesses investors trust.",
      cta_primary: "Start Capital Journey",
      cta_secondary: "Explore Capital Tools →",
    },
    courses: {
      badge: "3 Offline Programmes + 1 Online Course",
      title_1: "Enterprise Capital",
      title_2: "Complete Knowledge System",
      desc: "Designed by Jeffry Yew with 25 years of business development and 13 years of fundraising expertise, systematically teaching Malaysian SME owners to master capital operations.",
      cta_start: "Get Started →",
      outcomes_title: "After completing, you will be able to:",
      outcomes: [
        "Master core enterprise valuation methods and know your company's worth",
        "Design sound equity structures to avoid dilution and disputes",
        "Formulate fundraising strategies and build effective investor communication",
        "Plan clear capital exit paths, from M&A to IPO step by step",
      ],
      section_online: "Online Course",
      section_offline: "Offline Programmes",
      enroll: "Enrol Now →",
      free_trial: "Free Trial",
      hrdf_title: "HRDF Claimable",
      hrdf_desc: "Selected offline programmes are eligible for HRDF (Human Resources Development Fund) reimbursement, helping Malaysian business owners reduce training costs. Contact us at",
      hrdf_email: "info@capitalmastery.net",
      hrdf_suffix: "for eligibility details.",
      cta_title: "Begin Your Capital Journey Here",
      cta_desc: "Try the online course anytime for free. Enrol in offline programmes to secure your seat.",
      cta_enroll: "Enrol Now →",
      cta_trial: "Free Trial — Online Course",
      tag_offline: "Offline",
      tag_online: "Online",
    },
    tools: {
      badge: "Capital Apps Ecosystem",
      title: "Professional Capital Tools",
      desc: "4 SaaS-grade professional tools covering wealth planning, enterprise valuation, and profit analysis. Export results as PDF / Excel with local data processing.",
      enroll: "Register to Use →",
      cta_title: "Unlock All Tools Now",
      cta_desc: "Register to start using them. Contact us to activate enterprise advisory tools.",
      cta_register: "Register Free →",
      cta_contact: "Contact Advisor",
      level: "Level",
    },
    about: {
      badge: "About Us",
      title: "Empowering Business Owners",
      title_2: "To Master Capital",
      desc: "Capital Mastery was founded by Jeffry Yew to systematise complex capital operation knowledge, helping SME owners transform from operators to capital strategists.",
      founder_title: "Founder & Chief Instructor",
      values_title: "Our Core Values",
      programs_title: "Programme Overview",
      testimonials_title: "Student Testimonials",
      cta_title: "Ready to Start Your Capital Journey?",
      cta_desc: "Register free to explore course content, or contact us for bespoke enterprise advisory services.",
      cta_register: "Register Free →",
      cta_contact: "Contact Us",
    },
    footer: {
      tagline: "Master Capital Strategy. Build Reliable, Investable, Scalable Enterprises.",
      copyright: "© 2025 ZiBenDao Capital. All rights reserved.",
      platform: "Platform",
      address_title: "Address",
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
