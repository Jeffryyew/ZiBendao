"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(
    login,
    undefined as { error?: string; success?: string; unverified?: boolean } | undefined,
  );
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A0A0A" }}>
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 px-12 py-14 relative overflow-hidden"
        style={{ backgroundColor: "#0D0D0D", borderRight: "1px solid #1A1A1A" }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            transform: "translate(-40%, -40%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)",
            transform: "translate(30%, 30%)",
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <div className="flex items-baseline gap-3">
            <span
              className="text-3xl font-bold tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}
            >
              资本道
            </span>
            <span className="text-sm tracking-widest" style={{ color: "#444440" }}>
              ZIBENDAO
            </span>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "#555550" }}>
            金融教育 · 资本咨询 一体化平台
          </p>
        </Link>

        {/* Feature list */}
        <div className="relative z-10 space-y-6">
          {[
            {
              icon: "◈",
              title: "系统化金融课程",
              desc: "从基础财务分析到高级资本运作，分阶段闯关学习",
            },
            {
              icon: "◈",
              title: "专业计算工具",
              desc: "市值估值、KPI追踪、财务路线图，实战导向",
            },
            {
              icon: "◈",
              title: "一对一咨询服务",
              desc: "企业顾问定制方案，合约在线生成与签署",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="text-lg flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }}>
                {f.icon}
              </span>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "#E0E0D8" }}>
                  {f.title}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "#555550" }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.06), rgba(201,168,76,0.02))",
              border: "1px solid rgba(201,168,76,0.12)",
            }}
          >
            <p className="text-sm italic leading-relaxed" style={{ color: "#888880" }}>
              "知识是最好的资本，方法是最短的捷径。"
            </p>
            <p className="text-xs mt-2" style={{ color: "#444440" }}>— 资本道创始人</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}
            >
              资本道
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#F5F5F0" }}>
              欢迎回来
            </h1>
            <p className="text-sm" style={{ color: "#666660" }}>
              登录你的资本道账号
            </p>
          </div>

          {/* Form */}
          <form action={action} className="space-y-5">
            {/* Email */}
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
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  color: "#F5F5F0",
                }}
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium tracking-wide" style={{ color: "#888880" }}>
                  密码
                </label>
                <button
                  type="button"
                  className="text-xs transition-colors"
                  style={{ color: "#444440" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#444440")}
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-4 pr-11 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #222222",
                    color: "#F5F5F0",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#C9A84C";
                    e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.08)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#222222";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded transition-colors select-none"
                  style={{ color: "#444440" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#444440")}
                >
                  {showPw ? "隐藏" : "显示"}
                </button>
              </div>
            </div>

            {/* Error / success */}
            {state?.error && (
              <div
                className="rounded-xl px-4 py-3 text-sm space-y-2"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#F87171",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-0.5">✕</span>
                  {state.error}
                </div>
                {state.unverified && (
                  <a
                    href="/verify-email/resend"
                    className="block text-xs underline"
                    style={{ color: "#FCA5A5" }}
                  >
                    重新发送验证邮件 →
                  </a>
                )}
              </div>
            )}
            {state?.success && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{
                  backgroundColor: "rgba(76,175,130,0.08)",
                  border: "1px solid rgba(76,175,130,0.2)",
                  color: "#4CAF82",
                }}
              >
                <span className="flex-shrink-0 mt-0.5">✓</span>
                {state.success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{
                background: pending
                  ? "#9A7A32"
                  : "linear-gradient(135deg, #B8943A, #C9A84C, #D4B860)",
                color: "#0D0D0D",
                boxShadow: pending ? "none" : "0 2px 12px rgba(201,168,76,0.25)",
              }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin inline-block"
                    style={{ borderColor: "#0D0D0D", borderTopColor: "transparent" }}
                  />
                  登录中…
                </span>
              ) : (
                "登 录"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
            <span className="text-xs" style={{ color: "#333330" }}>或</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: "#555550" }}>
            还没有账号？{" "}
            <Link
              href="/register"
              className="font-medium transition-colors"
              style={{ color: "#C9A84C" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5E6C8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A84C")}
            >
              注册
            </Link>
          </p>

          {/* Back home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs transition-colors"
              style={{ color: "#333330" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#666660")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333330")}
            >
              ← 返回主页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
