"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { sendOtp } from "@/app/actions/auth";
import LogoImg from "@/components/LogoImg";

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

export default function LoginClient({ locale }: { locale: string }) {
  const isEn = locale === "en";
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
        <Link href="/" className="inline-flex flex-col gap-1.5">
          <LogoImg height={36} onLight />
          <p className="text-xs" style={{ color: "#9A9490" }}>{isEn ? "Master the way of capital — build reliable, investable, scalable businesses" : "掌握资本之道，创建可靠、可投、可扩展企业"}</p>
        </Link>
        <div className="space-y-6">
          {[
            { icon: "", title: isEn ? "Structured Courses" : "系统化金融课程", desc: isEn ? "Step-by-step capital mastery from fundamentals to advanced" : "从基础财务分析到高级资本运作，分阶段闯关学习" },
            { icon: "", title: isEn ? "Professional Tools" : "专业计算工具", desc: isEn ? "Valuation, KPI tracking, financial roadmap" : "市值估值、KPI追踪、财务路线图，实战导向" },
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
        <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)" }}>
          <p className="text-sm italic leading-relaxed" style={{ color: "#68625C" }}>{isEn ? `"Knowledge is the best capital; method is the shortest path."` : `"知识是最好的资本，方法是最短的捷径。"`}</p>
          <p className="text-xs mt-2" style={{ color: "#9A9490" }}>{isEn ? "— Founder of ZiBenDao" : "— 资本道创始人"}</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex flex-col items-start gap-1.5">
            <LogoImg height={34} onLight />
            <p className="text-xs" style={{ color: "#9A9490" }}>{isEn ? "Master the way of capital — build reliable, investable, scalable businesses" : "掌握资本之道，创建可靠、可投、可扩展企业"}</p>
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: "#1C1814" }}>
              {isEn ? "Welcome Back" : "欢迎回来"}
            </h1>
            <p className="text-sm" style={{ color: "#68625C" }}>
              {isEn ? "Sign in to your ZiBenDao account" : "登录你的资本道账号"}
            </p>
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
                {isEn ? "Continue with Google" : "使用 Google 继续"}
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
                {isEn ? "Continue with Email" : "使用邮箱继续"}
              </button>

              <p className="text-xs text-center pt-1" style={{ color: "#9A9490" }}>
                {isEn ? "No password needed — we'll send a verification code." : "无需密码，我们将发送验证码至你的邮箱。"}
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
                ← {isEn ? "Back" : "返回"}
              </button>
              <div className="space-y-1.5">
                <label className="text-xs font-medium tracking-wide" style={{ color: "#68625C" }}>
                  {isEn ? "Email address" : "邮箱地址"}
                </label>
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
                <span className="text-sm" style={{ color: "#68625C" }}>{isEn ? "Remember me" : "保持登入"}</span>
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
                    {isEn ? "Sending…" : "发送中…"}
                  </span>
                ) : (isEn ? "Send Code" : "发送验证码")}
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
            <span className="text-xs" style={{ color: "#C0B8B0" }}>{isEn ? "or" : "或"}</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
          </div>

          <Link
            href="/register"
            className="block w-full text-center py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#EEE9E0"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#F7F4EF"; }}
          >
            {isEn ? "No account? Register →" : "还没有账号？注册 →"}
          </Link>

          <div className="mt-8 text-center">
            <Link href="/" className="text-xs" style={{ color: "#9A9490" }}>
              {isEn ? "← Back to home" : "← 返回主页"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
