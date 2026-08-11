<template>
    <ResourceTablePage
        resource="operationLogs"
        title="业务操作日志"
        eyebrow="日志审计"
        description="查询分包、推荐、回写等业务动作结果；日志为只读记录。"
        search-placeholder="搜索批次、动作或操作人"
        :columns="columns"
    >
        <template #actions><el-button @click="exportPlaceholder">导出待绑定</el-button></template>
    </ResourceTablePage>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ResourceTablePage, { type DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const exportPlaceholder = () => ElMessage.info('待绑定：业务日志导出端点和独立导出权限确认后再开放。')
const columns: DataColumn[] = [
    { prop: 'operationTime', label: '操作时间', minWidth: 170 },
    { prop: 'operator', label: '操作人' },
    { prop: 'operationType', label: '操作类型', minWidth: 150 },
    {
        prop: 'operationResult',
        label: '结果',
        status: true,
        format: (r) => (r.operationResult === 'SUCCESS' ? '成功' : '失败'),
        tone: (r) => (r.operationResult === 'SUCCESS' ? 'success' : 'danger'),
    },
    { prop: 'batchId', label: '批次 ID', minWidth: 190 },
    { prop: 'detail', label: '详情', minWidth: 280 },
]
</script>
