"use client";

import { useState, useEffect, useCallback } from "react";
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
            <GrowthStatusBar label="企业成长状态" netProfit={singleCompany.netProfit ?? 0} />
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
            <GrowthStatusBar label="集团成长状态" netProfit={(group.parent?.netProfit ?? 0) + group.subsidiaries.reduce((s, c) => s + (c.netProfit ?? 0), 0)} />
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
            我只有一家公司，统一管理所有资本工具数据与 AI 分析
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
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FBF4E4, #EEE5CB)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold" style={{ color: "#1C1814" }}>{company.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs" style={{ color: "#9A9490" }}>{company.type}</span>
              {company.industry && <span className="text-xs" style={{ color: "#9A9490" }}>· {company.industry}</span>}
              <StatusBadge status={company.status} />
            </div>
          </div>
        </div>
        <GrowthStatusBar label="企业成长状态" netProfit={company.netProfit ?? 0} />
        {company.notes && (
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "#68625C" }}>{company.notes}</p>
        )}
      </div>

      <AIAnalysisCard
        title="AI 企业分析"
        lines={[
          `${company.name} 目前处于成长阶段，建议优先完善现金流与利润结构。`,
          "资本工具使用率将影响系统 AI 分析精准度，建议持续录入数据。",
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
  });

  const [parentForm, setParentForm] = useState({
    name: group.parent?.name ?? "",
    type: group.parent?.type ?? "控股公司",
    status: (group.parent?.status ?? "active") as "active" | "inactive",
    industry: group.parent?.industry ?? "",
    netProfit: group.parent?.netProfit ?? 0,
  });

  const [editSubForm, setEditSubForm] = useState({
    name: "",
    type: "私人有限公司",
    shareholding: 100,
    industry: "",
    notes: "",
    netProfit: 0,
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
    };
    onSetGroup({ ...group, subsidiaries: [...group.subsidiaries, newSub] });
    setSubForm({ name: "", type: "私人有限公司", shareholding: 100, industry: "", notes: "", netProfit: 0 });
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#6B9BD2", color: "#FFFFFF" }}>
              {group.parent!.name.slice(0, 2).toUpperCase()}
            </div>
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
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "#FBF4E4", color: "#C9A84C" }}>
                        {sub.name.slice(0, 2).toUpperCase()}
                      </div>
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
                title="AI 子公司分析"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "集团公司", value: `${1 + group.subsidiaries.length}`, unit: "家" },
              { label: "活跃子公司", value: `${group.subsidiaries.filter(s => s.status === "active").length}`, unit: "家" },
              { label: "集团规模", value: "成长期", unit: "" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
                <div className="text-xl font-bold font-mono mb-0.5" style={{ color: "#6B9BD2" }}>
                  {s.value}
                  {s.unit && <span className="text-xs font-normal ml-0.5" style={{ color: "#9A9490" }}>{s.unit}</span>}
                </div>
                <div className="text-xs" style={{ color: "#9A9490" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <GrowthStatusBar label="集团成长状态" netProfit={(group.parent?.netProfit ?? 0) + group.subsidiaries.reduce((s, c) => s + (c.netProfit ?? 0), 0)} />

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

function getGrowthLevel(netProfit: number): number {
  if (netProfit >= 3_000_000) return 4;
  if (netProfit >= 2_000_000) return 3;
  if (netProfit >= 1_500_000) return 2;
  if (netProfit >= 1_000_000) return 1;
  return 0;
}

function GrowthStatusBar({ label, netProfit }: { label: string; netProfit: number }) {
  const stages = ["起步", "成长", "扩张", "成熟", "准上市"];
  const level = getGrowthLevel(netProfit);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs" style={{ color: "#9A9490" }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: "#C9A84C" }}>{stages[level]}</span>
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
          <span key={s} style={{ color: "#9A9490", fontSize: "9px" }}>{s}</span>
        ))}
      </div>
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
  form: { name: string; type: string; status: "active" | "inactive"; industry: string; notes: string; netProfit: number };
  setForm: (f: { name: string; type: string; status: "active" | "inactive"; industry: string; notes: string; netProfit: number }) => void;
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
