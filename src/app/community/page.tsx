import Link from "next/link";
import SharedNav from "@/components/SharedNav";
import { getLocale } from "@/lib/i18n";
import { auth } from "@/lib/auth";
import type React from "react";

const DATA = {
  zh: {
    hero: {
      badge: "资本成长社群",
      title: "与志同道合的",
      title2: "企业家一起成长",
      desc: "加入资本道社群，与数百位中小企业主共同探讨资本运作、分享融资经验、互相赋能。",
    },
    channels: {
      title: "加入我们的社群平台",
      items: [
        {
          iconType: "facebook",
          name: "Facebook 社群",
          desc: "关注我们的 Facebook 专页，获取最新资本知识、课程资讯与学员故事。",
          href: "https://www.facebook.com/capitalmastery.net",
          color: "#4267B2",
          colorLight: "#EEF2FB",
        },
        {
          iconType: "instagram",
          name: "Instagram",
          desc: "每日资本思维分享、学员成果展示，用图文方式学习资本逻辑。",
          href: "https://www.instagram.com/capitalmasterydotnet",
          color: "#E1306C",
          colorLight: "#FDF0F4",
        },
        {
          iconType: "tiktok",
          name: "TikTok",
          desc: "短视频形式拆解资本运作概念，轻松学习融资、估值与股权设计。",
          href: "https://www.tiktok.com/@capitalmasterydotnet",
          color: "#008B8B",
          colorLight: "#EDF7F7",
        },
        {
          iconType: "whatsapp",
          name: "WhatsApp 学习群",
          desc: "加入专属 WhatsApp 学习群，与同期学员交流进度、分享资源，顾问团队实时解答。",
          href: "mailto:info@capitalmastery.net",
          color: "#1A8C4E",
          colorLight: "#EDFAF3",
        },
      ],
    },
    values: {
      title: "社群文化",
      items: [
        { icon: "", title: "互助共赢", desc: "鼓励学员分享实战经验，共同解决企业在资本化过程中遇到的真实挑战。" },
        { icon: "", title: "持续学习", desc: "定期分享最新资本市场动态、融资案例与工具更新，保持知识常新。" },
        { icon: "", title: "资源对接", desc: "连接投资人、法律顾问、财务专家等资本生态伙伴，为学员创造对接机会。" },
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
      secondary: "联系顾问",
    },
  },
  en: {
    hero: {
      badge: "Capital Growth Community",
      title: "Grow Together With",
      title2: "Like-Minded Entrepreneurs",
      desc: "Join the ZiBenDao community — connect with hundreds of SME owners to discuss capital operations, share fundraising experiences, and empower each other.",
    },
    channels: {
      title: "Join Our Community Platforms",
      items: [
        {
          iconType: "facebook",
          name: "Facebook Community",
          desc: "Follow our Facebook page for the latest capital knowledge, course updates, and student success stories.",
          href: "https://www.facebook.com/capitalmastery.net",
          color: "#4267B2",
          colorLight: "#EEF2FB",
        },
        {
          iconType: "instagram",
          name: "Instagram",
          desc: "Daily capital thinking insights, student results, and visual breakdowns of capital strategy.",
          href: "https://www.instagram.com/capitalmasterydotnet",
          color: "#E1306C",
          colorLight: "#FDF0F4",
        },
        {
          iconType: "tiktok",
          name: "TikTok",
          desc: "Short-form videos breaking down capital concepts — learn fundraising, valuation, and equity in minutes.",
          href: "https://www.tiktok.com/@capitalmasterydotnet",
          color: "#008B8B",
          colorLight: "#EDF7F7",
        },
        {
          iconType: "whatsapp",
          name: "WhatsApp Study Group",
          desc: "Join our exclusive WhatsApp group to exchange progress with fellow students and get real-time answers from our advisory team.",
          href: "mailto:info@capitalmastery.net",
          color: "#1A8C4E",
          colorLight: "#EDFAF3",
        },
      ],
    },
    values: {
      title: "Community Culture",
      items: [
        { icon: "", title: "Mutual Growth", desc: "We encourage students to share real experiences and collectively solve challenges faced during business capitalisation." },
        { icon: "", title: "Continuous Learning", desc: "Regular updates on capital market trends, fundraising case studies, and tool improvements to keep knowledge current." },
        { icon: "", title: "Resource Matching", desc: "Connect with investors, legal advisors, financial experts, and capital ecosystem partners to create real opportunities." },
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
      secondary: "Contact Advisor",
    },
  },
};

export default async function CommunityPage() {
  const locale = await getLocale();
  const session = await auth();
  const isEn = locale === "en";
  const d = isEn ? DATA.en : DATA.zh;

  return (
    <div style={{ backgroundColor: "#F7F4EF", color: "#1C1814", minHeight: "100vh" }}>
      <SharedNav locale={locale} activeHref="/community" isLoggedIn={!!session?.user} />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)", color: "#8B6514" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
            {d.hero.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {d.hero.title}
            <br />
            <span style={{ color: "#8B6514" }}>{d.hero.title2}</span>
          </h1>
          <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: "#68625C" }}>
            {d.hero.desc}
          </p>
        </div>
      </section>

      {/* Community Channels */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {d.channels.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {d.channels.items.map((ch) => {
              const ICONS: Record<string, React.ReactNode> = {
                facebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
                instagram: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>,
                tiktok: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>,
                whatsapp: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.112 1.523 5.84L.057 23.886a.5.5 0 0 0 .609.61l6.101-1.474A11.934 11.934 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.938 9.938 0 0 1-5.073-1.388l-.361-.214-3.754.907.934-3.667-.235-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
              };
              const iconKey = ch.iconType as string;
              return (
                <a
                  key={ch.name}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl p-7 flex flex-col relative overflow-hidden transition-shadow hover:shadow-md"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", textDecoration: "none" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${ch.color}70, transparent)` }} />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ch.colorLight, color: ch.color, border: `1px solid ${ch.color}25` }}
                    >
                      {ICONS[iconKey]}
                    </div>
                    <h3 className="font-semibold text-sm" style={{ color: "#1C1814" }}>{ch.name}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{ch.desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Values */}
      <section className="px-4 py-20" style={{ backgroundColor: "#EEE9E0" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {d.values.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {d.values.items.map((v) => (
              <div key={v.title} className="rounded-2xl p-7" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: "#1C1814" }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#68625C" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            {d.events.title}
          </h2>
          <div
            className="rounded-2xl p-12 flex flex-col items-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px dashed #C0B8B0" }}
          >
            <div
              className="text-xs font-mono px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)" }}
            >
              {d.events.coming}
            </div>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: "#68625C" }}>
              {d.events.desc}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="max-w-2xl mx-auto text-center py-16 px-10 rounded-3xl" style={{ backgroundColor: "#1C1814" }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#F0EBE1" }}>
            {d.cta.title}
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "#9A9490" }}>{d.cta.desc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
            >
              {d.cta.primary}
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: "transparent", color: "#9A9490", border: "1px solid #302B26" }}
            >
              {d.cta.secondary}
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #E0D9CE" }}>
        <p className="text-xs" style={{ color: "#9A9490" }}>
          {isEn ? "© 2025 ZiBenDao · Eutopos Equity Sdn Bhd" : "© 2025 资本道 · Eutopos Equity Sdn Bhd"}
        </p>
      </footer>
    </div>
  );
}
