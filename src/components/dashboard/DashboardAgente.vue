<template>
  <div class="dash-content">
    <!-- KPIs -->
    <div class="kpi-row">
      <KpiCard valor="5"   label="Ventas de hoy"   comparativa="+8% vs ayer"    tendencia="up" />
      <KpiCard valor="47"  label="Ventas del mes"   :progreso="47" :objetivo="160" />
      <KpiCard valor="14"  label="Días trabajados"  comparativa="3.4 ventas/día" />
      <KpiCard valor="8%"  label="CR sobre frescos" comparativa="+2% media país" tendencia="up" />
    </div>

    <!-- Row 2: Ventas tipo + Leads activos -->
    <div class="row-2col-unequal">
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

    <!-- Row 3: Histórico (ancho completo) -->
    <SectionCard title="Overview de ventas">
      <template #header>
        <Select v-model="periodo" :options="periodos" style="font-size:12px" />
      </template>
      <Chart type="line" :data="lineData" :options="lineOpts" style="height:240px" />
    </SectionCard>
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
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR } from '@/theme/palette'

const router = useRouter()

const periodo = ref('Anual')
const periodos = ['Anual', 'Mensual', 'Semanal']

const ventasTipoItems = [
  { label: 'Frescos (×1)',       val: 22, color: CHART_COLORS[0] },
  { label: 'Recuperados (×1.5)', val: 15, color: CHART_COLORS[2] },
  { label: 'Pausados (×1.5)',    val: 10, color: CHART_COLORS[3] },
]
const ventasTipoTotal = ventasTipoItems.reduce((s, i) => s + i.val, 0)

const donutData = {
  labels: ['Frescos', 'Recuperados', 'Pausados'],
  datasets: [{ data: ventasTipoItems.map(i => i.val), backgroundColor: [CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[3]], borderWidth: 0, hoverOffset: 2 }]
}
const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '74%' }

const lineData = {
  labels: mockHistoricoVentas.labels,
  datasets: [
    { label: 'Este año', data: mockHistoricoVentas.esteAno,      borderColor: CHART_COLORS[0], backgroundColor: CHART_AREA_FILL, fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Año ant.', data: mockHistoricoVentas.anoAnterior,  borderColor: CHART_PREV_COLOR, borderDash: [4,3], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
  ]
}
const lineOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: 'top' as const, align: 'end' as const, labels: { boxWidth: 20, boxHeight: 2, font: { size: 11 }, color: '#767676', padding: 16 } } },
  scales: {
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#a0a0a0' }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#a0a0a0' } }
  }
}

const leadsEstados = [
  { label: 'Pendientes',  estado: 'Pendiente',  val: 1  },
  { label: 'No contesta', estado: 'No contesta', val: 46 },
  { label: 'Cita',        estado: 'En cita',     val: 27 },
  { label: 'Formulario',  estado: 'Formulario',  val: 38 },
]
</script>

<style scoped>
.dash-content { display: flex; flex-direction: column; gap: 12px; }

.kpi-row          { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.row-2col-unequal { display: grid; grid-template-columns: 2fr 1fr; gap: 10px; }

/* ─── Ventas tipo ── */
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

/* ─── Responsive ── */
@media (max-width: 1100px) {
  .kpi-row          { grid-template-columns: repeat(2, 1fr); }
  .row-2col-unequal { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 900px) {
  .kpi-row          { grid-template-columns: repeat(2, 1fr); }
  .row-2col-unequal { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .kpi-row          { grid-template-columns: 1fr 1fr; }
  .row-2col-unequal { grid-template-columns: 1fr; }
  :deep(.p-chart)   { height: 200px !important; }
}
</style>
