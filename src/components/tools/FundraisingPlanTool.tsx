"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Cell,
} from "recharts";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

type RoundType = "Seed" | "Pre-A" | "Series A" | "Series B" | "Series C" | "Pre-IPO" | "IPO";

interface Round {
  type: RoundType;
  enabled: boolean;
  preMoneyValuation: string;
  fundingAmount: string;
  // Fund use split (%)
  useProduct: string;
  useExpansion: string;
  useOperations: string;
  useTeam: string;
}

interface T08Form {
  rounds: Round[];
  founderSharesPre: string; // total shares before any round (founder shares)
  totalSharesPre: string;   // total shares pre-seed (including any prior ESOP etc.)
  importedExpansionCapital: string; // from T07, stored so it survives reload
}

const ROUND_TYPES: RoundType[] = ["Seed", "Pre-A", "Series A", "Series B", "Series C", "Pre-IPO", "IPO"];

function defaultRound(type: RoundType): Round {
  return {
    type,
    enabled: ["Seed", "Series A", "Series B"].includes(type),
    preMoneyValuation: "",
    fundingAmount: "",
    useProduct: "30",
    useExpansion: "30",
    useOperations: "20",
    useTeam: "20",
  };
}

const DEFAULT_FORM: T08Form = {
  rounds: ROUND_TYPES.map(defaultRound),
  founderSharesPre: "1000000",
  totalSharesPre: "1000000",
  importedExpansionCapital: "",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "融资规划是资本路径的蓝图",
    body: "从种子轮到 IPO，每一轮融资都会稀释创始人股权。这个工具帮你在融资之前，看清楚每一轮的估值、募资额、股权占比与稀释幅度。",
  },
  {
    title: "第一步：启用你计划的融资轮次",
    body: "勾选你预计进行的轮次（如 Seed、A 轮、B 轮）。每一轮都可以设置融资前估值（Pre-money）和融资金额。",
  },
  {
    title: "第二步：导入估值与扩张资本",
    body: "Pre-money 估值可从估值工具（T05）或财务路线图（T06）导入。如果你做了门店扩张规划（T07），可以直接将扩张资本需求导入为种子轮融资额。",
  },
  {
    title: "第三步：查看稀释瀑布图",
    body: "系统根据每轮 Pre-money 与融资金额，自动计算 Post-money 估值、新投资人持股比例，以及创始人在每轮后的剩余股权百分比。",
  },
  {
    title: "第四步：资金用途分配",
    body: "每一轮资金都可以拆分为：产品研发、业务扩张、运营资金、团队建设四大用途。投资人喜欢看到清晰的资金用途规划。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  if (!isFinite(n) || isNaN(n) || n === 0) return "—";
  const abs = Math.abs(n);
  return sym + " " + abs.toLocaleString("en-MY", { maximumFractionDigits: 0 });
}

function pct(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  return n.toFixed(1) + "%";
}

const ROUND_COLORS: Record<RoundType, string> = {
  "Seed": "#A0A09A",
  "Pre-A": "#B8B0A0",
  "Series A": "#C9A84C",
  "Series B": "#D4B86A",
  "Series C": "#E2C97A",
  "Pre-IPO": "#4CAF50",
  "IPO": "#22C55E",
};

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

function NumInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="py-1.5" style={{ borderBottom: "1px solid #E8DFCF" }}>
      <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{
            backgroundColor: "#F8F6F1",
            border: "1px solid #E8DFCF",
            color: "#2B2B2B",
            paddingLeft: prefix ? "2rem" : "0.5rem",
            paddingRight: suffix ? "2rem" : "0.5rem",
          }}
          onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
          onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function FundraisingPlanTool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T08Form>("fundraising-plan");
  const [form, setForm] = useState<T08Form>(DEFAULT_FORM);
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
              // Pre-fill founder shares from T09 if available
              if (d.totalShares) {
                setForm((p) => ({ ...p, totalSharesPre: String(d.totalShares) }));
              }
              if (d.founderPct && d.totalShares) {
                const fShares = Math.round((d.founderPct / 100) * d.totalShares);
                setForm((p) => ({ ...p, founderSharesPre: String(fShares) }));
              }
              // Store expansion capital for import hint
              if (d.expansionTotalCapital) {
                setForm((p) => ({ ...p, importedExpansionCapital: String(d.expansionTotalCapital) }));
              }
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";
  const pf = (v: string | number) => parseFloat(String(v)) || 0;

  // ── Helpers ────────────────────────────────────────────────────────────

  function updateRound(idx: number, field: keyof Round, value: string | boolean) {
    setForm((p) => {
      const rounds = [...p.rounds];
      rounds[idx] = { ...rounds[idx], [field]: value };
      return { ...p, rounds };
    });
  }

  // ── Calculations ──────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const founderSharesPre = pf(form.founderSharesPre);
    const totalSharesPre = pf(form.totalSharesPre);

    const enabledRounds = form.rounds.filter((r) => r.enabled);

    // Waterfall: simulate share dilution round by round
    let currentTotalShares = totalSharesPre;
    let founderShares = founderSharesPre;

    const waterfall = enabledRounds.map((r) => {
      const preMoney = pf(r.preMoneyValuation);
      const funding = pf(r.fundingAmount);
      if (preMoney <= 0 || funding <= 0) {
        return {
          type: r.type,
          preMoney,
          funding,
          postMoney: preMoney + funding,
          newSharesPct: 0,
          founderPctAfter: currentTotalShares > 0 ? (founderShares / currentTotalShares) * 100 : 0,
          totalShares: currentTotalShares,
          founderShares,
          useProduct: pf(r.useProduct),
          useExpansion: pf(r.useExpansion),
          useOperations: pf(r.useOperations),
          useTeam: pf(r.useTeam),
        };
      }
      const postMoney = preMoney + funding;
      const investorPct = (funding / postMoney) * 100;
      // New shares issued to investor: investorPct% of new total
      // newShares / (currentTotalShares + newShares) = investorPct/100
      // newShares = currentTotalShares * investorPct / (100 - investorPct)
      const newShares = currentTotalShares * (investorPct / (100 - investorPct));
      currentTotalShares = currentTotalShares + newShares;
      const founderPctAfter = (founderShares / currentTotalShares) * 100;

      return {
        type: r.type,
        preMoney,
        funding,
        postMoney,
        newSharesPct: investorPct,
        founderPctAfter,
        totalShares: currentTotalShares,
        founderShares,
        useProduct: pf(r.useProduct),
        useExpansion: pf(r.useExpansion),
        useOperations: pf(r.useOperations),
        useTeam: pf(r.useTeam),
      };
    });

    // Pre-round founder %
    const founderPctInitial = totalSharesPre > 0 ? (founderSharesPre / totalSharesPre) * 100 : 100;

    // Total funding raised
    const totalFunding = enabledRounds.reduce((s, r) => s + pf(r.fundingAmount), 0);

    // Chart data: founder equity dilution per round
    const dilutionChart = [
      { label: "创始前", founderPct: founderPctInitial },
      ...waterfall.map((w) => ({ label: w.type, founderPct: w.founderPctAfter })),
    ];

    // Valuation growth chart
    const valuationChart = [
      { label: "创始前", valuation: pf(enabledRounds[0]?.preMoneyValuation ?? "0") },
      ...waterfall.map((w) => ({ label: w.type, valuation: w.postMoney })),
    ];

    // Fund use breakdown (weighted by funding amount)
    const totalFundingForUse = waterfall.reduce((s, w) => s + w.funding, 0);
    const useProduct = totalFundingForUse > 0 ? waterfall.reduce((s, w) => s + w.funding * w.useProduct / 100, 0) : 0;
    const useExpansion = totalFundingForUse > 0 ? waterfall.reduce((s, w) => s + w.funding * w.useExpansion / 100, 0) : 0;
    const useOperations = totalFundingForUse > 0 ? waterfall.reduce((s, w) => s + w.funding * w.useOperations / 100, 0) : 0;
    const useTeam = totalFundingForUse > 0 ? waterfall.reduce((s, w) => s + w.funding * w.useTeam / 100, 0) : 0;

    // Latest round for FinancialCore publish
    const latestRound = waterfall[waterfall.length - 1];

    return {
      waterfall,
      founderPctInitial,
      totalFunding,
      dilutionChart,
      valuationChart,
      useProduct,
      useExpansion,
      useOperations,
      useTeam,
      totalFundingForUse,
      latestRound,
    };
  }, [form]);

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

      const existing = await fetch(
        `/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(companyId)}`
      ).then((r) => r.json());
      const core = existing?.data ?? {};

      const lr = calc.latestRound;
      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId,
          data: {
            ...core,
            latestRoundPreMoney: lr?.preMoney ?? undefined,
            latestRoundPostMoney: lr?.postMoney ?? undefined,
            latestRoundType: lr?.type ?? undefined,
            updatedBy: { ...(core.updatedBy ?? {}), "fundraising-plan": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="fundraising-plan" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "Fundraising Plan" : "融资规划"}
      desc={locale === "en" ? "Multi-round fundraising planner from Seed to IPO with dilution waterfall" : "多轮融资规划，从种子轮到 IPO，含股权稀释瀑布图"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Founder share base ────────────────────────────────────────── */}
        <Card>
          <SLabel>创始人股权基础（融资前）</SLabel>
          <div className="grid grid-cols-2 gap-4">
            <NumInput
              label="创始人持股数量"
              value={form.founderSharesPre}
              onChange={(v) => setForm((p) => ({ ...p, founderSharesPre: v }))}
              suffix="股"
            />
            <NumInput
              label="公司总股数（含 ESOP）"
              value={form.totalSharesPre}
              onChange={(v) => setForm((p) => ({ ...p, totalSharesPre: v }))}
              suffix="股"
            />
          </div>
          <div
            className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg"
            style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <span className="text-xs" style={{ color: "#7A7A7A" }}>融资前创始人持股比例</span>
            <span className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>
              {pct(calc.founderPctInitial)}
            </span>
          </div>
        </Card>

        {/* ── T05/T06 valuation import hints ───────────────────────────── */}
        {(coreData?.currentValuation || coreData?.roadmapYear1PAT || form.importedExpansionCapital) && (
          <div className="space-y-2">
            {coreData?.currentValuation && (
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <span className="text-xs" style={{ color: "#7A7A7A" }}>
                  当前估值（T05）：{fmt(coreData.currentValuation, sym)}
                </span>
                <button
                  onClick={() => updateRound(0, "preMoneyValuation", String(Math.round(coreData.currentValuation!)))}
                  className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                >
                  导入至 Seed Pre-money
                </button>
              </div>
            )}
            {coreData?.roadmapYear1PAT && coreData?.valuationPEMultiple && (
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <span className="text-xs" style={{ color: "#7A7A7A" }}>
                  路线图第 1 年估值（T06）：{fmt(coreData.roadmapYear1PAT * coreData.valuationPEMultiple, sym)}
                </span>
                <button
                  onClick={() => {
                    const val = Math.round(coreData.roadmapYear1PAT! * coreData.valuationPEMultiple!);
                    // Find Series A index
                    const aIdx = form.rounds.findIndex((r) => r.type === "Series A");
                    if (aIdx >= 0) updateRound(aIdx, "preMoneyValuation", String(val));
                  }}
                  className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                >
                  导入至 A 轮 Pre-money
                </button>
              </div>
            )}
            {form.importedExpansionCapital && (
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <span className="text-xs" style={{ color: "#7A7A7A" }}>
                  门店扩张资本需求（T07）：{fmt(pf(form.importedExpansionCapital), sym)}
                </span>
                <button
                  onClick={() => {
                    const seedIdx = form.rounds.findIndex((r) => r.type === "Seed");
                    if (seedIdx >= 0) updateRound(seedIdx, "fundingAmount", form.importedExpansionCapital);
                  }}
                  className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                >
                  导入至 Seed 融资额
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Round cards ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {form.rounds.map((r, idx) => {
            const waterfallEntry = calc.waterfall.find((w) => w.type === r.type);
            const useSum = pf(r.useProduct) + pf(r.useExpansion) + pf(r.useOperations) + pf(r.useTeam);

            return (
              <Card key={r.type} accent={r.enabled}>
                {/* Round header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: r.enabled ? ROUND_COLORS[r.type] : "#333330" }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: r.enabled ? "#2B2B2B" : "#9A9490" }}
                    >
                      {r.type}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs" style={{ color: "#7A7A7A" }}>
                      {r.enabled ? "已启用" : "未启用"}
                    </span>
                    <div
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: r.enabled ? "rgba(201,168,76,0.3)" : "#F8F6F1" }}
                      onClick={() => updateRound(idx, "enabled", !r.enabled)}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                        style={{
                          backgroundColor: r.enabled ? "#C9A84C" : "#D0C8BC",
                          transform: r.enabled ? "translateX(18px)" : "translateX(2px)",
                        }}
                      />
                    </div>
                  </label>
                </div>

                {r.enabled && (
                  <>
                    {/* Valuation + Funding inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <NumInput
                        label="融资前估值 (Pre-money)"
                        value={r.preMoneyValuation}
                        onChange={(v) => updateRound(idx, "preMoneyValuation", v)}
                        prefix={sym}
                        placeholder="0"
                      />
                      <NumInput
                        label="本轮融资金额"
                        value={r.fundingAmount}
                        onChange={(v) => updateRound(idx, "fundingAmount", v)}
                        prefix={sym}
                        placeholder="0"
                      />
                    </div>

                    {/* Auto-calculated outputs */}
                    {waterfallEntry && pf(r.preMoneyValuation) > 0 && pf(r.fundingAmount) > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: "融资后估值", value: fmt(waterfallEntry.postMoney, sym), color: "#C9A84C" },
                          { label: "新投资人持股", value: pct(waterfallEntry.newSharesPct), color: "#9A9490" },
                          { label: "创始人剩余股权", value: pct(waterfallEntry.founderPctAfter), color: waterfallEntry.founderPctAfter >= 50 ? "#22C55E" : waterfallEntry.founderPctAfter >= 30 ? "#F59E0B" : "#EF4444" },
                        ].map(({ label, value, color }) => (
                          <div
                            key={label}
                            className="flex flex-col items-center px-3 py-2.5 rounded-xl"
                            style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
                          >
                            <span className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</span>
                            <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fund use split */}
                    <div>
                      <p className="text-xs mb-2" style={{ color: "#7A7A7A" }}>
                        资金用途分配
                        {Math.abs(useSum - 100) > 1 && (
                          <span className="ml-2" style={{ color: "#EF4444" }}>
                            （合计 {useSum.toFixed(0)}%，应为 100%）
                          </span>
                        )}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "产品研发", field: "useProduct" as keyof Round },
                          { label: "业务扩张", field: "useExpansion" as keyof Round },
                          { label: "运营资金", field: "useOperations" as keyof Round },
                          { label: "团队建设", field: "useTeam" as keyof Round },
                        ].map(({ label, field }) => (
                          <div key={field}>
                            <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>{label}</p>
                            <div className="relative">
                              <input
                                type="number"
                                value={r[field] as string}
                                onChange={(e) => updateRound(idx, field, e.target.value)}
                                className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
                                style={{
                                  backgroundColor: "#F8F6F1",
                                  border: "1px solid #E8DFCF",
                                  color: "#2B2B2B",
                                  paddingLeft: "0.5rem",
                                  paddingRight: "1.8rem",
                                }}
                                onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                                onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#7A7A7A" }}>%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>

        {/* ── Summary KPIs ─────────────────────────────────────────────── */}
        {calc.waterfall.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "计划融资轮次", value: String(calc.waterfall.filter((w) => w.funding > 0).length) + " 轮" },
              { label: "计划融资总额", value: fmt(calc.totalFunding, sym) },
              { label: "最终创始人股权", value: calc.waterfall.length > 0 ? pct(calc.waterfall[calc.waterfall.length - 1].founderPctAfter) : "—" },
              { label: "最终估值 (Post)", value: calc.waterfall.length > 0 ? fmt(calc.waterfall[calc.waterfall.length - 1].postMoney, sym) : "—" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center px-4 py-4 rounded-2xl"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <span className="text-xs mb-1.5" style={{ color: "#7A7A7A" }}>{label}</span>
                <span className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Dilution waterfall chart ──────────────────────────────────── */}
        {calc.dilutionChart.length > 1 && (
          <Card>
            <SLabel>创始人股权稀释瀑布图</SLabel>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={calc.dilutionChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => v + "%"}
                  tick={{ fill: "#7A7A7A", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 8 }}
                  labelStyle={{ color: "#2B2B2B", fontSize: 12 }}
                  itemStyle={{ color: "#C9A84C", fontSize: 12 }}
                  formatter={(v: number) => [v.toFixed(1) + "%", "创始人持股"]}
                />
                <Bar dataKey="founderPct" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {calc.dilutionChart.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.founderPct >= 50 ? "#C9A84C" : entry.founderPct >= 30 ? "#F59E0B" : "#EF4444"}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="founderPct"
                  stroke="#C9A84C"
                  strokeWidth={2}
                  dot={{ fill: "#C9A84C", r: 3 }}
                  strokeDasharray="4 3"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── Valuation growth chart ────────────────────────────────────── */}
        {calc.valuationChart.filter((d) => d.valuation > 0).length > 1 && (
          <Card>
            <SLabel>各轮次估值增长图</SLabel>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calc.valuationChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFCF" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#7A7A7A", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
                    if (v >= 1_000) return (v / 1_000).toFixed(0) + "K";
                    return String(v);
                  }}
                  tick={{ fill: "#7A7A7A", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", borderRadius: 8 }}
                  labelStyle={{ color: "#2B2B2B", fontSize: 12 }}
                  formatter={(v: number) => [fmt(v, sym), "Post-money 估值"]}
                />
                <Bar dataKey="valuation" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {calc.valuationChart.map((_, i) => (
                    <Cell key={i} fill={i === calc.valuationChart.length - 1 ? "#22C55E" : "#C9A84C"} fillOpacity={0.6 + i * 0.08} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── Fund use breakdown ────────────────────────────────────────── */}
        {calc.totalFundingForUse > 0 && (
          <Card>
            <SLabel>资金用途总额分配</SLabel>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "产品研发", amount: calc.useProduct, color: "#C9A84C" },
                { label: "业务扩张", amount: calc.useExpansion, color: "#4CAF50" },
                { label: "运营资金", amount: calc.useOperations, color: "#9A9490" },
                { label: "团队建设", amount: calc.useTeam, color: "#6B9FD4" },
              ].map(({ label, amount, color }) => (
                <div
                  key={label}
                  className="flex flex-col px-4 py-3.5 rounded-xl"
                  style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
                  </div>
                  <span className="text-base font-bold font-mono" style={{ color }}>
                    {fmt(amount, sym)}
                  </span>
                  <span className="text-xs font-mono mt-0.5" style={{ color: "#7A7A7A" }}>
                    {calc.totalFundingForUse > 0 ? ((amount / calc.totalFundingForUse) * 100).toFixed(1) + "%" : "—"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Save button ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          {lastSaved && (
            <p className="text-xs" style={{ color: "#7A7A7A" }}>
              上次保存：{new Date(lastSaved).toLocaleString("zh-CN")}
            </p>
          )}
        </div>

      </div>
    </ToolShell>
  );
}
