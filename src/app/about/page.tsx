import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import { getLocale } from "@/lib/i18n";

const DATA = {
  zh: {
    founder: {
      name: "姚国雄",
      nameEn: "Jeffry Yew",
      role: "创始人",
      biz: "25 年商业发展经验",
      finance: "13 年融资专业经验",
      bio: "姚国雄（Jeffry Yew）是马来西亚的企业资本运作导师，深耕房地产、科技与零售领域，足迹横跨亚洲多个市场。他创立资本道，致力于将复杂的资本运作知识系统化，帮助中小企业主与创业者掌握企业估值、股权架构、融资杠杆与 IPO 路线，建立可靠、可投、可扩展的企业。",
      bioLabel: "创始人简介",
      stats: [{ value: "25年", label: "商业发展经验" }, { value: "13年", label: "融资专业经验" }],
    },
    hero: {
      badge: "关于我们",
      title: "掌握资本之道，",
      title2: "创建可靠、可投、可扩展企业",
      desc: "资本道由 Eutopos Equity Sdn Bhd 运营，专注于企业资本运作教育的综合平台。我们帮助中小企业主与创业者系统掌握资本运作，从融资到上市，每一步都有清晰方向。",
    },
    mission: {
      title: "我们的使命",
      desc: "帮助中小企业主与创业者系统掌握企业估值、股权架构、融资杠杆与资本退出策略，建立可靠、可投、可扩展的企业，最终实现从创业到资本市场的完整跨越。",
      highlight: "可靠、可投、可扩展",
    },
    values: {
      title: "我们的价值观",
      items: [
        { icon: "🎯", title: "实战导向", desc: "每个知识点都源于真实案例，学员即学即用，直接应用于自身企业。" },
        { icon: "📈", title: "系统思维", desc: "从企业估值到 IPO 路径，构建完整的资本运作知识体系，而非碎片化内容。" },
        { icon: "🔐", title: "专业保密", desc: "客户财务与合约信息严格保密，数字化处理，安全可靠。" },
        { icon: "🤝", title: "长期陪伴", desc: "不只是一次课程，而是企业从创业到上市全程的知识与资源伙伴。" },
      ],
    },
    programs: {
      title: "核心课程项目",
      viewAll: "查看完整课程体系 →",
      items: [
        { stage: "线上", name: "资本启航", nameEn: "Capital Start", desc: "线上入门课程，随时随地建立资本思维基础，零门槛开启资本成长之旅。" },
        { stage: "阶段一", name: "资本通", nameEn: "The Capital Map", desc: "线下入门课程，建立正确的资本思维框架，认识企业资本化核心逻辑。" },
        { stage: "阶段二", name: "启动资本", nameEn: "The Capital Code", desc: "实战进阶训练，系统学习融资前梳理、包装与投资人对接全流程。" },
        { stage: "阶段三", name: "资本道", nameEn: "Capital Dao", desc: "高阶资本运作系统，涵盖估值提升、PE 股权架构、资本杠杆运用直至 IPO 路径。" },
      ],
    },
    testimonials: {
      title: "学员心声",
      items: [
        { name: "沈炜翔", company: "兄弟冰室", quote: "透过资本道的系统，我清楚了解到企业估值的关键，让我在融资谈判中更有底气。" },
        { name: "Ada Tan", company: "Pixel Bear Sdn Bhd", quote: "Jeffry 老师将复杂的股权架构讲解得非常清晰，是我学过最具实战价值的商业课程。" },
        { name: "叶志煌", company: "创业者 / 教育家", quote: "资本道不只是课程，而是一套完整的思维升级，让我看待企业的角度完全改变了。" },
      ],
    },
    contact: {
      title: "联系我们",
      desc: "如需咨询课程、企业合作或一对一顾问服务，欢迎通过社交媒体与我们联系。",
      address_label: "📍 地址",
      cta_register: "注册 →",
      cta_contact: "联系我们",
    },
  },
  en: {
    founder: {
      name: "Jeffry Yew",
      nameEn: "姚国雄",
      role: "Founder",
      biz: "25 years Business Development",
      finance: "13 years Fundraising Expertise",
      bio: "Jeffry Yew is Malaysia's leading enterprise capital operations mentor, specialising in real estate, technology, and retail across Asian markets. He founded ZiBenDao to systematise complex capital operation knowledge, helping SME owners and entrepreneurs master enterprise valuation, equity structuring, financial leverage, and IPO pathways to build reliable, investable, and scalable businesses.",
      bioLabel: "Founder Profile",
      stats: [{ value: "25yrs", label: "Business Development" }, { value: "13yrs", label: "Fundraising Expertise" }],
    },
    hero: {
      badge: "About Us",
      title: "Master Capital Strategy,",
      title2: "Build Reliable, Investable, Scalable Enterprises",
      desc: "Capital Mastery, operated by Craftspace Sdn Bhd, is Malaysia's comprehensive platform focused on enterprise capital operations education. We help SME owners and entrepreneurs systematically master capital operations — with a clear pathway from fundraising to IPO.",
    },
    mission: {
      title: "Our Mission",
      desc: "To help SME owners and entrepreneurs systematically master enterprise valuation, equity structuring, financial leverage, and capital exit strategies — building reliable, investable, scalable businesses and achieving the full journey from startup to capital markets.",
      highlight: "Reliable, Investable, Scalable",
    },
    values: {
      title: "Our Core Values",
      items: [
        { icon: "🎯", title: "Practice-Driven", desc: "Every concept is grounded in real cases. Students apply knowledge immediately to their own businesses." },
        { icon: "📈", title: "Systems Thinking", desc: "From enterprise valuation to IPO pathways — we build a complete knowledge system, not fragmented content." },
        { icon: "🔐", title: "Professional Confidentiality", desc: "Client financial and contract information is strictly confidential, digitally processed, and secure." },
        { icon: "🤝", title: "Long-term Partnership", desc: "Not just a course — but a knowledge and resource partner throughout your entire journey from startup to listing." },
      ],
    },
    programs: {
      title: "Programme Overview",
      viewAll: "View Full Programme Details →",
      items: [
        { stage: "Online", name: "Capital Start", nameEn: "资本启航", desc: "Online entry-level programme. Build capital thinking fundamentals anytime, anywhere with zero barriers." },
        { stage: "Stage 1", name: "The Capital Map", nameEn: "资本通", desc: "Offline introductory programme. Build the right capital thinking framework and understand the core logic of enterprise capitalisation." },
        { stage: "Stage 2", name: "The Capital Code", nameEn: "启动资本", desc: "Offline advanced training. Systematically learn pre-fundraising preparation, business packaging, and investor engagement." },
        { stage: "Stage 3", name: "Capital Dao", nameEn: "资本道", desc: "Offline advanced capital operations system covering valuation enhancement, PE equity structures, and full IPO pathway planning." },
      ],
    },
    testimonials: {
      title: "Student Testimonials",
      items: [
        { name: "沈炜翔", company: "兄弟冰室", quote: "Through the Capital Mastery system, I clearly understood the key to enterprise valuation — giving me much more confidence in fundraising negotiations." },
        { name: "Ada Tan", company: "Pixel Bear Sdn Bhd", quote: "Jeffry explains complex equity structures with remarkable clarity. It's the most practically valuable business course I've taken." },
        { name: "叶志煌", company: "Entrepreneur / Educator", quote: "Capital Mastery is not just a course — it's a complete mindset upgrade that completely changed how I view business." },
      ],
    },
    contact: {
      title: "Contact Us",
      desc: "For course enquiries, corporate partnerships, or one-to-one advisory services, please reach us via social media.",
      address_label: "📍 Address",
      cta_register: "Register →",
      cta_contact: "Contact Us",
    },
  },
};

export default async function AboutPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const d = isEn ? DATA.en : DATA.zh;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F4EF", color: "#1C1814" }}>
      <SharedNav locale={locale} activeHref="/about" />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6" style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}>
            {d.hero.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {d.hero.title}
            <br />
            <span style={{ color: "#8B6514" }}>{d.hero.title2}</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#68625C" }}>{d.hero.desc}</p>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", boxShadow: "0 4px 24px rgba(28,24,20,0.06)" }}>
            <div className="mb-6">
              <div className="text-xs mb-0.5" style={{ color: "#9A9490" }}>{d.founder.nameEn}</div>
              <h3 className="font-bold text-xl mb-0.5" style={{ color: "#1C1814" }}>{d.founder.name}</h3>
              <div className="text-xs" style={{ color: "#8B6514" }}>{d.founder.role}</div>
            </div>
            <div>
              <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4" style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}>
                {d.founder.bioLabel}
              </div>
              <p className="text-sm leading-loose mb-6" style={{ color: "#68625C" }}>{d.founder.bio}</p>
              <div className="grid grid-cols-2 gap-4">
                {d.founder.stats.map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl" style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.12)" }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: "#8B6514", fontFamily: "var(--font-display)" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4" style={{ backgroundColor: "#EEE9E0" }}>
        <div className="max-w-4xl mx-auto rounded-2xl p-10 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
          <div className="text-3xl mb-4" style={{ color: "#C9A84C" }}>✦</div>
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>{d.mission.title}</h2>
          <p className="text-sm leading-loose max-w-2xl mx-auto" style={{ color: "#68625C" }}>
            {d.mission.desc.split(d.mission.highlight).map((part, i, arr) => (
              <span key={i}>{part}{i < arr.length - 1 && <strong style={{ color: "#8B6514" }}>{d.mission.highlight}</strong>}</span>
            ))}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>{d.values.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {d.values.items.map((v) => (
              <div key={v.title} className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: "#1C1814" }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#68625C" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 px-4" style={{ backgroundColor: "#EEE9E0" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>{d.programs.title}</h2>
          <div className="space-y-4">
            {d.programs.items.map((p, i) => (
              <div key={p.name} className="rounded-2xl p-6 flex gap-4 items-start" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-xs mb-0.5" style={{ color: "#8B6514" }}>{p.stage} · {p.nameEn}</div>
                  <h3 className="font-semibold mb-1.5 text-sm" style={{ color: "#1C1814" }}>{p.name}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#68625C" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/courses" className="inline-block text-sm px-6 py-2.5 rounded-xl" style={{ color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)", backgroundColor: "#FBF4E4" }}>
              {d.programs.viewAll}
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>{d.testimonials.title}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {d.testimonials.items.map((t) => (
              <div key={t.name} className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
                <div className="text-lg mb-4" style={{ color: "#C9A84C" }}>❝</div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#68625C" }}>{t.quote}</p>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "#1C1814" }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "#9A9490" }}>{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4" style={{ backgroundColor: "#EEE9E0" }}>
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-10" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>{d.contact.title}</h2>
            <p className="text-xs mb-8" style={{ color: "#9A9490" }}>{d.contact.desc}</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Facebook", href: "https://www.facebook.com/capitalmastery.net" },
                { label: "Instagram", href: "https://www.instagram.com/capitalmasterydotnet" },
                { label: "TikTok", href: "https://www.tiktok.com/@capitalmasterydotnet" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="text-xs px-4 py-2 rounded-lg font-medium transition-colors" style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #E0D9CE" }}>
        <p className="text-xs" style={{ color: "#C0B8B0" }}>
          {isEn ? "© 2025 ZiBenDao Capital. All rights reserved." : "© 2025 资本道 Capital Mastery. 保留所有权利。"}
        </p>
      </footer>
    </div>
  );
}
