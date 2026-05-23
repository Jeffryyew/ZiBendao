// 《资本启航》— AI沉浸式100关课程系统 · 13章 · 5阶段

export type LessonType = "STORY" | "QUIZ" | "SIMULATION" | "REFLECTION";

export interface QuizOption { id: string; text: string; correct: boolean; explanation?: string; }
export interface QuizQuestion { id: string; question: string; options: QuizOption[]; }
export interface StorySlide { id: string; text: string; visual?: string; highlight?: string; }
export interface SimulationConfig { type: "pricing" | "valuation" | "equity"; description: string; }

export interface Lesson {
  id: string; slug: string; title: string; subtitle?: string;
  type: LessonType; xpReward: number; durationMin: number;
  character?: { name: string; role: string; avatar: string; era?: string; };
  scene?: { bg: string; accent: string; icon: string; name: string; };
  slides?: StorySlide[];
  questions?: QuizQuestion[];
  simulation?: SimulationConfig;
  reflectionPrompt?: string; keyInsight?: string;
}

export interface Module {
  id: string; slug: string; order: number; title: string; subtitle: string;
  description: string; xpReward: number; levelColor: string; levelLabel: string;
  icon: string; lessons: Lesson[];
}

export interface Phase {
  id: number; title: string; subtitle: string; color: string; chapterOrders: number[];
}

export const LEVEL_COLORS = ["#EF4444","#F97316","#EAB308","#22C55E","#3B82F6","#6366F1","#A855F7"];
export const LEVEL_LABELS = ["LV1 启程","LV2 探索","LV3 构建","LV4 成长","LV5 资本化","LV6 策略化","LV7 升维"];
export const XP_PER_LEVEL = [0, 200, 450, 800, 1250, 1800, 2500];
export function getUserLevel(xp: number): number {
  let level = 1;
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) { level = i + 1; break; }
  }
  return Math.min(level, 7);
}
export function xpForNextLevel(currentLevel: number): number {
  return XP_PER_LEVEL[Math.min(currentLevel, 6)] || 2500;
}

export const phases: Phase[] = [
  { id:1, title:"资本认知", subtitle:"从零开始理解资本的本质", color:"from-blue-600 to-blue-400", chapterOrders:[1,2,3] },
  { id:2, title:"资本工具", subtitle:"掌握融资与报价核心工具", color:"from-purple-600 to-purple-400", chapterOrders:[4,5] },
  { id:3, title:"产业案例", subtitle:"从真实企业学习资本运作", color:"from-orange-600 to-orange-400", chapterOrders:[6,7,8] },
  { id:4, title:"估值系统", subtitle:"学会给企业和项目定价", color:"from-green-600 to-green-400", chapterOrders:[9,10,11,12] },
  { id:5, title:"资本成长", subtitle:"综合实战，成为资本家", color:"from-yellow-600 to-yellow-400", chapterOrders:[13] },
];

export const CAPITAL_LAUNCH_MODULES: Module[] = [
  // ── CH1 ───────────────────────────────────────────────────────────────
  {
    id:"ch1", slug:"ch1", order:1,
    title:"什么是资本运作", subtitle:"打开资本世界的大门",
    description:"跟随古老导师，从零开始理解资本的本质、形态与运作逻辑。",
    xpReward:0, levelColor:"#3B82F6", levelLabel:"LV1 启程", icon:"🏛️",
    lessons:[
    {
      id:"ch1-l1", slug:"ch1-l1", title:"资本的第一印象",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"古老导师", role:"智慧引路人", avatar:"🧙‍♂️" },
      scene:{ bg:"linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)", accent:"#3B82F6", icon:"🏛️", name:"古老图书馆" },
      slides:[
        { id:"s1", text:"资本不是钱，而是让钱持续增值的能力与机制。当你拥有资本，钱会为你工作。", visual:"🌟", highlight:"资本≠钱" },
        { id:"s2", text:"买一台设备来生产商品，设备就是资本；投资一家公司的股权，资金变成资本。", visual:"⚙️", highlight:"资本是生产性资产" },
        { id:"s3", text:"资本思维第一步：看穿表面数字，理解背后的增值逻辑，找到钱生钱的系统。", visual:"💡", highlight:"看透本质" }
      ],
    },
    {
      id:"ch1-l2", slug:"ch1-l2", title:"钱与资本的区别",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"古老导师", role:"智慧引路人", avatar:"🧙‍♂️" },
      scene:{ bg:"linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)", accent:"#3B82F6", icon:"🏛️", name:"古老图书馆" },
      slides:[
        { id:"s1", text:"钱放在枕头下，只是钱。钱用于购买资产、开拓市场、雇用人才，才成为资本。", visual:"💰", highlight:"钱→资本需要运作" },
        { id:"s2", text:"普通人：赚钱→花钱。资本家：赚钱→投资→再赚更多钱。两种思维，两种命运。", visual:"🔄", highlight:"思维模式决定财富" },
        { id:"s3", text:"今天的消费是明天的负债；今天的投资是明天的资产。选择权在你手中。", visual:"⚖️", highlight:"消费vs投资" }
      ],
    },
    {
      id:"ch1-l3", slug:"ch1-l3", title:"资本的三种形态",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"古老导师", role:"智慧引路人", avatar:"🧙‍♂️" },
      scene:{ bg:"linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)", accent:"#3B82F6", icon:"🏛️", name:"古老图书馆" },
      slides:[
        { id:"s1", text:"实物资本：机器、厂房、土地。金融资本：股票、债券、现金。人力资本：技能、知识。", visual:"🏭", highlight:"三种资本形态" },
        { id:"s2", text:"苹果公司最大的资本不是工厂，而是品牌、专利、软件生态——无形资本远超实物。", visual:"🍎", highlight:"无形资本的力量" },
        { id:"s3", text:"最被低估的资本，是每个人身上还未被开发的人力资本。你自己就是最大的资产。", visual:"🧠", highlight:"人力资本最重要" }
      ],
    },
    {
      id:"ch1-l4", slug:"ch1-l4", title:"资本运作的本质",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"古老导师", role:"智慧引路人", avatar:"🧙‍♂️" },
      scene:{ bg:"linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)", accent:"#3B82F6", icon:"🏛️", name:"古老图书馆" },
      slides:[
        { id:"s1", text:"资本运作核心公式：用最小的自有资金，撬动最大的外部资源，创造超额价值。", visual:"🎯", highlight:"杠杆是核心" },
        { id:"s2", text:"巴菲特用保险公司的浮存金（别人的钱）投资，这是教科书级别的资本运作案例。", visual:"🐂", highlight:"巴菲特的秘密" },
        { id:"s3", text:"资本运作三要素：找好资产、找便宜资金、找合适时机。三点缺一不可。", visual:"🔺", highlight:"资本运作三要素" }
      ],
    },
    {
      id:"ch1-l5", slug:"ch1-l5", title:"第一章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"资本与钱最本质的区别是什么？", options:[
          { id:"A", text:"资本比钱价值更高", correct:false, explanation:"价值高低不是本质区别" },
          { id:"B", text:"资本能持续产生收益", correct:true, explanation:"资本的本质是持续增值能力" },
          { id:"C", text:"资本只能是实物资产", correct:false, explanation:"资本有多种形态" },
          { id:"D", text:"资本必须存在银行", correct:false, explanation:"资本不限于存款" }
        ]},
        { id:"q2", question:"以下哪种行为属于资本运作？", options:[
          { id:"A", text:"把钱存在家里", correct:false, explanation:"闲置资金不是资本运作" },
          { id:"B", text:"用工资买奢侈品", correct:false, explanation:"消费不是资本运作" },
          { id:"C", text:"购买能产生收益的股权", correct:true, explanation:"股权投资是典型资本运作" },
          { id:"D", text:"提前消费信用卡", correct:false, explanation:"负债消费相反" }
        ]},
        { id:"q3", question:"苹果公司最大的资本来源是什么？", options:[
          { id:"A", text:"工厂设备", correct:false, explanation:"苹果代工生产，工厂不是核心" },
          { id:"B", text:"iPhone库存", correct:false, explanation:"库存是流动资产" },
          { id:"C", text:"品牌与专利等无形资产", correct:true, explanation:"苹果核心价值在无形资本" },
          { id:"D", text:"苹果门店装修", correct:false, explanation:"门店是渠道资产" }
        ]}
      ],
    },
    ],
  },
  // ── CH2 ───────────────────────────────────────────────────────────────
  {
    id:"ch2", slug:"ch2", order:2,
    title:"资本的由来", subtitle:"300年前的金融革命",
    description:"穿越时空，见证荷兰东印度公司如何开创现代资本市场。",
    xpReward:0, levelColor:"#6366F1", levelLabel:"LV1 启程", icon:"⚓",
    lessons:[
    {
      id:"ch2-l1", slug:"ch2-l1", title:"第一家股份公司的诞生",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Jacob商人", role:"荷兰东印度公司创始人", avatar:"🎩" },
      scene:{ bg:"linear-gradient(135deg,#0a0520 0%,#1a0a3e 100%)", accent:"#6366F1", icon:"⚓", name:"阿姆斯特丹港口" },
      slides:[
        { id:"s1", text:"1602年，荷兰东印度公司（VOC）成立，成为人类历史上第一家向公众发行股票的公司。", visual:"🏴‍☠️", highlight:"1602年的革命" },
        { id:"s2", text:"荷兰人将航海贸易的巨额风险分散给数千名投资者，每人只承担自己投入的部分。", visual:"⚓", highlight:"风险分散的天才" },
        { id:"s3", text:"这一发明改变了世界：任何普通市民都可以成为跨洲贸易的股东，资本民主化开始了。", visual:"🌍", highlight:"资本民主化" }
      ],
    },
    {
      id:"ch2-l2", slug:"ch2-l2", title:"荷兰东印度公司的秘密",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Jacob商人", role:"荷兰东印度公司创始人", avatar:"🎩" },
      scene:{ bg:"linear-gradient(135deg,#0a0520 0%,#1a0a3e 100%)", accent:"#6366F1", icon:"⚓", name:"阿姆斯特丹港口" },
      slides:[
        { id:"s1", text:"VOC巅峰时期市值相当于今天的7.9万亿美元，是史上最具价值的公司，至今无人超越。", visual:"💎", highlight:"史上最值钱公司" },
        { id:"s2", text:"VOC拥有私人军队和外交权，可对外宣战、签约、铸造货币——资本与国家权力融为一体。", visual:"⚔️", highlight:"资本即权力" },
        { id:"s3", text:"垄断香料贸易路线+控制货源+品牌溢价，VOC把稀缺变成了永久财富机器。", visual:"🌶️", highlight:"垄断创造财富" }
      ],
    },
    {
      id:"ch2-l3", slug:"ch2-l3", title:"股票交易所的出现",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Jacob商人", role:"荷兰东印度公司创始人", avatar:"🎩" },
      scene:{ bg:"linear-gradient(135deg,#0a0520 0%,#1a0a3e 100%)", accent:"#6366F1", icon:"⚓", name:"阿姆斯特丹港口" },
      slides:[
        { id:"s1", text:"1609年，世界第一个股票交易所在阿姆斯特丹开业，人们可以自由买卖公司股份。", visual:"🏛️", highlight:"交易所诞生" },
        { id:"s2", text:"流动性改变了一切：投资者随时可退出，企业获得稳定长期资金，双赢格局形成。", visual:"💧", highlight:"流动性=双赢" },
        { id:"s3", text:"交易所的本质：把未来不确定的企业价值，转化为今天可以实时定价的数字。", visual:"📊", highlight:"定价未来" }
      ],
    },
    {
      id:"ch2-l4", slug:"ch2-l4", title:"资本主义的崛起",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Jacob商人", role:"荷兰东印度公司创始人", avatar:"🎩" },
      scene:{ bg:"linear-gradient(135deg,#0a0520 0%,#1a0a3e 100%)", accent:"#6366F1", icon:"⚓", name:"阿姆斯特丹港口" },
      slides:[
        { id:"s1", text:"18-19世纪工业革命所需的铁路、蒸汽机、工厂，大多通过发行股票和债券来融资建设。", visual:"🚂", highlight:"资本驱动工业" },
        { id:"s2", text:"资本主义核心：私人拥有生产资料+市场竞争机制+利润最大化目标，三者缺一不可。", visual:"⚙️", highlight:"资本主义三要素" },
        { id:"s3", text:"有限责任公司是资本主义最伟大的发明：投资者最多亏光投入，不会因公司债务倾家荡产。", visual:"🛡️", highlight:"有限责任保护投资者" }
      ],
    },
    {
      id:"ch2-l5", slug:"ch2-l5", title:"现代资本市场的形成",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Jacob商人", role:"荷兰东印度公司创始人", avatar:"🎩" },
      scene:{ bg:"linear-gradient(135deg,#0a0520 0%,#1a0a3e 100%)", accent:"#6366F1", icon:"⚓", name:"阿姆斯特丹港口" },
      slides:[
        { id:"s1", text:"20世纪后，纽约证交所成为全球资本中心，美元借布雷顿森林体系成为世界储备货币。", visual:"🇺🇸", highlight:"美元霸权" },
        { id:"s2", text:"今天全球每日超过5万亿美元在金融市场流转，资本的速度比历史任何时候都快。", visual:"⚡", highlight:"5万亿/天" },
        { id:"s3", text:"现代资本市场三大功能：资源配置（把钱送到最需要的地方）、风险分散、价格发现。", visual:"🎯", highlight:"三大核心功能" }
      ],
    },
    {
      id:"ch2-l6", slug:"ch2-l6", title:"中国资本市场简史",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Jacob商人", role:"荷兰东印度公司创始人", avatar:"🎩" },
      scene:{ bg:"linear-gradient(135deg,#0a0520 0%,#1a0a3e 100%)", accent:"#6366F1", icon:"⚓", name:"阿姆斯特丹港口" },
      slides:[
        { id:"s1", text:"1990年，上海和深圳证券交易所相继成立，中国现代资本市场的历史由此开始。", visual:"🇨🇳", highlight:"1990年起步" },
        { id:"s2", text:"从几百亿到超过90万亿人民币市值，中国股市30年成长了数百倍，见证经济腾飞。", visual:"📈", highlight:"30年百倍成长" },
        { id:"s3", text:"未来：注册制改革、互联互通、人民币国际化——中国资本市场正走向全球舞台中心。", visual:"🌏", highlight:"走向世界" }
      ],
    },
    {
      id:"ch2-l7", slug:"ch2-l7", title:"第二章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"世界第一家向公众发行股票的公司是？", options:[
          { id:"A", text:"英国东印度公司", correct:false, explanation:"英国东印度公司晚于荷兰成立" },
          { id:"B", text:"荷兰东印度公司", correct:true, explanation:"1602年VOC是第一家上市公司" },
          { id:"C", text:"法国密西西比公司", correct:false, explanation:"密西西比公司成立更晚" },
          { id:"D", text:"威尼斯银行", correct:false, explanation:"威尼斯银行不是股份公司" }
        ]},
        { id:"q2", question:"股票市场最核心的功能是什么？", options:[
          { id:"A", text:"保证投资者不亏损", correct:false, explanation:"市场不保证盈利" },
          { id:"B", text:"由政府控制价格", correct:false, explanation:"市场价格由供需决定" },
          { id:"C", text:"提供流动性并配置资源", correct:true, explanation:"流动性和资源配置是核心" },
          { id:"D", text:"消除投资风险", correct:false, explanation:"市场分散而非消除风险" }
        ]},
        { id:"q3", question:"中国A股市场正式成立于哪一年？", options:[
          { id:"A", text:"1985年", correct:false, explanation:"1985年尚无正式股市" },
          { id:"B", text:"1990年", correct:true, explanation:"上交所和深交所1990年成立" },
          { id:"C", text:"1992年", correct:false, explanation:"1992年是邓小平南巡年份" },
          { id:"D", text:"2000年", correct:false, explanation:"2000年股市已运行10年" }
        ]}
      ],
    },
    ],
  },
  // ── CH3 ───────────────────────────────────────────────────────────────
  {
    id:"ch3", slug:"ch3", order:3,
    title:"资本底层逻辑", subtitle:"掌握资本运转的基本规律",
    description:"理解时间价值、复利、风险回报、流动性与杠杆的底层逻辑。",
    xpReward:0, levelColor:"#8B5CF6", levelLabel:"LV2 探索", icon:"⚙️",
    lessons:[
    {
      id:"ch3-l1", slug:"ch3-l1", title:"时间的价值",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"现代导师", role:"资本底层思维导师", avatar:"💼" },
      scene:{ bg:"linear-gradient(135deg,#12002a 0%,#2c0a5e 100%)", accent:"#8B5CF6", icon:"⚙️", name:"现代会议室" },
      slides:[
        { id:"s1", text:"今天的100元比明天的100元更有价值，因为今天的钱可以投资并产生收益。", visual:"⏰", highlight:"时间价值原理" },
        { id:"s2", text:"年利率10%，今天的100元一年后变110元，10年后变259元——时间是财富的乘法器。", visual:"📈", highlight:"复利的起点" },
        { id:"s3", text:"每一个拖延的投资决策，都是在主动放弃时间价值。越早行动，复利越大。", visual:"🚀", highlight:"行动就是财富" }
      ],
    },
    {
      id:"ch3-l2", slug:"ch3-l2", title:"复利的魔法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"现代导师", role:"资本底层思维导师", avatar:"💼" },
      scene:{ bg:"linear-gradient(135deg,#12002a 0%,#2c0a5e 100%)", accent:"#8B5CF6", icon:"⚙️", name:"现代会议室" },
      slides:[
        { id:"s1", text:"爱因斯坦称复利为世界第八大奇迹。本金产生利息，利息再产生利息，财富指数级增长。", visual:"✨", highlight:"第八大奇迹" },
        { id:"s2", text:"1万元以10%年化收益投资：10年1.6万，20年6.7万，30年17.4万，40年45万——时间越长越惊人。", visual:"💰", highlight:"数字说话" },
        { id:"s3", text:"复利三要素：本金、收益率、时间。提高任何一个，结果都会显著改变。", visual:"🔺", highlight:"复利三要素" }
      ],
    },
    {
      id:"ch3-l3", slug:"ch3-l3", title:"风险与回报",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"现代导师", role:"资本底层思维导师", avatar:"💼" },
      scene:{ bg:"linear-gradient(135deg,#12002a 0%,#2c0a5e 100%)", accent:"#8B5CF6", icon:"⚙️", name:"现代会议室" },
      slides:[
        { id:"s1", text:"风险和回报永远正相关：想要更高收益，必须承担更高风险。天下没有无风险的高收益。", visual:"⚖️", highlight:"风险收益正相关" },
        { id:"s2", text:"国债年收益约3%（低风险），优质股票历史年化约8-12%（中风险），创业可能10倍（高风险）。", visual:"📊", highlight:"不同资产风险收益" },
        { id:"s3", text:"专业投资者的核心能力：在合理风险范围内，最大化预期收益。风险管理比选股更重要。", visual:"🎯", highlight:"风险管理第一" }
      ],
    },
    {
      id:"ch3-l4", slug:"ch3-l4", title:"流动性的意义",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"现代导师", role:"资本底层思维导师", avatar:"💼" },
      scene:{ bg:"linear-gradient(135deg,#12002a 0%,#2c0a5e 100%)", accent:"#8B5CF6", icon:"⚙️", name:"现代会议室" },
      slides:[
        { id:"s1", text:"流动性=把资产变成现金的速度和成本。现金流动性最高，房产流动性低，私募股权更低。", visual:"💧", highlight:"流动性定义" },
        { id:"s2", text:"2008年金融危机：大量机构持有的抵押证券突然无人接盘，流动性危机引发系统崩溃。", visual:"🌊", highlight:"流动性危机案例" },
        { id:"s3", text:"投资决策必须考虑：你什么时候需要这笔钱？流动性需求决定资产配置比例。", visual:"🔑", highlight:"流动性关键考量" }
      ],
    },
    {
      id:"ch3-l5", slug:"ch3-l5", title:"杠杆的力量",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"现代导师", role:"资本底层思维导师", avatar:"💼" },
      scene:{ bg:"linear-gradient(135deg,#12002a 0%,#2c0a5e 100%)", accent:"#8B5CF6", icon:"⚙️", name:"现代会议室" },
      slides:[
        { id:"s1", text:"杠杆=用少量自有资金撬动大量借来的资金。房产首付30%，借70%，是最常见的杠杆。", visual:"🏠", highlight:"杠杆日常案例" },
        { id:"s2", text:"杠杆放大盈利，也放大亏损。资产涨10%时，3倍杠杆赚30%；资产跌10%时，亏30%。", visual:"⚡", highlight:"双刃剑" },
        { id:"s3", text:"核心原则：只在有稳定现金流覆盖还款时使用杠杆，永远不要用杠杆做高波动投机。", visual:"🛡️", highlight:"杠杆使用原则" }
      ],
    },
    {
      id:"ch3-l6", slug:"ch3-l6", title:"资本效率",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"现代导师", role:"资本底层思维导师", avatar:"💼" },
      scene:{ bg:"linear-gradient(135deg,#12002a 0%,#2c0a5e 100%)", accent:"#8B5CF6", icon:"⚙️", name:"现代会议室" },
      slides:[
        { id:"s1", text:"资本效率=每投入1元资本能产生多少收益。ROE（净资产收益率）是衡量资本效率的核心指标。", visual:"📐", highlight:"资本效率指标" },
        { id:"s2", text:"茅台ROE常年超过30%，意味着股东每100元净资产，每年赚30元回来。这是极高的资本效率。", visual:"🍺", highlight:"茅台案例" },
        { id:"s3", text:"提升资本效率的方法：提高产品利润率、加速资产周转、合理使用财务杠杆。", visual:"🔧", highlight:"提升三路径" }
      ],
    },
    {
      id:"ch3-l7", slug:"ch3-l7", title:"第一阶段综合测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"以下哪个说法关于复利是正确的？", options:[
          { id:"A", text:"只有存款才有复利", correct:false, explanation:"任何投资都可以有复利效应" },
          { id:"B", text:"复利与时间长短无关", correct:false, explanation:"时间是复利最重要的因素" },
          { id:"C", text:"本金产生的收益再投资产生更多收益", correct:true, explanation:"这是复利的本质定义" },
          { id:"D", text:"复利只在利率超过10%时有效", correct:false, explanation:"任何正利率都有复利效应" }
        ]},
        { id:"q2", question:"ROE指标衡量的是什么？", options:[
          { id:"A", text:"公司的总资产规模", correct:false, explanation:"总资产规模用总资产衡量" },
          { id:"B", text:"股东权益的盈利效率", correct:true, explanation:"ROE=净利润/净资产" },
          { id:"C", text:"公司的市场价值", correct:false, explanation:"市场价值用市值衡量" },
          { id:"D", text:"企业的债务水平", correct:false, explanation:"债务用资产负债率衡量" }
        ]},
        { id:"q3", question:"下列哪项资产流动性最高？", options:[
          { id:"A", text:"北京核心区住宅", correct:false, explanation:"房产流动性低" },
          { id:"B", text:"非上市公司股权", correct:false, explanation:"私募股权流动性极低" },
          { id:"C", text:"人民币现金", correct:true, explanation:"现金是流动性最高的资产" },
          { id:"D", text:"黄金", correct:false, explanation:"黄金流动性好但略低于现金" }
        ]}
      ],
    },
    {
      id:"ch3-l8", slug:"ch3-l8", title:"资本思维反思",
      type:"REFLECTION", xpReward:15, durationMin:3,
      reflectionPrompt:"经过前三章的学习，你对'资本'的理解发生了什么变化？你身边有哪些资本运作的例子是你以前没注意到的？",
      keyInsight:"资本不是神秘的东西，它存在于每一个商业决策中。当你开始用资本思维看世界，你会发现无处不在的机会。",
    },
    ],
  },
  // ── CH4 ───────────────────────────────────────────────────────────────
  {
    id:"ch4", slug:"ch4", order:4,
    title:"IPO与融资", subtitle:"企业上市与募资全过程",
    description:"从天使轮到IPO，掌握企业融资的完整路径与股权稀释逻辑。",
    xpReward:0, levelColor:"#EC4899", levelLabel:"LV2 探索", icon:"📈",
    lessons:[
    {
      id:"ch4-l1", slug:"ch4-l1", title:"什么是IPO",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"投行Wang", role:"投资银行家", avatar:"📊" },
      scene:{ bg:"linear-gradient(135deg,#1a0010 0%,#4a0030 100%)", accent:"#EC4899", icon:"📈", name:"投行交易大厅" },
      slides:[
        { id:"s1", text:"IPO（首次公开募股）是企业首次向公众出售股份并在交易所上市的过程，是融资的重要里程碑。", visual:"📋", highlight:"IPO定义" },
        { id:"s2", text:"企业上市前需经历：重组架构、审计财务、递交招股书、路演推介、确定发行价、正式挂牌。", visual:"📝", highlight:"IPO六步骤" },
        { id:"s3", text:"上市好处：获得大量资金、提升品牌公信力、为早期投资者提供退出通道、增强员工激励。", visual:"🎯", highlight:"上市的价值" }
      ],
    },
    {
      id:"ch4-l2", slug:"ch4-l2", title:"融资的五种方式",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"投行Wang", role:"投资银行家", avatar:"📊" },
      scene:{ bg:"linear-gradient(135deg,#1a0010 0%,#4a0030 100%)", accent:"#EC4899", icon:"📈", name:"投行交易大厅" },
      slides:[
        { id:"s1", text:"股权融资：出让股份换资金，不用还款但稀释控制权。债权融资：借钱还息，保留控制权但有还款压力。", visual:"⚖️", highlight:"股权vs债权" },
        { id:"s2", text:"五种方式：天使轮（亲友）→VC（风险投资）→PE（私募股权）→IPO（上市）→债券发行。", visual:"🪜", highlight:"融资阶梯" },
        { id:"s3", text:"选择融资方式的核心：你现在处于什么阶段？愿意稀释多少股权？资金用途是什么？", visual:"🔑", highlight:"选择融资方式" }
      ],
    },
    {
      id:"ch4-l3", slug:"ch4-l3", title:"股权稀释与估值",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"投行Wang", role:"投资银行家", avatar:"📊" },
      scene:{ bg:"linear-gradient(135deg,#1a0010 0%,#4a0030 100%)", accent:"#EC4899", icon:"📈", name:"投行交易大厅" },
      slides:[
        { id:"s1", text:"融资1000万，公司估值1亿，投资人占10%股权。公司越来越值钱，你的股权比例越来越小，但绝对价值增加。", visual:"📉", highlight:"稀释但增值" },
        { id:"s2", text:"估值=投资额÷出让比例。投资人给500万要20%股权，公司投前估值即为2500万元。", visual:"🧮", highlight:"估值计算" },
        { id:"s3", text:"创始人核心原则：不要过早稀释太多股权；保持控制权；每轮融资后确保公司价值真正提升。", visual:"🎯", highlight:"创始人原则" }
      ],
    },
    {
      id:"ch4-l4", slug:"ch4-l4", title:"第四章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"IPO的全称是什么？", options:[
          { id:"A", text:"内部产权转让", correct:false, explanation:"这不是IPO的含义" },
          { id:"B", text:"首次公开募股", correct:true, explanation:"Initial Public Offering" },
          { id:"C", text:"国际私人组织", correct:false, explanation:"不是IPO的含义" },
          { id:"D", text:"中期利润目标", correct:false, explanation:"不是IPO的含义" }
        ]},
        { id:"q2", question:"公司融资1000万，出让20%股权，此时公司估值为多少？", options:[
          { id:"A", text:"1000万", correct:false, explanation:"1000万只是融资额" },
          { id:"B", text:"5000万", correct:true, explanation:"1000万÷20%=5000万投前估值" },
          { id:"C", text:"8000万", correct:false, explanation:"计算有误" },
          { id:"D", text:"2000万", correct:false, explanation:"计算有误" }
        ]},
        { id:"q3", question:"以下哪种融资方式最不会稀释创始人股权？", options:[
          { id:"A", text:"天使轮融资", correct:false, explanation:"天使轮会稀释股权" },
          { id:"B", text:"风险投资VC", correct:false, explanation:"VC投资会稀释股权" },
          { id:"C", text:"银行债务融资", correct:true, explanation:"债务不涉及股权稀释" },
          { id:"D", text:"IPO上市", correct:false, explanation:"IPO是最大的股权稀释" }
        ]}
      ],
    },
    ],
  },
  // ── CH5 ───────────────────────────────────────────────────────────────
  {
    id:"ch5", slug:"ch5", order:5,
    title:"报价系统", subtitle:"掌握价格背后的资本逻辑",
    description:"学习六种定价方法，掌握报价谈判与系统设计，提升定价竞争力。",
    xpReward:0, levelColor:"#F59E0B", levelLabel:"LV3 构建", icon:"💰",
    lessons:[
    {
      id:"ch5-l1", slug:"ch5-l1", title:"价格的本质",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"价格不是成本的堆砌，而是买卖双方在特定时刻达成的共识，反映供需关系和心理预期。", visual:"💱", highlight:"价格=共识" },
        { id:"s2", text:"同样一瓶水：便利店3元，景区30元，沙漠300元。成本相同，价格取决于场景和稀缺度。", visual:"💧", highlight:"场景决定价格" },
        { id:"s3", text:"定价能力是企业最核心的竞争力之一。能自主提价的企业，才是真正的好企业。", visual:"🏆", highlight:"定价权=核心竞争力" }
      ],
    },
    {
      id:"ch5-l2", slug:"ch5-l2", title:"供需定价法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"需求增加或供给减少，价格上涨；需求减少或供给增加，价格下跌。这是最基本的市场规律。", visual:"📊", highlight:"供需决定价格" },
        { id:"s2", text:"2021年显卡短缺：芯片供应断链+挖矿需求爆发，RTX3080从建议零售价翻了3-5倍。", visual:"💻", highlight:"供需失衡案例" },
        { id:"s3", text:"供需分析框架：谁是买方？谁是卖方？哪里存在供需缺口？缺口多大？多久能填补？", visual:"🔍", highlight:"供需分析框架" }
      ],
    },
    {
      id:"ch5-l3", slug:"ch5-l3", title:"成本加成定价",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"成本加成定价：在成本基础上加一个固定利润率。简单直接，但可能错失定价机会。", visual:"➕", highlight:"成本+利润=价格" },
        { id:"s2", text:"餐厅成本加成：食材成本30元，加成200%，售价90元。这是餐饮业最常用的定价逻辑。", visual:"🍽️", highlight:"餐饮定价案例" },
        { id:"s3", text:"成本加成的局限：忽略了顾客愿意支付的上限，可能定价过低而错失利润。", visual:"⚠️", highlight:"成本加成的局限" }
      ],
    },
    {
      id:"ch5-l4", slug:"ch5-l4", title:"竞争对标定价",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"竞争定价：参考竞争对手的价格，决定自己定价高（差异化）、一样（跟随）还是低（渗透）。", visual:"🏁", highlight:"三种竞争策略" },
        { id:"s2", text:"苹果iPhone比安卓旗舰贵30-50%，靠的是品牌溢价；小米用接近成本的价格打市场份额。", visual:"📱", highlight:"苹果vs小米" },
        { id:"s3", text:"选择竞争定价策略时，先问：你的差异化优势是什么？你要争份额还是争利润？", visual:"🎯", highlight:"差异化优先" }
      ],
    },
    {
      id:"ch5-l5", slug:"ch5-l5", title:"价值定价法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"价值定价：以客户感知到的价值为基础定价，而非成本。顾客愿意付多少，才是价格上限。", visual:"💎", highlight:"价值决定价格" },
        { id:"s2", text:"麦肯锡咨询费每小时数千美元，远超成本，因为客户愿意为'解决1亿元问题的方案'付高价。", visual:"👔", highlight:"麦肯锡案例" },
        { id:"s3", text:"价值定价三步：量化你帮客户创造的价值→确定客户愿意分享的比例→设定价格。", visual:"🔢", highlight:"价值定价三步" }
      ],
    },
    {
      id:"ch5-l6", slug:"ch5-l6", title:"动态定价策略",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"动态定价：根据时间、需求、用户特征实时调整价格。航空公司、酒店、网约车都在用。", visual:"⏱️", highlight:"动态定价定义" },
        { id:"s2", text:"滴滴打车高峰期溢价：供不应求时提高价格，吸引更多司机上线，同时过滤需求——市场自动平衡。", visual:"🚗", highlight:"滴滴溢价案例" },
        { id:"s3", text:"动态定价的边界：要让顾客感到公平，过度溢价会损害品牌，需要透明的定价逻辑。", visual:"⚖️", highlight:"公平性边界" }
      ],
    },
    {
      id:"ch5-l7", slug:"ch5-l7", title:"报价谈判技巧",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"谈判中的报价：先报高价留出谈判空间；了解对方底线；让步要慢，每次让步换取对方回报。", visual:"🤝", highlight:"谈判基本策略" },
        { id:"s2", text:"BATNA原则：谈判前明确你的最佳替代方案。没有替代方案的一方，在谈判中处于弱势。", visual:"🃏", highlight:"BATNA原则" },
        { id:"s3", text:"报价谈判的终极技巧：让对方先报价，你会获得大量信息来判断是否还有空间。", visual:"🎯", highlight:"让对方先报" }
      ],
    },
    {
      id:"ch5-l8", slug:"ch5-l8", title:"报价系统设计",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"定价专家Li", role:"定价策略顾问", avatar:"💹" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#3d2800 100%)", accent:"#F59E0B", icon:"💰", name:"数据分析中心" },
      slides:[
        { id:"s1", text:"系统化报价五要素：标准化产品定义、分层定价（基础/进阶/旗舰）、量价折扣、有效期、支付条件。", visual:"📋", highlight:"报价系统五要素" },
        { id:"s2", text:"SaaS软件定价范式：免费版（获客）→专业版（转化）→企业版（收益）。三层漏斗设计。", visual:"💻", highlight:"SaaS三层定价" },
        { id:"s3", text:"好的报价系统能自动引导客户升级，减少销售摩擦，同时保护利润底线。", visual:"🔧", highlight:"报价系统价值" }
      ],
    },
    {
      id:"ch5-l9", slug:"ch5-l9", title:"第五章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"以下哪种定价方式以客户感知价值为核心？", options:[
          { id:"A", text:"成本加成定价", correct:false, explanation:"成本加成以成本为基础" },
          { id:"B", text:"竞争对标定价", correct:false, explanation:"竞争定价参考对手价格" },
          { id:"C", text:"价值定价法", correct:true, explanation:"价值定价以客户愿付为基础" },
          { id:"D", text:"统一定价法", correct:false, explanation:"不是本章介绍的方法" }
        ]},
        { id:"q2", question:"滴滴高峰期溢价的主要目的是什么？", options:[
          { id:"A", text:"增加公司利润", correct:false, explanation:"溢价主要不是为了利润" },
          { id:"B", text:"惩罚高峰期乘客", correct:false, explanation:"不是惩罚机制" },
          { id:"C", text:"吸引更多司机供给", correct:true, explanation:"溢价是供需平衡机制" },
          { id:"D", text:"减少交通拥堵", correct:false, explanation:"这不是直接目的" }
        ]},
        { id:"q3", question:"报价谈判中BATNA代表什么？", options:[
          { id:"A", text:"最高价格接受线", correct:false, explanation:"这不是BATNA的含义" },
          { id:"B", text:"谈判前的最佳替代方案", correct:true, explanation:"Best Alternative To Negotiated Agreement" },
          { id:"C", text:"报价自动调整系统", correct:false, explanation:"这不是BATNA" },
          { id:"D", text:"买家平均交易金额", correct:false, explanation:"这不是BATNA的含义" }
        ]}
      ],
    },
    {
      id:"ch5-l10", slug:"ch5-l10", title:"报价模拟器",
      type:"SIMULATION", xpReward:30, durationMin:5,
      simulation:{ type:"pricing", description:"实战练习：用所学的定价方法为你的产品制定合理的报价方案" },
    },
    ],
  },
  // ── CH6 ───────────────────────────────────────────────────────────────
  {
    id:"ch6", slug:"ch6", order:6,
    title:"KFC产业链案例", subtitle:"从炸鸡看资本布局",
    description:"深入KFC案例，理解供应链资本、特许经营与品牌价值的运作逻辑。",
    xpReward:0, levelColor:"#EF4444", levelLabel:"LV3 构建", icon:"🏪",
    lessons:[
    {
      id:"ch6-l1", slug:"ch6-l1", title:"KFC的商业模式",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"KFC经理", role:"百胜集团区域总监", avatar:"🍗" },
      scene:{ bg:"linear-gradient(135deg,#200000 0%,#500000 100%)", accent:"#EF4444", icon:"🏪", name:"KFC总部" },
      slides:[
        { id:"s1", text:"KFC不只是卖炸鸡，它是一个系统：标准化产品+品牌授权+供应链管控+特许经营网络。", visual:"🍗", highlight:"KFC商业系统" },
        { id:"s2", text:"KFC中国2023年超过9000家门店，百胜中国营收超过113亿美元，远超普通餐饮连锁。", visual:"📊", highlight:"规模的力量" },
        { id:"s3", text:"核心洞察：KFC真正在卖的是'成功的餐饮经营系统'，而非单纯的食物。", visual:"🔑", highlight:"卖系统不卖产品" }
      ],
    },
    {
      id:"ch6-l2", slug:"ch6-l2", title:"供应链资本运作",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"KFC经理", role:"百胜集团区域总监", avatar:"🍗" },
      scene:{ bg:"linear-gradient(135deg,#200000 0%,#500000 100%)", accent:"#EF4444", icon:"🏪", name:"KFC总部" },
      slides:[
        { id:"s1", text:"KFC的供应链：从养鸡场→饲料厂→屠宰场→冷链物流→门店，每个环节都是资本投入和价值创造。", visual:"🔗", highlight:"供应链资本链" },
        { id:"s2", text:"百胜建立了自己的供应商体系，通过规模采购压低成本，供应商深度依赖百胜的订单量。", visual:"💼", highlight:"供应链控制权" },
        { id:"s3", text:"控制上游供应链=控制成本=保证利润空间。KFC的定价权来自对整条价值链的掌控。", visual:"🏆", highlight:"控制链=控制利润" }
      ],
    },
    {
      id:"ch6-l3", slug:"ch6-l3", title:"特许经营与资本",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"KFC经理", role:"百胜集团区域总监", avatar:"🍗" },
      scene:{ bg:"linear-gradient(135deg,#200000 0%,#500000 100%)", accent:"#EF4444", icon:"🏪", name:"KFC总部" },
      slides:[
        { id:"s1", text:"特许经营是KFC扩张的核心引擎：总部提供品牌、技术、培训，加盟商出资金和管理，共同分利润。", visual:"🤝", highlight:"特许经营模式" },
        { id:"s2", text:"KFC加盟费+装修+设备：一家门店初期投资约150-200万，加盟商承担资本风险，总部输出品牌价值。", visual:"💰", highlight:"加盟成本分析" },
        { id:"s3", text:"特许经营本质是资本杠杆：用加盟商的钱实现自己的扩张，总部几乎零成本拿到营业收入提成。", visual:"🎯", highlight:"轻资产扩张" }
      ],
    },
    {
      id:"ch6-l4", slug:"ch6-l4", title:"品牌价值变现",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"KFC经理", role:"百胜集团区域总监", avatar:"🍗" },
      scene:{ bg:"linear-gradient(135deg,#200000 0%,#500000 100%)", accent:"#EF4444", icon:"🏪", name:"KFC总部" },
      slides:[
        { id:"s1", text:"KFC品牌价值估算超过170亿美元。这个数字代表：消费者愿意为KFC多付的溢价总和。", visual:"💎", highlight:"品牌价值量化" },
        { id:"s2", text:"品牌变现路径：高溢价产品→特许权费→联名合作→品牌授权→资本市场估值提升。", visual:"💹", highlight:"品牌变现五路径" },
        { id:"s3", text:"品牌是最持久的护城河。KFC经历过危机（苏丹红、禽流感），但品牌依然强韧。", visual:"🛡️", highlight:"品牌护城河" }
      ],
    },
    {
      id:"ch6-l5", slug:"ch6-l5", title:"KFC在中国的扩张",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"KFC经理", role:"百胜集团区域总监", avatar:"🍗" },
      scene:{ bg:"linear-gradient(135deg,#200000 0%,#500000 100%)", accent:"#EF4444", icon:"🏪", name:"KFC总部" },
      slides:[
        { id:"s1", text:"1987年KFC在北京前门开第一家店，2023年已超过9700家，是全球最大的KFC单一市场。", visual:"🇨🇳", highlight:"中国扩张史" },
        { id:"s2", text:"本土化战略：黄金蛋挞、老北京鸡肉卷、豆浆油条——用本地口味打破外来品牌的文化壁垒。", visual:"🥚", highlight:"本土化策略" },
        { id:"s3", text:"中国市场战略成功关键：早进入（1987年）、深本土化、快速标准化复制、持续产品创新。", visual:"🚀", highlight:"成功四要素" }
      ],
    },
    {
      id:"ch6-l6", slug:"ch6-l6", title:"百盛集团对比分析",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"KFC经理", role:"百胜集团区域总监", avatar:"🍗" },
      scene:{ bg:"linear-gradient(135deg,#200000 0%,#500000 100%)", accent:"#EF4444", icon:"🏪", name:"KFC总部" },
      slides:[
        { id:"s1", text:"百盛集团（Parkson）曾是马来西亚最大百货，1994年进入中国，2015年后门店大量关闭。", visual:"📉", highlight:"百盛兴衰" },
        { id:"s2", text:"对比KFC：百盛重资产（自持物业）vs KFC轻资产（加盟为主）；百盛无差异化vs KFC强品牌。", visual:"⚖️", highlight:"重资产vs轻资产" },
        { id:"s3", text:"核心教训：商业模式决定资本效率。百盛资产重、周转慢；KFC资产轻、现金流好。", visual:"💡", highlight:"模式决定效率" }
      ],
    },
    {
      id:"ch6-l7", slug:"ch6-l7", title:"第六章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"特许经营（加盟）模式对总部最大的资本优势是什么？", options:[
          { id:"A", text:"总部控制所有资产", correct:false, explanation:"加盟是分散资产控制权" },
          { id:"B", text:"利用加盟商资金扩张", correct:true, explanation:"这是轻资产扩张的核心" },
          { id:"C", text:"总部承担所有经营风险", correct:false, explanation:"风险由加盟商承担" },
          { id:"D", text:"不需要建立品牌", correct:false, explanation:"品牌是特许经营基础" }
        ]},
        { id:"q2", question:"KFC本土化战略的核心目的是什么？", options:[
          { id:"A", text:"降低食材成本", correct:false, explanation:"本土化主要不是为了降成本" },
          { id:"B", text:"打破文化壁垒获取中国消费者", correct:true, explanation:"本土化让外来品牌被接受" },
          { id:"C", text:"替代所有外国产品", correct:false, explanation:"这不是KFC的目标" },
          { id:"D", text:"进入低端市场", correct:false, explanation:"KFC定位中端" }
        ]},
        { id:"q3", question:"百盛相比KFC最大的资本效率劣势是什么？", options:[
          { id:"A", text:"产品种类太少", correct:false, explanation:"这不是资本效率问题" },
          { id:"B", text:"重资产模式导致资本周转慢", correct:true, explanation:"百盛自持物业是核心问题" },
          { id:"C", text:"价格太高", correct:false, explanation:"这不是资本效率指标" },
          { id:"D", text:"管理团队不够", correct:false, explanation:"这不是核心问题" }
        ]}
      ],
    },
    ],
  },
  // ── CH7 ───────────────────────────────────────────────────────────────
  {
    id:"ch7", slug:"ch7", order:7,
    title:"Apple iPhone案例", subtitle:"极致产品与资本的完美结合",
    description:"苹果生态系统、品牌溢价与资本运作策略的深度解析。",
    xpReward:0, levelColor:"#6B7280", levelLabel:"LV4 成长", icon:"🍎",
    lessons:[
    {
      id:"ch7-l1", slug:"ch7-l1", title:"苹果的商业模式革命",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"科技家Chen", role:"科技创业者", avatar:"💻" },
      scene:{ bg:"linear-gradient(135deg,#080808 0%,#1a1a1a 100%)", accent:"#9CA3AF", icon:"🍎", name:"苹果发布会舞台" },
      slides:[
        { id:"s1", text:"苹果不只是卖硬件，它在卖一个封闭的数字生态：iPhone+App Store+iCloud+AirPods，形成生态锁定。", visual:"🍎", highlight:"封闭生态战略" },
        { id:"s2", text:"苹果硬件毛利率约37%，服务业务毛利率超过70%。越来越多收入来自App Store、订阅服务。", visual:"💹", highlight:"服务收入崛起" },
        { id:"s3", text:"苹果商业模式精髓：用硬件获客，用服务变现，用生态锁定，用品牌溢价定价。", visual:"🔑", highlight:"四维商业飞轮" }
      ],
    },
    {
      id:"ch7-l2", slug:"ch7-l2", title:"iPhone的产业链资本",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"科技家Chen", role:"科技创业者", avatar:"💻" },
      scene:{ bg:"linear-gradient(135deg,#080808 0%,#1a1a1a 100%)", accent:"#9CA3AF", icon:"🍎", name:"苹果发布会舞台" },
      slides:[
        { id:"s1", text:"iPhone背后隐藏着超过200个供应商，分布在中国（富士康组装）、韩国（三星屏幕）、日本（索尼镜头）。", visual:"🌏", highlight:"全球供应链" },
        { id:"s2", text:"苹果对供应商要求极高且给价低，但能成为苹果供应商是最好的背书，带来更多订单。", visual:"📦", highlight:"苹果的供应商策略" },
        { id:"s3", text:"苹果通过预付款锁定关键零件产能，用订单量压低单价，把成本转嫁给供应链。", visual:"💰", highlight:"苹果的成本控制" }
      ],
    },
    {
      id:"ch7-l3", slug:"ch7-l3", title:"苹果的生态系统价值",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"科技家Chen", role:"科技创业者", avatar:"💻" },
      scene:{ bg:"linear-gradient(135deg,#080808 0%,#1a1a1a 100%)", accent:"#9CA3AF", icon:"🍎", name:"苹果发布会舞台" },
      slides:[
        { id:"s1", text:"苹果生态锁定：你有iPhone→买AirPods→买iPad→用iCloud→买MacBook，每一步都加深依赖。", visual:"🔒", highlight:"生态锁定机制" },
        { id:"s2", text:"2023年苹果服务收入超过850亿美元，App Store、Apple Music、iCloud等，都是高毛利生意。", visual:"📱", highlight:"服务收入规模" },
        { id:"s3", text:"生态系统价值=用户切换成本。苹果让用户离开的代价极高，这是真正的护城河。", visual:"🏰", highlight:"切换成本=护城河" }
      ],
    },
    {
      id:"ch7-l4", slug:"ch7-l4", title:"品牌溢价与资本",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"科技家Chen", role:"科技创业者", avatar:"💻" },
      scene:{ bg:"linear-gradient(135deg,#080808 0%,#1a1a1a 100%)", accent:"#9CA3AF", icon:"🍎", name:"苹果发布会舞台" },
      slides:[
        { id:"s1", text:"苹果iPhone售价比同配置安卓高30-50%，这个差价就是品牌溢价——消费者为品牌认同感付钱。", visual:"💎", highlight:"品牌溢价量化" },
        { id:"s2", text:"苹果品牌价值2023年超过4820亿美元（Interbrand评估），是全球最有价值的品牌之一。", visual:"🌟", highlight:"品牌价值4820亿" },
        { id:"s3", text:"品牌溢价对资本的意义：更高的毛利率→更强的现金流→更大的研发投入→更好的产品→更强的品牌。", visual:"🔄", highlight:"品牌溢价飞轮" }
      ],
    },
    {
      id:"ch7-l5", slug:"ch7-l5", title:"苹果的资本运作策略",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"科技家Chen", role:"科技创业者", avatar:"💻" },
      scene:{ bg:"linear-gradient(135deg,#080808 0%,#1a1a1a 100%)", accent:"#9CA3AF", icon:"🍎", name:"苹果发布会舞台" },
      slides:[
        { id:"s1", text:"苹果2023年持有超过1500亿美元现金储备。这不是闲置，而是战略武器：并购、回购、研发。", visual:"💰", highlight:"1500亿现金战略" },
        { id:"s2", text:"苹果回购股票：每年回购超过800亿美元，减少流通股数量，推高每股价值，是股东回报的核心方式。", visual:"📈", highlight:"回购股票策略" },
        { id:"s3", text:"苹果资本运作三角：现金积累（高利润）→回购增值（减少股数）→股价上涨（股东满意）。", visual:"🔺", highlight:"三角飞轮" }
      ],
    },
    {
      id:"ch7-l6", slug:"ch7-l6", title:"第七章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"苹果最重要的护城河是什么？", options:[
          { id:"A", text:"工厂生产能力", correct:false, explanation:"苹果代工生产，没有自己的工厂" },
          { id:"B", text:"最低的产品价格", correct:false, explanation:"苹果是高价策略" },
          { id:"C", text:"封闭生态系统的用户锁定", correct:true, explanation:"生态锁定是最强护城河" },
          { id:"D", text:"最多的专利数量", correct:false, explanation:"虽然专利重要但不是最核心" }
        ]},
        { id:"q2", question:"苹果回购股票的主要目的是什么？", options:[
          { id:"A", text:"降低公司负债", correct:false, explanation:"回购与负债无关" },
          { id:"B", text:"减少股份数量以提升每股价值", correct:true, explanation:"回购减少流通股，提升EPS" },
          { id:"C", text:"阻止竞争对手收购", correct:false, explanation:"这不是回购的主要目的" },
          { id:"D", text:"为员工提供股票期权", correct:false, explanation:"这是发行股票，不是回购" }
        ]},
        { id:"q3", question:"苹果服务业务（App Store等）相比硬件的优势是什么？", options:[
          { id:"A", text:"更大的市场规模", correct:false, explanation:"硬件市场规模更大" },
          { id:"B", text:"更高的毛利率（超过70%）", correct:true, explanation:"服务毛利率远高于硬件" },
          { id:"C", text:"更低的研发成本", correct:false, explanation:"服务研发成本不低" },
          { id:"D", text:"无需审核上架应用", correct:false, explanation:"苹果对App Store严格审核" }
        ]}
      ],
    },
    ],
  },
  // ── CH8 ───────────────────────────────────────────────────────────────
  {
    id:"ch8", slug:"ch8", order:8,
    title:"企业为什么要资本运作", subtitle:"资本运作的战略价值",
    description:"并购整合、资产证券化与资本运作动机的深度分析。",
    xpReward:0, levelColor:"#10B981", levelLabel:"LV4 成长", icon:"🏗️",
    lessons:[
    {
      id:"ch8-l1", slug:"ch8-l1", title:"资本运作的动机",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"企业CEO", role:"上市公司CEO", avatar:"🏢" },
      scene:{ bg:"linear-gradient(135deg,#001a0f 0%,#003320 100%)", accent:"#10B981", icon:"🏗️", name:"企业总部" },
      slides:[
        { id:"s1", text:"企业进行资本运作的动机：扩大规模（并购）、提升估值（上市）、降低成本（证券化）、转移风险（SPV）。", visual:"🎯", highlight:"资本运作四动机" },
        { id:"s2", text:"中国恒大资本运作反面案例：过度杠杆+跨界扩张，结果因流动性危机导致企业危机。", visual:"⚠️", highlight:"过度运作风险" },
        { id:"s3", text:"合理的资本运作应以真实经营为基础，任何脱离基本面的'资本游戏'终将崩塌。", visual:"🏗️", highlight:"基本面为根基" }
      ],
    },
    {
      id:"ch8-l2", slug:"ch8-l2", title:"并购与整合",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"企业CEO", role:"上市公司CEO", avatar:"🏢" },
      scene:{ bg:"linear-gradient(135deg,#001a0f 0%,#003320 100%)", accent:"#10B981", icon:"🏗️", name:"企业总部" },
      slides:[
        { id:"s1", text:"并购（M&A）=买下另一家公司。战略目的：扩大市场份额、获取技术/人才、消灭竞争对手、进入新领域。", visual:"🤝", highlight:"并购四目的" },
        { id:"s2", text:"滴滴合并Uber中国，腾讯收购多家游戏公司，阿里巴巴并购优酷——都是典型并购整合案例。", visual:"📱", highlight:"中国并购案例" },
        { id:"s3", text:"并购后整合是成败关键：文化冲突、人才流失、系统整合往往是并购失败的主要原因。", visual:"⚠️", highlight:"整合风险" }
      ],
    },
    {
      id:"ch8-l3", slug:"ch8-l3", title:"资产证券化",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"企业CEO", role:"上市公司CEO", avatar:"🏢" },
      scene:{ bg:"linear-gradient(135deg,#001a0f 0%,#003320 100%)", accent:"#10B981", icon:"🏗️", name:"企业总部" },
      slides:[
        { id:"s1", text:"资产证券化=把未来现金流打包成证券卖给投资者，提前获得资金。房贷、车贷、租金都能证券化。", visual:"📦", highlight:"证券化定义" },
        { id:"s2", text:"万科把未来10年的物业管理费打包成ABS（资产支持证券），卖给机构，当场拿到几十亿。", visual:"🏠", highlight:"万科ABS案例" },
        { id:"s3", text:"证券化的价值：把流动性低的资产变成可交易的证券，实现资产价值提前变现。", visual:"💧", highlight:"流动性魔法" }
      ],
    },
    {
      id:"ch8-l4", slug:"ch8-l4", title:"第二阶段综合测验",
      type:"QUIZ", xpReward:25, durationMin:3,
      questions:[
        { id:"q1", question:"企业并购后整合失败的最常见原因是什么？", options:[
          { id:"A", text:"支付了太高的价格", correct:false, explanation:"估值过高是风险，但整合才是主因" },
          { id:"B", text:"文化冲突和人才流失", correct:true, explanation:"文化和人才是整合最大挑战" },
          { id:"C", text:"行业监管审批太慢", correct:false, explanation:"这是外部因素" },
          { id:"D", text:"债务水平过高", correct:false, explanation:"这是财务问题，不是整合问题" }
        ]},
        { id:"q2", question:"资产证券化的核心目的是什么？", options:[
          { id:"A", text:"隐藏企业债务", correct:false, explanation:"证券化是合法融资手段" },
          { id:"B", text:"提前实现未来现金流的价值", correct:true, explanation:"这是证券化的本质" },
          { id:"C", text:"降低产品售价", correct:false, explanation:"与定价无关" },
          { id:"D", text:"增加流通股票数量", correct:false, explanation:"证券化不是股权融资" }
        ]},
        { id:"q3", question:"以下哪项是恒大危机的核心教训？", options:[
          { id:"A", text:"房地产不应该上市", correct:false, explanation:"行业本身没问题" },
          { id:"B", text:"多元化战略一定失败", correct:false, explanation:"多元化不一定失败" },
          { id:"C", text:"过度杠杆+流动性管理失控", correct:true, explanation:"高杠杆+流动性危机是根本" },
          { id:"D", text:"政府调控不公平", correct:false, explanation:"这是外部归因" }
        ]}
      ],
    },
    ],
  },
  // ── CH9 ───────────────────────────────────────────────────────────────
  {
    id:"ch9", slug:"ch9", order:9,
    title:"估值基础", subtitle:"给企业贴上正确的价格标签",
    description:"PE、PB、EV/EBITDA与可比公司分析——掌握主流估值工具。",
    xpReward:0, levelColor:"#0EA5E9", levelLabel:"LV5 资本化", icon:"📐",
    lessons:[
    {
      id:"ch9-l1", slug:"ch9-l1", title:"什么是估值",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"分析师Zhang", role:"股权估值分析师", avatar:"🔍" },
      scene:{ bg:"linear-gradient(135deg,#001520 0%,#002a3d 100%)", accent:"#0EA5E9", icon:"📐", name:"金融分析室" },
      slides:[
        { id:"s1", text:"估值=给企业/资产确定当前价值的过程。它不是精确科学，而是基于假设和判断的艺术。", visual:"🎨", highlight:"估值是艺术" },
        { id:"s2", text:"同一家公司，不同分析师可能给出差距50%的估值——因为假设不同，结论不同。", visual:"🔍", highlight:"估值的主观性" },
        { id:"s3", text:"估值的用途：融资谈判、并购定价、上市定价、内部决策、税务申报。", visual:"🎯", highlight:"估值的应用场景" }
      ],
    },
    {
      id:"ch9-l2", slug:"ch9-l2", title:"三种主流估值方法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"分析师Zhang", role:"股权估值分析师", avatar:"🔍" },
      scene:{ bg:"linear-gradient(135deg,#001520 0%,#002a3d 100%)", accent:"#0EA5E9", icon:"📐", name:"金融分析室" },
      slides:[
        { id:"s1", text:"三大估值方法：市场法（参考可比公司）、收益法（折现未来现金流DCF）、资产法（净资产重置成本）。", visual:"📐", highlight:"三大方法" },
        { id:"s2", text:"实务中通常综合使用：上市公司用市场法，初创公司用收益法，资产密集型用资产法。", visual:"⚖️", highlight:"方法选择逻辑" },
        { id:"s3", text:"没有'正确'的估值，只有'合理范围'的估值。好的估值师能清楚说明每个假设的依据。", visual:"💡", highlight:"估值的局限性" }
      ],
    },
    {
      id:"ch9-l3", slug:"ch9-l3", title:"市盈率PE详解",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"分析师Zhang", role:"股权估值分析师", avatar:"🔍" },
      scene:{ bg:"linear-gradient(135deg,#001520 0%,#002a3d 100%)", accent:"#0EA5E9", icon:"📐", name:"金融分析室" },
      slides:[
        { id:"s1", text:"PE=股价÷每股收益（EPS）。PE=20意味着投资者愿意为每1元利润支付20元，期待未来增长。", visual:"📊", highlight:"PE公式" },
        { id:"s2", text:"银行PE通常5-8倍（稳定低增长）；科技股PE可达50-100倍（高增长预期）；消费龙头20-40倍。", visual:"📈", highlight:"不同行业PE区间" },
        { id:"s3", text:"PE的局限：忽略债务、适用于盈利企业、易被一次性收益扭曲。PE要结合行业和成长性判断。", visual:"⚠️", highlight:"PE的局限" }
      ],
    },
    {
      id:"ch9-l4", slug:"ch9-l4", title:"市净率PB详解",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"分析师Zhang", role:"股权估值分析师", avatar:"🔍" },
      scene:{ bg:"linear-gradient(135deg,#001520 0%,#002a3d 100%)", accent:"#0EA5E9", icon:"📐", name:"金融分析室" },
      slides:[
        { id:"s1", text:"PB=股价÷每股净资产。PB=1意味着股价等于账面净资产；PB>1说明市场认可企业创造价值的能力。", visual:"📚", highlight:"PB公式" },
        { id:"s2", text:"银行股PB常低于1（资产质量担忧）；品牌消费品PB超过10（无形资产溢价）；制造业PB约1-3。", visual:"🏦", highlight:"不同行业PB" },
        { id:"s3", text:"PB最适合资产密集型行业（银行、地产）。对轻资产公司（互联网），PB参考价值有限。", visual:"💡", highlight:"PB的适用场景" }
      ],
    },
    {
      id:"ch9-l5", slug:"ch9-l5", title:"EV/EBITDA方法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"分析师Zhang", role:"股权估值分析师", avatar:"🔍" },
      scene:{ bg:"linear-gradient(135deg,#001520 0%,#002a3d 100%)", accent:"#0EA5E9", icon:"📐", name:"金融分析室" },
      slides:[
        { id:"s1", text:"EV=企业总价值（市值+净债务）。EBITDA=息税折旧摊销前利润，衡量核心经营盈利能力。", visual:"🔢", highlight:"EV/EBITDA公式" },
        { id:"s2", text:"EV/EBITDA剔除了资本结构和折旧政策的影响，适合跨公司、跨国比较。", visual:"⚖️", highlight:"跨国比较利器" },
        { id:"s3", text:"私募股权最爱用EV/EBITDA：收购时用它定价，退出时用它估算出售价格。通常6-12倍为正常区间。", visual:"💼", highlight:"PE机构的最爱" }
      ],
    },
    {
      id:"ch9-l6", slug:"ch9-l6", title:"可比公司分析",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"分析师Zhang", role:"股权估值分析师", avatar:"🔍" },
      scene:{ bg:"linear-gradient(135deg,#001520 0%,#002a3d 100%)", accent:"#0EA5E9", icon:"📐", name:"金融分析室" },
      slides:[
        { id:"s1", text:"可比公司分析（Comps）：找几家类似公司，看它们的平均估值倍数，用来给目标公司定价。", visual:"🔍", highlight:"Comps方法" },
        { id:"s2", text:"步骤：选3-5家可比公司→收集其PE/EV/EBITDA等→计算中位数→乘以目标公司指标=估值范围。", visual:"📋", highlight:"Comps五步骤" },
        { id:"s3", text:"关键：可比公司要真的'可比'——行业相同、规模相近、增速相似。选错可比公司，结论偏差很大。", visual:"⚠️", highlight:"可比公司选择" }
      ],
    },
    {
      id:"ch9-l7", slug:"ch9-l7", title:"第九章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"PE（市盈率）的计算公式是？", options:[
          { id:"A", text:"净资产÷股价", correct:false, explanation:"这是PB的倒数" },
          { id:"B", text:"股价÷每股收益", correct:true, explanation:"PE=Price÷EPS" },
          { id:"C", text:"市值÷营业收入", correct:false, explanation:"这是PS市销率" },
          { id:"D", text:"净利润÷总资产", correct:false, explanation:"这是ROA" }
        ]},
        { id:"q2", question:"EV/EBITDA估值方法最大的优点是什么？", options:[
          { id:"A", text:"计算最简单", correct:false, explanation:"DCF更简单" },
          { id:"B", text:"剔除资本结构影响，利于跨公司比较", correct:true, explanation:"这是EV/EBITDA最大优势" },
          { id:"C", text:"只适用于上市公司", correct:false, explanation:"非上市公司也可用" },
          { id:"D", text:"可以预测股价走势", correct:false, explanation:"估值不预测股价" }
        ]},
        { id:"q3", question:"做可比公司分析时，最关键的是什么？", options:[
          { id:"A", text:"选择市值最大的公司", correct:false, explanation:"规模不是唯一标准" },
          { id:"B", text:"选择真正具有可比性的同类公司", correct:true, explanation:"可比性是Comps的核心" },
          { id:"C", text:"选择最近上市的公司", correct:false, explanation:"上市时间不是关键" },
          { id:"D", text:"选择利润率最高的公司", correct:false, explanation:"不能只看利润率" }
        ]}
      ],
    },
    ],
  },
  // ── CH10 ───────────────────────────────────────────────────────────────
  {
    id:"ch10", slug:"ch10", order:10,
    title:"奶茶店估值案例", subtitle:"用一杯奶茶学懂估值",
    description:"从收入测算到融资谈判，完整的估值实战案例。",
    xpReward:0, levelColor:"#F97316", levelLabel:"LV5 资本化", icon:"🧋",
    lessons:[
    {
      id:"ch10-l1", slug:"ch10-l1", title:"小明的奶茶梦",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"创业者Xiao", role:"奶茶创业者", avatar:"🧋" },
      scene:{ bg:"linear-gradient(135deg,#1a0800 0%,#3d1a00 100%)", accent:"#F97316", icon:"🏪", name:"网红奶茶店" },
      slides:[
        { id:"s1", text:"小明有10万元，想开一家奶茶店。在谈判融资前，他需要先搞清楚：这家店值多少钱？", visual:"🧋", highlight:"估值的起点" },
        { id:"s2", text:"奶茶店的价值来源：日销售额×利润率×可持续经营年限，再加上品牌和扩张潜力。", visual:"💰", highlight:"价值来源分析" },
        { id:"s3", text:"投资人的第一个问题永远是：你的数据是真实的吗？你的商业模式是可持续的吗？", visual:"🔍", highlight:"投资人视角" }
      ],
    },
    {
      id:"ch10-l2", slug:"ch10-l2", title:"收入测算方法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"创业者Xiao", role:"奶茶创业者", avatar:"🧋" },
      scene:{ bg:"linear-gradient(135deg,#1a0800 0%,#3d1a00 100%)", accent:"#F97316", icon:"🏪", name:"网红奶茶店" },
      slides:[
        { id:"s1", text:"收入测算公式：日均客流量×客单价×营业天数=年收入。每天200杯×25元×365天=182.5万。", visual:"🧮", highlight:"收入测算公式" },
        { id:"s2", text:"验证方法：对标竞品（周边类似奶茶店的日销量）、调研商圈客流量、参考行业数据。", visual:"📊", highlight:"收入验证三法" },
        { id:"s3", text:"保守估算原则：用悲观假设做基础，而非乐观假设。'最坏情况能承受吗'是投资人的第一问。", visual:"⚖️", highlight:"保守估算原则" }
      ],
    },
    {
      id:"ch10-l3", slug:"ch10-l3", title:"成本结构分析",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"创业者Xiao", role:"奶茶创业者", avatar:"🧋" },
      scene:{ bg:"linear-gradient(135deg,#1a0800 0%,#3d1a00 100%)", accent:"#F97316", icon:"🏪", name:"网红奶茶店" },
      slides:[
        { id:"s1", text:"奶茶店主要成本：原材料（30-35%）、房租（15-20%）、人工（15-20%）、营销（5-10%）、其他（5%）。", visual:"💸", highlight:"成本结构拆解" },
        { id:"s2", text:"固定成本vs变动成本：房租是固定的（卖多卖少都要付），原材料是变动的（卖多才多花）。", visual:"📐", highlight:"固定vs变动成本" },
        { id:"s3", text:"盈亏平衡点=固定成本÷（单杯售价-单杯变动成本）。这是运营分析最重要的数据。", visual:"🎯", highlight:"盈亏平衡计算" }
      ],
    },
    {
      id:"ch10-l4", slug:"ch10-l4", title:"利润与估值",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"创业者Xiao", role:"奶茶创业者", avatar:"🧋" },
      scene:{ bg:"linear-gradient(135deg,#1a0800 0%,#3d1a00 100%)", accent:"#F97316", icon:"🏪", name:"网红奶茶店" },
      slides:[
        { id:"s1", text:"假设小明奶茶店年收入182万，净利润率20%，年净利润约36万元。PE法估值：36万×15倍PE=540万。", visual:"🧮", highlight:"PE估值计算" },
        { id:"s2", text:"DCF估值：预测未来5年现金流，以10%折现率折现，加上终值，可能得到600-700万估值区间。", visual:"📈", highlight:"DCF估值" },
        { id:"s3", text:"两种方法综合：估值约550-650万。小明开价600万，让投资人觉得'有谈判空间但不离谱'。", visual:"⚖️", highlight:"综合估值区间" }
      ],
    },
    {
      id:"ch10-l5", slug:"ch10-l5", title:"融资谈判模拟",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"创业者Xiao", role:"奶茶创业者", avatar:"🧋" },
      scene:{ bg:"linear-gradient(135deg,#1a0800 0%,#3d1a00 100%)", accent:"#F97316", icon:"🏪", name:"网红奶茶店" },
      slides:[
        { id:"s1", text:"小明找到天使投资人：'我的店估值600万，愿意出让15%股权，需要融资90万用于扩第二家店。'", visual:"💬", highlight:"开场报价" },
        { id:"s2", text:"投资人说：'你第一家店才开3个月，数据太短，估值600万太高。我给你400万估值，要20%股权。'", visual:"🤝", highlight:"投资人还价" },
        { id:"s3", text:"谈判结果：双方达成450万估值，投资人出资67.5万，占15%。小明保住控制权，拿到扩张资金。", visual:"🎉", highlight:"谈判结果" }
      ],
    },
    {
      id:"ch10-l6", slug:"ch10-l6", title:"第十章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"奶茶店年收入182万，净利润率20%，用15倍PE估值，估值约为多少？", options:[
          { id:"A", text:"182万", correct:false, explanation:"182万只是收入" },
          { id:"B", text:"540万", correct:true, explanation:"36万×15=540万" },
          { id:"C", text:"2730万", correct:false, explanation:"计算有误" },
          { id:"D", text:"1200万", correct:false, explanation:"计算有误" }
        ]},
        { id:"q2", question:"盈亏平衡点的正确计算方式是什么？", options:[
          { id:"A", text:"总收入÷总成本", correct:false, explanation:"这不是盈亏平衡" },
          { id:"B", text:"固定成本÷单杯贡献利润", correct:true, explanation:"盈亏平衡点=固定成本÷边际贡献" },
          { id:"C", text:"净利润÷营业额", correct:false, explanation:"这是净利润率" },
          { id:"D", text:"日销量×365", correct:false, explanation:"这是年化日销" }
        ]},
        { id:"q3", question:"在估值谈判中，估值越高对创始人一定越有利吗？", options:[
          { id:"A", text:"是，越高越好", correct:false, explanation:"过高估值会导致融资失败" },
          { id:"B", text:"不一定，要平衡融资成功率和稀释比例", correct:true, explanation:"合理估值才能成交" },
          { id:"C", text:"无所谓，反正要谈判", correct:false, explanation:"起点很重要" },
          { id:"D", text:"应该越低越好", correct:false, explanation:"太低创始人吃亏" }
        ]}
      ],
    },
    ],
  },
  // ── CH11 ───────────────────────────────────────────────────────────────
  {
    id:"ch11", slug:"ch11", order:11,
    title:"SPV系统", subtitle:"特殊目的载体的资本魔法",
    description:"SPV结构、法律架构、地产应用与风险隔离机制的完整解析。",
    xpReward:0, levelColor:"#7C3AED", levelLabel:"LV6 策略化", icon:"⚖️",
    lessons:[
    {
      id:"ch11-l1", slug:"ch11-l1", title:"什么是SPV",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"专家Liu", role:"结构融资律师", avatar:"🏦" },
      scene:{ bg:"linear-gradient(135deg,#0d0020 0%,#1e0050 100%)", accent:"#7C3AED", icon:"⚖️", name:"律师事务所" },
      slides:[
        { id:"s1", text:"SPV（特殊目的载体）是为特定业务目的而设立的独立法律实体，与母公司风险隔离。", visual:"⚖️", highlight:"SPV定义" },
        { id:"s2", text:"SPV最常见用途：项目融资（避免母公司债务）、资产证券化（打包资产发债）、私募基金（合伙架构）。", visual:"🏗️", highlight:"SPV三大用途" },
        { id:"s3", text:"SPV的核心价值：风险隔离+融资灵活+税务优化+清晰的权益分配。一个工具，多种价值。", visual:"🔑", highlight:"SPV四大价值" }
      ],
    },
    {
      id:"ch11-l2", slug:"ch11-l2", title:"SPV的法律结构",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"专家Liu", role:"结构融资律师", avatar:"🏦" },
      scene:{ bg:"linear-gradient(135deg,#0d0020 0%,#1e0050 100%)", accent:"#7C3AED", icon:"⚖️", name:"律师事务所" },
      slides:[
        { id:"s1", text:"SPV常见法律形式：有限责任公司（LLC）、有限合伙（LP）、信托（Trust）。各有特点，选哪种取决于目的。", visual:"📋", highlight:"SPV法律形式" },
        { id:"s2", text:"典型结构：母公司→SPV→项目资产。SPV独立承担项目债务，母公司最多损失注入SPV的资本。", visual:"🏛️", highlight:"风险隔离结构" },
        { id:"s3", text:"GP+LP架构（私募股权基金）：GP是管理合伙人（决策权），LP是有限合伙人（出资无管理权）。", visual:"🤝", highlight:"GP/LP结构" }
      ],
    },
    {
      id:"ch11-l3", slug:"ch11-l3", title:"SPV在地产中的应用",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"专家Liu", role:"结构融资律师", avatar:"🏦" },
      scene:{ bg:"linear-gradient(135deg,#0d0020 0%,#1e0050 100%)", accent:"#7C3AED", icon:"⚖️", name:"律师事务所" },
      slides:[
        { id:"s1", text:"每个地产项目通常设立独立SPV（项目公司）：便于独立融资、清晰核算、项目出售时直接转让SPV股权。", visual:"🏠", highlight:"地产SPV应用" },
        { id:"s2", text:"地产SPV融资工具：银行贷款+信托资金+ABS，多层资本叠加，杠杆率可达项目价值的70-80%。", visual:"💰", highlight:"SPV融资叠加" },
        { id:"s3", text:"恒大模式：数百个SPV项目公司，各自高杠杆融资，最终因现金流断裂引发连锁危机。", visual:"⚠️", highlight:"SPV滥用风险" }
      ],
    },
    {
      id:"ch11-l4", slug:"ch11-l4", title:"SPV风险隔离机制",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"专家Liu", role:"结构融资律师", avatar:"🏦" },
      scene:{ bg:"linear-gradient(135deg,#0d0020 0%,#1e0050 100%)", accent:"#7C3AED", icon:"⚖️", name:"律师事务所" },
      slides:[
        { id:"s1", text:"破产隔离：SPV设计良好时，母公司破产不影响SPV（投资者）资产；SPV破产不拖垮母公司。", visual:"🛡️", highlight:"破产隔离" },
        { id:"s2", text:"但隔离不是万能的：如果母公司为SPV提供担保，或资产转移不真实，隔离就可能失效。", visual:"⚠️", highlight:"隔离的局限" },
        { id:"s3", text:"SPV设计原则：独立董事+独立账户+真实资产转移+不承诺回购+独立经营。缺一不可。", visual:"✅", highlight:"设计原则五条" }
      ],
    },
    {
      id:"ch11-l5", slug:"ch11-l5", title:"第十一章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"设立SPV的核心目的是什么？", options:[
          { id:"A", text:"避税", correct:false, explanation:"避税不是SPV的主要目的" },
          { id:"B", text:"风险隔离与灵活融资", correct:true, explanation:"这是SPV最核心的价值" },
          { id:"C", text:"提高母公司股价", correct:false, explanation:"SPV本身不影响母公司股价" },
          { id:"D", text:"规避监管", correct:false, explanation:"合规SPV不是为了规避监管" }
        ]},
        { id:"q2", question:"私募股权基金中GP和LP最大的区别是什么？", options:[
          { id:"A", text:"GP出资更多", correct:false, explanation:"通常LP出资更多" },
          { id:"B", text:"LP有管理决策权", correct:false, explanation:"LP无日常管理权" },
          { id:"C", text:"GP负责管理，LP提供资金", correct:true, explanation:"GP决策，LP出资" },
          { id:"D", text:"没有区别", correct:false, explanation:"区别很大" }
        ]},
        { id:"q3", question:"SPV风险隔离失效的最常见原因是什么？", options:[
          { id:"A", text:"SPV太小", correct:false, explanation:"规模不是隔离失效原因" },
          { id:"B", text:"母公司为SPV提供担保", correct:true, explanation:"担保打破了风险隔离" },
          { id:"C", text:"SPV设在海外", correct:false, explanation:"注册地不影响隔离效果" },
          { id:"D", text:"SPV有太多投资者", correct:false, explanation:"投资者数量不影响" }
        ]}
      ],
    },
    ],
  },
  // ── CH12 ───────────────────────────────────────────────────────────────
  {
    id:"ch12", slug:"ch12", order:12,
    title:"未来估值法", subtitle:"DCF折现现金流的终极武器",
    description:"DCF原理、WACC、FCF预测与初创估值的完整体系。",
    xpReward:0, levelColor:"#059669", levelLabel:"LV6 策略化", icon:"🔭",
    lessons:[
    {
      id:"ch12-l1", slug:"ch12-l1", title:"DCF折现现金流原理",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"DCF（折现现金流）：把未来每年的自由现金流，以一个合理的折现率折算回今天的价值之和。", visual:"🔢", highlight:"DCF核心公式" },
        { id:"s2", text:"核心逻辑：今天的1元>明年的1元（因为今天的1元可以投资增值）。折现就是把未来价值换算成今天。", visual:"⏰", highlight:"折现的本质" },
        { id:"s3", text:"DCF是最理论正确的估值方法，但对假设极其敏感。折现率变化1%，估值可能变20%以上。", visual:"⚠️", highlight:"DCF的敏感性" }
      ],
    },
    {
      id:"ch12-l2", slug:"ch12-l2", title:"终值的计算",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"终值（Terminal Value）：预测期结束后，企业持续经营所创造价值的现值。通常占DCF估值的60-80%。", visual:"🔭", highlight:"终值的重要性" },
        { id:"s2", text:"永续增长法：终值=最后一年FCF×(1+g)÷(WACC-g)。其中g是永续增长率，通常取2-3%。", visual:"🧮", highlight:"永续增长公式" },
        { id:"s3", text:"终值假设对估值影响巨大。永续增长率从2%改为3%，有时能让估值增加30%以上。", visual:"⚠️", highlight:"终值假设敏感" }
      ],
    },
    {
      id:"ch12-l3", slug:"ch12-l3", title:"折现率WACC",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"WACC（加权平均资本成本）=股权成本×股权比例+债务成本×债务比例×(1-税率)。", visual:"🔢", highlight:"WACC公式" },
        { id:"s2", text:"股权成本用CAPM计算：Ke=Rf+β×(Rm-Rf)。Rf=无风险利率，β=系统风险，Rm=市场回报。", visual:"📊", highlight:"CAPM计算股权成本" },
        { id:"s3", text:"WACC直觉：一家公司的融资成本越低（股权稳定+低息债务），DCF估值越高——好公司，便宜钱。", visual:"💡", highlight:"WACC直觉" }
      ],
    },
    {
      id:"ch12-l4", slug:"ch12-l4", title:"自由现金流预测",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"自由现金流（FCF）=经营现金流-资本支出（CAPEX）。这是企业真正可自由支配的资金。", visual:"💰", highlight:"FCF公式" },
        { id:"s2", text:"FCF预测三步：预测收入增长→预测利润率→预测CAPEX需求。每一步都需要行业知识和合理假设。", visual:"📋", highlight:"FCF预测三步" },
        { id:"s3", text:"利润≠现金流。一家公司账面有利润，但如果应收账款高企、资本支出大，实际FCF可能为负。", visual:"⚠️", highlight:"利润vs现金流" }
      ],
    },
    {
      id:"ch12-l5", slug:"ch12-l5", title:"敏感性分析",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"敏感性分析：改变关键假设（增长率、WACC、利润率），观察估值如何变化，找出最关键的假设。", visual:"🔍", highlight:"敏感性分析定义" },
        { id:"s2", text:"呈现方式：二维敏感性表格（行=WACC变化，列=增长率变化，格中=对应估值）。", visual:"📊", highlight:"敏感性表格" },
        { id:"s3", text:"专业原则：永远要展示高中低三种情景（乐观/基础/悲观），而非只展示一个'最可能'结果。", visual:"✅", highlight:"三情景原则" }
      ],
    },
    {
      id:"ch12-l6", slug:"ch12-l6", title:"初创企业估值特殊性",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"初创企业DCF困难：没有历史现金流，增长预测高度不确定，折现率难以确定。", visual:"🚀", highlight:"初创估值难点" },
        { id:"s2", text:"早期企业常用替代方法：风险投资法（预测退出时价值，倒推现在估值）、可比交易法、里程碑法。", visual:"🎯", highlight:"替代估值方法" },
        { id:"s3", text:"初创估值最重要的因素：团队能力、市场规模、产品差异化、客户留存率——这些比财务模型更重要。", visual:"👥", highlight:"初创估值关键因素" }
      ],
    },
    {
      id:"ch12-l7", slug:"ch12-l7", title:"风险投资估值方法",
      type:"STORY", xpReward:10, durationMin:2,
      character:{ name:"Dr.Future", role:"未来估值学者", avatar:"🚀" },
      scene:{ bg:"linear-gradient(135deg,#001a10 0%,#003020 100%)", accent:"#059669", icon:"🔭", name:"未来主义实验室" },
      slides:[
        { id:"s1", text:"VC法（风险投资法）：预测退出时（5-7年后）公司价值→以目标回报率（如10x）折算回今天。", visual:"💼", highlight:"VC估值法" },
        { id:"s2", text:"举例：预测5年后以50倍PE退出，届时净利润2000万，退出价值=10亿。要求10x回报，今天估值=1亿。", visual:"🧮", highlight:"VC法举例" },
        { id:"s3", text:"VC的决策本质：这笔投资有多大概率成功×成功时的回报倍数。期望值计算是核心。", visual:"🎯", highlight:"期望值计算" }
      ],
    },
    {
      id:"ch12-l8", slug:"ch12-l8", title:"第三阶段综合测验",
      type:"QUIZ", xpReward:25, durationMin:3,
      questions:[
        { id:"q1", question:"DCF估值方法中，终值通常占总估值的比例是？", options:[
          { id:"A", text:"10-20%", correct:false, explanation:"终值占比通常远超20%" },
          { id:"B", text:"30-50%", correct:false, explanation:"通常更高" },
          { id:"C", text:"60-80%", correct:true, explanation:"终值通常占DCF估值的多数" },
          { id:"D", text:"超过90%", correct:false, explanation:"虽然有时接近，但60-80%是普遍区间" }
        ]},
        { id:"q2", question:"WACC代表什么？", options:[
          { id:"A", text:"加权平均资本成本", correct:true, explanation:"Weighted Average Cost of Capital" },
          { id:"B", text:"全球资产配置中心", correct:false, explanation:"这不是WACC的含义" },
          { id:"C", text:"市场价格调整系数", correct:false, explanation:"这不是WACC" },
          { id:"D", text:"企业负债总额", correct:false, explanation:"这不是WACC" }
        ]},
        { id:"q3", question:"自由现金流（FCF）的计算公式是？", options:[
          { id:"A", text:"净利润+折旧", correct:false, explanation:"这是EBITDA的部分" },
          { id:"B", text:"经营现金流-资本支出", correct:true, explanation:"FCF=CFO-CAPEX" },
          { id:"C", text:"总收入-总成本", correct:false, explanation:"这是利润" },
          { id:"D", text:"净利润-股息支出", correct:false, explanation:"这不是FCF" }
        ]}
      ],
    },
    {
      id:"ch12-l9", slug:"ch12-l9", title:"第十二章测验",
      type:"QUIZ", xpReward:20, durationMin:3,
      questions:[
        { id:"q1", question:"风险投资法估值中，最重要的假设是什么？", options:[
          { id:"A", text:"公司当前的资产规模", correct:false, explanation:"早期公司资产不是关键" },
          { id:"B", text:"退出时的公司价值和目标回报倍数", correct:true, explanation:"这是VC法的两个核心输入" },
          { id:"C", text:"竞争对手的估值", correct:false, explanation:"可比分析是另一种方法" },
          { id:"D", text:"创始人的年薪", correct:false, explanation:"这与估值无关" }
        ]},
        { id:"q2", question:"为什么利润高的公司有时候自由现金流为负？", options:[
          { id:"A", text:"会计造假", correct:false, explanation:"不一定是造假" },
          { id:"B", text:"大量应收款+高资本支出", correct:true, explanation:"这些会消耗经营现金流" },
          { id:"C", text:"税率太高", correct:false, explanation:"税收减少利润但不直接造成FCF为负" },
          { id:"D", text:"股息支付过多", correct:false, explanation:"股息在FCF计算之后" }
        ]},
        { id:"q3", question:"敏感性分析的主要目的是什么？", options:[
          { id:"A", text:"找到最准确的估值", correct:false, explanation:"没有最准确，只有合理范围" },
          { id:"B", text:"识别关键假设对估值的影响程度", correct:true, explanation:"这是敏感性分析的核心" },
          { id:"C", text:"降低估值", correct:false, explanation:"敏感性分析不改变估值方向" },
          { id:"D", text:"说服投资人", correct:false, explanation:"这是次要用途" }
        ]}
      ],
    },
    {
      id:"ch12-l10", slug:"ch12-l10", title:"未来估值模拟器",
      type:"SIMULATION", xpReward:30, durationMin:5,
      simulation:{ type:"valuation", description:"实战演练：用DCF方法为一家企业建模，感受关键假设如何影响最终估值" },
    },
    ],
  },
  // ── CH13 ───────────────────────────────────────────────────────────────
  {
    id:"ch13", slug:"ch13", order:13,
    title:"资本成长地图", subtitle:"从学员到资本家的最后一跃",
    description:"综合实战：思维框架、行业地图、投资决策与毕业典礼。",
    xpReward:0, levelColor:"#D97706", levelLabel:"LV7 升维", icon:"🗺️",
    lessons:[
    {
      id:"ch13-l1", slug:"ch13-l1", title:"资本家的思维框架",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"资本家思维框架：①把钱看成工具 ②投资而非消费 ③长期视野 ④系统性思考 ⑤承受不确定性。", visual:"🧠", highlight:"五维思维框架" },
        { id:"s2", text:"与普通人的核心差异：资本家问'这笔钱能产生多少回报'，普通人问'这东西值不值这个价'。", visual:"⚖️", highlight:"两种思维对比" },
        { id:"s3", text:"思维框架是最长期的竞争优势。财富可以失去，但正确的思维框架会持续创造财富。", visual:"💡", highlight:"思维的长期价值" }
      ],
    },
    {
      id:"ch13-l2", slug:"ch13-l2", title:"如何识别好的投资标的",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"好标的的五个特征：①强护城河 ②高ROE ③可预期的现金流 ④卓越的管理团队 ⑤合理的价格。", visual:"🎯", highlight:"好标的五特征" },
        { id:"s2", text:"护城河的类型：品牌（茅台）、网络效应（微信）、转换成本（SAP）、成本优势（拼多多）、规模（京东物流）。", visual:"🏰", highlight:"护城河五类型" },
        { id:"s3", text:"记住：即使是最好的公司，买贵了也是差投资。'好公司'和'好投资'不是同一件事。", visual:"⚠️", highlight:"价格永远重要" }
      ],
    },
    {
      id:"ch13-l3", slug:"ch13-l3", title:"尽职调查要点",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"尽职调查（DD）是投资前对目标企业的全面核查：财务、法律、商业模式、团队、市场、竞争。", visual:"🔍", highlight:"DD六维度" },
        { id:"s2", text:"财务DD核心：验证收入真实性、核查资产质量、识别隐性负债、确认现金流状况。", visual:"💰", highlight:"财务DD重点" },
        { id:"s3", text:"最常被忽略的DD：团队背景调查（创始人诚信记录）、客户访谈（用户真实满意度）。", visual:"👥", highlight:"容易忽略的DD" }
      ],
    },
    {
      id:"ch13-l4", slug:"ch13-l4", title:"投资条款清单TS",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"Term Sheet（条款清单）是投资意向书，核心条款：估值、投资额、股权比例、优先清算权、反稀释条款。", visual:"📋", highlight:"TS核心条款" },
        { id:"s2", text:"优先清算权：投资人在公司退出时，优先于创始人拿回投资本金（甚至1-2倍）后，剩余再分。", visual:"⚖️", highlight:"优先清算权解析" },
        { id:"s3", text:"创始人谈TS的核心原则：关注实质而非数字。100万估值差距，远不如一个糟糕的优先清算条款伤害大。", visual:"💡", highlight:"TS谈判原则" }
      ],
    },
    {
      id:"ch13-l5", slug:"ch13-l5", title:"董事会与公司治理",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"董事会是公司最高决策机构，负责重大战略、CEO任命、财务监督。投资人通常要求董事席位。", visual:"🏛️", highlight:"董事会职能" },
        { id:"s2", text:"常见治理结构：创始人团队席位+独立董事席位+投资人席位，以保证多方制衡。", visual:"⚖️", highlight:"治理结构设计" },
        { id:"s3", text:"治理失败案例：WeWork创始人Adam Neumann权力过大，导致公司走向失控——治理是资本的安全网。", visual:"⚠️", highlight:"治理失败案例" }
      ],
    },
    {
      id:"ch13-l6", slug:"ch13-l6", title:"退出策略设计",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"投资的终点是退出。主要退出方式：IPO上市、并购（战略买家/PE）、回购（创始人回购）、清算。", visual:"🚪", highlight:"退出四通道" },
        { id:"s2", text:"投资前就要想好退出：谁会是潜在买家？上市条件是什么？回购触发条件是什么？", visual:"🎯", highlight:"提前规划退出" },
        { id:"s3", text:"二级市场（S基金）：让早期投资人在公司上市前就转让股权，为流动性受限的投资人提供出路。", visual:"💧", highlight:"S基金提供流动性" }
      ],
    },
    {
      id:"ch13-l7", slug:"ch13-l7", title:"综合大测验一：基础认知",
      type:"QUIZ", xpReward:30, durationMin:3,
      questions:[
        { id:"q1", question:"以下哪项不是资本护城河？", options:[
          { id:"A", text:"品牌效应", correct:false, explanation:"品牌是护城河" },
          { id:"B", text:"网络效应", correct:false, explanation:"网络效应是护城河" },
          { id:"C", text:"公司规模大", correct:true, explanation:"规模大不等于护城河，需要有壁垒" },
          { id:"D", text:"转换成本高", correct:false, explanation:"转换成本是护城河" }
        ]},
        { id:"q2", question:"复利的三个核心要素是？", options:[
          { id:"A", text:"股票、基金、债券", correct:false, explanation:"这是资产类型" },
          { id:"B", text:"本金、收益率、时间", correct:true, explanation:"复利三要素" },
          { id:"C", text:"买入、持有、卖出", correct:false, explanation:"这是投资动作" },
          { id:"D", text:"利率、税率、通胀率", correct:false, explanation:"这些是影响因素" }
        ]},
        { id:"q3", question:"一家公司的自由现金流为负，最可能的原因是？", options:[
          { id:"A", text:"产品质量差", correct:false, explanation:"产品质量不直接影响FCF" },
          { id:"B", text:"大量资本支出超过经营现金流", correct:true, explanation:"重资本扩张期FCF常为负" },
          { id:"C", text:"员工太多", correct:false, explanation:"人力成本影响利润但不直接决定FCF" },
          { id:"D", text:"税率太高", correct:false, explanation:"税收影响利润，但不一定使FCF为负" }
        ]}
      ],
    },
    {
      id:"ch13-l8", slug:"ch13-l8", title:"综合大测验二：工具运用",
      type:"QUIZ", xpReward:30, durationMin:3,
      questions:[
        { id:"q1", question:"某公司今年净利润500万，市场给予20倍PE，公司估值是多少？", options:[
          { id:"A", text:"500万", correct:false, explanation:"500万只是净利润" },
          { id:"B", text:"1亿元", correct:true, explanation:"500万×20=1亿" },
          { id:"C", text:"2000万", correct:false, explanation:"计算有误" },
          { id:"D", text:"2.5亿", correct:false, explanation:"计算有误" }
        ]},
        { id:"q2", question:"DCF估值中，折现率越高，估值结果会怎样？", options:[
          { id:"A", text:"估值越高", correct:false, explanation:"折现率越高，现值越低" },
          { id:"B", text:"估值不变", correct:false, explanation:"折现率影响估值" },
          { id:"C", text:"估值越低", correct:true, explanation:"折现率越高，未来现金流现值越小" },
          { id:"D", text:"取决于增长率", correct:false, explanation:"折现率直接影响估值方向" }
        ]},
        { id:"q3", question:"特许经营模式的核心资本优势是什么？", options:[
          { id:"A", text:"总部承担所有风险", correct:false, explanation:"特许经营分散风险" },
          { id:"B", text:"用加盟商资金实现轻资产扩张", correct:true, explanation:"这是特许经营的资本魔法" },
          { id:"C", text:"消除市场竞争", correct:false, explanation:"这不可能" },
          { id:"D", text:"降低产品质量标准", correct:false, explanation:"标准化才是关键" }
        ]}
      ],
    },
    {
      id:"ch13-l9", slug:"ch13-l9", title:"综合大测验三：案例分析",
      type:"QUIZ", xpReward:30, durationMin:3,
      questions:[
        { id:"q1", question:"苹果公司大量回购股票，对投资者的主要影响是？", options:[
          { id:"A", text:"稀释投资者持股比例", correct:false, explanation:"回购减少股数，增加而非稀释比例" },
          { id:"B", text:"减少公司营收", correct:false, explanation:"回购不影响营收" },
          { id:"C", text:"提升每股收益和股东价值", correct:true, explanation:"回购减少股数，EPS和价值提升" },
          { id:"D", text:"增加公司债务", correct:false, explanation:"回购用现金，可能不涉及债务" }
        ]},
        { id:"q2", question:"一家奶茶店年净利润36万，投资人出90万获得15%股权，投资人隐含的公司估值是多少？", options:[
          { id:"A", text:"90万", correct:false, explanation:"90万只是投资额" },
          { id:"B", text:"600万", correct:true, explanation:"90万÷15%=600万" },
          { id:"C", text:"240万", correct:false, explanation:"计算有误" },
          { id:"D", text:"540万", correct:false, explanation:"这是PE法估值" }
        ]},
        { id:"q3", question:"荷兰东印度公司（VOC）的商业成功最关键的因素是？", options:[
          { id:"A", text:"政府的直接补贴", correct:false, explanation:"主要靠市场化运作" },
          { id:"B", text:"垄断贸易路线+向公众融资分担风险", correct:true, explanation:"这两点是VOC成功核心" },
          { id:"C", text:"低廉的产品价格", correct:false, explanation:"香料是高价值商品" },
          { id:"D", text:"技术创新", correct:false, explanation:"VOC的优势是商业模式而非技术" }
        ]}
      ],
    },
    {
      id:"ch13-l10", slug:"ch13-l10", title:"资本地图：制造业",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"制造业资本运作重点：重资产管理（工厂设备折旧）、供应链融资（应付账款延长）、产能利用率优化。", visual:"🏭", highlight:"制造业资本要点" },
        { id:"s2", text:"富士康模式：低利润率×超大规模=可观利润。用规模换成本优势，用效率换资本回报。", visual:"📱", highlight:"富士康案例" },
        { id:"s3", text:"制造业升级路径：从代工（OEM）→品牌制造（OBM）→智能制造，资本效率逐步提升。", visual:"🚀", highlight:"制造业升级路径" }
      ],
    },
    {
      id:"ch13-l11", slug:"ch13-l11", title:"资本地图：科技业",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"科技公司资本特点：轻资产（主要资产是人才和代码）、高增长、高毛利、重研发投入。", visual:"💻", highlight:"科技资本特点" },
        { id:"s2", text:"SaaS商业模式：一次研发多次销售，边际成本趋近于零，规模越大毛利率越高。", visual:"☁️", highlight:"SaaS经济学" },
        { id:"s3", text:"科技公司估值逻辑：重增长而非盈利（亚马逊亏损多年但估值极高），用户增长>短期利润。", visual:"📈", highlight:"科技估值逻辑" }
      ],
    },
    {
      id:"ch13-l12", slug:"ch13-l12", title:"资本地图：消费品",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"消费品资本重点：品牌建设（长期投入）、渠道管理（铺货和促销）、供应链效率（周转天数）。", visual:"🛒", highlight:"消费品资本要点" },
        { id:"s2", text:"茅台模式：稀缺性（计划产量不扩张）+品牌溢价+渠道控制=超高ROE的资本神话。", visual:"🍶", highlight:"茅台资本模型" },
        { id:"s3", text:"消费品公司的护城河：品牌认知（换品牌有心理成本）+渠道深度（终端覆盖率）。", visual:"🏰", highlight:"消费护城河" }
      ],
    },
    {
      id:"ch13-l13", slug:"ch13-l13", title:"资本地图：金融业",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"金融业本质是'经营钱'：以低成本募集资金，以高收益放出，利差就是利润来源。", visual:"🏦", highlight:"金融业本质" },
        { id:"s2", text:"银行的资本运作：存款（低息负债）→贷款（高息资产），净息差×资产规模=净利润。", visual:"📊", highlight:"银行盈利模式" },
        { id:"s3", text:"金融业的风险：杠杆高（银行资本充足率要求仅8-12%）、流动性风险、信用风险三重压力。", visual:"⚠️", highlight:"金融风险三重" }
      ],
    },
    {
      id:"ch13-l14", slug:"ch13-l14", title:"资本地图：房地产",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"地产资本运作链：拿地（高杠杆）→开发（建设期预售）→交房（资金回笼）→再拿地（循环）。", visual:"🏘️", highlight:"地产资本链" },
        { id:"s2", text:"地产商的资金成本：信托（8-12%）+银行贷款（4-6%）+债券（5-8%），综合资金成本是盈亏关键。", visual:"💰", highlight:"地产融资成本" },
        { id:"s3", text:"行业洗牌后的机会：高债低杠杆的房企（龙湖、越秀）在行业重组中获得更多市场份额。", visual:"🌟", highlight:"洗牌后机会" }
      ],
    },
    {
      id:"ch13-l15", slug:"ch13-l15", title:"我的第一份资本计划",
      type:"REFLECTION", xpReward:20, durationMin:5,
      reflectionPrompt:"结合你自己的行业或创业想法，写下你的第一份资本运作初步规划：你打算如何用资本思维来优化你的生意或职业路径？",
      keyInsight:"资本计划不需要完美，它需要真实。一个写下来的粗糙计划，远胜于一个只存在脑中的完美想法。",
    },
    {
      id:"ch13-l16", slug:"ch13-l16", title:"资本运作常见误区",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"误区一：把融资当成功。融资只是起点，真正的成功是融来的钱创造了真实价值和回报。", visual:"❌", highlight:"融资≠成功" },
        { id:"s2", text:"误区二：估值越高越好。过高估值意味着下一轮压力大，如果业绩不达预期，将面临down round。", visual:"⚠️", highlight:"估值虚高之害" },
        { id:"s3", text:"误区三：忽略现金流。很多企业利润表好看，但现金流出问题，最终因'赚钱却破产'倒闭。", visual:"💸", highlight:"现金流永远第一" }
      ],
    },
    {
      id:"ch13-l17", slug:"ch13-l17", title:"如何找到资本合伙人",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"资本合伙人分类：天使（个人经验+小额）、VC（高风险高回报）、PE（成熟期并购）、战略投资者（资源协同）。", visual:"🤝", highlight:"投资人分类" },
        { id:"s2", text:"找投资人三步：①定位阶段（融哪轮？）②匹配策略（谁投过同类项目？）③热联络（共同人引荐）。", visual:"📋", highlight:"找投资人三步" },
        { id:"s3", text:"最好的投资人不只带钱，还带资源、经验、人脉网络。选对投资人，比多融100万更重要。", visual:"💡", highlight:"投资人选择原则" }
      ],
    },
    {
      id:"ch13-l18", slug:"ch13-l18", title:"资本家的日常修炼",
      type:"STORY", xpReward:15, durationMin:2,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"每日修炼：阅读财经新闻（了解市场动态）、研究一家公司（培养分析习惯）、记录投资想法（建立认知体系）。", visual:"📰", highlight:"每日三修炼" },
        { id:"s2", text:"年度修炼：复盘投资组合（哪些判断对了？哪些错了？为什么？）、更新行业地图（哪里有新机会？）。", visual:"📆", highlight:"年度复盘" },
        { id:"s3", text:"最重要的修炼：保持谦逊，持续学习。市场永远比你聪明，保持敬畏才是长胜之道。", visual:"🙏", highlight:"谦逊是最强武器" }
      ],
    },
    {
      id:"ch13-l19", slug:"ch13-l19", title:"终极挑战：设计资本方案",
      type:"QUIZ", xpReward:50, durationMin:5,
      questions:[
        { id:"q1", question:"你有1000万资金想投资。以下哪种策略最符合资本家思维？", options:[
          { id:"A", text:"全部存银行，年利率3%", correct:false, explanation:"全部存银行无法实现资产增值" },
          { id:"B", text:"全部押注一只高风险股票", correct:false, explanation:"单一重仓是赌博不是投资" },
          { id:"C", text:"分散配置：30%股权+30%债权+20%房产+20%现金", correct:true, explanation:"分散配置符合风险收益平衡原则" },
          { id:"D", text:"全部消费，及时行乐", correct:false, explanation:"消费不是资本运作" }
        ]},
        { id:"q2", question:"一家公司A：PE=8倍；公司B：PE=40倍。以下哪种说法最准确？", options:[
          { id:"A", text:"A一定比B便宜，应该买A", correct:false, explanation:"PE需要结合增长和行业比较" },
          { id:"B", text:"B一定被高估，不应该买", correct:false, explanation:"高增长公司高PE可能合理" },
          { id:"C", text:"需要结合行业和增长率来判断", correct:true, explanation:"PE是相对指标，需综合分析" },
          { id:"D", text:"两者没有可比性", correct:false, explanation:"可以比，但需要更多信息" }
        ]},
        { id:"q3", question:"创业公司在A轮融资时，最需要关注TS中的哪个条款？", options:[
          { id:"A", text:"公司估值数字", correct:false, explanation:"估值重要但不是最危险的" },
          { id:"B", text:"投资金额", correct:false, explanation:"金额重要但不是最危险的" },
          { id:"C", text:"优先清算权的倍数和参与权", correct:true, explanation:"恶意优先清算权会让创始人血本无归" },
          { id:"D", text:"投资人姓名", correct:false, explanation:"投资人身份不是条款风险" }
        ]}
      ],
    },
    {
      id:"ch13-l20", slug:"ch13-l20", title:"你的资本宣言",
      type:"REFLECTION", xpReward:20, durationMin:5,
      reflectionPrompt:"经过13章100关的学习，写下你的资本宣言：你是谁？你的资本目标是什么？你将如何用资本思维改变自己的未来？",
      keyInsight:"你已经不再是资本世界的门外汉。你理解了底层逻辑，学会了工具，见过了真实案例。现在，是时候行动了。",
    },
    {
      id:"ch13-l21", slug:"ch13-l21", title:"🎓 毕业典礼",
      type:"STORY", xpReward:50, durationMin:5,
      character:{ name:"资本导师", role:"终极资本导师", avatar:"🌟" },
      scene:{ bg:"linear-gradient(135deg,#1a1000 0%,#4d3300 100%)", accent:"#D97706", icon:"🗺️", name:"金色资本殿堂" },
      slides:[
        { id:"s1", text:"恭喜你！你完成了《资本启航》全部100关。你已经走完了从'资本是什么'到'如何运作资本'的完整旅程。", visual:"🎓", highlight:"完成100关" },
        { id:"s2", text:"你学会了：资本的本质、历史与逻辑、估值工具、真实案例分析、投资决策框架，以及资本家的思维方式。", visual:"📚", highlight:"学习总结" },
        { id:"s3", text:"资本世界的旅程才刚刚开始。带着你的知识和勇气，去创造属于你自己的资本故事。加油！", visual:"🚀", highlight:"出发" }
      ],
    },
    ],
  },
];

// Helper: get module by slug
export function getModuleBySlug(slug: string): Module | undefined {
  return CAPITAL_LAUNCH_MODULES.find((m) => m.slug === slug);
}

// Helper: get lesson by slug
export function getLessonBySlug(moduleSlug: string, lessonSlug: string): Lesson | undefined {
  const mod = getModuleBySlug(moduleSlug);
  return mod?.lessons.find((l) => l.slug === lessonSlug);
}

// Helper: get next lesson
export function getNextLesson(moduleSlug: string, lessonSlug: string): { module: Module; lesson: Lesson } | null {
  const modIdx = CAPITAL_LAUNCH_MODULES.findIndex((m) => m.slug === moduleSlug);
  if (modIdx === -1) return null;
  const mod = CAPITAL_LAUNCH_MODULES[modIdx];
  const lessonIdx = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  if (lessonIdx < mod.lessons.length - 1) {
    return { module: mod, lesson: mod.lessons[lessonIdx + 1] };
  }
  if (modIdx < CAPITAL_LAUNCH_MODULES.length - 1) {
    const nextMod = CAPITAL_LAUNCH_MODULES[modIdx + 1];
    return { module: nextMod, lesson: nextMod.lessons[0] };
  }
  return null;
}

// Backward compat alias
export const modules = CAPITAL_LAUNCH_MODULES;
export const chapters = CAPITAL_LAUNCH_MODULES;

// Total XP available
export const TOTAL_COURSE_XP = CAPITAL_LAUNCH_MODULES.reduce(
  (sum, m) => sum + m.lessons.reduce((s, l) => s + l.xpReward, 0),
  0
);