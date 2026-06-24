"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";

// ── Types ────────────────────────────────────────────────────────────────────────────────────

interface T05Form {
  // 财务输入（导入或手动输入）
  manualPAT: string;
  manualRevenue: string;
  manualTargetPAT: string;
  manualIpoTarget: string;
  // 从融资路线图导入的段落数据
  importedCurrentStage: string;
  importedCurrentValuation: string;
  importedNextStage: string;
  importedNextValuation: string;
  importedNextPat: string;
  importedIpoPat: string;
  // 估值倍数
  customPE: string;
  customRevMultiple: string;
  customEvEbitda: string;
  // DCF 参数
  growthYear1Pct: string;
  growthYear2Pct: string;
  growthYear3Pct: string;
  growthYear4Pct: string;
  growthYear5Pct: string;
  discountRatePct: string;
  terminalMultiple: string;
  // 加权
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
  importedCurrentStage: "",
  importedCurrentValuation: "",
  importedNextStage: "",
  importedNextValuation: "",
  importedNextPat: "",
  importedIpoPat: "",
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

// ── Guide ────────────────────────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  { title: "估值是融资的语言", body: "投资人用估值决定「进多少錢、占多少股」。了解自己企业的估值区间，才能在谈判桂上有底气。这个工具用 4 种方法估算，给你一个合理的报价区间。" },
  { title: "导入财务数据", body: "点击「从利润表导入」可自动填入当前营收与税后净利润（PAT）；点击「从融资路线图导入」可带入当前阶段 PE、目标 PAT 与 IPO 目标估值。导入后仍可手动调整。" },
  { title: "4 种估值方法", body: "市盈率法（PAT × 倍数）最常用；营收倍数法适合早期亏损企业；企业价值倍数（EV/EBITDA）剪除财务结构差异；现金流折现法（DCF）基于未来现金流折现。" },
  { title: "当前估值 vs 目标估值", body: "基于当前 PAT 算出当前估值；基于目标 PAT 算出目标估值。投资人通常以「未来估值打折」的方式进场，这个差距就是你的谈判空间。" },
  { title: "融资报价区间", body: "系统综合 4 种方法给出保守估值、建议融资估值、理想估值三档。建议以建议融资估值作为谈判起点，保守估值作为底线。" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  return (n < 0 ? "-" : "") + sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function fmtShort(n: number): string {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n < 0 ? "-" : "") + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return (n < 0 ? "-" : "") + (abs / 1_000).toFixed(0) + "K";
  return String(Math.round(n));
}

function pf(v: string | number | undefined): number {
  return parseFloat(String(v ?? "")) || 0;
}

// ── Sub-components ────────────────────────────────────────────────────────────────────────────

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

function MultiplierInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} step="0.5"
        className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
        onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
        onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")} />
      <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>x</span>
    </div>
  );
}

function NumField({ label, value, onChange, sym }: { label: string; value: string; onChange: (v: string) => void; sym?: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <div className="relative">
        {sym && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{sym}</span>}
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
          className="py-1 rounded-lg text-xs text-right outline-none font-mono"
          style={{ width: 160, paddingLeft: sym ? 30 : 8, paddingRight: 8, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")} />
      </div>
    </div>
  );
}

function GapRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid #F0EBE0" }}>
      <span className="text-xs" style={{ color: "#9A9490" }}>{label}</span>
      <span className="text-xs font-bold font-mono" style={{ color: highlight ? "#C9A84C" : "#2B2B2B" }}>{value}</span>
    </div>
  );
}

function ProgressBar({ pct, color = "#C9A84C" }: { pct: number; color?: string }) {
  const capped = Math.min(100, Math.max(0, pct));
  return (
    <div className="w-full rounded-full mt-1" style={{ height: 6, backgroundColor: "#F0EBE0" }}>
      <div className="rounded-full" style={{ width: `${capped}%`, height: 6, backgroundColor: color }} />
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────────────────────

export default function ValuationTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, save } = useToolSnapshot<T05Form>("valuation");
  const [form, setForm] = useState<T05Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore & { targetPAT?: number; targetRevenue?: number } | null>(null);
  const [importMsg, setImportMsg] = useState<string>("");

  // ── Load: localStorage first, then DB ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const ls = loadToolData(cid, "T05") ?? loadToolData("__default__", "T05");
    if (ls?.inputData) {
      setForm({ ...DEFAULT_FORM, ...ls.inputData as Partial<T05Form> });
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

  // ── Load coreData ──────────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`)
      .then((r) => r.json())
      .then((snap) => { if (snap?.data) setCoreData(snap.data); })
      .catch(() => {});
  }, []);

  // ── Auto-save 1s debounce ─────────────────────────────────────────────────────────────────────────
  const formRef = useRef(form);
  formRef.current = form;
  const calcRef = useRef<{ blended: number; low: number; high: number; targetBlended: number | null } | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(handleSave, 1000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded]);

  const sym = coreData?.currencySymbol ?? "RM";
  const peMultiple = pf(form.customPE) || 10;
  const revMultiple = pf(form.customRevMultiple) || 1;
  const evMultiple = pf(form.customEvEbitda) || 8;

  // ── Import from 利润表 (T01) ───────────────────────────────────────────────────────────────────
  function showMsg(msg: string) { setImportMsg(msg); setTimeout(() => setImportMsg(""), 3500); }

  function importFromPnL() {
    const cid = getCompanyId();
    const t01 = loadToolData(cid, "T01")?.calculatedOutput as Record<string, number> | undefined;
    if (!t01) { showMsg("未找到利润表数据，请先完成利润表工具"); return; }
    setForm((p) => ({
      ...p,
      manualRevenue: t01.annualRevenue != null ? String(Math.round(t01.annualRevenue)) : p.manualRevenue,
      manualPAT: t01.annualPAT != null ? String(Math.round(t01.annualPAT)) : p.manualPAT,
    }));
    showMsg("✓ 已从利润表导入年营收与税后净利润（PAT）");
  }

  // ── Import from 融资路线图 (T06) ──────────────────────────────────────────────────────────────────
  function importFromRoadmap() {
    const cid = getCompanyId();
    const t06 = loadToolData(cid, "T06")?.calculatedOutput as Record<string, number & string> | undefined;
    if (!t06) { showMsg("未找到融资路线图数据，请先完成融资路线图工具"); return; }
    const currentStage = String(t06.currentActualStageName ?? "");
    if (!currentStage) { showMsg("融资路线图尚未设定「当前实际融资阶段」，请先在融资路线图选择"); return; }
    const currentPE = Number(t06.currentStagePe ?? 0);
    const currentVal = Number(t06.currentActualPostMoney ?? 0);
    // 当前阶段PAT目标：直接字段 > 计算 (postMoney/PE) > fallback 0
    const currentPatRaw = Number(t06.currentStagePat ?? 0);
    const currentPat = currentPatRaw > 0 ? currentPatRaw
      : (currentVal > 0 && currentPE > 0 ? currentVal / currentPE : 0);
    const nextStage = String(t06.nextStageName ?? "");
    const nextVal = Number(t06.nextStagePostMoney ?? 0);
    const nextPat = Number(t06.nextStagePat ?? 0);
    const ipoVal = Number(t06.ipoTargetValuation ?? 0);
    // IPO PAT：直接字段 > 计算 (ipoVal / latestPe)
    const ipoPatRaw = Number(t06.ipoPatTarget ?? 0);
    const ipoLatestPe = Number(t06.latestPe ?? 0);
    const ipoPat = ipoPatRaw > 0 ? ipoPatRaw
      : (ipoVal > 0 && ipoLatestPe > 0 ? ipoVal / ipoLatestPe : 0);
    setForm((p) => ({
      ...p,
      customPE: currentPE > 0 ? String(currentPE) : p.customPE,
      manualTargetPAT: currentPat > 0 ? String(Math.round(currentPat)) : p.manualTargetPAT,
      manualIpoTarget: ipoVal > 0 ? String(Math.round(ipoVal)) : p.manualIpoTarget,
      importedCurrentStage: currentStage,
      importedCurrentValuation: currentVal > 0 ? String(Math.round(currentVal)) : "",
      importedNextStage: nextStage,
      importedNextValuation: nextVal > 0 ? String(Math.round(nextVal)) : "",
      importedNextPat: nextPat > 0 ? String(Math.round(nextPat)) : "",
      importedIpoPat: ipoPat > 0 ? String(Math.round(ipoPat)) : "",
    }));
    showMsg(`✓ 已从融资路线图导入（当前阶段：${currentStage}）`);
  }

  // ── Calculation ───────────────────────────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const currentPAT = pf(form.manualPAT) || coreData?.annualPAT || 0;
    const currentRevenue = pf(form.manualRevenue) || coreData?.annualRevenue || 0;
    const currentEBIT = coreData?.ebit || currentPAT * 1.2;
    const targetPAT = pf(form.manualTargetPAT) || coreData?.targetPAT || 0;
    const targetRevenue = coreData?.targetRevenue || 0;
    const targetEBIT = targetPAT * 1.2;

    const vPE = currentPAT > 0 ? currentPAT * peMultiple : 0;
    const vRev = currentRevenue > 0 ? currentRevenue * revMultiple : 0;
    const vEVEBITDA = currentEBIT > 0 ? currentEBIT * evMultiple : 0;

    const growthRates = [
      pf(form.growthYear1Pct) / 100, pf(form.growthYear2Pct) / 100, pf(form.growthYear3Pct) / 100,
      pf(form.growthYear4Pct) / 100, pf(form.growthYear5Pct) / 100,
    ];
    const discountRate = pf(form.discountRatePct) / 100;
    const terminalMult = pf(form.terminalMultiple);
    let dcfValue = 0, cf = currentPAT > 0 ? currentPAT : 0;
    for (let i = 0; i < 5; i++) {
      cf = cf * (1 + growthRates[i]);
      dcfValue += cf / Math.pow(1 + discountRate, i + 1);
    }
    dcfValue += (cf * terminalMult) / Math.pow(1 + discountRate, 5);

    const w = [pf(form.weightPE), pf(form.weightRevenue), pf(form.weightEvEbitda), pf(form.weightDCF)];
    const totalW = w.reduce((a, b) => a + b, 0) || 1;
    const vals = [vPE, vRev, vEVEBITDA, dcfValue];
    const methodLabels = ["市盈率（PE）", "营收倍数", "EV/EBITDA", "现金流折现（DCF）"];
    // Outlier detection: exclude if > 200% or < 50% of the average of valid values
    const validVals = vals.filter(x => x > 0);
    const avg = validVals.length > 0 ? validVals.reduce((a, b) => a + b, 0) / validVals.length : 0;
    const outlierMethods: string[] = [];
    const activeVals = vals.map((v, i) => {
      if (v <= 0) return 0;
      if (avg > 0 && (v > avg * 2.0 || v < avg * 0.5)) {
        outlierMethods.push(methodLabels[i]);
        return 0; // excluded from blended
      }
      return v;
    });
    const activeW = w.map((wi, i) => activeVals[i] > 0 ? wi : 0);
    const activeTotalW = activeW.reduce((a, b) => a + b, 0) || 1;
    const blended = activeVals.reduce((acc, v, i) => acc + (v > 0 ? v * (activeW[i] / activeTotalW) : 0), 0);

    const tvPE = targetPAT > 0 ? targetPAT * peMultiple : null;
    const tvRev = targetRevenue > 0 ? targetRevenue * revMultiple : null;
    const tvEVEBITDA = targetEBIT > 0 ? targetEBIT * evMultiple : null;
    const targetBlended = tvPE !== null
      ? (tvPE * (w[0] / totalW)) + ((tvRev ?? 0) * (w[1] / totalW)) + ((tvEVEBITDA ?? 0) * (w[2] / totalW))
      : null;

    const low = blended * 0.8;
    const high = blended * 1.25;
    const chartData = [
      { label: "市盈率（PE）", current: vPE > 0 ? vPE : null, target: tvPE },
      { label: "营收倍数", current: vRev > 0 ? vRev : null, target: tvRev },
      { label: "EV/EBITDA", current: vEVEBITDA > 0 ? vEVEBITDA : null, target: tvEVEBITDA },
      { label: "DCF", current: dcfValue > 0 ? dcfValue : null, target: null },
    ];
    return { vPE, vRev, vEVEBITDA, dcfValue, blended, low, high, tvPE, tvRev, tvEVEBITDA, targetBlended, currentPAT, currentRevenue, targetPAT, chartData, outlierMethods };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, coreData, peMultiple, revMultiple, evMultiple]);

  calcRef.current = { blended: calc.blended, low: calc.low, high: calc.high, targetBlended: calc.targetBlended };

  // ── Save ─────────────────────────────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const cid = getCompanyId();
    const f = formRef.current;
    const c = calcRef.current;
    await save(f);
    if (cid === "__default__") return;
    saveToolData({
      companyId: cid,
      toolId: "T05",
      inputData: f as unknown as Record<string, unknown>,
      calculatedOutput: {
        currentValuation: c?.blended ?? 0,
        currentValuationLow: c?.low ?? 0,
        currentValuationHigh: c?.high ?? 0,
        targetValuation: c?.targetBlended ?? null,
      },
      currency: sym,
    });
    try {
      const existing = await fetch(
        `/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`
      ).then((r) => r.json());
      const core = existing?.data ?? {};
      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core", companyId: cid,
          data: {
            ...core,
            currentValuation: c?.blended ?? 0,
            currentValuationLow: c?.low ?? 0,
            currentValuationHigh: c?.high ?? 0,
            targetValuation: c?.targetBlended ?? null,
            valuationPEMultiple: peMultiple,
            updatedBy: { ...(core.updatedBy ?? {}), "valuation": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  function set(field: keyof T05Form) { return (v: string) => setForm((p) => ({ ...p, [field]: v })); }

  const guide = <ToolGuide toolSlug="valuation" steps={GUIDE_STEPS} />;

  // ── Derived display values ───────────────────────────────────────────────────────────────────────
  const nextVal = pf(form.importedNextValuation);
  const nextPat = pf(form.importedNextPat);
  const ipoTarget = pf(form.manualIpoTarget);
  const ipoPat = pf(form.importedIpoPat);
  const hasNextRound = form.importedNextStage !== "" && nextVal > 0;
  const hasIpoSection = ipoTarget > 0;

  // ── Render ─────────────────────────────────────────────────────────────────────────────────────────────
  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Enterprise Valuation" : "企业估值"}
      desc={locale === "en" ? "Multi-method valuation for fundraising readiness" : "多方法估值，建立融资谈判底气"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* 财务数据 + 导入按鈕 */}
        <Card accent>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono" style={{ color: "#7A7A7A" }}>财务数据</p>
            <div className="flex gap-2">
              <button onClick={importFromPnL}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#7A7A7A" }}>
                从利润表导入
              </button>
              <button onClick={importFromRoadmap}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#7A7A7A" }}>
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

          {form.importedCurrentStage && (
            <p className="text-xs mb-3 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "rgba(61,122,65,0.06)", color: "#3D7A41", border: "1px solid rgba(61,122,65,0.15)" }}>
              当前融资阶段：{form.importedCurrentStage}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "当前税后净利润（PAT）", value: calc.currentPAT },
              { label: "当前营收", value: calc.currentRevenue },
              { label: "目标税后净利润（PAT）", value: calc.targetPAT },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
                <p className="text-sm font-bold font-mono" style={{ color: value > 0 ? "#2B2B2B" : "#B0AA9A" }}>
                  {value > 0 ? fmt(value, sym) : "未设定"}
                </p>
              </div>
            ))}
          </div>

          <NumField label="当前税后净利润（PAT）" value={form.manualPAT} onChange={set("manualPAT")} sym={sym} />
          <NumField label="当前年营收" value={form.manualRevenue} onChange={set("manualRevenue")} sym={sym} />
          <NumField label="目标税后净利润（PAT）" value={form.manualTargetPAT} onChange={set("manualTargetPAT")} sym={sym} />
          <NumField label="上市目标估值（IPO）" value={form.manualIpoTarget} onChange={set("manualIpoTarget")} sym={sym} />
        </Card>

        {/* 估值参数 + DCF */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SLabel>估值参数</SLabel>
            <MultiplierInput label="市盈率（PE）" value={form.customPE} onChange={set("customPE")} />
            <MultiplierInput label="营收倍数" value={form.customRevMultiple} onChange={set("customRevMultiple")} />
            <MultiplierInput label="企业价值倍数（EV/EBITDA）" value={form.customEvEbitda} onChange={set("customEvEbitda")} />
          </Card>

          <Card>
            <SLabel>现金流折现法（DCF）参数</SLabel>
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
            <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
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

        {/* 4 种方法 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValCard method="市盈率法（PE）" currentVal={calc.vPE} targetVal={calc.tvPE} sym={sym}
            note={`税后净利润（PAT）× ${peMultiple}x`} />
          <ValCard method="营收倍数法" currentVal={calc.vRev} targetVal={calc.tvRev} sym={sym}
            note={`营收 × ${revMultiple}x`} />
          <ValCard method="企业价值倍数（EV/EBITDA）" currentVal={calc.vEVEBITDA} targetVal={calc.tvEVEBITDA} sym={sym}
            note={`EBIT × ${evMultiple}x`} />
          <ValCard method="现金流折现法（DCF）" currentVal={calc.dcfValue} targetVal={null} sym={sym}
            note={`5 年现金流折现 + 终值，折现率 ${form.discountRatePct}%`} />
        </div>

        {calc.outlierMethods.length > 0 && (
          <div className="rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(176,90,80,0.06)", border: "1px solid rgba(176,90,80,0.2)" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#B05050" }}>
              异常值已排除（差距 &gt; 200% 或 &lt; 50% 均值）
            </p>
            <p className="text-xs" style={{ color: "#9A9490" }}>
              {calc.outlierMethods.join("、")} — 已从综合估值区间中排除，不影响主计算。
            </p>
          </div>
        )}

        {/* 综合估值区间 */}
        <Card accent>
          <SLabel>综合估值区间</SLabel>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "保守估值", desc: "适合作为谈判底价", value: calc.low, color: "#F0A445" },
              { label: "建议融资估值", desc: "建议对外融资报价", value: calc.blended, color: "#C9A84C" },
              { label: "理想估值", desc: "达到目标 PAT 后的合理估值", value: calc.high, color: "#22C55E" },
            ].map(({ label, desc, value, color }) => (
              <div key={label} className="rounded-2xl p-4" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <p className="text-xs font-semibold mb-0.5" style={{ color }}>{label}</p>
                <p className="text-lg font-bold font-mono mb-1" style={{ color }}>
                  {value > 0 ? fmt(value, sym) : "—"}
                </p>
                <p className="text-xs" style={{ color: "#B0AA9A" }}>{desc}</p>
              </div>
            ))}
          </div>

          {calc.targetBlended !== null && calc.targetBlended > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
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
        </Card>

        {/* 下一轮融资目标 */}
        {hasNextRound && (
          <Card>
            <SLabel>下一轮融资目标 — {form.importedNextStage}</SLabel>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>估值差距</p>
                <GapRow label="下一轮目标估值" value={fmt(nextVal, sym)} highlight />
                <GapRow label="当前估值" value={fmt(calc.blended, sym)} />
                <GapRow label="距离下一轮" value={calc.blended > 0 ? fmt(nextVal - calc.blended, sym) : "—"} />
                {calc.blended > 0 && (
                  <>
                    <div className="py-1.5" style={{ borderBottom: "1px solid #F0EBE0" }}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>成长倍数</span>
                        <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>
                          {(nextVal / calc.blended).toFixed(2)} 倍
                        </span>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>估值完成度</span>
                        <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>
                          {((calc.blended / nextVal) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar pct={(calc.blended / nextVal) * 100} color="#C9A84C" />
                    </div>
                  </>
                )}
              </div>
              {nextPat > 0 && (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>税后净利润（PAT）差距</p>
                  <GapRow label="下一轮目标 PAT" value={fmt(nextPat, sym)} highlight />
                  <GapRow label="当前 PAT" value={calc.currentPAT > 0 ? fmt(calc.currentPAT, sym) : "未设定"} />
                  <GapRow label="距离下一轮 PAT" value={calc.currentPAT > 0 ? fmt(nextPat - calc.currentPAT, sym) : "—"} />
                  {calc.currentPAT > 0 && (
                    <div className="py-1.5">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>完成度</span>
                        <span className="text-xs font-bold font-mono" style={{ color: "#3D7A41" }}>
                          {((calc.currentPAT / nextPat) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar pct={(calc.currentPAT / nextPat) * 100} color="#3D7A41" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 上市目标（IPO） */}
        {hasIpoSection && (
          <Card>
            <SLabel>上市目标（IPO）</SLabel>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>估值差距</p>
                <GapRow label="IPO 目标估值" value={fmt(ipoTarget, sym)} highlight />
                <GapRow label="当前估值" value={calc.blended > 0 ? fmt(calc.blended, sym) : "未设定"} />
                <GapRow label="差距" value={calc.blended > 0 ? fmt(ipoTarget - calc.blended, sym) : "—"} />
                {calc.blended > 0 && (
                  <div className="py-1.5">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: "#9A9490" }}>估值完成度</span>
                      <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>
                        {((calc.blended / ipoTarget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar pct={(calc.blended / ipoTarget) * 100} color="#C9A84C" />
                  </div>
                )}
              </div>
              {ipoPat > 0 && (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>税后净利润（PAT）差距</p>
                  <GapRow label="IPO 目标 PAT" value={fmt(ipoPat, sym)} highlight />
                  <GapRow label="当前 PAT" value={calc.currentPAT > 0 ? fmt(calc.currentPAT, sym) : "未设定"} />
                  <GapRow label="差距" value={calc.currentPAT > 0 ? fmt(ipoPat - calc.currentPAT, sym) : "—"} />
                  {calc.currentPAT > 0 && (
                    <div className="py-1.5">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>PAT 完成度</span>
                        <span className="text-xs font-bold font-mono" style={{ color: "#3D7A41" }}>
                          {((calc.currentPAT / ipoPat) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar pct={(calc.currentPAT / ipoPat) * 100} color="#3D7A41" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 图表 */}
        <Card>
          <SLabel>当前估值 vs 目标估值</SLabel>
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
