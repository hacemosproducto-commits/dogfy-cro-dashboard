<template>
  <div class="config-view">
    <h2 class="view-title">Configuración</h2>

    <div class="config-grid">
      <div v-for="c in paises" :key="c.id" class="pais-card">

        <!-- ── Header ── -->
        <div class="pais-title">{{ c.flag }} {{ c.nombre }}</div>

        <hr class="sep" />

        <!-- ── Objetivo ── -->
        <div class="objetivo-row">
          <div class="objetivo-left">
            <span class="label-bold">Objetivo [mes actual]:</span>
            <InputNumber
              v-model="c.objetivos[CURRENT_MONTH]"
              :useGrouping="true"
              locale="es-ES"
              inputClass="objetivo-inp"
              @update:model-value="c.hasChanges = true"
            />
          </div>
          <button class="ver-ano-btn" @click="c.verAnio = !c.verAnio">
            Ver año <i :class="['pi', c.verAnio ? 'pi-chevron-up' : 'pi-chevron-down']" style="font-size:12px" />
          </button>
        </div>

        <!-- ── Months grid (expandido) ── -->
        <Transition name="expand">
          <div v-if="c.verAnio" class="month-grid">
            <div v-for="(m, i) in MESES" :key="m" class="month-col" :class="{ 'month-current': i === CURRENT_MONTH, 'month-past': i < CURRENT_MONTH }">
              <span class="month-label">{{ m }}</span>
              <InputNumber
                v-model="c.objetivos[i]"
                :useGrouping="false"
                :disabled="i < CURRENT_MONTH"
                inputClass="month-inp"
                @update:model-value="c.hasChanges = true"
              />
            </div>
          </div>
        </Transition>

        <hr class="sep" />

        <!-- ── Asignación de leads ── -->
        <div class="section-title">Asignación de leads</div>

        <div class="config-row">
          <span class="field-label">Prioridad:</span>
          <div class="radio-group">
            <label class="radio-opt">
              <RadioButton v-model="c.prioridad" value="reciente" @change="c.hasChanges = true" />
              <span>Más reciente</span>
            </label>
            <label class="radio-opt">
              <RadioButton v-model="c.prioridad" value="antiguo" @change="c.hasChanges = true" />
              <span>Más antiguo</span>
            </label>
          </div>
        </div>

        <div class="config-row">
          <span class="field-label">Tiempo (minutos):</span>
          <span class="stepper-wrap">
            <InputNumber
              v-model="c.tiempoMin"
              :min="1" :max="60"
              showButtons buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              inputClass="stepper-inp"
              @update:model-value="c.hasChanges = true"
            />
          </span>
        </div>

        <div class="config-row">
          <span class="field-label">Límite leads en bloque (TL):</span>
          <span class="stepper-wrap">
            <InputNumber
              v-model="c.limiteTL"
              :min="1" :max="500"
              showButtons buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              inputClass="stepper-inp"
              @update:model-value="c.hasChanges = true"
            />
          </span>
        </div>

        <div class="config-row">
          <span class="field-label">Límite autoasignación (agente):</span>
          <span class="stepper-wrap">
            <InputNumber
              v-model="c.limiteAgente"
              :min="1" :max="100"
              showButtons buttonLayout="horizontal"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              inputClass="stepper-inp"
              @update:model-value="c.hasChanges = true"
            />
          </span>
        </div>

        <hr class="sep" />

        <!-- ── Restricciones ── -->
        <div class="section-title">Restricciones</div>

        <div class="config-row">
          <span class="field-label">Llamar para cambiar estado del lead</span>
          <ToggleSwitch v-model="c.restricciones.llamarParaCambiar" @update:model-value="c.hasChanges = true" />
        </div>

        <div class="config-row">
          <span class="field-label">Habilitar horarios para leads nuevos</span>
          <ToggleSwitch v-model="c.restricciones.habilitarHorarios" @update:model-value="c.hasChanges = true" />
        </div>

        <Select
          v-if="c.restricciones.habilitarHorarios"
          v-model="c.restricciones.horario"
          :options="HORARIOS"
          style="width:100%;margin-top:8px"
          @change="c.hasChanges = true"
        />

        <hr class="sep" />

        <!-- ── Planes y gramaje ── -->
        <div class="section-title">Planes y gramaje</div>

        <div class="config-row">
          <span class="field-label">Override gramaje manual (agente)</span>
          <ToggleSwitch v-model="c.overrideGramaje" @update:model-value="c.hasChanges = true" />
        </div>

        <div class="config-row">
          <span class="field-label">Habilitar plan mixto</span>
          <ToggleSwitch v-model="c.planMixto" @update:model-value="c.hasChanges = true" />
        </div>

        <!-- ── Footer cuando hay cambios ── -->
        <Transition name="slide-up">
          <div v-if="c.hasChanges" class="card-footer">
            <Button label="Descartar" severity="secondary" size="small" text @click="discardChanges(c)" />
            <Button label="Guardar cambios" size="small" icon="pi pi-check" @click="saveConfig(c)" />
          </div>
        </Transition>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import ToggleSwitch from 'primevue/toggleswitch'
import Select from 'primevue/select'
import Button from 'primevue/button'

// ── Constants ──────────────────────────────────────────
const CURRENT_MONTH = 3   // Abril 2026 (0-indexed)
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const HORARIOS = [
  'Primeras 4 horas del turno',
  'Primeras 2 horas del turno',
  'Todo el turno',
  'Solo mañanas (8h–14h)',
]

// ── Types ──────────────────────────────────────────────
interface PaisConfig {
  id: string
  flag: string
  nombre: string
  objetivos: (number | null)[]
  prioridad: 'reciente' | 'antiguo'
  tiempoMin: number
  limiteTL: number
  limiteAgente: number
  restricciones: { llamarParaCambiar: boolean; habilitarHorarios: boolean; horario: string }
  overrideGramaje: boolean
  planMixto: boolean
  verAnio: boolean
  hasChanges: boolean
  _snapshot: string
}

// ── Factory ────────────────────────────────────────────
function makeConfig(id: string, flag: string, nombre: string, base: number): PaisConfig {
  // past months: historical actuals (slightly varied), future: planned targets
  const objetivos = Array.from({ length: 12 }, (_, i) =>
    i < CURRENT_MONTH
      ? Math.round(base * (0.88 + (i * 0.04)))     // historical, growing
      : i === CURRENT_MONTH
        ? base                                       // current target
        : Math.round(base * (1 + (i - CURRENT_MONTH) * 0.02)) // future, increasing
  )
  const c: PaisConfig = {
    id, flag, nombre, objetivos,
    prioridad: 'reciente',
    tiempoMin: 3,
    limiteTL: 30,
    limiteAgente: 10,
    restricciones: { llamarParaCambiar: true, habilitarHorarios: true, horario: HORARIOS[0] },
    overrideGramaje: false,
    planMixto: false,
    verAnio: false,
    hasChanges: false,
    _snapshot: '',
  }
  c._snapshot = snapshot(c)
  return c
}

function snapshot(c: PaisConfig) {
  return JSON.stringify({
    objetivos: c.objetivos,
    prioridad: c.prioridad,
    tiempoMin: c.tiempoMin,
    limiteTL: c.limiteTL,
    limiteAgente: c.limiteAgente,
    restricciones: c.restricciones,
    overrideGramaje: c.overrideGramaje,
    planMixto: c.planMixto,
  })
}

const paises = reactive<PaisConfig[]>([
  makeConfig('es', '🇪🇸', 'España',   133000),
  makeConfig('fr', '🇫🇷', 'Francia',   98000),
  makeConfig('it', '🇮🇹', 'Italia',    87000),
  makeConfig('de', '🇩🇪', 'Alemania', 112000),
])

function discardChanges(c: PaisConfig) {
  const orig = JSON.parse(c._snapshot)
  c.objetivos   = orig.objetivos
  c.prioridad   = orig.prioridad
  c.tiempoMin   = orig.tiempoMin
  c.limiteTL    = orig.limiteTL
  c.limiteAgente = orig.limiteAgente
  c.restricciones    = orig.restricciones
  c.overrideGramaje  = orig.overrideGramaje
  c.planMixto        = orig.planMixto
  c.hasChanges       = false
}

function saveConfig(c: PaisConfig) {
  c._snapshot  = snapshot(c)
  c.hasChanges = false
}
</script>

<style scoped>
/* ── Layout ────────────────────────────────────── */
.config-view { display: flex; flex-direction: column; gap: 16px; }
.view-title  { font-size: 20px; font-weight: 700; color: var(--n-900); }

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  align-items: start;
}

/* ── Card ──────────────────────────────────────── */
.pais-card {
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pais-title { font-size: 15px; font-weight: 700; color: var(--n-900); }
.sep { border: none; border-top: 1px solid var(--n-150); margin: 0; }
.section-title { font-size: 13px; font-weight: 700; color: var(--n-700); margin-top: 2px; }

/* ── Objetivo row ──────────────────────────────── */
.objetivo-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.objetivo-left { display: flex; align-items: center; gap: 10px; }
.label-bold { font-size: 13px; font-weight: 600; color: var(--n-700); white-space: nowrap; }

:deep(.objetivo-inp) {
  width: 110px;
  border: 1px solid var(--n-200);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  color: var(--n-800);
  font-weight: 500;
}

.ver-ano-btn {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer;
  font-size: 12px; font-weight: 500; color: var(--n-600);
  white-space: nowrap; padding: 4px 0;
}
.ver-ano-btn:hover { color: var(--brand); }

/* ── Month grid ────────────────────────────────── */
.month-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  padding: 10px 0 4px;
}

.month-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.month-label {
  font-size: 10px; font-weight: 600; color: var(--n-400);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.month-current .month-label { color: var(--brand); }
.month-past .month-label    { color: var(--n-300); }

:deep(.month-inp) {
  width: 100%; min-width: 0;
  border: 1px solid var(--n-200);
  border-radius: 5px;
  padding: 5px 4px;
  font-size: 11px;
  text-align: center;
  color: var(--n-800);
}
.month-current :deep(.month-inp) { border-color: var(--brand); background: #fff8f6; }
.month-past    :deep(.month-inp) { background: var(--n-50); color: var(--n-400); }

/* ── Config rows ───────────────────────────────── */
.config-row {
  display: flex; align-items: center;
  justify-content: space-between;
  gap: 12px; font-size: 13px;
}
.field-label { color: var(--n-600); flex: 1; line-height: 1.4; }

/* Radio group */
.radio-group { display: flex; gap: 14px; flex-shrink: 0; }
.radio-opt   { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: var(--n-700); }

/* ── Stepper (InputNumber horizontal) ─────────── */
.stepper-wrap { flex-shrink: 0; }

.stepper-wrap :deep(.p-inputnumber) {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--n-200);
  border-radius: 999px;
  overflow: hidden;
  height: 34px;
}
.stepper-wrap :deep(.p-inputnumber-button) {
  background: transparent;
  border: none;
  color: var(--n-600);
  width: 30px;
  height: 100%;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stepper-wrap :deep(.p-inputnumber-button:hover) { background: var(--n-100); }
.stepper-wrap :deep(.p-inputnumber-button .p-button-icon) { font-size: 11px; }
.stepper-wrap :deep(.stepper-inp) {
  width: 42px;
  border: none;
  border-left: 1px solid var(--n-150);
  border-right: 1px solid var(--n-150);
  border-radius: 0;
  padding: 0 4px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--n-800);
  height: 100%;
}

/* ── Footer ────────────────────────────────────── */
.card-footer {
  display: flex; justify-content: flex-end; align-items: center;
  gap: 8px; padding-top: 6px;
  border-top: 1px solid var(--n-100);
  margin-top: 4px;
}

/* ── Transitions ───────────────────────────────── */
.expand-enter-active, .expand-leave-active { transition: opacity .2s, max-height .25s ease; max-height: 200px; overflow: hidden; }
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: opacity .15s, transform .15s; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(6px); }

/* ── Responsive ────────────────────────────────── */

/* TH: 2 columns but compact — tighten padding and wrap long labels */
@media (max-width: 1100px) {
  .config-grid   { gap: 12px; }
  .pais-card     { padding: 14px 16px; }
  .config-row    { flex-wrap: wrap; gap: 6px; }
  .config-row .field-label { min-width: 100%; }
  .config-row .radio-group,
  .config-row .stepper-wrap { margin-left: auto; }
}

/* TV: single column */
@media (max-width: 900px) {
  .config-grid { grid-template-columns: 1fr; }
  .config-row  { flex-wrap: nowrap; }
  .config-row .field-label { min-width: unset; flex: 1; }
}

/* Mobile: compact month grid */
@media (max-width: 600px) {
  .month-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
