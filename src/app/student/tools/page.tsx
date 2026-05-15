import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const TOOLS = [
  {
    slug: "financial-roadmap",
    name: "金融路线图方程式",
    desc: "系统化规划你的财务目标与实现路径，生成个性化财富增长方案。",
    icon: "FV",
    features: ["目标财富计算", "时间规划", "投资回报预测", "CSV 导出"],
  },
  {
    slug: "pricing-system",
    name: "产品服务报价系统",
    desc: "专业级报价单生成器，支持多项目报价、税务计算和品牌定制。",
    icon: "QT",
    features: ["多项目明细", "税务计算", "折扣管理", "PDF 打印"],
  },
  {
    slug: "market-cap",
    name: "市值/市盈率计算器",
    desc: "深度企业估值分析工具，帮助你识别价值洼地，做出更理智的投资决策。",
    icon: "PE",
    features: ["市值计算", "PE/PB 分析", "行业对比", "图表可视化"],
  },
  {
    slug: "pat-kpi",
    name: "PAT & KPI 计算器",
    desc: "税后净利润与关键绩效指标综合分析，为企业经营决策提供数据支撑。",
    icon: "KPI",
    features: ["PAT 计算", "KPI 追踪", "趋势图表", "报告导出"],
  },
];

export default async function StudentToolsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
          计算工具
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          专业级金融计算工具，支持导出 PDF / Excel
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {TOOLS.map((tool) => (
          <div
            key={tool.slug}
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
          >
            <div className="p-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold font-mono flex-shrink-0"
                  style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                >
                  {tool.icon}
                </div>
              </div>
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                {tool.name}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {tool.desc}
              </p>
            </div>

            <div className="px-5 pb-4">
              <div className="grid grid-cols-2 gap-1.5">
                {tool.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    <span style={{ color: "#C9A84C" }}></span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 pb-5 mt-auto">
              <Link
                href={`/tools/${tool.slug}`}
                className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#C9A84C", color: "#FFFFFF" }}
              >
                使用工具 →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-2xl text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
        <p className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
          企业资本操作系统
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-secondary)" }}>
          22 个企业级专业工具，涵盖财务、融资、股权、风控等核心模块
        </p>
        <Link
          href="/dashboard/capital"
          className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#1C1814", color: "#FFFFFF" }}
        >
          进入企业资本系统 →
        </Link>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
        所有工具均支持导出 PDF / Excel · 数据本地计算，安全可靠
      </p>
    </div>
  );
}
