"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";

// ── Types ───────────────────────────────────────────────────────────────────

interface T04Form {
  // Base data (from T01 import or manual)
  currentRevenue: string;
  currentPAT: string;
  taxRatePct: string;
  variableCostPct: string;   // variable cost as % of revenue
  fixedCostAmt: string;      // annual fixed cost (RM)
  unitPrice: string;         // average unit price (RM)
  unitsSoldAnnual: string;   // annual units sold

  // Target (from T06 import or manual)
  targetPAT: string;
  currentStageName: string;  // display only
  nextStageName: string;     // display only

  // Simulation inputs (adjustable by user)
  simUnitPrice: string;
  simUnitsSold: string;
  simFixedCost: string;
  simVariableCostPct: string;
}

const DEFAULT_FORM: T04Form = {
  currentRevenue: "",
  currentPAT: "",
  taxRatePct: "24",
  variableCostPct: "60",
  fixedCostAmt: "",
  unitPrice: "",
  unitsSoldAnnual: "",
  targetPAT: "",
  currentStageName: "",
  nextStageName: "",
  simUnitPrice: "",
  simUnitsSold: "",
  simFixedCost: "",
  simVariableCostPct: "60",
};

// ── Guide ───────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "T04 PAT绩效系统 — 老板经营模拟器",
    body: "这个工具帮助你知道：距离下一阶段PAT还有多远，以及怎样调整售价、销量和成本才能达标。",
  },
  {
    title: "第一步：导入数据",
    body: "点击「从利润表导入」取得当前营收和PAT。点击「从融资路线图导入」取得下一阶段目标PAT。两个都导入后系统会自动计算差距。",
  },
  {
    title: "第二步：调整经营参数",
    body: "在「经营调整」区块修改售价、销量、固定成本或变动成本率。系统即时重新计算模拟PAT和完成度。",
  },
  {
    title: "第三步：查看达标方案",
    body: "系统自动给出三种方案告诉你怎样可以达到目标PAT。你可以从中选择最适合的路径，或组合多种方式。",
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  let str: string;
  if (abs >= 1_000_000) str = (abs / 1_000_000).toFixed(2) + "M";
  else str = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + sym + " " + str;
}

function pf(v: string): number { return parseFloat(v) || 0; }

// ── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.3)" : "#E8DFCF"}` }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold mb-4" style={{ color: "#9A9490" }}>{children}</p>;
}

function InputRow({
  label, value, onChange, prefix, suffix, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; hint?: string;
}) {
  return (
    <div
      className="grid items-center py-2"
      style={{ gridTemplateColumns: "1fr 150px", borderBottom: "1px solid #F0EBE0", gap: "8px" }}
    >
      <div style={{ minWidth: 0 }}>
        <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
        {hint && <p className="text-xs mt-0.5" style={{ color: "#BFBAB4" }}>{hint}</p>}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{
            backgroundColor: "#F8F6F1",
            border: "1px solid #E8DFCF",
            color: "#2B2B2B",
            paddingLeft: prefix ? "2rem" : "0.5rem",
            paddingRight: suffix ? "1.8rem" : "0.5rem",
          }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
      <p className="text-xs" style={{ color: "#9A9490" }}>{label}</p>
      <p className="text-xl font-bold font-mono break-all leading-tight" style={{ color: color ?? "#2B2B2B" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: "#BFBAB4" }}>{sub}</p>}
    </div>
  );
}

function PathCard({ number, title, lines, feasible }: { number: number; title: string; lines: string[]; feasible: boolean }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: feasible ? "rgba(201,168,76,0.04)" : "#FAFAFA",
        border: `1px solid ${feasible ? "rgba(201,168,76,0.25)" : "#E8DFCF"}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: feasible ? "#C9A84C" : "#E8DFCF", color: feasible ? "#FFFFFF" : "#9A9490" }}
        >
          {number}
        </span>
        <p className="text-xs font-semibold" style={{ color: feasible ? "#C9A84C" : "#9A9490" }}>{title}</p>
      </div>
      <div className="space-y-1">
        {lines.map((l, i) => (
          <p key={i} className="text-xs leading-relaxed" style={{ color: "#2B2B2B" }}>{l}</p>
        ))}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PatKpiTool() {
  const { savedData, save } = useToolSnapshot<T04Form>("pat-kpi");
  const [form, setForm] = useState<T04Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sym = "RM";

  // ── Load ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const ls = loadToolData(cid, "T04") ?? loadToolData("__default__", "T04");
    if (ls?.inputData) {
      setForm({ ...DEFAULT_FORM, ...(ls.inputData as Partial<T04Form>) });
      setLoaded(true);
      return;
    }
    if (savedData) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
      return;
    }
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, [savedData, loaded]);

  // ── Auto-save 500ms ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded]);

  function set<K extends keyof T04Form>(field: K) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  // ── Import from T01 ──────────────────────────────────────────────────────
  function importFromT01() {
    const cid = getCompanyId();
    const t01 = loadToolData(cid, "T01") ?? loadToolData("__default__", "T01");
    if (!t01) { alert("请先完成利润表（T01）再导入"); return; }
    const out = t01.calculatedOutput as Record<string, number>;
    const inp = t01.inputData as Record<string, unknown> | undefined;

    const revenue = out.annualRevenue ?? 0;
    const grossProfit = out.grossProfit ?? revenue * 0.4;
    const pbt = out.pbt ?? grossProfit;
    const taxRate = out.effectiveRate ?? 24;
    const pat = out.pat ?? 0;
    const varCostAmt = revenue - grossProfit;
    const fixedCostAmt = grossProfit - pbt;
    const varPct = revenue > 0 ? (varCostAmt / revenue) * 100 : 60;

    // Try to get unit price from input data
    let unitPrice = 0;
    let unitsSold = 0;
    if (inp && Array.isArray((inp as Record<string, unknown>).products)) {
      const prods = (inp as { products: { unitPrice: string; monthlyQty: string }[] }).products;
      if (prods.length > 0) {
        unitPrice = parseFloat(prods[0].unitPrice) || 0;
        const monthlyQty = parseFloat(prods[0].monthlyQty) || 0;
        unitsSold = monthlyQty * 12;
      }
    }
    if (unitPrice <= 0 && revenue > 0) {
      // Fallback: assume 1 unit = revenue
      unitPrice = revenue;
      unitsSold = 1;
    }

    setForm((p) => ({
      ...p,
      currentRevenue: String(Math.round(revenue)),
      currentPAT: String(Math.round(pat)),
      taxRatePct: String(Math.round(taxRate)),
      variableCostPct: varPct.toFixed(1),
      fixedCostAmt: String(Math.max(0, Math.round(fixedCostAmt))),
      unitPrice: unitPrice > 0 ? String(Math.round(unitPrice)) : p.unitPrice,
      unitsSoldAnnual: unitsSold > 0 ? String(Math.round(unitsSold)) : p.unitsSoldAnnual,
      // Sync sim params if not yet customised
      simUnitPrice: p.simUnitPrice || (unitPrice > 0 ? String(Math.round(unitPrice)) : p.simUnitPrice),
      simUnitsSold: p.simUnitsSold || (unitsSold > 0 ? String(Math.round(unitsSold)) : p.simUnitsSold),
      simFixedCost: p.simFixedCost || String(Math.max(0, Math.round(fixedCostAmt))),
      simVariableCostPct: p.simVariableCostPct || varPct.toFixed(1),
    }));
  }

  // ── Import from T06 ──────────────────────────────────────────────────────
  function importFromT06() {
    const cid = getCompanyId();
    const t06 = loadToolData(cid, "T06") ?? loadToolData("__default__", "T06");
    if (!t06) { alert("请先完成融资路线图（T06）再导入"); return; }
    const out = t06.calculatedOutput as Record<string, unknown>;

    const currentStageName = String(out.currentActualStageName ?? out.currentStageName ?? "");
    const nextStageName = String(out.nextStageName ?? "");
    const nextStagePat = Number(out.nextStagePat ?? 0);

    setForm((p) => ({
      ...p,
      currentStageName,
      nextStageName,
      targetPAT: nextStagePat > 0 ? String(Math.round(nextStagePat)) : p.targetPAT,
    }));
  }

  // ── Calculations ─────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const taxPct = pf(form.taxRatePct) / 100;
    const taxFactor = 1 - taxPct;

    // Current actuals
    const currentPAT = pf(form.currentPAT);
    const targetPAT = pf(form.targetPAT);
    const gap = targetPAT - currentPAT;
    const completionPct = targetPAT > 0 ? Math.min((currentPAT / targetPAT) * 100, 100) : 0;

    // Simulation
    const simUnitPrice = pf(form.simUnitPrice);
    const simUnitsSold = pf(form.simUnitsSold);
    const simFixedCost = pf(form.simFixedCost);
    const simVarPct = pf(form.simVariableCostPct) / 100;

    const simRevenue = simUnitPrice * simUnitsSold;
    const simVariableCost = simRevenue * simVarPct;
    const simGrossProfit = simRevenue - simVariableCost;
    const simEBIT = simGrossProfit - simFixedCost;
    const simPAT = simEBIT * taxFactor;

    const simGap = targetPAT - simPAT;
    const simCompletionPct = targetPAT > 0 && simPAT > 0 ? Math.min((simPAT / targetPAT) * 100, 100) : 0;

    // ── 3 paths to hit targetPAT ─────────────────────────────────────────
    // Required: (simRevenue_new × (1-varPct) - fixedCost) × taxFactor = targetPAT
    // => simRevenue_new = (targetPAT/taxFactor + fixedCost) / (1-varPct)
    const baseRevenue = simRevenue > 0 ? simRevenue : pf(form.currentRevenue);
    const targetRevenueNeeded = taxFactor > 0 && (1 - simVarPct) > 0
      ? (targetPAT / taxFactor + simFixedCost) / (1 - simVarPct)
      : 0;

    // Path 1: Price same, increase units
    const path1Units = simUnitPrice > 0 && targetRevenueNeeded > 0 ? targetRevenueNeeded / simUnitPrice : 0;
    const path1UnitsPct = simUnitsSold > 0 ? ((path1Units - simUnitsSold) / simUnitsSold) * 100 : 0;

    // Path 2: Units same, reduce fixed cost
    const path2FixedCost = simRevenue > 0
      ? simRevenue * (1 - simVarPct) - targetPAT / taxFactor
      : 0;
    const path2FixedPct = simFixedCost > 0 ? ((path2FixedCost - simFixedCost) / simFixedCost) * 100 : 0;

    // Path 3: Price and units up equally (geometric mean)
    const revRatio = baseRevenue > 0 && targetRevenueNeeded > 0 ? targetRevenueNeeded / baseRevenue : 0;
    const path3Factor = revRatio > 0 ? Math.sqrt(revRatio) : 0;
    const path3PricePct = (path3Factor - 1) * 100;
    const path3UnitsPct = (path3Factor - 1) * 100;

    return {
      currentPAT, targetPAT, gap, completionPct,
      simRevenue, simPAT, simGap, simCompletionPct,
      targetRevenueNeeded,
      path1Units, path1UnitsPct,
      path2FixedCost, path2FixedPct,
      path3PricePct, path3UnitsPct,
    };
  }, [form]);

  // ── Save ────────────────────────────────────────────────────────────────
  async function handleSave() {
    const cid = getCompanyId();
    saveToolData({
      companyId: cid,
      toolId: "T04",
      inputData: form as unknown as Record<string, unknown>,
      calculatedOutput: {
        currentPAT: calc.currentPAT,
        targetPAT: calc.targetPAT,
        gap: calc.gap,
        completionPct: calc.completionPct,
        simPAT: calc.simPAT,
      },
    });
    await save(form);
  }

  const hasSimData = pf(form.simUnitPrice) > 0 && pf(form.simUnitsSold) > 0;
  const guide = <ToolGuide toolSlug="pat-kpi" steps={GUIDE_STEPS} />;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <ToolShell
      icon=""
      title="T04 PAT绩效系统"
      desc="老板经营模拟器 — 距离下一阶段PAT还有多远"
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Import buttons ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={importFromT01}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70 flex items-center gap-2"
            style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
          >
            <span></span> 从利润表导入
          </button>
          <button
            onClick={importFromT06}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70 flex items-center gap-2"
            style={{ backgroundColor: "rgba(61,122,65,0.06)", border: "1px solid rgba(61,122,65,0.2)", color: "#3D7A41" }}
          >
            <span></span> 从融资路线图导入
          </button>
        </div>

        {/* ── Stage banner ───────────────────────────────────────────────── */}
        {(form.currentStageName || form.nextStageName) && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(61,122,65,0.05)", border: "1px solid rgba(61,122,65,0.15)" }}
          >
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(61,122,65,0.12)", color: "#3D7A41" }}>
              {form.currentStageName || "当前阶段"}
            </span>
            <span className="text-xs" style={{ color: "#9A9490" }}>→ 目标</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
              {form.nextStageName || "下一阶段"} PAT
            </span>
          </div>
        )}

        {/* ── Section 1: 当前经营数据 ────────────────────────────────────── */}
        <Card>
          <SLabel>当前经营数据</SLabel>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <StatCard
              label="当前税后净利润（PAT）"
              value={form.currentPAT ? fmt(pf(form.currentPAT), sym) : "—"}
              color="#2B2B2B"
            />
            <StatCard
              label={`${form.nextStageName || "下一阶段"} 目标 PAT`}
              value={form.targetPAT ? fmt(pf(form.targetPAT), sym) : "—"}
              color="#C9A84C"
            />
            <StatCard
              label="差距"
              value={
                form.currentPAT && form.targetPAT
                  ? fmt(calc.gap, sym)
                  : "—"
              }
              sub={
                form.currentPAT && form.targetPAT
                  ? `完成度 ${calc.completionPct.toFixed(0)}%`
                  : undefined
              }
              color={calc.gap <= 0 ? "#3D7A41" : "#EF4444"}
            />
          </div>

          {/* Completion bar */}
          {form.currentPAT && form.targetPAT && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "#9A9490" }}>PAT完成度</span>
                <span style={{ color: "#C9A84C" }} className="font-mono font-semibold">{calc.completionPct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EBE0" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${calc.completionPct}%`, backgroundColor: calc.completionPct >= 100 ? "#3D7A41" : "#C9A84C" }}
                />
              </div>
            </div>
          )}

          {/* Manual override */}
          <div className="mt-4">
            <p className="text-xs mb-2" style={{ color: "#9A9490" }}>手动填写 / 覆盖</p>
            <div className="grid sm:grid-cols-2 gap-x-5">
              <InputRow label="当前 PAT（年）" value={form.currentPAT} onChange={set("currentPAT")} prefix={sym} />
              <InputRow label="目标 PAT（年）" value={form.targetPAT} onChange={set("targetPAT")} prefix={sym} />
              <InputRow label="税率" value={form.taxRatePct} onChange={set("taxRatePct")} suffix="%" />
              <InputRow label="变动成本率" value={form.variableCostPct} onChange={set("variableCostPct")} suffix="%" hint="占营收的百分比" />
            </div>
          </div>
        </Card>

        {/* ── Section 2: 经营调整 ─────────────────────────────────────────── */}
        <Card>
          <SLabel>经营调整模拟</SLabel>
          <p className="text-xs mb-4" style={{ color: "#9A9490" }}>
            调整以下参数，系统即时计算模拟 PAT。
          </p>
          <div className="grid sm:grid-cols-2 gap-x-5">
            <InputRow
              label="产品售价"
              value={form.simUnitPrice}
              onChange={set("simUnitPrice")}
              prefix={sym}
              hint="每件 / 每单位"
            />
            <InputRow
              label="年销量"
              value={form.simUnitsSold}
              onChange={set("simUnitsSold")}
              suffix="件/年"
            />
            <InputRow
              label="固定成本"
              value={form.simFixedCost}
              onChange={set("simFixedCost")}
              prefix={sym}
              hint="租金、薪水、固定开销"
            />
            <InputRow
              label="变动成本率"
              value={form.simVariableCostPct}
              onChange={set("simVariableCostPct")}
              suffix="%"
              hint="占营收的百分比"
            />
          </div>

          {/* Sim result strip */}
          {hasSimData && (
            <div
              className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { label: "模拟营收", value: fmt(calc.simRevenue, sym) },
                { label: "模拟 PAT", value: fmt(calc.simPAT, sym), highlight: true },
                { label: "与目标差距", value: calc.targetPAT > 0 ? fmt(calc.simGap, sym) : "—", negative: calc.simGap > 0 },
                { label: "模拟完成度", value: calc.targetPAT > 0 ? calc.simCompletionPct.toFixed(0) + "%" : "—", highlight: true },
              ].map((d, i) => (
                <div key={i} className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                  <p className="text-xs mb-1" style={{ color: "#9A9490" }}>{d.label}</p>
                  <p
                    className="text-sm font-bold font-mono break-all"
                    style={{ color: d.highlight ? "#C9A84C" : d.negative ? "#EF4444" : "#2B2B2B" }}
                  >
                    {d.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Sim completion bar */}
          {hasSimData && calc.targetPAT > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: "#9A9490" }}>模拟 PAT 完成度</span>
                <span className="font-mono font-semibold" style={{ color: "#C9A84C" }}>{calc.simCompletionPct.toFixed(0)}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EBE0" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${calc.simCompletionPct}%`,
                    backgroundColor: calc.simCompletionPct >= 100 ? "#3D7A41" : "#C9A84C",
                  }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* ── Section 3: 达标方案 ──────────────────────────────────────────── */}
        {hasSimData && calc.targetPAT > 0 && (
          <Card>
            <SLabel>系统建议 — 如何达到目标 PAT</SLabel>
            <div className="grid sm:grid-cols-3 gap-3">
              <PathCard
                number={1}
                title="方案一：增加销量"
                feasible={calc.path1UnitsPct > 0 && calc.path1UnitsPct < 200}
                lines={
                  calc.path1Units > 0
                    ? [
                        `售价维持 ${fmt(pf(form.simUnitPrice), sym)}`,
                        `销量需增加 ${calc.path1UnitsPct.toFixed(0)}%`,
                        `年销量目标：${Math.ceil(calc.path1Units).toLocaleString()} 件`,
                      ]
                    : ["请先填写产品售价以计算方案"]
                }
              />
              <PathCard
                number={2}
                title="方案二：控制固定成本"
                feasible={calc.path2FixedPct < 0 && calc.path2FixedPct > -80}
                lines={
                  calc.simRevenue > 0
                    ? [
                        `销量和售价维持不变`,
                        `固定成本需降低 ${Math.abs(calc.path2FixedPct).toFixed(0)}%`,
                        `目标固定成本：${fmt(Math.max(0, calc.path2FixedCost), sym)}`,
                      ]
                    : ["请先填写售价和销量以计算方案"]
                }
              />
              <PathCard
                number={3}
                title="方案三：双管齐下"
                feasible={calc.path3PricePct > 0 && calc.path3PricePct < 100}
                lines={
                  calc.path3PricePct > 0
                    ? [
                        `售价提升 ${calc.path3PricePct.toFixed(0)}%`,
                        `销量同步增加 ${calc.path3UnitsPct.toFixed(0)}%`,
                        `两者组合即可达标`,
                      ]
                    : ["当前参数下方案不适用"]
                }
              />
            </div>
          </Card>
        )}

        {/* Placeholder when no sim data */}
        {!hasSimData && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-10"
            style={{ border: "1px dashed #E8DFCF" }}
          >
            <p className="text-3xl mb-3 opacity-20"></p>
            <p className="text-sm" style={{ color: "#9A9490" }}>填写「经营调整」参数后自动显示达标方案</p>
          </div>
        )}

      </div>
    </ToolShell>
  );
}