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
        <span class="modal-icon"><i class="pi pi-trophy" /></span>
        <div>
          <div class="modal-title">Editar reto</div>
          <div class="modal-subtitle">Objetivo del equipo esta semana</div>
        </div>
      </div>
    </template>

    <div class="er-form">
      <!-- Título -->
      <div class="er-field">
        <label>Título <span class="req">*</span></label>
        <InputText
          v-model="form.titulo"
          placeholder="p.ej. Ruleta 🎰"
          :maxlength="TITULO_MAX"
        />
        <span class="char-count" :class="{ 'char-count--warn': form.titulo.length > TITULO_MAX - 10 }">
          {{ form.titulo.length }}/{{ TITULO_MAX }}
        </span>
      </div>

      <!-- Descripción -->
      <div class="er-field">
        <label>Descripción</label>
        <Textarea
          v-model="form.descripcion"
          :placeholder="`Describe el reto en menos de ${DESC_MAX} caracteres para que se lea bien en el dashboard.`"
          rows="4"
          autoResize
          :maxlength="DESC_MAX"
        />
        <span class="char-count" :class="{ 'char-count--warn': form.descripcion.length > DESC_MAX - 20 }">
          {{ form.descripcion.length }}/{{ DESC_MAX }}
        </span>
      </div>

      <!-- Link de reglas -->
      <div class="er-field">
        <label>Link de reglas</label>
        <p class="er-hint">Enlace a las reglas completas (Slack, Notion, Google Docs…)</p>
        <div class="er-link-input">
          <i class="pi pi-link er-link-icon" />
          <InputText
            v-model="form.linkReglas"
            placeholder="https://…"
            class="er-link-text"
          />
        </div>
        <span v-if="linkError" class="er-link-error">URL no válida</span>
      </div>

    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
      <Button label="Guardar" :disabled="!form.titulo.trim()" @click="handleGuardar" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import type { RetoSemanal } from '@/stores/reto'

const TITULO_MAX = 40
const DESC_MAX   = 160

const props = defineProps<{
  visible: boolean
  reto: RetoSemanal
}>()

const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: RetoSemanal]
}>()

const form = ref({ ...props.reto })

watch(() => [props.visible, props.reto], () => {
  if (props.visible) form.value = { ...props.reto }
})

const linkError = computed(() => {
  if (!form.value.linkReglas) return false
  try { new URL(form.value.linkReglas); return false }
  catch { return true }
})

function handleGuardar() {
  if (!form.value.titulo.trim() || linkError.value) return
  emit('save', { ...form.value })
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-header   { display: flex; align-items: flex-start; gap: 12px; }
.modal-icon     { width: 36px; height: 36px; border-radius: 50%; background: var(--n-100); color: var(--n-600); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

.er-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.er-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.er-field label {
  font-size: 12px;
  font-weight: 500;
  color: var(--n-700, #374151);
}

.req { color: var(--color-brand-primary, #ef6948); }

.er-hint {
  font-size: 11px;
  color: var(--n-400, #9ca3af);
  margin: 0;
}

.er-field :deep(.p-inputtext),
.er-field :deep(.p-textarea) {
  width: 100%;
}

.char-count {
  font-size: 11px;
  color: var(--n-400, #9ca3af);
  text-align: right;
}

.char-count--warn {
  color: var(--color-brand-primary, #ef6948);
  font-weight: 600;
}

/* Link field */
.er-link-input {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--n-200, #e5e7eb);
  border-radius: 8px;
  padding: 0 10px;
  background: #fff;
}

.er-link-icon { color: var(--n-400, #9ca3af); font-size: 14px; flex-shrink: 0; }

.er-link-input :deep(.er-link-text) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  flex: 1;
}

.er-link-error {
  font-size: 11px;
  color: var(--color-error-dark, #dc2626);
}


:deep(.p-dialog-footer) { display: flex; gap: 10px; }
:deep(.p-dialog-footer .p-button) { flex: 1; justify-content: center; }
</style>
