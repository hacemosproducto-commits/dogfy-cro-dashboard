<template>
  <div class="app-header" :class="{ 'app-header--search': searchOpen }">
    <div class="header-left">
      <Avatar :label="initials" shape="circle" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">{{ auth.user.nombre }}<span class="user-rol">, {{ roleLabel }}</span></span>
        <div class="user-status">
          <ToggleSwitch v-model="disponible" class="status-toggle" />
          <span class="status-label" :class="disponible ? 'status-on' : 'status-off'">
            {{ disponible ? 'DISPONIBLE' : 'NO DISPONIBLE' }}
          </span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <Button
        v-if="isLeadsSection"
        label="+ Crear lead"
        size="small"
        class="crear-lead-btn"
        @click="auth.showCrearLead = true"
      />

      <!-- Desktop search with dropdown -->
      <div class="search-wrap" ref="searchWrapRef">
        <IconField class="search-field">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="search"
            placeholder="Buscar..."
            class="header-search"
            @focus="searchFocused = true"
            @keydown.esc="closeSearch"
            @keydown.enter="goToSearch"
          />
        </IconField>
        <Transition name="drop">
          <div v-if="showDropdown" class="search-dropdown">
            <template v-if="leadResults.length">
              <div class="drop-section-label">Leads</div>
              <button v-for="lead in leadResults" :key="'l'+lead.id" class="drop-row" @mousedown.prevent @click="goToLead(lead.id)">
                <span class="drop-avatar">{{ initials2(lead.nombre, lead.apellido) }}</span>
                <span class="drop-info">
                  <span class="drop-name" v-html="highlight(lead.nombre + ' ' + lead.apellido)" />
                  <span class="drop-sub" v-html="highlight(lead.email) + ' · ' + highlight(lead.telefono)" />
                </span>
                <Tag :value="lead.estado" :severity="estadoSev(lead.estado)" class="drop-tag" />
              </button>
            </template>
            <template v-if="ventaResults.length">
              <div class="drop-section-label" :class="{ 'drop-section-label--border': leadResults.length }">Ventas</div>
              <button v-for="v in ventaResults" :key="'v'+v.id" class="drop-row" @mousedown.prevent @click="goToVenta(v.id)">
                <span class="drop-icon-wrap"><i class="pi pi-shopping-cart" /></span>
                <span class="drop-info">
                  <span class="drop-name" v-html="highlight(v.nombre + ' ' + v.apellido)" />
                  <span class="drop-sub" v-html="highlight(v.ventaCode) + ' · ' + v.fecha + ' · <strong>' + v.importe + '</strong>'" />
                </span>
                <span class="drop-plan-badge" :class="v.plan === 'Prueba' ? 'badge--prueba' : 'badge--mens'">{{ v.plan }}</span>
              </button>
            </template>
            <div v-if="!leadResults.length && !ventaResults.length" class="drop-empty">
              <i class="pi pi-search" />
              <span>Sin resultados para "<strong>{{ search }}</strong>"</span>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Mobile search -->
      <div class="mob-search-wrap" ref="mobileWrapRef">
        <!-- Input: solo visible cuando open -->
        <div class="mob-search-input-wrap" :class="{ 'mob-search-input-wrap--open': searchOpen }">
          <IconField class="mob-search-field">
            <InputIcon class="pi pi-search" />
            <InputText
              ref="mobileInputRef"
              v-model="search"
              placeholder="Buscar..."
              class="mob-search-input"
              @keydown.esc="closeSearch"
              @keydown.enter="goToSearch"
            />
          </IconField>
          <!-- Dropdown mobile -->
          <Transition name="drop">
            <div v-if="showDropdown" class="search-dropdown search-dropdown--mobile">
              <template v-if="leadResults.length">
                <div class="drop-section-label">Leads</div>
                <button v-for="lead in leadResults" :key="'ml'+lead.id" class="drop-row" @mousedown.prevent @click="goToLead(lead.id)">
                  <span class="drop-avatar">{{ initials2(lead.nombre, lead.apellido) }}</span>
                  <span class="drop-info">
                    <span class="drop-name" v-html="highlight(lead.nombre + ' ' + lead.apellido)" />
                    <span class="drop-sub" v-html="highlight(lead.email)" />
                  </span>
                  <Tag :value="lead.estado" :severity="estadoSev(lead.estado)" class="drop-tag" />
                </button>
              </template>
              <template v-if="ventaResults.length">
                <div class="drop-section-label" :class="{ 'drop-section-label--border': leadResults.length }">Ventas</div>
                <button v-for="v in ventaResults" :key="'mv'+v.id" class="drop-row" @mousedown.prevent @click="goToVenta(v.id)">
                  <span class="drop-icon-wrap"><i class="pi pi-shopping-cart" /></span>
                  <span class="drop-info">
                    <span class="drop-name" v-html="highlight(v.nombre + ' ' + v.apellido)" />
                    <span class="drop-sub" v-html="highlight(v.ventaCode) + ' · ' + v.importe" />
                  </span>
                </button>
              </template>
              <div v-if="!leadResults.length && !ventaResults.length" class="drop-empty">
                <i class="pi pi-search" /><span>Sin resultados</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Toggle button: lupa / X -->
        <button
          class="search-btn"
          :class="{ 'search-btn--active': searchOpen }"
          @click="toggleSearch"
          :aria-label="searchOpen ? 'Cerrar búsqueda' : 'Buscar'"
        >
          <i :class="searchOpen ? 'pi pi-times' : 'pi pi-search'" />
        </button>
      </div>

      <!-- Mobile: abrir panel derecho — oculto en perfil-lead/venta (WhatsApp/Histórico viven en FAB sheets) -->
      <button v-if="!isProfileRoute" class="panel-btn" @click="auth.toggleMobilePanel()" aria-label="Abrir panel">
        <i class="pi pi-th-large" />
      </button>
    </div>
  </div>

  <!-- Overlay mobile search (NOT teleported — scoped styles must apply) -->
  <Transition name="search-overlay">
    <div v-if="searchOpen" class="mob-search-overlay" @click="closeSearch" />
  </Transition>

  <!-- Modales globales disparados por el FAB y por toolbars contextuales.
       CrearCitaModal y CrearRecordatorioModal viven en AppRightPanel
       (donde tienen sus handlers @save para los widgets). -->
  <CrearLeadModal    v-model:visible="auth.showCrearLead" />
  <AsignarLeadsModal v-model:visible="auth.showAsignarLeads" />

  <!-- Bottom sheet WhatsApp (perfil-lead/venta en mobile, vía FAB) -->
  <Dialog
    v-model:visible="auth.showWhatsappSheet"
    :modal="true"
    position="bottom"
    :draggable="false"
    :dismissableMask="true"
    class="full-bottom-sheet"
    :pt="{
      header: { style: 'padding: 14px 18px; border-bottom: 1px solid var(--n-100)' },
      content: { style: 'padding: 0; display: flex; flex-direction: column; flex: 1; overflow: hidden' },
    }"
  >
    <template #header>
      <div class="bs-header">
        <span class="wa-title"><i class="pi pi-whatsapp" /> WhatsApp</span>
        <span class="wa-conn"><span class="wa-dot" /> Conectado</span>
      </div>
    </template>
    <div class="bs-wa-chat">
      <div class="wa-date-pill">Fri, Jul 26</div>
      <div class="wa-msg out">Good morning!</div>
      <div class="wa-msg out">Dogfy looks amazing!</div>
      <div class="wa-msg in file">📎 IMG_0483 · png · 2.8 MB</div>
      <div class="wa-msg in file">📎 IMG_0484 · png · 2.6 MB</div>
    </div>
    <div class="bs-wa-compose">
      <Button icon="pi pi-plus" text rounded size="small" />
      <input type="text" placeholder="Mensaje" class="bs-wa-input" />
      <Button icon="pi pi-microphone" text rounded size="small" />
    </div>
  </Dialog>

  <!-- Bottom sheet Historial (perfil-lead/venta en mobile, vía FAB) -->
  <Dialog
    v-model:visible="auth.showHistorialSheet"
    :modal="true"
    position="bottom"
    :draggable="false"
    :dismissableMask="true"
    class="full-bottom-sheet"
    :pt="{
      header: { style: 'padding: 14px 18px; border-bottom: 1px solid var(--n-100)' },
      content: { style: 'padding: 16px 18px 24px; display: flex; flex-direction: column; flex: 1; overflow: hidden' },
    }"
  >
    <template #header>
      <span class="bs-title">Historial</span>
    </template>
    <div class="bs-hist-pills">
      <button class="pill" :class="{ active: histTab === 'Todo' }" @click="histTab = 'Todo'">Todo</button>
      <button class="pill" :class="{ active: histTab === 'Llamadas' }" @click="histTab = 'Llamadas'">Llamadas</button>
      <button class="pill" :class="{ active: histTab === 'Comentarios' }" @click="histTab = 'Comentarios'">Comentarios</button>
    </div>
    <div class="bs-hist-list">
      <div v-for="(item, i) in mockPerfilLead.historial" :key="i" class="bs-hist-item">
        <i :class="histIcon(item.tipo)" class="bs-hist-icon" />
        <div class="bs-hist-body">
          <p class="bs-hist-text">{{ item.texto }}</p>
          <p class="bs-hist-fecha">{{ item.fecha }}</p>
        </div>
      </div>
    </div>
    <div class="bs-hist-compose">
      <input type="text" placeholder="Añadir comentario..." class="bs-hist-input" />
      <Button icon="pi pi-plus" size="small" />
    </div>
  </Dialog>

  <!-- FAB Speed Dial custom (estilo Jobber/Mobbin) — labels + icon-circle por fila -->
  <div class="fab-wrap">
    <!-- Backdrop semitransparente para cerrar al tocar fuera -->
    <Transition name="fab-backdrop">
      <div v-if="fabOpen" class="fab-backdrop" @click="fabOpen = false" />
    </Transition>

    <!-- Lista de acciones (apilada hacia arriba) -->
    <Transition name="fab-actions">
      <div v-if="fabOpen" class="fab-actions">
        <button
          v-for="(action, i) in fabActions"
          :key="action.label"
          class="fab-row"
          :style="{ '--row-delay': `${(fabActions.length - 1 - i) * 30}ms` }"
          @click="onFabAction(action)"
        >
          <span class="fab-row-label">{{ action.label }}</span>
          <span class="fab-row-icon-wrap">
            <i :class="action.icon" class="fab-row-icon" />
          </span>
        </button>
      </div>
    </Transition>

    <!-- Botón principal FAB -->
    <button
      class="fab-main"
      :class="{ 'fab-main--open': fabOpen }"
      @click="fabOpen = !fabOpen"
      :aria-label="fabOpen ? 'Cerrar acciones' : 'Acciones rápidas'"
      :aria-expanded="fabOpen"
      aria-haspopup="true"
    >
      <i class="pi" :class="fabOpen ? 'pi-times' : 'pi-plus'" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Avatar from 'primevue/avatar'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import CrearLeadModal from '@/components/leads/CrearLeadModal.vue'
import AsignarLeadsModal from '@/components/leads/AsignarLeadsModal.vue'
import { mockSearchLeads, mockSearchVentas, mockPerfilLead } from '@/data/mock'
import type { Role } from '@/data/mock'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const search = ref('')
const disponible = ref(true)
const searchOpen = ref(false)
const searchFocused = ref(false)
const searchWrapRef = ref<HTMLElement | null>(null)
const mobileWrapRef = ref<HTMLElement | null>(null)
const mobileInputRef = ref<any>(null)

const isLeadsSection = computed(() => route.path.startsWith('/leads'))
const isProfileRoute = computed(() => route.name === 'perfil-lead' || route.name === 'perfil-venta')

// ── FAB Speed Dial custom · acciones rápidas de creación según rol ────────────
// Patrón Jobber/monday.com: visible siempre en mobile (≤900px), permanente por rol.
// Las acciones que dependen de una selección (Lista de difusión) viven en su
// toolbar contextual, no aquí.
const fabOpen = ref(false)

// Estado de los bottom sheets de WhatsApp e Historial
const histTab = ref<'Todo' | 'Llamadas' | 'Comentarios'>('Todo')
function histIcon(tipo: string): string {
  const map: Record<string, string> = {
    whatsapp: 'pi pi-comment',
    llamada: 'pi pi-phone',
    comentario: 'pi pi-comment',
    recordatorio: 'pi pi-flag',
  }
  return map[tipo] ?? 'pi pi-circle'
}

function onFabAction(action: { command: () => void }) {
  fabOpen.value = false
  action.command()
}

// ── Helpers de teléfono ─────────────────────────────────────
function callPhone(phone: string) {
  if (phone) window.open(`tel:${phone.replace(/\s/g, '')}`)
}

// Mock lookup: en producción esto vendría de una store/API
// Por simplicidad, hardcodeamos un teléfono ejemplo cuando el detalle no expone el lead.
const MOCK_PHONE = '+34 699 652 338'

// ── FAB acciones — contextual por pantalla + rol ────────────────────
const fabActions = computed(() => {
  const name = String(route.name ?? '')
  const role = auth.currentRole

  // Acciones globales reutilizables
  const crearLead         = { label: 'Crear lead',         icon: 'pi pi-user-plus',     command: () => { auth.showCrearLead = true } }
  const crearCita         = { label: 'Crear cita',         icon: 'pi pi-calendar-plus', command: () => { auth.showCrearCita = true } }
  const crearRecordatorio = { label: 'Crear recordatorio', icon: 'pi pi-bookmark',      command: () => { auth.showCrearRecordatorio = true } }
  const asignarLeads      = { label: 'Asignar leads',      icon: 'pi pi-users',         command: () => { auth.showAsignarLeads = true } }

  // ── Perfil lead: acciones de gestión ──
  if (name === 'perfil-lead') {
    return [
      { label: 'Llamar',    icon: 'pi pi-phone',    command: () => callPhone(MOCK_PHONE) },
      { label: 'WhatsApp',  icon: 'pi pi-whatsapp', command: () => { auth.showWhatsappSheet = true } },
      { label: 'Histórico', icon: 'pi pi-history',  command: () => { auth.showHistorialSheet = true } },
      crearRecordatorio,
    ]
  }

  // ── Perfil venta: gestión post-venta del cliente ──
  if (name === 'perfil-venta') {
    return [
      { label: 'Llamar',    icon: 'pi pi-phone',    command: () => callPhone(MOCK_PHONE) },
      { label: 'WhatsApp',  icon: 'pi pi-whatsapp', command: () => { auth.showWhatsappSheet = true } },
      { label: 'Histórico', icon: 'pi pi-history',  command: () => { auth.showHistorialSheet = true } },
      crearRecordatorio,
    ]
  }

  // ── Detalle agente: foco en gestionar al agente ──
  if (name === 'detalle-agente') {
    return [
      asignarLeads,
      crearRecordatorio,
    ]
  }

  // ── Lista de leads: NO mostrar "Asignar leads" (ya está en toolbar) ──
  if (name === 'leads') {
    return [crearLead, crearCita, crearRecordatorio]
  }

  // ── Default por rol (resto de pantallas) ──
  const actions = [crearLead, crearCita, crearRecordatorio]
  if (role !== 'agente') actions.push(asignarLeads)
  return actions
})

const initials = computed(() =>
  auth.user.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('')
)
function initials2(nombre: string, apellido: string) {
  return (nombre[0] ?? '') + (apellido[0] ?? '')
}

const roleLabels: Record<Role, string> = {
  agente:    'Comercial',
  team_lead: 'Team Lead',
  manager:   'Manager',
}
const roleLabel = computed(() => roleLabels[auth.currentRole])

// ── Search ────────────────────────────────────────
const MIN_CHARS = 2
const MAX_RESULTS = 5

const showDropdown = computed(() =>
  (searchFocused.value || searchOpen.value) && search.value.length >= MIN_CHARS
)

function matchesQuery(fields: string[], q: string) {
  const lq = q.toLowerCase()
  return fields.some(f => f.toLowerCase().includes(lq))
}

const leadResults = computed(() => {
  if (search.value.length < MIN_CHARS) return []
  return mockSearchLeads
    .filter(l => matchesQuery([l.nombre, l.apellido, l.email, l.telefono, l.campana, l.cupon, l.codigoAmigo], search.value))
    .slice(0, MAX_RESULTS)
})

const ventaResults = computed(() => {
  if (search.value.length < MIN_CHARS) return []
  return mockSearchVentas
    .filter(v => matchesQuery([v.nombre, v.apellido, v.email, v.telefono, v.ventaCode, v.campana, v.cupon, v.codigoAmigo], search.value))
    .slice(0, MAX_RESULTS)
})

function highlight(text: string): string {
  if (!search.value || search.value.length < MIN_CHARS) return text
  const escaped = search.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

function estadoSev(estado: string): string {
  if (estado.startsWith('No contesta')) return 'warn'
  const map: Record<string, string> = {
    'Pendiente': 'success', 'No interesa': 'danger',
    'En cita': 'info', 'Formulario': 'contrast', 'Venta': 'success',
  }
  return map[estado] ?? 'secondary'
}

function goToLead(id: string) {
  closeSearch()
  router.push(`/leads/${id}`)
}
function goToVenta(id: string) {
  closeSearch()
  router.push(`/ventas/${id}`)
}
function goToSearch() {
  if (!search.value.trim()) return
  searchFocused.value = false
  router.push({ path: '/buscar', query: { q: search.value.trim() } })
}

async function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    await nextTick()
    // Focus the native input inside PrimeVue InputText
    const el = mobileInputRef.value?.$el ?? mobileInputRef.value
    el?.querySelector?.('input')?.focus() ?? el?.focus()
  } else {
    search.value = ''
  }
}

function closeSearch() {
  search.value = ''
  searchFocused.value = false
  searchOpen.value = false
}

// Click outside desktop dropdown
function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  if (searchWrapRef.value && !searchWrapRef.value.contains(target)) {
    searchFocused.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 16px 0 14px;
  gap: 12px;
  margin-bottom: 4px;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: opacity 0.2s ease, max-width 0.25s ease;
  overflow: hidden;
  max-width: 400px;
}

.user-avatar {
  background: var(--n-200) !important;
  color: var(--n-600) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  width: 34px !important;
  height: 34px !important;
  flex-shrink: 0 !important;
  min-width: 34px !important;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-800);
  line-height: 1.2;
}

.user-rol {
  font-weight: 400;
  color: var(--n-500);
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.status-on  { color: var(--success); }
.status-off { color: var(--n-400); }

.header-right {
  margin-left: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.crear-lead-btn {
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

/* ── Search wrap (desktop) ──────────────────────── */
.search-wrap { position: relative; }

.header-search {
  width: 220px;
  background: var(--n-0) !important;
  border-color: var(--n-200) !important;
  border-radius: 99px !important;
}

/* ── Dropdown ───────────────────────────────────── */
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 360px;
  background: var(--n-0);
  border: 1px solid var(--n-150, var(--n-200));
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06);
  overflow: hidden;
  z-index: 200;
  padding: 6px 0;
}

.search-dropdown--mobile {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  width: auto;
}

.drop-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .07em;
  color: var(--n-400);
  text-transform: uppercase;
  padding: 6px 14px 4px;
}
.drop-section-label--border {
  border-top: 1px solid var(--n-100);
  margin-top: 4px;
  padding-top: 10px;
}

.drop-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}
.drop-row:hover { background: var(--n-50); }

.drop-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--n-100);
  color: var(--n-600);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.drop-icon-wrap {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--n-100);
  color: var(--n-500);
  font-size: 13px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.drop-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 1px;
}

.drop-name {
  font-size: 13px; font-weight: 600; color: var(--n-800);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.drop-sub {
  font-size: 11px; color: var(--n-400);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.drop-tag { flex-shrink: 0; font-size: 10px; }

.drop-plan-badge {
  flex-shrink: 0; font-size: 10px; font-weight: 600;
  padding: 2px 7px; border-radius: 99px;
}
.badge--prueba { background: #ede9fe; color: #6d28d9; }
.badge--mens   { background: #dbeafe; color: #1d4ed8; }

.drop-empty {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 14px; font-size: 13px; color: var(--n-400);
}
.drop-empty .pi { font-size: 14px; }

:deep(mark) {
  background: #fef08a; color: inherit;
  border-radius: 2px; padding: 0 1px;
}

/* ── Dropdown transition ──────────────────────── */
.drop-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.drop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.drop-enter-from   { opacity: 0; transform: translateY(-4px); }
.drop-leave-to     { opacity: 0; transform: translateY(-4px); }

/* ── Mobile search ──────────────────────────────── */
.mob-search-wrap {
  display: none;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.mob-search-input-wrap {
  /* flex:1 fills available width; max-width:0 collapses it when closed */
  flex: 1;
  min-width: 0;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.2s ease;
}

.mob-search-input-wrap--open {
  max-width: 9999px;   /* uncapped — flex:1 does the actual sizing */
  opacity: 1;
}

.mob-search-field { width: 100%; }

.mob-search-input {
  width: 100%;
  background: var(--n-0) !important;
  border-color: var(--brand) !important;
  border-radius: 99px !important;
  box-shadow: 0 0 0 3px rgba(239,105,72,.12) !important;
}

/* Botones icon */
.panel-btn,
.search-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px; height: 36px;
  border: 1px solid var(--n-200);
  border-radius: 50%;
  background: var(--n-0);
  color: var(--n-600);
  cursor: pointer;
  font-size: 15px;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.search-btn--active {
  background: var(--n-100) !important;
  border-color: var(--n-300) !important;
}

/* ── Mobile overlay ─────────────────────────────── */
/* position: fixed so overflow:hidden on ancestors doesn't clip it.
   z-index: 99 — header sits at z-index: 100, so header is always on top. */
.mob-search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.search-overlay-enter-active { transition: opacity 0.2s ease; }
.search-overlay-leave-active { transition: opacity 0.15s ease; }
.search-overlay-enter-from, .search-overlay-leave-to { opacity: 0; }

/* ── Bottom sheets full-screen (WhatsApp / Histórico desde FAB) ──────── */
:global(.full-bottom-sheet.p-dialog) {
  width: 100% !important;
  max-width: 100% !important;
  height: calc(100dvh - 48px) !important;
  margin: 0 !important;
  border-radius: 16px 16px 0 0 !important;
  display: flex !important;
  flex-direction: column !important;
}
:global(.full-bottom-sheet .p-dialog-header) {
  flex-shrink: 0;
}
:global(.full-bottom-sheet .p-dialog-content) {
  flex: 1 !important;
  overflow: hidden !important;
}

.bs-header { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 12px; }
.bs-title { font-size: 16px; font-weight: 700; color: var(--n-800); }

/* WhatsApp sheet */
.bs-wa-chat {
  flex: 1;
  background: #ece5dd;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}
.wa-title  { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #25d366; }
.wa-conn   { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--n-500); }
.wa-conn .wa-dot { width: 8px; height: 8px; border-radius: 50%; background: #25d366; display: inline-block; }
.wa-date-pill { align-self: center; background: rgba(255,255,255,0.7); padding: 3px 10px; border-radius: 999px; font-size: 11px; color: var(--n-600); }
.wa-msg { max-width: 80%; padding: 6px 10px; border-radius: 8px; font-size: 13px; background: #fff; align-self: flex-start; }
.wa-msg.out { background: #dcf8c6; align-self: flex-end; }
.wa-msg.in.file { background: #fff; }

/* Pills del historial — replican AppRightPanel */
.pill { background: var(--n-100); border: none; padding: 5px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; color: var(--n-700); font-family: inherit; }
.pill.active { background: var(--brand-subtle, #fdf1ed); color: var(--brand); font-weight: 600; }
.bs-wa-compose {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid var(--n-100);
  background: var(--n-0);
  flex-shrink: 0;
}
.bs-wa-input {
  flex: 1; border: 1px solid var(--n-200); border-radius: 20px;
  padding: 8px 14px; font-size: 13px; outline: none;
}
.bs-wa-input:focus { border-color: var(--brand); }

/* Historial sheet */
.bs-hist-pills { display: flex; gap: 6px; margin-bottom: 12px; flex-shrink: 0; }
.bs-hist-list  { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.bs-hist-item  { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--n-100); }
.bs-hist-icon  { color: var(--n-500); margin-top: 2px; font-size: 14px; flex-shrink: 0; }
.bs-hist-body  { flex: 1; min-width: 0; }
.bs-hist-text  { font-size: 13px; color: var(--n-700); margin: 0; }
.bs-hist-fecha { font-size: 11px; color: var(--n-500); margin: 2px 0 0; }

/* Compose abajo del todo (sticky bottom) */
.bs-hist-compose {
  display: flex; align-items: center; gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--n-100);
  flex-shrink: 0;
}
.bs-hist-input { flex: 1; border: 1px solid var(--n-200); border-radius: 8px; padding: 10px 12px; font-size: 13px; outline: none; }
.bs-hist-input:focus { border-color: var(--brand); }

/* ── FAB Speed Dial custom (estilo Jobber/Mobbin) ──────────── */
.fab-wrap {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 20px;
  z-index: 350;
}

/* Backdrop semitransparente para cerrar al tocar fuera */
.fab-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: -1;
}

/* Botón principal — círculo naranja 56px */
.fab-main {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--brand);
  color: var(--n-0);
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(239, 105, 72, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  position: relative;
  z-index: 2;
  transition: transform .25s cubic-bezier(0.4, 0, 0.2, 1), background .2s, box-shadow .15s;
}
.fab-main:hover {
  box-shadow: 0 8px 20px rgba(239, 105, 72, 0.45);
}
.fab-main--open {
  background: var(--n-700);
  transform: rotate(135deg);
}
.fab-main .pi { transition: transform .25s; }

/* Lista de acciones apilada hacia arriba */
.fab-actions {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-end;
  pointer-events: auto;
}

/* Fila individual: pill continuo con label + icon-circle interno */
.fab-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--n-0);
  border: 1px solid var(--n-150);
  border-radius: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.10);
  padding: 4px 4px 4px 18px;
  cursor: pointer;
  font-family: inherit;
  transition: background .15s, border-color .15s, box-shadow .15s, transform .15s;
  /* Stagger de entrada */
  animation: fab-row-in .28s cubic-bezier(0.34, 1.56, 0.64, 1) var(--row-delay, 0ms) backwards;
}
.fab-row:hover {
  background: var(--brand-subtle, #fdf1ed);
  border-color: var(--brand);
  box-shadow: 0 6px 14px rgba(239, 105, 72, 0.22);
  transform: translateX(-2px);
}

.fab-row-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-800);
  white-space: nowrap;
  transition: color .15s;
}
.fab-row:hover .fab-row-label { color: var(--brand); }

.fab-row-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--brand-subtle, #fdf1ed);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s;
}
.fab-row:hover .fab-row-icon-wrap {
  background: var(--n-0);
}

.fab-row-icon {
  font-size: 18px;
  color: var(--brand);
}

/* Animaciones */
@keyframes fab-row-in {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.fab-actions-enter-active { transition: none; } /* la animación va por el @keyframes */
.fab-actions-leave-active { transition: opacity .15s; }
.fab-actions-leave-to { opacity: 0; }

.fab-backdrop-enter-active, .fab-backdrop-leave-active { transition: opacity .2s; }
.fab-backdrop-enter-from, .fab-backdrop-leave-to { opacity: 0; }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 900px) {
  .search-field    { display: none; }
  .search-btn      { display: flex; }
  .mob-search-wrap { display: flex; }

  /* Crear lead pasa a Speed Dial FAB para no apretar el header */
  .crear-lead-btn  { display: none !important; }
  .fab-wrap        { display: block; }

  /* En search mode: oculta todo excepto el input + botón X */
  .app-header--search .header-left   { display: none; }
  .app-header--search .crear-lead-btn { display: none; }
  .app-header--search .panel-btn     { display: none; }

  /* header-right llena todo el header cuando el search está abierto */
  .app-header--search .header-right {
    flex: 1;
    min-width: 0;
    margin-left: 0;
  }
  /* mob-search-wrap también llena header-right */
  .app-header--search .mob-search-wrap {
    flex: 1;
    min-width: 0;
  }
}

/* Overlay solo visible en ≤900px (mobile + tablet vertical) */
@media (min-width: 901px) {
  .mob-search-overlay { display: none !important; }
}

@media (max-width: 480px) {
  .panel-btn { display: flex; }
  /* FAB se posiciona sobre el bottom nav (60px + safe area) */
  .fab-wrap {
    bottom: calc(76px + env(safe-area-inset-bottom));
    right: 16px;
  }
}
</style>
