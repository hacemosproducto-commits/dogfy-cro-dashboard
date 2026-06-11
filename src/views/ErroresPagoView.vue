<template>
  <div class="errores-view">
    <div class="errores-header">
      <h2 class="view-title">Errores de pago</h2>
    </div>

    <div class="kpi-row">
      <KpiCard valor="12" label="Recuperables hoy"    comparativa="+8% vs ayer"   tendencia="up" />
      <KpiCard valor="8"  label="Perdidos hoy"        comparativa="+8% vs ayer"   tendencia="up" />
      <KpiCard valor="45" label="Total esta semana"   comparativa="+8% vs semana pasada" tendencia="up" />
      <KpiCard valor="3"  label="Gestionados hoy"     comparativa="+8% vs ayer"   tendencia="up" />
    </div>

    <SectionCard>
      <!-- Tabs + Filtros en la misma fila -->
      <div class="section-tabs-row">
        <div class="section-tabs">
          <button class="tab-btn" :class="{ active: filtro === 'Recuperable' }"    @click="filtro = 'Recuperable'">Recuperables</button>
          <button class="tab-btn" :class="{ active: filtro === 'No recuperable' }" @click="filtro = 'No recuperable'">Perdidos</button>
          <button class="tab-btn" :class="{ active: filtro === 'Gestionado' }"     @click="filtro = 'Gestionado'">Gestionados</button>
        </div>
        <span class="spacer" />
        <FiltrosChips v-model="filtrosActivos" />
        <Button
          label="Filtros"
          icon="pi pi-filter"
          severity="secondary"
          :outlined="!erroresFiltrosBadge"
          size="small"
          :badge="erroresFiltrosBadge || undefined"
          @click="showFiltros = true"
        />
      </div>

      <!-- Bulk actions — solo cuando hay selección -->
      <div v-if="selected.length" class="bulk-bar">
        <span class="bulk-count">
          <i class="pi pi-check-square" />
          {{ selected.length }} {{ selected.length === 1 ? 'error' : 'errores' }} seleccionados
        </span>
        <div class="bulk-actions">
          <Button label="Marcar recuperable" icon="pi pi-check-circle" size="small" outlined @click="bulkUpdate('Recuperable')" />
          <Button label="Marcar perdido"     icon="pi pi-times-circle" size="small" outlined @click="bulkUpdate('No recuperable')" />
          <Button label="Marcar gestionado"  icon="pi pi-check"        size="small" outlined @click="bulkUpdate('Gestionado')" />
        </div>
      </div>

      <DataTable
        :value="displayed"
        :selection="selected"
        @update:selection="selected = $event"
        data-key="id"
        stripedRows
      >
        <!-- Checkbox -->
        <Column selectionMode="multiple" headerStyle="width:38px" bodyStyle="width:38px" />

        <!-- Punto de estado: color según tab activo -->
        <Column header="" headerStyle="width:18px; padding:0" bodyStyle="width:18px; padding:0 0 0 4px; text-align:left">
          <template #body>
            <span class="status-dot" :class="dotClass" />
          </template>
        </Column>

        <!-- Último intento -->
        <Column field="ultimoIntento" header="Último intento" sortable style="min-width:140px" />

        <!-- Fecha de fallo -->
        <Column field="fechaFallo" header="Fecha de fallo" sortable style="min-width:120px" />

        <!-- Teléfono -->
        <Column field="telefono" header="Teléfono" style="min-width:130px" />

        <!-- Email -->
        <Column field="email" header="Email" style="min-width:180px">
          <template #body="{ data }">
            <span class="email-cell" :title="data.email">{{ data.email }}</span>
          </template>
        </Column>

        <!-- Forma de pago -->
        <Column field="forma" header="Forma" style="min-width:100px" />

        <!-- Código Stripe -->
        <Column field="codigoStripe" header="Código" sortable style="min-width:150px">
          <template #body="{ data }">
            <code class="stripe-code">{{ data.codigoStripe }}</code>
          </template>
        </Column>

        <!-- Agente — solo Team Lead y Manager -->
        <Column v-if="!isAgente" header="Agente" style="min-width:130px">
          <template #body="{ data }">
            <span class="agente-cell">
              <span class="agente-avatar"><i class="pi pi-user" /></span>
              <span class="agente-name">{{ data.agente }}</span>
            </span>
          </template>
        </Column>
      </DataTable>

      <div ref="sentinel" class="infinite-sentinel">
        <span v-if="hasMore" class="infinite-loading">Cargando más errores…</span>
      </div>
    </SectionCard>
  </div>

  <FiltrosPanel v-model:visible="showFiltros" modo="errores" @apply="onFiltrosAplicados" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { mockErroresPago } from '@/data/mock'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import FiltrosPanel from '@/components/ui/FiltrosPanel.vue'
import FiltrosChips from '@/components/ui/FiltrosChips.vue'
import type { FiltrosValue } from '@/components/ui/FiltrosPanel.vue'

const auth = useAuthStore()
const isAgente = computed(() => auth.currentRole === 'agente')

const filtro = ref('Recuperable')

// Panel filtros
const showFiltros = ref(false)
const filtrosActivos = ref<FiltrosValue | null>(null)
function onFiltrosAplicados(f: FiltrosValue) { filtrosActivos.value = f }

const erroresFiltrosBadge = computed(() => {
  const f = filtrosActivos.value; if (!f) return ''
  let c = 0
  if (f.tiposError.length) c++; if (f.formaPago) c++; if (f.fechaDesde || f.fechaHasta) c++
  return c > 0 ? String(c) : ''
})

const erroresFiltrados = computed(() => {
  let list = mockErroresPago.filter(e => e.estado === filtro.value)
  const f = filtrosActivos.value
  if (f) {
    if (f.tiposError.length) list = list.filter(e => f.tiposError.includes(e.tipo))
    if (f.formaPago)         list = list.filter(e => e.forma === f.formaPago)
  }
  return list
})

const dotClass = computed(() => {
  if (filtro.value === 'Recuperable')    return 'dot-red'
  if (filtro.value === 'No recuperable') return 'dot-gray'
  return 'dot-green'
})

const { displayed, sentinel, hasMore } = useInfiniteScroll(erroresFiltrados, 20)

const selected = ref<typeof mockErroresPago>([])

function bulkUpdate(nuevoEstado: string) {
  selected.value.forEach(item => { (item as any).estado = nuevoEstado })
  selected.value = []
}

</script>

<style scoped>
.errores-view { display: flex; flex-direction: column; gap: 16px; }
.errores-header { display: flex; align-items: center; }
.view-title { font-size: 20px; font-weight: 700; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }

/* Tabs + filtros en la misma fila */
.section-tabs-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.section-tabs-row .spacer { flex: 1; }
.section-tabs { display: flex; gap: 4px; }

.bulk-bar {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: #F0FDFA;
  border-radius: 8px; padding: 8px 12px; margin-bottom: 8px;
}
.bulk-count {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--n-700);
  white-space: nowrap;
}
.bulk-count i { font-size: 14px; }
.bulk-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; flex: 1; }

/* Punto de estado */
.status-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-green { background: #22c55e; }
.dot-red   { background: #ef4444; }
.dot-gray  { background: var(--n-300, #d1d5db); }

.stripe-code {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  font-size: 11px; padding: 2px 6px; border-radius: 4px;
  background: var(--n-100, #f3f4f7); color: var(--n-700, #2b2b2b);
}

.email-cell {
  font-size: 12px; color: var(--n-500, #6b7280);
  max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;
}

.agente-cell { display: inline-flex; align-items: center; gap: 8px; }
.agente-avatar {
  width: 26px; height: 26px; border-radius: 50%; background: #e6eaf2; color: #6b7280;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.agente-avatar .pi { font-size: 13px; }
.agente-name { font-size: 12px; font-weight: 500; color: var(--n-700, #333); }

.infinite-sentinel { height: 32px; display: flex; align-items: center; justify-content: center; }
.infinite-loading { font-size: 12px; color: var(--n-400); }

</style>
