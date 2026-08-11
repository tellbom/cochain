<template>
    <ResourceTablePage
        resource="systemOperateLogs"
        title="系统操作日志"
        eyebrow="日志审计"
        description="查看权限码、请求路径、响应状态和请求级登录 IP；日志为只读记录。"
        search-placeholder="搜索用户、权限码或请求路径"
        :columns="columns"
    >
        <template #actions><el-button @click="exportPlaceholder">导出待绑定</el-button></template>
    </ResourceTablePage>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ResourceTablePage, { type DataColumn } from '/@/features/cochain/components/ResourceTablePage.vue'
const exportPlaceholder = () => ElMessage.info('待绑定：系统日志导出端点和独立导出权限确认后再开放。')
const columns: DataColumn[] = [
    { prop: 'operateTime', label: '操作时间', minWidth: 170 },
    { prop: 'userid', label: '用户 ID', minWidth: 130 },
    { prop: 'username', label: '用户名称', minWidth: 140 },
    { prop: 'permissionCode', label: '权限码', minWidth: 220 },
    { prop: 'httpMethod', label: '方法' },
    { prop: 'requestPath', label: '请求路径', minWidth: 240 },
    { prop: 'responseStatus', label: '响应状态', status: true, tone: (r) => (Number(r.responseStatus) < 400 ? 'success' : 'danger') },
    { prop: 'loginIp', label: '请求 IP', minWidth: 150 },
]
</script>
