import Link from "next/link";
import LogoImg from "@/components/LogoImg";

const FOUNDER = {
  name: "姚国雄",
  nameEn: "Jeffry Yew",
  role: "创始人 & 首席导师",
  roleEn: "Founder & Chief Instructor",
  biz: "24 年商业发展经验",
  finance: "12 年融资专业经验",
  sectors: "专注房地产、科技、零售行业横跨亚洲市场",
  bio: "姚国雄（Jeffry Yew）是马来西亚顶尖的企业资本运作导师，拥有 24 年商业发展及 12 年融资专业经验。深耕房地产、科技与零售领域，足迹横跨亚洲多个市场。他创立资本道（Capital Mastery），致力于将复杂的资本运作知识系统化，帮助中小企业主与创业者掌握企业估值、股权架构、融资杠杆与 IPO 路径，建立可靠、可投、可扩展的企业。",
};

const VALUES = [
  { icon: "🎯", title: "实战导向", desc: "每个知识点都源于真实案例，学员即学即用，直接应用于自身企业。" },
  { icon: "📈", title: "系统思维", desc: "从企业估值到 IPO 路径，构建完整的资本运作知识体系，而非碎片化内容。" },
  { icon: "🔐", title: "专业保密", desc: "客户财务与合约信息严格保密，数字化处理，安全可靠。" },
  { icon: "🤝", title: "长期陪伴", desc: "不只是一次课程，而是企业从创业到上市全程的知识与资源伙伴。" },
];

const PROGRAMS = [
  {
    stage: "阶段一",
    name: "资本通",
    nameEn: "Capital Gateway",
    desc: "资本运作入门课程，建立正确的资本思维框架，认识企业资本化核心逻辑，适合刚接触资本运作的创业者。",
  },
  {
    stage: "阶段二",
    name: "启动资本",
    nameEn: "Kickstart Capital",
    desc: "实战进阶训练，系统学习如何启动企业资本化进程，完成融资前梳理、包装与投资人对接全流程。",
  },
  {
    stage: "阶段三",
    name: "资本道",
    nameEn: "Capital Mastery",
    desc: "高阶资本运作系统，涵盖企业估值提升、PE 股权架构、资本杠杆运用，直至 IPO 路径完整规划。",
  },
];

const TESTIMONIALS = [
  { name: "沈炜翔", company: "兄弟冰室", quote: "透过资本道的系统，我清楚了解到企业估值的关键，让我在融资谈判中更有底气。" },
  { name: "Ada Tan", company: "Pixel Bear Sdn Bhd", quote: "Jeffry 老师将复杂的股权架构讲解得非常清晰，是我学过最具实战价值的商业课程。" },
  { name: "叶志煌", company: "创业者 / 教育家", quote: "资本道不只是课程，而是一套完整的思维升级，让我看待企业的角度完全改变了。" },
];

export default function AboutPage() {
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
            <Link key={item.href} href={item.href} className="text-sm" style={{ color: "#666660" }}>
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
            关于我们
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            掌握资本之道，
            <br />
            <span style={{ color: "#C9A84C" }}>创建可靠、可投、可扩展企业</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#666660" }}>
            资本道（Capital Mastery）由 Craftspace Sdn Bhd 运营，是马来西亚专注企业资本运作教育的综合平台。
            我们帮助中小企业主与创业者系统掌握资本运作，从融资到上市，每一步都有清晰路径。
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl p-8 md:p-12 grid md:grid-cols-3 gap-8 items-start"
            style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
          >
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-4"
                style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                👨‍💼
              </div>
              <div className="text-xs mb-0.5" style={{ color: "#444440" }}>{FOUNDER.nameEn}</div>
              <h3 className="font-bold text-lg mb-0.5" style={{ color: "#F5F5F0" }}>{FOUNDER.name}</h3>
              <div className="text-xs mb-4" style={{ color: "#C9A84C" }}>{FOUNDER.role}</div>
              <div className="flex flex-col gap-1.5 w-full">
                {[FOUNDER.biz, FOUNDER.finance].map((s) => (
                  <div
                    key={s}
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: "#111111", color: "#888880" }}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <div
                className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
                style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                创始人简介
              </div>
              <p className="text-sm leading-loose mb-6" style={{ color: "#888880" }}>
                {FOUNDER.bio}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "24年", label: "商业发展经验" },
                  { value: "12年", label: "融资专业经验" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl" style={{ backgroundColor: "#111111" }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: "#C9A84C", fontFamily: "var(--font-display)" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "#444440" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-10 text-center"
          style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
        >
          <div className="text-3xl mb-4" style={{ color: "#C9A84C" }}>✦</div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}
          >
            我们的使命
          </h2>
          <p className="text-sm leading-loose max-w-2xl mx-auto" style={{ color: "#888880" }}>
            帮助马来西亚中小企业主与创业者系统掌握企业估值、股权架构、融资杠杆与资本退出策略，
            建立<strong style={{ color: "#C9A84C" }}>可靠、可投、可扩展</strong>的企业，
            最终实现从创业到资本市场的完整跨越。
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            我们的价值观
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: "#E0E0DC" }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#555550" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 px-4" style={{ backgroundColor: "#080808" }}>
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            核心课程项目
          </h2>
          <div className="space-y-4">
            {PROGRAMS.map((p, i) => (
              <div
                key={p.name}
                className="rounded-2xl p-6 flex gap-4 items-start"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#C9A84C" }}>{p.stage} · {p.nameEn}</div>
                  <h3 className="font-semibold mb-1.5 text-sm" style={{ color: "#E0E0DC" }}>{p.name}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#555550" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/courses"
              className="inline-block text-sm px-6 py-2.5 rounded-xl"
              style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)" }}
            >
              查看完整课程体系 →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            学员心声
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div className="text-lg mb-4" style={{ color: "#C9A84C" }}>❝</div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#777770" }}>
                  {t.quote}
                </p>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#E0E0DC" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "#444440" }}>{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-10"
            style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
            >
              联系我们
            </h2>
            <p className="text-xs mb-8" style={{ color: "#444440" }}>
              如需咨询课程、企业合作或一对一顾问服务，欢迎通过社交媒体与我们联系。
            </p>

            <div className="mb-8">
              <div className="text-xs mb-3" style={{ color: "#444440" }}>📍 地址</div>
              <div className="text-sm" style={{ color: "#888880" }}>
                Leisure Commerce Square, Jalan PJS 8/9,<br />
                46150 Petaling Jaya, Selangor, Malaysia
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Facebook", href: "https://www.facebook.com/capitalmastery.net" },
                { label: "Instagram", href: "https://www.instagram.com/capitalmasterydotnet" },
                { label: "TikTok", href: "https://www.tiktok.com/@capitalmasterydotnet" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#111111", color: "#888880", border: "1px solid #1A1A1A" }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company reg */}
      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs" style={{ color: "#252523" }}>
            Craftspace Sdn Bhd (202201044683 / 1490380-V) — Trading as 资本道 Capital Mastery
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #0E0E0C" }}>
        <p className="text-xs" style={{ color: "#252523" }}>
          © 2025 资本道 Capital Mastery. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
