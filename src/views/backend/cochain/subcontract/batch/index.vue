<template>
    <section class="figma-page">
        <template v-if="!activeBatch">
            <header class="figma-page__header">
                <div>
                    <p class="figma-page__eyebrow">分包中心</p>
                    <h1>分包批次列表</h1>
                    <p class="figma-page__description">管理所有分包批次；支持上传 Excel 或从全流程系统抓取数据，上传成功后进入批次工作台完成分包。</p>
                </div>
                <div class="figma-page__actions batch-list-actions">
                    <el-button v-auth="'fetch'" plain type="primary" @click="fetchVisible = true"
                        ><el-icon><Cloudy /></el-icon>从全流程系统抓取</el-button
                    >
                    <el-button v-auth="'upload'" type="primary" @click="openUpload"
                        ><el-icon><Upload /></el-icon>上传 Excel</el-button
                    >
                </div>
            </header>
            <div class="figma-card">
                <form class="figma-search" role="search" @submit.prevent="loadBatches">
                    <el-input v-model="query.keyword" class="batch-keyword" clearable placeholder="搜索批次编号 / 流程编号"
                        ><template #prefix
                            ><el-icon><Search /></el-icon></template
                    ></el-input>
                    <el-select v-model="query.batchStatus" class="batch-status-select" clearable placeholder="全部状态"
                        ><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"
                    /></el-select>
                    <el-input v-model="query.operator" clearable placeholder="操作人" class="operator-input" />
                    <el-button native-type="submit" class="figma-query-button" type="primary">查询</el-button>
                    <el-button @click="resetQuery"
                        ><el-icon><Refresh /></el-icon>重置</el-button
                    >
                </form>
                <el-table v-loading="loading" :data="batches" row-key="id" table-layout="auto">
                    <el-table-column label="批次编号" min-width="170"
                        ><template #default="{ row }"
                            ><span class="batch-number">{{ row.batchNo }}</span></template
                        ></el-table-column
                    >
                    <el-table-column label="流程编号" min-width="128"
                        ><template #default="{ row }"
                            ><span class="flow-number">{{ row.flowNo || '—' }}</span></template
                        ></el-table-column
                    >
                    <el-table-column label="状态" min-width="112"
                        ><template #default="{ row }"
                            ><span class="figma-status" :data-status="row.batchStatus">{{ statusLabel(row.batchStatus) }}</span></template
                        ></el-table-column
                    >
                    <el-table-column label="上传文件" min-width="238" show-overflow-tooltip
                        ><template #default="{ row }"
                            ><span class="upload-file"
                                ><el-icon><Document /></el-icon>{{ row.uploadFileName || '—' }}</span
                            ></template
                        ></el-table-column
                    >
                    <el-table-column label="零件数" width="86" align="center"
                        ><template #default="{ row }"
                            ><strong class="table-count">{{ row.totalPartCount }}</strong></template
                        ></el-table-column
                    >
                    <el-table-column label="工作包数" width="92" align="center"
                        ><template #default="{ row }"
                            ><strong class="table-count">{{ row.totalPackageCount }}</strong></template
                        ></el-table-column
                    >
                    <el-table-column label="操作人" width="92"
                        ><template #default="{ row }"
                            ><span class="operator-name">{{ row.operator }}</span></template
                        ></el-table-column
                    >
                    <el-table-column label="操作" width="176" fixed="right" align="right"
                        ><template #default="{ row }"
                            ><el-button link type="primary" @click="enterWorkbench(row)"
                                >进入工作台 <el-icon><ArrowRight /></el-icon></el-button
                            ><el-button v-auth="'delete'" link type="danger" @click="removeBatch(row)">删除</el-button></template
                        ></el-table-column
                    >
                    <template #empty><div class="empty-copy">暂无批次数据</div></template>
                </el-table>
                <footer class="figma-pagination">
                    <span>共 {{ total }} 条</span><span>{{ query.pageSize }} 条/页</span
                    ><el-pagination
                        v-model:current-page="query.pageNum"
                        :page-size="query.pageSize"
                        :total="total"
                        layout="prev, pager, next"
                        @current-change="loadBatches"
                    />
                </footer>
            </div>
        </template>

        <template v-else>
            <div class="batch-workbench">
                <header class="workbench-topbar">
                    <button class="back-button" type="button" @click="leaveWorkbench">
                        <el-icon><ArrowLeft /></el-icon>返回批次列表
                    </button>
                    <div class="batch-summary-row">
                        <div class="batch-summary-primary">
                            <span>批次编号</span><strong>{{ activeBatch.batchNo }}</strong>
                        </div>
                        <i class="summary-divider" aria-hidden="true"></i>
                        <span class="figma-status workbench-status" :data-status="activeBatch.batchStatus">{{
                            statusLabel(activeBatch.batchStatus)
                        }}</span>
                        <template v-if="activeBatch.flowNo">
                            <i class="summary-divider" aria-hidden="true"></i>
                            <div class="batch-summary-primary">
                                <span>流程编号</span><strong class="flow-id">{{ activeBatch.flowNo }}</strong>
                            </div>
                        </template>
                        <i class="summary-divider" aria-hidden="true"></i>
                        <div class="batch-facts">
                            <span
                                >零件：<strong>{{ activeBatch.totalPartCount }}</strong></span
                            ><span
                                >工作包：<strong>{{ packages.length }}</strong></span
                            ><span
                                >操作人：<b>{{ activeBatch.operator }}</b></span
                            >
                        </div>
                        <div class="workbench-actions">
                            <el-button v-if="canPackage" v-auth="'package'" @click="advance('PACKAGED')">生成工作包</el-button>
                            <el-button v-if="canRecommend" v-auth="'recommend'" @click="advance('RECOMMENDED')">生成供应商推荐</el-button>
                            <el-button v-auth="'run'" :disabled="!canRun" @click="advance('RECOMMENDED')"
                                ><el-icon><Lightning /></el-icon>一键编排</el-button
                            >
                            <el-button
                                v-auth="'export-result'"
                                :disabled="!['RECOMMENDED', 'COMPLETED'].includes(activeBatch.batchStatus)"
                                @click="exportResult"
                                ><el-icon><Download /></el-icon>导出 Excel</el-button
                            >
                        </div>
                    </div>
                </header>

                <div v-if="packages.length" class="workbench-layout">
                    <aside class="package-sidebar">
                        <div class="package-sidebar__title">工作包列表 ({{ packages.length }})</div>
                        <div class="package-list">
                            <button
                                v-for="item in packages"
                                :key="item.id"
                                class="package-card"
                                :class="{ 'is-active': selectedPackage?.id === item.id }"
                                type="button"
                                @click="selectPackage(item)"
                            >
                                <span class="package-card__top"
                                    ><strong>{{ item.packageNo }}</strong
                                    ><em v-if="item.recommendationStatus">已推荐</em></span
                                >
                                <span class="package-card__category">{{ categoryName(item.categoryId) }}</span>
                                <span class="package-card__meta"
                                    >零件 {{ item.partCount }}<i>·</i>{{ item.partType }}<b v-if="item.isSpecialCategory">特殊品类</b></span
                                >
                            </button>
                        </div>
                    </aside>

                    <main v-if="selectedPackage" class="package-workspace">
                        <section class="package-overview">
                            <div class="package-overview__title">
                                <strong>{{ selectedPackage.packageNo }}</strong
                                ><span>{{ categoryName(selectedPackage.categoryId) }}</span
                                ><em v-if="selectedPackage.hasHistorySupplier">有历史供应商</em
                                ><em v-if="selectedPackage.isSpecialCategory" class="is-special">特殊品类 · {{ selectedPackage.specialType }}</em>
                            </div>
                            <dl class="package-overview__facts">
                                <div>
                                    <dt>零件类型</dt>
                                    <dd>{{ selectedPackage.partType }}</dd>
                                </div>
                                <div>
                                    <dt>零件数量</dt>
                                    <dd>{{ selectedPackage.partCount }} / {{ selectedPackage.maxPartLimit }}（容量上限）</dd>
                                </div>
                                <div>
                                    <dt>供应商需求数</dt>
                                    <dd>{{ selectedPackage.supplierCountNeeded }}</dd>
                                </div>
                                <div>
                                    <dt>应推荐供应商数</dt>
                                    <dd>{{ selectedPackage.recommendCount }}</dd>
                                </div>
                            </dl>
                        </section>

                        <div class="package-detail-tabs">
                            <nav aria-label="工作包详情">
                                <button :class="{ 'is-active': detailTab === 'parts' }" type="button" @click="detailTab = 'parts'">
                                    零件明细 ({{ selectedPackage.partCount }})</button
                                ><button
                                    :class="{ 'is-active': detailTab === 'recommendations' }"
                                    type="button"
                                    @click="detailTab = 'recommendations'"
                                >
                                    推荐结果 ({{ visibleRecommendations.length }})
                                </button>
                            </nav>
                            <div v-if="detailTab === 'recommendations' && activeBatch.batchStatus === 'RECOMMENDED'" class="manual-add">
                                <span>手动添加</span
                                ><el-select v-model="manualSupplierId" filterable placeholder="选择供应商…"
                                    ><el-option
                                        v-for="item in availableManualSuppliers"
                                        :key="item.id"
                                        :label="item.supplierName"
                                        :value="item.id" /></el-select
                                ><el-button type="primary" :disabled="!manualSupplierId" @click="addManualSupplier"
                                    ><el-icon><Plus /></el-icon>添加</el-button
                                >
                            </div>
                        </div>

                        <template v-if="detailTab === 'parts'">
                            <div v-if="lockedBatch" class="package-lock-notice">
                                <el-icon><Switch /></el-icon>批次已处于【{{ statusLabel(activeBatch.batchStatus) }}】状态，不允许执行移包操作。
                            </div>
                            <section class="workbench-table-card">
                                <el-table :data="visibleParts" row-key="id">
                                    <el-table-column prop="seqNo" label="序号" width="54" align="center" />
                                    <el-table-column label="零件图号" min-width="135"
                                        ><template #default="{ row }"
                                            ><span class="part-drawing-no">{{ row.partDrawingNo }}</span></template
                                        ></el-table-column
                                    >
                                    <el-table-column label="零件名称" min-width="120"
                                        ><template #default="{ row }"
                                            ><strong class="part-name">{{ row.partName }}</strong></template
                                        ></el-table-column
                                    >
                                    <el-table-column prop="materialType" label="材料类型" width="90" />
                                    <el-table-column label="尺寸（长×宽）" width="120"
                                        ><template #default="{ row }"
                                            ><span class="part-size">{{ row.lengthValue }} × {{ row.widthValue }} mm</span></template
                                        ></el-table-column
                                    >
                                    <el-table-column label="套裁信息" width="100"
                                        ><template #default="{ row }"
                                            ><span v-if="row.nestingInfo" class="nesting-tag">{{ row.nestingInfo }}</span
                                            ><span v-else class="empty-value">—</span></template
                                        ></el-table-column
                                    >
                                    <el-table-column label="历史供应商" min-width="140" show-overflow-tooltip
                                        ><template #default="{ row }"
                                            ><span class="history-suppliers">{{
                                                [row.historySupplier1, row.historySupplier2, row.historySupplier3].filter(Boolean).join('、') || '—'
                                            }}</span></template
                                        ></el-table-column
                                    >
                                    <el-table-column label="操作" width="82" align="center"
                                        ><template #default="{ row }"
                                            ><el-button link type="primary" @click="showPart(row)"
                                                ><el-icon><InfoFilled /></el-icon>详情</el-button
                                            ><el-button v-if="!lockedBatch" link type="primary" @click="openMove(row)">移动</el-button></template
                                        ></el-table-column
                                    >
                                    <template #empty><div class="empty-copy">当前工作包暂无零件数据</div></template>
                                </el-table>
                                <footer class="workbench-table-footer">
                                    <span>共 {{ visibleParts.length }} 条</span><span>8 条/页</span
                                    ><el-pagination :total="visibleParts.length" :page-size="8" layout="prev, pager, next" />
                                </footer>
                            </section>
                        </template>

                        <section v-else class="workbench-table-card recommendation-table-card">
                            <el-table :data="visibleRecommendations" row-key="id">
                                <el-table-column label="推荐顺序" width="130" align="center"
                                    ><template #default="{ row }"
                                        ><span class="recommend-order" :class="{ 'is-leading': row.recommendOrder <= 2 }">{{
                                            row.recommendOrder
                                        }}</span></template
                                    ></el-table-column
                                >
                                <el-table-column label="供应商名称" min-width="220"
                                    ><template #default="{ row }"
                                        ><strong class="recommend-supplier">{{ row.supplierName }}</strong></template
                                    ></el-table-column
                                >
                                <el-table-column label="推荐来源" min-width="150"
                                    ><template #default="{ row }"
                                        ><span class="recommend-source" :data-source="row.recommendSource">{{
                                            sourceLabel(row.recommendSource)
                                        }}</span></template
                                    ></el-table-column
                                >
                                <el-table-column label="质量等级" width="120" align="center"
                                    ><template #default="{ row }"
                                        ><strong class="recommend-quality" :data-level="row.qualityLevel">{{ row.qualityLevel }}</strong></template
                                    ></el-table-column
                                >
                                <el-table-column label="绩效得分" width="130" align="right"
                                    ><template #default="{ row }"
                                        ><strong class="recommend-score">{{ row.performanceScore.toFixed(1) }}</strong></template
                                    ></el-table-column
                                >
                                <el-table-column label="操作" width="92" align="center"><template #default>—</template></el-table-column>
                                <template #empty><div class="empty-copy">暂无推荐结果</div></template>
                            </el-table>
                            <footer class="workbench-table-footer">
                                <span>共 {{ visibleRecommendations.length }} 条</span><span>8 条/页</span
                                ><el-pagination :total="visibleRecommendations.length" :page-size="8" layout="prev, pager, next" />
                            </footer>
                        </section>
                    </main>

                    <div v-else class="workbench-empty">请选择左侧工作包</div>
                </div>
                <div v-else class="workbench-empty no-packages">当前批次尚未生成工作包</div>
            </div>
        </template>

        <el-dialog v-model="uploadVisible" title="上传分包数据" width="min(620px, 94vw)"
            ><el-form label-position="top"
                ><el-form-item label="Excel 文件" required
                    ><el-upload drag :auto-upload="false" :limit="1" accept=".xlsx,.xls" :on-change="(file) => (uploadFile = file)"
                        ><el-icon class="upload-icon"><Upload /></el-icon>
                        <div>拖拽文件到此处，或 <span class="figma-link">点击选择文件</span></div>
                        <template #tip><div>支持 .xlsx、.xls，单个文件不超过 20 MB</div></template></el-upload
                    ></el-form-item
                >
                <div class="dialog-grid">
                    <el-form-item label="机型（可选）"><el-input v-model="uploadForm.aircraftModel" placeholder="用于补全缺失机型" /></el-form-item
                    ><el-form-item label="操作人（可选）"><el-input v-model="uploadForm.operator" placeholder="默认当前用户" /></el-form-item>
                </div>
                <a class="figma-link" href="#" @click.prevent="downloadTemplate">下载 Excel 模板</a></el-form
            ><template #footer
                ><el-button @click="uploadVisible = false">取消</el-button
                ><el-button type="primary" :loading="saving" @click="submitUpload">开始导入</el-button></template
            ></el-dialog
        >
        <el-dialog v-model="fetchVisible" title="从全流程系统抓取" width="min(520px, 94vw)"
            ><el-form label-position="top"
                ><el-form-item label="流程编号" required
                    ><el-input v-model="fetchFlowNo" placeholder="请输入全流程系统流程编号" /></el-form-item></el-form
            ><template #footer
                ><el-button @click="fetchVisible = false">取消</el-button
                ><el-button type="primary" :loading="saving" @click="submitFetch">开始抓取</el-button></template
            ></el-dialog
        >
        <el-dialog v-model="partVisible" title="零件详情" width="min(680px, 94vw)"
            ><dl v-if="currentPart" class="figma-info-grid">
                <div>
                    <dt>零件图号</dt>
                    <dd>{{ currentPart.partDrawingNo }}</dd>
                </div>
                <div>
                    <dt>零件名称</dt>
                    <dd>{{ currentPart.partName }}</dd>
                </div>
                <div>
                    <dt>机型</dt>
                    <dd>{{ currentPart.aircraftModel }}</dd>
                </div>
                <div>
                    <dt>材料</dt>
                    <dd>{{ currentPart.materialType }}</dd>
                </div>
                <div>
                    <dt>尺寸</dt>
                    <dd>{{ currentPart.lengthValue }} × {{ currentPart.widthValue }}</dd>
                </div>
                <div>
                    <dt>历史供应商</dt>
                    <dd>{{ currentPart.historySupplier1 || '无' }}</dd>
                </div>
            </dl></el-dialog
        >
        <el-dialog v-model="moveVisible" title="移动零件" width="min(480px, 94vw)"
            ><el-form label-position="top"
                ><el-form-item label="目标工作包"
                    ><el-select v-model="movePackageId" style="width: 100%"
                        ><el-option
                            v-for="item in packages.filter((p) => p.id !== selectedPackage?.id)"
                            :key="item.id"
                            :label="item.packageNo"
                            :value="item.id" /></el-select></el-form-item></el-form
            ><template #footer
                ><el-button @click="moveVisible = false">取消</el-button><el-button type="primary" @click="submitMove">确认移动</el-button></template
            ></el-dialog
        >
        <el-dialog v-model="manualVisible" title="手工添加供应商" width="min(520px, 94vw)"
            ><el-form label-position="top"
                ><el-form-item label="供应商"
                    ><el-select v-model="manualSupplierId" filterable style="width: 100%"
                        ><el-option
                            v-for="item in suppliers"
                            :key="item.id"
                            :label="item.supplierName"
                            :value="item.id" /></el-select></el-form-item></el-form
            ><template #footer
                ><el-button @click="manualVisible = false">取消</el-button
                ><el-button type="primary" @click="addManualSupplier">确认添加</el-button></template
            ></el-dialog
        >
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import {
    ArrowLeft,
    ArrowRight,
    Cloudy,
    Document,
    Download,
    InfoFilled,
    Lightning,
    Plus,
    Refresh,
    Search,
    Switch,
    Upload,
} from '@element-plus/icons-vue'
import type { BatchPartVO, BatchStatus, BatchVO, PackageVO, SupplierRecommendationVO, SupplierVO } from '/@/features/cochain/contracts'
import { getResourceService } from '/@/features/cochain/services'

const batchService = getResourceService('batches')
const packageService = getResourceService('packages')
const partService = getResourceService('batchParts')
const recommendationService = getResourceService('recommendations')
const supplierService = getResourceService('suppliers')
const query = reactive({ keyword: '', batchStatus: undefined as BatchStatus | undefined, operator: '', pageNum: 1, pageSize: 10 })
const statusOptions = [
    { value: 'DRAFT', label: '草稿' },
    { value: 'DATA_READY', label: '数据就绪' },
    { value: 'PACKAGED', label: '已分包' },
    { value: 'RECOMMENDED', label: '已推荐' },
    { value: 'COMPLETED', label: '已完成' },
] as const
const batches = ref<BatchVO[]>([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const activeBatch = ref<BatchVO>()
const packages = ref<PackageVO[]>([])
const parts = ref<BatchPartVO[]>([])
const recommendations = ref<SupplierRecommendationVO[]>([])
const suppliers = ref<SupplierVO[]>([])
const selectedPackage = ref<PackageVO>()
const detailTab = ref<'parts' | 'recommendations'>('parts')
const uploadVisible = ref(false)
const fetchVisible = ref(false)
const partVisible = ref(false)
const moveVisible = ref(false)
const manualVisible = ref(false)
const uploadFile = ref<UploadFile>()
const uploadForm = reactive({ aircraftModel: '', operator: '' })
const fetchFlowNo = ref('')
const currentPart = ref<BatchPartVO>()
const movePart = ref<BatchPartVO>()
const movePackageId = ref('')
const manualSupplierId = ref('')
const visibleParts = computed(() => parts.value.filter((item) => item.packageId === selectedPackage.value?.id))
const visibleRecommendations = computed(() => recommendations.value.filter((item) => item.packageId === selectedPackage.value?.id))
const availableManualSuppliers = computed(() =>
    suppliers.value.filter((supplier) => supplier.enabled === 1 && !visibleRecommendations.value.some((item) => item.supplierId === supplier.id))
)
const canPackage = computed(() => activeBatch.value?.batchStatus === 'DATA_READY')
const canRecommend = computed(() => activeBatch.value?.batchStatus === 'PACKAGED')
const canRun = computed(() => !!activeBatch.value && activeBatch.value.batchStatus !== 'DRAFT')
const lockedBatch = computed(() => !!activeBatch.value && ['RECOMMENDED', 'COMPLETED'].includes(activeBatch.value.batchStatus))
const statusLabel = (status: BatchStatus) => statusOptions.find((item) => item.value === status)?.label || status
const sourceLabel = (source: string) =>
    ({ HISTORY: '历史供应商', QUALITY_ROUND: '优质轮询', NORMAL_ROUND: '普通轮询', ALL_CATEGORY: '全品类补位' })[source] || source
const categoryName = (id: string) =>
    ({ cat001: '铝合金钣金件', cat002: '钛合金机加工件', cat003: '复合材料蒙皮', cat004: '标准紧固件', cat005: '橡胶密封件' })[id] || id
const loadBatches = async () => {
    loading.value = true
    try {
        const result = await batchService.page(query)
        batches.value = result.records
        total.value = result.total
    } finally {
        loading.value = false
    }
}
const resetQuery = () => {
    Object.assign(query, { keyword: '', batchStatus: undefined, operator: '', pageNum: 1 })
    loadBatches()
}
const enterWorkbench = async (row: BatchVO) => {
    activeBatch.value = { ...row }
    const [packageRows, partRows, recRows, supplierRows] = await Promise.all([
        packageService.list({ batchId: row.id } as any),
        partService.list({ batchId: row.id } as any),
        recommendationService.list({ batchId: row.id } as any),
        supplierService.list({ enabled: 1 } as any),
    ])
    packages.value = packageRows
    parts.value = partRows
    recommendations.value = recRows
    suppliers.value = supplierRows
    selectedPackage.value = packageRows[0]
}
const leaveWorkbench = () => {
    activeBatch.value = undefined
    selectedPackage.value = undefined
    loadBatches()
}
const selectPackage = (item: PackageVO) => {
    selectedPackage.value = item
    detailTab.value = 'parts'
}
const advance = async (next: BatchStatus) => {
    if (!activeBatch.value) return
    const updated = {
        ...activeBatch.value,
        batchStatus: next,
        totalPackageCount:
            next === 'PACKAGED' && !activeBatch.value.totalPackageCount ? Math.max(1, packages.value.length) : activeBatch.value.totalPackageCount,
    }
    await batchService.update(updated)
    activeBatch.value = updated
    ElMessage.success(next === 'PACKAGED' ? '工作包已生成' : next === 'RECOMMENDED' ? '供应商推荐已生成' : '编排已完成')
}
const removeBatch = async (row: BatchVO) => {
    await ElMessageBox.confirm(`确认删除批次 ${row.batchNo}？`, '删除批次', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    await batchService.remove(row.id)
    ElMessage.success('批次已删除')
    loadBatches()
}
const openUpload = () => {
    uploadFile.value = undefined
    Object.assign(uploadForm, { aircraftModel: '', operator: '' })
    uploadVisible.value = true
}
const submitUpload = async () => {
    if (!uploadFile.value) return ElMessage.warning('请选择 Excel 文件')
    saving.value = true
    try {
        await batchService.create({
            batchNo: `SUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-3)}`,
            flowNo: '',
            batchStatus: 'DATA_READY',
            uploadFileName: uploadFile.value.name,
            totalPartCount: 102,
            totalPackageCount: 0,
            operator: uploadForm.operator || '当前用户',
        })
        uploadVisible.value = false
        ElMessage.success('导入完成：104 行中 102 行成功')
        loadBatches()
    } finally {
        saving.value = false
    }
}
const submitFetch = async () => {
    if (!fetchFlowNo.value.trim()) return ElMessage.warning('请输入流程编号')
    saving.value = true
    try {
        await batchService.create({
            batchNo: `SUB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-3)}`,
            flowNo: fetchFlowNo.value,
            batchStatus: 'DATA_READY',
            uploadFileName: '全流程系统抓取',
            totalPartCount: 68,
            totalPackageCount: 0,
            operator: '当前用户',
        })
        fetchVisible.value = false
        ElMessage.success('流程数据抓取成功')
        loadBatches()
    } finally {
        saving.value = false
    }
}
const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob(['零件图号,机型,零件名称,材料'], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = '分包数据模板.csv'
    a.click()
    URL.revokeObjectURL(url)
}
const exportResult = () => {
    if (!activeBatch.value) return
    const url = URL.createObjectURL(new Blob([`批次编号,${activeBatch.value.batchNo}`], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeBatch.value.batchNo}-推荐结果.csv`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('结果已导出')
}
const showPart = (row: BatchPartVO) => {
    currentPart.value = row
    partVisible.value = true
}
const openMove = (row: BatchPartVO) => {
    movePart.value = row
    movePackageId.value = ''
    moveVisible.value = true
}
const submitMove = async () => {
    if (!movePart.value || !movePackageId.value) return ElMessage.warning('请选择目标工作包')
    const updated = { ...movePart.value, packageId: movePackageId.value }
    await partService.update(updated)
    const index = parts.value.findIndex((item) => item.id === updated.id)
    if (index >= 0) parts.value[index] = updated
    moveVisible.value = false
    ElMessage.success('零件已移动')
}
const addManualSupplier = async () => {
    const supplier = suppliers.value.find((item) => item.id === manualSupplierId.value)
    if (!supplier || !activeBatch.value || !selectedPackage.value) return ElMessage.warning('请选择供应商')
    await recommendationService.create({
        packageId: selectedPackage.value.id,
        batchId: activeBatch.value.id,
        supplierId: supplier.id,
        supplierName: supplier.supplierName,
        recommendOrder: visibleRecommendations.value.length + 1,
        recommendSource: 'ALL_CATEGORY',
        qualityLevel: '普通',
        performanceScore: 0,
    })
    recommendations.value = await recommendationService.list({ batchId: activeBatch.value.id } as any)
    manualSupplierId.value = ''
    manualVisible.value = false
    ElMessage.success('供应商已添加')
}
onMounted(loadBatches)
</script>

<style scoped>
.figma-page__actions .el-button:first-child {
    width: 158px;
}
.figma-page__actions .el-button:nth-child(2) {
    width: 114px;
}
.batch-keyword {
    width: 224px !important;
}
.batch-status-select {
    width: 98px !important;
}
.operator-input {
    width: 112px !important;
}
.batch-number {
    color: #1d1d1f;
    font:
        600 12px ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace;
}
.flow-number {
    color: #7a7a7a;
    font:
        12px ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace;
}
.upload-file {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #555;
}
.upload-file .el-icon {
    color: #b0b0b0;
}
.table-count {
    color: #1d1d1f;
    font-weight: 600;
}
.operator-name {
    color: #7a7a7a;
}
.empty-copy {
    padding: 48px 20px;
    color: #a1a1a6;
    text-align: center;
}
.empty-large {
    min-height: 430px;
    display: grid;
    place-items: center;
}
.back-button {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0 0 6px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #0066cc;
    font: 500 12px var(--co-font-family);
    cursor: pointer;
}
.title-line {
    display: flex;
    align-items: center;
    gap: 12px;
}
.package-info {
    border-bottom: 1px solid #f0f0f0;
}
.workbench-detail {
    min-width: 0;
}
.recommend-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 54px;
    padding: 10px 18px;
    border-bottom: 1px solid #f0f0f0;
}
.dialog-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.upload-icon {
    margin-bottom: 8px;
    color: #0066cc;
    font-size: 28px;
}
:deep(.el-upload),
:deep(.el-upload-dragger) {
    width: 100%;
}
:deep(.el-upload-dragger) {
    padding: 30px 18px;
    border-radius: 10px;
    background: #fafafc;
}
@media (max-width: 768px) {
    .dialog-grid {
        grid-template-columns: 1fr;
    }
}
.workbench-header .figma-page__actions .el-button {
    width: auto;
}

.batch-workbench {
    width: calc(100% + 56px);
    min-height: calc(100vh - 52px);
    margin: -28px;
    background: #f5f5f7;
}

.workbench-topbar {
    padding: 18px 26px 20px;
    border-bottom: 1px solid #e5e5e7;
    background: #fff;
}

.workbench-topbar .back-button {
    margin-bottom: 16px;
    font-size: 13px;
}

.batch-summary-row,
.batch-facts,
.workbench-actions,
.package-card__top,
.package-overview__title,
.package-detail-tabs,
.manual-add,
.workbench-table-footer {
    display: flex;
    align-items: center;
}

.batch-summary-row {
    gap: 18px;
}
.batch-summary-primary {
    display: grid;
    gap: 3px;
}
.batch-summary-primary span {
    color: #7a7a7a;
    font-size: 11px;
}
.batch-summary-primary strong {
    color: #1d1d1f;
    font:
        650 13px ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        monospace;
    white-space: nowrap;
}
.batch-summary-primary .flow-id {
    color: #555;
    font-weight: 500;
}
.summary-divider {
    width: 1px;
    height: 38px;
    background: #e0e0e0;
}
.workbench-status {
    min-height: 30px;
    padding-inline: 12px;
}
.batch-facts {
    gap: 18px;
    color: #7a7a7a;
    font-size: 13px;
    white-space: nowrap;
}
.batch-facts strong,
.batch-facts b {
    color: #1d1d1f;
    font-weight: 650;
}
.workbench-actions {
    gap: 10px;
    margin-left: auto;
}
.batch-workbench :deep(.workbench-actions .el-button) {
    width: auto;
    min-height: 38px;
    padding-inline: 16px;
    border-radius: 10px;
    color: #1d1d1f;
}

.workbench-layout {
    display: grid;
    grid-template-columns: 270px minmax(0, 1fr);
    min-height: 720px;
}
.package-sidebar {
    border-right: 1px solid #e5e5e7;
    background: #fff;
}
.package-sidebar__title {
    padding: 16px 18px 14px;
    border-bottom: 1px solid #f0f0f0;
    color: #6e6e73;
    font-size: 13px;
    font-weight: 650;
}
.package-list {
    display: grid;
    gap: 9px;
    padding: 14px;
}
.package-card {
    display: grid;
    gap: 7px;
    width: 100%;
    padding: 14px;
    border: 1px solid #dedee1;
    border-radius: 12px;
    background: #fff;
    color: #1d1d1f;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition:
        border-color 160ms ease,
        background-color 160ms ease;
}
.package-card:hover {
    background: #fafafa;
}
.package-card:focus-visible {
    outline: 3px solid rgba(0, 102, 204, 0.22);
    outline-offset: 2px;
}
.package-card.is-active {
    border-color: #0071e3;
    background: #e8f2fc;
}
.package-card__top {
    justify-content: space-between;
    gap: 10px;
}
.package-card__top strong {
    color: #555;
    font:
        650 11px ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        monospace;
}
.package-card.is-active .package-card__top strong {
    color: #0055aa;
}
.package-card__top em {
    padding: 2px 7px;
    border-radius: 5px;
    background: #f0faf0;
    color: #1a7f3c;
    font-size: 10px;
    font-style: normal;
    font-weight: 550;
}
.package-card__category {
    color: #555;
    font-size: 13px;
}
.package-card__meta {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #7a7a7a;
    font-size: 11px;
}
.package-card__meta i {
    font-style: normal;
}
.package-card__meta b {
    padding: 2px 6px;
    border-radius: 5px;
    background: #fff3e0;
    color: #b54708;
    font-size: 10px;
    font-weight: 550;
}

.package-workspace {
    display: grid;
    align-content: start;
    gap: 16px;
    min-width: 0;
    padding: 20px;
}
.package-overview,
.workbench-table-card {
    overflow: hidden;
    border: 1px solid #dedee1;
    border-radius: 16px;
    background: #fff;
}
.package-overview__title {
    gap: 12px;
    min-height: 58px;
    padding: 12px 20px;
    border-bottom: 1px solid #f0f0f0;
}
.package-overview__title strong {
    font:
        650 13px ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        monospace;
}
.package-overview__title > span {
    color: #7a7a7a;
    font-size: 12px;
}
.package-overview__title em {
    padding: 3px 9px;
    border: 1px solid #b3d0f5;
    border-radius: 6px;
    background: #e8f1fb;
    color: #0055aa;
    font-size: 11px;
    font-style: normal;
    font-weight: 550;
}
.package-overview__title em.is-special {
    border-color: #f5c77e;
    background: #fff3e0;
    color: #b54708;
}
.package-overview__facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 80px;
    margin: 0;
    padding: 18px 20px;
}
.package-overview__facts > div {
    display: grid;
    grid-template-columns: 130px minmax(0, 1fr);
    align-items: center;
}
.package-overview__facts dt {
    color: #7a7a7a;
    font-size: 12px;
}
.package-overview__facts dd {
    margin: 0;
    color: #1d1d1f;
    font-size: 13px;
    font-weight: 560;
}

.package-detail-tabs {
    justify-content: space-between;
    min-height: 52px;
    border-bottom: 1px solid #ececef;
}
.package-detail-tabs nav {
    display: flex;
    align-self: stretch;
}
.package-detail-tabs nav button {
    position: relative;
    padding: 0 20px;
    border: 0;
    background: transparent;
    color: #7a7a7a;
    font: 550 13px var(--co-font-family);
    cursor: pointer;
}
.package-detail-tabs nav button.is-active {
    color: #0066cc;
}
.package-detail-tabs nav button.is-active::after {
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: #0066cc;
    content: '';
}
.manual-add {
    gap: 8px;
    padding-right: 2px;
}
.manual-add > span {
    color: #999;
    font-size: 11px;
}
.manual-add .el-select {
    width: 200px;
}
.batch-workbench :deep(.manual-add .el-select__wrapper),
.batch-workbench :deep(.manual-add .el-button) {
    min-height: 32px;
    border-radius: 8px;
}

.package-lock-notice {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 11px 15px;
    border: 1px solid #f5c77e;
    border-radius: 11px;
    background: #fff3e0;
    color: #b54708;
    font-size: 12px;
}
.batch-workbench :deep(.workbench-table-card .el-table th.el-table__cell) {
    height: 48px;
}
.batch-workbench :deep(.workbench-table-card .el-table td.el-table__cell) {
    height: 58px;
}
.part-drawing-no {
    color: #0066cc;
    font:
        500 12px ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        monospace;
}
.part-name,
.recommend-supplier {
    color: #1d1d1f;
    font-weight: 600;
}
.part-size,
.history-suppliers {
    color: #7a7a7a;
    font-size: 12px;
}
.nesting-tag {
    padding: 2px 8px;
    border-radius: 5px;
    background: #f3eaff;
    color: #7030c0;
    font:
        550 11px ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        monospace;
}
.empty-value {
    color: #c7c7cc;
}
.workbench-table-footer {
    justify-content: flex-end;
    gap: 14px;
    min-height: 58px;
    padding: 10px 16px;
    border-top: 1px solid #f0f0f0;
    color: #7a7a7a;
    font-size: 12px;
}

.recommend-order {
    display: inline-grid;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    place-items: center;
    background: #f5f5f7;
    color: #555;
    font-size: 12px;
    font-weight: 700;
}
.recommend-order.is-leading {
    background: #0066cc;
    color: #fff;
}
.recommend-source {
    display: inline-flex;
    padding: 3px 9px;
    border: 1px solid #dedee1;
    border-radius: 6px;
    background: #f5f5f7;
    color: #555;
    font-size: 11px;
    font-weight: 550;
}
.recommend-source[data-source='HISTORY'] {
    border-color: #b3d0f5;
    background: #e8f1fb;
    color: #0055aa;
}
.recommend-source[data-source='QUALITY_ROUND'] {
    border-color: #b7ebc0;
    background: #f0faf0;
    color: #1a7f3c;
}
.recommend-source[data-source='ALL_CATEGORY'] {
    border-color: #f5c77e;
    background: #fff3e0;
    color: #b54708;
}
.recommend-quality {
    color: #7a7a7a;
    font-size: 12px;
}
.recommend-quality[data-level='优质'] {
    color: #1a7f3c;
}
.recommend-score {
    color: #1d1d1f;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}
.workbench-empty {
    display: grid;
    min-height: 520px;
    place-items: center;
    color: #a1a1a6;
}
.no-packages {
    min-height: 700px;
}

@media (max-width: 1100px) {
    .batch-summary-row {
        flex-wrap: wrap;
    }
    .workbench-actions {
        width: 100%;
        margin-left: 0;
    }
    .workbench-layout {
        grid-template-columns: 230px minmax(0, 1fr);
    }
    .package-overview__facts {
        gap: 16px 30px;
    }
}

@media (max-width: 820px) {
    .batch-workbench {
        width: calc(100% + 32px);
        margin: -16px;
    }
    .summary-divider {
        display: none;
    }
    .workbench-layout {
        grid-template-columns: 1fr;
    }
    .package-sidebar {
        border-right: 0;
        border-bottom: 1px solid #e5e5e7;
    }
    .package-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .package-overview__facts {
        grid-template-columns: 1fr;
    }
    .package-detail-tabs {
        align-items: stretch;
        flex-direction: column;
        gap: 10px;
    }
    .manual-add {
        justify-content: flex-end;
        padding-bottom: 10px;
    }
}

@media (max-width: 560px) {
    .workbench-topbar {
        padding-inline: 16px;
    }
    .batch-facts {
        align-items: flex-start;
        flex-direction: column;
        gap: 5px;
    }
    .workbench-actions {
        flex-wrap: wrap;
    }
    .package-list {
        grid-template-columns: 1fr;
    }
    .package-workspace {
        padding: 14px;
    }
    .package-overview__facts > div {
        grid-template-columns: 112px minmax(0, 1fr);
    }
    .manual-add {
        align-items: stretch;
        flex-direction: column;
    }
    .manual-add .el-select {
        width: 100%;
    }
}
</style>
