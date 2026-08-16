<template>
    <CochainPage
        title="分包批次管理"
        eyebrow="分包中心"
        description="从数据就绪到分包、推荐和导出的五阶段工作台。动作可用性同时受批次状态与 RBAC 按钮规则约束。"
    >
        <template #actions>
            <el-button v-auth="'save'" @click="openCreate"><Icon name="fa fa-plus" aria-hidden="true" />新建批次</el-button>
            <el-button v-auth="'fetch'" plain type="primary" @click="state.fetchVisible = true"
                ><Icon name="fa fa-cloud-download" aria-hidden="true" />从全流程系统抓取</el-button
            >
            <el-button v-auth="'upload'" type="primary" @click="openUpload"><Icon name="fa fa-upload" aria-hidden="true" />上传 Excel</el-button>
        </template>

        <DataSurface label="分包流程">
            <div class="workflow-strip">
                <div v-for="(step, index) in workflowSteps" :key="step.key" class="workflow-step">
                    <span class="workflow-step__index">{{ index + 1 }}</span>
                    <span
                        ><strong>{{ step.title }}</strong
                        ><small>{{ step.description }}</small></span
                    >
                </div>
            </div>
        </DataSurface>

        <DataSurface label="批次列表">
            <form class="batch-toolbar" role="search" @submit.prevent="load">
                <el-input v-model="query.keyword" clearable placeholder="搜索批次编号、流程编号或操作人" aria-label="批次关键词">
                    <template #prefix><Icon name="fa fa-search" aria-hidden="true" /></template>
                </el-input>
                <el-select v-model="query.batchStatus" clearable placeholder="全部状态" aria-label="批次状态">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-button native-type="submit" type="primary">查询</el-button>
                <el-button @click="resetQuery"><Icon name="fa fa-refresh" aria-hidden="true" />重置</el-button>
            </form>

            <el-table v-loading="state.loading" :data="state.rows" row-key="id" table-layout="auto">
                <el-table-column prop="batchNo" label="批次编号" min-width="190" fixed="left" />
                <el-table-column prop="flowNo" label="委外流程编号" min-width="170" />
                <el-table-column label="状态" min-width="120">
                    <template #default="scope"
                        ><StatusTag :label="statusLabel(scope.row.batchStatus)" :tone="statusTone(scope.row.batchStatus)"
                    /></template>
                </el-table-column>
                <el-table-column prop="totalPartCount" label="零件数" min-width="90" />
                <el-table-column prop="totalPackageCount" label="工作包" min-width="90" />
                <el-table-column prop="operator" label="操作人" min-width="110" />
                <el-table-column prop="uploadFileName" label="来源文件" min-width="180" show-overflow-tooltip />
                <el-table-column label="流程动作" min-width="380" fixed="right">
                    <template #default="scope">
                        <div class="row-actions">
                            <el-tooltip :disabled="canPackage(scope.row)" :content="actionReason(scope.row, 'package')">
                                <span
                                    ><el-button
                                        v-auth="'package'"
                                        link
                                        type="primary"
                                        :disabled="!canPackage(scope.row)"
                                        @click="transition(scope.row, 'PACKAGED')"
                                        >执行分包</el-button
                                    ></span
                                >
                            </el-tooltip>
                            <el-tooltip :disabled="canRecommend(scope.row)" :content="actionReason(scope.row, 'recommend')">
                                <span
                                    ><el-button
                                        v-auth="'recommend'"
                                        link
                                        type="primary"
                                        :disabled="!canRecommend(scope.row)"
                                        @click="transition(scope.row, 'RECOMMENDED')"
                                        >执行推荐</el-button
                                    ></span
                                >
                            </el-tooltip>
                            <el-tooltip :disabled="canRun(scope.row)" :content="actionReason(scope.row, 'run')">
                                <span
                                    ><el-button
                                        v-auth="'run'"
                                        link
                                        type="primary"
                                        :disabled="!canRun(scope.row)"
                                        @click="transition(scope.row, 'COMPLETED')"
                                        >一键编排</el-button
                                    ></span
                                >
                            </el-tooltip>
                            <el-button
                                v-auth="'export-result'"
                                link
                                type="primary"
                                :disabled="scope.row.batchStatus !== 'COMPLETED'"
                                @click="exportResult(scope.row)"
                                >导出结果</el-button
                            >
                            <el-button link type="primary" @click="openPackages(scope.row)">工作包</el-button>
                            <el-dropdown trigger="click">
                                <el-button link aria-label="更多批次操作">更多</el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item v-auth="'update'" @click="openEdit(scope.row)">编辑</el-dropdown-item>
                                        <el-dropdown-item v-auth="'delete'" divided @click="removeBatch(scope.row)">删除</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </template>
                </el-table-column>
                <template #empty><DataState title="暂无批次" description="上传 Excel、抓取流程数据或手动新建批次后，会在这里显示。" /></template>
            </el-table>

            <footer class="batch-pagination">
                <el-pagination
                    v-model:current-page="query.pageNum"
                    v-model:page-size="query.pageSize"
                    :total="state.total"
                    layout="total, prev, pager, next"
                    @current-change="load"
                />
            </footer>
        </DataSurface>

        <el-dialog v-model="state.formVisible" :title="form.id ? '编辑批次' : '新建批次'" width="min(520px, 94vw)">
            <el-form label-position="top">
                <el-form-item label="批次编号" required><el-input v-model="form.batchNo" /></el-form-item>
                <el-form-item label="委外流程编号"><el-input v-model="form.flowNo" /></el-form-item>
                <el-form-item label="操作人"><el-input v-model="form.operator" /></el-form-item>
            </el-form>
            <template #footer
                ><el-button @click="state.formVisible = false">取消</el-button
                ><el-button type="primary" :loading="state.saving" @click="saveBatch">保存</el-button></template
            >
        </el-dialog>

        <el-dialog v-model="state.uploadVisible" title="上传分包数据" width="min(620px, 94vw)">
            <el-form label-position="top">
                <el-form-item label="Excel 文件" required>
                    <el-upload drag :auto-upload="false" :limit="1" accept=".xlsx,.xls" :on-change="onFileChange"
                        ><Icon name="fa fa-upload" size="24" />
                        <div>将文件拖到此处，或点击选择</div>
                        <template #tip><span>Mock 模式会验证交互和部分失败结果，不会上传真实业务数据。</span></template></el-upload
                    >
                </el-form-item>
                <el-form-item label="机型（可选）"><el-input v-model="upload.aircraftModel" placeholder="用于补全缺失机型" /></el-form-item>
            </el-form>
            <template #footer
                ><el-button @click="state.uploadVisible = false">取消</el-button
                ><el-button type="primary" :loading="state.saving" @click="submitUpload">开始导入</el-button></template
            >
        </el-dialog>

        <el-dialog v-model="state.fetchVisible" title="从全流程系统抓取数据" width="min(520px, 94vw)">
            <el-alert title="当前为 Mock 业务数据适配器；RBAC 与 Keycloak 始终走真实服务。" type="info" show-icon :closable="false" />
            <el-form label-position="top" class="dialog-form"
                ><el-form-item label="委外流程编号" required><el-input v-model="fetchForm.flowNo" placeholder="例如 MOCK-FLOW-2402" /></el-form-item
            ></el-form>
            <template #footer
                ><el-button @click="state.fetchVisible = false">取消</el-button
                ><el-button type="primary" :loading="state.saving" @click="submitFetch">抓取</el-button></template
            >
        </el-dialog>
    </CochainPage>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import CochainPage from '/@/features/cochain/components/CochainPage.vue'
import DataState from '/@/features/cochain/components/DataState.vue'
import DataSurface from '/@/features/cochain/components/DataSurface.vue'
import StatusTag from '/@/features/cochain/components/StatusTag.vue'
import type { BatchStatus, BatchVO } from '/@/features/cochain/contracts'
import { getResourceService } from '/@/features/cochain/services'
import { routePush } from '/@/utils/router'

const service = getResourceService('batches')
const workflowSteps = [
    { key: 'data', title: '数据就绪', description: '上传或抓取' },
    { key: 'package', title: '执行分包', description: '生成工作包' },
    { key: 'recommend', title: '供应商推荐', description: '匹配与排序' },
    { key: 'writeback', title: '结果回写', description: '写入推荐位' },
    { key: 'export', title: '导出结果', description: '形成交付文件' },
]
const statusOptions = [
    { value: 'DRAFT', label: '草稿' },
    { value: 'DATA_READY', label: '数据就绪' },
    { value: 'PACKAGED', label: '已分包' },
    { value: 'RECOMMENDED', label: '已推荐' },
    { value: 'COMPLETED', label: '已完成' },
]
const query = reactive({ keyword: '', batchStatus: undefined as BatchStatus | undefined, pageNum: 1, pageSize: 20 })
const state = reactive({
    loading: false,
    saving: false,
    rows: [] as BatchVO[],
    total: 0,
    formVisible: false,
    uploadVisible: false,
    fetchVisible: false,
})
const form = reactive<Partial<BatchVO>>({})
const upload = reactive({ file: null as UploadFile | null, aircraftModel: '' })
const fetchForm = reactive({ flowNo: '' })

const load = async () => {
    state.loading = true
    try {
        const result = await service.page(query)
        state.rows = result.records
        state.total = result.total
    } catch (error: any) {
        ElMessage.error(error?.message || '批次加载失败')
    } finally {
        state.loading = false
    }
}
const resetQuery = () => {
    query.keyword = ''
    query.batchStatus = undefined
    query.pageNum = 1
    load()
}
const statusLabel = (status: BatchStatus) => statusOptions.find((item) => item.value === status)?.label || status
const statusTone = (status: BatchStatus) =>
    status === 'COMPLETED' ? 'success' : status === 'DRAFT' ? 'neutral' : status === 'DATA_READY' ? 'info' : 'warning'
const canPackage = (row: BatchVO) => row.batchStatus === 'DATA_READY'
const canRecommend = (row: BatchVO) => row.batchStatus === 'PACKAGED'
const canRun = (row: BatchVO) => ['DATA_READY', 'PACKAGED', 'RECOMMENDED'].includes(row.batchStatus)
const actionReason = (row: BatchVO, action: string) =>
    action === 'package'
        ? `仅“数据就绪”批次可执行，当前为${statusLabel(row.batchStatus)}`
        : action === 'recommend'
          ? `需先完成分包，当前为${statusLabel(row.batchStatus)}`
          : `草稿或已完成批次不可编排，当前为${statusLabel(row.batchStatus)}`
const transition = async (row: BatchVO, next: BatchStatus) => {
    state.saving = true
    try {
        await service.update({
            ...row,
            batchStatus: next,
            totalPackageCount: next === 'PACKAGED' ? Math.max(row.totalPackageCount, 12) : row.totalPackageCount,
        })
        ElMessage.success(`批次已更新为${statusLabel(next)}`)
        load()
    } finally {
        state.saving = false
    }
}
const openCreate = () => {
    Object.assign(form, { id: undefined, batchNo: '', flowNo: '', operator: '' })
    state.formVisible = true
}
const openEdit = (row: BatchVO) => {
    Object.assign(form, row)
    state.formVisible = true
}
const saveBatch = async () => {
    if (!form.batchNo?.trim()) return ElMessage.warning('请输入批次编号')
    state.saving = true
    try {
        if (form.id) await service.update(form as BatchVO)
        else
            await service.create({
                batchNo: form.batchNo,
                flowNo: form.flowNo || '',
                batchStatus: 'DRAFT',
                uploadFileName: '',
                totalPartCount: 0,
                totalPackageCount: 0,
                operator: form.operator || '当前用户',
            })
        state.formVisible = false
        ElMessage.success('批次已保存')
        load()
    } finally {
        state.saving = false
    }
}
const removeBatch = async (row: BatchVO) => {
    await ElMessageBox.confirm(`确认删除批次 ${row.batchNo}？`, '删除批次', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    await service.remove(row.id)
    ElMessage.success('批次已删除')
    load()
}
const openUpload = () => {
    upload.file = null
    upload.aircraftModel = ''
    state.uploadVisible = true
}
const onFileChange = (file: UploadFile) => {
    upload.file = file
}
const submitUpload = async () => {
    if (!upload.file) return ElMessage.warning('请选择 Excel 文件')
    state.saving = true
    try {
        await service.create({
            batchNo: `MOCK-BATCH-${Date.now().toString().slice(-6)}`,
            flowNo: '',
            batchStatus: 'DATA_READY',
            uploadFileName: upload.file.name,
            totalPartCount: 104,
            totalPackageCount: 0,
            operator: '当前用户',
        })
        state.uploadVisible = false
        ElMessage.warning('示例导入完成：104 行中 102 行成功，2 行需修正')
        load()
    } finally {
        state.saving = false
    }
}
const submitFetch = async () => {
    if (!fetchForm.flowNo.trim()) return ElMessage.warning('请输入委外流程编号')
    state.saving = true
    try {
        await service.create({
            batchNo: `MOCK-FETCH-${Date.now().toString().slice(-6)}`,
            flowNo: fetchForm.flowNo,
            batchStatus: 'DATA_READY',
            uploadFileName: '流程抓取',
            totalPartCount: 68,
            totalPackageCount: 0,
            operator: '当前用户',
        })
        state.fetchVisible = false
        ElMessage.success('流程数据已抓取')
        load()
    } finally {
        state.saving = false
    }
}
const exportResult = (row: BatchVO) => {
    const blob = new Blob([`Mock export for ${row.batchNo}`], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${row.batchNo}-mock-result.txt`
    anchor.click()
    URL.revokeObjectURL(url)
    ElMessage.success('Mock 导出文件已生成')
}
const openPackages = (row: BatchVO) => routePush({ path: '/cochain/work/package', query: { batchId: row.id } })
onMounted(load)
</script>

<style scoped lang="scss">
.workflow-strip {
    display: grid;
    grid-template-columns: repeat(5, minmax(150px, 1fr));
    overflow-x: auto;
    padding: 4px 8px;
}
.workflow-step {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 150px;
    padding: 16px 12px;
}
.workflow-step:not(:last-child)::after {
    position: absolute;
    z-index: 0;
    top: 50%;
    right: -8px;
    width: 16px;
    height: 1px;
    background: var(--co-hairline);
    content: '';
}
.workflow-step__index {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    border-radius: 50%;
    background: var(--co-primary-soft);
    color: var(--co-primary);
    font-weight: 600;
}
.workflow-step span:last-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.workflow-step strong {
    font-size: 14px;
    font-weight: 600;
}
.workflow-step small {
    color: var(--co-ink-muted);
    font-size: 12px;
}
.batch-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--co-divider);
}
.batch-toolbar .el-input {
    width: min(360px, 100%);
}
.batch-toolbar .el-select {
    width: 160px;
}
.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
}
.batch-pagination {
    display: flex;
    justify-content: flex-end;
    padding: 16px;
    border-top: 1px solid var(--co-divider);
}
.dialog-form {
    margin-top: 18px;
}
:deep(.el-table th.el-table__cell) {
    height: 44px;
    background: #fafafa;
    color: var(--co-ink-muted);
    font-size: 12px;
    font-weight: 600;
}
:deep(.el-table) {
    --el-table-row-hover-bg-color: #fafafa;
}
:deep(.el-table td.el-table__cell) {
    height: 50px;
    color: var(--co-ink-secondary);
    font-size: 13px;
}
:deep(.el-table__inner-wrapper::before) {
    display: none;
}
@media (max-width: 768px) {
    .batch-toolbar {
        align-items: stretch;
        flex-direction: column;
    }
    .batch-toolbar .el-input,
    .batch-toolbar .el-select {
        width: 100%;
    }
    .batch-pagination {
        justify-content: flex-start;
        overflow-x: auto;
    }
}
</style>
