"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getModuleBySlug,
  getLessonBySlug,
  getNextLesson,
  CAPITAL_LAUNCH_MODULES,
  type Lesson,
  type Module,
} from "@/lib/capitalLaunchCourse";
import { checkNewBadges, getBadgeStates, setBadgeState } from "@/lib/badges";
import { useBadge } from "@/context/BadgeContext";

// Global lesson index across all modules
function getLessonGlobalIndex(moduleSlug: string, lessonSlug: string): number {
  let idx = 0;
  for (const mod of CAPITAL_LAUNCH_MODULES) {
    for (const lesson of mod.lessons) {
      idx++;
      if (mod.slug === moduleSlug && lesson.slug === lessonSlug) return idx;
    }
  }
  return 0;
}

const TOTAL_LESSONS = CAPITAL_LAUNCH_MODULES.reduce((s, m) => s + m.lessons.length, 0);

// ─── Section config: Lucide Icons only, zero emoji ──────────────────────────
type SectionKey = "问题" | "故事" | "概念" | "结论";

type SectionCfg = {
  label: string;
  color: string;
  bg: string;
  border: string;
};

const SECTION_CONFIG: Record<SectionKey, SectionCfg> = {
  "问题": {
    label: "问题",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.06)",
    border: "rgba(96,165,250,0.18)",
  },
  "故事": {
    label: "故事",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.06)",
    border: "rgba(167,139,250,0.18)",
  },
  "概念": {
    label: "概念",
    color: "#34D399",
    bg: "rgba(52,211,153,0.06)",
    border: "rgba(52,211,153,0.18)",
  },
  "结论": {
    label: "结论",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.06)",
    border: "rgba(251,191,36,0.18)",
  },
};

interface Step {
  key: SectionKey | null;
  body: string;
  cfg: SectionCfg | null;
}

function parseSteps(text: string): Step[] {
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p) => {
    const colonIdx = p.indexOf("：");
    if (colonIdx > 0 && colonIdx <= 4) {
      const key = p.slice(0, colonIdx) as SectionKey;
      const body = p.slice(colonIdx + 1).trim();
      const cfg = SECTION_CONFIG[key] ?? null;
      if (cfg) return { key, body, cfg };
    }
    return { key: null, body: p, cfg: null };
  });
}

// ─── Page entry ──────────────────────────────────────────────────────────────
export default function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = use(params);
  const router = useRouter();
  const mod = getModuleBySlug(moduleSlug);
  const lesson = mod ? getLessonBySlug(moduleSlug, lessonSlug) : undefined;

  useEffect(() => {
    if (!mod || !lesson) router.push("/online/learn");
  }, [mod, lesson, router]);

  if (!mod || !lesson) return null;
  return <LessonPlayer mod={mod} lesson={lesson} moduleSlug={moduleSlug} />;
}

// ─── Lesson Player ────────────────────────────────────────────────────────────
function LessonPlayer({
  mod,
  lesson,
  moduleSlug,
}: {
  mod: Module;
  lesson: Lesson;
  moduleSlug: string;
}) {
  const router = useRouter();
  const { queueBadges } = useBadge();
  const next = getNextLesson(moduleSlug, lesson.slug);
  const steps = parseSteps(lesson.content?.text ?? "");
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);

  const globalIdx = getLessonGlobalIndex(moduleSlug, lesson.slug);
  const color = mod.levelColor;

  const markComplete = useCallback(() => {
    try {
      const raw = localStorage.getItem("zbd_online_completed");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(lesson.id)) {
        ids.push(lesson.id);
        localStorage.setItem("zbd_online_completed", JSON.stringify(ids));
      }
      const currentStates = getBadgeStates();
      const newBadges = checkNewBadges(ids, currentStates);
      if (newBadges.length > 0) {
        for (const badge of newBadges) setBadgeState(badge.id, "unlocked_new");
        queueBadges(newBadges);
      }
    } catch {}
  }, [lesson.id, queueBadges]);

  const handleContinue = useCallback(() => {
    if (stepIdx < steps.length - 1) {
      setStepIdx((i) => i + 1);
    } else {
      markComplete();
      setDone(true);
    }
  }, [stepIdx, steps.length, markComplete]);

  const handleGoNext = useCallback(() => {
    if (next) router.push(`/online/learn/${next.module.slug}/${next.lesson.slug}`);
    else router.push("/student/learn");
  }, [next, router]);

  if (done) {
    return (
      <CompletionView
        lesson={lesson}
        mod={mod}
        next={next}
        onGoNext={handleGoNext}
      />
    );
  }

  const step = steps[stepIdx] ?? { key: null, body: "", cfg: null };
  const isLastStep = stepIdx === steps.length - 1;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #0a0a14 0%, #06060e 100%)" }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 px-4 pt-3 pb-3"
        style={{
          background: "rgba(6,6,14,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={`/online/learn/${moduleSlug}`}
            className="shrink-0 transition-opacity hover:opacity-60"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            ←
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {mod.levelLabel} · 第 {globalIdx} / {TOTAL_LESSONS} 关
              </span>
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.22)" }}>
                步骤 {stepIdx + 1} / {steps.length}
              </span>
            </div>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      i < stepIdx
                        ? color
                        : i === stepIdx
                        ? `${color}70`
                        : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <h2
          className="text-sm font-medium truncate pl-7"
          style={{ color: "rgba(255,255,255,0.48)" }}
        >
          {lesson.title}
        </h2>
      </div>

      {/* Step card */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-4 py-12">
        {step.cfg ? (
          <div
            className="rounded-3xl p-7"
            style={{ background: step.cfg.bg, border: `1px solid ${step.cfg.border}` }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <span
                className="text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                style={{ color: step.cfg.color, background: `${step.cfg.color}15`, border: `1px solid ${step.cfg.color}28` }}
              >
                {step.cfg.label}
              </span>
            </div>
            <p
              className="text-base"
              style={{ color: "rgba(255,255,255,0.88)", lineHeight: "1.85" }}
            >
              {step.body}
            </p>
          </div>
        ) : (
          <div
            className="rounded-3xl p-7"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              className="text-base"
              style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.85" }}
            >
              {step.body}
            </p>
          </div>
        )}

        <button
          onClick={handleContinue}
          className="w-full mt-8 py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={
            isLastStep
              ? {
                  background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                  color: "#fff",
                  boxShadow: `0 4px 20px ${color}38`,
                }
              : {
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }
          }
        >
          {isLastStep ? "我理解了" : "继续"}
        </button>
      </div>
    </div>
  );
}

// ─── Completion View ──────────────────────────────────────────────────────────
function CompletionView({
  lesson,
  mod,
  next,
  onGoNext,
}: {
  lesson: Lesson;
  mod: Module;
  next: { module: Module; lesson: Lesson } | null;
  onGoNext: () => void;
}) {
  const color = mod.levelColor;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #0a0a14 0%, #06060e 100%)" }}
    >
      <div className="max-w-sm w-full text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: `${color}15`, border: `1px solid ${color}28` }}
        >
          <span style={{ fontSize: 38, color, lineHeight: 1 }}>✓</span>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
          本关完成
        </h1>
        <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          {lesson.title}
        </p>

        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl mb-8 mt-3"
          style={{ background: `${color}12`, border: `1px solid ${color}22` }}
        >
          <span className="text-sm font-bold" style={{ color }}>
            +{lesson.xpReward} XP
          </span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
            已获得
          </span>
        </div>

        {next && (
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.28)" }}>
            下一关：{next.lesson.title}
          </p>
        )}

        <button
          onClick={onGoNext}
          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            color: "#fff",
            boxShadow: `0 4px 20px ${color}38`,
          }}
        >
          {next ? "进入下一关" : "返回课程地图"}
        </button>

        <Link
          href="/student/learn"
          className="block mt-4 text-xs transition-opacity hover:opacity-60"
          style={{ color: "rgba(255,255,255,0.22)" }}
        >
          返回课程地图
        </Link>
      </div>
    </div>
  );
}
