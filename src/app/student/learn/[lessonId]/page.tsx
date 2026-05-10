import { auth } from "../../../../../auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isGraduate, isStudentArea } from "@/lib/roles";
import Link from "next/link";
import CompleteButton from "./CompleteButton";

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "视频课",
  READING: "阅读材料",
  QUIZ: "测验",
  EXERCISE: "练习",
};

const TYPE_ICON: Record<string, string> = {
  VIDEO: "▶",
  READING: "📖",
  QUIZ: "✏",
  EXERCISE: "🧩",
};

const TYPE_COLOR: Record<string, string> = {
  VIDEO: "#C9A84C",
  READING: "#6B8FD4",
  QUIZ: "#4CAF82",
  EXERCISE: "#F97316",
};

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  if (!isStudentArea(role) && !isGraduate(role)) redirect("/dashboard");

  const grad = isGraduate(role);
  const studentLevel = grad ? 99 : (session.user.studentLevel ?? 1);

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } } },
      },
    },
  });

  if (!lesson) notFound();

  if (studentLevel < lesson.module.requiredLevel) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          需要 L{lesson.module.requiredLevel} 解锁
        </h1>
        <p className="text-sm mb-6" style={{ color: "#666660" }}>
          完成更多课程并升级到第 {lesson.module.requiredLevel} 阶后可访问此模块。
        </p>
        <Link
          href="/student/learn"
          className="text-sm px-5 py-2.5 rounded-xl"
          style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
        >
          ← 返回学习路径
        </Link>
      </div>
    );
  }

  let isCompleted = false;
  try {
    const progress = await prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: session.user.id, lessonId } },
    });
    isCompleted = progress?.completed ?? false;
  } catch {
    // DB not seeded
  }

  // Prev / next lesson in same module
  const lessonIndex = lesson.module.lessons.findIndex((l) => l.id === lessonId);
  const prevLesson = lessonIndex > 0 ? lesson.module.lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < lesson.module.lessons.length - 1
    ? lesson.module.lessons[lessonIndex + 1]
    : null;

  // Parse lesson content
  const content = lesson.content as { text?: string } | null;
  const contentText = content?.text ?? "";

  const typeColor = TYPE_COLOR[lesson.type] ?? "#C9A84C";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "#555550" }}>
        <Link href="/student/learn" className="hover:opacity-80">学习路径</Link>
        <span>›</span>
        <span style={{ color: "#A0A09A" }}>{lesson.module.title}</span>
      </div>

      {/* Header card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, #141414, #1A1A1A)",
          border: `1px solid ${typeColor}25`,
          boxShadow: `0 0 30px ${typeColor}08`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${typeColor}15`, border: `1px solid ${typeColor}30` }}
          >
            {TYPE_ICON[lesson.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
              >
                {TYPE_LABEL[lesson.type] ?? lesson.type}
              </span>
              {isCompleted && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: "rgba(76,175,130,0.15)", color: "#4CAF82" }}
                >
                  ✓ 已完成
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
              {lesson.title}
            </h1>
            <div className="flex items-center gap-3 text-xs" style={{ color: "#666660" }}>
              <span>{lesson.module.title}</span>
              <span>·</span>
              <span className="font-mono" style={{ color: "#C9A84C" }}>+{lesson.points} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: "#A0A09A" }}>课节内容</h2>
        {contentText ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#D0D0CA" }}>
            {contentText}
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="text-3xl mb-3">{TYPE_ICON[lesson.type]}</div>
            <p className="text-sm" style={{ color: "#555550" }}>
              {lesson.type === "VIDEO"
                ? "视频内容由顾问在课堂中提供"
                : lesson.type === "QUIZ"
                ? "测验将在课堂中进行"
                : "内容正在准备中，请联系顾问获取材料"}
            </p>
          </div>
        )}
      </div>

      {/* Complete action */}
      {!isCompleted && (
        <CompleteButton lessonId={lessonId} points={lesson.points} nextLessonId={nextLesson?.id} />
      )}

      {/* Completed state + next */}
      {isCompleted && nextLesson && (
        <div
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ backgroundColor: "rgba(76,175,130,0.06)", border: "1px solid rgba(76,175,130,0.2)" }}
        >
          <div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: "#4CAF82" }}>
              ✓ 本课已完成！
            </div>
            <div className="text-xs" style={{ color: "#666660" }}>
              下一课：{nextLesson.title}
            </div>
          </div>
          <Link
            href={`/student/learn/${nextLesson.id}`}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "rgba(76,175,130,0.12)", color: "#4CAF82", border: "1px solid rgba(76,175,130,0.25)" }}
          >
            下一课 →
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        {prevLesson ? (
          <Link
            href={`/student/learn/${prevLesson.id}`}
            className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg"
            style={{ color: "#666660", backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            ← {prevLesson.title}
          </Link>
        ) : (
          <Link
            href="/student/learn"
            className="text-xs py-2 px-3 rounded-lg"
            style={{ color: "#666660", backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            ← 学习路径
          </Link>
        )}

        {nextLesson && isCompleted && (
          <Link
            href={`/student/learn/${nextLesson.id}`}
            className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg"
            style={{ color: "#666660", backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            {nextLesson.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
