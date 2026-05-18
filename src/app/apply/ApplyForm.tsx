"use client";

import { useState } from "react";
import Link from "next/link";

const COURSE_NAMES: Record<string, { zh: string; en: string }> = {
  "capital-map":  { zh: "资本通 · 阶段一", en: "The Capital Map · Stage 1" },
  "capital-code": { zh: "启动资本 · 阶段二", en: "The Capital Code · Stage 2" },
  "capital-dao":  { zh: "资本道 · 阶段三", en: "Capital Dao · Stage 3" },
};

interface ApplyFormProps {
  course: string;
  isEn: boolean;
  isLoggedIn: boolean;
}

const tr = {
  zh: {
    name: "姓名", namePh: "您的全名",
    email: "邮箱地址", emailPh: "your@email.com",
    phone: "手机号码", phonePh: "+60 / +86",
    company: "公司名称（可选）", companyPh: "您的公司或企业名称",
    message: "留言（可选）", messagePh: "您的问题或期望，帮助我们更好地为您服务",
    interestedIn: "申请课程",
    submitOnly: "提交申请",
    submitAndPay: "申请并付款 →",
    submitting: "处理中…",
    orDivider: "或",
    loginHint: "付款需要先登录账号",
    loginBtn: "前往登录",
    successTitle: "申请已提交",
    successDesc: "感谢您的申请！我们的顾问团队将在 1-2 个工作日内与您联系。",
    required: "请填写姓名和邮箱",
    applyError: "提交失败，请重试",
    payError: "跳转付款失败，请重试",
  },
  en: {
    name: "Full Name", namePh: "Your full name",
    email: "Email Address", emailPh: "your@email.com",
    phone: "Phone Number", phonePh: "+60 / +1",
    company: "Company (optional)", companyPh: "Your company or business name",
    message: "Message (optional)", messagePh: "Your questions or goals — help us serve you better",
    interestedIn: "Applying For",
    submitOnly: "Submit Application",
    submitAndPay: "Apply & Pay Now →",
    submitting: "Processing…",
    orDivider: "or",
    loginHint: "Payment requires an account",
    loginBtn: "Log In",
    successTitle: "Application Received",
    successDesc: "Thank you! Our team will contact you within 1-2 business days.",
    required: "Please enter your name and email",
    applyError: "Submission failed, please try again",
    payError: "Payment redirect failed, please try again",
  },
};

type ActionStatus = "idle" | "submitting" | "paying" | "success" | "error";

export default function ApplyForm({ course, isEn, isLoggedIn }: ApplyFormProps) {
  const lang = isEn ? "en" : "zh";
  const t = tr[lang];
  const courseLabel = COURSE_NAMES[course]?.[lang] ?? course;

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [status, setStatus] = useState<ActionStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const busy = status === "submitting" || status === "paying";

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function validate() {
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg(t.required);
      return false;
    }
    setErrorMsg("");
    return true;
  }

  async function submitInquiry() {
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, course }),
    });
    if (!res.ok) throw new Error("apply");
  }

  async function handleSubmitOnly(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      await submitInquiry();
      setStatus("success");
    } catch {
      setErrorMsg(t.applyError);
      setStatus("error");
    }
  }

  async function handlePay(e: React.MouseEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("paying");
    try {
      await submitInquiry();
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "checkout");
      window.location.href = data.url;
    } catch {
      setErrorMsg(t.payError);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-16">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
          style={{ backgroundColor: "rgba(139,101,20,0.08)", border: "2px solid rgba(139,101,20,0.2)", color: "#8B6514" }}
        >
          ✓
        </div>
        <h2 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "#1C1814" }}>
          {t.successTitle}
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "#68625C" }}>
          {t.successDesc}
        </p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E0D9CE",
    color: "#1C1814",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "6px",
    color: "#68625C",
  };

  return (
    <form onSubmit={handleSubmitOnly} className="space-y-5">
      {/* Course badge */}
      <div>
        <label style={labelStyle}>{t.interestedIn}</label>
        <div
          className="px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)" }}
        >
          {courseLabel}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelStyle}>{t.name} <span style={{ color: "#C9A84C" }}>*</span></label>
          <input type="text" required placeholder={t.namePh} value={form.name} onChange={set("name")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t.email} <span style={{ color: "#C9A84C" }}>*</span></label>
          <input type="email" required placeholder={t.emailPh} value={form.email} onChange={set("email")} style={inputStyle} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelStyle}>{t.phone}</label>
          <input type="tel" placeholder={t.phonePh} value={form.phone} onChange={set("phone")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t.company}</label>
          <input type="text" placeholder={t.companyPh} value={form.company} onChange={set("company")} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>{t.message}</label>
        <textarea placeholder={t.messagePh} value={form.message} onChange={set("message")} rows={4} style={{ ...inputStyle, resize: "none" }} />
      </div>

      {errorMsg && (
        <p className="text-xs text-center" style={{ color: "#EF4444" }}>{errorMsg}</p>
      )}

      {/* Action buttons */}
      <div className="space-y-3 pt-1">
        {/* Primary: pay */}
        {isLoggedIn ? (
          <button
            type="button"
            onClick={handlePay}
            disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
            style={{
              background: "linear-gradient(135deg, #B8943A, #C9A84C)",
              color: "#1C1814",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {status === "paying" ? t.submitting : t.submitAndPay}
          </button>
        ) : (
          <div
            className="w-full py-3 rounded-xl text-sm text-center"
            style={{ backgroundColor: "#FBF4E4", border: "1px solid rgba(139,101,20,0.2)" }}
          >
            <span className="text-xs" style={{ color: "#9A9490" }}>{t.loginHint} — </span>
            <Link href="/login" className="text-xs font-medium" style={{ color: "#8B6514" }}>
              {t.loginBtn}
            </Link>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
          <span className="text-xs" style={{ color: "#C0B8B0" }}>{t.orDivider}</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#E0D9CE" }} />
        </div>

        {/* Secondary: inquiry only */}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl text-sm font-medium transition-opacity"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0D9CE",
            color: "#68625C",
            opacity: busy ? 0.7 : 1,
          }}
        >
          {status === "submitting" ? t.submitting : t.submitOnly}
        </button>
      </div>
    </form>
  );
}
