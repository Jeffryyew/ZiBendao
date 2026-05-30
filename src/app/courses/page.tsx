import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import { getLocale } from "@/lib/i18n";
import { auth } from "@/lib/auth";

const ONLINE_COURSE = {
  zh: {
    name: "资本启航",
    nameEn: "Capital Start",
    subtitle: "Start Your Capital Journey",
    subtitleZh: "开启你的资本之旅",
    desc: "专为忙碌创业者与企业主设计的线上入门课程。随时随地学习资本思维基础，零门槛开启资本成长之旅。",
    abilities: [
      "建立正确的资本认知与思维框架",
      "了解企业估值与融资的核心概念",
      "掌握资本化的第一步行动方向",
    ],
    badgeLabel: "免费体验可用",
    tag: "线上课程",
    stage: "线上",
  },
  en: {
    name: "Capital Start",
    nameEn: "Online Programme",
    subtitle: "Start Your Capital Journey",
    subtitleZh: "开启你的资本之旅",
    desc: "An online entry-level programme designed for busy entrepreneurs and business owners. Learn capital thinking fundamentals anytime, anywhere — zero barriers to begin your capital journey.",
    abilities: [
      "Build the right capital mindset and thinking framework",
      "Understand core concepts of enterprise valuation and fundraising",
      "Know the first steps toward capitalising your business",
    ],
    badgeLabel: "Free Trial Available",
    tag: "Online Course",
    stage: "Online",
  },
};

const OFFLINE_COURSES = [
  {
    id: 1,
    slug: "capital-map",
    price: "RM 2,800",
    duration: { zh: "2 天线下课程", en: "2-Day Offline Programme" },
    zh: {
      name: "资本通",
      nameEn: "The Capital Map",
      stage: "阶段一",
      tag: "线下课程",
      desc: "建立资本思维框架，认识企业从经营到资本化的核心逻辑。",
      abilities: [
        "区分经营思维与资本思维",
        "判断企业是否具备资本化条件",
        "理解资本运作的常见误区",
      ],
    },
    en: {
      name: "The Capital Map",
      nameEn: "Stage 1 · Offline",
      stage: "Stage 1",
      tag: "Offline",
      desc: "Build a capital thinking framework and understand the core logic of transforming a business from operations to capitalisation.",
      abilities: [
        "Distinguish between operational and capital thinking",
        "Assess whether your business is ready for capitalisation",
        "Understand common misconceptions about capital operations",
      ],
    },
    accent: "#2D7D4F",
    accentLight: "#EDFAF3",
  },
  {
    id: 2,
    slug: "capital-code",
    price: "RM 7,800",
    duration: { zh: "3 天线下课程", en: "3-Day Offline Programme" },
    zh: {
      name: "启动资本",
      nameEn: "The Capital Code",
      stage: "阶段二",
      tag: "线下课程",
      desc: "系统启动企业资本化进程，完成融资前梳理、包装与投资人对接。",
      abilities: [
        "完成融资前企业包装与财务梳理",
        "掌握投资人沟通框架与路演技巧",
        "设计股权结构与早期融资策略",
      ],
    },
    en: {
      name: "The Capital Code",
      nameEn: "Stage 2 · Offline",
      stage: "Stage 2",
      tag: "Offline",
      desc: "Systematically initiate your business capitalisation process — complete pre-fundraising preparation, packaging, and investor engagement.",
      abilities: [
        "Complete pre-fundraising business packaging and financial review",
        "Master investor communication frameworks and pitch techniques",
        "Design equity structures and early-stage fundraising strategies",
      ],
    },
    accent: "#2D5FA8",
    accentLight: "#EDF2FC",
  },
  {
    id: 3,
    slug: "capital-dao",
    price: "RM 38,000",
    duration: { zh: "5 天线下课程", en: "5-Day Offline Programme" },
    zh: {
      name: "资本道",
      nameEn: "Capital Dao",
      stage: "阶段三",
      tag: "线下课程",
      desc: "完整企业资本运作高阶系统，从估值提升到 IPO 路径全覆盖。",
      abilities: [
        "运用估值方法论提升企业估值",
        "设计 PE 股权架构与 ESOP 方案",
        "规划资本杠杆与 IPO 路径",
        "建立资本机制公司结构",
      ],
    },
    en: {
      name: "Capital Dao",
      nameEn: "Stage 3 · Offline",
      stage: "Stage 3",
      tag: "Offline",
      desc: "A comprehensive advanced capital operations system covering valuation enhancement through to full IPO pathway planning.",
      abilities: [
        "Apply valuation methodologies to increase enterprise value",
        "Design PE equity structures and ESOP arrangements",
        "Plan capital leverage strategies and IPO pathways",
        "Establish a capital-mechanism corporate structure",
      ],
    },
    accent: "#8B6514",
    accentLight: "#FBF4E4",
  },
];

const OUTCOMES = {
  zh: [
    { icon: "", text: "掌握企业估值核心方法，知道自己公司值多少钱" },
    { icon: "", text: "设计合理股权架构，避免稀释与纠纷风险" },
    { icon: "", text: "制定融资策略，与投资人建立有效沟通框架" },
    { icon: "", text: "规划清晰资本退出机制，从并购到 IPO 逐步推进" },
  ],
  en: [
    { icon: "", text: "Master core valuation methods and know exactly what your company is worth" },
    { icon: "", text: "Design sound equity structures to avoid dilution and shareholder disputes" },
    { icon: "", text: "Formulate fundraising strategies and build effective investor communication" },
    { icon: "", text: "Plan clear capital exit paths — from mergers & acquisitions to IPO" },
  ],
};

export default async function CoursesPage() {
  const locale = await getLocale();
  const session = await auth();
  const isEn = locale === "en";
  const onlineCourse = isEn ? ONLINE_COURSE.en : ONLINE_COURSE.zh;
  const outcomes = isEn ? OUTCOMES.en : OUTCOMES.zh;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F4EF", color: "#1C1814" }}>
      <SharedNav locale={locale} activeHref="/courses" isLoggedIn={!!session?.user} />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
          >
            {isEn ? "Capital Growth Path" : "资本成长路径"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {isEn ? "Enterprise Capital" : "企业资本运作"}
            <br />
            <span style={{ color: "#8B6514" }}>{isEn ? "Complete Knowledge System" : "完整知识体系"}</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#68625C" }}>
            {isEn
              ? "Designed by Jeffry Yew with 25 years of business development and 13 years of fundraising expertise, systematically teaching SME owners to master capital operations."
              : "由 Jeffry Yew（姚国雄）主导设计，融合 25 年商业发展与 13 年融资专业经验，系统传授中小企业主掌握资本运作。"}
          </p>
        </div>
      </section>

      {/* Learning outcomes */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
            <div className="sm:col-span-2 mb-2">
              <h2 className="font-bold text-sm" style={{ color: "#8B6514" }}>
                {isEn ? "After completing, you will be able to:" : "学完之后，你将能够："}
              </h2>
            </div>
            {outcomes.map((o) => (
              <div key={o.text} className="flex items-start gap-3">
                <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Online Course */}
      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: "#E0D9CE" }} />
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#F4F0FC", color: "#7C5FBF", border: "1px solid rgba(124,95,191,0.2)" }}>
              {isEn ? "Online Course" : "线上课程 · Online"}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E0D9CE" }} />
          </div>

          <div id="capital-start" className="rounded-2xl p-7 relative overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(124,95,191,0.2)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #7C5FBF80, transparent)" }} />

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#F4F0FC", color: "#7C5FBF", border: "1px solid rgba(124,95,191,0.2)" }}>
                {onlineCourse.stage}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F7F4EF", color: "#9A9490", border: "1px solid #E0D9CE" }}>
                {onlineCourse.tag}
              </span>
            </div>

            <div className="mb-1">
              {isEn && <span className="text-xs" style={{ color: "#9A9490" }}>{onlineCourse.nameEn}</span>}
              {isEn && <span className="text-xs ml-2" style={{ color: "#C0B8B0" }}>· {onlineCourse.subtitle}</span>}
            </div>
            <h3 className="font-bold text-xl mb-0.5" style={{ color: "#1C1814" }}>{onlineCourse.name}</h3>
            {!isEn && <p className="text-xs mb-1" style={{ color: "#9A9490" }}>{onlineCourse.subtitleZh}</p>}
            <p className="text-sm mb-5 mt-3" style={{ color: "#68625C" }}>{onlineCourse.desc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-6">
              {onlineCourse.abilities.map((ability) => (
                <div key={ability} className="flex items-start gap-2 text-xs" style={{ color: "#68625C" }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "#7C5FBF" }}></span>
                  {ability}
                </div>
              ))}
            </div>

            <Link
              href={session?.user ? "/student/learn" : "/login"}
              className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
              style={{ backgroundColor: "#7C5FBF", color: "#FFFFFF" }}
            >
              {session?.user ? (isEn ? "Go to Courses →" : "进入课程 →") : (isEn ? "Get Started →" : "立即开始 →")}
            </Link>
          </div>
        </div>
      </section>

      {/* Offline Courses */}
      <section className="px-4 py-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: "#E0D9CE" }} />
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)" }}>
              {isEn ? "Offline Programmes" : "线下课程 · Offline Programmes"}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E0D9CE" }} />
          </div>

          <div className="space-y-5">
            {OFFLINE_COURSES.map((course) => {
              const c = isEn ? course.en : course.zh;
              return (
                <div key={course.id} id={course.slug} className="rounded-2xl p-7 relative overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${course.accent}80, transparent)` }} />

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: course.accentLight, color: course.accent, border: `1px solid ${course.accent}25` }}>
                      {c.stage}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F7F4EF", color: "#9A9490", border: "1px solid #E0D9CE" }}>
                      {isEn ? course.duration.en : course.duration.zh}
                    </span>
                  </div>

                  {isEn && <div className="text-xs mb-0.5" style={{ color: "#9A9490" }}>{c.nameEn}</div>}
                  <h3 className="font-bold text-lg mb-1" style={{ color: "#1C1814" }}>{c.name}</h3>

                                    <p className="text-sm mb-5" style={{ color: "#68625C" }}>{c.desc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-6">
                    {c.abilities.map((ability) => (
                      <div key={ability} className="flex items-start gap-2 text-xs" style={{ color: "#68625C" }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: course.accent }}></span>
                        {ability}
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/apply?course=${course.slug}`}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
                    style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
                  >
                    {isEn ? "Apply Now →" : "申请加入 →"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ backgroundColor: "#1C1814" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#F0EBE1" }}>
            {isEn ? "Begin Your Capital Journey Here" : "从这里开始你的资本之旅"}
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#9A9490" }}>
            {isEn
              ? "Try the online course anytime for free. Enrol in offline programmes to secure your seat."
              : "线上课程随时免费体验，线下课程立即报名锁定席位。"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={session?.user ? "/student/learn" : "/login"}
              className="inline-block px-10 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
            >
              {session?.user ? (isEn ? "Go to Courses →" : "进入课程 →") : (isEn ? "Get Started →" : "立即开始 →")}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}