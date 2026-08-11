<template>
    <header class="co-header" aria-label="页面导航">
        <button
            v-if="config.layout.shrink && config.layout.menuCollapse"
            class="menu-trigger"
            type="button"
            aria-label="打开导航菜单"
            @click="onMenuCollapse"
        >
            <Icon name="fa fa-bars" size="16" />
        </button>

        <el-breadcrumb class="page-breadcrumb" separator="/" aria-label="面包屑">
            <el-breadcrumb-item>Cochain</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
                {{ item.title }}
            </el-breadcrumb-item>
        </el-breadcrumb>

        <NavMenus />
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavMenus from '../navMenus.vue'
import { useConfig } from '/@/stores/config'
import { showShade } from '/@/utils/pageShade'

const config = useConfig()
const route = useRoute()
const { t, te } = useI18n()

const breadcrumbItems = computed(() =>
    route.matched
        .filter((item) => item.path && item.meta?.title)
        .map((item) => {
            const title = String(item.meta?.title ?? '')
            return { path: item.path, title: te(title) ? t(title) : title }
        })
)

const onMenuCollapse = () => {
    showShade('ba-aside-menu-shade', () => config.setLayout('menuCollapse', true))
    config.setLayout('menuCollapse', false)
}
</script>

<style scoped lang="scss">
.co-header {
    display: flex;
    align-items: center;
    gap: var(--co-space-3);
    width: 100%;
    height: 64px;
    padding: 0 var(--co-space-5);
    border-bottom: 1px solid var(--co-hairline);
    background: color-mix(in srgb, var(--co-canvas) 92%, transparent);
    backdrop-filter: saturate(140%) blur(16px);
}

.menu-trigger {
    display: grid;
    place-items: center;
    width: 44px;
    min-width: 44px;
    border: 0;
    border-radius: var(--co-radius-control);
    background: transparent;
    color: var(--co-ink);
    cursor: pointer;
}

.menu-trigger:active {
    transform: scale(0.95);
}

.page-breadcrumb {
    min-width: 0;
    flex: 1;
    font-size: 14px;
}

@media (max-width: 768px) {
    .co-header {
        padding: 0 var(--co-space-3);
    }

    .page-breadcrumb :deep(.el-breadcrumb__item:not(:last-child)) {
        display: none;
    }
}
</style>
