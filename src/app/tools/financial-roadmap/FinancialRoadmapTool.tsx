"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";

// ── Types ──────────────────────────────────────────────────────────────────

type InvestorType =
  | "Founder"
  | "Angel Investor"
  | "Venture Capital"
  | "Private Equity"
  | "Strategic Investor"
  | "Investment Banker"
  | "Public Market";

const INVESTOR_TYPES: InvestorType[] = [
  "Founder",
  "Angel Investor",
  "Venture Capital",
  "Private Equity",
  "Strategic Investor",
  "Investment Banker",
  "Public Market",
];

const INVESTOR_ZH: Record<InvestorType, string> = {
  "Founder": "创办人",
  "Angel Investor": "天使投资人",
  "Venture Capital": "风险投资（VC）",
  "Private Equity": "私募股权（PE）",
  "Strategic Investor": "战略投资人",
  "Investment Banker": "投资银行",
  "Public Market": "公开市场",
};

interface Round {
  id: string;
  stageName: string;
  stageNameZh: string;
  intervalMonths: string;
  investorType: InvestorType;
  preMoneyValuation: string;
  investmentAmount: string;
  peMultiple: string;
  isFounder: boolean;
  initialValuation: string;
}

interface T06FRForm {
  rounds: Round[];
  currencySymbol: string;
}

// ── Default Data ───────────────────────────────────────────────────────────

let _idCounter = 0;
function makeId(): string {
  return `r${Date.now().toString(36)}${(++_idCounter).toString(36)}`;
}

const DEFAULT_ROUNDS: Round[] = [
  {
    id: "founder", stageName: "Founder", stageNameZh: "创办人",
    intervalMonths: "0", investorType: "Founder",
    preMoneyValuation: "0", investmentAmount: "0", peMultiple: "6",
    isFounder: true, initialValuation: "3000000",
  },
  {
    id: "angel", stageName: "Angel", stageNameZh: "天使轮",
    intervalMonths: "4", investorType: "Angel Investor",
    preMoneyValuation: "3000000", investmentAmount: "500000", peMultiple: "7",
    isFounder: false, initialValuation: "0",
  },
  {
    id: "series-a", stageName: "Series A", stageNameZh: "A 轮",
    intervalMonths: "12", investorType: "Venture Capital",
    preMoneyValuation: "8000000", investmentAmount: "2000000", peMultiple: "9",
    isFounder: false, initialValuation: "0",
  },
  {
    id: "series-b", stageName: "Series B", stageNameZh: "B 轮",
    intervalMonths: "18", investorType: "Venture Capital",
    preMoneyValuation: "20000000", investmentAmount: "5000000", peMultiple: "11",
    isFounder: false, initialValuation: "0",
  },
  {
    id: "series-c", stageName: "Series C", stageNameZh: "C 轮",
    intervalMonths: "18", investorType: "Private Equity",
    preMoneyValuation: "50000000", investmentAmount: "15000000", peMultiple: "13",
    isFounder: false, initialValuation: "0",
  },
  {
    id: "ipo", stageName: "IPO", stageNameZh: "首次公开发行",
    intervalMonths: "24", investorType: "Public Market",
    preMoneyValuation: "150000000", investmentAmount: "50000000", peMultiple: "18",
    isFounder: false, initialValuation: "0",
  },
];

const DEFAULT_FORM: T06FRForm = {
  rounds: DEFAULT_ROUNDS,
  currencySymbol: "RM",
};

// ── Guide Steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "融资路线图的作用",
    body: "融资路线图帮你模拟从创办到 IPO 的完整股权稀释过程，清楚看到每一轮融资后创办人和各轮投资人的持股比例、市值变化与净利润目标。",
  },
  {
    title: "Pre-Money 与 Post-Money",
    body: "Pre-Money Valuation（融资前估值）是新投资人进入前公司的价值。Post-Money = Pre-Money + 投资金额。新投资人持股 = 投资金额 ÷ Post-Money。",
  },
  {
    title: "股权稀释原理",
    body: "每一轮新投资人进入时，现有股东的持股比例都会被等比例稀释。稀释后持股 = 原持股 × （1 - 新投资人持股比例）。虽然比例降低，但估值上升后市值不一定下降。",
  },
  {
    title: "PE 与 PAT 目标",
    body: "PE（市盈率倍数）= 估值 ÷ 净利润。系统自动计算：要支撑这一轮估值，企业需要达到的目标净利润（PAT）= Post-Money ÷ PE。",
  },
  {
    title: "市值下降提醒",
    body: "当新一轮的 Pre-Money Valuation 低于上一轮的 Post-Money Valuation，会触发提醒：前一轮股东的账面市值可能下降。这不代表公司出问题，但需要与老股东沟通清楚。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function pf(v: string): number {
  return parseFloat((v ?? "").toString().replace(/,/g, "")) || 0;
}

function fmt(n: number, sym: string): string {
  if (!isFinite(n)) return sym + " —";
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + sym + " " + s;
}

function fmtPct(n: number): string {
  if (!isFinite(n)) return "—";
  return (n * 100).toFixed(1) + "%";
}

// ── Computed Types ─────────────────────────────────────────────────────────

interface Stakeholder {
  id: string;
  label: string;
  zh: string;
}

interface ComputedRound {
  round: Round;
  idx: number;
  preMoney: number;
  investment: number;
  postMoney: number;
  newInvestorPct: number;
  pe: number;
  patTarget: number;
  capSnapshot: Record<string, number>;
  valueSnapshot: Record<string, number>;
  downRoundIds: string[];
  totalMonths: number;
}

function computeRounds(form: T06FRForm): {
  computed: ComputedRound[];
  stakeholders: Stakeholder[];
} {
  const rounds = form.rounds;
  const stakeholders: Stakeholder[] = [];
  let cap: Record<string, number> = {};
  let prevValueSnapshot: Record<string, number> = {};
  let totalMonths = 0;
  const computed: ComputedRound[] = [];

  for (let i = 0; i < rounds.length; i++) {
    const r = rounds[i];
    const pe = pf(r.peMultiple);
    let postMoney: number, preMoney: number, investment: number, newInvestorPct: number;

    if (r.isFounder) {
      postMoney = pf(r.initialValuation);
      preMoney = postMoney;
      investment = 0;
      newInvestorPct = 0;
      stakeholders.push({ id: r.id, label: r.stageName, zh: r.stageNameZh });
      cap = { [r.id]: 1.0 };
    } else {
      preMoney = pf(r.preMoneyValuation);
      investment = pf(r.investmentAmount);
      postMoney = preMoney + investment;
      newInvestorPct = postMoney > 0 ? investment / postMoney : 0;
      stakeholders.push({ id: r.id, label: r.stageName, zh: r.stageNameZh });
      const newCap: Record<string, number> = {};
      for (const [key, pct] of Object.entries(cap)) {
        newCap[key] = pct * (1 - newInvestorPct);
      }
      if (newInvestorPct > 0) newCap[r.id] = newInvestorPct;
      cap = newCap;
    }

    totalMonths += pf(r.intervalMonths);
    const patTarget = pe > 0 && postMoney > 0 ? postMoney / pe : 0;

    const valueSnapshot: Record<string, number> = {};
    for (const [key, pct] of Object.entries(cap)) {
      valueSnapshot[key] = pct * postMoney;
    }

    const downRoundIds: string[] = [];
    if (i > 0 && !r.isFounder) {
      for (const sh of stakeholders.slice(0, -1)) {
        const prev = prevValueSnapshot[sh.id] ?? 0;
        const curr = valueSnapshot[sh.id] ?? 0;
        if (prev > 0 && curr < prev - 1) downRoundIds.push(sh.id);
      }
    }

    computed.push({
      round: r, idx: i,
      preMoney, investment, postMoney, newInvestorPct,
      pe, patTarget,
      capSnapshot: { ...cap },
      valueSnapshot: { ...valueSnapshot },
      downRoundIds,
      totalMonths,
    });

    prevValueSnapshot = { ...valueSnapshot };
  }

  return { computed, stakeholders };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.25)" : "#E8DFCF"}` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

function FieldRow({
  label, children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid #F0EBE0" }}>
      <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
      <div className="flex-shrink-0 ml-3">{children}</div>
    </div>
  );
}

function NumInput({
  value, onChange, sym, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  sym?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      {sym && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>
          {sym}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        className="py-1 rounded-lg text-xs text-right outline-none font-mono appearance-none"
        style={{
          width: 140,
          paddingLeft: sym ? 28 : 8,
          paddingRight: 8,
          backgroundColor: "#F8F6F1",
          border: "1px solid #E8DFCF",
          color: "#2B2B2B",
        }}
        onFocus={(e) => { e.target.select(); (e.target as HTMLInputElement).style.borderColor = "#C9A84C"; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E8DFCF"; }}
      />
    </div>
  );
}

function TextInput({
  value, onChange, width,
}: { value: string; onChange: (v: string) => void; width?: number }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="py-1 px-2 rounded-lg text-xs outline-none"
      style={{
        width: width ?? 120,
        backgroundColor: "#F8F6F1",
        border: "1px solid #E8DFCF",
        color: "#2B2B2B",
      }}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#C9A84C"; }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E8DFCF"; }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function FinancialRoadmapTool() {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T06FRForm>("financial-roadmap");
  const [form, setForm] = useState<T06FRForm>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const ls = loadToolData(cid, "T06") ?? loadToolData("__default__", "T06");
    if (ls?.inputData) {
      const saved = ls.inputData as Partial<T06FRForm>;
      if (saved.rounds && Array.isArray(saved.rounds) && saved.rounds.length > 0) {
        setForm({ currencySymbol: "RM", ...saved });
        setLoaded(true);
        return;
      }
    }
    if (savedData) {
      const merged = { ...DEFAULT_FORM, ...savedData };
      if (!merged.rounds || !Array.isArray(merged.rounds) || merged.rounds.length === 0) {
        merged.rounds = DEFAULT_ROUNDS;
      }
      setForm(merged);
      setLoaded(true);
    }
  }, [savedData, loaded]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(handleSave, 500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const sym = form.currencySymbol || "RM";

  function updateRound(id: string, patch: Partial<Round>) {
    setForm((p) => ({
      ...p,
      rounds: p.rounds.map((r) => r.id === id ? { ...r, ...patch } : r),
    }));
  }

  function addRound() {
    const newRound: Round = {
      id: makeId(),
      stageName: "New Round",
      stageNameZh: "新轮次",
      intervalMonths: "12",
      investorType: "Venture Capital",
      preMoneyValuation: "0",
      investmentAmount: "0",
      peMultiple: "10",
      isFounder: false,
      initialValuation: "0",
    };
    setForm((p) => ({ ...p, rounds: [...p.rounds, newRound] }));
  }

  function deleteRound(id: string) {
    setForm((p) => ({ ...p, rounds: p.rounds.filter((r) => r.id !== id) }));
  }

  async function handleSave() {
    const companyId = getCompanyId();
    const cid = companyId === "__default__" ? "__default__" : companyId;
    saveToolData({
      companyId: cid,
      toolId: "T06",
      inputData: form as unknown as Record<string, unknown>,
      calculatedOutput: {},
      currency: sym,
    });
    await save(form);
  }

  const { computed, stakeholders } = useMemo(() => computeRounds(form), [form]);

  const allWarnings = computed.filter((c) => c.downRoundIds.length > 0);
  const guide = <ToolGuide toolSlug="financial-roadmap" steps={GUIDE_STEPS} />;

  // Cumulative months label
  function monthsLabel(totalMonths: number): string {
    if (totalMonths === 0) return "第 0 个月";
    const yr = Math.floor(totalMonths / 12);
    const mo = totalMonths % 12;
    if (yr === 0) return `第 ${mo} 个月`;
    if (mo === 0) return `第 ${yr} 年`;
    return `第 ${yr} 年 ${mo} 个月`;
  }

  function stakeLabel(id: string): string {
    return stakeholders.find((s) => s.id === id)?.zh ?? id;
  }

  return (
    <ToolShell
      icon=""
      title="融资路线图"
      desc="模拟融资轮次、股权稀释、估值成长与 IPO 路径"
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-6">

        {/* ── Section 1: Round Settings ────────────────────────────────── */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>融资阶段设置</SectionLabel>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "#7A7A7A" }}>货币</span>
                <select
                  value={sym}
                  onChange={(e) => setForm((p) => ({ ...p, currencySymbol: e.target.value }))}
                  className="text-xs py-1 px-2 rounded-lg outline-none"
                  style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                >
                  {["RM", "USD", "SGD", "HKD", "CNY", "IDR", "THB"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addRound}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
              >
                + 新增阶段
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {form.rounds.map((r, idx) => {
              const c = computed[idx];
              return (
                <div
                  key={r.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: r.isFounder ? "rgba(201,168,76,0.04)" : "#FAFAF8", border: "1px solid #E8DFCF" }}
                >
                  {/* Round header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: r.isFounder ? "rgba(201,168,76,0.15)" : "#F0EBE0", color: r.isFounder ? "#C9A84C" : "#9A9490" }}
                      >
                        {idx === 0 ? "创始" : `第 ${idx} 轮`}
                      </span>
                      <div className="flex items-center gap-2">
                        <TextInput
                          value={r.stageName}
                          onChange={(v) => updateRound(r.id, { stageName: v })}
                          width={100}
                        />
                        <span style={{ color: "#C0BAB0" }}>/</span>
                        <TextInput
                          value={r.stageNameZh}
                          onChange={(v) => updateRound(r.id, { stageNameZh: v })}
                          width={80}
                        />
                      </div>
                    </div>
                    {!r.isFounder && (
                      <button
                        onClick={() => deleteRound(r.id)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ color: "#B05050", backgroundColor: "rgba(176,80,80,0.07)", border: "1px solid rgba(176,80,80,0.2)" }}
                      >
                        删除
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6">
                    <div>
                      {!r.isFounder && (
                        <FieldRow label="距上一轮（个月）">
                          <NumInput value={r.intervalMonths} onChange={(v) => updateRound(r.id, { intervalMonths: v })} />
                        </FieldRow>
                      )}
                      <FieldRow label="投资人类型">
                        <select
                          value={r.investorType}
                          onChange={(e) => updateRound(r.id, { investorType: e.target.value as InvestorType })}
                          className="text-xs py-1 px-2 rounded-lg outline-none"
                          style={{ width: 140, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
                        >
                          {INVESTOR_TYPES.map((t) => (
                            <option key={t} value={t}>{INVESTOR_ZH[t]}</option>
                          ))}
                        </select>
                      </FieldRow>
                      {r.isFounder ? (
                        <FieldRow label="初始估值">
                          <NumInput sym={sym} value={r.initialValuation} onChange={(v) => updateRound(r.id, { initialValuation: v })} />
                        </FieldRow>
                      ) : (
                        <>
                          <FieldRow label="融资前估值（Pre-Money）">
                            <NumInput sym={sym} value={r.preMoneyValuation} onChange={(v) => updateRound(r.id, { preMoneyValuation: v })} />
                          </FieldRow>
                          <FieldRow label="投资金额">
                            <NumInput sym={sym} value={r.investmentAmount} onChange={(v) => updateRound(r.id, { investmentAmount: v })} />
                          </FieldRow>
                        </>
                      )}
                      <FieldRow label="PE 倍数">
                        <NumInput value={r.peMultiple} onChange={(v) => updateRound(r.id, { peMultiple: v })} placeholder="10" />
                      </FieldRow>
                    </div>
                    <div className="flex flex-col justify-center">
                      {/* Auto-computed summary */}
                      <div
                        className="rounded-xl px-4 py-3 space-y-1.5"
                        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
                      >
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>
                            {r.isFounder ? "创始估值" : "融资后估值（Post-Money）"}
                          </span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>
                            {fmt(c?.postMoney ?? 0, sym)}
                          </span>
                        </div>
                        {!r.isFounder && (
                          <div className="flex justify-between">
                            <span className="text-xs" style={{ color: "#9A9490" }}>本轮投资人持股</span>
                            <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>
                              {fmtPct(c?.newInvestorPct ?? 0)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>创办人持股</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#3D7A41" }}>
                            {fmtPct(c?.capSnapshot?.["founder"] ?? c?.capSnapshot?.[form.rounds[0]?.id] ?? 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>目标净利润（PAT）</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>
                            {c?.patTarget ? fmt(c.patTarget, sym) : "—"}
                          </span>
                        </div>
                        {c?.downRoundIds && c.downRoundIds.length > 0 && (
                          <div
                            className="text-xs px-2 py-1 rounded-md mt-1"
                            style={{ backgroundColor: "rgba(176,80,80,0.07)", color: "#B05050" }}
                          >
                            前轮股东账面市值可能下降
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Section 2: Roadmap Visual ─────────────────────────────────── */}
        <Card accent>
          <SectionLabel>融资路线图</SectionLabel>
          <div className="space-y-0">
            {computed.map((c, i) => (
              <div key={c.round.id}>
                {/* Time connector (not for Founder) */}
                {i > 0 && (
                  <div className="flex items-center gap-3 py-1 pl-4">
                    <div className="w-0.5 self-stretch" style={{ backgroundColor: "#E8DFCF", minHeight: 20 }} />
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5" style={{ backgroundColor: "#E8DFCF" }} />
                      <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>
                        {pf(c.round.intervalMonths) > 0 ? `+${pf(c.round.intervalMonths)} 个月` : "同期"}
                      </span>
                    </div>
                  </div>
                )}
                {/* Round card */}
                <div className="flex gap-3 items-start">
                  {/* Left: dot + line */}
                  <div className="flex flex-col items-center mt-3 flex-shrink-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.round.isFounder ? "#C9A84C" : i === computed.length - 1 ? "#3D7A41" : "#9A9490", border: "2px solid white", boxShadow: "0 0 0 2px #E8DFCF" }}
                    />
                  </div>
                  {/* Right: content */}
                  <div
                    className="flex-1 rounded-xl p-4 mb-1"
                    style={{
                      backgroundColor: c.downRoundIds.length > 0 ? "rgba(176,80,80,0.03)" : c.round.isFounder ? "rgba(201,168,76,0.05)" : "#FFFFFF",
                      border: `1px solid ${c.downRoundIds.length > 0 ? "rgba(176,80,80,0.15)" : c.round.isFounder ? "rgba(201,168,76,0.2)" : "#E8DFCF"}`,
                    }}
                  >
                    {/* Stage header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-bold" style={{ color: "#2B2B2B" }}>
                          {c.round.stageName}
                        </span>
                        <span className="text-xs ml-2" style={{ color: "#9A9490" }}>
                          {c.round.stageNameZh}
                        </span>
                        <span className="text-xs ml-2" style={{ color: "#B0AA9A" }}>
                          {INVESTOR_ZH[c.round.investorType]}
                        </span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>
                        {monthsLabel(c.totalMonths)}
                      </span>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs" style={{ color: "#9A9490" }}>
                          {c.round.isFounder ? "创始估值" : "融资后估值"}
                        </p>
                        <p className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>
                          {fmt(c.postMoney, sym)}
                        </p>
                      </div>
                      {!c.round.isFounder && (
                        <div>
                          <p className="text-xs" style={{ color: "#9A9490" }}>投资金额</p>
                          <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                            {fmt(c.investment, sym)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs" style={{ color: "#9A9490" }}>创办人持股</p>
                        <p className="text-sm font-bold font-mono" style={{ color: "#3D7A41" }}>
                          {fmtPct(c.capSnapshot[form.rounds[0]?.id] ?? 0)}
                        </p>
                      </div>
                      {!c.round.isFounder && (
                        <div>
                          <p className="text-xs" style={{ color: "#9A9490" }}>本轮投资人</p>
                          <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                            {fmtPct(c.newInvestorPct)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs" style={{ color: "#9A9490" }}>PE 倍数</p>
                        <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                          {pf(c.round.peMultiple)}x
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: "#9A9490" }}>目标净利润</p>
                        <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                          {c.patTarget > 0 ? fmt(c.patTarget, sym) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Section 3: Cap Table ──────────────────────────────────────── */}
        <Card>
          <SectionLabel>股权稀释表（Cap Table）</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8DFCF" }}>
                  <th className="text-left pb-2 pr-3 font-semibold" style={{ color: "#7A7A7A", whiteSpace: "nowrap", minWidth: 100 }}>
                    股东
                  </th>
                  {computed.map((c) => (
                    <th key={c.round.id} className="text-right pb-2 px-2 font-semibold" style={{ color: "#7A7A7A", whiteSpace: "nowrap", minWidth: 90 }}>
                      {c.round.stageNameZh}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Ownership % rows */}
                <tr>
                  <td colSpan={computed.length + 1} className="pt-3 pb-1">
                    <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>持股比例</span>
                  </td>
                </tr>
                {stakeholders.map((sh) => (
                  <tr key={sh.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                    <td className="py-1.5 pr-3 font-semibold" style={{ color: "#2B2B2B", whiteSpace: "nowrap" }}>
                      {sh.zh}
                    </td>
                    {computed.map((c) => {
                      const pct = c.capSnapshot[sh.id];
                      const visible = pct !== undefined && pct > 0.0001;
                      const isNew = !c.round.isFounder && c.round.id === sh.id;
                      return (
                        <td key={c.round.id} className="py-1.5 px-2 text-right font-mono" style={{
                          color: isNew ? "#C9A84C" : sh.id === form.rounds[0]?.id ? "#3D7A41" : "#2B2B2B",
                          fontWeight: isNew || sh.id === form.rounds[0]?.id ? 700 : 400,
                        }}>
                          {visible ? fmtPct(pct) : <span style={{ color: "#D0CBC0" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Value rows */}
                <tr>
                  <td colSpan={computed.length + 1} className="pt-4 pb-1">
                    <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>账面市值（{sym}）</span>
                  </td>
                </tr>
                {stakeholders.map((sh) => (
                  <tr key={`v-${sh.id}`} style={{ borderBottom: "1px solid #F0EBE0" }}>
                    <td className="py-1.5 pr-3" style={{ color: "#7A7A7A", whiteSpace: "nowrap" }}>
                      {sh.zh}
                    </td>
                    {computed.map((c, ci) => {
                      const val = c.valueSnapshot[sh.id];
                      const visible = val !== undefined && val > 0.5;
                      const isDown = c.downRoundIds.includes(sh.id);
                      const prevVal = ci > 0 ? computed[ci - 1].valueSnapshot[sh.id] : undefined;
                      const isUp = prevVal !== undefined && val !== undefined && val > prevVal + 1;
                      return (
                        <td key={c.round.id} className="py-1.5 px-2 text-right font-mono text-xs" style={{
                          color: isDown ? "#B05050" : isUp ? "#3D7A41" : "#2B2B2B",
                        }}>
                          {visible ? fmt(val, sym) : <span style={{ color: "#D0CBC0" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Post-money footer */}
                <tr style={{ borderTop: "2px solid #E8DFCF", backgroundColor: "rgba(201,168,76,0.04)" }}>
                  <td className="py-2 pr-3 font-bold text-xs" style={{ color: "#C9A84C" }}>融资后估值</td>
                  {computed.map((c) => (
                    <td key={c.round.id} className="py-2 px-2 text-right font-bold font-mono text-xs" style={{ color: "#C9A84C" }}>
                      {fmt(c.postMoney, sym)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Section 4: PE / PAT KPI ───────────────────────────────────── */}
        <Card>
          <SectionLabel>PE 倍数与目标净利润</SectionLabel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {computed.filter((c) => !c.round.isFounder).map((c) => (
              <div
                key={c.round.id}
                className="rounded-xl p-4"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>
                    {c.round.stageNameZh}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-md font-mono"
                    style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
                  >
                    {c.pe}x
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ color: "#9A9490" }}>融资后估值</p>
                <p className="text-base font-bold font-mono mb-2" style={{ color: "#C9A84C" }}>
                  {fmt(c.postMoney, sym)}
                </p>
                <div
                  className="rounded-lg px-3 py-2"
                  style={{ backgroundColor: "rgba(61,122,65,0.06)", border: "1px solid rgba(61,122,65,0.15)" }}
                >
                  <p className="text-xs mb-0.5" style={{ color: "#9A9490" }}>目标净利润（PAT）</p>
                  <p className="text-sm font-bold font-mono" style={{ color: "#3D7A41" }}>
                    {c.patTarget > 0 ? fmt(c.patTarget, sym) : "—"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#B0AA9A" }}>
                    = {fmt(c.postMoney, sym)} ÷ {c.pe}x
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Section 5: Warnings ───────────────────────────────────────── */}
        {allWarnings.length > 0 && (
          <div className="space-y-3">
            {allWarnings.map((c) => (
              <div
                key={c.round.id}
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: "rgba(176,80,80,0.05)", border: "1px solid rgba(176,80,80,0.2)" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "#B05050" }}>
                  估值提醒：{c.round.stageNameZh}（{c.round.stageName}）
                </p>
                <p className="text-xs mb-2" style={{ color: "#9A9490" }}>
                  本轮融资前估值低于上一轮融资后估值，以下股东账面市值可能下降：
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.downRoundIds.map((id) => (
                    <span
                      key={id}
                      className="text-xs px-2 py-1 rounded-md"
                      style={{ backgroundColor: "rgba(176,80,80,0.08)", color: "#B05050" }}
                    >
                      {stakeLabel(id)} 市值下降
                    </span>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: "#B0AA9A" }}>
                  建议：提高本轮融资前估值，或与前轮股东重新协商价格。
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Save status ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#9A9490" }}>
            {saving ? "正在保存..." : lastSaved ? `已自动保存 ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
        </div>

      </div>
    </ToolShell>
  );
}
