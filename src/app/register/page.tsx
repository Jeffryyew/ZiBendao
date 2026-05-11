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
    { label: "强", color: "#16A34A" },
  ];
  const level = levels[score - 1] ?? levels[0];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < score ? level.color : "#E0D9CE" }}
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
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F7F4EF" }}>
        <div className="w-full max-w-sm text-center space-y-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl"
            style={{ backgroundColor: "#FBF4E4", border: "2px solid rgba(139,101,20,0.2)" }}
          >
            ✉
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#1C1814" }}>
              请查收验证邮件
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
              我们已向你的邮箱发送了验证链接。<br />
              点击链接完成验证后即可登录。
            </p>
          </div>
          <div
            className="rounded-xl px-4 py-3 text-xs text-left space-y-1"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#68625C" }}
          >
            <p>• 链接 24 小时内有效</p>
            <p>• 请检查垃圾邮件文件夹</p>
          </div>
          <Link href="/verify-email/resend" className="block text-sm" style={{ color: "#8B6514" }}>
            没收到？重新发送
          </Link>
          <Link href="/" className="block text-sm" style={{ color: "#9A9490" }}>
            返回主页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F7F4EF" }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 px-12 py-14"
        style={{ backgroundColor: "#FFFFFF", borderRight: "1px solid #E0D9CE" }}
      >
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

        {/* What you get */}
        <div className="space-y-4">
          <p className="text-xs font-medium tracking-widest" style={{ color: "#9A9490" }}>
            注册即可获得
          </p>
          {[
            { icon: "○", text: "免费体验前3关核心课程内容" },
            { icon: "○", text: "1个基础金融计算工具使用权" },
            { icon: "○", text: "专属学习进度追踪与成就系统" },
            { icon: "○", text: "优先了解最新课程与活动资讯" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#8B6514" }}>{item.icon}</span>
              <span className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "500+", label: "学员" },
            { value: "4", label: "专业工具" },
            { value: "13+", label: "课程内容" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.12)" }}
            >
              <div className="text-lg font-bold font-mono" style={{ color: "#8B6514" }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9A9490" }}>{s.label}</div>
            </div>
          ))}
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
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#1C1814" }}>创建账号</h1>
            <p className="text-sm" style={{ color: "#68625C" }}>免费开始你的金融学习之旅</p>
          </div>

          <form action={action} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>姓名</label>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="你的姓名"
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

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>邮箱地址</label>
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
              <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>密码</label>
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
                    backgroundColor: agreed ? "#1C1814" : "#FFFFFF",
                    border: `1px solid ${agreed ? "#1C1814" : "#E0D9CE"}`,
                  }}
                >
                  {agreed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#F7F4EF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs leading-relaxed" style={{ color: "#68625C" }}>
                我同意资本道的{" "}
                <span style={{ color: "#8B6514" }} className="hover:underline cursor-pointer">服务条款</span>{" "}
                与{" "}
                <span style={{ color: "#8B6514" }} className="hover:underline cursor-pointer">隐私政策</span>
              </span>
            </label>

            {/* Error */}
            {state?.error && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}
              >
                <span className="flex-shrink-0 mt-0.5">✕</span>
                {state.error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={pending || !agreed}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
              style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 animate-spin inline-block"
                    style={{ borderColor: "#F7F4EF", borderTopColor: "transparent" }}
                  />
                  注册中…
                </span>
              ) : (
                "注册"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
            <span className="text-xs" style={{ color: "#C0B8B0" }}>或</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
          </div>

          {/* Login link */}
          <p className="text-center text-sm" style={{ color: "#68625C" }}>
            已有账号？{" "}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: "#8B6514" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1C1814")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8B6514")}
            >
              立即登录
            </Link>
          </p>

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
