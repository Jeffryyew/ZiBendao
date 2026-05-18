import Link from "next/link";
import { getLocale } from "@/lib/i18n";

export default async function PaymentSuccessPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundColor: "#F7F4EF" }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-8"
        style={{ backgroundColor: "rgba(22,163,74,0.08)", border: "2px solid rgba(22,163,74,0.2)", color: "#16A34A" }}
      >

      </div>

      <h1
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}
      >
        {isEn ? "Payment Successful!" : "付款成功！"}
      </h1>
      <p className="text-base mb-2" style={{ color: "#68625C" }}>
        {isEn ? "Welcome to the ZiBenDao student programme." : "欢迎加入资本道学员计划。"}
      </p>
      <p className="text-sm mb-10" style={{ color: "#9A9490" }}>
        {isEn ? "Your account has been upgraded. You can start learning now." : "您的账户已升级为学生会员，现在即可开始学习。"}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/student/dashboard"
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
        >
          {isEn ? "Go to Learning Centre →" : "前往学习中心 →"}
        </Link>
        <Link
          href="/student/tools"
          className="px-8 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#FFFFFF", color: "#68625C", border: "1px solid #E0D9CE" }}
        >
          {isEn ? "Explore Capital Tools" : "探索计算工具"}
        </Link>
      </div>
    </div>
  );
}
