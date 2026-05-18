"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LogoImg from "@/components/LogoImg";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/i18n";
import { logout } from "@/app/actions/auth";

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
        <span style={{ fontSize: "9px", opacity: 0.4, marginLeft: 1, display: "inline-block", transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>&#x25BE;</span>
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50" style={{ minWidth: 200 }}>
          <div className="rounded-xl" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", boxShadow: "0 8px 24px rgba(28,24,20,0.08)", maxHeight: item.dropdown!.length > 6 ? "320px" : undefined, overflowY: item.dropdown!.length > 6 ? "auto" : undefined }}>
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
    ? [{ label: "资本启航", href: "/courses#capital-start" }, { label: "资本通", href: "/courses#capital-map" }, { label: "启动资本", href: "/courses#capital-code" }, { label: "资本道", href: "/courses#capital-dao" }]
    : [{ label: "Capital Start", href: "/courses#capital-start" }, { label: "The Capital Map", href: "/courses#capital-map" }, { label: "The Capital Code", href: "/courses#capital-code" }, { label: "Capital Dao", href: "/courses#capital-dao" }];

  const TOOLS_ITEMS: DropdownItem[] = isZh
    ? [
        { label: "企业财务路线图", href: "/tools/financial-roadmap" },
        { label: "智能报价系统", href: "/tools/pricing-system" },
        { label: "企业估值系统", href: "/tools/market-cap" },
        { label: "绩效分析系统", href: "/tools/pat-kpi" },
        { label: "现金流规划", href: "/tools/cash-flow" },
        { label: "资产负债表", href: "/tools/balance-sheet" },
        { label: "利润表", href: "/tools/income-statement" },
        { label: "损益平衡分析", href: "/tools/breakeven-analysis" },
        { label: "尽职调查", href: "/tools/due-diligence" },
        { label: "数据室管理", href: "/tools/data-room" },
        { label: "销售预测系统", href: "/tools/sales-forecast" },
        { label: "创业费用规划", href: "/tools/startup-expense" },
        { label: "交易流", href: "/tools/deal-flow" },
        { label: "资本路线图", href: "/tools/capital-roadmap" },
        { label: "融资系统", href: "/tools/fundraising-system" },
        { label: "投资关系", href: "/tools/investor-relations" },
        { label: "SPV架构", href: "/tools/spv-structure" },
        { label: "股权架构", href: "/tools/equity-structure" },
        { label: "资本架构", href: "/tools/capital-structure" },
        { label: "投资委员会", href: "/tools/investment-committee" },
        { label: "风控系统", href: "/tools/risk-control" },
        { label: "投资组合", href: "/tools/portfolio-management" },
      ]
    : [
        { label: "Financial Roadmap", href: "/tools/financial-roadmap" },
        { label: "Pricing System", href: "/tools/pricing-system" },
        { label: "Valuation Engine", href: "/tools/market-cap" },
        { label: "Performance Intelligence", href: "/tools/pat-kpi" },
        { label: "Cash Flow Planner", href: "/tools/cash-flow" },
        { label: "Balance Sheet", href: "/tools/balance-sheet" },
        { label: "Income Statement", href: "/tools/income-statement" },
        { label: "Breakeven Analysis", href: "/tools/breakeven-analysis" },
        { label: "Due Diligence", href: "/tools/due-diligence" },
        { label: "Data Room", href: "/tools/data-room" },
        { label: "Sales Forecast", href: "/tools/sales-forecast" },
        { label: "Startup Expense Planner", href: "/tools/startup-expense" },
        { label: "Deal Flow", href: "/tools/deal-flow" },
        { label: "Capital Roadmap", href: "/tools/capital-roadmap" },
        { label: "Fundraising System", href: "/tools/fundraising-system" },
        { label: "Investor Relations", href: "/tools/investor-relations" },
        { label: "SPV Structure", href: "/tools/spv-structure" },
        { label: "Equity Structure", href: "/tools/equity-structure" },
        { label: "Capital Structure", href: "/tools/capital-structure" },
        { label: "Investment Committee", href: "/tools/investment-committee" },
        { label: "Risk Control", href: "/tools/risk-control" },
        { label: "Portfolio Management", href: "/tools/portfolio-management" },
      ];

  const COMMUNITY_ITEMS: DropdownItem[] = isZh
    ? [{ label: "Investor Friday", href: "/community" }, { label: "Asian Circle", href: "/community" }, { label: "活动", href: "/community" }]
    : [{ label: "Investor Friday", href: "/community" }, { label: "Asian Circle", href: "/community" }, { label: "Events", href: "/community" }];

  const links: NavLink[] = [
    { label: isZh ? "首页" : "Home", href: "/" },
    { label: isZh ? "资本课程" : "Courses", href: "/courses", dropdown: COURSE_ITEMS },
    { label: isZh ? "资本工具" : "Tools", href: "/tools/guide" },
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
        {/* Level pill — mock Level 5 */}
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
          style={{ color: "#C9A84C", backgroundColor: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
          {isZh ? "L5 · 资本架构师" : "L5 · Capital Architect"}
        </span>
        <LanguageSwitcher current={locale} />
        {isLoggedIn ? (
          <form action={logout}>
            <button
              type="submit"
              className="text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer"
              style={{ color: "#68625C", backgroundColor: "transparent", border: "1px solid #E0D9CE" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#1C1814"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#C8C1B8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#68625C"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E0D9CE"; }}
            >
              {isZh ? "退出" : "Logout"}
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            {isZh ? "登录" : "Login"}
          </Link>
        )}
      </div>
    </nav>
  );
}
