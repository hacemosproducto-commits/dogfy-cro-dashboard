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
      >
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

  <!-- Modal Asignar leads -->
  <AsignarLeadsModal v-model:visible="showAsignacion" />

  <!-- Panel filtros agentes -->
  <FiltrosAgentesPanel v-model:visible="showFiltros" @apply="onFiltrosAplicados" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AgentAvatar from '@/components/ui/AgentAvatar.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
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

const showAsignacion = ref(false)

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

</style>
