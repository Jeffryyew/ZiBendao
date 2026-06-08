"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

interface T02Form {
  // Current Assets
  cash: string;
  accountsReceivable: string;
  inventory: string;
  otherCurrentAssets: string;
  // Fixed Assets
  equipment: string;
  property: string;
  otherFixedAssets: string;
  // Current Liabilities
  accountsPayable: string;
  shortTermLoans: string;
  // Long-term Liabilities
  longTermLoans: string;
  otherLongTermLiab: string;
  // Equity
  paidUpCapital: string;
  retainedEarnings: string;
}

const DEFAULT_FORM: T02Form = {
  cash: "80000",
  accountsReceivable: "40000",
  inventory: "30000",
  otherCurrentAssets: "0",
  equipment: "100000",
  property: "200000",
  otherFixedAssets: "0",
  accountsPayable: "25000",
  shortTermLoans: "50000",
  longTermLoans: "120000",
  otherLongTermLiab: "0",
  paidUpCapital: "200000",
  retainedEarnings: "55000",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "资产负债表的资本视角",
    body: "这个工具不只是帮你记账，而是帮你看清楚：从投资人的角度，你的企业值多少，能承受多少融资，还有什么需要改善。",
  },
  {
    title: "第一步：填入资产",
    body: "填入企业的流动资产（现金、应收账款、存货）和固定资产（设备、物业）。这是你的企业「有什么」的完整画面。",
  },
  {
    title: "第二步：填入负债与权益",
    body: "填入短期和长期负债，以及股东权益（实收资本 + 留存收益）。权益 = 属于股东的净值，是融资的基础。",
  },
  {
    title: "第三步：5 个资本化指标",
    body: "系统自动计算净资产、营运资本、负债杠杆、ROE 和综合融资准备度。每个指标都附有「投资人怎么看这个数字」的说明。",
  },
  {
    title: "第四步：ROE 来自利润表",
    body: "ROE（净资产回报率）需要净利润，系统会自动从利润表工具读取。如果还没填利润表，可以先手动输入参考值。",
  },
  {
    title: "第五步：融资准备度",
    body: "综合 4 个指标给出绿 / 黄 / 红信号，告诉你现在是否适合去融资，以及需要改善哪里。保存后数据会供后续估值和股权工具使用。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym = "RM"): string {
  const sign = n < 0 ? "-" : "";
  return sign + sym + " " + Math.abs(n).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function ratioFmt(n: number): string {
  return isFinite(n) && !isNaN(n) ? n.toFixed(2) + "x" : "N/A";
}

function pctFmt(n: number): string {
  return isFinite(n) && !isNaN(n) ? n.toFixed(1) + "%" : "N/A";
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#E8DFCF"}`,
      }}
    >
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>
      {children}
    </p>
  );
}

function InputRow({
  label,
  value,
  onChange,
  sym,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  sym: string;
}) {
  return (
    <div
      className="grid items-center py-1.5"
      style={{ gridTemplateColumns: "1fr 155px", borderBottom: "1px solid #E8DFCF", gap: "8px" }}
    >
      <span className="text-xs truncate" style={{ color: "#7A7A7A", minWidth: 0 }}>{label}</span>
      <div className="relative">
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none select-none"
          style={{ color: "#9A9490" }}
        >
          {sym}
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs text-right outline-none font-mono appearance-none"
          style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
        />
      </div>
    </div>
  );
}

function Subtotal({ label, value, sym, highlight = false }: { label: string; value: number; sym: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg mt-2"
      style={{
        backgroundColor: highlight ? "rgba(201,168,76,0.06)" : "#F8F6F1",
        border: `1px solid ${highlight ? "rgba(201,168,76,0.2)" : "#E8DFCF"}`,
      }}
    >
      <span className="text-xs font-semibold" style={{ color: highlight ? "#C9A84C" : "#A0A09A" }}>
        {label}
      </span>
      <span className="text-sm font-bold font-mono" style={{ color: highlight ? "#C9A84C" : "#2B2B2B" }}>
        {fmt(value, sym)}
      </span>
    </div>
  );
}

// ── Indicator card ──────────────────────────────────────────────────────────

type Signal = "green" | "yellow" | "red" | "neutral";

function IndicatorCard({
  label,
  value,
  signal,
  investorNote,
  hint,
}: {
  label: string;
  value: string;
  signal: Signal;
  investorNote: string;
  hint: string;
}) {
  const colors: Record<Signal, { text: string; bg: string; border: string }> = {
    green: { text: "#22C55E", bg: "rgba(34,197,94,0.05)", border: "rgba(34,197,94,0.2)" },
    yellow: { text: "#F0A445", bg: "rgba(240,164,69,0.05)", border: "rgba(240,164,69,0.2)" },
    red: { text: "#EF4444", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.2)" },
    neutral: { text: "#9A9490", bg: "#F8F6F1", border: "#E8DFCF" },
  };
  const c = colors[signal];
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "#9A9490" }}>{label}</span>
        <span className="text-xl font-bold font-mono" style={{ color: c.text }}>{value}</span>
      </div>
      <p className="text-xs leading-relaxed mb-1" style={{ color: "#7A7A7A" }}>{hint}</p>
      <p className="text-xs leading-relaxed" style={{ color: c.text, opacity: 0.9 }}>{investorNote}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function BalanceSheetTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T02Form>("balance-sheet");
  const [form, setForm] = useState<T02Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [manualPAT, setManualPAT] = useState("");
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);
  const sym = coreData?.currencySymbol ?? "RM";

  // Load saved data
  useEffect(() => {
    if (savedData && !loaded) {
      setForm(savedData);
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


  // Load FinancialCore (PAT from T01)
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
          .then((snap) => { if (snap?.data) setCoreData(snap.data as FinancialCore); })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const set = (field: keyof T02Form) => (v: string) =>
    setForm((p) => ({ ...p, [field]: v }));

  // ── Calculations ────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const pf = (f: keyof T02Form) => parseFloat(form[f]) || 0;

    const cash = pf("cash");
    const ar = pf("accountsReceivable");
    const inventory = pf("inventory");
    const otherCA = pf("otherCurrentAssets");
    const equipment = pf("equipment");
    const property = pf("property");
    const otherFA = pf("otherFixedAssets");
    const ap = pf("accountsPayable");
    const stLoans = pf("shortTermLoans");
    const ltLoans = pf("longTermLoans");
    const otherLT = pf("otherLongTermLiab");
    const capital = pf("paidUpCapital");
    const retained = pf("retainedEarnings");

    const currentAssets = cash + ar + inventory + otherCA;
    const fixedAssets = equipment + property + otherFA;
    const totalAssets = currentAssets + fixedAssets;

    const currentLiabilities = ap + stLoans;
    const longTermLiabilities = ltLoans + otherLT;
    const totalLiabilities = currentLiabilities + longTermLiabilities;

    const equity = capital + retained;
    const totalLiabEquity = totalLiabilities + equity;
    const diff = totalAssets - totalLiabEquity;
    const balanced = Math.abs(diff) < 1;

    // Capital indicators
    const netAssets = equity; // same as equity
    const workingCapital = currentAssets - currentLiabilities;
    const debtToEquity = equity !== 0 ? totalLiabilities / equity : Infinity;
    const currentRatio = currentLiabilities !== 0 ? currentAssets / currentLiabilities : Infinity;

    // PAT: from FinancialCore or manual
    const pat = coreData?.annualPAT ?? (parseFloat(manualPAT) || null);
    const roe = pat !== null && equity > 0 ? (pat / equity) * 100 : null;

    // Imbalance hint
    let imbalanceHint = "";
    if (!balanced) {
      if (totalAssets > totalLiabEquity) {
        imbalanceHint = `资产栏偏高 ${fmt(Math.abs(diff), sym)}，请检查资产类别是否填入重复。`;
      } else {
        imbalanceHint = `负债 + 权益栏偏高 ${fmt(Math.abs(diff), sym)}，请检查负债或权益是否多填。`;
      }
    }

    return {
      currentAssets, fixedAssets, totalAssets,
      currentLiabilities, longTermLiabilities, totalLiabilities,
      equity, totalLiabEquity, diff, balanced, imbalanceHint,
      netAssets, workingCapital, debtToEquity, currentRatio, pat, roe,
    };
  }, [form, coreData, manualPAT, sym]);

  // ── Standalone toolData localStorage auto-save (500ms debounce, no `loaded` guard) ──
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    if (calc.totalAssets === 0 && calc.totalLiabilities === 0) return; // skip blank
    const timer = setTimeout(() => {
      console.log(`[T02] auto-save to toolData | cid=${cid}`);
      saveToolData({
        companyId: cid,
        toolId: "T02",
        calculatedOutput: {
          totalAssets: calc.totalAssets,
          totalLiabilities: calc.totalLiabilities,
          totalEquity: calc.equity,
          debtToEquity: calc.debtToEquity,
          currentRatio: calc.currentRatio,
          cashBalance: parseFloat(form.cash) || 0,
          totalLoans: (parseFloat(form.shortTermLoans) || 0) + (parseFloat(form.longTermLoans) || 0),
        },
        currency: sym,
      });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc, sym]);

  // ── Signals ──────────────────────────────────────────────────────────────

  function netAssetsSignal(): Signal {
    if (calc.netAssets > 0) return "green";
    if (calc.netAssets === 0) return "yellow";
    return "red";
  }

  function workingCapitalSignal(): Signal {
    if (calc.workingCapital > 0) return "green";
    if (calc.workingCapital === 0) return "yellow";
    return "red";
  }

  function debtSignal(): Signal {
    if (!isFinite(calc.debtToEquity)) return "red";
    if (calc.debtToEquity < 1) return "green";
    if (calc.debtToEquity <= 2) return "yellow";
    return "red";
  }

  function roeSignal(): Signal {
    if (calc.roe === null) return "neutral";
    if (calc.roe >= 15) return "green";
    if (calc.roe >= 8) return "yellow";
    return "red";
  }

  // Overall fundraising readiness
  const signals: Signal[] = [netAssetsSignal(), workingCapitalSignal(), debtSignal(), roeSignal()].filter(s => s !== "neutral");
  const redCount = signals.filter(s => s === "red").length;
  const yellowCount = signals.filter(s => s === "yellow").length;
  const overallSignal: Signal = redCount >= 1 ? "red" : yellowCount >= 2 ? "yellow" : "green";

  const overallMessages: Record<Signal, { title: string; body: string }> = {
    green: {
      title: "财务结构稳健，具备融资基础",
      body: "净资产为正、营运资本充足、负债杠杆合理。建议配合利润表和估值工具，整理完整的融资材料。",
    },
    yellow: {
      title: "部分指标需改善",
      body: "财务结构基本可行，但部分指标偏弱。建议先改善标注黄色的指标，再正式接触投资人。",
    },
    red: {
      title: "财务结构需先修复",
      body: "存在净资产为负或营运资本严重不足等问题。投资人通常不会在这个阶段进场。建议先解决财务结构问题。",
    },
    neutral: { title: "", body: "" },
  };

  const signalColors: Record<Signal, { text: string; bg: string; border: string }> = {
    green: { text: "#22C55E", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.25)" },
    yellow: { text: "#F0A445", bg: "rgba(240,164,69,0.06)", border: "rgba(240,164,69,0.25)" },
    red: { text: "#EF4444", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.25)" },
    neutral: { text: "#9A9490", bg: "#F8F6F1", border: "#E8DFCF" },
  };

  const oc = signalColors[overallSignal];

  // Save handler — also publishes to FinancialCore
  async function handleSave() {
    await save(form);
    // Publish to FinancialCore
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
        toolId: "T02",
        calculatedOutput: {
          totalAssets: calc.totalAssets,
          totalLiabilities: calc.totalLiabilities,
          totalEquity: calc.equity,
          debtToEquity: calc.debtToEquity,
          currentRatio: calc.currentRatio,
          cashBalance: parseFloat(form.cash) || 0,
          totalLoans: (parseFloat(form.shortTermLoans) || 0) + (parseFloat(form.longTermLoans) || 0),
        },
        currency: sym,
      });
      const existing = await fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`).then(r => r.json());
      const core = existing?.data ?? {};
      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId,
          data: {
            ...core,
            totalAssets: calc.totalAssets,
            totalLiabilities: calc.totalLiabilities,
            totalEquity: calc.equity,
            debtToEquity: calc.debtToEquity,
            currentRatio: calc.currentRatio,
            cashBalance: parseFloat(form.cash) || 0,
            totalLoans: (parseFloat(form.shortTermLoans) || 0) + (parseFloat(form.longTermLoans) || 0),
            updatedBy: { ...(core.updatedBy ?? {}), "balance-sheet": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="balance-sheet" steps={GUIDE_STEPS} />;

  return (
    <ToolShell
      icon=""
      title={isEn ? "Balance Sheet" : "资产负债表"}
      desc={isEn ? "Capital readiness assessment from your balance sheet" : "从资产负债表评估资本化准备度"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* Balance check */}
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{
            backgroundColor: calc.balanced ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
            border: `1px solid ${calc.balanced ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <p className="text-sm" style={{ color: calc.balanced ? "#22C55E" : "#EF4444" }}>
            {calc.balanced
              ? "资产负债表已平衡（资产 = 负债 + 权益）"
              : calc.imbalanceHint}
          </p>
        </div>

        {/* Input columns */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Assets */}
          <Card>
            <Label>资产</Label>
            <p className="text-xs font-semibold mb-2" style={{ color: "#2B2B2B" }}>流动资产</p>
            <InputRow label="现金及银行存款" value={form.cash} onChange={set("cash")} sym={sym} />
            <InputRow label="应收账款" value={form.accountsReceivable} onChange={set("accountsReceivable")} sym={sym} />
            <InputRow label="存货" value={form.inventory} onChange={set("inventory")} sym={sym} />
            <InputRow label="其他流动资产" value={form.otherCurrentAssets} onChange={set("otherCurrentAssets")} sym={sym} />
            <Subtotal label="流动资产合计" value={calc.currentAssets} sym={sym} />

            <p className="text-xs font-semibold mt-4 mb-2" style={{ color: "#2B2B2B" }}>固定资产</p>
            <InputRow label="设备" value={form.equipment} onChange={set("equipment")} sym={sym} />
            <InputRow label="物业" value={form.property} onChange={set("property")} sym={sym} />
            <InputRow label="其他固定资产" value={form.otherFixedAssets} onChange={set("otherFixedAssets")} sym={sym} />
            <Subtotal label="固定资产合计" value={calc.fixedAssets} sym={sym} />
            <Subtotal label="总资产" value={calc.totalAssets} sym={sym} highlight />
          </Card>

          {/* Liabilities + Equity */}
          <Card>
            <Label>负债 + 权益</Label>
            <p className="text-xs font-semibold mb-2" style={{ color: "#2B2B2B" }}>短期负债</p>
            <InputRow label="应付账款" value={form.accountsPayable} onChange={set("accountsPayable")} sym={sym} />
            <InputRow label="短期贷款" value={form.shortTermLoans} onChange={set("shortTermLoans")} sym={sym} />
            <Subtotal label="短期负债合计" value={calc.currentLiabilities} sym={sym} />

            <p className="text-xs font-semibold mt-4 mb-2" style={{ color: "#2B2B2B" }}>长期负债</p>
            <InputRow label="长期贷款" value={form.longTermLoans} onChange={set("longTermLoans")} sym={sym} />
            <InputRow label="其他长期负债" value={form.otherLongTermLiab} onChange={set("otherLongTermLiab")} sym={sym} />
            <Subtotal label="负债合计" value={calc.totalLiabilities} sym={sym} />

            <p className="text-xs font-semibold mt-4 mb-2" style={{ color: "#2B2B2B" }}>股东权益</p>
            <InputRow label="实收资本" value={form.paidUpCapital} onChange={set("paidUpCapital")} sym={sym} />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <InputRow label="留存收益" value={form.retainedEarnings} onChange={set("retainedEarnings")} sym={sym} />
              </div>
              {coreData?.annualPAT !== undefined && (
                <button
                  onClick={() => set("retainedEarnings")(String(Math.round(coreData.annualPAT!)))}
                  className="text-xs px-2 py-1 rounded-lg flex-shrink-0 transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                >
                  从利润表导入
                </button>
              )}
            </div>
            <Subtotal label="净资产（股东权益）" value={calc.equity} sym={sym} />
            <Subtotal label="负债及权益总计" value={calc.totalLiabEquity} sym={sym} highlight />
          </Card>
        </div>

        {/* 5 capital indicators */}
        <Card accent>
          <Label>5 项资本化指标</Label>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <IndicatorCard
              label="净资产（可投资基础）"
              value={fmt(calc.netAssets, sym)}
              signal={netAssetsSignal()}
              hint="总资产 − 总负债"
              investorNote={calc.netAssets > 0 ? "正值，具备股权融资基础。" : "负值，需先补充资本才能融资。"}
            />
            <IndicatorCard
              label="营运资本（短期存活能力）"
              value={fmt(calc.workingCapital, sym)}
              signal={workingCapitalSignal()}
              hint="流动资产 − 短期负债"
              investorNote={calc.workingCapital > 0 ? "短期资金充裕，运营稳定。" : "短期资金紧张，投资人会关注现金流。"}
            />
            <IndicatorCard
              label="负债杠杆"
              value={ratioFmt(calc.debtToEquity)}
              signal={debtSignal()}
              hint="总负债 ÷ 净资产"
              investorNote={
                !isFinite(calc.debtToEquity) ? "净资产为零，无法计算。"
                : calc.debtToEquity < 1 ? "杠杆健康，融资空间充足。"
                : calc.debtToEquity <= 2 ? "杠杆适中，需说明偿债能力。"
                : "杠杆偏高，投资人可能要求先降债。"
              }
            />
            <div className="rounded-2xl p-5"
              style={{
                backgroundColor: roeSignal() === "neutral" ? "#F8F6F1" : roeSignal() === "green" ? "rgba(34,197,94,0.05)" : roeSignal() === "yellow" ? "rgba(240,164,69,0.05)" : "rgba(239,68,68,0.05)",
                border: `1px solid ${roeSignal() === "neutral" ? "#E8DFCF" : roeSignal() === "green" ? "rgba(34,197,94,0.2)" : roeSignal() === "yellow" ? "rgba(240,164,69,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#9A9490" }}>ROE（净资产回报率）</span>
                <span className="text-xl font-bold font-mono" style={{ color: roeSignal() === "neutral" ? "#A0A09A" : roeSignal() === "green" ? "#22C55E" : roeSignal() === "yellow" ? "#F0A445" : "#EF4444" }}>
                  {calc.roe !== null ? pctFmt(calc.roe) : "—"}
                </span>
              </div>
              <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>净利润 ÷ 净资产</p>
              {calc.roe !== null ? (
                <p className="text-xs" style={{ color: roeSignal() === "green" ? "#22C55E" : roeSignal() === "yellow" ? "#F0A445" : "#EF4444" }}>
                  {calc.roe >= 15 ? "回报率优秀，投资人青睐。" : calc.roe >= 8 ? "回报率尚可，有提升空间。" : "回报率偏低，投资人会要求解释。"}
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-xs" style={{ color: "#2B2B2B" }}>请先完成利润表，或手动输入：</p>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="年净利润"
                      value={manualPAT}
                      onChange={(e) => setManualPAT(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs outline-none font-mono"
                      style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>RM</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Fundraising readiness */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ backgroundColor: oc.bg, border: `1px solid ${oc.border}` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: oc.text }}>
                融资准备度：{overallMessages[overallSignal].title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                {overallMessages[overallSignal].body}
              </p>
            </div>
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ backgroundColor: oc.border, color: oc.text }}
            >
              {overallSignal === "green" ? "A" : overallSignal === "yellow" ? "B" : "C"}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#2B2B2B" }}>
            {saving ? "正在保存..." : lastSaved ? `已自动保存 ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
        </div>

      </div>
    </ToolShell>
  );
}
