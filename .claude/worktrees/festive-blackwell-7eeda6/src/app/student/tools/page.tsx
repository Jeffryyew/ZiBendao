import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isGraduate } from "@/lib/roles";

interface Tool {
  slug: string;
  name: string;
  desc: string;
  requiredLevel: number;
  icon: string;
  color: string;
  features: string[];
}

const TOOLS: Tool[] = [
  {
    slug: "financial-roadmap",
    name: "金融路线图方程式",
    desc: "系统化规划你的财务目标与实现路径，生成个性化财富增长方案。",
    requiredLevel: 1,
    icon: "FV",
    color: "#C9A84C",
    features: ["目标财富计算", "时间规划", "投资回报预测", "PDF 导出"],
  },
  {
    slug: "pricing-system",
    name: "产品服务报价系统",
    desc: "专业级报价单生成器，支持多项目报价、税务计算和品牌定制。",
    requiredLevel: 2,
    icon: "QT",
    color: "#A88B3C",
    features: ["多项目明细", "税务计算", "折扣管理", "PDF/Excel 导出"],
  },
  {
    slug: "market-cap",
    name: "市值/市盈率计算器",
    desc: "深度企业估值分析工具，帮助你识别价值洼地，做出更理智的投资决策。",
    requiredLevel: 2,
    icon: "PE",
    color: "#A88B3C",
    features: ["市值计算", "PE/PB 分析", "行业对比", "图表可视化"],
  },
  {
    slug: "pat-kpi",
    name: "PAT & KPI 计算器",
    desc: "税后净利润与关键绩效指标综合分析，为企业经营决策提供数据支撑。",
    requiredLevel: 3,
    icon: "KPI",
    color: "#7A6030",
    features: ["PAT 计算", "KPI 追踪", "趋势图表", "报告导出"],
  },
];

export default async function StudentToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role as string;
  const grad = isGraduate(role);
  const studentLevel = grad ? 99 : (session.user.studentLevel ?? 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          计算工具
        </h1>
        <p className="text-sm" style={{ color: "#A0A09A" }}>
          专业级金融计算工具，支持导出 PDF / Excel
        </p>
      </div>

      {/* Level indicator */}
      <div
        className="flex items-center gap-3 p-4 rounded-xl mb-8"
        style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold font-mono flex-shrink-0"
          style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
        >
          {grad ? "毕业" : `第${studentLevel}阶`}
        </div>
        <div className="flex-1">
          <span className="text-sm" style={{ color: "#A0A09A" }}>
            {grad ? "毕业生" : "当前阶段"}可使用&nbsp;
            <span style={{ color: "#F5F5F0" }}>
              {TOOLS.filter((t) => t.requiredLevel <= studentLevel).length} / {TOOLS.length}
            </span>
            &nbsp;个工具
          </span>
        </div>
        {!grad && studentLevel < 3 && (
          <Link
            href="/student/learn"
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            升级解锁 →
          </Link>
        )}
      </div>

      {/* Tool Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {TOOLS.map((tool) => {
          const accessible = studentLevel >= tool.requiredLevel;
          return (
            <div
              key={tool.slug}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                backgroundColor: accessible ? "#141414" : "#0F0F0F",
                border: `1px solid ${accessible ? "#282828" : "#181818"}`,
                opacity: accessible ? 1 : 0.55,
              }}
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      backgroundColor: accessible ? `${tool.color}18` : "#1A1A1A",
                      border: `1px solid ${accessible ? `${tool.color}30` : "#222222"}`,
                    }}
                  >
                    {accessible ? tool.icon : "锁定"}
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0"
                    style={{
                      backgroundColor: accessible ? `${tool.color}18` : "#1A1A1A",
                      color: accessible ? tool.color : "#444440",
                    }}
                  >
                    L{tool.requiredLevel}+
                  </span>
                </div>

                <h3 className="text-base font-semibold mb-2" style={{ color: accessible ? "#F5F5F0" : "#555550" }}>
                  {tool.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: accessible ? "#A0A09A" : "#3A3A38" }}>
                  {tool.desc}
                </p>
              </div>

              {/* Features */}
              <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-1.5">
                  {tool.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: accessible ? "#666660" : "#2A2A28" }}
                    >
                      <span style={{ color: accessible ? "#C9A84C" : "#2A2A28" }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-5 mt-auto">
                {accessible ? (
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                  >
                    使用工具 →
                  </Link>
                ) : (
                  <div
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                    style={{ backgroundColor: "#181818", color: "#3A3A38", border: "1px solid #1E1E1E" }}
                  >
                    需要 L{tool.requiredLevel} 解锁
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export note */}
      <p className="text-center text-xs mt-8" style={{ color: "#444440" }}>
        所有工具均支持导出 PDF / Excel · 数据本地计算，安全可靠
      </p>
    </div>
  );
}
