import { verifyEmailToken } from "@/app/actions/auth";
import Link from "next/link";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <Result icon="✕" color="#DC2626" title="链接无效" message="验证链接缺少必要参数。" showResend />;
  }

  const result = await verifyEmailToken(token);

  if (!result.success) {
    return (
      <Result
        icon="✕"
        color="#DC2626"
        title="验证失败"
        message={result.error ?? "链接无效或已失效。"}
        showResend
      />
    );
  }

  return (
    <Result
      icon="✓"
      color="#16A34A"
      title="邮箱验证成功！"
      message="你的账号已激活，现在可以登录使用资本道了。"
      cta={{ href: "/login", label: "立即登录" }}
    />
  );
}

function Result({
  icon,
  color,
  title,
  message,
  cta,
  showResend,
}: {
  icon: string;
  color: string;
  title: string;
  message: string;
  cta?: { href: string; label: string };
  showResend?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F4EF" }}>
      <div className="w-full max-w-sm text-center space-y-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl"
          style={{
            backgroundColor: `${color}12`,
            border: `2px solid ${color}30`,
            color,
          }}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#1C1814" }}>{title}</h2>
          <p className="text-sm" style={{ color: "#68625C" }}>{message}</p>
        </div>

        {cta && (
          <Link
            href={cta.href}
            className="block w-full py-3.5 rounded-xl font-semibold text-sm text-center transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            {cta.label}
          </Link>
        )}

        {showResend && (
          <Link
            href="/verify-email/resend"
            className="block text-sm"
            style={{ color: "#8B6514" }}
          >
            重新发送验证邮件 →
          </Link>
        )}

        <Link href="/" className="block text-sm" style={{ color: "#9A9490" }}>
          返回主页
        </Link>
      </div>
    </div>
  );
}
