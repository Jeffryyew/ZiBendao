"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import BackNav from "@/components/BackNav";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined as { error?: string; success?: string } | undefined);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0D0D0D" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <BackNav />
        </div>
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>
              资本道
            </h1>
            <p className="text-sm mt-1" style={{ color: "#A0A09A" }}>ZiBenDao</p>
          </Link>
        </div>

        <div className="rounded-2xl p-8 border" style={{ backgroundColor: "#1A1A1A", borderColor: "#333333" }}>
          <h2 className="text-xl font-semibold mb-2 text-center" style={{ color: "#F5F5F0" }}>
            免费注册
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: "#666660" }}>
            立即开始你的金融学习之旅
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#A0A09A" }}>姓名</label>
              <input
                name="name"
                type="text"
                required
                placeholder="你的名字"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ backgroundColor: "#222222", border: "1px solid #333333", color: "#F5F5F0" }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.target.style.borderColor = "#333333")}
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#A0A09A" }}>邮箱</label>
              <input
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ backgroundColor: "#222222", border: "1px solid #333333", color: "#F5F5F0" }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.target.style.borderColor = "#333333")}
              />
            </div>

            <div>
              <label className="block text-sm mb-1.5" style={{ color: "#A0A09A" }}>密码</label>
              <input
                name="password"
                type="password"
                required
                placeholder="至少8位"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style={{ backgroundColor: "#222222", border: "1px solid #333333", color: "#F5F5F0" }}
                onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                onBlur={(e) => (e.target.style.borderColor = "#333333")}
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-400 text-center">{state.error}</p>
            )}
            {state?.success && (
              <div className="text-center">
                <p className="text-sm text-green-400 mb-3">{state.success}</p>
                <Link
                  href="/login"
                  className="text-sm font-medium"
                  style={{ color: "#C9A84C" }}
                >
                  前往登录 →
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-3 rounded-xl font-medium text-sm transition-opacity disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
            >
              {pending ? "注册中..." : "免费注册"}
            </button>
          </form>

          <p className="text-xs text-center mt-4" style={{ color: "#666660" }}>
            注册即表示同意{" "}
            <span style={{ color: "#C9A84C" }} className="cursor-pointer hover:underline">服务条款</span>
            {" "}和{" "}
            <span style={{ color: "#C9A84C" }} className="cursor-pointer hover:underline">隐私政策</span>
          </p>

          <p className="text-sm text-center mt-4" style={{ color: "#666660" }}>
            已有账号？{" "}
            <Link href="/login" style={{ color: "#C9A84C" }} className="hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
