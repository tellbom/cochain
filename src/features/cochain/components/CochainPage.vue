<template>
    <section class="co-page" :aria-labelledby="headingId">
        <header class="co-page__header">
            <div>
                <p v-if="eyebrow" class="co-page__eyebrow">{{ eyebrow }}</p>
                <h1 :id="headingId">{{ title }}</h1>
                <p v-if="description" class="co-page__description">{{ description }}</p>
            </div>
            <div v-if="$slots.actions" class="co-page__actions"><slot name="actions" /></div>
        </header>
        <slot />
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ title: string; description?: string; eyebrow?: string }>()
const headingId = computed(() => `co-page-${props.title.replace(/\s+/g, '-')}`)
</script>

<style scoped lang="scss">
.co-page {
    display: grid;
    gap: var(--co-space-5);
    width: min(100%, 1440px);
    margin: 0 auto;
    color: var(--co-ink);
}
.co-page__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--co-space-5);
}
h1 {
    margin: 0;
    font-size: clamp(28px, 3vw, 34px);
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.02em;
}
.co-page__eyebrow {
    margin: 0 0 var(--co-space-2);
    color: var(--co-primary);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.co-page__description {
    max-width: 720px;
    margin: var(--co-space-2) 0 0;
    color: var(--co-ink-muted);
    font-size: 15px;
    line-height: 1.5;
}
.co-page__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--co-space-2);
}
@media (max-width: 768px) {
    .co-page__header {
        align-items: flex-start;
        flex-direction: column;
    }
    .co-page__actions {
        justify-content: flex-start;
        width: 100%;
    }
}
</style>
