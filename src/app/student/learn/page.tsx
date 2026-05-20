"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CAPITAL_LAUNCH_MODULES } from "@/lib/capitalLaunchCourse";

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
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
        >
          资本启航
        </h1>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "#E0D9CE", maxWidth: 200 }}
          >
            <div
              className="h-full rounded-full transition-all"
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

      <div className="space-y-3">
        {CAPITAL_LAUNCH_MODULES.map((mod) => {
          const done = mounted
            ? mod.lessons.filter((l) => completedIds.has(l.id)).length
            : 0;
          const total = mod.lessons.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

          return (
            <Link key={mod.id} href={`/online/learn/${mod.slug}`} className="block">
              <div
                className="rounded-2xl p-4 transition-all hover:shadow-sm"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${mod.levelColor}18`, color: mod.levelColor }}
                  >
                    {mod.levelLabel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {mod.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {mod.subtitle} · {total} 关
                    </div>
                  </div>
                  <div
                    className="text-xs font-mono flex-shrink-0"
                    style={{ color: pct === 100 ? "#82C8A0" : "var(--color-text-muted)" }}
                  >
                    {done}/{total}
                  </div>
                </div>
                {pct > 0 && (
                  <div
                    className="mt-3 h-1 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#E0D9CE" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct === 100 ? "#82C8A0" : "#C9A84C",
                      }}
                    />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
