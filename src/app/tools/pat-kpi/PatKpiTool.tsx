"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";

// ─ Types ───────────────────────────────────────────────────────────────────────

interface ImportedProduct {
  id: string;
  name: string;
  unitPrice: string;
}

interface T04Form {
  importedProducts: ImportedProduct[];
  taxRatePct: string;
  importedFixedCostMonthly: string;
  importedVariableCostPct: string;
  currentStageName: string;
  currentStagePat: string;
  nextStageName: string;
  nextStagePat: string;
  simQtys: Record<string, string>;
  simFixedCostMonthly: string;
  simVariableCostPct: string;
}

const DEFAULT_FORM: T04Form = {
  importedProducts: [],
  taxRatePct: "24",
  importedFixedCostMonthly: "0",
  importedVariableCostPct: "60",
  currentStageName: "",
  currentStagePat: "",
  nextStageName: "",
  nextStagePat: "",
  simQtys: {},
  simFixedCostMonthly: "",
  simVariableCostPct: "",
};

// ─ Guide ───────────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "T04 PAT绩效系统 — 老板经营模拟器",
    body: "打午30秒，马上知道：当前阶段有没有达标、下一阶段还差多少、还要卖多少产品。",
  },
  {
    title: "第一步：导入数据",
    body: "点「从利润表导入」取得产品、成本和税率；点「从融资路线图导入」取得当前与下一阶段的目标PAT。",
  },
  {
    title: "第二步：调整经营参数",
    body: "调整每月销量、固定成本或变动成本率，系统即时更新两个阶段的完成度和达标方案。",
  },
  {
    title: "第三步：查看达标建议",
    body: "系统自动给出三种方案（增销量、降成本、双管齐下），帮助老板决定最优路径。",
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

// ─ Sub-components ────────────────────────────────────────────────────────────────

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
  return <p className="text-xs font-semibold mb-3" style={{ color: "#9A9490" }}>{children}</p>;
}

function StageKpiCard({
  stageName, targetPAT, simPAT, label, accent,
}: {
  stageName: string; targetPAT: number; simPAT: number; label: string; accent: string;
}) {
  const hasPAT = simPAT !== 0 && targetPAT > 0;
  const completionPct = hasPAT ? Math.min((simPAT / targetPAT) * 100, 100) : 0;
  const gap = targetPAT - simPAT;
  const achieved = simPAT >= targetPAT && targetPAT > 0;
  const borderColor = achieved ? "rgba(61,122,65,0.25)" : `${accent}50`;
  const bgColor = achieved ? "rgba(61,122,65,0.04)" : `${accent}08`;
  const barColor = achieved ? "#3D7A41" : accent;

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold" style={{ color: "#9A9490" }}>{label}</p>
        {stageName && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}18`, color: accent }}>
            {stageName}
          </span>
        )}
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#9A9490" }}>目标税后净利润（PAT）</span>
          <span className="text-sm font-bold font-mono" style={{ color: accent }}>{targetPAT > 0 ? fmt(targetPAT) : "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#9A9490" }}>当前税后净利润（PAT）</span>
          <span className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{hasPAT ? fmt(simPAT) : "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "#9A9490" }}>{achieved ? "超额完成" : "差距"}</span>
          <span className="text-sm font-bold font-mono" style={{ color: achieved ? "#3D7A41" : "#EF4444" }}>
            {hasPAT ? (achieved ? "+" + fmt(Math.abs(gap)) : fmt(-Math.abs(gap))) : "—"}
          </span>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "#9A9490" }}>完成度</span>
          <span className="font-mono font-semibold" style={{ color: barColor }}>
            {hasPAT ? completionPct.toFixed(0) + "%" : "—"}
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EBE0" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
    </div>
  );
}

function GapCard({
  stageLabel, stageName, targetPAT, simPAT, simRevMonthly, totalMonthlyUnits,
  varPct, taxFactor, fixedMonthly,
}: {
  stageLabel: string; stageName: string; targetPAT: number; simPAT: number;
  simRevMonthly: number; totalMonthlyUnits: number;
  varPct: number; taxFactor: number; fixedMonthly: number;
}) {
  if (targetPAT <= 0) return null;
  const gap = targetPAT - simPAT;
  const achieved = simPAT >= targetPAT && simPAT !== 0;
  const marginFactor = (1 - varPct) * taxFactor;
  const extraAnnualRev = marginFactor > 0 && gap > 0 ? gap / marginFactor : 0;
  const extraMonthlyRev = extraAnnualRev / 12;
  const wavgPrice = totalMonthlyUnits > 0 && simRevMonthly > 0 ? simRevMonthly / totalMonthlyUnits : 0;
  const extraMonthlyUnits = wavgPrice > 0 ? Math.ceil(extraMonthlyRev / wavgPrice) : 0;

  const annualRev = simRevMonthly * 12;
  const fixedAnnual = fixedMonthly * 12;
  const targetAnnualRev = marginFactor > 0 ? (targetPAT / taxFactor + fixedAnnual) / (1 - varPct) : 0;

  const p1Pct = annualRev > 0 && extraAnnualRev > 0 ? (extraAnnualRev / annualRev) * 100 : 0;
  const reqFixed = taxFactor > 0 && annualRev > 0 ? annualRev * (1 - varPct) - targetPAT / taxFactor : 0;
  const p2Pct = fixedMonthly > 0 && reqFixed < fixedAnnual ? ((fixedAnnual - reqFixed) / fixedAnnual) * 100 : 0;
  const R = annualRev > 0 && targetAnnualRev > annualRev ? targetAnnualRev / annualRev : 0;
  const p3Pct = R > 1 ? (Math.sqrt(R) - 1) * 100 : 0;

  if (achieved) {
    return (
      <div className="rounded-2xl p-4" style={{ backgroundColor: "rgba(61,122,65,0.05)", border: "1px solid rgba(61,122,65,0.2)" }}>
        <p className="text-xs font-semibold" style={{ color: "#3D7A41" }}>
          ✓ {stageName || stageLabel} — 已达标
        </p>
        <p className="text-xs mt-1" style={{ color: "#7A7A7A" }}>当前PAT已超过目标，继续保持或规划下一阶段。</p>
      </div>
    );
  }

  if (simPAT === 0 || simRevMonthly === 0) {
    return (
      <div className="rounded-2xl p-4" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "#9A9490" }}>{stageName || stageLabel} — 达标分析</p>
        <p className="text-xs" style={{ color: "#BFBAB4" }}>请先填入产品每月销量以显示达标建议。</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #E8DFCF" }}>
      <p className="text-xs font-semibold mb-1" style={{ color: "#9A9490" }}>{stageName || stageLabel} — 达标分析</p>
      <div className="mb-4 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <p className="text-xs" style={{ color: "#7A7A7A" }}>
          还差 <span className="font-mono font-semibold" style={{ color: "#EF4444" }}>{fmt(gap)}</span>
          {extraMonthlyUnits > 0 && (
            <span>，每月需善加 <span className="font-mono font-semibold" style={{ color: "#2B2B2B" }}>{extraMonthlyUnits.toLocaleString()} 件</span>销量（按当前平均售价计算）</span>
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
              {extraMonthlyUnits > 0 && <span>（约 +{extraMonthlyUnits.toLocaleString()} 件/月）</span>}
              即可达标。
            </p>
          </div>
        )}
        {p2Pct > 0 && p2Pct < 90 && (
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

  // ─ Load ──────────────────────────────────────────────────────────────────────
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

  // ─ Auto-save 500ms ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded]);

  function setF<K extends keyof T04Form>(k: K) {
    return (v: T04Form[K]) => setForm(p => ({ ...p, [k]: v }));
  }
  function setQty(id: string, v: string) {
    setForm(p => ({ ...p, simQtys: { ...p.simQtys, [id]: v } }));
  }

  // ─ Import from T01 ───────────────────────────────────────────────────────────────
  function importFromT01() {
    const cid = getCompanyId();
    const t01 = loadToolData(cid, "T01") ?? loadToolData("__default__", "T01");
    if (!t01) { alert("请先完成利润表（T01）再导入"); return; }
    const inp = t01.inputData as {
      products?: { id: string; name: string; unitPrice: string; monthlyQty: string }[];
      fixedCosts?: { id: string; label: string; amount: string }[];
      variableCosts?: { id: string; label: string; amount: string }[];
    } | undefined;
    const out = t01.calculatedOutput as Record<string, number> | undefined;
    const products = inp?.products ?? [];
    const fixedCosts = inp?.fixedCosts ?? [];
    const variableCosts = inp?.variableCosts ?? [];
    const totalFixedMonthly = fixedCosts.reduce((s, r) => s + pf(r.amount), 0);
    const totalVariableMonthly = variableCosts.reduce((s, r) => s + pf(r.amount), 0);
    const annualRevenue = out?.annualRevenue ?? 0;
    const grossProfit = out?.grossProfit ?? (annualRevenue - totalVariableMonthly * 12);
    const varCostAnnual = annualRevenue - grossProfit;
    const varPct = annualRevenue > 0 ? (varCostAnnual / annualRevenue) * 100
      : totalVariableMonthly > 0 ? (totalVariableMonthly / (totalFixedMonthly + totalVariableMonthly)) * 100
      : 60;
    const taxRate = out?.effectiveRate ?? 24;
    const importedProducts: ImportedProduct[] = products.map(p => ({ id: p.id, name: p.name, unitPrice: p.unitPrice }));
    const simQtys: Record<string, string> = {};
    products.forEach(p => { simQtys[p.id] = p.monthlyQty; });
    setForm(prev => ({
      ...prev,
      importedProducts,
      taxRatePct: taxRate.toFixed(1),
      importedFixedCostMonthly: totalFixedMonthly.toFixed(0),
      importedVariableCostPct: varPct.toFixed(1),
      simQtys,
      simFixedCostMonthly: totalFixedMonthly.toFixed(0),
      simVariableCostPct: varPct.toFixed(1),
    }));
  }

  // ─ Import from T06 ───────────────────────────────────────────────────────────────
  function importFromT06() {
    const cid = getCompanyId();
    const t06 = loadToolData(cid, "T06") ?? loadToolData("__default__", "T06");
    if (!t06) { alert("请先完成融资路线图（T06）再导入"); return; }
    const out = t06.calculatedOutput as Record<string, unknown>;
    const currentStageName = String(out.currentActualStageName ?? out.currentStageName ?? "");
    const currentStagePat = Number(out.currentStagePat ?? 0);
    const nextStageName = String(out.nextStageName ?? "");
    const nextStagePat = Number(out.nextStagePat ?? 0);
    setForm(prev => ({
      ...prev,
      currentStageName,
      currentStagePat: currentStagePat > 0 ? String(Math.round(currentStagePat)) : prev.currentStagePat,
      nextStageName,
      nextStagePat: nextStagePat > 0 ? String(Math.round(nextStagePat)) : prev.nextStagePat,
    }));
  }

  // ─ Calculations ──────────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const taxPct = pf(form.taxRatePct) / 100;
    const taxFactor = 1 - taxPct;
    const varPct = pf(form.simVariableCostPct) / 100;
    const fixedMonthly = pf(form.simFixedCostMonthly);
    const fixedAnnual = fixedMonthly * 12;
    let simRevMonthly = 0;
    let totalMonthlyUnits = 0;
    for (const p of form.importedProducts) {
      const price = pf(p.unitPrice);
      const qty = pf(form.simQtys[p.id]);
      simRevMonthly += price * qty;
      totalMonthlyUnits += qty;
    }
    const simRevAnnual = simRevMonthly * 12;
    const ebit = simRevAnnual * (1 - varPct) - fixedAnnual;
    const simPAT = ebit * taxFactor;
    const currentStagePat = pf(form.currentStagePat);
    const nextStagePat = pf(form.nextStagePat);
    const curCompletion = currentStagePat > 0 && simPAT > 0 ? Math.min((simPAT / currentStagePat) * 100, 100) : 0;
    const nxtCompletion = nextStagePat > 0 && simPAT > 0 ? Math.min((simPAT / nextStagePat) * 100, 100) : 0;
    return {
      simRevMonthly, simRevAnnual, simPAT,
      totalMonthlyUnits, varPct, taxFactor, fixedMonthly,
      currentStagePat, nextStagePat, curCompletion, nxtCompletion,
    };
  }, [form]);

  // ─ Save ────────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const cid = getCompanyId();
    saveToolData({
      companyId: cid, toolId: "T04",
      inputData: form as unknown as Record<string, unknown>,
      calculatedOutput: {
        simPAT: calc.simPAT, simRevAnnual: calc.simRevAnnual,
        currentStagePat: calc.currentStagePat, nextStagePat: calc.nextStagePat,
        curCompletion: calc.curCompletion, nxtCompletion: calc.nxtCompletion,
      },
    });
    await save(form);
  }

  const hasProducts = form.importedProducts.length > 0;
  const guide = <ToolGuide toolSlug="pat-kpi" steps={GUIDE_STEPS} />;

  // ─ Render ────────────────────────────────────────────────────────────────────
  return (
    <ToolShell
      icon="📊"
      title="T04 PAT绩效系统"
      desc="老板经营模拟器 — 打午30秒，马上知道今天该卖多少"
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── 导入按鈕 */}
        <div className="flex flex-wrap gap-3">
          <button onClick={importFromT01}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}>
            从利润表导入
          </button>
          <button onClick={importFromT06}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(61,122,65,0.06)", border: "1px solid rgba(61,122,65,0.2)", color: "#3D7A41" }}>
            从融资路线图导入
          </button>
        </div>

        {/* ── 两个阶段 KPI */}
        {(calc.currentStagePat > 0 || calc.nextStagePat > 0) && (
          <div className="grid sm:grid-cols-2 gap-4">
            <StageKpiCard
              stageName={form.currentStageName}
              targetPAT={calc.currentStagePat}
              simPAT={calc.simPAT}
              label="当前阶段 KPI"
              accent="#C9A84C"
            />
            <StageKpiCard
              stageName={form.nextStageName}
              targetPAT={calc.nextStagePat}
              simPAT={calc.simPAT}
              label="下一阶段 KPI"
              accent="#3D7A41"
            />
          </div>
        )}

        {/* ── 无产品占位符 */}
        {!hasProducts && (
          <div className="flex flex-col items-center justify-center rounded-2xl py-12"
            style={{ border: "1px dashed #E8DFCF" }}>
            <p className="text-xs mb-1" style={{ color: "#9A9490" }}>请先导入利润表数据</p>
            <p className="text-xs" style={{ color: "#BFBAB4" }}>点击上方「从利润表导入」按鈕</p>
          </div>
        )}

        {/* ── 产品表（售价锁定，每月销量可调） */}
        {hasProducts && (
          <Card>
            <SLabel>产品 / 服务（售价来自利润表，不可修改）</SLabel>
            <div>
              <div className="grid text-xs pb-2 mb-1" style={{ gridTemplateColumns: "1fr 110px 130px", color: "#9A9490", borderBottom: "1px solid #F0EBE0", gap: "8px" }}>
                <span>产品名称</span>
                <span className="text-right">售价（件）</span>
                <span className="text-right">每月销量</span>
              </div>
              {form.importedProducts.map(p => {
                const price = pf(p.unitPrice);
                const qty = pf(form.simQtys[p.id]);
                const monthlyRev = price * qty;
                return (
                  <div key={p.id} className="grid items-center py-2"
                    style={{ gridTemplateColumns: "1fr 110px 130px", borderBottom: "1px solid #F8F6F1", gap: "8px" }}>
                    <span className="text-xs" style={{ color: "#2B2B2B" }}>{p.name || "—"}</span>
                    <div className="text-right">
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: "#F8F6F1", color: "#7A7A7A" }}>
                        RM {price.toLocaleString("en-MY")}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <input
                        type="number"
                        value={form.simQtys[p.id] ?? ""}
                        onChange={e => setQty(p.id, e.target.value)}
                        className="w-full py-1.5 pr-2 rounded-lg text-xs text-right outline-none font-mono"
                        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B", paddingLeft: "0.5rem" }}
                        onFocus={e => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                        onBlur={e => (e.target.style.borderColor = "#E8DFCF")}
                      />
                      {monthlyRev > 0 && (
                        <span className="text-xs font-mono" style={{ color: "#BFBAB4" }}>{fmt(monthlyRev)}/月</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="grid items-center py-2 mt-1" style={{ gridTemplateColumns: "1fr 110px 130px", borderTop: "1px solid #E8DFCF", gap: "8px" }}>
                <span className="text-xs font-semibold" style={{ color: "#9A9490" }}>月营收合计</span>
                <span></span>
                <span className="text-right text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(calc.simRevMonthly)}</span>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: "#BFBAB4" }}>
              如需修改产品名称或售价，请到 T01 利润表修改后重新导入。
            </p>
          </Card>
        )}

        {/* ── 成本调整 */}
        {hasProducts && (
          <Card>
            <SLabel>成本调整（月度）</SLabel>
            {[
              {
                label: "每月固定成本",
                field: "simFixedCostMonthly" as keyof T04Form,
                prefix: "RM",
                hint: pf(form.importedFixedCostMonthly) > 0 ? `利润表：${fmt(pf(form.importedFixedCostMonthly))}/月` : undefined,
              },
              {
                label: "变动成本率",
                field: "simVariableCostPct" as keyof T04Form,
                suffix: "%",
                hint: pf(form.importedVariableCostPct) > 0 ? `利润表：${pf(form.importedVariableCostPct).toFixed(1)}%` : undefined,
              },
            ].map(({ label, field, prefix, suffix, hint }) => (
              <div key={field} className="grid items-center py-2"
                style={{ gridTemplateColumns: "1fr 155px", borderBottom: "1px solid #F0EBE0", gap: "8px" }}>
                <div>
                  <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
                  {hint && <p className="text-xs" style={{ color: "#BFBAB4" }}>{hint}</p>}
                </div>
                <div className="relative">
                  {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{prefix}</span>}
                  <input
                    type="number"
                    value={String(form[field] ?? "")}
                    onChange={e => setF(field)(e.target.value as T04Form[typeof field])}
                    className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
                    style={{
                      backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B",
                      paddingLeft: prefix ? "2rem" : "0.5rem",
                      paddingRight: suffix ? "1.8rem" : "0.5rem",
                    }}
                    onFocus={e => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                    onBlur={e => (e.target.style.borderColor = "#E8DFCF")}
                  />
                  {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{suffix}</span>}
                </div>
              </div>
            ))}
            <div className="grid items-center py-2" style={{ gridTemplateColumns: "1fr 155px", gap: "8px" }}>
              <span className="text-xs" style={{ color: "#9A9490" }}>税率（来自利润表）</span>
              <span className="text-xs font-mono text-right" style={{ color: "#7A7A7A" }}>{pf(form.taxRatePct).toFixed(1)}%</span>
            </div>
          </Card>
        )}

        {/* ── 模拟结果条 */}
        {hasProducts && calc.simRevMonthly > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "月营收", value: fmt(calc.simRevMonthly) },
              { label: "年营收", value: fmt(calc.simRevAnnual) },
              { label: "年度税后净利润（PAT）", value: fmt(calc.simPAT), gold: true },
              { label: "月销量合计", value: calc.totalMonthlyUnits.toLocaleString() + " 件" },
            ].map((d, i) => (
              <div key={i} className="rounded-2xl px-4 py-3" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <p className="text-xs mb-1" style={{ color: "#9A9490" }}>{d.label}</p>
                <p className="text-sm font-bold font-mono break-all" style={{ color: d.gold ? "#C9A84C" : "#2B2B2B" }}>{d.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── 当前阶段达标分析 */}
        {hasProducts && calc.currentStagePat > 0 && (
          <GapCard
            stageLabel="当前阶段"
            stageName={form.currentStageName}
            targetPAT={calc.currentStagePat}
            simPAT={calc.simPAT}
            simRevMonthly={calc.simRevMonthly}
            totalMonthlyUnits={calc.totalMonthlyUnits}
            varPct={calc.varPct}
            taxFactor={calc.taxFactor}
            fixedMonthly={calc.fixedMonthly}
          />
        )}

        {/* ── 下一阶段达标分析 */}
        {hasProducts && calc.nextStagePat > 0 && (
          <GapCard
            stageLabel="下一阶段"
            stageName={form.nextStageName}
            targetPAT={calc.nextStagePat}
            simPAT={calc.simPAT}
            simRevMonthly={calc.simRevMonthly}
            totalMonthlyUnits={calc.totalMonthlyUnits}
            varPct={calc.varPct}
            taxFactor={calc.taxFactor}
            fixedMonthly={calc.fixedMonthly}
          />
        )}

        {/* ── 手动设定阶段目标 */}
        <Card>
          <SLabel>手动设定阶段目标（可覆盖导入数据）</SLabel>
          {([
            { label: "当前阶段名称", field: "currentStageName" as keyof T04Form, isText: true },
            { label: "当前阶段目标税后净利润（PAT）", field: "currentStagePat" as keyof T04Form, prefix: "RM" },
            { label: "下一阶段名称", field: "nextStageName" as keyof T04Form, isText: true },
            { label: "下一阶段目标税后净利润（PAT）", field: "nextStagePat" as keyof T04Form, prefix: "RM" },
          ] as { label: string; field: keyof T04Form; prefix?: string; isText?: boolean }[]).map(({ label, field, prefix, isText }) => (
            <div key={field} className="grid items-center py-2"
              style={{ gridTemplateColumns: "1fr 155px", borderBottom: "1px solid #F0EBE0", gap: "8px" }}>
              <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
              <div className="relative">
                {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{prefix}</span>}
                <input
                  type={isText ? "text" : "number"}
                  value={String(form[field] ?? "")}
                  onChange={e => setF(field)(e.target.value as T04Form[typeof field])}
                  className="w-full py-1.5 rounded-lg text-xs outline-none font-mono"
                  style={{
                    backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B",
                    paddingLeft: prefix ? "2rem" : "0.5rem", paddingRight: "0.5rem",
                    textAlign: isText ? "left" : "right",
                  }}
                  onFocus={e => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                  onBlur={e => (e.target.style.borderColor = "#E8DFCF")}
                />
              </div>
            </div>
          ))}
        </Card>

      </div>
    </ToolShell>
  );
}
