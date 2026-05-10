import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import BackNav from "@/components/BackNav";
import { getLocale } from "@/lib/i18n";

// ─── Bilingual course data ────────────────────────────────────────────────────

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
    tagColor: "#7A9A6C",
    badge: { zh: null, en: null },
  },
  {
    id: 2,
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
    tagColor: "#6A7A9A",
    badge: { zh: "HRDF Claimable", en: "HRDF Claimable" },
  },
  {
    id: 3,
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
    tagColor: "#C9A84C",
    badge: { zh: "HRDF Claimable", en: "HRDF Claimable" },
  },
];

const OUTCOMES = {
  zh: [
    { icon: "📊", text: "掌握企业估值核心方法，知道自己公司值多少钱" },
    { icon: "🏛️", text: "设计合理股权架构，避免稀释与纠纷风险" },
    { icon: "💼", text: "制定融资策略，与投资人建立有效沟通框架" },
    { icon: "🚀", text: "规划清晰资本退出路径，从并购到 IPO 逐步推进" },
  ],
  en: [
    { icon: "📊", text: "Master core valuation methods and know exactly what your company is worth" },
    { icon: "🏛️", text: "Design sound equity structures to avoid dilution and shareholder disputes" },
    { icon: "💼", text: "Formulate fundraising strategies and build effective investor communication" },
    { icon: "🚀", text: "Plan clear capital exit paths — from mergers & acquisitions to IPO" },
  ],
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function CoursesPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const onlineCourse = isEn ? ONLINE_COURSE.en : ONLINE_COURSE.zh;
  const outcomes = isEn ? OUTCOMES.en : OUTCOMES.zh;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0" }}>
      <SharedNav locale={locale} activeHref="/courses" />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <BackNav className="mb-8 justify-center" />
          <div
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {isEn ? "3 Offline Programmes + 1 Online Course" : "3 阶段线下课程 + 1 线上课程"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
            {isEn ? "Enterprise Capital" : "企业资本运作"}
            <br />
            <span style={{ color: "#C9A84C" }}>{isEn ? "Complete Knowledge System" : "完整知识体系"}</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#666660" }}>
            {isEn
              ? "Designed by Jeffry Yew with 25 years of business development and 13 years of fundraising expertise, systematically teaching Malaysian SME owners to master capital operations."
              : "由 Jeffry Yew（姚国雄）主导设计，融合 25 年商业发展与 13 年融资专业经验，系统教授马来西亚中小企业主掌握资本运作的完整路径。"}
          </p>
          <Link href="/register" className="inline-block px-8 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
            {isEn ? "Get Started →" : "立即开始 →"}
          </Link>
        </div>
      </section>

      {/* Learning outcomes */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="sm:col-span-2 mb-2">
              <h2 className="font-bold text-sm" style={{ color: "#C9A84C" }}>
                {isEn ? "After completing, you will be able to:" : "学完之后，你将能够："}
              </h2>
            </div>
            {outcomes.map((o) => (
              <div key={o.text} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{o.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: "#888880" }}>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Online Course ── */}
      <section className="px-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: "#1A1A1A" }} />
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(138,111,212,0.1)", color: "#8A6FD4", border: "1px solid rgba(138,111,212,0.2)" }}>
              {isEn ? "Online Course" : "线上课程 · Online"}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#1A1A1A" }} />
          </div>

          <div className="rounded-2xl p-7 relative overflow-hidden" style={{ backgroundColor: "#0A0A0A", border: "1px solid rgba(138,111,212,0.2)" }}>
            <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(138,111,212,0.5), transparent)" }} />

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(138,111,212,0.12)", color: "#8A6FD4", border: "1px solid rgba(138,111,212,0.25)" }}>
                {onlineCourse.stage}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#111111", color: "#555550", border: "1px solid #1A1A1A" }}>
                {onlineCourse.tag}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(138,111,212,0.08)", color: "#8A6FD4", border: "1px solid rgba(138,111,212,0.18)" }}>
                {onlineCourse.badgeLabel}
              </span>
            </div>

            <div className="mb-1">
              <span className="text-xs" style={{ color: "#555550" }}>{onlineCourse.nameEn}</span>
              <span className="text-xs ml-2" style={{ color: "#3A3A3A" }}>· {onlineCourse.subtitle}</span>
            </div>
            <h3 className="font-bold text-xl mb-0.5" style={{ color: "#F5F5F0" }}>{onlineCourse.name}</h3>
            {!isEn && <p className="text-xs mb-1" style={{ color: "#555550" }}>{onlineCourse.subtitleZh}</p>}
            <p className="text-sm mb-5 mt-3" style={{ color: "#666660" }}>{onlineCourse.desc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-6">
              {onlineCourse.abilities.map((ability) => (
                <div key={ability} className="flex items-start gap-2 text-xs" style={{ color: "#888880" }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "#8A6FD4" }}>✦</span>
                  {ability}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#8A6FD4", color: "#FFFFFF", minWidth: "140px" }}>
                {isEn ? "Enrol Now →" : "立即报名 →"}
              </Link>
              <Link href="/register" className="flex-1 text-center py-2.5 rounded-xl text-sm" style={{ backgroundColor: "#111111", color: "#8A6FD4", border: "1px solid rgba(138,111,212,0.25)", minWidth: "140px" }}>
                {isEn ? "Free Trial" : "免费体验"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Offline Courses ── */}
      <section className="px-4 py-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ backgroundColor: "#1A1A1A" }} />
            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
              {isEn ? "Offline Programmes" : "线下课程 · Offline Programmes"}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#1A1A1A" }} />
          </div>

          <div className="space-y-5">
            {OFFLINE_COURSES.map((course) => {
              const c = isEn ? course.en : course.zh;
              const badge = isEn ? course.badge.en : course.badge.zh;
              return (
                <div key={course.id} className="rounded-2xl p-7 relative" style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}>
                  <div style={{ position: "absolute", top: 0, left: "8%", right: "8%", height: "1px", background: `linear-gradient(90deg, transparent, ${course.tagColor}50, transparent)` }} />

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${course.tagColor}15`, color: course.tagColor, border: `1px solid ${course.tagColor}25` }}>
                      {c.stage}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#111111", color: "#555550", border: "1px solid #1A1A1A" }}>
                      {c.tag}
                    </span>
                    {badge && (
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#111111", color: "#444440", border: "1px solid #1A1A1A" }}>
                        {badge}
                      </span>
                    )}
                  </div>

                  <div className="text-xs mb-0.5" style={{ color: "#444440" }}>{c.nameEn}</div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#F5F5F0" }}>{c.name}</h3>
                  <p className="text-sm mb-5" style={{ color: "#666660" }}>{c.desc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-6">
                    {c.abilities.map((ability) => (
                      <div key={ability} className="flex items-start gap-2 text-xs" style={{ color: "#888880" }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }}>✦</span>
                        {ability}
                      </div>
                    ))}
                  </div>

                  <Link href="/register" className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
                    {isEn ? "Enrol Now →" : "立即报名 →"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HRDF note */}
      <section className="py-8 px-4" style={{ backgroundColor: "#080808" }}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-6 flex items-start gap-4" style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}>
            <div className="text-2xl flex-shrink-0">🏛️</div>
            <div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "#E0E0DC" }}>HRDF Claimable</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#555550" }}>
                {isEn
                  ? "Selected offline programmes are eligible for HRDF (Human Resources Development Fund) reimbursement, helping Malaysian business owners reduce training costs. Contact us at "
                  : "部分线下课程支持 HRDF（人力资源发展基金）报销，马来西亚企业主可凭此减轻培训成本。详情请联系 "}
                <a href="mailto:info@capitalmastery.net" style={{ color: "#C9A84C" }}>info@capitalmastery.net</a>
                {isEn ? " for eligibility details." : " 查询资格条件。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
            {isEn ? "Begin Your Capital Journey Here" : "从这里开始你的资本之旅"}
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#666660" }}>
            {isEn
              ? "Try the online course anytime for free. Enrol in offline programmes to secure your seat."
              : "线上课程随时免费体验，线下课程立即报名锁定席位。"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="inline-block px-10 py-3 rounded-xl text-sm font-semibold" style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
              {isEn ? "Enrol Now →" : "立即报名 →"}
            </Link>
            <Link href="/register" className="inline-block px-10 py-3 rounded-xl text-sm" style={{ backgroundColor: "#111111", color: "#888880", border: "1px solid #1A1A1A" }}>
              {isEn ? "Free Trial — Online Course" : "免费体验线上课程"}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #0E0E0C" }}>
        <p className="text-xs" style={{ color: "#252523" }}>
          {isEn ? "© 2025 ZiBenDao Capital · Craftspace Sdn Bhd (202201044683 / 1490380-V)" : "© 2025 资本道 Capital Mastery · Craftspace Sdn Bhd (202201044683 / 1490380-V)"}
        </p>
      </footer>
    </div>
  );
}
