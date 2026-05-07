"use client";

import { useState, useRef } from "react";
import ToolShell from "@/components/tools/ToolShell";

interface LineItem {
  id: number;
  description: string;
  qty: string;
  unitPrice: string;
  discount: string;
}

interface QuoteInfo {
  clientName: string;
  company: string;
  quoteNo: string;
  date: string;
  notes: string;
  taxRate: string;
}

let nextId = 4;

const defaultItems: LineItem[] = [
  { id: 1, description: "咨询服务费", qty: "10", unitPrice: "500", discount: "0" },
  { id: 2, description: "月度报告编制", qty: "3", unitPrice: "800", discount: "10" },
  { id: 3, description: "数据分析套餐", qty: "1", unitPrice: "2000", discount: "0" },
];

function itemSubtotal(item: LineItem): number {
  const qty = parseFloat(item.qty) || 0;
  const up = parseFloat(item.unitPrice) || 0;
  const disc = parseFloat(item.discount) || 0;
  return qty * up * (1 - disc / 100);
}

function fmt(n: number): string {
  return n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PricingSystemTool() {
  const [info, setInfo] = useState<QuoteInfo>({
    clientName: "",
    company: "",
    quoteNo: `QT-${new Date().getFullYear()}-001`,
    date: new Date().toISOString().split("T")[0],
    notes: "",
    taxRate: "6",
  });
  const [items, setItems] = useState<LineItem[]>(defaultItems);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const setInfoField = (field: keyof QuoteInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setInfo((p) => ({ ...p, [field]: e.target.value }));

  const updateItem = (id: number, field: keyof LineItem, value: string) =>
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  const addItem = () => {
    setItems((prev) => [...prev, { id: nextId++, description: "", qty: "1", unitPrice: "0", discount: "0" }]);
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = items.reduce((s, i) => s + itemSubtotal(i), 0);
  const taxAmt = subtotal * (parseFloat(info.taxRate) || 0) / 100;
  const grandTotal = subtotal + taxAmt;

  const exportCSV = () => {
    const rows = [
      ["报价单", info.quoteNo],
      ["客户", info.clientName, "公司", info.company],
      ["日期", info.date],
      [],
      ["项目描述", "数量", "单价(RM)", "折扣(%)", "小计(RM)"],
      ...items.map((i) => [i.description, i.qty, i.unitPrice, i.discount, fmt(itemSubtotal(i))]),
      [],
      ["小计", "", "", "", fmt(subtotal)],
      [`税率 ${info.taxRate}%`, "", "", "", fmt(taxAmt)],
      ["总计", "", "", "", fmt(grandTotal)],
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${info.quoteNo || "报价单"}.csv` });
    a.click();
  };

  const inputCls = {
    backgroundColor: "#0D0D0D",
    border: "1px solid #2A2A2A",
    color: "#F5F5F0",
    borderRadius: "10px",
    outline: "none",
    fontSize: "13px",
  } as const;

  return (
    <ToolShell icon="💰" title="产品服务报价系统" desc="快速生成专业报价单，支持动态项目、折扣与税务计算。" levelRequired={2}>
      <div className="space-y-6">
        {/* Client Info */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
          <p className="text-xs font-mono mb-4" style={{ color: "#666660" }}>CLIENT INFO / 客户信息</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { field: "clientName", label: "客户姓名", placeholder: "张三" },
              { field: "company", label: "公司名称", placeholder: "ZiBenDao Sdn Bhd" },
              { field: "quoteNo", label: "报价单编号", placeholder: "QT-2026-001" },
              { field: "date", label: "日期", placeholder: "", type: "date" },
              { field: "taxRate", label: "税率 (%)", placeholder: "6", type: "number" },
            ].map(({ field, label, placeholder, type }) => (
              <div key={field}>
                <label className="block text-xs mb-1.5" style={{ color: "#A0A09A" }}>{label}</label>
                <input
                  type={type || "text"}
                  value={info[field as keyof QuoteInfo]}
                  onChange={setInfoField(field as keyof QuoteInfo)}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5"
                  style={inputCls}
                  onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Line Items */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono" style={{ color: "#666660" }}>LINE ITEMS / 报价明细</p>
            <button
              onClick={addItem}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              + 添加项目
            </button>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-2 mb-2 text-xs px-1" style={{ color: "#555550" }}>
            <div className="col-span-5">项目描述</div>
            <div className="col-span-2 text-right">数量</div>
            <div className="col-span-2 text-right">单价 (RM)</div>
            <div className="col-span-1 text-right">折扣%</div>
            <div className="col-span-2 text-right">小计 (RM)</div>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center group">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="项目描述..."
                    className="w-full px-3 py-2"
                    style={inputCls}
                    onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                  />
                </div>
                {(["qty", "unitPrice", "discount"] as const).map((f, i) => (
                  <div key={f} className={`col-span-4 md:col-span-${i === 2 ? 1 : 2}`}>
                    <input
                      type="number"
                      value={item[f]}
                      onChange={(e) => updateItem(item.id, f, e.target.value)}
                      className="w-full px-2 py-2 text-right"
                      style={{ ...inputCls, fontFamily: "var(--font-mono)" }}
                      onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                ))}
                <div className="hidden md:flex col-span-2 items-center justify-end gap-2">
                  <span className="font-mono text-sm" style={{ color: "#C9A84C" }}>{fmt(itemSubtotal(item))}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-opacity"
                    style={{ backgroundColor: "#2A2A2A", color: "#888880" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-5 pt-5 border-t ml-auto max-w-xs space-y-2" style={{ borderColor: "#222222" }}>
            {[
              { label: "小计", value: subtotal },
              { label: `税额 (${info.taxRate}%)`, value: taxAmt },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "#A0A09A" }}>{label}</span>
                <span className="font-mono" style={{ color: "#F5F5F0" }}>RM {fmt(value)}</span>
              </div>
            ))}
            <div
              className="flex justify-between pt-3 border-t"
              style={{ borderColor: "#333333" }}
            >
              <span className="font-semibold">总计</span>
              <span className="font-bold font-mono text-lg" style={{ color: "#C9A84C" }}>RM {fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "#141414", border: "1px solid #1E1E1E" }}>
          <p className="text-xs font-mono mb-3" style={{ color: "#666660" }}>NOTES / 备注</p>
          <textarea
            value={info.notes}
            onChange={setInfoField("notes")}
            placeholder="付款条件、有效期、特别说明..."
            rows={3}
            className="w-full px-3 py-2.5 resize-none text-sm"
            style={{ ...inputCls, borderRadius: "12px" }}
            onFocus={(e) => (e.target.style.borderColor = "#C9A84C")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
          >
            {showPreview ? "隐藏预览" : "预览报价单"}
          </button>
          <button onClick={exportCSV} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#1A1A1A", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}>
            ↓ 导出 CSV
          </button>
          <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl text-sm font-medium" style={{ backgroundColor: "#1A1A1A", color: "#A0A09A", border: "1px solid #2A2A2A" }}>
            🖨 打印 PDF
          </button>
        </div>

        {/* Quote Preview */}
        {showPreview && (
          <div ref={printRef} className="rounded-2xl overflow-hidden print:shadow-none" style={{ backgroundColor: "#F5F5F0", color: "#1A1A1A" }}>
            {/* Invoice header */}
            <div className="px-8 py-6 flex items-start justify-between" style={{ backgroundColor: "#1A1A1A" }}>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#C9A84C" }}>资本道</div>
                <div className="text-xs mt-0.5" style={{ color: "#666660" }}>ZiBenDao Capital Advisory</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold" style={{ color: "#F5F5F0" }}>报价单</div>
                <div className="text-xs mt-1 font-mono" style={{ color: "#A0A09A" }}>{info.quoteNo}</div>
                <div className="text-xs mt-0.5" style={{ color: "#666660" }}>{info.date}</div>
              </div>
            </div>

            <div className="px-8 py-6">
              {/* Client info */}
              <div className="mb-6">
                <div className="text-xs mb-1" style={{ color: "#888880" }}>致</div>
                <div className="font-semibold">{info.clientName || "(客户姓名)"}</div>
                {info.company && <div className="text-sm" style={{ color: "#555555" }}>{info.company}</div>}
              </div>

              {/* Items table */}
              <table className="w-full text-sm mb-6">
                <thead>
                  <tr style={{ borderBottom: "2px solid #1A1A1A" }}>
                    {["项目描述", "数量", "单价 (RM)", "折扣", "小计 (RM)"].map((h) => (
                      <th key={h} className={`py-2 text-xs font-semibold ${h !== "项目描述" ? "text-right" : "text-left"}`} style={{ color: "#555555" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #E5E5E5", backgroundColor: i % 2 ? "#FAFAFA" : "white" }}>
                      <td className="py-2.5">{item.description || "-"}</td>
                      <td className="py-2.5 text-right font-mono text-xs">{item.qty}</td>
                      <td className="py-2.5 text-right font-mono text-xs">{fmt(parseFloat(item.unitPrice) || 0)}</td>
                      <td className="py-2.5 text-right font-mono text-xs">{item.discount}%</td>
                      <td className="py-2.5 text-right font-mono text-xs font-semibold">{fmt(itemSubtotal(item))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-sm"><span style={{ color: "#555555" }}>小计</span><span className="font-mono">RM {fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span style={{ color: "#555555" }}>税 ({info.taxRate}%)</span><span className="font-mono">RM {fmt(taxAmt)}</span></div>
                  <div className="flex justify-between font-bold pt-2" style={{ borderTop: "2px solid #1A1A1A" }}>
                    <span>总计</span>
                    <span className="font-mono text-lg" style={{ color: "#9A7A32" }}>RM {fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {info.notes && (
                <div className="mt-6 pt-4" style={{ borderTop: "1px solid #E5E5E5" }}>
                  <p className="text-xs mb-1" style={{ color: "#888880" }}>备注</p>
                  <p className="text-sm" style={{ color: "#555555" }}>{info.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
