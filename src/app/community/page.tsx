import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import { getLocale } from "@/lib/i18n";

const DATA = {
  zh: {
    hero: {
      badge: "资本成长社群",
      title: "与志同道合的",
      title2: "企业家一起成长",
      desc: "加入资本道社群，与数百位马来西亚中小企业主共同探讨资本运作、分享融资经验、互相赋能。",
    },
    channels: {
      title: "加入我们的社群平台",
      items: [
        {
          icon: "📘",
          name: "Facebook 社群",
          desc: "关注我们的 Facebook 专页，获取最新资本知识、课程资讯与学员故事。",
          label: "前往 Facebook →",
          href: "https://www.facebook.com/capitalmastery.net",
          color: "#4267B2",
        },
        {
          icon: "📸",
          name: "Instagram",
          desc: "每日资本思维分享、学员成果展示，用图文方式学习资本逻辑。",
          label: "前往 Instagram →",
          href: "https://www.instagram.com/capitalmasterydotnet",
          color: "#E1306C",
        },
        {
          icon: "🎵",
          name: "TikTok",
          desc: "短视频形式拆解资本运作概念，轻松学习融资、估值与股权设计。",
          label: "前往 TikTok →",
          href: "https://www.tiktok.com/@capitalmasterydotnet",
          color: "#69C9D0",
        },
        {
          icon: "💬",
          name: "WhatsApp 学习群",
          desc: "加入专属 WhatsApp 学习群，与同期学员交流进度、分享资源，顾问团队实时解答。",
          label: "联系我们加入 →",
          href: "mailto:info@capitalmastery.net",
          color: "#25D366",
        },
      ],
    },
    values: {
      title: "社群文化",
      items: [
        { icon: "🤝", title: "互助共赢", desc: "鼓励学员分享实战经验，共同解决企业在资本化过程中遇到的真实挑战。" },
        { icon: "📚", title: "持续学习", desc: "定期分享最新资本市场动态、融资案例与工具更新，保持知识常新。" },
        { icon: "🔗", title: "资源对接", desc: "连接投资人、法律顾问、财务专家等资本生态伙伴，为学员创造对接机会。" },
      ],
    },
    events: {
      title: "即将举行活动",
      coming: "敬请期待",
      desc: "更多线上分享会、学员聚会与资本沙龙活动即将公布，关注社交媒体获取第一手资讯。",
    },
    cta: {
      title: "准备好加入了吗？",
      desc: "注册免费账户，即可进入学员专属社群，开启你的资本成长之旅。",
      primary: "注册 →",
      secondary: "联系我们",
    },
  },
  en: {
    hero: {
      badge: "Capital Growth Community",
      title: "Grow Together With",
      title2: "Like-Minded Entrepreneurs",
      desc: "Join the Capital Mastery community — connect with hundreds of Malaysian SME owners to discuss capital operations, share fundraising experiences, and empower each other.",
    },
    channels: {
      title: "Join Our Community Platforms",
      items: [
        {
          icon: "📘",
          name: "Facebook Community",
          desc: "Follow our Facebook page for the latest capital knowledge, course updates, and student success stories.",
          label: "Visit Facebook →",
          href: "https://www.facebook.com/capitalmastery.net",
          color: "#4267B2",
        },
        {
          icon: "📸",
          name: "Instagram",
          desc: "Daily capital thinking insights, student results, and visual breakdowns of capital strategy.",
          label: "Visit Instagram →",
          href: "https://www.instagram.com/capitalmasterydotnet",
          color: "#E1306C",
        },
        {
          icon: "🎵",
          name: "TikTok",
          desc: "Short-form videos breaking down capital concepts — learn fundraising, valuation, and equity in minutes.",
          label: "Visit TikTok →",
          href: "https://www.tiktok.com/@capitalmasterydotnet",
          color: "#69C9D0",
        },
        {
          icon: "💬",
          name: "WhatsApp Study Group",
          desc: "Join our exclusive WhatsApp group to exchange progress with fellow students and get real-time answers from our advisory team.",
          label: "Contact Us to Join →",
          href: "mailto:info@capitalmastery.net",
          color: "#25D366",
        },
      ],
    },
    values: {
      title: "Community Culture",
      items: [
        { icon: "🤝", title: "Mutual Growth", desc: "We encourage students to share real experiences and collectively solve challenges faced during business capitalisation." },
        { icon: "📚", title: "Continuous Learning", desc: "Regular updates on capital market trends, fundraising case studies, and tool improvements to keep knowledge current." },
        { icon: "🔗", title: "Resource Matching", desc: "Connect with investors, legal advisors, financial experts, and capital ecosystem partners to create real opportunities." },
      ],
    },
    events: {
      title: "Upcoming Events",
      coming: "Coming Soon",
      desc: "More online seminars, student gatherings, and capital salon events will be announced soon. Follow our social media for first access.",
    },
    cta: {
      title: "Ready to Join?",
      desc: "Register a free account to access the student community and begin your capital growth journey.",
      primary: "Register →",
      secondary: "Contact Us",
    },
  },
};

export default async function CommunityPage() {
  const locale = await getLocale();
  const isEn = locale === "en";
  const d = isEn ? DATA.en : DATA.zh;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0" }}>
      <SharedNav locale={locale} activeHref="/community" />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {d.hero.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)" }}>
            {d.hero.title}
            <br />
            <span style={{ color: "#C9A84C" }}>{d.hero.title2}</span>
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: "#666660" }}>
            {d.hero.desc}
          </p>
        </div>
      </section>

      {/* Community Channels */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>
            {d.channels.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {d.channels.items.map((ch) => (
              <div
                key={ch.name}
                className="rounded-2xl p-7 flex flex-col"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: `${ch.color}15`, border: `1px solid ${ch.color}30` }}
                  >
                    {ch.icon}
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: "#E0E0DC" }}>{ch.name}</h3>
                </div>
                <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "#555550" }}>{ch.desc}</p>
                <a
                  href={ch.href}
                  target={ch.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-block text-xs px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-80 self-start"
                  style={{ backgroundColor: `${ch.color}18`, color: ch.color, border: `1px solid ${ch.color}30` }}
                >
                  {ch.label}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className="px-4 py-20" style={{ backgroundColor: "#080808" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)" }}>
            {d.values.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {d.values.items.map((v) => (
              <div key={v.title} className="rounded-2xl p-7" style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}>
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: "#E0E0DC" }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#555550" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            {d.events.title}
          </h2>
          <div
            className="rounded-2xl p-12 flex flex-col items-center"
            style={{ backgroundColor: "#0A0A0A", border: "1px dashed #1A1A1A" }}
          >
            <div className="text-4xl mb-4">📅</div>
            <div
              className="text-xs font-mono px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              {d.events.coming}
            </div>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: "#444440" }}>
              {d.events.desc}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20" style={{ backgroundColor: "#080808" }}>
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl" style={{ background: "linear-gradient(145deg, #0A0A08, #0D0D0B)", border: "1px solid #1C1C1A" }}>
          <div
            aria-hidden
            style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, #C9A84C40, transparent)", pointerEvents: "none" }}
          />
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            {d.cta.title}
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "#555550" }}>{d.cta.desc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
            >
              {d.cta.primary}
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "#141414", color: "#888880", border: "1px solid #1A1A1A" }}
            >
              {d.cta.secondary}
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #0E0E0C" }}>
        <p className="text-xs" style={{ color: "#252523" }}>
          {isEn ? "© 2025 ZiBenDao Capital · Craftspace Sdn Bhd (202201044683 / 1490380-V)" : "© 2025 资本道 Capital Mastery · Craftspace Sdn Bhd (202201044683 / 1490380-V)"}
        </p>
      </footer>
    </div>
  );
}
