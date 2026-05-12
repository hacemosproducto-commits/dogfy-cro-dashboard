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
    <SectionCard v-if="tab === 'equipo'">
      <div class="section-toolbar">
        <span class="table-hint">Scroll horizontal para ver todas las métricas</span>
        <span class="spacer" />
        <Button label="Filtros" icon="pi pi-filter" severity="secondary" outlined size="small" />
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
        <Column field="nombre" header="Agente" frozen style="min-width:180px" sortable>
          <template #body="{ data }">
            <div class="agente-cell">
              <AgentAvatar :nombre="data.nombre" :ini="data.ini" size="sm" />
              <span class="agente-name">{{ data.nombre }}</span>
            </div>
          </template>
        </Column>
        <Column field="total" header="Total" frozen sortable style="min-width:80px; text-align:right" />
        <Column field="cr" header="CR %" frozen sortable class="col-frozen-last" style="min-width:72px; text-align:right">
          <template #body="{ data }">{{ data.cr }}%</template>
        </Column>

        <!-- ── Columnas con scroll ── -->
        <Column field="llamadasDia"  header="Llamadas/día"      sortable style="min-width:110px; text-align:right" />
        <Column field="tiempoLlamada" header="Tiempo llamada"   sortable style="min-width:120px" />
        <Column field="fresh"        header="Fresh"             sortable style="min-width:72px; text-align:right" />
        <Column field="freshCr"      header="Fresh CR"          sortable style="min-width:80px; text-align:right">
          <template #body="{ data }">{{ data.freshCr }}%</template>
        </Column>
        <Column field="recuperados"  header="Recuperados"       sortable style="min-width:110px; text-align:right" />
        <Column field="recuperadosCr" header="Recup. CR"        sortable style="min-width:90px; text-align:right">
          <template #body="{ data }">{{ data.recuperadosCr }}%</template>
        </Column>
        <Column field="pausados"     header="Pausados"          sortable style="min-width:90px; text-align:right" />
        <Column field="pausadosCr"   header="Pausados CR"       sortable style="min-width:100px; text-align:right">
          <template #body="{ data }">{{ data.pausadosCr }}%</template>
        </Column>
        <Column field="noGestionados" header="No gestionados"   sortable style="min-width:130px; text-align:right" />
        <Column field="noContesta1"  header="No contesta (&lt;5)" sortable style="min-width:140px; text-align:right" />
        <Column field="noContesta2"  header="No contesta (&gt;5)" sortable style="min-width:140px; text-align:right" />
        <Column field="enCita"       header="En cita"           sortable style="min-width:80px; text-align:right" />
        <Column field="formulario"   header="Formulario"        sortable style="min-width:100px; text-align:right" />

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
  <Dialog v-model:visible="showAsignacion" header="Asignación de leads" modal dismissableMask style="width:540px">
    <div class="asig-modal">

      <!-- Tipo selector -->
      <div class="asig-tabs-wrap">
        <SelectButton v-model="tipoAsig" :options="tipoOptions" optionLabel="label" optionValue="value" />
      </div>

      <!-- Info line -->
      <p class="asig-info">
        Leads <strong>{{ tipoAsig }}</strong> disponibles:
        <strong>{{ tipoAsig === 'No contesta' ? '456' : '3.085' }}</strong>
      </p>

      <!-- Cantidad por agente -->
      <div class="asig-cantidad-row">
        <span class="asig-cantidad-label">Cantidad por agente</span>
        <InputNumber v-model="cantidadPorAgente" showButtons buttonLayout="horizontal" :min="1" :inputStyle="{ width: '56px', textAlign: 'center' }" />
      </div>

      <!-- Agentes -->
      <div class="asig-agentes-section">
        <p class="asig-agentes-label">Agentes</p>
        <div class="asig-agentes-box">
          <div class="asig-agentes-grid">
            <div class="asig-col">
              <label class="asig-check-row">
                <Checkbox :modelValue="allSelected" :binary="true" @update:modelValue="toggleAll" />
                <span class="asig-agent-name">Seleccionar todos</span>
              </label>
              <label class="asig-check-row" v-for="a in leftCol" :key="a.id">
                <Checkbox v-model="selectedAgentes" :value="a.id" />
                <span class="asig-agent-name">{{ a.nombre }}</span>
              </label>
            </div>
            <div class="asig-col">
              <label class="asig-check-row" v-for="a in rightCol" :key="a.id">
                <Checkbox v-model="selectedAgentes" :value="a.id" />
                <span class="asig-agent-name">{{ a.nombre }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined style="flex:1" @click="showAsignacion = false" />
      <Button label="Asignar" style="flex:1" @click="showAsignacion = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AgentAvatar from '@/components/ui/AgentAvatar.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { mockAgentes } from '@/data/mock'

const router = useRouter()
const tab = ref<'equipo' | 'ranking'>('equipo')

function goRanking() {
  router.push({ path: '/ventas', query: { tab: 'Ranking' } })
}

function goToAgente(e: { data: { id: string } }) {
  router.push(`/agentes/${e.data.id}`)
}

// Sorting manual para poder combinar con columnas frozen
const sortField = ref<string>('')
const sortOrder = ref<1 | -1>(1)

function onSort(e: any) {
  sortField.value = e.sortField
  sortOrder.value = e.sortOrder
}

const sortedAgentes = computed(() => {
  if (!sortField.value) return mockAgentes
  return [...mockAgentes].sort((a, b) => {
    const av = (a as any)[sortField.value]
    const bv = (b as any)[sortField.value]
    if (av == null) return 1
    if (bv == null) return -1
    return typeof av === 'string'
      ? av.localeCompare(bv) * sortOrder.value
      : (av - bv) * sortOrder.value
  })
})

const tipoOptions = [
  { label: 'No contesta  [456]',    value: 'No contesta'    },
  { label: 'No gestionado  [3.085]', value: 'No gestionados' },
]
const showAsignacion = ref(false)
const tipoAsig = ref('No contesta')
const selectedAgentes = ref<string[]>([])
const cantidadPorAgente = ref(10)

const half = Math.ceil(mockAgentes.length / 2)
const leftCol = mockAgentes.slice(0, half)
const rightCol = mockAgentes.slice(half)

const allSelected = computed(() => selectedAgentes.value.length === mockAgentes.length)
function toggleAll(val: boolean) { selectedAgentes.value = val ? mockAgentes.map(a => a.id) : [] }
</script>

<style scoped>
.agentes-view { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.agentes-header { display: flex; align-items: center; justify-content: space-between; }
.agentes-tabs { display: flex; gap: 4px; }
.agentes-actions { display: flex; gap: 8px; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

.section-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.section-toolbar .spacer { flex: 1; }
.table-hint { font-size: 11px; color: var(--n-400, #9ca3af); }

/* Celda agente */
.agente-cell { display: flex; align-items: center; gap: 8px; }
.agente-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }

/* Separador entre columnas fijas y scrolleables */
:deep(.agentes-table .col-frozen-last) {
  border-right: 2px solid var(--n-200, #e5e7eb) !important;
}

/* Alinear celdas numéricas a la derecha */
:deep(.agentes-table .p-datatable-tbody > tr > td:not(:first-child):not(:last-child)) {
  text-align: right;
}
:deep(.agentes-table .p-datatable-thead > tr > th:not(:first-child):not(:last-child)) {
  text-align: right;
}

/* Cursor pointer en filas */
:deep(.agentes-table .p-datatable-tbody > tr) { cursor: pointer; }

/* ─── Modal Asignación ─────────────────────────── */
.asig-modal { display: flex; flex-direction: column; gap: 16px; }

.asig-tabs-wrap { display: flex; justify-content: center; }
.asig-info { font-size: 14px; color: var(--n-700); }
.asig-cantidad-row { display: flex; align-items: center; gap: 16px; }
.asig-cantidad-label { font-size: 14px; color: var(--n-700); }

.asig-agentes-section { display: flex; flex-direction: column; gap: 8px; }
.asig-agentes-label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.asig-agentes-box { border: 1px solid var(--n-200); border-radius: 8px; padding: 16px; }
.asig-agentes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.asig-col { display: flex; flex-direction: column; gap: 12px; }
.asig-check-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.asig-agent-name { font-size: 13px; color: var(--n-700); }
</style>
