<template>
    <ManagedResourcePage
        resource="categories"
        title="三级品类主数据"
        eyebrow="规则与主数据"
        description="按材料、长宽区间和 AND/OR 逻辑维护零件类型判定区间。"
        :columns="columns"
        :fields="fields"
        :validate="validate"
    />
</template>
<script setup lang="ts">
import ManagedResourcePage, { type FormField } from '/@/features/cochain/components/ManagedResourcePage.vue'
import type { DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const partOptions = ['小型', '中型', '大型', '超大型', '其他'].map((v) => ({ label: v, value: v }))
const columns: DataColumn[] = [
    { prop: 'categoryName', label: '品类名称', minWidth: 180 },
    { prop: 'materialType', label: '材料类型' },
    { prop: 'lengthMin', label: '最小长度' },
    { prop: 'lengthMax', label: '最大长度' },
    { prop: 'widthMin', label: '最小宽度' },
    { prop: 'widthMax', label: '最大宽度' },
    { prop: 'sizeLogic', label: '尺寸逻辑', status: true, tone: () => 'info' },
    { prop: 'partType', label: '零件类型' },
]
const fields: FormField[] = [
    { prop: 'categoryName', label: '品类名称', required: true },
    { prop: 'materialType', label: '材料类型', required: true },
    { prop: 'lengthMin', label: '最小长度', type: 'number' },
    { prop: 'lengthMax', label: '最大长度', type: 'number' },
    { prop: 'widthMin', label: '最小宽度', type: 'number' },
    { prop: 'widthMax', label: '最大宽度', type: 'number' },
    {
        prop: 'sizeLogic',
        label: '尺寸逻辑',
        type: 'select',
        required: true,
        options: [
            { label: '长宽均满足', value: 'AND' },
            { label: '任一满足', value: 'OR' },
        ],
    },
    { prop: 'partType', label: '零件类型', type: 'select', required: true, options: partOptions },
]
const validate = (form: Record<string, any>) => {
    if (Number(form.lengthMin) > Number(form.lengthMax)) return '最小长度不能大于最大长度'
    if (Number(form.widthMin) > Number(form.widthMax)) return '最小宽度不能大于最大宽度'
    return undefined
}
</script>
