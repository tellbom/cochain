import { ChevronLeft, ChevronRight, X, RefreshCw, Search, AlertCircle } from "lucide-react"
import type { BatchStatus } from "../mock"

// ─── Status Badges ────────────────────────────────────────────────────────────

const BATCH_STATUS_MAP: Record<BatchStatus, { label: string; cls: string }> = {
  DRAFT:       { label: "草稿",    cls: "bg-[#f5f5f7] text-[#7a7a7a] border-[#e0e0e0]" },
  DATA_READY:  { label: "数据就绪", cls: "bg-[#e8f1fb] text-[#0055aa] border-[#b3d0f5]" },
  PACKAGED:    { label: "已分包",   cls: "bg-[#f3eaff] text-[#7030c0] border-[#d5b0f5]" },
  RECOMMENDED: { label: "已推荐",   cls: "bg-[#fff3e0] text-[#b54708] border-[#f5c77e]" },
  COMPLETED:   { label: "已完成",   cls: "bg-[#f0faf0] text-[#1a7f3c] border-[#b7ebc0]" },
}

export function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const { label, cls } = BATCH_STATUS_MAP[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-[5px] rounded-[6px] text-[12px] font-semibold border ${cls}`}>
      {label}
    </span>
  )
}

export function EnabledBadge({ enabled }: { enabled: number }) {
  if (enabled === 1)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-[6px] text-[12px] font-medium bg-[#f0faf0] text-[#1a7f3c] border border-[#b7ebc0]">
        <span className="w-[6px] h-[6px] rounded-full bg-[#34c759] shrink-0" />
        启用
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-[6px] text-[12px] font-medium bg-[#f5f5f7] text-[#7a7a7a] border border-[#e0e0e0]">
      <span className="w-[6px] h-[6px] rounded-full bg-[#b0b0b0] shrink-0" />
      停用
    </span>
  )
}

const SOURCE_MAP: Record<string, { label: string; cls: string }> = {
  HISTORY:       { label: "历史供应商", cls: "bg-[#e8f1fb] text-[#0055aa] border-[#b3d0f5]" },
  QUALITY_ROUND: { label: "优质轮询",   cls: "bg-[#f0faf0] text-[#1a7f3c] border-[#b7ebc0]" },
  NORMAL_ROUND:  { label: "普通轮询",   cls: "bg-[#f5f5f7] text-[#555] border-[#e0e0e0]" },
  ALL_CATEGORY:  { label: "全品类补位", cls: "bg-[#fff3e0] text-[#b54708] border-[#f5c77e]" },
  MANUAL:        { label: "手动添加",   cls: "bg-[#fffbf0] text-[#7a4000] border-[#f5c77e]" },
}

export function SourceBadge({ source }: { source: string }) {
  const { label, cls } = SOURCE_MAP[source] ?? { label: source, cls: "bg-[#f5f5f7] text-[#555] border-[#e0e0e0]" }
  return (
    <span className={`inline-flex items-center px-2 py-[3px] rounded-[5px] text-[11px] font-medium border ${cls}`}>
      {label}
    </span>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function PageHeader({ section, title, desc, children }: {
  section: string; title: string; desc?: string; children?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
      <div>
        <div className="text-[12px] font-medium text-[#0066cc] mb-0.5">{section}</div>
        <h1 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">{title}</h1>
        {desc && <p className="text-[13px] text-[#7a7a7a] mt-1 max-w-2xl">{desc}</p>}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  )
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[14px] border border-[#e0e0e0] overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

// ─── Table primitives ─────────────────────────────────────────────────────────

export function Th({ children, right, center }: { children: React.ReactNode; right?: boolean; center?: boolean }) {
  return (
    <th className={`py-3 px-4 text-[12px] font-semibold text-[#7a7a7a] bg-[#fafafa] border-b border-[#f0f0f0] whitespace-nowrap ${right ? "text-right" : center ? "text-center" : "text-left"}`}>
      {children}
    </th>
  )
}

export function Td({ children, right, center, className = "" }: { children: React.ReactNode; right?: boolean; center?: boolean; className?: string }) {
  return (
    <td className={`py-3.5 px-4 text-[13px] ${right ? "text-right" : center ? "text-center" : ""} ${className}`}>
      {children}
    </td>
  )
}

export function EmptyRow({ cols, text = "暂无数据" }: { cols: number; text?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center text-[13px] text-[#b0b0b0]">{text}</td>
    </tr>
  )
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

export function SearchBar({ keyword, onKeywordChange, onSearch, onReset, placeholder = "输入关键词查询", children }: {
  keyword: string
  onKeywordChange: (v: string) => void
  onSearch: () => void
  onReset: () => void
  placeholder?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-[#f0f0f0] flex-wrap">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] pointer-events-none" />
        <input
          type="text"
          value={keyword}
          onChange={e => onKeywordChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSearch()}
          placeholder={placeholder}
          className="h-9 w-56 pl-9 pr-3 rounded-[8px] border border-[#e0e0e0] text-[13px] bg-white placeholder:text-[#c0c0c0] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all"
        />
      </div>
      {children}
      <button onClick={onSearch} className="h-9 px-4 rounded-full bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] active:scale-95 transition-all">
        查询
      </button>
      <button onClick={onReset} className="h-9 px-4 rounded-[8px] border border-[#e0e0e0] text-[#333] text-[13px] hover:bg-[#f5f5f7] active:scale-95 transition-all flex items-center gap-1.5">
        <RefreshCw size={12} />重置
      </button>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({ total, page, pageSize, onChange }: {
  total: number; page: number; pageSize: number; onChange: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-[#f0f0f0]">
      <span className="text-[12px] text-[#7a7a7a]">共 {total} 条</span>
      <span className="text-[12px] text-[#7a7a7a]">{pageSize} 条/页</span>
      <div className="flex items-center gap-1">
        <PagBtn disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={13} /></PagBtn>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = i + 1
          return (
            <PagBtn key={p} active={p === page} onClick={() => onChange(p)}>{p}</PagBtn>
          )
        })}
        <PagBtn disabled={page >= totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={13} /></PagBtn>
      </div>
    </div>
  )
}

function PagBtn({ children, disabled, active, onClick }: { children: React.ReactNode; disabled?: boolean; active?: boolean; onClick?: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded-[7px] text-[13px] font-medium transition-colors border
        ${active ? "bg-[#0066cc] text-white border-[#0066cc]" : "border-[#e0e0e0] text-[#333] hover:bg-[#f5f5f7]"}
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative z-10 bg-white rounded-[18px] shadow-2xl shadow-black/20 mx-4 overflow-hidden flex flex-col max-h-[90vh] ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] shrink-0">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f5f5f7] text-[#7a7a7a] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function ModalFooter({ onClose, onSave, saveLabel = "保存", danger }: {
  onClose: () => void; onSave: () => void; saveLabel?: string; danger?: boolean
}) {
  return (
    <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-[#f0f0f0]">
      <button onClick={onClose} className="h-9 px-5 rounded-[8px] border border-[#e0e0e0] text-[13px] font-medium text-[#333] hover:bg-[#f5f5f7] transition-colors">
        取消
      </button>
      <button
        onClick={onSave}
        className={`h-9 px-5 rounded-[8px] text-white text-[13px] font-medium transition-colors ${danger ? "bg-[#e74c3c] hover:bg-[#c0392b]" : "bg-[#0066cc] hover:bg-[#0055b0]"}`}
      >
        {saveLabel}
      </button>
    </div>
  )
}

// ─── Form primitives ──────────────────────────────────────────────────────────

export function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-[#333]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#7a7a7a]">{hint}</p>}
    </div>
  )
}

const inputCls = "w-full h-9 px-3 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all bg-white disabled:bg-[#f5f5f7] disabled:text-[#7a7a7a] disabled:cursor-not-allowed"

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all resize-none"
    />
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

export function ConfirmDialog({ message, onConfirm, onCancel, danger = true }: {
  message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean
}) {
  return (
    <Modal title="确认操作" onClose={onCancel}>
      <div className="flex gap-3">
        <AlertCircle size={20} className={`shrink-0 mt-0.5 ${danger ? "text-[#e74c3c]" : "text-[#0066cc]"}`} />
        <p className="text-[14px] text-[#333]">{message}</p>
      </div>
      <ModalFooter onClose={onCancel} onSave={onConfirm} saveLabel="确定" danger={danger} />
    </Modal>
  )
}

// ─── Blue action link ─────────────────────────────────────────────────────────

export function ActionLink({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`text-[13px] font-medium hover:underline transition-colors ${danger ? "text-[#e74c3c]" : "text-[#0066cc]"}`}
    >
      {children}
    </button>
  )
}

// ─── Loading spinner ──────────────────────────────────────────────────────────

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      className="animate-spin text-white"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────

export function TabBar({ tabs, active, onChange }: {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex border-b border-[#f0f0f0] mb-5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
            tab.id === active
              ? "border-[#0066cc] text-[#0066cc]"
              : "border-transparent text-[#7a7a7a] hover:text-[#333]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="mb-3 text-[#d0d0d0]">{icon}</div>}
      <p className="text-[14px] font-medium text-[#7a7a7a]">{title}</p>
      {desc && <p className="text-[12px] text-[#b0b0b0] mt-1">{desc}</p>}
    </div>
  )
}

// ─── Info row (key-value) ──────────────────────────────────────────────────────

export function InfoGrid({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-baseline gap-2">
          <span className="text-[12px] text-[#7a7a7a] shrink-0 w-28">{label}</span>
          <span className="text-[13px] font-medium text-[#1d1d1f]">{value ?? "—"}</span>
        </div>
      ))}
    </div>
  )
}
