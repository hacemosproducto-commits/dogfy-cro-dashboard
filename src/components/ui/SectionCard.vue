<template>
  <div class="section-card">
    <div v-if="title !== undefined || $slots.header" class="section-card__header">
      <span v-if="title" class="section-card__title">{{ title }}</span>
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<style scoped>
.section-card {
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  padding: 16px;
  min-width: 0;      /* prevent grid/flex blowout — grid items default to min-width:auto */
  overflow: hidden;  /* clip any internal content that would push past the card edge */
}

.section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  gap: 8px;
}

.section-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-800);
  white-space: nowrap;
}
</style>
