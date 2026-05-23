import Link from "next/link";
import { auth } from "@/lib/auth";
import { isGraduate } from "@/lib/roles";

const TOOLS = [
  {
    slug: "financial-roadmap",
    accent: "#2D7D4F",
    accentBg: "rgba(45,125,79,0.07)",
    accentBorder: "rgba(45,125,79,0.18)",
    requiredLevel: 1,
    name: "企业财务路线图",
    tagline: "用复利思维规划你的财务未来",
    about:
      "基于终值公式（FV = PV × (1 + r)ⁿ）精确计算资产增长路径。输入当前资产、预期收益率与目标年限，系统自动生成年度增长曲线与每月储蓄目标，帮助你把抽象的财富目标转化为可执行的行动计划。",
    usecases: [
      "正在规划 5–10 年退休储蓄计划的个人",
      "为客户制作财富增长方案的顾问",
      "需要向投资人展示回报预测的创业者",
    ],
    steps: [
      { n: "01", title: "输入财务参数", desc: "填入现有资产、年化收益率、投资年限与月定投金额" },
      { n: "02", title: "系统自动计算", desc: "实时生成复利曲线，反推每月所需储蓄额" },
      { n: "03", title: "导出规划报告", desc: "下载 CSV 数据表或打印为 PDF 保存备用" },
    ],
    features: ["FV 终值公式计算", "目标反推月储蓄", "年度增长 Area Chart", "CSV 数据导出"],
  },
  {
    slug: "pricing-system",
    accent: "#2D5FA8",
    accentBg: "rgba(45,95,168,0.07)",
    accentBorder: "rgba(45,95,168,0.18)",
    requiredLevel: 1,
    name: "智能产品报价系统",
    tagline: "秒级生成专业级报价单，告别 Excel 拼凑",
    about:
      "动态添加报价行项目，支持单价、数量、折扣率与税率的实时计算，自动汇总小计、折扣金额与应付总额。报价单预览采用白底专业排版，一键打印或导出 PDF，直接递交客户。",
    usecases: [
      "顾问和服务商向客户提交正式报价",
      "产品团队快速计算多方案报价对比",
      "企业销售制作含税报价备案文件",
    ],
    steps: [
      { n: "01", title: "添加报价项目", desc: "填写服务名称、单价、数量，支持无限行项目" },
      { n: "02", title: "配置折扣与税务", desc: "设定整体折扣率与 SST 税率，系统自动计算" },
      { n: "03", title: "预览并导出", desc: "实时预览白底报价单，一键打印为 PDF" },
    ],
    features: ["动态行项目管理", "折扣 + 税率计算", "报价单实时预览", "一键打印 PDF"],
  },
  {
    slug: "market-cap",
    accent: "#8B6514",
    accentBg: "rgba(139,101,20,0.07)",
    accentBorder: "rgba(139,101,20,0.18)",
    requiredLevel: 2,
    name: "企业估值系统",
    tagline: "多维度估值分析，识别真正的价值洼地",
    about:
      "同时运用 PE（市盈率）、PB（市净率）、PS（市销率）三种估值模型对企业进行综合评估，并与行业均值自动对比，生成估值评级（低估 / 合理 / 高估）。柱状图直观呈现你的标的与行业基准的差距。",
    usecases: [
      "投资者筛选优质标的、判断买卖时机",
      "企业主了解自身估值水平以备融资谈判",
      "顾问为客户出具独立估值分析报告",
    ],
    steps: [
      { n: "01", title: "输入企业财务数据", desc: "填写净利润、净资产、营收、总股本与股价" },
      { n: "02", title: "选择行业基准", desc: "系统内置各行业平均 PE/PB/PS 供对比参考" },
      { n: "03", title: "查看估值评级", desc: "自动输出综合评级，附带可视化行业对比 Bar Chart" },
    ],
    features: ["PE / PB / PS 三模型", "行业均值自动对比", "估值评级（颜色标示）", "Bar Chart 可视化"],
  },
  {
    slug: "pat-kpi",
    accent: "#7C5FBF",
    accentBg: "rgba(124,95,191,0.07)",
    accentBorder: "rgba(124,95,191,0.18)",
    requiredLevel: 3,
    name: "企业绩效系统",
    tagline: "从损益表到 KPI，一页掌握企业经营健康度",
    about:
      "输入完整收入与成本结构，系统自动分解损益表，计算税后净利润（PAT）、股本回报率（ROE）、资产回报率（ROA）。KPI 目标追踪模块以进度条与瀑布图呈现各项指标完成度，帮助管理层实时掌握经营状态。",
    usecases: [
      "企业主每季度做经营复盘与绩效汇报",
      "CFO 向董事会呈现财务健康指标",
      "顾问为客户企业提供盈利能力诊断",
    ],
    steps: [
      { n: "01", title: "录入收入与成本", desc: "填写营收、销售成本、运营费用与税率结构" },
      { n: "02", title: "设定 KPI 目标", desc: "输入各项财务目标值，系统计算实际达成率" },
      { n: "03", title: "查看绩效报告", desc: "PAT / ROE / ROA 仪表盘 + 瀑布图完整呈现" },
    ],
    features: ["完整损益表分解", "PAT / ROE / ROA 计算", "KPI 目标进度条", "瀑布图可视化"],
  },
];

export default async function ToolsGuidePage() {
  const session = await auth();
  const user = session?.user;
  const role = user?.role as string | undefined;
  const grad = role ? isGraduate(role) : false;
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";
  const isClient = role === "ENTERPRISE_CLIENT";
  const studentLevel = grad || isAdmin ? 99 : (user?.studentLevel ?? 0);

  function getAccess(requiredLevel: number) {
    if (!user) return "guest";
    if (isAdmin || grad) return "unlocked";
    if (isClient) return "client";
    if (studentLevel >= requiredLevel) return "unlocked";
    return "locked";
  }

  const backHref = isAdmin
    ? "/admin"
    : grad || role === "ONLINE_STUDENT"
    ? "/student/tools"
    : isClient
    ? "/client/tools"
    : role === "FREE_MEMBER"
    ? "/member/dashboard"
    : "/tools";

  return (
    <div style={{ backgroundColor: "#F7F4EF", color: "#1C1814", minHeight: "100vh" }}>
      <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">

        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm mb-10" style={{ color: "#9A9490" }}>
          ← 返回
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
            工具全览与讲解
          </h1>
          <p style={{ color: "#68625C" }}>
            4 个专业资本工具的功能说明、使用流程与适用场景
          </p>

          {user && (
            <div
              className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}
            >
              <span style={{ color: "#9A9490" }}>当前权限：</span>
              {(isAdmin || grad) && <span style={{ color: "#8B6514" }}>全部工具已解锁</span>}
              {isClient && <span style={{ color: "#5A7BBF" }}>企业客户 · 顾问授权工具</span>}
              {!isAdmin && !grad && !isClient && (
                <>
                  <span style={{ color: "#1C1814" }}>
                    已解锁 {TOOLS.filter((t) => t.requiredLevel <= studentLevel).length} / {TOOLS.length} 个工具
                  </span>
                  {studentLevel < 3 && (
                    <Link
                      href="/student/learn"
                      className="ml-auto text-xs px-3 py-1 rounded-lg"
                      style={{ backgroundColor: "rgba(139,101,20,0.08)", color: "#8B6514", border: "1px solid rgba(139,101,20,0.15)" }}
                    >
                      升级解锁 →
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Tool sections */}
        <div className="space-y-6">
          {TOOLS.map((tool) => {
            const access = getAccess(tool.requiredLevel);
            const unlocked = access === "unlocked";
            const dimmed = access === "locked";

            return (
              <div
                key={tool.slug}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: `1px solid ${unlocked ? tool.accentBorder : "#E0D9CE"}`,
                  opacity: dimmed ? 0.55 : 1,
                }}
              >
                {unlocked && (
                  <div style={{ height: 2, background: `linear-gradient(90deg, ${tool.accent}00, ${tool.accent}, ${tool.accent}00)` }} />
                )}

                <div className="p-6 md:p-8">
                  {/* Tool header */}
                  <div className="mb-5">
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <h2 className="text-lg font-bold" style={{ color: unlocked ? "#1C1814" : "#9A9490" }}>
                        {tool.name}
                      </h2>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{
                          backgroundColor: unlocked ? tool.accentBg : "#F7F4EF",
                          color: unlocked ? tool.accent : "#C0B8B0",
                          border: `1px solid ${unlocked ? tool.accentBorder : "#E0D9CE"}`,
                        }}
                      >
                        {tool.requiredLevel === 1 ? "L1+" : tool.requiredLevel === 2 ? "L2+" : "L3+"}
                      </span>
                      {access === "locked" && (
                        <span className="text-xs" style={{ color: "#C0B8B0" }}>需完成更多课程解锁</span>
                      )}
                    </div>
                    <p className="text-sm font-medium" style={{ color: unlocked ? tool.accent : "#C0B8B0" }}>
                      {tool.tagline}
                    </p>
                  </div>

                  {/* About */}
                  <p className="text-sm leading-relaxed mb-8" style={{ color: unlocked ? "#68625C" : "#C0B8B0" }}>
                    {tool.about}
                  </p>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Steps */}
                    <div>
                      <h3 className="text-xs font-semibold tracking-widest mb-4" style={{ color: unlocked ? "#9A9490" : "#D0CBC4" }}>
                        使用流程
                      </h3>
                      <div className="space-y-4">
                        {tool.steps.map((step, i) => (
                          <div key={i} className="flex gap-3">
                            <span
                              className="text-xs font-mono font-bold flex-shrink-0 mt-0.5"
                              style={{ color: unlocked ? tool.accent : "#C0B8B0" }}
                            >
                              {step.n}
                            </span>
                            <div>
                              <div className="text-sm font-medium mb-0.5" style={{ color: unlocked ? "#1C1814" : "#C0B8B0" }}>
                                {step.title}
                              </div>
                              <div className="text-xs leading-relaxed" style={{ color: unlocked ? "#9A9490" : "#D0CBC4" }}>
                                {step.desc}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features + usecases */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xs font-semibold tracking-widest mb-3" style={{ color: unlocked ? "#9A9490" : "#D0CBC4" }}>
                          功能亮点
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {tool.features.map((f) => (
                            <div key={f} className="flex items-start gap-1.5 text-xs" style={{ color: unlocked ? "#68625C" : "#C0B8B0" }}>
                              <span className="flex-shrink-0 mt-0.5" style={{ color: unlocked ? tool.accent : "#C0B8B0" }}>✓</span>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold tracking-widest mb-3" style={{ color: unlocked ? "#9A9490" : "#D0CBC4" }}>
                          适合谁使用
                        </h3>
                        <div className="space-y-2">
                          {tool.usecases.map((u) => (
                            <div key={u} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: unlocked ? "#68625C" : "#C0B8B0" }}>
                              <span className="flex-shrink-0 mt-0.5" style={{ color: unlocked ? "#C0B8B0" : "#D0CBC4" }}>·</span>
                              {u}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8 pt-6" style={{ borderTop: "1px solid #EEE9E0" }}>
                    {unlocked ? (
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
                        style={{ backgroundColor: tool.accent, color: "#fff" }}
                      >
                        立即使用此工具 →
                      </Link>
                    ) : access === "guest" ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          href="/register"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
                        >
                          注册免费体验 →
                        </Link>
                        <span className="text-xs" style={{ color: "#9A9490" }}>
                          已有账号？<Link href="/login" style={{ color: "#68625C" }}>登录</Link>
                        </span>
                      </div>
                    ) : access === "client" ? (
                      <p className="text-sm" style={{ color: "#9A9490" }}>
                        此工具需顾问授权 — 请联系你的资本道顾问开通权限
                      </p>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
                          style={{ backgroundColor: "#F7F4EF", color: "#9A9490", border: "1px solid #E0D9CE" }}
                        >
                          需要 L{tool.requiredLevel} 解锁
                        </div>
                        <Link href="/student/learn" className="text-xs" style={{ color: "#8B6514" }}>
                          继续学习解锁 →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs mt-12" style={{ color: "#C0B8B0" }}>
          所有计算在浏览器本地完成 · 数据不上传服务器 · 支持导出 PDF / CSV
        </p>
      </div>
    </div>
  );
}
