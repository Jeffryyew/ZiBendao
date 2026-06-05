"use client";

import { useEffect, useState } from "react";

export interface GuideStep {
  title: string;
  body: string;
}

interface ToolGuideProps {
  toolSlug: string;
  steps: GuideStep[];
}

function getSeenKey(slug: string) {
  return `zbd_guide_seen_${slug}`;
}

export default function ToolGuide({ toolSlug, steps }: ToolGuideProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Auto-open on first visit
  useEffect(() => {
    try {
      const seen = localStorage.getItem(getSeenKey(toolSlug));
      if (!seen) setOpen(true);
    } catch {}
  }, [toolSlug]);

  function close() {
    try {
      localStorage.setItem(getSeenKey(toolSlug), "1");
    } catch {}
    setOpen(false);
    setStep(0);
  }

  function restart() {
    setStep(0);
    setOpen(true);
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <>
      {/* Trigger button — always visible in top-right of tool */}
      <button
        onClick={restart}
        className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "rgba(201,168,76,0.1)",
          border: "1px solid rgba(201,168,76,0.25)",
          color: "#C9A84C",
        }}
      >
        工具讲解
      </button>

      {/* Overlay */}
      {open && current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-7 relative"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #2E2E2E" }}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-sm transition-opacity hover:opacity-70"
              style={{ color: "#666660" }}
            >
              X
            </button>

            {/* Step counter */}
            <p className="text-xs font-mono mb-4" style={{ color: "#555550" }}>
              {step + 1} / {steps.length}
            </p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full flex-1 transition-colors"
                  style={{
                    backgroundColor: i <= step ? "#C9A84C" : "#2E2E2E",
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <h3
              className="text-base font-bold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
            >
              {current.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>
              {current.body}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between mt-7">
              <button
                onClick={close}
                className="text-xs transition-opacity hover:opacity-70"
                style={{ color: "#555550" }}
              >
                跳过全部
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="text-sm px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#252525", color: "#A0A09A" }}
                  >
                    上一步
                  </button>
                )}
                {isLast ? (
                  <button
                    onClick={close}
                    className="text-sm px-5 py-2 rounded-xl font-semibold transition-opacity hover:opacity-80"
                    style={{
                      background: "linear-gradient(135deg, #B8943A, #C9A84C)",
                      color: "#1A1A1A",
                    }}
                  >
                    开始使用
                  </button>
                ) : (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="text-sm px-5 py-2 rounded-xl font-semibold transition-opacity hover:opacity-80"
                    style={{
                      background: "linear-gradient(135deg, #B8943A, #C9A84C)",
                      color: "#1A1A1A",
                    }}
                  >
                    下一步
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
