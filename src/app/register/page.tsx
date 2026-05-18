"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { sendOtp } from "@/app/actions/auth";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" className="flex-shrink-0">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 13.952 17.64 11.644 17.64 9.2z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export default function RegisterPage() {
  const [step, setStep] = useState<"buttons" | "email">("buttons");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [remember, setRemember] = useState(true);

  const inputStyle = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E0D9CE",
    color: "#1C1814",
  };

  function handleGoogle() {
    signIn("google", { callbackUrl: "/dashboard" });
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendOtp(email);
      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = `/login/otp?email=${encodeURIComponent(email)}&remember=${remember ? "1" : "0"}`;
      }
    });
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
            <span className="text-3xl font-bold tracking-wide" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>资本道</span>
            <span className="text-sm tracking-widest" style={{ color: "#9A9490" }}>ZIBENDAO</span>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "#9A9490" }}>金融教育 · 资本咨询 一体化平台</p>
        </Link>

        <div className="space-y-4">
          <p className="text-xs font-medium tracking-widest" style={{ color: "#9A9490" }}>注册即可获得</p>
          {[
            "免费体验前3关核心课程内容",
            "1个基础资本工具使用权",
            "专属学习进度追踪与成就系统",
            "优先了解最新课程与活动资讯",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#8B6514" }}></span>
              <span className="text-sm leading-relaxed" style={{ color: "#68625C" }}>{item}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[{ value: "500+", label: "学员" }, { value: "4", label: "专业工具" }, { value: "13+", label: "课程内容" }].map((s) => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.12)" }}>
              <div className="text-lg font-bold font-mono" style={{ color: "#8B6514" }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9A9490" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-8 text-center">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>资本道</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#1C1814" }}>创建账号</h1>
            <p className="text-sm" style={{ color: "#68625C" }}>免费开始你的资本成长之旅</p>
          </div>

          {step === "buttons" && (
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#1C1814" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C0B8B0"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(28,24,20,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E0D9CE"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
              >
                <GoogleIcon />
                使用 Google 继续
              </button>

              {/* Email */}
              <button
                onClick={() => setStep("email")}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#2A2420"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1C1814"; }}
              >
                <EmailIcon />
                使用邮箱继续
              </button>

              <p className="text-xs text-center pt-1" style={{ color: "#9A9490" }}>
                无需密码，我们将发送验证码至你的邮箱。
              </p>
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => { setStep("buttons"); setError(""); }}
                className="flex items-center gap-1.5 text-xs mb-2"
                style={{ color: "#9A9490" }}
              >
                ← 返回
              </button>
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>邮箱地址</label>
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E0D9CE"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>
                  <span className="flex-shrink-0"></span>{error}
                </div>
              )}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#C9A84C" }}
                />
                <span className="text-sm" style={{ color: "#68625C" }}>保持登入</span>
              </label>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: "#1C1814", color: "#F7F4EF" }}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 animate-spin inline-block" style={{ borderColor: "#F7F4EF", borderTopColor: "transparent" }} />
                    发送中…
                  </span>
                ) : "发送验证码"}
              </button>
              <p className="text-xs text-center" style={{ color: "#9A9490" }}>
                已有账号？{" "}
                <Link href="/login" style={{ color: "#8B6514" }}>直接登录</Link>
              </p>
            </form>
          )}

          {step === "buttons" && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
                <span className="text-xs" style={{ color: "#C0B8B0" }}>或</span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
              </div>
              <p className="text-center text-sm" style={{ color: "#68625C" }}>
                已有账号？{" "}
                <Link href="/login" className="font-medium" style={{ color: "#8B6514" }}>立即登录</Link>
              </p>
            </>
          )}

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs" style={{ color: "#9A9490" }}>← 返回主页</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
