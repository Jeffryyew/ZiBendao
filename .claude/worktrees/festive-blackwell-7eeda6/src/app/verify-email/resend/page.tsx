"use client";

import { useActionState } from "react";
import { resendVerification } from "@/app/actions/auth";
import Link from "next/link";

export default function ResendVerificationPage() {
  const [state, action, pending] = useActionState(resendVerification, undefined);

  if (state?.success === "verification_sent") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F4EF" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{ backgroundColor: "#FBF4E4", border: "2px solid rgba(139,101,20,0.2)", color: "#8B6514" }}
          >
            ✉
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1C1814" }}>验证邮件已发送</h2>
            <p className="text-sm" style={{ color: "#68625C" }}>
              请查收你的邮箱，点击链接完成验证。链接 24 小时内有效。
            </p>
          </div>
          <Link href="/login" className="block text-sm" style={{ color: "#8B6514" }}>
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  if (state?.success === "already_verified") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F4EF" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{ backgroundColor: "rgba(22,163,74,0.08)", border: "2px solid rgba(22,163,74,0.25)", color: "#16A34A" }}
          >
            ✓
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1C1814" }}>邮箱已验证</h2>
            <p className="text-sm" style={{ color: "#68625C" }}>你的邮箱已完成验证，可以直接登录。</p>
          </div>
          <Link
            href="/login"
            className="block w-full py-3.5 rounded-xl font-semibold text-sm text-center transition-opacity hover:opacity-85"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F4EF" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>资本道</span>
          </Link>
          <h1 className="text-xl font-bold mt-6 mb-1" style={{ color: "#1C1814" }}>重新发送验证邮件</h1>
          <p className="text-sm" style={{ color: "#68625C" }}>输入注册时使用的邮箱，我们将重新发送验证链接。</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>
              邮箱地址
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
              onFocus={(e) => {
                e.target.style.borderColor = "#C9A84C";
                e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0D9CE";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {state?.error && (
            <div
              className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}
            >
              <span>✕</span>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
            style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
          >
            {pending ? "发送中…" : "发送验证邮件"}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: "#68625C" }}>
          <Link href="/login" style={{ color: "#8B6514" }}>返回登录</Link>
        </p>
      </div>
    </div>
  );
}
