<template>
  <div class="ventas-view">
    <!-- ── Tabs ── -->
    <div class="ventas-header">
      <div class="ventas-tabs">
        <button v-for="t in tabs" :key="t" class="tab-btn" :class="{ active: activeTab === t }" @click="activeTab = t">{{ t }}</button>
      </div>
    </div>

    <!-- ── KPIs ── -->
    <div class="kpi-row">
      <KpiCard :valor="String(kpis.hoy.valor)"    label="Ventas de hoy"        :comparativa="kpis.hoy.delta"    tendencia="up" />
      <KpiCard :valor="String(kpis.ayer.valor)"   label="Ventas de ayer"       :comparativa="kpis.ayer.delta"   tendencia="up" />
      <KpiCard :valor="String(kpis.semana.valor)" label="Ventas de la semana"  :comparativa="kpis.semana.delta" tendencia="up" />
      <!-- Última card: agente → "Para comisión"; TL/Manager → "Ventas del mes" con progreso -->
      <KpiCard
        v-if="kpisAgenteMode"
        :valor="String(kpis.comision.valor)"
        label="Para comisión"
        :comparativa="kpis.comision.delta"
        tendencia="up"
      />
      <KpiCard
        v-else
        :valor="`${kpis.mes.valor}/${kpis.mes.objetivo}`"
        label="Ventas del mes"
        :progreso="kpis.mes.valor"
        :objetivo="kpis.mes.objetivo"
      />
    </div>

    <!-- ── Tabla principal ── -->
    <SectionCard>
      <div class="section-toolbar">
        <span class="spacer" />
        <FiltrosChips v-model="filtrosActivos" />
        <Button
          label="Filtros"
          icon="pi pi-filter"
          severity="secondary"
          :outlined="!ventasFiltrosBadge"
          size="small"
          :badge="ventasFiltrosBadge || undefined"
          @click="showFiltros = true"
        />
      </div>

      <DataTable :value="displayed" stripedRows @row-click="goToVenta">
        <Column field="fecha"    header="Fecha"     sortable style="min-width:140px" />
        <Column v-if="showAgenteCol" header="Agente" style="min-width:90px">
          <template #body="{ data }">
            <span class="agente-cell" v-tooltip.top="data.agente">
              <span class="agente-avatar"><i class="pi pi-user" /></span>
              <span class="agente-iniciales">{{ data.agenteIni }}</span>
            </span>
          </template>
        </Column>
        <Column field="telefono" header="Teléfono"  style="min-width:120px" />
        <Column field="email"    header="Email"     style="min-width:240px" />
        <Column field="cupon"    header="Cupón"     style="min-width:120px" />
        <Column field="importe"  header="Importe"   sortable style="min-width:90px" />
      </DataTable>

      <div ref="sentinel" class="infinite-sentinel">
        <span v-if="hasMore" class="infinite-loading">Cargando más ventas…</span>
      </div>
    </SectionCard>

  </div>

  <FiltrosPanel v-model:visible="showFiltros" modo="ventas" @apply="onFiltrosAplicados" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { mockVentas, mockKpisVentasAgente, mockKpisVentasTL } from '@/data/mock'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import FiltrosPanel from '@/components/ui/FiltrosPanel.vue'
import FiltrosChips from '@/components/ui/FiltrosChips.vue'
import type { FiltrosValue } from '@/components/ui/FiltrosPanel.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const role = computed(() => auth.currentRole)

function goToVenta(event: { data: { id: string } }) {
  router.push(`/ventas/${event.data.id}`)
}

// Tabs por rol — agente no tiene tabs; TL/Manager: Personal/Mi equipo
const tabs = computed<string[]>(() =>
  role.value === 'agente' ? [] : ['Personal', 'Mi equipo']
)
const activeTab = ref('Personal')
watch(role, () => { activeTab.value = 'Personal' })
onMounted(() => {
  const t = route.query.tab as string
  if (t && tabs.value.includes(t)) activeTab.value = t
})

// KPIs según rol/tab
const kpisAgenteMode = computed(() => role.value === 'agente' || activeTab.value === 'Personal')
const kpis = computed<any>(() => kpisAgenteMode.value ? mockKpisVentasAgente : mockKpisVentasTL)

// Columna agente solo en Mi equipo (TL/Manager)
const showAgenteCol = computed(() => role.value !== 'agente' && activeTab.value === 'Mi equipo')

// Filtros panel
const showFiltros = ref(false)
const filtrosActivos = ref<FiltrosValue | null>(null)
function onFiltrosAplicados(f: FiltrosValue) { filtrosActivos.value = f }

const ventasFiltrosBadge = computed(() => {
  const f = filtrosActivos.value; if (!f) return ''
  let c = 0
  if (f.fechaDesde || f.fechaHasta) c++
  return c > 0 ? String(c) : ''
})

// Filtra ventas (Personal: las mías; Mi equipo: todas)
// V1: solo filtro por periodo de tiempo (mock data no tiene Date reales, se aplica visualmente)
const filtered = computed(() => {
  const list = activeTab.value === 'Personal' ? mockVentas.slice(0, 30) : mockVentas
  return list
})
const { displayed, sentinel, hasMore } = useInfiniteScroll(filtered, 20)
</script>

<style scoped>
.ventas-view { display: flex; flex-direction: column; gap: 16px; }
.ventas-header { display: flex; align-items: center; }
.ventas-tabs { display: flex; gap: 4px; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.section-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
.section-toolbar .spacer { flex: 1; }

.agente-cell { display: inline-flex; align-items: center; gap: 8px; cursor: default; }
.agente-avatar {
  width: 26px; height: 26px; border-radius: 50%; background: #e6eaf2; color: #6b7280;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.agente-avatar .pi { font-size: 13px; }
.agente-iniciales { font-size: 12px; font-weight: 600; color: var(--n-700, #333); }

.infinite-sentinel { height: 32px; display: flex; align-items: center; justify-content: center; }
.infinite-loading { font-size: 12px; color: var(--n-400); }

/* ── Ranking por país ── */
.ranking-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; }
.ranking-col { display: flex; flex-direction: column; gap: 8px; min-width: 0; padding: 0 16px; }
.ranking-col:first-child { padding-left: 0; }
.ranking-col:last-child  { padding-right: 0; }
.ranking-col + .ranking-col { border-left: 1px solid var(--n-150, #ebedf2); }
.ranking-col-header { display: flex; align-items: center; justify-content: space-between; padding: 4px 4px; }
.ranking-pais { font-size: 14px; font-weight: 600; color: var(--n-800, #2d2d2f); }
.ranking-total { font-size: 14px; font-weight: 700; color: var(--n-800, #2d2d2f); }
.ranking-table { display: flex; flex-direction: column; }
/* Nombre toma todo el espacio disponible; HOY y MES con ancho ajustado al contenido */
.ranking-row { display: grid; grid-template-columns: 1fr 36px 40px; gap: 4px; padding: 6px 4px; font-size: 12px; border-bottom: 1px solid var(--n-100, #f3f4f7); }
.ranking-row--head { color: var(--n-500, #6b7280); font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.04em; }
.ranking-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ranking-cell--name { color: var(--n-700, #2b2b2b); }
/* Columnas numéricas alineadas a la derecha */
.ranking-cell:not(.ranking-cell--name) { text-align: right; }

@media (max-width: 1100px) {
  .kpi-row     { grid-template-columns: repeat(2, 1fr); }
  .ranking-grid { grid-template-columns: repeat(2, 1fr); gap: 0; }

  /* Quita bordes horizontales entre pares y añade separador de fila */
  .ranking-col { padding: 16px 12px; }
  .ranking-col:first-child { padding-left: 12px; }
  .ranking-col:last-child  { padding-right: 12px; }

  /* Bordes: derecha a los pares impares, inferior entre las dos filas */
  .ranking-col:nth-child(odd)  { border-left: none; border-right: 1px solid var(--n-150); }
  .ranking-col:nth-child(even) { border-left: none; }
  .ranking-col:nth-child(1),
  .ranking-col:nth-child(2)    { border-bottom: 1px solid var(--n-200); padding-bottom: 20px; }
  .ranking-col:nth-child(3),
  .ranking-col:nth-child(4)    { padding-top: 20px; border-bottom: none; }
}
</style>
