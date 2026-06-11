<template>
  <div class="export-view">
    <h2 class="view-title">Exportaciones</h2>

    <div class="export-card">
      <div class="export-form">

        <!-- Datos a exportar -->
        <div class="form-row">
          <label>Datos a exportar</label>
          <Select v-model="tipo" :options="TIPOS" placeholder="" />
        </div>

        <!-- Fechas -->
        <div class="dates-row">
          <div class="form-row">
            <label>Fecha inicial</label>
            <DatePicker v-model="fechaInicial" dateFormat="yy-mm-dd" placeholder="" />
          </div>
          <div class="form-row">
            <label>Fecha final</label>
            <DatePicker v-model="fechaFinal" dateFormat="yy-mm-dd" placeholder="" />
          </div>
        </div>

        <!-- Acción -->
        <div class="form-actions">
          <Button label="Exportar" icon="pi pi-download" :disabled="!tipo" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

const TIPOS = [
  'Leads',
  'Ventas por agente',
  'Tipologías y estados de leads por agente',
  'Estadísticas de venta global',
  'Estadísticas de venta por agente',
]

const tipo         = ref('')
const fechaInicial = ref<Date | null>(null)
const fechaFinal   = ref<Date | null>(null)
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
.form-row :deep(.p-datepicker) { width: 100%; }

.dates-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-actions { padding-top: 4px; }
</style>
