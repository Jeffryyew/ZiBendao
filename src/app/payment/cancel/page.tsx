import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundColor: "#F7F4EF" }}
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-8"
        style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "2px solid rgba(239,68,68,0.15)", color: "#DC2626" }}
      >
        
      </div>

      <h1
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}
      >
        付款已取消
      </h1>
      <p className="text-base mb-2" style={{ color: "#68625C" }}>
        您的付款已被取消，账户未产生任何费用。
      </p>
      <p className="text-sm mb-10" style={{ color: "#9A9490" }}>
        如有疑问，欢迎联系我们的顾问团队。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/courses"
          className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-85"
          style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
        >
          查看课程
        </Link>
        <Link
          href="/"
          className="px-8 py-3 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#FFFFFF", color: "#68625C", border: "1px solid #E0D9CE" }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
