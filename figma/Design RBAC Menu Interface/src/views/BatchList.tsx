import { useState, useMemo } from "react"
import { Upload, DownloadCloud, Trash2, ChevronRight, AlertTriangle, FileText } from "lucide-react"
import { BATCHES, type BatchVO } from "../mock"
import {
  BatchStatusBadge, PageHeader, Card, Th, Td, EmptyRow,
  SearchBar, Pagination, Modal, ModalFooter, FormField, FormInput,
  FormSelect, ConfirmDialog, ActionLink, Spinner,
} from "../components/ui"

interface Props {
  onEnterWorkbench: (batchId: string) => void
}

export default function BatchList({ onEnterWorkbench }: Props) {
  const [data, setData] = useState<BatchVO[]>(BATCHES)
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [operatorFilter, setOperatorFilter] = useState("")
  const [query, setQuery] = useState({ keyword: "", status: "", operator: "" })
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  // modals
  const [showUpload, setShowUpload] = useState(false)
  const [showFetch, setShowFetch] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BatchVO | null>(null)
  const [importResult, setImportResult] = useState<{
    batchNo: string; totalRows: number; successCount: number; errorCount: number;
    errors: { rowNo: number; message: string }[]
  } | null>(null)

  // upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [aircraftModel, setAircraftModel] = useState("")
  const [operator, setOperator] = useState("")
  const [fetchFlowNo, setFetchFlowNo] = useState("")
  const [fetchOperator, setFetchOperator] = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    return data.filter(b => {
      const kw = query.keyword.toLowerCase()
      const matchKw = !kw || b.batchNo.toLowerCase().includes(kw) || b.flowNo.toLowerCase().includes(kw)
      const matchStatus = !query.status || b.batchStatus === query.status
      const matchOp = !query.operator || b.operator.includes(query.operator)
      return matchKw && matchStatus && matchOp
    })
  }, [data, query])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const doSearch = () => { setQuery({ keyword, status: statusFilter, operator: operatorFilter }); setPage(1) }
  const doReset = () => { setKeyword(""); setStatusFilter(""); setOperatorFilter(""); setQuery({ keyword: "", status: "", operator: "" }); setPage(1) }

  const simulateImport = (batchNo: string, rows: number) => {
    const errorCount = Math.floor(Math.random() * 3)
    const successCount = rows - errorCount
    const errors = Array.from({ length: errorCount }, (_, i) => ({
      rowNo: Math.floor(Math.random() * rows) + 2,
      message: ["零件图号为空", "机型不在系统内", "供应商需求数格式错误"][i % 3],
    }))
    return { batchNo, totalRows: rows, successCount, errorCount, errors }
  }

  const handleUpload = () => {
    if (!uploadFile) return
    setLoading(true)
    setTimeout(() => {
      const newId = `b${Date.now()}`
      const newBatch: BatchVO = {
        id: newId,
        batchNo: `SUB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(data.length + 1).padStart(3, "0")}`,
        flowNo: "",
        batchStatus: "DATA_READY",
        uploadFileName: uploadFile.name,
        totalPartCount: Math.floor(Math.random() * 100) + 20,
        totalPackageCount: 0,
        operator: operator || "当前用户",
      }
      setData(prev => [newBatch, ...prev])
      setImportResult(simulateImport(newBatch.batchNo, newBatch.totalPartCount + 2))
      setShowUpload(false)
      setUploadFile(null)
      setAircraftModel("")
      setOperator("")
      setLoading(false)
    }, 1200)
  }

  const handleFetch = () => {
    if (!fetchFlowNo) return
    setLoading(true)
    setTimeout(() => {
      const newId = `b${Date.now()}`
      const newBatch: BatchVO = {
        id: newId,
        batchNo: `SUB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(data.length + 1).padStart(3, "0")}`,
        flowNo: fetchFlowNo,
        batchStatus: "DATA_READY",
        uploadFileName: "",
        totalPartCount: Math.floor(Math.random() * 80) + 10,
        totalPackageCount: 0,
        operator: fetchOperator || "当前用户",
      }
      setData(prev => [newBatch, ...prev])
      setImportResult(simulateImport(newBatch.batchNo, newBatch.totalPartCount))
      setShowFetch(false)
      setFetchFlowNo("")
      setFetchOperator("")
      setLoading(false)
    }, 1200)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setData(prev => prev.filter(b => b.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <PageHeader
        section="分包中心"
        title="分包批次列表"
        desc="管理所有分包批次；支持上传 Excel 或从全流程系统抓取数据，上传成功后进入批次工作台完成分包。"
      >
        <button
          onClick={() => setShowFetch(true)}
          className="h-9 px-4 rounded-[9px] border border-[#0066cc] text-[#0066cc] text-[13px] font-medium hover:bg-[#e8f1fb] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <DownloadCloud size={15} /> 从全流程系统抓取
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Upload size={15} /> 上传 Excel
        </button>
      </PageHeader>

      <Card>
        <SearchBar
          keyword={keyword} onKeywordChange={setKeyword}
          onSearch={doSearch} onReset={doReset}
          placeholder="搜索批次编号 / 流程编号"
        >
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#333] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc]"
          >
            <option value="">全部状态</option>
            <option value="DRAFT">草稿</option>
            <option value="DATA_READY">数据就绪</option>
            <option value="PACKAGED">已分包</option>
            <option value="RECOMMENDED">已推荐</option>
            <option value="COMPLETED">已完成</option>
          </select>
          <input
            value={operatorFilter}
            onChange={e => setOperatorFilter(e.target.value)}
            placeholder="操作人"
            className="h-9 w-28 px-3 rounded-[8px] border border-[#e0e0e0] text-[13px] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc]"
          />
        </SearchBar>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>批次编号</Th>
                <Th>流程编号</Th>
                <Th>状态</Th>
                <Th>上传文件</Th>
                <Th center>零件数</Th>
                <Th center>工作包数</Th>
                <Th>操作人</Th>
                <Th right>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={8} /> : paged.map(b => (
                <tr key={b.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td>
                    <span className="font-mono text-[12px] font-semibold text-[#1d1d1f]">{b.batchNo}</span>
                  </Td>
                  <Td className="font-mono text-[12px] text-[#7a7a7a]">{b.flowNo || "—"}</Td>
                  <Td><BatchStatusBadge status={b.batchStatus} /></Td>
                  <Td>
                    {b.uploadFileName
                      ? <span className="flex items-center gap-1.5 text-[#555]"><FileText size={12} className="text-[#b0b0b0]" />{b.uploadFileName}</span>
                      : <span className="text-[#b0b0b0]">—</span>}
                  </Td>
                  <Td center><span className="font-semibold text-[#1d1d1f]">{b.totalPartCount}</span></Td>
                  <Td center><span className="font-semibold text-[#1d1d1f]">{b.totalPackageCount}</span></Td>
                  <Td className="text-[#7a7a7a]">{b.operator}</Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-3">
                      <ActionLink onClick={() => onEnterWorkbench(b.id)}>
                        <span className="flex items-center gap-1">进入工作台 <ChevronRight size={13} /></span>
                      </ActionLink>
                      <ActionLink onClick={() => setDeleteTarget(b)} danger>删除</ActionLink>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {/* Upload Excel Modal */}
      {showUpload && (
        <Modal title="上传分包 Excel" onClose={() => setShowUpload(false)}>
          <div className="space-y-4">
            <FormField label="选择文件">
              <label className="block border-2 border-dashed border-[#e0e0e0] rounded-[10px] p-8 text-center cursor-pointer hover:border-[#0066cc]/50 hover:bg-[#f5f9ff] transition-colors">
                <Upload size={24} className="mx-auto mb-2 text-[#b0b0b0]" />
                {uploadFile
                  ? <p className="text-[13px] font-medium text-[#0066cc]">{uploadFile.name}</p>
                  : <>
                    <p className="text-[13px] font-medium text-[#555]">点击选择或拖拽文件</p>
                    <p className="text-[12px] text-[#b0b0b0] mt-1">.xlsx / .xls，最大 20 MB</p>
                  </>}
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
              </label>
            </FormField>
            <FormField label="机型（选填）">
              <FormInput value={aircraftModel} onChange={e => setAircraftModel(e.target.value)} placeholder="如 ARJ21、C919" />
            </FormField>
            <FormField label="操作人（选填）">
              <FormInput value={operator} onChange={e => setOperator(e.target.value)} placeholder="默认为当前登录用户" />
            </FormField>
            <div className="flex justify-between items-center mt-2 pt-4 border-t border-[#f0f0f0]">
              <button className="text-[12px] text-[#0066cc] hover:underline">下载导入模板</button>
              <div className="flex gap-3">
                <button onClick={() => setShowUpload(false)} className="h-9 px-5 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#333] hover:bg-[#f5f5f7]">取消</button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || loading}
                  className="h-9 px-5 rounded-[8px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Spinner size={14} />}
                  {loading ? "导入中…" : "开始导入"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Fetch from Flow Modal */}
      {showFetch && (
        <Modal title="从全流程系统抓取" onClose={() => setShowFetch(false)}>
          <div className="space-y-4">
            <FormField label="委外流程编号" hint="输入流程编号后，系统将从全流程平台拉取零件数据">
              <FormInput value={fetchFlowNo} onChange={e => setFetchFlowNo(e.target.value)} placeholder="如 FLOW-10293" />
            </FormField>
            <FormField label="操作人（选填）">
              <FormInput value={fetchOperator} onChange={e => setFetchOperator(e.target.value)} placeholder="默认为当前登录用户" />
            </FormField>
            <ModalFooter
              onClose={() => setShowFetch(false)}
              onSave={handleFetch}
              saveLabel={loading ? "抓取中…" : "开始抓取"}
            />
          </div>
        </Modal>
      )}

      {/* Import Result Modal */}
      {importResult && (
        <Modal title="导入结果" onClose={() => setImportResult(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "总行数", value: importResult.totalRows, cls: "text-[#1d1d1f]" },
                { label: "成功", value: importResult.successCount, cls: "text-[#1a7f3c]" },
                { label: "失败", value: importResult.errorCount, cls: importResult.errorCount > 0 ? "text-[#e74c3c]" : "text-[#1a7f3c]" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-center p-3 rounded-[10px] bg-[#f5f5f7]">
                  <div className={`text-[22px] font-bold ${cls}`}>{value}</div>
                  <div className="text-[12px] text-[#7a7a7a]">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#555]">
              批次编号：<span className="font-mono font-semibold">{importResult.batchNo}</span> 已创建，状态为"数据就绪"，可进入工作台继续操作。
            </p>
            {importResult.errors.length > 0 && (
              <div className="rounded-[10px] bg-[#fff5f5] border border-[#f5b7b7] p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#e74c3c]">
                  <AlertTriangle size={14} /> 失败行详情
                </div>
                {importResult.errors.map(e => (
                  <div key={e.rowNo} className="text-[12px] text-[#555]">
                    第 {e.rowNo} 行：{e.message}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setImportResult(null)} className="h-9 px-5 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#333] hover:bg-[#f5f5f7]">关闭</button>
              <button className="h-9 px-5 rounded-[8px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0]">进入工作台</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`确定删除批次"${deleteTarget.batchNo}"？此操作不可恢复。`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
