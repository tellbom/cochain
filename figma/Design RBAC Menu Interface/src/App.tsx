import { useState } from "react"
import {
  Package, Users, BarChart2, Settings, FileText,
  ChevronDown, Menu, LogOut, User, Layers,
} from "lucide-react"
import BatchList from "./views/BatchList"
import BatchWorkbench from "./views/BatchWorkbench"
import SupplierCenter from "./views/SupplierCenter"
import PerformanceRanking from "./views/PerformanceRanking"
import RuleConfig from "./views/RuleConfig"
import Logs from "./views/Logs"

import CategorySupplierView from "./views/CategorySupplierView"

// ─── Types & Nav config ───────────────────────────────────────────────────────

type ViewKey = "batch-list" | "batch-workbench" | "supplier-center" | "category-supplier" | "performance" | "rule-config" | "logs"

const NAV_GROUPS = [
  {
    id: "subcontract",
    label: "分包中心",
    icon: Package,
    view: "batch-list" as ViewKey,
    children: [] as { id: ViewKey; label: string }[],
  },
  {
    id: "supplier",
    label: "供应商中心",
    icon: Users,
    view: "supplier-center" as ViewKey,
    children: [],
  },
  {
    id: "category-supplier",
    label: "品类供方大盘",
    icon: Layers,
    view: "category-supplier" as ViewKey,
    children: [],
  },
  {
    id: "performance",
    label: "供应商绩效与排名",
    icon: BarChart2,
    view: "performance" as ViewKey,
    children: [],
  },
  {
    id: "rules",
    label: "规则配置",
    icon: Settings,
    view: "rule-config" as ViewKey,
    children: [],
  },
  {
    id: "logs",
    label: "日志记录",
    icon: FileText,
    view: "logs" as ViewKey,
    children: [],
  },
]

// ─── Cochain Logo ─────────────────────────────────────────────────────────────

function CochainIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="30" rx="8" fill="#0066cc" />
      {/* Chain link left */}
      <ellipse cx="11" cy="15" rx="5" ry="3.5" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Chain link right */}
      <ellipse cx="19" cy="15" rx="5" ry="3.5" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Overlap mask */}
      <rect x="13.5" y="11" width="3" height="8" fill="#0066cc" />
      {/* Center connecting line */}
      <rect x="13.5" y="13.2" width="3" height="3.6" fill="#0066cc" />
      <line x1="13.5" y1="13.2" x2="16.5" y2="13.2" stroke="white" strokeWidth="2" />
      <line x1="13.5" y1="16.8" x2="16.5" y2="16.8" stroke="white" strokeWidth="2" />
    </svg>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

const VIEW_META: Record<ViewKey, { section: string; label: string }> = {
  "batch-list":        { section: "分包中心",      label: "分包批次列表" },
  "batch-workbench":   { section: "分包中心",      label: "批次工作台" },
  "supplier-center":   { section: "供应商中心",    label: "供应商管理" },
  "category-supplier": { section: "品类视图",      label: "品类供方大盘" },
  "performance":       { section: "供应商中心",    label: "供应商绩效与排名" },
  "rule-config":       { section: "规则配置",      label: "规则配置" },
  "logs":              { section: "日志记录",      label: "日志记录" },
}

function Header({
  view,
  sidebarOpen,
  onToggle,
  userOpen,
  onUserToggle,
}: {
  view: ViewKey
  sidebarOpen: boolean
  onToggle: () => void
  userOpen: boolean
  onUserToggle: (e: React.MouseEvent) => void
}) {
  const meta = VIEW_META[view]
  const crumbs = ["Cochain", "后台", meta.label]

  return (
    <header className="h-[52px] bg-white border-b border-[#ebebeb] flex items-center shrink-0 z-20">
      {/* Logo section */}
      <div className="w-[220px] shrink-0 flex items-center justify-between px-4 border-r border-[#ebebeb] h-full">
        <div className="flex items-center gap-2.5">
          <CochainIcon />
          <div>
            <div className="text-[14px] font-bold text-[#1d1d1f] leading-tight tracking-tight">Cochain</div>
            <div className="text-[10px] text-[#7a7a7a] leading-tight">采购协同平台</div>
          </div>
        </div>
        <button onClick={onToggle} className="w-8 h-8 flex items-center justify-center rounded-[7px] text-[#7a7a7a] hover:bg-[#f5f5f7] transition-colors">
          <Menu size={16} />
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex-1 flex items-center px-5 gap-1.5 min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <span className="text-[#d0d0d0]">/</span>}
            <span className={`text-[13px] ${i === crumbs.length - 1 ? "text-[#1d1d1f] font-medium" : "text-[#7a7a7a]"}`}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* User */}
      <div className="px-4 relative">
        <button
          onClick={onUserToggle}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-[9px] hover:bg-[#f5f5f7] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-[11px] font-bold shrink-0">A</div>
          <div className="text-left">
            <div className="text-[13px] font-semibold text-[#1d1d1f] leading-tight">Bootstrap Admin</div>
            <div className="text-[10px] text-[#7a7a7a] leading-tight">cochain</div>
          </div>
          <ChevronDown size={13} className={`text-[#b0b0b0] transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`} />
        </button>

        {userOpen && (
          <div className="absolute right-4 top-full mt-2 w-44 bg-white rounded-[12px] border border-[#e0e0e0] shadow-lg shadow-black/10 overflow-hidden z-50">
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#333] hover:bg-[#f5f5f7] transition-colors">
              <User size={14} className="text-[#7a7a7a]" /> 个人设置
            </button>
            <div className="border-t border-[#f0f0f0]" />
            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#e74c3c] hover:bg-[#fff5f5] transition-colors">
              <LogOut size={14} /> 退出登录
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ view, onSelect }: { view: ViewKey; onSelect: (v: ViewKey) => void }) {
  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#ebebeb] flex flex-col overflow-y-auto">
      <nav className="flex-1 py-3">
        {NAV_GROUPS.map(group => {
          const Icon = group.icon
          const isActive = view === group.view || (group.view === "batch-list" && view === "batch-workbench")
          return (
            <button
              key={group.id}
              onClick={() => onSelect(group.view)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
                isActive
                  ? "text-[#0066cc] bg-[#e8f1fb]"
                  : "text-[#333] hover:bg-[#f5f5f7]"
              }`}
            >
              {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0066cc] rounded-r-full" />}
              <Icon size={16} className={isActive ? "text-[#0066cc]" : "text-[#7a7a7a]"} />
              <span>{group.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[#ebebeb]">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[#7a7a7a] hover:bg-[#fff5f5] hover:text-[#e74c3c] transition-colors group text-[12px] font-medium">
          <LogOut size={14} /> 退出登录
        </button>
      </div>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<ViewKey>("batch-list")
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userOpen, setUserOpen] = useState(false)

  const handleSelect = (v: ViewKey) => {
    setView(v)
    setUserOpen(false)
  }

  const handleEnterWorkbench = (batchId: string) => {
    setSelectedBatchId(batchId)
    setView("batch-workbench")
  }

  const handleBackFromWorkbench = () => {
    setView("batch-list")
    setSelectedBatchId(null)
  }

  return (
    <div
      className="flex flex-col h-screen bg-[#f5f5f7] overflow-hidden"
      onClick={() => userOpen && setUserOpen(false)}
    >
      <Header
        view={view}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
        userOpen={userOpen}
        onUserToggle={e => { e.stopPropagation(); setUserOpen(p => !p) }}
      />

      <div className="flex flex-1 min-h-0">
        {sidebarOpen && (
          <Sidebar view={view} onSelect={handleSelect} />
        )}

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {view === "batch-list" && (
            <BatchList onEnterWorkbench={handleEnterWorkbench} />
          )}
          {view === "batch-workbench" && selectedBatchId && (
            <BatchWorkbench batchId={selectedBatchId} onBack={handleBackFromWorkbench} />
          )}
          {view === "supplier-center" && <SupplierCenter />}
          {view === "category-supplier" && <CategorySupplierView />}
          {view === "performance"     && <PerformanceRanking />}
          {view === "rule-config"     && <RuleConfig />}
          {view === "logs"            && <Logs />}
        </main>
      </div>
    </div>
  )
}
