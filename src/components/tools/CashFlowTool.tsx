"use client";

import { useState, useRef, useMemo, useEffect } from "react";
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
import CashFlowErrorBoundary from "@/components/tools/CashFlowErrorBoundary";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";

// ── Types ──────────────────────────────────────────────────────────────────

interface MonthData {
  operatingCF: string;
  investingCF: string;
  financingCF: string;
}

interface T03Form {
  inputMode: "simple" | "detailed";
  currencySymbol: string;
  openingCash: string;
  // Simple mode
  operatingInflow: string;
  operatingOutflow: string;
  investingInflow: string;
  investingOutflow: string;
  financingInflow: string;
  financingOutflow: string;
  // Detailed mode
  months: MonthData[];
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function makeDefaultMonths(): MonthData[] {
  return MONTH_LABELS.map(() => ({ operatingCF: "0", investingCF: "0", financingCF: "0" }));
}

const DEFAULT_FORM: T03Form = {
  inputMode: "simple",
  currencySymbol: "RM",
  openingCash: "100000",
  operatingInflow: "500000",
  operatingOutflow: "420000",
  investingInflow: "0",
  investingOutflow: "80000",
  financingInflow: "200000",
  financingOutflow: "50000",
  months: makeDefaultMonths(),
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "现金流是企业生存的命脉",
    body: "利润是账面数字，现金是真实的资源。一家账面盈利的企业可以因为现金流断裂而倒闭。这个工具帮你规划和监控资金进出，找到融资的最佳时机。",
  },
  {
    title: "三大现金流类别",
    body: "经营活动现金流：日常营业产生和消耗的现金。投资活动现金流：购买设备、扩张等资本支出。融资活动现金流：银行贷款、股权融资和还款。三者相加是净现金流。",
  },
  {
    title: "年度规划与快速评估",
    body: "填入每类现金流的年度总额，系统自动计算年末现金、跑道期和融资时机信号，帮助你快速掌握全年资金健康状况。",
  },
  {
    title: "关键指标：燃烧率与跑道期",
    body: "燃烧率 = 每月净现金消耗。跑道期 = 现有现金 ÷ 月燃烧率。跑道期代表企业在不融资的情况下还能运营多久。投资人通常要求公司在跑道耗尽前至少 6 个月就开始融资。",
  },
  {
    title: "现金缺口与融资信号",
    body: "当年末现金为负或跑道期低于 6 个月，系统会显示融资警示。这不是坏消息，而是提前规划融资的信号。带着清晰的现金流计划去融资，比资金耗尽后再融资，成功率高出数倍。",
  },
  {
    title: "与其他工具联动",
    body: "经营活动现金流可从利润表（T01）导入参考值。保存后，期初/年末现金数据会同步至其他资本工具，用于估值计算和融资规划。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  const abs = Math.abs(n);
  const str = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + sym + " " + str;
}

function fmtShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(1) + "B";
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(0) + "K";
  return sign + abs.toString();
}

type Signal = "green" | "yellow" | "red" | "neutral";

const SIG_COLORS: Record<Signal, { text: string; bg: string; border: string }> = {
  green: { text: "#3D7A41", bg: "rgba(61,122,65,0.06)", border: "rgba(61,122,65,0.2)" },
  yellow: { text: "#C9863A", bg: "rgba(201,134,58,0.06)", border: "rgba(201,134,58,0.2)" },
  red: { text: "#B05050", bg: "rgba(176,80,80,0.06)", border: "rgba(176,80,80,0.2)" },
  neutral: { text: "#9A9490", bg: "#F8F6F1", border: "#E8DFCF" },
};

// Full number formatter for chart Y-axis (no K/M)
function fmtAxis(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return sign + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
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

function SectionLabel({ children }: { children: React.ReactNode }) {
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  sym: string;
  placeholder?: string;
}) {
  return (
    <div
      className="grid items-center py-1.5"
      style={{ gridTemplateColumns: "1fr 155px", borderBottom: "1px solid #E8DFCF", gap: "8px" }}
    >
      <span className="text-xs" style={{ color: "#7A7A7A", minWidth: 0, whiteSpace: "nowrap", overflow: "visible" }}>
        {label}
      </span>
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
          placeholder={placeholder ?? "0"}
          className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs text-right outline-none font-mono appearance-none"
          style={{
            backgroundColor: "#F8F6F1",
            border: "1px solid #E8DFCF",
            color: "#2B2B2B",
          }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
        />
      </div>
    </div>
  );
}

function Subtotal({
  label,
  value,
  sym,
  highlight,
}: {
  label: string;
  value: number;
  sym: string;
  highlight?: boolean;
}) {
  const isNeg = value < 0;
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
      <span
        className="text-sm font-bold font-mono"
        style={{ color: highlight ? "#C9A84C" : isNeg ? "#B05050" : "#2B2B2B" }}
      >
        {fmt(value, sym)}
      </span>
    </div>
  );
}

function IndicatorCard({
  label,
  value,
  signal,
  note,
  formula,
}: {
  label: string;
  value: string;
  signal: Signal;
  note: string;
  formula?: string;
}) {
  const c = SIG_COLORS[signal] ?? SIG_COLORS["neutral"];
  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, minHeight: "152px" }}
    >
      <p className="font-bold font-mono leading-tight break-all" style={{
        color: c.text,
        fontSize: value.length > 14 ? "0.8rem" : value.length > 10 ? "0.95rem" : "1.125rem",
        lineHeight: 1.2,
      }}>{value}</p>
      <p className="text-xs font-semibold mt-2" style={{ color: "#9A9490" }}>{label}</p>
      {formula && <p className="text-xs mt-1 font-mono" style={{ color: "#B0AA9A" }}>{formula}</p>}
      <p className="text-xs mt-2" style={{ color: c.text }}>{note}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

function CashFlowToolInner({ locale }: { locale: "zh" | "en" }) {
  const { savedData, save } = useToolSnapshot<T03Form>("cash-flow");
  const [form, setForm] = useState<T03Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);

  // Load saved data — localStorage primary (instant), DB secondary
  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const lsSaved = loadToolData(cid, "T03") ?? loadToolData("__default__", "T03");
    if (lsSaved?.inputData) {
      const saved = lsSaved.inputData as Partial<T03Form>;
      const merged: T03Form = {
        ...DEFAULT_FORM,
        ...saved,
        months:
          saved.months && (saved.months as MonthData[]).length === 12
            ? (saved.months as MonthData[])
            : makeDefaultMonths(),
      };
      setForm({ ...merged, inputMode: "simple" });
      setLoaded(true);
      return;
    }
    if (savedData) {
      const merged: T03Form = {
        ...DEFAULT_FORM,
        ...savedData,
        inputMode: "simple",
        months:
          savedData.months && savedData.months.length === 12
            ? savedData.months
            : makeDefaultMonths(),
      };
      setForm(merged);
      setLoaded(true);
      return;
    }
    // Fallback: if no saved data found, enable auto-save after 1.5s
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, [savedData, loaded]);

  // ── Auto-save (1.5s debounce) ─────────────────────────────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, loaded]);


  // Load FinancialCore + T01/T02 data
  const [t01Data, setT01Data] = useState<Record<string, number> | null>(null);
  const [t02Data, setT02Data] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    // T01
    const ls1 = loadToolData(cid, "T01");
    if (ls1?.calculatedOutput) setT01Data(ls1.calculatedOutput as Record<string, number>);
    // T02
    const ls2 = loadToolData(cid, "T02");
    if (ls2?.calculatedOutput) setT02Data(ls2.calculatedOutput as Record<string, number>);
    // FinancialCore from DB
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`)
      .then((r) => r.json())
      .then((snap) => { if (snap?.data) setCoreData(snap.data as FinancialCore); })
      .catch(() => {});
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";

  function setField<K extends keyof T03Form>(field: K) {
    return (v: T03Form[K]) => setForm((p) => ({ ...p, [field]: v }));
  }

  // ── Import from T01 (Income Statement) ───────────────────────────────────
  function importFromT01() {
    const cid = getCompanyId();
    const t01 = loadToolData(cid, "T01");
    const out = t01?.calculatedOutput as Record<string, number> | undefined ?? t01Data;
    if (!out) return;
    const revenue = out.annualRevenue ?? 0;
    const pat = out.pat ?? 0;
    const costs = Math.max(0, revenue - pat);
    setForm((p) => ({
      ...p,
      operatingInflow: String(Math.round(revenue)),
      operatingOutflow: String(Math.round(costs)),
    }));
  }

  // ── Import from T02 (Balance Sheet) ──────────────────────────────────────
  function importFromT02() {
    const cid = getCompanyId();
    const t02 = loadToolData(cid, "T02");
    const out = t02?.calculatedOutput as Record<string, number> | undefined ?? t02Data;
    if (!out) return;
    if (out.cashBalance !== undefined) {
      setForm((p) => ({ ...p, openingCash: String(Math.round(out.cashBalance)) }));
    }
  }

  function importFromCore() {
    importFromT01();
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const pf = (v: string) => parseFloat(v) || 0;
    const opening = pf(form.openingCash);

    {
      const opIn = pf(form.operatingInflow);
      const opOut = pf(form.operatingOutflow);
      const invIn = pf(form.investingInflow);
      const invOut = pf(form.investingOutflow);
      const finIn = pf(form.financingInflow);
      const finOut = pf(form.financingOutflow);

      const opCF = opIn - opOut;
      const invCF = invIn - invOut;
      const finCF = finIn - finOut;
      const netCF = opCF + invCF + finCF;
      const closing = opening + netCF;

      const monthlyBurn = opCF < 0 ? Math.abs(opCF / 12) : 0;
      const runway = monthlyBurn > 0 && closing > 0 ? Math.floor(closing / monthlyBurn) : Infinity;

      return {
        mode: "simple" as const,
        opening,
        opCF,
        invCF,
        finCF,
        netCF,
        closing,
        monthlyBurn,
        runway,
        chartData: [
          { label: "期初现金", value: opening, isBalance: true },
          { label: "经营活动", value: opCF, isBalance: false },
          { label: "投资活动", value: invCF, isBalance: false },
          { label: "融资活动", value: finCF, isBalance: false },
          { label: "年末现金", value: closing, isBalance: true },
        ],
        monthlyData: [] as {
          label: string;
          opCF: number;
          invCF: number;
          finCF: number;
          netCF: number;
          balance: number;
        }[],
        breakEvenMonth: null as number | null,
        lowestCash: closing,
        lowestCashMonth: null as string | null,
      };
    }
  }, [form]);

  // ── Standalone toolData localStorage auto-save ──
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    if (!calc || calc.closing === 0) return;
    const timer = setTimeout(() => {
      console.log(`[T03] auto-save to toolData | cid=${cid}`);
      saveToolData({
        companyId: cid,
        toolId: "T03",
        calculatedOutput: {
          yearEndCash: calc.closing,
          openingCash: calc.opening,
          netOperatingCashFlow: calc.opCF,
        },
        currency: sym,
      });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc, sym]);

  // ── Signals ────────────────────────────────────────────────────────────────

  function closingSignal(): Signal {
    if (calc.closing <= 0) return "red";
    if (calc.closing < calc.opening * 0.5) return "yellow";
    return "green";
  }

  function runwaySignal(): Signal {
    if (!isFinite(calc.runway)) return "green";
    if (calc.runway > 12) return "green";
    if (calc.runway >= 6) return "yellow";
    return "red";
  }

  function netCFSignal(): Signal {
    if (calc.netCF > 0) return "green";
    if (calc.netCF >= -calc.opening * 0.1) return "yellow";
    return "red";
  }

  const overallSignal: Signal =
    runwaySignal() === "red" || closingSignal() === "red"
      ? "red"
      : runwaySignal() === "yellow" || closingSignal() === "yellow"
      ? "yellow"
      : "green";

  const oc = SIG_COLORS[overallSignal];

  const fundraisingMessages: Record<Signal, string> = {
    green: "现金流稳健，无需紧急融资。建议继续积累，在最佳时机主动融资。",
    yellow: "跑道期不足 12 个月，建议现在开始准备融资材料，6 个月内完成首轮接触。",
    red: "现金流严峻，需立即采取行动：削减非必要支出，并启动紧急融资流程。",
    neutral: "",
  };

  // ── Save handler ──────────────────────────────────────────────────────────

  async function handleSave() {
    const companyId = getCompanyId();
    if (companyId === "__default__") { await save(form); return; }
    // Save inputData to localStorage (primary, instant)
    saveToolData({
      companyId,
      toolId: "T03",
      inputData: form as unknown as Record<string, unknown>,
      calculatedOutput: {
        yearEndCash: calc.closing,
        openingCash: calc.opening,
        netOperatingCashFlow: calc.opCF,
        netCF: calc.netCF,
        monthlyBurn: calc.monthlyBurn,
        runway: isFinite(calc.runway) ? calc.runway : 9999,
      },
      currency: sym,
    });
    // Save to DB (secondary)
    await save(form);
    try {
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
            openingCash: calc.opening,
            yearEndCash: calc.closing,
            currencySymbol: sym,
            updatedBy: { ...(core.updatedBy ?? {}), "cash-flow": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="cash-flow" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Cash Flow Planning" : "现金流规划"}
      desc={
        locale === "en"
          ? "Plan cash flow, track runway and fundraising timing"
          : "规划现金进出、追踪跑道期与融资时机"
      }
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Settings ──────────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>基础设置</SectionLabel>
          {/* Opening cash */}
          <InputRow
            label="期初现金余额"
            value={form.openingCash}
            onChange={setField("openingCash")}
            sym={sym}
          />

          {/* Import buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={importFromT01}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
              title={t01Data ? `营业收入 ${fmt(t01Data.annualRevenue ?? 0, sym)}` : "请先填写利润表（T01）"}
            >
              从利润表导入
            </button>
            <button
              onClick={importFromT02}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(107,155,210,0.1)", border: "1px solid rgba(107,155,210,0.3)", color: "#5A8AC0" }}
              title={t02Data ? `资产负债表现金 ${fmt(t02Data.cashBalance ?? 0, sym)}` : "请先填写资产负债表（T02）"}
            >
              从企业数据导入
            </button>
            {(t01Data?.annualRevenue || t02Data?.cashBalance) && (
              <span className="text-xs self-center" style={{ color: "#9A9490" }}>
                {t01Data?.annualRevenue ? `T01营收 ${fmt(t01Data.annualRevenue, sym)}` : ""}
                {t01Data?.annualRevenue && t02Data?.cashBalance ? " · " : ""}
                {t02Data?.cashBalance ? `T02现金 ${fmt(t02Data.cashBalance, sym)}` : ""}
              </span>
            )}
          </div>
        </Card>

        {/* ── Annual inputs ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">
            <Card>
              <SectionLabel>经营活动现金流</SectionLabel>
              <InputRow
                label="收取客户款项"
                value={form.operatingInflow}
                onChange={setField("operatingInflow")}
                sym={sym}
              />
              <InputRow
                label="支付供应商及员工"
                value={form.operatingOutflow}
                onChange={setField("operatingOutflow")}
                sym={sym}
              />
              <Subtotal label="经营净现金流" value={calc.opCF} sym={sym} highlight={calc.opCF > 0} />
            </Card>

            <Card>
              <SectionLabel>投资活动现金流</SectionLabel>
              <InputRow
                label="资产出售 / 收回投资"
                value={form.investingInflow}
                onChange={setField("investingInflow")}
                sym={sym}
              />
              <InputRow
                label="资本支出"
                value={form.investingOutflow}
                onChange={setField("investingOutflow")}
                sym={sym}
              />
              <Subtotal label="投资净现金流" value={calc.invCF} sym={sym} />
            </Card>

            <Card>
              <SectionLabel>融资活动现金流</SectionLabel>
              <InputRow
                label="贷款 / 股权融资"
                value={form.financingInflow}
                onChange={setField("financingInflow")}
                sym={sym}
              />
              <InputRow
                label="还款 / 股息派发"
                value={form.financingOutflow}
                onChange={setField("financingOutflow")}
                sym={sym}
              />
              <Subtotal label="融资净现金流" value={calc.finCF} sym={sym} />
            </Card>
        </div>

        {/* ── Summary totals ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <Subtotal label="经营净现金流" value={calc.opCF} sym={sym} />
          <Subtotal label="投资净现金流" value={calc.invCF} sym={sym} />
          <Subtotal label="融资净现金流" value={calc.finCF} sym={sym} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Subtotal label="年度净现金流" value={calc.netCF} sym={sym} highlight />
          <Subtotal label="年末现金余额" value={calc.closing} sym={sym} highlight />
        </div>

        {/* ── Chart ──────────────────────────────────────────────────────── */}
        <Card>
          <SectionLabel>现金流瀑布图</SectionLabel>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                  data={calc.chartData}
                  margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#7A7A7A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#7A7A7A", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtAxis}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#F8F6F1",
                      border: "1px solid #E8DFCF",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#9A9490" }}
                    formatter={(v: number) => [fmt(v, sym), ""]}
                  />
                  <ReferenceLine y={0} stroke="#E8DFCF" />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {calc.chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.isBalance
                            ? "#C9A84C"
                            : entry.value >= 0
                            ? "#4A8A50"
                            : "#B05050"
                        }
                        fillOpacity={0.85}
                      />
                    ))}
                  </Bar>
                </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* ── Capital indicators ─────────────────────────────────────────── */}
        <Card accent>
          <SectionLabel>资本化指标</SectionLabel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <IndicatorCard
              label="营运资金"
              value={t02Data?.workingCapital !== undefined ? fmt(t02Data.workingCapital, sym) : "—"}
              formula="流动资产 − 流动负债"
              signal={
                t02Data?.workingCapital === undefined
                  ? "neutral"
                  : t02Data.workingCapital > 0
                  ? "green"
                  : t02Data.workingCapital < 0
                  ? "red"
                  : "yellow"
              }
              note={
                t02Data?.workingCapital === undefined
                  ? "请先完成资产负债表（T02）。"
                  : t02Data.workingCapital > 0
                  ? "营运资金充足，短期偿债能力良好。"
                  : "营运资金为负，流动性风险较高。"
              }
            />
            <IndicatorCard
              label="年末现金余额"
              value={fmt(calc.closing, sym)}
              formula="期初现金 + 年度净现金流"
              signal={closingSignal()}
              note={
                calc.closing > 0
                  ? calc.closing >= calc.opening * 0.5
                    ? "现金储备充足，运营安全。"
                    : "现金余额偏低，建议关注。"
                  : "现金已耗尽，需立即融资。"
              }
            />
            <IndicatorCard
              label="年度净现金流"
              value={fmt(calc.netCF, sym)}
              formula="经营 + 投资 + 融资现金流"
              signal={netCFSignal()}
              note={
                calc.netCF > 0
                  ? "净流入，现金在积累。"
                  : calc.netCF >= -calc.opening * 0.1
                  ? "接近平衡，请控制支出。"
                  : "净流出，请检查各类支出。"
              }
            />
            <IndicatorCard
              label="月燃烧率"
              value={
                isFinite(calc.monthlyBurn) && calc.monthlyBurn > 0
                  ? fmt(calc.monthlyBurn, sym)
                  : "无消耗"
              }
              formula="月均净现金消耗"
              signal={
                calc.monthlyBurn <= 0
                  ? "green"
                  : calc.monthlyBurn > calc.closing / 6
                  ? "red"
                  : "yellow"
              }
              note={
                calc.monthlyBurn > 0
                  ? `每月净消耗 ${fmt(calc.monthlyBurn, sym)}，需监控现金储备。`
                  : "经营活动现金流为正，没有燃烧。"
              }
            />
            <IndicatorCard
              label="跑道期"
              value={
                !isFinite(calc.runway) || calc.runway <= 0
                  ? "充足"
                  : `${calc.runway} 个月`
              }
              formula="年末现金 ÷ 月燃烧率"
              signal={runwaySignal()}
              note={
                !isFinite(calc.runway)
                  ? "经营现金流为正，无跑道风险。"
                  : calc.runway > 12
                  ? `超过 12 个月跑道，融资无压力。`
                  : calc.runway >= 6
                  ? `${calc.runway} 个月跑道，建议提前启动融资。`
                  : `跑道不足 6 个月，融资为当务之急。`
              }
            />
          </div>

        </Card>

        {/* ── Fundraising signal ─────────────────────────────────────────── */}
        <div
          className="rounded-2xl px-5 py-4"
          style={{ backgroundColor: oc.bg, border: `1px solid ${oc.border}` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: oc.text }}>
                融资时机：
                {overallSignal === "green" && "现金流稳健"}
                {overallSignal === "yellow" && "建议开始规划融资"}
                {overallSignal === "red" && "需要立即行动"}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                {fundraisingMessages[overallSignal]}
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

        {/* ── Cash gap warning ───────────────────────────────────────────── */}
        {calc.closing < 0 && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{
              backgroundColor: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p className="text-sm" style={{ color: "#B05050" }}>
              年末现金为负（缺口 {fmt(Math.abs(calc.closing), sym)}）。企业需要在年末前通过融资或削减支出填补这一缺口，否则将无法维持正常运营。
            </p>
          </div>
        )}


      </div>
    </ToolShell>
  );
}

export default function CashFlowTool({ locale }: { locale: "zh" | "en" }) {
  return (
    <CashFlowErrorBoundary>
      <CashFlowToolInner locale={locale} />
    </CashFlowErrorBoundary>
  );
}
