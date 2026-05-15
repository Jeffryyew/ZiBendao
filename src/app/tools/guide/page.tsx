import Link from "next/link";
import { auth } from "@/lib/auth";
import { CAPITAL_MODULES, LAYER_META, getModulesByLayer } from "@/lib/capitalModules";
import type { LayerId } from "@/lib/capitalModules";

const LAYER_DISPLAY: Record<LayerId, { zh: string; en: string }> = {
  1: { zh: "资本基础", en: "Capital Foundations" },
  2: { zh: "资本智慧", en: "Capital Intelligence" },
  3: { zh: "资本架构", en: "Capital Structure" },
};

const TOOL_USECASES: Record<string, string[]> = {
  "financial-roadmap": ["正在规划 5–10 年财务目标的个人", "为客户制作财富增长方案的顾问", "需向投资人展示回报预测的创业者"],
  "pricing-system": ["顾问和服务商向客户提交正式报价", "产品团队快速计算多方案报价对比", "企业销售制作含税报价备案文件"],
  "market-cap": ["投资者筛选优质标的、判断买卖时机", "企业主了解自身估值水平以备融资谈判", "顾问为客户出具独立估值分析报告"],
  "pat-kpi": ["企业主每季度做经营复盘与绩效汇报", "CFO 向董事会呈现财务健康指标", "顾问为客户企业提供盈利能力诊断"],
  "cash-flow": ["初创企业预测未来 12 个月资金状况", "财务负责人识别季节性资金缺口", "投资人评估被投企业现金流健康度"],
  "balance-sheet": ["企业主了解资产与负债结构", "会计师快速生成标准资产负债报表", "投资人分析目标企业财务健康状况"],
  "income-statement": ["管理层追踪毛利率与净利率变化", "财务团队制作月度损益报告", "顾问分析客户企业盈利能力结构"],
  "breakeven-analysis": ["创业者计算需要多少销量才能回本", "产品经理评估新品线的保本定价策略", "投资人核实业务模型是否具备盈利基础"],
  "due-diligence": ["投资人对潜在项目做投前尽调", "并购顾问系统评估目标公司各维度风险", "创业者自查以准备迎接外部投资人审查"],
  "data-room": ["创业者准备融资前的文件包", "顾问为客户整理结构化投资人资料", "并购项目中买卖双方的文件交换"],
  "sales-forecast": ["销售负责人制定下一年度收入目标", "创业者为 BP 准备财务预测数据", "管理层追踪实际销售与预测的差异"],
  "startup-expense": ["创业者估算启动所需资金总额", "天使投资人审查创业项目的成本结构", "创始团队计算当前资金的可用跑道"],
  "deal-flow": ["VC/PE 机构管理多个在谈项目", "独立投资人追踪投资机会进展", "投资顾问为客户管理投资漏斗"],
  "capital-roadmap": ["准备融资的创业者规划轮次路径", "顾问为客户设计从天使到 IPO 的资本策略", "投资人了解被投企业的资本规划"],
  "fundraising-system": ["创业者计算融资条款与稀释比例", "顾问追踪多个投资人的沟通进展", "融资负责人管理投资人管道"],
  "investor-relations": ["已融资企业定期向投资人发送月报", "创始人建立并维护投资人名册", "顾问帮助客户管理投后关系"],
  "spv-structure": ["设立专项投资工具汇集多个投资人", "顾问为客户设计 SPV 架构并计算回报", "投资人评估通过 SPV 参投的条款结构"],
  "equity-structure": ["创始团队规划股权分配与期权池", "投资人分析多轮融资后的稀释结构", "顾问设计退出瀑布与清算优先权"],
  "capital-structure": ["CFO 优化债务与股权的资本组合", "分析师计算 WACC 以评估投资项目", "顾问为企业设计最优融资结构"],
  "investment-committee": ["VC/PE 机构准备 IC 会议备忘录", "投委会成员评分并记录投资决策", "顾问为客户建立规范化投资治理流程"],
  "risk-control": ["企业管理层建立全面风险登记册", "合规负责人识别并量化关键业务风险", "顾问为客户制作风险热力图报告"],
  "portfolio-management": ["基金经理追踪多个被投企业表现", "投资人计算各项目的 MOIC 与 IRR", "顾问为客户提供投资组合健康度分析"],
};

const layers = [1, 2, 3] as const;

export default async function ToolsGuidePage() {
  const session = await auth();
  const user = session?.user;
  const role = user?.role as string | undefined;

  const backHref =
    role === "SUPER_ADMIN" || role === "ADMIN"
      ? "/admin"
      : role === "ENTERPRISE_CLIENT"
      ? "/client/dashboard"
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
            工具全览与使用指南
          </h1>
          <p style={{ color: "#68625C" }}>
            {CAPITAL_MODULES.length} 个专业资本工具的功能说明与适用场景
          </p>
        </div>

        {/* Tool sections by layer */}
        <div className="space-y-14">
          {layers.map((layer) => {
            const meta = LAYER_META[layer];
            const modules = getModulesByLayer(layer);
            const display = LAYER_DISPLAY[layer];

            return (
              <div key={layer}>
                {/* Layer header */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
                    {display.zh}
                  </h2>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                  <span className="text-xs font-mono flex-shrink-0" style={{ color: "#9A9490" }}>
                    {modules.length} 个工具
                  </span>
                </div>

                <div className="space-y-4">
                  {modules.map((mod) => {
                    const usecases = TOOL_USECASES[mod.id] ?? [];
                    return (
                      <div
                        key={mod.id}
                        className="rounded-2xl overflow-hidden"
                        style={{ backgroundColor: "#FFFFFF", border: `1px solid #E0D9CE` }}
                      >
                        <div style={{ height: 2, background: `linear-gradient(90deg, ${meta.color}00, ${meta.color}, ${meta.color}00)` }} />
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                            <div>
                              <h3 className="text-base font-bold mb-1" style={{ color: "#1C1814" }}>
                                {mod.zh.name}
                              </h3>
                              <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
                                {mod.zh.desc}
                              </p>
                            </div>
                            <Link
                              href={mod.href}
                              className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-85"
                              style={{ backgroundColor: meta.color + "15", color: meta.color, border: `1px solid ${meta.color}30` }}
                            >
                              使用工具 →
                            </Link>
                          </div>

                          {usecases.length > 0 && (
                            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #F0EBE1" }}>
                              <p className="text-xs font-semibold mb-2" style={{ color: "#9A9490" }}>适合谁使用</p>
                              <div className="space-y-1">
                                {usecases.map((u) => (
                                  <div key={u} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "#68625C" }}>
                                    <span className="flex-shrink-0 mt-0.5" style={{ color: "#C0B8B0" }}>·</span>
                                    {u}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
