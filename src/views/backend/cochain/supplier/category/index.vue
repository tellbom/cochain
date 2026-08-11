<template>
    <ManagedResourcePage
        resource="supplierCategories"
        title="供应商品类关联"
        eyebrow="供应商与绩效"
        description="建立供应商与三级品类的明确关联，为排名与推荐提供范围。"
        search-placeholder="搜索供应商或品类"
        :columns="columns"
        :fields="fields"
    />
</template>
<script setup lang="ts">
import ManagedResourcePage, { type FormField } from '/@/features/cochain/components/ManagedResourcePage.vue'
import type { DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const columns: DataColumn[] = [
    { prop: 'supplierName', label: '供应商', minWidth: 200 },
    { prop: 'supplierId', label: '供应商 ID', minWidth: 170 },
    { prop: 'categoryName', label: '三级品类', minWidth: 180 },
    { prop: 'categoryId', label: '品类 ID', minWidth: 150 },
]
const fields: FormField[] = [
    { prop: 'supplierId', label: '供应商 ID', required: true },
    { prop: 'supplierName', label: '供应商名称' },
    { prop: 'categoryId', label: '品类 ID', required: true },
    { prop: 'categoryName', label: '品类名称' },
]
</script>
