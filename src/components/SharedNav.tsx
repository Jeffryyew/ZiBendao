"use client";

import Link from "next/link";
import LogoImg from "@/components/LogoImg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n";

interface SharedNavProps {
  locale: Locale;
  activeHref?: string;
  isLoggedIn?: boolean;
}

type DropdownItem = { label: string; href: string; comingSoon?: boolean };
type NavLink = { label: string; href: string; dropdown?: DropdownItem[] };

export default function SharedNav({ locale, activeHref, isLoggedIn }: SharedNavProps) {
  const isZh = locale === "zh";

  const COURSE_ITEMS: DropdownItem[] = isZh
    ? [
        { label: "资本启航", href: "/courses" },
        { label: "资本通", href: "/courses" },
        { label: "启动资本", href: "/courses" },
        { label: "资本道", href: "/courses" },
      ]
    : [
        { label: "Capital Start", href: "/courses" },
        { label: "The Capital Map", href: "/courses" },
        { label: "The Capital Code", href: "/courses" },
        { label: "Capital Dao", href: "/courses" },
      ];

  const TOOLS_ITEMS: DropdownItem[] = isZh
    ? [
        { label: "企业估值", href: "/tools/market-cap" },
        { label: "融资计算", href: "/tools", comingSoon: true },
        { label: "报价系统", href: "/tools/pricing-system" },
        { label: "财务预测", href: "/tools/financial-roadmap" },
        { label: "股权模拟", href: "/tools", comingSoon: true },
      ]
    : [
        { label: "Valuation Engine", href: "/tools/market-cap" },
        { label: "Funding Calculator", href: "/tools", comingSoon: true },
        { label: "Quotation System", href: "/tools/pricing-system" },
        { label: "Financial Forecast", href: "/tools/financial-roadmap" },
        { label: "Equity Simulator", href: "/tools", comingSoon: true },
      ];

  const COMMUNITY_ITEMS: DropdownItem[] = isZh
    ? [
        { label: "Investor Friday", href: "/community" },
        { label: "Asian Circle", href: "/community" },
        { label: "活动", href: "/community" },
        { label: "会员", href: "/community" },
      ]
    : [
        { label: "Investor Friday", href: "/community" },
        { label: "Asian Circle", href: "/community" },
        { label: "Events", href: "/community" },
        { label: "Members", href: "/community" },
      ];

  const links: NavLink[] = [
    { label: isZh ? "首页" : "Home", href: "/" },
    { label: isZh ? "资本课程" : "Courses", href: "/courses", dropdown: COURSE_ITEMS },
    { label: isZh ? "资本工具" : "Tools", href: "/tools", dropdown: TOOLS_ITEMS },
    { label: isZh ? "社群" : "Community", href: "/community", dropdown: COMMUNITY_ITEMS },
    { label: isZh ? "关于" : "About", href: "/about" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{
        backgroundColor: "rgba(13,13,13,0.95)",
        borderBottom: "1px solid #1A1A1A",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link href="/">
        <LogoImg height={32} />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((item) =>
          item.dropdown ? (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className="text-sm flex items-center gap-1 transition-colors"
                style={{ color: activeHref === item.href ? "#C9A84C" : "#666660" }}
                onMouseEnter={(e) => { if (activeHref !== item.href) (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
                onMouseLeave={(e) => { if (activeHref !== item.href) (e.currentTarget as HTMLAnchorElement).style.color = "#666660"; }}
              >
                {item.label}
                <span style={{ fontSize: "9px", opacity: 0.5, marginLeft: 1 }}>▾</span>
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", minWidth: 168 }}>
                  {item.dropdown.map((sub, i) =>
                    sub.comingSoon ? (
                      <div
                        key={sub.label}
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{ borderBottom: i < item.dropdown!.length - 1 ? "1px solid #111110" : "none" }}
                      >
                        <span className="text-xs" style={{ color: "#3A3A38" }}>{sub.label}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "rgba(201,168,76,0.07)", color: "#5A5030", fontSize: "9px" }}>Soon</span>
                      </div>
                    ) : (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-4 py-2.5 text-xs transition-colors"
                        style={{ color: "#888880", borderBottom: i < item.dropdown!.length - 1 ? "1px solid #111110" : "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(201,168,76,0.05)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#888880"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
                      >
                        {sub.label}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm transition-colors"
              style={{ color: activeHref === item.href ? "#C9A84C" : "#666660" }}
              onMouseEnter={(e) => { if (activeHref !== item.href) (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { if (activeHref !== item.href) (e.currentTarget as HTMLAnchorElement).style.color = "#666660"; }}
            >
              {item.label}
            </Link>
          )
        )}
      </div>

      {/* Right: lang switcher + auth */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} />
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
          >
            {isZh ? "进入平台 →" : "Dashboard →"}
          </Link>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block text-sm" style={{ color: "#666660" }}>
              {isZh ? "登录" : "Login"}
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              {isZh ? "免费注册" : "Get Started Free"}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
