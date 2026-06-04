<template>
  <span
    class="agent-avatar-wrap"
    :class="`size-${size}`"
    v-tooltip.top="nombre"
  >
    <span class="agent-avatar-circle">{{ ini }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  nombre: string
  ini: string
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<style scoped>
.agent-avatar-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: default;
}

.agent-avatar-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 700;
  line-height: 1;
  width: 100%;
  height: 100%;
  user-select: none;
}

/* Sizes */
.size-sm .agent-avatar-circle { width: 26px; height: 26px; font-size: 9px; }
.size-sm { width: 26px; height: 26px; }

.size-md .agent-avatar-circle { width: 32px; height: 32px; font-size: 11px; }
.size-md { width: 32px; height: 32px; }

.size-lg .agent-avatar-circle { width: 48px; height: 48px; font-size: 15px; }
.size-lg { width: 48px; height: 48px; }

/* Default = md */
.agent-avatar-wrap:not(.size-sm):not(.size-lg) .agent-avatar-circle { width: 28px; height: 28px; font-size: 10px; }
.agent-avatar-wrap:not(.size-sm):not(.size-lg) { width: 28px; height: 28px; }
</style>
