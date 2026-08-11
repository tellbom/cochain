<template>
    <ManagedResourcePage
        resource="leftRightManuals"
        title="左右件手动维护"
        eyebrow="规则与主数据"
        description="登记无法由后缀规则稳定识别的左右件图号配对。"
        :columns="columns"
        :fields="fields"
        :validate="validate"
        ><template #actions><el-button @click="placeholder">导入/导出待绑定</el-button></template></ManagedResourcePage
    >
</template>
<script setup lang="ts">
import ManagedResourcePage, { type FormField } from '/@/features/cochain/components/ManagedResourcePage.vue'
import type { DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
import { ElMessage } from 'element-plus'
const columns: DataColumn[] = [
    { prop: 'aircraftModel', label: '机型' },
    { prop: 'leftPartDrawingNo', label: '左件图号', minWidth: 220 },
    { prop: 'rightPartDrawingNo', label: '右件图号', minWidth: 220 },
    { prop: 'remark', label: '备注', minWidth: 220 },
]
const fields: FormField[] = [
    { prop: 'aircraftModel', label: '机型', required: true },
    { prop: 'leftPartDrawingNo', label: '左件图号', required: true },
    { prop: 'rightPartDrawingNo', label: '右件图号', required: true },
    { prop: 'remark', label: '备注', type: 'textarea' },
]
const validate = (form: Record<string, any>) => (form.leftPartDrawingNo === form.rightPartDrawingNo ? '左件图号与右件图号不能相同' : undefined)
const placeholder = () => ElMessage.info('待绑定：当前合同未定义左右件关系导入/导出端点。')
</script>
