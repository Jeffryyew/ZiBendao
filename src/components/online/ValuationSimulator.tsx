"use client";

import { useState, useMemo } from "react";

interface Props { color: string; }

export function ValuationSimulator({ color }: Props) {
  const [stores, setStores] = useState(10);
  const [profitPerStore, setProfitPerStore] = useState(500000);
  const [peRatio, setPeRatio] = useState(15);
  const [dilution, setDilution] = useState(10);
  const [growthYears, setGrowthYears] = useState(3);
  const [futureStores, setFutureStores] = useState(50);

  const result = useMemo(() => {
    const currentProfit = stores * profitPerStore;
    const futureProfit = futureStores * profitPerStore;
    const currentValuation = currentProfit * peRatio;
    const futureValuation = futureProfit * peRatio;
    const fundraiseAmount = (currentValuation * dilution) / 100;
    const investorShare = dilution;
    const founderShare = 100 - dilution;

    return {
      currentProfit,
      futureProfit,
      currentValuation,
      futureValuation,
      fundraiseAmount,
      investorShare,
      founderShare,
      growthMultiple: futureProfit > 0 ? futureValuation / currentValuation : 1,
    };
  }, [stores, profitPerStore, peRatio, dilution, growthYears, futureStores]);

  const fmt = (n: number) => {
    if (n >= 1e8) return `${(n / 1e8).toFixed(1)} 亿`;
    if (n >= 1e4) return `${(n / 1e4).toFixed(0)} 万`;
    return n.toLocaleString();
  };

  const SliderRow = ({
    label, value, min, max, step, onChange, display,
  }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; display: string;
  }) => (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{display}</span>
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
        {/* Inputs */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            你的业务数据
          </div>
          <SliderRow label="当前店铺数量" value={stores} min={1} max={100} step={1} onChange={setStores} display={`${stores} 家`} />
          <SliderRow label="每店年净利润" value={profitPerStore} min={50000} max={5000000} step={50000} onChange={setProfitPerStore} display={fmt(profitPerStore)} />
          <SliderRow label="行业 PE Ratio" value={peRatio} min={5} max={50} step={1} onChange={setPeRatio} display={`${peRatio}x`} />

          <div className="h-px mb-5" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            {growthYears}年成长计划
          </div>
          <SliderRow label="目标年份" value={growthYears} min={1} max={10} step={1} onChange={setGrowthYears} display={`${growthYears} 年后`} />
          <SliderRow label="未来店铺数量" value={futureStores} min={stores} max={500} step={5} onChange={setFutureStores} display={`${futureStores} 家`} />
          <SliderRow label="出让股权比例" value={dilution} min={5} max={49} step={1} onChange={setDilution} display={`${dilution}%`} />
        </div>

        {/* Results */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            估值分析
          </div>

          {/* Current */}
          <div
            className="rounded-xl p-4 mb-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>现在</div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>年净利润</span>
              <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>{fmt(result.currentProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>当前估值</span>
              <span className="text-sm font-mono font-bold" style={{ color }}>{fmt(result.currentValuation)}</span>
            </div>
          </div>

          {/* Future */}
          <div
            className="rounded-xl p-4 mb-3"
            style={{ background: `${color}08`, border: `1px solid ${color}22` }}
          >
            <div className="text-xs mb-2" style={{ color: `${color}88` }}>{growthYears}年后</div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>未来年净利润</span>
              <span className="text-sm font-mono" style={{ color: "rgba(255,255,255,0.7)" }}>{fmt(result.futureProfit)}</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>未来市值</span>
              <span className="text-sm font-mono font-bold" style={{ color }}>{fmt(result.futureValuation)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>成长倍数</span>
              <span className="text-sm font-mono font-bold" style={{ color: "#86efac" }}>{result.growthMultiple.toFixed(1)}x</span>
            </div>
          </div>

          {/* Fundraise */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>如果现在融资（出让 {dilution}%）</div>
            <div className="text-2xl font-bold font-mono mb-1" style={{ color }}>
              {fmt(result.fundraiseAmount)}
            </div>
            <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>可融资金额</div>

            {/* Equity split */}
            <div className="flex gap-0 h-3 rounded-full overflow-hidden mb-2">
              <div style={{ width: `${result.founderShare}%`, background: color }} />
              <div style={{ width: `${result.investorShare}%`, background: "rgba(255,255,255,0.2)" }} />
            </div>
            <div className="flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              <span>创始人 {result.founderShare}%</span>
              <span>投资人 {result.investorShare}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
