<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    dismissableMask
    style="width: 420px"
  >
    <template #header>
      <span class="cr-header">
        <i class="pi pi-calendar" style="font-size:16px" />
        Crear recordatorio
      </span>
    </template>

    <div class="cr-form">
      <!-- Nota -->
      <div class="cr-field">
        <label class="cr-label">Nota</label>
        <Textarea v-model="form.nota" rows="3" autoResize placeholder="Escribe una nota…" />
      </div>

      <!-- Cuando -->
      <div class="cr-field">
        <label class="cr-label">Cuando:</label>
        <div class="cr-cuando">
          <label v-for="opt in cuandoOpts" :key="opt.value" class="cr-radio-label">
            <RadioButton v-model="cuando" :value="opt.value" />
            <span>{{ opt.label }}</span>
          </label>
        </div>
      </div>

      <!-- Fecha solo si Personalizado -->
      <div class="cr-field" v-if="cuando === 'personalizado'">
        <label class="cr-label">Fecha</label>
        <DatePicker
          v-model="form.fecha"
          date-format="dd/mm/yy"
          :min-date="hoy"
          show-icon
          fluid
        />
      </div>

      <!-- Hora -->
      <div class="cr-field">
        <label class="cr-label">Hora</label>
        <DatePicker v-model="form.hora" timeOnly hourFormat="24" fluid placeholder="12:30" />
      </div>

      <!-- Lead (opcional) -->
      <div class="cr-field">
        <label class="cr-label">Lead relacionado <span class="cr-optional">(opcional)</span></label>
        <InputText v-model="form.lead" placeholder="Nombre o ID del lead…" />
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
      <Button label="Crear" :disabled="!form.nota.trim()" @click="handleGuardar" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import RadioButton from 'primevue/radiobutton'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: { nota: string; lead: string; fecha: Date }]
}>()

const cuandoOpts = [
  { label: 'Hoy',          value: 'hoy'           },
  { label: 'Mañana',       value: 'manana'        },
  { label: 'Personalizado', value: 'personalizado' },
]

const hoy = new Date()

function initForm() {
  return { nota: '', lead: '', fecha: null as Date | null, hora: null as Date | null }
}

const form = ref(initForm())
const cuando = ref<'hoy' | 'manana' | 'personalizado'>('hoy')

watch(() => props.visible, (v) => {
  if (v) { form.value = initForm(); cuando.value = 'hoy' }
})

function handleGuardar() {
  const base = cuando.value === 'hoy'    ? new Date() :
               cuando.value === 'manana' ? (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d })() :
               (form.value.fecha ?? new Date())
  if (form.value.hora) {
    base.setHours(form.value.hora.getHours(), form.value.hora.getMinutes(), 0, 0)
  }
  emit('save', { nota: form.value.nota, lead: form.value.lead, fecha: base })
  emit('update:visible', false)
}
</script>

<style scoped>
.cr-header { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; }

.cr-form { display: flex; flex-direction: column; gap: 12px; }
.cr-field { display: flex; flex-direction: column; gap: 6px; }
.cr-label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.cr-optional { font-weight: 400; color: var(--n-400); }

.cr-cuando { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.cr-radio-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--n-700); cursor: pointer; white-space: nowrap; }

.cr-field :deep(.p-inputtext),
.cr-field :deep(.p-textarea),
.cr-field :deep(.p-datepicker) { width: 100%; }

:deep(.p-dialog-footer) { display: flex; gap: 10px; }
:deep(.p-dialog-footer .p-button) { flex: 1; justify-content: center; }
</style>
