"use client";

import { useState, useMemo } from "react";
import ToolShell from "@/components/tools/ToolShell";
import type { Locale } from "@/lib/i18n";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const PURPLE = "#8B5CF6";
const GOLD = "#C9A84C";
const BLUE = "#3B82F6";

const inputSt: React.CSSProperties = {
  backgroundColor: "#0D0D0D",
  border: "1px solid #2A2A2A",
  color: "#F5F5F0",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "var(--font-mono)",
  outline: "none",
  width: "100%",
  padding: "10px 12px",
};

function computeWacc(equityPct: number, costEq: number, costDebt: number, taxRate: number) {
  const debtPct = 100 - equityPct;
  return (equityPct / 100) * (costEq / 100) + (debtPct / 100) * (costDebt / 100) * (1 - taxRate / 100);
}

function fmtRM(n: number) {
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

export default function CapitalStructureTool({ locale }: { locale: Locale }) {
  const isEn = locale === "en";

  const [totalCapital, setTotalCapital] = useState("10000000");
  const [equityPct, setEquityPct] = useState(50);
  const [costOfEquity, setCostOfEquity] = useState("15");
  const [costOfDebt, setCostOfDebt] = useState("6");
  const [taxRate, setTaxRate] = useState("24");

  const debtPct = 100 - equityPct;
  const total = parseFloat(totalCapital) || 0;
  const ceq = parseFloat(costOfEquity) || 0;
  const cdebt = parseFloat(costOfDebt) || 0;
  const tax = parseFloat(taxRate) || 0;

  const equityAmt = total * (equityPct / 100);
  const debtAmt = total * (debtPct / 100);
  const wacc = computeWacc(equityPct, ceq, cdebt, tax);
  const annualInterest = debtAmt * (cdebt / 100);
  const taxShield = debtAmt * (cdebt / 100) * (tax / 100);
  const netCostOfCapital = total * wacc;

  const SCENARIOS = useMemo(() => [
    { label: isEn ? "Conservative" : "保守型", labelSub: "70E / 30D", eq: 70, color: GOLD },
    { label: isEn ? "Balanced" : "均衡型", labelSub: "50E / 50D", eq: 50, color: PURPLE },
    { label: isEn ? "Aggressive" : "激进型", labelSub: "30E / 70D", eq: 30, color: BLUE },
  ], [isEn]);

  const scenarioData = SCENARIOS.map((s) => ({
    name: s.label,
    WACC: parseFloat((computeWacc(s.eq, ceq, cdebt, tax) * 100).toFixed(2)),
    fill: s.color,
  }));

  return (
    <ToolShell
      icon=""
      title={isEn ? "Capital Structure Optimizer" : "资本架构优化器"}
      desc={isEn ? "Optimize your debt-equity mix and calculate WACC and tax shield benefits." : "优化债务与股权组合，计算WACC与税盾效益。"}
      levelRequired={3}
      backHref="/tools"
    >
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-5" style={{ color: "#666660" }}>CAPITAL MIX / 资本组合</p>

            <div className="space-y-4">
              {/* Total capital */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>
                  {isEn ? "Total Capital Needed (RM)" : "所需总资本 (RM)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#555550" }}>RM</span>
                  <input
                    type="number"
                    value={totalCapital}
                    onChange={(e) => setTotalCapital(e.target.value)}
                    style={{ ...inputSt, paddingLeft: "44px" }}
                    onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                </div>
              </div>

              {/* Equity % slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs" style={{ color: "#A0A09A" }}>{isEn ? "Equity Portion" : "股权比例"}</label>
                  <div className="flex gap-2 text-xs font-mono">
                    <span style={{ color: GOLD }}>{isEn ? "Equity" : "股权"} {equityPct}%</span>
                    <span style={{ color: "#3A3A3A" }}>|</span>
                    <span style={{ color: BLUE }}>{isEn ? "Debt" : "债务"} {debtPct}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={equityPct}
                  onChange={(e) => setEquityPct(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Cost inputs */}
              {[
                { label: isEn ? "Cost of Equity (%)" : "股权成本 (%)", val: costOfEquity, set: setCostOfEquity },
                { label: isEn ? "Cost of Debt (%)" : "债务成本 (%)", val: costOfDebt, set: setCostOfDebt },
                { label: isEn ? "Tax Rate (%)" : "企业税率 (%)", val: taxRate, set: setTaxRate },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      style={{ ...inputSt, paddingRight: "32px" }}
                      onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#555550" }}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capital Stack diagram */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "CAPITAL STACK" : "资本层级"}</p>
            <div className="flex gap-3 items-end h-40">
              <div className="flex-1 flex flex-col rounded-xl overflow-hidden" style={{ height: "100%" }}>
                <div
                  className="flex items-center justify-center text-xs font-semibold transition-all duration-300"
                  style={{ height: `${equityPct}%`, backgroundColor: `${GOLD}25`, border: `1px solid ${GOLD}50`, color: GOLD, minHeight: "24px" }}
                >
                  {equityPct}% {isEn ? "Equity" : "股权"}
                </div>
                <div
                  className="flex items-center justify-center text-xs font-semibold transition-all duration-300"
                  style={{ height: `${debtPct}%`, backgroundColor: `${BLUE}25`, border: `1px solid ${BLUE}50`, color: BLUE, minHeight: "24px" }}
                >
                  {debtPct}% {isEn ? "Debt" : "债务"}
                </div>
              </div>
              <div className="text-xs space-y-2 flex-shrink-0" style={{ color: "#666660" }}>
                <div>
                  <div className="font-mono" style={{ color: GOLD }}>{fmtRM(equityAmt)}</div>
                  <div>{isEn ? "Equity" : "股权"}</div>
                </div>
                <div>
                  <div className="font-mono" style={{ color: BLUE }}>{fmtRM(debtAmt)}</div>
                  <div>{isEn ? "Debt" : "债务"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-3 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "WACC", value: `${(wacc * 100).toFixed(2)}%`, accent: true },
              { label: isEn ? "Net Cost of Capital" : "净资本成本", value: fmtRM(netCostOfCapital), accent: false },
              { label: isEn ? "Annual Interest" : "年度利息支出", value: fmtRM(annualInterest), accent: false },
              { label: isEn ? "Tax Shield" : "税盾效益", value: fmtRM(taxShield), accent: false, green: true },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: m.accent ? "rgba(139,92,246,0.07)" : "#141414",
                  border: `1px solid ${m.accent ? "rgba(139,92,246,0.25)" : "#1E1E1E"}`,
                }}
              >
                <div className="text-xs mb-1" style={{ color: "#666660" }}>{m.label}</div>
                <div className="text-xl font-bold font-mono" style={{ color: m.accent ? PURPLE : m.green ? "#10B981" : GOLD }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* WACC formula */}
          <div className="rounded-xl p-4" style={{ backgroundColor: "#0D0D0D", border: "1px solid #1E1E1E" }}>
            <p className="text-xs mb-2" style={{ color: "#555550" }}>WACC = (E% × Ke) + (D% × Kd × (1 − t))</p>
            <p className="text-xs font-mono" style={{ color: "#444440" }}>
              = ({equityPct}% × {ceq}%) + ({debtPct}% × {cdebt}% × (1 − {tax}%)) = {(wacc * 100).toFixed(2)}%
            </p>
          </div>

          {/* Scenario comparison */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "SCENARIO COMPARISON" : "情景对比"}</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {SCENARIOS.map((s) => {
                const w = computeWacc(s.eq, ceq, cdebt, tax);
                return (
                  <div
                    key={s.label}
                    className="rounded-xl p-3 text-center cursor-pointer transition-all"
                    style={{
                      backgroundColor: s.eq === equityPct ? `${s.color}15` : "#0D0D0D",
                      border: `1px solid ${s.eq === equityPct ? s.color + "50" : "#1E1E1E"}`,
                    }}
                    onClick={() => setEquityPct(s.eq)}
                  >
                    <div className="text-xs font-semibold mb-0.5" style={{ color: s.color }}>{s.label}</div>
                    <div className="text-xs mb-1" style={{ color: "#555550" }}>{s.labelSub}</div>
                    <div className="text-base font-bold font-mono" style={{ color: s.color }}>{(w * 100).toFixed(2)}%</div>
                    <div className="text-xs" style={{ color: "#444440" }}>WACC</div>
                  </div>
                );
              })}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={scenarioData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666660" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#555550" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                  formatter={(v) => [typeof v === "number" ? `${v}%` : "—", "WACC"]}
                />
                <Bar dataKey="WACC" radius={[4, 4, 0, 0]}>
                  {scenarioData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight */}
          <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <span className="text-lg"></span>
            <p className="text-sm" style={{ color: "#A0A09A" }}>
              {isEn
                ? `With ${equityPct}%/${debtPct}% E/D mix, your WACC is ${(wacc * 100).toFixed(2)}%. Debt creates a tax shield of ${fmtRM(taxShield)}/year. Lower WACC = cheaper capital.`
                : `当前${equityPct}%/${debtPct}%股债比，WACC为${(wacc * 100).toFixed(2)}%。债务带来年度税盾${fmtRM(taxShield)}。WACC越低，资本成本越低。`}
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
}
