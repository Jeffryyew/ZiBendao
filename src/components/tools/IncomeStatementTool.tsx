"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import { TAX_REGIONS, getTaxRegion } from "@/lib/taxRates";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductRow {
  id: string;
  name: string;
  unitPrice: string;
  monthlyQty: string;
}

interface FixedCostRow {
  id: string;
  label: string;
  amount: string;
}

interface VariableCostRow {
  id: string;
  label: string;
  amount: string;
}

interface T01Form {
  // Product / service table
  products: ProductRow[];
  // Revenue override (if manually edited)
  revenueOverride: string;
  revenueSource: "products" | "manual";
  // Variable costs
  variableCosts: VariableCostRow[];
  // Fixed costs
  fixedCosts: FixedCostRow[];
  // Adjustments
  riskPct: string;
  commissionPct: string;
  targetProfitPct: string;
  // Tax
  taxRegionId: string;
  customTaxRate: string;
  customCurrencySymbol: string;
}

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "欢迎使用利润表工具",
    body: "这个工具帮你从产品定价出发，一步步算出企业的真实净利润（PAT）。我们会先填入你的产品或服务，再设置成本结构，最后看到完整的盈利分析。",
  },
  {
    title: "第一步：产品 / 服务单价表",
    body: "在顶部的表格填入你的产品或服务名称、单价和每月销量。系统会自动计算月营收和年营收，并带入下方的损益计算。",
  },
  {
    title: "第二步：设置成本结构",
    body: "分别填入变动成本（随销量浮动，如产品成本、外包费）和固定成本（每月固定支出，如租金、薪资）。系统会自动合计。",
  },
  {
    title: "第三步：风险、佣金与目标利润",
    body: "填入风险备用金比例（占营收）、佣金比例，以及你希望达到的利润目标百分比。系统会告诉你实际 PAT 是否达标。",
  },
  {
    title: "第四步：选择税率",
    body: "选择你的企业所在国家或地区，货币和税率会自动切换。也可以手动输入自定义税率。",
  },
  {
    title: "第五步：查看结果",
    body: "右侧会显示完整的利润瀑布图，从营收一步一步扣减到 PAT。底部横条显示收入的 100% 分配情况，一目了然。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 8);

function fmtN(n: number, sym: string): string {
  return sym + " " + Math.abs(n).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function pct(n: number): string {
  return n.toFixed(1) + "%";
}

const DEFAULT_FIXED: FixedCostRow[] = [
  { id: uid(), label: "租金", amount: "3000" },
  { id: uid(), label: "固定薪资", amount: "8000" },
  { id: uid(), label: "水电费", amount: "500" },
  { id: uid(), label: "电话 / 网络", amount: "300" },
  { id: uid(), label: "交通（固定）", amount: "500" },
  { id: uid(), label: "营销 / 广告", amount: "1000" },
  { id: uid(), label: "保险", amount: "200" },
  { id: uid(), label: "软件订阅", amount: "300" },
  { id: uid(), label: "专业费用", amount: "500" },
  { id: uid(), label: "杂费", amount: "300" },
];

const DEFAULT_VARIABLE: VariableCostRow[] = [
  { id: uid(), label: "产品成本 / 项目成本", amount: "0" },
  { id: uid(), label: "外包费用", amount: "0" },
  { id: uid(), label: "变动薪资", amount: "0" },
  { id: uid(), label: "运输 / 物流", amount: "0" },
  { id: uid(), label: "贷款利息", amount: "0" },
  { id: uid(), label: "原材料 / 包装", amount: "0" },
  { id: uid(), label: "支付手续费", amount: "0" },
];

const DEFAULT_PRODUCTS: ProductRow[] = [
  { id: uid(), name: "产品 / 服务 1", unitPrice: "100", monthlyQty: "100" },
];

const DEFAULT_FORM: T01Form = {
  products: DEFAULT_PRODUCTS,
  revenueOverride: "",
  revenueSource: "products",
  variableCosts: DEFAULT_VARIABLE,
  fixedCosts: DEFAULT_FIXED,
  riskPct: "5",
  commissionPct: "5",
  targetProfitPct: "20",
  taxRegionId: "my-sme",
  customTaxRate: "24",
  customCurrencySymbol: "RM",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionCard({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
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

function NumInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        className="w-full py-2 rounded-lg text-sm outline-none font-mono"
        style={{
          backgroundColor: "#0D0D0D",
          border: "1px solid #2A2A2A",
          color: "#F5F5F0",
          paddingLeft: prefix ? "36px" : "10px",
          paddingRight: suffix ? "28px" : "10px",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
        onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#555550" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-2 rounded-lg text-sm outline-none"
      style={{
        backgroundColor: "#0D0D0D",
        border: "1px solid #2A2A2A",
        color: "#F5F5F0",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function IncomeStatementTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T01Form>("income-statement");

  const [form, setForm] = useState<T01Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);

  // Load saved data once available
  useEffect(() => {
    if (savedData && !loaded) {
      setForm(savedData);
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Helpers ──────────────────────────────────────────────────────────
  const region = getTaxRegion(form.taxRegionId);
  const sym = form.taxRegionId === "custom" ? form.customCurrencySymbol || "" : region.currencySymbol;
  const taxRate = form.taxRegionId === "custom" ? (parseFloat(form.customTaxRate) || 0) : region.rate;

  const setField = useCallback(<K extends keyof T01Form>(k: K, v: T01Form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  // Products
  const productRevenue = useMemo(() => {
    return form.products.reduce((sum, p) => {
      const price = parseFloat(p.unitPrice) || 0;
      const qty = parseFloat(p.monthlyQty) || 0;
      return sum + price * qty * 12;
    }, 0);
  }, [form.products]);

  const annualRevenue = form.revenueSource === "products"
    ? productRevenue
    : (parseFloat(form.revenueOverride) || 0);

  // Revenue mismatch
  const revenueMismatch = form.revenueSource === "manual" && Math.abs((parseFloat(form.revenueOverride) || 0) - productRevenue) > 1;
  const mismatchDiff = (parseFloat(form.revenueOverride) || 0) - productRevenue;

  // Costs
  const totalVariable = useMemo(() =>
    form.variableCosts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [form.variableCosts]
  );

  const totalFixedMonthly = useMemo(() =>
    form.fixedCosts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [form.fixedCosts]
  );
  const totalFixedAnnual = totalFixedMonthly * 12;

  const grossProfit = annualRevenue - totalVariable;
  const ebit = grossProfit - totalFixedAnnual;
  const riskAmt = annualRevenue * (parseFloat(form.riskPct) || 0) / 100;
  const commissionAmt = annualRevenue * (parseFloat(form.commissionPct) || 0) / 100;
  const ebt = ebit - riskAmt - commissionAmt;
  const taxAmt = Math.max(0, ebt * taxRate / 100);
  const pat = ebt - taxAmt;
  const netMargin = annualRevenue > 0 ? (pat / annualRevenue) * 100 : 0;
  const targetProfitPct = parseFloat(form.targetProfitPct) || 0;
  const targetProfitAmt = annualRevenue * targetProfitPct / 100;
  const meetsTarget = pat >= targetProfitAmt;

  // Adjusted target if revenue mismatch
  const adjustedTargetPct = revenueMismatch && annualRevenue > 0
    ? ((pat / annualRevenue) * 100)
    : null;

  // ── 100% bar segments ─────────────────────────────────────────────────
  const barSegments = useMemo(() => {
    if (annualRevenue <= 0) return [];
    const segments = [
      { label: isEn ? "Variable" : "变动成本", value: totalVariable, color: "#E87C7C" },
      { label: isEn ? "Fixed" : "固定成本", value: totalFixedAnnual, color: "#6B8FD4" },
      { label: isEn ? "Risk" : "风险备用", value: riskAmt, color: "#F0A445" },
      { label: isEn ? "Commission" : "佣金", value: commissionAmt, color: "#A07CDC" },
      { label: isEn ? "Tax" : "税", value: taxAmt, color: "#5EAB6A" },
      { label: "PAT", value: pat, color: pat >= 0 ? "#C9A84C" : "#EF4444" },
    ];
    return segments.map((s) => ({ ...s, pct: (Math.max(0, s.value) / annualRevenue) * 100 }));
  }, [annualRevenue, totalVariable, totalFixedAnnual, riskAmt, commissionAmt, taxAmt, pat, isEn]);

  // ── Waterfall chart data ──────────────────────────────────────────────
  const waterfallData = [
    { name: isEn ? "Revenue" : "营收", value: annualRevenue, fill: "#C9A84C" },
    { name: isEn ? "Variable" : "变动成本", value: -totalVariable, fill: "#E87C7C" },
    { name: isEn ? "Fixed" : "固定成本", value: -totalFixedAnnual, fill: "#6B8FD4" },
    { name: isEn ? "Risk" : "风险备用", value: -riskAmt, fill: "#F0A445" },
    { name: isEn ? "Commission" : "佣金", value: -commissionAmt, fill: "#A07CDC" },
    { name: isEn ? "Tax" : "税", value: -taxAmt, fill: "#5EAB6A" },
    { name: "PAT", value: pat, fill: pat >= 0 ? "#22C55E" : "#EF4444" },
  ];

  // ── Product table helpers ─────────────────────────────────────────────
  function updateProduct(id: string, field: keyof ProductRow, val: string) {
    setForm((p) => ({
      ...p,
      products: p.products.map((r) => r.id === id ? { ...r, [field]: val } : r),
    }));
  }
  function addProduct() {
    setForm((p) => ({
      ...p,
      products: [...p.products, { id: uid(), name: "", unitPrice: "", monthlyQty: "" }],
    }));
  }
  function removeProduct(id: string) {
    setForm((p) => ({ ...p, products: p.products.filter((r) => r.id !== id) }));
  }

  // ── Cost table helpers ────────────────────────────────────────────────
  function updateCost(type: "fixed" | "variable", id: string, field: "label" | "amount", val: string) {
    const key = type === "fixed" ? "fixedCosts" : "variableCosts";
    setForm((p) => ({
      ...p,
      [key]: (p[key] as FixedCostRow[]).map((r) => r.id === id ? { ...r, [field]: val } : r),
    }));
  }
  function addCost(type: "fixed" | "variable") {
    const key = type === "fixed" ? "fixedCosts" : "variableCosts";
    setForm((p) => ({
      ...p,
      [key]: [...(p[key] as FixedCostRow[]), { id: uid(), label: "", amount: "" }],
    }));
  }
  function removeCost(type: "fixed" | "variable", id: string) {
    const key = type === "fixed" ? "fixedCosts" : "variableCosts";
    setForm((p) => ({ ...p, [key]: (p[key] as FixedCostRow[]).filter((r) => r.id !== id) }));
  }

  const guide = (
    <ToolGuide toolSlug="income-statement" steps={GUIDE_STEPS} />
  );

  return (
    <ToolShell
      icon=""
      title={isEn ? "Income Statement" : "利润表"}
      desc={isEn ? "Full P&L from product pricing to PAT" : "从产品定价到净利润的完整损益分析"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Revenue mismatch banner ── */}
        {revenueMismatch && (
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "rgba(240,164,69,0.08)", border: "1px solid rgba(240,164,69,0.3)" }}
          >
            <div className="flex-1 text-sm" style={{ color: "#F0A445" }}>
              产品营收合计 {sym} {productRevenue.toLocaleString()}，与手动填写的营收 {sym} {(parseFloat(form.revenueOverride) || 0).toLocaleString()} 差距 {sym} {Math.abs(mismatchDiff).toLocaleString()}（{mismatchDiff > 0 ? "高出" : "低于"}产品表）。
              {adjustedTargetPct !== null && ` 实际利润率已调整为 ${adjustedTargetPct.toFixed(1)}%，建议核对两边数字。`}
            </div>
          </div>
        )}

        {/* ── Product / service table ── */}
        <SectionCard>
          <SectionLabel>产品 / 服务单价表</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]">
              <thead>
                <tr style={{ color: "#555550" }}>
                  <th className="pb-2 text-left font-mono">名称</th>
                  <th className="pb-2 text-right font-mono">单价 ({sym})</th>
                  <th className="pb-2 text-right font-mono">月销量</th>
                  <th className="pb-2 text-right font-mono">月营收</th>
                  <th className="pb-2 text-right font-mono">年营收</th>
                  <th className="pb-2 w-6" />
                </tr>
              </thead>
              <tbody>
                {form.products.map((p) => {
                  const price = parseFloat(p.unitPrice) || 0;
                  const qty = parseFloat(p.monthlyQty) || 0;
                  const monthly = price * qty;
                  const annual = monthly * 12;
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid #1A1A1A" }}>
                      <td className="py-1.5 pr-2">
                        <TextInput value={p.name} onChange={(v) => updateProduct(p.id, "name", v)} placeholder="产品 / 服务名称" />
                      </td>
                      <td className="py-1.5 px-1">
                        <NumInput value={p.unitPrice} onChange={(v) => updateProduct(p.id, "unitPrice", v)} prefix={sym} />
                      </td>
                      <td className="py-1.5 px-1">
                        <NumInput value={p.monthlyQty} onChange={(v) => updateProduct(p.id, "monthlyQty", v)} />
                      </td>
                      <td className="py-1.5 px-1 text-right font-mono" style={{ color: "#A0A09A" }}>
                        {monthly.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-1 text-right font-mono" style={{ color: "#C9A84C" }}>
                        {annual.toLocaleString()}
                      </td>
                      <td className="py-1.5 pl-1">
                        {form.products.length > 1 && (
                          <button onClick={() => removeProduct(p.id)} className="text-xs transition-opacity hover:opacity-60" style={{ color: "#555550" }}>
                            x
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid #2A2A2A" }}>
                  <td colSpan={3} className="pt-2 text-xs" style={{ color: "#555550" }}>
                    <button onClick={addProduct} className="transition-opacity hover:opacity-70" style={{ color: "#C9A84C" }}>
                      + 新增产品 / 服务
                    </button>
                  </td>
                  <td className="pt-2 text-right text-xs font-mono font-semibold" style={{ color: "#A0A09A" }}>
                    {(productRevenue / 12).toLocaleString()}
                  </td>
                  <td className="pt-2 text-right text-xs font-mono font-bold" style={{ color: "#C9A84C" }}>
                    {productRevenue.toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Revenue source toggle */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-xs" style={{ color: "#555550" }}>损益表营收来源：</span>
            <button
              onClick={() => setField("revenueSource", "products")}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{
                backgroundColor: form.revenueSource === "products" ? "rgba(201,168,76,0.15)" : "#0D0D0D",
                border: `1px solid ${form.revenueSource === "products" ? "rgba(201,168,76,0.4)" : "#2A2A2A"}`,
                color: form.revenueSource === "products" ? "#C9A84C" : "#555550",
              }}
            >
              从产品表自动带入
            </button>
            <button
              onClick={() => setField("revenueSource", "manual")}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{
                backgroundColor: form.revenueSource === "manual" ? "rgba(201,168,76,0.15)" : "#0D0D0D",
                border: `1px solid ${form.revenueSource === "manual" ? "rgba(201,168,76,0.4)" : "#2A2A2A"}`,
                color: form.revenueSource === "manual" ? "#C9A84C" : "#555550",
              }}
            >
              手动填写
            </button>
            {form.revenueSource === "manual" && (
              <div className="w-40">
                <NumInput
                  value={form.revenueOverride}
                  onChange={(v) => setField("revenueOverride", v)}
                  prefix={sym}
                  placeholder="年营收"
                />
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Costs + Tax + Adjustments ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Variable costs */}
          <SectionCard>
            <SectionLabel>变动成本（年度）</SectionLabel>
            <div className="space-y-1.5">
              {form.variableCosts.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <TextInput value={r.label} onChange={(v) => updateCost("variable", r.id, "label", v)} placeholder="费用名称" />
                  </div>
                  <div className="w-32">
                    <NumInput value={r.amount} onChange={(v) => updateCost("variable", r.id, "amount", v)} prefix={sym} />
                  </div>
                  <button onClick={() => removeCost("variable", r.id)} className="text-xs flex-shrink-0 transition-opacity hover:opacity-60" style={{ color: "#555550" }}>
                    x
                  </button>
                </div>
              ))}
              <button onClick={() => addCost("variable")} className="text-xs mt-1 transition-opacity hover:opacity-70" style={{ color: "#C9A84C" }}>
                + 新增
              </button>
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold pt-2" style={{ borderTop: "1px solid #2A2A2A", color: "#A0A09A" }}>
              <span>变动成本合计</span>
              <span className="font-mono" style={{ color: "#F5F5F0" }}>{fmtN(totalVariable, sym)}</span>
            </div>
          </SectionCard>

          {/* Fixed costs */}
          <SectionCard>
            <SectionLabel>固定成本（月度 × 12）</SectionLabel>
            <div className="space-y-1.5">
              {form.fixedCosts.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <TextInput value={r.label} onChange={(v) => updateCost("fixed", r.id, "label", v)} placeholder="费用名称" />
                  </div>
                  <div className="w-32">
                    <NumInput value={r.amount} onChange={(v) => updateCost("fixed", r.id, "amount", v)} prefix={sym} placeholder="月额" />
                  </div>
                  <button onClick={() => removeCost("fixed", r.id)} className="text-xs flex-shrink-0 transition-opacity hover:opacity-60" style={{ color: "#555550" }}>
                    x
                  </button>
                </div>
              ))}
              <button onClick={() => addCost("fixed")} className="text-xs mt-1 transition-opacity hover:opacity-70" style={{ color: "#C9A84C" }}>
                + 新增
              </button>
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold pt-2" style={{ borderTop: "1px solid #2A2A2A", color: "#A0A09A" }}>
              <span>固定成本合计（年）</span>
              <span className="font-mono" style={{ color: "#F5F5F0" }}>{fmtN(totalFixedAnnual, sym)}</span>
            </div>
          </SectionCard>
        </div>

        {/* ── Adjustments + Tax ── */}
        <SectionCard>
          <SectionLabel>调整项与税率</SectionLabel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>风险备用金（占营收 %）</label>
              <NumInput value={form.riskPct} onChange={(v) => setField("riskPct", v)} suffix="%" />
              <p className="text-xs mt-1" style={{ color: "#444440" }}>= {fmtN(riskAmt, sym)}</p>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>佣金（占营收 %）</label>
              <NumInput value={form.commissionPct} onChange={(v) => setField("commissionPct", v)} suffix="%" />
              <p className="text-xs mt-1" style={{ color: "#444440" }}>= {fmtN(commissionAmt, sym)}</p>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>目标利润（占营收 %）</label>
              <NumInput value={form.targetProfitPct} onChange={(v) => setField("targetProfitPct", v)} suffix="%" />
              <p className="text-xs mt-1" style={{ color: "#444440" }}>= {fmtN(targetProfitAmt, sym)}</p>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>税率 / 国家</label>
              <select
                value={form.taxRegionId}
                onChange={(e) => setField("taxRegionId", e.target.value)}
                className="w-full py-2 px-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
              >
                {TAX_REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              {form.taxRegionId === "custom" ? (
                <div className="mt-1.5 flex gap-2">
                  <NumInput value={form.customCurrencySymbol} onChange={(v) => setField("customCurrencySymbol", v)} placeholder="符号" />
                  <NumInput value={form.customTaxRate} onChange={(v) => setField("customTaxRate", v)} suffix="%" />
                </div>
              ) : (
                <p className="text-xs mt-1" style={{ color: "#444440" }}>
                  {taxRate}% · {region.currencySymbol}
                  {region.updatedAt && ` · 更新: ${region.updatedAt}`}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        {/* ── Results ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* P&L waterfall */}
          <SectionCard accent>
            <SectionLabel>损益瀑布</SectionLabel>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={waterfallData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666660" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                  formatter={(v: number) => [fmtN(Math.abs(v), sym), ""]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* KPI cards */}
          <div className="space-y-3">
            {[
              { label: isEn ? "Annual Revenue" : "年营收", value: fmtN(annualRevenue, sym), color: "#C9A84C" },
              { label: isEn ? "Gross Profit" : "毛利润", value: fmtN(grossProfit, sym), color: grossProfit >= 0 ? "#F5F5F0" : "#EF4444" },
              { label: isEn ? "EBIT" : "营业利润 (EBIT)", value: fmtN(ebit, sym), color: ebit >= 0 ? "#F5F5F0" : "#EF4444" },
              { label: "PAT", value: fmtN(pat, sym), color: pat >= 0 ? "#22C55E" : "#EF4444" },
              { label: isEn ? "Net Margin" : "净利率", value: pct(netMargin), color: netMargin >= 10 ? "#22C55E" : netMargin >= 0 ? "#F0A445" : "#EF4444" },
            ].map((k) => (
              <div
                key={k.label}
                className="flex justify-between items-center px-4 py-3 rounded-xl"
                style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
              >
                <span className="text-sm" style={{ color: "#A0A09A" }}>{k.label}</span>
                <span className="text-sm font-bold font-mono" style={{ color: k.color }}>{k.value}</span>
              </div>
            ))}

            {/* Target comparison */}
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: meetsTarget ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                border: `1px solid ${meetsTarget ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: meetsTarget ? "#22C55E" : "#EF4444" }}>
                  {meetsTarget ? "达到利润目标" : "未达利润目标"}
                </span>
                <span className="text-xs font-mono" style={{ color: meetsTarget ? "#22C55E" : "#EF4444" }}>
                  {pct(netMargin)} vs {pct(targetProfitPct)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 100% revenue allocation bar ── */}
        <SectionCard>
          <SectionLabel>营收 100% 分配</SectionLabel>
          {annualRevenue > 0 ? (
            <>
              <div className="flex h-8 rounded-xl overflow-hidden gap-px">
                {barSegments.map((s) =>
                  s.pct > 0.5 ? (
                    <div
                      key={s.label}
                      style={{ width: `${s.pct}%`, backgroundColor: s.color, minWidth: "2px" }}
                      title={`${s.label}: ${s.pct.toFixed(1)}%`}
                      className="transition-all"
                    />
                  ) : null
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-3">
                {barSegments.map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-xs" style={{ color: "#888880" }}>
                      {s.label} {s.pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs" style={{ color: "#444440" }}>请先填入营收数据。</p>
          )}
        </SectionCard>

        {/* ── Save button ── */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#444440" }}>
            {lastSaved ? `上次保存: ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
          <button
            onClick={() => save(form)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1A1A1A" }}
          >
            {saving ? "保存中..." : "保存数据"}
          </button>
        </div>

      </div>
    </ToolShell>
  );
}
