<template>
    <span class="status-tag" :data-tone="tone"><span class="status-tag__dot" aria-hidden="true" />{{ label }}</span>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' }>(), { tone: 'neutral' })
</script>
<style scoped>
.status-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 28px;
    padding: 3px 10px;
    border: 1px solid var(--co-hairline);
    border-radius: var(--co-radius-pill);
    color: var(--co-ink-secondary);
    background: var(--co-surface);
    font-size: 13px;
    white-space: nowrap;
}
.status-tag__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--co-ink-muted);
}
.status-tag[data-tone='success'] .status-tag__dot {
    background: var(--co-success);
}
.status-tag[data-tone='warning'] .status-tag__dot {
    background: var(--co-warning);
}
.status-tag[data-tone='danger'] .status-tag__dot {
    background: var(--co-danger);
}
.status-tag[data-tone='info'] .status-tag__dot {
    background: var(--co-primary);
}
</style>
