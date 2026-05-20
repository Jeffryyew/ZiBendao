"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ALL_BADGES,
  ONLINE_BADGES,
  OFFLINE_BADGES,
  ULTIMATE_BADGE,
  getBadgeStates,
  getCompletedLessons,
  getEarnedOnlineBadgeIds,
  type Badge,
  type BadgeState,
} from "@/lib/badges";
import { BadgeIcon } from "@/components/badges/BadgeIcon";
import { useBadge } from "@/context/BadgeContext";

// ─── Fly-in animation state ────────────────────────────────────────────────────
interface FlyBadge {
  badge: Badge;
  targetRef: React.RefObject<HTMLDivElement | null>;
  animPhase: "center" | "flying" | "arrived" | "done";
}

// ─── Badge Detail Popup ────────────────────────────────────────────────────────
function BadgeDetail({ badge, state, onClose }: { badge: Badge; state: BadgeState; onClose: () => void }) {
  const locked = state === "locked";
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #0d0d1f, #0a0a18)",
          border: `1px solid ${locked ? "rgba(255,255,255,0.1)" : badge.color + "44"}`,
          borderRadius: 20,
          padding: "32px 28px",
          maxWidth: 320,
          width: "90%",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <BadgeIcon badge={badge} state={state} size="xl" />
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: locked ? "rgba(255,255,255,0.3)" : badge.tier === "ultimate" ? "#F59E0B" : badge.color, marginBottom: 8 }}>
          {badge.name}
        </div>
        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 12 }}>
          {badge.nameEn} · {badge.tier === "online" ? "线上成长徽章" : badge.tier === "offline" ? "线下课程徽章" : "终极徽章"}
        </div>
        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 20 }}>
          {badge.description}
        </div>
        <div style={{
          fontSize: "0.7rem",
          padding: "6px 14px",
          borderRadius: 999,
          display: "inline-block",
          background: locked ? "rgba(255,255,255,0.05)" : `${badge.tier === "ultimate" ? "#F59E0B" : badge.color}22`,
          color: locked ? "rgba(255,255,255,0.25)" : badge.tier === "ultimate" ? "#F59E0B" : badge.color,
        }}>
          {locked ? "🔒 尚未获得" : state === "unlocked_new" ? "✨ 新获得" : "✅ 已获得"}
        </div>
        <div
          onClick={onClose}
          style={{ marginTop: 20, fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", cursor: "pointer" }}
        >
          关闭
        </div>
      </div>
    </div>
  );
}

// ─── Fly-back animated badge card ─────────────────────────────────────────────
function AnimatedBadgeCard({
  badge,
  state,
  isNew,
  animDelay,
  onAnimDone,
  onClick,
}: {
  badge: Badge;
  state: BadgeState;
  isNew: boolean;
  animDelay: number;
  onAnimDone: () => void;
  onClick: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "arrive" | "glow" | "done">("idle");

  useEffect(() => {
    if (!isNew) return;
    const t1 = setTimeout(() => setPhase("arrive"), animDelay);
    const t2 = setTimeout(() => setPhase("glow"), animDelay + 600);
    const t3 = setTimeout(() => {
      setPhase("done");
      onAnimDone();
    }, animDelay + 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isNew, animDelay, onAnimDone]);

  return (
    <div
      onClick={onClick}
      style={{
        cursor: state !== "locked" ? "pointer" : "default",
        transform: isNew && phase === "idle" ? "scale(0) translateY(-30px)" : "scale(1) translateY(0)",
        opacity: isNew && phase === "idle" ? 0 : 1,
        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
        filter: phase === "glow"
          ? `drop-shadow(0 0 20px ${badge.color}) drop-shadow(0 0 40px ${badge.color}88)`
          : "none",
      }}
    >
      <BadgeIcon
        badge={badge}
        state={state}
        size="md"
        isNew={state === "unlocked_new" && phase !== "done"}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AchievementsPage() {
  const { newBadgeIds, markSeen } = useBadge();
  const [states, setStates] = useState<Record<string, BadgeState>>({});
  const [seenSet, setSeenSet] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Badge | null>(null);
  const [earnedOnline, setEarnedOnline] = useState(0);

  useEffect(() => {
    const completed = getCompletedLessons();
    const earned = new Set(getEarnedOnlineBadgeIds(completed));
    const rawStates = getBadgeStates();

    // Build display states
    const displayStates: Record<string, BadgeState> = {};
    for (const b of ALL_BADGES) {
      if (newBadgeIds.has(b.id)) {
        displayStates[b.id] = "unlocked_new";
      } else if (rawStates[b.id]) {
        displayStates[b.id] = rawStates[b.id] as BadgeState;
      } else if (b.tier === "online" && earned.has(b.id)) {
        displayStates[b.id] = "unlocked_seen";
      } else {
        displayStates[b.id] = "locked";
      }
    }
    setStates(displayStates);
    setEarnedOnline(ONLINE_BADGES.filter(b => earned.has(b.id)).length);
  }, [newBadgeIds]);

  const handleAnimDone = useCallback((badgeId: string) => {
    markSeen(badgeId);
    setSeenSet(prev => new Set([...prev, badgeId]));
  }, [markSeen]);

  // New badges sorted by order for sequential animation
  const newBadgesList = ALL_BADGES.filter(b => newBadgeIds.has(b.id) && !seenSet.has(b.id));

  const getAnimDelay = (badge: Badge) => {
    const idx = newBadgesList.findIndex(b => b.id === badge.id);
    return idx >= 0 ? idx * 800 : 0;
  };

  const sectionTitle = (text: string, sub?: string) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
        {text}
      </div>
      {sub && <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #07071a 0%, #050510 100%)",
        color: "#fff",
        paddingBottom: 80,
      }}
    >
      <style>{`
        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
          padding: "16px 20px 12px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link href="/online/learn" style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", textDecoration: "none" }}>
          ← 返回
        </Link>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>成就徽章</div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
            {earnedOnline}/12 线上 · 共 {ALL_BADGES.filter(b => states[b.id] !== "locked").length}/{ALL_BADGES.length} 枚
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: "24px 20px 0", maxWidth: 480, margin: "0 auto" }}>

        {/* ── Section 1: Online Growth Badges ─────────────────────────── */}
        <div style={{ animation: "sectionFadeIn 0.5s ease both", marginBottom: 40 }}>
          {sectionTitle("线上成长徽章", "每完成 2 关解锁 1 枚 · 共 12 枚")}

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)" }}>进度</span>
              <span style={{ fontSize: "0.65rem", color: "#F59E0B" }}>{earnedOnline} / 12</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
              <div style={{
                height: "100%",
                width: `${(earnedOnline / 12) * 100}%`,
                borderRadius: 2,
                background: "linear-gradient(90deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #6366F1, #A855F7)",
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>

          {/* Grid: 4 per row, 3 rows */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px 8px",
          }}>
            {ONLINE_BADGES.map(badge => {
              const st = states[badge.id] || "locked";
              const isNew = newBadgeIds.has(badge.id) && !seenSet.has(badge.id);
              return (
                <AnimatedBadgeCard
                  key={badge.id}
                  badge={badge}
                  state={st}
                  isNew={isNew}
                  animDelay={getAnimDelay(badge)}
                  onAnimDone={() => handleAnimDone(badge.id)}
                  onClick={() => st !== "locked" && setSelected(badge)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Section 2: Offline Badges ───────────────────────────────── */}
        <div style={{ animation: "sectionFadeIn 0.5s ease 0.15s both", marginBottom: 40 }}>
          {sectionTitle("线下课程徽章", "完成线下课程后获得 · 共 3 枚")}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px 8px",
          }}>
            {OFFLINE_BADGES.map(badge => {
              const st = states[badge.id] || "locked";
              const isNew = newBadgeIds.has(badge.id) && !seenSet.has(badge.id);
              return (
                <AnimatedBadgeCard
                  key={badge.id}
                  badge={badge}
                  state={st}
                  isNew={isNew}
                  animDelay={getAnimDelay(badge)}
                  onAnimDone={() => handleAnimDone(badge.id)}
                  onClick={() => st !== "locked" && setSelected(badge)}
                />
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Ultimate Badge ───────────────────────────────── */}
        <div style={{ animation: "sectionFadeIn 0.5s ease 0.3s both" }}>
          {sectionTitle("终极徽章", "完成全部线上 + 线下课程后获得")}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "32px 20px",
              borderRadius: 20,
              background: states["ultimate"] !== "locked"
                ? "linear-gradient(145deg, #1c0a00, #3b1f00)"
                : "rgba(255,255,255,0.03)",
              border: states["ultimate"] !== "locked"
                ? "1px solid #F59E0B44"
                : "1px solid rgba(255,255,255,0.06)",
              cursor: states["ultimate"] !== "locked" ? "pointer" : "default",
            }}
            onClick={() => states["ultimate"] !== "locked" && setSelected(ULTIMATE_BADGE)}
          >
            <AnimatedBadgeCard
              badge={ULTIMATE_BADGE}
              state={states["ultimate"] || "locked"}
              isNew={newBadgeIds.has("ultimate") && !seenSet.has("ultimate")}
              animDelay={getAnimDelay(ULTIMATE_BADGE)}
              onAnimDone={() => handleAnimDone("ultimate")}
              onClick={() => states["ultimate"] !== "locked" && setSelected(ULTIMATE_BADGE)}
            />
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: states["ultimate"] !== "locked" ? "#F59E0B" : "rgba(255,255,255,0.2)" }}>
                资本大师 · Capital Master
              </div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                完成全部课程，成为真正的资本家
              </div>
              {states["ultimate"] === "locked" && (
                <div style={{
                  marginTop: 12,
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}>
                  {[
                    { label: "线上 24 关", done: earnedOnline >= 12 },
                    { label: "资本通", done: states["offline_zibentong"] !== "locked" },
                    { label: "启动资本", done: states["offline_qidong"] !== "locked" },
                    { label: "资本道", done: states["offline_zibendao"] !== "locked" },
                  ].map(req => (
                    <span key={req.label} style={{
                      fontSize: "0.6rem",
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: req.done ? "#22C55E22" : "rgba(255,255,255,0.05)",
                      color: req.done ? "#22C55E" : "rgba(255,255,255,0.2)",
                    }}>
                      {req.done ? "✓" : "○"} {req.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badge detail popup */}
      {selected && (
        <BadgeDetail
          badge={selected}
          state={states[selected.id] || "locked"}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
