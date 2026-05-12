<template>
  <div class="kpi-card" :class="tone ? `kpi-tone-${tone}` : ''">
    <div class="kpi-top">
      <span class="kpi-value">{{ valor }}</span>
      <span v-if="badge" class="kpi-badge">{{ badge }}</span>
    </div>
    <div class="kpi-label">{{ label }}</div>

    <div v-if="progreso !== undefined && objetivo" class="kpi-progress-row">
      <ProgressBar :value="progresoPercent" class="kpi-progress" />
      <span class="kpi-progress-label">{{ progreso }}/{{ objetivo }}</span>
    </div>

    <div v-if="comparativa" class="kpi-comparativa" :class="tendencia === 'up' ? 'trend-up' : tendencia === 'down' ? 'trend-down' : 'text-subtle'">
      <i v-if="tendencia === 'up'" class="pi pi-arrow-up" style="font-size:9px" />
      <i v-if="tendencia === 'down'" class="pi pi-arrow-down" style="font-size:9px" />
      {{ comparativa }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProgressBar from 'primevue/progressbar'

const props = withDefaults(defineProps<{
  valor: string | number
  label: string
  comparativa?: string
  tendencia?: 'up' | 'down' | 'neutral'
  badge?: string
  progreso?: number
  objetivo?: number
  tone?: 'rose' | 'amber' | 'emerald' | 'violet'
}>(), {})

const progresoPercent = computed(() =>
  props.progreso !== undefined && props.objetivo
    ? Math.min(100, Math.round((props.progreso / props.objetivo) * 100))
    : 0
)
</script>

<style scoped>
.kpi-card {
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Tones — colored KPI variant */
.kpi-tone-rose    { background: #ffe4e6; border-color: #fecdd3; box-shadow: none; }
.kpi-tone-amber   { background: #fef9c3; border-color: #fef08a; box-shadow: none; }
.kpi-tone-emerald { background: #dcfce7; border-color: #bbf7d0; box-shadow: none; }
.kpi-tone-violet  { background: #f3e8ff; border-color: #e9d5ff; box-shadow: none; }

.kpi-tone-rose    .kpi-value,
.kpi-tone-amber   .kpi-value,
.kpi-tone-emerald .kpi-value,
.kpi-tone-violet  .kpi-value { color: #151d48; }

.kpi-tone-rose    .kpi-label,
.kpi-tone-amber   .kpi-label,
.kpi-tone-emerald .kpi-label,
.kpi-tone-violet  .kpi-label { color: #425166; }

.kpi-tone-rose    .kpi-comparativa,
.kpi-tone-amber   .kpi-comparativa,
.kpi-tone-emerald .kpi-comparativa,
.kpi-tone-violet  .kpi-comparativa { color: #4079ed; }

.kpi-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--n-900);
  line-height: 1;
  letter-spacing: -0.5px;
}

.kpi-badge {
  font-size: 10px;
  background: var(--n-100);
  color: var(--n-600);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
  margin-top: 2px;
}

.kpi-label {
  font-size: 12px;
  color: var(--n-500);
  font-weight: 400;
  margin-top: 2px;
}

.kpi-progress-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.kpi-progress       { flex: 1; height: 5px !important; }
.kpi-progress-label { font-size: 11px; color: var(--n-400); white-space: nowrap; }

:deep(.kpi-progress .p-progressbar-value) { background: var(--success) !important; }

.kpi-comparativa {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
  font-weight: 500;
}
</style>
