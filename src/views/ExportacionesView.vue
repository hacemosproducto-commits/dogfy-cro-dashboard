<template>
  <div class="export-view">
    <h2 class="view-title">Exportaciones</h2>

    <div class="export-card">
      <div class="export-form">

        <!-- Tipo -->
        <div class="form-row">
          <label>Tipo de exportación</label>
          <Select v-model="tipo" :options="TIPOS" placeholder="Seleccionar tipo" />
        </div>

        <!-- Ámbito -->
        <div class="form-row">
          <label>Ámbito</label>
          <div class="ambito-tabs">
            <button
              v-for="opt in AMBITO_OPTS"
              :key="opt.value"
              class="ambito-tab"
              :class="{ 'ambito-tab--active': ambito === opt.value }"
              type="button"
              @click="ambito = opt.value; seleccion = []"
            >{{ opt.label }}</button>
          </div>
        </div>

        <!-- MultiSelect -->
        <div class="form-row">
          <label>{{ ambitoLabel }}</label>
          <MultiSelect
            v-model="seleccion"
            :options="ambitoOpciones"
            :placeholder="`Seleccionar ${ambitoLabel.toLowerCase()}`"
            display="chip"
            :maxSelectedLabels="4"
            filter
          />
        </div>

        <!-- Período -->
        <div class="form-row">
          <label>Período</label>
          <DatePicker v-model="rango" selectionMode="range" placeholder="Seleccionar rango de fechas" />
        </div>

        <!-- Acción -->
        <div class="form-actions">
          <Button label="Exportar CSV" icon="pi pi-download" :disabled="!tipo" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import { mockAgentes } from '@/data/mock'

const TIPOS = [
  'Leads',
  'Ventas por agente',
  'Tipologías y estados de leads por agente',
  'Estadísticas de venta global',
  'Estadísticas de venta por agente',
]

const AMBITO_OPTS: { label: string; value: 'agentes' | 'equipos' | 'paises' }[] = [
  { label: 'Agentes',     value: 'agentes'  },
  { label: 'Equipos',     value: 'equipos'  },
  { label: 'Países',      value: 'paises'   },
]

const EQUIPOS = ['Equipo España A', 'Equipo España B', 'Equipo Francia', 'Equipo Italia', 'Equipo Alemania', 'Equipo Portugal']
const PAISES  = ['España', 'Francia', 'Italia', 'Alemania', 'Portugal']

const tipo      = ref('')
const ambito    = ref<'agentes' | 'equipos' | 'paises'>('agentes')
const seleccion = ref<string[]>([])
const rango     = ref(null)

const ambitoOpciones = computed(() => {
  if (ambito.value === 'agentes') return mockAgentes.map(a => a.nombre)
  if (ambito.value === 'equipos') return EQUIPOS
  if (ambito.value === 'paises')  return PAISES
  return []
})

const ambitoLabel = computed(() => {
  const map: Record<string, string> = { agentes: 'Agentes', equipos: 'Equipos', paises: 'Países' }
  return map[ambito.value] ?? ''
})
</script>

<style scoped>
.export-view { display: flex; flex-direction: column; gap: 16px; }
.view-title  { font-size: 20px; font-weight: 700; color: var(--n-900); }

.export-card {
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  padding: 20px;
  width: 480px;
}

.export-form { display: flex; flex-direction: column; gap: 14px; }

.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.form-row :deep(.p-select),
.form-row :deep(.p-multiselect),
.form-row :deep(.p-datepicker) { width: 100%; }

/* Ámbito tabs */
.ambito-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--n-200);
  border-radius: 8px;
  overflow: hidden;
}
.ambito-tab {
  flex: 1;
  padding: 7px 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--n-500);
  background: #fff;
  border: none;
  border-right: 1px solid var(--n-200);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.ambito-tab:last-child { border-right: none; }
.ambito-tab:hover { background: var(--n-50, #f9fafb); color: var(--n-700); }
.ambito-tab--active {
  background: var(--n-100, #f3f4f6);
  color: var(--n-800, #1f2937);
  font-weight: 600;
}

.form-actions { padding-top: 4px; }
</style>
