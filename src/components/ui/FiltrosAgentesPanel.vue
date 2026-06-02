<template>
  <Drawer v-model:visible="visible" position="right" header="Filtrar agentes" class="filtros-drawer" style="width:300px">
    <div class="filtros-body">

      <!-- País -->
      <section class="filtros-section">
        <p class="filtros-section-label">País</p>
        <div class="check-grid">
          <label v-for="p in paises" :key="p.value" class="check-row">
            <Checkbox v-model="local.paises" :value="p.value" />
            <span class="check-label">{{ p.flag }} {{ p.label }}</span>
          </label>
        </div>
      </section>

      <!-- CR % -->
      <section class="filtros-section">
        <p class="filtros-section-label">CR %</p>
        <div class="range-row">
          <div class="range-field">
            <label class="date-label">Mín</label>
            <InputNumber v-model="local.crMin" placeholder="0" :min="0" :max="100"
              suffix="%" :inputStyle="{ width: '100%' }" class="filtros-number" />
          </div>
          <div class="range-sep">—</div>
          <div class="range-field">
            <label class="date-label">Máx</label>
            <InputNumber v-model="local.crMax" placeholder="100" :min="0" :max="100"
              suffix="%" :inputStyle="{ width: '100%' }" class="filtros-number" />
          </div>
        </div>
      </section>

      <!-- Llamadas/día -->
      <section class="filtros-section">
        <p class="filtros-section-label">Llamadas / día</p>
        <div class="range-row">
          <div class="range-field">
            <label class="date-label">Mín</label>
            <InputNumber v-model="local.llamadasMin" placeholder="0" :min="0"
              :inputStyle="{ width: '100%' }" class="filtros-number" />
          </div>
          <div class="range-sep">—</div>
          <div class="range-field">
            <label class="date-label">Máx</label>
            <InputNumber v-model="local.llamadasMax" placeholder="∞" :min="0"
              :inputStyle="{ width: '100%' }" class="filtros-number" />
          </div>
        </div>
      </section>

    </div>

    <template #footer>
      <div class="filtros-footer">
        <Button label="Limpiar todo" severity="secondary" text size="small"
          :disabled="!hasActive" @click="reset" />
        <Button :label="applyLabel" size="small" style="flex:1" @click="apply" />
      </div>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'

export interface FiltrosAgentesValue {
  paises:      string[]
  crMin:       number | null
  crMax:       number | null
  llamadasMin: number | null
  llamadasMax: number | null
}

const emit = defineEmits<{ apply: [f: FiltrosAgentesValue] }>()
const visible = defineModel<boolean>('visible', { default: false })

const paises = [
  { value: 'España',   label: 'España',   flag: '🇪🇸' },
  { value: 'Francia',  label: 'Francia',  flag: '🇫🇷' },
  { value: 'Italia',   label: 'Italia',   flag: '🇮🇹' },
  { value: 'Alemania', label: 'Alemania', flag: '🇩🇪' },
]

function empty(): FiltrosAgentesValue {
  return { paises: [], crMin: null, crMax: null, llamadasMin: null, llamadasMax: null }
}
const local = ref<FiltrosAgentesValue>(empty())
watch(visible, v => { if (v) local.value = empty() })

const hasActive = computed(() => {
  const f = local.value
  return f.paises.length > 0 || f.crMin !== null || f.crMax !== null
    || f.llamadasMin !== null || f.llamadasMax !== null
})

const activeCount = computed(() => {
  const f = local.value; let c = 0
  if (f.paises.length) c++
  if (f.crMin !== null || f.crMax !== null) c++
  if (f.llamadasMin !== null || f.llamadasMax !== null) c++
  return c
})

const applyLabel = computed(() => activeCount.value ? `Aplicar (${activeCount.value})` : 'Aplicar')

function reset() { local.value = empty(); emit('apply', empty()); visible.value = false }
function apply() { emit('apply', { ...local.value }); visible.value = false }
</script>

<style scoped>
.filtros-body { display: flex; flex-direction: column; padding-bottom: 8px; }
.filtros-section { padding: 16px 0; border-bottom: 1px solid var(--n-100); }
.filtros-section:last-child { border-bottom: none; }
.filtros-section-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--n-400); margin: 0 0 10px; }
.check-grid { display: flex; flex-direction: column; gap: 8px; }
.check-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.check-label { font-size: 13px; color: var(--n-700); }
.range-row { display: flex; align-items: flex-end; gap: 8px; }
.range-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.range-sep { font-size: 14px; color: var(--n-400); padding-bottom: 8px; flex-shrink: 0; }
.date-label { font-size: 11px; color: var(--n-500); font-weight: 500; }
.filtros-number { width: 100%; }
:deep(.filtros-number .p-inputnumber-input) { font-size: 13px; }
.filtros-footer { display: flex; align-items: center; gap: 8px; }
:deep(.filtros-drawer .p-drawer-header) { border-bottom: 1px solid var(--n-100); padding: 16px 20px; }
:deep(.filtros-drawer .p-drawer-title) { font-size: 15px; font-weight: 600; }
:deep(.filtros-drawer .p-drawer-content) { padding: 0 20px; overflow-y: auto; }
:deep(.filtros-drawer .p-drawer-footer) { border-top: 1px solid var(--n-100); padding: 12px 20px; }
</style>
