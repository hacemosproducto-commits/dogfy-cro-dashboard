<template>
  <Dialog v-model:visible="localVisible" header="Crear cita" modal dismissableMask style="width:440px">
    <div class="crear-form">
      <div class="form-row">
        <label>Título</label>
        <InputText v-model="form.titulo" placeholder="Título de la cita" />
      </div>
      <div class="form-row">
        <label>Lead</label>
        <InputText v-model="form.lead" placeholder="Buscar lead..." />
      </div>
      <div class="form-row">
        <label>Fecha y hora</label>
        <DatePicker v-model="form.fecha" showTime hourFormat="24" fluid />
      </div>
      <div class="form-row">
        <label>Notas</label>
        <Textarea v-model="form.notas" rows="3" style="width:100%" />
      </div>
    </div>
    <template #footer>
      <Button label="Cancelar" severity="secondary" @click="localVisible = false" />
      <Button label="Crear cita" @click="handleGuardar" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: { titulo: string; lead: string; fecha: Date | null; notas: string }]
}>()

const localVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

function initForm() {
  return { titulo: '', lead: '', fecha: null as Date | null, notas: '' }
}

const form = ref(initForm())
watch(() => props.visible, (v) => { if (v) form.value = initForm() })

function handleGuardar() {
  emit('save', { ...form.value })
  emit('update:visible', false)
}
</script>

<style scoped>
.crear-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--n-700, #374151); }
.form-row :deep(.p-inputtext),
.form-row :deep(.p-datepicker),
.form-row :deep(.p-textarea) { width: 100%; }
</style>
