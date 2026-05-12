<template>
  <div class="tl-root">
    <!-- Tabs + country — siempre visibles -->
    <div class="tl-topbar">
      <div class="tl-tabs">
        <button v-for="t in tabs" :key="t" class="tab-btn" :class="{ active: activeTab === t }" @click="activeTab = t">{{ t }}</button>
      </div>
      <Select v-if="activeTab === 'Mi equipo'" v-model="pais" :options="paises" />
    </div>

    <!-- Tab Personal → mismo dashboard que el agente -->
    <DashboardAgente v-if="activeTab === 'Personal'" />

    <!-- Tab Mi equipo → vista de equipo -->
    <div v-else class="dash-content">

    <!-- KPIs -->
    <div class="kpi-row">
      <KpiCard valor="122"   label="Ventas de hoy"       comparativa="+8% vs ayer"  tendencia="up" />
      <KpiCard valor="3045"  label="Ventas del mes"       :progreso="30" :objetivo="160" />
      <KpiCard valor="24/80" label="Agentes disponibles" />
      <KpiCard valor="3%"    label="CR sobre frescos"     comparativa="+2% media país" tendencia="up" />
    </div>

    <!-- Bolsa de leads + Resumen agente -->
    <div class="dash-row-2">
      <SectionCard title="Bolsa de leads" class="bolsa-card">
        <div class="bolsa-inner">
          <div class="bolsa-donut">
            <Chart type="doughnut" :data="bolsaDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="bolsa-center"><strong>4.599</strong><small>leads</small></div>
          </div>
          <div class="bolsa-list">
            <div class="bolsa-row" v-for="item in bolsaItems" :key="item.label">
              <div class="bl-header">
                <span class="bl-dot" :style="{ background: item.color }" />
                <span class="bl-label">{{ item.label }}</span>
                <Button v-if="item.asignar" label="Asignar" icon="pi pi-plus" size="small" outlined @click="openAsignacion(item.label)" class="bl-asignar" />
                <span class="bl-count">{{ item.count.toLocaleString() }}</span>
                <span class="bl-trend" :class="item.trendUp ? 'bl-trend--up' : 'bl-trend--down'">{{ item.trend }}</span>
              </div>
              <div class="bl-bar-track">
                <div class="bl-bar-fill" :style="{ width: item.pct + '%', background: item.color }" />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard class="resumen-agente-card">
        <Select v-model="agenteSeleccionado" :options="agentesOpts" placeholder="Seleccionar agente del equipo" style="width:100%;margin-bottom:12px" />
        <div class="am-list">
          <div class="am-row" v-for="m in agenteMetrics" :key="m.label">
            <span class="am-label">{{ m.label }}</span>
            <span class="am-val">{{ m.val }}</span>
            <i class="pi pi-chevron-right" style="font-size:10px;color:var(--n-300)" />
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Actividad + Ventas tipo -->
    <div class="dash-row-3">
      <SectionCard title="Actividad del día" class="actividad-card">
        <div class="act-row" v-for="item in actividadItems" :key="item.label">
          <span class="act-label">{{ item.label }}</span>
          <span class="act-val">{{ item.val }}</span>
        </div>
      </SectionCard>

      <SectionCard title="Ventas por tipo" class="ventas-tipo-card">
        <div class="ventas-tipo-inner">
          <div class="ventas-tipo-list">
            <div class="vt-row" v-for="vt in ventasTipoItems" :key="vt.label">
              <span class="vt-dot" :style="{ background: vt.color }" />
              <span class="vt-label">{{ vt.label }}</span>
              <span class="vt-val">{{ vt.val }}</span>
            </div>
            <div class="vt-divider" />
            <div class="vt-row vt-total"><span class="vt-label">Ventas totales</span><span class="vt-val">33</span></div>
          </div>
          <div class="ventas-donut-wrap">
            <Chart type="doughnut" :data="ventasDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="donut-center">30<br><small>ventas</small></div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Equipo barras + Top ventas -->
    <div class="dash-row-4">
      <SectionCard title="Tu equipo" class="equipo-chart-card">
        <template #header>
          <Select v-model="periodoEquipo" :options="['Día','Semana','Mes']" style="font-size:12px" />
        </template>
        <Chart type="bar" :data="equipoBarData" :options="barOpts" style="height:190px" />
      </SectionCard>
      <SectionCard title="Top ventas" class="top-ventas-card">
        <div class="tv-row" v-for="a in mockAgentes.slice(0, 5)" :key="a.id">
          <AgentAvatar :nombre="a.nombre" :ini="a.ini" size="sm" />
          <span class="tv-name">{{ a.nombre }}</span>
          <span class="tv-stat">{{ a.total }} · {{ a.cr }}% cr</span>
        </div>
      </SectionCard>
    </div>

    <!-- Histórico -->
    <SectionCard title="Overview de ventas" class="historico-card">
      <template #header>
        <Select v-model="periodoHistorico" :options="['Anual','Mensual','Semanal']" style="font-size:12px" />
      </template>
      <Chart type="line" :data="lineData" :options="lineOpts" style="height:220px" />
    </SectionCard>

    </div><!-- end Mi equipo dash-content -->
  </div><!-- end tl-root -->

  <!-- Modal Asignación -->
  <Dialog v-model:visible="showAsignacion" header="Asignación de leads" modal dismissableMask style="width:540px">
    <div class="asig-modal">

      <!-- Tipo selector -->
      <div class="asig-tabs-wrap">
        <SelectButton v-model="tipoAsignacion" :options="tipoOptions" optionLabel="label" optionValue="value" />
      </div>

      <!-- Info line -->
      <p class="asig-info">
        Leads <strong>{{ tipoAsignacion }}</strong> disponibles:
        <strong>{{ tipoAsignacion === 'No contesta' ? '456' : '3.085' }}</strong>
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
import Chart from 'primevue/chart'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import AgentAvatar from '@/components/ui/AgentAvatar.vue'
import DashboardAgente from '@/components/dashboard/DashboardAgente.vue'
import { mockAgentes, mockHistoricoVentas, mockEquipoBarras } from '@/data/mock'
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR, createMetaPattern } from '@/theme/palette'

const activeTab = ref('Mi equipo')
const tabs = ['Personal', 'Mi equipo']
const pais = ref('España')
const paises = ['España', 'Francia', 'Italia', 'Alemania']
const agenteSeleccionado = ref(null)
const agentesOpts = mockAgentes.map(a => a.nombre)
const periodoEquipo = ref('Día')
const periodoHistorico = ref('Anual')
const tipoOptions = [
  { label: 'No contesta  [456]',     value: 'No contesta'   },
  { label: 'No gestionado  [3.085]', value: 'No gestionado' },
]
const showAsignacion = ref(false)
const tipoAsignacion = ref('No contesta')
const selectedAgentes = ref<string[]>([])
const cantidadPorAgente = ref(10)

const half = Math.ceil(mockAgentes.length / 2)
const leftCol = mockAgentes.slice(0, half)
const rightCol = mockAgentes.slice(half)

const allSelected = computed(() => selectedAgentes.value.length === mockAgentes.length)
function toggleAll(val: boolean) { selectedAgentes.value = val ? mockAgentes.map(a => a.id) : [] }

function openAsignacion(tipo: string) {
  tipoAsignacion.value = tipo === 'No gestionados' ? 'No gestionado' : tipo
  showAsignacion.value = true
}

const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '74%' }

const bolsaDonut = {
  labels: ['No gestionados', 'No contesta', 'Frescos'],
  datasets: [{ data: [3085, 456, 985], backgroundColor: CHART_COLORS.slice(0, 3), borderWidth: 0, hoverOffset: 2 }]
}

const bolsaTotal = 3085 + 456 + 985
const bolsaItems = [
  { label: 'No gestionados', count: 3085, color: CHART_COLORS[0], asignar: true,  pct: Math.round(3085 / bolsaTotal * 100), trend: '↑ +12%', trendUp: true  },
  { label: 'No contesta',    count: 456,  color: CHART_COLORS[1], asignar: true,  pct: Math.round(456  / bolsaTotal * 100), trend: '↓ -5%',  trendUp: false },
  { label: 'Frescos',        count: 985,  color: CHART_COLORS[2], asignar: false, pct: Math.round(985  / bolsaTotal * 100), trend: '↑ +8%',  trendUp: true  },
]

const agenteMetrics = [
  { label: 'Pendientes',   val: 45 }, { label: 'No contesta', val: 453 },
  { label: 'Cita',         val: 203 }, { label: 'Formulario',  val: 507 },
  { label: 'Ventas día',   val: 12 },  { label: 'Ventas mes',  val: 45 },
]

const actividadItems = [
  { label: 'Llamadas realizadas', val: '33' },
  { label: 'Tiempo total',        val: '3h 43m 21s' },
  { label: 'Tiempo medio',        val: '12m 14s' },
  { label: 'PUCR equipo',         val: '5m 19s' },
]

const ventasTipoItems = [
  { label: 'Frescos (×1)',       val: 10, color: CHART_COLORS[0] },
  { label: 'Recuperados (×1.5)', val: 10, color: CHART_COLORS[1] },
  { label: 'Pausados (×1.5)',    val: 10, color: CHART_COLORS[2] },
]

const ventasDonut = {
  datasets: [{ data: [10, 10, 10], backgroundColor: CHART_COLORS.slice(0, 3), borderWidth: 0, hoverOffset: 2 }]
}

const equipoBarData = {
  labels: mockEquipoBarras.labels,
  datasets: [
    { label: 'Ventas', data: mockEquipoBarras.ventas, backgroundColor: CHART_COLORS[0], borderRadius: 4, borderSkipped: false },
    { label: 'Meta',   data: mockEquipoBarras.meta,   backgroundColor: createMetaPattern('white', '#BFDBFE'), borderWidth: 0, borderRadius: 4, borderSkipped: false },
  ]
}
const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, align: 'end' as const, labels: { boxWidth: 20, boxHeight: 2, font: { size: 11 }, color: '#767676', padding: 16 } } },
  scales: {
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#a0a0a0' }, border: { display: false }, max: 25000 },
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#a0a0a0', maxRotation: 30 } }
  }
}

const lineData = {
  labels: mockHistoricoVentas.labels,
  datasets: [
    { label: 'Este mes', data: mockHistoricoVentas.esteAno, borderColor: CHART_COLORS[0], backgroundColor: CHART_AREA_FILL, fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Mes ant.', data: mockHistoricoVentas.anoAnterior, borderColor: CHART_PREV_COLOR, borderDash: [4, 3], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 }
  ]
}
const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, align: 'end' as const, labels: { boxWidth: 20, boxHeight: 2, font: { size: 11 }, color: '#767676', padding: 16 } } },
  scales: {
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#a0a0a0' }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#a0a0a0' } }
  }
}
</script>

<style scoped>
.tl-root { display: flex; flex-direction: column; gap: 12px; }
.dash-content { display: flex; flex-direction: column; gap: 12px; }

.tl-topbar { display: flex; align-items: center; justify-content: space-between; }
.tl-tabs { display: flex; gap: 4px; }
.tab-btn { background: none; border: none; padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--n-500); transition: background .12s, color .12s; }
.tab-btn:hover { background: var(--n-100); color: var(--n-700); }
.tab-btn.active { background: var(--brand-subtle); color: var(--brand); font-weight: 600; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.dash-row-2 { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }
.dash-row-3 { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; }
.dash-row-4 { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }

/* Bolsa */
.bolsa-inner { display: flex; gap: 32px; align-items: center; }
.bolsa-donut {
  position: relative;
  flex-shrink: 0;
  align-self: stretch;
  aspect-ratio: 1;
  min-width: 110px;
  max-width: 180px;
  display: flex; align-items: center; justify-content: center;
}
.bolsa-donut :deep(.p-chart) { width: 100% !important; height: 100% !important; }
.bolsa-center { position: absolute; text-align: center; font-size: 20px; font-weight: 700; color: var(--n-800); line-height: 1.2; pointer-events: none; }
.bolsa-center small { font-size: 12px; font-weight: 400; color: var(--n-400); display: block; }
.bolsa-list { flex: 1; display: flex; flex-direction: column; }
.bolsa-row { display: flex; flex-direction: column; gap: 6px; padding: 10px 0; }
.bolsa-row:first-child { padding-top: 0; }
.bolsa-row:last-child { padding-bottom: 0; }
.bl-header { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.bl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bl-label { flex: 1; color: var(--n-600); }
.bl-asignar { font-size: 11px !important; padding: 2px 8px !important; flex-shrink: 0; }
.bl-count { font-weight: 600; color: var(--n-800); }
.bl-trend { font-size: 11px; font-weight: 500; }
.bl-trend--up   { color: var(--success, #22c55e); }
.bl-trend--down { color: var(--error,   #ef4444); }
.bl-bar-track { height: 4px; border-radius: 99px; background: var(--n-100); overflow: hidden; }
.bl-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }

/* Resumen agente */
.am-list { display: flex; flex-direction: column; gap: 0; }
.am-row { display: flex; align-items: center; font-size: 12px; padding: 6px 0; border-bottom: 1px solid var(--n-100); cursor: pointer; gap: 4px; }
.am-row:last-child { border-bottom: none; }
.am-label { flex: 1; color: var(--n-500); }
.am-val { font-weight: 600; color: var(--n-800); }

/* Actividad */
.act-row { display: flex; justify-content: space-between; font-size: 12px; padding: 7px 0; border-bottom: 1px solid var(--n-100); }
.act-row:last-child { border-bottom: none; }
.act-label { color: var(--n-500); }
.act-val { font-weight: 600; color: var(--n-800); }

/* Ventas tipo */
.ventas-tipo-inner { display: flex; align-items: center; gap: 32px; }
.ventas-tipo-list { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.vt-row { display: flex; align-items: center; gap: 7px; font-size: 12px; }
.vt-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.vt-label { flex: 1; color: var(--n-500); }
.vt-val { font-weight: 600; color: var(--n-800); }
.vt-divider { border-top: 1px solid var(--n-150); margin: 4px 0; }
.vt-total .vt-label { color: var(--n-700); font-weight: 500; }
.vt-total .vt-val { font-size: 15px; }
.ventas-donut-wrap {
  position: relative;
  flex-shrink: 0;
  align-self: stretch;
  aspect-ratio: 1;
  min-width: 100px;
  max-width: 160px;
  display: flex; align-items: center; justify-content: center;
}
.ventas-donut-wrap :deep(.p-chart) { width: 100% !important; height: 100% !important; }
.donut-center { position: absolute; text-align: center; font-size: 20px; font-weight: 700; color: var(--n-800); line-height: 1.2; pointer-events: none; }
.donut-center small { font-size: 12px; font-weight: 400; color: var(--n-400); display: block; }

/* Top ventas */
.tv-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--n-100); font-size: 12px; }
.tv-row:last-child { border-bottom: none; }
.tv-name { flex: 1; font-weight: 500; color: var(--n-700); }
.tv-stat { color: var(--n-400); font-size: 11px; }

/* Asig modal */
.asig-modal { display: flex; flex-direction: column; gap: 16px; }

/* Modal Asignación */
.asig-tabs-wrap { display: flex; justify-content: center; }
.asig-info { font-size: 14px; color: var(--n-700); }
.asig-cantidad-row { display: flex; align-items: center; gap: 16px; }
.asig-cantidad-label { font-size: 14px; color: var(--n-700); }

/* Agentes */
.asig-agentes-section { display: flex; flex-direction: column; gap: 8px; }
.asig-agentes-label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.asig-agentes-box { border: 1px solid var(--n-200); border-radius: 8px; padding: 16px; }
.asig-agentes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.asig-col { display: flex; flex-direction: column; gap: 12px; }
.asig-check-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.asig-agent-name { font-size: 13px; color: var(--n-700); }

/* ─── Responsive ───────────────────────────────── */
/* TH (right panel shrinks to 220px → content ~816px) */
@media (max-width: 1100px) {
  .kpi-row    { grid-template-columns: repeat(2, 1fr); }
  .dash-row-2 { grid-template-columns: 1fr; }
  .dash-row-3 { grid-template-columns: 1fr; }
  .dash-row-4 { grid-template-columns: 1fr; }
}

/* TV (right panel hidden → content ~700px) */
@media (max-width: 900px) {
  .kpi-row    { grid-template-columns: repeat(2, 1fr); }
  .dash-row-2, .dash-row-3, .dash-row-4 { grid-template-columns: 1fr; }
}

/* Mobile */
@media (max-width: 767px) {
  .kpi-row    { grid-template-columns: 1fr 1fr; }
}
</style>
