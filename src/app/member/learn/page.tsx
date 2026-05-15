import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const FREE_LESSONS = [
  {
    id: 1,
    title: "什么是财务自由？",
    type: "VIDEO",
    duration: "8分钟",
    points: 10,
    desc: "探索财务自由的定义，了解为什么大多数人无法实现它，以及你需要建立的正确思维框架。",
  },
  {
    id: 2,
    title: "资产与负债的秘密",
    type: "READING",
    duration: "5分钟",
    points: 10,
    desc: "学习富人如何区分资产和负债，以及这个简单概念如何颠覆你对金钱的认知。",
  },
  {
    id: 3,
    title: "现金流管理技巧",
    type: "QUIZ",
    duration: "10分钟",
    points: 15,
    desc: "通过互动测验巩固你对现金流的理解，并学习实用的日常管理方法。",
  },
];

const LOCKED_LESSONS = [
  { title: "储蓄策略入门", type: "VIDEO", points: 20 },
  { title: "复利的惊人力量", type: "EXERCISE", points: 25 },
  { title: "股票基础知识", type: "VIDEO", points: 20 },
  { title: "债券与基金", type: "READING", points: 20 },
];

const TYPE_ICON: Record<string, string> = {
  VIDEO: "",
  READING: "",
  QUIZ: "",
  EXERCISE: "",
};

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "视频",
  READING: "阅读",
  QUIZ: "测验",
  EXERCISE: "练习",
};

export default async function MemberLearnPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          学习中心
        </h1>
        <p className="text-sm" style={{ color: "#A0A09A" }}>
          免费体验前 3 关，升级解锁完整课程体系
        </p>
      </div>

      {/* Module 1 - Unlocked */}
      <div className="mb-4">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl mb-5"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid rgba(201,168,76,0.25)" }}
        >
          <span className="text-2xl"></span>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>模块一：财务基础</div>
            <div className="text-xs mt-0.5" style={{ color: "#666660" }}>3 关免费体验</div>
          </div>
          <div
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-mono"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
          >
            FREE
          </div>
        </div>

        <div className="space-y-3">
          {FREE_LESSONS.map((lesson, i) => (
            <div
              key={lesson.id}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #222222" }}
            >
              <div
                className="p-4"
                style={{ backgroundColor: "#141414" }}
              >
                <div className="flex items-start gap-4">
                  {/* Number circle */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: "rgba(201,168,76,0.15)",
                      color: "#C9A84C",
                      border: "2px solid rgba(201,168,76,0.3)",
                    }}
                  >
                    {i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>
                        {lesson.title}
                      </span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-mono"
                        style={{ backgroundColor: "#222222", color: "#888880" }}
                      >
                        {TYPE_LABEL[lesson.type]}
                      </span>
                    </div>
                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#888880" }}>
                      {lesson.desc}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs" style={{ color: "#555550" }}> {lesson.duration}</span>
                      <span className="text-xs" style={{ color: "#444440" }}>+{lesson.points} XP</span>
                    </div>
                  </div>

                  <button
                    className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                  >
                    开始
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paywall / Locked Section */}
      <div className="relative mt-8">
        {/* Fade overlay */}
        <div
          className="absolute top-0 left-0 right-0 h-16 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, #0D0D0D)",
            top: -1,
          }}
        />

        {/* Locked lessons (blurred) */}
        <div className="space-y-3 opacity-30 pointer-events-none select-none">
          {LOCKED_LESSONS.map((lesson, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: "#1A1A1A", color: "#555550" }}
              >
                
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "#888880" }}>{lesson.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "#444440" }}>+{lesson.points} XP</div>
              </div>
            </div>
          ))}
        </div>

        {/* Upgrade CTA overlay */}
        <div className="relative z-20 mt-2 flex flex-col items-center text-center py-10 px-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            解锁完整课程体系
          </h3>
          <p className="text-sm mb-6 max-w-xs" style={{ color: "#A0A09A" }}>
            升级为学生会员，访问全部课程、计算工具和成就系统，开始你的金融成长之旅。
          </p>
          <Link
            href="/about"
            className="px-8 py-3 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            联系我们报名 →
          </Link>
          <p className="text-xs mt-3" style={{ color: "#444440" }}>
            随时取消 · 无隐藏费用
          </p>
        </div>
      </div>
    </div>
  );
}
