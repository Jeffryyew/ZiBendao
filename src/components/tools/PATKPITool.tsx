"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import ToolShell from "@/components/tools/ToolShell";
import ToolGuide from "@/components/tools/ToolGuide";
import { useToolSnapshot } from "@/lib/useToolSnapshot";
import type { FinancialCore } from "@/lib/financialCore";
import { ENTERPRISE_KEYS } from "@/lib/enterprise";

// ── Types ──────────────────────────────────────────────────────────────────

interface T04Form {
  targetPAT: string;
  targetNetMarginPct: string;
  asp: string;                  // average selling price per deal
  conversionRatePct: string;    // lead-to-deal conversion rate
  headcount: string;
}

const DEFAULT_FORM: T04Form = {
  targetPAT: "300000",
  targetNetMarginPct: "15",
  asp: "5000",
  conversionRatePct: "20",
  headcount: "10",
};

// ── Guide steps ────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "KPI 从目标反推，而不是从过去延伸",
    body: "大多数企业用去年数据推今年目标，这只会让增长线性爬行。资本化的企业应该先定目标 PAT，再反推需要多少营收、多少成交单数。",
  },
  {
    title: "第一步：设定目标 PAT",
    body: "目标净利润是整个 KPI 体系的起点。你可以手动填入，或从财务路线图工具直接导入某一年的 PAT 目标。当前实际 PAT（来自利润表）会自动显示作为对标。",
  },
  {
    title: "第二步：设定目标净利润率",
    body: "系统根据目标 PAT ÷ 目标净利润率，算出你需要达到的年营收。这个数字是所有销售 KPI 的基础。",
  },
  {
    title: "第三步：填入销售参数",
    body: "平均成交金额（ASP）是每笔交易的平均收入。转化率是成交单数除以联系客户数的比例。这两个数字决定了你的月度销售目标。",
  },
  {
    title: "第四步：KPI 看板",
    body: "系统自动计算：月销售目标、月成交单数。绿色代表当前已达成，红色代表存在缺口。每个 KPI 都有简单说明帮助你判断是否合理。",
  },
  {
    title: "第五步：与估值工具联动",
    body: "这里设定的目标 PAT 会传给估值工具，用于计算「如果你达成 KPI，企业估值会是多少」。保存后数据自动同步。",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number, sym: string): string {
  const abs = Math.abs(n);
  const str = abs.toLocaleString("en-MY", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n < 0 ? "-" : "") + sym + " " + str;
}

function pct(n: number): string {
  return isFinite(n) && !isNaN(n) ? n.toFixed(1) + "%" : "—";
}

type Signal = "green" | "yellow" | "red" | "neutral";

const SIG: Record<Signal, { text: string; bg: string; border: string }> = {
  green: { text: "#22C55E", bg: "rgba(34,197,94,0.05)", border: "rgba(34,197,94,0.2)" },
  yellow: { text: "#F0A445", bg: "rgba(240,164,69,0.05)", border: "rgba(240,164,69,0.2)" },
  red: { text: "#EF4444", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.2)" },
  neutral: { text: "#9A9490", bg: "#F8F6F1", border: "#E8DFCF" },
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

function InputRow({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div
      className="grid items-center py-2"
      style={{ gridTemplateColumns: "1fr 155px", borderBottom: "1px solid #E8DFCF", gap: "8px" }}
    >
      <div style={{ minWidth: 0 }}>
        <span className="text-xs" style={{ color: "#7A7A7A" }}>{label}</span>
        {hint && <p className="text-xs mt-0.5" style={{ color: "#2B2B2B" }}>{hint}</p>}
      </div>
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
          className="w-full py-1.5 rounded-lg text-xs text-right outline-none font-mono"
          style={{
            backgroundColor: "#F8F6F1",
            border: "1px solid #E8DFCF",
            color: "#2B2B2B",
            paddingLeft: prefix ? "2rem" : "0.5rem",
            paddingRight: suffix ? "1.8rem" : "0.5rem",
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

function KPICard({
  label,
  target,
  actual,
  signal,
  unit,
  note,
}: {
  label: string;
  target: string;
  actual: string | null;
  signal: Signal;
  unit?: string;
  note: string;
}) {
  const c = SIG[signal];
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
      <p className="text-xs font-semibold mb-3" style={{ color: "#9A9490" }}>{label}</p>
      <p className="text-2xl font-bold font-mono mb-1" style={{ color: c.text }}>
        {target}
        {unit && <span className="text-sm ml-1" style={{ color: c.text, opacity: 0.7 }}>{unit}</span>}
      </p>
      {actual !== null && (
        <p className="text-xs mb-2" style={{ color: "#7A7A7A" }}>
          当前实际：<span style={{ color: signal === "green" ? "#22C55E" : "#F0A445" }}>{actual}</span>
        </p>
      )}
      <p className="text-xs leading-relaxed" style={{ color: c.text, opacity: 0.8 }}>{note}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function PATKPITool({ locale }: { locale: "zh" | "en" }) {
  const { savedData, saving, lastSaved, save } = useToolSnapshot<T04Form>("pat-kpi");
  const [form, setForm] = useState<T04Form>(DEFAULT_FORM);
  const [loaded, setLoaded] = useState(false);
  const [coreData, setCoreData] = useState<FinancialCore | null>(null);
  const [roadmapYears, setRoadmapYears] = useState<{ year: number; pat: number }[]>([]);

  // Load saved data
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


  // Load FinancialCore
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
              const core = snap.data as FinancialCore & {
                roadmapYear1PAT?: number;
                roadmapYear2PAT?: number;
                roadmapYear3PAT?: number;
              };
              setCoreData(core);
              // Build roadmap year options
              const years: { year: number; pat: number }[] = [];
              if (core.roadmapYear1PAT) years.push({ year: 1, pat: core.roadmapYear1PAT });
              if (core.roadmapYear2PAT) years.push({ year: 2, pat: core.roadmapYear2PAT });
              if (core.roadmapYear3PAT) years.push({ year: 3, pat: core.roadmapYear3PAT });
              setRoadmapYears(years);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const sym = coreData?.currencySymbol ?? "RM";

  function set(field: keyof T04Form) {
    return (v: string) => setForm((p) => ({ ...p, [field]: v }));
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const calc = useMemo(() => {
    const pf = (v: string) => parseFloat(v) || 0;
    const targetPAT = pf(form.targetPAT);
    const marginPct = pf(form.targetNetMarginPct) / 100;
    const asp = pf(form.asp);
    const convPct = pf(form.conversionRatePct) / 100;

    const targetRevenue = marginPct > 0 ? targetPAT / marginPct : 0;
    const monthlyRevTarget = targetRevenue / 12;
    const monthlyUnits = asp > 0 ? monthlyRevTarget / asp : 0;

    const actualPAT = coreData?.annualPAT ?? null;
    const actualRevenue = coreData?.annualRevenue ?? null;
    const actualMonthlyRev = actualRevenue ? actualRevenue / 12 : null;
    const actualMonthlyUnits = actualRevenue && asp > 0 ? actualRevenue / 12 / asp : null;

    const patGap = actualPAT !== null ? targetPAT - actualPAT : null;
    const revGap = actualRevenue !== null ? targetRevenue - actualRevenue : null;
    const patAchieved = actualPAT !== null ? actualPAT >= targetPAT : null;
    const revAchieved = actualRevenue !== null ? actualRevenue >= targetRevenue : null;

    // Growth needed
    const patGrowthPct = actualPAT && actualPAT > 0 ? ((targetPAT - actualPAT) / actualPAT) * 100 : null;

    return {
      targetPAT,
      targetRevenue,
      monthlyRevTarget,
      monthlyUnits,
      actualPAT,
      actualRevenue,
      actualMonthlyRev,
      actualMonthlyUnits,
      patGap,
      revGap,
      patAchieved,
      revAchieved,
      patGrowthPct,
    };
  }, [form, coreData]);

  // ── Save handler ──────────────────────────────────────────────────────────

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

      await fetch("/api/tools/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: "_financial_core",
          companyId,
          data: {
            ...core,
            targetPAT: calc.targetPAT,
            targetRevenue: calc.targetRevenue,
            kpiASP: parseFloat(form.asp) || 0,
            kpiConversionRate: parseFloat(form.conversionRatePct) || 0,
            kpiMonthlyRevTarget: calc.monthlyRevTarget,
            kpiMonthlyUnits: calc.monthlyUnits,
            updatedBy: { ...(core.updatedBy ?? {}), "pat-kpi": new Date().toISOString() },
          },
        }),
      });
    } catch {}
  }

  const guide = <ToolGuide toolSlug="pat-kpi" steps={GUIDE_STEPS} />;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ToolShell
      icon=""
      title={locale === "en" ? "PAT & KPI Targets" : "PAT & KPI 目标设定"}
      desc={locale === "en" ? "Set target profit and reverse-engineer your KPIs" : "设定目标净利润，反推销售 KPI"}
      backHref="/student/dashboard"
      guideButton={guide}
    >
      <div className="space-y-5">

        {/* ── Target PAT ────────────────────────────────────────────────── */}
        <Card accent>
          <SLabel>目标 PAT（净利润）</SLabel>

          <div className="flex items-end gap-3 mb-3">
            <div className="flex-1 relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono pointer-events-none"
                style={{ color: "#7A7A7A" }}
              >
                {sym}
              </span>
              <input
                type="number"
                value={form.targetPAT}
                onChange={set("targetPAT")}
                className="w-full pl-10 pr-3 py-3 rounded-xl text-lg font-bold font-mono outline-none text-right"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF", color: "#C9A84C" }}
                onFocus={(e) => { e.target.select(); e.target.style.borderColor = "#C9A84C"; }}
                onBlur={(e) => (e.target.style.borderColor = "#E8DFCF")}
              />
            </div>
            <span className="text-xs pb-3" style={{ color: "#7A7A7A" }}>/ 年</span>
          </div>

          {/* Roadmap import buttons */}
          {roadmapYears.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs py-1" style={{ color: "#7A7A7A" }}>从财务路线图导入：</span>
              {roadmapYears.map(({ year, pat }) => (
                <button
                  key={year}
                  onClick={() => set("targetPAT")(String(Math.round(pat)))}
                  className="text-xs px-3 py-1 rounded-lg transition-opacity hover:opacity-70"
                  style={{
                    backgroundColor: "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.25)",
                    color: "#C9A84C",
                  }}
                >
                  第 {year} 年 {fmt(pat, sym)}
                </button>
              ))}
            </div>
          )}

          {/* PAT gap vs actual */}
          {calc.actualPAT !== null && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                backgroundColor: calc.patAchieved ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${calc.patAchieved ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              <div>
                <p className="text-xs font-semibold" style={{ color: "#9A9490" }}>
                  当前实际 PAT（利润表）
                </p>
                <p className="text-lg font-bold font-mono mt-0.5" style={{ color: calc.patAchieved ? "#22C55E" : "#F0A445" }}>
                  {fmt(calc.actualPAT, sym)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: "#7A7A7A" }}>
                  {calc.patAchieved ? "已达成" : "缺口"}
                </p>
                <p
                  className="text-base font-bold font-mono"
                  style={{ color: calc.patAchieved ? "#22C55E" : "#EF4444" }}
                >
                  {calc.patGap !== null
                    ? (calc.patGap >= 0 ? "+" : "") + fmt(calc.patGap, sym)
                    : "—"}
                </p>
                {calc.patGrowthPct !== null && !calc.patAchieved && (
                  <p className="text-xs" style={{ color: "#7A7A7A" }}>
                    需增长 {calc.patGrowthPct.toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* ── Sales parameters ──────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <SLabel>利润参数</SLabel>
            <InputRow
              label="目标净利润率"
              value={form.targetNetMarginPct}
              onChange={set("targetNetMarginPct")}
              suffix="%"
              hint="目标 PAT ÷ 目标营收"
            />
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-lg mt-3"
              style={{ backgroundColor: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)" }}
            >
              <span className="text-xs font-semibold" style={{ color: "#C9A84C" }}>
                目标年营收
              </span>
              <span className="text-base font-bold font-mono" style={{ color: "#C9A84C" }}>
                {calc.targetRevenue > 0 ? fmt(calc.targetRevenue, sym) : "—"}
              </span>
            </div>
            {calc.actualRevenue !== null && (
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg mt-2"
                style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
              >
                <span className="text-xs" style={{ color: "#7A7A7A" }}>当前营收 vs 目标缺口</span>
                <span
                  className="text-sm font-mono font-semibold"
                  style={{
                    color: calc.revAchieved ? "#22C55E" : "#EF4444",
                  }}
                >
                  {calc.revGap !== null
                    ? (calc.revGap >= 0 ? "+" : "") + fmt(calc.revGap, sym)
                    : "—"}
                </span>
              </div>
            )}
          </Card>

          <Card>
            <SLabel>销售参数</SLabel>
            <InputRow
              label="平均成交金额（ASP）"
              value={form.asp}
              onChange={set("asp")}
              prefix={sym}
              hint="每笔交易平均收入"
            />
            <InputRow
              label="成交转化率"
              value={form.conversionRatePct}
              onChange={set("conversionRatePct")}
              suffix="%"
              hint="接触客户中成功成交的比例"
            />
          </Card>
        </div>

        {/* ── KPI dashboard ─────────────────────────────────────────────── */}
        <Card accent>
          <SLabel>KPI 看板</SLabel>
          <div className="grid sm:grid-cols-2 gap-4">
            <KPICard
              label="月销售目标"
              target={calc.monthlyRevTarget > 0 ? fmt(calc.monthlyRevTarget, sym) : "—"}
              actual={
                calc.actualMonthlyRev !== null ? fmt(calc.actualMonthlyRev, sym) : null
              }
              signal={
                calc.actualRevenue === null
                  ? "neutral"
                  : calc.revAchieved
                  ? "green"
                  : calc.actualRevenue >= calc.targetRevenue * 0.8
                  ? "yellow"
                  : "red"
              }
              note={
                calc.actualRevenue === null
                  ? "请先完成利润表以显示当前对标。"
                  : calc.revAchieved
                  ? "当前营收已达成目标，继续保持。"
                  : "需提升月销售额，检查定价或成交量。"
              }
            />
            <KPICard
              label="月成交单数"
              target={calc.monthlyUnits > 0 ? Math.ceil(calc.monthlyUnits).toString() : "—"}
              actual={
                calc.actualMonthlyUnits !== null
                  ? Math.ceil(calc.actualMonthlyUnits).toString()
                  : null
              }
              unit="单 / 月"
              signal={
                calc.actualRevenue === null
                  ? "neutral"
                  : calc.revAchieved
                  ? "green"
                  : calc.actualRevenue >= calc.targetRevenue * 0.8
                  ? "yellow"
                  : "red"
              }
              note={
                calc.actualRevenue === null
                  ? "完成利润表后自动对标当前成交量。"
                  : calc.revAchieved
                  ? "成交量充足。"
                  : `每月需新增 ${Math.ceil(calc.monthlyUnits - (calc.actualMonthlyUnits ?? 0))} 单才能达标。`
              }
            />
          </div>

          {/* Summary strip */}
          <div
            className="mt-4 flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl"
            style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "#7A7A7A" }}>目标净利润率</p>
              <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                {form.targetNetMarginPct}%
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "#7A7A7A" }}>平均成交金额</p>
              <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                {fmt(parseFloat(form.asp) || 0, sym)}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "#7A7A7A" }}>转化率</p>
              <p className="text-sm font-bold font-mono" style={{ color: "#2B2B2B" }}>
                {form.conversionRatePct}%
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs" style={{ color: "#7A7A7A" }}>目标 PAT</p>
              <p className="text-sm font-bold font-mono" style={{ color: "#C9A84C" }}>
                {fmt(calc.targetPAT, sym)}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Save ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#2B2B2B" }}>
            {saving ? "正在保存..." : lastSaved ? `已自动保存 ${lastSaved.toLocaleTimeString()}` : "未保存"}
          </p>
        </div>

      </div>
    </ToolShell>
  );
}
