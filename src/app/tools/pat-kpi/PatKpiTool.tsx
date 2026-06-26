"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";

// ─ Types ───────────────────────────────────────────────────────────────────────

interface ImportedProduct { id: string; name: string; unitPrice: string; }
interface CostRow { id: string; label: string; amount: string; }

interface T04Form {
  importedProducts: ImportedProduct[];
  taxRatePct: string;
  currentStageName: string;
  currentStagePat: string;
  nextStageName: string;
  nextStagePat: string;
  curSimQtys: Record<string, string>;
  curFixedCosts: CostRow[];
  curVariableCosts: CostRow[];
  nxtSimQtys: Record<string, string>;
  nxtFixedCosts: CostRow[];
  nxtVariableCosts: CostRow[];
}

const DEFAULT_FORM: T04Form = {
  importedProducts: [],
  taxRatePct: "24",
  currentStageName: "",
  currentStagePat: "",
  nextStageName: "",
  nextStagePat: "",
  curSimQtys: {},
  curFixedCosts: [],
  curVariableCosts: [],
  nxtSimQtys: {},
  nxtFixedCosts: [],
  nxtVariableCosts: [],
};

// ─ Guide ───────────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "T04 企业经营绩效模拟系统",
    body: "系统自动同步利润表与融资路线图数据，老板只需调整销量和成本，即可模拟当前与下一阶段的经营绩效。",
  },
  {
    title: "第一步：查看两阶段 KPI",
    body: "顶部自动显示当前阶段与下一阶段的目标 PAT 及当前完成度，帮助老板即时判断经营方向。",
  },
  {
    title: "第二步：调整经营模拟",
    body: "在两个独立模拟器中分别调整每月销量。当前阶段与下一阶段互不影响，方便对比分析。",
  },
  {
    title: "第三步：调整成本结构",
    body: "每项固定成本与变动成本均可独立调整。下一阶段可模拟新增员工、办公室、设备等增量成本。",
  },
  {
    title: "第四步：查看达标方案",
    body: "系统自动计算两个阶段的差距，并给出增加销量、降低成本、双管齐下三种达标方案。",
  },
];

// ─ Helpers ─────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const str = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + "RM " + str;
}

function pf(v: string | undefined): number { return parseFloat(v ?? "") || 0; }

function calcSim(
  products: ImportedProduct[],
  qtys: Record<string, string>,
  fixedCosts: CostRow[],
  variableCosts: CostRow[],
  taxPct: number,
) {
  let revMonthly = 0;
  let totalUnits = 0;
  for (const p of products) {
    const price = pf(p.unitPrice);
    const qty = pf(qtys[p.id]);
    revMonthly += price * qty;
    totalUnits += qty;
  }
  const revAnnual = revMonthly * 12;
  const fixedMonthly = fixedCosts.reduce((s, r) => s + pf(r.amount), 0);
  const varMonthly = variableCosts.reduce((s, r) => s + pf(r.amount), 0);
  const fixedAnnual = fixedMonthly * 12;
  const varAnnual = varMonthly * 12;
  const grossProfit = revAnnual - varAnnual;
  const ebit = grossProfit - fixedAnnual;
  const tax = ebit > 0 ? ebit * taxPct : 0;
  const pat = ebit - tax;
  const varPct = revAnnual > 0 ? varAnnual / revAnnual : 0;
  const wavgPrice = totalUnits > 0 ? revMonthly / totalUnits : 0;
  return { revMonthly, revAnnual, fixedMonthly, varMonthly, pat, varPct, wavgPrice, totalUnits };
}

// ─ Sub-components ────────────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.3)" : "#E8DFCF"}` }}>
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold mb-3" style={{ color: "#9A9490" }}>{children}</p>;
}

function AmountInput({ value, onChange, prefix }: { value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <div className="relative w-36">
      {prefix && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{prefix}</span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
        style={{
          backgroundColor: "#F8F6F1",
          border: "1px solid #E8DFCF",
          color: "#2B2B2B",
          paddingLeft: prefix ? "2rem" : "0.5rem",
          paddingRight: "0.5rem",
        }}
        onFocus={e => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
        onBlur={e => (e.target.style.borderColor = "#E8DFCF")}
      />
    </div>
  );
}

function StageKpiCard({ stageName, targetPAT, simPAT, label, accent }: {
  stageName: string; targetPAT: number; simPAT: number; label: string; accent: string;
}) {
  const has = simPAT !== 0 && targetPAT > 0;
  const pct = has ? Math.min((simPAT / targetPAT) * 100, 100) : 0;
  const gap = targetPAT - simPAT;
  const done = simPAT >= targetPAT && targetPAT > 0;
  return (
    <div className="rounded-2xl p-5"
      style={{
        backgroundColor: done ? "rgba(61,122,65,0.04)" : `${accent}08`,
        border: `1px solid ${done ? "rgba(61,122,65,0.25)" : `${accent}50`}`,
      }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold" style={{ color: "#9A9490" }}>{label}</p>
        {stageName && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${accent}18`, color: accent }}>
            {stageName}
          </span>
        )}
      </div>
      <div className="space-y-2 mb-4">
        {[
          { l: "目标税后净利润（PAT）", v: targetPAT > 0 ? fmt(targetPAT) : "—", c: accent },
          { l: "当前税后净利润（PAT）", v: has ? fmt(simPAT) : "—", c: "#2B2B2B" },
          { l: done ? "超额完成" : "差距", v: has ? (done ? "+" + fmt(Math.abs(gap)) : fmt(-Math.abs(gap))) : "—", c: done ? "#3D7A41" : "#EF4444" },
        ].map(({ l, v, c }, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "#9A9490" }}>{l}</span>
            <span className="text-sm font-bold font-mono break-all" style={{ color: c }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "#9A9490" }}>完成度</span>
        <span className="font-mono font-semibold" style={{ color: done ? "#3D7A41" : accent }}>
          {has ? pct.toFixed(0) + "%" : "—"}
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EBE0" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: done ? "#3D7A41" : accent }} />
      </div>
    </div>
  );
}

function GapSection({ stageLabel, stageName, targetPAT, simPAT, revMonthly, totalUnits, varPct, taxFactor, fixedMonthly }: {
  stageLabel: string; stageName: string; targetPAT: number; simPAT: number;
  revMonthly: number; totalUnits: number; varPct: number; taxFactor: number; fixedMonthly: number;
}) {
  if (targetPAT <= 0) return null;
  const gap = targetPAT - simPAT;
  const done = simPAT >= targetPAT && simPAT !== 0;

  if (done) {
    return (
      <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(61,122,65,0.05)", border: "1px solid rgba(61,122,65,0.2)" }}>
        <p className="text-xs font-semibold" style={{ color: "#3D7A41" }}>
          {stageName || stageLabel} — 已达标
        </p>
        <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>当前PAT已超过目标，可规划下一阶段目标。</p>
      </div>
    );
  }
  if (revMonthly === 0 || simPAT === 0) {
    return (
      <div className="rounded-2xl p-4" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "#9A9490" }}>{stageName || stageLabel} — 达标分析</p>
        <p className="text-xs" style={{ color: "#BFBAB4" }}>请先填入每月销量以显示达标建议。</p>
      </div>
    );
  }

  const margContrib = (1 - varPct) * taxFactor;
  const extraRevAnnual = margContrib > 0 ? gap / margContrib : 0;
  const extraRevMonthly = extraRevAnnual / 12;
  const wavgPrice = totalUnits > 0 ? revMonthly / totalUnits : 0;
  const extraUnitsMonthly = wavgPrice > 0 ? Math.ceil(extraRevMonthly / wavgPrice) : 0;

  const annualRev = revMonthly * 12;
  const fixedAnnual = fixedMonthly * 12;
  const targetRevAnnual = margContrib > 0 ? (targetPAT / taxFactor + fixedAnnual) / (1 - varPct) : 0;
  const p1Pct = annualRev > 0 && extraRevAnnual > 0 ? (extraRevAnnual / annualRev) * 100 : 0;
  const reqFixed = taxFactor > 0 ? annualRev * (1 - varPct) - targetPAT / taxFactor : 0;
  const p2Pct = fixedAnnual > 0 && reqFixed < fixedAnnual && reqFixed > 0 ? ((fixedAnnual - reqFixed) / fixedAnnual) * 100 : 0;
  const R = annualRev > 0 && targetRevAnnual > annualRev ? targetRevAnnual / annualRev : 0;
  const p3Pct = R > 1 ? (Math.sqrt(R) - 1) * 100 : 0;

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #E8DFCF" }}>
      <p className="text-xs font-semibold mb-1" style={{ color: "#9A9490" }}>{stageName || stageLabel} — 达标分析</p>
      <div className="mb-4 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <p className="text-xs" style={{ color: "#7A7A7A" }}>
          还差 <span className="font-mono font-semibold" style={{ color: "#EF4444" }}>{fmt(gap)}</span>
          {extraUnitsMonthly > 0 && (
            <span>，每月需善加 <span className="font-mono font-semibold" style={{ color: "#2B2B2B" }}>{extraUnitsMonthly.toLocaleString()} 件</span>销量（按当前平均售价计算）</span>
          )}
        </p>
      </div>
      <div className="space-y-2.5">
        {p1Pct > 0 && (
          <div className="rounded-xl p-3.5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}>1</span>
              <p className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>方案一：增加销量</p>
            </div>
            <p className="text-xs pl-7" style={{ color: "#7A7A7A" }}>
              售价不变，每月销量增加 <span className="font-mono font-semibold" style={{ color: "#2B2B2B" }}>{p1Pct.toFixed(0)}%</span>
              {extraUnitsMonthly > 0 && <span>（约 +{extraUnitsMonthly.toLocaleString()} 件/月）</span>}
              即可达标。
            </p>
          </div>
        )}
        {p2Pct > 0 && p2Pct < 85 && (
          <div className="rounded-xl p-3.5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}>2</span>
              <p className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>方案二：降低固定成本</p>
            </div>
            <p className="text-xs pl-7" style={{ color: "#7A7A7A" }}>
              销量不变，固定成本降低 <span className="font-mono font-semibold" style={{ color: "#2B2B2B" }}>{p2Pct.toFixed(0)}%</span>
              （目标每月 <span className="font-mono" style={{ color: "#2B2B2B" }}>{fmt(Math.max(0, reqFixed / 12))}</span>）即可达标。
            </p>
          </div>
        )}
        {p3Pct > 0 && p3Pct < 80 && (
          <div className="rounded-xl p-3.5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}>3</span>
              <p className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>方案三：双管齐下</p>
            </div>
            <p className="text-xs pl-7" style={{ color: "#7A7A7A" }}>
              售价提高 <span className="font-mono font-semibold" style={{ color: "#2B2B2B" }}>{p3Pct.toFixed(0)}%</span>
              ，同时销量增加 <span className="font-mono font-semibold" style={{ color: "#2B2B2B" }}>{p3Pct.toFixed(0)}%</span>
              即可达标。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─ Main Component ──────────────────────────────────────────────────────────────

export default function PatKpiTool() {
  const { savedData, save } = useToolSnapshot<T04Form>("pat-kpi");
  const [form, setForm] = useState<T04Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─ Auto-sync on load ──────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const ls = loadToolData(cid, "T04") ?? loadToolData("__default__", "T04");
    const t01 = loadToolData(cid, "T01") ?? loadToolData("__default__", "T01");
    const t06 = loadToolData(cid, "T06") ?? loadToolData("__default__", "T06");

    let f: T04Form = ls?.inputData
      ? { ...DEFAULT_FORM, ...(ls.inputData as Partial<T04Form>) }
      : savedData
      ? { ...DEFAULT_FORM, ...savedData }
      : { ...DEFAULT_FORM };

    // Update locked fields from T01
    if (t01) {
      const inp = t01.inputData as {
        products?: { id: string; name: string; unitPrice: string; monthlyQty: string }[];
        fixedCosts?: { id: string; label: string; amount: string }[];
        variableCosts?: { id: string; label: string; amount: string }[];
      } | undefined;
      const out = t01.calculatedOutput as Record<string, number> | undefined;
      const products = inp?.products ?? [];
      f = {
        ...f,
        importedProducts: products.map(p => ({ id: p.id, name: p.name, unitPrice: p.unitPrice })),
        taxRatePct: String(((out?.effectiveRate ?? 24)).toFixed(1)),
      };
      // Init cost rows and qtys only if no saved adjustments
      const isFirst = f.curFixedCosts.length === 0;
      if (isFirst) {
        const fc = inp?.fixedCosts ?? [];
        const vc = inp?.variableCosts ?? [];
        f = {
          ...f,
          curFixedCosts: fc.map(r => ({ id: r.id, label: r.label, amount: r.amount })),
          curVariableCosts: vc.map(r => ({ id: r.id, label: r.label, amount: r.amount })),
          nxtFixedCosts: fc.map(r => ({ id: r.id + "_n", label: r.label, amount: r.amount })),
          nxtVariableCosts: vc.map(r => ({ id: r.id + "_n", label: r.label, amount: r.amount })),
        };
      }
      const isFirstQty = Object.keys(f.curSimQtys).length === 0;
      if (isFirstQty) {
        const qs: Record<string, string> = {};
        products.forEach(p => { qs[p.id] = p.monthlyQty; });
        f = { ...f, curSimQtys: qs, nxtSimQtys: { ...qs } };
      }
    }

    // Update stage targets from T06
    if (t06) {
      const out = t06.calculatedOutput as Record<string, unknown>;
      const cName = String(out.currentActualStageName ?? out.currentStageName ?? "");
      const cPat = Number(out.currentStagePat ?? 0);
      const nName = String(out.nextStageName ?? "");
      const nPat = Number(out.nextStagePat ?? 0);
      f = {
        ...f,
        currentStageName: cName || f.currentStageName,
        currentStagePat: cPat > 0 ? String(Math.round(cPat)) : f.currentStagePat,
        nextStageName: nName || f.nextStageName,
        nextStagePat: nPat > 0 ? String(Math.round(nPat)) : f.nextStagePat,
      };
    }

    setForm(f);
    if (t01 || t06 || ls || savedData) {
      setLoaded(true);
    } else {
      const t = setTimeout(() => setLoaded(true), 1500);
      return () => clearTimeout(t);
    }
  }, [savedData, loaded]);

  // ─ Auto-save 500ms ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded]);

  function setQty(which: "cur" | "nxt", id: string, v: string) {
    if (which === "cur") setForm(p => ({ ...p, curSimQtys: { ...p.curSimQtys, [id]: v } }));
    else setForm(p => ({ ...p, nxtSimQtys: { ...p.nxtSimQtys, [id]: v } }));
  }

  function setCost(which: "cur" | "nxt", type: "fixed" | "variable", id: string, amount: string) {
    const key = which === "cur"
      ? (type === "fixed" ? "curFixedCosts" : "curVariableCosts")
      : (type === "fixed" ? "nxtFixedCosts" : "nxtVariableCosts");
    setForm(p => ({
      ...p,
      [key]: (p[key] as CostRow[]).map(r => r.id === id ? { ...r, amount } : r),
    }));
  }

  // ─ Calculations ──────────────────────────────────────────────────────────
  const taxPct = pf(form.taxRatePct) / 100;
  const taxFactor = 1 - taxPct;

  const curSim = useMemo(() => calcSim(
    form.importedProducts, form.curSimQtys, form.curFixedCosts, form.curVariableCosts, taxPct,
  ), [form.importedProducts, form.curSimQtys, form.curFixedCosts, form.curVariableCosts, taxPct]);

  const nxtSim = useMemo(() => calcSim(
    form.importedProducts, form.nxtSimQtys, form.nxtFixedCosts, form.nxtVariableCosts, taxPct,
  ), [form.importedProducts, form.nxtSimQtys, form.nxtFixedCosts, form.nxtVariableCosts, taxPct]);

  const curStagePat = pf(form.currentStagePat);
  const nxtStagePat = pf(form.nextStagePat);

  // ─ Save ──────────────────────────────────────────────────────────────────
  async function handleSave() {
    const cid = getCompanyId();
    saveToolData({
      companyId: cid, toolId: "T04",
      inputData: form as unknown as Record<string, unknown>,
      calculatedOutput: {
        curPAT: curSim.pat, nxtPAT: nxtSim.pat,
        curStagePat, nxtStagePat,
        curRevAnnual: curSim.revAnnual, nxtRevAnnual: nxtSim.revAnnual,
      },
    });
    await save(form);
  }

  const hasProducts = form.importedProducts.length > 0;
  const guide = <ToolGuide toolSlug="pat-kpi" steps={GUIDE_STEPS} />;

  // Helper to render one simulation panel
  function SimPanel({
    which, stageName, simQtys, fixedCosts, variableCosts, sim, accent,
  }: {
    which: "cur" | "nxt";
    stageName: string;
    simQtys: Record<string, string>;
    fixedCosts: CostRow[];
    variableCosts: CostRow[];
    sim: ReturnType<typeof calcSim>;
    accent: string;
  }) {
    const label = which === "cur" ? "当前阶段经营模拟" : "下一阶段经营模拟";
    return (
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel>{label}</SLabel>
            {stageName && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${accent}18`, color: accent }}>{stageName}</span>
            )}
          </div>
          {/* Product table */}
          <div>
            <div className="grid text-xs pb-2 mb-1"
              style={{ gridTemplateColumns: "1fr 90px 110px", color: "#9A9490", borderBottom: "1px solid #F0EBE0", gap: "6px" }}>
              <span>产品名称</span>
              <span className="text-right">售价</span>
              <span className="text-right">每月销量</span>
            </div>
            {form.importedProducts.map(p => {
              const price = pf(p.unitPrice);
              const qty = pf(simQtys[p.id]);
              return (
                <div key={p.id} className="grid items-center py-1.5"
                  style={{ gridTemplateColumns: "1fr 90px 110px", borderBottom: "1px solid #F8F6F1", gap: "6px" }}>
                  <span className="text-xs" style={{ color: "#2B2B2B" }}>{p.name || "—"}</span>
                  <span className="text-right text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "#F8F6F1", color: "#7A7A7A" }}>
                    RM {price.toLocaleString("en-MY")}
                  </span>
                  <AmountInput value={simQtys[p.id] ?? ""} onChange={v => setQty(which, p.id, v)} />
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: "1px solid #E8DFCF" }}>
              <span className="text-xs font-semibold" style={{ color: "#9A9490" }}>月营收合计</span>
              <span className="text-xs font-bold font-mono" style={{ color: accent }}>{fmt(sim.revMonthly)}</span>
            </div>
          </div>

          {/* Result strip */}
          {sim.revMonthly > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { l: "月营收", v: fmt(sim.revMonthly) },
                { l: "年营收", v: fmt(sim.revAnnual) },
                { l: "年度税后净利润（PAT）", v: fmt(sim.pat), gold: true },
              ].map((d, i) => (
                <div key={i} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                  <p className="text-xs mb-1" style={{ color: "#9A9490" }}>{d.l}</p>
                  <p className="text-xs font-bold font-mono break-all" style={{ color: d.gold ? accent : "#2B2B2B" }}>{d.v}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Fixed costs */}
        {fixedCosts.length > 0 && (
          <Card>
            <SLabel>固定成本（月度）</SLabel>
            {fixedCosts.map(r => (
              <div key={r.id} className="grid items-center py-1.5"
                style={{ gridTemplateColumns: "1fr 145px", borderBottom: "1px solid #F8F6F1", gap: "8px" }}>
                <span className="text-xs" style={{ color: "#7A7A7A" }}>{r.label}</span>
                <AmountInput value={r.amount} onChange={v => setCost(which, "fixed", r.id, v)} prefix="RM" />
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: "1px solid #E8DFCF" }}>
              <span className="text-xs font-semibold" style={{ color: "#9A9490" }}>月度合计</span>
              <span className="text-xs font-bold font-mono" style={{ color: "#EF4444" }}>{fmt(sim.fixedMonthly)}</span>
            </div>
          </Card>
        )}

        {/* Variable costs */}
        {variableCosts.length > 0 && (
          <Card>
            <SLabel>变动成本（月度）</SLabel>
            {variableCosts.map(r => (
              <div key={r.id} className="grid items-center py-1.5"
                style={{ gridTemplateColumns: "1fr 145px", borderBottom: "1px solid #F8F6F1", gap: "8px" }}>
                <span className="text-xs" style={{ color: "#7A7A7A" }}>{r.label}</span>
                <AmountInput value={r.amount} onChange={v => setCost(which, "variable", r.id, v)} prefix="RM" />
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: "1px solid #E8DFCF" }}>
              <span className="text-xs font-semibold" style={{ color: "#9A9490" }}>月度合计</span>
              <span className="text-xs font-bold font-mono" style={{ color: "#EF4444" }}>{fmt(sim.varMonthly)}</span>
            </div>
          </Card>
        )}

        {/* No T01 data yet */}
        {fixedCosts.length === 0 && variableCosts.length === 0 && (
          <div className="rounded-2xl py-8 flex items-center justify-center"
            style={{ border: "1px dashed #E8DFCF" }}>
            <p className="text-xs" style={{ color: "#BFBAB4" }}>
              成本数据将自动同步自利润表（T01）
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─ Render ────────────────────────────────────────────────────────────────
  return (
    <ToolShell
      icon=""
      title="T04 企业经营绩效模拟系统"
      desc="根据当前经营数据与融资阶段目标，模拟经营调整方案，分析企业达到下一阶段 KPI 所需条件"
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* Two stage KPIs */}
        {(curStagePat > 0 || nxtStagePat > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            <StageKpiCard
              stageName={form.currentStageName}
              targetPAT={curStagePat}
              simPAT={curSim.pat}
              label="当前阶段 KPI"
              accent="#C9A84C"
            />
            <StageKpiCard
              stageName={form.nextStageName}
              targetPAT={nxtStagePat}
              simPAT={nxtSim.pat}
              label="下一阶段 KPI"
              accent="#3D7A41"
            />
          </div>
        )}

        {/* No data placeholder */}
        {!hasProducts && (
          <div className="flex flex-col items-center justify-center rounded-2xl py-12"
            style={{ border: "1px dashed #E8DFCF" }}>
            <p className="text-xs mb-1" style={{ color: "#9A9490" }}>系统正在同步利润表和融资路线图数据…</p>
            <p className="text-xs" style={{ color: "#BFBAB4" }}>
              请先完成 T01 利润表和 T06 融资路线图
            </p>
          </div>
        )}

        {/* Two simulation panels */}
        {hasProducts && (
          <div className="grid lg:grid-cols-2 gap-5">
            <SimPanel
              which="cur"
              stageName={form.currentStageName}
              simQtys={form.curSimQtys}
              fixedCosts={form.curFixedCosts}
              variableCosts={form.curVariableCosts}
              sim={curSim}
              accent="#C9A84C"
            />
            <SimPanel
              which="nxt"
              stageName={form.nextStageName}
              simQtys={form.nxtSimQtys}
              fixedCosts={form.nxtFixedCosts}
              variableCosts={form.nxtVariableCosts}
              sim={nxtSim}
              accent="#3D7A41"
            />
          </div>
        )}

        {/* Gap analysis */}
        {hasProducts && (curStagePat > 0 || nxtStagePat > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {curStagePat > 0 && (
              <GapSection
                stageLabel="当前阶段"
                stageName={form.currentStageName}
                targetPAT={curStagePat}
                simPAT={curSim.pat}
                revMonthly={curSim.revMonthly}
                totalUnits={curSim.totalUnits}
                varPct={curSim.varPct}
                taxFactor={taxFactor}
                fixedMonthly={curSim.fixedMonthly}
              />
            )}
            {nxtStagePat > 0 && (
              <GapSection
                stageLabel="下一阶段"
                stageName={form.nextStageName}
                targetPAT={nxtStagePat}
                simPAT={nxtSim.pat}
                revMonthly={nxtSim.revMonthly}
                totalUnits={nxtSim.totalUnits}
                varPct={nxtSim.varPct}
                taxFactor={taxFactor}
                fixedMonthly={nxtSim.fixedMonthly}
              />
            )}
          </div>
        )}

        {/* Tax rate reference */}
        {hasProducts && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
            <span className="text-xs" style={{ color: "#9A9490" }}>
              当前税率（来自利润表）：
              <span className="font-mono font-semibold ml-1" style={{ color: "#2B2B2B" }}>
                {pf(form.taxRatePct).toFixed(1)}%
              </span>
            </span>
          </div>
        )}

      </div>
    </ToolShell>
  );
}