"use client";

import { useState, useTransition } from "react";
import { updateUserRole, toggleUserActive, grantToolAccess, revokeToolAccess } from "@/app/actions/admin";

interface ToolRecord {
  id: string;
  name: string;
  slug: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  studentLevel: number | null;
  isActive: boolean;
  createdAt: Date;
  toolAccess: { toolId: string }[];
}

interface Props {
  users: UserRecord[];
  tools: ToolRecord[];
}

const ROLE_OPTIONS = [
  { value: "FREE_MEMBER", label: "免费会员" },
  { value: "STUDENT", label: "学生" },
  { value: "CLIENT", label: "咨询客户" },
  { value: "SUB_ADMIN", label: "副管理员" },
  { value: "SUPER_ADMIN", label: "超级管理员" },
];

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "#EF4444",
  SUB_ADMIN: "#F97316",
  CLIENT: "#C9A84C",
  STUDENT: "#4CAF82",
  FREE_MEMBER: "#666660",
};

export default function UserTable({ users, tools }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { role: string; level: number }>>({});
  const [pending, startTransition] = useTransition();

  function getEdit(user: UserRecord) {
    return edits[user.id] ?? { role: user.role, studentLevel: user.studentLevel ?? 1 };
  }

  function setRole(userId: string, role: string) {
    setEdits((e) => ({ ...e, [userId]: { ...getEditById(userId), role } }));
  }

  function setLevel(userId: string, level: number) {
    setEdits((e) => ({ ...e, [userId]: { ...getEditById(userId), level } }));
  }

  function getEditById(userId: string) {
    const user = users.find((u) => u.id === userId)!;
    return edits[userId] ?? { role: user.role, level: user.studentLevel ?? 1 };
  }

  function isDirty(user: UserRecord) {
    const e = edits[user.id];
    if (!e) return false;
    return e.role !== user.role || (e.role === "STUDENT" && e.level !== (user.studentLevel ?? 1));
  }

  function saveRole(user: UserRecord) {
    const e = getEditById(user.id);
    startTransition(async () => {
      await updateUserRole(user.id, e.role, e.level);
      setEdits((prev) => { const n = { ...prev }; delete n[user.id]; return n; });
    });
  }

  function toggleActive(user: UserRecord) {
    startTransition(async () => { await toggleUserActive(user.id, !user.isActive); });
  }

  function toggleTool(userId: string, toolId: string, hasAccess: boolean) {
    startTransition(async () => {
      await (hasAccess ? revokeToolAccess(userId, toolId) : grantToolAccess(userId, toolId));
    });
  }

  if (users.length === 0) {
    return (
      <div
        className="rounded-2xl p-12 text-center"
        style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
      >
        <p className="text-sm" style={{ color: "#666660" }}>暂无用户</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" style={{ opacity: pending ? 0.7 : 1 }}>
      {users.map((user) => {
        const edit = getEditById(user.id);
        const dirty = isDirty(user);
        const isExpanded = expandedId === user.id;
        const grantedToolIds = new Set(user.toolAccess.map((a) => a.toolId));

        return (
          <div
            key={user.id}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#111111", border: "1px solid #1A1A1A" }}
          >
            {/* Main row */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              {/* Avatar + info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "#C9A84C" }}
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: user.isActive ? "#F5F5F0" : "#555550" }}>
                    {user.name}
                  </div>
                  <div className="text-xs truncate" style={{ color: "#555550" }}>{user.email}</div>
                </div>
              </div>

              {/* Role select */}
              <select
                value={edit.role}
                onChange={(e) => setRole(user.id, e.target.value)}
                className="rounded-lg px-2.5 py-1.5 text-xs outline-none"
                style={{
                  backgroundColor: "#0D0D0D",
                  border: `1px solid ${ROLE_COLOR[edit.role] ?? "#333"}`,
                  color: ROLE_COLOR[edit.role] ?? "#F5F5F0",
                }}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              {/* Level input (only for STUDENT) */}
              {edit.role === "STUDENT" && (
                <select
                  value={edit.level}
                  onChange={(e) => setLevel(user.id, Number(e.target.value))}
                  className="rounded-lg px-2.5 py-1.5 text-xs outline-none w-20"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #2A2A2A", color: "#F5F5F0" }}
                >
                  <option value={1}>L1</option>
                  <option value={2}>L2</option>
                  <option value={3}>L3</option>
                </select>
              )}

              {/* Save button */}
              {dirty && (
                <button
                  onClick={() => saveRole(user)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ backgroundColor: "#C9A84C", color: "#0D0D0D" }}
                >
                  保存
                </button>
              )}

              {/* Active toggle */}
              <button
                onClick={() => toggleActive(user)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: user.isActive ? "rgba(76,175,130,0.15)" : "rgba(239,68,68,0.1)",
                  color: user.isActive ? "#4CAF82" : "#EF4444",
                }}
              >
                {user.isActive ? "启用" : "禁用"}
              </button>

              {/* Expand for CLIENT tool access */}
              {user.role === "CLIENT" && tools.length > 0 && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  className="px-3 py-1.5 rounded-lg text-xs"
                  style={{ backgroundColor: "#1A1A1A", color: "#A0A09A" }}
                >
                  工具权限 {isExpanded ? "▲" : "▼"}
                </button>
              )}

              {/* Date */}
              <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "#444440" }}>
                {new Date(user.createdAt).toLocaleDateString("zh-CN")}
              </span>
            </div>

            {/* Expanded tool access panel */}
            {isExpanded && user.role === "CLIENT" && (
              <div
                className="px-5 pb-4 pt-2 border-t"
                style={{ borderColor: "#1A1A1A" }}
              >
                <p className="text-xs mb-3" style={{ color: "#666660" }}>授权工具</p>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => {
                    const has = grantedToolIds.has(tool.id);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => toggleTool(user.id, tool.id, has)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: has ? "rgba(201,168,76,0.15)" : "#0D0D0D",
                          border: `1px solid ${has ? "#C9A84C" : "#2A2A2A"}`,
                          color: has ? "#C9A84C" : "#666660",
                        }}
                      >
                        <span>{has ? "✓" : "+"}</span>
                        {tool.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
