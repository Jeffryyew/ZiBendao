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
    desc: "建立资本思维框架，认识企业从经营到资本化的核心逻辑。",
    abilities: [
      "区分经营思维与资本思维",
      "判断企业是否具备资本化条件",
      "理解资本运作的常见误区",
    ],
    badge: null,
    cta: "联系报名",
  },
  {
    id: 2,
    name: "启动资本",
    nameEn: "Kickstart Capital",
    stage: "阶段二",
    tag: "实战进阶",
    tagColor: "#6A7A9A",
    desc: "系统启动企业资本化进程，完成融资前梳理、包装与投资人对接。",
    abilities: [
      "完成融资前企业包装与财务梳理",
      "掌握投资人沟通框架与路演技巧",
      "设计股权结构与早期融资策略",
    ],
    badge: "HRDF Claimable",
    cta: "联系报名",
  },
  {
    id: 3,
    name: "资本道",
    nameEn: "Capital Mastery",
    stage: "阶段三",
    tag: "高阶精通",
    tagColor: "#C9A84C",
    desc: "完整企业资本运作高阶系统，从估值提升到 IPO 路径全覆盖。",
    abilities: [
      "运用估值方法论提升企业估值",
      "设计 PE 股权架构与 ESOP 方案",
      "规划资本杠杆与 IPO 路径",
      "建立资本机制公司结构",
    ],
    badge: "HRDF Claimable",
    cta: "联系报名",
  },
];

const OUTCOMES = [
  { icon: "📊", text: "掌握企业估值核心方法，知道自己公司值多少钱" },
  { icon: "🏛️", text: "设计合理股权架构，避免稀释与纠纷风险" },
  { icon: "💼", text: "制定融资策略，与投资人建立有效沟通框架" },
  { icon: "🚀", text: "规划清晰资本退出路径，从并购到 IPO 逐步推进" },
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
            3 阶段课程体系
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
            由 Jeffry Yew（姚国雄）主导设计，融合 25 年商业发展与 13 年融资专业经验，
            系统教授马来西亚中小企业主掌握资本运作的完整路径。
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            立即免费体验 →
          </Link>
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

                <div className="flex flex-wrap items-center gap-2 mb-4">
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

                <div className="text-xs mb-0.5" style={{ color: "#444440" }}>{course.nameEn}</div>
                <h3 className="font-bold text-lg mb-2" style={{ color: "#F5F5F0" }}>{course.name}</h3>
                <p className="text-sm mb-5" style={{ color: "#666660" }}>{course.desc}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 mb-6">
                  {course.abilities.map((ability) => (
                    <div key={ability} className="flex items-start gap-2 text-xs" style={{ color: "#888880" }}>
                      <span className="flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }}>✦</span>
                      {ability}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 mt-auto">
                  <Link
                    href="/about"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", minWidth: "120px" }}
                  >
                    {course.cta} →
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm"
                    style={{ backgroundColor: "#111111", color: "#888880", border: "1px solid #1A1A1A", minWidth: "120px" }}
                  >
                    免费体验
                  </Link>
                </div>
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
          <Link
            href="/register"
            className="inline-block px-10 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            免费注册开始 →
          </Link>
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
