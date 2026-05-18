"use client";

import { useState } from "react";
import Link from "next/link";

const COURSE_META: Record<string, { zh: string; en: string; price: string; duration: { zh: string; en: string } }> = {
  "capital-map":  { zh: "资本通 · 阶段一", en: "The Capital Map · Stage 1", price: "RM 2,800",  duration: { zh: "2 天线下课程", en: "2-Day Offline" } },
  "capital-code": { zh: "启动资本 · 阶段二", en: "The Capital Code · Stage 2", price: "RM 7,800",  duration: { zh: "3 天线下课程", en: "3-Day Offline" } },
  "capital-dao":  { zh: "资本道 · 阶段三",  en: "Capital Dao · Stage 3",     price: "RM 38,000", duration: { zh: "5 天线下课程", en: "5-Day Offline" } },
};

interface ApplyFormProps {
  course: string;
  isEn: boolean;
  isLoggedIn: boolean;
  userEmail: string;
  callbackUrl: string;
}

const tr = {
  zh: {
    interestedIn: "报名课程",
    name: "姓名", namePh: "您的全名",
    email: "邮箱地址", emailPh: "your@email.com",
    phone: "手机号码", phonePh: "+60 / +86",
    company: "公司名称（可选）", companyPh: "您的公司或企业名称",
    pay: "确认资料，前往付款 →",
    paying: "跳转中…",
    loginBtn: "登录后付款 →",
    required: "请填写姓名、邮箱和手机号码",
    payError: "跳转付款失败，请重试",
    // Confirm step
    confirmTitle: "请确认您的报名资料",
    confirmDesc: "请核对以下资料无误后再进行付款。",
    labelCourse: "报名课程",
    labelName: "姓名",
    labelEmail: "邮箱",
    labelPhone: "手机",
    labelCompany: "公司",
    confirmPay: "资料无误，立即付款 →",
    goBack: "返回修改",
  },
  en: {
    interestedIn: "Enrolling In",
    name: "Full Name", namePh: "Your full name",
    email: "Email Address", emailPh: "your@email.com",
    phone: "Phone Number", phonePh: "+60 / +1",
    company: "Company (optional)", companyPh: "Your company or business name",
    pay: "Review & Pay →",
    paying: "Redirecting…",
    loginBtn: "Log In to Pay →",
    required: "Please enter your name, email and phone number",
    payError: "Payment redirect failed, please try again",
    // Confirm step
    confirmTitle: "Please confirm your details",
    confirmDesc: "Review the information below before proceeding to payment.",
    labelCourse: "Course",
    labelName: "Name",
    labelEmail: "Email",
    labelPhone: "Phone",
    labelCompany: "Company",
    confirmPay: "Confirm & Pay Now →",
    goBack: "Edit Details",
  },
};

type Step = "form" | "confirm";

export default function ApplyForm({ course, isEn, isLoggedIn, userEmail, callbackUrl }: ApplyFormProps) {
  const lang = isEn ? "en" : "zh";
  const t = tr[lang];
  const meta = COURSE_META[course] ?? COURSE_META["capital-map"];
  const courseLabel = meta[lang];

  const [form, setForm] = useState({ name: "", email: userEmail, phone: "", company: "" });
  const [step, setStep] = useState<Step>("form");
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setErrorMsg(t.required);
      return;
    }
    setErrorMsg("");
    setStep("confirm");
  }

  async function handleConfirmPay() {
    setPaying(true);
    setErrorMsg("");
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, course }),
      });

      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t.payError);
      if (!data.url) throw new Error(t.payError);
      window.location.href = data.url;
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t.payError);
      setPaying(false);
      setStep("confirm");
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

  // ── Confirmation step ──────────────────────────────────────
  if (step === "confirm") {
    const rows = [
      { label: t.labelCourse,   value: courseLabel },
      { label: isEn ? "Duration" : "课程时长", value: isEn ? meta.duration.en : meta.duration.zh },
      { label: isEn ? "Fee" : "课程费用",    value: meta.price, highlight: true },
      { label: t.labelName,     value: form.name },
      { label: t.labelEmail,    value: form.email },
      { label: t.labelPhone,    value: form.phone },
      ...(form.company.trim() ? [{ label: t.labelCompany, value: form.company }] : []),
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-bold mb-1" style={{ color: "#1C1814" }}>{t.confirmTitle}</h2>
          <p className="text-xs" style={{ color: "#9A9490" }}>{t.confirmDesc}</p>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #E0D9CE" }}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="flex items-start gap-4 px-4 py-3"
              style={{ borderTop: i > 0 ? "1px solid #F0EBE1" : "none", backgroundColor: (row as { highlight?: boolean }).highlight ? "#FFFDF7" : undefined }}
            >
              <span className="text-xs flex-shrink-0 w-16" style={{ color: "#9A9490", paddingTop: 1 }}>{row.label}</span>
              <span className="text-sm font-medium break-all" style={{ color: (row as { highlight?: boolean }).highlight ? "#8B6514" : "#1C1814" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {errorMsg && (
          <p className="text-xs text-center" style={{ color: "#EF4444" }}>{errorMsg}</p>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirmPay}
            disabled={paying}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
            style={{
              background: "linear-gradient(135deg, #B8943A, #C9A84C)",
              color: "#1C1814",
              opacity: paying ? 0.7 : 1,
            }}
          >
            {paying ? t.paying : t.confirmPay}
          </button>
          <button
            type="button"
            onClick={() => setStep("form")}
            disabled={paying}
            className="w-full py-2.5 rounded-xl text-sm transition-opacity"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CE", color: "#68625C" }}
          >
            {t.goBack}
          </button>
        </div>
      </div>
    );
  }

  // ── Form step ──────────────────────────────────────────────
  return (
    <form onSubmit={handleReview} className="space-y-5">
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
          <label style={labelStyle}>{t.phone} <span style={{ color: "#C9A84C" }}>*</span></label>
          <input type="tel" required placeholder={t.phonePh} value={form.phone} onChange={set("phone")} style={inputStyle} />
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
          className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-88"
          style={{ background: "linear-gradient(135deg, #B8943A, #C9A84C)", color: "#1C1814" }}
        >
          {t.pay}
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
