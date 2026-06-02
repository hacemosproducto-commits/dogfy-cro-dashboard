<template>
  <div class="dash-content">
    <!-- KPIs -->
    <div class="kpi-row">
      <KpiCard valor="5"   label="Ventas de hoy"         comparativa="+8% vs ayer"     tendencia="up" />
      <KpiCard valor="47"  label="Ventas del mes"         :progreso="47" :objetivo="160" />
      <KpiCard valor="14"  label="Días trabajados"        comparativa="3.4 ventas/día" />
      <KpiCard valor="8%"  label="CR sobre frescos"       comparativa="+2% media país"  tendencia="up" />
      <KpiCard valor="2"   label="Para cambiar de tarifa" badge="Tarifa: 1.25" />
    </div>

    <!-- Row 2: Reto + Ventas tipo + Leads activos -->
    <div class="row-3col">
      <SectionCard class="reto-card">
        <p class="reto-eyebrow">Reto semanal</p>
        <p class="reto-title">{{ retoStore.reto.titulo }}</p>
        <p class="reto-desc">{{ retoStore.reto.descripcion }}</p>
        <a v-if="retoStore.reto.linkReglas" :href="retoStore.reto.linkReglas" class="reto-link" target="_blank" rel="noopener">Ver reglas →</a>
      </SectionCard>

      <SectionCard title="Ventas por tipo" class="ventas-tipo-card" @click="router.push('/ventas')" style="cursor:pointer">
        <div class="ventas-tipo-inner">
          <div class="ventas-tipo-list">
            <div class="vt-row" v-for="vt in ventasTipoItems" :key="vt.label">
              <span class="vt-dot" :style="{ background: vt.color }" />
              <span class="vt-label">{{ vt.label }}</span>
              <span class="vt-val">{{ vt.val }}</span>
            </div>
            <div class="vt-divider" />
            <div class="vt-row vt-total">
              <span class="vt-label">Ventas totales</span>
              <span class="vt-val">{{ ventasTipoTotal }}</span>
            </div>
            <div class="vt-row">
              <span class="vt-label text-muted">Bracket comisión</span>
              <span class="vt-val">1.25</span>
            </div>
          </div>
          <div class="donut-wrap">
            <Chart type="doughnut" :data="donutData" :options="donutOpts" style="width:100%;height:100%" />
            <div class="donut-center">{{ ventasTipoTotal }}<br><small>ventas</small></div>
          </div>
        </div>
      </SectionCard>

      <LeadsPorEstadoCard
        class="leads-activos-card"
        :total="115"
        :estados="leadsEstados"
        :erroresPago="3"
      />
    </div>

    <!-- Row 3: Histórico + Actividad -->
    <div class="row-2col">
      <SectionCard title="Overview de ventas">
        <template #header>
          <Select v-model="periodo" :options="periodos" style="font-size:12px" />
        </template>
        <Chart type="line" :data="lineData" :options="lineOpts" style="height:240px" />
      </SectionCard>

      <SectionCard title="Actividad del día" class="actividad-card">
        <div class="act-row" v-for="item in actividadItems" :key="item.label">
          <span class="act-label">{{ item.label }}</span>
          <span class="act-val">{{ item.val }}</span>
        </div>
      </SectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import Select from 'primevue/select'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import LeadsPorEstadoCard from '@/components/ui/LeadsPorEstadoCard.vue'
import { mockHistoricoVentas } from '@/data/mock'
import { useRetoStore } from '@/stores/reto'

const retoStore = useRetoStore()
const router = useRouter()
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR } from '@/theme/palette'

const periodo = ref('Anual')
const periodos = ['Anual', 'Mensual', 'Semanal']

const ventasTipoItems = [
  { label: 'Frescos (×1)',       val: 22, color: CHART_COLORS[0] },
  { label: 'Recuperados (×1.5)', val: 15, color: CHART_COLORS[2] },
  { label: 'Pausados (×1.5)',    val: 10, color: CHART_COLORS[3] },
]
const ventasTipoTotal = ventasTipoItems.reduce((s, i) => s + i.val, 0) // 47

const donutData = {
  labels: ['Frescos', 'Recuperados', 'Pausados'],
  datasets: [{ data: ventasTipoItems.map(i => i.val), backgroundColor: [CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[3]], borderWidth: 0, hoverOffset: 2 }]
}
const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '74%' }

const lineData = {
  labels: mockHistoricoVentas.labels,
  datasets: [
    { label: 'Este año', data: mockHistoricoVentas.esteAno, borderColor: CHART_COLORS[0], backgroundColor: CHART_AREA_FILL, fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Año ant.', data: mockHistoricoVentas.anoAnterior, borderColor: CHART_PREV_COLOR, borderDash: [4,3], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
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

// Un agente solo tiene 1 lead "Pendiente" activo — el que está gestionando en este momento
// `estado` es el valor exacto que se pasa como query param a /leads
const leadsEstados = [
  { label: 'Pendientes',  estado: 'Pendiente',   val: 1  },
  { label: 'No contesta', estado: 'No contesta',  val: 46 },
  { label: 'Cita',        estado: 'En cita',      val: 27 },
  { label: 'Formulario',  estado: 'Formulario',   val: 38 },
]
const actividadItems = [
  { label: 'Llamadas realizadas', val: '33' },
  { label: 'Tiempo en llamadas',  val: '3h 43m' },
  { label: 'Tiempo medio',        val: '6m 46s' },
  { label: 'PUCR gestión leads',  val: '4m 12s' },
]
</script>

<style scoped>
/* ─── Layout ───────────────────────────────────── */
.dash-content { display: flex; flex-direction: column; gap: 12px; }

/* ─── Grids ────────────────────────────────────── */
.kpi-row  { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.row-3col { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; }
.row-2col { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }

/* ─── Reto semanal ─────────────────────────────── */
.reto-card    { background: #FEF9C3 !important; border-color: #fde68a !important; }
.reto-eyebrow { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.reto-title   { font-size: 14px; font-weight: 700; color: var(--n-800); margin-bottom: 6px; }
.reto-desc    { font-size: 12px; color: var(--n-600); line-height: 1.6; margin-bottom: 10px; }
.reto-link    { font-size: 12px; color: var(--brand); font-weight: 500; text-decoration: none; }
.reto-link:hover { text-decoration: underline; }

/* ─── Ventas tipo ──────────────────────────────── */
.ventas-tipo-inner { display: flex; align-items: center; gap: 32px; }
.ventas-tipo-list  { flex: 1; display: flex; flex-direction: column; gap: 7px; }
.vt-row    { display: flex; align-items: center; gap: 7px; font-size: 12px; }
.vt-dot    { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.vt-label  { flex: 1; color: var(--n-500); }
.vt-val    { font-weight: 600; color: var(--n-800); }
.vt-divider{ border-top: 1px solid var(--n-150); margin: 4px 0; }
.vt-total .vt-label { color: var(--n-700); font-weight: 500; }
.vt-total .vt-val   { font-size: 15px; }
.donut-wrap {
  position: relative; flex-shrink: 0;
  align-self: stretch; aspect-ratio: 1;
  min-width: 100px; max-width: 160px;
  display: flex; align-items: center; justify-content: center;
}
.donut-wrap :deep(.p-chart) { width: 100% !important; height: 100% !important; }
.donut-center { position: absolute; text-align: center; font-size: 20px; font-weight: 700; color: var(--n-800); line-height: 1.2; pointer-events: none; }
.donut-center small { font-size: 12px; font-weight: 400; color: var(--n-400); display: block; }

/* ─── Leads activos: estilos en LeadsPorEstadoCard.vue ───────── */

/* ─── Actividad ────────────────────────────────── */
.act-row  { display: flex; justify-content: space-between; font-size: 12px; padding: 7px 0; border-bottom: 1px solid var(--n-100); }
.act-row:last-child { border-bottom: none; }
.act-label{ color: var(--n-500); }
.act-val  { font-weight: 600; color: var(--n-800); }

/* ─── Responsive ───────────────────────────────── */
/* TH (content ~816px) */
@media (max-width: 1100px) {
  .kpi-row  { grid-template-columns: repeat(3, 1fr); }
  .row-3col { grid-template-columns: 1fr 1fr; }
  .row-3col > :nth-child(3) { grid-column: 1 / -1; }
}

/* TV (right panel hidden → content ~700px) */
@media (max-width: 900px) {
  .kpi-row  { grid-template-columns: repeat(2, 1fr); }
  .row-3col { grid-template-columns: 1fr; }
  .row-2col { grid-template-columns: 1fr; }
  .actividad-card { width: 100%; }
}

/* Mobile ≤480px */
@media (max-width: 480px) {
  /* KPIs: 2 cols, bracket (5ª) a ancho completo */
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .kpi-row > :nth-child(5) { grid-column: 1 / -1; }

  /* Filas multi-columna → stack vertical */
  .row-3col { grid-template-columns: 1fr; }
  .row-2col { grid-template-columns: 1fr; }
  .actividad-card { width: 100%; }

  /* El row-2col apilado: cada card ocupa el ancho completo y el canvas re-renderiza */
  .row-2col :deep(.p-chart) { height: 200px !important; }
}
</style>
