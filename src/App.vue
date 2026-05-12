<template>
  <DevToolbar />
  <!-- Preview wrapper: constrain width when a breakpoint is active -->
  <div
    class="preview-wrap"
    :class="{ 'preview-wrap--uw': auth.isUwMode }"
    :style="{
      ...(auth.previewWidth ? { maxWidth: auth.previewWidth + 'px', width: auth.previewWidth + 'px' } : {}),
      ...(auth.isUwMode ? { '--sidebar-collapsed': '210px', '--rightbar-width': '354px' } : {}),
    }"
  >
    <div class="crm-shell">
      <AppSidebar />
      <div class="crm-main">
        <div class="crm-body">
          <div class="crm-content" :class="{ 'crm-content--overlay': panelOverlay }">
            <div class="content-wrap">
              <AppHeader />
              <RouterView />
            </div>
          </div>
          <AppRightPanel />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppRightPanel from '@/components/layout/AppRightPanel.vue'
import DevToolbar from '@/components/layout/DevToolbar.vue'

const auth = useAuthStore()

// Reserve 48px margin when the panel is an overlay strip (preview mode ≤1024px)
const panelOverlay = computed(() =>
  auth.previewWidth !== null && auth.previewWidth <= 1024
)
</script>

<style scoped>
/* Preview wrapper: centers the constrained shell on screen */
.preview-wrap {
  height: 100vh;
  overflow: hidden;
  position: relative;  /* sidebar absolute-positions relative to this */
  transition: max-width 0.3s ease, width 0.3s ease;
  /* No max-width: shell fills the full viewport so the right panel
     is always flush to the right screen edge. Preview mode constrains
     via inline style (maxWidth + width). */
}

.crm-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Main column: everything to the right of the sidebar */
.crm-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  margin-left: var(--sidebar-collapsed);
}

/* Horizontal split: scrollable content + sticky right panel */
.crm-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
  position: relative; /* anchor for absolute-positioned panel overlay */
}

/* Main scrollable area */
.crm-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--content-bg);
  min-width: 0;
  scrollbar-width: thin;
  scrollbar-color: var(--n-200) transparent;
}

/* Inner content — centered, capped so header+content share the same right edge */
.content-wrap {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* ── Responsive ────────────────────────────── */
@media (max-width: 1024px) {
  .content-wrap { padding: 16px 16px; }
}

/* Tablet vertical: reserve 48px strip — CSS for real viewports, class for preview */
@media (max-width: 1024px) {
  .crm-content { margin-right: 48px; }
}
.crm-content--overlay { margin-right: 48px; }

@media (max-width: 767px) {
  .crm-main { margin-left: var(--sidebar-collapsed); }
  .content-wrap { padding: 12px; }
}
</style>
