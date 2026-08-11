<template>
    <ResourceTablePage
        resource="batchParts"
        title="批次零件明细"
        eyebrow="分包中心"
        description="查看批次导入的零件字段、品类判定、工作包归属与推荐供应商回写结果。"
        search-placeholder="搜索图号、零件名称或批次 ID"
        :columns="columns"
        ><template #actions><el-button @click="mockExport">Mock 导出</el-button></template></ResourceTablePage
    >
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ResourceTablePage, { type DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const columns: DataColumn[] = [
    { prop: 'partDrawingNo', label: '零件图号', minWidth: 190 },
    { prop: 'partName', label: '零件名称', minWidth: 160 },
    { prop: 'aircraftModel', label: '机型', minWidth: 90 },
    { prop: 'materialType', label: '材料', minWidth: 110 },
    { prop: 'thirdCategory', label: '三级品类', minWidth: 150 },
    { prop: 'partType', label: '零件类型', minWidth: 100 },
    { prop: 'supplierCountNeeded', label: '需求供应商', minWidth: 110 },
    { prop: 'historySupplier1', label: '历史供应商 1', minWidth: 160 },
    { prop: 'historySupplier2', label: '历史供应商 2', minWidth: 160 },
    { prop: 'historySupplier3', label: '历史供应商 3', minWidth: 160 },
    { prop: 'recommendSupplier1', label: '推荐供应商 1', minWidth: 160 },
    { prop: 'packageId', label: '工作包 ID', minWidth: 190 },
]
const mockExport = () => ElMessage.info('Mock 占位：接口文档未提供批次零件通用导出端点，未猜测真实 URL。')
</script>
