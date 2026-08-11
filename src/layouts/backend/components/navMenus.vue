<template>
    <el-dropdown placement="bottom-end" trigger="click">
        <button class="account-trigger" type="button" aria-label="打开用户菜单">
            <el-avatar :size="32">{{ initials }}</el-avatar>
            <span class="account-copy">
                <strong>{{ displayName }}</strong>
                <small>{{ adminInfo.project || 'cochain' }}</small>
            </span>
            <Icon name="fa fa-angle-down" size="14" aria-hidden="true" />
        </button>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item disabled>{{ adminInfo.userid || '未识别用户' }}</el-dropdown-item>
                <el-dropdown-item divided @click="onLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminInfo } from '/@/stores/adminInfo'
import { logoutWithKeycloak } from '/@/utils/keycloak'

const adminInfo = useAdminInfo()
const displayName = computed(() => adminInfo.nickname || adminInfo.username || adminInfo.userid || '管理员')
const initials = computed(() => displayName.value.trim().slice(0, 1).toUpperCase())
const onLogout = () => logoutWithKeycloak()
</script>

<style scoped lang="scss">
.account-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 4px 8px 4px 4px;
    border: 0;
    border-radius: var(--co-radius-pill);
    background: transparent;
    color: var(--co-ink);
    cursor: pointer;
    transition:
        background-color var(--co-motion-fast) ease,
        transform var(--co-motion-fast) ease;
}

.account-trigger:hover {
    background: var(--co-canvas-subtle);
}

.account-trigger:active {
    transform: scale(0.95);
}

.account-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    line-height: 1.2;
}

.account-copy strong {
    max-width: 140px;
    overflow: hidden;
    color: var(--co-ink);
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.account-copy small {
    color: var(--co-ink-muted);
    font-size: 12px;
}

@media (max-width: 768px) {
    .account-copy {
        display: none;
    }
}
</style>
