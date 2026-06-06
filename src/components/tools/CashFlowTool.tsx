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
  ReferenceLine,
  Cell,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

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
    title: "简单模式 vs 详细模式",
    body: "简单模式适合年度规划和快速评估，填入每类现金流的年度总额。详细模式提供 12 个月的逐月输入，适合现金流紧张或计划融资的企业，能准确算出资金缺口和最低点。",
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
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + "M";
  if (abs >= 1_000) return sign + (abs / 1_000).toFixed(0) + "K";
  return sign + abs.toString();
}

type Signal = "green" | "yellow" | "red" | "neutral";

const SIG_COLORS: Record<Signal, { text: string; bg: string; border: string }> = {
  green: { text: "#22C55E", bg: "rgba(34,197,94,0.05)", border: "rgba(34,197,94,0.2)" },
  yellow: { text: "#F0A445", bg: "rgba(240,164,69,0.05)", border: "rgba(240,164,69,0.2)" },
  red: { text: "#EF4444", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.2)" },
  neutral: { text: "#A0A09A", bg: "#141414", border: "#2A2A2A" },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: "#141414",
        border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#1E1E1E"}`,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-mono mb-3" style={{ color: "#555550" }}>
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
      className="flex items-center gap-3 py-1.5"
      style={{ borderBottom: "1px solid #1A1A1A" }}
    >
      <span className="flex-1 text-xs" style={{ color: "#888880" }}>
        {label}
      </span>
      <div className="relative w-36 flex-shrink-0">
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none"
          style={{ color: "#555550" }}
        >
          {sym}
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{
            backgroundColor: "#0D0D0D",
            border: "1px solid #2A2A2A",
            color: "#F5F5F0",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
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
        backgroundColor: highlight ? "rgba(201,168,76,0.06)" : "#1A1A1A",
        border: `1px solid ${highlight ? "rgba(201,168,76,0.2)" : "#252525"}`,
      }}
    >
      <span className="text-xs font-semibold" style={{ color: highlight ? "#C9A84C" : "#A0A09A" }}>
        {label}
      </span>
      <span
        className="text-sm font-bold font-mono"
        style={{ color: highlight ? "#C9A84C" : isNeg ? "#EF4444" : "#F5F5F0" }}
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
}: {
  label: string;
  value: string;
  signal: Signal;
  note: string;
}) {
  const c = SIG_COLORS[signal];
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "#A0A09A" }}>{label}</span>
        <span className="text-xl font-bold font-mono" style={{ color: c.text }}>{value}</span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: c.text, opacity: 0.85 }}>{note}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function CashFlowTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T03Form>("cash-flow");
  const [form, setForm] = useState<T03Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);

  // Load saved data
  useEffect(() => {
    if (savedData && !loaded) {
      const merged: T03Form = {
        ...DEFAULT_FORM,
        ...savedData,
        months:
          savedData.months && savedData.months.length === 12
            ? savedData.months
            : makeDefaultMonths(),
      };
      setForm(merged);
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // Load FinancialCore
  useEffect(() =