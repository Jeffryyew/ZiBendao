"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CONTRACT_TEMPLATES,
  ContractVariables,
  generateContractNo,
  getDefaultTerms,
  renderContract,
} from "@/lib/contracts";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Props {
  clients: Client[];
  consultantName: string;
}

const FIELD_LABELS: Partial<Record<keyof ContractVariables, string>> = {
  client_name: "客户姓名",
  company_name: "公司名称",
  service_type: "服务内容",
  contract_date: "合同日期",
  amount: "服务费用 (RM)",
  duration: "服务期限",
  consultant_name: "顾问姓名",
  terms_and_conditions: "条款与条件",
};

const FIELD_MULTILINE: Partial<Record<keyof ContractVariables, boolean>> = {
  service_type: true,
  terms_and_conditions: true,
};

export default function ContractForm({ clients, consultantName }: Props) {
  const router = useRouter();
  const template = CONTRACT_TEMPLATES[0];

  const today = new Date().toISOString().slice(0, 10);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [vars, setVars] = useState<Partial<ContractVariables>>({
    contract_no: generateContractNo(),
    contract_date: today,
    consultant_name: consultantName,
    terms_and_conditions: getDefaultTerms(),
  });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  function handleClientChange(id: string) {
    setSelectedClientId(id);
    const client = clients.find((c) => c.id === id);
    if (client) {
      setVars((v) => ({ ...v, client_name: client.name }));
    }
  }

  function setVar(key: keyof ContractVariables, value: string) {
    setVars((v) => ({ ...v, [key]: value }));
  }

  const renderedContent = renderContract(template.content, vars);

  async function handleSave() {
    if (!selectedClientId) { setError("请选择客户"); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          title: `${template.title} — ${vars.client_name ?? selectedClient?.name ?? ""}`,
          content: renderedContent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "保存失败");
      }
      router.push("/admin/contracts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Client selector */}
      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#C9A84C" }}>选择客户</h2>
        <select
          value={selectedClientId}
          onChange={(e) => handleClientChange(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
        >
          <option value="">— 请选择客户 —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>
      </div>

      {/* Variable fields */}
      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}>
        <h2 className="text-sm font-semibold" style={{ color: "#C9A84C" }}>合同信息</h2>

        {/* contract_no read-only */}
        <div>
          <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>合同编号</label>
          <div
            className="rounded-xl px-4 py-3 text-sm font-mono"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A", color: "#C9A84C" }}
          >
            {vars.contract_no}
          </div>
        </div>

        {template.variableKeys
          .filter((k) => k !== "contract_no")
          .map((key) => {
            const label = FIELD_LABELS[key] ?? key;
            const isMulti = FIELD_MULTILINE[key];
            const val = (vars as Record<string, string>)[key] ?? "";
            return (
              <div key={key}>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: "#A0A09A" }}>{label}</label>
                {isMulti ? (
                  <textarea
                    value={val}
                    onChange={(e) => setVar(key, e.target.value)}
                    rows={key === "terms_and_conditions" ? 8 : 3}
                    className="w-full rounded-xl px-4 py-3 text-sm resize-y outline-none"
                    style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  />
                ) : (
                  <input
                    type={key === "contract_date" ? "date" : "text"}
                    value={val}
                    onChange={(e) => setVar(key, e.target.value)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                  />
                )}
              </div>
            );
          })}
      </div>

      {/* Preview toggle */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1A1A1A" }}>
        <button
          onClick={() => setPreview((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium"
          style={{ backgroundColor: "#111111", color: "#A0A09A" }}
        >
          <span>合同预览</span>
          <span>{preview ? "▲ 收起" : "▼ 展开"}</span>
        </button>
        {preview && (
          <div className="p-6" style={{ backgroundColor: "#FAFAF8" }}>
            <pre
              className="whitespace-pre-wrap text-xs leading-relaxed font-mono"
              style={{ color: "#1A1A1A" }}
            >
              {renderedContent}
            </pre>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-center" style={{ color: "#EF4444" }}>{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => router.push("/admin/contracts")}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-opacity"
          style={{ backgroundColor: "#C9A84C", color: "#0D0D0D", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "保存中…" : "生成并保存合约"}
        </button>
      </div>
    </div>
  );
}
