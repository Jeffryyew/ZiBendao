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
  ReferenceLine,
  Cell,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

interface YearExpansion {
  storeCount: string;  // stores opened this year
}

interface T07Form {
  planYears: "1" | "2" | "3" | "4" | "5";
  yearPlans: YearExpansion[];
  // Per-store investment (one-time)
  investRenovation: string;
  investEquipment: string;
  investDeposit: string;
  investWorkingCapital: string;
  investOther: string;
  // Per-store monthly financials
  monthlyRevenueSteady: string;
  rampMonth1to3Pct: string;    // % of steady revenue in months 1-3
  rampMonth4to6Pct: string;    // % of steady revenue in months 4-6
  monthlyFixedCosts: string;
  variableCostPct: string;
  currencySymbol: string;
}

const DEFAULT_FORM: T07Form = {
  planYears: "3",
  yearPlans: [
    { storeCount: "1" },
    { storeCount: "2" },
    { storeCount: "2" },
    { storeCount: "0" },
    { storeCount: "0" },
  ],
  investRenovation: "80000",
  investEquipment: "50000",
  investDeposit: "30000",
  investWorkingCapital: "30000",
  investOther: "10000",
  monthlyRevenueSteady: "80000",
  rampMonth1to3Pct: "40",
  rampMonth4to6Pct: "70",
  monthlyFixedCosts: "35000",
  variableCostPct: "30",
  currencySymbol: "RM",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "开店不是战略，资本回报才是",
    body: "每开一家店都是一笔资本投入。这个工具帮你算清楚每家店需要多少投资、多少个月回本、是否符合财务路线图的 PAT 目标，避免盲目扩张消耗掉企业资本。",
  },
  {
    title: "第一步：扩张计划",
    body: "设定规划年数和每年计划开几家店。系统会按时间顺序追踪每家店的资本投入和回报贡献。",
  },
  {
    title: "第二步：单店投资成本",
    body: "填入一家新店的所有一次性开业成本：装修、设备、押金、启动营运资金等。这是你每开一家店需要准备的资本。",
  },
  {
    title: "第三步：单店月度运营",
    body: "填入稳态月营收（开业后正常运营时的月收入），以及爬坡期设置（开业头几个月通常营收偏低）。变动成本按营收比例，固定成本每月固定。",
  },
  {
    title: "第四步：回本周期",
    body: "系统自动计算：月净利润、年化 ROI、以及每家店的回本月数。回本周期是投资人评估门店扩张可行性的核心指标。",
  },
  {
    title: "第五步：路线图对标",
    body: "系统把门店贡献的年 PAT 与财务路线图的 KPI 目标对比。如果低于目标，系统会提示需要调整哪里——提高定价、降低成本或重新规划开店节奏。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return sign + sym + " " + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sign + sym + " " + (abs / 1_000).toFixed(0) + "K";
  return sign + sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function fmtShort(n: number): string {
  if (!isFinite(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n < 0 ? "-" : "") + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (n < 0 ? "-" : "") + (abs / 1_000).toFixed(0) + "K";
  return String(Math.round(n));
}

type Signal = "green" | "yellow" | "red" | "neutral";

const SIG: Record<Signal, { text: string; bg: string; border: string }> = {
  green: { text: "#22C55E", bg: "rgba(34,197,94,0.05)", border: "rgba(34,197,94,0.2)" },
  yellow: { text: "#F0A445", bg: "rgba(240,164,69,0.05)", border: "rgba(240,164,69,0.2)" },
  red: { text: "#EF4444", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.2)" },
  neutral: { text: "#A0A09A", bg: "#141414", border: "#2A2A2A" },
};

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

function InputRow({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5" style={{ borderBottom: "1px solid #1A1A1A" }}>
      <div className="flex-1">
        <span className="text-xs" style={{ color: "#888880" }}>{label}</span>
        {hint && <p className="text-xs mt-0.5" style={{ color: "#444440" }}>{hint}</p>}
      </div>
      <div className="relative w-36 flex-shrink-0">
        {prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
}

function Subtotal({ label, value, sym, highlight }: { label: string; value: number; sym: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg mt-2"
      style={{
        backgroundColor: highlight ? "rgba(201,168,76,0.06)" : "#1A1A1A",
        border: `1px solid ${highlight ? "rgba(201,168,76,0.2)" : "#252525"}`,
      }}
    >
      <span className="text-xs font-semibold" style={{ color: highlight ? "#C9A84C" : "#A0A09A" }}>{label}</span>
      <span className="text-sm font-bold font-mono" style={{ color: highlight ? "#C9A84C" : "#F5F5F0" }}>
        {fmt(value, sym)}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StoreExpansionTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T07Form>("store-expansion");
  const [form, setForm] = useState<T07Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore & {
    roadmapYear1PAT?: number;
    roadmapYear2PAT?: number;
    roadmapYear3PAT?: number;
  } | null>(null);

  useEffect(() => {
    if (savedData && !loaded) {
      const merged = {
        ...DEFAULT_FORM,
        ...savedData,
        yearPlans: savedData.yearPlans?.length === 5 ? savedData.yearPlans : DEFAULT_FORM.yearPlans,
      };
      setForm(merged);
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
          .then((snap) => { if (snap?.data) setCoreData(snap.data); })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = form.currencySymbol || coreData?.currencySymbol || "RM";
  const planYears = parseInt(form.planYears) || 3;
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  function set(field: keyof T07Form) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  function setYearPlan(idx: number, v: string) {
    setForm((p) => {
      const yearPlans = [...p.yearPlans];
      yearPlans[idx] = { storeCount: v };
      return { ...p, yearPlans };
    });
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const perStoreInvest =
      pf(form.investRenovation) +
      pf(form.investEquipment) +
      pf(form.investDeposit) +
      pf(form.investWorkingCapital) +
      pf(form.investOther);

    const steadyRevenue = pf(form.monthlyRevenueSteady);
    const varCostPct = pf(form.variableCostPct) / 100;
    const fixedCosts = pf(form.monthlyFixedCosts);
    const ramp1to3 = pf(form.rampMonth1to3Pct) / 100;
    const ramp4to6 = pf(form.rampMonth4to6Pct) / 100;

    // Monthly net income at ramp stages
    function monthlyNet(revPct: number) {
      const rev = steadyRevenue * revPct;
      return rev * (1 - varCostPct) - fixedCosts;
    }

    const steadyMonthlyNet = monthlyNet(1);
    const annualPAT = steadyMonthlyNet * 12;
    const paybackMonths = perStoreInvest > 0 && steadyMonthlyNet > 0
      ? perStoreInvest / steadyMonthlyNet
      : Infinity;
    const annualROI = perStoreInvest > 0 && annualPAT > 0
      ? (annualPAT / perStoreInvest) * 100
      : 0;

    // Build year-by-year plan
    const roadmapPATs: (number | null)[] = [
      coreData?.roadmapYear1PAT ?? null,
      coreData?.roadmapYear2PAT ?? null,
      coreData?.roadmapYear3PAT ?? null,
      null,
      null,
    ];

    interface YearResult {
      year: number;
      newStores: number;
      cumulativeStores: number;
      capitalDeployed: number;
      cumulativeCapital: number;
      yearlyPAT: number;   // PAT contribution from all stores (steady state for simplicity)
      roadmapTarget: number | null;
      meetsTarget: boolean | null;
    }

    const yearResults: YearResult[] = [];
    let cumulativeStores = 0;
    let cumulativeCapital = 0;

    for (let i = 0; i < planYears; i++) {
      const newStores = pf(form.yearPlans[i]?.storeCount ?? "0");
      cumulativeStores += newStores;
      const capitalDeployed = newStores * perStoreInvest;
      cumulativeCapital += capitalDeployed;
      // Simplified: assume all cumulative stores at steady state by year end
      const yearlyPAT = cumulativeStores * annualPAT;
      const roadmapTarget = roadmapPATs[i] ?? null;
      const meetsTarget = roadmapTarget !== null ? yearlyPAT >= roadmapTarget : null;

      yearResults.push({
        year: i + 1,
        newStores,
        cumulativeStores,
        capitalDeployed,
        cumulativeCapital,
        yearlyPAT,
        roadmapTarget,
        meetsTarget,
      });
    }

    // Cumulative cashflow chart (monthly, 24 months, for one store)
    const cashflowChart: { label: string; net: number; cumulative: number }[] = [];
    let cumulative = -perStoreInvest;
    for (let m = 1; m <= 24; m++) {
      const revPct = m <= 3 ? ramp1to3 : m <= 6 ? ramp4to6 : 1;
      const net = monthlyNet(revPct);
      cumulative += net;
      cashflowChart.push({ label: `M${m}`, net, cumulative });
    }

    const breakEvenMonth = cashflowChart.findIndex((d) => d.cumulative >= 0) + 1;

    return {
      perStoreInvest,
      steadyMonthlyNet,
      annualPAT,
      paybackMonths,
      annualROI,
      yearResults,
      cashflowChart,
      breakEvenMonth: breakEvenMonth > 0 ? breakEvenMonth : null,
    };
  }, [form, coreData, planYears]);

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
            expansionTotalCapital: calc.yearResults[calc.yearResults.length - 1]?.cumulativeCapital ?? 0,
            expansionPerStoreInvest: calc.perStoreInvest,
            expansionPaybackMonths: calc.paybackMonths,
            updatedBy: { ...(core.updatedBy ?? {}), "store-expansion": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="store-expansion" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Store Expansion Capital Planning" : "门店扩张资本规划"}
      desc={
        locale === "en"
          ? "Plan store rollout, payback period and KPI alignment"
          : "规划开店节奏、回本周期与路线图 KPI 达成情况"
      }
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Plan setup ────────────────────────────────────────────────── */}
        <Card>
          <SLabel>扩张计划</SLabel>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <p className="text-xs mb-1.5" style={{ color: "#888880" }}>规划年数</p>
              <div className="flex gap-1">
                {(["1", "2", "3", "4", "5"] as const).map((y) => (
                  <button
                    key={y}
                    onClick={() => set("planYears")(y)}
                    className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor: form.planYears === y ? "#C9A84C" : "#1A1A1A",
                      color: form.planYears === y ? "#1A1A1A" : "#888880",
                      border: form.planYears === y ? "none" : "1px solid #2A2A2A",
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <select
              value={form.currencySymbol}
              onChange={(e) => set("currencySymbol")(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg outline-none"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#A0A09A" }}
            >
              {["RM", "S$", "Rp", "THB", "NT$", "JPY", "$"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Year store counts */}
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: planYears }).map((_, i) => (
              <div key={i} className="flex-1 min-w-16">
                <p className="text-xs mb-1 text-center" style={{ color: "#555550" }}>第 {i + 1} 年</p>
                <input
                  type="number"
                  min="0"
                  value={form.yearPlans[i]?.storeCount ?? "0"}
                  onChange={(e) => setYearPlan(i, e.target.value)}
                  className="w-full text-center py-2 rounded-xl text-sm font-bold font-mono outline-none"
                  style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", color: "#C9A84C" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <p className="text-xs mt-1 text-center" style={{ color: "#444440" }}>家</p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Per-store inputs ──────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SLabel>单店一次性投资成本</SLabel>
            <InputRow label="装修费" value={form.investRenovation} onChange={set("investRenovation")} prefix={sym} />
            <InputRow label="设备 / 货架" value={form.investEquipment} onChange={set("investEquipment")} prefix={sym} />
            <InputRow label="押金 / 保证金" value={form.investDeposit} onChange={set("investDeposit")} prefix={sym} />
            <InputRow label="启动营运资金" value={form.investWorkingCapital} onChange={set("investWorkingCapital")} prefix={sym} />
            <InputRow label="其他" value={form.investOther} onChange={set("investOther")} prefix={sym} />
            <Subtotal label="单店总投资" value={calc.perStoreInvest} sym={sym} highlight />
          </Card>

          <Card>
            <SLabel>单店月度运营</SLabel>
            <InputRow
              label="稳态月营收"
              value={form.monthlyRevenueSteady}
              onChange={set("monthlyRevenueSteady")}
              prefix={sym}
              hint="开业稳定后每月正常营收"
            />
            <InputRow
              label="第 1–3 个月营收爬坡"
              value={form.rampMonth1to3Pct}
              onChange={set("rampMonth1to3Pct")}
              suffix="%"
              hint="占稳态营收的 %"
            />
            <InputRow
              label="第 4–6 个月营收爬坡"
              value={form.rampMonth4to6Pct}
              onChange={set("rampMonth4to6Pct")}
              suffix="%"
              hint="占稳态营收的 %"
            />
            <InputRow
              label="月固定成本"
              value={form.monthlyFixedCosts}
              onChange={set("monthlyFixedCosts")}
              prefix={sym}
              hint="租金、工资、水电等"
            />
            <InputRow
              label="变动成本占营收"
              value={form.variableCostPct}
              onChange={set("variableCostPct")}
              suffix="%"
              hint="原料、提成等"
            />
          </Card>
        </div>

        {/* ── Per-store KPIs ────────────────────────────────────────────── */}
        <Card accent>
          <SLabel>单店资本回报指标</SLabel>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: "稳态月净利润",
                value: calc.steadyMonthlyNet > 0 ? fmt(calc.steadyMonthlyNet, sym) : "亏损",
                signal: (calc.steadyMonthlyNet > 0 ? "green" : "red") as Signal,
                note: calc.steadyMonthlyNet > 0
                  ? `每月盈利 ${fmt(calc.steadyMonthlyNet, sym)}`
                  : "固定成本过高，稳态下仍亏损",
              },
              {
                label: "回本周期",
                value: isFinite(calc.paybackMonths) && calc.paybackMonths > 0
                  ? calc.paybackMonths.toFixed(0) + " 个月"
                  : "无法回本",
                signal: (
                  !isFinite(calc.paybackMonths) ? "red"
                  : calc.paybackMonths <= 18 ? "green"
                  : calc.paybackMonths <= 36 ? "yellow"
                  : "red"
                ) as Signal,
                note: isFinite(calc.paybackMonths)
                  ? calc.paybackMonths <= 18
                    ? "回本快，适合快速复制"
                    : calc.paybackMonths <= 36
                    ? "回本周期中等，需评估资金压力"
                    : "回本周期偏长，建议优化成本结构"
                  : "无法回本，请检查成本设置",
              },
              {
                label: "年化 ROI",
                value: calc.annualROI > 0 ? calc.annualROI.toFixed(0) + "%" : "—",
                signal: (
                  calc.annualROI >= 30 ? "green"
                  : calc.annualROI >= 15 ? "yellow"
                  : "red"
                ) as Signal,
                note: calc.annualROI >= 30
                  ? "回报率优秀，资本效率高"
                  : calc.annualROI >= 15
                  ? "回报率中等，符合一般标准"
                  : "回报率偏低，建议优化",
              },
            ].map(({ label, value, signal, note }) => {
              const c = SIG[signal];
              return (
                <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: "#A0A09A" }}>{label}</p>
                  <p className="text-2xl font-bold font-mono mb-1" style={{ color: c.text }}>{value}</p>
                  <p className="text-xs" style={{ color: c.text, opacity: 0.8 }}>{note}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Single store cashflow chart ────────────────────────────────── */}
        <Card>
          <SLabel>单店 24 个月累计现金流（含爬坡期）</SLabel>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={calc.cashflowChart}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#555550", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#555550", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={fmtShort}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#A0A09A" }}
                  formatter={(v: number, name: string) => [fmt(v, sym), name]}
                />
                <ReferenceLine yAxisId="left" y={0} stroke="#2A2A2A" strokeDasharray="4 4" />
                <Bar yAxisId="left" dataKey="net" name="月净利润" radius={[3, 3, 0, 0]}>
                  {calc.cashflowChart.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? "#22C55E" : "#EF4444"} fillOpacity={0.7} />
                  ))}
                </Bar>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="cumulative"
                  name="累计现金流"
                  stroke="#C9A84C"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {calc.breakEvenMonth && (
            <p className="text-xs mt-2" style={{ color: "#C9A84C" }}>
              单店累计回本月份：第 {calc.breakEvenMonth} 个月（含爬坡期）
            </p>
          )}
        </Card>

        {/* ── Year-by-year expansion table ──────────────────────────────── */}
        <Card>
          <SLabel>逐年扩张计划 vs 路线图 KPI</SLabel>
          <div className="space-y-3">
            {calc.yearResults.map((y) => {
              const hasTarget = y.roadmapTarget !== null;
              const signal: Signal = y.meetsTarget === null ? "neutral" : y.meetsTarget ? "green" : "red";
              const c = SIG[signal];
              return (
                <div
                  key={y.year}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#A0A09A" }}>
                        第 {y.year} 年
                        {y.newStores > 0 ? `（新开 ${y.newStores} 家，累计 ${y.cumulativeStores} 家）` : "（无新店）"}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#555550" }}>
                        本年新增资本：{fmt(y.capitalDeployed, sym)}　累计投入：{fmt(y.cumulativeCapital, sym)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "#555550" }}>门店年 PAT 贡献</p>
                      <p className="text-lg font-bold font-mono" style={{ color: c.text }}>
                        {y.yearlyPAT > 0 ? fmt(y.yearlyPAT, sym) : "—"}
                      </p>
                    </div>
                  </div>
                  {hasTarget && (
                    <div
                      className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                    >
                      <span className="text-xs" style={{ color: "#888880" }}>
                        路线图 PAT 目标：{fmt(y.roadmapTarget!, sym)}
                      </span>
                      <span className="text-xs font-bold" style={{ color: c.text }}>
                        {y.meetsTarget ? "达标" : `缺口 ${fmt(y.roadmapTarget! - y.yearlyPAT, sym)}`}
                      </span>
                    </div>
                  )}
                  {!hasTarget && (
                    <p className="text-xs mt-2" style={{ color: "#444440" }}>
                      请先在财务路线图工具设定第 {y.year} 年 PAT 目标，以进行对标。
                    </p>
                  )}
                </div>
              );
            })}
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
