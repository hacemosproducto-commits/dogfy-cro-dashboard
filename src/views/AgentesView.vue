<template>
  <div class="agentes-view">

    <!-- Tabs + acciones -->
    <div class="agentes-header">
      <div class="agentes-tabs">
        <button class="tab-btn" :class="{ active: tab === 'equipo' }" @click="tab = 'equipo'">Mi equipo</button>
        <button class="tab-btn" :class="{ active: tab === 'ranking' }" @click="goRanking">Ranking</button>
      </div>
      <div class="agentes-actions">
        <Button label="Asignar leads" size="small" icon="pi pi-users" @click="showAsignacion = true" />
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-row">
      <KpiCard valor="204" label="Leads totales" />
      <KpiCard valor="100" label="No contesta" />
      <KpiCard valor="54"  label="No gestionados" />
      <KpiCard valor="67"  label="Reciclados" />
    </div>

    <!-- Tabla Mi equipo -->
    <SectionCard v-if="tab === 'equipo'" class="table-card">

      <!-- Bulk action bar — visible cuando hay selección -->
      <Transition name="bulk-bar">
        <div v-if="selectedIds.size > 0" class="bulk-bar">
          <span class="bulk-count">
            <i class="pi pi-check-square" />
            {{ selectedIds.size }} {{ selectedIds.size === 1 ? 'agente' : 'agentes' }} seleccionados
          </span>
          <div class="bulk-actions">
            <Button label="Asignar leads"  icon="pi pi-users"        size="small" outlined @click="openBulkAsignar" />
            <Button label="Disponible"     icon="pi pi-check-circle" size="small" outlined @click="setBulkDisponible(true)" />
            <Button label="No disponible"  icon="pi pi-ban"          size="small" outlined @click="setBulkDisponible(false)" />
            <Button label="Modo offline"   icon="pi pi-power-off"    size="small" outlined @click="showBulkOffline = true" />
          </div>
          <Button icon="pi pi-times" text rounded size="small" class="bulk-clear" title="Limpiar selección" @click="selectedIds.clear(); selectedIds = new Set(selectedIds)" />
        </div>
      </Transition>

      <div class="section-toolbar">
        <span class="table-hint">Scroll horizontal para ver todas las métricas</span>
        <span class="spacer" />
        <Button
          label="Filtros"
          icon="pi pi-filter"
          severity="secondary"
          :outlined="!agentesFiltrosBadge"
          size="small"
          :badge="agentesFiltrosBadge || undefined"
          @click="showFiltros = true"
        />
      </div>

      <DataTable
        :value="sortedAgentes"
        scrollable
        scroll-height="flex"
        class="agentes-table"
        stripedRows
        :sort-field="sortField"
        :sort-order="sortOrder"
        removable-sort
        @sort="onSort"
        @row-click="goToAgente"
        @row-contextmenu="onRowContextMenu"
        contextMenu
      >
        <!-- ── Checkbox column ── -->
        <Column frozen style="width:44px; padding-right:0">
          <template #header>
            <Checkbox
              :modelValue="allSelected"
              :binary="true"
              @update:modelValue="toggleSelectAll"
              @click.stop
            />
          </template>
          <template #body="{ data }">
            <Checkbox
              :modelValue="selectedIds.has(data.id)"
              :binary="true"
              @update:modelValue="toggleSelect(data.id)"
              @click.stop
            />
          </template>
        </Column>

        <!-- ── Columnas fijas ── -->
        <Column field="nombre" header="Agente" frozen style="min-width:200px" sortable>
          <template #body="{ data }">
            <div class="agente-cell">
              <div class="avatar-presence">
                <AgentAvatar :nombre="data.nombre" :ini="data.ini" size="sm" />
                <span
                  class="presence-dot"
                  :class="{
                    'presence-dot--offline': offlineStore.isOffline(data.id),
                    'presence-dot--away':    !offlineStore.isOffline(data.id) && noDisponibles.has(data.id),
                  }"
                />
              </div>
              <span class="agente-name">{{ data.nombre }}</span>
            </div>
          </template>
        </Column>
        <Column field="total" header="Total" frozen sortable style="min-width:80px; text-align:right" />
        <Column field="cr" header="CR %" frozen sortable class="col-frozen-last" style="min-width:72px; text-align:right">
          <template #body="{ data }">{{ data.cr }}%</template>
        </Column>

        <!-- ── Columnas con scroll ── -->
        <Column field="llamadasDia"   header="Llamadas/día"      sortable style="min-width:110px; text-align:right" />
        <Column field="tiempoLlamada" header="Tiempo llamada"    sortable style="min-width:120px" />
        <Column field="fresh"         header="Fresh"             sortable style="min-width:72px; text-align:right" />
        <Column field="freshCr"       header="Fresh CR"          sortable style="min-width:80px; text-align:right">
          <template #body="{ data }">{{ data.freshCr }}%</template>
        </Column>
        <Column field="recuperados"   header="Recuperados"       sortable style="min-width:110px; text-align:right" />
        <Column field="recuperadosCr" header="Recup. CR"         sortable style="min-width:90px; text-align:right">
          <template #body="{ data }">{{ data.recuperadosCr }}%</template>
        </Column>
        <Column field="pausados"      header="Pausados"          sortable style="min-width:90px; text-align:right" />
        <Column field="pausadosCr"    header="Pausados CR"       sortable style="min-width:100px; text-align:right">
          <template #body="{ data }">{{ data.pausadosCr }}%</template>
        </Column>
        <Column field="noGestionados"  header="No gestionados"   sortable style="min-width:130px; text-align:right" />
        <Column field="noContesta1"    header="No contesta (&lt;5)" sortable style="min-width:140px; text-align:right" />
        <Column field="noContesta2"    header="No contesta (&gt;5)" sortable style="min-width:140px; text-align:right" />
        <Column field="enCita"         header="En cita"           sortable style="min-width:80px; text-align:right" />
        <Column field="formulario"     header="Formulario"        sortable style="min-width:100px; text-align:right" />

        <!-- Chevron -->
        <Column frozen alignFrozen="right" style="width:44px">
          <template #body>
            <Button icon="pi pi-chevron-right" text rounded size="small" />
          </template>
        </Column>
      </DataTable>
    </SectionCard>

  </div>

  <!-- Modal Asignar leads (individual o bulk) -->
  <AsignarLeadsModal
    v-model:visible="showAsignacion"
    :preselectAgenteIds="bulkAsignarIds"
  />

  <!-- Panel filtros agentes -->
  <FiltrosAgentesPanel v-model:visible="showFiltros" @apply="onFiltrosAplicados" />

  <!-- Context menu (right-click en fila) -->
  <ContextMenu ref="cm" :model="contextMenuItems" />

  <!-- Modal bulk offline -->
  <Dialog
    v-model:visible="showBulkOffline"
    modal
    :style="{ width: '480px', maxWidth: '95vw' }"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-icon-offline">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
            <path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
          </svg>
        </span>
        <div>
          <div class="modal-title">Modo offline</div>
          <div class="modal-subtitle">{{ selectedIds.size }} agentes seleccionados</div>
        </div>
      </div>
    </template>

    <div class="bulk-offline-body">
      <div class="field">
        <label class="field-label">Nombre del evento <span class="optional">(opcional)</span></label>
        <InputText v-model="bulkEventName" placeholder="Ej. Feria Mascota Madrid 2026" class="w-full" />
      </div>
      <div class="field-row">
        <div class="field">
          <label class="field-label">Desde</label>
          <DatePicker v-model="bulkStart" showTime hourFormat="24" dateFormat="dd/mm/yy" :minDate="new Date()" class="w-full" />
        </div>
        <div class="field">
          <label class="field-label">Hasta</label>
          <DatePicker v-model="bulkEnd" showTime hourFormat="24" dateFormat="dd/mm/yy" :minDate="bulkStart ?? new Date()" class="w-full" />
        </div>
      </div>
      <div v-if="bulkStart && bulkEnd" class="resumen-box">
        <i class="pi pi-clock" />
        <span>Modo offline del {{ fmtDate(bulkStart) }} al {{ fmtDate(bulkEnd) }}</span>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="showBulkOffline = false" />
      <Button
        label="Activar modo offline"
        icon="pi pi-power-off"
        :disabled="!bulkStart || !bulkEnd"
        @click="confirmBulkOffline"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import AgentAvatar from '@/components/ui/AgentAvatar.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Dialog from 'primevue/dialog'
import ContextMenu from 'primevue/contextmenu'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import AsignarLeadsModal from '@/components/leads/AsignarLeadsModal.vue'
import FiltrosAgentesPanel from '@/components/ui/FiltrosAgentesPanel.vue'
import type { FiltrosAgentesValue } from '@/components/ui/FiltrosAgentesPanel.vue'
import { mockAgentes } from '@/data/mock'
import { useAgentesOfflineStore } from '@/stores/agentesOffline'

const router = useRouter()
const offlineStore = useAgentesOfflineStore()
const tab = ref<'equipo' | 'ranking'>('equipo')

function goRanking() {
  router.push({ path: '/ventas', query: { tab: 'Ranking' } })
}

function goToAgente(e: { data: { id: string } }) {
  router.push(`/agentes/${e.data.id}`)
}

// ── Multi-select ──────────────────────────────────
let selectedIds = reactive(new Set<string>())

const allSelected = computed(() =>
  sortedAgentes.value.length > 0 &&
  sortedAgentes.value.every(a => selectedIds.has(a.id))
)

function toggleSelect(id: string) {
  if (selectedIds.has(id)) selectedIds.delete(id)
  else selectedIds.add(id)
}

function toggleSelectAll(val: boolean) {
  if (val) sortedAgentes.value.forEach(a => selectedIds.add(a.id))
  else selectedIds.clear()
}

// ── Disponibilidad (mock state) ───────────────────
const noDisponibles = reactive(new Set<string>())

function setBulkDisponible(disponible: boolean) {
  selectedIds.forEach(id => {
    if (disponible) noDisponibles.delete(id)
    else noDisponibles.add(id)
  })
  selectedIds.clear()
}

// ── Bulk Asignar leads ────────────────────────────
const showAsignacion = ref(false)
const bulkAsignarIds = ref<string[]>([])

function openBulkAsignar() {
  bulkAsignarIds.value = [...selectedIds]
  showAsignacion.value = true
}

// ── Context menu (right-click) ────────────────────
const cm = ref<InstanceType<typeof ContextMenu> | null>(null)

function onRowContextMenu(e: any) {
  // If the right-clicked row isn't in the selection, replace selection with just it
  if (!selectedIds.has(e.data.id)) {
    selectedIds.clear()
    selectedIds.add(e.data.id)
  }
  cm.value?.show(e.originalEvent)
}

const contextMenuItems = computed(() => [
  {
    label: 'Asignar leads',
    icon: 'pi pi-users',
    command: () => openBulkAsignar(),
  },
  {
    label: 'Marcar disponible',
    icon: 'pi pi-check-circle',
    command: () => setBulkDisponible(true),
  },
  {
    label: 'Marcar no disponible',
    icon: 'pi pi-ban',
    command: () => setBulkDisponible(false),
  },
  { separator: true },
  {
    label: 'Modo offline',
    icon: 'pi pi-power-off',
    command: () => { showBulkOffline.value = true },
  },
])

// ── Bulk Offline ──────────────────────────────────
const showBulkOffline = ref(false)
const bulkEventName   = ref('')
const bulkStart       = ref<Date | null>(null)
const bulkEnd         = ref<Date | null>(null)

function confirmBulkOffline() {
  if (!bulkStart.value || !bulkEnd.value) return
  selectedIds.forEach(id => {
    offlineStore.activarFeria({
      agenteId: id,
      eventName: bulkEventName.value || 'Evento offline',
      startDate: bulkStart.value!,
      endDate:   bulkEnd.value!,
      activatedBy: 'team_lead',
    })
  })
  showBulkOffline.value = false
  bulkEventName.value = ''
  bulkStart.value = null
  bulkEnd.value   = null
  selectedIds.clear()
}

function fmtDate(d: Date): string {
  return offlineStore.formatEndDate(d)
}

// ── Sorting ───────────────────────────────────────
const sortField = ref<string>('')
const sortOrder = ref<1 | -1>(1)

function onSort(e: any) {
  sortField.value = e.sortField
  sortOrder.value = e.sortOrder
}

// ── Filtros ───────────────────────────────────────
const showFiltros = ref(false)
const filtrosActivos = ref<FiltrosAgentesValue | null>(null)

function onFiltrosAplicados(f: FiltrosAgentesValue) {
  filtrosActivos.value = f
}

const agentesFiltrosBadge = computed(() => {
  const f = filtrosActivos.value; if (!f) return ''
  let c = 0
  if (f.paises.length) c++
  if (f.crMin !== null || f.crMax !== null) c++
  if (f.llamadasMin !== null || f.llamadasMax !== null) c++
  return c > 0 ? String(c) : ''
})

const sortedAgentes = computed(() => {
  let list = [...mockAgentes]
  const f = filtrosActivos.value
  if (f) {
    if (f.paises.length)
      list = list.filter(a => f.paises.includes((a as any).pais ?? ''))
    if (f.crMin !== null)
      list = list.filter(a => (a.cr ?? 0) >= f.crMin!)
    if (f.crMax !== null)
      list = list.filter(a => (a.cr ?? 0) <= f.crMax!)
    if (f.llamadasMin !== null)
      list = list.filter(a => (a.llamadasDia ?? 0) >= f.llamadasMin!)
    if (f.llamadasMax !== null)
      list = list.filter(a => (a.llamadasDia ?? 0) <= f.llamadasMax!)
  }
  if (!sortField.value) return list
  return list.sort((a, b) => {
    const av = (a as any)[sortField.value]
    const bv = (b as any)[sortField.value]
    if (av == null) return 1
    if (bv == null) return -1
    return typeof av === 'string'
      ? av.localeCompare(bv) * sortOrder.value
      : (av - bv) * sortOrder.value
  })
})
</script>

<style scoped>
.agentes-view  { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.agentes-header { display: flex; align-items: center; justify-content: space-between; }
.agentes-tabs   { display: flex; gap: 4px; }
.agentes-actions { display: flex; gap: 8px; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.table-card { display: flex; flex-direction: column; }

/* ── Bulk action bar ───────────────────────────── */
.bulk-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: #F0FDFA;
  border-radius: 8px; padding: 8px 12px; margin-bottom: 10px;
}
.bulk-count {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--n-700);
  white-space: nowrap;
}
.bulk-count i { font-size: 14px; }
.bulk-actions { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
.bulk-clear   { margin-left: auto; flex-shrink: 0; }

/* Transition */
.bulk-bar-enter-active, .bulk-bar-leave-active { transition: all 0.2s ease; }
.bulk-bar-enter-from, .bulk-bar-leave-to { opacity: 0; transform: translateY(-6px); }

/* ── Table ─────────────────────────────────────── */
.section-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.section-toolbar .spacer { flex: 1; }
.table-hint { font-size: 11px; color: var(--n-400); }

.agente-cell  { display: flex; align-items: center; gap: 8px; }
.agente-name  { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }

/* Presence dot on avatar */
.avatar-presence {
  position: relative;
  display: inline-flex;   /* wraps tightly around the avatar span */
  flex-shrink: 0;
}
.presence-dot {
  position: absolute;
  bottom: -1px; right: -1px; /* sits on the bottom-right edge, half-overlapping */
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--success);
  border: 1.5px solid #fff;
  box-sizing: border-box;
  pointer-events: none;
}
.presence-dot--offline { background: var(--warning); }
.presence-dot--away    { background: var(--n-400); }

:deep(.agentes-table .col-frozen-last) {
  border-right: 1px solid var(--n-200) !important;
}
:deep(.agentes-table .p-datatable-tbody > tr > td:not(:first-child):not(:last-child)) {
  text-align: right;
}
:deep(.agentes-table .p-datatable-thead > tr > th:not(:first-child):not(:last-child)) {
  text-align: right;
}
:deep(.agentes-table .p-datatable-tbody > tr) { cursor: pointer; }

/* ── Bulk offline modal ────────────────────────── */
.modal-header  { display: flex; align-items: flex-start; gap: 12px; }
.modal-icon-offline {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--n-100); color: var(--n-600);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

.bulk-offline-body { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }
.field      { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--n-600); }
.optional    { font-weight: 400; color: var(--n-400); }
.w-full      { width: 100%; }
.field-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.resumen-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--warning-bg); border: 1px solid #f0d080;
  border-radius: 8px; padding: 10px 12px;
  font-size: 12px; color: var(--warning); font-weight: 500;
}
</style>
