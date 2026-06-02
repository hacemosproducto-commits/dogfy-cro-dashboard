<template>
  <nav class="bottom-nav">
    <!-- 4 RouterLinks fijos -->
    <RouterLink
      v-for="item in primaryItems"
      :key="item.route"
      :to="item.route"
      class="bn-item"
      :class="{ 'bn-item--active': isActive(item.route) }"
    >
      <i :class="item.icon" class="bn-icon" />
      <span class="bn-label">{{ item.label }}</span>
    </RouterLink>

    <!-- 5to ítem: "Más" — abre bottom sheet con secciones secundarias -->
    <button
      class="bn-item"
      :class="{ 'bn-item--active': isMoreActive }"
      @click="showMoreSheet = true"
      aria-label="Más opciones"
    >
      <i class="pi pi-ellipsis-h bn-icon" />
      <span class="bn-label">Más</span>
    </button>
  </nav>

  <!-- Bottom sheet "Más" -->
  <Dialog
    v-model:visible="showMoreSheet"
    modal
    dismissableMask
    position="bottom"
    :draggable="false"
    :style="{ width: '100%', maxWidth: '480px', margin: '0 auto' }"
    class="more-sheet"
    :pt="{ header: { style: 'padding: 16px 20px 8px; border-bottom: 1px solid var(--n-100)' }, content: { style: 'padding: 8px 0 24px' } }"
  >
    <template #header>
      <span class="more-sheet-title">Más secciones</span>
    </template>

    <div class="more-list">
      <RouterLink
        v-for="item in moreItems"
        :key="item.route"
        :to="item.route"
        class="more-item"
        :class="{ 'more-item--active': isActive(item.route) }"
        @click="showMoreSheet = false"
      >
        <span class="more-icon-wrap">
          <i :class="item.icon" class="more-icon" />
        </span>
        <span class="more-label">{{ item.label }}</span>
        <i class="pi pi-chevron-right more-chevron" />
      </RouterLink>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Dialog from 'primevue/dialog'

const route = useRoute()
const auth = useAuthStore()

// 3 ítems primarios + "Más" como 4to slot (V1: sin Notificaciones ni Agenda)
const primaryItems = [
  { route: '/dashboard', icon: 'pi pi-home',       label: 'Inicio' },
  { route: '/leads',     icon: 'pi pi-users',      label: 'Leads' },
  { route: '/ventas',    icon: 'pi pi-chart-line', label: 'Ventas' },
]

// Secciones secundarias — visibles según rol dentro del bottom sheet "Más"
const ALL_MORE_ITEMS = [
  { route: '/agentes',       icon: 'pi pi-sitemap',  label: 'Agentes',       roles: ['team_lead', 'manager'] },
  { route: '/exportaciones', icon: 'pi pi-download', label: 'Exportaciones', roles: ['team_lead', 'manager'] },
  { route: '/configuracion', icon: 'pi pi-cog',      label: 'Configuración', roles: ['manager'] },
]
const moreItems = computed(() =>
  ALL_MORE_ITEMS.filter(i => i.roles.includes(auth.currentRole))
)

const showMoreSheet = ref(false)

function isActive(path: string) {
  return route.path.startsWith(path)
}

// "Más" se resalta si la ruta actual está en uno de sus items
const isMoreActive = computed(() =>
  moreItems.value.some(item => route.path.startsWith(item.route))
)
</script>

<style scoped>
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--n-0);
  border-top: 1px solid var(--n-150);
  z-index: 300;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom);
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
}

.bn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  min-width: 0;
  color: var(--n-400);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  padding: 8px 0;
  transition: color 0.15s;
}

.bn-item--active { color: var(--brand); }

.bn-icon  { font-size: 18px; flex-shrink: 0; }
.bn-label { font-size: 10px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

@media (max-width: 480px) {
  .bottom-nav { display: flex; }
}

/* ── Bottom sheet "Más" ──────────────────── */
:global(.more-sheet .p-dialog) {
  border-radius: 16px 16px 0 0 !important;
  margin: 0 auto !important;
}
.more-sheet-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-800);
}
.more-list { display: flex; flex-direction: column; padding: 4px 0; }
.more-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  color: var(--n-700); text-decoration: none;
  font-size: 14px; font-weight: 500;
  transition: background .12s;
  border-bottom: 1px solid var(--n-100);
}
.more-item:last-child { border-bottom: none; }
.more-item:hover, .more-item:active { background: var(--n-50); }
.more-item--active { color: var(--brand); background: var(--brand-subtle, #fdf1ed); }
.more-icon-wrap {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--n-100);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.more-item--active .more-icon-wrap { background: var(--n-0); }
.more-icon { font-size: 14px; color: var(--n-600); }
.more-item--active .more-icon { color: var(--brand); }
.more-label { flex: 1; }
.more-chevron { font-size: 11px; color: var(--n-300); }
</style>
