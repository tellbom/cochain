<template>
    <div class="supplier-performance-page">
        <ManagedResourcePage
            ref="pageRef"
            resource="performances"
            title="供应商绩效管理"
            eyebrow="供应商与绩效"
            description="维护月度绩效与综合得分，上传结果保留逐行失败反馈。"
            search-placeholder="搜索供应商或年月"
            :columns="columns"
            :fields="fields"
        >
            <template #actions
                ><el-button @click="templatePlaceholder">模板下载待绑定</el-button
                ><el-button v-auth="'upload'" type="primary" @click="visible = true">上传绩效</el-button></template
            >
        </ManagedResourcePage>
        <el-dialog v-model="visible" title="上传供应商绩效" width="min(600px,94vw)"
            ><el-form label-position="top"
                ><el-form-item label="绩效 Excel" required
                    ><el-upload drag :auto-upload="false" :limit="1" accept=".xlsx,.xls" :on-change="(f) => (file = f)"
                        ><Icon name="fa fa-upload" size="24" />
                        <div>选择两列绩效模板</div></el-upload
                    ></el-form-item
                >
                <div class="period">
                    <el-form-item label="年份"><el-input-number v-model="year" :min="2020" :max="2100" /></el-form-item
                    ><el-form-item label="月份"><el-input-number v-model="month" :min="1" :max="12" /></el-form-item></div></el-form
            ><template #footer
                ><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="submit">开始导入</el-button></template
            ></el-dialog
        >
        <el-dialog v-model="resultVisible" title="绩效导入结果" width="min(620px,94vw)">
            <el-alert title="共 13 行：12 行成功，1 行失败" type="warning" show-icon :closable="false" />
            <el-table :data="[{ rowNo: 13, message: '供应商名称不能为空' }]" class="result-table">
                <el-table-column prop="rowNo" label="行号" width="100" />
                <el-table-column prop="message" label="失败原因" min-width="260" />
            </el-table>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, type UploadFile } from 'element-plus'
import ManagedResourcePage, { type FormField } from '/@/features/cochain/components/ManagedResourcePage.vue'
import type { DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
import { getResourceService } from '/@/features/cochain/services'
const pageRef = ref<InstanceType<typeof ManagedResourcePage>>()
const visible = ref(false)
const resultVisible = ref(false)
const file = ref<UploadFile>()
const year = ref(2026)
const month = ref(7)
const service = getResourceService('performances')
const columns: DataColumn[] = [
    { prop: 'supplierName', label: '供应商', minWidth: 200 },
    { prop: 'performanceYear', label: '年份' },
    { prop: 'performanceMonth', label: '月份' },
    { prop: 'score', label: '原始成绩' },
    { prop: 'halfYearAvg', label: '半年平均' },
    { prop: 'lastMonthScore', label: '上月得分' },
    { prop: 'comprehensiveScore', label: '综合得分' },
]
const fields: FormField[] = [
    { prop: 'supplierId', label: '供应商 ID', required: true },
    { prop: 'supplierName', label: '供应商名称' },
    { prop: 'performanceYear', label: '年份', type: 'number', required: true, defaultValue: 2026 },
    { prop: 'performanceMonth', label: '月份', type: 'number', min: 1, max: 12, required: true, defaultValue: 7 },
    { prop: 'score', label: '原始成绩', type: 'number' },
    { prop: 'halfYearAvg', label: '半年平均', type: 'number' },
    { prop: 'lastMonthScore', label: '上月得分', type: 'number' },
    { prop: 'comprehensiveScore', label: '综合得分', type: 'number' },
]
const submit = async () => {
    if (!file.value) return ElMessage.warning('请选择绩效 Excel')
    await service.create({
        supplierId: 'SUP-MOCK-UPLOAD',
        supplierName: '示例上传供应商',
        performanceYear: year.value,
        performanceMonth: month.value,
        score: 88,
        halfYearAvg: 86,
        lastMonthScore: 90,
        comprehensiveScore: 87.6,
    })
    visible.value = false
    resultVisible.value = true
    ElMessage.warning('示例导入：12 行成功，1 行需修正')
    pageRef.value?.reload()
}
const templatePlaceholder = () => ElMessage.info('待绑定：需由后端确认模板文件名与下载地址。')
</script>
<style scoped>
.period {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.result-table {
    margin-top: 16px;
}
</style>
