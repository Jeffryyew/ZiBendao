"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
    >
      <span>⬇</span>
      下载 / 打印
    </button>
  );
}
