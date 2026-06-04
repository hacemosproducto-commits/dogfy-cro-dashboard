<template>
  <div class="config-view">
    <h2 class="view-title">Configuración</h2>

    <div class="config-card">

      <!-- ── Asignación de leads ── -->
      <div class="section-title">Asignación de leads</div>

      <div class="config-row">
        <span class="field-label">Prioridad:</span>
        <div class="radio-group">
          <label class="radio-opt">
            <RadioButton v-model="config.prioridad" value="reciente" @change="config.hasChanges = true" />
            <span>Más reciente</span>
          </label>
          <label class="radio-opt">
            <RadioButton v-model="config.prioridad" value="antiguo" @change="config.hasChanges = true" />
            <span>Más antiguo</span>
          </label>
        </div>
      </div>

      <div class="config-row">
        <span class="field-label">Tiempo (minutos):</span>
        <span class="stepper-wrap">
          <InputNumber
            v-model="config.tiempoMin"
            :min="1" :max="60"
            showButtons buttonLayout="horizontal"
            decrementButtonIcon="pi pi-minus"
            incrementButtonIcon="pi pi-plus"
            inputClass="stepper-inp"
            @update:model-value="config.hasChanges = true"
          />
        </span>
      </div>

      <hr class="sep" />

      <!-- ── Restricciones ── -->
      <div class="section-title">Restricciones</div>

      <div class="config-row">
        <span class="field-label">Llamar para poder cambiar el estado del lead</span>
        <ToggleSwitch v-model="config.llamarParaCambiar" @update:model-value="config.hasChanges = true" />
      </div>

      <!-- ── Footer ── -->
      <Transition name="slide-up">
        <div v-if="config.hasChanges" class="card-footer">
          <Button label="Descartar" severity="secondary" size="small" text @click="discard" />
          <Button label="Guardar cambios" size="small" icon="pi pi-check" @click="save" />
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import InputNumber from 'primevue/inputnumber'
import RadioButton from 'primevue/radiobutton'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'

const config = reactive({
  prioridad: 'reciente' as 'reciente' | 'antiguo',
  tiempoMin: 3,
  llamarParaCambiar: true,
  hasChanges: false,
  _snap: '',
})
config._snap = JSON.stringify({ prioridad: config.prioridad, tiempoMin: config.tiempoMin, llamarParaCambiar: config.llamarParaCambiar })

function save() {
  config._snap = JSON.stringify({ prioridad: config.prioridad, tiempoMin: config.tiempoMin, llamarParaCambiar: config.llamarParaCambiar })
  config.hasChanges = false
}
function discard() {
  const s = JSON.parse(config._snap)
  config.prioridad = s.prioridad
  config.tiempoMin = s.tiempoMin
  config.llamarParaCambiar = s.llamarParaCambiar
  config.hasChanges = false
}
</script>

<style scoped>
.config-view { display: flex; flex-direction: column; gap: 16px; }
.view-title  { font-size: 20px; font-weight: 700; color: var(--n-900); }

.config-card {
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}

.sep           { border: none; border-top: 1px solid var(--n-150); margin: 2px 0; }
.section-title { font-size: 13px; font-weight: 700; color: var(--n-700); }

.config-row {
  display: flex; align-items: center;
  justify-content: space-between;
  gap: 12px; font-size: 13px;
}
.field-label { color: var(--n-600); flex: 1; line-height: 1.4; }

.radio-group { display: flex; gap: 14px; flex-shrink: 0; }
.radio-opt   { display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: var(--n-700); }

.stepper-wrap { flex-shrink: 0; }
.stepper-wrap :deep(.p-inputnumber) {
  display: inline-flex; align-items: center;
  border: 1px solid var(--n-200); border-radius: 999px;
  overflow: hidden; height: 34px;
}
.stepper-wrap :deep(.p-inputnumber-button) {
  background: transparent; border: none; color: var(--n-600);
  width: 30px; height: 100%; padding: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.stepper-wrap :deep(.p-inputnumber-button:hover) { background: var(--n-100); }
.stepper-wrap :deep(.p-inputnumber-button .p-button-icon) { font-size: 11px; }
.stepper-wrap :deep(.stepper-inp) {
  width: 42px; border: none;
  border-left: 1px solid var(--n-150);
  border-right: 1px solid var(--n-150);
  border-radius: 0; padding: 0 4px;
  text-align: center; font-size: 13px; font-weight: 600;
  color: var(--n-800); height: 100%;
}

.card-footer {
  display: flex; justify-content: flex-end; align-items: center;
  gap: 8px; padding-top: 8px;
  border-top: 1px solid var(--n-100);
}

.slide-up-enter-active, .slide-up-leave-active { transition: opacity .15s, transform .15s; }
.slide-up-enter-from,   .slide-up-leave-to     { opacity: 0; transform: translateY(6px); }

@media (max-width: 600px) {
  .config-card { max-width: 100%; padding: 16px; }
  .config-row  { flex-wrap: wrap; gap: 8px; }
  .config-row .field-label { min-width: 100%; }
  .radio-group, .stepper-wrap { margin-left: auto; }
}
</style>
