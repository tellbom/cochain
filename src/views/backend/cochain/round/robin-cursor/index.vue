<template>
    <ResourceTablePage
        resource="roundRobinCursors"
        title="轮流选取游标"
        eyebrow="供应商与绩效"
        description="只读查看各品类、质量等级与月份的轮流选取位置。"
        search-placeholder="搜索品类或年月"
        :columns="columns"
    />
</template>
<script setup lang="ts">
import ResourceTablePage, { type DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const columns: DataColumn[] = [
    { prop: 'categoryName', label: '品类', minWidth: 180 },
    { prop: 'qualityLevel', label: '质量等级', status: true, tone: (r) => (r.qualityLevel === '优质' ? 'success' : 'neutral') },
    { prop: 'rankingYear', label: '年份' },
    { prop: 'rankingMonth', label: '月份' },
    { prop: 'cursorPosition', label: '当前游标' },
    { prop: 'supplierCount', label: '候选供应商数' },
]
</script>
