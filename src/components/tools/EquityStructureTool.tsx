"use client";

import { useState } from "react";
import ToolShell from "@/components/tools/ToolShell";
import type { Locale } from "@/lib/i18n";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PURPLE = "#8B5CF6";
const GOLD = "#C9A84C";

const inputSt: React.CSSProperties = {
  backgroundColor: "#0D0D0D",
  border: "1px solid #2A2A2A",
  color: "#F5F5F0",
  borderRadius: "10px",
  fontSize: "13px",
  fontFamily: "var(--font-mono)",
  outline: "none",
  width: "100%",
  padding: "8px 10px",
};

const PIE_COLORS = [PURPLE, GOLD, "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const SHAREHOLDER_TYPES = ["Founder", "Investor", "Employee", "Advisor"] as const;
const SHARE_CLASSES = ["Ordinary", "Preference", "Options"] as const;

type ShareholderType = (typeof SHAREHOLDER_TYPES)[number];
type ShareClass = (typeof SHARE_CLASSES)[number];

interface Shareholder {
  id: string;
  name: string;
  type: ShareholderType;
  shares: number;
  shareClass: ShareClass;
}

interface Round {
  id: string;
  name: string;
  newShares: number;
}

let _id = 1;
const uid = () => String(_id++);

function fmtRM(n: number) {
  if (n >= 1e6) return `RM ${(n / 1e6).toFixed(2)}M`;
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}

function pct(n: number, total: number) {
  return total > 0 ? ((n / total) * 100).toFixed(2) : "0.00";
}

export default function EquityStructureTool({ locale }: { locale: Locale }) {
  const isEn = locale === "en";

  const [shareholders, setShareholders] = useState<Shareholder[]>([
    { id: uid(), name: isEn ? "Founder A" : "创始人 A", type: "Founder", shares: 600000, shareClass: "Ordinary" },
    { id: uid(), name: isEn ? "Founder B" : "创始人 B", type: "Founder", shares: 300000, shareClass: "Ordinary" },
    { id: uid(), name: isEn ? "Investor X" : "投资人 X", type: "Investor", shares: 100000, shareClass: "Preference" },
  ]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [esopEnabled, setEsopEnabled] = useState(false);
  const [esopPct, setEsopPct] = useState("10");
  const [fullyDiluted, setFullyDiluted] = useState(true);
  const [exitValue, setExitValue] = useState("10000000");
  const [tab, setTab] = useState<"captable" | "waterfall">("captable");

  // New shareholder form
  const [newSh, setNewSh] = useState({ name: "", type: "Founder" as ShareholderType, shares: "", shareClass: "Ordinary" as ShareClass });
  const [newRound, setNewRound] = useState({ name: "", newShares: "" });

  const baseShares = shareholders
    .filter((s) => fullyDiluted || s.shareClass !== "Options")
    .reduce((sum, s) => sum + s.shares, 0);

  const roundShares = rounds.reduce((sum, r) => sum + r.newShares, 0);

  const esopShares = esopEnabled
    ? Math.round((baseShares + roundShares) * (parseFloat(esopPct) / 100) / (1 - parseFloat(esopPct) / 100))
    : 0;

  const totalShares = baseShares + roundShares + esopShares;

  const addShareholder = () => {
    if (!newSh.name || !newSh.shares) return;
    setShareholders((p) => [...p, { id: uid(), name: newSh.name, type: newSh.type, shares: parseInt(newSh.shares) || 0, shareClass: newSh.shareClass }]);
    setNewSh({ name: "", type: "Founder", shares: "", shareClass: "Ordinary" });
  };

  const removeShareholder = (id: string) => setShareholders((p) => p.filter((s) => s.id !== id));

  const addRound = () => {
    if (!newRound.name || !newRound.newShares) return;
    setRounds((p) => [...p, { id: uid(), name: newRound.name, newShares: parseInt(newRound.newShares) || 0 }]);
    setNewRound({ name: "", newShares: "" });
  };

  const removeRound = (id: string) => setRounds((p) => p.filter((r) => r.id !== id));

  const pieData = [
    ...shareholders
      .filter((s) => fullyDiluted || s.shareClass !== "Options")
      .map((s) => ({ name: s.name, value: s.shares })),
    ...rounds.map((r) => ({ name: r.name, value: r.newShares })),
    ...(esopEnabled && esopShares > 0 ? [{ name: isEn ? "ESOP Pool" : "ESOP池", value: esopShares }] : []),
  ];

  const exitVal = parseFloat(exitValue) || 0;

  const selectSt: React.CSSProperties = { ...inputSt, cursor: "pointer" };

  return (
    <ToolShell
      icon=""
      title={isEn ? "Equity Structure" : "股权架构"}
      desc={isEn ? "Build your cap table, model dilution, and visualize equity distribution." : "构建股权表，模拟稀释，可视化股权分配。"}
      levelRequired={3}
      backHref="/dashboard/capital"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["captable", "waterfall"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: tab === t ? PURPLE : "#141414",
              color: tab === t ? "#fff" : "#666660",
              border: `1px solid ${tab === t ? PURPLE : "#1E1E1E"}`,
            }}
          >
            {t === "captable" ? (isEn ? "Cap Table" : "股权表") : (isEn ? "Exit Waterfall" : "退出瀑布")}
          </button>
        ))}
        <div className="ml-auto flex gap-3 items-center">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "#A0A09A" }}>
            <input type="checkbox" checked={esopEnabled} onChange={(e) => setEsopEnabled(e.target.checked)} className="accent-purple-500" />
            {isEn ? "ESOP Pool" : "ESOP池"}
          </label>
          {esopEnabled && (
            <div className="relative w-20">
              <input
                type="number"
                value={esopPct}
                onChange={(e) => setEsopPct(e.target.value)}
                style={{ ...inputSt, paddingRight: "20px", fontSize: "12px" }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: "#555550" }}>%</span>
            </div>
          )}
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "#A0A09A" }}>
            <input type="checkbox" checked={fullyDiluted} onChange={(e) => setFullyDiluted(e.target.checked)} className="accent-purple-500" />
            {isEn ? "Fully Diluted" : "全稀释"}
          </label>
        </div>
      </div>

      {tab === "captable" ? (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Add shareholders + rounds */}
          <div className="lg:col-span-2 space-y-4">
            {/* Add Shareholder */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "ADD SHAREHOLDER" : "添加股东"}</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={isEn ? "Name" : "姓名"}
                  value={newSh.name}
                  onChange={(e) => setNewSh((p) => ({ ...p, name: e.target.value }))}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select value={newSh.type} onChange={(e) => setNewSh((p) => ({ ...p, type: e.target.value as ShareholderType }))} style={selectSt}>
                    {SHAREHOLDER_TYPES.map((t) => <option key={t} value={t} style={{ backgroundColor: "#1A1A1A" }}>{t}</option>)}
                  </select>
                  <select value={newSh.shareClass} onChange={(e) => setNewSh((p) => ({ ...p, shareClass: e.target.value as ShareClass }))} style={selectSt}>
                    {SHARE_CLASSES.map((c) => <option key={c} value={c} style={{ backgroundColor: "#1A1A1A" }}>{c}</option>)}
                  </select>
                </div>
                <input
                  type="number"
                  placeholder={isEn ? "Number of shares" : "股份数量"}
                  value={newSh.shares}
                  onChange={(e) => setNewSh((p) => ({ ...p, shares: e.target.value }))}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <button onClick={addShareholder} className="w-full py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: "rgba(139,92,246,0.15)", color: "#A78BFA", border: "1px solid rgba(139,92,246,0.3)" }}>
                  + {isEn ? "Add Shareholder" : "添加股东"}
                </button>
              </div>
            </div>

            {/* Add Round */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "ADD FUNDING ROUND" : "添加融资轮次"}</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={isEn ? "Round name (e.g. Series A)" : "轮次名称（如A轮）"}
                  value={newRound.name}
                  onChange={(e) => setNewRound((p) => ({ ...p, name: e.target.value }))}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <input
                  type="number"
                  placeholder={isEn ? "New shares issued" : "新增股份数量"}
                  value={newRound.newShares}
                  onChange={(e) => setNewRound((p) => ({ ...p, newShares: e.target.value }))}
                  style={inputSt}
                  onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
                <button onClick={addRound} className="w-full py-2 rounded-xl text-xs font-semibold" style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.25)" }}>
                  + {isEn ? "Add Round" : "添加轮次"}
                </button>
              </div>
              {rounds.length > 0 && (
                <div className="mt-3 space-y-2">
                  {rounds.map((r) => (
                    <div key={r.id} className="flex justify-between items-center py-1.5 text-xs" style={{ borderTop: "1px solid #1E1E1E" }}>
                      <span style={{ color: "#A0A09A" }}>{r.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono" style={{ color: "#3B82F6" }}>+{r.newShares.toLocaleString()}</span>
                        <button onClick={() => removeRound(r.id)} className="text-xs" style={{ color: "#444440" }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="text-2xl font-bold font-mono" style={{ color: PURPLE }}>{totalShares.toLocaleString()}</div>
              <div className="text-xs mt-1" style={{ color: "#666660" }}>{isEn ? "Total Shares (fully diluted)" : "总股份（全稀释）"}</div>
            </div>
          </div>

          {/* Right: Cap table + pie */}
          <div className="lg:col-span-3 space-y-5">
            {/* Cap Table */}
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
              <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "CAP TABLE" : "股权表"}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                      {[isEn ? "Shareholder" : "股东", isEn ? "Type" : "类型", isEn ? "Class" : "类别", isEn ? "Shares" : "股份", "%"].map((h) => (
                        <th key={h} className="text-left pb-2 pr-3 font-mono" style={{ color: "#555550" }}>{h}</th>
                      ))}
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {shareholders.filter((s) => fullyDiluted || s.shareClass !== "Options").map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #1E1E1E" }}>
                        <td className="py-2 pr-3" style={{ color: "#F5F5F0" }}>{s.name}</td>
                        <td className="py-2 pr-3" style={{ color: "#A0A09A" }}>{s.type}</td>
                        <td className="py-2 pr-3" style={{ color: "#A0A09A" }}>{s.shareClass}</td>
                        <td className="py-2 pr-3 font-mono" style={{ color: "#F5F5F0" }}>{s.shares.toLocaleString()}</td>
                        <td className="py-2 pr-3 font-mono" style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>
                          {pct(s.shares, totalShares)}%
                        </td>
                        <td className="py-2">
                          <button onClick={() => removeShareholder(s.id)} className="text-xs" style={{ color: "#444440" }}>×</button>
                        </td>
                      </tr>
                    ))}
                    {rounds.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #1E1E1E" }}>
                        <td className="py-2 pr-3" style={{ color: "#F5F5F0" }}>{r.name}</td>
                        <td className="py-2 pr-3" style={{ color: "#3B82F6" }}>Round</td>
                        <td className="py-2 pr-3" style={{ color: "#A0A09A" }}>Ordinary</td>
                        <td className="py-2 pr-3 font-mono" style={{ color: "#F5F5F0" }}>{r.newShares.toLocaleString()}</td>
                        <td className="py-2 pr-3 font-mono" style={{ color: PIE_COLORS[(shareholders.length + i) % PIE_COLORS.length] }}>
                          {pct(r.newShares, totalShares)}%
                        </td>
                        <td className="py-2">
                          <button onClick={() => removeRound(r.id)} className="text-xs" style={{ color: "#444440" }}>×</button>
                        </td>
                      </tr>
                    ))}
                    {esopEnabled && esopShares > 0 && (
                      <tr style={{ borderBottom: "1px solid #1E1E1E" }}>
                        <td className="py-2 pr-3" style={{ color: "#F5F5F0" }}>{isEn ? "ESOP Pool" : "ESOP池"}</td>
                        <td className="py-2 pr-3" style={{ color: "#10B981" }}>ESOP</td>
                        <td className="py-2 pr-3" style={{ color: "#A0A09A" }}>Options</td>
                        <td className="py-2 pr-3 font-mono" style={{ color: "#F5F5F0" }}>{esopShares.toLocaleString()}</td>
                        <td className="py-2 pr-3 font-mono" style={{ color: "#10B981" }}>{pct(esopShares, totalShares)}%</td>
                        <td />
                      </tr>
                    )}
                    <tr style={{ borderTop: "1px solid #2A2A2A" }}>
                      <td colSpan={3} className="pt-2 text-xs font-semibold" style={{ color: "#666660" }}>{isEn ? "Total" : "合计"}</td>
                      <td className="pt-2 font-mono font-semibold" style={{ color: GOLD }}>{totalShares.toLocaleString()}</td>
                      <td className="pt-2 font-mono font-semibold" style={{ color: GOLD }}>100%</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
                <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "EQUITY DISTRIBUTION" : "股权分配"}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(1)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "10px", fontSize: "12px" }}
                      formatter={(v) => [typeof v === "number" ? v.toLocaleString() + " shares" : "—", undefined]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "#888880" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Waterfall tab */
        <div className="max-w-2xl space-y-5">
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "EXIT VALUE" : "退出价值"}</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono" style={{ color: "#555550" }}>RM</span>
              <input
                type="number"
                value={exitValue}
                onChange={(e) => setExitValue(e.target.value)}
                style={{ ...inputSt, paddingLeft: "44px" }}
                onFocus={(e) => (e.target.style.borderColor = PURPLE)}
                onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
              />
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
            <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>{isEn ? "DISTRIBUTION (PRO-RATA)" : "分配（按比例）"}</p>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                  {[isEn ? "Shareholder" : "股东", "%", isEn ? "Payout (RM)" : "应得金额"].map((h) => (
                    <th key={h} className="text-left pb-2 pr-4 text-xs font-mono" style={{ color: "#555550" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ...shareholders.filter((s) => fullyDiluted || s.shareClass !== "Options").map((s, i) => ({
                    name: s.name,
                    shares: s.shares,
                    color: PIE_COLORS[i % PIE_COLORS.length],
                  })),
                  ...rounds.map((r, i) => ({ name: r.name, shares: r.newShares, color: PIE_COLORS[(shareholders.length + i) % PIE_COLORS.length] })),
                  ...(esopEnabled && esopShares > 0 ? [{ name: isEn ? "ESOP Pool" : "ESOP池", shares: esopShares, color: "#10B981" }] : []),
                ].map((row) => {
                  const share = totalShares > 0 ? row.shares / totalShares : 0;
                  const payout = exitVal * share;
                  return (
                    <tr key={row.name} style={{ borderBottom: "1px solid #1E1E1E" }}>
                      <td className="py-2 pr-4" style={{ color: "#F5F5F0" }}>{row.name}</td>
                      <td className="py-2 pr-4 font-mono" style={{ color: row.color }}>{(share * 100).toFixed(2)}%</td>
                      <td className="py-2 font-mono" style={{ color: GOLD }}>{fmtRM(payout)}</td>
                    </tr>
                  );
                })}
                <tr style={{ borderTop: "1px solid #2A2A2A" }}>
                  <td className="pt-2 font-semibold text-xs" style={{ color: "#666660" }}>{isEn ? "Total" : "合计"}</td>
                  <td className="pt-2 font-mono font-semibold" style={{ color: GOLD }}>100%</td>
                  <td className="pt-2 font-mono font-semibold" style={{ color: GOLD }}>{fmtRM(exitVal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
