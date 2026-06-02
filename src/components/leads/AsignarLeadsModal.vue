<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissableMask
    :style="{ width: '540px', maxWidth: '95vw' }"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-icon">
          <i class="pi pi-users" />
        </span>
        <div>
          <div class="modal-title">Asignación de leads</div>
          <div class="modal-subtitle">Selecciona tipo, cantidad y agentes</div>
        </div>
      </div>
    </template>

    <div class="asig-modal">
      <div class="asig-tabs-wrap">
        <SelectButton v-model="tipoAsig" :options="tipoOptions" optionLabel="label" optionValue="value" />
      </div>
      <p class="asig-info">
        Leads <strong>{{ tipoAsig }}</strong> disponibles:
        <strong>{{ tipoAsig === 'No contesta' ? '456' : '3.085' }}</strong>
      </p>
      <div class="asig-cantidad-row">
        <span class="asig-cantidad-label">Cantidad por agente</span>
        <InputNumber v-model="cantidad" showButtons buttonLayout="horizontal" :min="1" :inputStyle="{ width: '56px', textAlign: 'center' }" />
      </div>
      <div class="asig-agentes-section">
        <p class="asig-agentes-label">Agentes</p>
        <div class="asig-agentes-box">
          <div class="asig-agentes-grid">
            <div class="asig-col">
              <label class="asig-check-row">
                <Checkbox :modelValue="allSelected" :binary="true" @update:modelValue="toggleAll" />
                <span class="asig-agent-name">Seleccionar todos</span>
              </label>
              <label class="asig-check-row" v-for="a in leftCol" :key="a.id">
                <Checkbox v-model="selectedAgentes" :value="a.id" />
                <span class="asig-agent-name">{{ a.nombre }}</span>
              </label>
            </div>
            <div class="asig-col">
              <label class="asig-check-row" v-for="a in rightCol" :key="a.id">
                <Checkbox v-model="selectedAgentes" :value="a.id" />
                <span class="asig-agent-name">{{ a.nombre }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined style="flex:1" @click="visible = false" />
      <Button label="Asignar" style="flex:1" @click="visible = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'
import InputNumber from 'primevue/inputnumber'
import { mockAgentes } from '@/data/mock'

const visible = defineModel<boolean>('visible', { default: false })

const props = defineProps<{
  /** Pre-selecciona un agente (desde detalle del agente) */
  preselectAgenteId?: string
  /** Pre-selecciona múltiples agentes (desde bulk action en la lista) */
  preselectAgenteIds?: string[]
}>()

const tipoOptions = [
  { label: 'No contesta  [456]',     value: 'No contesta'    },
  { label: 'No gestionado  [3.085]', value: 'No gestionados' },
]
const tipoAsig        = ref('No contesta')
const cantidad        = ref(10)
const selectedAgentes = ref<string[]>([])

watch(visible, (open) => {
  if (!open) return
  if (props.preselectAgenteIds?.length) {
    selectedAgentes.value = [...props.preselectAgenteIds]
  } else if (props.preselectAgenteId) {
    selectedAgentes.value = [props.preselectAgenteId]
  } else {
    selectedAgentes.value = []
  }
})

const half    = Math.ceil(mockAgentes.length / 2)
const leftCol = mockAgentes.slice(0, half)
const rightCol = mockAgentes.slice(half)

const allSelected = computed(() => selectedAgentes.value.length === mockAgentes.length)
function toggleAll(val: boolean) {
  selectedAgentes.value = val ? mockAgentes.map(a => a.id) : []
}
</script>

<style scoped>
/* ── Header ─────────────────────────────────────── */
.modal-header  { display: flex; align-items: flex-start; gap: 12px; }
.modal-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--n-100); color: var(--n-600);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

/* ── Body ───────────────────────────────────────── */
.asig-modal { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }
.asig-tabs-wrap { display: flex; justify-content: center; }
.asig-info { font-size: 14px; color: var(--n-700); }
.asig-cantidad-row { display: flex; align-items: center; gap: 16px; }
.asig-cantidad-label { font-size: 14px; color: var(--n-700); }
.asig-agentes-section { display: flex; flex-direction: column; gap: 8px; }
.asig-agentes-label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.asig-agentes-box { border: 1px solid var(--n-200); border-radius: 8px; padding: 16px; }
.asig-agentes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.asig-col { display: flex; flex-direction: column; gap: 12px; }
.asig-check-row { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.asig-agent-name { font-size: 13px; color: var(--n-700); }
</style>
