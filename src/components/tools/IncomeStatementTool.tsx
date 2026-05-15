"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface IncomeForm {
  revenue: string;
  cogs: string;
  rent: string;
  salaries: string;
  marketing: string;
  others: string;
  taxRate: string;
}

const PIE_COLORS = ["#C9A84C", "#5EAB6A", "#6B8FD4", "#E87C7C", "#A07CDC"];

function fmtRm(n: number): string {
  return "RM " + Math.abs(n).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pctStr(n: number): string {
  return n.toFixed(1) + "%";
}

//  Sub-component: a single P&L row 
function PnLRow({
  label,
  value,
  indent = false,
  bold = false,
  accent = false,
  badge,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  accent?: boolean;
  badge?: string;
}) {
  const color = accent ? "#C9A84C" : value < 0 ? "#EF4444" : "#F5F5F0";
  return (
    <div
      className={`flex justify-between items-center py-1 ${indent ? "pl-4" : ""}`}
    >
      <span
        className="text-sm"
        style={{
          color: indent ? "#888880" : "#A0A09A",
          fontWeight: bold ? 600 : 400,
        }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        {badge && (
          <span
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
          >
            {badge}
          </span>
        )}
        <span className="text-sm font-mono" style={{ color, fontWeight: bold ? 700 : 400 }}>
          {value < 0 ? `−${fmtRm(value)}` : fmtRm(value)}
        </span>
      </div>
    </div>
  );
}

//  Main component 
export default function IncomeStatementTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<IncomeForm>({
    revenue: "500000",
    cogs: "200000",
    rent: "30000",
    salaries: "80000",
    marketing: "20000",
    others: "10000",
    taxRate: "24",
  });

  const set =
    (field: keyof IncomeForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const calc = useMemo(() => {
    const rev = parseFloat(form.revenue) || 0;
    const cogs = parseFloat(form.cogs) || 0;
    const rent = parseFloat(form.rent) || 0;
    const salaries = parseFloat(form.salaries) || 0;
    const marketing = parseFloat(form.marketing) || 0;
    const others = parseFloat(form.others) || 0;
    const taxRate = parseFloat(form.taxRate) || 0;

    const grossProfit = rev - cogs;
    const grossMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;
    const opEx = rent + salaries + marketing + others;
    const ebit = grossProfit - opEx;
    const tax = Math.max(0, (ebit * taxRate) / 100);
    const netProfit = ebit - tax;
    const netMargin = rev > 0 ? (netProfit / rev) * 100 : 0;

    return {
      rev, cogs, rent, salaries, marketing, others,
      grossProfit, grossMargin, opEx, ebit, tax, taxRate,
      netProfit, netMargin,
    };
  }, [form]);

  const pieData = [
    { name: isEn ? "COGS" : "销售成本", value: calc.cogs },
    { name: isEn ? "Rent" : "租金", value: calc.rent },
    { name: isEn ? "Salaries" : "薪资", value: calc.salaries },
    { name: isEn ? "Marketing" : "营销", value: calc.marketing },
    { name: isEn ? "Others" : "其他", value: calc.others },
  ].filter((d) => d.value > 0);

  //  Input field list 
  const revenueFields: { field: keyof IncomeForm; label: string }[] = [
    { field: "revenue", label: isEn ? "Revenue" : "营业收入" },
    { field: "cogs", label: isEn ? "Cost of Goods Sold (COGS)" : "销售成本 (COGS)" },
  ];

  const opExFields: { field: keyof IncomeForm; label: string }[] = [
    { field: "rent", label: isEn ? "Rent" : "租金" },
    { field: "salaries", label: isEn ? "Salaries" : "薪资" },
    { field: "marketing", label: isEn ? "Marketing" : "营销费用" },
    { field: "others", label: isEn ? "Others" : "其他费用" },
  ];

  const rmInput = (field: keyof IncomeForm) => (
    <div className="mb-3" key={field}>
      <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
        {[...revenueFields, ...opExFields].find((f) => f.field === field)?.label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono"
          style={{ color: "#555550" }}
        >
          RM
        </span>
        <input
          type="number"
          value={form[field]}
          onChange={set(field)}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm outline-none font-mono"
          style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
          onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
        />
      </div>
    </div>
  );

  return (
    <ToolShell
      icon=""
      title={isEn ? "Income Statement" : "利润表"}
      desc={isEn ? "Full P&L statement with margin analysis" : "完整损益表，毛利率、净利率分析"}
      levelRequired={1}
      backHref="/dashboard/capital"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/*  Left: inputs  */}
        <div className="space-y-4">
          {/* Revenue & COGS */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              REVENUE & COGS
            </p>
            {revenueFields.map(({ field }) => rmInput(field))}
          </div>

          {/* Operating Expenses */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              {isEn ? "OPERATING EXPENSES" : "营运费用"}
            </p>
            {opExFields.map(({ field }) => rmInput(field))}
            {/* Tax rate */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                {isEn ? "Tax Rate (%)" : "企业所得税率 (%)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={set("taxRate")}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl text-sm outline-none font-mono"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                  style={{ color: "#555550" }}
                >
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*  Right: output  */}
        <div className="space-y-4">
          {/* P&L statement */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              {isEn ? "PROFIT & LOSS STATEMENT" : "损益表"}
            </p>

            <PnLRow label={isEn ? "Revenue" : "营业收入"} value={calc.rev} bold />
            <PnLRow label={isEn ? "Less: COGS" : "减：销售成本"} value={-calc.cogs} indent />
            <div className="h-px my-2" style={{ backgroundColor: "#2A2A2A" }} />
            <PnLRow
              label={isEn ? "Gross Profit" : "毛利润"}
              value={calc.grossProfit}
              bold
              badge={pctStr(calc.grossMargin)}
            />
            <PnLRow label={isEn ? "Less: Rent" : "减：租金"} value={-calc.rent} indent />
            <PnLRow label={isEn ? "Less: Salaries" : "减：薪资"} value={-calc.salaries} indent />
            <PnLRow label={isEn ? "Less: Marketing" : "减：营销"} value={-calc.marketing} indent />
            <PnLRow label={isEn ? "Less: Others" : "减：其他"} value={-calc.others} indent />
            <div className="h-px my-2" style={{ backgroundColor: "#2A2A2A" }} />
            <PnLRow
              label={isEn ? "Operating Profit (EBIT)" : "营业利润 (EBIT)"}
              value={calc.ebit}
              bold
            />
            <PnLRow
              label={`${isEn ? "Less: Tax" : "减：所得税"} (${pctStr(calc.taxRate)})`}
              value={-calc.tax}
              indent
            />
            <div className="h-px my-2" style={{ backgroundColor: "#2A2A2A" }} />
            <PnLRow
              label={isEn ? "Net Profit" : "净利润"}
              value={calc.netProfit}
              bold
              accent
              badge={pctStr(calc.netMargin)}
            />
          </div>

          {/* Donut chart */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: "#F5F5F0" }}>
              {isEn ? "Expense Breakdown" : "费用分布"}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                  formatter={(v) => [
                    typeof v === "number" ? fmtRm(v) : "N/A",
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#888880", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
