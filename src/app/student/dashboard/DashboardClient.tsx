"use client";

import { useState, useEffect, useCallback } from "react";
import type { FinancialCore } from "@/lib/financialCore";
import { loadCompanyToolData } from "@/lib/toolData";
import type { AllToolData } from "@/lib/toolData";
import { COUNTRY_OPTIONS } from "@/lib/taxRates";
import Link from "next/link";
import {
  ONLINE_BADGES,
  OFFLINE_BADGES,
  ULTIMATE_BADGE,
  getEarnedOnlineBadgeIds,
  getBadgeStates,
  getCompletedLessons,
} from "@/lib/badges";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  country?: string;
  isParent?: boolean;
  parentId?: string | null;
  shareholding?: number;
  industry?: string;
  equityStructure?: string;
  notes?: string;
  netProfit?: number;
}

interface GroupStructure {
  parent: Company | null;
  subsidiaries: Company[];
}

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

  // Sync course progress from localStorage
  const [completed, setCompleted] = useState<Set<string>>(new Set(completedIds));
  useEffect(() => {
    try {
      const raw = localStorage.getItem("zbd_online_completed");
      if (raw) setCompleted(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  // Auto-switch to tab from URL param (?tab=enterprise etc.)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "enterprise" || tab === "learning" || tab === "overview") {
        setActiveTab(tab as TabId);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <div className="text-xs font-medium mb-1" style={{ color: "#C9A84C" }}>小资总结</div>
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
            <p className="text-sm mb-4" style={{ color: "#68625C" }}>绑定企业，解锁资本小资分析</p>
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
              <div>
                <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>{singleCompany.name}</div>
                <div className="text-xs" style={{ color: "#9A9490" }}>{singleCompany.type} · 独立公司</div>
              </div>
              <StatusBadge status={singleCompany.status} />
            </div>
            <GrowthStatusBar label="企业成长状态" netProfit={singleCompany.netProfit ?? 0} companyId={`single_${singleCompany.id}`} />
          </div>
        ) : companyMode === "group" && group.parent ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>{group.parent.name}</div>
                <div className="text-xs" style={{ color: "#9A9490" }}>母公司 · {group.subsidiaries.length} 家子公司</div>
              </div>
            </div>
            <GrowthStatusBar label="集团成长状态" netProfit={(group.parent?.netProfit ?? 0) + group.subsidiaries.reduce((s, c) => s + (c.netProfit ?? 0), 0)} companyId={group.parent ? `group_${group.parent.id}` : undefined} />
          </div>
        ) : null}
      </Card>

    </div>
  );
}

// ─── Badge Showcase Card ──────────────────────────────────────────────────────

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

  const offlineUnlocked: Record<string, boolean> = {
    offline_zibentong: ["ZIBENTONG_GRAD","QIDONG_GRAD","ZIBENDAO_GRAD","ADMIN","SUPER_ADMIN"].includes(role),
    offline_qidong: ["QIDONG_GRAD","ZIBENDAO_GRAD","ADMIN","SUPER_ADMIN"].includes(role),
    offline_zibendao: ["ZIBENDAO_GRAD","ADMIN","SUPER_ADMIN"].includes(role),
  };

  const allOfflineUnlocked = OFFLINE_BADGES.every(b => offlineUnlocked[b.id]);
  const ultimateUnlocked = earnedIds.size >= ONLINE_BADGES.length && allOfflineUnlocked;

  return (
    <Card title={hasNew ? "新成就 成就徽章" : "成就徽章"} action={undefined}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium" style={{ color: "#68625C" }}>线上成长徽章</span>
          <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>{earnedIds.size}/{ONLINE_BADGES.length}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
          {ONLINE_BADGES.map(badge => {
            const earned = earnedIds.has(badge.id);
            const isNew = badgeStates[badge.id] === "unlocked_new";
            return (
              <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  title={badge.name}
                  style={{
                    width: 52, height: 52, borderRadius: "50%", overflow: "hidden", position: "relative",
                    border: earned ? `2px solid ${badge.color}66` : "2px solid #E0D9CE",
                    boxShadow: isNew ? `0 0 12px ${badge.color}99` : "none",
                    transition: "all 0.2s", flexShrink: 0,
                  }}
                >
                  <img src={badge.image} alt={badge.name} width={52} height={52}
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: earned ? "none" : "grayscale(1) brightness(0.55)", transition: "filter 0.3s" }}
                  />
                  {isNew && (
                    <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#C9A84C", border: "1.5px solid #fff" }} />
                  )}
                </div>
                <span style={{ fontSize: "9px", color: earned ? "#5C5650" : "#B0AAA4", textAlign: "center", lineHeight: 1.2 }}>
                  {badge.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="h-px mb-4" style={{ backgroundColor: "#E0D9CE" }} />

        <div className="text-xs font-medium mb-3" style={{ color: "#68625C" }}>线下课程徽章</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
          {OFFLINE_BADGES.map(badge => {
            const unlocked = offlineUnlocked[badge.id];
            return (
              <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 68, height: 68, borderRadius: "50%", overflow: "hidden", border: unlocked ? `2px solid ${badge.color}88` : "2px solid #E0D9CE", boxShadow: unlocked ? `0 2px 12px ${badge.color}44` : "none", transition: "all 0.3s", flexShrink: 0 }}>
                  <img src={badge.image} alt={badge.name} width={68} height={68}
                    style={{ width: "100%", height: "100%", objectFit: "cover", filter: unlocked ? "none" : "grayscale(1) brightness(0.55)" }}
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: unlocked ? "#5C5650" : "#B0AAA4" }}>{badge.name}</div>
                  <div style={{ fontSize: "10px", color: "#9A9490" }}>{unlocked ? "已获得" : "线下课程"}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-px mb-4" style={{ backgroundColor: "#E0D9CE" }} />

        <div className="text-xs font-medium mb-3" style={{ color: "#68625C" }}>终极成就</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", border: ultimateUnlocked ? "3px solid #C9A84C" : "2px solid #E0D9CE", boxShadow: ultimateUnlocked ? "0 4px 20px rgba(201,168,76,0.5)" : "none", transition: "all 0.3s" }}>
            <img src={ULTIMATE_BADGE.image} alt={ULTIMATE_BADGE.name} width={88} height={88}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: ultimateUnlocked ? "none" : "grayscale(1) brightness(0.45)" }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: ultimateUnlocked ? "#C9A84C" : "#B0AAA4", letterSpacing: "0.03em" }}>
              {ULTIMATE_BADGE.name}
            </div>
            <div style={{ fontSize: "11px", color: "#9A9490" }}>
              {ultimateUnlocked ? "Capital Master" : "完成全部课程解锁"}
            </div>
          </div>
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
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "已完成", value: completedCount, unit: "关" },
          { label: "总进度", value: `${overallPct}%`, unit: "" },
          { label: "成长积分", value: totalXP, unit: "XP" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
            <div className="text-xl font-bold font-mono mb-0.5" style={{ color: "#C9A84C" }}>
              {s.value}
              {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "#9A9490" }}>{s.unit}</span>}
            </div>
            <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
          </div>
        ))}
      </div>

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
        onSwitchMode={() => onSetMode(null)}
        onSwitchToGroup={() => {
          // Only pre-fill group parent if none exists yet
          if (!group.parent && singleCompany) {
            onSetGroup({ parent: { ...singleCompany, isParent: true }, subsidiaries: [] });
          }
          onSetMode("group");
        }}
      />
    );
  }

  return (
    <GroupView
      group={group}
      onSetGroup={onSetGroup}
      onSwitchMode={() => onSetMode(null)}
      onSwitchToSingle={() => {
        // Only pre-fill single if none exists yet
        if (!singleCompany && group.parent) {
          onSetSingle({ ...group.parent, isParent: false });
        }
        onSetMode("single");
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
        <button
          onClick={() => onSetMode("single")}
          className="text-left p-6 rounded-2xl transition-all hover:shadow-md"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold mb-4" style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
            单一
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#1C1814" }}>单一公司</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
            我只有一家公司，统一管理所有资本工具数据与小资分析
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
            选择此模式 →
          </div>
        </button>

        <button
          onClick={() => onSetMode("group")}
          className="text-left p-6 rounded-2xl transition-all hover:shadow-md"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-bold mb-4" style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.2)" }}>
            集团
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#1C1814" }}>集团模式</h3>
          <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
            我拥有母公司与多家子公司，需要集团合并数据与独立分析
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#EFF4FF", color: "#6B9BD2", border: "1px solid rgba(107,155,210,0.2)" }}>
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
    industry: company?.industry ?? "",
    notes: company?.notes ?? "",
    netProfit: company?.netProfit ?? 0,
    country: company?.country ?? "",
  });

  const save = () => {
    if (!form.name.trim()) return;
    onSetSingle({
      id: company?.id ?? `co_${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      industry: form.industry.trim() || undefined,
      notes: form.notes.trim() || undefined,
      netProfit: form.netProfit || undefined,
      country: (form.country || undefined) as import("@/lib/enterprise").CountryCode | undefined,
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
            <button onClick={() => setEditing(false)} className="text-xs" style={{ color: "#9A9490" }}>取消</button>
          )}
        </div>
        <CompanyForm form={form} setForm={setForm} onSave={save} />
        <button onClick={onSwitchMode} className="text-xs" style={{ color: "#9A9490" }}>← 重新选择企业架构</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
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

      <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
        <div className="mb-5">
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: "#1C1814" }}>{company.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: "#9A9490" }}>{company.type}</span>
              {company.industry && <span className="text-xs" style={{ color: "#9A9490" }}>· {company.industry}</span>}
              <StatusBadge status={company.status} />
            </div>
          </div>
        </div>
        <GrowthStatusBar label="企业成长状态" netProfit={company.netProfit ?? 0} companyId={`single_${company.id}`} />
        {company.notes && (
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "#68625C" }}>{company.notes}</p>
        )}
      </div>

      <EnterpriseCoreSummary companyId={`single_${company.id}`} />

      <AIAnalysisCard
        title="小资分析"
        lines={[
          `${company.name} 目前处于成长阶段，建议优先完善现金流与利润结构。`,
          "资本工具使用率将影响小资分析精准度，建议持续录入数据。",
          "完成财务路线图可解锁更多资本成长建议。",
        ]}
      />
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
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<string | null>(null);

  const [subForm, setSubForm] = useState({
    name: "",
    type: "私人有限公司",
    shareholding: 100,
    industry: "",
    notes: "",
    netProfit: 0,
    country: "",
  });

  const [parentForm, setParentForm] = useState({
    name: group.parent?.name ?? "",
    type: group.parent?.type ?? "控股公司",
    status: (group.parent?.status ?? "active") as "active" | "inactive",
    industry: group.parent?.industry ?? "",
    netProfit: group.parent?.netProfit ?? 0,
    country: group.parent?.country ?? "",
  });

  const [editSubForm, setEditSubForm] = useState({
    name: "",
    type: "私人有限公司",
    shareholding: 100,
    industry: "",
    notes: "",
    netProfit: 0,
    country: "",
  });

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
        industry: parentForm.industry.trim() || undefined,
        netProfit: parentForm.netProfit || undefined,
        country: (parentForm.country || undefined) as import("@/lib/enterprise").CountryCode | undefined,
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
      industry: subForm.industry.trim() || undefined,
      notes: subForm.notes.trim() || undefined,
      netProfit: subForm.netProfit || undefined,
      country: (subForm.country || undefined) as import("@/lib/enterprise").CountryCode | undefined,
    };
    onSetGroup({ ...group, subsidiaries: [...group.subsidiaries, newSub] });
    setSubForm({ name: "", type: "私人有限公司", shareholding: 100, industry: "", notes: "", netProfit: 0, country: "" });
    setAddingSub(false);
  };

  const startEditSub = (sub: Company) => {
    setEditSubForm({
      name: sub.name,
      type: sub.type,
      shareholding: sub.shareholding ?? 100,
      industry: sub.industry ?? "",
      notes: sub.notes ?? "",
      netProfit: sub.netProfit ?? 0,
      country: sub.country ?? "",
    });
    setEditingSub(sub.id);
  };

  const saveSubEdit = () => {
    if (!editSubForm.name.trim()) return;
    onSetGroup({
      ...group,
      subsidiaries: group.subsidiaries.map((s) =>
        s.id === editingSub
          ? {
              ...s,
              name: editSubForm.name.trim(),
              type: editSubForm.type,
              shareholding: editSubForm.shareholding,
              industry: editSubForm.industry.trim() || undefined,
              notes: editSubForm.notes.trim() || undefined,
              netProfit: editSubForm.netProfit || undefined,
              country: (editSubForm.country || undefined) as import("@/lib/enterprise").CountryCode | undefined,
            }
          : s
      ),
    });
    setEditingSub(null);
  };

  const removeSub = (id: string) => {
    onSetGroup({ ...group, subsidiaries: group.subsidiaries.filter((s) => s.id !== id) });
    if (selectedCompany === id) setSelectedCompany(null);
    setConfirmDeleteId(null);
    setEditingSub(null);
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
          <FormField label="所属行业（可选）">
            <IndustrySelect value={parentForm.industry} onChange={(v) => setParentForm({ ...parentForm, industry: v })} />
          </FormField>
          <FormField label="净利润（RM，可选）">
            <input
              type="number" min={0}
              value={parentForm.netProfit || ""}
              onChange={(e) => setParentForm({ ...parentForm, netProfit: Number(e.target.value) })}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
            />
          </FormField>
          <FormField label="所在国家">
            <select
              value={parentForm.country}
              onChange={(e) => setParentForm({ ...parentForm, country: e.target.value })}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: parentForm.country ? "#1C1814" : "#9A9490" }}
            >
              <option value="">请选择国家</option>
              {COUNTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
        <button onClick={onSwitchMode} className="text-xs" style={{ color: "#9A9490" }}>← 重新选择企业架构</button>
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

      {/* Architecture Diagram */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
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
            <div>
              <div className="text-sm font-bold" style={{ color: "#1C1814" }}>{group.parent!.name}</div>
              <div className="text-xs" style={{ color: "#6B9BD2" }}>母公司 · {group.parent!.type}</div>
            </div>
          </div>
        </div>

        {/* Connecting lines and subsidiaries */}
        {group.subsidiaries.length > 0 && (
          <>
            <div className="flex justify-center">
              <div className="w-px h-4" style={{ backgroundColor: "#D0DCF0" }} />
            </div>

            {group.subsidiaries.length > 1 && (
              <div className="relative flex justify-center">
                <div className="h-px" style={{ backgroundColor: "#D0DCF0", width: `${Math.min(group.subsidiaries.length * 180, 600)}px`, maxWidth: "100%" }} />
              </div>
            )}

            <div className={`grid gap-3 mt-0 ${group.subsidiaries.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : group.subsidiaries.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {group.subsidiaries.map((sub) => (
                <div key={sub.id} className="flex flex-col items-center">
                  {/* Connecting line with shareholding % */}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-2" style={{ backgroundColor: "#D0DCF0" }} />
                    {sub.shareholding !== undefined && (
                      <span style={{
                        fontSize: 9,
                        color: "#6B9BD2",
                        backgroundColor: "#EFF4FF",
                        border: "1px solid rgba(107,155,210,0.2)",
                        borderRadius: 3,
                        padding: "0 4px",
                        lineHeight: "14px",
                        userSelect: "none",
                      }}>
                        {sub.shareholding}%
                      </span>
                    )}
                    <div className="w-px h-2" style={{ backgroundColor: "#D0DCF0" }} />
                  </div>
                  <button
                    onClick={() => { setSelectedCompany(sub.id === selectedCompany ? null : sub.id); setEditingSub(null); }}
                    className="w-full text-left p-3 rounded-xl transition-all"
                    style={{
                      backgroundColor: sub.status === "inactive" ? "#F7F4EF" : "#FAFEFF",
                      border: `1.5px solid ${sub.id === selectedCompany ? "#C9A84C" : "rgba(201,168,76,0.2)"}`,
                      opacity: sub.status === "inactive" ? 0.6 : 1,
                      boxShadow: sub.id === selectedCompany ? "0 2px 8px rgba(201,168,76,0.15)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={sub.status} small />
                    </div>
                    <div className="text-xs font-semibold truncate mb-0.5" style={{ color: "#1C1814" }}>{sub.name}</div>
                    <div className="text-xs" style={{ color: "#9A9490" }}>{sub.type}</div>
                    {sub.industry && (
                      <div className="text-xs mt-0.5 truncate" style={{ color: "#B0AAA4" }}>{sub.industry}</div>
                    )}
                    {sub.shareholding !== undefined && (
                      <div className="mt-1.5 text-xs font-mono px-1.5 py-0.5 rounded-md inline-block" style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}>
                        {sub.shareholding}% 持股
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Add subsidiary button */}
        {!addingSub && (
          <button
            onClick={() => setAddingSub(true)}
            className="mt-4 w-full py-2 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: "#F7F4EF", color: "#9A9490", border: "1px dashed #E0D9CE" }}
          >
            + 新增子公司
          </button>
        )}

        {/* Add subsidiary form */}
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
                type="number" min={1} max={100}
                value={subForm.shareholding}
                onChange={(e) => setSubForm({ ...subForm, shareholding: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
              />
            </FormField>
            <FormField label="所属行业（可选）">
              <IndustrySelect value={subForm.industry} onChange={(v) => setSubForm({ ...subForm, industry: v })} />
            </FormField>
            <FormField label="净利润（RM，可选）">
              <input
                type="number" min={0}
                value={subForm.netProfit || ""}
                onChange={(e) => setSubForm({ ...subForm, netProfit: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
              />
            </FormField>
            <FormField label="备注（可选）">
              <input
                value={subForm.notes}
                onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                placeholder="简短描述"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
              />
            </FormField>
            <FormField label="所在国家">
              <select
                value={subForm.country}
                onChange={(e) => setSubForm({ ...subForm, country: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: subForm.country ? "#1C1814" : "#9A9490" }}
              >
                <option value="">请选择国家</option>
                {COUNTRY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
        <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(201,168,76,0.3)" }}>
          {editingSub === viewedCompany.id ? (
            /* Edit form */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>编辑子公司</div>
                <button onClick={() => setEditingSub(null)} className="text-xs" style={{ color: "#9A9490" }}>取消</button>
              </div>
              <FormField label="公司名称">
                <input
                  value={editSubForm.name}
                  onChange={(e) => setEditSubForm({ ...editSubForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
                />
              </FormField>
              <FormField label="公司类型">
                <CompanyTypeSelect value={editSubForm.type} onChange={(v) => setEditSubForm({ ...editSubForm, type: v })} />
              </FormField>
              <FormField label="持股比例 (%)">
                <input
                  type="number" min={1} max={100}
                  value={editSubForm.shareholding}
                  onChange={(e) => setEditSubForm({ ...editSubForm, shareholding: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
                />
              </FormField>
              <FormField label="所属行业（可选）">
                <IndustrySelect value={editSubForm.industry} onChange={(v) => setEditSubForm({ ...editSubForm, industry: v })} />
              </FormField>
              <FormField label="净利润（RM，可选）">
                <input
                  type="number" min={0}
                  value={editSubForm.netProfit || ""}
                  onChange={(e) => setEditSubForm({ ...editSubForm, netProfit: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
                />
              </FormField>
              <FormField label="备注（可选）">
                <input
                  value={editSubForm.notes}
                  onChange={(e) => setEditSubForm({ ...editSubForm, notes: e.target.value })}
                  placeholder="简短描述"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
                />
              </FormField>
              <FormField label="所在国家">
                <select
                  value={editSubForm.country}
                  onChange={(e) => setEditSubForm({ ...editSubForm, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: editSubForm.country ? "#1C1814" : "#9A9490" }}
                >
                  <option value="">请选择国家</option>
                  {COUNTRY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>
              <button
                onClick={saveSubEdit}
                disabled={!editSubForm.name.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#FFFFFF" }}
              >
                保存更改
              </button>
            </div>
          ) : (
            /* Display mode */
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "#1C1814" }}>{viewedCompany.name}</h3>
                  <p className="text-xs" style={{ color: "#9A9490" }}>子公司 · {viewedCompany.shareholding}% 持股</p>
                  {viewedCompany.industry && (
                    <p className="text-xs mt-0.5" style={{ color: "#9A9490" }}>{viewedCompany.industry}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEditSub(viewedCompany)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: "#FBF4E4", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => toggleSubStatus(viewedCompany.id)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
                  >
                    {viewedCompany.status === "active" ? "停用" : "启用"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(viewedCompany.id)}
                    className="text-xs px-2.5 py-1 rounded-lg"
                    style={{ backgroundColor: "#FFF0F0", color: "#E57373", border: "1px solid rgba(229,115,115,0.3)" }}
                  >
                    删除
                  </button>
                </div>
              </div>
              {viewedCompany.notes && (
                <p className="text-xs" style={{ color: "#68625C" }}>{viewedCompany.notes}</p>
              )}
              <GrowthStatusBar label="子公司成长状态" netProfit={viewedCompany.netProfit ?? 0} />
              <AIAnalysisCard
                title="小资分析"
                lines={[
                  `${viewedCompany.name} 作为集团子公司，建议与母公司同步制定资本战略。`,
                  `${viewedCompany.shareholding}% 持股结构清晰，可考虑引入策略投资者优化股权。`,
                ]}
              />
            </>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div
          onClick={() => setConfirmDeleteId(null)}
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl p-6 text-center"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <h3 className="text-base font-bold mb-2" style={{ color: "#1C1814" }}>确认删除子公司？</h3>
            <p className="text-sm mb-5" style={{ color: "#68625C" }}>
              删除后，该子公司的所有资料将无法恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 rounded-xl text-sm"
                style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
              >
                取消
              </button>
              <button
                onClick={() => removeSub(confirmDeleteId)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: "#FFF0F0", color: "#E57373", border: "1px solid rgba(229,115,115,0.3)" }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group overview when no subsidiary selected */}
      {!viewedCompany && (
        <>
          <GrowthStatusBar label="集团成长状态" netProfit={(group.parent?.netProfit ?? 0) + group.subsidiaries.reduce((s, c) => s + (c.netProfit ?? 0), 0)} companyId={group.parent ? `group_${group.parent.id}` : undefined} />

          {group.parent && <EnterpriseCoreSummary companyId={`group_${group.parent.id}`} />}

          <AIAnalysisCard
            title="小资分析"
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


// ─── Enterprise Core Summary ─────────────────────────────────────────────────

function fmtMoney(n: number | undefined, sym = "RM"): string {
  if (n == null || isNaN(n)) return "—";
  return sym + " " + Math.round(n).toLocaleString("en-US");
}

function fmtPct(n: number | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return n.toFixed(1) + "%";
}

function fmtRatio(n: number | undefined): string {
  if (n == null || !isFinite(n) || isNaN(n)) return "—";
  return n.toFixed(2) + "x";
}

function CoreDataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F0EDE8" }}>
      <span className="text-xs" style={{ color: "#9A9490" }}>{label}</span>
      <span className="text-xs font-semibold font-mono" style={{ color: "#2B2B2B" }}>{value}</span>
    </div>
  );
}

function CoreSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0">
      <p className="text-xs font-semibold mb-1" style={{ color: "#C9A84C" }}>{title}</p>
      {children}
    </div>
  );
}

function EnterpriseCoreSummary({ companyId }: { companyId: string }) {
  const [toolData, setToolData] = useState<AllToolData>({});
  const [dbCore, setDbCore] = useState<FinancialCore | null>(null);

  useEffect(() => {
    if (!companyId) return;

    function reload() {
      const ld = loadCompanyToolData(companyId);
      setToolData(ld);
    }

    // Step 1: Load all tool data from localStorage immediately
    reload();

    // Step 2: Listen for toolDataUpdated events (fired by saveToolData)
    function onToolDataUpdated(e: Event) {
      const ev = e as CustomEvent<{ companyId: string; toolId: string }>;
      if (ev.detail.companyId !== companyId) return;
      reload();
    }
    window.addEventListener("toolDataUpdated", onToolDataUpdated);

    // Step 3: Fetch _financial_core from DB as supplement for older data
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data && Object.keys(data.data.updatedBy ?? {}).length > 0) {
          setDbCore(data.data as FinancialCore);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("toolDataUpdated", onToolDataUpdated);
  }, [companyId]);

  const t01 = toolData.T01?.calculatedOutput;
  const t02 = toolData.T02?.calculatedOutput;
  const t03 = toolData.T03?.calculatedOutput;
  const t06 = toolData.T06?.calculatedOutput;
  const t07 = toolData.T07?.calculatedOutput;
  const t08 = toolData.T08?.calculatedOutput;
  const t09 = toolData.T09?.calculatedOutput;

  const sym =
    toolData.T01?.currency ??
    toolData.T02?.currency ??
    dbCore?.currencySymbol ??
    "RM";

  const hasLocalData = Object.keys(toolData).length > 0;
  const hasDbData = dbCore && Object.keys(dbCore.updatedBy ?? {}).length > 0;
  if (!hasLocalData && !hasDbData) return null;

  // Merged values: localStorage primary, DB fills gaps
  const annualRevenue = t01?.annualRevenue ?? dbCore?.annualRevenue;
  const grossProfit   = t01?.grossProfit   ?? dbCore?.grossProfit;
  const ebit          = t01?.pbt           ?? dbCore?.ebit;
  const taxAmt        = t01?.taxAmt        ?? dbCore?.taxAmt;
  const annualPAT     = t01?.pat           ?? dbCore?.annualPAT;
  const patMargin     = t01?.patMarginPct  ?? dbCore?.patMargin;
  const grossMargin   = t01?.grossMarginPct ?? dbCore?.grossMargin;

  const totalAssets      = t02?.totalAssets      ?? dbCore?.totalAssets;
  const totalLiabilities = t02?.totalLiabilities ?? dbCore?.totalLiabilities;
  const totalEquity      = t02?.totalEquity      ?? dbCore?.totalEquity;
  const currentRatio     = t02?.currentRatio     ?? dbCore?.currentRatio;
  const t02DebtRatio     = t02?.debtRatio        as number | undefined;
  const t02DebtToEquity  = t02?.debtToEquity     ?? dbCore?.debtToEquity;

  const yearEndCash          = t03?.yearEndCash          ?? dbCore?.yearEndCash;
  const netOperatingCashFlow = t03?.netOperatingCashFlow as number | undefined;

  const currentValuation = dbCore?.currentValuation;
  const targetValuation  = dbCore?.targetValuation;
  // T06 融资路线图 computed fields
  const t06LatestPostMoney   = t06?.latestPostMoney   as number | undefined;
  const t06FounderFinalPct   = t06?.founderFinalPct   as number | undefined;
  const t06CofounderFinalPct = t06?.cofounderFinalPct as number | undefined;
  const t06TotalInvested     = t06?.totalInvested     as number | undefined;
  const t06IpoTarget         = t06?.ipoTargetValuation as number | undefined;
  const t06LatestPatTarget   = t06?.latestPatTarget   as number | undefined;
  const t06LatestPe          = t06?.latestPe          as number | undefined;
  const t06CurrentStage      = t06?.currentStageName  as string | undefined;
  const t06ActualStageName   = t06?.currentActualStageName as string | undefined;
  const t06ActualPostMoney   = t06?.currentActualPostMoney as number | undefined;
  const t06NextStageName     = t06?.nextStageName     as string | undefined;
  const t06NextStagePostMoney = t06?.nextStagePostMoney as number | undefined;
  const t06NextStagePat      = t06?.nextStagePat      as number | undefined;
  const t06NextStagePe       = t06?.nextStagePe       as number | undefined;
  const t06IsAtIPO           = !!(t06?.isAtIPO);

  const roadmapYear1Revenue = t07?.roadmapYear1Revenue ?? dbCore?.roadmapYear1Revenue;
  const roadmapYear2Revenue = t07?.roadmapYear2Revenue ?? dbCore?.roadmapYear2Revenue;
  const roadmapYear3Revenue = t07?.roadmapYear3Revenue ?? dbCore?.roadmapYear3Revenue;
  const roadmapYear1PAT     = t07?.roadmapYear1PAT     ?? dbCore?.roadmapYear1PAT;
  const roadmapYear2PAT     = t07?.roadmapYear2PAT     ?? dbCore?.roadmapYear2PAT;
  const roadmapYear3PAT     = t07?.roadmapYear3PAT     ?? dbCore?.roadmapYear3PAT;

  const founderPct  = t08?.founderPct  as number | undefined ?? dbCore?.founderPct;
  const esopPct     = t08?.esopPct     as number | undefined;
  const investorPct = t08?.investorPct as number | undefined;

  const wacc          = t09?.wacc          as number | undefined;
  const dscrVal       = t09?.dscr          as number | null | undefined;
  const capitalDeRatio = t09?.debtToEquity as number | undefined;

  const allTimes = [
    ...Object.values(toolData).map((d) => d?.updatedAt).filter(Boolean) as string[],
    ...Object.values(dbCore?.updatedBy ?? {}).filter(Boolean) as string[],
  ].sort().reverse();
  const lastUpdated = allTimes[0];

  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
      <p className="text-xs font-semibold" style={{ color: "#1C1814" }}>企业核心数据</p>

      {(t01 || dbCore?.annualRevenue != null) && (
        <CoreSection title="损益概览">
          <CoreDataRow label="年营收" value={fmtMoney(annualRevenue, sym)} />
          <CoreDataRow label="毛利润" value={fmtMoney(grossProfit, sym)} />
          <CoreDataRow label="税前利润" value={fmtMoney(ebit, sym)} />
          <CoreDataRow label="企业所得税" value={fmtMoney(taxAmt, sym)} />
          <CoreDataRow label="税后净利润（PAT）" value={fmtMoney(annualPAT, sym)} />
          <CoreDataRow label="净利润率" value={fmtPct(patMargin)} />
          <CoreDataRow label="毛利率" value={fmtPct(grossMargin)} />
        </CoreSection>
      )}

      {(t02 || dbCore?.totalAssets != null) && (
        <CoreSection title="资产负债表">
          <CoreDataRow label="总资产" value={fmtMoney(totalAssets, sym)} />
          <CoreDataRow label="总负债" value={fmtMoney(totalLiabilities, sym)} />
          <CoreDataRow label="股东权益" value={fmtMoney(totalEquity, sym)} />
          <CoreDataRow label="流动比率" value={fmtRatio(currentRatio)} />
          {t02DebtRatio != null && <CoreDataRow label="负债率" value={t02DebtRatio.toFixed(1) + "%"} />}
          <CoreDataRow label="负债权益比" value={fmtRatio(t02DebtToEquity)} />
        </CoreSection>
      )}

      {(t03 || dbCore?.yearEndCash != null) && (
        <CoreSection title="现金流">
          <CoreDataRow label="年末现金" value={fmtMoney(yearEndCash, sym)} />
          {netOperatingCashFlow != null && (
            <CoreDataRow label="净营业现金流" value={fmtMoney(netOperatingCashFlow, sym)} />
          )}
        </CoreSection>
      )}

      {dbCore?.currentValuation != null && (
        <CoreSection title="企业估值">
          <CoreDataRow label="当前估值" value={fmtMoney(currentValuation, sym)} />
          <CoreDataRow label="目标估值" value={fmtMoney(targetValuation, sym)} />
        </CoreSection>
      )}

      {t06 ? (
        <CoreSection title="融资路线图">
          {t06ActualStageName ? (
            <>
              <CoreDataRow label="当前融资阶段" value={t06ActualStageName} />
              {t06ActualPostMoney != null && t06ActualPostMoney > 0 && (
                <CoreDataRow label="当前估值" value={fmtMoney(t06ActualPostMoney, sym)} />
              )}
              {t06IsAtIPO ? (
                <div className="py-1.5">
                  <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "rgba(61,122,65,0.08)", color: "#3D7A41", border: "1px solid rgba(61,122,65,0.2)" }}>
                    已达到上市阶段
                  </span>
                </div>
              ) : (
                <>
                  {t06NextStageName && <CoreDataRow label="下一目标阶段" value={t06NextStageName} />}
                  {t06NextStagePostMoney != null && t06NextStagePostMoney > 0 && (
                    <CoreDataRow label="下一阶段目标估值" value={fmtMoney(t06NextStagePostMoney, sym)} />
                  )}
                  {t06NextStagePat != null && t06NextStagePat > 0 && (
                    <CoreDataRow label="下一阶段目标 PAT" value={fmtMoney(t06NextStagePat, sym)} />
                  )}
                  {t06NextStagePe != null && t06NextStagePe > 0 && (
                    <CoreDataRow label="市盈率（PE）" value={"PE " + t06NextStagePe} />
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {t06CurrentStage && <CoreDataRow label="最新阶段" value={t06CurrentStage} />}
              {t06LatestPostMoney != null && t06LatestPostMoney > 0 && (
                <CoreDataRow label="最新估值" value={fmtMoney(t06LatestPostMoney, sym)} />
              )}
              {t06FounderFinalPct != null && t06FounderFinalPct > 0 && (
                <CoreDataRow label="创办人最终持股" value={(t06FounderFinalPct * 100).toFixed(1) + "%"} />
              )}
              {t06TotalInvested != null && t06TotalInvested > 0 && (
                <CoreDataRow label="累计融资额" value={fmtMoney(t06TotalInvested, sym)} />
              )}
            </>
          )}
        </CoreSection>
      ) : (
        <div className="py-3 px-4 rounded-xl" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
          <p className="text-xs font-semibold mb-1" style={{ color: "#C9A84C" }}>融资路线图</p>
          <p className="text-xs mb-2" style={{ color: "#9A9490" }}>尚未建立融资路线图</p>
          <a href="/tools/financial-roadmap" className="text-xs px-3 py-1.5 rounded-lg inline-block"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}>
            前往融资路线图工具
          </a>
        </div>
      )}

      {(t07 || dbCore?.roadmapYear1Revenue != null) && (
        <CoreSection title="财务路线图">
          <CoreDataRow label="第1年营收" value={fmtMoney(roadmapYear1Revenue, sym)} />
          <CoreDataRow label="第1年税后净利润" value={fmtMoney(roadmapYear1PAT, sym)} />
          <CoreDataRow label="第2年营收" value={fmtMoney(roadmapYear2Revenue, sym)} />
          <CoreDataRow label="第2年税后净利润" value={fmtMoney(roadmapYear2PAT, sym)} />
          <CoreDataRow label="第3年营收" value={fmtMoney(roadmapYear3Revenue, sym)} />
          <CoreDataRow label="第3年税后净利润" value={fmtMoney(roadmapYear3PAT, sym)} />
        </CoreSection>
      )}

      {(t08 || dbCore?.founderPct != null) && (
        <CoreSection title="股权架构">
          {founderPct != null && <CoreDataRow label="创始人持股" value={fmtPct(founderPct)} />}
          {esopPct != null && <CoreDataRow label="ESOP 池" value={fmtPct(esopPct)} />}
          {investorPct != null && <CoreDataRow label="投资人持股" value={fmtPct(investorPct)} />}
        </CoreSection>
      )}

      {t09 && (
        <CoreSection title="资本结构">
          {wacc != null && <CoreDataRow label="WACC" value={fmtPct(wacc)} />}
          {capitalDeRatio != null && <CoreDataRow label="D/E 比" value={fmtRatio(capitalDeRatio)} />}
          {dscrVal != null && <CoreDataRow label="DSCR" value={dscrVal.toFixed(2) + "x"} />}
        </CoreSection>
      )}

      <p className="text-xs" style={{ color: "#C0B8AE" }}>
        数据来源：资本工具自动同步
        {lastUpdated && ` · 最近更新于 ${new Date(lastUpdated).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}`}
      </p>
    </div>
  );
}

function getGrowthLevel(pat: number): number {
  if (pat >= 3_000_000) return 4;
  if (pat >= 2_000_000) return 3;
  if (pat >= 1_500_000) return 2;
  if (pat >= 1_000_000) return 1;
  return 0;
}

const GROWTH_STAGES = ["起步", "成长", "扩张", "成熟", "准上市"] as const;

const GROWTH_SUGGESTIONS: Record<number, string> = {
  0: "专注于提高收入与净利润，建立稳定的现金流与资产负债表，为进入成长阶段打好基础。",
  1: "企业已具备基本盈利能力，建议开始规范财务报表，提升记账与报税合规性，为未来融资做准备。",
  2: "企业进入快速发展阶段，建议引入专业财务管理，规划股权结构与融资路径，为战略融资奠定基础。",
  3: "企业已具备较强盈利能力，建议制定资本化战略，优化股东结构，启动战略融资规划，探索更广泛的融资选项。",
  4: "企业已接近上市门槛，建议聘请专业顾问，系统梳理公司治理与财务合规，积极推进上市或重大融资事项。",
};

function GrowthStatusBar({ label, netProfit, companyId }: { label: string; netProfit: number; companyId?: string }) {
  const [pat, setPat] = useState<number>(netProfit);

  useEffect(() => {
    setPat(netProfit);
    if (!companyId) return;
    // Step 1: Read T01 localStorage first (fast, no network)
    try {
      const raw = localStorage.getItem(`zibendao_toolData_${companyId}_T01`);
      if (raw) {
        const out = JSON.parse(raw)?.calculatedOutput;
        if (out?.pat != null) { setPat(Number(out.pat)); return; }
      }
    } catch {}
    // Step 2: Fallback to DB
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data?.annualPAT != null) {
          setPat(Number(data.data.annualPAT));
        } else if (data?.data?.netProfit != null) {
          setPat(Number(data.data.netProfit));
        }
      })
      .catch(() => {});
  }, [companyId, netProfit]);

  const level = getGrowthLevel(pat);
  const stageName = GROWTH_STAGES[level];
  const suggestion = GROWTH_SUGGESTIONS[level];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "#9A9490" }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: "#C9A84C" }}>{stageName}</span>
      </div>
      <div className="flex gap-1">
        {GROWTH_STAGES.map((s, i) => (
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
      <div className="flex justify-between">
        {GROWTH_STAGES.map((s) => (
          <span key={s} style={{ color: "#9A9490", fontSize: "9px" }}>{s}</span>
        ))}
      </div>
      <p className="text-xs leading-relaxed pt-0.5" style={{ color: "#68625C" }}>{suggestion}</p>
    </div>
  );
}

function AIAnalysisCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#FFFDF7", border: "1px solid rgba(201,168,76,0.2)" }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
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

function IndustrySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const industries = [
    "", "科技 / 软件", "金融 / 保险", "制造业", "零售 / 电商", "餐饮 / 酒店",
    "房地产 / 建筑", "教育 / 培训", "医疗 / 健康", "物流 / 运输", "农业 / 食品",
    "媒体 / 广告", "咨询 / 专业服务", "能源 / 环保", "其他",
  ];
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: value ? "#1C1814" : "#9A9490" }}
    >
      {industries.map((ind) => (
        <option key={ind} value={ind}>{ind || "请选择行业（可选）"}</option>
      ))}
    </select>
  );
}

function CompanyForm({
  form, setForm, onSave,
}: {
  form: { name: string; type: string; status: "active" | "inactive"; industry: string; notes: string; netProfit: number; country: string };
  setForm: (f: { name: string; type: string; status: "active" | "inactive"; industry: string; notes: string; netProfit: number; country: string }) => void;
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
      <FormField label="所属行业（可选）">
        <IndustrySelect value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
      </FormField>
      <FormField label="净利润（RM，可选）">
        <input
          type="number" min={0}
          value={form.netProfit || ""}
          onChange={(e) => setForm({ ...form, netProfit: Number(e.target.value) })}
          placeholder="0"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
        />
      </FormField>
      <FormField label="所在国家">
        <select
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: form.country ? "#1C1814" : "#9A9490" }}
        >
          <option value="">请选择国家</option>
          {COUNTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormField>
      <FormField label="备注（可选）">
        <input
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="简短描述公司"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "#F7F4EF", border: "1px solid #E0D9CE", color: "#1C1814" }}
        />
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
