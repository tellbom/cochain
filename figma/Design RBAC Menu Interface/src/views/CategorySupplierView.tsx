import { useState, useMemo } from "react"
import { Layers, Tag, Building2, CheckCircle2, XCircle, Search, ShieldCheck } from "lucide-react"
import { CATEGORY_MASTERS, SUPPLIERS, SUPPLIER_CATEGORIES, RANKINGS, type CategoryMasterVO } from "../mock"
import { PageHeader, Card, Th, Td, EmptyRow, SearchBar, Pagination, EnabledBadge } from "../components/ui"

export default function CategorySupplierView() {
  const [categories] = useState<CategoryMasterVO[]>(CATEGORY_MASTERS)
  const [selectedCatId, setSelectedCatId] = useState<string>(CATEGORY_MASTERS[0]?.id || "cat001")
  const [keyword, setKeyword] = useState("")
  const [query, setQuery] = useState("")

  const activeCategory = useMemo(
    () => categories.find(c => c.id === selectedCatId) || categories[0],
    [categories, selectedCatId]
  )

  // 1. 查找当前选中的品类关联的所有供应商
  const categorySuppliers = useMemo(() => {
    if (!activeCategory) return []

    // 找到关联的 sc 记录
    const scs = SUPPLIER_CATEGORIES.filter(sc => sc.categoryId === activeCategory.id)
    
    // 映射出对应的供应商
    return scs.map(sc => {
      const supplier = SUPPLIERS.find(s => s.id === sc.supplierId)
      // 找到排名数据快照（如果有）
      const ranking = RANKINGS.find(r => r.categoryId === activeCategory.id && r.supplierId === sc.supplierId)

      return {
        scId: sc.id,
        supplierId: sc.supplierId,
        supplierName: supplier?.supplierName || "未知供应商",
        enabled: supplier?.enabled ?? 1,
        remark: supplier?.remark || "",
        rank: ranking?.rankInCategory || "—",
        qualityLevel: ranking?.qualityLevel || "普通",
        comprehensiveScore: ranking?.comprehensiveScore ?? "—",
      }
    })
  }, [activeCategory])

  // 搜索过滤
  const filteredSuppliers = useMemo(() => {
    if (!query) return categorySuppliers
    return categorySuppliers.filter(s => s.supplierName.includes(query))
  }, [categorySuppliers, query])

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <PageHeader
        section="品类视图"
        title="品类供应商明细"
        desc="从三级品类主数据视角出发，查看各品类下具备承制能力的供应商列表、质量等级及排名绩效。"
      />

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧：品类列表 */}
        <div className="col-span-4 lg:col-span-3">
          <Card className="p-3">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f0f0f0] mb-2">
              <Layers size={15} className="text-[#0066cc]" />
              <span className="text-[13px] font-semibold text-[#1d1d1f]">三级品类列表</span>
            </div>
            <div className="space-y-1">
              {categories.map(cat => {
                const isActive = cat.id === selectedCatId
                const count = SUPPLIER_CATEGORIES.filter(sc => sc.categoryId === cat.id).length

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCatId(cat.id)
                      setKeyword("")
                      setQuery("")
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-[10px] text-left transition-all ${
                      isActive
                        ? "bg-[#0066cc] text-white shadow-md shadow-[#0066cc]/20"
                        : "hover:bg-[#f5f5f7] text-[#1d1d1f]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-medium text-[13px]">
                        <Tag size={13} className={isActive ? "text-white/80" : "text-[#7a7a7a]"} />
                        {cat.categoryName}
                      </div>
                      <div className={`text-[11px] mt-1 ${isActive ? "text-white/70" : "text-[#86868b]"}`}>
                        {cat.materialType} · {cat.partType}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[#e8f1fb] text-[#0066cc]"
                      }`}
                    >
                      {count} 供方
                    </span>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* 右侧：品类详情与对应供应商 */}
        <div className="col-span-8 lg:col-span-9 space-y-5">
          {/* 品类主数据属性卡片 */}
          {activeCategory && (
            <Card className="p-5 border-l-4 border-l-[#0066cc]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-bold text-[#1d1d1f]">{activeCategory.categoryName}</h2>
                    <span className="text-[11px] font-medium bg-[#0066cc]/10 text-[#0066cc] px-2.5 py-0.5 rounded-full">
                      {activeCategory.partType}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#7a7a7a] mt-1">品类ID: {activeCategory.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#f5f5f7] p-3.5 rounded-[12px] text-[12px]">
                <div>
                  <span className="text-[#86868b] block text-[11px]">材料类型</span>
                  <span className="font-semibold text-[#1d1d1f]">{activeCategory.materialType}</span>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[11px]">尺寸判断逻辑</span>
                  <span className="font-mono font-semibold text-[#1d1d1f]">{activeCategory.sizeLogic}</span>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[11px]">长度规格区间</span>
                  <span className="font-mono text-[#1d1d1f]">{activeCategory.lengthMin} ~ {activeCategory.lengthMax} mm</span>
                </div>
                <div>
                  <span className="text-[#86868b] block text-[11px]">宽度规格区间</span>
                  <span className="font-mono text-[#1d1d1f]">{activeCategory.widthMin} ~ {activeCategory.widthMax} mm</span>
                </div>
              </div>
            </Card>
          )}

          {/* 关联的供应商表格 */}
          <Card>
            <SearchBar
              keyword={keyword}
              onKeywordChange={setKeyword}
              placeholder="搜索当前品类下的供应商名称"
              onSearch={() => setQuery(keyword)}
              onReset={() => { setKeyword(""); setQuery("") }}
            />

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <Th>供应商名称</Th>
                    <Th center>合作状态</Th>
                    <Th center>质量等级</Th>
                    <Th center>品类内排名</Th>
                    <Th right>综合绩效得分</Th>
                    <Th>备注信息</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f5f7]">
                  {filteredSuppliers.length === 0 ? (
                    <EmptyRow cols={6} text="当前品类暂无符合条件的供应商" />
                  ) : (
                    filteredSuppliers.map(s => (
                      <tr key={s.scId} className="hover:bg-[#fafafa] transition-colors">
                        <Td>
                          <span className="font-semibold text-[#1d1d1f] flex items-center gap-2">
                            <Building2 size={14} className="text-[#0066cc]" />
                            {s.supplierName}
                          </span>
                        </Td>
                        <Td center>
                          <EnabledBadge enabled={s.enabled} />
                        </Td>
                        <Td center>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              s.qualityLevel === "优质"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-gray-100 text-[#666]"
                            }`}
                          >
                            <ShieldCheck size={12} />
                            {s.qualityLevel}
                          </span>
                        </Td>
                        <Td center>
                          {s.rank !== "—" ? (
                            <span className="font-bold font-mono text-[13px] text-[#0066cc]">第 {s.rank} 名</span>
                          ) : (
                            <span className="text-[#b0b0b0] text-[12px]">暂无排名</span>
                          )}
                        </Td>
                        <Td right>
                          <span className="font-mono font-bold text-[13px] text-[#1d1d1f]">{s.comprehensiveScore}</span>
                        </Td>
                        <Td className="text-[#7a7a7a] max-w-[200px] truncate">{s.remark || "—"}</Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
