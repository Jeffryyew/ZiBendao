import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const FREE_LESSONS = [
  { id: 1, title: "什么是财务自由？", type: "VIDEO", duration: "8分钟", points: 10 },
  { id: 2, title: "资产与负债的秘密", type: "READING", duration: "5分钟", points: 10 },
  { id: 3, title: "现金流管理技巧", type: "QUIZ", duration: "10分钟", points: 15 },
];

const TYPE_LABEL: Record<string, string> = {
  VIDEO: "视频",
  READING: "阅读",
  QUIZ: "测验",
};

const LOCKED_TOOLS = [
  { name: "金融路线图方程式", level: "L1", desc: "规划财务目标与实现路径" },
  { name: "产品服务报价系统", level: "L2", desc: "专业报价单生成" },
  { name: "市值/市盈率计算器", level: "L2", desc: "企业估值分析工具" },
  { name: "PAT & KPI 计算器", level: "L3", desc: "税后利润与KPI可视化" },
];

export default async function MemberDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-sm mb-1" style={{ color: "#A0A09A" }}>{greeting}，</p>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          {firstName} 👋
        </h1>
      </div>

      {/* Upgrade Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "linear-gradient(135deg, #1A1A1A 0%, #222218 100%)",
          border: "1px solid rgba(201,168,76,0.4)",
          boxShadow: "0 0 32px rgba(201,168,76,0.08)",
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: "radial-gradient(circle at 80% 50%, #C9A84C 0%, transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="text-xs font-mono mb-2" style={{ color: "#C9A84C" }}>⭐ 升级会员</div>
          <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
            解锁完整课程体系与专业工具
          </h2>
          <p className="text-sm" style={{ color: "#A0A09A" }}>
            你正在体验免费版。升级后可访问全部课程、工具和成就系统。
          </p>
        </div>
        <Link
          href="/pricing"
          className="relative flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          查看方案 →
        </Link>
      </div>

      {/* Free Lessons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base">体验课程</h2>
          <Link href="/member/learn" className="text-xs" style={{ color: "#C9A84C" }}>
            查看全部 →
          </Link>
        </div>

        <div className="space-y-3">
          {FREE_LESSONS.map((lesson, i) => (
            <div
              key={lesson.id}
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ backgroundColor: "#141414", border: "1px solid #222222" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0 font-bold"
                style={{ backgroundColor: "#1A1A1A", color: "#C9A84C" }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: "#F5F5F0" }}>
                  {lesson.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#222222", color: "#666660" }}>
                    {TYPE_LABEL[lesson.type]}
                  </span>
                  <span className="text-xs" style={{ color: "#555550" }}>{lesson.duration}</span>
                  <span className="text-xs" style={{ color: "#444440" }}>+{lesson.points} XP</span>
                </div>
              </div>
              <button
                className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
              >
                开始
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Locked Tools Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base">专业工具 <span className="text-xs ml-1" style={{ color: "#555550" }}>（需升级解锁）</span></h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {LOCKED_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-3 p-4 rounded-xl opacity-60"
              style={{ backgroundColor: "#111111", border: "1px solid #1E1E1E" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                style={{ backgroundColor: "#1A1A1A", color: "#555550" }}
              >
                {tool.level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate" style={{ color: "#888880" }}>{tool.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#444440" }}>{tool.desc}</div>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: "#333330" }}>🔒</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "可学课程", value: "3", unit: "关" },
          { label: "获得积分", value: "0", unit: "XP" },
          { label: "已完成", value: "0", unit: "关" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
          >
            <div className="text-xl font-bold font-mono" style={{ color: "#C9A84C" }}>
              {stat.value}
              <span className="text-xs font-normal ml-0.5" style={{ color: "#666660" }}>{stat.unit}</span>
            </div>
            <div className="text-xs mt-1" style={{ color: "#555550" }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
