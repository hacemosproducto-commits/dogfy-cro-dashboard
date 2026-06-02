<template>
  <template v-for="chip in chips" :key="chip.key">
    <span class="filtro-chip">
      <span class="filtro-chip-label">{{ chip.label }}</span>
      <button class="filtro-chip-x" @click="remove(chip.key)" :aria-label="`Quitar filtro ${chip.label}`">
        <i class="pi pi-times" />
      </button>
    </span>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FiltrosValue } from './FiltrosPanel.vue'

const props = defineProps<{
  modelValue: FiltrosValue | null
}>()
const emit = defineEmits<{
  'update:modelValue': [v: FiltrosValue | null]
}>()

function fmt(d: Date | null) {
  if (!d) return ''
  const h = d.getHours?.()
  if (h !== undefined && d.getDate === undefined) {
    // time-only Date (from timeOnly picker): show HH:MM
    return `${String(h).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' })
}

const chips = computed(() => {
  const f = props.modelValue
  if (!f) return []
  const list: { key: string; label: string }[] = []

  if (f.estados.length)
    list.push({ key: 'estados', label: f.estados.length === 1 ? f.estados[0] : `Estado (${f.estados.length})` })
  if (f.planes.length)
    list.push({ key: 'planes', label: f.planes.length === 1 ? f.planes[0] : `Plan (${f.planes.length})` })
  if (f.tiposError.length)
    list.push({ key: 'tiposError', label: f.tiposError.length === 1 ? f.tiposError[0] : `Tipo (${f.tiposError.length})` })
  if (f.campana)
    list.push({ key: 'campana', label: f.campana })
  if (f.cupon)
    list.push({ key: 'cupon', label: `Cupón: ${f.cupon}` })
  if (f.formaPago)
    list.push({ key: 'formaPago', label: f.formaPago })

  // Fecha/hora: un solo chip compacto
  const desde = [fmt(f.fechaDesde), fmt(f.horaDesde)].filter(Boolean).join(' ')
  const hasta  = [fmt(f.fechaHasta), fmt(f.horaHasta)].filter(Boolean).join(' ')
  if (desde || hasta) {
    const label = desde && hasta ? `${desde} → ${hasta}` : desde || hasta
    list.push({ key: 'fechas', label })
  }

  if (f.importeMin !== null || f.importeMax !== null) {
    const min = f.importeMin !== null ? `${f.importeMin}€` : '0€'
    const max = f.importeMax !== null ? `${f.importeMax}€` : '∞'
    list.push({ key: 'importe', label: `${min} – ${max}` })
  }

  return list
})

function remove(key: string) {
  if (!props.modelValue) return
  const f = { ...props.modelValue }
  if (key === 'estados')    f.estados    = []
  if (key === 'planes')     f.planes     = []
  if (key === 'tiposError') f.tiposError = []
  if (key === 'campana')    f.campana    = ''
  if (key === 'cupon')      f.cupon      = ''
  if (key === 'formaPago')  f.formaPago  = ''
  if (key === 'fechas')     { f.fechaDesde = null; f.fechaHasta = null; f.horaDesde = null; f.horaHasta = null }
  if (key === 'importe')    { f.importeMin = null; f.importeMax = null }

  // Si quedan filtros activos emitir el objeto; si no, emitir null
  const hasAny = f.estados.length || f.planes.length || f.tiposError.length
    || f.campana || f.cupon || f.formaPago
    || f.fechaDesde || f.fechaHasta || f.horaDesde || f.horaHasta
    || f.importeMin !== null || f.importeMax !== null
  emit('update:modelValue', hasAny ? f : null)
}
</script>

<style scoped>
.filtro-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fdf1ed;
  color: var(--brand);
  border: 1px solid #f5c5b4;
  border-radius: 99px;
  padding: 2px 6px 2px 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.filtro-chip-x {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: var(--brand);
  opacity: 0.65;
  transition: opacity 0.12s;
  border-radius: 50%;
}
.filtro-chip-x:hover { opacity: 1; background: rgba(239,105,72,.12); }
.filtro-chip-x .pi { font-size: 9px; }
</style>
