import Link from "next/link";

const COURSES = [
  {
    id: 1,
    name: "资本道",
    nameEn: "Capital Mastery Program",
    tag: "旗舰课程",
    tagColor: "#C9A84C",
    desc: "完整的企业资本运作系统，帮你从根本上理解如何让企业具备融资、估值与上市条件。",
    topics: [
      "公司估值方法论与提升策略",
      "PE 股权结构设计与股东协议",
      "股权激励方案设计（ESOP）",
      "资本杠杆运用与融资节奏规划",
      "资本机制公司建立与治理架构",
    ],
    badge: "HRDF Claimable",
    free: false,
    cta: "了解详情",
  },
  {
    id: 2,
    name: "启动资本",
    nameEn: "Kickstart Capital",
    tag: "实战训练",
    tagColor: "#7A9A6C",
    desc: "实战企业资本化，提供从零开始的落地操作指导，帮助企业完成资本化启动的第一步。",
    topics: [
      "企业资本化的实战操作流程",
      "融资前的企业包装与梳理",
      "投资人沟通与路演技巧",
      "早期资金来源与策略选择",
    ],
    badge: null,
    free: false,
    cta: "了解详情",
  },
  {
    id: 3,
    name: "资本三维模式",
    nameEn: "Capital 3D Model Workshop",
    tag: "工作坊",
    tagColor: "#6A7A9A",
    desc: "深入企业估值最大化策略，拆解四大退出维度，以真实国际 IPO 案例为蓝本讲解资本全局。",
    topics: [
      "企业估值最大化核心策略",
      "四大退出维度：关闭、出售、并购、IPO",
      "真实国际 IPO 案例深度解析",
      "如何让企业具备「可投性」",
    ],
    badge: "线上 Zoom",
    free: false,
    cta: "了解详情",
  },
  {
    id: 4,
    name: "AI 经济与工业 4.5",
    nameEn: "AI Economy & Industry 4.5",
    tag: "专题课程",
    tagColor: "#9A6A7A",
    desc: "聚焦人工智能经济与工业 4.5 时代背景下的企业转型机遇，帮助企业主把握新经济下的资本机会。",
    topics: [
      "AI 经济浪潮下的企业机遇",
      "工业 4.5 转型路径与资本配置",
      "数字化企业的估值逻辑",
      "新经济下的融资与合作模式",
    ],
    badge: null,
    free: false,
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
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://cdn1.npcdn.net/images/np_26751_1734661918.png"
            alt="Capital Mastery 资本道"
            style={{ height: 32, width: "auto", objectFit: "contain" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </Link>
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              立即免费体验 →
            </Link>
            <a
              href="https://wa.me/60103210533"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
            >
              WhatsApp 咨询
            </a>
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
                      {course.tag}
                    </span>
                    {course.badge && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: "#111111", color: "#555550", border: "1px solid #1A1A1A" }}
                      >
                        {course.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono" style={{ color: "#333330" }}>
                    {String(course.id).padStart(2, "0")}
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
            免费注册体验平台内容，或直接 WhatsApp 与我们的团队沟通你的需求。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-10 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              免费注册开始 →
            </Link>
            <a
              href="https://wa.me/60103210533"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
            >
              WhatsApp +6010-321 0533
            </a>
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
