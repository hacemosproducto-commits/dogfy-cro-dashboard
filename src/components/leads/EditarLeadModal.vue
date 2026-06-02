<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    dismissableMask
    style="width: 440px"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-icon"><i class="pi pi-user" /></span>
        <div>
          <div class="modal-title">Editar contacto</div>
        </div>
      </div>
    </template>

    <div class="el-form">
      <div class="el-field">
        <label>Nombre <span class="req">*</span></label>
        <InputText v-model="form.nombre" placeholder="Mi nombre es..." />
      </div>
      <div class="el-field">
        <label>Apellido <span class="req">*</span></label>
        <InputText v-model="form.apellido" placeholder="Mi apellido es..." />
      </div>
      <div class="el-field">
        <label>E-mail</label>
        <IconField>
          <InputIcon class="pi pi-envelope" />
          <InputText v-model="form.email" placeholder="tumejorcorreo@gmail.com" />
        </IconField>
      </div>
      <div class="el-field">
        <label>Teléfono</label>
        <div class="tel-input">
          <Select v-model="form.paisTel" :options="['ES','FR','IT','DE']" class="tel-prefix" />
          <InputText v-model="form.telefono" placeholder="+34 000 000 000" class="tel-number" />
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
      <Button label="Guardar" :disabled="!canSave" @click="handleGuardar" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

interface LeadData {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  paisTel?: string
}

const props = defineProps<{
  visible: boolean
  lead?: LeadData | null
}>()
const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: typeof form.value]
}>()

function initForm(lead?: LeadData | null) {
  return {
    nombre:   lead?.nombre   ?? '',
    apellido: lead?.apellido ?? '',
    email:    lead?.email    ?? '',
    paisTel:  lead?.paisTel  ?? 'ES',
    telefono: lead?.telefono ?? '',
  }
}

const form = ref(initForm(props.lead))
watch(() => [props.visible, props.lead], () => {
  if (props.visible) form.value = initForm(props.lead)
})

const canSave = computed(() =>
  form.value.nombre.trim() !== '' &&
  form.value.apellido.trim() !== ''
)

function handleGuardar() {
  emit('save', form.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-header   { display: flex; align-items: center; gap: 12px; }
.modal-icon     { width: 36px; height: 36px; border-radius: 50%; background: var(--n-100); color: var(--n-600); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

.el-form { display: flex; flex-direction: column; gap: 16px; }
.el-field { display: flex; flex-direction: column; gap: 6px; }
.el-field label { font-size: 12px; font-weight: 500; color: var(--n-700, #374151); }
.req { color: var(--brand, #ef6948); }
.el-field :deep(.p-inputtext),
.el-field :deep(.p-iconfield),
.el-field :deep(.p-select) { width: 100%; }
.el-field :deep(.p-iconfield .p-inputtext) { width: 100%; }

.tel-input { display: flex; gap: 6px; align-items: stretch; }
/* override del width:100% global de .el-field :deep(.p-select) */
.tel-input :deep(.p-select) { width: 76px !important; flex-shrink: 0; }
.tel-number { flex: 1; min-width: 0; }

:deep(.p-dialog-footer) { display: flex; gap: 10px; }
:deep(.p-dialog-footer .p-button) { flex: 1; justify-content: center; }
</style>
