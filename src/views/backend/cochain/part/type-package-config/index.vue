<template>
    <ManagedResourcePage
        resource="typePackageConfigs"
        title="工作包容量配置"
        eyebrow="规则与主数据"
        description="维护各零件类型的工作包容量上限；此页仅允许修改，不新增或删除类型。"
        :columns="columns"
        :fields="fields"
        :allow-create="false"
        :allow-delete="false"
        :validate="validate"
    />
</template>
<script setup lang="ts">
import ManagedResourcePage, { type FormField } from '/@/features/cochain/components/ManagedResourcePage.vue'
import type { DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const columns: DataColumn[] = [
    { prop: 'partType', label: '零件类型', minWidth: 160 },
    { prop: 'maxPartLimit', label: '容量上限' },
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
    {
        prop: 'partType',
        label: '零件类型',
        type: 'select',
        required: true,
        options: ['小型', '中型', '大型', '超大型', '其他'].map((v) => ({ label: v, value: v })),
    },
    { prop: 'maxPartLimit', label: '容量上限', type: 'number', min: 1, required: true },
    { prop: 'enabled', label: '启用状态', type: 'switch' },
    { prop: 'remark', label: '备注', type: 'textarea' },
]
const validate = (form: Record<string, any>) =>
    !Number.isInteger(Number(form.maxPartLimit)) || Number(form.maxPartLimit) <= 0 ? '容量上限必须为正整数' : undefined
</script>
