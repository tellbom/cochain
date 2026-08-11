<template>
    <div class="layout-logo">
        <div class="brand-mark" aria-hidden="true">C</div>
        <div v-if="!config.layout.menuCollapse" :style="{ color: config.getColorVal('menuColor') }" class="website-name">
            <strong>Cochain</strong>
            <span>采购协同平台</span>
        </div>
        <Icon
            @click="onMenuCollapse"
            :name="config.layout.menuCollapse ? 'fa fa-indent' : 'fa fa-dedent'"
            :class="config.layout.menuCollapse ? 'unfold' : ''"
            :color="config.getColorVal('menuActiveColor')"
            size="18"
            class="fold"
        />
    </div>
</template>

<script setup lang="ts">
import { useConfig } from '/@/stores/config'
import { closeShade } from '/@/utils/pageShade'
import { Session } from '/@/utils/storage'
import { BEFORE_RESIZE_LAYOUT } from '/@/stores/constant/cacheKey'
import { setNavTabsWidth } from '/@/utils/layout'

const config = useConfig()

const onMenuCollapse = function () {
    if (config.layout.shrink && !config.layout.menuCollapse) {
        closeShade()
    }

    config.setLayout('menuCollapse', !config.layout.menuCollapse)

    Session.set(BEFORE_RESIZE_LAYOUT, {
        menuCollapse: config.layout.menuCollapse,
    })

    // 等待侧边栏动画结束后重新计算导航栏宽度
    setTimeout(() => {
        setNavTabsWidth()
    }, 350)
}
</script>

<style scoped lang="scss">
.layout-logo {
    width: 100%;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    padding: 10px 14px;
    background: v-bind('config.getColorVal("menuTopBarBackground")');
}
.brand-mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border-radius: 50%;
    background: var(--co-primary);
    color: white;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.02em;
}
.logo-img {
    width: 28px;
    flex-shrink: 0;
}
.website-name {
    display: flex;
    flex-direction: column;
    width: 180px;
    padding-left: 10px;
    font-family: var(--co-font-family);
    font-size: 12px;
    font-weight: 400;
    line-height: 17px;
    letter-spacing: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.website-name strong {
    font-size: 15px;
    font-weight: 600;
    line-height: 18px;
}
.fold {
    margin-left: auto;
}
.unfold {
    margin: 0 auto;
}
</style>
