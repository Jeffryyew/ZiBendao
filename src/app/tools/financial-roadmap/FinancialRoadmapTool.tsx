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
  "Founder": "\u521b\u529e\u4eba",
  "Angel Investor": "\u5929\u4f7f\u6295\u8d44\u4eba",
  "Venture Capital": "\u98ce\u9669\u6295\u8d44\uff08VC\uff09",
  "Private Equity": "\u79c1\u52df\u80a1\u6743\uff08PE\uff09",
  "Strategic Investor": "\u6218\u7565\u6295\u8d44\u4eba",
  "Investment Banker": "\u6295\u8d44\u9280\u884c",
  "Public Market": "\u516c\u5f00\u5e02\u573a",
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
}

// ── Default Data ───────────────────────────────────────────────────────────

let _id = 0;
function makeId(): string { return `r${Date.now().toString(36)}${(++_id).toString(36)}`; }

const DEFAULT_ROUNDS: Round[] = [
  {
    id: "founder", stageNameZh: "\u521b\u529e\u4eba",
    intervalMonths: "0", investorType: "Founder",
    postMoneyValuation: "0", investmentAmount: "0", peMultiple: "6",
    isFounder: true, initialValuation: "3000000",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "100000",
  },
  {
    id: "angel", stageNameZh: "\u5929\u4f7f\u8f6e",
    intervalMonths: "4", investorType: "Angel Investor",
    postMoneyValuation: "3500000", investmentAmount: "500000", peMultiple: "7",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "series-a", stageNameZh: "A \u8f6e",
    intervalMonths: "12", investorType: "Venture Capital",
    postMoneyValuation: "10000000", investmentAmount: "2000000", peMultiple: "9",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "series-b", stageNameZh: "B \u8f6e",
    intervalMonths: "18", investorType: "Venture Capital",
    postMoneyValuation: "25000000", investmentAmount: "5000000", peMultiple: "11",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "series-c", stageNameZh: "C \u8f6e",
    intervalMonths: "18", investorType: "Private Equity",
    postMoneyValuation: "65000000", investmentAmount: "15000000", peMultiple: "13",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
  {
    id: "ipo", stageNameZh: "\u9996\u6b21\u516c\u5f00\u53d1\u884c",
    intervalMonths: "24", investorType: "Public Market",
    postMoneyValuation: "200000000", investmentAmount: "50000000", peMultiple: "18",
    isFounder: false, initialValuation: "0",
    hasCoFounder: false, founderPct: "100", coFounderPct: "0",
    registeredCapital: "0",
  },
];

const DEFAULT_FORM: T06FRForm = { rounds: DEFAULT_ROUNDS, currencySymbol: "RM" };

// ── Guide Steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  { title: "\u878d\u8d44\u8def\u7ebf\u56fe\u7684\u4f5c\u7528", body: "\u4ece\u521b\u529e\u5230 IPO \u7684\u5b8c\u6574\u80a1\u6743\u7a3c\u91ca\u6a21\u62df\uff0c\u6e05\u695a\u770b\u5230\u6bcf\u4e00\u8f6e\u878d\u8d44\u540e\u521b\u529e\u4eba\u548c\u5404\u8f6e\u6295\u8d44\u4eba\u7684\u6301\u80a1\u6bd4\u4f8b\u3001\u5e02\u503c\u53d8\u5316\u4e0e\u51c0\u5229\u6da6\u76ee\u6807\u3002" },
  { title: "Post-Money \u4e0e Pre-Money", body: "\u7528\u6237\u586b\u5165\u878d\u8d44\u540e\u4f30\u503c\uff08Post-Money\uff09\u548c\u6295\u8d44\u91d1\u989d\uff0c\u7cfb\u7edf\u81ea\u52a8\u8ba1\u7b97\u878d\u8d44\u524d\u4f30\u503c\uff08Pre-Money = Post-Money \u2212 \u6295\u8d44\u91d1\u989d\uff09\u548c\u6295\u8d44\u4eba\u6301\u80a1\u6bd4\u4f8b\u3002" },
  { title: "\u80a1\u6743\u7a3c\u91ca\u539f\u7406", body: "\u6bcf\u4e00\u8f6e\u65b0\u6295\u8d44\u4eba\u8fdb\u5165\u65f6\uff0c\u73b0\u6709\u80a1\u4e1c\u7684\u6301\u80a1\u6bd4\u4f8b\u90fd\u4f1a\u88ab\u7b49\u6bd4\u4f8b\u7a3c\u91ca\uff1a\u7a3c\u91ca\u540e\u6301\u80a1 = \u539f\u6301\u80a1 \xd7 \uff081 \u2212 \u65b0\u6295\u8d44\u4eba\u6301\u80a1\u6bd4\u4f8b\uff09\u3002\u6bd4\u4f8b\u964d\u4f4e\u4f46\u4f30\u503c\u4e0a\u5347\u65f6\uff0c\u5e02\u503c\u4ecd\u53ef\u80fd\u589e\u52a0\u3002" },
  { title: "PE \u4e0e PAT \u76ee\u6807", body: "PE\uff08\u5e02\u76c8\u7387\uff09= \u4f30\u503c \xf7 \u51c0\u5229\u6da6\u3002\u76ee\u6807\u51c0\u5229\u6da6\uff08PAT\uff09= Post-Money \xf7 PE\u3002\u586b\u5165PE\u500d\u6570\uff0c\u7cfb\u7edf\u81ea\u52a8\u7b97\u51fa\u8fd9\u4e00\u8f6e\u4f30\u503c\u5bf9\u5e94\u7684\u51c0\u5229\u6da6\u8981\u6c42\u3002" },
  { title: "\u5e02\u503c\u4e0b\u964d\u63d0\u9192", body: "\u5f53\u65b0\u4e00\u8f6e\u7684 Pre-Money \u4f4e\u4e8e\u4e0a\u4e00\u8f6e\u7684 Post-Money \u65f6\uff0c\u7cfb\u7edf\u4f1a\u63d0\u9192\uff1a\u524d\u4e00\u8f6e\u80a1\u4e1c\u7684\u8d26\u9762\u5e02\u503c\u53ef\u80fd\u4e0b\u964d\uff0c\u9700\u4e0e\u8001\u80a1\u4e1c\u6c9f\u901a\u534f\u5546\u3002" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function pf(v: string | number | undefined): number {
  if (v === undefined || v === null) return 0;
  return parseFloat(v.toString().replace(/,/g, "")) || 0;
}

function fmt(n: number, sym: string): string {
  if (!isFinite(n)) return `${sym} \u2014`;
  const abs = Math.abs(n);
  const s = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + sym + " " + s;
}

function fmtPct(n: number): string {
  if (!isFinite(n) || n === 0) return "\u2014";
  return (n * 100).toFixed(1) + "%";
}

function fmtNum(n: number): string {
  if (!isFinite(n) || n <= 0) return "\u2014";
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
      stakeholders.push({ id: r.id, zh: "\u521b\u529e\u4eba" });
      cap = { [r.id]: fPct };
      if (r.hasCoFounder && coPct > 0) {
        stakeholders.push({ id: r.id + "_co", zh: "\u8054\u5408\u521b\u529e\u4eba" });
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
        <p className="text-sm font-bold mb-2" style={{ color: "#2B2B2B" }}>\u786e\u8ba4\u5220\u9664</p>
        <p className="text-xs mb-5" style={{ color: "#7A7A7A" }}>
          \u786e\u5b9a\u8981\u5220\u9664\u300c{name}\u300d\u8fd9\u4e2a\u878d\u8d44\u9636\u6bb5\u5417\uff1f\u5220\u9664\u540e\u65e0\u6cd5\u6062\u590d\u3002
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="text-xs px-4 py-2 rounded-lg"
            style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#7A7A7A" }}>
            \u53d6\u6d88
          </button>
          <button onClick={onConfirm} className="text-xs px-4 py-2 rounded-lg font-semibold"
            style={{ backgroundColor: "rgba(176,80,80,0.1)", border: "1px solid rgba(176,80,80,0.3)", color: "#B05050" }}>
            \u786e\u8ba4\u5220\u9664
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
        + \u5728\u6b64\u63d2\u5165\u9636\u6bb5
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
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

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
        setForm({ currencySymbol: "RM", ...saved, rounds: migrated });
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
    const ipoRound = comp.find(c => c.round.stageNameZh.includes("IPO") || c.round.stageNameZh.includes("\u9996\u6b21"));
    const calculatedOutput = {
      latestPostMoney: lastRound?.postMoney ?? 0,
      founderFinalPct,
      cofounderFinalPct,
      totalInvested,
      ipoTargetValuation: ipoRound?.postMoney ?? 0,
      latestPatTarget: lastRound?.patTarget ?? 0,
      latestPe: lastRound?.pe ?? 0,
      currentStageName: lastRound?.round.stageNameZh ?? "",
      roundCount: comp.length - 1,
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
      id: makeId(), stageNameZh: "\u65b0\u8f6e\u6b21",
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

  // ── Drag-and-drop handlers ────────────────────────────────────────────────
  function onDragStart(e: React.DragEvent, idx: number) {
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(idx);
  }
  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (idx === 0) return;
    setDragOverIdx(idx);
  }
  function onDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== toIdx && toIdx !== 0) {
      moveRound(dragIdx, toIdx);
    }
    setDragIdx(null);
    setDragOverIdx(null);
  }
  function onDragEnd() { setDragIdx(null); setDragOverIdx(null); }

  // ── Computation ───────────────────────────────────────────────────────────
  const { computed, stakeholders } = useMemo(() => computeRounds(form), [form]);
  const founderStakeholder = stakeholders[0];
  const coFounderStakeholder = stakeholders.find(s => s.id.endsWith("_co"));
  const allWarnings = computed.filter((c) => c.downRoundIds.length > 0);

  function stakeLabel(id: string): string {
    return stakeholders.find((s) => s.id === id)?.zh ?? id;
  }

  function monthsLabel(n: number): string {
    if (n === 0) return "\u7b2c 0 \u4e2a\u6708";
    const yr = Math.floor(n / 12), mo = n % 12;
    if (yr === 0) return `\u7b2c ${mo} \u4e2a\u6708`;
    if (mo === 0) return `\u7b2c ${yr} \u5e74`;
    return `\u7b2c ${yr} \u5e74 ${mo} \u4e2a\u6708`;
  }

  const currencyOptions = Array.from(new Set([coreData?.currencySymbol ?? "RM", "USD"]));
  const guide = <ToolGuide toolSlug="financial-roadmap" steps={GUIDE_STEPS} />;

  return (
    <ToolShell icon="" title="\u878d\u8d44\u8def\u7ebf\u56fe" desc="\u6a21\u62df\u878d\u8d44\u8f6e\u6b21\u3001\u80a1\u6743\u7a3c\u91ca\u3001\u4f30\u503c\u6210\u957f\u4e0e IPO \u8def\u5f84" backHref="/student/dashboard" guideButton={guide}>
      <div className="space-y-6">

        {deleteConfirmId && (() => {
          const r = form.rounds.find(r => r.id === deleteConfirmId);
          return <DeleteModal name={r?.stageNameZh ?? ""} onCancel={() => setDeleteConfirmId(null)} onConfirm={() => deleteRound(deleteConfirmId)} />;
        })()}

        {/* Section 1: Round Settings */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <SectionLabel>\u878d\u8d44\u9636\u6bb5\u8bbe\u7f6e</SectionLabel>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "#7A7A7A" }}>\u8d27\u5e01</span>
              <select value={sym} onChange={(e) => setForm((p) => ({ ...p, currencySymbol: e.target.value }))}
                className="text-xs py-1 px-2 rounded-lg outline-none"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}>
                {currencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <InsertBtn onClick={() => insertRoundAfter(0)} />

          {form.rounds.map((r, idx) => {
            const c = computed[idx];
            const isDragging = dragIdx === idx;
            const isDragOver = dragOverIdx === idx;
            const canDrag = !r.isFounder;
            const preMoney = r.isFounder ? pf(r.initialValuation) : (pf(r.postMoneyValuation) - pf(r.investmentAmount));

            return (
              <div key={r.id}>
                <div
                  draggable={canDrag}
                  onDragStart={canDrag ? (e) => onDragStart(e, idx) : undefined}
                  onDragOver={canDrag ? (e) => onDragOver(e, idx) : undefined}
                  onDrop={canDrag ? (e) => onDrop(e, idx) : undefined}
                  onDragEnd={onDragEnd}
                  className="rounded-xl p-4 transition-opacity"
                  style={{
                    backgroundColor: r.isFounder ? "rgba(201,168,76,0.04)" : "#FAFAF8",
                    border: `1px solid ${isDragOver ? "#C9A84C" : "#E8DFCF"}`,
                    opacity: isDragging ? 0.4 : 1,
                    cursor: canDrag ? "grab" : "default",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: r.isFounder ? "rgba(201,168,76,0.15)" : "#F0EBE0", color: r.isFounder ? "#C9A84C" : "#9A9490" }}>
                        {idx === 0 ? "\u521b\u59cb" : `\u7b2c ${idx} \u8f6e`}
                      </span>
                      <TextInput value={r.stageNameZh} onChange={(v) => updateRound(r.id, { stageNameZh: v })} width={160} placeholder="\u9636\u6bb5\u540d\u79f0" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!r.isFounder && idx > 1 && (
                        <button onClick={() => moveRound(idx, idx - 1)} className="text-xs px-2 py-1 rounded-md"
                          style={{ backgroundColor: "#F0EBE0", color: "#9A9490", border: "1px solid #E8DFCF" }}>&#8593;</button>
                      )}
                      {!r.isFounder && idx < form.rounds.length - 1 && (
                        <button onClick={() => moveRound(idx, idx + 1)} className="text-xs px-2 py-1 rounded-md"
                          style={{ backgroundColor: "#F0EBE0", color: "#9A9490", border: "1px solid #E8DFCF" }}>&#8595;</button>
                      )}
                      {!r.isFounder && (
                        <button onClick={() => setDeleteConfirmId(r.id)} className="text-xs px-2 py-1 rounded-lg"
                          style={{ color: "#B05050", backgroundColor: "rgba(176,80,80,0.07)", border: "1px solid rgba(176,80,80,0.2)" }}>
                          \u5220\u9664
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6">
                    <div>
                      {!r.isFounder && (
                        <FieldRow label="\u8ddd\u4e0a\u4e00\u8f6e\uff08\u4e2a\u6708\uff09">
                          <NumInput value={r.intervalMonths} onChange={(v) => updateRound(r.id, { intervalMonths: v })} width={120} />
                        </FieldRow>
                      )}
                      <FieldRow label="\u6295\u8d44\u4eba\u7c7b\u578b">
                        <select value={r.investorType} onChange={(e) => updateRound(r.id, { investorType: e.target.value as InvestorType })}
                          className="text-xs py-1 px-2 rounded-lg outline-none"
                          style={{ width: 160, backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#2B2B2B" }}>
                          {INVESTOR_TYPES.map((t) => <option key={t} value={t}>{INVESTOR_ZH[t]}</option>)}
                        </select>
                      </FieldRow>
                      {r.isFounder ? (
                        <>
                          <FieldRow label="\u521b\u59cb\u4f30\u503c">
                            <NumInput sym={sym} value={r.initialValuation} onChange={(v) => updateRound(r.id, { initialValuation: v })} />
                          </FieldRow>
                          <FieldRow label="\u6ce8\u518c\u8d44\u672c">
                            <NumInput sym={sym} value={r.registeredCapital} onChange={(v) => updateRound(r.id, { registeredCapital: v })} />
                          </FieldRow>
                          <FieldRow label="\u8054\u5408\u521b\u529e\u4eba">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={r.hasCoFounder}
                                onChange={(e) => updateRound(r.id, { hasCoFounder: e.target.checked })}
                                className="rounded" />
                              <span className="text-xs" style={{ color: "#7A7A7A" }}>\u6709\u8054\u5408\u521b\u529e\u4eba</span>
                            </label>
                          </FieldRow>
                          {r.hasCoFounder && (
                            <>
                              <FieldRow label="\u521b\u529e\u4eba\u6301\u80a1 %">
                                <NumInput value={r.founderPct} onChange={(v) => updateRound(r.id, { founderPct: v })} placeholder="70" width={120} />
                              </FieldRow>
                              <FieldRow label="\u8054\u5408\u521b\u529e\u4eba\u6301\u80a1 %">
                                <NumInput value={r.coFounderPct} onChange={(v) => updateRound(r.id, { coFounderPct: v })} placeholder="30" width={120} />
                              </FieldRow>
                              {Math.abs(pf(r.founderPct) + pf(r.coFounderPct) - 100) > 0.1 && (
                                <p className="text-xs mt-1" style={{ color: "#C9863A" }}>
                                  \u63d0\u9192\uff1a\u521b\u529e\u4eba\u6301\u80a1\u5408\u8ba1 {pf(r.founderPct) + pf(r.coFounderPct)}%\uff0c\u5efa\u8bae\u7b49\u4e8e 100%
                                </p>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <FieldRow label="\u878d\u8d44\u540e\u4f30\u503c\uff08Post-Money\uff09">
                            <NumInput sym={sym} value={r.postMoneyValuation} onChange={(v) => updateRound(r.id, { postMoneyValuation: v })} />
                          </FieldRow>
                          <FieldRow label="\u6295\u8d44\u91d1\u989d">
                            <NumInput sym={sym} value={r.investmentAmount} onChange={(v) => updateRound(r.id, { investmentAmount: v })} />
                          </FieldRow>
                          <div className="flex items-center justify-between py-1.5 gap-3">
                            <span className="text-xs" style={{ color: "#B0AA9A" }}>\u878d\u8d44\u524d\u4f30\u503c\uff08Pre-Money\uff09</span>
                            <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>{fmt(preMoney, sym)}</span>
                          </div>
                        </>
                      )}
                      <FieldRow label="PE \u500d\u6570">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono" style={{ color: "#9A9490" }}>PE</span>
                          <NumInput value={r.peMultiple} onChange={(v) => updateRound(r.id, { peMultiple: v })} placeholder="10" width={80} />
                        </div>
                      </FieldRow>
                    </div>

                    <div className="flex flex-col justify-center mt-3 sm:mt-0">
                      <div className="rounded-xl px-4 py-3 space-y-1.5" style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}>
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>{r.isFounder ? "\u521b\u59cb\u4f30\u503c" : "\u878d\u8d44\u540e\u4f30\u503c"}</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(c?.postMoney ?? 0, sym)}</span>
                        </div>
                        {!r.isFounder && (
                          <div className="flex justify-between">
                            <span className="text-xs" style={{ color: "#9A9490" }}>\u672c\u8f6e\u6295\u8d44\u4eba\u6301\u80a1</span>
                            <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>{fmtPct(c?.newInvestorPct ?? 0)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>\u521b\u529e\u4eba\u6301\u80a1</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#3D7A41" }}>
                            {fmtPct(c?.capSnapshot?.[founderStakeholder?.id ?? "founder"] ?? 0)}
                          </span>
                        </div>
                        {coFounderStakeholder && (
                          <div className="flex justify-between">
                            <span className="text-xs" style={{ color: "#9A9490" }}>\u8054\u5408\u521b\u529e\u4eba\u6301\u80a1</span>
                            <span className="text-xs font-bold font-mono" style={{ color: "#5A8AC0" }}>
                              {fmtPct(c?.capSnapshot?.[coFounderStakeholder.id] ?? 0)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-xs" style={{ color: "#9A9490" }}>\u76ee\u6807\u51c0\u5229\u6da6\uff08PAT\uff09</span>
                          <span className="text-xs font-bold font-mono" style={{ color: "#2B2B2B" }}>
                            {c?.patTarget ? fmt(c.patTarget, sym) : "\u2014"}
                          </span>
                        </div>
                        {c?.downRoundIds && c.downRoundIds.length > 0 && (
                          <div className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "rgba(176,80,80,0.07)", color: "#B05050" }}>
                            \u524d\u8f6e\u80a1\u4e1c\u8d26\u9762\u5e02\u503c\u53ef\u80fd\u4e0b\u964d
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

          <InsertBtn onClick={() => insertRoundAfter(form.rounds.length - 1)} />
        </Card>

        {/* Section 2: Roadmap Visual */}
        <Card accent>
          <SectionLabel>\u878d\u8d44\u8def\u7ebf\u56fe</SectionLabel>
          <div className="space-y-0">
            {computed.map((c, i) => (
              <div key={c.round.id}>
                {i > 0 && (
                  <div className="flex items-stretch gap-3 py-1 pl-4">
                    <div className="w-0.5" style={{ backgroundColor: "#E8DFCF" }} />
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-4 h-px" style={{ backgroundColor: "#E8DFCF" }} />
                      <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>
                        {pf(c.round.intervalMonths) > 0 ? `+${pf(c.round.intervalMonths)} \u4e2a\u6708` : "\u540c\u671f"}
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
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u521b\u59cb\u4f30\u503c</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(c.postMoney, sym)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u5e02\u76c8\u7387</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>PE {c.pe || "\u2014"}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u76ee\u6807\u51c0\u5229\u6da6</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{c.patTarget > 0 ? fmt(c.patTarget, sym) : "\u2014"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: "1px solid #F0EBE0" }}>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u6ce8\u518c\u8d44\u672c</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                              {pf(c.round.registeredCapital) > 0 ? fmt(pf(c.round.registeredCapital), sym) : "\u2014"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u521b\u529e\u4eba</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#3D7A41" }}>
                              {fmtPct(c.capSnapshot[founderStakeholder?.id ?? "founder"] ?? 0)}
                            </p>
                          </div>
                          {coFounderStakeholder ? (
                            <div>
                              <p className="text-xs" style={{ color: "#9A9490" }}>\u8054\u5408\u521b\u529e\u4eba</p>
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
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u878d\u8d44\u540e\u4f30\u503c</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>{fmt(c.postMoney, sym)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u5e02\u76c8\u7387</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>PE {c.pe || "\u2014"}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u76ee\u6807\u51c0\u5229\u6da6</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{c.patTarget > 0 ? fmt(c.patTarget, sym) : "\u2014"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 pt-2" style={{ borderTop: "1px solid #F0EBE0" }}>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u6295\u8d44\u91d1\u989d</p>
                            <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>{fmt(c.investment, sym)}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: "#9A9490" }}>\u672c\u8f6e\u6301\u80a1</p>
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
          <SectionLabel>\u80a1\u6743\u7a3c\u91ca\u8868\uff08Cap Table\uff09</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: 400 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E8DFCF" }}>
                  <th className="text-left pb-2 pr-3 font-semibold" style={{ color: "#7A7A7A", whiteSpace: "nowrap", minWidth: 110 }}>\u80a1\u4e1c</th>
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
                    <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>\u6301\u80a1\u6bd4\u4f8b</span>
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
                          {visible ? fmtPct(pct) : <span style={{ color: "#D0CBC0" }}>\u2014</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <td colSpan={computed.length + 1} className="pt-4 pb-1">
                    <span className="text-xs font-mono" style={{ color: "#B0AA9A" }}>\u8d26\u9762\u5e02\u503c\uff08{sym}\uff09</span>
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
                          {visible ? fmtNum(val) : <span style={{ color: "#D0CBC0" }}>\u2014</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #E8DFCF", backgroundColor: "rgba(201,168,76,0.04)" }}>
                  <td className="py-2 pr-3 font-bold text-xs" style={{ color: "#C9A84C" }}>\u878d\u8d44\u540e\u4f30\u503c</td>
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
          <SectionLabel>\u76ee\u6807\u51c0\u5229\u6da6\uff08PAT\uff09</SectionLabel>
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
                <p className="text-xs mb-1" style={{ color: "#9A9490" }}>\u878d\u8d44\u540e\u4f30\u503c</p>
                <p className="text-base font-bold font-mono mb-2" style={{ color: "#C9A84C" }}>{fmt(c.postMoney, sym)}</p>
                <div className="rounded-lg px-3 py-2" style={{ backgroundColor: "rgba(61,122,65,0.06)", border: "1px solid rgba(61,122,65,0.15)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#9A9490" }}>\u76ee\u6807\u51c0\u5229\u6da6\uff08PAT\uff09</p>
                  <p className="text-sm font-bold font-mono" style={{ color: "#3D7A41" }}>{c.patTarget > 0 ? fmt(c.patTarget, sym) : "\u2014"}</p>
                  <p className="text-xs mt-1" style={{ color: "#B0AA9A" }}>= {fmt(c.postMoney, sym)} \xf7 PE {c.pe}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 5: Warnings */}
        {allWarnings.length > 0 && (
          <div className="space-y-3">
            {allWarnings.map((c) => (
              <div key={c.round.id} className="rounded-xl px-4 py-3"
                style={{ backgroundColor: "rgba(176,80,80,0.05)", border: "1px solid rgba(176,80,80,0.2)" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "#B05050" }}>
                  \u4f30\u503c\u63d0\u9192\uff1a{c.round.stageNameZh}
                </p>
                <p className="text-xs mb-2" style={{ color: "#9A9490" }}>
                  \u672c\u8f6e\u878d\u8d44\u524d\u4f30\u503c\u4f4e\u4e8e\u4e0a\u4e00\u8f6e\u878d\u8d44\u540e\u4f30\u503c\uff0c\u4ee5\u4e0b\u80a1\u4e1c\u8d26\u9762\u5e02\u503c\u53ef\u80fd\u4e0b\u964d\uff1a
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.downRoundIds.map((id) => (
                    <span key={id} className="text-xs px-2 py-1 rounded-md"
                      style={{ backgroundColor: "rgba(176,80,80,0.08)", color: "#B05050" }}>
                      {stakeLabel(id)} \u5e02\u503c\u4e0b\u964d
                    </span>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: "#B0AA9A" }}>
                  \u5efa\u8bae\uff1a\u63d0\u9ad8\u672c\u8f6e\u878d\u8d44\u540e\u4f30\u503c\uff0c\u6216\u51cf\u5c11\u6295\u8d44\u91d1\u989d\uff0c\u4f7f\u878d\u8d44\u524d\u4f30\u503c\u9ad8\u4e8e\u4e0a\u4e00\u8f6e\u878d\u8d44\u540e\u4f30\u503c\u3002
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </ToolShell>
  );
}
