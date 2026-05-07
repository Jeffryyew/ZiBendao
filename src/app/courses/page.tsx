import Link from "next/link";

const MODULES = [
  {
    id: 1,
    icon: "📐",
    title: "资本基础",
    titleEn: "Capital Foundations",
    level: "L1",
    lessonCount: 3,
    description: "建立正确的金融思维框架，理解资本的本质与运作逻辑。",
    lessons: [
      "什么是资本？资金与价值的关系",
      "财务报表解读：资产负债表、损益表、现金流量表",
      "复利的力量：FV 公式与长期积累",
    ],
    free: true,
  },
  {
    id: 2,
    icon: "📊",
    title: "估值方法论",
    titleEn: "Valuation Methodology",
    level: "L1",
    lessonCount: 3,
    description: "掌握主流企业估值方法，学会判断一家公司的合理市值。",
    lessons: [
      "市盈率（PE）、市净率（PB）与市销率（PS）",
      "行业估值对比与溢价分析",
      "DCF 折现现金流基础模型",
    ],
    free: false,
  },
  {
    id: 3,
    icon: "💼",
    title: "资本结构与融资",
    titleEn: "Capital Structure & Fundraising",
    level: "L2",
    lessonCount: 4,
    description: "深入理解股权、债务与混合融资，制定最优资本配置策略。",
    lessons: [
      "股权融资 vs 债权融资：核心差异",
      "加权平均资本成本（WACC）计算",
      "融资轮次与股权稀释管理",
      "资本结构优化案例实战",
    ],
    free: false,
  },
  {
    id: 4,
    icon: "🚀",
    title: "企业增长与上市路径",
    titleEn: "Growth & IPO Pathway",
    level: "L3",
    lessonCount: 3,
    description: "从成长阶段规划到资本市场对接，系统掌握马来西亚上市流程。",
    lessons: [
      "ACE 市场 vs 主板：门槛与策略选择",
      "IPO 前重组：股权、架构与财务梳理",
      "上市后资本管理与投资者关系",
    ],
    free: false,
  },
];

const FEATURES = [
  { icon: "🗺️", label: "闯关式学习地图", desc: "游戏化关卡设计，循序渐进不迷路" },
  { icon: "🏆", label: "等级成就系统", desc: "完成关卡解锁 L1→L2→L3 等级徽章" },
  { icon: "📥", label: "课件 PDF 下载", desc: "每节课配套高质量讲义，随时复习" },
  { icon: "🎙️", label: "直播答疑", desc: "导师定期直播，实时解答学员疑惑" },
  { icon: "👥", label: "学员社群", desc: "与同行学员交流，共享资源与机会" },
  { icon: "🔧", label: "配套计算工具", desc: "学到哪就用到哪，理论与实践同步" },
];

export default function CoursesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: "rgba(13,13,13,0.95)", borderBottom: "1px solid #1A1A1A" }}
      >
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
          资本道
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
              style={{ color: item.href === "/courses" ? "#C9A84C" : "#A0A09A" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm" style={{ color: "#A0A09A" }}>登录</Link>
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
            style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            4 模块 · 13 课节 · 系统进阶
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            从零到上市，
            <br />
            <span style={{ color: "#C9A84C" }}>系统化资本教育</span>
          </h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: "#A0A09A" }}>
            资本道课程体系专为马来西亚创业者与企业主设计。
            从财务基础到 IPO 路径，每一步都有导师带领，每一关都有工具辅助。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              免费开始前 2 关 →
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
            >
              查看完整方案
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 pb-16">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6"
          style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
        >
          {[
            { value: "4", label: "课程模块" },
            { value: "13+", label: "课程节数" },
            { value: "3", label: "学习等级" },
            { value: "1,000+", label: "已培训学员" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: "#C9A84C" }}>{s.value}</div>
              <div className="text-xs" style={{ color: "#666660" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="py-4 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            课程模块
          </h2>
          <div className="space-y-5">
            {MODULES.map((mod) => (
              <div
                key={mod.id}
                className="rounded-2xl p-7"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: `1px solid ${mod.free ? "#C9A84C" : "#1A1A1A"}`,
                  position: "relative",
                }}
              >
                {mod.free && (
                  <div
                    className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
                  >
                    免费体验
                  </div>
                )}
                <div className="flex items-start gap-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
                  >
                    {mod.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#1A1A1A", color: "#C9A84C" }}>
                        {mod.level}
                      </span>
                      <span className="text-xs" style={{ color: "#666660" }}>{mod.lessonCount} 课节</span>
                      <span className="text-xs hidden sm:inline" style={{ color: "#444440" }}>/ {mod.titleEn}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2" style={{ color: "#F5F5F0" }}>
                      模块 {mod.id}：{mod.title}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: "#A0A09A" }}>{mod.description}</p>
                    <ul className="space-y-1.5">
                      {mod.lessons.map((lesson, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: mod.free ? "#C0C0BC" : "#666660" }}>
                          <span className="flex-shrink-0 mt-0.5" style={{ color: mod.free ? "#C9A84C" : "#333330" }}>
                            {mod.free ? "▶" : "🔒"}
                          </span>
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs mt-8" style={{ color: "#444440" }}>
            * 免费会员可访问模块 1 全部内容，升级学生会员解锁全部模块
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4" style={{ backgroundColor: "#080808" }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            学习体验
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="rounded-2xl p-6 flex gap-4"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div className="text-2xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "#F5F5F0" }}>{f.label}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#A0A09A" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning path diagram */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-2xl font-bold mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            学习路径
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { level: "免费", color: "#666660", desc: "注册即可体验", icon: "🌱" },
              { level: "L1 基础", color: "#C9A84C", desc: "模块 1–2", icon: "📗" },
              { level: "L2 进阶", color: "#C9A84C", desc: "模块 3", icon: "📘" },
              { level: "L3 精通", color: "#C9A84C", desc: "模块 4", icon: "📕" },
            ].map((step, i) => (
              <div key={step.level} className="flex items-center gap-4">
                <div
                  className="rounded-2xl px-6 py-5 text-center w-36"
                  style={{ backgroundColor: "#0A0A0A", border: `1px solid ${step.color}33` }}
                >
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="font-bold text-sm mb-1" style={{ color: step.color }}>{step.level}</div>
                  <div className="text-xs" style={{ color: "#666660" }}>{step.desc}</div>
                </div>
                {i < 3 && (
                  <div className="text-lg hidden md:block" style={{ color: "#333330" }}>→</div>
                )}
              </div>
            ))}
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
            准备好开始你的资本之旅了吗？
          </h2>
          <p className="mb-8 text-sm" style={{ color: "#A0A09A" }}>
            免费注册即可解锁第一模块全部课程，无需信用卡。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-10 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              免费注册，立即开始 →
            </Link>
            <Link
              href="/pricing"
              className="px-10 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
            >
              查看完整套餐
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #1A1A1A" }}>
        <p className="text-xs" style={{ color: "#444440" }}>
          © 2025 资本道 ZiBenDao. 保留所有权利。
        </p>
      </footer>
    </div>
  );
}
