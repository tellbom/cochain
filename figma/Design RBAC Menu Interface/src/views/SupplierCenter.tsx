import { useState, useMemo } from "react"
import { Plus, ChevronLeft, Tag } from "lucide-react"
import { SUPPLIERS, SUPPLIER_CATEGORIES, CATEGORY_MASTERS, type SupplierVO, type SupplierCategoryVO } from "../mock"
import {
  EnabledBadge, PageHeader, Card, Th, Td, EmptyRow, SearchBar, Pagination,
  Modal, ModalFooter, FormField, FormInput, FormTextarea, FormSelect,
  ConfirmDialog, ActionLink,
} from "../components/ui"

export default function SupplierCenter() {
  const [suppliers, setSuppliers] = useState<SupplierVO[]>(SUPPLIERS)
  const [supCategories, setSupCategories] = useState<SupplierCategoryVO[]>(SUPPLIER_CATEGORIES)
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [query, setQuery] = useState({ name: "", status: "ALL", category: "ALL" })
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const [detailId, setDetailId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<SupplierVO | null>(null)
  const [draft, setDraft] = useState<Partial<SupplierVO>>({})
  const [deleteTarget, setDeleteTarget] = useState<SupplierVO | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryId, setNewCategoryId] = useState("")
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      // 1. 供应商名称搜索
      if (query.name && !s.supplierName.includes(query.name)) {
        return false
      }
      // 2. 状态筛选 (1启用/0停用)
      if (query.status !== "ALL") {
        if (query.status === "1" && s.enabled !== 1) return false
        if (query.status === "0" && s.enabled !== 0) return false
      }
      // 3. 承制品类筛选 (categoryId)
      if (query.category !== "ALL") {
        const hasCat = supCategories.some(sc => sc.supplierId === s.id && sc.categoryId === query.category)
        if (!hasCat) return false
      }
      return true
    })
  }, [suppliers, supCategories, query])

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = () => {
    setQuery({ name: keyword, status: statusFilter, category: categoryFilter })
    setPage(1)
  }

  const handleReset = () => {
    setKeyword("")
    setStatusFilter("ALL")
    setCategoryFilter("ALL")
    setQuery({ name: "", status: "ALL", category: "ALL" })
    setPage(1)
  }

  const detailSupplier = suppliers.find(s => s.id === detailId)
  const detailCategories = supCategories.filter(sc => sc.supplierId === detailId)

  const openAdd = () => { setEditTarget({ id: "", supplierName: "", enabled: 1, remark: "" }); setDraft({ supplierName: "", remark: "" }) }
  const openEdit = (s: SupplierVO) => { setEditTarget(s); setDraft({ supplierName: s.supplierName, remark: s.remark }) }

  const handleSave = () => {
    if (!editTarget) return
    if (editTarget.id) {
      setSuppliers(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...draft } : s))
    } else {
      const newS: SupplierVO = { id: `s${Date.now()}`, supplierName: draft.supplierName ?? "", enabled: 1, remark: draft.remark ?? "" }
      setSuppliers(prev => [...prev, newS])
    }
    setEditTarget(null)
  }

  const handleToggle = (s: SupplierVO) => {
    setSuppliers(prev => prev.map(x => x.id === s.id ? { ...x, enabled: x.enabled === 1 ? 0 : 1 } : x))
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    setSuppliers(prev => prev.filter(s => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleAddCategory = () => {
    if (!newCategoryId || !detailId) return
    const cat = CATEGORY_MASTERS.find(c => c.id === newCategoryId)
    if (!cat) return
    const existing = supCategories.find(sc => sc.supplierId === detailId && sc.categoryId === newCategoryId)
    if (existing) { setShowAddCategory(false); setNewCategoryId(""); return }
    setSupCategories(prev => [...prev, {
      id: `sc${Date.now()}`,
      supplierId: detailId,
      categoryId: newCategoryId,
      categoryName: cat.categoryName,
    }])
    setShowAddCategory(false)
    setNewCategoryId("")
  }

  const handleDeleteCategory = () => {
    if (!deleteCategoryId) return
    setSupCategories(prev => prev.filter(sc => sc.id !== deleteCategoryId))
    setDeleteCategoryId(null)
  }

  const availableCategories = CATEGORY_MASTERS.filter(
    c => !supCategories.some(sc => sc.supplierId === detailId && sc.categoryId === c.id)
  )

  if (detailSupplier) {
    return (
      <div className="flex-1 overflow-y-auto p-7">
        <button onClick={() => setDetailId(null)} className="flex items-center gap-1.5 text-[13px] text-[#0066cc] hover:underline mb-5">
          <ChevronLeft size={14} /> 返回供应商列表
        </button>
        <PageHeader section="供应商中心" title={detailSupplier.supplierName}>
          <div className="flex items-center gap-3">
            <EnabledBadge enabled={detailSupplier.enabled} />
            <button
              onClick={() => handleToggle(detailSupplier)}
              className={`h-9 px-4 rounded-[9px] border text-[13px] font-medium transition-all ${
                detailSupplier.enabled === 1
                  ? "border-[#e74c3c] text-[#e74c3c] hover:bg-[#fff5f5]"
                  : "border-[#0066cc] text-[#0066cc] hover:bg-[#e8f1fb]"
              }`}
            >
              {detailSupplier.enabled === 1 ? "停用供应商" : "启用供应商"}
            </button>
            <button onClick={() => openEdit(detailSupplier)} className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0]">
              编辑信息
            </button>
          </div>
        </PageHeader>

        {/* Info card */}
        <Card className="mb-5 p-5">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div><span className="text-[12px] text-[#7a7a7a] mr-3">供应商ID</span><span className="font-mono text-[13px] text-[#555]">{detailSupplier.id}</span></div>
            <div><span className="text-[12px] text-[#7a7a7a] mr-3">状态</span><EnabledBadge enabled={detailSupplier.enabled} /></div>
            <div className="col-span-2"><span className="text-[12px] text-[#7a7a7a] mr-3">备注</span><span className="text-[13px] text-[#555]">{detailSupplier.remark || "—"}</span></div>
          </div>
        </Card>

        {/* Category associations */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-[#1d1d1f]">可承制三级品类</h2>
          <button
            onClick={() => setShowAddCategory(true)}
            className="h-8 px-3 rounded-[8px] bg-[#0066cc] text-white text-[12px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5"
          >
            <Plus size={13} /> 添加品类关联
          </button>
        </div>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <Th>三级品类名称</Th>
                  <Th>品类ID</Th>
                  <Th right>操作</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f7]">
                {detailCategories.length === 0 ? <EmptyRow cols={3} text="暂未关联品类，请点击【添加品类关联】" /> : detailCategories.map(sc => (
                  <tr key={sc.id} className="hover:bg-[#fafafa] transition-colors">
                    <Td>
                      <span className="flex items-center gap-2 font-medium"><Tag size={13} className="text-[#b0b0b0]" />{sc.categoryName}</span>
                    </Td>
                    <Td className="font-mono text-[12px] text-[#7a7a7a]">{sc.categoryId}</Td>
                    <Td right>
                      <ActionLink onClick={() => setDeleteCategoryId(sc.id)} danger>移除</ActionLink>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {showAddCategory && (
          <Modal title="添加承制品类关联" onClose={() => { setShowAddCategory(false); setNewCategoryId("") }}>
            <div className="space-y-4">
              <FormField label="选择三级品类">
                <FormSelect value={newCategoryId} onChange={e => setNewCategoryId(e.target.value)}>
                  <option value="">请选择品类</option>
                  {availableCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryName}（{c.partType}）</option>
                  ))}
                </FormSelect>
              </FormField>
              {availableCategories.length === 0 && (
                <p className="text-[12px] text-[#7a7a7a]">该供应商已关联所有可用品类。</p>
              )}
              <ModalFooter onClose={() => { setShowAddCategory(false); setNewCategoryId("") }} onSave={handleAddCategory} saveLabel="添加" />
            </div>
          </Modal>
        )}

        {deleteCategoryId && (
          <ConfirmDialog
            message="确定移除该品类关联？移除后供应商将不再参与该品类推荐。"
            onConfirm={handleDeleteCategory}
            onCancel={() => setDeleteCategoryId(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <PageHeader section="供应商中心" title="供应商管理" desc="维护供应商基础信息与承制品类；停用的供应商不参与分包推荐流程。">
        <button
          onClick={openAdd}
          className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] active:scale-95 flex items-center gap-1.5"
        >
          <Plus size={15} /> 新增供应商
        </button>
      </PageHeader>

      <Card>
        <SearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          placeholder="搜索供应商名称"
          onSearch={handleSearch}
          onReset={handleReset}
        >
          {/* 根据 API 5.3 扩展状态与承制品类多维度筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#7a7a7a] shrink-0 font-medium">状态</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-[8px] border border-[#e0e0e0] text-[13px] bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all cursor-pointer hover:border-[#b0b0b0]"
            >
              <option value="ALL">全部状态</option>
              <option value="1">启用 (正常)</option>
              <option value="0">停用 (已禁)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#7a7a7a] shrink-0 font-medium">承制品类</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-[8px] border border-[#e0e0e0] text-[13px] bg-white text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/25 focus:border-[#0066cc] transition-all cursor-pointer hover:border-[#b0b0b0] max-w-[180px] truncate"
            >
              <option value="ALL">全部分类</option>
              {CATEGORY_MASTERS.map(c => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
          </div>
        </SearchBar>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <Th>供应商名称</Th>
                <Th center>状态</Th>
                <Th>可承制品类数</Th>
                <Th>备注</Th>
                <Th right>操作</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={5} /> : paged.map(s => {
                const catCount = supCategories.filter(sc => sc.supplierId === s.id).length
                return (
                  <tr key={s.id} className="hover:bg-[#fafafa] transition-colors">
                    <Td>
                      <button onClick={() => setDetailId(s.id)} className="font-medium text-[#1d1d1f] hover:text-[#0066cc] hover:underline text-left">
                        {s.supplierName}
                      </button>
                    </Td>
                    <Td center><EnabledBadge enabled={s.enabled} /></Td>
                    <Td>
                      {catCount > 0 ? (
                        <div className="relative group inline-block">
                          <span className="text-[13px] font-semibold text-[#0066cc] cursor-default underline decoration-dotted decoration-[#99c0e8] underline-offset-2">
                            {catCount} 个品类
                          </span>
                          <div className="absolute left-0 top-full mt-2 z-50 hidden group-hover:block pointer-events-none">
                            <div className="bg-[#1d1d1f]/95 backdrop-blur-sm text-white rounded-[14px] p-3.5 shadow-2xl min-w-[300px] max-w-[380px] text-left border border-white/15">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                                <span className="text-[12px] font-semibold text-white flex items-center gap-1.5">
                                  <Tag size={13} className="text-[#0066cc]" />
                                  可承制品类主数据明细
                                </span>
                                <span className="text-[10px] text-[#86868b] font-mono">共 {catCount} 项</span>
                              </div>
                              
                              <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-0.5">
                                {supCategories.filter(sc => sc.supplierId === s.id).map(sc => {
                                  const master = CATEGORY_MASTERS.find(c => c.id === sc.categoryId)
                                  return (
                                    <div key={sc.id} className="bg-white/[0.07] hover:bg-white/[0.1] rounded-[10px] p-2.5 transition-colors border border-white/5">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[12px] font-semibold text-[#f5f5f7]">{sc.categoryName}</span>
                                        {master && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0066cc]/30 text-[#66b2ff] font-medium border border-[#0066cc]/40">
                                            {master.partType}
                                          </span>
                                        )}
                                      </div>
                                      {master ? (
                                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#a1a1a6]">
                                          <div>
                                            <span className="text-[#777]">材料类型：</span>
                                            <span className="text-[#e0e0e0] font-medium">{master.materialType}</span>
                                          </div>
                                          <div>
                                            <span className="text-[#777]">尺寸逻辑：</span>
                                            <span className="text-[#e0e0e0] font-mono text-[10px] bg-white/10 px-1 py-0.2 rounded">{master.sizeLogic}</span>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="text-[#777]">长度限制：</span>
                                            <span className="text-[#e0e0e0] font-mono">{master.lengthMin} ~ {master.lengthMax} mm</span>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="text-[#777]">宽度限制：</span>
                                            <span className="text-[#e0e0e0] font-mono">{master.widthMin} ~ {master.widthMax} mm</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] text-[#86868b]">品类ID: {sc.categoryId}</p>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#b0b0b0] text-[12px]">未关联</span>
                      )}
                    </Td>
                    <Td className="text-[#7a7a7a]">{s.remark || "—"}</Td>
                    <Td right>
                      <div className="flex items-center justify-end gap-3">
                        <ActionLink onClick={() => setDetailId(s.id)}>详情</ActionLink>
                        <ActionLink onClick={() => openEdit(s)}>编辑</ActionLink>
                        <ActionLink onClick={() => handleToggle(s)}>
                          {s.enabled === 1 ? "停用" : "启用"}
                        </ActionLink>
                        <ActionLink onClick={() => setDeleteTarget(s)} danger>删除</ActionLink>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {editTarget !== null && (
        <Modal title={editTarget.id ? "编辑供应商" : "新增供应商"} onClose={() => setEditTarget(null)}>
          <div className="space-y-4">
            <FormField label="供应商名称">
              <FormInput
                value={draft.supplierName ?? ""}
                onChange={e => setDraft(p => ({ ...p, supplierName: e.target.value }))}
                placeholder="请输入供应商名称"
              />
            </FormField>
            <FormField label="备注">
              <FormTextarea
                value={draft.remark ?? ""}
                onChange={e => setDraft(p => ({ ...p, remark: e.target.value }))}
                rows={3}
                placeholder="备注信息（选填）"
              />
            </FormField>
            <ModalFooter onClose={() => setEditTarget(null)} onSave={handleSave} />
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`确定删除供应商"${deleteTarget.supplierName}"？相关品类关联数据也将一并删除。`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
