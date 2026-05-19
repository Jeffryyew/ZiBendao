"use client";

import { useState, useTransition } from "react";

const COURSE_LABEL: Record<string, string> = {
  CAPITAL_MAP:  "资本通 (Stage 1)",
  CAPITAL_CODE: "启动资本 (Stage 2)",
  CAPITAL_DAO:  "资本道 (Stage 3)",
};

interface Props {
  studentAccountNo: string | null;
}

type Step = "idle" | "otp";

export default function StudentAccountSection({ studentAccountNo }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [accountNo, setAccountNo] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [linkedCourse, setLinkedCourse] = useState("");
  const [linkedName, setLinkedName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 13px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D4C9B8",
    color: "#1C1814",
  };

  function handleVerify() {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/student-account/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNo: accountNo.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "验证失败"); return; }
      setPhoneMasked(data.phoneMasked);
      setStep("otp");
    });
  }

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const res = await fetch("/api/student-account/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNo: accountNo.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "验证码错误"); return; }
      setLinkedCourse(data.course ?? "");
      setLinkedName(data.holderName ?? "");
      setSuccess(true);
      // Reload page after short delay to reflect new studentAccountNo
      setTimeout(() => window.location.reload(), 1500);
    });
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    marginBottom: "5px",
    color: "#9A9490",
  };

  // Already verified (from server)
  if (studentAccountNo && !success) {
    return (
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
        <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>学员账号</h2>
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.25)" }}>
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
            style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
          >
            已绑定
          </span>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#1C1814" }}>{studentAccountNo}</div>
            <div className="text-xs mt-0.5" style={{ color: "#9A9490" }}>账号已验证，成就徽章由管理员确认后生效</div>
          </div>
        </div>
      </div>
    );
  }

  // Success state (just confirmed)
  if (success) {
    return (
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
        <h2 className="text-base font-semibold" style={{ color: "#1C1814" }}>学员账号</h2>
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: "#F0FFF6", border: "1px solid rgba(34,197,94,0.25)" }}>
          <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>验证成功</span>
          <div>
            <div className="text-sm font-medium" style={{ color: "#1C1814" }}>{accountNo}</div>
            {linkedCourse && <div className="text-xs mt-0.5" style={{ color: "#9A9490" }}>{COURSE_LABEL[linkedCourse] ?? linkedCourse} · {linkedName}</div>}
            <div className="text-xs mt-0.5" style={{ color: "#9A9490" }}>管理员将在核实后确认您的成就徽章</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE" }}>
      <div>
        <h2 className="text-base font-semibold mb-0.5" style={{ color: "#1C1814" }}>学员账号</h2>
        <p className="text-xs" style={{ color: "#9A9490" }}>
          线下课程学员专属。输入账号后系统将发送电话验证码至注册手机。
        </p>
      </div>

      {step === "idle" && (
        <div className="space-y-4">
          <div>
            <label style={labelStyle}>学员账号</label>
            <input
              style={inputStyle}
              placeholder="如：ZBT-2024-001"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && accountNo.trim()) handleVerify(); }}
            />
          </div>
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
          <button
            onClick={handleVerify}
            disabled={isPending || !accountNo.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-85"
            style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
          >
            {isPending ? "查询中…" : "发送验证码"}
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(201,168,76,0.2)", color: "#68625C" }}
          >
            验证码已发送至 <span className="font-mono font-semibold" style={{ color: "#C9A84C" }}>{phoneMasked}</span>，10 分钟内有效
          </div>
          <div>
            <label style={labelStyle}>输入 6 位验证码</label>
            <input
              style={{ ...inputStyle, letterSpacing: "0.25em", fontSize: "18px", textAlign: "center" }}
              placeholder="······"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter" && otp.length === 6) handleConfirm(); }}
            />
          </div>
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => { setStep("idle"); setOtp(""); setError(""); }}
              className="px-4 py-2.5 rounded-xl text-sm"
              style={{ backgroundColor: "#F7F4EF", color: "#68625C", border: "1px solid #E0D9CE" }}
            >
              重新输入账号
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending || otp.length !== 6}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-85"
              style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
            >
              {isPending ? "验证中…" : "确认绑定"}
            </button>
          </div>
          <button
            onClick={handleVerify}
            disabled={isPending}
            className="text-xs w-full text-center"
            style={{ color: "#9A9490" }}
          >
            没收到？重新发送
          </button>
        </div>
      )}
    </div>
  );
}
