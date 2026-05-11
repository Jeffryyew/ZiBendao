"use client";

import { useState, useRef, useEffect } from "react";
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

function DropdownMenu({ item, isActive }: { item: NavLink; isActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0 p-0"
        style={{ color: isActive || open ? "#1C1814" : "#68625C" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#1C1814"; }}
        onMouseLeave={(e) => { if (!isActive && !open) (e.currentTarget as HTMLButtonElement).style.color = "#68625C"; }}
      >
        {item.label}
        <span style={{ fontSize: "9px", opacity: 0.4, marginLeft: 1, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50" style={{ minWidth: 168 }}>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", boxShadow: "0 8px 24px rgba(28,24,20,0.08)" }}>
            {item.dropdown!.map((sub, i) =>
              sub.comingSoon ? (
                <div
                  key={sub.label}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ borderBottom: i < item.dropdown!.length - 1 ? "1px solid #F0EBE1" : "none" }}
                >
                  <span className="text-xs" style={{ color: "#C0B8B0" }}>{sub.label}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", fontSize: "9px" }}>Soon</span>
                </div>
              ) : (
                <Link
                  key={sub.label}
                  href={sub.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-xs transition-colors"
                  style={{ color: "#68625C", borderBottom: i < item.dropdown!.length - 1 ? "1px solid #F0EBE1" : "none" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F7F4EF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
                >
                  {sub.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SharedNav({ locale, activeHref, isLoggedIn }: SharedNavProps) {
  const isZh = locale === "zh";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const COURSE_ITEMS: DropdownItem[] = isZh
    ? [{ label: "资本启航", href: "/courses" }, { label: "资本通", href: "/courses" }, { label: "启动资本", href: "/courses" }, { label: "资本道", href: "/courses" }]
    : [{ label: "Capital Start", href: "/courses" }, { label: "The Capital Map", href: "/courses" }, { label: "The Capital Code", href: "/courses" }, { label: "Capital Dao", href: "/courses" }];

  const TOOLS_ITEMS: DropdownItem[] = isZh
    ? [{ label: "企业估值", href: "/tools/market-cap" }, { label: "融资计算", href: "/tools", comingSoon: true }, { label: "报价系统", href: "/tools/pricing-system" }, { label: "财务预测", href: "/tools/financial-roadmap" }, { label: "股权模拟", href: "/tools", comingSoon: true }]
    : [{ label: "Valuation Engine", href: "/tools/market-cap" }, { label: "Funding Calculator", href: "/tools", comingSoon: true }, { label: "Quotation System", href: "/tools/pricing-system" }, { label: "Financial Forecast", href: "/tools/financial-roadmap" }, { label: "Equity Simulator", href: "/tools", comingSoon: true }];

  const COMMUNITY_ITEMS: DropdownItem[] = isZh
    ? [{ label: "Investor Friday", href: "/community" }, { label: "Asian Circle", href: "/community" }, { label: "活动", href: "/community" }, { label: "会员", href: "/community" }]
    : [{ label: "Investor Friday", href: "/community" }, { label: "Asian Circle", href: "/community" }, { label: "Events", href: "/community" }, { label: "Members", href: "/community" }];

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
        backgroundColor: scrolled ? "rgba(247,244,239,0.97)" : "rgba(247,244,239,0.85)",
        borderBottom: scrolled ? "1px solid #E0D9CE" : "1px solid transparent",
        backdropFilter: "blur(16px)",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      <Link href="/"><LogoImg height={32} onLight /></Link>

      <div className="hidden md:flex items-center gap-6">
        {links.map((item) =>
          item.dropdown ? (
            <DropdownMenu key={item.href} item={item} isActive={activeHref === item.href} />
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm transition-colors"
              style={{ color: activeHref === item.href ? "#1C1814" : "#68625C" }}
              onMouseEnter={(e) => { if (activeHref !== item.href) (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
              onMouseLeave={(e) => { if (activeHref !== item.href) (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
            >
              {item.label}
            </Link>
          )
        )}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} />
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            {isZh ? "进入平台 →" : "Dashboard →"}
          </Link>
        ) : (
          <>
            <Link href="/login" className="hidden sm:block text-sm transition-colors" style={{ color: "#68625C" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
            >
              {isZh ? "登录" : "Login"}
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
            >
              {isZh ? "注册" : "Register"}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
