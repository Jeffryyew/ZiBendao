"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

type InvestorStage = "潜在" | "接触中" | "尽调" | "谈判" | "已承诺" | "已关闭";

interface Investor {
  id: string;
  name: string;
  type: "VC" | "Angel" | "PE" | "Strategic" | "Family Office" | "Other";
  targetAmount: string;
  stage: InvestorStage;
  notes: string;
  lastContact: string;
}

interface T10Form {
  investors: Investor[];
  targetTotalRaise: string;
  targetRoundLabel: string;
  targetInvestorCount: string;
}

const STAGES: InvestorStage[] = ["潜在", "接触中", "尽调", "谈判", "已承诺", "已关闭"];

const STAGE_COLORS: Record<InvestorStage, string> = {
  "潜在": "#333330",
  "接触中": "#555550",
  "尽调": "#C9A84C",
  "谈判": "#F59E0B",
  "已承诺": "#22C55E",
  "已关闭": "#555550",
};

const INVESTOR_TYPES = ["VC", "Angel", "PE", "Strategic", "Family Office", "Other"] as const;

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

const DEFAULT_FORM: T10Form = {
  investors: [
    { id: uid(), name: "投资机构 A", type: "VC", targetAmount: "1000000", stage: "接触中", notes: "", lastContact: "" },
    { id: uid(), name: "天使投资人 B", type: "Angel", targetAmount: "500000", stage: "尽调", notes: "", lastContact: "" },
  ],
  targetTotalRaise: "5000000",
  targetRoundLabel: "A 轮",
  targetInvestorCount: "3",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "投资人关系是融资的销售漏斗",
    body: "融资本质上是一个销售过程。你需要管理多个投资人，追踪他们的进展阶段，确保在关键时刻推动决策。",
  },
  {
    title: "第一步：添加目标投资人",
    body: "录入每位潜在投资人：名称、类型（VC / 天使 / PE / 战略投资人）、目标金额与当前跟进阶段。",
  },
  {
    title: "第二步：追踪进展阶段",
    body: "阶段从「潜在」→「接触中」→「尽调」→「谈判」→「已承诺」，漏斗图让你一眼看出哪里卡住了。",
  },
  {
    title: "第三步：目标对比进度",
    body: "设定本轮融资目标金额和目标投资人数。系统自动计算已承诺金额与差距，告诉你还需要多少。",
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#141414", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#1E1E1E"}` }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#555550" }}>{children}</p>;
}

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return sym + " " + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sym + " " + (abs / 1_000).toFixed(0) + "K";
  return sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

// ── Main component ─────────────────────────────────────────────────────────

export default function InvestorRelationsTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T10Form>("investor-relations");
  const [form, setForm] = useState<T10Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);

  // ── Load saved ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Load FinancialCore ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      let companyId = "no_company";
      if (mode === "single") {
        const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
        if (sc) companyId = `single_${JSON.parse(sc).id ?? "default"}`;
      } else if (mode === "group") {
        const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        if (ac) companyId = `group_${JSON.parse(ac).id ?? "default"}`;
      }
      if (companyId !== "no_company") {
        fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`)
          .then((r) => r.json())
          .then((snap) => {
            if (snap?.data) setCoreData(snap.data);
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  // ── Calculations ──────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const targetRaise = pf(form.targetTotalRaise);
    const targetCount = pf(form.targetInvestorCount);

    // Funnel counts by stage
    const stageCounts: Record<InvestorStage, number> = {
      "潜在": 0, "接触中": 0, "尽调": 0, "谈判": 0, "已承诺": 0, "已关闭": 0,
    };
    const stageAmounts: Record<InvestorStage, number> = {
      "潜在": 0, "接触中": 0, "尽调": 0, "谈判": 0, "已承诺": 0, "已关闭": 0,
    };

    for (const inv of form.investors) {
      stageCounts[inv.stage] = (stageCounts[inv.stage] ?? 0) + 1;
      stageAmounts[inv.stage] = (stageAmounts[inv.stage] ?? 0) + pf(inv.targetAmount);
    }

    const committedAmount = stageAmounts["已承诺"] ?? 0;
    const inProgressAmount = STAGES.slice(1, 4).reduce((s, st) => s + (stageAmounts[st] ?? 0), 0);
    const gap = Math.max(0, targetRaise - committedAmount);
    const commitPct = targetRaise > 0 ? (committedAmount / targetRaise) * 100 : 0;

    const committedCount = stageCounts["已承诺"] ?? 0;
    const totalActive = form.investors.filter((i) => i.stage !== "已关闭").length;

    // Amount by stage bar
    const stageBarData = STAGES.slice(0, 5).map((stage) => ({
      name: stage,
      amount: stageAmounts[stage] ?? 0,
      fill: STAGE_COLORS[stage],
    }));

    return {
      stageCounts, stageAmounts, committedAmount, inProgressAmount, gap, commitPct,
      committedCount, totalActive, targetRaise, targetCount, stageBarData,
    };
  }, [form]);

  // ── Investor CRUD ─────────────────────────────────────────────────────

  function addInvestor() {
    setForm((p) => ({
      ...p,
      investors: [
        ...p.investors,
        { id: uid(), name: "", type: "VC", targetAmount: "", stage: "潜在", notes: "", lastContact: "" },
      ],
    }));
  }

  function updateInvestor(id: string, field: keyof Investor, value: string) {
    setForm((p) => ({
      ...p,
      investors: p.investors.map((inv) => inv.id === id ? { ...inv, [field]: value } : inv),
    }));
  }

  function removeInvestor(id: string) {
    setForm((p) => ({ ...p, investors: p.investors.filter((inv) => inv.id !== id) }));
  }

  // ── Save handler ──────────────────────────────────────────────────────

  async function handleSave() {
    await save(form);
  }

  const guide = <ToolGuide toolSlug="investor-relations" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Investor Relations" : "投资人关系"}
      desc={locale === "en" ? "Investor pipeline tracker with funnel view and target progress" : "投资人跟进漏斗，目标金额进度追踪"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Round targets ────────────────────────────────────────────── */}
        <Card>
          <SLabel>本轮融资目标</SLabel>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "轮次标签", field: "targetRoundLabel" as keyof T10Form, type: "text", placeholder: "A 轮" },
              { label: "目标融资总额", field: "targetTotalRaise" as keyof T10Form, type: "number", prefix: sym },
              { label: "目标投资人数", field: "targetInvestorCount" as keyof T10Form, type: "number", suffix: "位" },
            ].map(({ label, field, type, prefix, suffix, placeholder }) => (
              <div key={field}>
                <p className="text-xs mb-1" style={{ color: "#888880" }}>{label}</p>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
                      {prefix}
                    </span>
                  )}
                  <input
                    type={type}
                    value={form[field] as string}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
                    style={{
                      backgroundColor: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      color: "#F5F5F0",
                      paddingLeft: prefix ? "2rem" : "0.5rem",
                      paddingRight: suffix ? "2rem" : "0.5rem",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                  {suffix && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
                      {suffix}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* T08 import hint */}
          {coreData?.latestRoundType && (
            <div
              className="mt-3 flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs" style={{ color: "#888880" }}>
                T08 最新规划轮次：{coreData.latestRoundType}
                {coreData.latestRoundPostMoney ? `  |  Post-money: ${fmt(coreData.latestRoundPostMoney, sym)}` : ""}
              </span>
              <button
                onClick={() => setForm((p) => ({ ...p, targetRoundLabel: coreData.latestRoundType ?? p.targetRoundLabel }))}
                className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
              >
                填入标签
              </button>
            </div>
          )}
        </Card>

        {/* ── Progress KPIs ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "已承诺金额", value: fmt(calc.committedAmount, sym), color: "#22C55E" },
            { label: "与目标差距", value: fmt(calc.gap, sym), color: calc.gap <= 0 ? "#22C55E" : "#EF4444" },
            { label: "承诺进度", value: calc.commitPct.toFixed(1) + "%", color: calc.commitPct >= 100 ? "#22C55E" : calc.commitPct >= 50 ? "#F59E0B" : "#C9A84C" },
            { label: "活跃投资人", value: calc.totalActive + " 位", color: "#C9A84C" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center px-4 py-4 rounded-2xl"
              style={{ backgroundColor: "#141414", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs mb-1.5" style={{ color: "#555550" }}>{label}</span>
              <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* ── Progress bar ──────────────────────────────────────────────── */}
        {calc.targetRaise > 0 && (
          <Card>
            <SLabel>融资进度</SLabel>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "#888880" }}>已承诺 / 目标</span>
              <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>
                {fmt(calc.committedAmount, sym)} / {fmt(calc.targetRaise, sym)}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#1A1A1A" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, calc.commitPct)}%`,
                  backgroundColor: calc.commitPct >= 100 ? "#22C55E" : "#C9A84C",
                }}
              />
            </div>
            {calc.inProgressAmount > 0 && (
              <p className="text-xs mt-2" style={{ color: "#555550" }}>
                另有 {fmt(calc.inProgressAmount, sym)} 在洽谈中（含尽调 / 谈判阶段）
              </p>
            )}
          </Card>
        )}

        {/* ── Investor table ────────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel>投资人跟进列表</SLabel>
            <button
              onClick={addInvestor}
              className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}
            >
              + 添加
            </button>
          </div>

          <div
            className="grid gap-2 mb-1 px-1"
            style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1.5fr 36px" }}
          >
            {["投资人名称", "类型", "目标金额", "进展阶段", "备注", ""].map((h, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: "#555550" }}>{h}</p>
            ))}
          </div>

          <div className="space-y-1">
            {form.investors.map((inv) => (
              <div
                key={inv.id}
                className="grid items-center gap-2 px-1 py-1.5 rounded-lg"
                style={{ gridTemplateColumns: "2fr 1fr 1.2fr 1.2fr 1.5fr 36px", backgroundColor: "#0D0D0D" }}
              >
                <input
                  type="text"
                  value={inv.name}
                  onChange={(e) => updateInvestor(inv.id, "name", e.target.value)}
                  placeholder="投资人名称"
                  className="px-2 py-1 rounded text-xs outline-none"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <select
                  value={inv.type}
                  onChange={(e) => updateInvestor(inv.id, "type", e.target.value)}
                  className="px-1 py-1 rounded text-xs outline-none cursor-pointer"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#A0A09A" }}
                >
                  {INVESTOR_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={inv.targetAmount}
                  onChange={(e) => updateInvestor(inv.id, "targetAmount", e.target.value)}
                  placeholder="0"
                  className="px-2 py-1 rounded text-xs text-right font-mono outline-none"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <select
                  value={inv.stage}
                  onChange={(e) => updateInvestor(inv.id, "stage", e.target.value)}
                  className="px-1 py-1 rounded text-xs outline-none cursor-pointer font-semibold"
                  style={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    color: STAGE_COLORS[inv.stage],
                  }}
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} style={{ color: STAGE_COLORS[s] }}>{s}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={inv.notes}
                  onChange={(e) => updateInvestor(inv.id, "notes", e.target.value)}
                  placeholder="备注"
                  className="px-2 py-1 rounded text-xs outline-none"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888880" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <button
                  onClick={() => removeInvestor(inv.id)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#EF4444", fontSize: 14 }}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Stage funnel + amount bar ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Amount by stage */}
          <Card>
            <SLabel>各阶段潜在金额</SLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calc.stageBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke=