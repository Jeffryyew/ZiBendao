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
    <div className="min-h-screen flex" style={{ backgroundColor: "#F7F4EF" }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 px-12 py-14"
        style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E0D9CE" }}
      >
        {/* Logo */}
        <Link href="/">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-wide" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
              资本道
            </span>
            <span className="text-sm tracking-widest" style={{ color: "#9A9490" }}>
              ZIBENDAO
            </span>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "#9A9490" }}>
            金融教育 · 资本咨询 一体化平台
          </p>
        </Link>

        {/* Feature list */}
        <div className="space-y-6">
          {[
            { icon: "◈", title: "系统化金融课程", desc: "从基础财务分析到高级资本运作，分阶段闯关学习" },
            { icon: "◈", title: "专业计算工具", desc: "市值估值、KPI追踪、财务路线图，实战导向" },
            { icon: "◈", title: "一对一咨询服务", desc: "企业顾问定制方案，合约在线生成与签署" },
          ].map((f) => (
            <div key={f.title} className="flex gap-4">
              <span className="text-base flex-shrink-0 mt-0.5" style={{ color: "#8B6514" }}>{f.icon}</span>
              <div>
                <div className="text-sm font-semibold mb-0.5" style={{ color: "#1C1814" }}>{f.title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#68625C" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)" }}>
          <p className="text-sm italic leading-relaxed" style={{ color: "#68625C" }}>
            "知识是最好的资本，方法是最短的捷径。"
          </p>
          <p className="text-xs mt-2" style={{ color: "#9A9490" }}>— 资本道创始人</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
              资本道
            </span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#1C1814" }}>欢迎回来</h1>
            <p className="text-sm" style={{ color: "#68625C" }}>登录你的资本道账号</p>
          </div>

          <form action={action} className="space-y-5">
            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>密码</label>
                <button
                  type="button"
                  className="text-xs transition-colors"
                  style={{ color: "#9A9490" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8B6514")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9A9490")}
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
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded transition-colors select-none"
                  style={{ color: "#9A9490" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#8B6514")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9A9490")}
                >
                  {showPw ? "隐藏" : "显示"}
                </button>
              </div>
            </div>

            {/* Error / success */}
            {state?.error && (
              <div
                className="rounded-xl px-4 py-3 text-sm space-y-2"
                style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 mt-0.5">✕</span>
                  {state.error}
                </div>
                {state.unverified && (
                  <a href="/verify-email/resend" className="block text-xs underline" style={{ color: "#DC2626" }}>
                    重新发送验证邮件 →
                  </a>
                )}
              </div>
            )}
            {state?.success && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", color: "#16A34A" }}
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
              style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin inline-block"
                    style={{ borderColor: "#F7F4EF", borderTopColor: "transparent" }}
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
            <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
            <span className="text-xs" style={{ color: "#C0B8B0" }}>或</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: "#68625C" }}>
            还没有账号？{" "}
            <Link
              href="/register"
              className="font-medium transition-colors"
              style={{ color: "#8B6514" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1C1814")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8B6514")}
            >
              注册
            </Link>
          </p>

          {/* Back home */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs transition-colors"
              style={{ color: "#9A9490" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#68625C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9A9490")}
            >
              ← 返回主页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
