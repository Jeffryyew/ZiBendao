"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getModuleBySlug,
  getLessonBySlug,
  getNextLesson,
  type Lesson,
  type Module,
} from "@/lib/capitalLaunchCourse";
import { checkNewBadges, getBadgeStates, setBadgeState } from "@/lib/badges";
import { useBadge } from "@/context/BadgeContext";

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

// ─── Lesson Player shell ──────────────────────────────────────────────────────
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
  const [completed, setCompleted] = useState(false);
  const { queueBadges } = useBadge();
  const next = getNextLesson(moduleSlug, lesson.slug);

  // Progress within module
  const lessonIdx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const progress = Math.round(((lessonIdx + 1) / mod.lessons.length) * 100);

  const handleComplete = useCallback(() => {
    setCompleted(true);
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

  const handleNext = useCallback(() => {
    if (next) router.push(`/online/learn/${next.module.slug}/${next.lesson.slug}`);
    else router.push("/student/learn");
  }, [next, router]);

  const color = mod.levelColor;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(180deg, #0a0a14 0%, #06060e 100%)" }}
    >
      {/* ── Top Bar ── */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
        style={{
          background: "rgba(6,6,14,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link
          href={`/online/learn/${moduleSlug}`}
          className="shrink-0 text-sm transition-opacity hover:opacity-60"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          ←
        </Link>

        {/* Progress bar */}
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: color }}
          />
        </div>

        <span
          className="shrink-0 text-xs font-mono px-2 py-1 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          +{lesson.xpReward} XP
        </span>
      </div>

      {/* ── Card content ── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-36">
        {/* Lesson header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
            >
              {mod.icon} {mod.levelLabel}
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              关 {lessonIdx + 1} / {mod.lessons.length}
            </span>
          </div>
          <h1
            className="text-xl font-bold leading-snug"
            style={{ color: "#FFFFFF", fontFamily: "var(--font-display, system-ui)" }}
          >
            {lesson.title}
          </h1>
        </div>

        {/* Four section cards */}
        <LessonCards text={lesson.content?.text ?? ""} color={color} />

        {/* Complete button */}
        {!completed && (
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-2xl font-bold text-sm mt-6 transition-all active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
              color: "#fff",
              boxShadow: `0 4px 20px ${color}40`,
            }}
          >
            完成这一关 ✓
          </button>
        )}
      </div>

      {/* ── XP celebration + Next CTA ── */}
      {completed && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{
            background: "linear-gradient(to top, rgba(6,6,14,0.98) 70%, transparent)",
          }}
        >
          <div className="max-w-lg mx-auto">
            <div
              className="rounded-2xl px-5 py-3 mb-3 flex items-center justify-between"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <div>
                <div className="text-sm font-bold" style={{ color }}>
                  🎉 +{lesson.xpReward} XP 获得！
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {next ? `下一关：${next.lesson.title}` : "本模块全部完成！"}
                </div>
              </div>
              <div className="text-2xl">{mod.icon}</div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                color: "#fff",
                boxShadow: `0 4px 20px ${color}40`,
              }}
            >
              {next ? `继续下一关 →` : "返回课程地图 →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section config ────────────────────────────────────────────────────────────
const SECTIONS: Record<string, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  问题: {
    emoji: "🤔",
    label: "问题",
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.07)",
    border: "rgba(96,165,250,0.2)",
  },
  故事: {
    emoji: "📖",
    label: "故事",
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.07)",
    border: "rgba(167,139,250,0.2)",
  },
  概念: {
    emoji: "💡",
    label: "概念",
    color: "#34D399",
    bg: "rgba(52,211,153,0.07)",
    border: "rgba(52,211,153,0.2)",
  },
  结论: {
    emoji: "✅",
    label: "结论",
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.07)",
    border: "rgba(251,191,36,0.2)",
  },
};

// ─── LessonCards: parse and render the four sections ─────────────────────────
function LessonCards({ text, color }: { text: string; color: string }) {
  // Split on double-newlines, trim each paragraph
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Map each paragraph to a known section or a generic card
  const cards = paragraphs.map((p) => {
    const colonIdx = p.indexOf("：");
    if (colonIdx > 0 && colonIdx <= 4) {
      const key = p.slice(0, colonIdx);
      const body = p.slice(colonIdx + 1).trim();
      const cfg = SECTIONS[key];
      if (cfg) return { ...cfg, body, isKnown: true };
    }
    return {
      emoji: "📌",
      label: "",
      color,
      bg: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.08)",
      body: p,
      isKnown: false,
    };
  });

  return (
    <div className="space-y-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
          }}
        >
          {card.isKnown && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg leading-none">{card.emoji}</span>
              <span
                className="text-xs font-bold tracking-wider uppercase"
                style={{ color: card.color }}
              >
                {card.label}
              </span>
            </div>
          )}
          <p
            className="text-sm leading-relaxed"
            style={{ color: card.isKnown ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)" }}
          >
            {card.body}
          </p>
        </div>
      ))}
    </div>
  );
}
