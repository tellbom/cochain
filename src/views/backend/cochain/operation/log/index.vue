<template>
    <section class="figma-page">
        <header class="figma-page__header"><div><p class="figma-page__eyebrow">审计追踪</p><h1>日志记录</h1><p class="figma-page__description">查看业务操作与系统访问记录，定位失败请求并追踪关键变更。</p></div></header>
        <div class="figma-card">
            <nav class="figma-tabs"><button class="figma-tab" :class="{ 'is-active': activeTab === 'business' }" type="button" @click="activeTab = 'business'">业务操作日志</button><button class="figma-tab" :class="{ 'is-active': activeTab === 'system' }" type="button" @click="activeTab = 'system'">系统操作日志</button></nav>
            <form class="figma-search" role="search" @submit.prevent><el-input v-model="keyword" clearable placeholder="搜索操作人 / 模块 / 对象"><template #prefix><el-icon><Search /></el-icon></template></el-input><el-select v-model="result" clearable placeholder="全部结果"><el-option label="成功" value="SUCCESS" /><el-option label="失败" value="FAILED" /></el-select><el-date-picker v-model="dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" class="date-filter" /><el-button type="primary" class="figma-query-button">查询</el-button><el-button @click="reset"><el-icon><Refresh /></el-icon>重置</el-button></form>
            <el-table v-loading="loading" :data="filteredRows" row-key="id">
                <el-table-column prop="operator" label="操作人" width="100" /><el-table-column prop="ip" label="IP 地址" min-width="135" /><el-table-column prop="type" label="操作类型" min-width="130" /><el-table-column prop="module" label="目标模块" min-width="130" /><el-table-column prop="object" label="目标对象" min-width="190" show-overflow-tooltip /><el-table-column label="结果" width="90"><template #default="{ row }"><span class="figma-status" :data-status="row.result">{{ row.result === 'SUCCESS' ? '成功' : '失败' }}</span></template></el-table-column><el-table-column prop="time" label="操作时间" min-width="165" /><el-table-column label="操作" width="75"><template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">详情</el-button></template></el-table-column>
            </el-table>
            <footer class="figma-pagination"><span>共 {{ filteredRows.length }} 条记录</span><el-pagination :total="filteredRows.length" :page-size="20" layout="prev, pager, next" /></footer>
        </div>
        <el-dialog v-model="detailVisible" title="日志详情" width="min(640px, 94vw)"><dl v-if="current" class="figma-info-grid"><div><dt>操作人</dt><dd>{{ current.operator }}</dd></div><div><dt>IP 地址</dt><dd>{{ current.ip }}</dd></div><div><dt>操作类型</dt><dd>{{ current.type }}</dd></div><div><dt>目标模块</dt><dd>{{ current.module }}</dd></div><div class="wide"><dt>目标对象</dt><dd>{{ current.object }}</dd></div><div><dt>执行结果</dt><dd><span class="figma-status" :data-status="current.result">{{ current.result === 'SUCCESS' ? '成功' : '失败' }}</span></dd></div><div><dt>操作时间</dt><dd>{{ current.time }}</dd></div><div class="wide"><dt>详细信息</dt><dd class="detail-copy">{{ current.detail || '—' }}</dd></div></dl></el-dialog>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import type { OperationLogVO, SystemOperateLogVO } from '/@/features/cochain/contracts'
import { getResourceService } from '/@/features/cochain/services'

type LogRow={id:string;operator:string;ip:string;type:string;module:string;object:string;result:'SUCCESS'|'FAILED';time:string;detail:string}
const businessService=getResourceService('operationLogs');const systemService=getResourceService('systemOperateLogs')
const activeTab=ref<'business'|'system'>('business');const businessRows=ref<OperationLogVO[]>([]);const systemRows=ref<SystemOperateLogVO[]>([]);const keyword=ref('');const result=ref('');const dateRange=ref<string[]>([]);const loading=ref(false);const detailVisible=ref(false);const current=ref<LogRow>()
const normalizedBusiness=computed<LogRow[]>(()=>businessRows.value.map(row=>({id:row.id,operator:row.operator,ip:'—',type:row.operationType,module:'分包业务',object:row.batchId||'—',result:row.operationResult,time:row.operationTime,detail:row.detail})))
const normalizedSystem=computed<LogRow[]>(()=>systemRows.value.map(row=>({id:row.id,operator:row.username||row.userid,ip:row.loginIp,type:`${row.httpMethod} 请求`,module:'RBAC / 系统',object:row.requestPath,result:row.responseStatus>=200&&row.responseStatus<400?'SUCCESS':'FAILED',time:row.operateTime,detail:`权限码：${row.permissionCode}；响应状态：${row.responseStatus}`})))
const allRows=computed(()=>activeTab.value==='business'?normalizedBusiness.value:normalizedSystem.value)
const filteredRows=computed(()=>allRows.value.filter(row=>(!keyword.value||[row.operator,row.module,row.object,row.type].some(value=>value.includes(keyword.value)))&&(!result.value||row.result===result.value)&&(!dateRange.value?.length||(row.time.slice(0,10)>=dateRange.value[0]&&row.time.slice(0,10)<=dateRange.value[1]))))
const reset=()=>{keyword.value='';result.value='';dateRange.value=[]};const openDetail=(row:LogRow)=>{current.value=row;detailVisible.value=true}
onMounted(async()=>{loading.value=true;try{const [business,system]=await Promise.all([businessService.list(),systemService.list()]);businessRows.value=business;systemRows.value=system}finally{loading.value=false}})
</script>

<style scoped>
.date-filter{width:240px!important}.wide{grid-column:1/-1}.detail-copy{padding:12px;border-radius:8px;background:#fafafc;white-space:pre-wrap}@media(max-width:900px){.date-filter{width:100%!important}}
</style>
