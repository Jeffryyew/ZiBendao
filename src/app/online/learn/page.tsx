"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CAPITAL_LAUNCH_MODULES, LEVEL_COLORS, LEVEL_LABELS, XP_PER_LEVEL, getUserLevel, phases } from "@/lib/capitalLaunchCourse";

const DEMO_XP = 0;
const DEMO_COMPLETED: string[] = [];

export default function OnlineLearnPage() {
  const [mounted, setMounted] = useState(false);
  const [xp] = useState(DEMO_XP);
  const [completedLessons] = useState<Set<string>>(new Set(DEMO_COMPLETED));

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const level = getUserLevel(xp);
  const levelColor = LEVEL_COLORS[level - 1];
  const nextLevelXp = XP_PER_LEVEL[Math.min(level, 6)];
  const prevLevelXp = XP_PER_LEVEL[level - 1];
  const xpProgress = nextLevelXp > prevLevelXp
    ? ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100
    : 100;

  const totalLessons = CAPITAL_LAUNCH_MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completedLessons.size;

  const unlockedModules = new Set<string>();
  for (let i = 0; i < CAPITAL_LAUNCH_MODULES.length; i++) {
    const m = CAPITAL_LAUNCH_MODULES[i];
    if (i === 0) { unlockedModules.add(m.id); continue; }
    const prev = CAPITAL_LAUNCH_MODULES[i - 1];
    const allPrevDone = prev.lessons.every((l) => completedLessons.has(l.id));
    if (allPrevDone) unlockedModules.add(m.id);
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(180deg, #0a0a1a 0%, #050510 100%)",
        fontFamily: "var(--font-display), system-ui, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        className="sticky top-0 z-20 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(5,5,16,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link
          href="/student/dashboard"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          返回总览
        </Link>

        <div className="flex items-center gap-3">
          <div
            className="px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: levelColor + "22", color: levelColor, border: "1px solid " + levelColor + "44" }}
          >
            {LEVEL_LABELS[level - 1]}
          </div>
          <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: xpProgress + "%", background: "linear-gradient(90deg, " + levelColor + ", " + levelColor + "cc)" }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
            {xp} XP
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {completedCount}/{totalLessons} 关完成
          </span>
          <Link
            href="/online/achievements"
            className="text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-80"
            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}
          >
            成就
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center pt-14 pb-10 px-4">
        <h1
          className="text-3xl md:text-4xl font-bold mb-3"
          style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}
        >
          资本启航
        </h1>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          从 0 开始理解资本运作 · 13章 · 100关 · AI沉浸式体验
        </p>
      </div>

      {/* Module Map */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div className="relative">
          <div
            className="absolute left-1/2 top-8 bottom-8 w-px"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", transform: "translateX(-50%)" }}
          />

          <div className="space-y-6">
            {CAPITAL_LAUNCH_MODULES.map((mod, idx) => {
              const isUnlocked = unlockedModules.has(mod.id);
              const isCompleted = mod.lessons.every((l) => completedLessons.has(l.id));
              const inProgress = !isCompleted && mod.lessons.some((l) => completedLessons.has(l.id));
              const completedInMod = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
              const isLeft = idx % 2 === 0;
              const phaseBanner = phases.find((p) => p.chapterOrders[0] === mod.order);

              return (
                <div key={mod.id}>
                  {phaseBanner && (
                    <div className={"w-full rounded-2xl p-4 mb-4 bg-gradient-to-r " + phaseBanner.color + " text-white"}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                          {phaseBanner.id}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{"第" + phaseBanner.id + "阶段 · " + phaseBanner.title}</div>
                          <div className="text-xs opacity-80">{phaseBanner.subtitle + " · 共" + phaseBanner.chapterOrders.length + "章"}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={"relative flex " + (isLeft ? "justify-start" : "justify-end")}>
                    <div
                      className="absolute left-1/2 top-8 w-3 h-3 rounded-full border-2"
                      style={{
                        transform: "translateX(-50%)",
                        background: isCompleted ? mod.levelColor : isUnlocked ? "#1a1a3a" : "#0d0d20",
                        borderColor: isCompleted ? mod.levelColor : isUnlocked ? mod.levelColor + "44" : "rgba(255,255,255,0.08)",
                        boxShadow: isCompleted ? "0 0 12px " + mod.levelColor + "88" : "none",
                        zIndex: 2,
                      }}
                    />
                    <div className="w-[calc(50%-24px)]">
                      {isUnlocked ? (
                        <Link href={"/online/learn/" + mod.slug}>
                          <ModuleCard mod={mod} isCompleted={isCompleted} inProgress={inProgress} isUnlocked={isUnlocked} completedInMod={completedInMod} />
                        </Link>
                      ) : (
                        <ModuleCard mod={mod} isCompleted={isCompleted} inProgress={inProgress} isUnlocked={isUnlocked} completedInMod={completedInMod} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  mod, isCompleted, inProgress, isUnlocked, completedInMod,
}: {
  mod: typeof CAPITAL_LAUNCH_MODULES[0];
  isCompleted: boolean;
  inProgress: boolean;
  isUnlocked: boolean;
  completedInMod: number;
}) {
  const color = mod.levelColor;
  const total = mod.lessons.length;

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300"
      style={{
        background: isUnlocked
          ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.015)",
        border: isCompleted
          ? "1px solid " + color + "55"
          : inProgress
          ? "1px solid " + color + "33"
          : isUnlocked
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(255,255,255,0.04)",
        opacity: isUnlocked ? 1 : 0.4,
        cursor: isUnlocked ? "pointer" : "default",
        boxShadow: isCompleted ? "0 0 20px " + color + "22" : "none",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{
            background: isUnlocked ? color + "15" : "rgba(255,255,255,0.04)",
            border: "1px solid " + color + (isUnlocked ? "30" : "10"),
          }}
        >
          {isUnlocked ? mod.icon : "-"}
        </div>
        <div className="flex items-center gap-1.5">
          {isCompleted && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + "20", color }}>
              完成
            </span>
          )}
          {inProgress && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              进行中
            </span>
          )}
          <span className="text-xs font-mono" style={{ color: color + "88" }}>
            +{mod.xpReward}XP
          </span>
        </div>
      </div>

      <div className="mb-1">
        <div className="text-xs font-medium mb-0.5" style={{ color: color + "aa" }}>
          {mod.levelLabel} · 模块{mod.order}
        </div>
        <h3 className="text-sm font-bold leading-snug" style={{ color: isUnlocked ? "#FFFFFF" : "rgba(255,255,255,0.3)" }}>
          {mod.title}
        </h3>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
        {mod.subtitle}
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: ((completedInMod / total) * 100) + "%", background: color }}
          />
        </div>
        <span className="text-xs font-mono flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
          {completedInMod}/{total}
        </span>
      </div>
    </div>
  );
}
