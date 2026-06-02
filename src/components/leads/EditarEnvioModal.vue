<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    dismissableMask
    style="width: 480px"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-icon"><img :src="truckIcon" alt="" class="modal-svg-icon" /></span>
        <div>
          <div class="modal-title">Editar dirección</div>
          <div class="modal-subtitle">Datos de entrega</div>
        </div>
      </div>
    </template>

    <div class="ee-form">
      <div class="ee-row">
        <div class="ee-field">
          <label>Nombre facturación</label>
          <InputText v-model="form.nombreFacturacion" placeholder="Nombre Apellido" />
        </div>
      </div>
      <div class="ee-row">
        <div class="ee-field">
          <label>Dirección</label>
          <InputText v-model="form.direccion" placeholder="Calle, número, piso…" />
        </div>
      </div>
      <div class="ee-row">
        <div class="ee-field ee-field--grow2">
          <label>Localidad</label>
          <InputText v-model="form.localidad" placeholder="Ciudad / Municipio" />
        </div>
        <div class="ee-field">
          <label>Código Postal</label>
          <InputText v-model="form.cp" placeholder="00000" :maxlength="10" />
        </div>
      </div>
      <div class="ee-row">
        <div class="ee-field">
          <label>Provincia</label>
          <InputText v-model="form.provincia" placeholder="Provincia" />
        </div>
        <div class="ee-field">
          <label>País</label>
          <Select v-model="form.pais" :options="['España','Francia','Italia','Alemania']" />
        </div>
      </div>
      <div class="ee-field">
        <label>Notas de entrega</label>
        <Textarea v-model="form.notas" placeholder="Instrucciones para el repartidor…" rows="3" autoResize />
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
      <Button label="Guardar" @click="handleGuardar" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import truckIcon from '@/assets/icons/truck.svg'

interface EnvioData {
  facturacion?: string  // "Nombre Apellido"
  direccion?:   string  // "Calle, 00], [Localidad], [CP], [Provincia]"
  notas?:       string
}

const props = defineProps<{
  visible: boolean
  envio?: EnvioData | null
}>()
const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: typeof form.value]
}>()

// Parse the flat `direccion` string into parts (best-effort for mock data)
function parseDireccion(raw?: string) {
  if (!raw) return { direccion: '', localidad: '', cp: '', provincia: '' }
  const parts = raw.split(',').map(p => p.trim().replace(/^\[|\]$/g, '').trim())
  return {
    direccion: parts[0] ?? '',
    localidad: parts[1] ?? '',
    cp:        parts[2] ?? '',
    provincia: parts[3] ?? '',
  }
}

function initForm(envio?: EnvioData | null) {
  const dir = parseDireccion(envio?.direccion)
  return {
    nombreFacturacion: envio?.facturacion?.replace(/^\[|\]$/g, '') ?? '',
    direccion: dir.direccion,
    localidad: dir.localidad,
    cp:        dir.cp,
    provincia: dir.provincia,
    pais:      'España',
    notas:     envio?.notas && envio.notas !== '---' ? envio.notas : '',
  }
}

const form = ref(initForm(props.envio))
watch(() => [props.visible, props.envio], () => {
  if (props.visible) form.value = initForm(props.envio)
})

function handleGuardar() {
  emit('save', form.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-header   { display: flex; align-items: flex-start; gap: 12px; }
.modal-svg-icon { width: 18px; height: 18px; display: block; }
.modal-icon     { width: 36px; height: 36px; border-radius: 50%; background: var(--n-100); color: var(--n-600); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

.ee-form { display: flex; flex-direction: column; gap: 16px; }
.ee-row { display: flex; gap: 14px; align-items: flex-start; }
.ee-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.ee-field--grow2 { flex: 2; }
.ee-field label { font-size: 12px; font-weight: 500; color: var(--n-700, #374151); }
.ee-field :deep(.p-inputtext),
.ee-field :deep(.p-select),
.ee-field :deep(.p-textarea) { width: 100%; }

:deep(.p-dialog-footer) { display: flex; gap: 10px; }
:deep(.p-dialog-footer .p-button) { flex: 1; justify-content: center; }
</style>
