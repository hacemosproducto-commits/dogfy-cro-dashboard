<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    dismissableMask
    style="width: 700px"
  >
    <template #header>
      <span class="modal-icon-header">
        <img :src="dogIcon" alt="" class="modal-header-icon" />
      </span>
    </template>

    <div class="ep-form">
      <!-- Nombre + Raza -->
      <div class="ep-row">
        <div class="ep-field ep-field--grow2">
          <label>Nombre de tu perro</label>
          <InputText v-model="form.nombre" placeholder="Nombre del perro" />
        </div>
        <div class="ep-field ep-field--grow2">
          <label>Raza</label>
          <Select v-model="form.raza" :options="RAZAS" placeholder="Selecciona raza" />
        </div>
      </div>

      <!-- Sexo + Cumpleaños + Peso -->
      <div class="ep-row">
        <div class="ep-field">
          <label>Sexo</label>
          <Select v-model="form.sexo" :options="['Macho', 'Hembra']" />
        </div>
        <div class="ep-field ep-field--cumpl">
          <label>Cumpleaños</label>
          <div class="ep-month-year">
            <Select v-model="form.cumplMes" :options="MESES" placeholder="Mes" class="ep-mes" />
            <Select v-model="form.cumplAno" :options="ANOS" placeholder="Año" class="ep-ano" />
          </div>
        </div>
        <div class="ep-field">
          <label>Peso</label>
          <InputNumber v-model="form.peso" :min="0.5" :max="100" :minFractionDigits="0" :maxFractionDigits="1" suffix=" kg" inputClass="ep-peso-inp" />
        </div>
      </div>

      <!-- Actividad + Apetito + Esterilizado -->
      <div class="ep-row">
        <div class="ep-field">
          <label>Actividad</label>
          <Select v-model="form.actividad" :options="['Baja', 'Media', 'Alta']" />
        </div>
        <div class="ep-field">
          <label>Apetito</label>
          <Select v-model="form.apetito" :options="['Bajo', 'Medio', 'Alto']" />
        </div>
        <div class="ep-field">
          <label>Esterilizado</label>
          <Select v-model="form.esterilizado" :options="['Sí', 'No']" />
        </div>
      </div>

      <!-- Patologías + Alergias -->
      <div class="ep-row">
        <div class="ep-field ep-field--grow2">
          <label>Patologías</label>
          <MultiSelect
            v-model="form.patologias"
            :options="PATOLOGIAS"
            placeholder="Ninguna"
            display="chip"
            :maxSelectedLabels="3"
          />
        </div>
        <div class="ep-field ep-field--grow2">
          <label>Alergias</label>
          <MultiSelect
            v-model="form.alergias"
            :options="ALERGIAS"
            placeholder="Ninguna"
            display="chip"
            :maxSelectedLabels="3"
          />
        </div>
      </div>

      <!-- Menús -->
      <div class="ep-field-full">
        <label>Menús seleccionados:</label>
        <div class="menus-row">
          <button
            v-for="menu in MENUS"
            :key="menu"
            type="button"
            class="menu-pill"
            :class="{ 'menu-pill--active': form.menus.includes(menu) }"
            @click="toggleMenu(menu)"
          >
            <span class="menu-pill-dot" :class="{ 'menu-pill-dot--active': form.menus.includes(menu) }">
              <i :class="form.menus.includes(menu) ? 'pi pi-check' : 'pi pi-times'" />
            </span>
            {{ menu }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="ep-footer">
        <button type="button" class="ep-trash" @click="$emit('delete')" title="Eliminar perro">
          <i class="pi pi-trash" />
        </button>
        <div class="ep-footer-actions">
          <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
          <Button label="Guardar" @click="handleGuardar" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import dogIcon from '@/assets/icons/dog.svg'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'

interface PerroData {
  nombre?: string
  raza?: string
  sexo?: string
  peso?: string          // '8kg'
  nivelActividad?: string
  apetito?: string
  esterilizado?: string
  menus?: string[]
  patologias?: { nombre: string; incompatible: boolean }[]
  alergias?: string[]
  cumplMes?: string
  cumplAno?: string
}

const props = defineProps<{
  visible: boolean
  perro?: PerroData | null
}>()
const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: typeof form.value]
  'delete': []
}>()

// ── Opciones ──────────────────────────────────────
const MENUS      = ['Pollo', 'Pavo', 'Buey', 'Salmón']
const RAZAS      = ['Labrador', 'Golden Retriever', 'Pastor Alemán', 'Bulldog', 'Poodle', 'Chihuahua', 'Beagle', 'Boxer', 'Mestizo', 'Otra']
const MESES      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ANOS       = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))
const PATOLOGIAS = ['Diabetes', 'Insuficiencia renal', 'Insuficiencia hepática', 'Pancreatitis', 'Obesidad', 'Artritis', 'Alergias alimentarias', 'Epilepsia']
const ALERGIAS   = ['Pollo', 'Pavo', 'Ternera', 'Buey', 'Salmón', 'Cereales', 'Lácteos', 'Huevo']

// ── Form state ────────────────────────────────────
function initForm(perro?: PerroData | null) {
  return {
    nombre:       perro?.nombre ?? '',
    raza:         perro?.raza ?? '',
    sexo:         perro?.sexo ?? '',
    cumplMes:     perro?.cumplMes ?? '',
    cumplAno:     perro?.cumplAno ?? '',
    peso:         perro?.peso ? parseFloat(perro.peso) : null as number | null,
    actividad:    perro?.nivelActividad ? capitalize(perro.nivelActividad) : '',
    apetito:      perro?.apetito ?? '',
    esterilizado: perro?.esterilizado ?? '',
    menus:        perro?.menus ? [...perro.menus] : [],
    patologias:   perro?.patologias?.map(p => p.nombre) ?? [],
    alergias:     perro?.alergias ? [...perro.alergias] : [],
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const form = ref(initForm(props.perro))

watch(() => [props.visible, props.perro], () => {
  if (props.visible) form.value = initForm(props.perro)
})

function toggleMenu(menu: string) {
  const idx = form.value.menus.indexOf(menu)
  if (idx === -1) form.value.menus.push(menu)
  else form.value.menus.splice(idx, 1)
}

function handleGuardar() {
  emit('save', form.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-icon-header { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; }
.modal-header-icon { width: 20px; height: 20px; }

/* Form layout */
.ep-form { display: flex; flex-direction: column; gap: 20px; }
.ep-row { display: flex; gap: 16px; align-items: flex-start; }
.ep-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.ep-field--grow2 { flex: 2; }
.ep-field-full { display: flex; flex-direction: column; gap: 8px; }
.ep-field label, .ep-field-full label { font-size: 12px; font-weight: 500; color: var(--n-700, #374151); }
.ep-field :deep(.p-inputtext),
.ep-field :deep(.p-select),
.ep-field :deep(.p-multiselect),
.ep-field :deep(.p-inputnumber) { width: 100%; }

/* Cumpleaños: mes + año side by side */
.ep-month-year { display: flex; gap: 8px; }
.ep-mes { flex: 1.6; }
.ep-ano { flex: 1; }
.ep-peso-inp { width: 100%; }

/* Menús */
.menus-row { display: flex; gap: 10px; flex-wrap: wrap; }
.menu-pill {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 8px 14px; border-radius: 100px;
  border: 1.5px solid var(--n-200, #e5e7eb);
  background: #fff; cursor: pointer; font-size: 13px; font-weight: 500;
  color: var(--n-700, #374151); transition: border-color 0.15s;
  flex: 1; min-width: 100px;
}
.menu-pill--active { border-color: #0a7373; }
.menu-pill-dot {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--n-150, #f3f4f7); color: var(--n-400, #9ca3af);
  font-size: 10px; flex-shrink: 0; transition: background 0.15s, color 0.15s;
}
.menu-pill-dot--active { background: #0a7373; color: #fff; }

/* Footer */
.ep-footer { display: flex; align-items: center; gap: 12px; width: 100%; }
.ep-trash {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid var(--n-200, #e5e7eb); background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--n-500, #6b7280); transition: color 0.15s;
}
.ep-trash:hover { color: var(--error, #c8452a); border-color: var(--error-bg, #feeee9); }
.ep-footer-actions { display: flex; gap: 10px; flex: 1; }
.ep-footer-actions :deep(.p-button) { flex: 1; justify-content: center; }
</style>
