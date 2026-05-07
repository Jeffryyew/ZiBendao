import Link from "next/link";
import BackNav from "@/components/BackNav";

const TOOLS = [
  {
    slug: "financial-roadmap",
    icon: "🗺",
    name: "金融路线图方程式",
    level: "L1+",
    desc: "系统化规划财务目标，用复利公式预测未来财富增长轨迹，图表可视化导出。",
    features: ["FV 复利计算", "目标反推月存款", "增长曲线图表", "CSV 导出"],
  },
  {
    slug: "pricing-system",
    icon: "💰",
    name: "产品服务报价系统",
    level: "L2+",
    desc: "快速生成专业报价单，动态项目管理，支持折扣和税务计算，一键打印 PDF。",
    features: ["动态行项目", "折扣/税务", "报价单预览", "打印 PDF"],
  },
  {
    slug: "market-cap",
    icon: "📊",
    name: "市值/市盈率计算器",
    level: "L2+",
    desc: "多维度企业估值分析：PE、PB、PS 与行业均值对比，识别价值高估或低估。",
    features: ["PE/PB/PS 计算", "行业均值对比", "估值评级", "Bar Chart"],
  },
  {
    slug: "pat-kpi",
    icon: "📈",
    name: "PAT & KPI 计算器",
    level: "L3+",
    desc: "完整损益表分解，计算税后净利润 PAT、ROE、ROA，KPI 目标达成追踪。",
    features: ["损益表分解", "PAT 计算", "ROE / ROA", "KPI 目标追踪"],
  },
];

export default function ToolsPage() {
  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0", minHeight: "100vh" }}>
      {/* Minimal Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: "rgba(13,13,13,0.9)", borderBottom: "1px solid #1A1A1A", backdropFilter: "blur(12px)" }}
      >
        <Link href="/" className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
          资本道
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm px-4 py-2 rounded-xl" style={{ color: "#A0A09A" }}>登录</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-xl font-medium" style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}>
            免费注册
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <div className="mb-8 flex justify-center">
          <BackNav />
        </div>
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6"
            style={{ backgroundColor: "#1A1A1A", border: "1px solid #333333", color: "#C9A84C" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
            专业计算工具库
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            金融计算工具
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#A0A09A" }}>
            4 款专业级工具，涵盖财富规划、企业估值、利润分析。
            结果支持导出 PDF / Excel，数据本地计算。
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {TOOLS.map((tool) => (
            <div
              key={tool.slug}
              className="rounded-2xl p-7 flex flex-col"
              style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  {tool.icon}
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-mono flex-shrink-0 mt-1"
                  style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
                >
                  {tool.level}
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>{tool.name}</h3>
              <p className="text-sm leading-relaxed mb-5 flex-1" style={{ color: "#A0A09A" }}>{tool.desc}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-6">
                {tool.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs" style={{ color: "#666660" }}>
                    <span style={{ color: "#C9A84C" }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="block text-center py-2.5 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#1A1A1A", color: "#A0A09A", border: "1px solid #2A2A2A" }}
              >
                注册即可使用 →
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center p-10 rounded-3xl"
          style={{ background: "linear-gradient(135deg, #1A1A1A, #222218)", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            立即解锁全部工具
          </h2>
          <p className="text-sm mb-6" style={{ color: "#A0A09A" }}>
            免费注册体验 L1 工具，升级解锁完整工具集与课程体系。
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            免费注册 →
          </Link>
        </div>
      </div>
    </div>
  );
}
