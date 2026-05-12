<template>
  <aside class="right-bar">
    <slot />
  </aside>
</template>

<style scoped>
.right-bar {
  width: var(--rightbar-width);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  padding-left: 16px;
}
</style>
