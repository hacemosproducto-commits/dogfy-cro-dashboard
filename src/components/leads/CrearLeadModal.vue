<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    dismissableMask
    style="width:380px"
    :pt="{ root: { class: 'crear-lead-dialog' } }"
  >
    <template #header>
      <span class="crear-lead-header"><i class="pi pi-user" /> Crear lead</span>
    </template>

    <div class="crear-form">
      <div class="form-row">
        <label>Teléfono <span class="req">*</span></label>
        <div class="tel-input">
          <Select
            v-model="form.paisTel"
            :options="['ES','FR','IT','DE']"
            class="tel-prefix"
          />
          <InputText v-model="form.telefono" placeholder="+34 000 000 000" class="tel-number" />
        </div>
      </div>
      <div class="form-row">
        <label>E-mail</label>
        <IconField>
          <InputIcon class="pi pi-envelope" />
          <InputText v-model="form.email" placeholder="tumejorcorreo@gmail.com" />
        </IconField>
      </div>
      <div class="form-row">
        <label>Agente</label>
        <Select v-model="form.agente" :options="agentesOptions" placeholder="Nombre agente" />
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
      <Button label="Crear" @click="handleCrear" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const agentesOptions = ['Juan Martín','Laura Ruiz','Carlos Díaz','Ana Soto','María Pérez','Pablo García']
const form = ref({ paisTel: 'ES', telefono: '', email: '', agente: '' })

function handleCrear() {
  // TODO: save lead
  form.value = { paisTel: 'ES', telefono: '', email: '', agente: '' }
  emit('update:visible', false)
}
</script>

<style scoped>
.crear-lead-header { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.crear-lead-header .pi { font-size: 14px; }
.crear-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.form-row .req { color: var(--brand); }
.form-row :deep(.p-inputtext),
.form-row :deep(.p-select),
.form-row :deep(.p-iconfield) { width: 100%; }
.tel-input { display: flex; gap: 6px; }
.tel-input .tel-prefix { width: 76px; flex-shrink: 0; }
.tel-input .tel-number { flex: 1; }
</style>
