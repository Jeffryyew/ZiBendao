"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData } from "@/lib/toolData";
import { getTaxRegion, getCountryConfig, calculateTax, getCountryTaxRules } from "@/lib/taxRates";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";
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
  amount: string; // monthly amount
}

interface VariableCostRow {
  id: string;
  label: string;
  amount: string; // monthly amount
}

interface T01Form {
  // Product / service table
  products: ProductRow[];
  // Revenue override (if manually edited)
  revenueOverride: string;
  revenueSource: "products" | "manual";
  // Variable costs (monthly, ×12 for annual)
  variableCosts: VariableCostRow[];
  // Fixed costs (monthly, ×12 for annual)
  fixedCosts: FixedCostRow[];
  // B. Operations target inputs
  targetProfitPct: string;
  riskPct: string;
  // Tax / currency (driven by company country)
  taxRegionId: string;
  customTaxRate: string;
  customCurrencySymbol: string;
}

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "欢迎使用利润表工具",
    body: "这个工具帮你从产品定价出发，算出标准利润表结果（PBT 与 PAT），并判断企业是否达到经营目标。",
  },
  {
    title: "第一步：产品 / 服务单价表",
    body: "填入产品名称、单价和每月销量，系统自动计算月营收和年营收。",
  },
  {
    title: "第二步：变动成本（月度）",
    body: "填入随销量浮动的成本，包括产品成本、外包、佣金等月度金额，系统自动 ×12 计算年度合计。",
  },
  {
    title: "第三步：固定成本（月度）",
    body: "填入每月固定支出（租金、薪资等），系统自动 ×12 计算年度合计。",
  },
  {
    title: "第四步：查看实际财务结果",
    body: "系统按标准利润表公式计算：营收 → 毛利润 → PBT → 扣税 → PAT。税率根据公司国家自动套用渐进税率。",
  },
  {
    title: "第五步：经营目标判断",
    body: "设定目标利润 % 和风险备用金 %，系统判断实际经营利润率是否达标，风险准备金额仅供参考。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 8);

function fmtN(n: number, sym: string): string {
  const sign = n < 0 ? "-" : "";
  return sign + sym + " " + Math.abs(n).toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtCell(n: number): string {
  return n.toLocaleString("en-MY", { maximumFractionDigits: 0 });
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
  { id: uid(), label: "原材料 / 包装", amount: "0" },
  { id: uid(), label: "支付手续费", amount: "0" },
  { id: uid(), label: "销售佣金", amount: "0" },
  { id: uid(), label: "其它变动成本", amount: "0" },
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
  targetProfitPct: "10",
  riskPct: "10",
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

function NumInput({
  value, onChange, prefix, suffix, placeholder,
}: {
  value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>
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
          backgroundColor: "#F8F6F1",
          border: "1px solid #E8DFCF",
          color: "#2B2B2B",
          paddingLeft: prefix ? "36px" : "10px",
          paddingRight: suffix ? "28px" : "10px",
        }}
        onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
        onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>
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
      style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
      onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
      onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
    />
  );
}

// ── P&L row component ──────────────────────────────────────────────────────

function PLRow({
  label, value, sym, isSubtotal = false, isTotal = false, isMinus = false,
  indent = false, dimLabel = false,
}: {
  label: string; value: number; sym: string;
  isSubtotal?: boolean; isTotal?: boolean; isMinus?: boolean;
  indent?: boolean; dimLabel?: boolean;
}) {
  const color = isTotal
    ? (value >= 0 ? "#22C55E" : "#EF4444")
    : isSubtotal
    ? (value >= 0 ? "#C9A84C" : "#EF4444")
    : isMinus
    ? "#E87C7C"
    : "#2B2B2B";

  return (
    <div
      className={`flex justify-between items-center py-2 ${isTotal ? "border-t-2" : isSubtotal ? "border-t" : ""}`}
      style={{
        borderColor: isTotal ? "#2B2B2B" : "#E8DFCF",
        paddingLeft: indent ? "12px" : "0",
      }}
    >
      <span
        className={`text-sm ${isTotal ? "font-bold" : isSubtotal ? "font-semibold" : ""}`}
        style={{ color: dimLabel ? "#9A9490" : "#2B2B2B" }}
      >
        {label}
      </span>
      <span
        className={`text-sm font-mono ${isTotal ? "font-bold" : isSubtotal ? "font-semibold" : ""}`}
        style={{ color }}
      >
        {isMinus && value > 0 ? "(" + fmtN(value, sym) + ")" : fmtN(value, sym)}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function IncomeStatementTool({ locale }: { locale: "zh" | "en" }) {
  const isEn = locale === "en";
  const { savedData, dataReady, save } = useToolSnapshot<T01Form>("income-statement");

  const [form, setForm] = useState<T01Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [companyCountry, setCompanyCountry] = useState<string>("malaysia");

  // Refs so save-on-unmount can access latest values without stale closures
  const formRef = useRef<T01Form>(form);
  const loadedRef = useRef(false);
  formRef.current = form;
  loadedRef.current = loaded;

  // ── MOUNT LOAD: read from explicit key immediately on mount ──────────
  // This is the primary load path. Key: zibendao_toolData_${companyId}_T01
  // Runs before the hook's DB fetch so there's zero flash of defaults.
  useEffect(() => {
    try {
      const cid = getCompanyId();
      const key = `zibendao_toolData_${cid}_T01`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.inputData) {
          console.log(`[T01] mount load: restored from localStorage | key=${key}`);
          setForm(parsed.inputData as T01Form);
          setLoaded(true);
          return; // already loaded — no need to wait for hook
        }
      }
      console.log(`[T01] mount load: no data at key=${key}`);
    } catch (e) {
      console.warn("[T01] mount load failed", e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once on mount

  // ── PRIMARY LOAD: fires once when hook finishes its localStorage check ──
  // dataReady=true means the hook is done (whether or not data was found).
  // CRITICAL FIX: setLoaded(true) even when savedData is null so first-time
  // users can auto-save. Without this, auto-save is permanently blocked.
  useEffect(() => {
    if (!dataReady) return;
    if (savedData) {
      console.log("[T01] loading: restored saved data from localStorage");
      setForm(savedData);
    } else {
      console.log("[T01] loading: no saved data — using defaults (first visit or cleared storage)");
    }
    setLoaded(true); // ALWAYS set once dataReady fires
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]); // only fires once when dataReady flips true

  // Also apply DB data if it arrives after localStorage (only before user edits)
  useEffect(() => {
    if (savedData && !loaded) {
      console.log("[T01] DB data arrived early — applying to form");
      setForm(savedData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedData]);

  // Sync tax region from company country (once on mount, only if not yet loaded)
  useEffect(() => {
    try {
      const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      let company: { country?: string } | null = null;
      if (mode === "single") {
        const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
        if (sc) company = JSON.parse(sc);
      } else if (mode === "group") {
        const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        if (ac) company = JSON.parse(ac);
      }
      if (company?.country) {
        setCompanyCountry(company.country);
        // Only set taxRegionId if data hasn't loaded yet (avoid overwriting saved preference)
        if (!loadedRef.current) {
          const cfg = getCountryConfig(company.country);
          setForm((p) => ({ ...p, taxRegionId: cfg.taxRegionId }));
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save (1s debounce)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { saveWithCore(); }, 1000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Save immediately on unmount so fast navigation doesn't lose data
  useEffect(() => {
    return () => {
      if (loadedRef.current) {
        console.log("[T01] unmounting — saving immediately");
        save(formRef.current).catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ────────────────────────────────────────────────────
  const region = getTaxRegion(form.taxRegionId);
  const sym = form.taxRegionId === "custom" ? form.customCurrencySymbol || "" : region.currencySymbol;
  const countryRules = getCountryTaxRules(companyCountry);

  const setField = useCallback(<K extends keyof T01Form>(k: K, v: T01Form[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  }, []);

  // Revenue
  const productRevenue = useMemo(() => {
    return form.products.reduce((sum, p) => {
      const price = parseFloat(p.unitPrice) || 0;
      const qty = parseFloat(p.monthlyQty) || 0;
      return sum + price * qty * 12;
    }, 0);
  }, [form.products]);

  const annualRevenue = productRevenue;

  // ── A. Actual Financial Results ───────────────────────────────────────

  // Variable costs: monthly input × 12
  const totalVariableMonthly = useMemo(() =>
    form.variableCosts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [form.variableCosts]
  );
  const totalVariable = totalVariableMonthly * 12;

  // Fixed costs: monthly input × 12
  const totalFixedMonthly = useMemo(() =>
    form.fixedCosts.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [form.fixedCosts]
  );
  const totalFixedAnnual = totalFixedMonthly * 12;

  // P&L formula
  const grossProfit = annualRevenue - totalVariable;
  const pbt = grossProfit - totalFixedAnnual;  // Profit Before Tax

  // Tax: 0 if PBT <= 0, progressive brackets if PBT > 0
  const taxAmt = pbt > 0 ? calculateTax(pbt, countryRules.taxBrackets) : 0;
  const pat = pbt - taxAmt;
  const effectiveRate = pbt > 0 ? (taxAmt / pbt) * 100 : 0;
  const patMarginPct = annualRevenue > 0 ? (pat / annualRevenue) * 100 : 0;
  const grossMarginPct = annualRevenue > 0 ? (grossProfit / annualRevenue) * 100 : 0;
  const pbtMarginPct = annualRevenue > 0 ? (pbt / annualRevenue) * 100 : 0;
  const netMargin = patMarginPct;

  // ── B. Operations Target Judgment ─────────────────────────────────────
  const targetProfitPct = parseFloat(form.targetProfitPct) || 0;
  const riskPct = parseFloat(form.riskPct) || 0;
  const targetOperatingMarginPct = targetProfitPct + riskPct;
  const actualOperatingMarginPct = pbtMarginPct; // PBT / Revenue
  const meetsTarget = actualOperatingMarginPct >= targetOperatingMarginPct;
  const gapPct = actualOperatingMarginPct - targetOperatingMarginPct;
  const riskReserveAmt = annualRevenue * riskPct / 100; // reference only

  // ── C. Charts ─────────────────────────────────────────────────────────

  // 100% allocation bar (true structure, handle negative PAT)
  const barSegments = useMemo(() => {
    if (annualRevenue <= 0) return [];
    const varPct = (totalVariable / annualRevenue) * 100;
    const fixedPct = (totalFixedAnnual / annualRevenue) * 100;
    const taxPct = (Math.max(0, taxAmt) / annualRevenue) * 100;
    const patPct = (pat / annualRevenue) * 100;
    const segments = [
      { label: isEn ? "Variable" : "变动成本", pct: Math.max(0, varPct), value: totalVariable, color: "#E87C7C" },
      { label: isEn ? "Fixed" : "固定成本", pct: Math.max(0, fixedPct), value: totalFixedAnnual, color: "#6B8FD4" },
      { label: isEn ? "Tax" : "企业所得税", pct: Math.max(0, taxPct), value: taxAmt, color: "#5EAB6A" },
      { label: "税后净利润", pct: patPct, value: pat, color: pat >= 0 ? "#C9A84C" : "#EF4444" },
    ];
    // If PAT is negative, only show positive portions (summing to ≤100%)
    return segments;
  }, [annualRevenue, totalVariable, totalFixedAnnual, taxAmt, pat, isEn]);

  // Waterfall: Revenue → Variable → Fixed → Tax → PAT
  const waterfallData = [
    { name: isEn ? "Revenue" : "营收", value: annualRevenue, fill: "#C9A84C" },
    { name: isEn ? "Variable" : "变动成本", value: -totalVariable, fill: "#E87C7C" },
    { name: isEn ? "Fixed" : "固定成本", value: -totalFixedAnnual, fill: "#6B8FD4" },
    { name: isEn ? "Tax" : "企业所得税", value: -taxAmt, fill: "#5EAB6A" },
    { name: "税后净利润", value: pat, fill: pat >= 0 ? "#22C55E" : "#EF4444" },
  ];

  // ── Table helpers ─────────────────────────────────────────────────────
  function updateProduct(id: string, field: keyof ProductRow, val: string) {
    setForm((p) => ({ ...p, products: p.products.map((r) => r.id === id ? { ...r, [field]: val } : r) }));
  }
  function addProduct() {
    setForm((p) => ({ ...p, products: [...p.products, { id: uid(), name: "", unitPrice: "", monthlyQty: "" }] }));
  }
  function removeProduct(id: string) {
    setForm((p) => ({ ...p, products: p.products.filter((r) => r.id !== id) }));
  }
  function updateCost(type: "fixed" | "variable", id: string, field: "label" | "amount", val: string) {
    const key = type === "fixed" ? "fixedCosts" : "variableCosts";
    setForm((p) => ({ ...p, [key]: (p[key] as FixedCostRow[]).map((r) => r.id === id ? { ...r, [field]: val } : r) }));
  }
  function addCost(type: "fixed" | "variable") {
    const key = type === "fixed" ? "fixedCosts" : "variableCosts";
    setForm((p) => ({ ...p, [key]: [...(p[key] as FixedCostRow[]), { id: uid(), label: "", amount: "" }] }));
  }
  function removeCost(type: "fixed" | "variable", id: string) {
    const key = type === "fixed" ? "fixedCosts" : "variableCosts";
    setForm((p) => ({ ...p, [key]: (p[key] as FixedCostRow[]).filter((r) => r.id !== id) }));
  }

  // ── Save + publish to financialCore ──────────────────────────────────

  // Explicit localStorage helpers using user-specified key format
  function t01LsKey(cid: string) { return `zibendao_toolData_${cid}_T01`; }

  function saveT01ToLocalStorage(cid: string) {
    console.log(`[T01] saveT01ToLocalStorage | key=${t01LsKey(cid)} | cid=${cid}`);
    saveToolData({
      companyId: cid,
      toolId: "T01",
      inputData: formRef.current as unknown as Record<string, unknown>,
      calculatedOutput: {
        annualRevenue,
        grossProfit,
        pbt,
        taxAmt,
        pat,
        patMarginPct,
        grossMarginPct,
        effectiveRate,
      },
      currency: sym,
      countryRegion: companyCountry,
    });
  }

  async function saveWithCore() {
    const cid = getCompanyId();
    console.log("[T01] saving T01 data", { companyId: cid, annualRevenue, pat });

    // 1. Write to localStorage immediately (primary, always works)
    saveT01ToLocalStorage(cid);

    // 2. Write form input to DB via useToolSnapshot (secondary)
    await save(form);

    // 3. Sync calculated output to _financial_core for dashboard + other tools
    try {
      console.log("[T01] syncing to company dashboard", { cid, annualRevenue, grossProfit, pbt, taxAmt, pat, patMarginPct });
      const existing = await fetch(
        `/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`
      ).then(r => r.ok ? r.json() : null);
      const core = existing?.data ?? {};
      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId: cid,
          data: {
            ...core,
            annualRevenue,
            grossProfit,
            annualPAT: pat,
            taxAmt,
            grossMargin: grossMarginPct,
            patMargin: patMarginPct,
            netMargin,
            ebit: pbt,
            totalOpEx: totalVariable + totalFixedAnnual,
            currencySymbol: sym,
            taxRate: effectiveRate,
            monthlyFixedCostsBase: totalFixedMonthly,
            updatedBy: { ...(core.updatedBy ?? {}), "income-statement": new Date().toISOString() },
          },
        }),
      });
      console.log("[T01] synced to company dashboard", { cid });
    } catch (e) {
      console.warn("[T01] dashboard sync failed", e);
    }
  }

  const guide = <ToolGuide toolSlug="income-statement" steps={GUIDE_STEPS} />;

  return (
    <ToolShell
      icon=""
      title={isEn ? "Income Statement" : "利润表"}
      desc={isEn ? "Full P&L from product pricing to PAT" : "从产品定价到净利润的完整损益分析"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Product / service table ── */}
        <SectionCard>
          <SectionLabel>产品 / 服务单价表</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[520px]" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col />
                <col style={{ width: "105px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "24px" }} />
              </colgroup>
              <thead>
                <tr style={{ color: "#7A7A7A" }}>
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
                    <tr key={p.id} style={{ borderTop: "1px solid #E8DFCF" }}>
                      <td className="py-1.5 pr-2">
                        <TextInput value={p.name} onChange={(v) => updateProduct(p.id, "name", v)} placeholder="产品 / 服务名称" />
                      </td>
                      <td className="py-1.5 px-1">
                        <NumInput value={p.unitPrice} onChange={(v) => updateProduct(p.id, "unitPrice", v)} prefix={sym} />
                      </td>
                      <td className="py-1.5 px-1">
                        <NumInput value={p.monthlyQty} onChange={(v) => updateProduct(p.id, "monthlyQty", v)} />
                      </td>
                      <td className="py-1.5 px-1 text-right font-mono overflow-hidden whitespace-nowrap" style={{ color: "#9A9490" }}>
                        {fmtCell(monthly)}
                      </td>
                      <td className="py-1.5 px-1 text-right font-mono overflow-hidden whitespace-nowrap" style={{ color: "#C9A84C" }}>
                        {fmtCell(annual)}
                      </td>
                      <td className="py-1.5 pl-1">
                        {form.products.length > 1 && (
                          <button onClick={() => { if (window.confirm("确认删除？")) removeProduct(p.id); }} className="text-xs transition-opacity hover:opacity-60" style={{ color: "#7A7A7A" }}>x</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "1px solid #E8DFCF" }}>
                  <td colSpan={3} className="pt-2 text-xs">
                    <button onClick={addProduct} className="transition-opacity hover:opacity-70" style={{ color: "#C9A84C" }}>+ 新增产品 / 服务</button>
                  </td>
                  <td className="pt-2 text-right text-xs font-mono font-semibold" style={{ color: "#9A9490" }}>{fmtCell(productRevenue / 12)}</td>
                  <td className="pt-2 text-right text-xs font-mono font-bold" style={{ color: "#C9A84C" }}>{fmtCell(productRevenue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

        </SectionCard>

        {/* ── Cost inputs ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Variable costs (monthly × 12) */}
          <SectionCard>
            <SectionLabel>变动成本（月度 × 12）</SectionLabel>
            <div className="space-y-1.5">
              {form.variableCosts.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <TextInput value={r.label} onChange={(v) => updateCost("variable", r.id, "label", v)} placeholder="费用名称" />
                  </div>
                  <div className="w-32">
                    <NumInput value={r.amount} onChange={(v) => updateCost("variable", r.id, "amount", v)} prefix={sym} placeholder="月额" />
                  </div>
                  <button onClick={() => { if (window.confirm("确认删除？")) removeCost("variable", r.id); }} className="text-xs flex-shrink-0 transition-opacity hover:opacity-60" style={{ color: "#7A7A7A" }}>x</button>
                </div>
              ))}
              <button onClick={() => addCost("variable")} className="text-xs mt-1 transition-opacity hover:opacity-70" style={{ color: "#C9A84C" }}>+ 新增</button>
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold pt-2" style={{ borderTop: "1px solid #E8DFCF", color: "#9A9490" }}>
              <span>变动成本合计（年）</span>
              <span className="font-mono" style={{ color: "#2B2B2B" }}>{fmtN(totalVariable, sym)}</span>
            </div>
          </SectionCard>

          {/* Fixed costs (monthly × 12) */}
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
                  <button onClick={() => { if (window.confirm("确认删除？")) removeCost("fixed", r.id); }} className="text-xs flex-shrink-0 transition-opacity hover:opacity-60" style={{ color: "#7A7A7A" }}>x</button>
                </div>
              ))}
              <button onClick={() => addCost("fixed")} className="text-xs mt-1 transition-opacity hover:opacity-70" style={{ color: "#C9A84C" }}>+ 新增</button>
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold pt-2" style={{ borderTop: "1px solid #E8DFCF", color: "#9A9490" }}>
              <span>固定成本合计（年）</span>
              <span className="font-mono" style={{ color: "#2B2B2B" }}>{fmtN(totalFixedAnnual, sym)}</span>
            </div>
          </SectionCard>
        </div>

        {/* ── A. Actual Financial Results + Charts ── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* P&L statement */}
          <SectionCard accent>
            <SectionLabel>A. 实际财务结果</SectionLabel>
            <div className="space-y-0 divide-y" style={{ borderColor: "#E8DFCF" }}>
              <PLRow label="年营收" value={annualRevenue} sym={sym} isSubtotal />
              <PLRow label={`变动成本（${pct(totalVariable / Math.max(annualRevenue, 1) * 100)}）`} value={totalVariable} sym={sym} isMinus indent dimLabel />
              <PLRow
                label={grossProfit >= 0 ? "毛利润（Gross Profit）" : "毛亏损"}
                value={grossProfit}
                sym={sym}
                isSubtotal
              />
              <PLRow label={`固定成本（${pct(totalFixedAnnual / Math.max(annualRevenue, 1) * 100)}）`} value={totalFixedAnnual} sym={sym} isMinus indent dimLabel />
              <PLRow
                label={pbt >= 0 ? "税前利润（PBT）" : "税前亏损（PBT）"}
                value={pbt}
                sym={sym}
                isSubtotal
              />
              <PLRow label={`企业所得税（${pbt > 0 ? pct(effectiveRate) : "—"}）`} value={taxAmt} sym={sym} isMinus={taxAmt > 0} indent dimLabel />
              <PLRow
                label={pat >= 0 ? "税后净利润（PAT）" : "净亏损"}
                value={pat}
                sym={sym}
                isTotal
              />
            </div>
            <div className="mt-3 flex justify-between items-center pt-2" style={{ borderTop: "1px solid #E8DFCF" }}>
              <span className="text-xs" style={{ color: "#9A9490" }}>净利润率（Net Profit Margin）</span>
              <span className="text-sm font-bold font-mono" style={{ color: patMarginPct >= 10 ? "#22C55E" : patMarginPct >= 0 ? "#F0A445" : "#EF4444" }}>
                {pct(patMarginPct)}
              </span>
            </div>
            {/* Tax note */}
            <p className="text-xs mt-2" style={{ color: "#9A9490" }}>
              税率自动计算 · 更新：{countryRules.lastUpdated} · {countryRules.sourceName}
            </p>
          </SectionCard>

          {/* Waterfall chart */}
          <SectionCard accent>
            <SectionLabel>损益瀑布</SectionLabel>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={waterfallData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#666660" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: "10px", fontSize: "12px" }}
                  formatter={(v: number) => [fmtN(Math.abs(v), sym), ""]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* ── B. Operations Target Judgment ── */}
        <SectionCard>
          <SectionLabel>B. 经营目标判断</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#9A9490" }}>目标利润（占营收 %）</label>
                <NumInput value={form.targetProfitPct} onChange={(v) => setField("targetProfitPct", v)} suffix="%" placeholder="10" />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#9A9490" }}>风险备用金（占营收 %）</label>
                <NumInput value={form.riskPct} onChange={(v) => setField("riskPct", v)} suffix="%" placeholder="10" />
                <p className="text-xs mt-1" style={{ color: "#9A9490" }}>
                  参考金额：{fmtN(riskReserveAmt, sym)}（不计入利润表）
                </p>
              </div>
            </div>

            {/* Judgment */}
            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                backgroundColor: meetsTarget ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
                border: `1px solid ${meetsTarget ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div className="flex justify-between text-xs" style={{ color: "#9A9490" }}>
                <span>目标利润</span>
                <span className="font-mono">{pct(targetProfitPct)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: "#9A9490" }}>
                <span>风险备用金</span>
                <span className="font-mono">{pct(riskPct)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold pt-1" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", color: "#2B2B2B" }}>
                <span>目标经营利润率</span>
                <span className="font-mono">{pct(targetOperatingMarginPct)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold" style={{ color: "#2B2B2B" }}>
                <span>实际经营利润率（PBT）</span>
                <span className="font-mono" style={{ color: pbtMarginPct >= 0 ? "#2B2B2B" : "#EF4444" }}>{pct(pbtMarginPct)}</span>
              </div>
              <div
                className="flex justify-between items-center pt-2 mt-1"
                style={{ borderTop: `1px solid ${meetsTarget ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}
              >
                <span className="text-sm font-bold" style={{ color: meetsTarget ? "#22C55E" : "#EF4444" }}>
                  {meetsTarget ? "✓ 已达标" : "✗ 未达标"}
                </span>
                <span className="text-xs font-mono" style={{ color: meetsTarget ? "#22C55E" : "#EF4444" }}>
                  差距 {gapPct >= 0 ? "+" : ""}{pct(gapPct)}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── C. Revenue 100% allocation bar ── */}
        <SectionCard>
          <SectionLabel>营收 100% 分配</SectionLabel>
          {annualRevenue > 0 ? (
            <>
              <div className="flex h-8 rounded-xl overflow-hidden gap-px">
                {barSegments.map((s) =>
                  s.pct > 0.5 ? (
                    <div
                      key={s.label}
                      style={{ width: `${Math.min(s.pct, 100)}%`, backgroundColor: s.color, minWidth: "2px" }}
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
                    <span className="text-xs" style={{ color: "#7A7A7A" }}>
                      {s.label} {s.pct.toFixed(1)}%
                    </span>
                  </div>
                ))}
                {pat < 0 && (
                  <span className="text-xs" style={{ color: "#EF4444" }}>（亏损 {pct(Math.abs(patMarginPct))}）</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs" style={{ color: "#9A9490" }}>请先填入营收数据。</p>
          )}
        </SectionCard>

      </div>
    </ToolShell>
  );
}
