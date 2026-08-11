<template>
    <el-aside
        v-if="!navTabs.state.tabFullScreen"
        :class="['layout-aside-Classic', { shrink: config.layout.shrink, 'is-mobile-open': config.layout.shrink && !config.layout.menuCollapse }]"
    >
        <Logo v-if="config.layout.menuShowTopBar" />
        <MenuVertical />
    </el-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Logo from '/@/layouts/backend/components/logo.vue'
import MenuVertical from '/@/layouts/backend/components/menus/menuVertical.vue'
import { useConfig } from '/@/stores/config'
import { useNavTabs } from '/@/stores/navTabs'

const config = useConfig()
const navTabs = useNavTabs()

const menuWidth = computed(() => config.menuWidth())
</script>

<style scoped lang="scss">
.layout-aside-Classic {
    background: v-bind('config.getColorVal("menuBackground")');
    margin: 0;
    height: 100vh;
    overflow: hidden;
    transition: width 0.3s ease;
    width: v-bind(menuWidth);
    border-right: 1px solid var(--co-hairline);
}
.shrink {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999999;
}

@media (max-width: 768px) {
    .layout-aside-Classic.shrink.is-mobile-open {
        width: min(82vw, 280px) !important;
        min-width: min(82vw, 280px) !important;
        max-width: min(82vw, 280px) !important;
        flex: 0 0 min(82vw, 280px);
    }
    .layout-aside-Classic.shrink {
        box-shadow: none;
    }
}
</style>
