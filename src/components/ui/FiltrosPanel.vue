<template>
  <Drawer
    v-model:visible="visible"
    position="right"
    :header="panelTitle"
    class="filtros-drawer"
    style="width: 320px"
  >
    <div class="filtros-body">

      <!-- ── ESTADO ─────────────────────────── -->
      <section v-if="modo === 'leads'" class="filtros-section">
        <p class="filtros-section-label">Estado</p>
        <div class="check-grid">
          <label v-for="op in estadoLeadsOpts" :key="op.value" class="check-row">
            <Checkbox v-model="local.estados" :value="op.value" />
            <Tag :value="op.label" :severity="op.sev" class="check-tag" />
          </label>
        </div>
      </section>

      <section v-if="modo === 'ventas'" class="filtros-section">
        <p class="filtros-section-label">Plan</p>
        <div class="check-grid">
          <label class="check-row">
            <Checkbox v-model="local.planes" value="Prueba" />
            <span class="check-badge badge--prueba">Prueba</span>
          </label>
          <label class="check-row">
            <Checkbox v-model="local.planes" value="Mensualidad" />
            <span class="check-badge badge--mens">Mensualidad</span>
          </label>
        </div>
      </section>

      <section v-if="modo === 'errores'" class="filtros-section">
        <p class="filtros-section-label">Tipo de error</p>
        <div class="check-grid">
          <label class="check-row">
            <Checkbox v-model="local.tiposError" value="Recuperable" />
            <span class="check-label check-label--warn">Recuperable</span>
          </label>
          <label class="check-row">
            <Checkbox v-model="local.tiposError" value="No recuperable" />
            <span class="check-label check-label--danger">No recuperable</span>
          </label>
        </div>
      </section>

      <!-- ── CAMPAÑA ────────────────────────── -->
      <section class="filtros-section">
        <p class="filtros-section-label">Campaña</p>
        <Select
          v-model="local.campana"
          :options="campanaOpts"
          placeholder="Todas las campañas"
          showClear
          class="filtros-select"
        />
      </section>

      <!-- ── CUPÓN / REFERIDO (leads + ventas) -->
      <section v-if="modo !== 'errores'" class="filtros-section">
        <p class="filtros-section-label">Cupón / Referido</p>
        <InputText
          v-model="local.cupon"
          placeholder="Ej: BIENVENIDA10"
          class="filtros-input"
        />
      </section>

      <!-- ── FORMA DE PAGO (errores) ─────────── -->
      <section v-if="modo === 'errores'" class="filtros-section">
        <p class="filtros-section-label">Forma de pago</p>
        <Select
          v-model="local.formaPago"
          :options="formasPagoOpts"
          placeholder="Todas"
          showClear
          class="filtros-select"
        />
      </section>

      <!-- ── RANGO DE FECHAS Y HORA (ventas + errores) -->
      <section v-if="modo !== 'leads'" class="filtros-section">
        <p class="filtros-section-label">Rango de fecha y hora</p>
        <div class="date-range">
          <!-- Desde -->
          <div class="date-block">
            <span class="date-block-title">Desde</span>
            <div class="date-time-row">
              <DatePicker
                v-model="local.fechaDesde"
                placeholder="dd/mm/aaaa"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
                class="filtros-date filtros-date--date"
              />
              <DatePicker
                v-model="local.horaDesde"
                timeOnly
                placeholder="00:00"
                hourFormat="24"
                class="filtros-date filtros-date--time"
              />
            </div>
          </div>
          <!-- Hasta -->
          <div class="date-block">
            <span class="date-block-title">Hasta</span>
            <div class="date-time-row">
              <DatePicker
                v-model="local.fechaHasta"
                placeholder="dd/mm/aaaa"
                dateFormat="dd/mm/yy"
                showIcon
                iconDisplay="input"
                class="filtros-date filtros-date--date"
              />
              <DatePicker
                v-model="local.horaHasta"
                timeOnly
                placeholder="23:59"
                hourFormat="24"
                class="filtros-date filtros-date--time"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- ── IMPORTE (ventas) ───────────────── -->
      <section v-if="modo === 'ventas'" class="filtros-section">
        <p class="filtros-section-label">Importe</p>
        <div class="range-row">
          <div class="range-field">
            <label class="date-label">Mínimo (€)</label>
            <InputNumber
              v-model="local.importeMin"
              placeholder="0"
              :min="0"
              :inputStyle="{ width: '100%' }"
              class="filtros-number"
            />
          </div>
          <div class="range-sep">—</div>
          <div class="range-field">
            <label class="date-label">Máximo (€)</label>
            <InputNumber
              v-model="local.importeMax"
              placeholder="999"
              :min="0"
              :inputStyle="{ width: '100%' }"
              class="filtros-number"
            />
          </div>
        </div>
      </section>

    </div>

    <!-- Footer -->
    <template #footer>
      <div class="filtros-footer">
        <Button
          label="Limpiar todo"
          severity="secondary"
          text
          size="small"
          :disabled="!hasActiveFilters"
          @click="resetFilters"
        />
        <Button
          :label="applyLabel"
          size="small"
          style="flex:1"
          @click="applyFilters"
        />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'

export interface FiltrosValue {
  estados:    string[]
  planes:     string[]
  tiposError: string[]
  campana:    string
  cupon:      string
  formaPago:  string
  fechaDesde: Date | null
  fechaHasta: Date | null
  horaDesde:  Date | null
  horaHasta:  Date | null
  importeMin: number | null
  importeMax: number | null
}

const props = defineProps<{
  modo: 'leads' | 'ventas' | 'errores'
}>()

const emit = defineEmits<{
  apply: [filters: FiltrosValue]
}>()

const visible = defineModel<boolean>('visible', { default: false })

// ── Opciones ──────────────────────────────────────
const estadoLeadsOpts = [
  { value: 'Pendiente',      label: 'Pendiente',    sev: 'success'   },
  { value: 'No contesta',    label: 'No contesta',  sev: 'warn'      },
  { value: 'En cita',        label: 'En cita',      sev: 'info'      },
  { value: 'Formulario',     label: 'Formulario',   sev: 'contrast'  },
  { value: 'No interesa',    label: 'No interesa',  sev: 'danger'    },
  { value: 'Venta',          label: 'Venta',        sev: 'success'   },
]

const campanaOpts = computed(() =>
  props.modo === 'leads' || props.modo === 'ventas'
    ? ['Black Friday 2025', 'Halloween 2025', 'Verano 2025', 'Navidad 2024', 'San Valentín 2025']
    : ['Black Friday 2025', 'Halloween 2025', 'Verano 2025']
)

const formasPagoOpts = ['Visa', 'Mastercard', 'PayPal', 'Apple Pay']

// ── Estado local ──────────────────────────────────
function emptyFilters(): FiltrosValue {
  return {
    estados:    [],
    planes:     [],
    tiposError: [],
    campana:    '',
    cupon:      '',
    formaPago:  '',
    fechaDesde: null,
    fechaHasta: null,
    horaDesde:  null,
    horaHasta:  null,
    importeMin: null,
    importeMax: null,
  }
}
const local = ref<FiltrosValue>(emptyFilters())

// Resetear al abrir
watch(visible, v => { if (v) local.value = emptyFilters() })

const hasActiveFilters = computed(() => {
  const f = local.value
  return f.estados.length > 0 || f.planes.length > 0 || f.tiposError.length > 0
    || !!f.campana || !!f.cupon || !!f.formaPago
    || f.fechaDesde !== null || f.fechaHasta !== null
    || f.horaDesde !== null  || f.horaHasta !== null
    || f.importeMin !== null || f.importeMax !== null
})

const activeCount = computed(() => {
  const f = local.value
  let c = 0
  if (f.estados.length)    c++
  if (f.planes.length)     c++
  if (f.tiposError.length) c++
  if (f.campana)           c++
  if (f.cupon)             c++
  if (f.formaPago)         c++
  if (f.fechaDesde || f.fechaHasta || f.horaDesde || f.horaHasta) c++
  if (f.importeMin !== null || f.importeMax !== null) c++
  return c
})

const panelTitle = computed(() => {
  const base = props.modo === 'leads' ? 'Filtrar leads'
    : props.modo === 'ventas' ? 'Filtrar ventas'
    : 'Filtrar errores de pago'
  return activeCount.value ? `${base}  (${activeCount.value})` : base
})

const applyLabel = computed(() =>
  activeCount.value ? `Aplicar (${activeCount.value})` : 'Aplicar'
)

function resetFilters() {
  local.value = emptyFilters()
  emit('apply', emptyFilters())
  visible.value = false
}

function applyFilters() {
  emit('apply', { ...local.value })
  visible.value = false
}
</script>

<style scoped>
/* Body del panel */
.filtros-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 8px;
}

.filtros-section {
  padding: 16px 0;
  border-bottom: 1px solid var(--n-100);
}
.filtros-section:last-child { border-bottom: none; }

.filtros-section-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--n-400);
  margin: 0 0 10px;
}

/* Checkboxes */
.check-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.check-tag  { font-size: 11px; }
.check-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 99px;
}
.badge--prueba { background: #ede9fe; color: #6d28d9; }
.badge--mens   { background: #dbeafe; color: #1d4ed8; }

.check-label {
  font-size: 13px;
  font-weight: 500;
}
.check-label--warn   { color: #b45309; }
.check-label--danger { color: #dc2626; }

/* Selects e inputs */
.filtros-select,
.filtros-input { width: 100%; }
:deep(.filtros-select .p-select),
:deep(.filtros-input.p-inputtext) { width: 100%; font-size: 13px; }

/* Date + time range */
.date-range {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.date-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.date-block-title {
  font-size: 11px;
  color: var(--n-500);
  font-weight: 500;
}
.date-time-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.date-label {
  font-size: 11px;
  color: var(--n-500);
  font-weight: 500;
}
.filtros-date { width: 100%; }
.filtros-date--date { flex: 1; min-width: 0; }
.filtros-date--time { width: 80px; flex-shrink: 0; }
:deep(.filtros-date .p-datepicker-input) { font-size: 13px; width: 100%; }
:deep(.filtros-date--time .p-datepicker-input) { font-size: 13px; text-align: center; }

/* Importe range */
.range-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.range-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.range-sep { font-size: 14px; color: var(--n-400); padding-bottom: 8px; flex-shrink: 0; }
.filtros-number { width: 100%; }
:deep(.filtros-number .p-inputnumber-input) { font-size: 13px; }

/* Footer */
.filtros-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Drawer tweaks */
:deep(.filtros-drawer .p-drawer-header) {
  border-bottom: 1px solid var(--n-100);
  padding: 16px 20px;
}
:deep(.filtros-drawer .p-drawer-title) {
  font-size: 15px;
  font-weight: 600;
}
:deep(.filtros-drawer .p-drawer-content) {
  padding: 0 20px;
  overflow-y: auto;
}
:deep(.filtros-drawer .p-drawer-footer) {
  border-top: 1px solid var(--n-100);
  padding: 12px 20px;
}
</style>
