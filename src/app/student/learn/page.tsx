import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type LessonType = "VIDEO" | "READING" | "QUIZ" | "EXERCISE";
type LessonStatus = "completed" | "current" | "locked";

interface CoursLesson {
  id: string;
  title: string;
  type: LessonType;
  points: number;
}

interface CourseModule {
  id: string;
  title: string;
  emoji: string;
  requiredLevel: number;
  lessons: CoursLesson[];
}

const COURSES: CourseModule[] = [
  {
    id: "mod-1",
    title: "财务基础",
    emoji: "💡",
    requiredLevel: 1,
    lessons: [
      { id: "l1-1", title: "什么是财务自由？", type: "VIDEO", points: 10 },
      { id: "l1-2", title: "资产与负债的秘密", type: "READING", points: 10 },
      { id: "l1-3", title: "现金流管理技巧", type: "QUIZ", points: 15 },
      { id: "l1-4", title: "储蓄策略入门", type: "VIDEO", points: 20 },
      { id: "l1-5", title: "复利的惊人力量", type: "EXERCISE", points: 25 },
    ],
  },
  {
    id: "mod-2",
    title: "投资入门",
    emoji: "📈",
    requiredLevel: 1,
    lessons: [
      { id: "l2-1", title: "股票基础知识", type: "VIDEO", points: 20 },
      { id: "l2-2", title: "债券与基金", type: "READING", points: 20 },
      { id: "l2-3", title: "分散风险策略", type: "QUIZ", points: 25 },
    ],
  },
  {
    id: "mod-3",
    title: "高级资本运作",
    emoji: "🏦",
    requiredLevel: 2,
    lessons: [
      { id: "l3-1", title: "企业估值方法", type: "VIDEO", points: 30 },
      { id: "l3-2", title: "市值分析实战", type: "EXERCISE", points: 35 },
      { id: "l3-3", title: "KPI体系构建", type: "QUIZ", points: 35 },
    ],
  },
  {
    id: "mod-4",
    title: "资本咨询精要",
    emoji: "🤝",
    requiredLevel: 3,
    lessons: [
      { id: "l4-1", title: "资本结构优化", type: "VIDEO", points: 40 },
      { id: "l4-2", title: "咨询方法论", type: "READING", points: 40 },
    ],
  },
];

const TYPE_ICON: Record<LessonType, string> = {
  VIDEO: "▶",
  READING: "≡",
  QUIZ: "?",
  EXERCISE: "✎",
};

const TYPE_LABEL: Record<LessonType, string> = {
  VIDEO: "视频",
  READING: "阅读",
  QUIZ: "测验",
  EXERCISE: "练习",
};

// Left and right X centers within the 320px map container
const LEFT_CX = 44;
const RIGHT_CX = 276;
const NODE_RADIUS = 28;
const SLOT_HEIGHT = 110;

export default async function StudentLearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const studentLevel = session.user.studentLevel ?? 1;

  let completedIds = new Set<string>();
  try {
    const progress = await prisma.lessonProgress.findMany({
      where: { userId: session.user.id, completed: true },
      select: { lessonId: true },
    });
    completedIds = new Set(progress.map((p) => p.lessonId));
  } catch {
    // DB not seeded yet — all lessons start uncompleted
  }

  // Determine first uncompleted lesson (current) per module
  const getStatus = (
    lesson: CoursLesson,
    index: number,
    lessons: CoursLesson[],
    moduleLocked: boolean
  ): LessonStatus => {
    if (completedIds.has(lesson.id)) return "completed";
    if (moduleLocked) return "locked";
    const prevCompleted = index === 0 || completedIds.has(lessons[index - 1].id);
    return prevCompleted ? "current" : "locked";
  };

  const totalLessons = COURSES.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = completedIds.size;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          学习路径
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1E1E", maxWidth: 200 }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((completedLessons / totalLessons) * 100)}%`,
                background: "linear-gradient(to right, #9A7A32, #C9A84C)",
              }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: "#A0A09A" }}>
            {completedLessons}/{totalLessons} 关
          </span>
        </div>
      </div>

      {/* Course modules */}
      <div className="space-y-10">
        {COURSES.map((module) => {
          const moduleLocked = studentLevel < module.requiredLevel;

          return (
            <div key={module.id}>
              {/* Module Banner */}
              <div
                className="flex items-center gap-3 p-4 rounded-2xl mb-6"
                style={{
                  backgroundColor: moduleLocked ? "#111111" : "#1A1A1A",
                  border: `1px solid ${moduleLocked ? "#1E1E1E" : "rgba(201,168,76,0.2)"}`,
                }}
              >
                <span className="text-2xl" style={{ opacity: moduleLocked ? 0.4 : 1 }}>
                  {module.emoji}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: moduleLocked ? "#555550" : "#F5F5F0" }}>
                    {module.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "#444440" }}>
                    {module.lessons.length} 关
                    {module.requiredLevel > 1 && ` · 需要 L${module.requiredLevel}`}
                  </div>
                </div>
                {moduleLocked ? (
                  <span style={{ color: "#333330" }}>🔒</span>
                ) : (
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-mono"
                    style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C" }}
                  >
                    L{module.requiredLevel}
                  </span>
                )}
              </div>

              {/* Lesson Path Map */}
              <LessonMap
                module={module}
                completedIds={completedIds}
                moduleLocked={moduleLocked}
                getStatus={getStatus}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonMap({
  module,
  completedIds,
  moduleLocked,
  getStatus,
}: {
  module: CourseModule;
  completedIds: Set<string>;
  moduleLocked: boolean;
  getStatus: (l: CoursLesson, i: number, ls: CoursLesson[], locked: boolean) => LessonStatus;
}) {
  const { lessons } = module;
  const containerH = lessons.length * SLOT_HEIGHT + NODE_RADIUS * 2;

  const nodeX = (i: number) => (i % 2 === 0 ? LEFT_CX : RIGHT_CX);

  return (
    <div className="flex justify-center">
      <div className="relative" style={{ width: 320, height: containerH }}>
        {/* SVG connector lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={320}
          height={containerH}
          aria-hidden
        >
          <defs>
            <linearGradient id={`g-${module.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {lessons.map((lesson, i) => {
            if (i === 0) return null;
            const x1 = nodeX(i - 1);
            const y1 = (i - 1) * SLOT_HEIGHT + NODE_RADIUS;
            const x2 = nodeX(i);
            const y2 = i * SLOT_HEIGHT + NODE_RADIUS;
            const prevCompleted = completedIds.has(lessons[i - 1].id);
            return (
              <line
                key={lesson.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={prevCompleted ? "#C9A84C" : "#282828"}
                strokeWidth={2}
                strokeDasharray={prevCompleted ? "0" : "6 4"}
                strokeOpacity={prevCompleted ? 0.5 : 1}
              />
            );
          })}
        </svg>

        {/* Lesson nodes */}
        {lessons.map((lesson, i) => {
          const status = getStatus(lesson, i, lessons, moduleLocked);
          const cx = nodeX(i);
          const cy = i * SLOT_HEIGHT;
          const isLeft = i % 2 === 0;

          const nodeStyle = {
            completed: {
              bg: "#C9A84C",
              border: "none",
              color: "#0D0D0D",
              shadow: "none",
            },
            current: {
              bg: "#1A1A1A",
              border: "2px solid #C9A84C",
              color: "#C9A84C",
              shadow: "0 0 18px rgba(201,168,76,0.4), 0 0 6px rgba(201,168,76,0.6)",
            },
            locked: {
              bg: "#111111",
              border: "2px solid #1E1E1E",
              color: "#333330",
              shadow: "none",
            },
          }[status];

          const icon =
            status === "completed"
              ? "✓"
              : status === "locked"
              ? "🔒"
              : TYPE_ICON[lesson.type];

          // Label on the opposite side of the path
          const labelLeft = isLeft ? cx + NODE_RADIUS + 8 : undefined;
          const labelRight = !isLeft ? 320 - cx + NODE_RADIUS + 8 : undefined;

          return (
            <div
              key={lesson.id}
              className="absolute"
              style={{ left: cx - NODE_RADIUS, top: cy }}
            >
              {/* Circle node */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold select-none"
                style={{
                  backgroundColor: nodeStyle.bg,
                  border: nodeStyle.border,
                  color: nodeStyle.color,
                  boxShadow: nodeStyle.shadow,
                  cursor: status === "locked" ? "not-allowed" : "pointer",
                }}
                title={lesson.title}
              >
                {icon}
              </div>

              {/* XP badge */}
              <div
                className="mt-1.5 text-center text-xs font-mono"
                style={{ color: status === "completed" ? "#C9A84C" : "#3A3A38" }}
              >
                +{lesson.points}
              </div>

              {/* Side label */}
              <div
                className="absolute text-xs leading-snug"
                style={{
                  left: labelLeft,
                  right: labelRight,
                  top: 8,
                  width: 112,
                  textAlign: isLeft ? "left" : "right",
                  color:
                    status === "completed"
                      ? "#A0A09A"
                      : status === "current"
                      ? "#F5F5F0"
                      : "#3A3A38",
                }}
              >
                <div className="font-medium leading-tight mb-0.5">{lesson.title}</div>
                <div style={{ color: status === "locked" ? "#2A2A28" : "#555550" }}>
                  {TYPE_LABEL[lesson.type]}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
