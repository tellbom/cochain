import { useState, useMemo } from "react"
import { Eye } from "lucide-react"
import { OPERATION_LOGS, SYSTEM_LOGS, type OperationLogVO } from "../mock"
import {
  PageHeader, Card, Th, Td, EmptyRow, SearchBar, Pagination,
  Modal, TabBar, InfoGrid, ActionLink,
} from "../components/ui"

export default function Logs() {
  const [tab, setTab] = useState("business")

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <PageHeader section="日志记录" title="日志记录" desc="聚合业务操作日志与系统操作日志，用于操作追溯与审计。" />
      <TabBar
        tabs={[{ id: "business", label: "业务操作日志" }, { id: "system", label: "系统操作日志" }]}
        active={tab}
        onChange={setTab}
      />
      {tab === "business" && <LogTable data={OPERATION_LOGS} />}
      {tab === "system"   && <LogTable data={SYSTEM_LOGS} />}
    </div>
  )
}

function ResultBadge({ result }: { result: string }) {
  const isOk = result === "成功"
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-[6px] text-[12px] font-medium border ${
      isOk ? "bg-[#f0faf0] text-[#1a7f3c] border-[#b7ebc0]" : "bg-[#fff5f5] text-[#c0392b] border-[#f5b7b7]"
    }`}>
      <span className={`w-[6px] h-[6px] rounded-full ${isOk ? "bg-[#34c759]" : "bg-[#e74c3c]"}`} />
      {result}
    </span>
  )
}

function LogTable({ data }: { data: OperationLogVO[] }) {
  const [keyword, setKeyword] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [query, setQuery] = useState({ keyword: "", type: "" })
  const [page, setPage] = useState(1)
  const [detailItem, setDetailItem] = useState<OperationLogVO | null>(null)
  const PAGE_SIZE = 10

  const types = [...new Set(data.map(d => d.operationType))]

  const filtered = useMemo(() => data.filter(d => {
    const kw = query.keyword.toLowerCase()
    const matchKw = !kw || d.operator.toLowerCase().includes(kw) || d.targetObject.toLowerCase().includes(kw) || d.targetModule.toLowerCase().includes(kw)
    const matchType = !query.type || d.operationType === query.type
    return matchKw && matchType
  }), [data, query])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <>
      <Card>
        <SearchBar
          keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索操作人 / 操作对象"
          onSearch={() => { setQuery({ keyword, type: typeFilter }); setPage(1) }}
          onReset={() => { setKeyword(""); setTypeFilter(""); setQuery({ keyword: "", type: "" }); setPage(1) }}
        >
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#333] bg-white focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc]"
          >
            <option value="">全部操作类型</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </SearchBar>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>操作人</Th>
                <Th>IP 地址</Th>
                <Th>操作类型</Th>
                <Th>所属模块</Th>
                <Th>操作对象</Th>
                <Th center>结果</Th>
                <Th>操作时间</Th>
                <Th right>详情</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={8} /> : paged.map(log => (
                <tr key={log.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td><span className="font-medium">{log.operator}</span></Td>
                  <Td className="font-mono text-[12px] text-[#7a7a7a]">{log.operatorIp}</Td>
                  <Td>
                    <span className="text-[12px] bg-[#f5f5f7] text-[#333] px-2 py-0.5 rounded">{log.operationType}</span>
                  </Td>
                  <Td className="text-[#7a7a7a]">{log.targetModule}</Td>
                  <Td className="font-mono text-[12px] text-[#555]">{log.targetObject}</Td>
                  <Td center><ResultBadge result={log.result} /></Td>
                  <Td className="text-[#7a7a7a] text-[12px]">{log.operateTime}</Td>
                  <Td right>
                    <ActionLink onClick={() => setDetailItem(log)}>
                      <span className="flex items-center gap-1"><Eye size={12} />查看</span>
                    </ActionLink>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {detailItem && (
        <Modal title="操作日志详情" onClose={() => setDetailItem(null)}>
          <InfoGrid items={[
            { label: "操作人", value: detailItem.operator },
            { label: "IP 地址", value: <span className="font-mono">{detailItem.operatorIp}</span> },
            { label: "操作类型", value: detailItem.operationType },
            { label: "所属模块", value: detailItem.targetModule },
            { label: "操作对象", value: <span className="font-mono">{detailItem.targetObject}</span> },
            { label: "操作结果", value: <ResultBadge result={detailItem.result} /> },
            { label: "操作时间", value: detailItem.operateTime },
            { label: "备注", value: detailItem.remark || "—" },
          ]} />
          <div className="flex justify-end mt-5 pt-4 border-t border-[#f0f0f0]">
            <button onClick={() => setDetailItem(null)} className="h-9 px-5 rounded-[8px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0]">关闭</button>
          </div>
        </Modal>
      )}
    </>
  )
}
