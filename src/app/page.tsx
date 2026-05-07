import Link from "next/link";
import { getLocale, getT, type Dict, type Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function HomePage() {
  const locale = await getLocale();
  const t = await getT();

  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0", minHeight: "100vh" }}>
      <Navbar t={t.nav} locale={locale} />
      <HeroSection t={t.hero} />
      <FeaturesSection />
      <RolesSection />
      <ToolsPreview />
      <CTASection />
      <Footer t={t.footer} />
    </div>
  );
}

function Navbar({ t, locale }: { t: Dict["nav"]; locale: Locale }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: "rgba(13,13,13,0.9)",
        borderBottom: "1px solid #1A1A1A",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
          资本道
        </span>
        <span className="text-sm hidden sm:block" style={{ color: "#666660" }}>ZiBenDao</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {[
          { label: t.courses, href: "/courses" },
          { label: t.tools, href: "/tools" },
          { label: t.pricing, href: "/pricing" },
          { label: t.about, href: "/about" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm transition-colors"
            style={{ color: "#A0A09A" }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} />
        <Link
          href="/login"
          className="text-sm px-4 py-2 rounded-xl"
          style={{ color: "#A0A09A" }}
        >
          {t.login}
        </Link>
        <Link
          href="/register"
          className="text-sm px-4 py-2 rounded-xl font-medium"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          {t.register}
        </Link>
      </div>
    </nav>
  );
}

function HeroSection({ t }: { t: Dict["hero"] }) {
  return (
    <section className="flex flex-col items-center justify-center text-center px-4 pt-40 pb-24">
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8"
        style={{ backgroundColor: "#1A1A1A", border: "1px solid #333333", color: "#C9A84C" }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
        {t.badge}
      </div>

      <h1
        className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {t.title_1}
        <br />
        <span style={{ color: "#C9A84C" }}>{t.title_2}</span>
      </h1>

      <p className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ color: "#A0A09A" }}>
        {t.subtitle.split("\n").map((line, i) => (
          <span key={i}>{line}{i === 0 && <br />}</span>
        ))}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/register"
          className="px-8 py-4 rounded-xl font-semibold text-base"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          {t.cta_primary}
        </Link>
        <Link
          href="/courses"
          className="px-8 py-4 rounded-xl font-semibold text-base"
          style={{ backgroundColor: "#1A1A1A", color: "#F5F5F0", border: "1px solid #333333" }}
        >
          {t.cta_secondary}
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-20 max-w-lg">
        {[
          { value: "3", label: "学习等级" },
          { value: "4+", label: "计算工具" },
          { value: "∞", label: "成长可能" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold" style={{ color: "#C9A84C", fontFamily: "var(--font-display)" }}>
              {stat.value}
            </div>
            <div className="text-sm mt-1" style={{ color: "#666660" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "📚",
      title: "关卡式金融课程",
      desc: "像游戏一样解锁知识。从基础理财到高级资本运作，系统化学习路径，完成一关才能进下一关。",
    },
    {
      icon: "🧮",
      title: "专业计算工具",
      desc: "金融路线图、市值计算器、PAT&KPI分析、报价系统。专业级工具，让数据说话。",
    },
    {
      icon: "🤝",
      title: "资本咨询服务",
      desc: "专属顾问一对一服务，自动生成咨询合约，文件管理全程数字化，高效专业。",
    },
  ];

  return (
    <section className="px-4 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          三大核心模块
        </h2>
        <p style={{ color: "#A0A09A" }}>专为华人市场设计的金融成长生态</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-8 rounded-2xl"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333333" }}
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-3" style={{ color: "#F5F5F0" }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RolesSection() {
  const roles = [
    {
      name: "免费会员",
      badge: "FREE",
      badgeColor: "#666660",
      perks: ["体验前2-3个课程关卡", "1个基础计算工具", "注册即可使用"],
      cta: "立即注册",
      href: "/register",
      featured: false,
    },
    {
      name: "学生会员",
      badge: "L1 → L3",
      badgeColor: "#C9A84C",
      perks: ["完整课程体系", "全套计算工具", "成就徽章系统", "等级解锁进阶内容"],
      cta: "查看定价",
      href: "/pricing",
      featured: true,
    },
    {
      name: "企业客户",
      badge: "CLIENT",
      badgeColor: "#A0A09A",
      perks: ["专属顾问服务", "定制计算工具", "自动合约生成", "专属文件管理"],
      cta: "联系我们",
      href: "/about",
      featured: false,
    },
  ];

  return (
    <section className="px-4 py-20" style={{ backgroundColor: "#111111" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            适合你的方案
          </h2>
          <p style={{ color: "#A0A09A" }}>无论你是学习者还是企业，都有对应的解决方案</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.name}
              className="p-8 rounded-2xl flex flex-col"
              style={{
                backgroundColor: role.featured ? "#1A1A1A" : "#161616",
                border: `1px solid ${role.featured ? "#C9A84C" : "#2A2A2A"}`,
                boxShadow: role.featured ? "0 0 24px rgba(201,168,76,0.15)" : "none",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">{role.name}</h3>
                <span
                  className="text-xs px-3 py-1 rounded-full font-mono"
                  style={{ backgroundColor: `${role.badgeColor}20`, color: role.badgeColor }}
                >
                  {role.badge}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {role.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm" style={{ color: "#A0A09A" }}>
                    <span style={{ color: "#C9A84C" }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>

              <Link
                href={role.href}
                className="text-center py-3 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: role.featured ? "#C9A84C" : "transparent",
                  color: role.featured ? "#0D0D0D" : "#A0A09A",
                  border: role.featured ? "none" : "1px solid #333333",
                }}
              >
                {role.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ToolsPreview() {
  const tools = [
    { name: "金融路线图方程式", level: "L1", desc: "规划你的财务目标与实现路径" },
    { name: "产品服务报价系统", level: "L2", desc: "专业报价单生成，支持PDF导出" },
    { name: "市值/市盈率计算器", level: "L2", desc: "估值分析，洞察市场机会" },
    { name: "PAT & KPI 计算器", level: "L3", desc: "税后利润与关键指标可视化分析" },
  ];

  return (
    <section className="px-4 py-20 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          专业计算工具库
        </h2>
        <p style={{ color: "#A0A09A" }}>每个工具均可导出 PDF / Excel，数据结果可视化呈现</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="p-6 rounded-xl flex items-center gap-4"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-mono font-bold"
              style={{ backgroundColor: "#C9A84C20", color: "#C9A84C" }}
            >
              {tool.level}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm mb-0.5" style={{ color: "#F5F5F0" }}>{tool.name}</div>
              <div className="text-xs" style={{ color: "#666660" }}>{tool.desc}</div>
            </div>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
              style={{ backgroundColor: "#2A2A2A", color: "#666660" }}
            >
              🔒
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm mt-8" style={{ color: "#666660" }}>
        注册后即可体验基础工具，升级解锁全部功能
      </p>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-4 py-24">
      <div
        className="max-w-3xl mx-auto text-center p-12 rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #222222 100%)",
          border: "1px solid #C9A84C",
          boxShadow: "0 0 40px rgba(201,168,76,0.1)",
        }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          开始你的<span style={{ color: "#C9A84C" }}>资本之旅</span>
        </h2>
        <p className="mb-8 text-base" style={{ color: "#A0A09A" }}>
          免费注册，体验前3关课程和基础工具。随时升级，解锁完整内容。
        </p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 rounded-xl font-semibold text-base"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          免费开始学习
        </Link>
      </div>
    </section>
  );
}

function Footer({ t }: { t: Dict["footer"] }) {
  const links = {
    平台: ["课程", "工具", "定价", "关于我们"],
    账号: ["登录", "注册", "升级会员"],
  };

  return (
    <footer className="px-6 py-12 border-t" style={{ borderColor: "#1A1A1A" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div>
          <div className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
            资本道
          </div>
          <p className="text-sm" style={{ color: "#666660" }}>{t.tagline}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div className="font-medium mb-3" style={{ color: "#A0A09A" }}>{section}</div>
              {items.map((item) => (
                <div key={item} className="mb-2">
                  <span className="cursor-pointer" style={{ color: "#666660" }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto mt-10 pt-6 border-t text-sm text-center"
        style={{ borderColor: "#1A1A1A", color: "#666660" }}
      >
        {t.copyright}
      </div>
    </footer>
  );
}
