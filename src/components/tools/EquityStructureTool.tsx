"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

interface Shareholder {
  id: string;
  name: string;
  shares: string;
  type: "founder" | "investor" | "esop" | "other";
}

interface T09Form {
  shareholders: Shareholder[];
  totalAuthorizedShares: string;
  postRoundFounderPct: string;
  postRoundLabel: string;
}

const SHAREHOLDER_TYPES = [
  { value: "founder", label: "创始人" },
  { value: "investor", label: "投资人" },
  { value: "esop", label: "ESOP" },
  { value: "other", label: "其他" },
] as const;

const TYPE_COLORS: Record<string, string> = {
  founder: "#C9A84C",
  investor: "#4CAF50",
  esop: "#6B9FD4",
  other: "#A0A09A",
};

const DEFAULT_SHAREHOLDERS: Shareholder[] = [
  { id: "s1", name: "创始人甲", shares: "600000", type: "founder" },
  { id: "s2", name: "创始人乙", shares: "200000", type: "founder" },
  { id: "s3", name: "ESOP 池", shares: "100000", type: "esop" },
  { id: "s4", name: "天使投资人", shares: "100000", type: "investor" },
];

const DEFAULT_FORM: T09Form = {
  shareholders: DEFAULT_SHAREHOLDERS,
  totalAuthorizedShares: "1000000",
  postRoundFounderPct: "",
  postRoundLabel: "",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "股权结构是公司治理的基础",
    body: "清晰的股权结构表让你一眼看出：谁控股、谁是投资人、ESOP 池有多大。这也是 Due Diligence（尽职调查）时投资人必看的文件之一。",
  },
  {
    title: "第一步：录入所有股东",
    body: "逐行填入每位股东姓名、持股数量与类型（创始人 / 投资人 / ESOP / 其他）。系统将自动计算各自持股比例。",
  },
  {
    title: "第二步：查看当前股权饼图",
    body: "饼图直观呈现当前股权分布。金色为创始人，绿色为投资人，蓝色为 ESOP，灰色为其他。",
  },
  {
    title: "第三步：对比融资后股权",
    body: "如果你已完成融资规划（T08），可以填入融资后创始人持股比例，与当前对比，看清稀释幅度。",
  },
  {
    title: "第四步：股东权益分布柱状图",
    body: "柱状图按股东类型汇总持股比例，方便你快速判断创始团队是否仍保有多数控制权（>50%）。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtShares(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T 股";
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + "B 股";
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + "M 股";
  if (n >= 1e3)  return (n / 1e3).toFixed(0) + "K 股";
  return n.toLocaleString("en-MY") + " 股";
}

function pct(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toFixed(2) + "%";
}

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.2)" : "#E8DFCF"}` }}
    >
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

const RADIAN = Math.PI / 180;
function PieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number; name: string;
}) {
  if (percent < 0.04) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#2B2B2B" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11 }}>
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function EquityStructureTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T09Form>("equity-structure");
  const [form, setForm] = useState<T09Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);

  // ── Load saved ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (savedData && !loaded) {
      setForm({ ...DEFAULT_FORM, ...savedData });
      setLoaded(true);
    }
  }, [savedData, loaded]);

  // ── Auto-save (1.5s debounce) ─────────────────────────────────────────
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { handleSave(); }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);


  // ── Load FinancialCore ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      let companyId = "no_company";
      if (mode === "single") {
        const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
        if (sc) companyId = `single_${JSON.parse(sc).id ?? "default"}`;
      } else if (mode === "group") {
        const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        if (ac) companyId = `group_${JSON.parse(ac).id ?? "default"}`;
      }
      if (companyId !== "no_company") {
        fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`)
          .then((r) => r.json())
          .then((snap) => {
            if (snap?.data) {
              const d: FinancialCore = snap.data;
              setCoreData(d);
              if (d.latestRoundType) {
                setForm((p) => ({
                  ...p,
                  postRoundLabel: p.postRoundLabel || `${d.latestRoundType} 完成后`,
                }));
              }
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  // ── Calculations ──────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const totalIssued = form.shareholders.reduce((s, sh) => s + pf(sh.shares), 0);
    const authorized = pf(form.totalAuthorizedShares);

    const shareholders = form.shareholders.map((sh) => ({
      ...sh,
      sharesNum: pf(sh.shares),
      pct: totalIssued > 0 ? (pf(sh.shares) / totalIssued) * 100 : 0,
    }));

    const byType: Record<string, number> = { founder: 0, investor: 0, esop: 0, other: 0 };
    for (const sh of shareholders) {
      byType[sh.type] = (byType[sh.type] ?? 0) + sh.pct;
    }

    const pieData = shareholders
      .filter((sh) => sh.sharesNum > 0)
      .map((sh) => ({
        name: sh.name,
        value: sh.pct,
        fill: TYPE_COLORS[sh.type] ?? "#A0A09A",
      }));

    const typeBarData = SHAREHOLDER_TYPES.map(({ value, label }) => ({
      name: label,
      pct: byType[value] ?? 0,
      fill: TYPE_COLORS[value],
    }));

    const founderPct = byType.founder ?? 0;
    const unissuedPct = authorized > 0 ? Math.max(0, ((authorized - totalIssued) / authorized) * 100) : 0;
    const postRoundFounderPct = pf(form.postRoundFounderPct);

    return { shareholders, totalIssued, authorized, byType, pieData, typeBarData, founderPct, unissuedPct, postRoundFounderPct };
  }, [form]);

  // ── Standalone toolData localStorage auto-save ──
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    if (!calc || calc.founderPct === 0) return;
    const timer = setTimeout(() => {
      console.log(`[T08] auto-save to toolData | cid=${cid}`);
      saveToolData({
        companyId: cid,
        toolId: "T08",
        calculatedOutput: {
          founderPct: calc.founderPct,
          esopPct: calc.byType.esop ?? 0,
          investorPct: calc.byType.investor ?? 0,
          totalShares: calc.totalIssued,
        },
        currency: coreData?.currencySymbol ?? "RM",
      });
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calc]);

  // ── Shareholder CRUD ──────────────────────────────────────────────────

  function addShareholder() {
    setForm((p) => ({
      ...p,
      shareholders: [
        ...p.shareholders,
        { id: uid(), name: "", shares: "", type: "investor" },
      ],
    }));
  }

  function updateShareholder(id: string, field: keyof Shareholder, value: string) {
    setForm((p) => ({
      ...p,
      shareholders: p.shareholders.map((sh) =>
        sh.id === id ? { ...sh, [field]: value } : sh
      ),
    }));
  }

  function removeShareholder(id: string) {
    setForm((p) => ({
      ...p,
      shareholders: p.shareholders.filter((sh) => sh.id !== id),
    }));
  }

  // ── Save handler ──────────────────────────────────────────────────────

  async function handleSave() {
    await save(form);
    try {
      const mode = localStorage.getItem(ENTERPRISE_KEYS.MODE);
      let companyId = "no_company";
      if (mode === "single") {
        const sc = localStorage.getItem(ENTERPRISE_KEYS.SINGLE);
        if (sc) companyId = `single_${JSON.parse(sc).id ?? "default"}`;
      } else if (mode === "group") {
        const ac = localStorage.getItem(ENTERPRISE_KEYS.ACTIVE_COMPANY);
        if (ac) companyId = `group_${JSON.parse(ac).id ?? "default"}`;
      }
      if (companyId === "no_company") return;
      // Save to unified toolData localStorage
      const esopPct = calc.byType.esop ?? 0;
      const investorPct = calc.byType.investor ?? 0;
      saveToolData({
        companyId,
        toolId: "T08",
        calculatedOutput: {
          founderPct: calc.founderPct,
          esopPct,
          investorPct,
          totalShares: calc.totalIssued,
        },
        currency: coreData?.currencySymbol ?? "RM",
      });

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
            founderPct: calc.founderPct,
            totalShares: calc.totalIssued,
            updatedBy: { ...(core.updatedBy ?? {}), "equity-structure": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="equity-structure" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Equity Structure" : "股权结构"}
      desc={locale === "en" ? "Cap table with ownership charts and dilution comparison" : "股权分配表，含持股图表与稀释对比"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Authorized shares ────────────────────────────────────────── */}
        <Card>
          <SLabel>股本结构基础</SLabel>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>授权总股数</p>
              <div className="relative">
                <input
                  type="number"
                  value={form.totalAuthorizedShares}
                  onChange={(e) => setForm((p) => ({ ...p, totalAuthorizedShares: e.target.value }))}
                  className="w-full py-1.5 px-3 rounded-lg text-xs text-right outline-none font-mono"
                  style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B", paddingRight: "2.5rem" }}
                  onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                  onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>股</span>
              </div>
            </div>
            <div
              className="flex flex-col justify-center px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <p className="text-xs" style={{ color: "#7A7A7A" }}>已发行股数</p>
              <p className="text-base font-bold font-mono" style={{ color: "#C9A84C" }}>
                {calc.totalIssued.toLocaleString("en-MY")} 股
              </p>
              {calc.unissuedPct > 0 && (
                <p className="text-xs mt-0.5 font-mono" style={{ color: "#7A7A7A" }}>
                  未发行 {calc.unissuedPct.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* ── Shareholder table ─────────────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SLabel>股东名册</SLabel>
            <button
              onClick={addShareholder}
              className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)", color: "#C9A84C" }}
            >
              + 添加股东
            </button>
          </div>

          <div
            className="grid items-center gap-2 mb-1 px-1"
            style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 36px" }}
          >
            {["股东姓名", "持股数量", "类型", "占比", ""].map((h, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: "#7A7A7A" }}>{h}</p>
            ))}
          </div>

          <div className="space-y-1">
            {form.shareholders.map((sh) => {
              const shCalc = calc.shareholders.find((s) => s.id === sh.id);
              return (
                <div
                  key={sh.id}
                  className="grid items-center gap-2 px-1 py-1.5 rounded-lg"
                  style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr 36px", backgroundColor: "#F8F6F1" }}
                >
                  <input
                    type="text"
                    value={sh.name}
                    onChange={(e) => updateShareholder(sh.id, "name", e.target.value)}
                    placeholder="姓名"
                    className="px-2 py-1 rounded text-xs outline-none"
                    style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                    onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                    onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                  />
                  <input
                    type="number"
                    value={sh.shares}
                    onChange={(e) => updateShareholder(sh.id, "shares", e.target.value)}
                    placeholder="0"
                    className="px-2 py-1 rounded text-xs text-right font-mono outline-none"
                    style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                    onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                    onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                  />
                  <select
                    value={sh.type}
                    onChange={(e) => updateShareholder(sh.id, "type", e.target.value)}
                    className="px-2 py-1 rounded text-xs outline-none cursor-pointer"
                    style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: TYPE_COLORS[sh.type] ?? "#A0A09A" }}
                  >
                    {SHAREHOLDER_TYPES.map(({ value, label }) => (
                      <option key={value} value={value} style={{ color: TYPE_COLORS[value] }}>{label}</option>
                    ))}
                  </select>
                  <span className="text-xs text-right font-mono px-1" style={{ color: "#C9A84C" }}>
                    {shCalc ? pct(shCalc.pct) : "—"}
                  </span>
                  <button
                    onClick={() => { if (window.confirm("确认删除？")) removeShareholder(sh.id); }}
                    className="flex items-center justify-center w-7 h-7 rounded-lg transition-opacity hover:opacity-70"
                    style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#EF4444", fontSize: 14 }}
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Summary KPIs ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "创始团队持股", value: pct(calc.byType.founder ?? 0), color: "#C9A84C", key: "founder" },
            { label: "投资人持股", value: pct(calc.byType.investor ?? 0), color: "#4CAF50", key: "investor" },
            { label: "ESOP 池", value: pct(calc.byType.esop ?? 0), color: "#6B9FD4", key: "esop" },
            { label: "其他", value: pct(calc.byType.other ?? 0), color: "#9A9490", key: "other" },
          ].map(({ label, value, color, key }) => {
            const isFounder = key === "founder";
            const controlled = isFounder && (calc.byType.founder ?? 0) >= 50;
            return (
              <div
                key={label}
                className="flex flex-col items-center px-4 py-4 rounded-2xl"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${isFounder ? (controlled ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)") : "#E8DFCF"}`,
                }}
              >
                <span className="text-xs mb-1.5" style={{ color: "#7A7A7A" }}>{label}</span>
                <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
                {isFounder && (
                  <span className="text-xs mt-1" style={{ color: controlled ? "#22C55E" : "#EF4444" }}>
                    {controlled ? "多数控制权" : "已失去多数控制权"}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Charts row ────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Pie chart */}
          {calc.pieData.length > 0 && (
            <Card>
              <SLabel>当前股权分布饼图</SLabel>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="58%" height={200}>
                  <PieChart>
                    <Pie
                      data={calc.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={PieLabel as unknown as boolean}
                    >
                      {calc.pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 8 }}
                      formatter={(v: number) => [v.toFixed(2) + "%", "持股比例"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {calc.pieData.slice(0, 6).map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                        <span className="text-xs truncate" style={{ color: "#7A7A7A", maxWidth: 80 }}>{d.name}</span>
                      </div>
                      <span className="text-xs font-mono ml-2" style={{ color: "#C9A84C" }}>{d.value.toFixed(1)}%</span>
                    </div>
                  ))}
                  {calc.pieData.length > 6 && (
                    <p className="text-xs" style={{ color: "#7A7A7A" }}>+ {calc.pieData.length - 6} 位股东</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Type bar chart */}
          <Card>
            <SLabel>各类股东持股比例</SLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calc.typeBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => v + "%"}
                  tick={{ fill: "#7A7A7A", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 8 }}
                  formatter={(v: number) => [v.toFixed(2) + "%", "持股比例"]}
                />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={56}>
                  {calc.typeBarData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Pre vs post round comparison ──────────────────────────────── */}
        <Card>
          <SLabel>融资前后创始团队持股对比</SLabel>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>融资后创始人持股 %（来自 T08 或手填）</p>
              <div className="relative">
                <input
                  type="number"
                  value={form.postRoundFounderPct}
                  onChange={(e) => setForm((p) => ({ ...p, postRoundFounderPct: e.target.value }))}
                  placeholder="0"
                  className="w-full py-1.5 px-3 rounded-lg text-xs text-right outline-none font-mono"
                  style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B", paddingRight: "2rem" }}
                  onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                  onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>%</span>
              </div>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>轮次标签（如「完成 A 轮后」）</p>
              <input
                type="text"
                value={form.postRoundLabel}
                onChange={(e) => setForm((p) => ({ ...p, postRoundLabel: e.target.value }))}
                placeholder="完成 A 轮后"
                className="w-full py-1.5 px-3 rounded-lg text-xs outline-none"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
              />
            </div>
          </div>

          {/* T08 import hint */}
          {coreData?.latestRoundType && (
            <div
              className="mb-4 flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs" style={{ color: "#7A7A7A" }}>
                T08 最新轮次：{coreData.latestRoundType}
                {coreData.latestRoundPreMoney ? `  |  Pre-money: ${coreData.currencySymbol ?? "RM"} ${coreData.latestRoundPreMoney.toLocaleString("en-MY")}` : ""}
              </span>
              <button
                onClick={() => setForm((p) => ({
                  ...p,
                  postRoundLabel: `${coreData.latestRoundType} 完成后`,
                }))}
                className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
              >
                填入标签
              </button>
            </div>
          )}

          {/* Comparison bars */}
          {calc.postRoundFounderPct > 0 && (
            <div className="space-y-3">
              {[
                { label: "融资前（当前）", p: calc.founderPct },
                { label: form.postRoundLabel || "融资后", p: calc.postRoundFounderPct },
              ].map(({ label, p }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
                    <span className="text-xs font-mono" style={{ color: p >= 50 ? "#22C55E" : p >= 30 ? "#F59E0B" : "#EF4444" }}>
                      {p.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F8F6F1" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, p)}%`,
                        backgroundColor: p >= 50 ? "#22C55E" : p >= 30 ? "#F59E0B" : "#EF4444",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
              >
                <span className="text-xs" style={{ color: "#7A7A7A" }}>稀释幅度</span>
                <span className="text-sm font-bold font-mono" style={{ color: "#EF4444" }}>
                  -{(calc.founderPct - calc.postRoundFounderPct).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* ── Auto-save status ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: "#9A9490" }}>
            {saving ? "正在保存..." : lastSaved ? `已自动保存 ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
        </div>

      </div>
    </ToolShell>
  );
}
