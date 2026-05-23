"use client";

import { useRef, useState, useTransition, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { sendOtp } from "@/app/actions/auth";

function OtpForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every((d) => d !== "")) {
      submitOtp(next.join(""));
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      submitOtp(pasted);
    }
  }

  function submitOtp(otp: string) {
    setError("");
    startTransition(async () => {
      const result = await signIn("otp", { email, otp, redirect: false });
      if (result?.error) {
        setError("验证码错误或已过期，请重试。");
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        router.push("/dashboard");
      }
    });
  }

  function handleResend() {
    setError("");
    setDigits(["", "", "", "", "", ""]);
    startTransition(async () => {
      await sendOtp(email);
      setResendCooldown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    });
  }

  const inputBase: React.CSSProperties = {
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: 700,
    fontFamily: "monospace",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E0D9CE",
    borderRadius: "12px",
    color: "#1C1814",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: "#F7F4EF" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>资本道</span>
          </Link>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.15)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B6514" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl font-bold mb-2" style={{ color: "#1C1814" }}>输入验证码</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#68625C" }}>
            我们已发送 6 位验证码至<br />
            <span className="font-medium" style={{ color: "#1C1814" }}>{email}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isPending}
              style={inputBase}
              onFocus={(e) => { e.target.style.borderColor = "#C9A84C"; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.12)"; }}
              onBlur={(e) => { e.target.style.borderColor = d ? "#C9A84C" : "#E0D9CE"; e.target.style.boxShadow = "none"; }}
            />
          ))}
        </div>

        {isPending && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm" style={{ color: "#9A9490" }}>
            <span className="w-4 h-4 rounded-full border-2 animate-spin inline-block" style={{ borderColor: "#C9A84C", borderTopColor: "transparent" }} />
            验证中…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm mb-4" style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}>
            <span className="flex-shrink-0">✕</span>{error}
          </div>
        )}

        {/* Resend */}
        <div className="text-center text-sm" style={{ color: "#68625C" }}>
          没收到验证码？{" "}
          {resendCooldown > 0 ? (
            <span style={{ color: "#9A9490" }}>{resendCooldown}s 后重新发送</span>
          ) : (
            <button onClick={handleResend} disabled={isPending} className="font-medium" style={{ color: "#8B6514" }}>
              重新发送
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-xs" style={{ color: "#9A9490" }}>← 返回登录</Link>
        </div>
      </div>
    </div>
  );
}

export default function OtpPage() {
  return (
    <Suspense>
      <OtpForm />
    </Suspense>
  );
}
