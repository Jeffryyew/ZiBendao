'use client'

import { useState, useEffect, useRef } from 'react'

const PASS = 'zibendao2026'
const STORAGE_KEY = 'zibendao_board_tasks'
const AUTH_KEY = 'zibendao_board_auth'

type Priority = 'high' | 'med' | 'low'
type Status = 'todo' | 'doing' | 'done'

interface Task {
  id: number
  name: string
  desc: string
  tag: string
  prio: Priority
  status: Status
}

const INITIAL_TASKS: Task[] = [
  { id: 1, name: '学员注册 & 邮件验证流程', desc: '完善注册后的邮件验证逻辑，确保未验证用户无法进入学员系统', tag: '核心功能', prio: 'high', status: 'todo' },
  { id: 2, name: 'Google OAuth 登录完善', desc: '修复 Google OAuth 回调稳定性，确保生产环境登录正常', tag: '核心功能', prio: 'high', status: 'doing' },
  { id: 3, name: '支付 & 报名系统', desc: '接入支付网关（Stripe/FPX），完成课程购买流程', tag: '核心功能', prio: 'high', status: 'todo' },
  { id: 4, name: '密码重置功能', desc: '实现忘记密码 → 邮件重置流程', tag: '核心功能', prio: 'med', status: 'todo' },
  { id: 5, name: '课程内容 — 第1章 资本认知', desc: '完整填写13章中第1章的所有关卡文字、题目、解析', tag: '课程系统', prio: 'high', status: 'doing' },
  { id: 6, name: '课程内容 — 第2章 资本工具', desc: '填写第2章所有关卡内容', tag: '课程系统', prio: 'high', status: 'todo' },
  { id: 7, name: '课程内容 — 第3-13章', desc: '逐章填写剩余11章课程内容', tag: '课程系统', prio: 'med', status: 'todo' },
  { id: 8, name: '学习进度追踪系统', desc: '记录并显示每位学员每一关的完成状态，支持断点续学', tag: '课程系统', prio: 'high', status: 'todo' },
  { id: 9, name: '关卡测验 & 即时反馈', desc: '每关结束后的测验功能，给出正确答案和解析', tag: '课程系统', prio: 'med', status: 'todo' },
  { id: 10, name: '课程搜索 & 筛选', desc: '学员可按章节、关键词搜索课程内容', tag: '课程系统', prio: 'low', status: 'todo' },
  { id: 11, name: '资本工具数据持久化', desc: '工具计算结果保存到数据库，学员可查看历史记录', tag: '资本工具', prio: 'med', status: 'todo' },
  { id: 12, name: '工具数据导出 PDF/CSV', desc: '让学员能导出工具分析报告', tag: '资本工具', prio: 'low', status: 'todo' },
  { id: 13, name: '工具内容补充', desc: '完善各工具的使用说明和案例数据', tag: '资本工具', prio: 'med', status: 'todo' },
  { id: 14, name: '企业模块多用户权限', desc: '企业管理员可邀请子账号、分配权限', tag: '企业模块', prio: 'med', status: 'todo' },
  { id: 15, name: '企业数据图表可视化', desc: '添加企业财务数据的图表展示（折线图、柱状图）', tag: '企业模块', prio: 'med', status: 'todo' },
  { id: 16, name: '社群活动报名功能', desc: '活动页支持学员报名，后台收集报名数据', tag: '核心功能', prio: 'med', status: 'todo' },
  { id: 17, name: '底部空白 & 页面布局修复', desc: '修复全站底部大量空白、min-height 问题', tag: 'UI/UX', prio: 'high', status: 'done' },
  { id: 18, name: '品牌重塑 — Zibo/小资', desc: '删除 Capital OS 标签，AI助手统一改为小资/Zibo', tag: 'UI/UX', prio: 'high', status: 'done' },
  { id: 19, name: 'Footer 年份 & 公司信息', desc: '更新 footer 为 © 2026 Eutopos Equity Sdn Bhd', tag: 'UI/UX', prio: 'med', status: 'done' },
  { id: 20, name: '响应式移动端适配', desc: '确保所有页面在手机浏览器上正常显示', tag: 'UI/UX', prio: 'med', status: 'todo' },
  { id: 21, name: 'Vercel 生产部署稳定', desc: 'middleware matcher 修复，部署正常运行', tag: '部署运维', prio: 'high', status: 'done' },
  { id: 22, name: '数据库 Prisma 完善', desc: '确认所有 schema 与功能对齐，补充缺失字段', tag: '部署运维', prio: 'high', status: 'doing' },
  { id: 23, name: '环境变量管理', desc: '统一管理所有 Vercel 环境变量，避免生产/开发不一致', tag: '部署运维', prio: 'med', status: 'done' },
  { id: 24, name: '错误监控 & 日志', desc: '接入 Sentry 或类似工具，生产错误有告警', tag: '部署运维', prio: 'low', status: 'todo' },
]

const TAGS = ['核心功能', '课程系统', '资本工具', '企业模块', 'UI/UX', '部署运维']
const ALL_FILTERS = ['全部', ...TAGS]

const PRIO_MAP: Record<Priority, string> = { high: '高', med: '中', low: '低' }

const PRIO_COLORS: Record<Priority, string> = {
  high: 'bg-red-900/40 text-red-300 border border-red-700/50',
  med: 'bg-amber-900/40 text-amber-300 border border-amber-700/50',
  low: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
}

const TAG_COLORS: Record<string, string> = {
  '核心功能': 'bg-blue-900/40 text-blue-300',
  '课程系统': 'bg-purple-900/40 text-purple-300',
  '资本工具': 'bg-cyan-900/40 text-cyan-300',
  '企业模块': 'bg-indigo-900/40 text-indigo-300',
  'UI/UX': 'bg-pink-900/40 text-pink-300',
  '部署运维': 'bg-orange-900/40 text-orange-300',
}

const COLS: { id: Status; label: string; accent: string }[] = [
  { id: 'todo', label: '待完成', accent: 'border-zinc-500' },
  { id: 'doing', label: '进行中', accent: 'border-blue-500' },
  { id: 'done', label: '已完成', accent: 'border-emerald-500' },
]

function nextId(tasks: Task[]): number {
  return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
}

function buildClaudePrompt(task: Task): string {
  const colLabel = COLS.find(c => c.id === task.status)?.label ?? task.status
  return `# 资本道任务：${task.name}

类别：${task.tag}
优先级：${PRIO_MAP[task.prio]}
当前状态：${colLabel}

任务说明：
${task.desc}

请帮我完成这个任务。项目是 Next.js 应用，路径在 C:\\Users\\Dell\\Desktop\\zibendao。`
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onEdit,
  onClaude,
  onMove,
}: {
  task: Task
  onEdit: () => void
  onClaude: () => void
  onMove: (id: number, status: Status) => void
}) {
  const moveTargets = COLS.filter(c => c.id !== task.status)

  return (
    <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700 hover:border-zinc-500 transition-colors group">
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={onEdit}
          className="text-white text-sm font-medium text-left leading-snug flex-1 hover:text-blue-400 transition-colors"
        >
          {task.name}
        </button>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${PRIO_COLORS[task.prio]}`}>
          {PRIO_MAP[task.prio]}
        </span>
      </div>

      <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">{task.desc}</p>

      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${TAG_COLORS[task.tag] ?? 'bg-zinc-700 text-zinc-300'}`}>
          {task.tag}
        </span>
        <button
          onClick={onClaude}
          className="text-xs text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/60 px-2 py-1 rounded transition-colors"
        >
          派给 Claude
        </button>
      </div>

      <div className="flex gap-1 pt-2 border-t border-zinc-700/60">
        {moveTargets.map(col => (
          <button
            key={col.id}
            onClick={() => onMove(task.id, col.id)}
            className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors"
          >
            → {col.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── TaskModal ────────────────────────────────────────────────────────────────

function TaskModal({
  task,
  onSave,
  onDelete,
  onClose,
}: {
  task: Partial<Task>
  onSave: (t: Partial<Task>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Task>>(task)
  const isNew = !task.id
  const set = <K extends keyof Task>(k: K, v: Task[K]) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-lg">{isNew ? '新增任务' : '编辑任务'}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-zinc-300 text-sm block mb-1.5">任务名称 *</label>
            <input
              value={form.name ?? ''}
              onChange={e => set('name', e.target.value)}
              placeholder="输入任务名称"
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-zinc-300 text-sm block mb-1.5">说明</label>
            <textarea
              value={form.desc ?? ''}
              onChange={e => set('desc', e.target.value)}
              placeholder="任务说明..."
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-zinc-300 text-sm block mb-1.5">类别</label>
              <select
                value={form.tag ?? '核心功能'}
                onChange={e => set('tag', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {TAGS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-zinc-300 text-sm block mb-1.5">优先级</label>
              <select
                value={form.prio ?? 'med'}
                onChange={e => set('prio', e.target.value as Priority)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="high">高</option>
                <option value="med">中</option>
                <option value="low">低</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-300 text-sm block mb-1.5">状态</label>
              <select
                value={form.status ?? 'todo'}
                onChange={e => set('status', e.target.value as Status)}
                className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="todo">待完成</option>
                <option value="doing">进行中</option>
                <option value="done">已完成</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(form)}
            disabled={!form.name?.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            保存
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 bg-red-900/40 hover:bg-red-900/70 text-red-400 py-2.5 rounded-lg text-sm font-medium transition-colors border border-red-800/50"
            >
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BoardPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState('全部')
  const [editTask, setEditTask] = useState<Partial<Task> | null>(null)
  const [claudeTask, setClaudeTask] = useState<Task | null>(null)
  const [copied, setCopied] = useState(false)
  const claudeRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === '1') setAuthed(true)
    const saved = localStorage.getItem(STORAGE_KEY)
    setTasks(saved ? (JSON.parse(saved) as Task[]) : INITIAL_TASKS)
  }, [])

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function login() {
    if (pw === PASS) {
      localStorage.setItem(AUTH_KEY, '1')
      setAuthed(true)
      setPwErr(false)
    } else {
      setPwErr(true)
    }
  }

  function saveTask(t: Partial<Task>) {
    if (!t.name?.trim()) return
    if (t.id) {
      setTasks(prev => prev.map(x => (x.id === t.id ? ({ ...x, ...t } as Task) : x)))
    } else {
      const newTask: Task = {
        id: nextId(tasks),
        name: t.name,
        desc: t.desc ?? '',
        tag: t.tag ?? '核心功能',
        prio: t.prio ?? 'med',
        status: t.status ?? 'todo',
      }
      setTasks(prev => [...prev, newTask])
    }
    setEditTask(null)
  }

  function deleteTask(id: number) {
    setTasks(prev => prev.filter(t => t.id !== id))
    setEditTask(null)
  }

  function moveTask(id: number, status: Status) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)))
  }

  const filtered = tasks.filter(t => filter === '全部' || t.tag === filter)

  // ── Password gate ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 w-full max-w-sm mx-4">
          <div className="text-center mb-6">
            <div className="text-3xl mb-3">📋</div>
            <h1 className="text-white text-2xl font-bold">项目进展看板</h1>
            <p className="text-zinc-400 text-sm mt-1">请输入访问密码</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setPwErr(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="访问密码"
            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-500 mb-3 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {pwErr && (
            <p className="text-red-400 text-sm mb-3">密码错误，请重试</p>
          )}
          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium transition-colors"
          >
            进入看板
          </button>
        </div>
      </div>
    )
  }

  // ── Board ──────────────────────────────────────────────────────────────────

  const todoCount = tasks.filter(t => t.status === 'todo').length
  const doingCount = tasks.filter(t => t.status === 'doing').length
  const doneCount = tasks.filter(t => t.status === 'done').length
  const donePercent = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: '#0D0D0D' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">项目进展看板</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-400">
            <span>共 {tasks.length} 个任务</span>
            <span>·</span>
            <span className="text-emerald-400">{donePercent}% 完成</span>
          </div>
        </div>
        <button
          onClick={() => setEditTask({ status: 'todo', prio: 'med', tag: '核心功能' })}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <span className="text-base leading-none">+</span>
          新增任务
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '待完成', count: todoCount, color: 'text-zinc-300', bg: 'bg-zinc-800' },
          { label: '进行中', count: doingCount, color: 'text-blue-300', bg: 'bg-blue-900/20 border border-blue-800/40' },
          { label: '已完成', count: doneCount, color: 'text-emerald-300', bg: 'bg-emerald-900/20 border border-emerald-800/40' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-lg px-4 py-3 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-zinc-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ALL_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
            }`}
          >
            {f}
            {f !== '全部' && (
              <span className={`ml-1 ${filter === f ? 'text-blue-200' : 'text-zinc-500'}`}>
                ({tasks.filter(t => t.tag === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map(col => {
          const colTasks = filtered.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col">
              <div className={`flex items-center justify-between px-4 py-3 border-b-2 ${col.accent} rounded-t-xl`}>
                <h2 className="text-white font-semibold">{col.label}</h2>
                <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {colTasks.length}
                </span>
              </div>

              <div className="p-3 space-y-3 flex-1 min-h-[160px]">
                {colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => setEditTask(task)}
                    onClaude={() => { setClaudeTask(task); setCopied(false) }}
                    onMove={moveTask}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-zinc-600 text-sm">
                    暂无任务
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit / Add Modal */}
      {editTask !== null && (
        <TaskModal
          task={editTask}
          onSave={saveTask}
          onDelete={editTask.id ? () => deleteTask(editTask.id!) : undefined}
          onClose={() => setEditTask(null)}
        />
      )}

      {/* Claude Modal */}
      {claudeTask && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) { setClaudeTask(null); setCopied(false) } }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white font-semibold">派给 Claude</h3>
              <button
                onClick={() => { setClaudeTask(null); setCopied(false) }}
                className="text-zinc-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-zinc-500 text-xs mb-3">复制以下内容，粘贴给 Claude 即可开始任务</p>

            <div className={`text-xs px-2 py-1 rounded-full inline-flex mb-3 ${TAG_COLORS[claudeTask.tag] ?? 'bg-zinc-700 text-zinc-300'}`}>
              {claudeTask.tag}
            </div>

            <textarea
              ref={claudeRef}
              readOnly
              value={buildClaudePrompt(claudeTask)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-300 text-sm font-mono resize-none h-48 focus:outline-none"
              onClick={e => (e.target as HTMLTextAreaElement).select()}
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(buildClaudePrompt(claudeTask))
                setCopied(true)
              }}
              className={`mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? '已复制 ✓' : '复制内容'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
