"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface T05Form {
  manualPAT: string;
  manualRevenue: string;
  manualTargetPAT: string;          // current stage target PAT
  importedCurrentStage: string;
  importedCurrentValuation: string; // current stage post-money
  importedNextStage: string;
  importedNextValuation: string;
  importedNextPat: string;
  importedIpoPat: string;
  importedIpoValuation: string;
  customPE: string;
  customRevMultiple: string;
  // kept for backward compat with saved data (not shown in UI)
  customEvEbitda: string;
  growthYear1Pct: string; growthYear2Pct: string; growthYear3Pct: string;
  growthYear4Pct: string; growthYear5Pct: string;
  discountRatePct: string; terminalMultiple: string;
  weightPE: string; weightRevenue: string; weightEvEbitda: string; weightDCF: string;
  manualIpoTarget: string; // backward compat alias for importedIpoValuation
}

const DEFAULT_FORM: T05Form = {
  manualPAT: "", manualRevenue: "", manualTargetPAT: "",
  importedCurrentStage: "", importedCurrentValuation: "",
  importedNextStage: "", importedNextValuation: "",
  importedNextPat: "", importedIpoPat: "", importedIpoValuation: "",
  customPE: "10", customRevMultiple: "1",
  customEvEbitda: "8",
  growthYear1Pct: "20", growthYear2Pct: "25", growthYear3Pct: "20",
  growthYear4Pct: "15", growthYear5Pct: "10",
  discountRatePct: "15", terminalMultiple: "8",
  weightPE: "30", weightRevenue: "20", weightEvEbitda: "25", weightDCF: "25",
  manualIpoTarget: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Guide
// ─────────────────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  { title: "企业估值是融资的起点", body: "投资人用估值决定「进多少钱、占多少股」。了解自己的估值，才能在融资谈判桌上有底气，不被压价。" },
  { title: "两种主流估值方法", body: "市盈率法（PE）最常用：税后净利润（PAT）× 市盈率（PE）倍数。营收倍数法（PS）适合早期或亏损企业：年营收 × 市销率（PS）倍数。" },
  { title: "当前阶段 vs 下一轮", body: "工具从融资路线图读取当前阶段数据。重点关注：当前估值距离下一轮目标还有多远，而不是直接看 IPO。" },
  { title: "数据来源", body: "点击【从利润表导入】自动填入当前税后净利润（PAT）与营收；点击【从融资路线图导入】带入当前阶段市盈率（PE）、目标税后净利润（PAT）与 IPO 目标。导入后仍可手动调整。" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "—";
  const abs = Math.abs(n);
  return (n < 0 ? "-" : "") + sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function pf(v: string | number | undefined): number {
  return parseFloat(String(v ?? "")) || 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.25)" : "#E8DFCF"}` }}>
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

function GapRow({ label, value, highlight = false, sub = false }: { label: string; value: string; highlight?: boolean; sub?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid #F0EBE0" }}>
      <span className="text-xs" style={{ color: sub ? "#B0AA9A" : "#9A9490" }}>{label}</span>
      <span className="text-xs font-bold font-mono" style={{ color: highlight ? "#C9A84C" : sub ? "#9A9490" : "#2B2B2B" }}>{value}</span>
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

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
      <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
      <p className="text-sm font-bold font-mono" style={{ color: value === "—" || value === "未设定" ? "#B0AA9A" : "#2B2B2B" }}>{value}</p>
    </div>
  );
}

function NumField({ label, value, onChange, sym, last = false }: {
  label: string; value: string; onChange: (v: string) => void; sym?: string; last?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={last ? {} : { borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <div className="relative">
        {sym && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{sym}</span>}
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)}
          className="py-1 rounded-lg text-xs text-right outline-none font-mono"
          style={{ width: 160, paddingLeft: sym ? 30 : 8, paddingRight: 8, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
          onFocus={(e) => { e.target.select(); (e.target as HTMLInputElement).style.borderColor = "#C9A84C"; }}
          onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E8DFCF"; }} />
      </div>
    </div>
  );
}

function MultiplierInput({ label, value, onChange, last = false }: {
  label: string; value: string; onChange: (v: string) => void; last?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={last ? {} : { borderBottom: "1px solid #E8DFCF" }}>
      <span className="flex-1 text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} step="0.5"
        className="w-20 px-2 py-1 rounded-lg text-xs text-right outline-none font-mono"
        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
        onFocus={(e) => { e.target.select(); (e.target as HTMLInputElement).style.borderColor = "#C9A84C"; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E8DFCF"; }} />
      <span className="text-xs font-mono w-4" style={{ color: "#7A7A7A" }}>x</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function ValuationTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, save } = useToolSnapshot<T05Form>("valuation");
  const [form, setForm] = useState<T05Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore & { targetPAT?: number } | null>(null);
  const [importMsg, setImportMsg] = useState<string>("");

  // ── Load: localStorage first, then DB ──────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const ls = loadToolData(cid, "T05") ?? loadToolData("__default__", "T05");
    if (ls?.inputData) {
      const saved = ls.inputData as Partial<T05Form>;
      // migrate: old manualIpoTarget → importedIpoValuation
      const migrated = { ...DEFAULT_FORM, ...saved };
      if (!migrated.importedIpoValuation && (migrated as any).manualIpoTarget) {
        migrated.importedIpoValuation = (migrated as any).manualIpoTarget;
      }
      setForm(migrated);
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

  // ── Load coreData ───────────────────────────────────────────────────────────
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`)
      .then((r) => r.json())
      .then((snap) => { if (snap?.data) setCoreData(snap.data); })
      .catch(() => {});
  }, []);

  // ── Auto-save debounce ──────────────────────────────────────────────────────
  const formRef = useRef(form);
  formRef.current = form;
  const calcRef = useRef<{ vPE: number; vRev: number; tvPE: number | null } | null>(null);
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
  const psMultiple = pf(form.customRevMultiple) || 1;

  // ── Import helpers ──────────────────────────────────────────────────────────
  function showMsg(msg: string) { setImportMsg(msg); setTimeout(() => setImportMsg(""), 3500); }

  function importFromPnL() {
    const cid = getCompanyId();
    const t01 = loadToolData(cid, "T01")?.calculatedOutput as Record<string, number> | undefined;
    if (!t01) { showMsg("未找到利润表数据，请先完成利润表工具"); return; }
    // T01 saves as "pat" (not "annualPAT") — try both
    const pat = t01.pat ?? t01.annualPAT;
    const rev = t01.annualRevenue;
    setForm((p) => ({
      ...p,
      manualPAT: pat != null && pat > 0 ? String(Math.round(pat)) : p.manualPAT,
      manualRevenue: rev != null && rev > 0 ? String(Math.round(rev)) : p.manualRevenue,
    }));
    showMsg(pat != null && pat > 0
      ? "✓ 已从利润表导入年营收与税后净利润（PAT）"
      : "利润表数据已找到，但税后净利润（PAT）为零，请先完善利润表");
  }

  function importFromRoadmap() {
    const cid = getCompanyId();
    const t06 = loadToolData(cid, "T06")?.calculatedOutput as Record<string, unknown> | undefined;
    if (!t06) { showMsg("未找到融资路线图数据，请先完成融资路线图工具"); return; }
    const currentStage = String(t06.currentActualStageName ?? "");
    if (!currentStage) { showMsg("融资路线图尚未设定「当前实际融资阶段」，请先在融资路线图选择"); return; }
    const currentPE = Number(t06.currentStagePe ?? 0);
    const currentVal = Number(t06.currentActualPostMoney ?? 0);
    const currentPatRaw = Number(t06.currentStagePat ?? 0);
    const currentPat = currentPatRaw > 0 ? currentPatRaw
      : (currentVal > 0 && currentPE > 0 ? currentVal / currentPE : 0);
    const nextStage = String(t06.nextStageName ?? "");
    const nextVal = Number(t06.nextStagePostMoney ?? 0);
    const nextPat = Number(t06.nextStagePat ?? 0);
    const ipoVal = Number(t06.ipoTargetValuation ?? 0);
    const ipoPatRaw = Number(t06.ipoPatTarget ?? 0);
    const ipoLatestPe = Number(t06.latestPe ?? 0);
    const ipoPat = ipoPatRaw > 0 ? ipoPatRaw
      : (ipoVal > 0 && ipoLatestPe > 0 ? ipoVal / ipoLatestPe : 0);
    setForm((p) => ({
      ...p,
      customPE: currentPE > 0 ? String(currentPE) : p.customPE,
      manualTargetPAT: currentPat > 0 ? String(Math.round(currentPat)) : p.manualTargetPAT,
      importedIpoValuation: ipoVal > 0 ? String(Math.round(ipoVal)) : p.importedIpoValuation,
      importedCurrentStage: currentStage,
      importedCurrentValuation: currentVal > 0 ? String(Math.round(currentVal)) : p.importedCurrentValuation,
      importedNextStage: nextStage,
      importedNextValuation: nextVal > 0 ? String(Math.round(nextVal)) : "",
      importedNextPat: nextPat > 0 ? String(Math.round(nextPat)) : "",
      importedIpoPat: ipoPat > 0 ? String(Math.round(ipoPat)) : "",
    }));
    showMsg(`✓ 已从融资路线图导入（当前阶段：${currentStage}）`);
  }

  // ── Calculation ─────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const currentPAT = pf(form.manualPAT) || coreData?.annualPAT || 0;
    const currentRevenue = pf(form.manualRevenue) || coreData?.annualRevenue || 0;
    const targetPAT = pf(form.manualTargetPAT) || 0;

    const vPE = currentPAT > 0 ? currentPAT * peMultiple : 0;
    const vRev = currentRevenue > 0 ? currentRevenue * psMultiple : 0;
    const tvPE = targetPAT > 0 ? targetPAT * peMultiple : null;

    // Primary current valuation: PE first, PS as fallback
    const currentValuation = vPE > 0 ? vPE : vRev;

    return { currentPAT, currentRevenue, targetPAT, vPE, vRev, tvPE, currentValuation };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, coreData, peMultiple, psMultiple]);

  calcRef.current = { vPE: calc.vPE, vRev: calc.vRev, tvPE: calc.tvPE };

  // ── Save ────────────────────────────────────────────────────────────────────
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
        currentValuation: c?.vPE ?? 0,
        currentValuationPS: c?.vRev ?? 0,
        targetValuation: c?.tvPE ?? null,
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
            currentValuation: c?.vPE ?? 0,
            targetValuation: c?.tvPE ?? null,
            valuationPEMultiple: peMultiple,
            updatedBy: { ...(core.updatedBy ?? {}), valuation: new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  function set(field: keyof T05Form) { return (v: string) => setForm((p) => ({ ...p, [field]: v })); }

  const guide = <ToolGuide toolSlug="valuation" steps={GUIDE_STEPS} />;

  // ── Derived ─────────────────────────────────────────────────────────────────
  const nextVal = pf(form.importedNextValuation);
  const nextPat = pf(form.importedNextPat);
  const ipoTarget = pf(form.importedIpoValuation) || pf(form.manualIpoTarget);
  const ipoPat = pf(form.importedIpoPat);
  const stageTarget = pf(form.importedCurrentValuation);
  const hasNextRound = form.importedNextStage !== "" && nextVal > 0;
  const hasIpoSection = ipoTarget > 0;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Enterprise Valuation" : "企业估值"}
      desc={locale === "en" ? "Know what your business is worth today" : "一眼看清企业现在值多少錢，距离下一轮还有多远"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ① 财务数据 */}
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

          {/* KPI chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <KpiChip
              label="当前融资阶段"
              value={form.importedCurrentStage || "未设定"}
            />
            <KpiChip
              label="当前税后净利润（PAT）"
              value={calc.currentPAT > 0 ? fmt(calc.currentPAT, sym) : "未设定"}
            />
            <KpiChip
              label="当前年营收"
              value={calc.currentRevenue > 0 ? fmt(calc.currentRevenue, sym) : "未设定"}
            />
            <KpiChip
              label="当前阶段目标税后净利润（PAT）"
              value={calc.targetPAT > 0 ? fmt(calc.targetPAT, sym) : "未设定"}
            />
            <KpiChip
              label="当前阶段目标估值"
              value={stageTarget > 0 ? fmt(stageTarget, sym) : "未设定"}
            />
          </div>

          {/* Input fields */}
          <NumField label="当前税后净利润（PAT）" value={form.manualPAT} onChange={set("manualPAT")} sym={sym} />
          <NumField label="当前年营收" value={form.manualRevenue} onChange={set("manualRevenue")} sym={sym} />
          <NumField label="当前阶段目标税后净利润（PAT）" value={form.manualTargetPAT} onChange={set("manualTargetPAT")} sym={sym} />
          <NumField label="当前阶段目标估值" value={form.importedCurrentValuation} onChange={set("importedCurrentValuation")} sym={sym} last />
        </Card>

        {/* ② 估值参数 */}
        <Card>
          <SLabel>估值参数</SLabel>
          <MultiplierInput label="市盈率（PE）" value={form.customPE} onChange={set("customPE")} />
          <MultiplierInput label="营收倍数（PS）" value={form.customRevMultiple} onChange={set("customRevMultiple")} last />
        </Card>

        {/* ③ 两种估值方法 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#9A9490" }}>市盈率法（PE）</p>
            <p className="text-xs mb-3" style={{ color: "#B0AA9A" }}>税后净利润（PAT）× {peMultiple}</p>
            <p className="text-2xl font-bold font-mono mb-1" style={{ color: "#C9A84C" }}>
              {calc.vPE > 0 ? fmt(calc.vPE, sym) : "—"}
            </p>
            {calc.tvPE !== null && calc.tvPE > 0 && (
              <p className="text-xs mt-1" style={{ color: "#22C55E" }}>
                目标：{fmt(calc.tvPE, sym)}
              </p>
            )}
          </div>
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#9A9490" }}>营收倍数法（PS）</p>
            <p className="text-xs mb-3" style={{ color: "#B0AA9A" }}>营收 × {psMultiple}</p>
            <p className="text-2xl font-bold font-mono mb-1" style={{ color: "#C9A84C" }}>
              {calc.vRev > 0 ? fmt(calc.vRev, sym) : "—"}
            </p>
          </div>
        </div>

        {/* ④ 目标估值（达成目标PAT后） */}
        {calc.tvPE !== null && calc.tvPE > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#9A9490" }}>达成目标税后净利润（PAT）后的估值</p>
                <p className="text-2xl font-bold font-mono mt-1" style={{ color: "#22C55E" }}>{fmt(calc.tvPE, sym)}</p>
              </div>
              {calc.vPE > 0 && (
                <div className="text-right">
                  <p className="text-xs mb-0.5" style={{ color: "#7A7A7A" }}>估值增幅</p>
                  <p className="text-xl font-bold font-mono" style={{ color: "#22C55E" }}>
                    +{(((calc.tvPE - calc.vPE) / calc.vPE) * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
            {calc.vPE > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid #E8DFCF" }}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: "#9A9490" }}>
                  <span>当前估值（PE）</span>
                  <span className="font-mono" style={{ color: "#2B2B2B" }}>{fmt(calc.vPE, sym)}</span>
                </div>
                <div className="flex justify-between text-xs" style={{ color: "#9A9490" }}>
                  <span>目标估值（市盈率法）</span>
                  <span className="font-mono" style={{ color: "#22C55E" }}>{fmt(calc.tvPE, sym)}</span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ⑤ 下一轮融资分析 */}
        {hasNextRound && (
          <Card>
            <SLabel>下一轮融资目标 — {form.importedNextStage}</SLabel>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>估值差距</p>
                <GapRow label="下一轮目标估值" value={fmt(nextVal, sym)} highlight />
                <GapRow label="当前估值（市盈率法）" value={calc.vPE > 0 ? fmt(calc.vPE, sym) : "未设定"} />
                <GapRow label="距离下一轮" value={calc.vPE > 0 ? fmt(nextVal - calc.vPE, sym) : "—"} />
                {calc.vPE > 0 && (
                  <>
                    <GapRow label="成长倍数" value={`${(nextVal / calc.vPE).toFixed(2)} 倍`} />
                    <div className="pt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>估值完成度</span>
                        <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>
                          {((calc.vPE / nextVal) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <ProgressBar pct={(calc.vPE / nextVal) * 100} color="#C9A84C" />
                    </div>
                  </>
                )}
              </div>
              {nextPat > 0 && (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>税后净利润（PAT）差距</p>
                  <GapRow label="下一轮目标税后净利润（PAT）" value={fmt(nextPat, sym)} highlight />
                  <GapRow label="当前税后净利润（PAT）" value={calc.currentPAT > 0 ? fmt(calc.currentPAT, sym) : "未设定"} />
                  <GapRow label="距离下一轮税后净利润（PAT）" value={calc.currentPAT > 0 ? fmt(nextPat - calc.currentPAT, sym) : "—"} />
                  {calc.currentPAT > 0 && (
                    <div className="pt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>税后净利润（PAT）完成度</span>
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

        {/* ⑥ IPO 目标分析 */}
        {hasIpoSection && (
          <Card>
            <SLabel>上市目标（IPO）</SLabel>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>估值差距</p>
                <GapRow label="IPO 目标估值" value={fmt(ipoTarget, sym)} highlight />
                <GapRow label="当前估值（市盈率法）" value={calc.vPE > 0 ? fmt(calc.vPE, sym) : "未设定"} />
                <GapRow label="差距" value={calc.vPE > 0 ? fmt(ipoTarget - calc.vPE, sym) : "—"} />
                {calc.vPE > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ color: "#9A9490" }}>估值完成度</span>
                      <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>
                        {((calc.vPE / ipoTarget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar pct={(calc.vPE / ipoTarget) * 100} color="#C9A84C" />
                  </div>
                )}
              </div>
              {ipoPat > 0 && (
                <div>
                  <p className="text-xs font-mono mb-2" style={{ color: "#9A9490" }}>税后净利润（PAT）差距</p>
                  <GapRow label="IPO 目标税后净利润（PAT）" value={fmt(ipoPat, sym)} highlight />
                  <GapRow label="当前税后净利润（PAT）" value={calc.currentPAT > 0 ? fmt(calc.currentPAT, sym) : "未设定"} />
                  <GapRow label="差距" value={calc.currentPAT > 0 ? fmt(ipoPat - calc.currentPAT, sym) : "—"} />
                  {calc.currentPAT > 0 && (
                    <div className="pt-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs" style={{ color: "#9A9490" }}>税后净利润（PAT）完成度</span>
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

      </div>
    </ToolShell>
  );
}
