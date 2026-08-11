<template>
    <ResourceTablePage
        resource="packageParts"
        title="工作包零件关联"
        eyebrow="分包中心"
        description="核对工作包与批次零件之间的实际关联，不补造接口文档之外的业务字段。"
        search-placeholder="搜索工作包 ID、零件 ID 或图号"
        :columns="columns"
        :initial-query="initialQuery"
        ><template #actions><el-button @click="mockExport">Mock 导出</el-button></template></ResourceTablePage
    >
</template>
<script setup lang="ts">
import ResourceTablePage, { type DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
const route = useRoute()
const initialQuery = { packageId: String(route.query.packageId || '') }
const mockExport = () => ElMessage.info('Mock 占位：当前合同未定义工作包零件导出端点。')
const columns: DataColumn[] = [
    { prop: 'packageId', label: '工作包 ID', minWidth: 220 },
    { prop: 'partId', label: '零件明细 ID', minWidth: 220 },
    { prop: 'partDrawingNo', label: '零件图号', minWidth: 220 },
]
</script>
