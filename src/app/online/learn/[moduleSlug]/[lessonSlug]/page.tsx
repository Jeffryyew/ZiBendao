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

// ─── Lesson Player ─────────────────────────────────────────────────────────────
function LessonPlayer({ mod, lesson, moduleSlug }: { mod: Module; lesson: Lesson; moduleSlug: string }) {
  const router = useRouter();
  const [completed, setCompleted] = useState(false);
  const { queueBadges } = useBadge();

  const next = getNextLesson(moduleSlug, lesson.slug);

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
        for (const badge of newBadges) {
          setBadgeState(badge.id, "unlocked_new");
        }
        queueBadges(newBadges);
      }
    } catch {}
  }, [lesson.id, queueBadges]);

  const handleNext = useCallback(() => {
    if (next) {
      router.push(`/online/learn/${next.module.slug}/${next.lesson.slug}`);
    } else {
      router.push("/student/learn");
    }
  }, [next, router]);

  const bg = "linear-gradient(180deg, #0a0a14 0%, #06060e 100%)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 sticky top-0 z-10"
        style={{ background: "rgba(6,6,14,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link
          href={`/online/learn/${moduleSlug}`}
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          &larr; {mod.title}
        </Link>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-mono"
          style={{ background: `${mod.levelColor}20`, color: mod.levelColor }}
        >
          +{lesson.xpReward} XP
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <ReadingLesson lesson={lesson} mod={mod} onComplete={handleComplete} completed={completed} />
      </div>

      {/* Complete / Next CTA */}
      {completed && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{ background: "linear-gradient(to top, rgba(6,6,14,0.98) 60%, transparent)" }}
        >
          <div className="max-w-sm mx-auto">
            <div
              className="rounded-2xl p-4 mb-3 text-center"
              style={{ background: `${mod.levelColor}18`, border: `1px solid ${mod.levelColor}33` }}
            >
              <div className="text-sm font-bold mb-1" style={{ color: mod.levelColor }}>
                +{lesson.xpReward} XP 获得！
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {next ? `下一关：${next.lesson.title}` : "模块完成！"}
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${mod.levelColor} 0%, ${mod.levelColor}cc 100%)`,
                color: "#FFFFFF",
                boxShadow: `0 4px 24px ${mod.levelColor}44`,
              }}
            >
              {next ? `继续：${next.lesson.title} →` : "完成模块 →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section label config ─────────────────────────────────────────────────────
const SECTION_LABELS: Record<string, { emoji: string; color: string; bg: string }> = {
  "问题": { emoji: "🤔", color: "#60A5FA", bg: "rgba(96,165,250,0.08)" },
  "故事": { emoji: "📖", color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
  "概念": { emoji: "💡", color: "#34D399", bg: "rgba(52,211,153,0.08)" },
  "结论": { emoji: "✅", color: "#FBBF24", bg: "rgba(251,191,36,0.08)" },
};

// ─── READING LESSON ───────────────────────────────────────────────────────────
function ReadingLesson({
  lesson, mod, onComplete, completed,
}: {
  lesson: Lesson; mod: Module; onComplete: () => void; completed: boolean;
}) {
  const color = mod.levelColor;
  const text = lesson.content?.text ?? "";

  // Parse paragraphs: split on double newlines
  const paragraphs = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  // Each paragraph may start with a label like "问题：", "故事：" etc.
  const parsed = paragraphs.map((p) => {
    const colonIdx = p.indexOf("：");
    if (colonIdx > 0 && colonIdx <= 4) {
      const label = p.slice(0, colonIdx);
      const body = p.slice(colonIdx + 1).trim();
      const config = SECTION_LABELS[label];
      if (config) return { label, body, ...config };
    }
    return { label: null, body: p, emoji: null, color: "rgba(255,255,255,0.75)", bg: "transparent" };
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-32">
      {/* Lesson header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full mb-4"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
        >
          <span>{mod.icon}</span>
          <span>{mod.levelLabel}</span>
        </div>
        <h1
          className="text-2xl font-bold leading-snug"
          style={{ color: "#FFFFFF", fontFamily: "var(--font-display, system-ui)" }}
        >
          {lesson.title}
        </h1>
      </div>

      {/* Content sections */}
      <div className="space-y-4">
        {parsed.map((section, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              background: section.label ? section.bg : "rgba(255,255,255,0.02)",
              border: section.label
                ? `1px solid ${section.color}25`
                : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {section.label && (
              <div
                className="flex items-center gap-2 mb-3"
              >
                <span className="text-base">{section.emoji}</span>
                <span
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: section.color }}
                >
                  {section.label}
                </span>
              </div>
            )}
            <p
              className="text-sm leading-relaxed"
              style={{ color: section.label ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.6)" }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>

      {/* Complete button */}
      {!completed && (
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl font-bold text-sm mt-8 transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          完成阅读 ✓
        </button>
      )}
    </div>
  );
}
