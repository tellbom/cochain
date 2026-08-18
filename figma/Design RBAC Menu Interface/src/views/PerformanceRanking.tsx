import { useState, useMemo } from "react"
import { Upload, RefreshCw, AlertTriangle } from "lucide-react"
import { PERFORMANCES, RANKINGS, type PerformanceVO, type RankingSnapshotVO } from "../mock"
import {
  PageHeader, Card, Th, Td, EmptyRow, SearchBar, Pagination,
  Modal, FormField, FormInput, FormSelect, TabBar, Spinner,
} from "../components/ui"

export default function PerformanceRanking() {
  const [tab, setTab] = useState("performance")

  // Performance
  const [perfs, setPerfs] = useState<PerformanceVO[]>(PERFORMANCES)
  const [perfKeyword, setPerfKeyword] = useState("")
  const [perfYear, setPerfYear] = useState("")
  const [perfMonth, setPerfMonth] = useState("")
  const [perfQuery, setPerfQuery] = useState({ keyword: "", year: "", month: "" })
  const [perfPage, setPerfPage] = useState(1)

  // Ranking
  const [ranks] = useState<RankingSnapshotVO[]>(RANKINGS)
  const [rankKeyword, setRankKeyword] = useState("")
  const [rankYear, setRankYear] = useState("")
  const [rankMonth, setRankMonth] = useState("")
  const [rankCategory, setRankCategory] = useState("")
  const [rankQuery, setRankQuery] = useState({ keyword: "", year: "", month: "", category: "" })
  const [rankPage, setRankPage] = useState(1)

  // Upload
  const [showUpload, setShowUpload] = useState(false)
  const [uploadYear, setUploadYear] = useState("2026")
  const [uploadMonth, setUploadMonth] = useState("8")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: number; fail: number; errors: string[] } | null>(null)

  // Retry ranking
  const [retrying, setRetrying] = useState(false)
  const [retrySuccess, setRetrySuccess] = useState(false)

  const PAGE_SIZE = 10

  const filteredPerfs = useMemo(() => perfs.filter(p => {
    const kw = perfQuery.keyword.toLowerCase()
    const matchKw = !kw || p.supplierName.toLowerCase().includes(kw)
    const matchYear = !perfQuery.year || String(p.performanceYear) === perfQuery.year
    const matchMonth = !perfQuery.month || String(p.performanceMonth) === perfQuery.month
    return matchKw && matchYear && matchMonth
  }), [perfs, perfQuery])

  const filteredRanks = useMemo(() => ranks.filter(r => {
    const kw = rankQuery.keyword.toLowerCase()
    const matchKw = !kw || r.supplierName.toLowerCase().includes(kw) || r.categoryName.toLowerCase().includes(kw)
    const matchYear = !rankQuery.year || String(r.rankingYear) === rankQuery.year
    const matchMonth = !rankQuery.month || String(r.rankingMonth) === rankQuery.month
    const matchCat = !rankQuery.category || r.categoryName.includes(rankQuery.category)
    return matchKw && matchYear && matchMonth && matchCat
  }), [ranks, rankQuery])

  const pagedPerfs = filteredPerfs.slice((perfPage - 1) * PAGE_SIZE, perfPage * PAGE_SIZE)
  const pagedRanks = filteredRanks.slice((rankPage - 1) * PAGE_SIZE, rankPage * PAGE_SIZE)

  const handleUpload = () => {
    if (!uploadFile) return
    setUploading(true)
    setTimeout(() => {
      const fail = Math.random() < 0.3 ? 1 : 0
      setUploadResult({ success: 6 - fail, fail, errors: fail ? [`第 ${Math.ceil(Math.random() * 5) + 1} 行：供应商名称不存在`] : [] })
      if (!fail) {
        const newPerf: PerformanceVO = {
          id: `pf${Date.now()}`,
          supplierId: "s001",
          supplierName: "航空精密机械有限公司",
          performanceYear: Number(uploadYear),
          performanceMonth: Number(uploadMonth),
          score: 91.0,
          halfYearAvg: 89.0,
          lastMonthScore: 88.0,
          comprehensiveScore: 90.0,
        }
        setPerfs(prev => [newPerf, ...prev])
      }
      setShowUpload(false)
      setUploadFile(null)
      setUploading(false)
    }, 1500)
  }

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => { setRetrying(false); setRetrySuccess(true); setTimeout(() => setRetrySuccess(false), 2000) }, 1200)
  }

  const uniqueCategories = [...new Set(ranks.map(r => r.categoryName))]

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <PageHeader section="供应商中心" title="供应商绩效与排名" desc="每月上传绩效 Excel，系统自动触发排名生成；可在此查看各月绩效数据与品类排名快照。" />

      <TabBar
        tabs={[{ id: "performance", label: "绩效记录" }, { id: "ranking", label: "排名快照" }]}
        active={tab}
        onChange={setTab}
      />

      {tab === "performance" && (
        <Card>
          <div className="p-5 border-b border-[#f0f0f0] space-y-4 bg-white rounded-t-[14px]">
            {/* 顶栏：业务操作与快捷入口 */}
            <div className="flex items-center justify-between gap-4 border-b border-[#f5f5f7] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#1d1d1f]">绩效检索与筛选</span>
                <span className="text-[12px] text-[#86868b]">（支持按供应商检索历史或按年月排查当期绩效）</span>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] active:scale-95 transition-all flex items-center gap-1.5 shadow-sm shadow-[#0066cc]/20 shrink-0"
              >
                <Upload size={14} />上传月度绩效
              </button>
            </div>

            {/* 中栏：舒展表单区域 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* 1. 供应商名称 */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">供应商名称</label>
                <div className="relative">
                  <input
                    type="text"
                    value={perfKeyword}
                    onChange={e => setPerfKeyword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && setPerfQuery({ keyword: perfKeyword, year: perfYear, month: perfMonth })}
                    placeholder="输入供应商名称搜索"
                    className="h-9.5 w-full pl-3 pr-3 rounded-[9px] border border-[#e0e0e0] text-[13px] bg-white text-[#1d1d1f] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all"
                  />
                </div>
              </div>

              {/* 2. 年份 */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">绩效年份</label>
                <FormSelect
                  value={perfYear}
                  onChange={e => setPerfYear(e.target.value)}
                  className="h-9.5 w-full rounded-[9px] border-[#e0e0e0]"
                >
                  <option value="">全部年份 (查看历史)</option>
                  <option value="2026">2026年</option>
                  <option value="2025">2025年</option>
                </FormSelect>
              </div>

              {/* 3. 月份 */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">绩效月份</label>
                <FormSelect
                  value={perfMonth}
                  onChange={e => setPerfMonth(e.target.value)}
                  className="h-9.5 w-full rounded-[9px] border-[#e0e0e0]"
                >
                  <option value="">全部月份 (查看历史)</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>{i + 1}月</option>
                  ))}
                </FormSelect>
              </div>

              {/* 4. 按钮组 */}
              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  onClick={() => { setPerfQuery({ keyword: perfKeyword, year: perfYear, month: perfMonth }); setPerfPage(1) }}
                  className="h-9.5 flex-1 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] active:scale-95 transition-all shadow-sm shadow-[#0066cc]/20"
                >
                  查询
                </button>
                <button
                  onClick={() => { setPerfKeyword(""); setPerfYear(""); setPerfMonth(""); setPerfQuery({ keyword: "", year: "", month: "" }); setPerfPage(1) }}
                  className="h-9.5 px-3 rounded-[9px] border border-[#e0e0e0] text-[13px] text-[#333] hover:bg-[#f5f5f7] active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0"
                  title="重置筛选条件"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* 底栏：快捷视图胶囊 */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#f5f5f7] text-[12px] text-[#7a7a7a] flex-wrap">
              <span className="font-medium text-[#1d1d1f]">快速视图：</span>
              <button
                onClick={() => {
                  setPerfYear("2026")
                  setPerfMonth("7")
                  setPerfQuery({ keyword: perfKeyword, year: "2026", month: "7" })
                }}
                className="px-3 py-1 rounded-full bg-[#f0f5ff] text-[#0066cc] hover:bg-[#e1ecff] transition-colors font-medium border border-[#0066cc]/15"
              >
                当月最新绩效 (2026-07)
              </button>
              <button
                onClick={() => {
                  setPerfYear("")
                  setPerfMonth("")
                  setPerfQuery({ keyword: perfKeyword, year: "", month: "" })
                }}
                className="px-3 py-1 rounded-full bg-[#f5f5f7] text-[#555] hover:bg-[#ebebeb] transition-colors font-medium border border-[#e8e8ed]"
              >
                供应商全历史趋势
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>供应商名称</Th>
                  <Th center>年份</Th>
                  <Th center>月份</Th>
                  <Th right>原始成绩</Th>
                  <Th right>半年均值</Th>
                  <Th right>上月得分</Th>
                  <Th right>综合得分</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {pagedPerfs.length === 0 ? <EmptyRow cols={7} /> : pagedPerfs.map(p => (
                  <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                    <Td><span className="font-medium">{p.supplierName}</span></Td>
                    <Td center className="text-[#7a7a7a]">{p.performanceYear}</Td>
                    <Td center className="text-[#7a7a7a]">{p.performanceMonth} 月</Td>
                    <Td right><span className="font-semibold text-[#1d1d1f]">{p.score.toFixed(1)}</span></Td>
                    <Td right className="text-[#7a7a7a]">{p.halfYearAvg.toFixed(1)}</Td>
                    <Td right className="text-[#7a7a7a]">{p.lastMonthScore.toFixed(1)}</Td>
                    <Td right>
                      <span className={`font-bold text-[14px] ${p.comprehensiveScore >= 85 ? "text-[#1a7f3c]" : p.comprehensiveScore >= 70 ? "text-[#b54708]" : "text-[#e74c3c]"}`}>
                        {p.comprehensiveScore.toFixed(1)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={filteredPerfs.length} page={perfPage} pageSize={PAGE_SIZE} onChange={setPerfPage} />
        </Card>
      )}

      {tab === "ranking" && (
        <Card>
          <div className="p-5 border-b border-[#f0f0f0] space-y-4 bg-white rounded-t-[14px]">
            {/* 顶栏：业务说明与重新生成操作 */}
            <div className="flex items-center justify-between gap-4 border-b border-[#f5f5f7] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#1d1d1f]">排名快照检索与重算</span>
                <span className="text-[12px] text-[#86868b]">（按年月、品类维度精准检索排名快照；若排名未自动计算可手动重试）</span>
              </div>
              <button
                onClick={handleRetry}
                disabled={retrying}
                className={`h-9 px-4 rounded-[9px] border text-[13px] font-medium flex items-center gap-1.5 transition-all shrink-0 ${
                  retrySuccess
                    ? "border-[#34c759] text-[#1a7f3c] bg-[#f0fff4]"
                    : "border-[#e0e0e0] text-[#333] hover:bg-[#f5f5f7]"
                }`}
              >
                {retrying ? <Spinner size={13} /> : <RefreshCw size={13} />}
                {retrying ? "重新生成中…" : retrySuccess ? "✓ 生成成功" : "重新生成排名（异常重试）"}
              </button>
            </div>

            {/* 中栏：舒展表单网格区域 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* 1. 关键词搜索 */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">供应商 / 品类关键字</label>
                <input
                  type="text"
                  value={rankKeyword}
                  onChange={e => setRankKeyword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setRankQuery({ keyword: rankKeyword, year: rankYear, month: rankMonth, category: rankCategory })}
                  placeholder="搜索供应商或品类名称"
                  className="h-9.5 w-full pl-3 pr-3 rounded-[9px] border border-[#e0e0e0] text-[13px] bg-white text-[#1d1d1f] placeholder:text-[#c0c0c0] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all"
                />
              </div>

              {/* 2. 三级品类筛选 */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">三级品类</label>
                <FormSelect
                  value={rankCategory}
                  onChange={e => setRankCategory(e.target.value)}
                  className="h-9.5 w-full rounded-[9px] border-[#e0e0e0]"
                >
                  <option value="">全部品类</option>
                  {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </FormSelect>
              </div>

              {/* 3. 排名年份 */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">排名年份</label>
                <FormSelect
                  value={rankYear}
                  onChange={e => setRankYear(e.target.value)}
                  className="h-9.5 w-full rounded-[9px] border-[#e0e0e0]"
                >
                  <option value="">全部年份</option>
                  <option value="2026">2026年</option>
                </FormSelect>
              </div>

              {/* 4. 排名月份 */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[12px] font-medium text-[#555] block">排名月份</label>
                <FormSelect
                  value={rankMonth}
                  onChange={e => setRankMonth(e.target.value)}
                  className="h-9.5 w-full rounded-[9px] border-[#e0e0e0]"
                >
                  <option value="">全部月份</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>{i + 1}月</option>)}
                </FormSelect>
              </div>

              {/* 5. 查询与重置按钮 */}
              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  onClick={() => { setRankQuery({ keyword: rankKeyword, year: rankYear, month: rankMonth, category: rankCategory }); setRankPage(1) }}
                  className="h-9.5 flex-1 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] active:scale-95 transition-all shadow-sm shadow-[#0066cc]/20"
                >
                  查询
                </button>
                <button
                  onClick={() => { setRankKeyword(""); setRankYear(""); setRankMonth(""); setRankCategory(""); setRankQuery({ keyword: "", year: "", month: "", category: "" }); setRankPage(1) }}
                  className="h-9.5 px-3 rounded-[9px] border border-[#e0e0e0] text-[13px] text-[#333] hover:bg-[#f5f5f7] active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0"
                  title="重置筛选条件"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* 底栏：快捷筛选胶囊 */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#f5f5f7] text-[12px] text-[#7a7a7a] flex-wrap">
              <span className="font-medium text-[#1d1d1f]">快速视图：</span>
              <button
                onClick={() => {
                  setRankYear("2026")
                  setRankMonth("7")
                  setRankQuery({ keyword: rankKeyword, year: "2026", month: "7", category: rankCategory })
                }}
                className="px-3 py-1 rounded-full bg-[#f0f5ff] text-[#0066cc] hover:bg-[#e1ecff] transition-colors font-medium border border-[#0066cc]/15"
              >
                最新排名快照 (2026-07)
              </button>
              <button
                onClick={() => {
                  setRankCategory("铝合金钣金件")
                  setRankQuery({ keyword: rankKeyword, year: rankYear, month: rankMonth, category: "铝合金钣金件" })
                }}
                className="px-3 py-1 rounded-full bg-[#f5f5f7] text-[#555] hover:bg-[#ebebeb] transition-colors font-medium border border-[#e8e8ed]"
              >
                铝合金钣金件排名
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th center>品类内排名</Th>
                  <Th>供应商名称</Th>
                  <Th>三级品类</Th>
                  <Th center>年 / 月</Th>
                  <Th right>综合得分</Th>
                  <Th center>质量等级</Th>
                  <Th center>品类供应商总数</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {pagedRanks.length === 0 ? <EmptyRow cols={7} /> : pagedRanks.map(r => (
                  <tr key={r.id} className="hover:bg-[#fafafa] transition-colors">
                    <Td center>
                      {r.rankInCategory === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-extrabold text-[12px] border border-amber-500/20 shadow-xs">
                          <span className="text-[14px]">🥇</span> 第 1 名
                        </span>
                      ) : r.rankInCategory === 2 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600 font-extrabold text-[12px] border border-slate-400/20 shadow-xs">
                          <span className="text-[14px]">🥈</span> 第 2 名
                        </span>
                      ) : r.rankInCategory === 3 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700/10 text-amber-800 font-extrabold text-[12px] border border-amber-700/20 shadow-xs">
                          <span className="text-[14px]">🥉</span> 第 3 名
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center font-mono font-bold text-[#555] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full text-[12px]">
                          No. {r.rankInCategory}
                        </span>
                      )}
                    </Td>
                    <Td><span className="font-semibold text-[#1d1d1f]">{r.supplierName}</span></Td>
                    <Td className="text-[#555]">
                      <span className="inline-flex items-center gap-1 bg-[#f5f5f7] text-[#333] px-2 py-0.5 rounded-[6px] text-[12px] font-medium border border-[#e8e8ed]">
                        {r.categoryName}
                      </span>
                    </Td>
                    <Td center className="text-[#7a7a7a] font-mono text-[12px]">{r.rankingYear} / {String(r.rankingMonth).padStart(2, '0')}</Td>
                    <Td right>
                      <span className={`font-mono font-bold text-[14px] ${r.comprehensiveScore >= 85 ? "text-[#0066cc]" : r.comprehensiveScore >= 70 ? "text-[#b54708]" : "text-[#e74c3c]"}`}>
                        {r.comprehensiveScore.toFixed(1)}
                      </span>
                    </Td>
                    <Td center>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          r.qualityLevel === "优质"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-gray-100 text-[#666] border border-gray-200"
                        }`}
                      >
                        {r.qualityLevel}
                      </span>
                    </Td>
                    <Td center className="text-[#7a7a7a] font-mono text-[12px]">{r.totalSupplierCount} 家</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={filteredRanks.length} page={rankPage} pageSize={PAGE_SIZE} onChange={setRankPage} />
        </Card>
      )}

      {/* Upload modal */}
      {showUpload && (
        <Modal title="上传月度绩效 Excel" onClose={() => { setShowUpload(false); setUploadFile(null) }}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="绩效年份">
                <FormSelect value={uploadYear} onChange={e => setUploadYear(e.target.value)}>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </FormSelect>
              </FormField>
              <FormField label="绩效月份">
                <FormSelect value={uploadMonth} onChange={e => setUploadMonth(e.target.value)}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>{i + 1} 月</option>
                  ))}
                </FormSelect>
              </FormField>
            </div>
            <FormField label="绩效文件" hint="文件格式：两列，第一列供应商名称，第二列绩效成绩（数值）">
              <label className="block border-2 border-dashed border-[#e0e0e0] rounded-[10px] p-7 text-center cursor-pointer hover:border-[#0066cc]/50 hover:bg-[#f5f9ff] transition-colors">
                <Upload size={22} className="mx-auto mb-2 text-[#b0b0b0]" />
                {uploadFile
                  ? <p className="text-[13px] font-medium text-[#0066cc]">{uploadFile.name}</p>
                  : <>
                    <p className="text-[13px] font-medium text-[#555]">点击选择文件</p>
                    <p className="text-[11px] text-[#b0b0b0] mt-1">.xlsx / .xls</p>
                  </>}
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
              </label>
            </FormField>
            <p className="text-[12px] text-[#7a7a7a]">上传成功后系统将自动触发 {uploadYear} 年 {uploadMonth} 月排名生成，无需手动操作。</p>
            <div className="flex justify-between items-center pt-4 border-t border-[#f0f0f0]">
              <button className="text-[12px] text-[#0066cc] hover:underline">下载绩效模板</button>
              <div className="flex gap-3">
                <button onClick={() => { setShowUpload(false); setUploadFile(null) }} className="h-9 px-5 rounded-[8px] border border-[#e0e0e0] text-[13px] text-[#333] hover:bg-[#f5f5f7]">取消</button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className="h-9 px-5 rounded-[8px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Spinner size={14} />}
                  {uploading ? "上传中…" : "开始上传"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload result */}
      {uploadResult && (
        <Modal title="上传结果" onClose={() => setUploadResult(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "成功", value: uploadResult.success, cls: "text-[#1a7f3c]" },
                { label: "失败", value: uploadResult.fail, cls: uploadResult.fail > 0 ? "text-[#e74c3c]" : "text-[#1a7f3c]" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="text-center p-4 rounded-[10px] bg-[#f5f5f7]">
                  <div className={`text-[24px] font-bold ${cls}`}>{value}</div>
                  <div className="text-[12px] text-[#7a7a7a]">{label}</div>
                </div>
              ))}
            </div>
            {uploadResult.errors.length > 0 && (
              <div className="rounded-[10px] bg-[#fff5f5] border border-[#f5b7b7] p-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#e74c3c]">
                  <AlertTriangle size={14} /> 失败行详情
                </div>
                {uploadResult.errors.map((e, i) => <div key={i} className="text-[12px] text-[#555]">{e}</div>)}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-[#f0f0f0]">
              <button onClick={() => setUploadResult(null)} className="h-9 px-5 rounded-[8px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0]">关闭</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
