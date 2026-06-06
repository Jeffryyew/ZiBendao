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
  ReferenceLine,
  Legend,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

type ViewMode = "year1_monthly" | "year2_quarterly" | "year3_quarterly";

interface GrowthAssumptions {
  year1MonthlyGrowthPct: string;     // MoM revenue growth %
  year2QuarterlyGrowthPct: string;   // QoQ revenue growth %
  year3QuarterlyGrowthPct: string;
  grossMarginPct: string;
  netMarginPct: string;
  fixedCostMonthly: string;
  variableCostPct: string;           // % of revenue
}

interface T12Form {
  assumptions: GrowthAssumptions;
  // Actuals override (map: "Y1-M1" => actual revenue, etc.)
  actuals: Record<string, number>;
  viewMode: ViewMode;
}

const DEFAULT_FORM: T12Form = {
  assumptions: {
    year1MonthlyGrowthPct: "5",
    year2QuarterlyGrowthPct: "15",
    year3QuarterlyGrowthPct: "12",
    grossMarginPct: "50",
    netMarginPct: "15",
    fixedCostMonthly: "50000",
    variableCostPct: "35",
  },
  actuals: {},
  viewMode: "year1_monthly",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "财务预测让投资人看到未来",
    body: "一份有据可查的 3 年财务预测，是融资 Pitch Deck 和 Due Diligence 的核心文件。它告诉投资人：你的增长假设是什么，你如何实现盈利。",
  },
  {
    title: "第一步：设定增长假设",
    body: "填入月环比增速（Year 1）、季度环比增速（Year 2/3）、毛利率、净利率和固定成本。系统将自动从利润表（T01）和路线图（T06）导入基准数据。",
  },
  {
    title: "第二步：Year 1 月度预测（12 个月）",
    body: "系统基于当前月收入和增长假设，生成月度收入、毛利润、净利润、固定成本预测。你可以逐月填入实际数字进行对比。",
  },
  {
    title: "第三步：Year 2 / Year 3 季度预测",
    body: "切换到 Year 2 和 Year 3 视图，查看季度维度的增长曲线。路线图（T06）的年度 PAT 目标将作为参考线显示。",
  },
  {
    title: "第四步：实际 vs 预测对比",
    body: "在任意时间段填入实际收入，系统将自动标出实际值与预测值的偏差，帮助你及时发现业务偏差。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return sym + " " + (abs / 1_000_000).toFixed(2) + "M";
  if (abs >= 1_000) return sym + " " + (abs / 1_000).toFixed(0) + "K";
  return sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function fmtShort(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(Math.round(n));
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

// ── Main component ─────────────────────────────────────────────────────────

export default function FinancialForecastTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T12Form>("financial-forecast");
  const [form, setForm] = useState<T12Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("year1_monthly");

  // ── Load saved ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      if (savedData.viewMode) setViewMode(savedData.viewMode);
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
            if (snap?.data) {
              const d: FinancialCore = snap.data;
              setCoreData(d);
              setForm((p) => ({
                ...p,
                assumptions: {
                  ...p.assumptions,
                  grossMarginPct: d.grossMargin ? String(d.grossMargin) : p.assumptions.grossMarginPct,
                  netMarginPct: d.netMargin ? String(d.netMargin) : p.assumptions.netMarginPct,
                  fixedCostMonthly: d.monthlyFixedCostsBase ? String(Math.round(d.monthlyFixedCostsBase)) : p.assumptions.fixedCostMonthly,
                },
              }));
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  function setAssumption(field: keyof GrowthAssumptions, v: string) {
    setForm((p) => ({ ...p, assumptions: { ...p.assumptions, [field]: v } }));
  }

  // ── Forecast generation ───────────────────────────────────────────────

  const forecast = useMemo(() => {
    const baseMonthlyRevenue = coreData?.monthlyRevenue || (coreData?.annualRevenue ? coreData.annualRevenue / 12 : 100000);
    const a = form.assumptions;
    const momGrowth = pf(a.year1MonthlyGrowthPct) / 100;
    const qoqGrowth2 = pf(a.year2QuarterlyGrowthPct) / 100;
    const qoqGrowth3 = pf(a.year3QuarterlyGrowthPct) / 100;
    const grossMarginPct = pf(a.grossMarginPct) / 100;
    const netMarginPct = pf(a.netMarginPct) / 100;
    const fixedCostMonthly = pf(a.fixedCostMonthly);
    const variableCostPct = pf(a.variableCostPct) / 100;

    // Year 1: 12 months
    const year1Months: Array<{
      label: string; key: string;
      revenue: number; forecastRevenue: number; actualRevenue?: number;
      grossProfit: number; netProfit: number; fixedCost: number;
    }> = [];

    let monthRevenue = baseMonthlyRevenue;
    for (let m = 1; m <= 12; m++) {
      const forecastRevenue = monthRevenue;
      const key = `Y1-M${m}`;
      const actualRevenue = form.actuals[key];
      const useRevenue = actualRevenue ?? forecastRevenue;
      const grossProfit = useRevenue * grossMarginPct;
      const netProfit = useRevenue * netMarginPct;
      const fixedCost = fixedCostMonthly;

      year1Months.push({
        label: `M${m}`,
        key,
        revenue: useRevenue,
        forecastRevenue,
        actualRevenue,
        grossProfit,
        netProfit,
        fixedCost,
      });
      monthRevenue = monthRevenue * (1 + momGrowth);
    }

    // Year 1 end revenue (annual)
    const year1AnnualRevenue = year1Months.reduce((s, m) => s + m.forecastRevenue, 0);
    const year1QuarterlyRevenue = year1AnnualRevenue / 4;

    // Year 2: 4 quarters
    const year2Quarters: Array<{ label: string; key: string; revenue: number; grossProfit: number; netProfit: number }> = [];
    let qRevenue = year1QuarterlyRevenue;
    for (let q = 1; q <= 4; q++) {
      qRevenue = qRevenue * (1 + qoqGrowth2);
      const key = `Y2-Q${q}`;
      year2Quarters.push({
        label: `Y2 Q${q}`,
        key,
        revenue: qRevenue,
        grossProfit: qRevenue * grossMarginPct,
        netProfit: qRevenue * netMarginPct,
      });
    }

    // Year 3: 4 quarters
    const year3Quarters: Array<{ label: string; key: string; revenue: number; grossProfit: number; netProfit: number }> = [];
    let q3Revenue = year2Quarters[3].revenue;
    for (let q = 1; q <= 4; q++) {
      q3Revenue = q3Revenue * (1 + qoqGrowth3);
      const key = `Y3-Q${q}`;
      year3Quarters.push({
        label: `Y3 Q${q}`,
        key,
        revenue: q3Revenue,
        grossProfit: q3Revenue * grossMarginPct,
        netProfit: q3Revenue * netMarginPct,
      });
    }

    // Totals
    const year1Total = { revenue: year1AnnualRevenue, netProfit: year1AnnualRevenue * netMarginPct };
    const year2Total = { revenue: year2Quarters.reduce((s, q) => s + q.revenue, 0), netProfit: 0 };
    year2Total.netProfit = year2Total.revenue * netMarginPct;
    const year3Total = { revenue: year3Quarters.reduce((s, q) => s + q.revenue, 0), netProfit: 0 };
    year3Total.netProfit = year3Total.revenue * netMarginPct;

    // Roadmap targets for reference lines
    const roadmapY1PAT = coreData?.roadmapYear1PAT ?? null;
    const roadmapY2PAT = coreData?.roadmapYear2PAT ?? null;
    const roadmapY3PAT = coreData?.roadmapYear3PAT ?? null;

    return { year1Months, year2Quarters, year3Quarters, year1Total, year2Total, year3Total, roadmapY1PAT, roadmapY2PAT, roadmapY3PAT };
  }, [form, coreData]);

  // ── Active dataset for chart ──────────────────────────────────────────

  const activeData = useMemo(() => {
    if (viewMode === "year1_monthly") {
      return forecast.year1Months.map((m) => ({
        label: m.label,
        revenue: Math.round(m.forecastRevenue),
        actual: m.actualRevenue != null ? Math.round(m.actualRevenue) : undefined,
        grossProfit: Math.round(m.grossProfit),
        netProfit: Math.round(m.netProfit),
        fixedCost: Math.round(m.fixedCost),
      }));
    }
    if (viewMode === "year2_quarterly") {
      return forecast.year2Quarters.map((q) => ({
        label: q.label,
        revenue: Math.round(q.revenue),
        grossProfit: Math.round(q.grossProfit),
        netProfit: Math.round(q.netProfit),
      }));
    }
    return forecast.year3Quarters.map((q) => ({
      label: q.label,
      revenue: Math.round(q.revenue),
      grossProfit: Math.round(q.grossProfit),
      netProfit: Math.round(q.netProfit),
    }));
  }, [viewMode, forecast]);

  const activeRoadmapPAT =
    viewMode === "year1_monthly" ? forecast.roadmapY1PAT :
    viewMode === "year2_quarterly" ? forecast.roadmapY2PAT :
    forecast.roadmapY3PAT;

  // ── Save handler ──────────────────────────────────────────────────────

  async function handleSave() {
    await save({ ...form, viewMode });
  }

  const guide = <ToolGuide toolSlug="financial-forecast" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Financial Forecast" : "财务预测"}
      desc={locale === "en" ? "3-year forecast: Year 1 monthly, Year 2–3 quarterly, with actual vs forecast comparison" : "3 年财务预测：第 1 年月度 / 第 2–3 年季度，含实际 vs 预测对比"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Assumptions ──────────────────────────────────────────────── */}
        <Card>
          <SLabel>增长假设参数</SLabel>

          {/* Import hints */}
          {(coreData?.monthlyRevenue || coreData?.grossMargin || coreData?.monthlyFixedCostsBase) && (
            <div
              className="mb-3 flex flex-wrap gap-2 items-center px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs flex-1" style={{ color: "#888880" }}>
                已从 T01/T03 读取基准：
                {coreData.monthlyRevenue ? ` 月收入 ${fmt(coreData.monthlyRevenue, sym)}` : ""}
                {coreData.grossMargin ? ` · 毛利率 ${coreData.grossMargin}%` : ""}
                {coreData.monthlyFixedCostsBase ? ` · 月固定成本 ${fmt(coreData.monthlyFixedCostsBase, sym)}` : ""}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Year 1 月环比增速", field: "year1MonthlyGrowthPct" as keyof GrowthAssumptions, suffix: "%" },
              { label: "Year 2 季环比增速", field: "year2QuarterlyGrowthPct" as keyof GrowthAssumptions, suffix: "%" },
              { label: "Year 3 季环比增速", field: "year3QuarterlyGrowthPct" as keyof GrowthAssumptions, suffix: "%" },
              { label: "毛利率", field: "grossMarginPct" as keyof GrowthAssumptions, suffix: "%" },
              { label: "净利率", field: "netMarginPct" as keyof GrowthAssumptions, suffix: "%" },
              { label: "月固定成本", field: "fixedCostMonthly" as keyof GrowthAssumptions, prefix: sym },
              { label: "可变成本率", field: "variableCostPct" as keyof GrowthAssumptions, suffix: "%" },
            ].map(({ label, field, prefix, suffix }) => (
              <div key={field}>
                <p className="text-xs mb-1" style={{ color: "#888880" }}>{label}</p>
                <div className="relative">
                  {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>{prefix}</span>}
                  <input
                    type="number"
                    value={form.assumptions[field]}
                    onChange={(e) => setAssumption(field, e.target.value)}
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
                  {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>{suffix}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 3-year summary ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Year 1 预测营收", value: fmt(forecast.year1Total.revenue, sym), sub: `净利 ${fmt(forecast.year1Total.netProfit, sym)}`, roadmap: forecast.roadmapY1PAT, color: "#C9A84C" },
            { label: "Year 2 预测营收", value: fmt(forecast.year2Total.revenue, sym), sub: `净利 ${fmt(forecast.year2Total.netProfit, sym)}`, roadmap: forecast.roadmapY2PAT, color: "#4CAF50" },
            { label: "Year 3 预测营收", value: fmt(forecast.year3Total.revenue, sym), sub: `净利 ${fmt(forecast.year3Total.netProfit, sym)}`, roadmap: forecast.roadmapY3PAT, color: "#22C55E" },
          ].map(({ label, value, sub, roadmap, color }) => {
            const netProfit = label.includes("1") ? forecast.year1Total.netProfit : label.includes("2") ? forecast.year2Total.netProfit : forecast.year3Total.netProfit;
            const onTrack = roadmap ? netProfit >= roadmap : null;
            return (
              <div
                key={label}
                className="flex flex-col px-4 py-4 rounded-2xl"
                style={{ backgroundColor: "#141414", border: `1px solid ${onTrack === null ? "rgba(201,168,76,0.15)" : onTrack ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}` }}
              >
                <span className="text-xs mb-1.5" style={{ color: "#555550" }}>{label}</span>
                <span className="text-lg font-bold font-mono" style={{ color }}>{value}</span>
                <span className="text-xs mt-1 font-mono" style={{ color: "#888880" }}>{sub}</span>
                {roadmap && (
                  <span className="text-xs mt-1" style={{ color: onTrack ? "#22C55E" : "#EF4444" }}>
                    路线图 PAT: {fmt(roadmap, sym)} {onTrack ? "达标" : "未达标"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── View mode selector ───────────────────────────────────────── */}
        <div className="flex gap-2">
          {([
            { key: "year1_monthly", label: "Year 1（月度）" },
            { key: "year2_quarterly", label: "Year 2（季度）" },
            { key: "year3_quarterly", label: "Year 3（季度）" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: viewMode === key ? "rgba(201,168,76,0.15)" : "#141414",
                border: `1px solid ${viewMode === key ? "rgba(201,168,76,0.4)" : "#2A2A2A"}`,
                color: viewMode === key ? "#C9A84C" : "#555550",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Main chart ───────────────────────────────────────────────── */}
        <Card>
          <SLabel>
            {viewMode === "year1_monthly" ? "Year 1 月度预测（金色=预测，白色=实际）" :
             viewMode === "year2_quarterly" ? "Year 2 季度预测" : "Year 3 季度预测"}
          </SLabel>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={activeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#555550", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={fmtShort}
                tick={{ fill: "#555550", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 8 }}
                labelStyle={{ color: "#F5F5F0", fontSize: 12 }}
                formatter={(v: number, name: string) => [fmt(v, sym), name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#555550" }} />
              <Bar dataKey="revenue" name="预测营收" fill="#C9A84C" fillOpacity={0.5} radius={[3, 3, 0, 0]} maxBarSize={32} />
              {viewMode === "year1_monthly" && (
                <Bar dataKey="actual" name="实际营收" fill="#F5F5F0" fillOpacity={0.8} radius={[3, 3, 0, 0]} maxBarSize={32} />
              )}
              <Line type="monotone" dataKey="grossProfit" name="毛利润" stroke="#4CAF50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="netProfit" name="净利润" stroke="#6B9FD4" strokeWidth={2} dot={false} />
              {activeRoadmapPAT !== null && activeRoadmapPAT !== undefined && (
                <ReferenceLine
                  y={activeRoadmapPAT / (viewMode === "year1_monthly" ? 12 : 4)}
                  stroke="#EF4444"
                  strokeDasharray="4 3"
                  label={{ value: "路线图 PAT 目标", position: "right", fill: "#EF4444", fontSize: 10 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Year 1 actuals input table ────────────────────────────────── */}
        {viewMode === "year1_monthly" && (
          <Card>
            <SLabel>Year 1 实际营收录入（可选，用于实际 vs 预测对比）</SLabel>
            <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
              {forecast.year1Months.map((m) => (
                <div key={m.key}>
                  <p className="text-xs mb-1" style={{ color: "#888880" }}>{m.label}</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.actuals[m.key] !== undefined ? String(form.actuals[m.key]) : ""}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : undefined;
                        setForm((p) => {
                          const actuals = { ...p.actuals };
                          if (val !== undefined) actuals[m.key] = val;
                          else delete actuals[m.key];
                          return { ...p, actuals };
                        });
                      }}
                      placeholder={String(Math.round(m.forecastRevenue))}
                      className="w-full py-1.5 px-2 rounded-lg text-xs text-right outline-none font-mono"
                      style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                  <p className="text-xs mt-0.5 text-right font-mono" style={{ color: "#333330" }}>
                    {fmtShort(m.forecastRevenue)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Save button ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          {lastSaved && (
            <p className="text-xs" style={{ color: "#555550" }}>
              上次保存：{new Date(lastSaved).toLocaleString("zh-CN")}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: "#C9A84C", color: "#0A0A0A" }}
          >
            {saving ? "保存中..." : "保存财务预测"}
          </button>
        </div>

      </div>
    </ToolShell>
  );
}
