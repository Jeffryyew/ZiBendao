"use client";

import { useState, useMemo } from "react";

interface Props { color: string; }

export function PricingSimulator({ color }: Props) {
  const [fixedCost, setFixedCost] = useState(13000);   // 月固定成本
  const [variableCost, setVariableCost] = useState(8); // 单件变动成本
  const [volume, setVolume] = useState(1000);           // 月销量
  const [profitTarget, setProfitTarget] = useState(20); // 利润目标 %
  const [discount, setDiscount] = useState(0);          // 折扣 %

  const result = useMemo(() => {
    const fixedPerUnit = volume > 0 ? fixedCost / volume : 0;
    const totalCostPerUnit = variableCost + fixedPerUnit;
    const priceBeforeDiscount = totalCostPerUnit * (1 + profitTarget / 100);
    const finalPrice = priceBeforeDiscount * (1 - discount / 100);
    const revenue = finalPrice * volume;
    const totalCost = totalCostPerUnit * volume;
    const profit = revenue - totalCost;
    const actualMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { priceBeforeDiscount, finalPrice, revenue, totalCost, profit, actualMargin, fixedPerUnit };
  }, [fixedCost, variableCost, volume, profitTarget, discount]);

  const profitColor = result.profit >= 0 ? "#22c55e" : "#ef4444";

  const SliderRow = ({
    label, value, min, max, step, onChange, unit, format,
  }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; unit: string; format?: (v: number) => string;
  }) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>
          {format ? format(value) : value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color, background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)` }}
      />
    </div>
  );

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Sliders */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            调整参数
          </div>
          <SliderRow label="月固定成本（租金+人工等）" value={fixedCost} min={1000} max={50000} step={500} onChange={setFixedCost} unit="元" format={(v) => v.toLocaleString()} />
          <SliderRow label="单件变动成本（原料等）" value={variableCost} min={1} max={100} step={1} onChange={setVariableCost} unit="元" />
          <SliderRow label="月销量" value={volume} min={100} max={5000} step={50} onChange={setVolume} unit="件" format={(v) => v.toLocaleString()} />
          <SliderRow label="利润目标" value={profitTarget} min={5} max={100} step={5} onChange={setProfitTarget} unit="%" />
          <SliderRow label="折扣力度" value={discount} min={0} max={50} step={5} onChange={setDiscount} unit="%" />
        </div>

        {/* Right: Results */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            系统计算结果
          </div>

          <div className="space-y-3">
            <ResultRow label="单件固定成本分摊" value={`${result.fixedPerUnit.toFixed(2)} 元`} dim />
            <ResultRow label="建议售价（折扣前）" value={`${result.priceBeforeDiscount.toFixed(2)} 元`} color={color} />
            <ResultRow label="实际售价（打折后）" value={`${result.finalPrice.toFixed(2)} 元`} color={color} bold />

            <div className="h-px" style={{ background: "rgba(255,255,255,0.08)" }} />

            <ResultRow label="月总收入" value={`${result.revenue.toLocaleString("zh", { maximumFractionDigits: 0 })} 元`} />
            <ResultRow label="月总成本" value={`${result.totalCost.toLocaleString("zh", { maximumFractionDigits: 0 })} 元`} dim />

            <div
              className="rounded-xl p-4 text-center mt-2"
              style={{ background: `${profitColor}10`, border: `1px solid ${profitColor}33` }}
            >
              <div className="text-2xl font-bold font-mono mb-1" style={{ color: profitColor }}>
                {result.profit >= 0 ? "+" : ""}{result.profit.toLocaleString("zh", { maximumFractionDigits: 0 })} 元
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                月净利润 · 实际利润率 {result.actualMargin.toFixed(1)}%
              </div>
            </div>

            {result.profit < 0 && (
              <div
                className="rounded-xl p-3 text-sm text-center"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
              >
                ⚠️ 当前定价无法覆盖成本，减少折扣或提高售价
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value, color, dim, bold }: {
  label: string; value: string; color?: string; dim?: boolean; bold?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: dim ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)" }}>{label}</span>
      <span
        className={`text-sm font-mono ${bold ? "font-bold" : ""}`}
        style={{ color: color ?? (dim ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.8)") }}
      >
        {value}
      </span>
    </div>
  );
}
