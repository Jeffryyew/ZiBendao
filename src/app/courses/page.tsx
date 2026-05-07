import Link from "next/link";
import LogoImg from "@/components/LogoImg";
import BackNav from "@/components/BackNav";

const COURSES = [
  {
    id: 1,
    name: "资本通",
    nameEn: "Capital Gateway",
    stage: "阶段一",
    tag: "入门基础",
    tagColor: "#7A9A6C",
    desc: "建立正确的资本思维框架，认识企业资本运作的核心逻辑，适合刚开始接触资本运作概念的创业者与企业主。",
    topics: [
      "什么是资本运作？与融资的本质区别",
      "企业生命周期与资本需求阶段",
      "如何判断自己的企业是否具备资本化条件",
      "资本运作的常见误区与正确认知",
    ],
    badge: null,
    cta: "了解详情",
  },
  {
    id: 2,
    name: "启动资本",
    nameEn: "Kickstart Capital",
    stage: "阶段二",
    tag: "实战进阶",
    tagColor: "#6A7A9A",
    desc: "从理论走向实践，系统学习如何启动企业资本化进程，完成融资前的梳理、包装与投资人对接。",
    topics: [
      "企业资本化启动的完整操作流程",
      "融资前的企业包装与财务梳理",
      "投资人沟通框架与路演技巧",
      "股权结构设计与早期融资策略",
    ],
    badge: "HRDF Claimable",
    cta: "了解详情",
  },
  {
    id: 3,
    name: "资本道",
    nameEn: "Capital Mastery",
    stage: "阶段三",
    tag: "高阶精通",
    tagColor: "#C9A84C",
    desc: "完整的企业资本运作高阶系统，涵盖企业估值提升、PE 股权架构设计、资本杠杆运用，直至 IPO 路径规划。",
    topics: [
      "公司估值方法论与估值提升策略",
      "PE 股权结构设计与股东协议",
      "股权激励方案设计（ESOP）",
      "资本杠杆运用与融资节奏规划",
      "资本机制公司建立与 IPO 路径",
    ],
    badge: "HRDF Claimable",
    cta: "了解详情",
  },
];

const OUTCOMES = [
  { icon: "📊", text: "掌握企业估值的核心方法，知道自己公司值多少钱" },
  { icon: "🏛️", text: "设计合理的股权架构，避免股权纠纷与稀释风险" },
  { icon: "💼", text: "制定融资策略，与投资人建立有效的沟通框架" },
  { icon: "🚀", text: "规划清晰的资本退出路径，从并购到 IPO 逐步推进" },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: "rgba(13,13,13,0.95)", borderBottom: "1px solid #1A1A1A", backdropFilter: "blur(12px)" }}
      >
        <Link href="/"><LogoImg height={32} /></Link>
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "课程", href: "/courses" },
            { label: "工具", href: "/tools" },
            { label: "定价", href: "/pricing" },
            { label: "关于", href: "/about" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm"
              style={{ color: item.href === "/courses" ? "#C9A84C" : "#666660" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm" style={{ color: "#666660" }}>登录</Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-xl font-medium"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            免费注册
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <BackNav className="mb-8 justify-center" />
          <div
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            4 大核心课程
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            企业资本运作
            <br />
            <span style={{ color: "#C9A84C" }}>完整知识体系</span>
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#666660" }}>
            由 Jeffry Yew（姚国雄）主导设计，融合 24 年商业发展与 12 年融资专业经验，
            系统教授马来西亚中小企业主与创业者掌握资本运作的完整路径。
          </p>
          <div className="flex justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              立即免费体验 →
            </Link>
          </div>
        </div>
      </section>

      {/* Learning outcomes */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
          >
            <div className="sm:col-span-2 mb-2">
              <h2 className="font-bold text-sm" style={{ color: "#C9A84C" }}>学完之后，你将能够：</h2>
            </div>
            {OUTCOMES.map((o) => (
              <div key={o.text} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{o.icon}</span>
                <p className="text-sm leading-relaxed" style={{ color: "#888880" }}>{o.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-4 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            课程列表
          </h2>
          <div className="space-y-5">
            {COURSES.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl p-7 relative"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                {/* Top accent */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "8%",
                    right: "8%",
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, ${course.tagColor}50, transparent)`,
                  }}
                />

                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${course.tagColor}15`, color: course.tagColor, border: `1px solid ${course.tagColor}25` }}
                    >
                      {course.stage}
                    </span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: "#111111", color: "#555550", border: "1px solid #1A1A1A" }}
                    >
                      {course.tag}
                    </span>
                    {course.badge && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: "#111111", color: "#444440", border: "1px solid #1A1A1A" }}
                      >
                        {course.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs mb-0.5" style={{ color: "#444440" }}>{course.nameEn}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#F5F5F0" }}>{course.name}</h3>
                <p className="text-sm mb-5" style={{ color: "#666660" }}>{course.desc}</p>

                <ul className="space-y-2">
                  {course.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5 text-sm" style={{ color: "#888880" }}>
                      <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: "#C9A84C" }}>✦</span>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HRDF note */}
      <section className="py-8 px-4" style={{ backgroundColor: "#080808" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-6 flex items-start gap-4"
            style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
          >
            <div className="text-2xl flex-shrink-0">🏛️</div>
            <div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: "#E0E0DC" }}>HRDF Claimable</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#555550" }}>
                部分课程支持 HRDF（人力资源发展基金）报销，马来西亚企业主可凭此减轻培训成本。
                详情请联系 <a href="mailto:info@capitalmastery.net" style={{ color: "#C9A84C" }}>info@capitalmastery.net</a> 查询资格条件。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            准备好了吗？
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#666660" }}>
            免费注册即可体验平台内容，随时升级解锁完整课程。
          </p>
          <div className="flex justify-center">
            <Link
              href="/register"
              className="px-10 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              免费注册开始 →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #0E0E0C" }}>
        <p className="text-xs" style={{ color: "#252523" }}>
          © 2025 资本道 Capital Mastery · Craftspace Sdn Bhd (202201044683 / 1490380-V)
        </p>
      </footer>
    </div>
  );
}
