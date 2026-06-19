"use client";

import React from "react";

interface State {
  hasError: boolean;
  error: string;
}

export default class CashFlowErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[CashFlowTool] Runtime error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-2xl p-8 text-center mx-auto max-w-lg mt-12"
          style={{ backgroundColor: "#F8F6F1", border: "1px solid #E8DFCF" }}
        >
          <p className="text-sm font-semibold mb-2" style={{ color: "#B05050" }}>
            页面加载出错，请刷新重试
          </p>
          <p className="text-xs mt-1 font-mono" style={{ color: "#C0BAB0" }}>
            {this.state.error}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: "" })}
            className="mt-4 text-xs px-4 py-2 rounded-lg"
            style={{ backgroundColor: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
