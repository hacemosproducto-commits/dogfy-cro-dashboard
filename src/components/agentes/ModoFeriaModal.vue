<template>
  <Dialog
    v-model:visible="visible"
    modal
    :closable="true"
    :style="{ width: '480px', maxWidth: '95vw' }"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
            <path d="M2 7h20"/>
            <path d="M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
          </svg>
        </span>
        <div>
          <div class="modal-title">Modo offline</div>
          <div class="modal-subtitle">{{ agenteName }} dejará de recibir leads por goteo</div>
        </div>
      </div>
    </template>

    <div class="modal-body">

      <!-- Nombre del evento -->
      <div class="field">
        <label class="field-label">Nombre del evento <span class="optional">(opcional)</span></label>
        <InputText v-model="eventName" placeholder="Ej. Feria Mascota Madrid 2026" class="w-full" />
      </div>

      <!-- Aviso -->
      <div class="resumen-box">
        <i class="pi pi-info-circle resumen-icon" />
        <span v-if="isDeactivating">El agente volverá a recibir leads por goteo al confirmar.</span>
        <span v-else>El agente dejará de recibir leads hasta que se desactive el modo manualmente.</span>
      </div>

    </div>

    <template #footer>
      <div class="modal-footer">
        <Button label="Cancelar" severity="secondary" outlined @click="close" />
        <Button
          :label="isDeactivating ? 'Finalizar modo offline' : 'Activar modo offline'"
          :icon="isDeactivating ? 'pi pi-stop-circle' : 'pi pi-power-off'"
          :severity="isDeactivating ? 'danger' : 'primary'"
          :disabled="!canConfirm"
          @click="confirm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useAgentesOfflineStore } from '@/stores/agentesOffline'

const props = defineProps<{
  agenteId: string
  agenteName: string
  activatedBy: string
}>()

const visible = defineModel<boolean>('visible', { default: false })
const store = useAgentesOfflineStore()

const isDeactivating = computed(() => store.isOffline(props.agenteId))

const eventName = ref('')

// V1: sin date picker — el modo se activa/desactiva manualmente
// Se usa una fecha de fin lejana (1 año) como placeholder interno del store
const canConfirm = computed(() => true)

function confirm() {
  if (isDeactivating.value) {
    store.desactivarFeria(props.agenteId)
  } else {
    const now = new Date()
    const farFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    store.activarFeria({
      agenteId: props.agenteId,
      eventName: eventName.value || 'Modo offline',
      startDate: now,
      endDate:   farFuture,
      activatedBy: props.activatedBy,
    })
  }
  close()
}

function close() {
  visible.value = false
  eventName.value = ''
}
</script>

<style scoped>
.modal-header {
  display: flex; align-items: flex-start; gap: 12px;
}
.modal-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--n-100); color: var(--n-600);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

.modal-body { display: flex; flex-direction: column; gap: 16px; padding: 20px 0 8px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: var(--n-600); }
.optional { font-weight: 400; color: var(--n-400); }
.w-full { width: 100%; }

.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

/* Resumen */
.resumen-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--warning-bg); border: 1px solid #f0d080;
  border-radius: 8px; padding: 10px 12px;
  font-size: 12px; color: var(--warning); font-weight: 500;
}
.resumen-icon { font-size: 14px; flex-shrink: 0; }

.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px; }
</style>
