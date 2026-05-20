"use client";

import { useEffect, useRef, useState } from "react";
import { useBadge } from "@/context/BadgeContext";
import { setBadgeState } from "@/lib/badges";

// ─── Gold Particle ─────────────────────────────────────────────────────────────
function Particle({ delay, angle, speed, color }: { delay: number; angle: number; speed: number; color: string }) {
  const x = Math.cos(angle) * speed * 100;
  const y = Math.sin(angle) * speed * 100;
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: `particle 1.2s ease-out ${delay}s forwards`,
        transform: "translate(-50%, -50%)",
        ["--px" as string]: `${x}px`,
        ["--py" as string]: `${y}px`,
      }}
    />
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function BadgeUnlockModal() {
  const { pendingBadge, dismissCurrent } = useBadge();
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (pendingBadge) {
      // Mark as unlocked_new in localStorage
      setBadgeState(pendingBadge.id, "unlocked_new");
      setPhase("enter");
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [pendingBadge]);

  useEffect(() => {
    if (visible && phase === "enter") {
      timerRef.current = setTimeout(() => setPhase("show"), 50);
    }
    return () => clearTimeout(timerRef.current);
  }, [visible, phase]);

  if (!visible || !pendingBadge) return null;

  const badge = pendingBadge;
  const isUltimate = badge.tier === "ultimate";
  const accentColor = isUltimate ? "#F59E0B" : badge.color;

  // 24 particles at random angles
  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * Math.PI * 2 + Math.random() * 0.3,
    speed: 0.6 + Math.random() * 0.8,
    delay: Math.random() * 0.3,
    color: i % 3 === 0 ? "#F59E0B" : i % 3 === 1 ? "#FCD34D" : accentColor,
  }));

  const entering = phase === "enter";

  return (
    <>
      <style>{`
        @keyframes particle {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0); opacity: 0; }
        }
        @keyframes badgeAppear {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.12) rotate(2deg); opacity: 1; }
          80% { transform: scale(0.96) rotate(-1deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(30deg); }
          100% { transform: translateX(300%) rotate(30deg); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes textSlideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={dismissCurrent}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: entering ? "transparent" : "rgba(0,0,0,0.75)",
          backdropFilter: entering ? "none" : "blur(4px)",
          transition: "background 0.4s ease, backdrop-filter 0.4s ease",
          cursor: "pointer",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: entering ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {/* Pulse ring */}
          {!entering && (
            <>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 160,
                height: 160,
                marginLeft: -80,
                marginTop: -80,
                borderRadius: "50%",
                border: `2px solid ${accentColor}`,
                animation: "ringPulse 1.2s ease-out forwards",
              }} />
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 160,
                height: 160,
                marginLeft: -80,
                marginTop: -80,
                borderRadius: "50%",
                border: `2px solid ${accentColor}88`,
                animation: "ringPulse 1.2s ease-out 0.3s forwards",
              }} />
            </>
          )}

          {/* Badge */}
          <div
            style={{
              position: "relative",
              animation: !entering ? "badgeAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
            }}
          >
            {/* Particles */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {particles.map((p, i) => (
                <Particle key={i} {...p} />
              ))}
            </div>

            {/* Badge visual */}
            <div style={{ position: "relative", width: 140, height: 140 }}>
              {/* Glow background */}
              <div style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${accentColor}44 0%, transparent 70%)`,
              }} />

              {/* Hex outer */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: isUltimate
                  ? "linear-gradient(145deg, #78350f, #d97706, #fbbf24)"
                  : `linear-gradient(145deg, #0f172a, ${accentColor}88, ${accentColor}44)`,
                clipPath: isUltimate
                  ? "polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)"
                  : "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }} />
              {/* Hex inner */}
              <div style={{
                position: "absolute",
                inset: 8,
                background: isUltimate
                  ? "linear-gradient(145deg, #1c0a00, #3b1f00)"
                  : "linear-gradient(145deg, #0a0a1a, #0d0d22)",
                clipPath: isUltimate
                  ? "polygon(50% 0%, 100% 15%, 100% 65%, 50% 100%, 0% 65%, 0% 15%)"
                  : "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: "3.2rem", lineHeight: 1, userSelect: "none" }}>
                  {badge.icon}
                </span>
              </div>

              {/* Shimmer effect */}
              {!entering && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  pointerEvents: "none",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "40%",
                    height: "200%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                    animation: "shimmer 1.5s ease-out 0.5s forwards",
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div
            style={{
              textAlign: "center",
              animation: !entering ? "textSlideUp 0.5s ease-out 0.4s both" : "none",
            }}
          >
            <div style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}>
              🎉 恭喜你获得新徽章
            </div>
            <div style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}88`,
              marginBottom: 4,
            }}>
              {badge.name}
            </div>
            <div style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.5)",
              maxWidth: 220,
              lineHeight: 1.5,
            }}>
              {badge.description}
            </div>
          </div>

          {/* Dismiss hint */}
          <div
            onClick={dismissCurrent}
            style={{
              marginTop: 8,
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.25)",
              cursor: "pointer",
              animation: !entering ? "textSlideUp 0.5s ease-out 0.8s both" : "none",
            }}
          >
            点击任意位置关闭
          </div>
        </div>
      </div>
    </>
  );
}
