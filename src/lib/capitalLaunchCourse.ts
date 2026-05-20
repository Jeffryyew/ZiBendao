// 《资本启航》— AI Immersive Online Course Content
// All 11 modules with lessons, narratives, AI characters, and quiz content

export type LessonType = "STORY" | "QUIZ" | "SIMULATION" | "REFLECTION";

export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface StorySlide {
  id: string;
  text: string;       // narrator / character dialogue
  visual?: string;    // emoji / icon representing the scene
  highlight?: string; // key concept to highlight
}

export interface SimulationConfig {
  type: "pricing" | "valuation" | "equity";
  description: string;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  type: LessonType;
  xpReward: number;
  durationMin: number;
  // STORY lessons
  character?: {
    name: string;
    role: string;
    avatar: string; // emoji
    era?: string;
  };
  scene?: {
    bg: string;       // CSS gradient or color
    accent: string;   // accent color
    icon: string;     // emoji
    name: string;     // scene description
  };
  slides?: StorySlide[];
  // QUIZ lessons
  questions?: QuizQuestion[];
  // SIMULATION lessons
  simulation?: SimulationConfig;
  // REFLECTION lessons
  reflectionPrompt?: string;
  keyInsight?: string;
}

export interface Module {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  xpReward: number;
  levelColor: string; // LV1-LV7 color
  levelLabel: string;
  icon: string;
  lessons: Lesson[];
}

// ─── Level Colors ─────────────────────────────────────────────────────────────
export const LEVEL_COLORS = [
  "#EF4444", // LV1 红
  "#F97316", // LV2 橙
  "#EAB308", // LV3 黄
  "#22C55E", // LV4 绿
  "#3B82F6", // LV5 蓝
  "#6366F1", // LV6 靛
  "#A855F7", // LV7 紫
];

export const LEVEL_LABELS = [
  "LV1 启程",
  "LV2 探索",
  "LV3 构建",
  "LV4 成长",
  "LV5 资本化",
  "LV6 策略化",
  "LV7 升维",
];

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

// ─── Course Modules ───────────────────────────────────────────────────────────

export const CAPITAL_LAUNCH_MODULES: Module[] = [
  // ── MODULE 1 ───────────────────────────────────────────────────────────────
  {
    id: "m1",
    slug: "what-is-capital",
    order: 1,
    title: "什么是资本运作",
    subtitle: "穿越时间，回到资本诞生的那一刻",
    description: "跟随17世纪的荷兰商人，亲历世界第一家股份公司的诞生，理解资本的真正含义。",
    xpReward: 100,
    levelColor: LEVEL_COLORS[0],
    levelLabel: LEVEL_LABELS[0],
    icon: "⚓",
    lessons: [
      {
        id: "m1-l1",
        slug: "east-india-story",
        title: "1602年，阿姆斯特丹港口",
        subtitle: "世界第一家股份公司的诞生",
        type: "STORY",
        xpReward: 30,
        durationMin: 4,
        character: {
          name: "Jacob van Meer",
          role: "东印度公司创始人",
          avatar: "🎩",
          era: "1602年 · 荷兰阿姆斯特丹",
        },
        scene: {
          bg: "linear-gradient(135deg, #1a0a00 0%, #3d1f00 50%, #1a0a00 100%)",
          accent: "#C9A84C",
          icon: "⚓",
          name: "航海时代 · 阿姆斯特丹港口",
        },
        slides: [
          {
            id: "s1",
            text: "1602年，阿姆斯特丹港口。\n烛光摇曳，香料的气味飘散在空气中。",
            visual: "🕯️",
            highlight: "1602年",
          },
          {
            id: "s2",
            text: "我是 Jacob van Meer，一个商人。\n我有一个问题：\n香料贸易暴利，但一艘船的成本，我一个人负担不起。",
            visual: "🚢",
          },
          {
            id: "s3",
            text: "于是我们想出了一个前所未有的方法——\n把这艘船，分成 1000 份。\n每个人买一份，一起承担风险，一起分享利润。",
            visual: "📄",
            highlight: "把风险和利润，分给所有人",
          },
          {
            id: "s4",
            text: "这，就是世界第一家股份公司——\n荷兰东印度公司（VOC）。\n股票，从这一刻诞生。",
            visual: "🏛️",
            highlight: "VOC · 世界第一家股份公司",
          },
          {
            id: "s5",
            text: "资本运作不是魔法。\n它的本质只有一句话：\n把大项目，变成很多人都能参与的小份额。",
            visual: "💡",
            highlight: "把大项目，变成可分割的份额",
          },
        ],
      },
      {
        id: "m1-l2",
        slug: "capital-quiz-1",
        title: "理解测验",
        subtitle: "你真的懂了吗？",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "荷兰东印度公司（VOC）最重要的创新是什么？",
            options: [
              { id: "a", text: "他们发明了更快的船", correct: false, explanation: "船只技术不是VOC的主要创新。" },
              { id: "b", text: "他们把公司分成股份，让多人参与投资", correct: true, explanation: "正确！VOC发明了现代股份公司制度，让风险和利润可以被分散到多个投资者。" },
              { id: "c", text: "他们垄断了香料的生产", correct: false, explanation: "虽然VOC有垄断权，但这不是它最重要的金融创新。" },
              { id: "d", text: "他们建立了世界第一个银行", correct: false, explanation: "银行在VOC之前就存在了。" },
            ],
          },
          {
            id: "q2",
            question: "资本运作的本质是：",
            options: [
              { id: "a", text: "让有钱人变得更有钱", correct: false },
              { id: "b", text: "炒股票赚差价", correct: false },
              { id: "c", text: "把大项目，变成多人可以参与的小份额", correct: true, explanation: "资本运作让大型项目可以被分解，让更多人参与，共担风险，共享回报。" },
              { id: "d", text: "向银行贷款做生意", correct: false },
            ],
          },
        ],
      },
      {
        id: "m1-l3",
        slug: "capital-reflection-1",
        title: "你的第一个资本思维",
        subtitle: "把认知内化",
        type: "REFLECTION",
        xpReward: 20,
        durationMin: 2,
        keyInsight: "资本不是钱。资本是让钱流动、让项目发生的机制。",
        reflectionPrompt: "想想你身边有没有什么事情，可以用「把它分成小份额，让多人参与」的方式来做？",
      },
    ],
  },

  // ── MODULE 2 ───────────────────────────────────────────────────────────────
  {
    id: "m2",
    slug: "capital-logic",
    order: 2,
    title: "资本底层逻辑",
    subtitle: "资本不是钱，而是流动",
    description: "理解资本的四个核心要素：项目、投资者、时间、流动性。",
    xpReward: 100,
    levelColor: LEVEL_COLORS[1],
    levelLabel: LEVEL_LABELS[1],
    icon: "⚡",
    lessons: [
      {
        id: "m2-l1",
        slug: "capital-flow-story",
        title: "资本的四个秘密",
        subtitle: "为什么有人手上有钱，却无法资本化？",
        type: "STORY",
        xpReward: 30,
        durationMin: 4,
        character: {
          name: "Sophia Chen",
          role: "资本分析师",
          avatar: "👩‍💼",
          era: "现代 · 上海金融区",
        },
        scene: {
          bg: "linear-gradient(135deg, #0a0a2e 0%, #1a1a5e 50%, #0a0a2e 100%)",
          accent: "#F97316",
          icon: "⚡",
          name: "现代金融世界",
        },
        slides: [
          {
            id: "s1",
            text: "很多人以为，资本 = 钱。\n这是最大的误解。",
            visual: "💰",
            highlight: "资本 ≠ 钱",
          },
          {
            id: "s2",
            text: "资本，是让钱产生价值的「机制」。\n\n没有流动的钱，不是资本。\n流动中的钱，才是资本。",
            visual: "🌊",
            highlight: "流动中的钱，才是资本",
          },
          {
            id: "s3",
            text: "资本运作有四个核心要素：\n\n① 项目（Project）\n② 投资者（Investor）\n③ 时间（Time）\n④ 流动性（Liquidity）",
            visual: "🔑",
            highlight: "项目 · 投资者 · 时间 · 流动性",
          },
          {
            id: "s4",
            text: "缺少任何一个，资本就无法运作。\n\n有项目、没投资者？→ 死局。\n有钱、没项目？→ 钱在睡觉。\n有投资、没流动性？→ 钱被锁死。",
            visual: "🔗",
          },
          {
            id: "s5",
            text: "所以资本家的工作，\n就是让这四个要素完美对接——\n让钱，持续地「流动」。",
            visual: "♾️",
            highlight: "让四个要素完美对接",
          },
        ],
      },
      {
        id: "m2-l2",
        slug: "capital-logic-quiz",
        title: "资本逻辑测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "以下哪个描述最准确地定义了「资本」？",
            options: [
              { id: "a", text: "银行账户里的存款余额", correct: false },
              { id: "b", text: "让钱产生价值并持续流动的机制", correct: true, explanation: "资本的核心是流动性和价值创造，而不仅仅是静态的钱。" },
              { id: "c", text: "公司的固定资产总值", correct: false },
              { id: "d", text: "政府发行的货币总量", correct: false },
            ],
          },
          {
            id: "q2",
            question: "一个人有1000万现金，但不做任何投资，这笔钱是「资本」吗？",
            options: [
              { id: "a", text: "是，因为金额很大", correct: false },
              { id: "b", text: "是，只要有钱就是资本", correct: false },
              { id: "c", text: "不是，没有流动的钱不是资本", correct: true, explanation: "资本必须「流动」才能产生价值。静止的钱只是储蓄，不是资本运作。" },
              { id: "d", text: "取决于货币种类", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 3 ───────────────────────────────────────────────────────────────
  {
    id: "m3",
    slug: "ipo-fundraising",
    order: 3,
    title: "IPO 与融资",
    subtitle: "IPO 不是终点，是工具",
    description: "打破「上市就成功」的迷思，理解IPO只是资本工具之一。",
    xpReward: 100,
    levelColor: LEVEL_COLORS[2],
    levelLabel: LEVEL_LABELS[2],
    icon: "📈",
    lessons: [
      {
        id: "m3-l1",
        slug: "ipo-story",
        title: "IPO的真相",
        subtitle: "大多数人对IPO的理解是错的",
        type: "STORY",
        xpReward: 30,
        durationMin: 4,
        character: {
          name: "Marcus Wei",
          role: "投资银行家",
          avatar: "👨‍💼",
          era: "现代 · 纽约华尔街",
        },
        scene: {
          bg: "linear-gradient(135deg, #001a00 0%, #003d00 50%, #001a00 100%)",
          accent: "#EAB308",
          icon: "📈",
          name: "华尔街 · 纽约证券交易所",
        },
        slides: [
          {
            id: "s1",
            text: "很多创业者有一个梦想：\n「我要让公司上市。」\n\n但他们不明白的是——\nIPO 到底是什么？",
            visual: "🏛️",
          },
          {
            id: "s2",
            text: "IPO，Initial Public Offering，\n首次公开募股。\n\n简单来说：\n把公司的一部分，在公开市场卖给公众。",
            visual: "📋",
            highlight: "IPO = 把公司一部分卖给公众",
          },
          {
            id: "s3",
            text: "问题来了：\n上市，只是融资的方式之一。\n\n天使轮 → A轮 → B轮 → C轮 → IPO\n\n每一轮，都只是「拿钱的方式」不同。",
            visual: "🎯",
            highlight: "IPO 是融资工具，不是终点",
          },
          {
            id: "s4",
            text: "更重要的是：\n很多公司上市之后，反而更难做。\n\n因为你要对「所有股东」负责，\n每个季度都要汇报业绩。",
            visual: "⚠️",
          },
          {
            id: "s5",
            text: "真正的资本思维是：\n选择「适合你阶段」的融资方式，\n而不是一味追求上市。",
            visual: "🧭",
            highlight: "选择适合你阶段的资本工具",
          },
        ],
      },
      {
        id: "m3-l2",
        slug: "ipo-quiz",
        title: "融资认知测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "IPO（首次公开募股）最准确的定义是？",
            options: [
              { id: "a", text: "公司成功的终极标志", correct: false },
              { id: "b", text: "把公司股份在公开市场出售的融资行为", correct: true, explanation: "IPO就是一种融资手段，让公司向公众投资者出售股份换取资金。" },
              { id: "c", text: "政府批准公司合法经营的证明", correct: false },
              { id: "d", text: "公司被收购的过程", correct: false },
            ],
          },
          {
            id: "q2",
            question: "为什么说「IPO不是终点」？",
            options: [
              { id: "a", text: "因为上市需要很多钱", correct: false },
              { id: "b", text: "因为上市后公司就不重要了", correct: false },
              { id: "c", text: "因为IPO只是众多融资方式之一，企业还有更多成长路径", correct: true, explanation: "IPO是资本工具，上市后企业仍需持续经营、创造价值，还要面对股东压力。" },
              { id: "d", text: "因为大多数IPO都失败了", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 4 ───────────────────────────────────────────────────────────────
  {
    id: "m4",
    slug: "pricing-system",
    order: 4,
    title: "报价系统",
    subtitle: "为什么越卖越亏？互动模拟",
    description: "通过互动模拟器，理解固定成本、变动成本、利润和折扣的关系。",
    xpReward: 120,
    levelColor: LEVEL_COLORS[2],
    levelLabel: LEVEL_LABELS[2],
    icon: "💰",
    lessons: [
      {
        id: "m4-l1",
        slug: "pricing-story",
        title: "为什么越卖越亏",
        subtitle: "成本的秘密",
        type: "STORY",
        xpReward: 25,
        durationMin: 3,
        character: {
          name: "Lily Zhang",
          role: "餐饮创业者",
          avatar: "👩‍🍳",
          era: "现代 · 上海",
        },
        scene: {
          bg: "linear-gradient(135deg, #1a0010 0%, #3d0020 50%, #1a0010 100%)",
          accent: "#EF4444",
          icon: "💰",
          name: "餐厅 · 成本分析",
        },
        slides: [
          {
            id: "s1",
            text: "Lily 开了一家奶茶店。\n每杯卖 25 块。\n第一个月，卖了 1000 杯。\n\n她以为赚了 25,000 块。",
            visual: "🧋",
          },
          {
            id: "s2",
            text: "但实际上——\n\n原料成本：8,000\n租金：6,000\n人工：5,000\n水电杂费：2,000\n\n总成本：21,000",
            visual: "📊",
            highlight: "成本比你想象的多得多",
          },
          {
            id: "s3",
            text: "利润只有 4,000 块。\n\n但这个月她还打了 8 折促销，\n实际收入只有 20,000。\n\n她亏了！",
            visual: "😱",
            highlight: "折扣吃掉了所有利润",
          },
          {
            id: "s4",
            text: "这就是「变动成本」和「固定成本」的陷阱。\n\n固定成本（租金、人工）：不管你卖多少，都要付。\n变动成本（原料）：卖多少，付多少。",
            visual: "⚖️",
            highlight: "固定成本 vs 变动成本",
          },
          {
            id: "s5",
            text: "真正的报价公式：\n\n价格 = 变动成本 + 固定成本分摊 + 利润目标 + 风险溢价\n\n接下来，你来试试。",
            visual: "🧮",
            highlight: "每个定价背后，都有逻辑",
          },
        ],
      },
      {
        id: "m4-l2",
        slug: "pricing-simulation",
        title: "报价模拟器",
        subtitle: "拖动滑块，看利润变化",
        type: "SIMULATION",
        xpReward: 40,
        durationMin: 5,
        simulation: {
          type: "pricing",
          description: "通过调整固定成本、变动成本、利润目标和折扣，理解报价的逻辑",
        },
      },
      {
        id: "m4-l3",
        slug: "pricing-quiz",
        title: "定价测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "租金属于哪种成本？",
            options: [
              { id: "a", text: "变动成本，随销量变化", correct: false },
              { id: "b", text: "固定成本，不管卖多少都要付", correct: true, explanation: "租金是固定成本，不管你卖1杯还是1000杯，每个月都要支付。" },
              { id: "c", text: "隐性成本，可以忽略", correct: false },
              { id: "d", text: "机会成本", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 5 ───────────────────────────────────────────────────────────────
  {
    id: "m5",
    slug: "kfc-case",
    order: 5,
    title: "KFC 案例",
    subtitle: "炸鸡背后的资本帝国",
    description: "KFC真正厉害的不是炸鸡配方，而是整个产业链的资本化运作。",
    xpReward: 110,
    levelColor: LEVEL_COLORS[3],
    levelLabel: LEVEL_LABELS[3],
    icon: "🍗",
    lessons: [
      {
        id: "m5-l1",
        slug: "kfc-story",
        title: "KFC 真正卖的不是鸡",
        subtitle: "产业链资本化",
        type: "STORY",
        xpReward: 35,
        durationMin: 5,
        character: {
          name: "David Kim",
          role: "供应链经理",
          avatar: "👨‍🏭",
          era: "现代 · KFC总部",
        },
        scene: {
          bg: "linear-gradient(135deg, #1a0500 0%, #3d1000 50%, #1a0500 100%)",
          accent: "#F97316",
          icon: "🍗",
          name: "工厂 · 供应链 · 连锁网络",
        },
        slides: [
          {
            id: "s1",
            text: "你以为 KFC 是一家炸鸡公司。\n\n错了。\n\nKFC 是一家「资本运作公司」，\n恰好用炸鸡来赚钱。",
            visual: "🍗",
            highlight: "KFC 是资本运作公司",
          },
          {
            id: "s2",
            text: "KFC 的供应链：\n\n鸡种公司 → 饲料公司 → 屠宰场 → 加工厂 → 物流 → 门店\n\n每一个环节，都可以是独立的利润中心。",
            visual: "🏭",
            highlight: "每个环节都是利润中心",
          },
          {
            id: "s3",
            text: "更厉害的是 Franchise 模式：\n\nKFC 把「品牌 + 配方 + 运营系统」打包，\n让加盟商出钱开店，\nKFC 收取品牌费和供应链利润。",
            visual: "🤝",
            highlight: "Franchise = 用别人的钱扩张",
          },
          {
            id: "s4",
            text: "KFC 不需要自己出一分钱开新店，\n却能控制全球数万家门店。\n\n这就是资本杠杆。",
            visual: "⚡",
            highlight: "资本杠杆：用别人的资源扩张",
          },
          {
            id: "s5",
            text: "真正的资本家思维：\n\n不是「我要开多少家店」，\n而是「我要建立什么系统，\n让别人愿意帮我扩张」。",
            visual: "🧠",
            highlight: "建立系统，让别人帮你扩张",
          },
        ],
      },
      {
        id: "m5-l2",
        slug: "kfc-quiz",
        title: "产业链测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "KFC的Franchise（加盟）模式的核心优势是？",
            options: [
              { id: "a", text: "KFC自己控制所有门店，品质更好", correct: false },
              { id: "b", text: "用加盟商的资金扩张，KFC收取品牌费和供应链利润", correct: true, explanation: "Franchise让KFC用极少的自有资本，控制全球数万家门店的扩张。" },
              { id: "c", text: "加盟商帮KFC研发新菜品", correct: false },
              { id: "d", text: "减少食品安全风险", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 6 ───────────────────────────────────────────────────────────────
  {
    id: "m6",
    slug: "apple-iphone",
    order: 6,
    title: "Apple / iPhone 案例",
    subtitle: "真正赚钱的，不是手机",
    description: "揭秘Apple隐藏的盈利模式：电话费分润、App Store生态、服务收入。",
    xpReward: 110,
    levelColor: LEVEL_COLORS[3],
    levelLabel: LEVEL_LABELS[3],
    icon: "📱",
    lessons: [
      {
        id: "m6-l1",
        slug: "apple-story",
        title: "Apple的隐藏盈利模式",
        subtitle: "你买的不只是一部手机",
        type: "STORY",
        xpReward: 35,
        durationMin: 5,
        character: {
          name: "Alex Chen",
          role: "科技企业家",
          avatar: "🧑‍💻",
          era: "现代 · 硅谷",
        },
        scene: {
          bg: "linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)",
          accent: "#3B82F6",
          icon: "📱",
          name: "Apple发布会 · 硅谷",
        },
        slides: [
          {
            id: "s1",
            text: "Apple 每年卖出数亿部 iPhone。\n毛利率高达 40%+。\n\n你以为 Apple 靠卖手机赚钱。\n\n这只是一半真相。",
            visual: "📱",
          },
          {
            id: "s2",
            text: "2008年，iPhone 推出之初，\nApple 与运营商签了一个秘密协议：\n\n运营商负责补贴手机，\nApple 每月分享用户电话费的一部分。",
            visual: "📡",
            highlight: "Apple 分享每月电话费",
          },
          {
            id: "s3",
            text: "然后是 App Store：\n\n每笔 App 销售，Apple 抽取 30%。\n全球数百万开发者，\n每天为 Apple 创造数亿收入。",
            visual: "🏪",
            highlight: "App Store：平台经济的典范",
          },
          {
            id: "s4",
            text: "Apple 的真正资本模式：\n\n① 卖硬件（建立用户基础）\n② 控制生态（App Store, iCloud）\n③ 收取平台税（30%抽成）\n④ 服务收入（Apple Music, TV+）",
            visual: "♻️",
            highlight: "硬件是入口，生态是护城河",
          },
          {
            id: "s5",
            text: "这就是「平台经济」的本质：\n\n不是卖产品，而是建立生态系统，\n让用户和开发者都无法离开，\n然后向每个参与者收费。",
            visual: "🌐",
            highlight: "建立生态，让所有人都离不开你",
          },
        ],
      },
      {
        id: "m6-l2",
        slug: "apple-quiz",
        title: "平台经济测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "Apple的App Store对每笔交易抽取多少比例？",
            options: [
              { id: "a", text: "10%", correct: false },
              { id: "b", text: "20%", correct: false },
              { id: "c", text: "30%", correct: true, explanation: "Apple的App Store长期以来收取30%的平台抽成，这让Apple从数百万开发者的收入中获益。" },
              { id: "d", text: "50%", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 7 ───────────────────────────────────────────────────────────────
  {
    id: "m7",
    slug: "business-exits",
    order: 7,
    title: "企业最终结果",
    subtitle: "关掉、卖掉、合并、上市",
    description: "每家企业都有终点。理解四种退出路径，提前规划你的资本策略。",
    xpReward: 100,
    levelColor: LEVEL_COLORS[4],
    levelLabel: LEVEL_LABELS[4],
    icon: "🚪",
    lessons: [
      {
        id: "m7-l1",
        slug: "exit-story",
        title: "企业的四条出路",
        subtitle: "终点决定了起点的规划",
        type: "STORY",
        xpReward: 30,
        durationMin: 4,
        character: {
          name: "Robert Lin",
          role: "并购顾问",
          avatar: "👴",
          era: "现代",
        },
        scene: {
          bg: "linear-gradient(135deg, #000d1a 0%, #001a3d 50%, #000d1a 100%)",
          accent: "#3B82F6",
          icon: "🚪",
          name: "战略会议室",
        },
        slides: [
          {
            id: "s1",
            text: "每一家公司，最终都会面临一个问题：\n\n「接下来，怎么办？」\n\n只有四条路。",
            visual: "🔀",
          },
          {
            id: "s2",
            text: "① 关掉（Shutdown）\n\n当公司无法继续盈利，\n或者创始人决定停止，\n公司就会清算、关闭。",
            visual: "🔒",
            highlight: "关掉：不是失败，是选择",
          },
          {
            id: "s3",
            text: "② 卖掉（Acquisition）\n\n把公司卖给更大的公司。\n这是很多创始人的「退出」方式。\n\nInstagram 被 Facebook 以 10 亿收购。",
            visual: "🤝",
            highlight: "卖掉：最快的退出路径",
          },
          {
            id: "s4",
            text: "③ 合并（Merger）\n\n两家公司合并成一家，\n增强竞争力或扩大规模。\n\n通常是「强强联合」的策略。",
            visual: "⊕",
            highlight: "合并：1+1>2的策略",
          },
          {
            id: "s5",
            text: "④ 上市（IPO）\n\n你已经知道了——\nIPO 是融资工具，不是终点。\n但它也是退出的方式之一。\n\n聪明的创始人，从第一天就知道自己要走哪条路。",
            visual: "📈",
            highlight: "从创业第一天，就要规划退出",
          },
        ],
      },
      {
        id: "m7-l2",
        slug: "exit-quiz",
        title: "退出策略测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "Instagram以10亿美元被Facebook收购，这属于哪种企业退出方式？",
            options: [
              { id: "a", text: "上市（IPO）", correct: false },
              { id: "b", text: "合并（Merger）", correct: false },
              { id: "c", text: "收购（Acquisition）", correct: true, explanation: "Facebook以10亿美元收购Instagram，这是典型的Acquisition（被收购）退出方式。" },
              { id: "d", text: "清算（Shutdown）", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 8 ───────────────────────────────────────────────────────────────
  {
    id: "m8",
    slug: "pe-ratio",
    order: 8,
    title: "PE Ratio 估值",
    subtitle: "一杯奶茶，教你读懂市盈率",
    description: "从奶茶店案例出发，逐步理解PE Ratio、EPS和企业估值的形成。",
    xpReward: 120,
    levelColor: LEVEL_COLORS[4],
    levelLabel: LEVEL_LABELS[4],
    icon: "📊",
    lessons: [
      {
        id: "m8-l1",
        slug: "pe-story",
        title: "估值是怎么来的",
        subtitle: "从奶茶店到市值",
        type: "STORY",
        xpReward: 35,
        durationMin: 5,
        character: {
          name: "Emma Liu",
          role: "投资分析师",
          avatar: "👩‍📊",
          era: "现代",
        },
        scene: {
          bg: "linear-gradient(135deg, #0a001a 0%, #1a003d 50%, #0a001a 100%)",
          accent: "#6366F1",
          icon: "📊",
          name: "投资分析室",
        },
        slides: [
          {
            id: "s1",
            text: "你的奶茶店，每年净利润 100,000 块。\n\n问：这家店值多少钱？\n\n答案不是 100,000。",
            visual: "🧋",
          },
          {
            id: "s2",
            text: "投资人会问：\n「如果我现在买下这家店，\n几年能回本？」\n\n如果 PE = 10，\n意味着：我愿意付 10年利润的价格。",
            visual: "🤔",
            highlight: "PE = 你愿意付几年利润的价格",
          },
          {
            id: "s3",
            text: "奶茶店年利润 10万，PE = 10：\n估值 = 10万 × 10 = 100万\n\n上市公司年利润 10亿，PE = 30：\n估值 = 10亿 × 30 = 300亿",
            visual: "✖️",
            highlight: "估值 = 利润 × PE Ratio",
          },
          {
            id: "s4",
            text: "为什么不同公司的 PE 不同？\n\n成长快的公司（科技股）PE 高，\n因为投资人相信未来利润会更大。\n\n稳定但不成长的（传统行业）PE 低。",
            visual: "📉📈",
            highlight: "PE反映市场对未来的预期",
          },
          {
            id: "s5",
            text: "EPS（每股盈利）= 公司净利润 ÷ 总股数\n\n股价 = EPS × PE\n\n这就是估值的底层逻辑。\n所有数字，都回归到「利润」。",
            visual: "🔢",
            highlight: "股价 = EPS × PE",
          },
        ],
      },
      {
        id: "m8-l2",
        slug: "pe-simulation",
        title: "估值模拟器",
        subtitle: "输入利润和PE，看估值变化",
        type: "SIMULATION",
        xpReward: 40,
        durationMin: 5,
        simulation: {
          type: "valuation",
          description: "通过调整利润、PE Ratio和股数，理解企业估值的形成",
        },
      },
    ],
  },

  // ── MODULE 9 ───────────────────────────────────────────────────────────────
  {
    id: "m9",
    slug: "spv-structure",
    order: 9,
    title: "SPV 系统",
    subtitle: "特殊目的公司的资本魔法",
    description: "理解SPV如何让投资人集资、如何控制集团结构、以及股权稀释的动态变化。",
    xpReward: 120,
    levelColor: LEVEL_COLORS[5],
    levelLabel: LEVEL_LABELS[5],
    icon: "🏗️",
    lessons: [
      {
        id: "m9-l1",
        slug: "spv-story",
        title: "SPV：资本结构的积木",
        subtitle: "为什么要用「特殊目的公司」？",
        type: "STORY",
        xpReward: 35,
        durationMin: 5,
        character: {
          name: "William Tan",
          role: "私募基金经理",
          avatar: "🧑‍⚖️",
          era: "现代 · 新加坡",
        },
        scene: {
          bg: "linear-gradient(135deg, #001400 0%, #002800 50%, #001400 100%)",
          accent: "#6366F1",
          icon: "🏗️",
          name: "新加坡 · 基金结构图",
        },
        slides: [
          {
            id: "s1",
            text: "假设你发现了一个投资机会：\n需要投入 1000 万。\n\n你只有 100 万。怎么办？",
            visual: "💡",
          },
          {
            id: "s2",
            text: "答案：成立一个 SPV。\n\nSPV = Special Purpose Vehicle\n特殊目的公司\n\n专门为「这个项目」成立的公司。",
            visual: "🏢",
            highlight: "SPV：专为单一项目成立的公司",
          },
          {
            id: "s3",
            text: "你找来 9 个投资人，\n每人投 100 万进 SPV。\n\nSPV 代表所有人，以 1000 万投资目标项目。\n\n回报，按比例分配。",
            visual: "👥",
            highlight: "SPV汇集多个投资人的资金",
          },
          {
            id: "s4",
            text: "SPV 的好处：\n\n① 法律隔离：SPV 失败，不影响母公司\n② 融资灵活：每个项目单独融资\n③ 税务优化：在适合的地区注册\n④ 退出清晰：项目结束，SPV 解散",
            visual: "🛡️",
            highlight: "SPV：风险隔离 + 结构灵活",
          },
          {
            id: "s5",
            text: "大型集团公司，\n往往有数十甚至数百个 SPV，\n分别控制不同资产。\n\n这就是资本结构的「积木」。",
            visual: "🧩",
            highlight: "集团 = 多个SPV的组合",
          },
        ],
      },
      {
        id: "m9-l2",
        slug: "spv-quiz",
        title: "SPV测验",
        subtitle: "",
        type: "QUIZ",
        xpReward: 20,
        durationMin: 2,
        questions: [
          {
            id: "q1",
            question: "SPV（特殊目的公司）最主要的用途是？",
            options: [
              { id: "a", text: "逃避税务", correct: false },
              { id: "b", text: "为单一项目汇集多个投资人的资金，并实现法律风险隔离", correct: true, explanation: "SPV的核心价值是汇集资金和隔离风险，让大型项目可以通过多个小投资人完成。" },
              { id: "c", text: "替代股票市场", correct: false },
              { id: "d", text: "管理员工薪酬", correct: false },
            ],
          },
        ],
      },
    ],
  },

  // ── MODULE 10 ──────────────────────────────────────────────────────────────
  {
    id: "m10",
    slug: "future-valuation",
    order: 10,
    title: "未来估值法",
    subtitle: "用未来的钱，解释今天的价值",
    description: "互动工具：输入利润、店铺数量和PE，系统自动生成企业估值、融资金额和稀释比例。",
    xpReward: 130,
    levelColor: LEVEL_COLORS[5],
    levelLabel: LEVEL_LABELS[5],
    icon: "🔭",
    lessons: [
      {
        id: "m10-l1",
        slug: "future-val-story",
        title: "为什么亏损的公司值数十亿",
        subtitle: "未来利润的现在价值",
        type: "STORY",
        xpReward: 30,
        durationMin: 4,
        character: {
          name: "Kevin Zhao",
          role: "风险投资人",
          avatar: "💼",
          era: "现代 · 北京中关村",
        },
        scene: {
          bg: "linear-gradient(135deg, #0a000f 0%, #1a001f 50%, #0a000f 100%)",
          accent: "#A855F7",
          icon: "🔭",
          name: "VC投资人会议室",
        },
        slides: [
          {
            id: "s1",
            text: "Uber 上市时还在亏损。\n估值却超过 700 亿美元。\n\n这有意义吗？",
            visual: "🚗",
          },
          {
            id: "s2",
            text: "投资人看的不是「现在的利润」，\n而是「未来的利润潜力」。\n\n今天亏损，不代表5年后亏损。\n投资人买的，是未来。",
            visual: "⏩",
            highlight: "投资人买的是未来，不是现在",
          },
          {
            id: "s3",
            text: "未来估值法的逻辑：\n\n① 预测未来3-5年的利润\n② 乘以行业PE Ratio\n③ 得出未来市值\n④ 折现到今天的价值",
            visual: "📐",
            highlight: "未来利润 × PE = 未来市值",
          },
          {
            id: "s4",
            text: "举例：\n今天有10家店，每店年利润50万。\n计划3年后有100家店。\n未来利润 = 5000万。\nPE = 20 → 未来市值 = 10亿。\n\n今天融资，卖出10%，融资1亿。",
            visual: "🏪",
            highlight: "从未来倒推今天的融资价值",
          },
          {
            id: "s5",
            text: "这就是为什么创业者能用「故事」融资。\n\n你卖的不是今天的公司，\n而是「可能的未来」。\n\n接下来，你来算一算。",
            visual: "✨",
            highlight: "融资 = 卖出未来的一部分",
          },
        ],
      },
      {
        id: "m10-l2",
        slug: "future-val-simulation",
        title: "估值计算器",
        subtitle: "输入你的数字，系统为你估值",
        type: "SIMULATION",
        xpReward: 50,
        durationMin: 8,
        simulation: {
          type: "valuation",
          description: "输入利润、店铺数、PE Ratio，自动生成企业估值、融资方案和股权稀释",
        },
      },
    ],
  },

  // ── MODULE 11 ──────────────────────────────────────────────────────────────
  {
    id: "m11",
    slug: "capital-growth-path",
    order: 11,
    title: "资本成长路线",
    subtitle: "企业家的七阶之路",
    description: "从启程到升维，完整的资本化成长地图。这是整个平台的核心成长系统。",
    xpReward: 150,
    levelColor: LEVEL_COLORS[6],
    levelLabel: LEVEL_LABELS[6],
    icon: "🚀",
    lessons: [
      {
        id: "m11-l1",
        slug: "seven-stages-story",
        title: "七阶资本家",
        subtitle: "你在哪一阶？",
        type: "STORY",
        xpReward: 40,
        durationMin: 6,
        character: {
          name: "The Capital Navigator",
          role: "资本导航者",
          avatar: "🧭",
          era: "资本世界",
        },
        scene: {
          bg: "linear-gradient(135deg, #0a0015 0%, #15002d 50%, #0a0015 100%)",
          accent: "#A855F7",
          icon: "🚀",
          name: "资本宇宙 · 成长地图",
        },
        slides: [
          {
            id: "s1",
            text: "资本世界有七个阶段。\n\n大多数人，一辈子停在第一阶。\n\n少数人，走到第七阶——\n成为真正的资本家。",
            visual: "🗺️",
          },
          {
            id: "s2",
            text: "LV1 启程：\n理解资本，打破认知局限。\n（你刚刚完成了这一步）\n\nLV2 探索：\n了解行业，找到自己的资本切入点。",
            visual: "🔴🟠",
            highlight: "你已完成 LV1 启程",
          },
          {
            id: "s3",
            text: "LV3 构建：\n建立第一个可复制的商业模型。\n\nLV4 成长：\n引入资本，加速扩张。",
            visual: "🟡🟢",
          },
          {
            id: "s4",
            text: "LV5 资本化：\n让企业具备投资价值，开始融资。\n\nLV6 策略化：\n多元化资本布局，管理投资组合。",
            visual: "🔵🟣",
          },
          {
            id: "s5",
            text: "LV7 升维：\n成为资本本身的一部分——\n用资本创造资本，\nTransform Businesses Into Investable Enterprises.\n\n这，是你的终极目标。",
            visual: "⭐",
            highlight: "Transform Businesses Into Investable Enterprises",
          },
        ],
      },
      {
        id: "m11-l2",
        slug: "final-reflection",
        title: "你的资本宣言",
        subtitle: "完成《资本启航》",
        type: "REFLECTION",
        xpReward: 50,
        durationMin: 3,
        keyInsight: "你已经不再是资本世界的门外汉。你已经理解了资本的底层逻辑、工具和路径。",
        reflectionPrompt: "完成《资本启航》后，你对自己的事业或计划，有什么新的想法？",
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

// Total XP available
export const TOTAL_COURSE_XP = CAPITAL_LAUNCH_MODULES.reduce(
  (sum, m) => sum + m.lessons.reduce((s, l) => s + l.xpReward, 0),
  0
);
