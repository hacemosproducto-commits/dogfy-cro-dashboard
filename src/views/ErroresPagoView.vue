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
        <Button label="Filtros" icon="pi pi-filter" severity="secondary" outlined size="small" />
      </div>

      <!-- Bulk actions — solo cuando hay selección -->
      <div v-if="selected.length" class="section-toolbar">
        <div class="bulk-actions">
          <span class="bulk-count">{{ selected.length }} seleccionados</span>
          <Button label="Marcar recuperable"    icon="pi pi-check-circle" severity="success"   size="small" @click="bulkUpdate('Recuperable')" />
          <Button label="Marcar perdido"        icon="pi pi-times-circle" severity="contrast"  size="small" @click="bulkUpdate('No recuperable')" />
          <Button label="Marcar gestionado"     icon="pi pi-check"        severity="secondary" outlined size="small" @click="bulkUpdate('Gestionado')" />
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
        <Column header="" headerStyle="width:28px" bodyStyle="width:28px; text-align:center">
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

        <!-- Fix — tooltip con solución -->
        <Column header="Fix" headerStyle="width:60px" bodyStyle="width:60px; text-align:center">
          <template #body="{ data }">
            <InfoTooltip>
              <button class="fix-btn" title="Ver solución">
                <i class="pi pi-info-circle" />
              </button>
              <template #content>
                <p class="itip-title">{{ data.motivoError }} <code class="itip-code">{{ data.codigoStripe }}</code></p>
                <hr class="itip-sep" />
                <p class="itip-row">{{ data.solucionResumen }}</p>
                <a :href="data.solucionDocUrl" target="_blank" rel="noopener" class="itip-link">Ver doc completa de Stripe →</a>
              </template>
            </InfoTooltip>
          </template>
        </Column>

        <!-- Agente — solo Team Lead y Manager -->
        <Column v-if="!isAgente" header="Agente" style="min-width:130px">
          <template #body="{ data }">
            <span class="agente-cell" :title="data.agente">
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import { mockErroresPago } from '@/data/mock'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isAgente = computed(() => auth.currentRole === 'agente')

const filtro = ref('Recuperable')
const erroresFiltrados = computed(() =>
  mockErroresPago.filter(e => e.estado === filtro.value)
)

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
.section-tabs-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.section-tabs { display: flex; gap: 4px; }

.section-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
.section-toolbar .spacer { flex: 1; }
.bulk-actions { display: flex; align-items: center; gap: 8px; padding: 4px 10px; background: var(--brand-subtle, #fdf1ed); border-radius: 8px; }
.bulk-count { font-size: 12px; font-weight: 600; color: var(--brand, #ef6948); margin-right: 4px; }

/* Punto de estado */
.status-dot {
  display: inline-block;
  width: 9px; height: 9px;
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

/* Fix button — trigger for InfoTooltip */
.fix-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: transparent; cursor: pointer;
  color: var(--n-400, #9ca3af); transition: color 0.15s, background 0.15s;
}
.fix-btn:hover { color: var(--brand, #ef6948); background: var(--brand-subtle, #fdf1ed); }
</style>
