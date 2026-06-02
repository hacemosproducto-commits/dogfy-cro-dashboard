<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    modal
    dismissableMask
    style="width: 700px"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="modal-header">
        <span class="modal-icon"><img :src="dogIcon" alt="" class="modal-svg-icon" /></span>
        <div>
          <div class="modal-title">Editar perro</div>
        </div>
      </div>
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

      <!-- Sexo + Peso + Cumpleaños -->
      <div class="ep-row">
        <div class="ep-field">
          <label>Sexo</label>
          <Select v-model="form.sexo" :options="['Macho', 'Hembra']" />
        </div>
        <div class="ep-field">
          <label>Peso</label>
          <InputNumber v-model="form.peso" :min="0.5" :max="100" :minFractionDigits="0" :maxFractionDigits="1" suffix=" kg" inputClass="ep-peso-inp" />
        </div>
        <div class="ep-field ep-field--grow2">
          <label>Cumpleaños</label>
          <div class="mp-wrapper" ref="mpWrapperRef">
            <button
              type="button"
              class="mp-trigger"
              :class="{ 'mp-trigger--open': showPicker }"
              @click.stop="showPicker = !showPicker"
            >
              <span class="mp-trigger-val">{{ form.cumplMes }} {{ form.cumplAno }}</span>
              <i class="pi pi-calendar mp-trigger-icon" />
            </button>
            <Transition name="mp-drop">
              <div v-if="showPicker" class="month-picker" @click.stop>
                <div class="mp-year-nav">
                  <button type="button" class="mp-nav-btn" @click="shiftAno(1)" :disabled="anoIdx >= ANOS.length - 1">
                    <i class="pi pi-chevron-left" />
                  </button>
                  <span class="mp-year">{{ form.cumplAno }}</span>
                  <button type="button" class="mp-nav-btn" @click="shiftAno(-1)" :disabled="anoIdx <= 0">
                    <i class="pi pi-chevron-right" />
                  </button>
                </div>
                <div class="mp-months">
                  <button
                    v-for="(mes, i) in MESES"
                    :key="mes"
                    type="button"
                    class="mp-month"
                    :class="{ 'mp-month--sel': form.cumplMes === mes }"
                    @click="selectMes(mes)"
                  >{{ MESES_ABR[i] }}</button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Actividad + Apetito + Silueta -->
      <div class="ep-row">
        <div class="ep-field">
          <label>Actividad</label>
          <Select v-model="form.actividad" :options="ACTIVIDADES" />
        </div>
        <div class="ep-field">
          <label>Apetito</label>
          <Select v-model="form.apetito" :options="APETITOS" />
        </div>
        <div class="ep-field">
          <label>Silueta</label>
          <Select v-model="form.forma" :options="SILUETAS" />
        </div>
      </div>

      <!-- Esterilizado + Proyección (condicional) + Gestante (condicional) -->
      <div class="ep-row">
        <div class="ep-field">
          <label>Esterilizado</label>
          <Select v-model="form.esterilizado" :options="['Sí', 'No']" />
        </div>
        <div v-if="mostrarProyeccion" class="ep-field">
          <label class="ep-label-row">
            Proyección de crecimiento
            <InfoTooltip>
              <i class="pi pi-info-circle ep-label-info" />
              <template #content>
                <p class="itip-row">Solo para <strong>mestizos en etapa cachorro</strong> (0–12 meses). Indica la talla adulta estimada para ajustar la ración diaria correctamente.</p>
              </template>
            </InfoTooltip>
          </label>
          <Select v-model="form.proyeccionTalla" :options="TALLAS_ADULTO" placeholder="Talla de adulto" />
        </div>
        <div v-if="mostrarGestante" class="ep-field">
          <label>Gestante</label>
          <Select v-model="form.gestante" :options="['Sí', 'No']" placeholder="Seleccionar" />
        </div>
        <!-- Spacer: mantiene esterilizado a media anchura cuando está solo -->
        <div v-if="!mostrarProyeccion && !mostrarGestante" class="ep-field" aria-hidden="true" />
      </div>

      <!-- Patologías + Alergias -->
      <div class="ep-row ep-row--wrap">
        <div class="ep-field ep-field--grow2">
          <label>Patologías</label>
          <MultiSelect
            v-model="form.patologias"
            :options="PATOLOGIAS"
            placeholder="Ninguna"
            :maxSelectedLabels="0"
            selectedItemsLabel="{0} patologías"
          />
          <div v-if="form.patologias.length" class="ep-chips-out">
            <span v-for="p in form.patologias" :key="p" class="ep-chip-out">
              {{ p }}
              <button type="button" @click="form.patologias = form.patologias.filter(x => x !== p)"><i class="pi pi-times" /></button>
            </span>
          </div>
        </div>
        <div v-if="mostrarAlergias" class="ep-field ep-field--grow2">
          <label>Alergias alimentarias</label>
          <MultiSelect
            v-model="form.alergias"
            :options="ALERGIAS"
            placeholder="Selecciona alérgenos"
            :maxSelectedLabels="0"
            selectedItemsLabel="{0} alergias"
          />
          <div v-if="form.alergias.length" class="ep-chips-out">
            <span v-for="a in form.alergias" :key="a" class="ep-chip-out">
              {{ a }}
              <button type="button" @click="form.alergias = form.alergias.filter(x => x !== a)"><i class="pi pi-times" /></button>
            </span>
          </div>
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
        <button
          v-if="canDelete"
          type="button"
          class="ep-trash"
          @click="$emit('delete')"
          title="Eliminar perro"
        >
          <i class="pi pi-trash" />
        </button>
        <div class="ep-footer-actions">
          <Button label="Cancelar" severity="secondary" outlined @click="$emit('update:visible', false)" />
          <Button label="Guardar" :disabled="!canSave" @click="handleGuardar" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import dogIcon from '@/assets/icons/dog.svg'

interface PerroData {
  nombre?: string
  raza?: string
  sexo?: string
  peso?: string          // '8kg'
  nivelActividad?: string
  apetito?: string
  forma?: string         // silueta: Flaco | Figurín | Rellenito
  esterilizado?: string
  gestante?: string
  menus?: string[]
  patologias?: { nombre: string; incompatible: boolean }[]
  alergias?: string[]
  cumplMes?: string
  cumplAno?: string
  proyeccionTalla?: string
}

const props = defineProps<{
  visible: boolean
  perro?: PerroData | null
  /** Si false, oculta el botón de eliminar (lead debe tener al menos 1 perro) */
  canDelete?: boolean
}>()
const emit = defineEmits<{
  'update:visible': [val: boolean]
  'save': [data: typeof form.value]
  'delete': []
}>()

// ── Opciones ──────────────────────────────────────
const MENUS         = ['Pollo', 'Pavo', 'Buey', 'Salmón']
const RAZAS         = ['Labrador', 'Golden Retriever', 'Pastor Alemán', 'Bulldog', 'Poodle', 'Chihuahua', 'Beagle', 'Boxer', 'Mestizo', 'Otra']
const MESES         = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ANOS          = Array.from({ length: 20 }, (_, i) => String(new Date().getFullYear() - i))
const PATOLOGIAS    = ['Diabetes', 'Insuficiencia renal', 'Insuficiencia hepática', 'Pancreatitis', 'Obesidad', 'Artritis', 'Alergias alimentarias', 'Epilepsia']
const ALERGIAS      = ['Pollo', 'Pavo', 'Ternera', 'Buey', 'Salmón', 'Cereales', 'Lácteos', 'Huevo']
const TALLAS_ADULTO = ['S (< 10 kg)', 'M (10–25 kg)', 'L (25–45 kg)', 'XL (+ 45 kg)']
const ACTIVIDADES   = ['Tranquilo', 'Normal', 'Activo']
const APETITOS      = ['Selectivo', 'Gourmet', 'Glotón']
const SILUETAS      = ['Flaco', 'Figurín', 'Rellenito']

// Mapeo de valores legacy (backend) → etiquetas UI
const ACTIVIDAD_MAP: Record<string, string> = {
  bajo: 'Tranquilo', baja: 'Tranquilo', tranquilo: 'Tranquilo',
  medio: 'Normal',   media: 'Normal',   normal: 'Normal',
  alto: 'Activo',    alta: 'Activo',    activo: 'Activo',
}
const APETITO_MAP: Record<string, string> = {
  bajo: 'Selectivo', selectivo: 'Selectivo',
  medio: 'Gourmet',  gourmet: 'Gourmet',
  alto: 'Glotón',    glotón: 'Glotón', gloton: 'Glotón',
}

// ── Month grid picker helpers ─────────────────────
const MESES_ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const showPicker  = ref(false)
const mpWrapperRef = ref<HTMLElement | null>(null)

const anoIdx = computed(() => {
  const i = ANOS.indexOf(form.value.cumplAno)
  return i !== -1 ? i : 0
})

function shiftAno(off: number) {
  form.value.cumplAno = ANOS[Math.max(0, Math.min(ANOS.length - 1, anoIdx.value + off))]
}

function selectMes(mes: string) {
  form.value.cumplMes = mes
  showPicker.value = false
}

function onDocClick(e: MouseEvent) {
  if (mpWrapperRef.value && !mpWrapperRef.value.contains(e.target as Node)) {
    showPicker.value = false
  }
}

watch(showPicker, (v) => {
  if (v) nextTick(() => document.addEventListener('click', onDocClick))
  else document.removeEventListener('click', onDocClick)
})

onUnmounted(() => document.removeEventListener('click', onDocClick))

// ── Form state ────────────────────────────────────
const _now = new Date()
const _defaultMes = MESES[_now.getMonth()]
const _defaultAno = String(_now.getFullYear() - 2)

function initForm(perro?: PerroData | null) {
  return {
    nombre:          perro?.nombre ?? '',
    raza:            perro?.raza ?? '',
    sexo:            perro?.sexo ?? '',
    cumplMes:        perro?.cumplMes ?? _defaultMes,
    cumplAno:        perro?.cumplAno ?? _defaultAno,
    peso:            perro?.peso ? parseFloat(perro.peso) : null as number | null,
    actividad:       perro?.nivelActividad ? (ACTIVIDAD_MAP[perro.nivelActividad.toLowerCase()] ?? capitalize(perro.nivelActividad)) : '',
    apetito:         perro?.apetito ? (APETITO_MAP[perro.apetito.toLowerCase()] ?? perro.apetito) : '',
    forma:           perro?.forma ?? '',
    esterilizado:    perro?.esterilizado === 'Si' ? 'Sí' : (perro?.esterilizado ?? ''),
    gestante:        perro?.gestante ?? '',
    // Por defecto todos los menús están seleccionados (un perro compatible con Dogfy
    // come de todos los sabores salvo edge case con patologías/alergias específicas).
    menus:           perro?.menus ? [...perro.menus] : [...MENUS],
    patologias:      perro?.patologias?.map(p => p.nombre) ?? [],
    alergias:        perro?.alergias ? [...perro.alergias] : [],
    proyeccionTalla: perro?.proyeccionTalla ?? '',
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

const form = ref(initForm(props.perro))

watch(() => [props.visible, props.perro], () => {
  if (props.visible) form.value = initForm(props.perro)
})

// ── Validación ───────────────────────────────────
const canSave = computed(() => {
  const gestanteOk = !(form.value.sexo === 'Hembra' && form.value.esterilizado === 'No') || form.value.gestante !== ''
  return (
    form.value.nombre.trim() !== '' &&
    form.value.raza !== '' &&
    form.value.sexo !== '' &&
    form.value.cumplMes !== '' &&
    form.value.cumplAno !== '' &&
    form.value.peso !== null &&
    form.value.actividad !== '' &&
    form.value.apetito !== '' &&
    form.value.forma !== '' &&
    form.value.esterilizado !== '' &&
    gestanteOk
  )
})

// ── Lógica condicional ────────────────────────────
// Gestante: hembra + no esterilizada
const mostrarGestante = computed(() =>
  form.value.sexo === 'Hembra' && form.value.esterilizado === 'No'
)

// Cachorro: nacido hace 0–12 meses (necesita cumplMes + cumplAno rellenos)
const esCachorro = computed(() => {
  if (!form.value.cumplMes || !form.value.cumplAno) return false
  const mesIdx = MESES.indexOf(form.value.cumplMes)
  if (mesIdx === -1) return false
  const nacimiento = new Date(parseInt(form.value.cumplAno), mesIdx, 1)
  const hoy = new Date()
  const diffMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())
  return diffMeses >= 0 && diffMeses <= 12
})

// Proyección: solo Mestizo + cachorro (puppy de raza definida no lo necesita)
const mostrarProyeccion = computed(() =>
  form.value.raza === 'Mestizo' && esCachorro.value
)

// Alergias: solo si "Alergias alimentarias" está en patologías
const mostrarAlergias = computed(() =>
  form.value.patologias.includes('Alergias alimentarias')
)

// Reset campos al perder su condición
watch(() => mostrarGestante.value, (v) => { if (!v) form.value.gestante = '' })
watch(() => mostrarProyeccion.value, (v) => { if (!v) form.value.proyeccionTalla = '' })
watch(() => mostrarAlergias.value, (v) => { if (!v) form.value.alergias = [] })

function toggleMenu(menu: string) {
  const idx = form.value.menus.indexOf(menu)
  if (idx === -1) {
    form.value.menus.push(menu)
  } else if (form.value.menus.length > 1) {
    // Mínimo un sabor seleccionado. Si solo queda uno, no permitir quitarlo.
    // Edge case "incompatible con Dogfy" se gestiona en otro lugar (la venta no se permite).
    form.value.menus.splice(idx, 1)
  }
}

function handleGuardar() {
  emit('save', form.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-header   { display: flex; align-items: center; gap: 12px; }
.modal-svg-icon { width: 18px; height: 18px; display: block; }
.req { color: var(--brand, #ef6948); }
.modal-icon     { width: 36px; height: 36px; border-radius: 50%; background: var(--n-100); color: var(--n-600); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.modal-title    { font-size: 15px; font-weight: 700; color: var(--n-900); }
.modal-subtitle { font-size: 12px; color: var(--n-500); margin-top: 2px; }

/* Form layout */
.ep-form { display: flex; flex-direction: column; gap: 20px; }
.ep-row { display: flex; gap: 16px; align-items: flex-start; }
.ep-field { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.ep-field--grow2 { flex: 2; }
.ep-field--half  { flex: 0 0 calc(50% - 8px); max-width: calc(50% - 8px); }
.ep-field-full { display: flex; flex-direction: column; gap: 8px; }
.ep-field label, .ep-field-full label { font-size: 12px; font-weight: 500; color: var(--n-700, #374151); }
.ep-field :deep(.p-inputtext),
.ep-field :deep(.p-select),
.ep-field :deep(.p-multiselect),
.ep-field :deep(.p-inputnumber) { width: 100%; }

/* ── Month grid picker — Cumpleaños ───────────── */
.mp-wrapper {
  position: relative;
}

/* Trigger — styled to match PrimeVue Select */
.mp-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 12px;
  height: 38px;
  border: 1px solid var(--n-300, #d1d5db);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.mp-trigger:hover { border-color: var(--n-500); }
.mp-trigger--open {
  border-color: var(--brand, #ef6948);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand, #ef6948) 15%, transparent);
  outline: none;
}
.mp-trigger-val {
  font-size: 13px;
  color: var(--n-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mp-trigger-icon {
  font-size: 13px;
  color: var(--n-400);
  flex-shrink: 0;
}

/* Floating popover */
.month-picker {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 300;
  width: 220px;
  border: 1px solid var(--n-200, #e5e7eb);
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
  padding: 12px 14px 14px;
  user-select: none;
}

.mp-year-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.mp-nav-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: none;
  background: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--n-600);
  font-size: 12px;
  transition: background 0.12s, color 0.12s;
}
.mp-nav-btn:hover:not(:disabled) { background: var(--n-100); color: var(--n-900); }
.mp-nav-btn:disabled { opacity: 0.3; cursor: default; }
.mp-year {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-900);
}
.mp-months {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.mp-month {
  padding: 8px 4px;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--n-700);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  text-align: center;
}
.mp-month:hover:not(.mp-month--sel) { background: var(--n-100); color: var(--n-900); }
.mp-month--sel {
  background: var(--brand, #ef6948);
  color: #fff;
  font-weight: 600;
  border-radius: 100px;
}

/* Drop animation */
.mp-drop-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.mp-drop-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.mp-drop-enter-from, .mp-drop-leave-to { opacity: 0; transform: translateY(-6px); }

.ep-peso-inp { width: 100%; }

/* Menús — grid 4 columnas (desktop) → 2 columnas (mobile) */
.menus-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.menu-pill {
  display: inline-flex; align-items: center; gap: 10px;
  /* padding-left == padding-top para que la X-pill quede armónica con la rounded-end */
  padding: 8px 14px 8px 8px;
  border-radius: 100px;
  border: 1.5px solid var(--n-200, #e5e7eb);
  background: #fff; cursor: pointer; font-size: 13px; font-weight: 500;
  color: var(--n-700, #374151); transition: border-color 0.15s;
  min-width: 0;
}
.menu-pill--active { border-color: #0a7373; }
.menu-pill-dot {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--n-150, #f3f4f7); color: var(--n-400, #9ca3af);
  font-size: 10px; flex-shrink: 0; transition: background 0.15s, color 0.15s;
}
.menu-pill-dot--active { background: #0a7373; color: #fff; }

/* ── Chips fuera del input (Patologías / Alergias) ── */
.ep-row--wrap { align-items: flex-start; flex-wrap: wrap; }
.ep-chips-out { display: flex; flex-wrap: wrap; gap: 6px; }
.ep-chip-out {
  display: inline-flex; align-items: center; gap: 5px;
  background: var(--n-100); border-radius: 100px;
  padding: 4px 8px 4px 11px;
  font-size: 12px; font-weight: 500; color: var(--n-700);
}
.ep-chip-out button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border-radius: 50%;
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--n-400); transition: background 0.12s, color 0.12s;
}
.ep-chip-out button:hover { background: var(--n-200); color: var(--n-700); }
.ep-chip-out .pi { font-size: 9px; }

/* ── Label con tooltip ───────────────────────────── */
.ep-label-row { display: flex; align-items: center; gap: 5px; }
.ep-label-info { font-size: 12px; color: var(--n-400); cursor: help; transition: color 0.12s; }
.ep-label-info:hover { color: var(--n-600); }

/* ── Responsive ─────────────────────────────────── */
/* Mobile: stack fields verticalmente, menús en grid 2x2 */
@media (max-width: 480px) {
  .ep-row { flex-direction: column; gap: 14px; }
  .ep-row .ep-field { flex: 1 1 100%; width: 100%; }
  .menus-row { grid-template-columns: repeat(2, 1fr); }
}

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
