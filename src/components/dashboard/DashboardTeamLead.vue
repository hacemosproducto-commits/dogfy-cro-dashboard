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
      <KpiCard :valor="`${mockKpisTL.ventasMes.actual}`" label="Ventas del mes" :progreso="mockKpisTL.ventasMes.actual" :objetivo="mockKpisTL.ventasMes.objetivo" />
      <KpiCard valor="24/80" label="Agentes disponibles" />
      <KpiCard valor="3%"    label="CR sobre frescos"     comparativa="+2% media país" tendencia="up" />
    </div>

    <!-- Bolsa de leads + Resumen agente -->
    <div class="dash-row-2">
      <SectionCard title="Bolsa de leads" class="bolsa-card">
        <div class="bolsa-inner">
          <div class="bolsa-donut">
            <Chart type="doughnut" :data="bolsaDonut" :options="donutOpts" style="width:100%;height:100%" />
            <div class="bolsa-center">{{ bolsaTotal.toLocaleString('es-ES') }}<br><small>leads</small></div>
          </div>
          <div class="bolsa-list">
            <div class="bolsa-row" v-for="item in bolsaItems" :key="item.label">
              <div class="bl-header">
                <span class="bl-dot" :style="{ background: item.color }" />
                <span class="bl-label">{{ item.label }}</span>
                <Button v-if="item.asignar" label="Asignar" icon="pi pi-plus" size="small" severity="secondary" outlined @click="openAsignacion()" class="bl-asignar" />
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
        <MultiSelect
          :modelValue="agenteSeleccionado"
          @update:modelValue="onSelectionChange"
          :options="agentesGrupos"
          optionLabel="label"
          optionGroupLabel="label"
          optionGroupChildren="items"
          placeholder="Seleccionar agente del equipo"
          :maxSelectedLabels="hasMiEquipo ? 0 : 1"
          :selectedItemsLabel="hasMiEquipo ? 'Mi equipo' : '{0} agentes'"
          :showToggleAll="false"
          :showClear="true"
          style="width:100%;margin-bottom:12px"
        />
        <div class="am-list">
          <RouterLink
            v-for="m in agenteMetrics" :key="m.label" :to="m.to"
            class="am-row"
          >
            <span class="am-label">{{ m.label }}</span>
            <span class="am-val">{{ m.val }}</span>
            <i class="pi pi-chevron-right" style="font-size:10px;color:var(--n-300)" />
          </RouterLink>
        </div>
      </SectionCard>
    </div>

    <!-- Ventas por tipo (ancho completo) -->
    <SectionCard title="Ventas por tipo" class="ventas-tipo-card">
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
        <div class="ventas-donut-wrap">
          <Chart type="doughnut" :data="ventasDonut" :options="donutOpts" style="width:100%;height:100%" />
          <div class="donut-center">{{ ventasTipoTotal }}<br><small>ventas</small></div>
        </div>
      </div>
    </SectionCard>

    <!-- Tu equipo (ancho completo) -->
    <SectionCard title="Tu equipo" class="equipo-chart-card">
      <template #header>
        <Select v-model="periodoEquipo" :options="['Día','Semana','Mes']" style="font-size:12px" />
      </template>
      <div class="equipo-chart-wrap" ref="equipoChartWrap">
        <div class="equipo-chart-scroll" ref="equipoScroll">
          <div :style="{ minWidth: equipoMinWidth }">
            <Chart ref="equipoChartRef" type="bar" :data="equipoBarData" :options="barOpts" style="height:240px" />
          </div>
        </div>
        <div ref="labelTip" class="label-tip" style="display:none" />
      </div>
    </SectionCard>

    <!-- Histórico -->
    <SectionCard title="Overview de ventas" class="historico-card">
      <template #header>
        <Select v-model="periodoHistorico" :options="['Anual','Mensual','Semanal']" style="font-size:12px" />
      </template>
      <Chart type="line" :data="lineData" :options="lineOpts" style="height:260px" />
    </SectionCard>

    </div><!-- end Mi equipo dash-content -->
  </div><!-- end tl-root -->

  <!-- Modal Asignación -->
  <AsignarLeadsModal v-model:visible="showAsignacion" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import KpiCard from '@/components/ui/KpiCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import DashboardAgente from '@/components/dashboard/DashboardAgente.vue'
import AsignarLeadsModal from '@/components/leads/AsignarLeadsModal.vue'
import { mockAgentes, mockHistoricoVentas, mockEquipoBarras, mockKpisTL, mockRankingPaises } from '@/data/mock'
import { CHART_COLORS, CHART_AREA_FILL, CHART_PREV_COLOR, createMetaPattern } from '@/theme/palette'

const activeTab = ref('Mi equipo')
const tabs = ['Personal', 'Mi equipo']
const pais = ref('España')
const paises = ['España', 'Francia', 'Italia', 'Alemania']
// Agentes de España divididos en 3 equipos
const espanaAgentes = mockRankingPaises.find(p => p.pais === 'España')?.agentes ?? []
const agentesGrupos = [
  {
    // Atajos de equipo completo — aparecen primero
    label: 'Equipos',
    items: [
      { label: 'Mi equipo', value: 'equipo-mi' },
      { label: 'Equipo 2',  value: 'equipo-2'  },
      { label: 'Equipo 3',  value: 'equipo-3'  },
    ]
  },
  {
    label: 'Mi equipo — Agentes',
    items: espanaAgentes.slice(0, 5).map((a, i) => ({ label: a.nombre, value: `mi-${i}` }))
  },
  {
    label: 'Equipo 2 — Agentes',
    items: espanaAgentes.slice(5, 10).map((a, i) => ({ label: a.nombre, value: `e2-${i}` }))
  },
  {
    label: 'Equipo 3 — Agentes',
    items: espanaAgentes.slice(10).map((a, i) => ({ label: a.nombre, value: `e3-${i}` }))
  },
]
// Items individuales de "Mi equipo"
const miEquipoItems = agentesGrupos[1].items

// Pre-selecciona "Mi equipo" + todos sus agentes individuales para que aparezcan marcados
const agenteSeleccionado = ref<{ label: string; value: string }[]>([
  { label: 'Mi equipo', value: 'equipo-mi' },
  ...miEquipoItems
])

// Computed: ¿está activo el atajo "Mi equipo"?
const hasMiEquipo = computed(() => agenteSeleccionado.value.some(x => x.value === 'equipo-mi'))

// Gestiona los cambios de selección con lógica inteligente de atajos
function onSelectionChange(newVal: { label: string; value: string }[]) {
  const prevVals = agenteSeleccionado.value.map(x => x.value)
  const newVals  = newVal.map(x => x.value)

  // Caso: "Mi equipo" recién añadido → expandir con todos los agentes individuales
  if (newVals.includes('equipo-mi') && !prevVals.includes('equipo-mi')) {
    const withoutMiIndiv = newVal.filter(x => !x.value.startsWith('mi-'))
    agenteSeleccionado.value = [...withoutMiIndiv, ...miEquipoItems]
    return
  }

  // Caso: "Mi equipo" recién eliminado → limpiar también todos los mi-* individuales
  if (!newVals.includes('equipo-mi') && prevVals.includes('equipo-mi')) {
    agenteSeleccionado.value = newVal.filter(x => !x.value.startsWith('mi-'))
    return
  }

  // Caso: se eliminó un agente individual mientras "Mi equipo" estaba activo → desactivar atajo
  if (newVals.includes('equipo-mi')) {
    const prevMiCount = prevVals.filter(v => v.startsWith('mi-')).length
    const newMiCount  = newVals.filter(v  => v.startsWith('mi-')).length
    if (newMiCount < prevMiCount) {
      agenteSeleccionado.value = newVal.filter(x => x.value !== 'equipo-mi')
      return
    }
  }

  agenteSeleccionado.value = newVal
}
const router = useRouter()
const periodoEquipo = ref('Día')
const periodoHistorico = ref('Anual')
const showAsignacion = ref(false)

// ── Equipo chart: agentes reales de España (primeros 8) ──────────────────────
const espanaChartAgentes = mockAgentes.filter(a => a.pais === 'España').slice(0, 12)

// Template refs para interactividad en x-axis labels
const equipoChartRef  = ref<InstanceType<typeof Chart> | null>(null)
const equipoChartWrap = ref<HTMLElement | null>(null)
const equipoScroll    = ref<HTMLElement | null>(null)
const labelTip        = ref<HTMLElement | null>(null)

const equipoMinWidth = `${Math.max(espanaChartAgentes.length * 80, 400)}px`

// Tolerancia horizontal (px) para detectar clic/hover sobre un tick
const TICK_HIT_PX = 36

function getHoveredTickIdx(canvas: HTMLCanvasElement, clientX: number, clientY: number): number {
  const chartInst = equipoChartRef.value?.getChart?.() as any
  if (!chartInst) return -1
  const rect      = canvas.getBoundingClientRect()
  const x         = clientX - rect.left
  const y         = clientY - rect.top
  const xScale    = chartInst.scales?.x
  const chartArea = chartInst.chartArea
  if (!xScale || !chartArea || y <= chartArea.bottom) return -1

  for (let i = 0; i < espanaChartAgentes.length; i++) {
    if (Math.abs(x - xScale.getPixelForTick(i)) < TICK_HIT_PX) return i
  }
  return -1
}

let _canvas: HTMLCanvasElement | null = null

function onCanvasMove(e: MouseEvent) {
  if (!_canvas || !labelTip.value) return
  const idx = getHoveredTickIdx(_canvas, e.clientX, e.clientY)
  if (idx >= 0) {
    _canvas.style.cursor = 'pointer'
    const chartInst = equipoChartRef.value?.getChart?.() as any
    const tickX     = chartInst?.scales?.x?.getPixelForTick(idx) ?? 0
    const scrollLeft = equipoScroll.value?.scrollLeft ?? 0
    const tickY     = (chartInst?.chartArea?.bottom ?? 0) + 22
    labelTip.value.textContent = espanaChartAgentes[idx].nombre
    labelTip.value.style.display = 'block'
    labelTip.value.style.left    = (tickX - scrollLeft) + 'px'
    labelTip.value.style.top     = tickY + 'px'
  } else {
    _canvas.style.cursor = ''
    labelTip.value.style.display = 'none'
  }
}

function onCanvasLeave() {
  if (_canvas) _canvas.style.cursor = ''
  if (labelTip.value) labelTip.value.style.display = 'none'
}

function onCanvasClick(e: MouseEvent) {
  if (!_canvas) return
  const idx = getHoveredTickIdx(_canvas, e.clientX, e.clientY)
  if (idx >= 0) router.push(`/agentes/${espanaChartAgentes[idx].id}`)
}

onMounted(() => {
  // Chart.js renders async; wait a tick for the canvas to be in the DOM
  setTimeout(() => {
    _canvas = equipoChartRef.value?.getChart?.()?.canvas ?? null
    if (!_canvas) return
    _canvas.addEventListener('mousemove',  onCanvasMove)
    _canvas.addEventListener('mouseleave', onCanvasLeave)
    _canvas.addEventListener('click',      onCanvasClick)
  }, 100)
})

onBeforeUnmount(() => {
  if (!_canvas) return
  _canvas.removeEventListener('mousemove',  onCanvasMove)
  _canvas.removeEventListener('mouseleave', onCanvasLeave)
  _canvas.removeEventListener('click',      onCanvasClick)
})

function openAsignacion() {
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
  { label: 'Pendientes',      val: 1,   to: { path: '/leads', query: { estado: 'Pendiente'  } } },
  { label: 'No contesta',     val: 453, to: { path: '/leads', query: { estado: 'No contesta'} } },
  { label: 'Cita',            val: 203, to: { path: '/leads', query: { estado: 'En cita'    } } },
  { label: 'Formulario',      val: 507, to: { path: '/leads', query: { estado: 'Formulario' } } },
  { label: 'Ventas día',      val: 12,  to: '/ventas' },
  { label: 'Ventas mes',      val: 45,  to: '/ventas' },
]

const ventasTipoItems = [
  { label: 'Frescos (×1)',       val: 55, color: CHART_COLORS[0] },
  { label: 'Recuperados (×1.5)', val: 42, color: CHART_COLORS[1] },
  { label: 'Pausados (×1.5)',    val: 25, color: CHART_COLORS[2] },
]
const ventasTipoTotal = ventasTipoItems.reduce((s, i) => s + i.val, 0)

const ventasDonut = {
  datasets: [{ data: ventasTipoItems.map(i => i.val), backgroundColor: CHART_COLORS.slice(0, 3), borderWidth: 0, hoverOffset: 2 }]
}

// Abreviar nombre: "Juan Martín" → "Juan M."
function abbrev(nombre: string) {
  const parts = nombre.trim().split(' ')
  return parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '')
}

const equipoBarData = {
  labels: espanaChartAgentes.map(a => abbrev(a.nombre)),
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
.bl-asignar { flex-shrink: 0; }
.bl-count { font-weight: 600; color: var(--n-800); }
.bl-trend { font-size: 11px; font-weight: 500; }
.bl-trend--up   { color: var(--success, #22c55e); }
.bl-trend--down { color: var(--error,   #ef4444); }
.bl-bar-track { height: 4px; border-radius: 99px; background: var(--n-100); overflow: hidden; }
.bl-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }

/* Resumen agente */
.am-list { display: flex; flex-direction: column; gap: 0; }
.am-row { display: flex; align-items: center; font-size: 12px; padding: 6px 0; border-bottom: 1px solid var(--n-100); cursor: pointer; gap: 4px; text-decoration: none; color: inherit; }
.am-row:last-child { border-bottom: none; }
.am-row:hover { background: var(--n-50, #fafafa); border-radius: 4px; }
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
.tv-info-icon { font-size: 12px; color: var(--n-400); margin-left: 5px; cursor: default; vertical-align: middle; }
.tv-header { display: grid; grid-template-columns: 1fr 36px 40px; align-items: center; padding: 0 4px 6px; border-bottom: 1px solid var(--n-150); margin-bottom: 2px; }
.tv-h-name { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.04em; }
.tv-h-stat { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.04em; text-align: right; }
.tv-row { display: grid; grid-template-columns: 16px 28px 1fr 36px 40px; align-items: center; gap: 6px; padding: 6px 4px; border-bottom: 1px solid var(--n-100); font-size: 12px; text-decoration: none; color: inherit; border-radius: 4px; }
.tv-row:last-child { border-bottom: none; }
.tv-row:hover { background: var(--n-50); }
.tv-rank { font-size: 11px; font-weight: 700; color: var(--n-400); text-align: right; }
.tv-name { font-weight: 500; color: var(--n-700); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tv-stat-num { font-weight: 600; color: var(--n-800); font-size: 12px; text-align: right; }
.tv-cr { color: var(--n-500); font-weight: 500; }

/* Equipo chart */
.equipo-chart-wrap { position: relative; }
.equipo-chart-scroll { overflow-x: auto; }
.label-tip {
  position: absolute;
  transform: translateX(-50%);
  background: var(--n-800);
  color: #fff;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}
.label-tip::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-bottom-color: var(--n-800);
  border-top: none;
}

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

@media (max-width: 480px) {
  .bolsa-inner          { flex-direction: column; gap: 16px; }
  .bolsa-donut          { max-width: 140px; width: 140px; align-self: center; }
  .bolsa-list           { width: 100%; }
  .bl-header            { flex-wrap: wrap; gap: 6px; }
  .ventas-tipo-inner    { flex-direction: column; gap: 16px; }
  .ventas-donut-wrap    { max-width: 140px; width: 140px; align-self: center; }
  .ventas-tipo-list     { width: 100%; }
}
</style>
