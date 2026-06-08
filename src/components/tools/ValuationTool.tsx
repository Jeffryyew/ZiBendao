"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

type Industry =
  | "tech"
  | "retail"
  | "food"
  | "manufacturing"
  | "services"
  | "education"
  | "healthcare"
  | "custom";

interface IndustryProfile {
  label: string;
  peMultiple: number;
  revenueMultiple: number;
  evEbitda: number;
}

const INDUSTRY_PROFILES: Record<Industry, IndustryProfile> = {
  tech: { label: "科技 / SaaS", peMultiple: 20, revenueMultiple: 3, evEbitda: 15 },
  retail: { label: "零售", peMultiple: 12, revenueMultiple: 0.8, evEbitda: 8 },
  food: { label: "餐饮 / F&B", peMultiple: 14, revenueMultiple: 1, evEbitda: 10 },
  manufacturing: { label: "制造", peMultiple: 10, revenueMultiple: 0.6, evEbitda: 7 },
  services: { label: "专业服务", peMultiple: 12, revenueMultiple: 1.2, evEbitda: 9 },
  education: { label: "教育培训", peMultiple: 15, revenueMultiple: 2, evEbitda: 12 },
  healthcare: { label: "医疗健康", peMultiple: 18, revenueMultiple: 2.5, evEbitda: 13 },
  custom: { label: "自定义", peMultiple: 10, revenueMultiple: 1, evEbitda: 8 },
};

interface T05Form {
  industry: Industry;
  // Overrides
  customPE: string;
  customRevMultiple: string;
  customEvEbitda: string;
  // DCF inputs
  growthYear1Pct: string;
  growthYear2Pct: string;
  growthYear3Pct: string;
  growthYear4Pct: string;
  growthYear5Pct: string;
  discountRatePct: string;
  terminalMultiple: string;
  // Weights for blended valuation
  weightPE: string;
  weightRevenue: string;
  weightEvEbitda: string;
  weightDCF: string;
}

const DEFAULT_FORM: T05Form = {
  industry: "services",
  customPE: "",
  customRevMultiple: "",
  customEvEbitda: "",
  growthYear1Pct: "20",
  growthYear2Pct: "25",
  growthYear3Pct: "20",
  growthYear4Pct: "15",
  growthYear5Pct: "10",
  discountRatePct: "15",
  terminalMultiple: "8",
  weightPE: "30",
  weightRevenue: "20",
  weightEvEbitda: "25",
  weightDCF: "25",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "估值是融资的语言",
    body: "投资人用估值决定「进多少钱、占多少股」。了解自己企业的估值区间，才能在谈判桌上有底气。这个工具用 4 种方法估算，给你一个合理的报价区间。",
  },
  {
    title: "第一步：选择行业",
    body: "不同行业有不同的估值倍数。科技企业 PE 可达 20 倍，餐饮通常在 12–14 倍。选择最接近你业务的行业，系统自动填入行业默认倍数，你也可以手动调整。",
  },
  {
    title: "第二步：4 种估值方法",
    body: "PE 法（净利润 × 倍数）最常用；营收倍数法适合早期亏损企业；EV/EBITDA 法剔除财务结构差异；DCF 法基于未来现金流折现，最精确但需要预测增长率。",
  },
  {
    title: "第三步：当前估值 vs 目标估值",
    body: "基于当前 PAT 算出当前估值；基于 KPI 工具设定的目标 PAT 算出目标估值。投资人通常以「未来估值打折」的方式进场，这个差距就是你的谈判空间。",
  },
  {
    title: "第四步：融资报价区间",
    body: "系统综合 4 种方法给出低、中、高三档估值。建议以中档作为谈判起点，低档作为底线，高档留作理想情景。",
  },
  {
    title: "第五步：与路线图联动",
    body: "保存后，当前估值和目标估值会同步到财务路线图工具，显示每一年的估值进展。这是投资人最关心的增值故事。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return sign + sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function fmtShort(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n < 0 ? "-" : "") + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (n < 0 ? "-" : "") + (abs / 1_000).toFixed(0) + "K";
  return String(Math.round(n));
}

type Signal = "green" | "yellow" | "red" | "neutral";

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#E8DFCF"}` }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

function ValCard({
  method,
  currentVal,
  targetVal,
  sym,
  note,
}: {
  method: string;
  currentVal: number;
  targetVal: number | null;
  sym: string;
  note: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}
    >
      <p className="text-xs font-semibold mb-3" style={{ color: "#9A9490" }}>{method}</p>
      <p className="text-xl font-bold font-mono mb-1" style={{ color: "#C9A84C" }}>
        {isFinite(currentVal) && currentVal > 0 ? fmt(currentVal, sym) : "—"}
      </p>
      {targetVal !== null && isFinite(targetVal) && targetVal > 0 && (
        <p className="text-xs mb-2" style={{ color: "#22C55E" }}>
          目标：{fmt(targetVal, sym)}
        </p>
      )}
      <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>{note}</p>
    </div>
  );
}

function MultiplierInput({
  label,
  value,
  onChange,
  defaultVal,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  defaultVal: number;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <input
        type="number"
        value={value || defaultVal}
        onChange={(e) => onChange(e.target.value)}
        step="0.5"
        className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
        onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
        onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
      />
      <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>x</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ValuationTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T05Form>("valuation");
  const [form, setForm] = useState<T05Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore & { targetPAT?: number; targetRevenue?: number } | null>(null);

  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Auto-save (1.5s debounce) ─────────────────────────────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);


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

  const sym = coreData?.currencySymbol ?? "RM";
  const profile = INDUSTRY_PROFILES[form.industry];

  function set(field: keyof T05Form) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  const pf = (v: string) => parseFloat(v) || 0;

  // Effective multiples (override > industry default)
  const peMultiple = pf(form.customPE) || profile.peMultiple;
  const revMultiple = pf(form.customRevMultiple) || profile.revenueMultiple;
  const evMultiple = pf(form.customEvEbitda) || profile.evEbitda;

  // ── Calculations ──────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const currentPAT = coreData?.annualPAT ?? 0;
    const currentRevenue = coreData?.annualRevenue ?? 0;
    const currentEBIT = coreData?.ebit ?? currentPAT * 1.2;
    const targetPAT = coreData?.targetPAT ?? 0;
    const targetRevenue = coreData?.targetRevenue ?? 0;
    const targetEBIT = targetPAT * 1.2;

    // Current valuations
    const vPE = currentPAT > 0 ? currentPAT * peMultiple : 0;
    const vRev = currentRevenue > 0 ? currentRevenue * revMultiple : 0;
    const vEVEBITDA = currentEBIT > 0 ? currentEBIT * evMultiple : 0;

    // DCF - 5-year projection from current PAT as base CF
    const growthRates = [
      pf(form.growthYear1Pct) / 100,
      pf(form.growthYear2Pct) / 100,
      pf(form.growthYear3Pct) / 100,
      pf(form.growthYear4Pct) / 100,
      pf(form.growthYear5Pct) / 100,
    ];
    const discountRate = pf(form.discountRatePct) / 100;
    const terminalMult = pf(form.terminalMultiple);

    let dcfValue = 0;
    let cf = currentPAT > 0 ? currentPAT : 0;
    const dcfYears: { year: number; cf: number; pv: number }[] = [];
    for (let i = 0; i < 5; i++) {
      cf = cf * (1 + growthRates[i]);
      const pv = cf / Math.pow(1 + discountRate, i + 1);
      dcfYears.push({ year: i + 1, cf, pv });
      dcfValue += pv;
    }
    const terminalValue = (cf * terminalMult) / Math.pow(1 + discountRate, 5);
    dcfValue += terminalValue;

    // Weighted blended (current)
    const w = [pf(form.weightPE), pf(form.weightRevenue), pf(form.weightEvEbitda), pf(form.weightDCF)];
    const totalW = w.reduce((a, b) => a + b, 0) || 1;
    const vals = [vPE, vRev, vEVEBITDA, dcfValue];
    const activeVals = vals.filter((v, i) => v > 0 && w[i] > 0);
    const blended = activeVals.length > 0
      ? vals.reduce((acc, v, i) => acc + (v > 0 ? v * (w[i] / totalW) : 0), 0)
      : 0;

    // Target valuations (from KPI tool)
    const tvPE = targetPAT > 0 ? targetPAT * peMultiple : null;
    const tvRev = targetRevenue > 0 ? targetRevenue * revMultiple : null;
    const tvEVEBITDA = targetEBIT > 0 ? targetEBIT * evMultiple : null;

    const targetBlended = tvPE !== null
      ? (tvPE * (w[0] / totalW)) + ((tvRev ?? 0) * (w[1] / totalW)) + ((tvEVEBITDA ?? 0) * (w[2] / totalW))
      : null;

    // Range: low / mid / high (±20%)
    const low = blended * 0.8;
    const high = blended * 1.25;

    // Chart data
    const chartData = [
      { label: "PE 法", current: vPE > 0 ? vPE : null, target: tvPE },
      { label: "营收倍数", current: vRev > 0 ? vRev : null, target: tvRev },
      { label: "EV/EBITDA", current: vEVEBITDA > 0 ? vEVEBITDA : null, target: tvEVEBITDA },
      { label: "DCF", current: dcfValue > 0 ? dcfValue : null, target: null },
    ];

    return {
      vPE, vRev, vEVEBITDA, dcfValue,
      blended, low, high,
      tvPE, tvRev, tvEVEBITDA, targetBlended,
      currentPAT, currentRevenue, targetPAT, targetRevenue,
      dcfYears, terminalValue,
      chartData,
    };
  }, [form, coreData, peMultiple, revMultiple, evMultiple]);

  // ── Standalone toolData localStorage auto-save ──
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    if (!calc || calc.blended === 0) return;
    const timer = setTimeout(() => {
      console.log(`[T06] auto-save to toolData | cid=${cid}`);
      saveToolData({
        companyId: cid,
        toolId: "T06",
        calculatedOutput: {
          currentValuation: calc.blended,
          currentValuationLow: calc.low,
          currentValuationHigh: calc.high,
          targetValuation: calc.targetBlended,
          industry: form.industry,
        },
        currency: sym,
      });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc, sym]);

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
      // Save to unified toolData localStorage
      saveToolData({
        companyId,
        toolId: "T06",
        calculatedOutput: {
          currentValuation: calc.blended,
          currentValuationLow: calc.low,
          currentValuationHigh: calc.high,
          targetValuation: calc.targetBlended,
          industry: form.industry,
        },
        currency: sym,
      });

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
            currentValuation: calc.blended,
            currentValuationLow: calc.low,
            currentValuationHigh: calc.high,
            targetValuation: calc.targetBlended,
            valuationIndustry: form.industry,
            valuationPEMultiple: peMultiple,
            updatedBy: { ...(core.updatedBy ?? {}), "valuation": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="valuation" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Enterprise Valuation" : "企业估值"}
      desc={locale === "en" ? "Multi-method valuation for fundraising readiness" : "多方法估值，建立融资谈判底气"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Industry + headline ───────────────────────────────────────── */}
        <Card accent>
          <SLabel>行业选择</SLabel>
          <div className="flex flex-wrap gap-2 mb-5">
            {(Object.entries(INDUSTRY_PROFILES) as [Industry, IndustryProfile][]).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setForm((f) => ({ ...f, industry: key }))}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{
                  backgroundColor: form.industry === key ? "#C9A84C" : "#F8F6F1",
                  color: form.industry === key ? "#FFFFFF" : "#7A7A7A",
                  border: form.industry === key ? "none" : "1px solid #E8DFCF",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Current data source */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "当前 PAT", value: calc.currentPAT },
              { label: "当前营收", value: calc.currentRevenue },
              { label: "目标 PAT（KPI）", value: calc.targetPAT },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl px-3 py-2.5"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
              >
                <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
                <p className="text-sm font-bold font-mono" style={{ color: value > 0 ? "#2B2B2B" : "#EF4444" }}>
                  {value > 0 ? fmt(value, sym) : "未设定"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Multiplier overrides ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SLabel>估值倍数（行业默认，可调整）</SLabel>
            <MultiplierInput
              label={`PE 倍数（行业默认 ${profile.peMultiple}x）`}
              value={form.customPE}
              onChange={set("customPE")}
              defaultVal={profile.peMultiple}
            />
            <MultiplierInput
              label={`营收倍数（行业默认 ${profile.revenueMultiple}x）`}
              value={form.customRevMultiple}
              onChange={set("customRevMultiple")}
              defaultVal={profile.revenueMultiple}
            />
            <MultiplierInput
              label={`EV/EBITDA（行业默认 ${profile.evEbitda}x）`}
              value={form.customEvEbitda}
              onChange={set("customEvEbitda")}
              defaultVal={profile.evEbitda}
            />
          </Card>

          <Card>
            <SLabel>DCF 参数（5 年现金流折现）</SLabel>
            {[1, 2, 3, 4, 5].map((y) => {
              const field = `growthYear${y}Pct` as keyof T05Form;
              return (
                <div key={y} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
                  <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>第 {y} 年增长率</span>
                  <input
                    type="number"
                    value={form[field]}
                    onChange={(e) => set(field)(e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
                    style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                    onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                    onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                  />
                  <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>%</span>
                </div>
              );
            })}
            <div className="flex items-center gap-2 py-1.5 mt-1" style={{ borderBottom: "1px solid #E8DFCF" }}>
              <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>折现率</span>
              <input type="number" value={form.discountRatePct} onChange={(e) => set("discountRatePct")(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")} />
              <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>%</span>
            </div>
            <div className="flex items-center gap-2 py-1.5">
              <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>终值倍数</span>
              <input type="number" value={form.terminalMultiple} onChange={(e) => set("terminalMultiple")(e.target.value)}
                className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")} />
              <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>x</span>
            </div>
          </Card>
        </div>

        {/* ── 4 method results ──────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValCard
            method="PE 法"
            currentVal={calc.vPE}
            targetVal={calc.tvPE}
            sym={sym}
            note={`PAT × ${peMultiple}x 倍数`}
          />
          <ValCard
            method="营收倍数法"
            currentVal={calc.vRev}
            targetVal={calc.tvRev}
            sym={sym}
            note={`营收 × ${revMultiple}x 倍数`}
          />
          <ValCard
            method="EV / EBITDA 法"
            currentVal={calc.vEVEBITDA}
            targetVal={calc.tvEVEBITDA}
            sym={sym}
            note={`EBIT × ${evMultiple}x 倍数`}
          />
          <ValCard
            method="DCF 法"
            currentVal={calc.dcfValue}
            targetVal={null}
            sym={sym}
            note={`5 年现金流折现 + 终值，折现率 ${form.discountRatePct}%`}
          />
        </div>

        {/* ── Blended + range ───────────────────────────────────────────── */}
        <Card accent>
          <SLabel>综合估值区间</SLabel>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "低档（保守）", value: calc.low, color: "#F0A445" },
              { label: "中档（建议报价）", value: calc.blended, color: "#C9A84C" },
              { label: "高档（理想情景）", value: calc.high, color: "#22C55E" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl p-4 text-center"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
              >
                <p className="text-xs mb-2" style={{ color: "#7A7A7A" }}>{label}</p>
                <p className="text-lg font-bold font-mono" style={{ color }}>
                  {value > 0 ? fmt(value, sym) : "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Target valuation comparison */}
          {calc.targetBlended !== null && calc.targetBlended > 0 && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: "#9A9490" }}>
                  目标估值（达成 KPI PAT 后）
                </p>
                <p className="text-xl font-bold font-mono mt-0.5" style={{ color: "#22C55E" }}>
                  {fmt(calc.targetBlended, sym)}
                </p>
              </div>
              {calc.blended > 0 && (
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>估值增幅</p>
                  <p className="text-base font-bold font-mono" style={{ color: "#22C55E" }}>
                    +{(((calc.targetBlended - calc.blended) / calc.blended) * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Chart ──────────────────────────────────────────────────────── */}
        <Card>
          <SLabel>各方法估值对比（当前 vs 目标）</SLabel>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={calc.chartData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                barCategoryGap="30%"
                barGap={4}
              >
                <XAxis dataKey="label" tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7A7A7A", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "#9A9490" }}
                  formatter={(v: number) => [fmt(v, sym), ""]}
                />
                <Bar dataKey="current" name="当前估值" fill="#C9A84C" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="目标估值" fill="#22C55E" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#C9A84C" }} />
              <span className="text-xs" style={{ color: "#7A7A7A" }}>当前估值</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22C55E", opacity: 0.6 }} />
              <span className="text-xs" style={{ color: "#7A7A7A" }}>目标估值（KPI PAT）</span>
            </div>
          </div>
        </Card>

        {/* ── Save ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#2B2B2B" }}>
            {saving ? "正在保存..." : lastSaved ? `已自动保存 ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
        </div>

      </div>
    </ToolShell>
  );
}
