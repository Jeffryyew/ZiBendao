"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface BreakevenForm {
  fixedCosts: string;
  variableCostPerUnit: string;
  sellingPrice: string;
}

function fmtRm(n: number, dec = 0): string {
  return "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function BreakevenAnalysisTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";

  const [form, setForm] = useState<BreakevenForm>({
    fixedCosts: "20000",
    variableCostPerUnit: "50",
    sellingPrice: "120",
  });
  const [priceAdjust, setPriceAdjust] = useState(0); // −20 to +20

  const set =
    (field: keyof BreakevenForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const calc = useMemo(() => {
    const fc = parseFloat(form.fixedCosts) || 0;
    const vc = parseFloat(form.variableCostPerUnit) || 0;
    const basePrice = parseFloat(form.sellingPrice) || 0;
    const adjPrice = basePrice * (1 + priceAdjust / 100);

    const cm = adjPrice - vc;
    const cmPct = adjPrice > 0 ? (cm / adjPrice) * 100 : 0;
    const beUnits = cm > 0 ? fc / cm : 0;
    const beRevenue = beUnits * adjPrice;

    return { fc, vc, basePrice, adjPrice, cm, cmPct, beUnits, beRevenue };
  }, [form, priceAdjust]);

  const chartData = useMemo(() => {
    const maxUnits = Math.ceil(calc.beUnits * 2.5) || 500;
    const points = Math.min(25, maxUnits);
    const step = Math.ceil(maxUnits / points);
    const data: { units: number; revenue: number; totalCost: number }[] = [];
    for (let u = 0; u <= maxUnits; u += step) {
      data.push({
        units: u,
        revenue: Math.round(u * calc.adjPrice),
        totalCost: Math.round(calc.fc + u * calc.vc),
      });
    }
    return data;
  }, [calc]);

  const bepX = calc.beUnits > 0 && isFinite(calc.beUnits) ? Math.ceil(calc.beUnits) : null;

  const FIELDS: { field: keyof BreakevenForm; label: string }[] = [
    { field: "fixedCosts", label: isEn ? "Fixed Costs / Month (RM)" : "月固定成本 (RM)" },
    { field: "variableCostPerUnit", label: isEn ? "Variable Cost per Unit (RM)" : "单位变动成本 (RM)" },
    { field: "sellingPrice", label: isEn ? "Selling Price per Unit (RM)" : "单位售价 (RM)" },
  ];

  return (
    <ToolShell
      icon="⚖️"
      title={isEn ? "Breakeven Analysis" : "损益平衡分析"}
      desc={isEn ? "Calculate breakeven units, revenue & contribution margin" : "计算保本点销量、收入与贡献毛益"}
      levelRequired={1}
      backHref="/dashboard/capital"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Left panel: inputs + results ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Inputs */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              INPUT / 输入参数
            </p>
            <div className="space-y-4">
              {FIELDS.map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                    {label}
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
              ))}
            </div>
          </div>

          {/* What-if slider */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-xs font-mono mb-3" style={{ color: "#666660" }}>
              {isEn ? "WHAT-IF: PRICE ADJUSTMENT" : "假设分析：价格调整"}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "#A0A09A" }}>
                {isEn ? "Adjust selling price" : "调整售价"}
              </span>
              <span
                className="text-sm font-bold font-mono px-2 py-0.5 rounded"
                style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
              >
                {priceAdjust > 0 ? "+" : ""}
                {priceAdjust}%
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={priceAdjust}
              onChange={(e) => setPriceAdjust(parseInt(e.target.value))}
              className="w-full"
              style={{ accentColor: "#C9A84C" }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: "#444440" }}>
              <span>−20%</span>
              <span>{isEn ? "Base" : "基准"}</span>
              <span>+20%</span>
            </div>
            {priceAdjust !== 0 && (
              <p className="mt-3 text-xs font-mono" style={{ color: "#A0A09A" }}>
                {isEn ? "Adjusted price:" : "调整后售价："}{" "}
                <span style={{ color: "#C9A84C" }}>{fmtRm(calc.adjPrice, 2)}</span>
              </p>
            )}
          </div>

          {/* Results */}
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>
              BREAKEVEN RESULTS
            </p>
            <div className="space-y-3">
              {[
                {
                  label: isEn ? "Contribution Margin" : "贡献毛益 (每单位)",
                  value: fmtRm(calc.cm, 2),
                  accent: false,
                },
                {
                  label: isEn ? "Contribution Margin %" : "贡献毛益率",
                  value: calc.cmPct.toFixed(1) + "%",
                  accent: false,
                },
                {
                  label: isEn ? "Breakeven Units" : "保本销量",
                  value: calc.beUnits > 0 ? Math.ceil(calc.beUnits).toLocaleString() + " units" : "N/A",
                  accent: true,
                },
                {
                  label: isEn ? "Breakeven Revenue" : "保本收入",
                  value: calc.beRevenue > 0 ? fmtRm(calc.beRevenue) : "N/A",
                  accent: true,
                },
              ].map((m) => (
                <div key={m.label} className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "#888880" }}>
                    {m.label}
                  </span>
                  <span
                    className="text-sm font-bold font-mono"
                    style={{ color: m.accent ? "#C9A84C" : "#F5F5F0" }}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: chart ── */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: "#F5F5F0" }}>
              {isEn ? "Revenue vs Total Cost" : "收入与总成本对比"}
            </p>
            <p className="text-xs mb-4" style={{ color: "#555550" }}>
              {isEn
                ? "Lines cross at the breakeven point."
                : "交叉点即为损益平衡点。"}
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
                <XAxis
                  dataKey="units"
                  tick={{ fontSize: 10, fill: "#555550" }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: isEn ? "Units Sold" : "销售量",
                    position: "insideBottom",
                    offset: -12,
                    fill: "#555550",
                    fontSize: 10,
                  }}
                />
                <YAxis
                  tickFormatter={(v) => `${((v as number) / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: "#555550" }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                  formatter={(v, name) => [
                    typeof v === "number" ? fmtRm(v) : "N/A",
                    name,
                  ]}
                  labelFormatter={(l) => `${isEn ? "Units" : "销量"}: ${l}`}
                />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#888880", paddingTop: "8px" }} />
                {bepX !== null && (
                  <ReferenceLine
                    x={bepX}
                    stroke="rgba(201,168,76,0.5)"
                    strokeDasharray="5 4"
                    label={{
                      value: isEn ? `BEP: ${bepX}` : `保本点: ${bepX}`,
                      position: "top",
                      fill: "#C9A84C",
                      fontSize: 10,
                    }}
                  />
                )}
                <Line
                  type="linear"
                  dataKey="revenue"
                  name={isEn ? "Revenue" : "收入"}
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="linear"
                  dataKey="totalCost"
                  name={isEn ? "Total Cost" : "总成本"}
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="mt-4 rounded-2xl p-4"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A" }}
          >
            <p className="text-xs font-mono mb-1" style={{ color: "#333330" }}>
              {isEn ? "Formulas" : "公式"}
            </p>
            <div className="space-y-0.5 text-xs font-mono" style={{ color: "#444440" }}>
              <p>CM = Price − Variable Cost</p>
              <p>BEP (units) = Fixed Costs ÷ CM</p>
              <p>BEP (revenue) = BEP units × Price</p>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
