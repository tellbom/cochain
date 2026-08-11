<template>
    <div class="supplier-management-page">
        <ManagedResourcePage
            resource="suppliers"
            title="供应商管理"
            eyebrow="供应商与绩效"
            description="维护供应商基本信息和启停状态；停用供应商不参与推荐。"
            search-placeholder="搜索供应商名称"
            :columns="columns"
            :fields="fields"
            :before-save="beforeSave"
            ><template #actions><el-button @click="placeholder">导入/导出待绑定</el-button></template></ManagedResourcePage
        >
    </div>
</template>
<script setup lang="ts">
import ManagedResourcePage, { type FormField } from '/@/features/cochain/components/ManagedResourcePage.vue'
import type { DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const columns: DataColumn[] = [
    { prop: 'supplierName', label: '供应商名称', minWidth: 220 },
    {
        prop: 'enabled',
        label: '状态',
        status: true,
        format: (r) => (r.enabled === 1 ? '启用' : '停用'),
        tone: (r) => (r.enabled === 1 ? 'success' : 'neutral'),
    },
    { prop: 'remark', label: '备注', minWidth: 260 },
]
const fields: FormField[] = [
    { prop: 'supplierName', label: '供应商名称', required: true },
    { prop: 'enabled', label: '启用状态', type: 'switch', defaultValue: 1 },
    { prop: 'remark', label: '备注', type: 'textarea' },
]
const beforeSave = async (form: Record<string, any>, original: any) => {
    if (original?.enabled === 1 && form.enabled === 0) {
        await ElMessageBox.confirm('停用后该供应商将不再参与任何推荐，确认停用？', '停用供应商', {
            type: 'warning',
            confirmButtonText: '停用',
            cancelButtonText: '取消',
        })
    }
    return true
}
const placeholder = () => ElMessage.info('待绑定：业务接口文档未定义供应商导入/导出端点。')
</script>
