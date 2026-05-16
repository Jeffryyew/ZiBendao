"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface BSForm {
  // Current Assets
  cash: string;
  accountsReceivable: string;
  inventory: string;
  // Fixed Assets
  equipment: string;
  property: string;
  // Current Liabilities
  accountsPayable: string;
  shortTermLoans: string;
  // Long-term Liabilities
  longTermLiabilities: string;
  // Equity
  paidUpCapital: string;
  retainedEarnings: string;
}

function fmtRm(n: number): string {
  return "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function ratioStr(n: number): string {
  return isFinite(n) && !isNaN(n) ? n.toFixed(2) + "x" : "N/A";
}

//  Reusable input row 
function InputRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <label className="flex-1 text-xs" style={{ color: "#888880" }}>
        {label}
      </label>
      <div className="relative w-36 flex-shrink-0">
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono"
          style={{ color: "#555550" }}
        >
          RM
        </span>
        <input
          type="number"
          value={value}
          onChange={onChange}
          className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
        />
      </div>
    </div>
  );
}

//  Section subtotal row 
function SectionTotal({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg mt-2"
      style={{
        backgroundColor: highlight ? "rgba(201,168,76,0.08)" : "#141414",
        border: `1px solid ${highlight ? "rgba(201,168,76,0.2)" : "#1A1A1A"}`,
      }}
    >
      <span
        className="text-xs font-semibold"
        style={{ color: highlight ? "#C9A84C" : "#A0A09A" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-bold font-mono"
        style={{ color: highlight ? "#C9A84C" : "#F5F5F0" }}
      >
        {fmtRm(value)}
      </span>
    </div>
  );
}

//  Section heading 
function SectionHeading({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold mt-4 mb-1.5" style={{ color: "#555550" }}>
      {label}
    </p>
  );
}

//  Main component 
export default function BalanceSheetTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<BSForm>({
    cash: "80000",
    accountsReceivable: "40000",
    inventory: "30000",
    equipment: "100000",
    property: "200000",
    accountsPayable: "25000",
    shortTermLoans: "50000",
    longTermLiabilities: "120000",
    paidUpCapital: "200000",
    retainedEarnings: "55000",
  });

  const set =
    (field: keyof BSForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const calc = useMemo(() => {
    const pf = (f: keyof BSForm) => parseFloat(form[f]) || 0;

    const cash = pf("cash");
    const ar = pf("accountsReceivable");
    const inventory = pf("inventory");
    const equipment = pf("equipment");
    const property = pf("property");
    const ap = pf("accountsPayable");
    const stLoans = pf("shortTermLoans");
    const ltLiab = pf("longTermLiabilities");
    const capital = pf("paidUpCapital");
    const retained = pf("retainedEarnings");

    const currentAssets = cash + ar + inventory;
    const fixedAssets = equipment + property;
    const totalAssets = currentAssets + fixedAssets;

    const currentLiabilities = ap + stLoans;
    const totalLiabilities = currentLiabilities + ltLiab;
    const equity = capital + retained;
    const totalLiabEquity = totalLiabilities + equity;

    const diff = totalAssets - totalLiabEquity;
    const balanced = Math.abs(diff) < 1;

    const debtToEquity = equity !== 0 ? totalLiabilities / equity : Infinity;
    const currentRatio = currentLiabilities !== 0 ? currentAssets / currentLiabilities : Infinity;
    const quickRatio = currentLiabilities !== 0 ? (cash + ar) / currentLiabilities : Infinity;

    return {
      cash, ar, inventory, equipment, property,
      ap, stLoans, ltLiab, capital, retained,
      currentAssets, fixedAssets, totalAssets,
      currentLiabilities, totalLiabilities, equity,
      totalLiabEquity, diff, balanced,
      debtToEquity, currentRatio, quickRatio,
    };
  }, [form]);

  return (
    <ToolShell
      icon=""
      title={isEn ? "Balance Sheet" : "资产负债表"}
      desc={isEn ? "Full balance sheet with financial ratio analysis" : "资产、负债、权益完整呈现，财务比率计算"}
      levelRequired={1}
      backHref="/student/dashboard"
    >
      <div className="space-y-6">
        {/* Balance validation banner */}
        {calc.balanced ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <span className="text-sm"></span>
            <p className="text-sm" style={{ color: "#22C55E" }}>
              {isEn ? "Balance sheet is balanced." : "资产负债表已平衡。"}
            </p>
          </div>
        ) : (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            <span className="text-sm"></span>
            <p className="text-sm" style={{ color: "#EF4444" }}>
              {isEn
                ? `Assets ≠ Liabilities + Equity. Difference: ${fmtRm(Math.abs(calc.diff))}`
                : `资产 ≠ 负债 + 权益。差额：${fmtRm(Math.abs(calc.diff))}`}
            </p>
          </div>
        )}

        {/* Two-column balance sheet */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Assets column */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-xs font-mono mb-2" style={{ color: "#666660" }}>
              {isEn ? "ASSETS / 资产" : "资产"}
            </p>

            <SectionHeading label={isEn ? "Current Assets" : "流动资产"} />
            <InputRow
              label={isEn ? "Cash & Bank" : "现金及银行存款"}
              value={form.cash}
              onChange={set("cash")}
            />
            <InputRow
              label={isEn ? "Accounts Receivable" : "应收账款"}
              value={form.accountsReceivable}
              onChange={set("accountsReceivable")}
            />
            <InputRow
              label={isEn ? "Inventory" : "存货"}
              value={form.inventory}
              onChange={set("inventory")}
            />
            <SectionTotal
              label={isEn ? "Total Current Assets" : "流动资产合计"}
              value={calc.currentAssets}
            />

            <SectionHeading label={isEn ? "Fixed Assets" : "固定资产"} />
            <InputRow
              label={isEn ? "Equipment" : "设备"}
              value={form.equipment}
              onChange={set("equipment")}
            />
            <InputRow
              label={isEn ? "Property" : "物业"}
              value={form.property}
              onChange={set("property")}
            />
            <SectionTotal
              label={isEn ? "Total Fixed Assets" : "固定资产合计"}
              value={calc.fixedAssets}
            />

            <SectionTotal
              label={isEn ? "TOTAL ASSETS" : "资产总计"}
              value={calc.totalAssets}
              highlight
            />
          </div>

          {/* Liabilities + Equity column */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-xs font-mono mb-2" style={{ color: "#666660" }}>
              {isEn ? "LIABILITIES + EQUITY / 负债 + 权益" : "负债 + 权益"}
            </p>

            <SectionHeading label={isEn ? "Current Liabilities" : "流动负债"} />
            <InputRow
              label={isEn ? "Accounts Payable" : "应付账款"}
              value={form.accountsPayable}
              onChange={set("accountsPayable")}
            />
            <InputRow
              label={isEn ? "Short-term Loans" : "短期贷款"}
              value={form.shortTermLoans}
              onChange={set("shortTermLoans")}
            />
            <SectionTotal
              label={isEn ? "Total Current Liabilities" : "流动负债合计"}
              value={calc.currentLiabilities}
            />

            <SectionHeading label={isEn ? "Long-term Liabilities" : "长期负债"} />
            <InputRow
              label={isEn ? "Long-term Loans" : "长期贷款"}
              value={form.longTermLiabilities}
              onChange={set("longTermLiabilities")}
            />
            <SectionTotal
              label={isEn ? "Total Liabilities" : "负债合计"}
              value={calc.totalLiabilities}
            />

            <SectionHeading label={isEn ? "Equity" : "股东权益"} />
            <InputRow
              label={isEn ? "Paid-up Capital" : "实收资本"}
              value={form.paidUpCapital}
              onChange={set("paidUpCapital")}
            />
            <InputRow
              label={isEn ? "Retained Earnings" : "留存收益"}
              value={form.retainedEarnings}
              onChange={set("retainedEarnings")}
            />
            <SectionTotal
              label={isEn ? "Total Equity" : "股东权益合计"}
              value={calc.equity}
            />

            <SectionTotal
              label={isEn ? "TOTAL LIABILITIES + EQUITY" : "负债及权益总计"}
              value={calc.totalLiabEquity}
              highlight
            />
          </div>
        </div>

        {/* Financial ratios */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#141414", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
            {isEn ? "FINANCIAL RATIOS" : "财务比率"}
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                label: isEn ? "Debt-to-Equity" : "负债权益比",
                value: ratioStr(calc.debtToEquity),
                hint: isEn ? "Total Liabilities ÷ Equity" : "总负债 ÷ 股东权益",
                warn: isFinite(calc.debtToEquity) && calc.debtToEquity > 2,
                good: isFinite(calc.debtToEquity) && calc.debtToEquity <= 1,
              },
              {
                label: isEn ? "Current Ratio" : "流动比率",
                value: ratioStr(calc.currentRatio),
                hint: isEn ? "Current Assets ÷ Current Liab." : "流动资产 ÷ 流动负债",
                warn: isFinite(calc.currentRatio) && calc.currentRatio < 1,
                good: isFinite(calc.currentRatio) && calc.currentRatio >= 2,
              },
              {
                label: isEn ? "Quick Ratio" : "速动比率",
                value: ratioStr(calc.quickRatio),
                hint: isEn ? "(Cash + AR) ÷ Current Liab." : "(现金+应收账款) ÷ 流动负债",
                warn: isFinite(calc.quickRatio) && calc.quickRatio < 0.5,
                good: isFinite(calc.quickRatio) && calc.quickRatio >= 1,
              },
            ].map((r) => {
              const color = r.warn ? "#EF4444" : r.good ? "#22C55E" : "#C9A84C";
              const bg = r.warn
                ? "rgba(220,38,38,0.05)"
                : r.good
                ? "rgba(34,197,94,0.05)"
                : "rgba(201,168,76,0.04)";
              const border = r.warn
                ? "rgba(220,38,38,0.2)"
                : r.good
                ? "rgba(34,197,94,0.2)"
                : "rgba(201,168,76,0.15)";
              return (
                <div
                  key={r.label}
                  className="rounded-xl p-5 text-center"
                  style={{ backgroundColor: bg, border: `1px solid ${border}` }}
                >
                  <div className="text-3xl font-bold font-mono mb-1" style={{ color }}>
                    {r.value}
                  </div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "#A0A09A" }}>
                    {r.label}
                  </div>
                  <div className="text-xs" style={{ color: "#444440" }}>
                    {r.hint}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
