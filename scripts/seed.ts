/**
 * 种子数据：创建各角色测试账号 + 默认工具
 * 用法: npx tsx scripts/seed.ts
 *
 * 所有测试账号密码均为: Test@1234
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const PASSWORD = "Test@1234";

const TEST_USERS = [
  { email: "admin@zibendao.com",        name: "管理员",         role: "ADMIN" },
  { email: "zibentong@zibendao.com",    name: "资本通毕业生",   role: "ZIBENTONG_GRAD" },
  { email: "qidong@zibendao.com",       name: "启动资本毕业生", role: "QIDONG_GRAD" },
  { email: "zibendao@zibendao.com",     name: "资本道毕业生",   role: "ZIBENDAO_GRAD" },
  { email: "student@zibendao.com",      name: "线上课程学生",   role: "ONLINE_STUDENT", studentLevel: 1 },
  { email: "client@zibendao.com",       name: "企业顾问客户",   role: "ENTERPRISE_CLIENT" },
  { email: "free@zibendao.com",         name: "免费用户",       role: "FREE_MEMBER" },
];

const DEFAULT_TOOLS = [
  { name: "金融路线图方程式", slug: "financial-roadmap", description: "复利增长与长期财富规划", requiredLevel: 1 },
  { name: "产品服务报价系统", slug: "pricing-system",    description: "动态报价单生成与PDF导出",  requiredLevel: 1 },
  { name: "市值/市盈率计算器",  slug: "market-cap",       description: "PE/PB/PS估值分析与行业对比", requiredLevel: 2 },
  { name: "PAT & KPI 计算器", slug: "pat-kpi",           description: "税后利润与关键指标追踪",   requiredLevel: 2 },
];

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prisma = new PrismaClient({ adapter } as any);

  const hashed = await bcrypt.hash(PASSWORD, 10);

  console.log("\n── 创建测试账号 ──");
  for (const u of TEST_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      await prisma.user.update({
        where: { email: u.email },
        data: { role: u.role as never, studentLevel: u.studentLevel ?? null, isActive: true, emailVerified: new Date() },
      });
      console.log(`  ↻ ${u.role.padEnd(20)} ${u.email} (已更新)`);
    } else {
      await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          hashedPassword: hashed,
          role: u.role as never,
          studentLevel: u.studentLevel ?? null,
          isActive: true,
          emailVerified: new Date(),
        },
      });
      console.log(`  ✓ ${u.role.padEnd(20)} ${u.email}`);
    }
  }

  console.log("\n── 初始化工具 ──");
  for (const tool of DEFAULT_TOOLS) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      create: tool,
      update: { name: tool.name, description: tool.description },
    });
    console.log(`  ✓ ${tool.name}`);
  }

  // 给企业客户授权所有工具
  const clientUser = await prisma.user.findUnique({ where: { email: "client@zibendao.com" } });
  const allTools = await prisma.tool.findMany();
  if (clientUser) {
    for (const tool of allTools) {
      await prisma.clientToolAccess.upsert({
        where: { userId_toolId: { userId: clientUser.id, toolId: tool.id } },
        create: { userId: clientUser.id, toolId: tool.id },
        update: {},
      });
    }
    console.log(`\n  ✓ 已为企业顾问客户授权全部 ${allTools.length} 个工具`);
  }

  console.log("\n── 初始化课程模块 ──");
  const MODULES = [
    {
      title: "财务基础",
      description: "认识财务报表、现金流与资产负债表，建立财务分析基础。",
      order: 1,
      requiredLevel: 1,
      isPublished: true,
      lessons: [
        { title: "什么是财务自由？", order: 1, points: 20, content: { text: "财务自由是指您的被动收入足以覆盖生活开销，无需依靠主动劳动维持生计。\n\n本节课将帮助您建立财务自由的概念框架，了解资产与负债的本质区别，以及为什么大多数人越努力工作却越难实现财务自由。\n\n核心概念：\n• 资产：把钱放进你口袋的东西\n• 负债：把钱从你口袋拿走的东西\n• 被动收入 vs 主动收入\n• 财务自由数字 = 月支出 × 300（25年法则）" } },
        { title: "读懂资产负债表", order: 2, points: 25, content: { text: "资产负债表（Balance Sheet）是一张企业在特定时间点的财务快照。\n\n它遵循一个基本方程式：\n资产 = 负债 + 所有者权益\n\n资产分类：\n• 流动资产：现金、应收账款、存货（12个月内可变现）\n• 非流动资产：固定资产、无形资产、长期投资\n\n负债分类：\n• 流动负债：应付账款、短期借款\n• 非流动负债：长期债务、递延税款\n\n所有者权益 = 股本 + 留存收益\n\n健康的资产负债表特征：流动比率 > 1.5，资产负债率 < 60%。" } },
        { title: "现金流才是王道", order: 3, points: 25, content: { text: "利润是观点，现金流是事实。\n\n一家公司可以在账面上盈利，却因现金流断裂而倒闭。理解现金流报表（Cash Flow Statement）是识别企业真实健康状况的关键。\n\n三类现金流：\n1. 经营活动现金流（最重要）\n   - 正值且持续增长 = 业务健康\n   - 应高于净利润（高质量利润）\n\n2. 投资活动现金流\n   - 通常为负（扩张期企业在投资未来）\n   - 持续正值可能意味着在变卖资产\n\n3. 融资活动现金流\n   - 反映企业的融资与还债行为\n\n自由现金流（FCF）= 经营现金流 - 资本支出\n这是巴菲特最看重的指标之一。" } },
        { title: "利润表深度解析", order: 4, points: 25, content: { text: "利润表（Income Statement / P&L）展示企业在一段时间内的经营成果。\n\n利润表结构：\n收入（Revenue）\n- 销售成本（COGS）\n= 毛利润（Gross Profit）\n- 运营费用（Operating Expenses）\n= 息税前利润（EBIT）\n- 利息费用\n- 税款\n= 净利润（Net Income）\n\n关键利润率指标：\n• 毛利率 = 毛利润 / 收入\n• EBITDA利润率（反映核心盈利能力）\n• 净利率 = 净利润 / 收入\n\n行业参考：科技公司毛利率通常 > 60%，零售业通常 20-30%。" } },
        { title: "财务比率实战", order: 5, points: 30, content: { text: "财务比率是比较不同规模企业的标准化工具。\n\n四大类财务比率：\n\n1. 盈利能力比率\n   • ROE（净资产收益率）= 净利润 / 股东权益 → 巴菲特要求 > 15%\n   • ROA（总资产收益率）= 净利润 / 总资产\n   • ROIC（投入资本回报率）\n\n2. 流动性比率\n   • 流动比率 = 流动资产 / 流动负债 → 理想值 > 2\n   • 速动比率 = （流动资产 - 存货）/ 流动负债\n\n3. 杠杆比率\n   • 资产负债率 = 总负债 / 总资产\n   • 利息保障倍数 = EBIT / 利息费用 → 要求 > 3\n\n4. 估值比率\n   • PE（市盈率）、PB（市净率）、PS（市销率）\n   • EV/EBITDA（企业价值倍数）" } },
      ],
    },
    {
      title: "投资入门",
      description: "股票、债券与基金的基本原理，构建第一个投资组合。",
      order: 2,
      requiredLevel: 1,
      isPublished: true,
      lessons: [
        { title: "股票市场运作原理", order: 1, points: 25, content: { text: "股票代表对一家公司的所有权份额。当你买入一股苹果公司，你就成为苹果公司的股东之一。\n\n股票市场的运作逻辑：\n• 一级市场：公司IPO，首次向公众发行股票融资\n• 二级市场：投资者之间互相买卖已发行的股票\n\n股票价格由什么决定？\n短期：供需关系、市场情绪、新闻事件\n长期：公司盈利能力、成长前景、行业地位\n\n格雷厄姆的格言：\n\"短期来看，股市是投票机；长期来看，股市是称重机。\"\n\n投资者类型：\n• 价值投资者：寻找被低估的优质企业\n• 成长投资者：押注高增长潜力公司\n• 指数投资者：跟踪整体市场（被动投资）" } },
        { title: "债券与固定收益", order: 2, points: 20, content: { text: "债券是一种借贷关系：你借钱给政府或企业，他们承诺定期支付利息（息票），并在到期日归还本金。\n\n债券的核心要素：\n• 面值（Par Value）：通常1000美元/1000令吉\n• 票面利率（Coupon Rate）：年化利息率\n• 到期日（Maturity）：1年、5年、30年...\n• 信用评级：AAA > AA > A > BBB（投资级）> BB以下（高收益/垃圾债）\n\n债券价格与利率的反向关系：\n利率上升 → 债券价格下跌\n利率下降 → 债券价格上涨\n（这是最重要的债券规律）\n\n马来西亚投资者常用债券工具：\n• 马来西亚政府证券（MGS）\n• 大马储蓄债券（BSN Premium Savings Bonds）\n• 伊斯兰债券（Sukuk）" } },
        { title: "构建你的第一个投资组合", order: 3, points: 35, content: { text: "投资组合构建的核心：分散风险，不要把鸡蛋放在同一个篮子里。\n\n资产配置框架（按年龄）：\n股票比例 ≈ 110 - 你的年龄\n例：30岁 → 80%股票，20%债券/现金\n\n简单的三基金组合（Three-Fund Portfolio）：\n1. 本国股票指数基金（30%）\n2. 国际股票指数基金（50%）\n3. 债券指数基金（20%）\n\n马来西亚投资者的工具箱：\n• 公积金（EPF）：强制储蓄，年均回报约5-6%\n• 单位信托基金（Unit Trust）：适合初学者\n• 交易所交易基金（ETF）：低费率，透明度高\n• 直接股票投资：需要更多研究能力\n\n投资铁律：\n✓ 长期持有，复利的时间魔法\n✓ 定期定额（DCA），平滑市场波动\n✗ 不要试图择时入市（Time the Market）" } },
      ],
    },
    {
      title: "高级资本运作",
      description: "企业估值、并购逻辑与资本结构优化策略。",
      order: 3,
      requiredLevel: 2,
      isPublished: true,
      lessons: [
        { title: "DCF估值模型精讲", order: 1, points: 40, content: { text: "现金流折现法（DCF，Discounted Cash Flow）是最严谨的企业内在价值评估方法。\n\n核心公式：\n内在价值 = Σ [FCFt / (1+r)^t] + 终值 / (1+r)^n\n\n其中：\n• FCFt = 第t年的自由现金流\n• r = 折现率（通常用WACC）\n• 终值 = FCFn × (1+g) / (r-g)\n• g = 永续增长率（通常取2-3%，不超过GDP增速）\n\nWACC（加权平均资本成本）：\nWACC = (E/V) × Re + (D/V) × Rd × (1-T)\n\nDCF的局限性：\n• \"垃圾进，垃圾出\" — 对假设极为敏感\n• 增长率变化1%可能导致估值偏差30%以上\n• 不适合初创企业或负现金流企业\n\n实践建议：建立三种情景（悲观/基准/乐观），对折现率和增长率进行敏感性分析。" } },
        { title: "并购逻辑与协同效应", order: 2, points: 40, content: { text: "并购（M&A，Mergers & Acquisitions）是企业快速扩张的重要手段。\n\n并购的战略动因：\n1. 横向并购：收购同行竞争对手，扩大市场份额\n2. 纵向并购：收购上下游企业，掌控供应链\n3. 混合并购：多元化布局，进入新业务领域\n4. 收购技术/人才：\"acqui-hire\"策略\n\n协同效应的量化：\n• 收入协同：交叉销售、新市场准入\n• 成本协同：规模经济、裁员、系统整合\n• 财务协同：税盾效应、融资成本降低\n\n并购溢价：\n通常为目标公司股价的20-40%溢价\n协同效应现值 > 并购溢价 → 并购创造价值\n\n并购失败的常见原因：\n• 文化整合失败（最常见）\n• 支付过高溢价\n• 尽职调查不足\n• 整合执行力不足\n\n著名失败案例：美国在线收购时代华纳（损失约990亿美元）" } },
        { title: "资本结构与股利政策", order: 3, points: 35, content: { text: "资本结构决策：用多少债务，多少股权来融资？\n\nMM定理（Modigliani-Miller Theorem）：\n• 无税情况下，资本结构不影响企业价值\n• 有企业所得税时，债务产生税盾，增加企业价值\n\n最优资本结构的权衡：\n债务的好处：\n✓ 利息抵税（税盾效应）\n✓ 财务杠杆放大ROE\n✓ 债权人纪律约束管理层\n\n债务的风险：\n✗ 财务困境成本\n✗ 代理成本\n✗ 经济下行时的流动性危机\n\n股利政策三种选择：\n1. 高股利派发（成熟稳定企业，如公用事业）\n2. 低股利/留存再投资（高成长企业，如科技公司）\n3. 股票回购（税务效率更高，灵活性更强）\n\n股票回购 vs 现金股利：\n回购减少流通股数量，提升每股盈利（EPS），税务上通常对投资者更有利。" } },
      ],
    },
    {
      title: "资本咨询精要",
      description: "客户财务诊断方法论与专业咨询报告撰写技巧。",
      order: 4,
      requiredLevel: 3,
      isPublished: true,
      lessons: [
        { title: "财务诊断方法论", order: 1, points: 50, content: { text: "专业的财务诊断是咨询工作的起点。本节介绍资本道顾问的标准诊断框架。\n\n五步财务诊断流程：\n\n第一步：现状评估\n• 收集过去3年财务报表\n• 计算核心财务比率\n• 识别异常趋势和危险信号\n\n第二步：行业基准比较\n• 与同行业头部企业对比\n• 识别相对优势和劣势领域\n\n第三步：现金流分析\n• 经营现金流质量评估\n• 营运资本管理效率\n• 资本支出合理性分析\n\n第四步：债务与风险评估\n• 债务结构与到期安排\n• 利率敏感性分析\n• 压力测试（极端情景下能否生存）\n\n第五步：机会识别\n• 成本优化空间\n• 收入增长机会\n• 融资结构优化\n• 资产处置建议\n\n诊断工具：资本道专属财务健康评分卡（100分制）" } },
        { title: "咨询报告撰写与交付", order: 2, points: 50, content: { text: "专业咨询报告是建立客户信任、体现顾问价值的核心交付物。\n\n报告结构（执行摘要法）：\n\n1. 执行摘要（1页）\n   - 关键发现（3-5条）\n   - 核心建议\n   - 预期影响\n\n2. 客户现状分析\n   - 业务概述\n   - 财务表现总结\n   - SWOT分析\n\n3. 问题诊断\n   - 具体问题识别（数据支撑）\n   - 根本原因分析\n   - 风险评估\n\n4. 战略建议\n   - 短期行动（0-3个月）\n   - 中期规划（3-12个月）\n   - 长期战略（1-3年）\n\n5. 实施路线图\n   - 里程碑与时间节点\n   - 所需资源\n   - KPI追踪指标\n\n6. 附录\n   - 详细财务分析数据\n   - 假设与方法说明\n\n交付最佳实践：\n• 先口头汇报，再提交书面报告\n• 用故事逻辑串联数据，避免数据堆砌\n• 建议要具体可执行，避免泛泛而谈" } },
      ],
    },
  ];

  for (const mod of MODULES) {
    const { lessons, ...moduleData } = mod;
    const existing = await prisma.module.findFirst({ where: { order: moduleData.order } });
    let moduleId: string;
    if (existing) {
      await prisma.module.update({ where: { id: existing.id }, data: moduleData });
      moduleId = existing.id;
      console.log(`  ↻ 模块 ${moduleData.order}: ${moduleData.title} (已更新)`);
    } else {
      const created = await prisma.module.create({ data: moduleData });
      moduleId = created.id;
      console.log(`  ✓ 模块 ${moduleData.order}: ${moduleData.title}`);
    }
    for (const lesson of lessons) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { moduleId, order: lesson.order },
      });
      if (existingLesson) {
        await prisma.lesson.update({ where: { id: existingLesson.id }, data: { ...lesson, type: "READING" as const } });
      } else {
        await prisma.lesson.create({ data: { ...lesson, moduleId, type: "READING" as const } });
      }
    }
    console.log(`    └─ ${lessons.length} 课节已同步`);
  }

  console.log("\n── 完成 ──");
  console.log("所有测试账号密码：", PASSWORD);
  console.log("\n账号列表：");
  console.log("  超级管理员     admin@capitalmastery.net  (密码: Admin@1234)");
  for (const u of TEST_USERS) {
    console.log(`  ${u.role.padEnd(20)} ${u.email}  (密码: ${PASSWORD})`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
