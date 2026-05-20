"use client";

import type { Badge, BadgeState } from "@/lib/badges";

interface BadgeIconProps {
  badge: Badge;
  state: BadgeState;
  size?: "sm" | "md" | "lg" | "xl";
  isNew?: boolean;     // pulse/glow animation
  onClick?: () => void;
}

const SIZES = {
  sm: { outer: 56, inner: 48, font: "1.4rem", nameFontSize: "0.55rem" },
  md: { outer: 72, inner: 62, font: "1.8rem", nameFontSize: "0.6rem" },
  lg: { outer: 96, inner: 82, font: "2.4rem", nameFontSize: "0.65rem" },
  xl: { outer: 128, inner: 110, font: "3rem",  nameFontSize: "0.75rem" },
};

/** Pointy-top hexagon clip path */
const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
/** Shield clip path for ultimate */
const SHIELD_CLIP = "polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)";

export function BadgeIcon({ badge, state, size = "md", isNew, onClick }: BadgeIconProps) {
  const s = SIZES[size];
  const locked = state === "locked";

  // Shape selector
  let clipPath = HEX_CLIP;
  let borderRadius = "0";
  if (badge.tier === "offline") {
    clipPath = "none";
    borderRadius = "50%";
  } else if (badge.tier === "ultimate") {
    clipPath = SHIELD_CLIP;
    borderRadius = "0";
  }

  const outerBg = locked
    ? "linear-gradient(145deg, #2a2a3a, #1a1a2e)"
    : badge.tier === "ultimate"
    ? `linear-gradient(145deg, #78350f, #d97706, #fbbf24)`
    : badge.tier === "offline"
    ? `linear-gradient(145deg, #1e1b4b, ${badge.color}88, ${badge.color}44)`
    : `linear-gradient(145deg, #0f172a, ${badge.color}66, ${badge.color}33)`;

  const innerBg = locked
    ? "linear-gradient(145deg, #1a1a2e, #0f0f1a)"
    : badge.tier === "ultimate"
    ? "linear-gradient(145deg, #1c0a00, #3b1f00)"
    : "linear-gradient(145deg, #0a0a1a, #0d0d22)";

  const glowColor = locked ? "transparent" : badge.tier === "ultimate" ? "#F59E0B" : badge.color;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      {/* Badge shape */}
      <div
        style={{
          width: s.outer,
          height: s.outer,
          position: "relative",
          filter: locked
            ? "grayscale(1) brightness(0.4)"
            : isNew
            ? `drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor}88)`
            : `drop-shadow(0 0 6px ${glowColor}88)`,
          transition: "filter 0.3s ease",
          animation: isNew ? "badgePulse 2s ease-in-out infinite" : "none",
        }}
      >
        {/* Outer (border layer) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: outerBg,
            clipPath,
            borderRadius,
          }}
        />
        {/* Inner (dark bg layer) */}
        <div
          style={{
            position: "absolute",
            inset: badge.tier === "offline" ? "3px" : "4px",
            background: innerBg,
            clipPath,
            borderRadius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: s.font,
              lineHeight: 1,
              filter: locked ? "grayscale(1)" : "none",
              opacity: locked ? 0.4 : 1,
              userSelect: "none",
            }}
          >
            {badge.icon}
          </span>
        </div>

        {/* "NEW" pip */}
        {isNew && (
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#F59E0B",
              border: "2px solid #0a0a1a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          />
        )}
      </div>

      {/* Name label */}
      <div
        style={{
          fontSize: s.nameFontSize,
          fontWeight: 600,
          color: locked ? "rgba(255,255,255,0.2)" : badge.tier === "ultimate" ? "#F59E0B" : "rgba(255,255,255,0.75)",
          textAlign: "center",
          letterSpacing: "0.03em",
          maxWidth: s.outer + 8,
          lineHeight: 1.2,
        }}
      >
        {badge.name}
      </div>

      <style>{`
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

/** Render a row of badge number chips (for achievement page header) */
export function BadgeProgressStrip({
  earnedCount,
  total,
  color = "#F59E0B",
}: {
  earnedCount: number;
  total: number;
  color?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: i < earnedCount ? color : "rgba(255,255,255,0.1)",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}
