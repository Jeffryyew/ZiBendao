"use client";

import { useActionState } from "react";
import { resendVerification } from "@/app/actions/auth";
import Link from "next/link";

export default function ResendVerificationPage() {
  const [state, action, pending] = useActionState(resendVerification, undefined);

  if (state?.success === "verification_sent") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
              border: "2px solid rgba(201,168,76,0.3)",
              color: "#C9A84C",
            }}
          >
            ✉
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#F5F5F0" }}>验证邮件已发送</h2>
            <p className="text-sm" style={{ color: "#666660" }}>
              请查收你的邮箱，点击链接完成验证。链接 24 小时内有效。
            </p>
          </div>
          <Link href="/login" className="block text-sm" style={{ color: "#C9A84C" }}>
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  if (state?.success === "already_verified") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(76,175,130,0.15), rgba(76,175,130,0.05))",
              border: "2px solid rgba(76,175,130,0.3)",
              color: "#4CAF82",
            }}
          >
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#F5F5F0" }}>邮箱已验证</h2>
            <p className="text-sm" style={{ color: "#666660" }}>你的邮箱已完成验证，可以直接登录。</p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3.5 rounded-xl font-semibold text-sm text-center"
            style={{
              background: "linear-gradient(135deg, #B8943A, #C9A84C, #D4B860)",
              color: "#0D0D0D",
            }}
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ color: "#C9A84C" }}>资本道</span>
          </Link>
          <h1 className="text-xl font-bold mt-6 mb-1" style={{ color: "#F5F5F0" }}>重新发送验证邮件</h1>
          <p className="text-sm" style={{ color: "#666660" }}>输入注册时使用的邮箱，我们将重新发送验证链接。</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide" style={{ color: "#888880" }}>
              邮箱地址
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ backgroundColor: "#111111", border: "1px solid #222222", color: "#F5F5F0" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#C9A84C";
                e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#222222";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {state?.error && (
            <div
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#F87171",
              }}
            >
              <span>✕</span>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: pending ? "#9A7A32" : "linear-gradient(135deg, #B8943A, #C9A84C, #D4B860)",
              color: "#0D0D0D",
              boxShadow: pending ? "none" : "0 2px 12px rgba(201,168,76,0.25)",
            }}
          >
            {pending ? "发送中…" : "发送验证邮件"}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: "#555550" }}>
          <Link href="/login" style={{ color: "#C9A84C" }}>返回登录</Link>
        </p>
      </div>
    </div>
  );
}
