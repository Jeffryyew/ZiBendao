"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";

// ── Types ──────────────────────────────────────────────────────────────────────────

interface T05Form {
  // Editable financial inputs (import or manual)
  manualPAT: string;
  manualRevenue: string;
  manualTargetPAT: string;
  manualIpoTarget: string;
  // Multipliers (no industry defaults — user sets directly)
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
  manualPAT: "",
  manualRevenue: "",
  manualTargetPAT: "",
  manualIpoTarget: "",
  customPE: "10",
  customRevMultiple: "1",
  customEvEbitda: "8",
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

// ── Guide steps ──────────────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "估值是融资的语言",
    body: "投资人用估值决定「进多少錢、占多少股」。了解自己企业的估值区间，才能在谈判桂上有底气。这个工具用 4 种方法估算，给你一个合理的报价区间。",
  },
  {
    title: "导入财务数据",
    body: "点击「从利润表导入」可自动填入当前营收与净利润；点击「从融资路线图导入」可带入目标 PAT、PE 倍数与 IPO 目标估值。导入后仍可手动调整。",
  },
  {
    title: "4 种估值方法",
    body: "PE 法（净利润 × 倍数）最常用；营收倍数法适合早期亏损企业；EV/EBITDA 法剪除财务结构差异；DCF 法基于未来现金流折现，最精确但需要预测增长率。",
  },
  {
    title: "当前估值 vs 目标估值",
    body: "基于当前 PAT 算出当前估值；基于目标 PAT 算出目标估值。投资人通常以「未来估值打折」的方式进场，这个差距就是你的谈判空间。",
  },
  {
    title: "融资报价区间",
    body: "系统综合 4 种方法给出低、中、高三档估值。建议以中档作为谈判起点，低档作为底线，高档留作理想情景。",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────────────

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

// ── Sub-components ───────────────────────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#E8DFCF"}` }}>
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

function ValCard({ method, currentVal, targetVal, sym, note }: {
  method: string; currentVal: number; targetVal: number | null; sym: string; note: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "#9A9490" }}>{method}</p>
      <p className="text-xl font-bold font-mono mb-1" style={{ color: "#C9A84C" }}>
        {isFinite(currentVal) && currentVal > 0 ? fmt(currentVal, sym) : "—"}
      </p>
      {targetVal !== null && isFinite(targetVal) && targetVal > 0 && (
        <p className="text-xs mb-2" style={{ color: "#22C55E" }}>目标：{fmt(targetVal, sym)}</p>
      )}
      <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>{note}</p>
    </div>
  );
}

function MultiplierInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <input
        type="number" value={value} onChange={(e) => onChange(e.target.value)} step="0.5"
        className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
        onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
        onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
      />
      <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>x</span>
    </div>
  );
}

function NumField({ label, value, onChange, sym }: {
  label: string; value: string; onChange: (v: string) => void; sym?: string;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <div className="relative">
        {sym && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>
            {sym}
          </span>
        )}
        <input
          type="number" value={value} onChange={(e) => onChange(e.target.value)}
          className="py-1 rounded-lg text-xs text-right outline-none font-mono"
          style={{ width: 160, paddingLeft: sym ? 30 : 8, paddingRight: 8, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
        />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────────────────────

export default function ValuationTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, save } = useToolSnapshot<T05Form>("valuation");
  const [form, setForm] = useState<T05Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore & { targetPAT?: number; targetRevenue?: number } | null>(null);
  const [importMsg, setImportMsg] = useState<string>("");

  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Load coreData from _financial_core ───────────────────────────────────────────
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`)
      .then((r) => r.json())
      .then((snap) => { if (snap?.data) setCoreData(snap.data); })
      .catch(() => {});
  }, []);

  // ── Auto-save (1s debounce) ──────────────────────────────────────────────────────────────
  const formRef = useRef(form);
  formRef.current = form;
  const calcRef = useRef<ReturnType<typeof computeCalc> | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 1000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded]);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number | undefined) => parseFloat(String(v ?? "")) || 0;

  const peMultiple = pf(form.customPE) || 10;
  const revMultiple = pf(form.customRevMultiple) || 1;
  const evMultiple = pf(form.customEvEbitda) || 8;

  // ── Import handlers ──────────────────────────────────────────────────────────────────────────
  function showMsg(msg: string) {
    setImportMsg(msg);
    setTimeout(() => setImportMsg(""), 3000);
  }

  function importFromPnL() {
    const cid = getCompanyId();
    const t01 = loadToolData(cid, "T01")?.calculatedOutput as Record<string, number> | undefined;
    if (!t01) { showMsg("未找到利润表数据，请先完成利润表工具"); return; }
    setForm((p) => ({
      ...p,
      manualRevenue: t01.annualRevenue != null ? String(Math.round(t01.annualRevenue)) : p.manualRevenue,
      manualPAT: t01.annualPAT != null ? String(Math.round(t01.annualPAT)) : p.manualPAT,
    }));
    showMsg("✓ 已从利润表导入营收与净利润");
  }

  function importFromRoadmap() {
    const cid = getCompanyId();
    const t06 = loadToolData(cid, "T06")?.calculatedOutput as Record<string, number> | undefined;
    if (!t06) { showMsg("未找到融资路线图数据，请先完成融资路线图工具"); return; }
    setForm((p) => ({
      ...p,
      customPE: t06.latestPe != null && t06.latestPe > 0 ? String(t06.latestPe) : p.customPE,
      manualTargetPAT: t06.latestPatTarget != null && t06.latestPatTarget > 0
        ? String(Math.round(t06.latestPatTarget)) : p.manualTargetPAT,
      manualIpoTarget: t06.ipoTargetValuation != null && t06.ipoTargetValuation > 0
        ? String(Math.round(t06.ipoTargetValuation)) : p.manualIpoTarget,
    }));
    showMsg("✓ 已从融资路线图导入 PE 倍数与目标数据");
  }

  // ── Core calculation fn (also used by save ref) ───────────────────────────────────────────
  function computeCalc(f: T05Form, core: typeof coreData, peMult: number, revMult: number, evMult: number) {
    const pfn = (v: string | number | undefined) => parseFloat(String(v ?? "")) || 0;
    const currentPAT = pfn(f.manualPAT) || core?.annualPAT || 0;
    const currentRevenue = pfn(f.manualRevenue) || core?.annualRevenue || 0;
    const currentEBIT = core?.ebit || currentPAT * 1.2;
    const targetPAT = pfn(f.manualTargetPAT) || core?.targetPAT || 0;
    const targetRevenue = core?.targetRevenue || 0;
    const targetEBIT = targetPAT * 1.2;

    const vPE = currentPAT > 0 ? currentPAT * peMult : 0;
    const vRev = currentRevenue > 0 ? currentRevenue * revMult : 0;
    const vEVEBITDA = currentEBIT > 0 ? currentEBIT * evMult : 0;

    const growthRates = [
      pfn(f.growthYear1Pct) / 100,
      pfn(f.growthYear2Pct) / 100,
      pfn(f.growthYear3Pct) / 100,
      pfn(f.growthYear4Pct) / 100,
      pfn(f.growthYear5Pct) / 100,
    ];
    const discountRate = pfn(f.discountRatePct) / 100;
    const terminalMult = pfn(f.terminalMultiple);

    let dcfValue = 0;
    let cf = currentPAT > 0 ? currentPAT : 0;
    for (let i = 0; i < 5; i++) {
      cf = cf * (1 + growthRates[i]);
      dcfValue += cf / Math.pow(1 + discountRate, i + 1);
    }
    const terminalValue = (cf * terminalMult) / Math.pow(1 + discountRate, 5);
    dcfValue += terminalValue;

    const w = [pfn(f.weightPE), pfn(f.weightRevenue), pfn(f.weightEvEbitda), pfn(f.weightDCF)];
    const totalW = w.reduce((a, b) => a + b, 0) || 1;
    const vals = [vPE, vRev, vEVEBITDA, dcfValue];
    const blended = vals.reduce((acc, v, i) => acc + (v > 0 ? v * (w[i] / totalW) : 0), 0);

    const tvPE = targetPAT > 0 ? targetPAT * peMult : null;
    const tvRev = targetRevenue > 0 ? targetRevenue * revMult : null;
    const tvEVEBITDA = targetEBIT > 0 ? targetEBIT * evMult : null;
    const targetBlended = tvPE !== null
      ? (tvPE * (w[0] / totalW)) + ((tvRev ?? 0) * (w[1] / totalW)) + ((tvEVEBITDA ?? 0) * (w[2] / totalW))
      : null;

    const low = blended * 0.8;
    const high = blended * 1.25;
    const chartData = [
      { label: "PE 法", current: vPE > 0 ? vPE : null, target: tvPE },
      { label: "营收倍数", current: vRev > 0 ? vRev : null, target: tvRev },
      { label: "EV/EBITDA", current: vEVEBITDA > 0 ? vEVEBITDA : null, target: tvEVEBITDA },
      { label: "DCF", current: dcfValue > 0 ? dcfValue : null, target: null },
    ];

    return { vPE, vRev, vEVEBITDA, dcfValue, blended, low, high, tvPE, tvRev, tvEVEBITDA, targetBlended, currentPAT, currentRevenue, targetPAT, chartData };
  }

  const calc = useMemo(
    () => computeCalc(form, coreData, peMultiple, revMultiple, evMultiple),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, coreData, peMultiple, revMultiple, evMultiple]
  );
  calcRef.current = calc;

  // ── Save handler ───────────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const cid = getCompanyId();
    const f = formRef.current;
    const c = calcRef.current ?? computeCalc(f, coreData, peMultiple, revMultiple, evMultiple);
    await save(f);
    if (cid === "__default__") return;
    saveToolData({
      companyId: cid,
      toolId: "T05",
      inputData: f as unknown as Record<string, unknown>,
      calculatedOutput: {
        currentValuation: c.blended,
        currentValuationLow: c.low,
        currentValuationHigh: c.high,
        targetValuation: c.targetBlended,
      },
      currency: sym,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("toolDataUpdated", { detail: { toolId: "T05", companyId: cid } }));
    }
    try {
      const existing = await fetch(
        `/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`
      ).then((r) => r.json());
      const core = existing?.data ?? {};
      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId: cid,
          data: {
            ...core,
            currentValuation: c.blended,
            currentValuationLow: c.low,
            currentValuationHigh: c.high,
            targetValuation: c.targetBlended,
            valuationPEMultiple: peMultiple,
            updatedBy: { ...(core.updatedBy ?? {}), "valuation": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  function set(field: keyof T05Form) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  const guide = <ToolGuide toolSlug="valuation" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Enterprise Valuation" : "企业估值"}
      desc={locale === "en" ? "Multi-method valuation for fundraising readiness" : "多方法估值，建立融资谈判底气"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── 财务数据 + 导入按钮 ────────────────────────────────────────── */}
        <Card accent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono" style={{ color: "#7A7A7A" }}>财务数据</p>
            <div className="flex gap-2">
              <button
                onClick={importFromPnL}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#7A7A7A" }}
              >
                从利润表导入
              </button>
              <button
                onClick={importFromRoadmap}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#7A7A7A" }}
              >
                从融资路线图导入
              </button>
            </div>
          </div>

          {importMsg && (
            <p className="text-xs mb-3 px-3 py-2 rounded-lg"
              style={{ backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}>
              {importMsg}
            </p>
          )}

          {/* Summary pills */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "当前 PAT", value: calc.currentPAT },
              { label: "当前营收", value: calc.currentRevenue },
              { label: "目标 PAT", value: calc.targetPAT },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
                <p className="text-sm font-bold font-mono" style={{ color: value > 0 ? "#2B2B2B" : "#B0AA9A" }}>
                  {value > 0 ? fmt(value, sym) : "未设定"}
                </p>
              </div>
            ))}
          </div>

          {/* Manual input fields */}
          <NumField label="当前净利润（PAT）" value={form.manualPAT} onChange={set("manualPAT")} sym={sym} />
          <NumField label="当前年营收" value={form.manualRevenue} onChange={set("manualRevenue")} sym={sym} />
          <NumField label="目标净利润（PAT）" value={form.manualTargetPAT} onChange={set("manualTargetPAT")} sym={sym} />
          <div style={{ borderBottom: "none" }}>
            <NumField label="IPO 目标估值" value={form.manualIpoTarget} onChange={set("manualIpoTarget")} sym={sym} />
          </div>
        </Card>

        {/* ── Multiplier overrides ──────────────────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SLabel>估值倍数（可手动调整）</SLabel>
            <MultiplierInput label="PE 倍数" value={form.customPE} onChange={set("customPE")} />
            <MultiplierInput label="营收倍数" value={form.customRevMultiple} onChange={set("customRevMultiple")} />
            <MultiplierInput label="EV/EBITDA" value={form.customEvEbitda} onChange={set("customEvEbitda")} />
          </Card>

          <Card>
            <SLabel>DCF 参数（5 年现金流折现）</SLabel>
            {[1, 2, 3, 4, 5].map((y) => {
              const field = `growthYear${y}Pct` as keyof T05Form;
              return (
                <div key={y} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
                  <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>第 {y} 年增长率</span>
                  <input type="number" value={form[field]} onChange={(e) => set(field)(e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
                    style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                    onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                    onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")} />
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

        {/* ── 4 method results ────────────────────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValCard method="PE 法" currentVal={calc.vPE} targetVal={calc.tvPE} sym={sym} note={`PAT × ${peMultiple}x 倍数`} />
          <ValCard method="营收倍数法" currentVal={calc.vRev} targetVal={calc.tvRev} sym={sym} note={`营收 × ${revMultiple}x 倍数`} />
          <ValCard method="EV / EBITDA 法" currentVal={calc.vEVEBITDA} targetVal={calc.tvEVEBITDA} sym={sym} note={`EBIT × ${evMultiple}x 倍数`} />
          <ValCard method="DCF 法" currentVal={calc.dcfValue} targetVal={null} sym={sym} note={`5 年现金流折现 + 终值，折现率 ${form.discountRatePct}%`} />
        </div>

        {/* ── Blended + range ──────────────────────────────────────────────────────────────────────── */}
        <Card accent>
          <SLabel>综合估值区间</SLabel>
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "低档（保守）", value: calc.low, color: "#F0A445" },
              { label: "中档（建议报价）", value: calc.blended, color: "#C9A84C" },
              { label: "高档（理想情景）", value: calc.high, color: "#22C55E" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4 text-center" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <p className="text-xs mb-2" style={{ color: "#7A7A7A" }}>{label}</p>
                <p className="text-lg font-bold font-mono" style={{ color }}>
                  {value > 0 ? fmt(value, sym) : "—"}
                </p>
              </div>
            ))}
          </div>

          {calc.targetBlended !== null && calc.targetBlended > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl mb-3"
              style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#9A9490" }}>目标估值（达成目标 PAT 后）</p>
                <p className="text-xl font-bold font-mono mt-0.5" style={{ color: "#22C55E" }}>{fmt(calc.targetBlended, sym)}</p>
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

          {pf(form.manualIpoTarget) > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#9A9490" }}>IPO 目标估值（融资路线图）</p>
                <p className="text-xl font-bold font-mono mt-0.5" style={{ color: "#C9A84C" }}>{fmt(pf(form.manualIpoTarget), sym)}</p>
              </div>
              {calc.blended > 0 && (
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>距 IPO 目标</p>
                  <p className="text-base font-bold font-mono" style={{ color: "#C9A84C" }}>
                    +{(((pf(form.manualIpoTarget) - calc.blended) / calc.blended) * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ── Chart ────────────────────────────────────────────────────────────────────────────── */}
        <Card>
          <SLabel>各方法估值对比（当前 vs 目标）</SLabel>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calc.chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }} barCategoryGap="30%" barGap={4}>
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
              <span className="text-xs" style={{ color: "#7A7A7A" }}>目标估值</span>
            </div>
          </div>
        </Card>

      </div>
    </ToolShell>
  );
}
