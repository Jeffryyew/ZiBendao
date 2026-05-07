"use client";

import { useState } from "react";

export default function CheckoutButton({ priceId }: { priceId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "出现错误，请重试");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
        style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "跳转中…" : "立即购买"}
      </button>
      {error && <p className="mt-2 text-xs text-center" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}
