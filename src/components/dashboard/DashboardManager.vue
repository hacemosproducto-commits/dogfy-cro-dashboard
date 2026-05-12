<template>
  <div class="dash-content">
    <!-- Filtro país -->
    <div class="manager-header">
      <Select v-model="paisActivo" :options="paises" style="font-size:13px;font-weight:500" />
    </div>

    <!-- KPIs globales -->
    <div class="kpi-row">
      <KpiCard :valor="paisData.ventas.toLocaleString()" label="Ventas totales hoy"  comparativa="+9% vs ayer"       tendencia="up" />
      <KpiCard :valor="(paisData.ventas * 4).toLocaleString()" label="Ventas totales mes"  comparativa="+8% día anterior"  tendencia="up" />
      <KpiCard :valor="`${paisData.cr}%`"   label="CR leads frescos"    comparativa="+8% vs sem. ant."  tendencia="up" />
      <KpiCard valor="3,2%"   label="CR general"          comparativa="+8% vs ayer"       tendencia="up" />
    </div>

    <!-- Bolsa + mini stats -->
    <div class="dash-row-2">
      <SectionCard title="Bolsa de leads" class="bolsa-card">
        <div class="bolsa-inner">
          <div class="bolsa-donut">
            <Chart type="doughnut" :data="bolsaDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="bolsa-center"><strong>{{ paisData.leadsActivos.toLocaleString() }}</strong><small>leads</small></div>
          </div>
          <div class="bolsa-list">
            <div class="bolsa-row" v-for="item in bolsaItems" :key="item.label">
              <div class="bl-header">
                <span class="bl-dot" :style="{ background: item.color }" />
                <span class="bl-label">{{ item.label }}</span>
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
      <div class="mini-stats">
        <SectionCard class="mini-stat-card">
          <span class="stat-big">{{ paisData.mediaFresh }}</span>
          <p class="stat-label">Media leads fresh / persona</p>
        </SectionCard>
        <SectionCard class="mini-stat-card">
          <span class="stat-big">{{ paisData.pendientes }}</span>
          <p class="stat-label">Leads nuevos fresh</p>
          <p class="stat-trend trend-up">↑ +2% vs sem. anterior</p>
        </SectionCard>
      </div>
    </div>

    <!-- Gráficos barras -->
    <div class="dash-row-charts">
      <SectionCard title="Ventas">
        <template #header>
          <Select v-model="periodoVentas" :options="periodos" style="font-size:12px" />
        </template>
        <Chart type="bar" :data="ventasBarData" :options="barOpts" style="height:160px" />
      </SectionCard>
      <SectionCard title="Ventas por tipo">
        <template #header>
          <Select v-model="periodoTipo" :options="periodos" style="font-size:12px" />
        </template>
        <div class="ventas-tipo-inner">
          <div class="ventas-tipo-list">
            <div class="vt-row" v-for="vt in ventasTipoItems" :key="vt.label">
              <span class="vt-dot" :style="{ background: vt.color }" />
              <span class="vt-label">{{ vt.label }}</span>
              <span class="vt-val">{{ vt.val }}</span>
            </div>
            <div class="vt-divider" />
            <div class="vt-row vt-total"><span class="vt-label">Ventas totales</span><span class="vt-val">3.449</span></div>
          </div>
          <div class="donut-wrap">
            <Chart type="doughnut" :data="ventasDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="donut-center">3449<br><small>ventas</small></div>
          </div>
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

    <!-- Top cupones + campañas -->
    <div class="dash-row-top">
      <SectionCard title="Top cupones aplicados">
        <template #header>
          <Select v-model="periodoTop" :options="['Anual','Mensual']" style="font-size:12px" />
        </template>
        <div class="top-row" v-for="(item, i) in topCupones" :key="i">
          <span class="top-label">{{ item.label }}</span>
          <div class="top-bar-track">
            <div class="top-bar-fill" :style="{ width: item.pct + '%', background: item.color }" />
          </div>
          <span class="top-count">{{ item.count.toLocaleString() }}</span>
        </div>
      </SectionCard>
      <SectionCard title="Top campañas">
        <template #header>
          <Select v-model="periodoTopC" :options="['Anual','Mensual']" style="font-size:12px" />
        </template>
        <div class="top-row" v-for="(item, i) in topCupones" :key="i">
          <span class="top-label">{{ item.label }}</span>
          <div class="top-bar-track">
            <div class="top-bar-fill" :style="{ width: item.pct + '%', background: item.color }" />
          </div>
          <span class="top-count">{{ item.count.toLocaleString() }}</span>
        </div>
      </SectionCard>
    </div>

    <!-- KPIs por país -->
    <SectionCard class="paises-card">
      <div class="paises-grid">
        <div class="pais-col" v-for="p in mockKpisPaises" :key="p.pais">
          <div class="pais-header">{{ p.flag }} {{ p.pais }}</div>
          <div class="pais-row" v-for="(val, key) in paisFields(p)" :key="String(key)">
            <span class="pais-label">{{ key }}</span>
            <span class="pais-val">{{ val }}</span>
          </div>
        </div>
      </div>
    </SectionCard>

  </div><!-- end dash-content -->
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Chart from 'primevue/chart'
import Select from 'primevue/select'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { mockKpisPaises, mockHistoricoVentas } from '@/data/mock'
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR, createMetaPattern } from '@/theme/palette'

const periodoVentas = ref('Día')
const periodoTipo = ref('Día')
const periodoHistorico = ref('Anual')
const periodoTop = ref('Anual')
const periodoTopC = ref('Anual')
const periodos = ['Día', 'Semana', 'Mes', 'Anual']

const paises = ['España', 'Francia', 'Italia', 'Alemania']
const paisActivo = ref('España')

const extraPorPais: Record<string, { mediaFresh: string }> = {
  'España':   { mediaFresh: '6,7' },
  'Francia':  { mediaFresh: '5,2' },
  'Italia':   { mediaFresh: '4,8' },
  'Alemania': { mediaFresh: '3,1' },
}

const paisData = computed(() => {
  const base = mockKpisPaises.find(p => p.pais === paisActivo.value) ?? mockKpisPaises[0]
  return { ...base, mediaFresh: extraPorPais[paisActivo.value]?.mediaFresh ?? '–' }
})

const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '74%' }

const bolsaDonut = computed(() => ({
  datasets: [{ data: [paisData.value.formulario, paisData.value.noContesta, paisData.value.pendientes], backgroundColor: CHART_COLORS.slice(0, 3), borderWidth: 0, hoverOffset: 2 }]
}))
const bolsaItems = computed(() => {
  const f = paisData.value.formulario
  const n = paisData.value.noContesta
  const p = paisData.value.pendientes
  const total = f + n + p || 1
  return [
    { label: 'No gestionados', count: f, color: CHART_COLORS[0], pct: Math.round(f / total * 100), trend: '↑ +12%', trendUp: true  },
    { label: 'No contesta',    count: n, color: CHART_COLORS[1], pct: Math.round(n / total * 100), trend: '↓ -5%',  trendUp: false },
    { label: 'Frescos',        count: p, color: CHART_COLORS[2], pct: Math.round(p / total * 100), trend: '↑ +8%',  trendUp: true  },
  ]
})

const ventasTipoItems = [
  { label: 'Frescos (×1)',       val: 10, color: CHART_COLORS[0] },
  { label: 'Recuperados (×1.5)', val: 10, color: CHART_COLORS[1] },
  { label: 'Pausados (×1.5)',    val: 10, color: CHART_COLORS[2] },
]
const ventasDonut = { datasets: [{ data: [10, 10, 10], backgroundColor: CHART_COLORS.slice(0, 3), borderWidth: 0 }] }

const ventasBarData = {
  labels: ['Feb', 'Mar', 'Abr', 'May'],
  datasets: [
    { label: 'Ventas', data: [14000, 12000, 18000, 10000], backgroundColor: CHART_COLORS[0], borderRadius: 4, borderSkipped: false },
    { label: 'Meta',   data: [15000, 15000, 15000, 15000], backgroundColor: createMetaPattern('white', '#BFDBFE'), borderWidth: 0, borderRadius: 4, borderSkipped: false },
  ]
}
const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, align: 'end' as const, labels: { boxWidth: 20, boxHeight: 2, font: { size: 11 }, color: '#767676', padding: 16 } } },
  scales: {
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#a0a0a0' }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#a0a0a0' } }
  }
}

const lineData = {
  labels: mockHistoricoVentas.labels,
  datasets: [
    { label: 'Este año', data: mockHistoricoVentas.esteAno, borderColor: CHART_COLORS[0], backgroundColor: CHART_AREA_FILL, fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Año ant.', data: mockHistoricoVentas.anoAnterior, borderColor: CHART_PREV_COLOR, borderDash: [4, 3], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 }
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

const topCupones = [
  { label: 'CATA20',  count: 3085, pct: 100, color: CHART_COLORS[0] },
  { label: 'TEAM30',  count: 656,  pct: 21,  color: CHART_COLORS[1] },
  { label: 'VERANO',  count: 456,  pct: 15,  color: CHART_COLORS[2] },
  { label: 'WELCOME', count: 112,  pct: 4,   color: CHART_COLORS[3] },
]

function paisFields(p: typeof mockKpisPaises[0]) {
  return {
    'Ventas': p.ventas, 'CR': `${p.cr}%`, 'PUCR': p.pucr,
    'T. llamada': p.tiempo, 'Leads activos': p.leadsActivos,
    'Pendientes': p.pendientes, 'No contesta': p.noContesta,
    'Cita': p.cita, 'Formulario': p.formulario,
  }
}
</script>

<style scoped>
.dash-content { display: flex; flex-direction: column; gap: 12px; }

.manager-header { display: flex; justify-content: flex-end; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.dash-row-2 { display: grid; grid-template-columns: 3fr 1fr; gap: 10px; }
.mini-stats { display: flex; flex-direction: column; gap: 10px; }
.mini-stat-card { flex: 1; }
.dash-row-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dash-row-top { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* Stat mini */
.stat-big { font-size: 28px; font-weight: 700; color: var(--n-900); display: block; margin-bottom: 4px; }
.stat-label { font-size: 12px; color: var(--n-500); }
.stat-trend { font-size: 11px; margin-top: 4px; }

/* Bolsa */
.bolsa-inner { display: flex; gap: 32px; align-items: center; }
.bolsa-donut {
  position: relative; flex-shrink: 0;
  align-self: stretch; aspect-ratio: 1;
  min-width: 110px; max-width: 180px;
  display: flex; align-items: center; justify-content: center;
}
.bolsa-donut :deep(.p-chart) { width: 100% !important; height: 100% !important; }
.bolsa-center { position: absolute; text-align: center; font-size: 20px; font-weight: 700; color: var(--n-800); line-height: 1.2; }
.bolsa-center small { font-size: 12px; font-weight: 400; color: var(--n-400); display: block; }
.bolsa-list { flex: 1; display: flex; flex-direction: column; }
.bolsa-row { display: flex; flex-direction: column; gap: 6px; padding: 10px 0; }
.bolsa-row:first-child { padding-top: 0; }
.bolsa-row:last-child { padding-bottom: 0; }
.bl-header { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.bl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.bl-label { flex: 1; color: var(--n-600); }
.bl-count { font-weight: 600; color: var(--n-800); }
.bl-trend { font-size: 11px; font-weight: 500; }
.bl-trend--up   { color: var(--success, #22c55e); }
.bl-trend--down { color: var(--error,   #ef4444); }
.bl-bar-track { height: 4px; border-radius: 99px; background: var(--n-100); overflow: hidden; }
.bl-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }

/* Ventas tipo */
.ventas-tipo-inner { display: flex; align-items: center; gap: 32px; }
.ventas-tipo-list { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.vt-row { display: flex; align-items: center; gap: 7px; font-size: 12px; }
.vt-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.vt-label { flex: 1; color: var(--n-500); }
.vt-val { font-weight: 600; color: var(--n-800); }
.vt-divider { border-top: 1px solid var(--n-150); margin: 4px 0; }
.vt-total .vt-val { font-size: 15px; }
.donut-wrap {
  position: relative; flex-shrink: 0;
  align-self: stretch; aspect-ratio: 1;
  min-width: 100px; max-width: 160px;
  display: flex; align-items: center; justify-content: center;
}
.donut-wrap :deep(.p-chart) { width: 100% !important; height: 100% !important; }
.donut-center { position: absolute; text-align: center; font-size: 20px; font-weight: 700; color: var(--n-800); line-height: 1.2; }
.donut-center small { font-size: 12px; font-weight: 400; color: var(--n-400); display: block; }

/* Top */
.top-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 12px; }
.top-label { width: 72px; color: var(--n-600); flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.top-bar-track { flex: 1; height: 6px; background: var(--n-100); border-radius: 99px; overflow: hidden; }
.top-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.top-count { width: 36px; text-align: right; font-weight: 600; color: var(--n-800); }

/* Países */
.paises-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.pais-col { padding: 0 14px; border-right: 1px solid var(--n-150); }
.pais-col:first-child { padding-left: 0; }
.pais-col:last-child { border-right: none; padding-right: 0; }
.pais-header { font-size: 13px; font-weight: 700; color: var(--n-800); margin-bottom: 10px; }
.pais-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--n-100); }
.pais-row:last-child { border-bottom: none; }
.pais-label { color: var(--n-500); }
.pais-val { font-weight: 600; color: var(--n-800); }

/* ─── Responsive ───────────────────────────────── */
/* TH (content ~816px) */
@media (max-width: 1100px) {
  .kpi-row        { grid-template-columns: repeat(2, 1fr); }
  .dash-row-2     { grid-template-columns: 1fr; }
  .mini-stats     { width: 100%; flex-direction: row; }
  .dash-row-charts{ grid-template-columns: 1fr; }
  .dash-row-top   { grid-template-columns: 1fr; }
  .paises-grid    { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .pais-col       { border-right: none; border-bottom: 1px solid var(--n-150); padding: 0 0 12px; }
  .pais-col:last-child { border-bottom: none; }
}

/* TV (right panel hidden → content ~700px) */
@media (max-width: 900px) {
  .kpi-row        { grid-template-columns: repeat(2, 1fr); }
  .dash-row-2, .dash-row-charts, .dash-row-top { grid-template-columns: 1fr; }
  .paises-grid    { grid-template-columns: 1fr 1fr; gap: 12px; }
}

/* Mobile */
@media (max-width: 767px) {
  .kpi-row     { grid-template-columns: repeat(2, 1fr); }
  .paises-grid { grid-template-columns: 1fr; }
  .pais-col    { padding: 0 0 12px; }
}
</style>
