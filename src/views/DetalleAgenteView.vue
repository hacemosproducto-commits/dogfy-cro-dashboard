<template>
  <div class="detalle-view">

    <!-- Breadcrumb -->
    <div class="breadcrumb">
      <button class="back-btn" @click="router.back()">
        <i class="pi pi-chevron-left" /> Mi equipo
      </button>
      <span class="bc-sep">/</span>
      <span class="bc-current">Detalle agente</span>
    </div>

    <!-- Row 1: Perfil + Tipos de ventas -->
    <div class="row-top">

      <!-- Perfil -->
      <SectionCard class="perfil-card">
        <div class="perfil-inner">
          <AgentAvatar :nombre="agente.nombre" :ini="agente.ini" size="lg" />
          <div class="perfil-info">
            <div class="perfil-name-row">
              <span class="perfil-name">{{ agente.nombre }}</span>
              <span class="perfil-pais">{{ agente.flag }} {{ agente.pais }}</span>
            </div>
            <div class="perfil-email-row">
              <span class="perfil-email">{{ agente.email }}</span>
              <i class="pi pi-copy perfil-copy" @click="copyEmail" title="Copiar email" />
            </div>
            <div class="perfil-cr">CR: {{ agente.cr }}%</div>
            <div class="perfil-prueba">{{ agente.periodoInfo }}</div>
          </div>
        </div>
      </SectionCard>

      <!-- Tipos de ventas -->
      <SectionCard title="Tipos de ventas" class="tipos-card">
        <div class="tipos-inner">
          <div class="tipos-donut">
            <Chart type="doughnut" :data="tiposDonut" :options="donutOpts" style="width:110px;height:110px" />
            <div class="tipos-center">
              <strong>{{ agente.total }}</strong>
              <small>ventas</small>
            </div>
          </div>
          <div class="tipos-legend">
            <div class="tl-row" v-for="t in tiposItems" :key="t.label">
              <span class="tl-dot" :style="{ background: t.color }" />
              <span class="tl-label">{{ t.label }}</span>
              <span class="tl-pct">{{ t.pct }}%</span>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>

    <!-- Row 2: KPIs -->
    <div class="kpi-row">
      <KpiCard :valor="String(agente.ventasHoy)"   label="Ventas de hoy"            comparativa="+8% vs ayer" tendencia="up" />
      <KpiCard :valor="String(agente.ventasMes)"   label="Ventas del mes"           comparativa="+8% vs mes anterior" tendencia="up" />
      <KpiCard :valor="String(agente.erroresPago)" label="Errores de pago"          comparativa="+8% vs semana ant." />
      <KpiCard :valor="String(agente.llamadas)"    label="Llamadas"                 comparativa="+8% vs mes anterior" tendencia="up" />
      <KpiCard :valor="agente.tiempoMedio"         label="Tiempo medio en llamadas" />
    </div>

    <!-- Row 3: Metas + Leads por estado -->
    <div class="row-metas">

      <!-- Metas -->
      <SectionCard class="metas-card">
        <div class="meta-block">
          <div class="meta-header">Meta diaria</div>
          <div class="meta-bar-row">
            <span class="meta-pct">{{ agente.metaDiaria.pct }}%</span>
            <span class="meta-nums">{{ agente.metaDiaria.actual }} / {{ agente.metaDiaria.objetivo }}</span>
          </div>
          <div class="meta-bar">
            <div class="meta-bar-fill" :style="{ width: agente.metaDiaria.pct + '%' }" />
          </div>
        </div>
        <div class="meta-divider" />
        <div class="meta-block">
          <div class="meta-header">Meta mensual</div>
          <div class="meta-bar-row">
            <span class="meta-pct">{{ agente.metaMensual.pct }}%</span>
            <span class="meta-nums">{{ agente.metaMensual.actual }} / {{ agente.metaMensual.objetivo }}</span>
          </div>
          <div class="meta-bar">
            <div class="meta-bar-fill" :style="{ width: agente.metaMensual.pct + '%' }" />
          </div>
        </div>
      </SectionCard>

      <!-- Leads por estado -->
      <SectionCard title="Leads por estado" class="leads-estado-card">
        <div class="le-row" v-for="item in leadsEstado" :key="item.label">
          <span class="le-label">{{ item.label }}</span>
          <span class="le-val">{{ item.val }}</span>
          <i class="pi pi-chevron-right le-chevron" />
        </div>
      </SectionCard>
    </div>

    <!-- Row 4: Chart histórico -->
    <SectionCard class="historico-card">
      <template #header>
        <Select v-model="periodoHistorico" :options="['Mensual','Anual','Semanal']" style="font-size:12px" />
      </template>
      <div class="chart-legend">
        <span class="cl-item"><span class="cl-dot" style="background:#374c52" />Este mes</span>
        <span class="cl-item"><span class="cl-dot cl-dot--dash" />Mes anterior</span>
      </div>
      <Chart type="line" :data="lineData" :options="lineOpts" style="height:180px" />
    </SectionCard>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import Select from 'primevue/select'
import SectionCard from '@/components/ui/SectionCard.vue'
import AgentAvatar from '@/components/ui/AgentAvatar.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import { mockAgentes, mockHistoricoVentas } from '@/data/mock'
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR } from '@/theme/palette'

const route = useRoute()
const router = useRouter()

const agenteMock = computed(() => mockAgentes.find(a => a.id === route.params.id) ?? mockAgentes[0])

const agente = computed(() => ({
  ...agenteMock.value,
  flag: '🇪🇸',
  pais: 'España',
  email: `${agenteMock.value.nombre.toLowerCase().replace(/\s+/g, '.')}@dogfydiet.com`,
  periodoInfo: 'Período de prueba: hasta 30/06/2025',
  ventasHoy: agenteMock.value.ventasDias,
  ventasMes: agenteMock.value.ventasMes,
  erroresPago: Math.floor(Math.random() * 6),
  llamadas: agenteMock.value.llamadasDia,
  tiempoMedio: agenteMock.value.tiempoLlamada,
  metaDiaria: {
    pct: Math.round((agenteMock.value.ventasDias / 28) * 100),
    actual: agenteMock.value.ventasDias,
    objetivo: 28,
  },
  metaMensual: {
    pct: Math.round((agenteMock.value.ventasMes / 150) * 100),
    actual: agenteMock.value.ventasMes,
    objetivo: 150,
  },
}))

function copyEmail() {
  navigator.clipboard.writeText(agente.value.email).catch(() => {})
}

const tiposItems = [
  { label: 'Leads promos',    pct: 52.1, color: CHART_COLORS[0] },
  { label: 'Leads orgánicos', pct: 22.8, color: CHART_COLORS[2] },
  { label: 'Pausados',        pct: 13.9, color: CHART_COLORS[3] },
  { label: 'Otros',           pct: 11.2, color: CHART_PREV_COLOR },
]

const tiposDonut = {
  datasets: [{
    data: tiposItems.map(t => t.pct),
    backgroundColor: tiposItems.map(t => t.color),
    borderWidth: 0,
    hoverOffset: 2,
  }]
}

const donutOpts = { plugins: { legend: { display: false } }, cutout: '70%' }

const leadsEstado = computed(() => [
  { label: 'Pendientes',   val: agenteMock.value.pendientes ?? 1 },
  { label: 'No contesta',  val: agenteMock.value.noContesta1 ?? 25 },
  { label: 'Cita',         val: agenteMock.value.enCita ?? 16 },
  { label: 'Formulario',   val: agenteMock.value.formulario ?? 32 },
  { label: 'Error de pago',val: agente.value.erroresPago },
])

const periodoHistorico = ref('Mensual')

const lineData = {
  labels: mockHistoricoVentas.labels,
  datasets: [
    { label: 'Este mes', data: mockHistoricoVentas.esteAno.map(v => Math.round(v * 0.6)), borderColor: CHART_COLORS[0], backgroundColor: CHART_AREA_FILL, fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Mes ant.',  data: mockHistoricoVentas.anoAnterior.map(v => Math.round(v * 0.5)), borderColor: CHART_PREV_COLOR, borderDash: [4, 3], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
  ]
}

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#f0f0f0' }, ticks: { font: { size: 11 }, color: '#a0a0a0' }, border: { display: false } },
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#a0a0a0' } },
  }
}
</script>

<style scoped>
.detalle-view { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb */
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.back-btn { background: none; border: none; cursor: pointer; color: var(--brand, #ef6948); font-size: 13px; display: flex; align-items: center; gap: 4px; padding: 0; font-weight: 500; }
.back-btn:hover { text-decoration: underline; }
.bc-sep { color: var(--n-300, #d1d5db); }
.bc-current { color: var(--n-600, #4b5563); font-weight: 600; }

/* Row top */
.row-top { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* Perfil */
.perfil-inner { display: flex; align-items: flex-start; gap: 16px; }
.perfil-info { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.perfil-name-row { display: flex; align-items: center; gap: 10px; }
.perfil-name { font-size: 16px; font-weight: 700; color: var(--n-800, #1f2937); }
.perfil-pais { font-size: 13px; color: var(--n-500, #6b7280); }
.perfil-email-row { display: flex; align-items: center; gap: 6px; }
.perfil-email { font-size: 13px; color: var(--n-600, #4b5563); }
.perfil-copy { font-size: 12px; color: var(--n-400, #9ca3af); cursor: pointer; transition: color .15s; }
.perfil-copy:hover { color: var(--brand, #ef6948); }
.perfil-cr { font-size: 13px; color: var(--n-500, #6b7280); }
.perfil-prueba { font-size: 12px; color: var(--n-400, #9ca3af); }

/* Tipos ventas */
.tipos-inner { display: flex; align-items: center; gap: 20px; }
.tipos-donut { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 110px; height: 110px; }
.tipos-center { position: absolute; text-align: center; font-size: 14px; font-weight: 700; color: var(--n-800); line-height: 1.2; }
.tipos-center small { font-size: 10px; font-weight: 400; color: var(--n-400); display: block; }
.tipos-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.tl-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tl-label { flex: 1; color: var(--n-600, #4b5563); }
.tl-pct { font-weight: 600; color: var(--n-800, #1f2937); }

/* KPIs row */
.kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }

/* Row metas */
.row-metas { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }

.meta-block { display: flex; flex-direction: column; gap: 8px; }
.meta-header { font-size: 13px; font-weight: 600; color: var(--n-700, #374151); }
.meta-bar-row { display: flex; justify-content: space-between; align-items: baseline; }
.meta-pct  { font-size: 20px; font-weight: 600; color: var(--n-800, #1f2937); }
.meta-nums { font-size: 13px; color: var(--n-500, #6b7280); }
.meta-bar  { height: 14px; border-radius: 7px; background: #e5e7eb; overflow: hidden; }
.meta-bar-fill { height: 100%; background: var(--brand, #ef6948); border-radius: 7px; transition: width .3s; }
.meta-divider { border-top: 1px solid var(--n-100, #f3f4f6); margin: 12px 0; }

/* Leads por estado */
.le-row { display: flex; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--n-100, #f3f4f6); font-size: 13px; }
.le-row:last-child { border-bottom: none; }
.le-label { flex: 1; color: var(--n-600, #4b5563); }
.le-val  { font-weight: 600; color: var(--n-800, #1f2937); margin-right: 8px; }
.le-chevron { font-size: 10px; color: var(--n-300, #d1d5db); }

/* Chart legend */
.chart-legend { display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px; color: var(--n-500); }
.cl-item { display: flex; align-items: center; gap: 6px; }
.cl-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.cl-dot--dash { background: none; border: 1.5px dashed #c2c2c2; border-radius: 0; width: 14px; height: 0; border-top: 1.5px dashed #c2c2c2; }

/* Cards sizing */
.perfil-card { flex: 1; }
.tipos-card { flex: 1; }
.metas-card { flex: 1; }
.leads-estado-card { width: 320px; flex-shrink: 0; }
.historico-card { flex: 1; }
</style>
