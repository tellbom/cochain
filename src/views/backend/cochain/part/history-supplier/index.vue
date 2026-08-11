<template>
    <ResourceTablePage
        resource="historySuppliers"
        title="零件历史供应商"
        eyebrow="供应商与绩效"
        description="按零件图号查看历史合作供应商、合作次数与最近合作时间。"
        search-placeholder="搜索零件图号或供应商"
        :columns="columns"
    >
        <template #actions><el-button @click="placeholder">导入/导出待绑定</el-button></template>
    </ResourceTablePage>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ResourceTablePage, { type DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const placeholder = () => ElMessage.info('待绑定：合同确认历史供应商导入/导出端点及最终 VO 后再开放。')
const columns: DataColumn[] = [
    { prop: 'partDrawingNo', label: '零件图号', minWidth: 220 },
    { prop: 'supplierName', label: '供应商', minWidth: 200 },
    { prop: 'supplierId', label: '供应商 ID', minWidth: 160 },
    { prop: 'cooperationCount', label: '合作次数' },
    { prop: 'lastCooperationTime', label: '最近合作时间', minWidth: 150 },
]
</script>
