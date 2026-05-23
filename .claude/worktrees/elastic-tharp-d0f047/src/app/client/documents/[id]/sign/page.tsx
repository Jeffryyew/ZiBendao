"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SignatureCanvas from "@/components/SignatureCanvas";

interface DocData {
  id: string;
  title: string;
  content: string;
  status: string;
}

export default function SignDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [doc, setDoc] = useState<DocData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sigData, setSigData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDoc(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    if (!sigData) {
      setError("请先完成签名");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureData: sigData }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "签署失败，请重试");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("签署失败，请重试");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h2 className="text-xl font-bold" style={{ color: "#4CAF82", fontFamily: "var(--font-display)" }}>
          合约签署成功
        </h2>
        <p className="text-sm" style={{ color: "#A0A09A" }}>
          您的签名已记录，合约状态已更新为「已签署」。
        </p>
        <button
          onClick={() => router.push(`/client/documents/${id}`)}
          className="mt-4 px-6 py-3 rounded-xl font-medium text-sm"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
        >
          查看合约
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-sm" style={{ color: "#555550" }}>加载中...</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-sm" style={{ color: "#EF4444" }}>合约不存在或无权限访问</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <a
          href={`/client/documents/${id}`}
          className="text-xs mb-2 flex items-center gap-1"
          style={{ color: "#666660" }}
        >
          ← 返回文件
        </a>
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F5F5F0" }}>
          签署合约
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#A0A09A" }}>{doc.title}</p>
      </div>

      {/* Contract preview */}
      <div
        className="rounded-2xl p-6 max-h-64 overflow-y-auto"
        style={{ backgroundColor: "#FAFAF8", border: "1px solid #E0E0D8" }}
      >
        <pre
          className="whitespace-pre-wrap text-xs leading-relaxed"
          style={{ color: "#1A1A1A", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
        >
          {doc.content}
        </pre>
      </div>

      {/* Signature section */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
      >
        <div>
          <h2 className="text-base font-semibold mb-1" style={{ color: "#F5F5F0" }}>您的电子签名</h2>
          <p className="text-xs" style={{ color: "#666660" }}>
            在下方框内用鼠标或触控板签名，代表您同意并接受合约条款。
          </p>
        </div>

        <SignatureCanvas onChange={setSigData} />

        {error && (
          <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !sigData}
            className="px-6 py-3 rounded-xl font-medium text-sm transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "#C9A84C",
              color: "#0D0D0D",
              cursor: submitting || !sigData ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "签署中..." : "确认签署"}
          </button>
          <button
            onClick={() => router.push(`/client/documents/${id}`)}
            className="px-6 py-3 rounded-xl font-medium text-sm"
            style={{ backgroundColor: "#1A1A1A", color: "#A0A09A", border: "1px solid #333333" }}
          >
            取消
          </button>
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: "#444440" }}>
        电子签名具有法律效力，签署后合约状态将更新为「已签署」。
      </p>
    </div>
  );
}
