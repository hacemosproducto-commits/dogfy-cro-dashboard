<template>
  <div class="dash-content">
    <!-- Filtro país -->
    <div class="manager-header">
      <Select v-model="paisActivo" :options="paises" style="font-size:13px;font-weight:500" />
    </div>

    <!-- KPIs globales -->
    <div class="kpi-row">
      <KpiCard :valor="paisData.ventas.toLocaleString('es-ES')"    label="Ventas totales hoy"  comparativa="+9% vs ayer"       tendencia="up" />
      <KpiCard :valor="paisData.ventasMes.toLocaleString('es-ES')" label="Ventas totales mes"  comparativa="+8% día anterior"  tendencia="up" />
      <KpiCard :valor="`${paisData.cr}%`"                          label="CR leads frescos"    comparativa="+2% media global"  tendencia="up" />
      <KpiCard :valor="`${paisData.crGeneral}%`"                   label="CR general"          comparativa="+0.4% vs ayer"     tendencia="up" />
    </div>

    <!-- Bolsa de leads (ancho completo) -->
    <SectionCard title="Bolsa de leads" class="bolsa-card">
      <div class="bolsa-inner">
        <div class="bolsa-donut">
          <Chart type="doughnut" :data="bolsaDonut" :options="donutOpts" style="width:100%;height:100%" />
          <div class="bolsa-center">{{ paisData.leadsActivos.toLocaleString('es-ES') }}<br><small>leads</small></div>
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

    <!-- Gráficos barras -->
    <div class="dash-row-charts">
      <SectionCard title="Ventas">
        <template #header>
          <Select v-model="periodoVentas" :options="periodos" style="font-size:12px" />
        </template>
        <div class="chart-scroll-wrap">
          <div :style="{ minWidth: ventasMinWidth }">
            <Chart type="bar" :data="ventasBarData" :options="barOpts" style="height:240px" />
          </div>
        </div>
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
            <div class="vt-row vt-total"><span class="vt-label">Ventas totales</span><span class="vt-val">{{ ventasTipoTotal }}</span></div>
          </div>
          <div class="donut-wrap">
            <Chart type="doughnut" :data="ventasDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="donut-center">{{ ventasTipoTotal }}<br><small>ventas</small></div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Histórico -->
    <SectionCard title="Overview de ventas" class="historico-card">
      <template #header>
        <Select v-model="periodoHistorico" :options="['Anual','Mensual','Semanal']" style="font-size:12px" />
      </template>
      <Chart type="line" :data="lineData" :options="lineOpts" style="height:260px" />
    </SectionCard>

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
const periodos = ['Día', 'Semana', 'Mes', 'Anual']

const paises = ['España', 'Francia', 'Italia', 'Alemania']
const paisActivo = ref('España')

const paisData = computed(() => mockKpisPaises.find(p => p.pais === paisActivo.value) ?? mockKpisPaises[0])

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

const ventasTipoItems = computed(() => [
  { label: 'Frescos (×1)',       val: paisData.value.ventasTipo[0], color: CHART_COLORS[0] },
  { label: 'Recuperados (×1.5)', val: paisData.value.ventasTipo[1], color: CHART_COLORS[1] },
  { label: 'Pausados (×1.5)',    val: paisData.value.ventasTipo[2], color: CHART_COLORS[2] },
])
const ventasTipoTotal = computed(() => ventasTipoItems.value.reduce((s, i) => s + i.val, 0))
const ventasDonut = computed(() => ({
  datasets: [{ data: paisData.value.ventasTipo, backgroundColor: CHART_COLORS.slice(0, 3), borderWidth: 0, hoverOffset: 2 }]
}))

const ventasBarData = computed(() => ({
  labels: ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May'],
  datasets: [
    { label: 'Ventas', data: paisData.value.barVentas, backgroundColor: CHART_COLORS[0], borderRadius: 4, borderSkipped: false },
    { label: 'Meta',   data: Array(12).fill(paisData.value.barMeta), backgroundColor: createMetaPattern('white', '#BFDBFE'), borderWidth: 0, borderRadius: 4, borderSkipped: false },
  ]
}))
const ventasMinWidth = computed(() => `${Math.max(ventasBarData.value.labels.length * 80, 300)}px`)
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

function paisFields(p: typeof mockKpisPaises[0]) {
  return {
    'Ventas hoy':     p.ventas,
    'Ventas mes':     p.ventasMes.toLocaleString('es-ES'),
    'CR frescos':     `${p.cr}%`,
    'CR general':     `${p.crGeneral}%`,
    'PUCR':           p.pucr,
    'T. llamada':     p.tiempo,
    'Leads activos':  p.leadsActivos.toLocaleString('es-ES'),
    'Pendientes':     p.pendientes,
    'No contesta':    p.noContesta.toLocaleString('es-ES'),
    'Cita':           p.cita,
    'Formulario':     p.formulario.toLocaleString('es-ES'),
  }
}
</script>

<style scoped>
.dash-content { display: flex; flex-direction: column; gap: 12px; }

.manager-header { display: flex; justify-content: flex-end; }
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.dash-row-charts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.chart-scroll-wrap { overflow-x: auto; }

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

/* ─── Países — desktop: 4 cols con separadores verticales ─── */
.paises-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.pais-col { padding: 0 16px; border-right: 1px solid var(--n-150); }
.pais-col:first-child { padding-left: 0; }
.pais-col:last-child  { border-right: none; padding-right: 0; }
.pais-header { font-size: 13px; font-weight: 700; color: var(--n-800); margin-bottom: 10px; }
.pais-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--n-100); }
.pais-row:last-child { border-bottom: none; }
.pais-label { color: var(--n-500); }
.pais-val { font-weight: 600; color: var(--n-800); }

/* ─── Responsive ───────────────────────────────── */
/* TH / TV (≤1100px): layout 2×2 con separadores en cruz */
@media (max-width: 1100px) {
  .kpi-row         { grid-template-columns: repeat(2, 1fr); }
  .dash-row-2      { grid-template-columns: 1fr; }
  .mini-stats      { width: 100%; flex-direction: row; }
  .dash-row-charts { grid-template-columns: 1fr; }
  .dash-row-top    { grid-template-columns: 1fr; }

  /* 2×2: separador central en cruz */
  .paises-grid              { grid-template-columns: 1fr 1fr; }
  /* Reset borders del layout de 4 cols */
  .pais-col                 { padding: 0; border-right: none; }
  /* Columna izquierda (cols 1 y 3): separador derecho */
  .pais-col:nth-child(odd)  { padding-right: 16px; border-right: 1px solid var(--n-150); }
  /* Columna derecha (cols 2 y 4): espacio interno */
  .pais-col:nth-child(even) { padding-left: 16px; }
  /* Fila superior (cols 1 y 2): separador inferior */
  .pais-col:nth-child(-n+2) { padding-bottom: 16px; border-bottom: 1px solid var(--n-150); }
  /* Fila inferior (cols 3 y 4): espacio superior */
  .pais-col:nth-child(n+3)  { padding-top: 16px; }
}

/* TV adicional (≤900px) */
@media (max-width: 900px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .dash-row-2, .dash-row-charts, .dash-row-top { grid-template-columns: 1fr; }
}

/* Mobile ≤480px: 1 col apilada con separadores entre países */
@media (max-width: 480px) {
  .bolsa-inner       { flex-direction: column; gap: 16px; }
  .bolsa-donut       { max-width: 140px; width: 140px; align-self: center; }
  .bolsa-list        { width: 100%; }
  .ventas-tipo-inner { flex-direction: column; gap: 16px; }
  .donut-wrap        { max-width: 140px; width: 140px; align-self: center; }
  .ventas-tipo-list  { width: 100%; }
  .dash-row-charts   { grid-template-columns: 1fr; }
  .dash-row-top      { grid-template-columns: 1fr; }

  /* 1 col: reset todos los estilos 2×2 y apilar */
  .paises-grid { grid-template-columns: 1fr; }
  .pais-col,
  .pais-col:nth-child(odd),
  .pais-col:nth-child(even),
  .pais-col:nth-child(-n+2),
  .pais-col:nth-child(n+3) {
    padding: 0 0 14px;
    border-right: none;
    border-bottom: 1px solid var(--n-150);
  }
  .pais-col + .pais-col { padding-top: 14px; }
  .pais-col:last-child  { border-bottom: none; padding-bottom: 0; }
}
</style>
