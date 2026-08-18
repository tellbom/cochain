import { useState, useMemo } from "react"
import { ChevronLeft, Package, Users, Download, Zap, ArrowRightLeft, Info, FileText, Plus } from "lucide-react"
import { BATCHES, PACKAGES, BATCH_PARTS, RECOMMENDATIONS, SUPPLIERS, type PackageVO, type BatchPartVO, type SupplierRecommendationVO } from "../mock"
import {
  BatchStatusBadge, Card, Th, Td, EmptyRow, Pagination, Modal, ModalFooter,
  FormField, FormSelect, SourceBadge, EmptyState, InfoGrid, Spinner,
} from "../components/ui"

interface Props {
  batchId: string
  onBack: () => void
}

export default function BatchWorkbench({ batchId, onBack }: Props) {
  const batch = BATCHES.find(b => b.id === batchId)
  const [status, setStatus] = useState(batch?.batchStatus ?? "DATA_READY")
  const [packages, setPackages] = useState<PackageVO[]>(PACKAGES.filter(p => p.batchId === batchId))
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null)
  const [tab, setTab] = useState("parts")
  const [generating, setGenerating] = useState(false)
  const [recommending, setRecommending] = useState(false)
  const [orchestrating, setOrchestrating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [partPage, setPartPage] = useState(1)
  const [recPage, setRecPage] = useState(1)
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([])
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveTargetId, setMoveTargetId] = useState("")
  const [showPartDetail, setShowPartDetail] = useState<BatchPartVO | null>(null)
  // custom supplier additions per package (only when RECOMMENDED)
  const [customRecs, setCustomRecs] = useState<Record<string, string[]>>({})
  const [addSupplierDraft, setAddSupplierDraft] = useState("")

  const selectedPkg = packages.find(p => p.id === selectedPkgId)

  const pkgParts = useMemo(
    () => BATCH_PARTS.filter(p => p.batchId === batchId && p.packageId === selectedPkgId),
    [batchId, selectedPkgId]
  )

  const pkgRecs = useMemo(
    () => RECOMMENDATIONS.filter(r => r.batchId === batchId && r.packageId === selectedPkgId),
    [batchId, selectedPkgId]
  )

  const PAGE_SIZE = 8

  const handleGeneratePackages = () => {
    setGenerating(true)
    setTimeout(() => {
      const newPkgs: PackageVO[] = [
        { id: `p-new-001`, batchId, packageNo: "PKG-NEW-001", categoryId: "cat001", categoryName: "铝合金钣金件", supplierCountNeeded: 2, recommendCount: 6, partCount: 18, partType: "小型", maxPartLimit: 20, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "" },
        { id: `p-new-002`, batchId, packageNo: "PKG-NEW-002", categoryId: "cat002", categoryName: "钛合金机加工件", supplierCountNeeded: 3, recommendCount: 7, partCount: 9, partType: "中型", maxPartLimit: 10, hasHistorySupplier: 0, isSpecialCategory: 0, specialType: "", recommendationStatus: "" },
        { id: `p-new-003`, batchId, packageNo: "PKG-NEW-003", categoryId: "cat001", categoryName: "铝合金钣金件", supplierCountNeeded: 2, recommendCount: 6, partCount: 15, partType: "小型", maxPartLimit: 20, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "" },
      ]
      setPackages(newPkgs)
      setStatus("PACKAGED")
      setSelectedPkgId(newPkgs[0].id)
      setGenerating(false)
    }, 1800)
  }

  const handleRecommend = () => {
    setRecommending(true)
    setTimeout(() => {
      setPackages(prev => prev.map(p => ({ ...p, recommendationStatus: "DONE" })))
      setStatus("RECOMMENDED")
      setRecommending(false)
    }, 2000)
  }

  const handleOrchestrate = () => {
    setOrchestrating(true)
    setTimeout(() => {
      const newPkgs: PackageVO[] = [
        { id: `p-orch-001`, batchId, packageNo: "PKG-ORCH-001", categoryId: "cat001", categoryName: "铝合金钣金件", supplierCountNeeded: 2, recommendCount: 6, partCount: 20, partType: "小型", maxPartLimit: 20, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "DONE" },
        { id: `p-orch-002`, batchId, packageNo: "PKG-ORCH-002", categoryId: "cat002", categoryName: "钛合金机加工件", supplierCountNeeded: 3, recommendCount: 7, partCount: 10, partType: "中型", maxPartLimit: 10, hasHistorySupplier: 1, isSpecialCategory: 0, specialType: "", recommendationStatus: "DONE" },
      ]
      setPackages(newPkgs)
      setStatus("RECOMMENDED")
      setSelectedPkgId(newPkgs[0].id)
      setOrchestrating(false)
    }, 2500)
  }

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      setExportDone(true)
      setStatus("COMPLETED")
      setTimeout(() => setExportDone(false), 2000)
    }, 1500)
  }

  const handleMove = () => {
    if (!moveTargetId || selectedPartIds.length === 0) return
    setShowMoveModal(false)
    setSelectedPartIds([])
    setMoveTargetId("")
  }

  const togglePart = (id: string) => {
    setSelectedPartIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAllParts = () => {
    if (selectedPartIds.length === pkgParts.length) setSelectedPartIds([])
    else setSelectedPartIds(pkgParts.map(p => p.id))
  }

  const pagedParts = pkgParts.slice((partPage - 1) * PAGE_SIZE, partPage * PAGE_SIZE)
  const pagedRecs = pkgRecs.slice((recPage - 1) * PAGE_SIZE, recPage * PAGE_SIZE)

  if (!batch) return null

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 bg-white border-b border-[#ebebeb] px-6 py-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#0066cc] hover:underline mb-3">
          <ChevronLeft size={14} /> 返回批次列表
        </button>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="text-[11px] text-[#7a7a7a] mb-0.5">批次编号</div>
            <div className="font-mono font-semibold text-[14px] text-[#1d1d1f]">{batch.batchNo}</div>
          </div>
          <div className="w-px h-8 bg-[#e0e0e0]" />
          <BatchStatusBadge status={status} />
          {batch.flowNo && (
            <>
              <div className="w-px h-8 bg-[#e0e0e0]" />
              <div>
                <div className="text-[11px] text-[#7a7a7a]">流程编号</div>
                <div className="font-mono text-[13px] text-[#555]">{batch.flowNo}</div>
              </div>
            </>
          )}
          <div className="w-px h-8 bg-[#e0e0e0]" />
          <div className="flex gap-4 text-[13px]">
            <span><span className="text-[#7a7a7a]">零件：</span><strong>{batch.totalPartCount}</strong></span>
            <span><span className="text-[#7a7a7a]">工作包：</span><strong>{packages.length}</strong></span>
            <span><span className="text-[#7a7a7a]">操作人：</span>{batch.operator}</span>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            {status === "DATA_READY" && (
              <ActionBtn onClick={handleGeneratePackages} loading={generating} icon={<Package size={14} />}>
                生成工作包
              </ActionBtn>
            )}
            {(status === "PACKAGED") && (
              <ActionBtn onClick={handleRecommend} loading={recommending} icon={<Users size={14} />}>
                生成供应商推荐
              </ActionBtn>
            )}
            <ActionBtn onClick={handleOrchestrate} loading={orchestrating} icon={<Zap size={14} />} secondary>
              一键编排
            </ActionBtn>
            <ActionBtn
              onClick={handleExport} loading={exporting} icon={<Download size={14} />}
              secondary className={exportDone ? "!border-[#34c759] !text-[#1a7f3c]" : ""}
            >
              {exportDone ? "✓ 导出成功" : "导出 Excel"}
            </ActionBtn>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden bg-[#f5f5f7]">
        {/* No packages state */}
        {packages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Package size={48} className="mx-auto mb-4 text-[#d0d0d0]" />
              <p className="text-[15px] font-medium text-[#7a7a7a]">
                {status === "DATA_READY" ? "点击【生成工作包】开始分包" : "暂无工作包数据"}
              </p>
              {status === "DATA_READY" && (
                <button
                  onClick={handleGeneratePackages}
                  disabled={generating}
                  className="mt-4 h-10 px-6 rounded-[10px] bg-[#0066cc] text-white text-[14px] font-medium hover:bg-[#0055b0] disabled:opacity-60 flex items-center gap-2 mx-auto"
                >
                  {generating && <Spinner size={14} />}
                  {generating ? "生成中…" : "生成工作包"}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Package list sidebar */}
            <div className="w-[260px] shrink-0 bg-white border-r border-[#ebebeb] overflow-y-auto">
              <div className="px-4 py-3 border-b border-[#f0f0f0]">
                <div className="text-[12px] font-semibold text-[#7a7a7a]">工作包列表 ({packages.length})</div>
              </div>
              <div className="p-3 space-y-2">
                {packages.map(pkg => (
                  <button
                    key={pkg.id}
                    onClick={() => { setSelectedPkgId(pkg.id); setSelectedPartIds([]); setPartPage(1); setRecPage(1) }}
                    className={`w-full text-left p-3 rounded-[10px] border transition-all ${
                      pkg.id === selectedPkgId
                        ? "border-[#0066cc] bg-[#e8f1fb]"
                        : "border-[#e0e0e0] bg-white hover:bg-[#fafafa]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`font-mono text-[11px] font-semibold ${pkg.id === selectedPkgId ? "text-[#0055aa]" : "text-[#555]"}`}>
                        {pkg.packageNo}
                      </span>
                      {pkg.recommendationStatus === "DONE" && (
                        <span className="text-[10px] font-medium text-[#1a7f3c] bg-[#f0faf0] px-1.5 py-0.5 rounded">已推荐</span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#555] truncate">{pkg.categoryName}</div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#7a7a7a]">
                      <span>零件 {pkg.partCount}</span>
                      <span>·</span>
                      <span>{pkg.partType}</span>
                      {pkg.isSpecialCategory === 1 && (
                        <span className="text-[#b54708] bg-[#fff3e0] px-1.5 py-0.5 rounded text-[10px] font-medium">特殊品类</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Package detail */}
            {selectedPkg ? (
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-5">
                {/* Package info */}
                <Card className="shrink-0 mb-4">
                  <div className="px-5 py-3 border-b border-[#f0f0f0]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[13px] font-semibold text-[#1d1d1f]">{selectedPkg.packageNo}</span>
                      <span className="text-[12px] text-[#7a7a7a]">{selectedPkg.categoryName}</span>
                      {selectedPkg.isSpecialCategory === 1 && (
                        <span className="text-[11px] font-medium text-[#b54708] bg-[#fff3e0] px-2 py-0.5 rounded-[5px] border border-[#f5c77e]">
                          特殊品类 · {selectedPkg.specialType}
                        </span>
                      )}
                      {selectedPkg.hasHistorySupplier === 1 && (
                        <span className="text-[11px] font-medium text-[#0055aa] bg-[#e8f1fb] px-2 py-0.5 rounded-[5px] border border-[#b3d0f5]">有历史供应商</span>
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-3">
                    <InfoGrid items={[
                      { label: "零件类型", value: selectedPkg.partType },
                      { label: "零件数量", value: `${selectedPkg.partCount} / ${selectedPkg.maxPartLimit}（容量上限）` },
                      { label: "供应商需求数", value: selectedPkg.supplierCountNeeded },
                      { label: "应推荐供应商数", value: selectedPkg.recommendCount },
                    ]} />
                  </div>
                </Card>

                {/* Tabs */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Tab header row with optional inline add-supplier control */}
                  <div className="flex items-center border-b border-[#f0f0f0] mb-5">
                    {[
                      { id: "parts", label: `零件明细 (${selectedPkg.partCount})` },
                      { id: "recs", label: `推荐结果 (${pkgRecs.length + (customRecs[selectedPkgId ?? ""] ?? []).length})` },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTab(t.id); setSelectedPartIds([]) }}
                        className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                          t.id === tab
                            ? "border-[#0066cc] text-[#0066cc]"
                            : "border-transparent text-[#7a7a7a] hover:text-[#333]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                    {/* Inline add-supplier: only when on recs tab and batch is RECOMMENDED */}
                    {tab === "recs" && status === "RECOMMENDED" && selectedPkgId && (
                      <div className="ml-auto flex items-center gap-2 pb-2.5">
                        <span className="text-[11px] text-[#999] font-medium tracking-wide">手动添加</span>
                        <select
                          value={addSupplierDraft}
                          onChange={e => setAddSupplierDraft(e.target.value)}
                          className="h-7 px-2.5 rounded-[7px] border border-[#d8d8d8] text-[12px] text-[#1d1d1f] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20 focus:border-[#0066cc] transition-all min-w-[160px]"
                        >
                          <option value="">选择供应商…</option>
                          {SUPPLIERS.filter(s => {
                            const alreadyInRecs = pkgRecs.some(r => r.supplierId === s.id)
                            const alreadyCustom = (customRecs[selectedPkgId] ?? []).includes(s.id)
                            return s.enabled === 1 && !alreadyInRecs && !alreadyCustom
                          }).map(s => (
                            <option key={s.id} value={s.id}>{s.supplierName}</option>
                          ))}
                        </select>
                        <button
                          disabled={!addSupplierDraft}
                          onClick={() => {
                            if (!addSupplierDraft || !selectedPkgId) return
                            setCustomRecs(prev => ({
                              ...prev,
                              [selectedPkgId]: [...(prev[selectedPkgId] ?? []), addSupplierDraft],
                            }))
                            setAddSupplierDraft("")
                          }}
                          className="h-7 px-3 rounded-[7px] bg-[#0066cc] text-white text-[12px] font-medium hover:bg-[#0055b0] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                        >
                          <Plus size={11} /> 添加
                        </button>
                      </div>
                    )}
                  </div>

                  {tab === "parts" && (
                    <div className="flex-1 min-h-0 flex flex-col">
                      {status === "RECOMMENDED" && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#fff3e0] border border-[#f5c77e] rounded-[10px] mb-3 text-[12px] text-[#b54708]">
                          <ArrowRightLeft size={13} />
                          <span>批次已处于【已推荐】状态，不允许执行移包操作。</span>
                        </div>
                      )}
                      {status !== "RECOMMENDED" && selectedPartIds.length > 0 && (
                        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#e8f1fb] rounded-[10px] mb-3 text-[13px]">
                          <span className="text-[#0055aa] font-medium">已选 {selectedPartIds.length} 个零件</span>
                          <span className="text-[#7a7a7a] text-[11px]">套裁关联组将作为整体移动</span>
                          <button
                            onClick={() => setShowMoveModal(true)}
                            className="ml-auto h-7 px-3 rounded-[7px] bg-[#0066cc] text-white text-[12px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5"
                          >
                            <ArrowRightLeft size={12} /> 调包
                          </button>
                          <button onClick={() => setSelectedPartIds([])} className="text-[#7a7a7a] hover:text-[#333] text-[12px]">取消</button>
                        </div>
                      )}
                      <Card className="flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto flex-1">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                {status !== "RECOMMENDED" && (
                                  <Th center>
                                    <input type="checkbox" checked={pkgParts.length > 0 && selectedPartIds.length === pkgParts.length} onChange={selectAllParts}
                                      className="rounded" />
                                  </Th>
                                )}
                                <Th>序号</Th>
                                <Th>零件图号</Th>
                                <Th>零件名称</Th>
                                <Th>材料类型</Th>
                                <Th>尺寸（长×宽）</Th>
                                <Th>套裁信息</Th>
                                <Th>历史供应商</Th>
                                <Th center>操作</Th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f5f5f7]">
                              {pagedParts.length === 0
                                ? <EmptyRow cols={9} text="暂无零件数据（示例批次不含此包零件）" />
                                : pagedParts.map(part => (
                                  <tr key={part.id} className={`hover:bg-[#fafafa] transition-colors ${selectedPartIds.includes(part.id) ? "bg-[#f0f7ff]" : ""}`}>
                                    {status !== "RECOMMENDED" && (
                                      <Td center>
                                        <input type="checkbox" checked={selectedPartIds.includes(part.id)} onChange={() => togglePart(part.id)} className="rounded" />
                                      </Td>
                                    )}
                                    <Td center className="text-[#7a7a7a]">{part.seqNo}</Td>
                                    <Td>
                                      <span className="font-mono text-[12px] text-[#0066cc]">{part.partDrawingNo}</span>
                                    </Td>
                                    <Td><span className="font-medium">{part.partName}</span></Td>
                                    <Td className="text-[#7a7a7a]">{part.materialType}</Td>
                                    <Td className="text-[#7a7a7a] text-[12px]">{part.lengthValue} × {part.widthValue} mm</Td>
                                    <Td>
                                      {part.nestingInfo
                                        ? <span className="text-[11px] font-medium text-[#7030c0] bg-[#f3eaff] px-2 py-0.5 rounded">{part.nestingInfo}</span>
                                        : <span className="text-[#d0d0d0]">—</span>}
                                    </Td>
                                    <Td className="text-[12px] text-[#7a7a7a]">
                                      {[part.historySupplier1, part.historySupplier2, part.historySupplier3].filter(Boolean).join("、") || "—"}
                                    </Td>
                                    <Td center>
                                      <button onClick={() => setShowPartDetail(part)} className="text-[12px] text-[#0066cc] hover:underline flex items-center gap-1 mx-auto">
                                        <Info size={12} /> 详情
                                      </button>
                                    </Td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                        <Pagination total={pkgParts.length} page={partPage} pageSize={PAGE_SIZE} onChange={setPartPage} />
                      </Card>
                    </div>
                  )}

                  {tab === "recs" && (
                    <div className="flex-1 min-h-0 flex flex-col gap-3">
                      <Card className="flex-1 overflow-hidden flex flex-col">
                        {pkgRecs.length === 0 ? (
                          <EmptyState
                            icon={<Users size={40} />}
                            title="暂无推荐结果"
                            desc={status === "PACKAGED" ? "分包已完成，点击顶部【生成供应商推荐】按钮" : ""}
                          />
                        ) : (
                          <>
                            <div className="overflow-x-auto flex-1">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr>
                                    <Th center>推荐顺序</Th>
                                    <Th>供应商名称</Th>
                                    <Th>推荐来源</Th>
                                    <Th center>质量等级</Th>
                                    <Th right>绩效得分</Th>
                                    {status === "RECOMMENDED" && <Th center>操作</Th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f5f5f7]">
                                  {pagedRecs.map(rec => (
                                    <tr key={rec.id} className="hover:bg-[#fafafa] transition-colors">
                                      <Td center>
                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                                          rec.recommendOrder <= 2 ? "bg-[#0066cc] text-white" : "bg-[#f5f5f7] text-[#555]"
                                        }`}>{rec.recommendOrder}</span>
                                      </Td>
                                      <Td><span className="font-medium text-[#1d1d1f]">{rec.supplierName}</span></Td>
                                      <Td><SourceBadge source={rec.recommendSource} /></Td>
                                      <Td center>
                                        <span className={`text-[12px] font-semibold ${rec.qualityLevel === "优质" ? "text-[#1a7f3c]" : "text-[#7a7a7a]"}`}>
                                          {rec.qualityLevel}
                                        </span>
                                      </Td>
                                      <Td right>
                                        <span className="font-semibold text-[#1d1d1f]">{rec.performanceScore.toFixed(1)}</span>
                                      </Td>
                                      {status === "RECOMMENDED" && <Td center>—</Td>}
                                    </tr>
                                  ))}
                                  {/* Custom (manual) supplier rows */}
                                  {status === "RECOMMENDED" && (customRecs[selectedPkgId ?? ""] ?? []).map((sid, idx) => {
                                    const sup = SUPPLIERS.find(s => s.id === sid)
                                    if (!sup) return null
                                    const order = pkgRecs.length + idx + 1
                                    return (
                                      <tr key={`custom-${sid}`} className="hover:bg-[#fafafa] transition-colors bg-[#fffbf0]">
                                        <Td center>
                                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold bg-[#f5c77e] text-[#7a4000]">
                                            {order}
                                          </span>
                                        </Td>
                                        <Td>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-[#1d1d1f]">{sup.supplierName}</span>
                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#fff3e0] text-[#b54708] border border-[#f5c77e]">手动</span>
                                          </div>
                                        </Td>
                                        <Td><SourceBadge source="MANUAL" /></Td>
                                        <Td center><span className="text-[12px] text-[#b0b0b0]">—</span></Td>
                                        <Td right><span className="text-[#b0b0b0]">—</span></Td>
                                        <Td center>
                                          <button
                                            onClick={() => setCustomRecs(prev => ({
                                              ...prev,
                                              [selectedPkgId ?? ""]: (prev[selectedPkgId ?? ""] ?? []).filter(id => id !== sid),
                                            }))}
                                            className="text-[12px] text-[#e74c3c] hover:underline"
                                          >移除</button>
                                        </Td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                            <Pagination total={pkgRecs.length} page={recPage} pageSize={PAGE_SIZE} onChange={setRecPage} />
                          </>
                        )}
                      </Card>

                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState icon={<Package size={40} />} title="请选择左侧工作包" desc="点击工作包卡片查看零件明细和推荐结果" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Move parts modal */}
      {showMoveModal && (
        <Modal title="人工调包" onClose={() => setShowMoveModal(false)}>
          <div className="space-y-4">
            <div className="p-3 rounded-[10px] bg-[#fff3e0] border border-[#f5c77e] text-[12px] text-[#b54708]">
              <strong>提示：</strong>人工调包专用接口尚未就绪，操作将仅在前端演示，不提交后端。套裁关联零件将作为整体移动。
            </div>
            <FormField label={`已选零件 (${selectedPartIds.length} 个)`}>
              <div className="text-[13px] text-[#555] bg-[#f5f5f7] rounded-[8px] px-3 py-2">
                {selectedPartIds.map(id => {
                  const p = BATCH_PARTS.find(x => x.id === id)
                  return p ? <div key={id} className="font-mono text-[12px]">{p.partDrawingNo}</div> : null
                })}
              </div>
            </FormField>
            <FormField label="目标工作包">
              <FormSelect value={moveTargetId} onChange={e => setMoveTargetId(e.target.value)}>
                <option value="">请选择目标工作包</option>
                {packages.filter(p => p.id !== selectedPkgId).map(p => (
                  <option key={p.id} value={p.id}>{p.packageNo} — {p.categoryName}</option>
                ))}
              </FormSelect>
            </FormField>
            <ModalFooter
              onClose={() => setShowMoveModal(false)}
              onSave={handleMove}
              saveLabel="确认移动"
            />
          </div>
        </Modal>
      )}

      {/* Part detail modal */}
      {showPartDetail && (
        <Modal title="零件详情" onClose={() => setShowPartDetail(null)} wide>
          <div className="space-y-4">
            <InfoGrid items={[
              { label: "零件图号", value: <span className="font-mono text-[#0066cc]">{showPartDetail.partDrawingNo}</span> },
              { label: "零件名称", value: showPartDetail.partName },
              { label: "机型", value: showPartDetail.aircraftModel },
              { label: "材料类型", value: showPartDetail.materialType },
              { label: "长度", value: `${showPartDetail.lengthValue} mm` },
              { label: "宽度", value: `${showPartDetail.widthValue} mm` },
              { label: "套裁信息", value: showPartDetail.nestingInfo || "—" },
              { label: "三级品类", value: showPartDetail.thirdCategory },
              { label: "零件类型", value: showPartDetail.partType },
              { label: "供应商需求数", value: showPartDetail.supplierCountNeeded },
              { label: "所属工作包", value: <span className="font-mono">{showPartDetail.packageNo}</span> },
              { label: "历史供应商", value: [showPartDetail.historySupplier1, showPartDetail.historySupplier2, showPartDetail.historySupplier3].filter(Boolean).join("、") || "—" },
            ]} />
            <div className="flex justify-end pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setShowPartDetail(null)} className="h-9 px-5 rounded-[8px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0]">关闭</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ActionBtn({ children, onClick, loading, icon, secondary, className = "" }: {
  children: React.ReactNode; onClick: () => void; loading?: boolean; icon?: React.ReactNode; secondary?: boolean; className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`h-9 px-4 rounded-[9px] text-[13px] font-medium flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-60 ${
        secondary
          ? `border border-[#e0e0e0] text-[#333] hover:bg-[#f0f0f0] ${className}`
          : "bg-[#0066cc] text-white hover:bg-[#0055b0]"
      }`}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  )
}
