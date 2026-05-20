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
import { PricingSimulator } from "@/components/online/PricingSimulator";
import { ValuationSimulator } from "@/components/online/ValuationSimulator";
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
      // 1. Mark lesson complete
      const raw = localStorage.getItem("zbd_online_completed");
      const ids: string[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(lesson.id)) {
        ids.push(lesson.id);
        localStorage.setItem("zbd_online_completed", JSON.stringify(ids));
      }

      // 2. Check for newly unlocked badges
      const currentStates = getBadgeStates();
      const newBadges = checkNewBadges(ids, currentStates);
      if (newBadges.length > 0) {
        // Mark as unlocked_new before queuing
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
  }, [next, router, moduleSlug]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: lesson.scene?.bg ?? "linear-gradient(180deg, #0a0a1a 0%, #050510 100%)" }}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
      >
        <Link
          href="/student/learn"
          className="text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          ← 资本启航
        </Link>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          {lesson.title}
        </span>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-mono"
          style={{ background: `${mod.levelColor}20`, color: mod.levelColor }}
        >
          +{lesson.xpReward}XP
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        {lesson.type === "STORY" && (
          <StoryLesson
            lesson={lesson}
            mod={mod}
            onComplete={handleComplete}
            completed={completed}
          />
        )}
        {lesson.type === "QUIZ" && (
          <QuizLesson
            lesson={lesson}
            mod={mod}
            onComplete={handleComplete}
            completed={completed}
          />
        )}
        {lesson.type === "SIMULATION" && (
          <SimulationLesson
            lesson={lesson}
            mod={mod}
            onComplete={handleComplete}
            completed={completed}
          />
        )}
        {lesson.type === "REFLECTION" && (
          <ReflectionLesson
            lesson={lesson}
            mod={mod}
            onComplete={handleComplete}
            completed={completed}
          />
        )}
      </div>

      {/* Complete / Next CTA */}
      {completed && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 60%, transparent)" }}
        >
          <div className="max-w-sm mx-auto">
            <div
              className="rounded-2xl p-4 mb-3 text-center"
              style={{ background: `${mod.levelColor}18`, border: `1px solid ${mod.levelColor}33` }}
            >
              <div className="text-2xl mb-1">✨</div>
              <div className="text-sm font-bold mb-1" style={{ color: mod.levelColor }}>
                +{lesson.xpReward} XP 获得！
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {next ? `下一关：${next.lesson.title}` : "🎉 模块完成！"}
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

// ─── STORY LESSON ─────────────────────────────────────────────────────────────
function StoryLesson({
  lesson,
  mod,
  onComplete,
  completed,
}: {
  lesson: Lesson;
  mod: Module;
  onComplete: () => void;
  completed: boolean;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = lesson.slides ?? [];
  const current = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;

  const color = mod.levelColor;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-6">
      {/* Scene Label */}
      {lesson.scene && (
        <div
          className="text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-2 mb-6 self-start"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {lesson.scene.name}
        </div>
      )}

      {/* Slide Progress */}
      <div className="flex gap-1.5 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full transition-all duration-300"
            style={{ background: i <= slideIdx ? color : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>

      {/* Slide Content */}
      {current && (
        <div className="flex-1">
          {/* Text */}
          <div
            className="text-xl md:text-2xl font-medium leading-relaxed mb-6 text-center"
            style={{ color: "#FFFFFF", whiteSpace: "pre-line" }}
          >
            {current.text}
          </div>

          {/* Highlight */}
          {current.highlight && (
            <div
              className="text-center py-3 px-5 rounded-2xl mx-auto max-w-sm"
              style={{
                background: `${color}15`,
                border: `1px solid ${color}33`,
                color,
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              {current.highlight}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className={`flex gap-3 mt-8 ${completed ? "pb-32" : ""}`}>
        {slideIdx > 0 && (
          <button
            onClick={() => setSlideIdx((i) => i - 1)}
            className="px-5 py-3 rounded-xl text-sm transition-opacity hover:opacity-70"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            ← 上一页
          </button>
        )}
        <button
          onClick={() => {
            if (isLast) {
              onComplete();
            } else {
              setSlideIdx((i) => i + 1);
            }
          }}
          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          {isLast ? "完成阅读 ✓" : "下一页 →"}
        </button>
      </div>
    </div>
  );
}

// ─── QUIZ LESSON ──────────────────────────────────────────────────────────────
function QuizLesson({
  lesson,
  mod,
  onComplete,
  completed,
}: {
  lesson: Lesson;
  mod: Module;
  onComplete: () => void;
  completed: boolean;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const questions = lesson.questions ?? [];
  const q = questions[qIdx];
  const color = mod.levelColor;
  const isLastQ = qIdx === questions.length - 1;

  const handleSelect = (optId: string) => {
    if (answered) return;
    setSelected(optId);
    const opt = q.options.find((o) => o.id === optId);
    const isCorrect = opt?.correct ?? false;
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (isLastQ) {
      onComplete();
    } else {
      setQIdx((i) => i + 1);
      setSelected(null);
      setAnswered(false);
      setCorrect(false);
    }
  };

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Progress */}
      <div className="flex gap-1.5 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full"
            style={{ background: i < qIdx ? color : i === qIdx ? `${color}66` : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>

      {/* Q number */}
      <div className="text-xs font-mono mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
        第 {qIdx + 1} 题 / 共 {questions.length} 题
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-8 leading-relaxed" style={{ color: "#FFFFFF" }}>
        {q.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {q.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showResult = answered;
          let bg = "rgba(255,255,255,0.04)";
          let border = "1px solid rgba(255,255,255,0.08)";
          let textColor = "rgba(255,255,255,0.7)";

          if (showResult && opt.correct) {
            bg = "rgba(34,197,94,0.12)";
            border = "1px solid rgba(34,197,94,0.4)";
            textColor = "#86efac";
          } else if (showResult && isSelected && !opt.correct) {
            bg = "rgba(239,68,68,0.12)";
            border = "1px solid rgba(239,68,68,0.4)";
            textColor = "#fca5a5";
          } else if (isSelected) {
            bg = `${color}15`;
            border = `1px solid ${color}44`;
            textColor = color;
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="w-full text-left p-4 rounded-xl transition-all duration-200"
              style={{ background: bg, border, color: textColor, cursor: answered ? "default" : "pointer" }}
            >
              <span className="text-sm font-medium">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            background: correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: correct ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div className="text-sm font-bold mb-1" style={{ color: correct ? "#86efac" : "#fca5a5" }}>
            {correct ? "✓ 正确！" : "✗ 再想想"}
          </div>
          {q.options.find((o) => o.id === selected)?.explanation && (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {q.options.find((o) => o.id === selected)?.explanation}
            </p>
          )}
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${completed ? "mb-32" : ""}`}
          style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          {isLastQ ? `完成测验 (${score}/${questions.length} 正确) ✓` : "下一题 →"}
        </button>
      )}
    </div>
  );
}

// ─── SIMULATION LESSON ────────────────────────────────────────────────────────
function SimulationLesson({
  lesson,
  mod,
  onComplete,
  completed,
}: {
  lesson: Lesson;
  mod: Module;
  onComplete: () => void;
  completed: boolean;
}) {
  const color = mod.levelColor;
  const simType = lesson.simulation?.type;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="text-xs font-mono mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>互动模拟</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#FFFFFF" }}>{lesson.title}</h2>
        {lesson.simulation?.description && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{lesson.simulation.description}</p>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ border: `1px solid ${color}22`, background: "rgba(255,255,255,0.02)" }}
      >
        {simType === "pricing" && <PricingSimulator color={color} />}
        {simType === "valuation" && <ValuationSimulator color={color} />}
      </div>

      {!completed && (
        <button
          onClick={onComplete}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          我已理解 → 完成模拟
        </button>
      )}
      {completed && <div className="pb-32" />}
    </div>
  );
}

// ─── REFLECTION LESSON ────────────────────────────────────────────────────────
function ReflectionLesson({
  lesson,
  mod,
  onComplete,
  completed,
}: {
  lesson: Lesson;
  mod: Module;
  onComplete: () => void;
  completed: boolean;
}) {
  const [text, setText] = useState("");
  const color = mod.levelColor;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Key Insight */}
      {lesson.keyInsight && (
        <div
          className="rounded-2xl p-6 mb-8 text-center"
          style={{ background: `${color}10`, border: `1px solid ${color}25` }}
        >
          <p className="text-base font-medium leading-relaxed" style={{ color: "#FFFFFF" }}>
            {lesson.keyInsight}
          </p>
        </div>
      )}

      {/* Prompt */}
      {lesson.reflectionPrompt && (
        <div className="mb-4">
          <div className="text-xs font-mono mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
            深度思考
          </div>
          <p className="text-base font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            {lesson.reflectionPrompt}
          </p>
        </div>
      )}

      {/* Input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在这里写下你的想法…（可选）"
        rows={4}
        className="w-full rounded-xl p-4 text-sm resize-none outline-none mb-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#FFFFFF",
          lineHeight: 1.6,
        }}
      />

      {!completed && (
        <button
          onClick={onComplete}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${completed ? "mb-32" : ""}`}
          style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}11 100%)`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          完成思考 ✓
        </button>
      )}
      {completed && <div className="pb-32" />}
    </div>
  );
}
