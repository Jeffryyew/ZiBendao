"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoImg from "@/components/LogoImg";

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
      <ToolsPreview />
      <FounderSection locale={locale} />
      <CTASection isLoggedIn={isLoggedIn} />
      <Footer t={t.footer} />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

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

  const TOOLS_ITEMS: DropdownItem[] = locale === "zh"
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

  const COMMUNITY_ITEMS: DropdownItem[] = locale === "zh"
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

  const NAV_LINKS: NavLink[] = [
    { label: t.home, href: "/" },
    { label: t.courses, href: "/courses", dropdown: COURSE_ITEMS },
    { label: t.tools, href: "/tools", dropdown: TOOLS_ITEMS },
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
                  <span style={{ fontSize: "9px", opacity: 0.4, marginLeft: 2, display: "inline-block", transform: openDropdown === item.href ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>▾</span>
                </button>
                {openDropdown === item.href && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50" style={{ minWidth: 168 }}>
                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", boxShadow: "0 8px 24px rgba(28,24,20,0.08)" }}>
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
            <Link
              href="/dashboard"
              className="text-sm px-5 py-2 rounded-xl font-semibold transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
            >
              进入平台 →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 rounded-xl transition-colors"
                style={{ color: "#68625C" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
              >
                {t.register}
              </Link>
            </>
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
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block w-full py-3 rounded-xl font-semibold text-sm text-center"
                style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
              >
                进入平台 →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 rounded-xl text-sm text-center"
                  style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 rounded-xl font-semibold text-sm text-center"
                  style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
                >
                  {t.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

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
                href="/register"
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

// ─── What Is Capital Transformation ──────────────────────────────────────────

function WhatIsCapital() {
  const PILLARS = [
    {
      icon: "◈",
      title: "为什么企业需要资本化？",
      desc: "营业额高不代表企业有价值。资本化是将经营型企业，转化为可估值、可融资、可被投资的商业体。",
    },
    {
      icon: "◎",
      title: "资本思维 vs 经营思维",
      desc: "经营思维关注利润，资本思维关注估值。学习如何用资本逻辑重新设计你的企业结构与增长路径。",
    },
    {
      icon: "◐",
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
              <div className="text-3xl mb-6" style={{ color: "#C9A84C" }}>{p.icon}</div>
              <h3 className="text-base font-semibold mb-3" style={{ color: "#1C1814" }}>{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Capital Learning Journey ─────────────────────────────────────────────────

function CapitalLearningJourney({ locale }: { locale: string }) {
  const LEVELS = [
    {
      stageLabel: "线上",
      name: "资本启航",
      nameEn: "Capital Start",
      desc: "专为忙碌创业者设计的线上入门课程。随时随地建立资本思维基础，零门槛开启资本成长之旅。",
      topics: ["资本思维框架", "估值核心概念", "资本化第一步"],
      xp: "+30 XP",
      duration: "随时开始",
      badgeLabel: "Starter",
      accent: "#7C5FBF",
      accentLight: "#F4F0FC",
    },
    {
      stageLabel: "阶段一",
      name: "资本通",
      nameEn: "The Capital Map",
      desc: "建立资本思维框架，认识企业从经营到资本化的核心逻辑。线下深度课程，知行合一。",
      topics: ["现金流 vs 利润", "企业估值入门", "资本 vs 债务"],
      xp: "+50 XP",
      duration: "约 4 周",
      badgeLabel: "Foundation",
      accent: "#8B6514",
      accentLight: "#FBF4E4",
    },
    {
      stageLabel: "阶段二",
      name: "启动资本",
      nameEn: "The Capital Code",
      desc: "系统启动企业资本化进程。掌握 SPV 架构与融资结构，让企业具备被投资的真实能力。",
      topics: ["SPV 架构设计", "股权稀释计算", "融资准备度评分"],
      xp: "+80 XP",
      duration: "约 6 周",
      badgeLabel: "Builder",
      accent: "#2D5FA8",
      accentLight: "#EDF2FC",
    },
    {
      stageLabel: "阶段三",
      name: "资本道",
      nameEn: "Capital Dao",
      desc: "进阶资本策略巅峰。理解 IPO、REIT 路径，建立企业级资本操作体系与投资人沟通能力。",
      topics: ["IPO 路径规划", "REIT 结构", "投资人关系管理"],
      xp: "+120 XP",
      duration: "约 8 周",
      badgeLabel: "Strategist",
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
    topics: string[]; xp: string; duration: string; badgeLabel: string;
    accent: string; accentLight: string;
  };
  delay: number;
  inView: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      onClick={() => setExpanded(!expanded)}
      className="rounded-2xl cursor-pointer overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        border: expanded ? `1px solid ${lvl.accent}50` : "1px solid #E0D9CE",
        boxShadow: expanded ? "0 4px 24px rgba(28,24,20,0.08)" : "none",
        transition: "box-shadow 0.25s ease, border-color 0.25s ease",
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
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: lvl.accentLight, color: lvl.accent, border: `1px solid ${lvl.accent}25` }}
            >
              {lvl.badgeLabel}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{lvl.desc}</p>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: "#FBF4E4", color: "#8B6514" }}
          >
            {lvl.xp}
          </span>
          <span className="text-xs" style={{ color: "#C0B8B0" }}>{lvl.duration}</span>
          <span
            className="text-xs"
            style={{ color: "#C0B8B0", display: "block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="px-6 pb-6" style={{ borderTop: "1px solid #F0EBE1" }}>
          <div className="flex flex-wrap gap-2 pt-4">
            {lvl.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
              >
                {topic}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/courses"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium"
              style={{ color: lvl.accent }}
            >
              了解更多 →
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Tools preview ────────────────────────────────────────────────────────────

function ToolsPreview() {
  const TOOLS = [
    { name: "金融路线图方程式", level: "L1+", icon: "📈", desc: "复利增长路径规划，年度目标可视化" },
    { name: "产品服务报价系统", level: "L1+", icon: "💰", desc: "专业报价单生成，一键导出 PDF" },
    { name: "市值 / 市盈率计算器", level: "L2+", icon: "📊", desc: "PE / PB / PS 估值，行业对比图表" },
    { name: "PAT & KPI 计算器", level: "L3+", icon: "🎯", desc: "税后利润、ROE / ROA、KPI 进度" },
  ];

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
          专业工具库
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
          四大计算工具
        </h2>
        <p className="text-sm" style={{ color: "#68625C" }}>每个工具均可导出 PDF / Excel，结果图表化呈现</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-3">
        {TOOLS.map((tool, i) => (
          <ToolCard key={tool.name} tool={tool} delay={i * 0.08} inView={inView} i={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-8"
      >
        <Link
          href="/tools"
          className="inline-block text-sm px-6 py-2.5 rounded-xl transition-colors"
          style={{ color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)", backgroundColor: "#FBF4E4" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F5EDD4"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#FBF4E4"; }}
        >
          查看工具详情 →
        </Link>
      </motion.div>
    </section>
  );
}

function ToolCard({
  tool, delay, inView, i,
}: {
  tool: { name: string; level: string; icon: string; desc: string };
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
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{
          backgroundColor: hovered ? "#FBF4E4" : "#F7F4EF",
          border: "1px solid #E0D9CE",
          transition: "background-color 0.18s",
        }}
      >
        {tool.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono font-bold" style={{ color: "#8B6514" }}>{tool.level}</span>
          <span className="text-sm font-medium" style={{ color: "#1C1814" }}>{tool.name}</span>
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

// ─── Founder ─────────────────────────────────────────────────────────────────

function FounderSection({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const STATS = [
    { value: "25+", label: "年商业经验" },
    { value: "13+", label: "年融资经验" },
    { value: "4", label: "跨行业领域" },
  ];

  const DOMAINS = ["房地产", "科技", "零售", "企业融资", "资本架构"];

  return (
    <section ref={ref} className="px-4 py-24 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="rounded-3xl p-10 md:p-14 relative overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E0D9CE",
          boxShadow: "0 4px 32px rgba(28,24,20,0.06)",
        }}
      >
        {/* Top accent line */}
        <div
          aria-hidden
          style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 2,
            background: "linear-gradient(90deg, transparent, #C9A84C80, transparent)",
          }}
        />

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)" }}
            >
              👔
            </div>
          </div>

          <div className="flex-1">
            <div
              className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
            >
              创始人
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
              Jeffry Yew <span className="text-lg font-normal" style={{ color: "#9A9490" }}>· 姚国雄</span>
            </h2>
            <p className="text-sm mb-5" style={{ color: "#68625C" }}>
              {locale === "en" ? "Transform Businesses Into Investable Enterprises" : "助力企业转型为值得投资的企业"}
            </p>

            <div className="flex flex-wrap gap-6 mb-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold" style={{ color: "#8B6514", fontFamily: "var(--font-display)" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <span
                  key={d}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

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
          从资本通到企业资本咨询，每一步都有系统、有工具、有顾问。
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
              href="/register"
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

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ t }: { t: Dict["footer"] }) {
  const COL_A = [
    { label: "课程体系", href: "/courses" },
    { label: "计算工具", href: "/tools" },
    { label: "关于我们", href: "/about" },
  ];
  const COL_B = [
    { label: "登录", href: "/login" },
    { label: "注册", href: "/register" },
    { label: "联系我们", href: "/about" },
  ];

  return (
    <footer className="px-6 py-16" style={{ borderTop: "1px solid #E0D9CE", backgroundColor: "#F7F4EF" }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="mb-3"><LogoImg height={36} onLight /></div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#68625C" }}>{t.tagline}</p>
          <p className="text-xs mb-4" style={{ color: "#9A9490" }}>Petaling Jaya, Selangor, Malaysia 🇲🇾</p>
          <div className="flex gap-2">
            {[
              { label: "FB", href: "https://www.facebook.com/capitalmastery.net" },
              { label: "IG", href: "https://www.instagram.com/capitalmasterydotnet" },
              { label: "TT", href: "https://www.tiktok.com/@capitalmasterydotnet" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#FFFFFF", color: "#9A9490", border: "1px solid #E0D9CE" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#8B6514"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(139,101,20,0.25)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#9A9490"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E0D9CE"; }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: "#C0B8B0" }}>平台</div>
          <div className="space-y-2">
            {COL_A.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm transition-colors"
                  style={{ color: "#68625C" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: "#C0B8B0" }}>地址</div>
          <p className="text-xs leading-relaxed" style={{ color: "#68625C" }}>
            Leisure Commerce Square,<br />
            Jalan PJS 8/9, 46150<br />
            Petaling Jaya, Selangor
          </p>
          <div className="mt-6 space-y-2">
            {COL_B.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm transition-colors"
                  style={{ color: "#68625C" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#1C1814"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#68625C"; }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="max-w-6xl mx-auto mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs"
        style={{ borderTop: "1px solid #E0D9CE", color: "#C0B8B0" }}
      >
        <span>{t.copyright}</span>
        <span>Craftspace Sdn Bhd (202201044683 / 1490380-V)</span>
      </div>
    </footer>
  );
}
