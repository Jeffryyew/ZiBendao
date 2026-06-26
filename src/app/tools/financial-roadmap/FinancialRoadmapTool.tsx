"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot, getCompanyId } from "@/lib/useToolSnapshot";
import { saveToolData, loadToolData } from "@/lib/toolData";
import type { FinancialCore } from "@/lib/financialCore";

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
  "Founder", "Angel Investor", "Venture Capital",
  "Private Equity", "Strategic Investor", "Investment Banker", "Public Market",
];

const INVESTOR_ZH: Record<InvestorType, string> = {
  "Founder": "创办人",
  "Angel Investor": "天使投资人",
  "Venture Capital": "风险投资（VC）",
  "Private Equity": "私募股权（PE）",
  "Strategic Investor": "战略投资人",
  "Investment Banker": "投资銀行",
  "Public Market": "公开市场",
};

interface Round {
  id: string;
  stageNameZh: string;
  intervalMonths: string;
  investorType: InvestorType;
  postMoneyValuation: string;
  investmentAmount: string;
  peMultiple: string;
  isFounder: boolean;
  initialValuation: string;
  hasCoFounder: boolean;
  founderPct: string;
  coFounderPct: string;
  registeredCapital: string;
}

interface T06FRForm {
  rounds: Round[];
  currencySymbol: string;
  currentStageId: string;
}

// ── Default Data ───────────────────────────────────────────────────────────

let _id = 0;
function makeId(): string { return `r${Date.now().toString(36)}${(++_id).toString(36)}`; }

const DEFAULT_ROUNDS: Round[] = [
  {
    id: "founder", stageNameZh: "创办人",
    intervalMonths: "0", investorType: "Founder",
    postMoneyValuation: "0", investmentAmount: "0", peMultiple: "6",
    isFounder: true, initialValuation: "3000000",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "100000",
  },
  {
    id: "angel", stageNameZh: "天使轮",
    intervalMonths: "4", investorType: "Angel Investor",
    postMoneyValuation: "3500000", investmentAmount: "500000", peMultiple: "7",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "series-a", stageNameZh: "A 轮",
    intervalMonths: "12", investorType: "Venture Capital",
    postMoneyValuation: "10000000", investmentAmount: "2000000", peMultiple: "9",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "series-b", stageNameZh: "B 轮",
    intervalMonths: "18", investorType: "Venture Capital",
    postMoneyValuation: "25000000", investmentAmount: "5000000", peMultiple: "11",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "series-c", stageNameZh: "C 轮",
    intervalMonths: "18", investorType: "Private Equity",
    postMoneyValuation: "65000000", investmentAmount: "15000000", peMultiple: "13",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "ipo", stageNameZh: "首次公开发行",
    intervalMonths: "24", investorType: "Public Market",
    postMoneyValuation: "200000000", investmentAmount: "50000000", peMultiple: "18",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
];

const DEFAULT_FORM: T06FRForm = { rounds: DEFAULT_ROUNDS, currencySymbol: "RM", currentStageId: "" };

// ── Guide Steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  { title: "融资路线图的作用", body: "从创办到 IPO 的完整股权稼释模拟，清楚看到每一轮融资后创办人和各轮投资人的持股比例、市值变化与净利润目标。" },
  { title: "Post-Money 与 Pre-Money", body: "用户填入融资后估值（Post-Money）和投资金额，系统自动计算融资前估值（Pre-Money = Post-Money − 投资金额）和投资人持股比例。" },
  { title: "股权稼释原理", body: "每一轮新投资人进入时，现有股东的持股比例都会被等比例稼释：稼释后持股 = 原持股 \xd7 （1 − 新投资人持股比例）。比例降低但估值上升时，市值仍可能增加。" },
  { title: "PE 与 PAT 目标", body: "PE（市盈率）= 估值 \xf7 净利润。目标净利润（PAT）= Post-Money \xf7 PE。填入PE倍数，系统自动算出这一轮估值对应的净利润要求。" },
  { title: "市值下降提醒", body: "当新一轮的 Pre-Money 低于上一轮的 Post-Money 时，系统会提醒：前一轮股东的账面市值可能下降，需与老股东沟通协商。" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function pf(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  return parseFloat(v.toString().replace(/,/g, "")) || 0;
}

function fmt(n: number, sym: string): string {
  if (!isFinite(n)) return `${sym} —`;
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + sym + " " + s;
}

function fmtPct(n: number): string {
  if (!isFinite(n) || n === 0) return "—";
  return (n * 100).toFixed(1) + "%";
}

function fmtNum(n: number): string {
  if (!isFinite(n) || n <= 0) return "—";
  return n.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Computed Types ─────────────────────────────────────────────────────────

interface Stakeholder { id: string; zh: string; }

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

function computeRounds(form: T06FRForm): { computed: ComputedRound[]; stakeholders: Stakeholder[] } {
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
      const fPct = r.hasCoFounder ? Math.min(100, Math.max(0, pf(r.founderPct))) / 100 : 1.0;
      const coPct = r.hasCoFounder ? Math.min(100, Math.max(0, pf(r.coFounderPct))) / 100 : 0;
      stakeholders.push({ id: r.id, zh: "创办人" });
      cap = { [r.id]: fPct };
      if (r.hasCoFounder && coPct > 0) {
        stakeholders.push({ id: r.id + "_co", zh: "联合创办人" });
        cap[r.id + "_co"] = coPct;
      }
    } else {
      postMoney = pf(r.postMoneyValuation);
      investment = pf(r.investmentAmount);
      preMoney = postMoney - investment;
      newInvestorPct = postMoney > 0 ? investment / postMoney : 0;
      stakeholders.push({ id: r.id, zh: r.stageNameZh });
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

    computed.push({ round: r, idx: i, preMoney, investment, postMoney, newInvestorPct, pe, patTarget, capSnapshot: { ...cap }, valueSnapshot: { ...valueSnapshot }, downRoundIds, totalMonths });
    prevValueSnapshot = { ...valueSnapshot };
  }
  return { computed, stakeholders };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${accent ? "rgba(201,168,76,0.25)" : "#E8DFCF"}` }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-mono mb-3" style={{ color: "#7A7A7A" }}>{children}</p>;
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-3" style={{ borderBottom: "1px solid #F0EBE0" }}>
      <span className="text-xs flex-shrink-0" style={{ color: "#7A7A7A" }}>{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function NumInput({ value, onChange, sym, placeholder, width }: {
  value: string; onChange: (v: string) => void; sym?: string; placeholder?: string; width?: number;
}) {
  return (
    <div className="relative">
      {sym && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: "#9A9490" }}>{sym}</span>}
      <input
        type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "0"}
        className="py-1 rounded-lg text-xs text-right outline-none font-mono appearance-none"
        style={{ width: width ?? 140, paddingLeft: sym ? 30 : 8, paddingRight: 8, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
        onFocus={(e) => { e.target.select(); (e.target as HTMLInputElement).style.borderColor = "#C9A84C"; }}
        onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E8DFCF"; }}
      />
    </div>
  );
}

function TextInput({ value, onChange, width, placeholder }: { value: string; onChange: (v: string) => void; width?: number; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="py-1 px-2 rounded-lg text-xs outline-none"
      style={{ width: width ?? 130, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#C9A84C"; }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E8DFCF"; }}
    />
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────

function DeleteModal({ name, onCancel, onConfirm }: { name: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
      <div className="rounded-2xl p-6 max-w-sm w-full mx-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8DFCF" }}>
        <p className="text-sm font-bold mb-2" style={{ color: "#2B2B2B" }}>确认删除</p>
        <p className="text-xs mb-5" style={{ color: "#7A7A7A" }}>
          确定要删除「{name}」这个融资阶段吗？删除后无法恢复。
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded-lg"
            style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#7A7A7A" }}>
            取消
          </button>
          <button onClick={onConfirm} className="text-xs px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: "rgba(176,80,80,0.1)", border: "1px solid rgba(176,80,80,0.3)", color: "#B05050" }}>
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Insert Round Button ────────────────────────────────────────────────────

function InsertBtn({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="flex-1 h-px" style={{ backgroundColor: "#E8DFCF" }} />
      <button onClick={onClick} className="text-xs px-2 py-0.5 rounded-md"
        style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#B0AA9A" }}>
        + 在此插入阶段
      </button>
      <div className="flex-1 h-px" style={{ backgroundColor: "#E8DFCF" }} />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function FinancialRoadmapTool() {
  const { savedData, save } = useToolSnapshot<T06FRForm>("financial-roadmap");
  const [form, setForm] = useState<T06FRForm>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draggingIdxRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartY = useRef(0);
  const roundListRef = useRef<HTMLDivElement | null>(null);

  // ── Load from localStorage / DB ──────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const cid = getCompanyId();
    const ls = loadToolData(cid, "T06") ?? loadToolData("__default__", "T06");
    if (ls?.inputData) {
      const saved = ls.inputData as Partial<T06FRForm>;
      if (saved.rounds && Array.isArray(saved.rounds) && saved.rounds.length > 0) {
        const migrated = saved.rounds.map((r: Partial<Round>) => {
          const base: Round = { ...DEFAULT_ROUNDS[0], id: makeId(), ...r } as Round;
          if (!base.postMoneyValuation && (r as Record<string,string>).preMoneyValuation) {
            base.postMoneyValuation = String(pf((r as Record<string,string>).preMoneyValuation) + pf(r.investmentAmount ?? "0"));
          }
          if (base.hasCoFounder === undefined) base.hasCoFounder = false;
          if (!base.founderPct) base.founderPct = "100";
          if (!base.coFounderPct) base.coFounderPct = "0";
          if (base.registeredCapital === undefined) base.registeredCapital = base.isFounder ? "100000" : "0";
          return base;
        });
        setForm({ currencySymbol: "RM", currentStageId: "", ...saved, rounds: migrated });
        setLoaded(true);
        return;
      }
    }
    if (savedData) {
      const merged = { ...DEFAULT_FORM, ...savedData };
      if (!merged.rounds || !Array.isArray(merged.rounds) || merged.rounds.length === 0) merged.rounds = DEFAULT_ROUNDS;
      setForm(merged);
      setLoaded(true);
      return;
    }
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, [savedData, loaded]);

  // ── Load currency from FinancialCore ─────────────────────────────────────
  useEffect(() => {
    const cid = getCompanyId();
    if (cid === "__default__") return;
    fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`)
      .then((r) => r.json())
      .then((snap) => {
        if (snap?.data) {
          const core = snap.data as FinancialCore;
          setCoreData(core);
          if (core.currencySymbol && !loadToolData(cid, "T06")?.inputData) {
            setForm((p) => ({ ...p, currencySymbol: core.currencySymbol ?? p.currencySymbol }));
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── Auto-save (500ms debounce) ─────────────────────────────────────────
  const formRef = useRef(form);
  formRef.current = form;
  const symRef = useRef(form.currencySymbol);
  symRef.current = form.currencySymbol;

  const handleSave = useCallback(async () => {
    const companyId = getCompanyId();
    const cid = companyId === "__default__" ? "__default__" : companyId;
    const f = formRef.current;
    const s = symRef.current;
    const { computed: comp, stakeholders: sh } = computeRounds(f);
    const lastRound = comp[comp.length - 1];
    const founderSh = sh.find(x => !x.id.endsWith("_co") && comp[0]?.capSnapshot[x.id] !== undefined);
    const cofounderSh = sh.find(x => x.id.endsWith("_co"));
    const founderFinalPct = founderSh ? (lastRound?.capSnapshot[founderSh.id] ?? 0) : 0;
    const cofounderFinalPct = cofounderSh ? (lastRound?.capSnapshot[cofounderSh.id] ?? 0) : 0;
    const totalInvested = comp.filter(c => !c.round.isFounder).reduce((acc, c) => acc + c.investment, 0);
    const ipoRound = comp.find(c => c.round.stageNameZh.includes("IPO") || c.round.stageNameZh.includes("首次"));
    const currentStageId = f.currentStageId;
    const selIdx = currentStageId ? comp.findIndex(c => c.round.id === currentStageId) : -1;
    const selRound = selIdx >= 0 ? comp[selIdx] : null;
    const nextRound = selIdx >= 0 && selIdx < comp.length - 1 ? comp[selIdx + 1] : null;
    const isAtIPO = selRound != null && (
      selRound.round.stageNameZh.includes("IPO") ||
      selRound.round.stageNameZh.includes("首次") ||
      selRound.round.investorType === "Public Market"
    );
    const calculatedOutput = {
      latestPostMoney: lastRound?.postMoney ?? 0,
      founderFinalPct,
      cofounderFinalPct,
      totalInvested,
      ipoTargetValuation: ipoRound?.postMoney ?? 0,
      ipoPatTarget: ipoRound?.patTarget ?? 0,
      latestPatTarget: lastRound?.patTarget ?? 0,
      latestPe: lastRound?.pe ?? 0,
      currentStageName: lastRound?.round.stageNameZh ?? "",
      roundCount: comp.length - 1,
      currentActualStageName: selRound?.round.stageNameZh ?? "",
      currentActualPostMoney: selRound?.postMoney ?? 0,
      currentStagePe: selRound?.pe ?? 0,
      currentStagePat: selRound?.patTarget ?? 0,
      nextStageName: nextRound?.round.stageNameZh ?? "",
      nextStagePostMoney: nextRound?.postMoney ?? 0,
      nextStagePat: nextRound?.patTarget ?? 0,
      nextStagePe: nextRound?.pe ?? 0,
      isAtIPO,
    };
    saveToolData({ companyId: cid, toolId: "T06", inputData: f as unknown as Record<string, unknown>, calculatedOutput, currency: s });
    await save(f);
    try {
      const existing = await fetch(`/api/tools/snapshot?toolSlug=_financial_core&companyId=${encodeURIComponent(cid)}`).then(r => r.json());
      const core = existing?.data ?? {};
      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId: cid,
          data: { ...core, currencySymbol: s, latestFundingPostMoney: lastRound?.postMoney ?? 0, latestFundingStage: lastRound?.round.stageNameZh ?? "", updatedBy: { ...(core.updatedBy ?? {}), "financial-roadmap": new Date().toISOString() } },
        }),
      });
    } catch {}
  }, [save]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(handleSave, 500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [form, loaded, handleSave]);

  const sym = form.currencySymbol || coreData?.currencySymbol || "RM";

  // ── Round mutations ───────────────────────────────────────────────────────

  function updateRound(id: string, patch: Partial<Round>) {
    setForm((p) => ({ ...p, rounds: p.rounds.map((r) => r.id === id ? { ...r, ...patch } : r) }));
  }

  function insertRoundAfter(afterIdx: number) {
    const newRound: Round = {
      id: makeId(), stageNameZh: "新轮次",
      intervalMonths: "12", investorType: "Venture Capital",
      postMoneyValuation: "0", investmentAmount: "0", peMultiple: "10",
      isFounder: false, initialValuation: "0",
      hasCoFounder: false, founderPct: "100", coFounderPct: "0", registeredCapital: "0",
    };
    setForm((p) => {
      const rounds = [...p.rounds];
      rounds.splice(afterIdx + 1, 0, newRound);
      return { ...p, rounds };
    });
  }

  function deleteRound(id: string) {
    setForm((p) => ({ ...p, rounds: p.rounds.filter((r) => r.id !== id) }));
    setDeleteConfirmId(null);
  }

  function moveRound(fromIdx: number, toIdx: number) {
    if (toIdx < 1 || toIdx >= form.rounds.length) return;
    setForm((p) => {
      const rounds = [...p.rounds];
      const [moved] = rounds.splice(fromIdx, 1);
      rounds.splice(toIdx, 0, moved);
      return { ...p, rounds };
    });
  }

  // ── Long-press drag handlers ──────────────────────────────────────────────
  function endDrag() {
    isDraggingRef.current = false;
    draggingIdxRef.current = null;
    setDraggingIdx(null);
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  }

  function onCardPointerDown(e: React.PointerEvent, idx: number) {
    if (form.rounds[idx]?.isFounder) return;
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    longPressRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      draggingIdxRef.current = idx;
      setDraggingIdx(idx);
      try { navigator.vibrate(30); } catch {}
      longPressRef.current = null;
    }, 300);
  }

  function onListPointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current) {
      if (longPressRef.current && Math.abs(e.clientY - dragStartY.current) > 10) {
        clearTimeout(longPressRef.current);
        longPressRef.current = null;
      }
      return;
    }
    e.preventDefault();
    const curIdx = draggingIdxRef.current;
    if (curIdx === null || !roundListRef.current) return;
    const cards = Array.from(roundListRef.current.querySelectorAll<HTMLElement>("[data-di]"));
    for (const card of cards) {
      const ti = parseInt(card.getAttribute("data-di")!);
      if (ti === curIdx || ti === 0) continue;
      const rect = card.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (ti < curIdx && e.clientY < mid) {
        setForm(p => { const rounds = [...p.rounds]; const [item] = rounds.splice(curIdx, 1); rounds.splice(ti, 0, item); return { ...p, rounds }; });
        draggingIdxRef.current = ti;
        setDraggingIdx(ti);
        break;
      } else if (ti > curIdx && e.clientY > mid) {
        setForm(p => { const rounds = [...p.rounds]; const [item] = rounds.splice(curIdx, 1); rounds.splice(ti, 0, item); return { ...p, rounds }; });
        draggingIdxRef.current = ti;
        setDraggingIdx(ti);
        break;
      }
    }
  }

  // ── Computation ───────────────────────────────────────────────────────────
  const { computed, stakeholders } = useMemo(() => computeRounds(form), [form]);
  const founderStakeholder = stakeholders[0];
  const coFounderStakeholder = stakeholders.find(s => s.id.endsWith("_co"));
  const allWarnings = computed.filter((c) => c.downRoundIds.length > 0);

  function stakeLabel(id: string): string {
    return stakeholders.find((s) => s.id === id)?.zh ?? id;
  }

  function monthsLabel(n: number): string {
    if (n === 0) return "第 0 个月";
    const yr = Math.floor(n / 12), mo = n % 12;
    if (yr === 0) return `第 ${mo} 个月`;
    if (mo === 0) return `第 ${yr} 年`;
    return `第 ${yr} 年 ${mo} 个月`;
  }

  const currencyOptions = Array.from(new Set([coreData?.currencySymbol ?? "RM", "USD"]));
  const guide = <ToolGuide toolSlug="financial-roadmap" steps={GUIDE_STEPS} />;

  return (
    <ToolShell icon="" title="融资路线图" desc="模拟融资轮次、股权稼释、估值成长与 IPO 路径" backHref="/student/dashboard" guideButton={guide}>
      <div className="space-y-6">

        {deleteConfirmId && (() => {
          const r = form.rounds.find(r => r.id === deleteConfirmId);
          return <DeleteModal name={r?.stageNameZh ?? ""} onCancel={() => setDeleteConfirmId(null)} onConfirm={() => deleteRound(deleteConfirmId)} />;
        })()}

        {/* Section 0: Current Actual Stage */}
        <Card accent>
          <SectionLabel>当前实际融资阶段</SectionLabel>
          <FieldRow label="目前企业所在阶段">
            <select
              value={form.currentStageId}
              onChange={(e) => setForm((p) => ({ ...p, currentStageId: e.target.value }))}
              className="text-xs py-1 px-2 rounded-lg outline-none"
              style={{ width: 200, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}>
              <option value="">请选择当前阶段</option>
              {form.rounds.map((r) => (
                <option key={r.id} value={r.id}>{r.stageNameZh}</option>
              ))}
            </select>
          </FieldRow>
          {form.currentStageId && (() => {
            const selIdx = computed.findIndex(c => c.round.id === form.currentStageId);
            const sel = selIdx >= 0 ? computed[selIdx] : null;
            const nxt = selIdx >= 0 && selIdx < computed.length - 1 ? computed[selIdx + 1] : null;
            const atIPO = sel ? (
              sel.round.stageNameZh.includes("IPO") ||
              sel.round.stageNameZh.includes("首次") ||
              sel.round.investorType === "Public Market"
            ) : false;
            if (!sel) return null;
            return (
              <div className="mt-3 rounded-xl px-4 py-3 space-y-2" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#9A9490" }}>当前融资阶段</span>
                  <span className="text-xs font-bold" style={{ color: "#C9A84C" }}>{sel.round.stageNameZh}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: "#9A9490" }}>当前估值</span>
                  <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>{fmt(sel.postMoney, sym)}</span>
                </div>
                {atIPO ? (
                  <div className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(61,122,65,0.08)", color: "#3D7A41", border: "1px solid rgba(61,122,65,0.2)" }}>
                    已达到上市阶段
                  </div>
                ) : nxt ? (
                  <div className="pt-2" style={{ borderTop: "1px solid #E8DFCF" }}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "#9A9490" }}>下一目标阶段</span>
                      <span className="text-xs font-bold" style={{ color: "#2B2B2B" }}>{nxt.round.stageNameZh}</span>
                    </div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "#9A9490" }}>下一阶段目标估值</span>
                      <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(nxt.postMoney, sym)}</span>
                    </div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "#9A9490" }}>下一阶段目标 PAT</span>
                      <span className="text-xs font-bold font-mono" style={{ color: "#3D7A41" }}>{nxt.patTarget > 0 ? fmt(nxt.patTarget, sym) : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: "#9A9490" }}>市盈率（PE）</span>
                      <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>PE {nxt.pe || "—"}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })()}
        </Card>

        {/* Section 1: Round Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>融资阶段设置</SectionLabel>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#7A7A7A" }}>货币</span>
              <select value={sym} onChange={(e) => setForm((p) => ({ ...p, currencySymbol: e.target.value }))}
                className="text-xs py-1 px-2 rounded-lg outline-none"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}>
                {currencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <InsertBtn onClick={() => insertRoundAfter(0)} />

          <div
            ref={roundListRef}
            onPointerMove={onListPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            onPointerCancel={endDrag}
          >
          {form.rounds.map((r, idx) => {
            const c = computed[idx];
            const isThisDragging = draggingIdx === idx;
            const canDrag = !r.isFounder;
            const preMoney = r.isFounder ? pf(r.initialValuation) : (pf(r.postMoneyValuation) - pf(r.investmentAmount));

            return (
              <div key={r.id}>
                <div
                  data-di={idx}
                  onPointerDown={canDrag ? (e) => onCardPointerDown(e, idx) : undefined}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: r.isFounder ? "rgba(201,168,76,0.04)" : "#FAFAF8",
                    border: `1px solid ${isThisDragging ? "#C9A84C" : "#E8DFCF"}`,
                    opacity: isThisDragging ? 0.95 : 1,
                    transform: isThisDragging ? "scale(1.02)" : "scale(1)",
                    boxShadow: isThisDragging ? "0 8px 24px rgba(0,0,0,0.10)" : "none",
                    cursor: canDrag ? (isThisDragging ? "grabbing" : "grab") : "default",
                    transition: "transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease, border-color 200ms ease",
                    touchAction: "none",
                    position: "relative",
                    zIndex: isThisDragging ? 10 : 0,
                    userSelect: "none",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: r.isFounder ? "rgba(201,168,76,0.15)" : "#F0EBE0", color: r.isFounder ? "#C9A84C" : "#9A9490" }}>
                        {idx === 0 ? "创始" : `第 ${idx} 轮`}
                      </span>
                      <TextInput value={r.stageNameZh} onChange={(v) => updateRound(r.id, { stageNameZh: v })} width={160} placeholder="阶段名称" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canDrag && (
                        <span className="text-xs px-1.5 py-0.5 rounded select-none pointer-events-none"
                          style={{ color: "#C9C4BA", fontSize: "0.65rem", letterSpacing: "0.05em" }}>
                          长按拖曳
                        </span>
                      )}
                      {!r.isFounder && (
                        <button onClick={() => setDeleteConfirmId(r.id)} className="text-xs px-2 py-1 rounded-lg"
                          style={{ color: "#B05050", backgroundColor: "rgba(176,80,80,0.07)", border: "1px solid rgba(176,80,80,0.2)" }}>
                          删除
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6">
                    <div>
                      {!r.isFounder && (
                        <FieldRow label="距上一轮（个月）">
                          <NumInput value={r.intervalMonths} onChange={(v) => updateRound(r.id, { intervalMonths: v })} width={120} />
                        </FieldRow>
                      )}
                      <FieldRow label="投资人类型">
                        <select value={r.investorType} onChange={(e) => updateRound(r.id, { investorType: e.target.value as InvestorType })}
                          className="text-xs py-1 px-2 rounded-lg outline-none"
                          style={{ width: 160, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}>
                          {INVESTOR_TYPES.map((t) => <option key={t} value={t}>{INVESTOR_ZH[t]}</option>)}
                        </select>
                      </FieldRow>
                      {r.isFounder ? (
                        <>
                          <FieldRow label="创始估值">
                            <NumInput sym={sym} value={r.initialValuation} onChange={(v) => updateRound(r.id, { initialValuation: v })} />
                          </FieldRow>
                          <FieldRow label="注册资本">
                            <NumInput sym={sym} value={r.registeredCapital} onChange={(v) => updateRound(r.id, { registeredCapital: v })} />
                          </FieldRow>
                          <FieldRow label="联合创办人">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={r.hasCoFounder}
                                onChange={(e) => updateRound(r.id, { hasCoFounder: e.target.checked })}
                                className="rounded" />
                              <span className="text-xs" style={{ color: "#7A7A7A" }}>有联合创办人</span>
                            </label>
                          </FieldRow>
                          {r.hasCoFounder && (
                            <>
                              <FieldRow label="创办人持股 %">
                                <NumInput value={r.founderPct} onChange={(v) => updateRound(r.id, { founderPct: v })} placeholder="70" width={120} />
                              </FieldRow>
                              <FieldRow label="联合创办人持股 %">
                                <NumInput value={r.coFounderPct} onChange={(v) => updateRound(r.id, { coFounderPct: v })} placeholder="30" width={120} />
                              </FieldRow>
                              {Math.abs(pf(r.founderPct) + pf(r.coFounderPct) - 100) > 0.1 && (
                                <p className="text-xs mt-1" style={{ color: "#C9863A" }}>
                                  提醒：创办人持股合计 {pf(r.founderPct) + pf(r.coFounderPct)}%，建议等于 100%
                                </p>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <FieldRow label="融资后估值（Post-Money）">
                            <NumInput sym={sym} value={r.postMoneyValuation} onChange={(v) => updateRound(r.id, { postMoneyValuation: v })} />
                          </FieldRow>
                          <FieldRow label="投资金额">
                            <NumInput sym={sym} value={r.investmentAmount} onChange={(v) => updateRound(r.id, { investmentAmount: v })} />
                          </FieldRow>
                          <div className="flex items-center justify-between py-1.5 gap-3">
                            <span className="text-xs" style={{ color: "#B0AA9A" }}>融资前估值（Pre-Money）</span>
                            <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>{fmt(preMoney, sym)}</span>
                          </div>
                        </>
                      )}
                      <FieldRow label="PE 倍数">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono" style={{ color: "#9A9490" }}>PE</span>
                          <NumInput value={r.peMultiple} onChange={(v) => updateRound(r.id, { peMultiple: v })} placeholder="10" width={80} />
                        </div>
                      </FieldRow>
                    </div>

                    <div className="flex flex-col justify-center mt-3 sm:mt-0">
                      <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>{r.isFounder ? "创始估值" : "融资后估值"}</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(c?.postMoney ?? 0, sym)}</span>
                        </div>
                        {!r.isFounder && (
                          <div className="flex justify-between">
                            <span className="text-xs" style={{ color: "#9A9490" }}>本轮投资人持股</span>
                            <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>{fmtPct(c?.newInvestorPct ?? 0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>创办人持股</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#3D7A41" }}>
                            {fmtPct(c?.capSnapshot?.[founderStakeholder?.id ?? "founder"] ?? 0)}
                          </span>
                        </div>
                        {coFounderStakeholder && (
                          <div className="flex justify-between">
                            <span className="text-xs" style={{ color: "#9A9490" }}>联合创办人持股</span>
                            <span className="text-xs font-bold font-mono" style={{ color: "#5A8AC0" }}>
                              {fmtPct(c?.capSnapshot?.[coFounderStakeholder.id] ?? 0)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>目标净利润（PAT）</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>
                            {c?.patTarget ? fmt(c.patTarget, sym) : "—"}
                          </span>
                        </div>
                        {c?.downRoundIds && c.downRoundIds.length > 0 && (
                          <div className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "rgba(176,80,80,0.07)", color: "#B05050" }}>
                            前轮股东账面市值可能下降
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {idx < form.rounds.length - 1 && <InsertBtn onClick={() => insertRoundAfter(idx)} />}
              </div>
            );
          })}
          </div>

          <InsertBtn onClick={() => insertRoundAfter(form.rounds.length - 1)} />
        </Card>

        {/* Section 2: Roadmap Visual */}
        <Card accent>
          <SectionLabel>融资路线图</SectionLabel>
          <div className="space-y-0">
            {computed.map((c, i) => (
              <div key={c.round.id}>
                {i > 0 && (
                  <div className="flex items-stretch gap-3 py-1 pl-4">
                    <div className="w-0.5" style={{ backgroundColor: "#E8DFCF" }} />
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-4 h-px" style={{ backgroundColor: "#E8DFCF" }} />
                      <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>
                        {pf(c.round.intervalMonths) > 0 ? `+${pf(c.round.intervalMonths)} 个月` : "同期"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 items-start">
                  <div className="flex flex-col items-center mt-3.5 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: c.round.isFounder ? "#C9A84C" : i === computed.length - 1 ? "#3D7A41" : "#9A9490",
                      border: "2px solid white", boxShadow: "0 0 0 2px #E8DFCF",
                    }} />
                  </div>
                  <div className="flex-1 rounded-xl p-4 mb-1" style={{
                    backgroundColor: c.downRoundIds.length > 0 ? "rgba(176,80,80,0.03)" : c.round.isFounder ? "rgba(201,168,76,0.05)" : "#FFFFFF",
                    border: `1px solid ${c.downRoundIds.length > 0 ? "rgba(176,80,80,0.15)" : c.round.isFounder ? "rgba(201,168,76,0.2)" : "#E8DFCF"}`,
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: "#2B2B2B" }}>{c.round.stageNameZh}</span>
                        <span className="text-xs" style={{ color: "#B0AA9A" }}>{INVESTOR_ZH[c.round.investorType]}</span>
                      </div>
                      <span className="text-xs font-mono flex-shrink-0" style={{ color: "#B0AA9A" }}>{monthsLabel(c.totalMonths)}</span>
                    </div>

                    {c.round.isFounder ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>创始估值</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(c.postMoney, sym)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>市盈率</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>PE {c.pe || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>目标净利润</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{c.patTarget > 0 ? fmt(c.patTarget, sym) : "—"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: "1px solid #F0EBE0" }}>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>注册资本</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                              {pf(c.round.registeredCapital) > 0 ? fmt(pf(c.round.registeredCapital), sym) : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>创办人</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#3D7A41" }}>
                              {fmtPct(c.capSnapshot[founderStakeholder?.id ?? "founder"] ?? 0)}
                            </p>
                          </div>
                          {coFounderStakeholder ? (
                            <div>
                              <p className="text-xs" style={{ color: "#9A9490" }}>联合创办人</p>
                              <p className="text-sm font-bold font-mono" style={{ color: "#5A8AC0" }}>
                                {fmtPct(c.capSnapshot[coFounderStakeholder.id] ?? 0)}
                              </p>
                            </div>
                          ) : <div />}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>融资后估值</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(c.postMoney, sym)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>市盈率</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>PE {c.pe || "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>目标净利润</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{c.patTarget > 0 ? fmt(c.patTarget, sym) : "—"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: "1px solid #F0EBE0" }}>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>投资金额</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{fmt(c.investment, sym)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>本轮持股</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{fmtPct(c.newInvestorPct)}</p>
                          </div>
                          <div />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Cap Table */}
        <Card>
          <SectionLabel>股权稼释表（Cap Table）</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8DFCF" }}>
                  <th className="text-left pb-2 pr-3 font-semibold" style={{ color: "#7A7A7A", whiteSpace: "nowrap", minWidth: 110 }}>股东</th>
                  {computed.map((c) => (
                    <th key={c.round.id} className="text-right pb-2 px-2 font-semibold" style={{ color: "#7A7A7A", whiteSpace: "nowrap", minWidth: 90 }}>
                      {c.round.stageNameZh}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={computed.length + 1} className="pt-3 pb-1">
                    <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>持股比例</span>
                  </td>
                </tr>
                {stakeholders.map((sh) => (
                  <tr key={sh.id} style={{ borderBottom: "1px solid #F0EBE0" }}>
                    <td className="py-1.5 pr-3 font-semibold" style={{ color: "#2B2B2B", whiteSpace: "nowrap" }}>{sh.zh}</td>
                    {computed.map((c) => {
                      const pct = c.capSnapshot[sh.id];
                      const visible = pct !== undefined && pct > 0.0001;
                      const isNew = !c.round.isFounder && c.round.id === sh.id;
                      const isFounderRow = sh.id === founderStakeholder?.id;
                      const isCoFound = sh.id === coFounderStakeholder?.id;
                      return (
                        <td key={c.round.id} className="py-1.5 px-2 text-right font-mono"
                          style={{ color: isNew ? "#C9A84C" : isFounderRow ? "#3D7A41" : isCoFound ? "#5A8AC0" : "#2B2B2B", fontWeight: isNew || isFounderRow || isCoFound ? 700 : 400 }}>
                          {visible ? fmtPct(pct) : <span style={{ color: "#D0CBC0" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td colSpan={computed.length + 1} className="pt-4 pb-1">
                    <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>账面市值（{sym}）</span>
                  </td>
                </tr>
                {stakeholders.map((sh) => (
                  <tr key={`v-${sh.id}`} style={{ borderBottom: "1px solid #F0EBE0" }}>
                    <td className="py-1.5 pr-3" style={{ color: "#7A7A7A", whiteSpace: "nowrap" }}>{sh.zh}</td>
                    {computed.map((c, ci) => {
                      const val = c.valueSnapshot[sh.id];
                      const visible = val !== undefined && val > 0.5;
                      const isDown = c.downRoundIds.includes(sh.id);
                      const prevVal = ci > 0 ? computed[ci - 1].valueSnapshot[sh.id] : undefined;
                      const isUp = prevVal !== undefined && val !== undefined && val > prevVal + 1;
                      return (
                        <td key={c.round.id} className="py-1.5 px-2 text-right font-mono text-xs"
                          style={{ color: isDown ? "#B05050" : isUp ? "#3D7A41" : "#2B2B2B", whiteSpace: "nowrap" }}>
                          {visible ? fmtNum(val) : <span style={{ color: "#D0CBC0" }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #E8DFCF", backgroundColor: "rgba(201,168,76,0.04)" }}>
                  <td className="py-2 pr-3 font-bold text-xs" style={{ color: "#C9A84C" }}>融资后估值</td>
                  {computed.map((c) => (
                    <td key={c.round.id} className="py-2 px-2 text-right font-bold font-mono text-xs" style={{ color: "#C9A84C", whiteSpace: "nowrap" }}>
                      {fmtNum(c.postMoney)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section 4: PE / PAT KPI */}
        <Card>
          <SectionLabel>目标净利润（PAT）</SectionLabel>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {computed.filter((c) => !c.round.isFounder).map((c) => (
              <div key={c.round.id} className="rounded-xl p-4" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: "#2B2B2B" }}>{c.round.stageNameZh}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono font-semibold"
                    style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}>
                    PE {c.pe}
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ color: "#9A9490" }}>融资后估值</p>
                <p className="text-base font-bold font-mono mb-2" style={{ color: "#C9A84C" }}>{fmt(c.postMoney, sym)}</p>
                <div className="rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(61,122,65,0.06)", border: "1px solid rgba(61,122,65,0.15)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#9A9490" }}>目标净利润（PAT）</p>
  