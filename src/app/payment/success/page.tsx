import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundColor: "#0D0D0D" }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-8"
        style={{ backgroundColor: "rgba(76,175,130,0.15)", border: "1px solid rgba(76,175,130,0.3)" }}
      >
        ✓
      </div>

      <h1
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}
      >
        付款成功！
      </h1>
      <p className="text-base mb-2" style={{ color: "#A0A09A" }}>
        欢迎加入资本道学员计划。
      </p>
      <p className="text-sm mb-10" style={{ color: "#666660" }}>
        您的账户已升级为学生会员，现在即可开始学习。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/student/dashboard"
          className="px-8 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          前往学习中心 →
        </Link>
        <Link
          href="/student/tools"
          className="px-8 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
        >
          探索计算工具
        </Link>
      </div>
    </div>
  );
}
