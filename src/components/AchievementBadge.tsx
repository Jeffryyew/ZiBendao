"use client";

import type { Achievement } from "@/lib/achievements";

const TIER_COLORS: Record<Achievement["tier"], string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#C9A84C",
};

interface AchievementBadgeProps {
  achievement: Achievement;
  isEn: boolean;
  size?: "sm" | "md" | "lg";
}

export default function AchievementBadge({ achievement, isEn, size = "md" }: AchievementBadgeProps) {
  const color = TIER_COLORS[achievement.tier];
  const name = isEn ? achievement.en : achievement.zh;

  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span>{achievement.icon}</span>
        <span className="text-xs font-medium" style={{ color: "#A0A09A" }}>{name}</span>
      </span>
    );
  }

  if (size === "lg") {
    return (
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: "#111111", border: `1px solid ${color}25` }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">{achievement.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold mb-0.5" style={{ color: "#F5F5F0" }}>{name}</div>
            <div className="text-xs" style={{ color }}>
              {isEn ? "✓ Unlocked" : "✓ 已解锁"}
            </div>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono capitalize flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            {achievement.tier}
          </span>
        </div>
      </div>
    );
  }

  // size === "md"
  return (
    <div
      className="p-3 rounded-xl flex flex-col gap-2"
      style={{ backgroundColor: "#111111", border: `1px solid ${color}22` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xl">{achievement.icon}</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded-full font-mono capitalize"
          style={{ backgroundColor: `${color}12`, color, border: `1px solid ${color}28` }}
        >
          {achievement.tier}
        </span>
      </div>
      <div>
        <div className="text-xs font-semibold leading-snug" style={{ color: "#E5E5E0" }}>{name}</div>
        <div className="text-xs mt-0.5" style={{ color: `${color}CC` }}>{isEn ? "✓ Unlocked" : "✓ 已解锁"}</div>
      </div>
    </div>
  );
}
