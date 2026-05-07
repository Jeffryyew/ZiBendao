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
}

export default function HomeClient({ t, locale }: Props) {
  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar t={t.nav} locale={locale} />
      <HeroSection t={t.hero} />
      <StatsBar />
      <FeaturesSection />
      <RolesSection />
      <ToolsPreview />
      <CTASection />
      <Footer t={t.footer} />
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar({ t, locale }: { t: Dict["nav"]; locale: Locale }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        backgroundColor: scrolled ? "rgba(13,13,13,0.98)" : "rgba(13,13,13,0.6)",
        borderBottom: scrolled ? "1px solid #1A1A1A" : "1px solid transparent",
        backdropFilter: "blur(16px)",
        transition: "background-color 0.4s, border-color 0.4s",
      }}
    >
      <Link href="/"><LogoImg height={34} /></Link>

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
            style={{ color: "#666660" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#666660"; }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher current={locale} />
        <Link href="/login" className="text-sm px-4 py-2 rounded-xl" style={{ color: "#666660" }}>
          {t.login}
        </Link>
        <Link
          href="/register"
          className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          {t.register}
        </Link>
      </div>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ t }: { t: Dict["hero"] }) {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-4 pt-44 pb-32 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div style={ORB_STYLES.center} />
        <div style={ORB_STYLES.left} />
        <div style={ORB_STYLES.right} />
        {/* Dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, #1C1C1A 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            opacity: 0.5,
          }}
        />
      </div>

      <style>{KEYFRAMES}</style>

      <div className="relative z-10 flex flex-col items-center">
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
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#C9A84C",
              boxShadow: "0 0 8px #C9A84C80",
              animation: "badge-pulse 2s ease-in-out infinite",
            }}
          />
          {t.badge}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
        >
          {t.title_1}
          <br />
          <span
            style={{
              color: "#C9A84C",
              WebkitBackgroundClip: "text",
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
          className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
          style={{ color: "#5A5A54" }}
        >
          {t.subtitle.split("\n").map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.26, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            {t.cta_primary}
          </Link>
          <Link
            href="/courses"
            className="px-8 py-4 rounded-xl font-semibold text-base transition-all"
            style={{ backgroundColor: "transparent", color: "#777770", border: "1px solid #1E1E1C" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#333330"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1E1E1C"; }}
          >
            {t.cta_secondary}
          </Link>
        </motion.div>

        {/* Divider scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 flex flex-col items-center gap-2"
          style={{ color: "#2A2A28" }}
        >
          <div
            style={{
              width: 1,
              height: 48,
              background: "linear-gradient(to bottom, transparent, #C9A84C40, transparent)",
              animation: "scroll-line 2s ease-in-out infinite",
            }}
          />
        </motion.div>
      </div>
    </section>
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
    { value: 5, suffix: "", label: "会员角色" },
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

// ─── Features ─────────────────────────────────────────────────────────────────

function FeaturesSection() {
  const FEATURES = [
    {
      icon: "📚",
      tag: "教育",
      title: "关卡式金融课程",
      desc: "游戏化关卡设计，从基础理财到高级资本运作。完成一关才能进下一关，系统掌握不跳级。",
    },
    {
      icon: "🧮",
      tag: "工具",
      title: "专业计算工具",
      desc: "金融路线图、市值计算器、PAT & KPI 分析、报价系统。专业级工具，输出可视化报表与 PDF。",
    },
    {
      icon: "🤝",
      tag: "咨询",
      title: "资本咨询服务",
      desc: "专属顾问一对一服务，自动生成电子合约，文件签署全程数字化，高效且安全。",
    },
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
          核心产品
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
          三大核心模块
        </h2>
        <p className="text-sm" style={{ color: "#555550" }}>专为华人市场设计的金融成长生态</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-5">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} delay={i * 0.1} inView={inView} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  delay,
  inView,
}: {
  feature: { icon: string; tag: string; title: string; desc: string };
  delay: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-8 rounded-2xl cursor-default"
      style={{
        backgroundColor: "#070707",
        border: hovered ? "1px solid rgba(201,168,76,0.25)" : "1px solid #111110",
        boxShadow: hovered ? "0 0 32px rgba(201,168,76,0.06)" : "none",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-5"
        style={{
          backgroundColor: hovered ? "rgba(201,168,76,0.12)" : "rgba(201,168,76,0.06)",
          border: "1px solid rgba(201,168,76,0.12)",
          transition: "background-color 0.2s",
        }}
      >
        {feature.icon}
      </div>
      <div className="text-xs mb-2 font-medium" style={{ color: "#C9A84C" }}>{feature.tag}</div>
      <h3 className="text-base font-semibold mb-3" style={{ color: "#E0E0DC" }}>{feature.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "#555550" }}>{feature.desc}</p>
    </motion.div>
  );
}

// ─── Roles ────────────────────────────────────────────────────────────────────

function RolesSection() {
  const ROLES = [
    {
      name: "免费会员",
      badge: "FREE",
      badgeColor: "#444440",
      perks: ["体验前2-3个课程关卡", "1个基础计算工具", "注册即可使用"],
      cta: "立即注册",
      href: "/register",
      featured: false,
    },
    {
      name: "学生会员",
      badge: "L1 → L3",
      badgeColor: "#C9A84C",
      perks: ["完整4模块课程体系", "全套4个计算工具", "成就徽章系统", "等级解锁进阶内容"],
      cta: "查看定价",
      href: "/pricing",
      featured: true,
    },
    {
      name: "企业客户",
      badge: "CLIENT",
      badgeColor: "#777770",
      perks: ["专属顾问服务", "定制计算工具权限", "自动合约生成", "电子签名门户"],
      cta: "联系我们",
      href: "/about",
      featured: false,
    },
  ];

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 py-24" style={{ backgroundColor: "#050505" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            适合你的方案
          </h2>
          <p className="text-sm" style={{ color: "#555550" }}>无论你是学习者还是企业，都有对应的解决方案</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {ROLES.map((role, i) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="p-8 rounded-2xl flex flex-col relative overflow-hidden"
              style={{
                backgroundColor: role.featured ? "#0A0A08" : "#070707",
                border: `1px solid ${role.featured ? "#C9A84C28" : "#111110"}`,
                boxShadow: role.featured ? "0 0 48px rgba(201,168,76,0.06)" : "none",
              }}
            >
              {/* Top accent line */}
              {role.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "10%",
                    right: "10%",
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, #C9A84C80, transparent)",
                  }}
                />
              )}

              <div className="flex items-center justify-between mb-7">
                <h3 className="font-semibold" style={{ color: "#D0D0CC" }}>{role.name}</h3>
                <span
                  className="text-xs px-3 py-1 rounded-full font-mono"
                  style={{ backgroundColor: `${role.badgeColor}14`, color: role.badgeColor, border: `1px solid ${role.badgeColor}22` }}
                >
                  {role.badge}
                </span>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {role.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm" style={{ color: "#555550" }}>
                    <span style={{ color: "#C9A84C", fontSize: "10px" }}>✦</span>
                    {perk}
                  </li>
                ))}
              </ul>

              <Link
                href={role.href}
                className="text-center py-3 rounded-xl text-sm font-medium transition-opacity hover:opacity-85"
                style={{
                  backgroundColor: role.featured ? "#C9A84C" : "transparent",
                  color: role.featured ? "#0D0D0D" : "#555550",
                  border: role.featured ? "none" : "1px solid #1A1A18",
                }}
              >
                {role.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tools preview ────────────────────────────────────────────────────────────

function ToolsPreview() {
  const TOOLS = [
    { name: "金融路线图方程式", level: "L1", icon: "📈", desc: "复利增长路径规划，年度目标可视化" },
    { name: "产品服务报价系统", level: "L2", icon: "💰", desc: "专业报价单生成，一键导出 PDF" },
    { name: "市值 / 市盈率计算器", level: "L2", icon: "📊", desc: "PE / PB / PS 估值，行业对比图表" },
    { name: "PAT & KPI 计算器", level: "L3", icon: "🎯", desc: "税后利润、ROE / ROA、KPI 进度" },
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
  tool,
  delay,
  inView,
  i,
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

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="px-4 py-28 relative overflow-hidden">
      {/* ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 640,
          height: 320,
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
        {/* Top shimmer */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 1,
            background: "linear-gradient(90deg, transparent, #C9A84C50, transparent)",
          }}
        />

        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          开始你的<span style={{ color: "#C9A84C" }}>资本之旅</span>
        </h2>
        <p className="mb-10 text-sm leading-relaxed" style={{ color: "#555550" }}>
          免费注册，体验前3关课程和基础工具。
          <br />
          随时升级，解锁完整课程与专业工具库。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-10 py-4 rounded-xl font-semibold text-sm transition-opacity hover:opacity-88 inline-block"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            免费开始学习
          </Link>
          <Link
            href="/pricing"
            className="px-10 py-4 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: "transparent", color: "#555550", border: "1px solid #1A1A18" }}
          >
            查看完整方案
          </Link>
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
    { label: "定价方案", href: "/pricing" },
    { label: "关于我们", href: "/about" },
  ];
  const COL_B = [
    { label: "登录", href: "/login" },
    { label: "免费注册", href: "/register" },
    { label: "学生升级", href: "/pricing" },
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
          <div className="text-xs font-semibold tracking-widest mb-4" style={{ color: "#333330" }}>联系</div>
          <div className="space-y-2">
            <a
              href="mailto:info@capitalmastery.net"
              className="block text-sm transition-colors"
              style={{ color: "#2E2E2C" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#2E2E2C"; }}
            >
              info@capitalmastery.net
            </a>
            <a
              href="https://wa.me/60103210533"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm transition-colors"
              style={{ color: "#2E2E2C" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#C9A84C"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#2E2E2C"; }}
            >
              +6010-321 0533
            </a>
            <p className="text-xs leading-relaxed pt-1" style={{ color: "#1E1E1C" }}>
              Leisure Commerce Square,<br />Petaling Jaya, Selangor
            </p>
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
    position: "absolute" as const,
    top: "0%",
    left: "50%",
    transform: "translateX(-50%)",
    width: 700,
    height: 600,
    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.07) 0%, transparent 65%)",
    animation: "orb-breathe 7s ease-in-out infinite",
  },
  left: {
    position: "absolute" as const,
    top: "10%",
    left: "-5%",
    width: 400,
    height: 400,
    background: "radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 70%)",
    animation: "orb-drift 11s ease-in-out infinite",
  },
  right: {
    position: "absolute" as const,
    top: "5%",
    right: "-5%",
    width: 350,
    height: 350,
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
`;
