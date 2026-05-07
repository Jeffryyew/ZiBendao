import Link from "next/link";

const TEAM = [
  {
    name: "陈伟豪",
    nameEn: "Jeffrey Chen",
    role: "创始人 & 首席顾问",
    roleEn: "Founder & Chief Advisor",
    bio: "十五年资本市场经验，专注马来西亚中小企业融资与上市辅导。曾协助逾 40 家企业完成融资规划，管理资产规模超 RM 2 亿。",
    icon: "👨‍💼",
  },
  {
    name: "林美玲",
    nameEn: "Meilin Lim",
    role: "课程总监",
    roleEn: "Head of Curriculum",
    bio: "金融学博士，前大学金融系讲师。擅长将复杂财务理论转化为易懂的实操内容，主导设计资本道全套课程体系。",
    icon: "👩‍🏫",
  },
  {
    name: "张振声",
    nameEn: "Victor Zhang",
    role: "技术总监",
    roleEn: "CTO",
    bio: "全栈工程师，专精金融科技产品开发。负责资本道平台架构设计及全套智能计算工具的研发。",
    icon: "👨‍💻",
  },
];

const VALUES = [
  {
    icon: "🎯",
    title: "专注实用",
    desc: "每一节课、每一个工具都以实际应用为导向，让学员能即学即用。",
  },
  {
    icon: "🔐",
    title: "数据安全",
    desc: "所有客户数据经加密处理，合约及财务信息严格保密，绝不泄露。",
  },
  {
    icon: "📈",
    title: "持续进化",
    desc: "课程内容随市场动态定期更新，确保学员掌握最新的资本运作知识。",
  },
  {
    icon: "🤝",
    title: "共同成长",
    desc: "我们不只是教育平台，更是创业者与投资人之间的桥梁与伙伴。",
  },
];

const MILESTONES = [
  { year: "2020", event: "资本道咨询公司成立，专注马来西亚中小企业资本咨询服务" },
  { year: "2022", event: "推出线下金融培训课程，首批学员超 200 人" },
  { year: "2023", event: "完成数字化转型，上线在线课程平台 Beta 版" },
  { year: "2024", event: "学员突破 1,000 人，新增 4 大专业计算工具" },
  { year: "2025", event: "全面升级平台，推出等级系统、客户门户及电子合约签署" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D", color: "#F5F5F0" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: "rgba(13,13,13,0.95)", borderBottom: "1px solid #1A1A1A" }}
      >
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
          资本道
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "课程", href: "/courses" },
            { label: "工具", href: "/tools" },
            { label: "定价", href: "/pricing" },
            { label: "关于", href: "/about" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="text-sm" style={{ color: "#A0A09A" }}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm" style={{ color: "#A0A09A" }}>登录</Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-xl font-medium"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            免费注册
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-medium px-4 py-1.5 rounded-full mb-6"
            style={{ backgroundColor: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}
          >
            关于我们
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            让每一位创业者
            <br />
            <span style={{ color: "#C9A84C" }}>掌握资本运作之道</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "#A0A09A" }}>
            资本道成立于 2020 年，是马来西亚专注金融教育与资本咨询的综合平台。
            我们相信，财务知识不应只属于少数人——每一位有梦想的创业者都值得拥有专业的资本运作能力。
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-10 text-center"
          style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
        >
          <div className="text-3xl mb-4">✦</div>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}
          >
            我们的使命
          </h2>
          <p className="text-base leading-loose max-w-2xl mx-auto" style={{ color: "#C0C0BC" }}>
            通过系统化的金融教育、智能化的计算工具、以及专业的一对一资本咨询，
            帮助马来西亚中小企业主和创业者建立清晰的财务思维，
            实现从创业到上市的每一个关键跨越。
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            我们的价值观
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: "#F5F5F0" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            核心团队
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl p-7"
                style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
              >
                <div className="text-5xl mb-5">{member.icon}</div>
                <div className="text-xs mb-1" style={{ color: "#666660" }}>{member.nameEn}</div>
                <h3 className="font-bold text-lg mb-0.5" style={{ color: "#F5F5F0" }}>{member.name}</h3>
                <div className="text-xs mb-4" style={{ color: "#C9A84C" }}>{member.role}</div>
                <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            发展历程
          </h2>
          <div className="space-y-0">
            {MILESTONES.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                  >
                    ✦
                  </div>
                  {i < MILESTONES.length - 1 && (
                    <div className="w-px flex-1 my-1" style={{ backgroundColor: "#1A1A1A" }} />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-sm font-bold mb-1" style={{ color: "#C9A84C" }}>{m.year}</div>
                  <p className="text-sm leading-relaxed" style={{ color: "#A0A09A" }}>{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-10"
            style={{ backgroundColor: "#0A0A0A", border: "1px solid #1A1A1A" }}
          >
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
            >
              联系我们
            </h2>
            <p className="text-sm mb-8" style={{ color: "#666660" }}>
              如需咨询课程、定制服务或商务合作，欢迎通过以下方式联系我们的团队。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                { icon: "📧", label: "邮箱", value: "hello@zibendao.com" },
                { icon: "📱", label: "WhatsApp", value: "+60 12-345 6789" },
                { icon: "📍", label: "地址", value: "吉隆坡, 马来西亚" },
              ].map((c) => (
                <div key={c.label}>
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="text-xs mb-1" style={{ color: "#666660" }}>{c.label}</div>
                  <div className="text-sm font-medium" style={{ color: "#C0C0BC" }}>{c.value}</div>
                </div>
              ))}
            </div>
            <Link
              href="/register"
              className="inline-block px-8 py-3 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              立即免费注册 →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: "1px solid #1A1A1A" }}>
        <p className="text-xs" style={{ color: "#444440" }}>
          © 2025 资本道 ZiBenDao. 保留所有权利。
        </p>
      </footer>
    </div>
  );
}
