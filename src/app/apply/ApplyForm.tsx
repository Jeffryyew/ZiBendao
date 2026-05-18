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
  callbackUrl: string;
}

const tr = {
  zh: {
    interestedIn: "报名课程",
    name: "姓名", namePh: "您的全名",
    email: "邮箱地址", emailPh: "your@email.com",
    phone: "手机号码", phonePh: "+60 / +86",
    company: "公司名称（可选）", companyPh: "您的公司或企业名称",
    pay: "立即付款 →",
    paying: "跳转中…",
    loginBtn: "登录后付款 →",
    required: "请填写姓名和邮箱",
    payError: "跳转付款失败，请重试",
  },
  en: {
    interestedIn: "Enrolling In",
    name: "Full Name", namePh: "Your full name",
    email: "Email Address", emailPh: "your@email.com",
    phone: "Phone Number", phonePh: "+60 / +1",
    company: "Company (optional)", companyPh: "Your company or business name",
    pay: "Pay Now →",
    paying: "Redirecting…",
    loginBtn: "Log In to Pay →",
    required: "Please enter your name and email",
    payError: "Payment redirect failed, please try again",
  },
};

export default function ApplyForm({ course, isEn, isLoggedIn, callbackUrl }: ApplyFormProps) {
  const lang = isEn ? "en" : "zh";
  const t = tr[lang];
  const courseLabel = COURSE_NAMES[course]?.[lang] ?? course;

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg(t.required);
      return;
    }
    setErrorMsg("");
    setPaying(true);
    try {
      // Save registration info quietly
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, course }),
      });
      // Redirect to Stripe
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "checkout");
      window.location.href = data.url;
    } catch {
      setErrorMsg(t.payError);
      setPaying(false);
    }
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
    <form onSubmit={handlePay} className="space-y-5">
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

      {errorMsg && (
        <p className="text-xs text-center" style={{ color: "#EF4444" }}>{errorMsg}</p>
      )}

      {isLoggedIn ? (
        <button
          type="submit"
          disabled={paying}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
          style={{
            background: "linear-gradient(135deg, #B8943A, #C9A84C)",
            color: "#1C1814",
            opacity: paying ? 0.7 : 1,
          }}
        >
          {paying ? t.paying : t.pay}
        </button>
      ) : (
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="block w-full py-3 rounded-xl text-sm font-semibold text-center transition-opacity hover:opacity-88"
          style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
        >
          {t.loginBtn}
        </Link>
      )}
    </form>
  );
}
