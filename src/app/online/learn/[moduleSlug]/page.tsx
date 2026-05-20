"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CAPITAL_LAUNCH_MODULES, getModuleBySlug } from "@/lib/capitalLaunchCourse";

const DEMO_COMPLETED: string[] = [];

export default function ModuleOverviewPage({ params }: { params: Promise<{ moduleSlug: string }> }) {
  const { moduleSlug } = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [completedLessons] = useState<Set<string>>(new Set(DEMO_COMPLETED));

  useEffect(() => { setMounted(true); }, []);

  const mod = getModuleBySlug(moduleSlug);

  if (!mounted) return null;
  if (!mod) {
    router.push("/online/learn");
    return null;
  }

  const completedCount = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
  const color = mod.levelColor;

  // Find first uncompleted lesson
  const nextLesson = mod.lessons.find((l) => !completedLessons.has(l.id)) ?? mod.lessons[0];

  const LESSON_TYPE_LABEL: Record<string, string> = {
    STORY: "📖 故事讲解",
    QUIZ: "✅ 理解测验",
    SIMULATION: "🧮 互动模拟",
    REFLECTION: "💭 深度思考",
  };

  const LESSON_TYPE_DURATION: Record<string, string> = {
    STORY: "4-5 分钟",
    QUIZ: "2-3 分钟",
    SIMULATION: "5-8 分钟",
    REFLECTION: "2-3 分钟",
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #0a0a1a 0%, #050510 100%)" }}
    >
      {/* Back */}
      <div className="px-4 pt-6">
        <Link
          href="/online/learn"
          className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          ← 返回地图
        </Link>
      </div>

      {/* Module Hero */}
      <div
        className="mx-4 mt-4 rounded-3xl p-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}15 0%, rgba(0,0,0,0) 100%)`,
          border: `1px solid ${color}30`,
        }}
      >
        {/* Glow */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
        />

        <div className="relative z-10">
          <div className="text-4xl mb-3">{mod.icon}</div>
          <div className="text-xs font-medium mb-2" style={{ color: `${color}99` }}>
            {mod.levelLabel} · 模块 {mod.order} / 11
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
            {mod.title}
          </h1>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            {mod.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color }}>{mod.lessons.length}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>关卡</div>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color }}>+{mod.xpReward}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>XP</div>
            </div>
            <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color }}>{completedCount}/{mod.lessons.length}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>完成</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="px-4 mt-6 pb-32">
        <h2 className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>
          课程关卡
        </h2>
        <div className="space-y-3">
          {mod.lessons.map((lesson, idx) => {
            const isDone = completedLessons.has(lesson.id);
            const isNext = lesson.id === nextLesson.id;
            const isLocked = !isDone && !isNext && idx > 0 && !completedLessons.has(mod.lessons[idx - 1].id);

            return (
              <div key={lesson.id}>
                {isLocked ? (
                  <LessonRow
                    lesson={lesson}
                    idx={idx}
                    isDone={isDone}
                    isNext={isNext}
                    isLocked={true}
                    color={color}
                    typeLabel={LESSON_TYPE_LABEL[lesson.type] ?? lesson.type}
                    duration={LESSON_TYPE_DURATION[lesson.type] ?? "5 分钟"}
                    href="#"
                  />
                ) : (
                  <Link href={`/online/learn/${moduleSlug}/${lesson.slug}`}>
                    <LessonRow
                      lesson={lesson}
                      idx={idx}
                      isDone={isDone}
                      isNext={isNext}
                      isLocked={false}
                      color={color}
                      typeLabel={LESSON_TYPE_LABEL[lesson.type] ?? lesson.type}
                      duration={LESSON_TYPE_DURATION[lesson.type] ?? "5 分钟"}
                      href={`/online/learn/${moduleSlug}/${lesson.slug}`}
                    />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, #050510 60%, transparent)" }}>
        <Link
          href={`/online/learn/${moduleSlug}/${nextLesson.slug}`}
          className="block w-full max-w-sm mx-auto text-center py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            color: "#FFFFFF",
            boxShadow: `0 4px 24px ${color}44`,
          }}
        >
          {completedCount === 0 ? "开始学习 →" : completedCount === mod.lessons.length ? "再次复习 →" : "继续学习 →"}
        </Link>
      </div>
    </div>
  );
}

function LessonRow({
  lesson,
  idx,
  isDone,
  isNext,
  isLocked,
  color,
  typeLabel,
  duration,
}: {
  lesson: { id: string; title: string; subtitle?: string; xpReward: number };
  idx: number;
  isDone: boolean;
  isNext: boolean;
  isLocked: boolean;
  color: string;
  typeLabel: string;
  duration: string;
  href: string;
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
      style={{
        background: isNext
          ? `${color}10`
          : "rgba(255,255,255,0.025)",
        border: isNext
          ? `1px solid ${color}30`
          : isDone
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(255,255,255,0.04)",
        opacity: isLocked ? 0.35 : 1,
        cursor: isLocked ? "default" : "pointer",
      }}
    >
      {/* Number / Status */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{
          background: isDone ? color : isNext ? `${color}22` : "rgba(255,255,255,0.06)",
          color: isDone ? "#FFF" : isNext ? color : "rgba(255,255,255,0.3)",
          border: isNext ? `1px solid ${color}44` : "none",
        }}
      >
        {isDone ? "✓" : isLocked ? "🔒" : idx + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: isDone ? "rgba(255,255,255,0.5)" : "#FFFFFF" }}>
          {lesson.title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{typeLabel}</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{duration}</span>
        </div>
      </div>

      {/* XP */}
      <div className="text-xs font-mono flex-shrink-0" style={{ color: isDone ? `${color}88` : "rgba(255,255,255,0.2)" }}>
        +{lesson.xpReward}XP
      </div>
    </div>
  );
}
