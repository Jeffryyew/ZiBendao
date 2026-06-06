"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

interface YearPlan {
  revenueTarget: string;
  patTarget: string;
  headcount: string;
  milestone: string;
  fundingNeeded: string;
}

interface T06Form {
  year1: YearPlan;
  year2: YearPlan;
  year3: YearPlan;
  // KPI params (from T04 — stored here so roadmap is self-contained)
  asp: string;
  conversionRatePct: string;
  targetNetMarginPct: string;
  // Valuation params (from T05)
  peMultiple: string;
}

function emptyYear(): YearPlan {
  return { revenueTarget: "", patTarget: "", headcount: "", milestone: "", fundingNeeded: "0" };
}

const DEFAULT_FORM: T06Form = {
  year1: { revenueTarget: "2000000", patTarget: "300000", headcount: "15", milestone: "完成产品标准化，拓展至 2 个城市", fundingNeeded: "500000" },
  year2: { revenueTarget: "4000000", patTarget: "700000", headcount: "25", milestone: "完成 A 轮融资，扩张至 5 家门店", fundingNeeded: "2000000" },
  year3: { revenueTarget: "8000000", patTarget: "1600000", headcount: "40", milestone: "实现区域市场领导地位，启动 B 轮", fundingNeeded: "5000000" },
  asp: "5000",
  conversionRatePct: "20",
  targetNetMarginPct: "15",
  peMultiple: "12",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "财务路线图是投资人的叙事",
    body: "一张清晰的 3 年路线图，告诉投资人：你从哪里来，要去哪里，每一年的里程碑是什么，需要多少资本支撑。这是融资 Pitch 的核心材料之一。",
  },
  {
    title: "第零年：当前基准",
    body: "系统自动读入利润表和估值工具的当前数据。这是你的出发点。所有增速、估值增幅都以此为基准计算。",
  },
  {
    title: "第一步：设定 3 年目标",
    body: "逐年填入目标营收、目标 PAT、预计员工人数和关键里程碑。这些数字将驱动 KPI 和估值的自动计算。",
  },
  {
    title: "第二步：每年 KPI 自动推算",
    body: "系统根据你在 KPI 工具设定的 ASP 和转化率，自动计算每一年所需的月销售目标和月成交单数。",
  },
  {
    title: "第三步：每年估值自动推算",
    body: "系统用 PE 倍数法，基于每年的 PAT 目标自动算出对应估值。这就是你在 Pitch Deck 中对投资人展示的增值曲线。",
  },
  {
    title: "第四步：融资时机与资本需求",
    body: "每年填入预计融资需求。系统给出「建议融资窗口」——通常是估值增长最快的那一年，也是投资人最愿意进场的时机。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return sym + " " + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sym + " " + (abs / 1_000).toFixed(0) + "K";
  return sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function fmtShort(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (abs / 1_000).toFixed(0) + "K";
  return String(Math.round(abs));
}

function growthPct(current: number, prev: number): string {
  if (!prev || !current) return "—";
  return "+" + (((current - prev) / prev) * 100).toFixed(0) + "%";
}

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

function YearInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  textarea?: boolean;
}) {
  const base = {
    backgroundColor: "#0D0D0D",
    border: "1px solid #2A2A2A",
    color: "#F5F5F0",
  };
  return (
    <div className="py-1.5" style={{ borderBottom: "1px solid #1A1A1A" }}>
      <p className="text-xs mb-1" style={{ color: "#888880" }}>{label}</p>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-xs outline-none resize-none"
          style={base}
          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
        />
      ) : (
        <div className="relative">
          {prefix && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
              {prefix}
            </span>
          )}
          <input
            type={textarea ? "text" : "number"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
            style={{ ...base, paddingLeft: prefix ? "2rem" : "0.5rem", paddingRight: suffix ? "1.8rem" : "0.5rem" }}
            onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
          />
          {suffix && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
              {suffix}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function FinancialRoadmapTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T06Form>("financial-roadmap");
  const [form, setForm] = useState<T06Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore & {
    targetPAT?: number;
    targetRevenue?: number;
    currentValuation?: number;
    valuationPEMultiple?: number;
    kpiASP?: number;
    kpiConversionRate?: number;
  } | null>(null);

  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
    }
  }, [savedData, loaded]);

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
            if (snap?.data) {
              setCoreData(snap.data);
              // Pre-fill KPI params from saved T04/T05 data if available
              const d = snap.data;
              setForm((p) => ({
                ...p,
                asp: d.kpiASP ? String(d.kpiASP) : p.asp,
                conversionRatePct: d.kpiConversionRate ? String(d.kpiConversionRate) : p.conversionRatePct,
                peMultiple: d.valuationPEMultiple ? String(d.valuationPEMultiple) : p.peMultiple,
                // Pre-fill year 1 funding need from store expansion if available and not already set
                year1: d.expansionTotalCapital && !p.year1.fundingNeeded
                  ? { ...p.year1, fundingNeeded: String(Math.round(d.expansionTotalCapital)) }
                  : p.year1,
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  function setYear(year: "year1" | "year2" | "year3", field: keyof YearPlan) {
    return (v: string) =>
      setForm((p) => ({ ...p, [year]: { ...p[year], [field]: v } }));
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const currentRevenue = coreData?.annualRevenue ?? 0;
    const currentPAT = coreData?.annualPAT ?? 0;
    const currentValuation = coreData?.currentValuation ?? 0;
    const asp = pf(form.asp);
    const convPct = pf(form.conversionRatePct) / 100;
    const peMultiple = pf(form.peMultiple);
    const marginPct = pf(form.targetNetMarginPct) / 100;

    const years = [
      { key: "year0", label: "当前", revenue: currentRevenue, pat: currentPAT, valuation: currentValuation, headcount: 0, milestone: "当前基准", funding: 0 },
      ...([form.year1, form.year2, form.year3] as YearPlan[]).map((y, i) => {
        const revenue = pf(y.revenueTarget);
        const pat = pf(y.patTarget);
        const valuation = pat > 0 && peMultiple > 0 ? pat * peMultiple : 0;
        return {
          key: `year${i + 1}`,
          label: `第 ${i + 1} 年`,
          revenue,
          pat,
          valuation,
          headcount: pf(y.headcount),
          milestone: y.milestone,
          funding: pf(y.fundingNeeded),
        };
      }),
    ];

    // Per-year KPIs
    const yearKPIs = years.map((y) => {
      const monthlyRevTarget = y.revenue / 12;
      const monthlyUnits = asp > 0 ? monthlyRevTarget / asp : 0;
      return { monthlyRevTarget, monthlyUnits };
    });

    // CAGR over 3 years
    const cagr =
      currentRevenue > 0 && pf(form.year3.revenueTarget) > 0
        ? (Math.pow(pf(form.year3.revenueTarget) / currentRevenue, 1 / 3) - 1) * 100
        : null;

    const totalFunding = years.slice(1).reduce((s, y) => s + y.funding, 0);

    // Chart data
    const chartData = years.map((y, i) => ({
      label: y.label,
      revenue: y.revenue,
      pat: y.pat,
      valuation: y.valuation,
    }));

    return { years, yearKPIs, cagr, totalFunding, chartData };
  }, [form, coreData]);

  // ── Save handler ──────────────────────────────────────────────────────────

  async function handleSave() {
    await save(form);
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
      if (companyId === "no_company") return;

      const existing = await fetch(
        `/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`
      ).then((r) => r.json());
      const core = existing?.data ?? {};

      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId,
          data: {
            ...core,
            roadmapYear1PAT: pf(form.year1.patTarget),
            roadmapYear2PAT: pf(form.year2.patTarget),
            roadmapYear3PAT: pf(form.year3.patTarget),
            roadmapYear1Revenue: pf(form.year1.revenueTarget),
            roadmapYear2Revenue: pf(form.year2.revenueTarget),
            roadmapYear3Revenue: pf(form.year3.revenueTarget),
            updatedBy: { ...(core.updatedBy ?? {}), "financial-roadmap": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="financial-roadmap" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Financial Roadmap" : "财务路线图"}
      desc={locale === "en" ? "3-year financial targets with KPIs and valuations" : "3 年财务目标，含 KPI 与估值规划"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Year input grid ───────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">
          {(["year1", "year2", "year3"] as const).map((yk, i) => {
            const y = form[yk];
            const label = `第 ${i + 1} 年`;
            const kpi = calc.yearKPIs[i + 1];
            const yearCalc = calc.years[i + 1];
            const prevPAT = i === 0 ? (coreData?.annualPAT ?? 0) : pf(form[`year${i}` as "year1" | "year2" | "year3"].patTarget);

            return (
              <Card key={yk} accent={i === 0}>
                <SLabel>{label}</SLabel>
                <YearInput label="目标营收" value={y.revenueTarget} onChange={setYear(yk, "revenueTarget")} prefix={sym} />
                <YearInput label="目标 PAT" value={y.patTarget} onChange={setYear(yk, "patTarget")} prefix={sym} />
                <YearInput label="预计员工人数" value={y.headcount} onChange={setYear(yk, "headcount")} suffix="人" />
                <YearInput label="预计融资需求" value={y.fundingNeeded} onChange={setYear(yk, "fundingNeeded")} prefix={sym} />
                <YearInput label="关键里程碑" value={y.milestone} onChange={setYear(yk, "milestone")} textarea />

                {/* Auto-calculated KPI + valuation */}
                <div className="mt-3 space-y-1.5">
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
                  >
                    <span className="text-xs" style={{ color: "#888880" }}>估值（PE × {form.peMultiple}x）</span>
                    <span className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>
                      {yearCalc.valuation > 0 ? fmt(yearCalc.valuation, sym) : "—"}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#1A1A1A", border: "1px solid #252525" }}
                  >
                    <span className="text-xs" style={{ color: "#888880" }}>月销售目标</span>
                    <span className="text-sm font-mono" style={{ color: "#A0A09A" }}>
                      {kpi.monthlyRevTarget > 0 ? fmt(kpi.monthlyRevTarget, sym) : "—"}
                    </span>
                  </div>
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#1A1A1A", border: "1px solid #252525" }}
                  >
                    <span className="text-xs" style={{ color: "#888880" }}>月成交单数</span>
                    <span className="text-sm font-mono" style={{ color: "#A0A09A" }}>
                      {kpi.monthlyUnits > 0 ? Math.ceil(kpi.monthlyUnits) + " 单" : "—"}
                    </span>
                  </div>
                  {prevPAT > 0 && pf(y.patTarget) > 0 && (
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ backgroundColor: "#1A1A1A", border: "1px solid #252525" }}
                    >
                      <span className="text-xs" style={{ color: "#888880" }}>PAT 年增速</span>
                      <span className="text-sm font-mono" style={{ color: "#22C55E" }}>
                        {growthPct(pf(y.patTarget), prevPAT)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* ── T07 expansion import banner ──────────────────────────────── */}
        {coreData?.expansionTotalCapital ? (
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <span className="text-xs" style={{ color: "#888880" }}>
              门店扩张总资本需求（T07）：{sym} {coreData.expansionTotalCapital.toLocaleString("en-MY", { maximumFractionDigits: 0 })}
            </span>
            <button
              onClick={() => setForm((p) => ({
                ...p,
                year1: { ...p.year1, fundingNeeded: String(Math.round(coreData.expansionTotalCapital!)) },
              }))}
              className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
            >
              导入至第 1 年融资需求
            </button>
          </div>
        ) : null}

        {/* ── KPI shared params ─────────────────────────────────────────── */}
        <Card>
          <SLabel>KPI 计算参数（来自 KPI 工具，可调整）</SLabel>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "平均成交金额 ASP", field: "asp" as keyof T06Form, prefix: sym },
              { label: "成交转化率", field: "conversionRatePct" as keyof T06Form, suffix: "%" },
              { label: "PE 估值倍数", field: "peMultiple" as keyof T06Form, suffix: "x" },
            ].map(({ label, field, prefix, suffix }) => (
              <div key={field}>
                <p className="text-xs mb-1" style={{ color: "#888880" }}>{label}</p>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
                      {prefix}
                    </span>
                  )}
                  <input
                    type="number"
                    value={form[field] as string}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
                    style={{
                      backgroundColor: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      color: "#F5F5F0",
                      paddingLeft: prefix ? "2rem" : "0.5rem",
                      paddingRight: suffix ? "1.8rem" : "0.5rem",
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
        </Card>

        {/* ── Overview summary ──────────────────────────────────────────── */}
        <Card accent>
          <SLabel>3 年总览</SLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              {
                label: "营收 CAGR",
                value: calc.cagr !== null ? "+" + calc.cagr.toFixed(0) + "%" : "—",
                color: "#C9A84C",
              },
              {
                label: "总融资需求",
                value: calc.totalFunding > 0 ? fmt(calc.totalFunding, sym) : "—",
                color: "#F0A445",
              },
              {
                label: "第 3 年估值",
                value: calc.years[3].valuation > 0 ? fmt(calc.years[3].valuation, sym) : "—",
                color: "#22C55E",
              },
              {
                label: "第 3 年 PAT",
                value: pf(form.year3.patTarget) > 0 ? fmt(pf(form.year3.patTarget), sym) : "—",
                color: "#F5F5F0",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: "#1A1A1A", border: "1px solid #252525" }}
              >
                <p className="text-xs mb-1" style={{ color: "#555550" }}>{label}</p>
                <p className="text-lg font-bold font-mono" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={calc.chartData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#555550", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: "#555550", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#555550", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#A0A09A" }}
                  formatter={(v: number, name: string) => [fmt(v, sym), name]}
                />
                <Bar yAxisId="left" dataKey="revenue" name="目标营收" fill="#C9A84C" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="pat" name="目标 PAT" fill="#C9A84C" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="valuation" name="估值" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-5 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#C9A84C", opacity: 0.4 }} />
              <span className="text-xs" style={{ color: "#555550" }}>目标营收</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#C9A84C" }} />
              <span className="text-xs" style={{ color: "#555550" }}>目标 PAT</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#22C55E" }} />
              <span className="text-xs" style={{ color: "#555550" }}>估值</span>
            </div>
          </div>
        </Card>

        {/* ── Milestone timeline ────────────────────────────────────────── */}
        <Card>
          <SLabel>里程碑时间线</SLabel>
          <div className="relative">
            {/* Line */}
            <div
              className="absolute top-4 left-4 right-4 h-px"
              style={{ backgroundColor: "#2A2A2A" }}
            />
            <div className="relative flex justify-between">
              {calc.years.map((y, i) => (
                <div key={y.key} className="flex flex-col items-center" style={{ width: "23%" }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10"
                    style={{
                      backgroundColor: i === 0 ? "#252525" : "#C9A84C",
                      color: i === 0 ? "#888880" : "#1A1A1A",
                      border: i === 0 ? "1px solid #2A2A2A" : "none",
                    }}
                  >
                    {i === 0 ? "现" : i}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs font-semibold mb-1" style={{ color: i === 0 ? "#555550" : "#A0A09A" }}>
                      {y.label}
                    </p>
                    {y.milestone && (
                      <p className="text-xs leading-relaxed" style={{ color: "#444440" }}>
                        {y.milestone}
                      </p>
                    )}
                    {y.funding > 0 && (
                      <p className="text-xs mt-1 font-mono" style={{ color: "#F0A445" }}>
                        融资 {fmt(y.funding, sym)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Save ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#444440" }}>
            {lastSaved ? `上次保存: ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1A1A1A" }}
          >
            {saving ? "保存中..." : "保存数据"}
          </button>
        </div>

      </div>
    </ToolShell>
  );
}
