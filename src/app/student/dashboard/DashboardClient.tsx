"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ONLINE_BADGES,
  getEarnedOnlineBadgeIds,
  getBadgeStates,
  getCompletedLessons,
} from "@/lib/badges";
import { BadgeIcon } from "@/components/badges/BadgeIcon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LessonProgress {
  lessonId: string;
  points: number;
}

interface ModuleData {
  id: string;
  title: string;
  lessons: { id: string; points: number | null }[];
}

interface DashboardData {
  firstName: string;
  completedIds: string[];
  totalXP: number;
  modules: ModuleData[];
  role: string;
}

type TabId = "overview" | "learning" | "enterprise";
type CompanyMode = "single" | "group" | null;

interface Company {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  isParent?: boolean;
  parentId?: string | null;
  shareholding?: number;
}

interface GroupStructure {
  parent: Company | null;
  subsidiaries: Company[];
}

const TOOLS = [
  { label: "财务路线图", href: "/tools/financial-roadmap", icon: "FV" },
  { label: "智能报价", href: "/tools/pricing-system", icon: "QT" },
  { label: "企业估值", href: "/tools/market-cap", icon: "PE" },
  { label: "绩效分析", href: "/tools/pat-kpi", icon: "KPI" },
  { label: "现金流", href: "/tools/cash-flow", icon: "CF" },
  { label: "资产负债表", href: "/tools/balance-sheet", icon: "BS" },
  { label: "利润表", href: "/tools/income-statement", icon: "IS" },
  { label: "损益平衡", href: "/tools/breakeven-analysis", icon: "BE" },
  { label: "尽职调查", href: "/tools/due-diligence", icon: "DD" },
  { label: "数据室", href: "/tools/data-room", icon: "DR" },
  { label: "销售预测", href: "/tools/sales-forecast", icon: "SF" },
  { label: "创业费用", href: "/tools/startup-expense", icon: "SE" },
];

// ─── Utils ────────────────────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [key]);
  const set = useCallback((val: T) => {
    setState(val);
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key]);
  return [state, set];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { firstName, completedIds, modules, role } = data;

  const [activeTab, setActiveTab] = useLocalStorage<TabId>("zbd_tab", "overview");
  const [companyMode, setCompanyMode] = useLocalStorage<CompanyMode>("zbd_company_mode", null);
  const [singleCompany, setSingleCompany] = useLocalStorage<Company | null>("zbd_single_company", null);
  const [group, setGroup] = useLocalStorage<GroupStructure>("zbd_group", { parent: null, subsidiaries: [] });

  // Sync course progress from localStorage (lesson player persists there)
  const [completed, setCompleted] = useState<Set<string>>(new Set(completedIds));
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zbd_online_completed");
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => completed.has(l.id)).length, 0
  );
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const totalXP = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => completed.has(l.id)).reduce((s, l) => s + (l.points ?? 0), 0),
    0
  );

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "总览" },
    { id: "learning", label: "学习进度" },
    { id: "enterprise", label: "企业数据" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm mb-0.5" style={{ color: "var(--color-text-muted)" }}>欢迎回来，</p>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
            {firstName}
          </h1>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
          style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          Capital OS
        </div>
      </div>

      {/* Tab Switcher */}
      <div
        className="flex gap-1 p-1 rounded-xl"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", display: "inline-flex" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? "#F7F4EF" : "transparent",
              color: activeTab === tab.id ? "#1C1814" : "#9A9490",
              border: activeTab === tab.id ? "1px solid #E0D9CE" : "1px solid transparent",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          firstName={firstName}
          completedCount={completedCount}
          totalLessons={totalLessons}
          overallPct={overallPct}
          totalXP={totalXP}
          companyMode={companyMode}
          singleCompany={singleCompany}
          group={group}
          onGoToEnterprise={() => setActiveTab("enterprise")}
          onGoToLearning={() => setActiveTab("learning")}
        />
      )}
      {activeTab === "learning" && (
        <LearningTab
          modules={modules}
          completed={completed}
          completedCount={completedCount}
          totalLessons={totalLessons}
          overallPct={overallPct}
          totalXP={totalXP}
          role={role}
        />
      )}
      {activeTab === "enterprise" && (
        <EnterpriseTab
          companyMode={companyMode}
          singleCompany={singleCompany}
          group={group}
          onSetMode={setCompanyMode}
          onSetSingle={setSingleCompany}
          onSetGroup={setGroup}
        />
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  firstName, completedCount, totalLessons, overallPct, totalXP,
  companyMode, singleCompany, group,
  onGoToEnterprise, onGoToLearning,
}: {
  firstName: string;
  completedCount: number;
  totalLessons: number;
  overallPct: number;
  totalXP: number;
  companyMode: CompanyMode;
  singleCompany: Company | null;
  group: GroupStructure;
  onGoToEnterprise: () => void;
  onGoToLearning: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="space-y-5">
      {/* AI Summary Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #FFFDF7 0%, #FBF4E4 100%)", border: "1px solid rgba(201,168,76,0.25)" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none" aria-hidden>
          <svg viewBox="0 0 100 100" fill="none"><circle cx="80" cy="20" r="60" fill="#C9A84C"/></svg>
        </div>
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
          >
            ✦
          </div>
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: "#C9A84C" }}>AI 数据总结</div>
            <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
              {greeting}，{firstName}，你已完成 <span className="font-semibold" style={{ color: "#1C1814" }}>{completedCount}</span> 个课程，
              累计 <span className="font-semibold" style={{ color: "#C9A84C" }}>{totalXP} XP</span>。
              {overallPct >= 50
                ? " 你的学习进度良好，建议继续深入企业资本工具。"
                : " 持续学习是建立资本操作系统的基础。"}
              {companyMode === null && " 完成企业数据设置后，将获得个性化资本分析。"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "课程完成", value: completedCount, unit: `/ ${totalLessons}`, color: "#C9A84C" },
          { label: "总进度", value: `${overallPct}%`, unit: "", color: "#C9A84C" },
          { label: "成长积分", value: totalXP, unit: "XP", color: "#6B9BD2" },
          { label: "工具", value: TOOLS.length, unit: "个", color: "#82C8A0" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <div className="text-xl font-bold font-mono mb-0.5" style={{ color: s.color }}>
              {s.value}
              {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "#9A9490" }}>{s.unit}</span>}
            </div>
            <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Learning Summary */}
      <Card
        title="学习摘要"
        action={{ label: "查看详情 →", onClick: onGoToLearning }}
      >
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: "#9A9490" }}>总体进度</span>
              <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>{overallPct}%</span>
            </div>
            <ProgressBar pct={overallPct} />
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: "#68625C" }}>
            <span>已完成 {completedCount} 关</span>
            <span>累计 {totalXP} XP</span>
            <span>剩余 {totalLessons - completedCount} 关</span>
          </div>
          <Link
            href="/student/learn"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
          >
            继续学习 →
          </Link>
        </div>
      </Card>

      {/* Enterprise Summary */}
      <Card
        title="企业摘要"
        action={{ label: companyMode ? "查看详情 →" : "立即设置 →", onClick: onGoToEnterprise }}
      >
        {companyMode === null ? (
          <div className="text-center py-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold mx-auto mb-3"
              style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              企业
            </div>
            <p className="text-sm mb-4" style={{ color: "#68625C" }}>绑定企业，解锁资本 AI 分析</p>
            <button
              onClick={onGoToEnterprise}
              className="px-5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
            >
              设置企业数据
            </button>
          </div>
        ) : companyMode === "single" && singleCompany ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
              >
                {singleCompany.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>{singleCompany.name}</div>
                <div className="text-xs" style={{ color: "#9A9490" }}>{singleCompany.type} · 独立公司</div>
              </div>
              <StatusBadge status={singleCompany.status} />
            </div>
            <GrowthStatusBar label="企业成长状态" level={2} />
          </div>
        ) : companyMode === "group" && group.parent ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.25)" }}
              >
                {group.parent.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>{group.parent.name}</div>
                <div className="text-xs" style={{ color: "#9A9490" }}>母公司 · {group.subsidiaries.length} 家子公司</div>
              </div>
            </div>
            <GrowthStatusBar label="集团成长状态" level={3} />
          </div>
        ) : null}
      </Card>

      {/* Recent Tools */}
      <Card title="资本工具">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {TOOLS.slice(0, 8).map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all hover:shadow-sm"
              style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE" }}
            >
              <span
                className="text-xs font-mono font-bold"
                style={{ color: "#C9A84C" }}
              >
                {tool.icon}
              </span>
              <span className="text-xs leading-snug" style={{ color: "#68625C" }}>{tool.label}</span>
            </Link>
          ))}
        </div>
        <Link
          href="/student/tools"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium"
          style={{ color: "#9A9490", backgroundColor: "#F7F4EF", border: "1px dashed #E0D9CE" }}
        >
          查看全部 {TOOLS.length} 个工具 →
        </Link>
      </Card>
    </div>
  );
}

// ─── Badge Components ─────────────────────────────────────────────────────────

function ShieldBadge({
  symbol, label, desc, unlocked, stroke, bg,
}: {
  symbol: string; label: string; desc: string;
  unlocked: boolean; stroke: string; bg: string;
}) {
  const uid = "sh" + symbol.replace(/[^\w]/g, "S");
  const sk = unlocked ? stroke : "#C4BEB8";
  const fi = unlocked ? bg : "#EDEAE5";
  const tx = unlocked ? "#FFFDF5" : "#B0AAA4";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="54" height="63" viewBox="0 0 54 63" fill="none">
        <defs>
          <linearGradient id={uid + "f"} x1="27" y1="0" x2="27" y2="63" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={fi} />
            <stop offset="100%" stopColor={fi} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id={uid + "k"} x1="27" y1="0" x2="27" y2="63" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={sk} />
            <stop offset="100%" stopColor={sk} stopOpacity="0.65" />
          </linearGradient>
        </defs>
        {/* Outer shield */}
        <path d="M27 2 L52 13 L52 35 Q52 51 27 61 Q2 51 2 35 L2 13 Z"
          fill={`url(#${uid}f)`}
          stroke={unlocked ? `url(#${uid}k)` : sk}
          strokeWidth="1.5"
        />
        {/* Inner border */}
        <path d="M27 7 L47 17 L47 35 Q47 47 27 56 Q7 47 7 35 L7 17 Z"
          fill="none"
          stroke={sk}
          strokeWidth="0.65"
          strokeOpacity={unlocked ? 0.45 : 0.25}
        />
        {/* Horizontal divider */}
        <line x1="10" y1="37" x2="44" y2="37" stroke={sk} strokeWidth="0.65" strokeOpacity={unlocked ? 0.4 : 0.2} />
        {/* Symbol */}
        <text
          x="27" y="28"
          textAnchor="middle" dominantBaseline="middle"
          fill={tx}
          fontSize={symbol === "★" ? 17 : symbol.length > 1 ? 10 : 15}
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="0.5"
        >{symbol}</text>
        {/* Three ornament dots */}
        <circle cx="21" cy="44" r="1.8" fill={sk} fillOpacity={unlocked ? 0.55 : 0.3} />
        <circle cx="27" cy="46.5" r="1.8" fill={sk} fillOpacity={unlocked ? 0.65 : 0.4} />
        <circle cx="33" cy="44" r="1.8" fill={sk} fillOpacity={unlocked ? 0.55 : 0.3} />
        {/* Corner ticks */}
        <line x1="13" y1="22" x2="15" y2="18" stroke={sk} strokeWidth="0.65" strokeOpacity={unlocked ? 0.4 : 0.2} />
        <line x1="41" y1="22" x2="39" y2="18" stroke={sk} strokeWidth="0.65" strokeOpacity={unlocked ? 0.4 : 0.2} />
      </svg>
      <div className="text-center">
        <div className="text-xs font-semibold" style={{ color: unlocked ? "#5C5650" : "#9A9490" }}>{label}</div>
        <div className="text-xs" style={{ color: "#9A9490" }}>{desc}</div>
      </div>
    </div>
  );
}

function CrestBadge({
  abbr, label, desc, unlocked,
}: {
  abbr: string; label: string; desc: string; unlocked: boolean;
}) {
  const uid = "cr" + abbr;
  const sk = unlocked ? "#B8943A" : "#C4BEB8";
  const fi = unlocked ? "#FBF4E4" : "#EDEAE5";
  const tx = unlocked ? "#8B6914" : "#B0AAA4";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
        <defs>
          <radialGradient id={uid} cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor={fi} />
            <stop offset="100%" stopColor={fi} stopOpacity="0.5" />
          </radialGradient>
        </defs>
        {/* Outer ring */}
        <circle cx="29" cy="29" r="27" fill={`url(#${uid})`} stroke={sk} strokeWidth="1.5" />
        {/* Second ring */}
        <circle cx="29" cy="29" r="22" fill="none" stroke={sk} strokeWidth="0.65" strokeOpacity={unlocked ? 0.4 : 0.22} />
        {/* Inner ring */}
        <circle cx="29" cy="29" r="16" fill="none" stroke={sk} strokeWidth="0.5" strokeOpacity={unlocked ? 0.25 : 0.15} />
        {/* 8 small studs on second ring */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const r = 22;
          const rad = (deg * Math.PI) / 180;
          const cx = 29 + r * Math.sin(rad);
          const cy = 29 - r * Math.cos(rad);
          return <circle key={deg} cx={cx} cy={cy} r="1.4" fill={sk} fillOpacity={unlocked ? 0.55 : 0.3} />;
        })}
        {/* Laurel arcs */}
        <path d="M12 27 Q29 17 46 27" fill="none" stroke={sk} strokeWidth="0.65" strokeOpacity={unlocked ? 0.4 : 0.22} />
        <path d="M12 31 Q29 41 46 31" fill="none" stroke={sk} strokeWidth="0.65" strokeOpacity={unlocked ? 0.4 : 0.22} />
        {/* Cross axis */}
        <line x1="9" y1="29" x2="49" y2="29" stroke={sk} strokeWidth="0.5" strokeOpacity={unlocked ? 0.22 : 0.12} />
        <line x1="29" y1="9" x2="29" y2="49" stroke={sk} strokeWidth="0.5" strokeOpacity={unlocked ? 0.22 : 0.12} />
        {/* Text */}
        <text
          x="29" y="29"
          textAnchor="middle" dominantBaseline="middle"
          fill={tx}
          fontSize={abbr.length >= 3 ? 8 : 10}
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="0.5"
        >{abbr}</text>
      </svg>
      <div className="text-center">
        <div className="text-xs font-semibold" style={{ color: unlocked ? "#5C5650" : "#9A9490" }}>{label}</div>
        <div className="text-xs" style={{ color: "#9A9490" }}>{desc}</div>
      </div>
    </div>
  );
}

// ─── Badge Showcase Card (used in LearningTab) ────────────────────────────────

function BadgeShowcaseCard({ role }: { role: string }) {
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [badgeStates, setBadgeStatesLocal] = useState<Record<string, string>>({});
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    try {
      const completed = getCompletedLessons();
      const earned = new Set(getEarnedOnlineBadgeIds(completed));
      setEarnedIds(earned);
      const states = getBadgeStates();
      setBadgeStatesLocal(states);
      setHasNew(Object.values(states).some(s => s === "unlocked_new"));
    } catch {}
  }, []);

  const offlineUnlocked = {
    offline_zibentong: ["ZIBENTONG_GRAD","QIDONG_GRAD","ZIBENDAO_GRAD","ADMIN","SUPER_ADMIN"].includes(role),
    offline_qidong: ["QIDONG_GRAD","ZIBENDAO_GRAD","ADMIN","SUPER_ADMIN"].includes(role),
    offline_zibendao: ["ZIBENDAO_GRAD","ADMIN","SUPER_ADMIN"].includes(role),
  };

  return (
    <Card
      title={hasNew ? "🆕 成就徽章" : "成就徽章"}
      action={undefined}
    >
      <div>
        {/* Online badge mini row */}
        <div className="text-xs mb-3" style={{ color: "#9A9490" }}>线上成长徽章 · {earnedIds.size}/12</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {ONLINE_BADGES.map(badge => {
            const earned = earnedIds.has(badge.id);
            const isNew = badgeStates[badge.id] === "unlocked_new";
            return (
              <div
                key={badge.id}
                title={badge.name}
                style={{
                  width: 32,
                  height: 32,
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  background: earned
                    ? `linear-gradient(145deg, ${badge.color}88, ${badge.color}44)`
                    : "rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  filter: earned && isNew
                    ? `drop-shadow(0 0 6px ${badge.color})`
                    : "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ opacity: earned ? 1 : 0.2, fontSize: "0.85rem" }}>{badge.icon}</span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px mb-4" style={{ backgroundColor: "#E0D9CE" }} />

        {/* Offline badges */}
        <div className="text-xs mb-3" style={{ color: "#9A9490" }}>线下课程徽章</div>
        <div className="flex justify-around pb-2">
          {[
            { key: "offline_zibentong", label: "资本通", abbr: "ZBT" },
            { key: "offline_qidong", label: "启动资本", abbr: "QD" },
            { key: "offline_zibendao", label: "资本道", abbr: "ZBD" },
          ].map(b => {
            const unlocked = offlineUnlocked[b.key as keyof typeof offlineUnlocked];
            return (
              <CrestBadge key={b.key} abbr={b.abbr} label={b.label} desc={unlocked ? "已获得" : "线下课程"} unlocked={unlocked} />
            );
          })}
        </div>

      </div>
    </Card>
  );
}

// ─── Learning Tab ─────────────────────────────────────────────────────────────

function LearningTab({
  modules, completed, completedCount, totalLessons, overallPct, totalXP, role,
}: {
  modules: ModuleData[];
  completed: Set<string>;
  completedCount: number;
  totalLessons: number;
  overallPct: number;
  totalXP: number;
  role: string;
}) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已完成", value: completedCount, unit: "关" },
          { label: "总进度", value: `${overallPct}%`, unit: "" },
          { label: "成长积分", value: totalXP, unit: "XP" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <div className="text-xl font-bold font-mono mb-0.5" style={{ color: "#C9A84C" }}>
              {s.value}
              {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "#9A9490" }}>{s.unit}</span>}
            </div>
            <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Module Progress */}
      <Card title="课程进度">
        {modules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "#9A9490" }}>课程准备中，敬请期待</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod) => {
              const done = mod.lessons.filter((l) => completed.has(l.id)).length;
              const total = mod.lessons.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={mod.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: "#1C1814" }}>{mod.title}</span>
                    <span className="text-xs font-mono" style={{ color: pct === 100 ? "#82C8A0" : "#9A9490" }}>
                      {done}/{total}
                    </span>
                  </div>
                  <ProgressBar pct={pct} color={pct === 100 ? "#82C8A0" : undefined} />
                </div>
              );
            })}
            <Link
              href="/student/learn"
              className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium"
              style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
            >
              继续学习 →
            </Link>
          </div>
        )}
      </Card>

      {/* Achievements */}
      <BadgeShowcaseCard role={role} />
    </div>
  );
}

// ─── Enterprise Tab ───────────────────────────────────────────────────────────

function EnterpriseTab({
  companyMode, singleCompany, group,
  onSetMode, onSetSingle, onSetGroup,
}: {
  companyMode: CompanyMode;
  singleCompany: Company | null;
  group: GroupStructure;
  onSetMode: (m: CompanyMode) => void;
  onSetSingle: (c: Company | null) => void;
  onSetGroup: (g: GroupStructure) => void;
}) {
  if (companyMode === null) {
    return <CompanySetup onSetMode={onSetMode} />;
  }

  if (companyMode === "single") {
    return (
      <SingleCompanyView
        company={singleCompany}
        onSetSingle={onSetSingle}
        onSwitchMode={() => { onSetMode(null); onSetSingle(null); }}
        onSwitchToGroup={() => {
          if (singleCompany) {
            onSetGroup({ parent: { ...singleCompany, isParent: true }, subsidiaries: [] });
            onSetMode("group");
          } else {
            onSetMode("group");
          }
        }}
      />
    );
  }

  return (
    <GroupView
      group={group}
      onSetGroup={onSetGroup}
      onSwitchMode={() => { onSetMode(null); onSetGroup({ parent: null, subsidiaries: [] }); }}
      onSwitchToSingle={() => {
        if (group.parent) {
          onSetSingle({ ...group.parent, isParent: false });
          onSetMode("single");
        } else {
          onSetMode("single");
        }
      }}
    />
  );
}

// ─── Company Setup ────────────────────────────────────────────────────────────

function CompanySetup({ onSetMode }: { onSetMode: (m: CompanyMode) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold mb-1" style={{ color: "#1C1814" }}>设置企业架构</h2>
        <p className="text-sm" style={{ color: "#9A9490" }}>选择你的企业结构，系统将自动匹配资本分析模式</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Single Company */}
        <button
          onClick={() => onSetMode("single")}
          className="text-left p-6 rounded-2xl transition-all hover:shadow-md group"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold mb-4"
            style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            单一
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#1C1814" }}>单一公司</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
            我只有一家公司，统一管理所有资本工具数据与 AI 分析
          </p>
          <div
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            选择此模式 →
          </div>
        </button>

        {/* Group */}
        <button
          onClick={() => onSetMode("group")}
          className="text-left p-6 rounded-2xl transition-all hover:shadow-md group"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold mb-4"
            style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.2)" }}
          >
            集团
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#1C1814" }}>集团模式</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
            我拥有母公司与多家子公司，需要集团合并数据与独立分析
          </p>
          <div
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.2)" }}
          >
            选择此模式 →
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Single Company View ──────────────────────────────────────────────────────

function SingleCompanyView({
  company, onSetSingle, onSwitchMode, onSwitchToGroup,
}: {
  company: Company | null;
  onSetSingle: (c: Company | null) => void;
  onSwitchMode: () => void;
  onSwitchToGroup: () => void;
}) {
  const [editing, setEditing] = useState(company === null);
  const [form, setForm] = useState({
    name: company?.name ?? "",
    type: company?.type ?? "私人有限公司",
    status: (company?.status ?? "active") as "active" | "inactive",
  });

  const save = () => {
    if (!form.name.trim()) return;
    onSetSingle({
      id: company?.id ?? `co_${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      status: form.status,
    });
    setEditing(false);
  };

  if (editing || company === null) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>
              {company ? "编辑公司" : "设置公司信息"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#9A9490" }}>单一公司模式</p>
          </div>
          {company && (
            <button onClick={() => setEditing(false)} className="text-xs" style={{ color: "#9A9490" }}>
              取消
            </button>
          )}
        </div>
        <CompanyForm form={form} setForm={setForm} onSave={save} />
        <button
          onClick={onSwitchMode}
          className="text-xs"
          style={{ color: "#9A9490" }}
        >
          ← 重新选择企业架构
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>企业数据</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9A9490" }}>单一公司模式</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
          >
            编辑
          </button>
          <button
            onClick={onSwitchToGroup}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.2)" }}
          >
            升级为集团 →
          </button>
        </div>
      </div>

      {/* Company Card */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
      >
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FBF4E4, #EEE5CB)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: "#1C1814" }}>{company.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs" style={{ color: "#9A9490" }}>{company.type}</span>
              <StatusBadge status={company.status} />
            </div>
          </div>
        </div>

        {/* Growth Status */}
        <GrowthStatusBar label="企业成长状态" level={2} />
      </div>

      {/* AI Analysis */}
      <AIAnalysisCard
        title="AI 企业分析"
        lines={[
          `${company.name} 目前处于成长阶段，建议优先完善现金流与利润结构。`,
          "资本工具使用率将影响系统 AI 分析精准度，建议持续录入数据。",
          "完成财务路线图可解锁更多资本成长建议。",
        ]}
      />

      {/* Tools */}
      <Card title="绑定资本工具">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#68625C" }}
            >
              <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: "#C9A84C" }}>{tool.icon}</span>
              <span className="flex-1 leading-snug">{tool.label}</span>
              <span style={{ color: "#C9A84C" }}>→</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Group View ───────────────────────────────────────────────────────────────

function GroupView({
  group, onSetGroup, onSwitchMode, onSwitchToSingle,
}: {
  group: GroupStructure;
  onSetGroup: (g: GroupStructure) => void;
  onSwitchMode: () => void;
  onSwitchToSingle: () => void;
}) {
  const [addingSub, setAddingSub] = useState(false);
  const [editingParent, setEditingParent] = useState(group.parent === null);
  const [subForm, setSubForm] = useState({ name: "", type: "私人有限公司", shareholding: 100 });
  const [parentForm, setParentForm] = useState({
    name: group.parent?.name ?? "",
    type: group.parent?.type ?? "控股公司",
    status: (group.parent?.status ?? "active") as "active" | "inactive",
  });
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const saveParent = () => {
    if (!parentForm.name.trim()) return;
    onSetGroup({
      ...group,
      parent: {
        id: group.parent?.id ?? `p_${Date.now()}`,
        name: parentForm.name.trim(),
        type: parentForm.type,
        status: parentForm.status,
        isParent: true,
      },
    });
    setEditingParent(false);
  };

  const addSubsidiary = () => {
    if (!subForm.name.trim() || !group.parent) return;
    const newSub: Company = {
      id: `sub_${Date.now()}`,
      name: subForm.name.trim(),
      type: subForm.type,
      status: "active",
      parentId: group.parent.id,
      shareholding: subForm.shareholding,
    };
    onSetGroup({ ...group, subsidiaries: [...group.subsidiaries, newSub] });
    setSubForm({ name: "", type: "私人有限公司", shareholding: 100 });
    setAddingSub(false);
  };

  const removeSub = (id: string) => {
    onSetGroup({ ...group, subsidiaries: group.subsidiaries.filter((s) => s.id !== id) });
    if (selectedCompany === id) setSelectedCompany(null);
  };

  const toggleSubStatus = (id: string) => {
    onSetGroup({
      ...group,
      subsidiaries: group.subsidiaries.map((s) =>
        s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s
      ),
    });
  };

  if (editingParent) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>
            {group.parent ? "编辑母公司" : "设置母公司"}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#9A9490" }}>集团模式</p>
        </div>
        <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
          <FormField label="母公司名称">
            <input
              value={parentForm.name}
              onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })}
              placeholder="例：Eutopos Holdings Sdn Bhd"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
            />
          </FormField>
          <FormField label="公司类型">
            <CompanyTypeSelect value={parentForm.type} onChange={(v) => setParentForm({ ...parentForm, type: v })} />
          </FormField>
          <button
            onClick={saveParent}
            disabled={!parentForm.name.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
          >
            确认母公司
          </button>
        </div>
        <button onClick={onSwitchMode} className="text-xs" style={{ color: "#9A9490" }}>
          ← 重新选择企业架构
        </button>
      </div>
    );
  }

  const viewedCompany = selectedCompany
    ? group.subsidiaries.find((s) => s.id === selectedCompany)
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>集团数据</h2>
          <p className="text-xs mt-0.5" style={{ color: "#9A9490" }}>集团模式 · {group.subsidiaries.length} 家子公司</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingParent(true)}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
          >
            编辑母公司
          </button>
          <button
            onClick={onSwitchToSingle}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            切换单一公司
          </button>
        </div>
      </div>

      {/* Group Structure Visualization */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
      >
        <div className="text-xs font-medium mb-4" style={{ color: "#9A9490" }}>集团架构图</div>

        {/* Parent Node */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer"
            onClick={() => setSelectedCompany(null)}
            style={{
              background: "linear-gradient(135deg, #EFF4FF, #E4EEFF)",
              border: `2px solid ${selectedCompany === null ? "#6B9BD2" : "rgba(107,155,210,0.3)"}`,
              boxShadow: selectedCompany === null ? "0 2px 12px rgba(107,155,210,0.2)" : "none",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#6B9BD2", color: "#FFFFFF" }}
            >
              {group.parent!.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "#1C1814" }}>{group.parent!.name}</div>
              <div className="text-xs" style={{ color: "#6B9BD2" }}>母公司 · {group.parent!.type}</div>
            </div>
          </div>
        </div>

        {/* Connection Lines & Subsidiaries */}
        {group.subsidiaries.length > 0 && (
          <>
            {/* Vertical stem */}
            <div className="flex justify-center">
              <div className="w-px h-4" style={{ backgroundColor: "#D0DCF0" }} />
            </div>

            {/* Horizontal bar */}
            {group.subsidiaries.length > 1 && (
              <div className="relative flex justify-center">
                <div
                  className="h-px"
                  style={{
                    backgroundColor: "#D0DCF0",
                    width: `${Math.min(group.subsidiaries.length * 180, 600)}px`,
                    maxWidth: "100%",
                  }}
                />
              </div>
            )}

            {/* Sub nodes */}
            <div className={`grid gap-3 mt-0 ${group.subsidiaries.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : group.subsidiaries.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {group.subsidiaries.map((sub) => (
                <div key={sub.id} className="flex flex-col items-center">
                  <div className="w-px h-4" style={{ backgroundColor: "#D0DCF0" }} />
                  <button
                    onClick={() => setSelectedCompany(sub.id === selectedCompany ? null : sub.id)}
                    className="w-full text-left p-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: sub.status === "inactive" ? "#F7F4EF" : "#FAFEFF",
                      border: `1.5px solid ${sub.id === selectedCompany ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
                      opacity: sub.status === "inactive" ? 0.6 : 1,
                      boxShadow: sub.id === selectedCompany ? "0 2px 8px rgba(201,168,76,0.15)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: "#FBF4E4", color: "#C9A84C" }}
                      >
                        {sub.name.slice(0, 2).toUpperCase()}
                      </div>
                      <StatusBadge status={sub.status} small />
                    </div>
                    <div className="text-xs font-semibold truncate mb-0.5" style={{ color: "#1C1814" }}>{sub.name}</div>
                    <div className="text-xs" style={{ color: "#9A9490" }}>{sub.type}</div>
                    {sub.shareholding !== undefined && (
                      <div
                        className="mt-1.5 text-xs font-mono px-1.5 py-0.5 rounded-md inline-block"
                        style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
                      >
                        {sub.shareholding}% 持股
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add Subsidiary Button */}
        {!addingSub && (
          <button
            onClick={() => setAddingSub(true)}
            className="mt-4 w-full py-2 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: "#F7F4EF", color: "#9A9490", border: "1px dashed #E0D9CE" }}
          >
            + 新增子公司
          </button>
        )}

        {/* Add Subsidiary Form */}
        {addingSub && (
          <div className="mt-4 rounded-xl p-4 space-y-3" style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE" }}>
            <div className="text-xs font-semibold" style={{ color: "#1C1814" }}>新增子公司</div>
            <FormField label="公司名称">
              <input
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                placeholder="例：CapitalDao Sdn Bhd"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
              />
            </FormField>
            <FormField label="公司类型">
              <CompanyTypeSelect value={subForm.type} onChange={(v) => setSubForm({ ...subForm, type: v })} />
            </FormField>
            <FormField label="持股比例 (%)">
              <input
                type="number"
                min={1}
                max={100}
                value={subForm.shareholding}
                onChange={(e) => setSubForm({ ...subForm, shareholding: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
              />
            </FormField>
            <div className="flex gap-2">
              <button
                onClick={addSubsidiary}
                disabled={!subForm.name.trim()}
                className="flex-1 py-2 rounded-xl text-xs font-semibold disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
              >
                确认新增
              </button>
              <button
                onClick={() => setAddingSub(false)}
                className="flex-1 py-2 rounded-xl text-xs"
                style={{ backgroundColor: "#FFFFFF", color: "#68625C", border: "1px solid #E0D9CE" }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Company Detail */}
      {viewedCompany && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#1C1814" }}>{viewedCompany.name}</h3>
              <p className="text-xs" style={{ color: "#9A9490" }}>子公司数据 · {viewedCompany.shareholding}% 持股</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleSubStatus(viewedCompany.id)}
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
              >
                {viewedCompany.status === "active" ? "停用" : "启用"}
              </button>
              <button
                onClick={() => removeSub(viewedCompany.id)}
                className="text-xs px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: "#FFF0F0", color: "#E57373", border: "1px solid rgba(229,115,115,0.3)" }}
              >
                删除
              </button>
            </div>
          </div>
          <GrowthStatusBar label="子公司成长状态" level={1} />
          <AIAnalysisCard
            title="AI 子公司分析"
            lines={[
              `${viewedCompany.name} 作为集团子公司，建议与母公司同步制定资本战略。`,
              `${viewedCompany.shareholding}% 持股结构清晰，可考虑引入策略投资者优化股权。`,
            ]}
          />
        </div>
      )}

      {/* Group Overview (shown when no sub selected) */}
      {!viewedCompany && (
        <>
          {/* Consolidated Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "集团公司", value: `${1 + group.subsidiaries.length}`, unit: "家" },
              { label: "活跃子公司", value: `${group.subsidiaries.filter(s => s.status === "active").length}`, unit: "家" },
              { label: "集团规模", value: "成长期", unit: "" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4 text-center"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
              >
                <div className="text-xl font-bold font-mono mb-0.5" style={{ color: "#6B9BD2" }}>
                  {s.value}
                  {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "#9A9490" }}>{s.unit}</span>}
                </div>
                <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <GrowthStatusBar label="集团成长状态" level={3} />

          <AIAnalysisCard
            title="AI 集团分析"
            lines={[
              `${group.parent!.name} 集团目前拥有 ${group.subsidiaries.length} 家子公司，建议建立统一资本管理策略。`,
              "集团模式下，母公司应优先完善资本架构与持股结构规划。",
              "建议各子公司独立完成财务路线图，由母公司进行合并分析。",
            ]}
          />
        </>
      )}
    </div>
  );
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function Card({
  title, action, children,
}: {
  title: string;
  action?: { label: string; onClick?: () => void; href?: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "#1C1814" }}>{title}</h2>
        {action && (
          action.href ? (
            <Link href={action.href} className="text-xs" style={{ color: "#C9A84C" }}>{action.label}</Link>
          ) : (
            <button onClick={action.onClick} className="text-xs" style={{ color: "#C9A84C" }}>{action.label}</button>
          )
        )}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#E0D9CE" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(pct, 100)}%`,
          background: color ?? (pct === 100 ? "#82C8A0" : "linear-gradient(to right, #9A7A32, #C9A84C)"),
        }}
      />
    </div>
  );
}

function StatusBadge({ status, small }: { status: "active" | "inactive"; small?: boolean }) {
  return (
    <span
      className={`${small ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"} rounded-full font-medium`}
      style={{
        backgroundColor: status === "active" ? "rgba(130,200,160,0.12)" : "rgba(154,148,144,0.12)",
        color: status === "active" ? "#82C8A0" : "#9A9490",
        border: `1px solid ${status === "active" ? "rgba(130,200,160,0.3)" : "rgba(154,148,144,0.3)"}`,
      }}
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

function GrowthStatusBar({ label, level }: { label: string; level: number }) {
  const stages = ["起步", "成长", "扩张", "成熟", "上市"];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: "#9A9490" }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: "#C9A84C" }}>{stages[Math.min(level, 4)]}</span>
      </div>
      <div className="flex gap-1">
        {stages.map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1.5 rounded-full"
            style={{
              backgroundColor: i <= level ? "#C9A84C" : "#E0D9CE",
              opacity: i <= level ? (1 - (level - i) * 0.1) : 0.4,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {stages.map((s) => (
          <span key={s} className="text-xs" style={{ color: "#9A9490", fontSize: "9px" }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function AIAnalysisCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "#FFFDF7", border: "1px solid rgba(201,168,76,0.2)" }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0"
          style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
        >
          ✦
        </span>
        <span className="text-xs font-semibold" style={{ color: "#C9A84C" }}>{title}</span>
      </div>
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <p key={i} className="text-xs leading-relaxed" style={{ color: "#68625C" }}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: "#68625C" }}>{label}</label>
      {children}
    </div>
  );
}

function CompanyTypeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const types = ["私人有限公司", "控股公司", "上市公司", "合伙企业", "独资经营", "社会企业", "其他"];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
    >
      {types.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

function CompanyForm({
  form, setForm, onSave,
}: {
  form: { name: string; type: string; status: "active" | "inactive" };
  setForm: (f: { name: string; type: string; status: "active" | "inactive" }) => void;
  onSave: () => void;
}) {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
      <FormField label="公司名称">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例：CapitalDao Sdn Bhd"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
        />
      </FormField>
      <FormField label="公司类型">
        <CompanyTypeSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
      </FormField>
      <button
        onClick={onSave}
        disabled={!form.name.trim()}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
      >
        保存公司信息
      </button>
    </div>
  );
}
