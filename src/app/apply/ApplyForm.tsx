"use client";

import { useState } from "react";

const COURSE_NAMES: Record<string, { zh: string; en: string }> = {
  "capital-map":  { zh: "资本通 · 阶段一", en: "The Capital Map · Stage 1" },
  "capital-code": { zh: "启动资本 · 阶段二", en: "The Capital Code · Stage 2" },
  "capital-dao":  { zh: "资本道 · 阶段三", en: "Capital Dao · Stage 3" },
};

interface ApplyFormProps {
  course: string;
  isEn: boolean;
}

const t = {
  zh: {
    name: "姓名", namePh: "您的全名",
    email: "邮箱地址", emailPh: "your@email.com",
    phone: "手机号码", phonePh: "+60 / +86",
    company: "公司名称（可选）", companyPh: "您的公司或企业名称",
    message: "留言（可选）", messagePh: "您的问题或期望，帮助我们更好地为您服务",
    submit: "提交申请",
    submitting: "提交中...",
    successTitle: "申请已提交",
    successDesc: "感谢您的申请！我们的顾问团队将在 1-2 个工作日内与您联系。",
    required: "请填写所有必填项",
    error: "提交失败，请重试",
    interestedIn: "申请课程",
  },
  en: {
    name: "Full Name", namePh: "Your full name",
    email: "Email Address", emailPh: "your@email.com",
    phone: "Phone Number", phonePh: "+60 / +1",
    company: "Company (optional)", companyPh: "Your company or business name",
    message: "Message (optional)", messagePh: "Your questions or goals — help us serve you better",
    submit: "Submit Application",
    submitting: "Submitting...",
    successTitle: "Application Received",
    successDesc: "Thank you! Our team will contact you within 1-2 business days.",
    required: "Please fill in all required fields",
    error: "Submission failed, please try again",
    interestedIn: "Applying For",
  },
};

export default function ApplyForm({ course, isEn }: ApplyFormProps) {
  const lang = isEn ? "en" : "zh";
  const tr = t[lang];
  const courseLabel = COURSE_NAMES[course]?.[lang] ?? course;

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function onChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg(tr.required);
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, course }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setErrorMsg(tr.error);
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
          {tr.successTitle}
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "#68625C" }}>
          {tr.successDesc}
        </p>
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E0D9CE",
    color: "#1C1814",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "6px",
    color: "#68625C",
  } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Course display (read-only) */}
      <div>
        <label style={labelStyle}>{tr.interestedIn}</label>
        <div
          className="px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#FBF4E4", color: "#8B6514", border: "1px solid rgba(139,101,20,0.2)" }}
        >
          {courseLabel}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelStyle}>{tr.name} <span style={{ color: "#C9A84C" }}>*</span></label>
          <input
            type="text"
            required
            placeholder={tr.namePh}
            value={form.name}
            onChange={onChange("name")}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{tr.email} <span style={{ color: "#C9A84C" }}>*</span></label>
          <input
            type="email"
            required
            placeholder={tr.emailPh}
            value={form.email}
            onChange={onChange("email")}
            style={inputStyle}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label style={labelStyle}>{tr.phone}</label>
          <input
            type="tel"
            placeholder={tr.phonePh}
            value={form.phone}
            onChange={onChange("phone")}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{tr.company}</label>
          <input
            type="text"
            placeholder={tr.companyPh}
            value={form.company}
            onChange={onChange("company")}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>{tr.message}</label>
        <textarea
          placeholder={tr.messagePh}
          value={form.message}
          onChange={onChange("message")}
          rows={4}
          style={{ ...inputStyle, resize: "none" }}
        />
      </div>

      {errorMsg && (
        <p className="text-xs text-center" style={{ color: "#EF4444" }}>{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
        style={{
          background: "linear-gradient(135deg, #B8943A, #C9A84C)",
          color: "#1C1814",
          opacity: status === "loading" ? 0.7 : 1,
        }}
      >
        {status === "loading" ? tr.submitting : tr.submit}
      </button>
    </form>
  );
}
