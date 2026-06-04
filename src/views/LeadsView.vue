<template>
  <div class="leads-view">
    <div v-if="tabs.length" class="leads-header">
      <div class="leads-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab-btn"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>
      <div class="leads-actions">
        <Select
          v-if="role === 'manager' && activeTab === 'Mi equipo'"
          v-model="paisFiltro"
          :options="['España','Francia','Italia','Alemania']"
          placeholder="Pais"
        >
          <template #value="{ value }">
            <span>Pais: {{ value || 'España' }}</span>
          </template>
        </Select>
      </div>
    </div>

    <SectionCard>
      <div class="section-toolbar">
        <!-- "+ Quiero leads" se trasladó al FAB SpeedDial -->
        <Button v-if="showTeamActions" label="+ Asignar leads" size="small" @click="auth.showAsignarLeads = true" />
        <span class="spacer" />
        <!-- Chip filtro por estado (desde dashboard) -->
        <span v-if="estadoFiltro" class="filter-chip">
          {{ estadoFiltro }}
          <button class="filter-chip-clear" @click="router.replace({ path: '/leads' })" aria-label="Quitar filtro">
            <i class="pi pi-times" />
          </button>
        </span>
        <!-- Chips filtros del panel -->
        <FiltrosChips v-model="filtrosActivos" />
        <Button
          label="Filtros"
          icon="pi pi-filter"
          severity="secondary"
          :outlined="!filtrosActivos || !hasFiltrosActivos"
          size="small"
          :badge="filtrosBadge || undefined"
          @click="showFiltros = true"
        />
      </div>

      <DataTable
        :value="displayed"
        stripedRows
        class="leads-table"
        :selection="showMiEquipoColumns ? selected : undefined"
        @update:selection="selected = $event"
        :data-key="showMiEquipoColumns ? 'id' : undefined"
        @row-click="goToLead"
      >
        <Column v-if="showMiEquipoColumns" selectionMode="multiple" headerStyle="width:28px;padding-right:0" bodyStyle="width:28px;padding-right:0" />
        <Column v-if="showMiEquipoColumns" header="Agente" headerStyle="padding-left:6px" bodyStyle="padding-left:6px" style="min-width:84px">
          <template #body="{ data }">
            <span class="agente-cell" v-tooltip.top="data.agente">
              <span class="agente-avatar" aria-hidden="true">
                <img v-if="data.avatar" :src="data.avatar" :alt="data.agente" />
                <i v-else class="pi pi-user" />
              </span>
              <span class="agente-iniciales">{{ data.agenteIni }}</span>
            </span>
          </template>
        </Column>
        <Column field="estado" header="Estado" sortable style="min-width:130px">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="estadoSeverity(data.estado)" :class="{ 'tag-formulario': data.estado === 'Formulario' }" />
          </template>
        </Column>
        <Column field="telefono" header="Teléfono" style="min-width:120px" />
        <Column field="email" header="Email" style="min-width:240px" />
        <Column field="cupon" header="Cupón" sortable style="min-width:120px" />
        <Column field="campana" header="Campaña" sortable style="min-width:140px" />
        <Column v-if="showMiEquipoColumns" field="grDia" header="Gr/día" style="min-width:80px" />
        <Column v-if="showMiEquipoColumns" field="importe" header="Importe" style="min-width:90px" />
        <Column header="" headerStyle="width:28px;padding:0" bodyStyle="width:28px;padding:0;text-align:center">
          <template #body="{ data }">
            <i v-if="data.errorPago" class="pi pi-exclamation-circle error-icon" title="Error de pago" />
          </template>
        </Column>
      </DataTable>

      <div ref="sentinel" class="infinite-sentinel">
        <span v-if="hasMore" class="infinite-loading">Cargando más leads…</span>
      </div>
    </SectionCard>
  </div>

  <!-- Modal crear lead -->
  <CrearLeadModal v-model:visible="auth.showCrearLead" />

  <!-- AsignarLeadsModal vive globalmente en AppHeader (v-model:visible="auth.showAsignarLeads") -->

  <!-- Panel filtros -->
  <FiltrosPanel v-model:visible="showFiltros" modo="leads" @apply="onFiltrosAplicados" />

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Select from 'primevue/select'
import SectionCard from '@/components/ui/SectionCard.vue'
import CrearLeadModal from '@/components/leads/CrearLeadModal.vue'
import FiltrosPanel from '@/components/ui/FiltrosPanel.vue'
import FiltrosChips from '@/components/ui/FiltrosChips.vue'
import type { FiltrosValue } from '@/components/ui/FiltrosPanel.vue'
import { mockLeads } from '@/data/mock'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()
const auth = useAuthStore()
const role = computed(() => auth.currentRole)

// Filtro de estado pre-aplicado desde query param (?estado=Pendientes)
const estadoFiltro = computed(() => (route.query.estado as string) || '')

// Tabs por rol — agente no tiene tabs; team_lead/manager tienen Personal + Mi equipo
const tabs = computed<string[]>(() =>
  role.value === 'agente' ? [] : ['Personal', 'Mi equipo']
)
const activeTab = ref<string>('Personal')
watch(role, () => { activeTab.value = role.value === 'agente' ? 'Personal' : 'Personal' }, { immediate: true })

// Acciones de equipo (Listas de difusión, Asignar leads, selección): fijas para
// team_lead/manager en ambas pestañas. Las columnas extendidas (checkbox, Agente,
// Gr/día, Importe) solo aparecen en "Mi equipo".
const showTeamActions = computed(() => role.value !== 'agente')
const showMiEquipoColumns = computed(() =>
  role.value !== 'agente' && activeTab.value === 'Mi equipo'
)

const paisFiltro = ref<string>('España')

// Panel filtros — declarados ANTES de filtered para evitar temporal dead zone
const showFiltros = ref(false)
const filtrosActivos = ref<FiltrosValue | null>(null)

// Datos según vista:
// - Agente o tab "Personal": solo MIS leads (drip-feed: 1 Pendiente arriba)
// - "Mi equipo": leads de todo el equipo (todos)
// - Manager Mi equipo: filtrado por país
const filtered = computed(() => {
  let list = !showMiEquipoColumns.value
    ? mockLeads.slice(0, 18)
    : role.value === 'manager'
      ? mockLeads.filter(l => l.pais === paisFiltro.value)
      : mockLeads

  // Filtro por estado desde query param (dashboard → leads)
  if (estadoFiltro.value) {
    const q = estadoFiltro.value.toLowerCase()
    list = list.filter(l => l.estado.toLowerCase().includes(q))
  }
  // Filtros del panel lateral
  const f = filtrosActivos.value
  if (f) {
    if (f.estados.length)
      list = list.filter(l => f.estados.some(e => l.estado.toLowerCase().includes(e.toLowerCase())))
    if (f.campana)
      list = list.filter(l => l.campana === f.campana)
    if (f.cupon)
      list = list.filter(l => (l.cupon ?? '').toLowerCase().includes(f.cupon.toLowerCase()))
  }
  return list
})

const { displayed, sentinel, hasMore } = useInfiniteScroll(filtered, 20)

const selected = ref<typeof mockLeads>([])

function onFiltrosAplicados(f: FiltrosValue) {
  filtrosActivos.value = f
}

const hasFiltrosActivos = computed(() => {
  const f = filtrosActivos.value
  if (!f) return false
  return f.estados.length > 0 || f.planes.length > 0 || !!f.campana || !!f.cupon
})

const filtrosBadge = computed(() => {
  const f = filtrosActivos.value
  if (!f) return ''
  let c = 0
  if (f.estados.length) c++
  if (f.campana) c++
  if (f.cupon) c++
  return c > 0 ? String(c) : ''
})

function estadoSeverity(estado: string): string {
  if (estado.startsWith('No contesta')) return 'warn'
  const map: Record<string, string> = {
    'Pendiente':   'success',
    'No interesa': 'danger',
    'En cita':     'info',
    'Cita':        'info',
    'Formulario':  'contrast',
    'Venta':       'success',
  }
  return map[estado] ?? 'secondary'
}

function goToLead(event: { data: { id: string } }) {
  router.push(`/leads/${event.data.id}`)
}

</script>

<style scoped>
.leads-view { display: flex; flex-direction: column; gap: 16px; }
.leads-header { display: flex; align-items: center; justify-content: space-between; min-height: 36px; }
.leads-tabs { display: flex; gap: 4px; }
.leads-actions { display: flex; gap: 8px; align-items: center; }
.tab-btn { background: none; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--color-neutral-dark); }
.tab-btn.active { background: var(--color-brand-primary-light); color: var(--color-brand-primary); font-weight: 600; }
.section-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.section-toolbar .spacer { flex: 1; }
.error-icon { color: var(--color-error-dark); font-size: 14px; }
.crear-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--color-neutral-dark); }
.form-row .p-inputtext,
.form-row .p-select { width: 100%; }
.form-row .hint { font-size: 12px; color: var(--n-400, #888); }
.form-row .req { color: var(--brand, #ef6948); }
.crear-lead-header { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.crear-lead-header .pi { font-size: 14px; }
.tel-input { display: flex; gap: 6px; }
.tel-input .tel-prefix { width: 76px; flex-shrink: 0; }
.tel-input .tel-number { flex: 1; }
.agente-cell { display: inline-flex; align-items: center; gap: 8px; cursor: default; }
.agente-avatar { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #e6eaf2; color: #6b7280; overflow: hidden; flex-shrink: 0; }
.agente-avatar img { width: 100%; height: 100%; object-fit: cover; }
.agente-avatar .pi-user { font-size: 13px; }
.agente-iniciales { font-size: 12px; font-weight: 600; color: var(--n-700, #333); }
.infinite-sentinel { height: 32px; display: flex; align-items: center; justify-content: center; }
.infinite-loading { font-size: 12px; color: var(--n-400); }

:deep(.tag-formulario) { background: #ede9fe; color: #6d28d9; }


/* Chip de filtro activo */
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fdf1ed;
  color: var(--brand);
  border: 1px solid #f5c5b4;
  border-radius: 99px;
  padding: 2px 8px 2px 10px;
  font-size: 12px;
  font-weight: 600;
}
.filter-chip-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--brand);
  opacity: 0.7;
  transition: opacity 0.12s;
}
.filter-chip-clear:hover { opacity: 1; }
.filter-chip-clear .pi { font-size: 9px; }
</style>
