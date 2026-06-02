<template>
  <aside
    class="sidebar"
    :class="{ 'sidebar--expanded': hovered || auth.isUwMode, 'sidebar--uw': auth.isUwMode }"
    :style="{ position: sidebarPosition }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <!-- Logo -->
    <RouterLink to="/dashboard" class="sidebar-logo" :class="{ 'sidebar-logo--uw': auth.isUwMode }">
      <img src="@/assets/logo-crm-sales.svg" alt="Dogfy CRM Sales" class="sidebar-logo-img" />
    </RouterLink>

    <div class="sidebar-divider" />

    <!-- Nav items -->
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in visibleItems"
        :key="item.route"
        :to="item.route"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.route) }"
      >
        <span class="nav-icon">
          <i :class="item.icon" />
        </span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom: log out -->
    <div class="sidebar-bottom">
      <div class="sidebar-divider" />
      <button class="nav-item nav-item--logout" @click="auth.logout()">
        <span class="nav-icon"><i class="pi pi-sign-out" /></span>
        <span class="nav-label">Log out</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const hovered = ref(false)
const route = useRoute()
const auth = useAuthStore()

// When a breakpoint preview is active, the sidebar must be absolute
// (not fixed) so it stays inside the constrained preview-wrap container
const sidebarPosition = computed(() =>
  auth.previewWidth !== null ? 'absolute' : 'fixed'
)

function isActive(path: string) {
  return route.path.startsWith(path)
}

// Items in the exact order specified per role
const allNavItems = [
  { route: '/dashboard',      icon: 'pi pi-home',         label: 'Dashboard',       roles: ['agente', 'team_lead', 'manager'] },
  { route: '/leads',          icon: 'pi pi-users',         label: 'Leads',           roles: ['agente', 'team_lead', 'manager'] },
  { route: '/ventas',         icon: 'pi pi-chart-line',    label: 'Ventas',          roles: ['agente', 'team_lead', 'manager'] },
  { route: '/agentes',        icon: 'pi pi-sitemap',       label: 'Agentes',         roles: ['team_lead', 'manager'] },
  { route: '/exportaciones',  icon: 'pi pi-download',      label: 'Exportaciones',   roles: ['team_lead', 'manager'] },
  { route: '/configuracion',  icon: 'pi pi-cog',           label: 'Configuración',   roles: ['manager'] },
]

const visibleItems = computed(() =>
  allNavItems.filter(i => i.roles.includes(auth.currentRole))
)
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-collapsed);
  min-width: var(--sidebar-collapsed);
  height: 100%;
  background: var(--n-0);
  border-right: 1px solid var(--n-150);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width var(--sidebar-transition), box-shadow var(--sidebar-transition);
  z-index: 200;
  /* position is driven by :style binding (fixed | absolute) */
  left: 0;
  top: 0;
}

.sidebar--expanded {
  width: var(--sidebar-expanded);
  box-shadow: 4px 0 16px rgba(0,0,0,0.06);
}

/* UW: always expanded, no transition, no shadow */
.sidebar--uw {
  transition: none !important;
  box-shadow: none !important;
}

/* ── Logo ──────────────────────────────────── */
/* padding-left: (68px sidebar - 52px logo) / 2 = 8px → logo never moves */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 8px 10px 8px;
  flex-shrink: 0;
  overflow: hidden;
  min-height: 64px;
}

/* UW: logo alineado a la izquierda con más aire */
.sidebar-logo--uw {
  padding-left: 18px;
}

.sidebar-logo-img {
  width: 52px;
  min-width: 52px;
  height: auto;
  display: block;
}

/* ── Divider ───────────────────────────────── */
.sidebar-divider {
  height: 1px;
  background: var(--n-150);
  margin: 4px 12px;
  flex-shrink: 0;
}

/* ── Nav containers ────────────────────────── */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 8px;
  overflow: hidden;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px 12px;
  flex-shrink: 0;
}

/* ── Nav item ──────────────────────────────── */
/*
 * padding-left keeps the icon pixel-perfect in the center of the
 * 52px available width (68px sidebar − 8px×2 container padding):
 *   (52 − 20px icon) / 2 = 16px
 * This value NEVER changes → icon never moves during the animation.
 * Only the label slides in via max-width.
 */
/* Item structure stays IDENTICAL in both states so the icon never moves.
   The active background is a separate ::before that animates between
   "circle around the icon" (collapsed) and "full-width pill" (expanded). */
.nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  height: 40px;
  padding: 0 12px 0 16px;        /* icon always at left:16 + 8 nav-padding = 24px from sidebar */
  border-radius: 99px;
  color: var(--n-500);
  text-decoration: none;
  position: relative;
  transition: color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
}

/* Hover background — circle in collapsed, pill in expanded */
/* explicit top + height (not inset shorthand) so the pseudo-element is always exactly 40×40 */
.nav-item:hover::before { content: ""; position: absolute; top: 0; left: 6px; width: 40px; height: 40px; border-radius: 50%; background: #f7f7f7; z-index: 0; transition: width 0.18s ease, left 0.18s ease, border-radius 0.18s ease; }
.sidebar--expanded .nav-item:hover::before { left: 0; width: 100%; height: 40px; border-radius: 99px; }

/* Active background — same trick */
.nav-item--active { background: none; color: var(--brand); }
.nav-item--active::before {
  content: "";
  position: absolute;
  left: 6px;                     /* (52 nav inner - 40 circle) / 2 */
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f7f7f7;
  z-index: 0;
  transition: left 0.18s ease, width 0.18s ease, border-radius 0.18s ease;
}
.sidebar--expanded .nav-item--active::before {
  left: 0;
  width: 100%;
  border-radius: 99px;
}

/* Keep icon + label above the ::before */
.nav-icon, .nav-label { position: relative; z-index: 1; }

.nav-item--active:hover { color: var(--brand-dark); }

.nav-item:hover { color: var(--n-800); }

/* Log out button resets */
.nav-item--logout {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.nav-item--logout:hover {
  background: var(--error-bg) !important;
  color: var(--error) !important;
}

/* ── Icon ──────────────────────────────────── */
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  font-size: 16px;
  flex-shrink: 0;
}

/* ── Label ─────────────────────────────────── */
/*
 * max-width: 0 removes the label from flex flow without display:none,
 * so the icon stays centered. max-width animates smoothly while opacity
 * handles the fade — both transitions fire simultaneously.
 */
.nav-label {
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.18s ease, max-width 0.22s ease;
}

.sidebar--expanded .nav-label {
  opacity: 1;
  max-width: 160px;
}

/* ── Responsive: tablet ≤767px — lock collapsed ── */
@media (max-width: 767px) {
  .sidebar--expanded {
    width: var(--sidebar-collapsed) !important;
    box-shadow: none !important;
  }
  .sidebar--expanded .nav-label {
    opacity: 0 !important;
    max-width: 0 !important;
  }
}

/* ── Mobile ≤480px — ocultar sidebar, usa bottom nav ── */
@media (max-width: 480px) {
  .sidebar { display: none !important; }
}

</style>
