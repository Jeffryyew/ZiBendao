"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoImg from "@/components/LogoImg";
import { logout } from "@/app/actions/auth";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import type { LayerId } from "@/lib/capitalModules";

interface Props {
  t: Dict;
  locale: Locale;
  isLoggedIn?: boolean;
}

export default function HomeClient({ t, locale, isLoggedIn }: Props) {
  return (
    <div style={{ backgroundColor: "#F7F4EF", color: "#1C1814", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar t={t.nav} locale={locale} isLoggedIn={isLoggedIn} />
      <HeroSection t={t.hero} isLoggedIn={isLoggedIn} />
      <WhatIsCapital />
      <CapitalLearningJourney locale={locale} />
      <ToolsPreview locale={locale} />
      <CTASection isLoggedIn={isLoggedIn} />
      <Footer t={t.footer} isLoggedIn={isLoggedIn} />
    </div>
  );
}

//  Navbar 

function Navbar({ t, locale, isLoggedIn }: { t: Dict["nav"]; locale: Locale; isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [openDropdown]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  type DropdownItem = { label: string; href: string; comingSoon?: boolean };
  type NavLink = { label: string; href: string; dropdown?: DropdownItem[] };

  const COURSE_ITEMS: DropdownItem[] = locale === "zh"
    ? [
        { label: "资本启航", href: "/courses#capital-start" },
        { label: "资本通", href: "/courses#capital-map" },
        { label: "启动资本", href: "/courses#capital-code" },
        { label: "资本道", href: "/courses#capital-dao" },
      ]
    : [
        { label: "Capital Start", href: "/courses#capital-start" },
        { label: "The Capital Map", href: "/courses#capital-map" },
        { label: "The Capital Code", href: "/courses#capital-code" },
        { label: "Capital Dao", href: "/courses#capital-dao" },
      ];

  const TOOLS_ITEMS: DropdownItem[] = locale === "zh"
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

  const COMMUNITY_ITEMS: DropdownItem[] = locale === "zh"
    ? [
        { label: "Investor Friday", href: "/community" },
        { label: "Asian Circle", href: "/community" },
        { label: "活动", href: "/community" },
      ]
    : [
        { label: "Investor Friday", href: "/community" },
        { label: "Asian Circle", href: "/community" },
        { label: "Events", href: "/community" },
      ];

  const NAV_LINKS: NavLink[] = [
    { label: t.home, href: "/" },
    { label: t.courses, href: "/courses", dropdown: COURSE_ITEMS },
    { label: t.tools, href: "/tools/guide", dropdown: TOOLS_ITEMS },
    { label: t.community, href: "/community", dropdown: COMMUNITY_ITEMS },
    { label: t.about, href: "/about" },
  ];

  return (
    <>
      <motion.nav
        ref={navRef}
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 py-4"
        style={{
          backgroundColor: scrolled || menuOpen ? "rgba(247,244,239,0.97)" : "rgba(247,244,239,0.8)",
          borderBottom: scrolled || menuOpen ? "1px solid #E0D9CE" : "1px solid transparent",
          backdropFilter: "blur(16px)",
          transition: "background-color 0.4s, border-color 0.4s",
        }}
      >
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <LogoImg height={34} onLight />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) =>
            item.dropdown ? (
              <div key={item.href} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.href ? null : item.href)}
                  className="text-sm transition-colors flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
                  style={{ color: openDropdown === item.href ? "#1C1814" : "#68625C" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#1C1814"; }}
                  onMouseLeave={(e) => { if (openDropdown !== item.href) (e.currentTarget as HTMLButtonElement).style.color = "#68625C"; }}
                >
                  {item.label}
                  <span style={{ fontSize: "9px", opacity: 0.4, marginLeft: 2, display: "inline-block", transform: openDropdown === item.href ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>&#x25BE;</span>
                </button>
                {openDropdown === item.href && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50" style={{ minWidth: 200 }}>
                    <div className="rounded-xl" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", boxShadow: "0 8px 24px rgba(28,24,20,0.08)", maxHeight: item.dropdown!.length > 6 ? "320px" : undefined, overflowY: item.dropdown!.length > 6 ? "auto" : undefined }}>
                      {item.dropdown.map((sub, i) =>
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
                            onClick={() => setOpenDropdown(null)}
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
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm transition-colors"
                style={{ color: "#68625C" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
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
                {locale === "zh" ? "退出" : "Logout"}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
            >
              {t.login}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="菜单"
        >
          <span className="block w-5 h-px transition-all" style={{ backgroundColor: "#1C1814", transform: menuOpen ? "rotate(45deg) translate(2px, 2px)" : "none" }} />
          <span className="block w-5 h-px transition-all" style={{ backgroundColor: "#1C1814", opacity: menuOpen ? 0 : 1 }} />
          <span className="block w-5 h-px transition-all" style={{ backgroundColor: "#1C1814", transform: menuOpen ? "rotate(-45deg) translate(2px, -2px)" : "none" }} />
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <div
        className="md:hidden fixed inset-0 z-40 transition-all duration-300"
        style={{ opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "auto" : "none" }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(28,24,20,0.25)" }}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className="absolute top-0 right-0 bottom-0 w-72 flex flex-col pt-20 pb-8 px-6"
          style={{
            backgroundColor: "#FFFFFF",
            borderLeft: "1px solid #E0D9CE",
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease",
          }}
        >
          <div className="flex-1 space-y-1">
            {NAV_LINKS.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 px-4 rounded-xl text-sm transition-colors"
                  style={{ color: "#68625C" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F7F4EF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
                >
                  {item.label}
                </Link>
                {item.dropdown && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.dropdown.map((sub) =>
                      sub.comingSoon ? (
                        <div key={sub.label} className="flex items-center gap-2 py-2 px-4 text-xs" style={{ color: "#C0B8B0" }}>
                          <span>↳ {sub.label}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", fontSize: "9px" }}>Soon</span>
                        </div>
                      ) : (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className="block py-2 px-4 rounded-lg text-xs transition-colors"
                          style={{ color: "#9A9490" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#9A9490"; }}
                        >
                          ↳ {sub.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <LanguageSwitcher current={locale} />
            {isLoggedIn ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm text-center cursor-pointer transition-colors"
                  style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
                >
                  {locale === "zh" ? "退出登录" : "Logout"}
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-3 rounded-xl font-semibold text-sm text-center"
                style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

//  Hero 

function HeroSection({ t, isLoggedIn }: { t: Dict["hero"]; isLoggedIn?: boolean }) {
  return (
    <section className="relative px-4 pt-36 pb-24 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(28,24,20,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(28,24,20,0.025) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-15%", left: "50%",
            transform: "translateX(-50%)",
            width: 900, height: 500,
            background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8"
          style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)", color: "#8B6514" }}
        >
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", backgroundColor: "#C9A84C" }} />
          {t.badge}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2.8rem, 5.5vw, 5rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
            color: "#1C1814",
          }}
        >
          {t.title_1}
          <br />
          <span style={{ color: "#8B6514" }}>
            {t.title_2}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
          className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#68625C" }}
        >
          {t.subtitle.split("\n").map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
            >
              进入平台 →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-8 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-88"
                style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
              >
                {t.cta_primary}
              </Link>
              <Link
                href="/tools"
                className="px-8 py-4 rounded-xl font-semibold text-base transition-all"
                style={{ backgroundColor: "transparent", color: "#68625C", border: "1px solid #E0D9CE" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#B0A898"; (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E0D9CE"; (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
              >
                {t.cta_secondary}
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

//  What Is Capital Transformation 

function WhatIsCapital() {
  const PILLARS = [
    {
      icon: "",
      title: "为什么企业需要资本化？",
      desc: "营业额高不代表企业有价值。资本化是将经营型企业，转化为可估值、可融资、可被投资的商业体。",
    },
    {
      icon: "",
      title: "资本思维 vs 经营思维",
      desc: "经营思维关注利润，资本思维关注估值。学习如何用资本逻辑重新设计你的企业结构与增长路径。",
    },
    {
      icon: "",
      title: "建立可投资的企业结构",
      desc: "SPV 架构、股权设计、融资准备度——让企业在需要资本时，已经具备被投资的能力。",
    },
  ];

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="px-4 py-24" style={{ backgroundColor: "#EEE9E0" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div
            className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
          >
            企业资本化
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 max-w-xl" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            什么是企业资本化？
          </h2>
          <p className="text-sm max-w-lg leading-relaxed" style={{ color: "#68625C" }}>
            从经营企业到资本企业，不只是融资——而是重新定义你的企业价值。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="p-8 rounded-2xl"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", transition: "box-shadow 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(28,24,20,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <h3 className="text-base font-semibold mb-3" style={{ color: "#1C1814" }}>{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

//  Capital Learning Journey 

function CapitalLearningJourney({ locale }: { locale: string }) {
  const LEVELS = [
    {
      stageLabel: "线上",
      name: "资本启航",
      nameEn: "Capital Start",
      desc: "专为忙碌创业者设计的线上入门课程。随时随地建立资本思维基础，零门槛开启资本成长之旅。",
      href: "/courses#capital-start",
      accent: "#7C5FBF",
      accentLight: "#F4F0FC",
    },
    {
      stageLabel: "阶段一",
      name: "资本通",
      nameEn: "The Capital Map",
      desc: "建立资本思维框架，认识企业从经营到资本化的核心逻辑。线下深度课程，知行合一。",
      href: "/courses#capital-map",
      accent: "#8B6514",
      accentLight: "#FBF4E4",
    },
    {
      stageLabel: "阶段二",
      name: "启动资本",
      nameEn: "The Capital Code",
      desc: "系统启动企业资本化进程。掌握 SPV 架构与融资结构，让企业具备被投资的真实能力。",
      href: "/courses#capital-code",
      accent: "#2D5FA8",
      accentLight: "#EDF2FC",
    },
    {
      stageLabel: "阶段三",
      name: "资本道",
      nameEn: "Capital Dao",
      desc: "进阶资本策略巅峰。理解IPO逻辑，建立企业级资本操作体系与投资人沟通能力。",
      href: "/courses#capital-dao",
      accent: "#8B6514",
      accentLight: "#FBF4E4",
    },
  ];

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="px-4 py-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
        >
          资本成长路径
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
          {locale === "en" ? "Capital Learning Journey" : "资本成长之路"}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
          从资本启蒙到企业操盘，系统化的四阶段成长体系
        </p>
      </motion.div>

      <div className="space-y-3">
        {LEVELS.map((lvl, i) => (
          <LevelCard key={lvl.name} lvl={lvl} delay={i * 0.1} inView={inView} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mt-10"
      >
        <Link
          href="/courses"
          className="inline-block text-sm px-6 py-2.5 rounded-xl transition-colors"
          style={{ color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)", backgroundColor: "#FBF4E4" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F5EDD4"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FBF4E4"; }}
        >
          查看完整课程体系 →
        </Link>
      </motion.div>
    </section>
  );
}

function LevelCard({
  lvl, delay, inView,
}: {
  lvl: {
    stageLabel: string; name: string; nameEn: string; desc: string;
    href: string; accent: string; accentLight: string;
  };
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <Link
        href={lvl.href}
        className="block rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E0D9CE",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = `${lvl.accent}50`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E0D9CE";
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${lvl.accent}80, ${lvl.accent}, ${lvl.accent}80)` }} />

        {/* Card body */}
        <div className="p-6 flex items-center gap-4">
          {/* Stage badge */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-center leading-tight"
            style={{ backgroundColor: lvl.accentLight, border: `1px solid ${lvl.accent}25`, color: lvl.accent }}
          >
            {lvl.stageLabel}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-bold text-base" style={{ color: "#1C1814", fontFamily: "var(--font-display)" }}>
                {lvl.name}
              </h3>
              <span className="text-xs" style={{ color: "#9A9490" }}>· {lvl.nameEn}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{lvl.desc}</p>
          </div>

          {/* Arrow */}
          <span className="flex-shrink-0 text-sm" style={{ color: lvl.accent }}>→</span>
        </div>
      </Link>
    </motion.div>
  );
}

//  Tools preview 

const LAYER_DISPLAY_HOME: Record<LayerId, { zh: string; en: string; color: string }> = {
  1: { zh: "商业基础层", en: "Business Foundation", color: "#C9A84C" },
  2: { zh: "资本成长层", en: "Capital Growth", color: "#3B82F6" },
  3: { zh: "资本架构层", en: "Capital Structure", color: "#8B5CF6" },
};

function ToolsPreview({ locale }: { locale: Locale }) {
  const isEn = locale === "en";
  const layers = [1, 2, 3] as const;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 py-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
        >
          {isEn ? `${CAPITAL_MODULES.length} Professional Tools` : `${CAPITAL_MODULES.length} 个专业工具`}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
          {isEn ? "Capital Tools System" : "企业资本工具系统"}
        </h2>
        <p className="text-sm" style={{ color: "#68625C" }}>
          {isEn ? "All calculations run locally in your browser" : "涵盖商业基础到资本架构的工具套件"}
        </p>
      </motion.div>

      <div className="space-y-12">
        {layers.map((layer, li) => {
          const meta = LAYER_META[layer];
          const display = LAYER_DISPLAY_HOME[layer];
          const modules = getModulesByLayer(layer);
          return (
            <motion.div
              key={layer}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: li * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}30` }}
                >
                  {isEn ? display.en : display.zh}
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                <span className="text-xs" style={{ color: "#9A9490" }}>
                  {modules.length} {isEn ? "tools" : "个工具"}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {modules.map((mod, i) => {
                  const t = isEn ? mod.en : mod.zh;
                  return (
                    <Link
                      key={mod.id}
                      href={`/tools/guide#${mod.id}`}
                      className="group block p-4 rounded-xl transition-all duration-200 relative overflow-hidden"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = `${meta.color}60`;
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FDFCF9";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E0D9CE";
                        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FFFFFF";
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, backgroundColor: meta.color, opacity: 0.4 }} />
                      <div className="text-sm font-semibold mb-1 mt-0.5" style={{ color: "#1C1814" }}>{t.name}</div>
                      <p className="text-xs leading-relaxed" style={{ color: "#9A9490" }}>{t.desc}</p>
                      <div className="mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: meta.color }}>
                        {isEn ? "Open →" : "使用 →"}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function ToolCard({
  tool, delay, inView, i,
}: {
  tool: { name: string; desc: string };
  delay: number;
  inView: boolean;
  i: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-5 rounded-xl flex items-center gap-4 cursor-default"
      style={{
        backgroundColor: "#FFFFFF",
        border: hovered ? "1px solid #B0A898" : "1px solid #E0D9CE",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 4px 16px rgba(28,24,20,0.08)" : "none",
        transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "#1C1814" }}>{tool.name}</span>
        </div>
        <div className="text-xs" style={{ color: "#9A9490" }}>{tool.desc}</div>
      </div>
      <span
        className="text-sm flex-shrink-0 transition-all"
        style={{ color: "#8B6514", opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-4px)" }}
      >
        →
      </span>
    </motion.div>
  );
}

//  CTA 

function CTASection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 py-28 relative overflow-hidden" style={{ backgroundColor: "#1C1814" }}>
      <div
        aria-hidden
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", width: 640, height: 320,
          background: "radial-gradient(ellipse at center, rgba(201,168,76,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65 }}
        className="max-w-2xl mx-auto text-center relative"
      >
        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-6"
          style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          开始你的资本成长路径
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#F0EBE1" }}>
          你的企业，<span style={{ color: "#C9A84C" }}>值得被资本看见</span>
        </h2>
        <p className="mb-10 text-sm leading-relaxed" style={{ color: "#9A9490" }}>
          从资本通开始，每一步都有系统、有工具。
          <br />
          注册开始，随时解锁下一个资本阶段。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-10 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88 inline-block"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
            >
              进入平台 →
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-10 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88 inline-block"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
            >
              开始资本之旅
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
}

//  Footer 

function Footer({ t, isLoggedIn }: { t: Dict["footer"]; isLoggedIn?: boolean }) {
  const LINKS = [
    { label: "课程体系", href: "/courses" },
    { label: "资本工具", href: "/tools/guide" },
    { label: "关于我们", href: "/about" },
    { label: "社群", href: "/community" },
    { label: isLoggedIn ? "进入平台" : "登录", href: isLoggedIn ? "/dashboard" : "/login" },
  ];

  return (
    <footer className="px-6 py-16" style={{ borderTop: "1px solid #E0D9CE", backgroundColor: "#F7F4EF" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-10">
        <div>
          <div className="mb-3"><LogoImg height={36} onLight /></div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#68625C" }}>{t.tagline}</p>

          <div className="flex gap-2">
            {[
              {
                label: "Facebook", href: "https://www.facebook.com/capitalmastery.net",
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
              },
              {
                label: "Instagram", href: "https://www.instagram.com/capitalmasterydotnet",
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
              },
              {
                label: "TikTok", href: "https://www.tiktok.com/@capitalmasterydotnet",
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>,
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#FFFFFF", color: "#9A9490", border: "1px solid #E0D9CE" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8B6514"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(139,101,20,0.25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#9A9490"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E0D9CE"; }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 md:pt-1">
          {LINKS.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm transition-colors"
              style={{ color: "#68625C" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs"
        style={{ borderTop: "1px solid #E0D9CE", color: "#C0B8B0" }}
      >
        <span>{t.copyright}</span>
      </div>
    </footer>
  );
}
                                                                                            