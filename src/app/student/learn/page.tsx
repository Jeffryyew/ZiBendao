"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CAPITAL_LAUNCH_MODULES } from "@/lib/capitalLaunchCourse";

type Status = "completed" | "current" | "locked";

function getStatus(idx: number, completedIds: Set<string>): Status {
  const mod = CAPITAL_LAUNCH_MODULES[idx];
  if (mod.lessons.every((l) => completedIds.has(l.id))) return "completed";
  if (idx === 0) return "current";
  const prev = CAPITAL_LAUNCH_MODULES[idx - 1];
  if (prev.lessons.every((l) => completedIds.has(l.id))) return "current";
  return "locked";
}

export default function CapitalLaunchPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("zbd_online_completed");
      if (raw) setCompletedIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const totalLessons = CAPITAL_LAUNCH_MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = mounted
    ? CAPITAL_LAUNCH_MODULES.reduce(
        (s, m) => s + m.lessons.filter((l) => completedIds.has(l.id)).length,
        0
      )
    : 0;
  const overallPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          资本启航
        </h1>
        <div className="flex items-center gap-3">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ width: 180, backgroundColor: "#E0D9CE" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallPct}%`,
                background: "linear-gradient(to right, #9A7A32, #C9A84C)",
              }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            {completedCount}/{totalLessons} 关
          </span>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        {/* Spine */}
        <div
          className="absolute top-6 bottom-6 w-px"
          style={{ left: "calc(50% - 0.5px)", backgroundColor: "#E0D9CE" }}
        />

        <div className="space-y-5">
          {CAPITAL_LAUNCH_MODULES.map((mod, idx) => {
            const status: Status = mounted
              ? getStatus(idx, completedIds)
              : idx === 0
              ? "current"
              : "locked";
            const cardOnRight = idx % 2 === 0;
            const done = mounted
              ? mod.lessons.filter((l) => completedIds.has(l.id)).length
              : 0;
            const total = mod.lessons.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const color = status === "locked" ? "#C8C2BC" : mod.levelColor;

            const nodeEl = (
              <div className="relative z-10 flex-shrink-0 w-12 h-12">
                {status === "current" && (
                  <div
                    className="absolute rounded-full animate-pulse"
                    style={{
                      inset: -5,
                      backgroundColor: `${color}22`,
                    }}
                  />
                )}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm relative"
                  style={{
                    backgroundColor: status === "locked" ? "#EEEBE6" : color,
                    color: status === "locked" ? "#A8A29C" : "#FFFFFF",
                    boxShadow: status === "current" ? `0 0 18px ${color}45` : "none",
                  }}
                >
                  {status === "completed" ? "✓" : mod.order}
                </div>
              </div>
            );

            const cardEl = (
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: status === "locked" ? "#F7F4EF" : "#FFFFFF",
                  border: `1px solid ${status === "current" ? `${color}40` : "#E0D9CE"}`,
                  opacity: status === "locked" ? 0.55 : 1,
                }}
              >
                <div className="text-xs font-medium" style={{ color }}>
                  {mod.levelLabel}
                </div>
                <div
                  className="text-sm font-semibold mt-0.5 leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {mod.title}
                </div>
                <div
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {mod.subtitle}
                </div>
                {status !== "locked" && pct > 0 && (
                  <div
                    className="mt-2 h-0.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#E0D9CE" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "#82C8A0" : color,
                      }}
                    />
                  </div>
                )}
              </div>
            );

            const row = (
              <div className="flex items-center">
                {/* Left half */}
                <div className="flex-1 pr-3 flex justify-end">
                  {!cardOnRight && cardEl}
                </div>
                {/* Node */}
                {nodeEl}
                {/* Right half */}
                <div className="flex-1 pl-3">
                  {cardOnRight && cardEl}
                </div>
              </div>
            );

            return (
              <div key={mod.id}>
                {status === "locked" ? (
                  row
                ) : (
                  <Link href={`/online/learn/${mod.slug}`} className="block">
                    {row}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
