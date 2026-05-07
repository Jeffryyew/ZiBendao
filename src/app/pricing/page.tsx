import Link from "next/link";
import CheckoutButton from "./CheckoutButton";

const PLANS = [
  {
    id: "free",
    name: "免费会员",
    nameEn: "Free Member",
    price: "RM 0",
    period: "",
    description: "体验平台基础功能，适合初步了解资本道。",
    features: [
      "前 2–3 课程关卡",
      "1 个基础计算工具（限次数）",
      "社区访问",
    ],
    cta: "免费注册",
    ctaHref: "/register",
    highlight: false,
    priceId: null,
  },
  {
    id: "student",
    name: "学生会员",
    nameEn: "Student Member",
    price: "RM 1,288",
    period: "/ 年",
    description: "解锁完整课程体系与全部计算工具，开启资本运作之路。",
    features: [
      "全部 4 模块 13+ 课程",
      "全部 4 个专业计算工具",
      "等级成就系统（L1→L2→L3）",
      "学员社群 & 直播答疑",
      "PDF 课件下载",
    ],
    cta: "立即购买",
    ctaHref: null,
    highlight: true,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "",
  },
  {
    id: "client",
    name: "咨询客户",
    nameEn: "Advisory Client",
    price: "面议",
    period: "",
    description: "一对一资本咨询服务，由顾问为您量身定制方案。",
    features: [
      "专属顾问服务",
      "定制化工具权限",
      "电子合约签署",
      "私密客户门户",
      "优先支持",
    ],
    cta: "联系我们",
    ctaHref: "/about",
    highlight: false,
    priceId: null,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
        style={{ backgroundColor: "rgba(13,13,13,0.95)", borderBottom: "1px solid #1A1A1A" }}
      >
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
          资本道
        </Link>
        <div className="flex items-center gap-4">
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

      <div className="pt-28 pb-20 px-4">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
          >
            选择适合您的方案
          </h1>
          <p className="text-base" style={{ color: "#A0A09A" }}>
            从免费体验到专业咨询，资本道为每个阶段提供量身定制的成长路径。
          </p>
        </div>

        {/* Plans grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl p-7 flex flex-col relative"
              style={{
                backgroundColor: plan.highlight ? "#111111" : "#0A0A0A",
                border: plan.highlight ? "1px solid #C9A84C" : "1px solid #1A1A1A",
              }}
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-4 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                >
                  最受欢迎
                </div>
              )}

              <div className="mb-6">
                <div className="text-xs font-medium mb-1" style={{ color: "#666660" }}>{plan.nameEn}</div>
                <div className="text-lg font-bold mb-1" style={{ color: "#F5F5F0" }}>{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold" style={{ color: plan.highlight ? "#C9A84C" : "#F5F5F0" }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm" style={{ color: "#666660" }}>{plan.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#A0A09A" }}>{plan.description}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "#C0C0BC" }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "#C9A84C" }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.priceId !== null && plan.priceId !== "" ? (
                <CheckoutButton priceId={plan.priceId} />
              ) : plan.ctaHref ? (
                <Link
                  href={plan.ctaHref}
                  className="block text-center py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: plan.highlight ? "#C9A84C" : "#1A1A1A",
                    color: plan.highlight ? "#0D0D0D" : "#A0A09A",
                  }}
                >
                  {plan.cta}
                </Link>
              ) : null}
            </div>
          ))}
        </div>

        {/* FAQ note */}
        <p className="text-center text-xs mt-12" style={{ color: "#444440" }}>
          所有价格均以马来西亚令吉 (RM) 计价 · 付款由 Stripe 安全处理 · 如有疑问请
          <a href="https://wa.me/60103210533" target="_blank" rel="noopener noreferrer" className="underline mx-1" style={{ color: "#666660" }}>WhatsApp 咨询</a>
          或发邮件至
          <a href="mailto:info@capitalmastery.net" className="underline mx-1" style={{ color: "#666660" }}>info@capitalmastery.net</a>
        </p>
      </div>
    </div>
  );
}
