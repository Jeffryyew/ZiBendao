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
    <div style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar t={t.nav} locale={locale} isLoggedIn={isLoggedIn} />
      <HeroSection t={t.hero} isLoggedIn={isLoggedIn} />
      <StatsBar />
      <WhatIsCapital />
      <CapitalLearningJourney />
      <ToolsPreview />
      <CorporateAdvisory />
      <FounderSection />
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

  // close menu on route change / resize
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
          backgroundColor: scrolled || menuOpen ? "rgba(13,13,13,0.98)" : "rgba(13,13,13,0.6)",
          borderBottom: scrolled || menuOpen ? "1px solid #1A1A1A" : "1px solid transparent",
          backdropFilter: "blur(16px)",
          transition: "background-color 0.4s, border-color 0.4s",
        }}
      >
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <LogoImg height={34} />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) =>
            item.dropdown ? (
              <div key={item.href} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.href ? null : item.href)}
                  className="text-sm transition-colors flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer"
                  style={{ color: openDropdown === item.href ? "#C9A84C" : "#666660" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C"; }}
                  onMouseLeave={(e) => { if (openDropdown !== item.href) (e.currentTarget as HTMLButtonElement).style.color = "#666660"; }}
                >
                  {item.label}
                  <span style={{ fontSize: "9px", opacity: 0.5, marginLeft: 1, display: "inline-block", transform: openDropdown === item.href ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>▾</span>
                </button>
                {openDropdown === item.href && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50" style={{ minWidth: 168 }}>
                    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
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
                            onClick={() => setOpenDropdown(null)}
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
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm transition-colors"
                style={{ color: "#666660" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#666660"; }}
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
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
            >
              进入平台 →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm px-4 py-2 rounded-xl transition-colors" style={{ color: "#666660" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F0"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#666660"; }}
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
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
          <span
            className="block w-5 h-px transition-all"
            style={{
              backgroundColor: "#C9A84C",
              transform: menuOpen ? "rotate(45deg) translate(2px, 2px)" : "none",
            }}
          />
          <span
            className="block w-5 h-px transition-all"
            style={{
              backgroundColor: "#C9A84C",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-px transition-all"
            style={{
              backgroundColor: "#C9A84C",
              transform: menuOpen ? "rotate(-45deg) translate(2px, -2px)" : "none",
            }}
          />
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <div
        className="md:hidden fixed inset-0 z-40 transition-all duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setMenuOpen(false)}
        />
        {/* Drawer */}
        <div
          className="absolute top-0 right-0 bottom-0 w-72 flex flex-col pt-20 pb-8 px-6"
          style={{
            backgroundColor: "#0D0D0D",
            borderLeft: "1px solid #1A1A1A",
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
                  style={{ color: "#888880" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(201,168,76,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#888880"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent"; }}
                >
                  {item.label}
                </Link>
                {item.dropdown && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.dropdown.map((sub) =>
                      sub.comingSoon ? (
                        <div
                          key={sub.label}
                          className="flex items-center gap-2 py-2 px-4 text-xs"
                          style={{ color: "#333330" }}
                        >
                          <span>↳ {sub.label}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "rgba(201,168,76,0.07)", color: "#5A5030", fontSize: "9px" }}>Soon</span>
                        </div>
                      ) : (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className="block py-2 px-4 rounded-lg text-xs transition-colors"
                          style={{ color: "#555550" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#555550"; }}
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
                style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
              >
                进入平台 →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 rounded-xl text-sm text-center"
                  style={{ backgroundColor: "#1A1A1A", color: "#888880", border: "1px solid #2A2A2A" }}
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full py-3 rounded-xl font-semibold text-sm text-center"
                  style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
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
      {/* Line-grid background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div style={ORB_STYLES.center} />
        <div style={ORB_STYLES.left} />
        <div style={ORB_STYLES.right} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>
      <style>{KEYFRAMES}</style>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8"
              style={{ backgroundColor: "#0D0D0D", border: "1px solid #1E1E1C", color: "#C9A84C" }}
            >
              <span
                style={{
                  display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                  backgroundColor: "#C9A84C", boxShadow: "0 0 8px #C9A84C80",
                  animation: "badge-pulse 2s ease-in-out infinite",
                }}
              />
              {t.badge}
            </motion.div>

            {/* Massive title */}
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
              }}
            >
              {t.title_1}
              <br />
              <span
                style={{
                  background: "linear-gradient(130deg, #9A7020, #C9A84C, #F5D878, #D4A843, #9A7020)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "metallic-shimmer 4s linear infinite",
                  display: "inline-block",
                  filter: "drop-shadow(0 0 24px rgba(201,168,76,0.35))",
                }}
              >
                {t.title_2}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
              className="text-lg max-w-lg mb-10 leading-relaxed"
              style={{ color: "#5A5A54" }}
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
              className="flex flex-col sm:flex-row gap-3 lg:justify-start justify-center"
            >
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C, #D4B860)", color: "#0D0D0D" }}
                >
                  \u8fdb\u5165\u5e73\u53f0 →
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C, #D4B860)", color: "#0D0D0D" }}
                  >
                    {t.cta_primary}
                  </Link>
                  <Link
                    href="/tools"
                    className="px-8 py-4 rounded-xl font-semibold text-base transition-all"
                    style={{ backgroundColor: "transparent", color: "#777770", border: "1px solid #1E1E1C" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#333330"; (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E1E1C"; (e.currentTarget as HTMLAnchorElement).style.color = "#777770"; }}
                  >
                    {t.cta_secondary}
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Right: Dashboard (desktop only) */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block flex-shrink-0"
            style={{ width: 360 }}
          >
            <CapitalDashboard />
          </motion.div>
        </div>

        {/* Mobile dashboard cards */}
        <div className="lg:hidden mt-12">
          <MobileDashboardCards />
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex flex-col items-center gap-2"
          style={{ color: "#2A2A28" }}
        >
          <div
            style={{
              width: 1, height: 48,
              background: "linear-gradient(to bottom, transparent, #C9A84C40, transparent)",
              animation: "scroll-line 2s ease-in-out infinite",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Capital Dashboard (desktop) ────────────────────────────────────────────

function CapitalDashboard() {
  const circumference = 2 * Math.PI * 38;
  const score = 78;
  const strokeDash = (score / 100) * circumference;

  return (
    <div
      style={{
        background: "rgba(14,14,12,0.85)",
        border: "1px solid rgba(201,168,76,0.18)",
        borderRadius: 20,
        backdropFilter: "blur(24px)",
        padding: "24px",
        boxShadow: "0 8px 48px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(201,168,76,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs font-mono mb-0.5" style={{ color: "#3A3A38" }}>CAPITAL OS · DASHBOARD</div>
          <div className="text-sm font-semibold" style={{ color: "#D8D8D4" }}>Enterprise Profile</div>
        </div>
        <div
          className="text-xs px-2.5 py-1 rounded-full font-mono"
          style={{ backgroundColor: "rgba(76,175,130,0.12)", color: "#4CAF82", border: "1px solid rgba(76,175,130,0.25)" }}
        >
          ● LIVE
        </div>
      </div>

      {/* Score ring + readiness */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="48" cy="48" r="38" fill="none" stroke="#1A1A18" strokeWidth="7" />
            <circle
              cx="48" cy="48" r="38" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9A7020" />
                <stop offset="50%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#F5D878" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold" style={{ color: "#C9A84C", lineHeight: 1 }}>{score}</div>
            <div className="text-xs" style={{ color: "#3A3A38" }}>/100</div>
          </div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: "#444440" }}>Enterprise Score</div>
          <div
            className="text-sm font-semibold px-2.5 py-1 rounded-lg mb-2"
            style={{ backgroundColor: "rgba(76,175,130,0.1)", color: "#4CAF82", border: "1px solid rgba(76,175,130,0.2)", display: "inline-block" }}
          >
            Series A Ready
          </div>
          <div className="text-xs" style={{ color: "#3A3A38" }}>Capital Readiness</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#444440" }}>Valuation</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "#D8D8D4" }}>RM 12.5M</span>
            <span className="text-xs" style={{ color: "#4CAF82" }}>↑ 18% YTD</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "#444440" }}>Investor Readiness</span>
            <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>82%</span>
          </div>
          <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A18" }}>
            <div
              style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: "82%",
                background: "linear-gradient(90deg, #9A7020, #C9A84C)",
                borderRadius: "9999px",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {["Foundation", "Growth", "Series A", "IPO"].map((label) => (
              <span key={label} style={{ color: "#2A2A28", fontSize: "9px" }}>{label}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#444440" }}>Cashflow Health</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: "#4CAF82" }} />
            <span className="text-xs font-medium" style={{ color: "#4CAF82" }}>Good</span>
          </div>
        </div>
      </div>

      {/* Next upgrade */}
      <div
        className="flex items-center justify-between p-3 rounded-xl"
        style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.12)" }}
      >
        <div>
          <div className="text-xs mb-0.5" style={{ color: "#3A3A38" }}>Next Upgrade</div>
          <div className="text-sm font-semibold" style={{ color: "#C9A84C" }}>SPV Structuring →</div>
        </div>
        <div
          className="text-xs px-2 py-1 rounded-lg"
          style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          +35 XP
        </div>
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs font-mono" style={{ color: "#1E1E1C" }}>DEMO · Capital Simulation Lab</span>
      </div>
    </div>
  );
}

// ─── Mobile Dashboard Cards ───────────────────────────────────────────

function MobileDashboardCards() {
  const CARDS = [
    { label: "Enterprise Score", value: "78/100", sub: "Series A Ready", color: "#C9A84C" },
    { label: "Valuation", value: "RM 12.5M", sub: "↑ 18% YTD", color: "#4CAF82" },
    { label: "Investor Readiness", value: "82%", sub: "Growth Stage", color: "#C9A84C" },
    { label: "Cashflow", value: "Good", sub: "Healthy", color: "#4CAF82" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="flex-shrink-0 p-4 rounded-xl"
          style={{
            backgroundColor: "rgba(14,14,12,0.9)",
            border: "1px solid rgba(201,168,76,0.15)",
            backdropFilter: "blur(12px)",
            minWidth: 140,
          }}
        >
          <div className="text-xs mb-2" style={{ color: "#444440" }}>{card.label}</div>
          <div className="text-lg font-bold mb-0.5" style={{ color: card.color }}>{card.value}</div>
          <div className="text-xs" style={{ color: "#3A3A38" }}>{card.sub}</div>
        </div>
      ))}
      <div
        className="flex-shrink-0 flex items-center justify-center px-4 rounded-xl"
        style={{ border: "1px dashed #1E1E1C", minWidth: 100 }}
      >
        <span className="text-xs text-center" style={{ color: "#2A2A28" }}>DEMO<br />Sim Lab</span>
      </div>
    </div>
  );
}
// ─── Stats bar ────────────────────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const STATS = [
    { value: 1000, suffix: "+", label: "培训学员" },
    { value: 13, suffix: "+", label: "课程节数" },
    { value: 4, suffix: "", label: "专业工具" },
    { value: 8, suffix: "", label: "会员角色" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="px-4 pb-20"
    >
      <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl" style={{ border: "1px solid #141412" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0" style={{ "--tw-divide-color": "#141412" } as React.CSSProperties}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center py-8 px-4"
              style={{ backgroundColor: "#060606" }}
            >
              <div className="text-4xl font-bold mb-1" style={{ color: "#C9A84C", fontFamily: "var(--font-display)" }}>
                <AnimatedNumber target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs" style={{ color: "#3A3A38" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
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
    <section ref={ref} className="px-4 py-24" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}>
            企业资本化
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 max-w-xl" style={{ fontFamily: "var(--font-display)" }}>
            什么是企业资本化？
          </h2>
          <p className="text-sm max-w-lg leading-relaxed" style={{ color: "#555550" }}>
            从经营企业到资本企业，不只是融资——而是重新定义你的企业价值。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-px" style={{ backgroundColor: "#111110" }}>
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="p-10"
              style={{ backgroundColor: "#050505" }}
            >
              <div className="text-3xl mb-6" style={{ color: "#C9A84C", opacity: 0.6 }}>{p.icon}</div>
              <h3 className="text-base font-semibold mb-3" style={{ color: "#D8D8D4" }}>{p.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4A4A46" }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Capital Learning Journey ─────────────────────────────────────────────────

function CapitalLearningJourney() {
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
      accent: "#8A6FD4",
      bg: "linear-gradient(145deg, #0A0812 0%, #0E0B1C 100%)",
      border: "rgba(138,111,212,0.22)",
      topLine: "linear-gradient(90deg, transparent, rgba(138,111,212,0.7), transparent)",
      glow: "rgba(138,111,212,0.12)",
      locked: false,
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
      accent: "#C9A84C",
      bg: "linear-gradient(145deg, #0C0900 0%, #120E02 100%)",
      border: "rgba(201,168,76,0.25)",
      topLine: "linear-gradient(90deg, transparent, rgba(201,168,76,0.8), transparent)",
      glow: "rgba(201,168,76,0.10)",
      locked: false,
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
      accent: "#5A8FE0",
      bg: "linear-gradient(145deg, #060810 0%, #080C18 100%)",
      border: "rgba(90,143,224,0.22)",
      topLine: "linear-gradient(90deg, transparent, rgba(90,143,224,0.6), rgba(201,168,76,0.25), transparent)",
      glow: "rgba(90,143,224,0.10)",
      locked: false,
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
      accent: "#C9A84C",
      bg: "linear-gradient(145deg, #0A0800 0%, #100C02 100%)",
      border: "rgba(201,168,76,0.45)",
      topLine: "linear-gradient(90deg, transparent, #9A7020, #C9A84C, #F5D878, #C9A84C, #9A7020, transparent)",
      glow: "rgba(201,168,76,0.18)",
      locked: false,
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
        <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}>
          资本成长路径
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Capital Learning Journey
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "#555550" }}>
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
          style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)" }}
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
    accent: string; bg: string; border: string; topLine: string; glow: string; locked: boolean;
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
      className="rounded-2xl cursor-pointer relative overflow-hidden"
      style={{
        background: lvl.bg,
        border: `1px solid ${lvl.border}`,
        boxShadow: expanded ? `0 0 32px ${lvl.glow}, inset 0 0 0 1px ${lvl.accent}08` : "none",
        transition: "box-shadow 0.25s ease",
      }}
    >
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: lvl.topLine }} />

      {/* Ambient glow blob */}
      <div style={{
        position: "absolute", top: "-20%", right: "-5%", width: "38%", height: "140%",
        background: `radial-gradient(ellipse at center, ${lvl.glow} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Card body */}
      <div className="p-6 flex items-center gap-4 relative z-10">
        {/* Stage badge */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-center leading-tight"
          style={{
            background: `linear-gradient(135deg, ${lvl.accent}22, ${lvl.accent}08)`,
            border: `1px solid ${lvl.accent}30`,
            color: lvl.accent,
          }}
        >
          {lvl.stageLabel}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm" style={{ color: "#D8D8D4" }}>{lvl.name}</span>
            <span className="text-xs" style={{ color: "#3A3A38" }}>{lvl.nameEn}</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#484844" }}>{lvl.desc}</p>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1.5 ml-2">
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{
              background: `linear-gradient(135deg, ${lvl.accent}20, ${lvl.accent}08)`,
              color: lvl.accent,
              border: `1px solid ${lvl.accent}25`,
            }}
          >
            {lvl.xp}
          </span>
          <span className="text-xs whitespace-nowrap" style={{ color: "#2A2A28" }}>{lvl.duration}</span>
          <div
            className="text-sm"
            style={{ color: lvl.accent, transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            ›
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 pl-[88px] relative z-10">
          <div className="flex flex-wrap gap-2 mb-3">
            {lvl.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs px-3 py-1 rounded-full"
                style={{ background: `${lvl.accent}0C`, color: lvl.accent, border: `1px solid ${lvl.accent}22` }}
              >
                {topic}
              </span>
            ))}
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: `${lvl.accent}14`, color: lvl.accent, border: `1px solid ${lvl.accent}30` }}
          >
            🏅 {lvl.badgeLabel} Badge
          </span>
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
          style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          专业工具库
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          四大计算工具
        </h2>
        <p className="text-sm" style={{ color: "#555550" }}>每个工具均可导出 PDF / Excel，结果图表化呈现</p>
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
          style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)" }}
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
        backgroundColor: "#070707",
        border: hovered ? "1px solid rgba(201,168,76,0.2)" : "1px solid #111110",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.18s ease, border-color 0.18s ease",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{
          backgroundColor: hovered ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.06)",
          border: "1px solid rgba(201,168,76,0.1)",
          transition: "background-color 0.18s",
        }}
      >
        {tool.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono font-bold" style={{ color: "#C9A84C" }}>{tool.level}</span>
          <span className="text-sm font-medium" style={{ color: "#C8C8C4" }}>{tool.name}</span>
        </div>
        <div className="text-xs" style={{ color: "#444440" }}>{tool.desc}</div>
      </div>
      <span
        className="text-sm flex-shrink-0 transition-all"
        style={{ color: "#C9A84C", opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-4px)" }}
      >
        →
      </span>
    </motion.div>
  );
}

// ─── Corporate Advisory ───────────────────────────────────────────────────────

function CorporateAdvisory() {
  const SERVICES = [
    { code: "SPV", title: "SPV 架构设计", desc: "为企业设计特殊目的载体架构，隔离风险、优化税务、吸引机构投资。", tag: "融资结构" },
    { code: "IPO", title: "IPO 上市路径规划", desc: "评估企业上市准备度，设计上市路径，协助完成合规、估值与投资人对接。", tag: "资本市场" },
    { code: "REIT", title: "REIT 房产资本化", desc: "将房地产资产证券化，通过 REIT 结构实现流动性，进入资本市场融资。", tag: "资产证券化" },
    { code: "EQ", title: "股权架构优化", desc: "重新设计创始人、投资人与员工持股结构，建立清晰可投的股权生态。", tag: "股权设计" },
  ];

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="px-4 py-24" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <div
              className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              企业资本顾问
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Corporate Advisory
            </h2>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: "#555550" }}>
              不只是课程——我们提供真实资本操作的专业顾问服务
            </p>
          </div>
          <Link
            href="/about"
            className="text-sm px-5 py-2.5 rounded-xl flex-shrink-0 transition-colors self-start"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)" }}
          >
            联系顾问团队 →
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3">
          {SERVICES.map((svc, i) => (
            <motion.div
              key={svc.code}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-7 rounded-2xl"
              style={{ backgroundColor: "#070707", border: "1px solid #0F0F0E", transition: "border-color 0.2s, transform 0.2s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.18)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#0F0F0E";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.12)" }}
                >
                  {svc.code}
                </span>
                <span className="text-xs" style={{ color: "#2A2A28" }}>{svc.tag}</span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "#D0D0CC" }}>{svc.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#444440" }}>{svc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Founder ─────────────────────────────────────────────────────────────────

function FounderSection() {
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
          background: "linear-gradient(145deg, #080808 0%, #0C0C0A 100%)",
          border: "1px solid #1A1A18",
          boxShadow: "0 0 60px rgba(201,168,76,0.04)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)",
          }}
        />

        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex-shrink-0">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.04))",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              👔
            </div>
          </div>

          <div className="flex-1">
            <div
              className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              创始人
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              Jeffry Yew <span className="text-lg font-normal" style={{ color: "#444440" }}>· 姚国雄</span>
            </h2>
            <p className="text-sm mb-5" style={{ color: "#555550" }}>
              帮助企业从经营模式，升级成资本模式
            </p>

            <div className="flex flex-wrap gap-6 mb-6">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold" style={{ color: "#C9A84C", fontFamily: "var(--font-display)" }}>{s.value}</div>
                  <div className="text-xs" style={{ color: "#3A3A38" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <span
                  key={d}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(201,168,76,0.06)", color: "#8A7840", border: "1px solid rgba(201,168,76,0.12)" }}
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
    <section ref={ref} className="px-4 py-28 relative overflow-hidden">
      <div
        aria-hidden
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", width: 640, height: 320,
          background: "radial-gradient(ellipse at center, rgba(201,168,76,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65 }}
        className="max-w-2xl mx-auto text-center p-14 rounded-3xl relative"
        style={{
          background: "linear-gradient(145deg, #0A0A08 0%, #0D0D0B 100%)",
          border: "1px solid #1C1C1A",
          boxShadow: "0 0 80px rgba(201,168,76,0.06), inset 0 1px 0 rgba(201,168,76,0.08)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
            background: "linear-gradient(90deg, transparent, #C9A84C50, transparent)",
          }}
        />

        <div
          className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-6"
          style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          开始你的资本成长路径
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          你的企业，<span style={{ color: "#C9A84C" }}>值得被资本看见</span>
        </h2>
        <p className="mb-10 text-sm leading-relaxed" style={{ color: "#555550" }}>
          从资本通到企业资本咨询，每一步都有系统、有工具、有顾问。
          <br />
          免费开始，随时解锁下一个资本阶段。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-10 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88 inline-block"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
            >
              进入平台 →
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="px-10 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88 inline-block"
                style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#0D0D0D" }}
              >
                开始资本之旅
              </Link>
              <Link
                href="/about"
                className="px-10 py-4 rounded-xl font-semibold text-sm"
                style={{ backgroundColor: "transparent", color: "#555550", border: "1px solid #1A1A18" }}
              >
                企业咨询
              </Link>
            </>
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
    <footer className="px-6 py-16" style={{ borderTop: "1px solid #0E0E0C" }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="mb-3"><LogoImg height={36} /></div>
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#2E2E2C" }}>{t.tagline}</p>
          <p className="text-xs mb-4" style={{ color: "#252523" }}>Petaling Jaya, Selangor, Malaysia 🇲🇾</p>
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
                style={{ backgroundColor: "#0A0A0A", color: "#333330", border: "1px solid #111110" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C9A84C30"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#333330"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#111110"; }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: "#333330" }}>平台</div>
          <div className="space-y-2">
            {COL_A.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm transition-colors"
                  style={{ color: "#2E2E2C" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#2E2E2C"; }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: "#333330" }}>地址</div>
          <p className="text-xs leading-relaxed" style={{ color: "#2A2A28" }}>
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
                  style={{ color: "#2E2E2C" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#2E2E2C"; }}
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
        style={{ borderTop: "1px solid #0E0E0C", color: "#252523" }}
      >
        <span>{t.copyright}</span>
        <span>Craftspace Sdn Bhd (202201044683 / 1490380-V)</span>
      </div>
    </footer>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORB_STYLES = {
  center: {
    position: "absolute" as const, top: "0%", left: "50%",
    transform: "translateX(-50%)", width: 700, height: 600,
    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 65%)",
    animation: "orb-breathe 7s ease-in-out infinite",
  },
  left: {
    position: "absolute" as const, top: "10%", left: "-5%", width: 400, height: 400,
    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 70%)",
    animation: "orb-drift 11s ease-in-out infinite",
  },
  right: {
    position: "absolute" as const, top: "5%", right: "-5%", width: 350, height: 350,
    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.035) 0%, transparent 70%)",
    animation: "orb-drift 9s ease-in-out infinite reverse",
  },
};

const KEYFRAMES = `
  @keyframes orb-breathe {
    0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
    50%       { opacity: 1;   transform: translateX(-50%) scale(1.06); }
  }
  @keyframes orb-drift {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(18px, -22px); }
  }
  @keyframes badge-pulse {
    0%, 100% { box-shadow: 0 0 8px rgba(201,168,76,0.5); }
    50%       { box-shadow: 0 0 16px rgba(201,168,76,0.9); }
  }
  @keyframes scroll-line {
    0%, 100% { opacity: 0.3; transform: scaleY(1); }
    50%       { opacity: 0.7; transform: scaleY(1.1); }
  }
  @keyframes metallic-shimmer {
    0%   { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
`;
