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

    <!-- Row 1: Perfil + Tipos de ventas + Leads por estado -->
    <div class="row-top">

      <!-- Perfil -->
      <SectionCard class="perfil-card">
        <div class="perfil-header">
          <AgentAvatar :nombre="agente.nombre" :ini="agente.ini" size="lg" />
          <div class="perfil-header-actions">
            <Button label="Asignar leads" icon="pi pi-user-plus" size="small" severity="secondary" outlined @click="showAsignar = true" />
            <Button v-if="canManageFeria && !isAgenteFeria" label="Modo offline" icon="pi pi-power-off" size="small" severity="secondary" outlined @click="showFeriaModal = true" />
          </div>
        </div>

        <div class="perfil-info">
          <div class="perfil-name-row">
            <span class="perfil-name">{{ agente.nombre }}</span>
            <!-- Status: offline badge · toggle (TL/Mgr) · static badge (agente) -->
            <span v-if="isAgenteFeria" class="perfil-status perfil-status--feria">
              <i class="pi pi-power-off" /> Offline
            </span>
            <div v-else-if="canManageFeria" class="perfil-toggle-row">
              <ToggleSwitch v-model="agenteDisponible" class="perfil-toggle" />
              <span class="perfil-toggle-label" :class="agenteDisponible ? 'toggle-on' : 'toggle-off'">
                {{ agenteDisponible ? 'Disponible' : 'No disponible' }}
              </span>
            </div>
            <span v-else class="perfil-status">
              <span class="perfil-status-dot" /> Disponible
            </span>
          </div>
          <div class="perfil-pais-row">{{ agente.flag }} {{ agente.pais }}</div>
          <div class="perfil-metrics">
            <span class="pm-item">CR <strong>{{ agente.cr }}%</strong></span>
            <span class="pm-sep">·</span>
            <span class="pm-item">CR frescos <strong>{{ agente.freshCr }}%</strong></span>
          </div>
          <div class="perfil-metrics">
            <span class="pm-item">Media ventas/mes <strong>{{ agente.promedioVentasMes }}</strong></span>
          </div>
          <div class="perfil-prueba">{{ agente.periodoInfo }}</div>
        </div>

        <!-- Banner offline activo -->
        <div v-if="isAgenteFeria && feriaEvent" class="feria-banner">
          <div class="feria-banner-info">
            <i class="pi pi-shop" />
            <div>
              <div class="feria-banner-name">{{ feriaEvent.eventName }}</div>
              <div class="feria-banner-until">Sin goteo hasta {{ offlineStore.formatEndDate(feriaEvent.endDate) }}</div>
            </div>
          </div>
          <Button
            v-if="canManageFeria"
            label="Finalizar"
            icon="pi pi-stop-circle"
            size="small"
            severity="warning"
            text
            @click="showFeriaModal = true"
          />
        </div>

      </SectionCard>

      <!-- Tipos de ventas -->
      <SectionCard title="Tipos de ventas" class="tipos-card">
        <div class="tipos-inner">
          <div class="tipos-legend">
            <div class="tl-row" v-for="t in tiposItems" :key="t.label">
              <span class="tl-dot" :style="{ background: t.color }" />
              <span class="tl-label">{{ t.label }}</span>
              <span class="tl-pct">{{ t.pct }}%</span>
            </div>
          </div>
          <div class="donut-wrap">
            <Chart type="doughnut" :data="tiposDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="donut-center">{{ agente.total }}<br><small>ventas</small></div>
          </div>
        </div>
      </SectionCard>

      <!-- Leads por estado — mismo componente que en DashboardAgente -->
      <LeadsPorEstadoCard
        class="leads-estado-card"
        :estados="leadsEstado"
        :erroresPago="agente.erroresPago"
      />
    </div>

    <!-- Row 2: KPIs -->
    <div class="kpi-row">
      <KpiCard :valor="String(agente.ventasHoy)"   label="Ventas de hoy"            comparativa="+8% vs ayer"          tendencia="up" />
      <KpiCard :valor="String(agente.ventasMes)"   label="Ventas del mes"           comparativa="+8% vs mes anterior"  tendencia="up" />
      <KpiCard :valor="String(agente.erroresPago)" label="Errores de pago"          comparativa="-8% vs semana ant."   tendencia="up" />
      <KpiCard :valor="String(agente.llamadas)"    label="Llamadas"                 comparativa="+8% vs mes anterior"  tendencia="up" />
      <KpiCard :valor="agente.tiempoMedio"         label="Tiempo medio en llamadas" comparativa="-12s vs media equipo" tendencia="up" />
    </div>

    <!-- Row 3: Objetivos (ancho completo, metas horizontal) -->
    <SectionCard title="Objetivos" class="metas-card">
      <div class="metas-grid">
        <div class="meta-block">
          <div class="meta-bar-row">
            <div class="meta-info">
              <div class="meta-header">Meta diaria</div>
              <div class="meta-pct">{{ agente.metaDiaria.pct }}%</div>
            </div>
            <span class="meta-nums">{{ agente.metaDiaria.actual }} / {{ agente.metaDiaria.objetivo }}</span>
          </div>
          <ProgressBar :value="agente.metaDiaria.pct" class="meta-progress" />
        </div>
        <div class="meta-vdivider" />
        <div class="meta-block">
          <div class="meta-bar-row">
            <div class="meta-info">
              <div class="meta-header">Meta mensual</div>
              <div class="meta-pct">{{ agente.metaMensual.pct }}%</div>
            </div>
            <span class="meta-nums">{{ agente.metaMensual.actual }} / {{ agente.metaMensual.objetivo }}</span>
          </div>
          <ProgressBar :value="agente.metaMensual.pct" class="meta-progress" />
        </div>
      </div>
    </SectionCard>

    <!-- Modal de asignación con agente pre-seleccionado -->
    <AsignarLeadsModal v-model:visible="showAsignar" :preselectAgenteId="agente.id" />

    <!-- Modal modo feria -->
    <ModoFeriaModal
      v-model:visible="showFeriaModal"
      :agenteId="agente.id"
      :agenteName="agente.nombre"
      :activatedBy="auth.currentRole"
    />

    <!-- Row 4: Chart histórico -->
    <SectionCard title="Histórico de ventas" class="historico-card">
      <template #header>
        <Select v-model="periodoHistorico" :options="['Mensual','Anual','Semanal']" style="font-size:12px" />
      </template>
      <div class="chart-legend">
        <span class="cl-item"><span class="cl-dot" :style="{ background: CHART_COLORS[0] }" />Este mes</span>
        <span class="cl-item"><span class="cl-dot cl-dot--dash" />Mes anterior</span>
      </div>
      <Chart type="line" :data="lineData" :options="lineOpts" style="height:240px" />
    </SectionCard>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import Select from 'primevue/select'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import SectionCard from '@/components/ui/SectionCard.vue'
import AgentAvatar from '@/components/ui/AgentAvatar.vue'
import KpiCard from '@/components/ui/KpiCard.vue'
import LeadsPorEstadoCard from '@/components/ui/LeadsPorEstadoCard.vue'
import AsignarLeadsModal from '@/components/leads/AsignarLeadsModal.vue'
import ModoFeriaModal from '@/components/agentes/ModoFeriaModal.vue'
import { mockAgentes, mockHistoricoVentas } from '@/data/mock'
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR } from '@/theme/palette'
import { useAgentesOfflineStore } from '@/stores/agentesOffline'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const offlineStore = useAgentesOfflineStore()

const showFeriaModal  = ref(false)
const agenteDisponible = ref(true)

// Only TL and Manager can manage feria mode
const canManageFeria = computed(() => ['team_lead', 'manager'].includes(auth.currentRole))
const isAgenteFeria  = computed(() => offlineStore.isOffline(agenteMock.value.id))
const feriaEvent     = computed(() => offlineStore.getEvent(agenteMock.value.id))

const agenteMock = computed(() => mockAgentes.find(a => a.id === route.params.id) ?? mockAgentes[0])

// Cifras coherentes:
// - Meta diaria objetivo: 6 ventas (realista para un agente individual)
// - Meta mensual objetivo: 120 ventas (~6 ventas/día × 20 días laborables)
// - Promedio ventas mensuales: ventasMes × 1.15 (histórico ~15% mayor que el mes actual)
const META_DIARIA_OBJ  = 6
const META_MENSUAL_OBJ = 120

const agente = computed(() => ({
  ...agenteMock.value,
  flag: '🇪🇸',
  pais: 'España',
  periodoInfo: 'Período de prueba: hasta 30/06/2025',
  ventasHoy: Math.min(agenteMock.value.ventasDias, 12),   // cap razonable
  ventasMes: agenteMock.value.ventasMes,
  promedioVentasMes: Math.round(agenteMock.value.ventasMes * 1.15),
  erroresPago: 3,
  llamadas: agenteMock.value.llamadasDia,
  tiempoMedio: agenteMock.value.tiempoLlamada,
  metaDiaria: {
    pct: Math.min(100, Math.round((agenteMock.value.ventasDias / META_DIARIA_OBJ) * 100)),
    actual: Math.min(agenteMock.value.ventasDias, META_DIARIA_OBJ + 4),
    objetivo: META_DIARIA_OBJ,
  },
  metaMensual: {
    pct: Math.min(100, Math.round((agenteMock.value.ventasMes / META_MENSUAL_OBJ) * 100)),
    actual: agenteMock.value.ventasMes,
    objetivo: META_MENSUAL_OBJ,
  },
}))

const tiposItems = [
  { label: 'Leads promos',    pct: 52.1, color: CHART_COLORS[0] },  // blue
  { label: 'Leads orgánicos', pct: 22.8, color: CHART_COLORS[2] },  // amber
  { label: 'Pausados',        pct: 13.9, color: CHART_COLORS[3] },  // green
  { label: 'Otros',           pct: 11.2, color: CHART_COLORS[4] },  // indigo
]

const tiposDonut = {
  datasets: [{
    data: tiposItems.map(t => t.pct),
    backgroundColor: tiposItems.map(t => t.color),
    borderWidth: 0,
    hoverOffset: 2,
  }]
}

const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '74%' }

// Mismo shape que en DashboardAgente — alimenta el LeadsPorEstadoCard
const leadsEstado = computed(() => [
  { label: 'Pendientes',  estado: 'Pendiente',  val: agenteMock.value.pendientes ?? 1 },
  { label: 'No contesta', estado: 'No contesta', val: agenteMock.value.noContesta1 ?? 25 },
  { label: 'Cita',        estado: 'En cita',     val: agenteMock.value.enCita ?? 16 },
  { label: 'Formulario',  estado: 'Formulario',  val: agenteMock.value.formulario ?? 32 },
])

const periodoHistorico = ref('Mensual')

const showAsignar = ref(false)

const lineData = {
  labels: mockHistoricoVentas.labels,
  datasets: [
    { label: 'Este mes', data: mockHistoricoVentas.esteAno.map(v => Math.round(v * 0.6)), borderColor: CHART_COLORS[0], backgroundColor: CHART_AREA_FILL, fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Mes ant.', data: mockHistoricoVentas.anoAnterior.map(v => Math.round(v * 0.5)), borderColor: CHART_PREV_COLOR, borderDash: [4, 3], backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0, borderWidth: 1.5 },
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
.detalle-view { display: flex; flex-direction: column; gap: 12px; }

/* ─── Breadcrumb ────────────────────────────────── */
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.back-btn { background: none; border: none; cursor: pointer; color: var(--brand, #ef6948); font-size: 13px; display: flex; align-items: center; gap: 4px; padding: 0; font-weight: 500; }
.back-btn:hover { text-decoration: underline; }
.bc-sep { color: var(--n-300, #d1d5db); }
.bc-current { color: var(--n-600, #4b5563); font-weight: 600; }

/* ─── Grids ─────────────────────────────────────── */
.row-top { display: grid; grid-template-columns: 1.2fr 1.4fr 1fr; gap: 12px; }
.kpi-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }

/* ─── Perfil ─────────────────────────────────────── */
.perfil-card :deep(.section-card-content) { display: flex; flex-direction: column; height: 100%; }

/* Header: avatar a la izq + CTA "Asignar leads" a la der (contrapeso visual) */
.perfil-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.perfil-header-actions { display: flex; flex-direction: row; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }

/* Info en stack vertical */
.perfil-info { display: flex; flex-direction: column; gap: 4px; }

/* Nombre + tag Disponible en la misma fila */
.perfil-name-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.perfil-name { font-size: 16px; font-weight: 700; color: var(--n-800); }
.perfil-status {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; color: #15803d;
  background: var(--success-bg); padding: 2px 8px; border-radius: 99px;
}
.perfil-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); }

/* Toggle disponibilidad (TL / Manager) */
.perfil-toggle-row { display: inline-flex; align-items: center; gap: 7px; }
.perfil-toggle-label { font-size: 11px; font-weight: 600; }
.toggle-on  { color: #15803d; }
.toggle-off { color: var(--n-500); }
:deep(.perfil-toggle.p-toggleswitch) { width: 28px !important; height: 16px !important; }
:deep(.perfil-toggle .p-toggleswitch-slider) { border-radius: 99px !important; }
:deep(.perfil-toggle .p-toggleswitch-slider::before) { width: 10px !important; height: 10px !important; margin-top: -5px !important; }

.perfil-pais-row { font-size: 13px; color: var(--n-600); margin-bottom: 2px; }

.perfil-metrics { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 12px; color: var(--n-500); }
.pm-item { color: var(--n-500); }
.pm-item strong { color: var(--n-800); font-weight: 600; }
.pm-sep  { color: var(--n-300); }

.perfil-prueba { font-size: 11px; color: var(--n-400); margin-top: 6px; }

/* Feria badge */
.perfil-status--feria {
  background: var(--warning-bg); color: var(--warning);
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px;
}

/* Feria active banner */
.feria-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  background: var(--warning-bg); border: 1px solid #f0d080;
  border-radius: 8px; padding: 10px 12px; margin-top: 12px;
}
.feria-banner-info { display: flex; align-items: flex-start; gap: 8px; color: var(--warning); font-size: 12px; }
.feria-banner-info > i { margin-top: 2px; flex-shrink: 0; }
.feria-banner-name  { font-weight: 600; }
.feria-banner-until { color: var(--n-500); font-size: 11px; margin-top: 1px; }

/* Feria trigger button */

/* ─── Tipos ventas — patrón donut compartido con DashboardAgente ─────── */
.tipos-inner { display: flex; align-items: center; gap: 24px; }
.tipos-legend { display: flex; flex-direction: column; gap: 7px; flex: 1; min-width: 0; }
.tl-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.tl-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tl-label { flex: 1; color: var(--n-500); }
.tl-pct { font-weight: 600; color: var(--n-800); }

.donut-wrap {
  position: relative; flex-shrink: 0;
  align-self: stretch; aspect-ratio: 1;
  min-width: 110px; max-width: 160px;
  display: flex; align-items: center; justify-content: center;
}
.donut-wrap :deep(.p-chart) { width: 100% !important; height: 100% !important; }
.donut-center {
  position: absolute; text-align: center;
  font-size: 20px; font-weight: 700; color: var(--n-800);
  line-height: 1.2; pointer-events: none;
}
.donut-center small { font-size: 12px; font-weight: 400; color: var(--n-400); display: block; }

/* ─── Objetivos (Metas) ──────────────────────────── */
.metas-grid {
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 24px;
  align-items: stretch;
}
.meta-block { display: flex; flex-direction: column; gap: 10px; }
.meta-bar-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.meta-info { display: flex; flex-direction: column; gap: 2px; }
.meta-header { font-size: 12px; font-weight: 500; color: var(--n-500); }
.meta-pct    { font-size: 22px; font-weight: 700; color: var(--n-900); line-height: 1; letter-spacing: -0.5px; }
.meta-nums   { font-size: 12px; color: var(--n-500); }
.meta-progress { height: 8px !important; }
:deep(.meta-progress .p-progressbar-value) { background: var(--success) !important; }
.meta-vdivider { background: var(--n-150); width: 1px; align-self: stretch; }

/* ─── Chart legend ───────────────────────────────── */
.chart-legend { display: flex; gap: 16px; margin-bottom: 12px; font-size: 12px; color: var(--n-500); }
.cl-item { display: flex; align-items: center; gap: 6px; }
.cl-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
.cl-dot--dash { background: none; border-radius: 0; width: 14px; height: 0; border-top: 1.5px dashed #c2c2c2; }

/* ─── Responsive ─────────────────────────────────── */
/* TH (≤1100px): row-top apila Perfil/Tipos arriba y Leads full debajo, KPIs 3 col */
@media (max-width: 1100px) {
  .row-top {
    grid-template-columns: 1fr 1fr;
  }
  .row-top > :nth-child(3) { grid-column: 1 / -1; }
  .kpi-row { grid-template-columns: repeat(3, 1fr); }
}

/* TV (≤900px): todo apila, KPIs 2 col + 5ª full */
@media (max-width: 900px) {
  .row-top { grid-template-columns: 1fr; }
  .row-top > :nth-child(3) { grid-column: auto; }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
  .kpi-row > :nth-child(5) { grid-column: 1 / -1; }
  /* Metas a vertical stack */
  .metas-grid { grid-template-columns: 1fr; }
  .meta-vdivider { width: 100%; height: 1px; }
}

/* Mobile (≤480px) */
@media (max-width: 480px) {
  .row-top { grid-template-columns: 1fr; }
  .kpi-row { grid-template-columns: 1fr 1fr; }
  .kpi-row > :nth-child(5) { grid-column: 1 / -1; }
  .metas-grid { grid-template-columns: 1fr; }
  .meta-vdivider { width: 100%; height: 1px; }
  .tipos-inner { gap: 12px; }
  .donut-wrap   { min-width: 100px; max-width: 130px; }
}

/* Equivalente para preview-mode .is-mob */
.is-mob .row-top { grid-template-columns: 1fr; }
.is-mob .kpi-row { grid-template-columns: 1fr 1fr; }
.is-mob .kpi-row > :nth-child(5) { grid-column: 1 / -1; }
.is-mob .metas-grid { grid-template-columns: 1fr; }
.is-mob .meta-vdivider { width: 100%; height: 1px; }
.is-mob .donut-wrap { min-width: 100px; max-width: 130px; }
</style>
