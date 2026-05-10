"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  if (!password) return null;

  const levels = [
    { label: "弱", color: "#EF4444" },
    { label: "一般", color: "#F97316" },
    { label: "良好", color: "#EAB308" },
    { label: "强", color: "#4CAF82" },
  ];
  const level = levels[score - 1] ?? levels[0];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < score ? level.color : "#222222",
            }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: level.color }}>
        密码强度：{level.label}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(
    register,
    undefined as { error?: string; success?: string } | undefined,
  );
  const [showPw, setShowPw] = useState(false);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (state?.success === "verification_sent") setDone(true);
  }, [state?.success]);

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))",
              border: "2px solid rgba(201,168,76,0.3)",
            }}
          >
            ✉
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#F5F5F0" }}>
              请查收验证邮件
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#666660" }}>
              我们已向你的邮箱发送了验证链接。<br />
              点击链接完成验证后即可登录。
            </p>
          </div>
          <div
            className="rounded-xl px-4 py-3 text-xs text-left space-y-1"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A", color: "#555550" }}
          >
            <p>• 链接 24 小时内有效</p>
            <p>• 请检查垃圾邮件文件夹</p>
          </div>
          <Link href="/verify-email/resend" className="block text-sm" style={{ color: "#C9A84C" }}>
            没收到？重新发送
          </Link>
          <Link href="/" className="block text-sm" style={{ color: "#444440" }}>
            返回主页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0A0A0A" }}>
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 px-12 py-14 relative overflow-hidden"
        style={{ backgroundColor: "#0D0D0D", borderRight: "1px solid #1A1A1A" }}
      >
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

        {/* What you get */}
        <div className="relative z-10 space-y-4">
          <p className="text-xs font-medium tracking-widest" style={{ color: "#444440" }}>
            注册即可获得
          </p>
          {[
            { icon: "○", text: "免费体验前3关核心课程内容" },
            { icon: "○", text: "1个基础金融计算工具使用权" },
            { icon: "○", text: "专属学习进度追踪与成就系统" },
            { icon: "○", text: "优先了解最新课程与活动资讯" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#C9A84C" }}>
                {item.icon}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: "#888880" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { value: "500+", label: "学员" },
            { value: "4", label: "专业工具" },
            { value: "13+", label: "课程内容" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(201,168,76,0.04)",
                border: "1px solid rgba(201,168,76,0.1)",
              }}
            >
              <div className="text-lg font-bold font-mono" style={{ color: "#C9A84C" }}>
                {s.value}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#444440" }}>
                {s.label}
              </div>
            </div>
          ))}
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#F5F5F0" }}>
              创建账号
            </h1>
            <p className="text-sm" style={{ color: "#666660" }}>
              免费开始你的金融学习之旅
            </p>
          </div>

          <form action={action} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide" style={{ color: "#888880" }}>
                姓名
              </label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="你的姓名"
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
              <label className="text-xs font-medium tracking-wide" style={{ color: "#888880" }}>
                密码
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="至少8位"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <PasswordStrength password={password} />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: agreed ? "#C9A84C" : "#111111",
                    border: `1px solid ${agreed ? "#C9A84C" : "#333333"}`,
                  }}
                >
                  {agreed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs leading-relaxed" style={{ color: "#555550" }}>
                我同意资本道的{" "}
                <span style={{ color: "#C9A84C" }} className="hover:underline cursor-pointer">
                  服务条款
                </span>{" "}
                与{" "}
                <span style={{ color: "#C9A84C" }} className="hover:underline cursor-pointer">
                  隐私政策
                </span>
              </span>
            </label>

            {/* Error */}
            {state?.error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#F87171",
                }}
              >
                <span className="flex-shrink-0 mt-0.5">✕</span>
                {state.error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending || !agreed}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              style={{
                background:
                  pending || !agreed
                    ? "#9A7A32"
                    : "linear-gradient(135deg, #B8943A, #C9A84C, #D4B860)",
                color: "#0D0D0D",
                boxShadow:
                  pending || !agreed ? "none" : "0 2px 12px rgba(201,168,76,0.25)",
              }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 animate-spin inline-block"
                    style={{ borderColor: "#0D0D0D", borderTopColor: "transparent" }}
                  />
                  注册中…
                </span>
              ) : (
                "免费注册"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
            <span className="text-xs" style={{ color: "#333330" }}>或</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#1A1A1A" }} />
          </div>

          {/* Login link */}
          <p className="text-center text-sm" style={{ color: "#555550" }}>
            已有账号？{" "}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: "#C9A84C" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5E6C8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#C9A84C")}
            >
              立即登录
            </Link>
          </p>

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
