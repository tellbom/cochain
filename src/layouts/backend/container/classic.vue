<template>
    <el-container class="layout-container classic-layout">
        <Aside />
        <el-container class="content-wrapper">
            <Header />
            <Main />
        </el-container>
    </el-container>
    <CloseFullScreen v-if="navTabs.state.tabFullScreen" />
</template>

<script setup lang="ts">
import Aside from '/@/layouts/backend/components/aside.vue'
import Header from '/@/layouts/backend/components/header.vue'
import Main from '/@/layouts/backend/router-view/main.vue'
import CloseFullScreen from '/@/layouts/backend/components/closeFullScreen.vue'
import { useNavTabs } from '/@/stores/navTabs'
const navTabs = useNavTabs()
</script>

<style scoped>
.layout-container {
    height: 100%;
    width: 100%;
}
.content-wrapper {
    flex-direction: column;
    width: 100%;
    min-width: 0;
    height: 100%;
    background: var(--co-canvas-subtle);
}

.classic-layout :deep(.layout-main) {
    padding: var(--co-space-5) !important;
    background: var(--co-canvas-subtle);
}

@media (max-width: 768px) {
    .classic-layout :deep(.layout-main) {
        padding: var(--co-space-4) !important;
    }
}
</style>
