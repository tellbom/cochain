import { useState, useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
  CATEGORY_MASTERS, CATEGORY_CONFIGS, RIGHT_RULES, RIGHT_MANUALS, TYPE_CONFIGS,
  type CategoryMasterVO, type CategoryConfigVO, type RightRuleVO, type RightManualVO, type TypePackageConfigVO,
} from "../mock"
import {
  PageHeader, Card, Th, Td, EmptyRow, SearchBar, Pagination, Modal, ModalFooter,
  FormField, FormInput, FormSelect, ConfirmDialog, ActionLink, TabBar,
} from "../components/ui"

type RuleTab = "category-master" | "special-category" | "lr-rule" | "lr-manual" | "workbag-capacity"

const TABS = [
  { id: "category-master",  label: "三级品类主数据" },
  { id: "special-category", label: "特殊品类配置" },
  { id: "lr-rule",          label: "左右识别规则" },
  { id: "lr-manual",        label: "左右件人工关系" },
  { id: "workbag-capacity", label: "工作包容量" },
]

export default function RuleConfig() {
  const [tab, setTab] = useState<RuleTab>("category-master")

  return (
    <div className="flex-1 overflow-y-auto p-7">
      <PageHeader
        section="规则配置"
        title="规则配置"
        desc="维护分包引擎所需的主数据与规则；变更配置后将影响后续批次的分包与推荐结果。"
      />
      <TabBar tabs={TABS} active={tab} onChange={t => setTab(t as RuleTab)} />
      {tab === "category-master"  && <CategoryMasterTab />}
      {tab === "special-category" && <SpecialCategoryTab />}
      {tab === "lr-rule"          && <LRRuleTab />}
      {tab === "lr-manual"        && <LRManualTab />}
      {tab === "workbag-capacity" && <WorkbagCapacityTab />}
    </div>
  )
}

// ─── Tab: 三级品类主数据 ───────────────────────────────────────────────────────

function CategoryMasterTab() {
  const [data, setData] = useState<CategoryMasterVO[]>(CATEGORY_MASTERS)
  const [keyword, setKeyword] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [editItem, setEditItem] = useState<CategoryMasterVO | null>(null)
  const [draft, setDraft] = useState<Partial<CategoryMasterVO>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => query ? data.filter(d => d.categoryName.includes(query) || d.materialType.includes(query)) : data, [data, query])
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setEditItem({ id: "", categoryName: "", materialType: "", lengthMin: 0, lengthMax: 0, widthMin: 0, widthMax: 0, sizeLogic: "AND", partType: "小型" }); setDraft({ categoryName: "", materialType: "", lengthMin: 0, lengthMax: 0, widthMin: 0, widthMax: 0, sizeLogic: "AND", partType: "小型" }) }
  const openEdit = (item: CategoryMasterVO) => { setEditItem(item); setDraft({ ...item }) }
  const handleSave = () => {
    if (!editItem) return
    if (editItem.id) setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...draft } as CategoryMasterVO : d))
    else setData(prev => [...prev, { ...draft, id: `cat${Date.now()}` } as CategoryMasterVO])
    setEditItem(null)
  }
  const handleDelete = () => {
    setData(prev => prev.filter(d => d.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5">
          <Plus size={14} />新增
        </button>
      </div>
      <Card>
        <SearchBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索品类名称或材料类型"
          onSearch={() => { setQuery(keyword); setPage(1) }} onReset={() => { setKeyword(""); setQuery(""); setPage(1) }} />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>
              <Th>品类名称</Th><Th>材料类型</Th><Th>长度区间 (mm)</Th><Th>宽度区间 (mm)</Th>
              <Th center>尺寸逻辑</Th><Th center>零件类型</Th><Th right>操作</Th>
            </tr></thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={7} /> : paged.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td><span className="font-medium">{item.categoryName}</span></Td>
                  <Td className="text-[#7a7a7a]">{item.materialType}</Td>
                  <Td className="text-[#7a7a7a] font-mono text-[12px]">{item.lengthMin} ~ {item.lengthMax}</Td>
                  <Td className="text-[#7a7a7a] font-mono text-[12px]">{item.widthMin} ~ {item.widthMax}</Td>
                  <Td center>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${item.sizeLogic === "AND" ? "bg-[#e8f1fb] text-[#0055aa]" : "bg-[#fff3e0] text-[#b54708]"}`}>{item.sizeLogic}</span>
                  </Td>
                  <Td center className="text-[#555] text-[12px]">{item.partType}</Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-3">
                      <ActionLink onClick={() => openEdit(item)}>编辑</ActionLink>
                      <ActionLink onClick={() => setDeleteId(item.id)} danger>删除</ActionLink>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {editItem !== null && (
        <Modal title={editItem.id ? "编辑三级品类" : "新增三级品类"} onClose={() => setEditItem(null)} wide>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="品类名称">
              <FormInput value={draft.categoryName ?? ""} onChange={e => setDraft(p => ({ ...p, categoryName: e.target.value }))} />
            </FormField>
            <FormField label="材料类型">
              <FormInput value={draft.materialType ?? ""} onChange={e => setDraft(p => ({ ...p, materialType: e.target.value }))} />
            </FormField>
            <FormField label="长度最小值 (mm)">
              <FormInput type="number" value={draft.lengthMin ?? 0} onChange={e => setDraft(p => ({ ...p, lengthMin: Number(e.target.value) }))} />
            </FormField>
            <FormField label="长度最大值 (mm)">
              <FormInput type="number" value={draft.lengthMax ?? 0} onChange={e => setDraft(p => ({ ...p, lengthMax: Number(e.target.value) }))} />
            </FormField>
            <FormField label="宽度最小值 (mm)">
              <FormInput type="number" value={draft.widthMin ?? 0} onChange={e => setDraft(p => ({ ...p, widthMin: Number(e.target.value) }))} />
            </FormField>
            <FormField label="宽度最大值 (mm)">
              <FormInput type="number" value={draft.widthMax ?? 0} onChange={e => setDraft(p => ({ ...p, widthMax: Number(e.target.value) }))} />
            </FormField>
            <FormField label="尺寸逻辑">
              <FormSelect value={draft.sizeLogic ?? "AND"} onChange={e => setDraft(p => ({ ...p, sizeLogic: e.target.value }))}>
                <option value="AND">AND（长宽同时满足）</option>
                <option value="OR">OR（满足其一即可）</option>
              </FormSelect>
            </FormField>
            <FormField label="零件类型">
              <FormSelect value={draft.partType ?? "小型"} onChange={e => setDraft(p => ({ ...p, partType: e.target.value }))}>
                {["小型", "中型", "大型", "超大型", "其他"].map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
            </FormField>
          </div>
          <ModalFooter onClose={() => setEditItem(null)} onSave={handleSave} />
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="确定删除该品类主数据？" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}

// ─── Tab: 特殊品类配置 ─────────────────────────────────────────────────────────

function SpecialCategoryTab() {
  const [data, setData] = useState<CategoryConfigVO[]>(CATEGORY_CONFIGS)
  const [keyword, setKeyword] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [editItem, setEditItem] = useState<CategoryConfigVO | null>(null)
  const [draft, setDraft] = useState<Partial<CategoryConfigVO>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => query ? data.filter(d => d.categoryName.includes(query)) : data, [data, query])
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setEditItem({ id: "", categoryId: "", categoryName: "", specialType: "COMPOSITE", recommendRule: "ALL_SUPPLIERS", ignoreQuality: 0 }); setDraft({ categoryId: "", categoryName: "", specialType: "COMPOSITE", recommendRule: "ALL_SUPPLIERS", ignoreQuality: 0 }) }
  const openEdit = (item: CategoryConfigVO) => { setEditItem(item); setDraft({ ...item }) }
  const handleSave = () => {
    if (!editItem) return
    if (editItem.id) setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...draft } as CategoryConfigVO : d))
    else setData(prev => [...prev, { ...draft, id: `cfg${Date.now()}` } as CategoryConfigVO])
    setEditItem(null)
  }
  const handleDelete = () => { setData(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null) }

  const SPECIAL_TYPE_MAP: Record<string, string> = { COMPOSITE: "复合材料", REINFORCEMENT: "加强件" }
  const RULE_MAP: Record<string, string> = { ALL_SUPPLIERS: "全部供应商", ROUND_ROBIN: "轮流分配" }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5">
          <Plus size={14} />新增
        </button>
      </div>
      <Card>
        <SearchBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索品类名称"
          onSearch={() => { setQuery(keyword); setPage(1) }} onReset={() => { setKeyword(""); setQuery(""); setPage(1) }} />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>
              <Th>品类名称</Th><Th>特殊类型</Th><Th>推荐规则</Th><Th center>忽略优质/普通</Th><Th right>操作</Th>
            </tr></thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={5} /> : paged.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td><span className="font-medium">{item.categoryName}</span></Td>
                  <Td><span className="text-[12px] bg-[#f3eaff] text-[#7030c0] px-2.5 py-[5px] rounded-[6px] font-medium">{SPECIAL_TYPE_MAP[item.specialType] ?? item.specialType}</span></Td>
                  <Td className="text-[#555]">{RULE_MAP[item.recommendRule] ?? item.recommendRule}</Td>
                  <Td center>
                    <span className={`text-[12px] font-medium ${item.ignoreQuality === 1 ? "text-[#b54708]" : "text-[#7a7a7a]"}`}>
                      {item.ignoreQuality === 1 ? "是" : "否"}
                    </span>
                  </Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-3">
                      <ActionLink onClick={() => openEdit(item)}>编辑</ActionLink>
                      <ActionLink onClick={() => setDeleteId(item.id)} danger>删除</ActionLink>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {editItem !== null && (
        <Modal title={editItem.id ? "编辑特殊品类配置" : "新增特殊品类配置"} onClose={() => setEditItem(null)}>
          <div className="space-y-4">
            <FormField label="品类名称">
              <FormInput value={draft.categoryName ?? ""} onChange={e => setDraft(p => ({ ...p, categoryName: e.target.value }))} />
            </FormField>
            <FormField label="特殊类型">
              <FormSelect value={draft.specialType ?? "COMPOSITE"} onChange={e => setDraft(p => ({ ...p, specialType: e.target.value }))}>
                <option value="COMPOSITE">COMPOSITE（复合材料）</option>
                <option value="REINFORCEMENT">REINFORCEMENT（加强件）</option>
              </FormSelect>
            </FormField>
            <FormField label="推荐规则">
              <FormSelect value={draft.recommendRule ?? "ALL_SUPPLIERS"} onChange={e => setDraft(p => ({ ...p, recommendRule: e.target.value }))}>
                <option value="ALL_SUPPLIERS">ALL_SUPPLIERS（全部供应商）</option>
                <option value="ROUND_ROBIN">ROUND_ROBIN（轮流分配）</option>
              </FormSelect>
            </FormField>
            <FormField label="忽略优质/普通区分">
              <FormSelect value={String(draft.ignoreQuality ?? 0)} onChange={e => setDraft(p => ({ ...p, ignoreQuality: Number(e.target.value) }))}>
                <option value="0">否（正常区分）</option>
                <option value="1">是（忽略等级）</option>
              </FormSelect>
            </FormField>
            <ModalFooter onClose={() => setEditItem(null)} onSave={handleSave} />
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="确定删除该特殊品类配置？" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}

// ─── Tab: 左右识别规则 ─────────────────────────────────────────────────────────

function LRRuleTab() {
  const [data, setData] = useState<RightRuleVO[]>(RIGHT_RULES)
  const [keyword, setKeyword] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [editItem, setEditItem] = useState<RightRuleVO | null>(null)
  const [draft, setDraft] = useState<Partial<RightRuleVO>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => query ? data.filter(d => d.aircraftModel.includes(query) || d.leftSuffix.includes(query)) : data, [data, query])
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setEditItem({ id: "", aircraftModel: "", leftSuffix: "", rightSuffix: "" }); setDraft({ aircraftModel: "", leftSuffix: "", rightSuffix: "" }) }
  const openEdit = (item: RightRuleVO) => { setEditItem(item); setDraft({ ...item }) }
  const handleSave = () => {
    if (!editItem) return
    if (editItem.id) setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...draft } as RightRuleVO : d))
    else setData(prev => [...prev, { ...draft, id: `rr${Date.now()}` } as RightRuleVO])
    setEditItem(null)
  }
  const handleDelete = () => { setData(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null) }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5">
          <Plus size={14} />新增规则
        </button>
      </div>
      <Card>
        <SearchBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索机型或后缀"
          onSearch={() => { setQuery(keyword); setPage(1) }} onReset={() => { setKeyword(""); setQuery(""); setPage(1) }} />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>
              <Th>机型</Th><Th>左件图号后缀</Th><Th>右件图号后缀</Th><Th right>操作</Th>
            </tr></thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={4} /> : paged.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td><span className="font-medium">{item.aircraftModel}</span></Td>
                  <Td><code className="font-mono text-[12px] bg-[#e8f1fb] text-[#0055aa] px-2 py-0.5 rounded">{item.leftSuffix}</code></Td>
                  <Td><code className="font-mono text-[12px] bg-[#fff3e0] text-[#b54708] px-2 py-0.5 rounded">{item.rightSuffix}</code></Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-3">
                      <ActionLink onClick={() => openEdit(item)}>编辑</ActionLink>
                      <ActionLink onClick={() => setDeleteId(item.id)} danger>删除</ActionLink>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {editItem !== null && (
        <Modal title={editItem.id ? "编辑识别规则" : "新增识别规则"} onClose={() => setEditItem(null)}>
          <div className="space-y-4">
            <FormField label="机型" hint="如 ARJ21、C919">
              <FormInput value={draft.aircraftModel ?? ""} onChange={e => setDraft(p => ({ ...p, aircraftModel: e.target.value }))} />
            </FormField>
            <FormField label="左件图号后缀">
              <FormInput value={draft.leftSuffix ?? ""} onChange={e => setDraft(p => ({ ...p, leftSuffix: e.target.value }))} placeholder="如 L、-L、LH" />
            </FormField>
            <FormField label="右件图号后缀">
              <FormInput value={draft.rightSuffix ?? ""} onChange={e => setDraft(p => ({ ...p, rightSuffix: e.target.value }))} placeholder="如 R、-R、RH" />
            </FormField>
            <ModalFooter onClose={() => setEditItem(null)} onSave={handleSave} />
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="确定删除该识别规则？" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}

// ─── Tab: 左右件人工关系 ───────────────────────────────────────────────────────

function LRManualTab() {
  const [data, setData] = useState<RightManualVO[]>(RIGHT_MANUALS)
  const [keyword, setKeyword] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [editItem, setEditItem] = useState<RightManualVO | null>(null)
  const [draft, setDraft] = useState<Partial<RightManualVO>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const PAGE_SIZE = 10

  const filtered = useMemo(() => query ? data.filter(d => d.leftPartDrawingNo.includes(query) || d.rightPartDrawingNo.includes(query)) : data, [data, query])
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openAdd = () => { setEditItem({ id: "", leftPartDrawingNo: "", rightPartDrawingNo: "" }); setDraft({ leftPartDrawingNo: "", rightPartDrawingNo: "" }) }
  const openEdit = (item: RightManualVO) => { setEditItem(item); setDraft({ ...item }) }
  const handleSave = () => {
    if (!editItem) return
    if (editItem.id) setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...draft } as RightManualVO : d))
    else setData(prev => [...prev, { ...draft, id: `rm${Date.now()}` } as RightManualVO])
    setEditItem(null)
  }
  const handleDelete = () => { setData(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null) }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5">
          <Plus size={14} />新增关系
        </button>
      </div>
      <Card>
        <SearchBar keyword={keyword} onKeywordChange={setKeyword} placeholder="搜索零件图号"
          onSearch={() => { setQuery(keyword); setPage(1) }} onReset={() => { setKeyword(""); setQuery(""); setPage(1) }} />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>
              <Th>左件零件图号</Th><Th>右件零件图号</Th><Th right>操作</Th>
            </tr></thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {paged.length === 0 ? <EmptyRow cols={3} /> : paged.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td><code className="font-mono text-[12px] text-[#0066cc]">{item.leftPartDrawingNo}</code></Td>
                  <Td><code className="font-mono text-[12px] text-[#0066cc]">{item.rightPartDrawingNo}</code></Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-3">
                      <ActionLink onClick={() => openEdit(item)}>编辑</ActionLink>
                      <ActionLink onClick={() => setDeleteId(item.id)} danger>删除</ActionLink>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
      </Card>

      {editItem !== null && (
        <Modal title={editItem.id ? "编辑左右件关系" : "新增左右件关系"} onClose={() => setEditItem(null)}>
          <div className="space-y-4">
            <FormField label="左件零件图号">
              <FormInput value={draft.leftPartDrawingNo ?? ""} onChange={e => setDraft(p => ({ ...p, leftPartDrawingNo: e.target.value }))} placeholder="如 ARJ21-DOOR-005A" className="font-mono" />
            </FormField>
            <FormField label="右件零件图号">
              <FormInput value={draft.rightPartDrawingNo ?? ""} onChange={e => setDraft(p => ({ ...p, rightPartDrawingNo: e.target.value }))} placeholder="如 ARJ21-DOOR-005B" className="font-mono" />
            </FormField>
            <ModalFooter onClose={() => setEditItem(null)} onSave={handleSave} />
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="确定删除该左右件人工关系？" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}

// ─── Tab: 工作包容量配置 ───────────────────────────────────────────────────────

function WorkbagCapacityTab() {
  const [data, setData] = useState<TypePackageConfigVO[]>(TYPE_CONFIGS)
  const [editItem, setEditItem] = useState<TypePackageConfigVO | null>(null)
  const [draft, setDraft] = useState<Partial<TypePackageConfigVO>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openEdit = (item: TypePackageConfigVO) => { setEditItem(item); setDraft({ ...item }) }
  const openAdd = () => { setEditItem({ id: "", partType: "", typeLabel: "", maxPartCount: 10 }); setDraft({ partType: "", typeLabel: "", maxPartCount: 10 }) }
  const handleSave = () => {
    if (!editItem) return
    if (editItem.id) setData(prev => prev.map(d => d.id === editItem.id ? { ...d, ...draft } as TypePackageConfigVO : d))
    else setData(prev => [...prev, { ...draft, id: `tc${Date.now()}` } as TypePackageConfigVO])
    setEditItem(null)
  }
  const handleDelete = () => { setData(prev => prev.filter(d => d.id !== deleteId)); setDeleteId(null) }

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openAdd} className="h-9 px-4 rounded-[9px] bg-[#0066cc] text-white text-[13px] font-medium hover:bg-[#0055b0] flex items-center gap-1.5">
          <Plus size={14} />新增配置
        </button>
      </div>
      <Card>
        <div className="p-4 border-b border-[#f0f0f0]">
          <p className="text-[12px] text-[#7a7a7a]">配置不同零件类型的工作包最大零件容量上限，影响分包引擎分包结果。</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>
              <Th>零件类型</Th><Th>类型标签</Th><Th right>最大零件数</Th><Th right>操作</Th>
            </tr></thead>
            <tbody className="divide-y divide-[#f5f5f7]">
              {data.length === 0 ? <EmptyRow cols={4} /> : data.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors">
                  <Td><span className="font-medium">{item.partType}</span></Td>
                  <Td className="text-[#7a7a7a]">{item.typeLabel}</Td>
                  <Td right>
                    <span className="font-bold text-[16px] text-[#0066cc]">{item.maxPartCount}</span>
                  </Td>
                  <Td right>
                    <div className="flex items-center justify-end gap-3">
                      <ActionLink onClick={() => openEdit(item)}>编辑</ActionLink>
                      <ActionLink onClick={() => setDeleteId(item.id)} danger>删除</ActionLink>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editItem !== null && (
        <Modal title={editItem.id ? "编辑工作包容量配置" : "新增工作包容量配置"} onClose={() => setEditItem(null)}>
          <div className="space-y-4">
            <FormField label="零件类型">
              <FormSelect value={draft.partType ?? ""} onChange={e => setDraft(p => ({ ...p, partType: e.target.value }))}>
                <option value="">请选择</option>
                {["小型", "中型", "大型", "超大型", "其他"].map(t => <option key={t} value={t}>{t}</option>)}
              </FormSelect>
            </FormField>
            <FormField label="类型标签">
              <FormInput value={draft.typeLabel ?? ""} onChange={e => setDraft(p => ({ ...p, typeLabel: e.target.value }))} placeholder="如 小型零件" />
            </FormField>
            <FormField label="最大零件数" hint="每个工作包内该类型零件的最大数量">
              <FormInput type="number" value={draft.maxPartCount ?? 10} onChange={e => setDraft(p => ({ ...p, maxPartCount: Number(e.target.value) }))} min={1} />
            </FormField>
            <ModalFooter onClose={() => setEditItem(null)} onSave={handleSave} />
          </div>
        </Modal>
      )}
      {deleteId && <ConfirmDialog message="确定删除该容量配置？" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </>
  )
}
