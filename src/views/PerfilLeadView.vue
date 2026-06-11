<template>
  <div class="perfil-layout">
    <!-- ═══ Contenedor padre unificado ═══
         Topbar (agente/estado/CTAs) + todos los módulos del lead. -->
    <div class="config-container">
      <!-- Topbar como primera fila del contenedor -->
      <div class="perfil-topbar">
        <!-- Grupo izquierdo: Agente + separador + Estado -->
        <div class="topbar-left" ref="topbarLeftRef">
          <!-- Par Agente -->
          <div class="topbar-pair">
            <span class="topbar-label">Agente:</span>
            <Select
              v-if="canEditAgente"
              v-model="agenteAsignado"
              :options="agentesOptions"
              class="agente-select"
            >
              <template #value="{ value }">
                <span class="agente-chip-value">
                  <span class="agente-avatar"><i class="pi pi-user" /></span>
                  <span class="agente-name">{{ value || lead.agente }}</span>
                </span>
              </template>
              <template #option="{ option }">
                <span class="agente-chip-value">
                  <span class="agente-avatar"><i class="pi pi-user" /></span>
                  <span class="agente-name">{{ option }}</span>
                </span>
              </template>
            </Select>
            <span v-else class="agente-chip">
              <span class="agente-avatar"><i class="pi pi-user" /></span>
              <span class="agente-name">{{ lead.agente }}</span>
            </span>
          </div>

          <span class="sep" v-show="sepVisible">|</span>

          <!-- Par Estado -->
          <div class="topbar-pair">
            <span class="topbar-label">Estado:</span>
            <Select
              :modelValue="estadoLead"
              :options="estadosSeleccionables"
              class="estado-select"
              @update:modelValue="onEstadoChange"
            >
              <template #value="{ value }">
                <span class="estado-pill" :class="`estado-pill--${estadoSeverity(value || estadoLead)}`">
                  <span class="estado-pill-label">{{ value || estadoLead }}</span>
                  <i class="pi pi-chevron-down estado-pill-chevron" />
                </span>
              </template>
              <template #option="{ option }">
                <Tag :value="option" :severity="estadoSeverity(option)" :class="{ 'tag-formulario': option === 'Formulario' }" />
              </template>
            </Select>
          </div>
        </div>

        <!-- Acciones — siempre en la columna derecha del grid -->
        <div class="topbar-actions">
          <Button label="Llamar" icon="pi pi-phone" size="small" class="cta-llamar" />
        </div>
      </div>

      <div class="config-grid">
        <!-- ═══ Columna izquierda ═══ -->
        <div class="col col-left">
          <!-- Card Perro -->
          <SectionCard v-for="(perro, idx) in lead.perros" :key="idx" class="card-perro module-card">
            <template #header>
              <span class="card-title-row">
                <img :src="dogIcon" alt="" class="svg-icon" />
                {{ perro.nombre }}
              </span>
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="openEditarPerro(perro, idx)" />
            </template>
            <div class="perro-section">
              <p class="perro-line perro-line--gr">
                <span class="perro-plan-label">{{ isMixto ? 'Plan mixto' : 'Plan completo' }}:</span>
                {{ isMixto ? Math.round(parseInt(perro.gDia) / 2) + 'g/día' : perro.gDia }}
              </p>
              <p class="perro-line">Menús: {{ perro.menus.join(', ') }}</p>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <p class="perro-line">{{ perro.sexo }} · {{ perro.raza }}</p>
              <p class="perro-line">{{ perro.etapa }} · {{ perro.edad }}</p>
              <p class="perro-line">{{ perro.peso }} · {{ perro.forma }} · {{ perro.tipoComida }}</p>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <p class="perro-line">Actividad: {{ capitalize(perro.nivelActividad) }} · Esterilizado: {{ perro.esterilizado }}</p>
              <p class="perro-line">
                <span class="perro-patologias-label">Patologías:</span>
                {{ perro.patologias.length ? perro.patologias.map(p => p.nombre).join(', ') : 'Ninguna' }}
              </p>
            </div>
          </SectionCard>
          <Button label="Añade otro perro" icon="pi pi-plus-circle" severity="secondary" outlined size="small" class="add-btn" @click="openNuevoPerro" />

          <!-- Card Lead ID -->
          <SectionCard class="card-lead module-card">
            <template #header>
              <span class="card-title-row"><i class="pi pi-user" /> Lead ID: {{ lead.leadCode }}</span>
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="showEditarLead = true" />
            </template>
            <div class="lead-meta">
              <p class="bold">{{ lead.nombre }} {{ lead.apellido }}</p>
              <p class="copy-row">
                {{ lead.email }}
                <Button :icon="copiedField === 'email' ? 'pi pi-check' : 'pi pi-copy'" text rounded size="small" class="copy-btn" :class="{ 'copy-btn--done': copiedField === 'email' }" @click="copyText(lead.email, 'email')" />
              </p>
              <p class="copy-row">
                {{ lead.telefono }}
                <Button :icon="copiedField === 'telefono' ? 'pi pi-check' : 'pi pi-copy'" text rounded size="small" class="copy-btn" :class="{ 'copy-btn--done': copiedField === 'telefono' }" @click="copyText(lead.telefono, 'telefono')" />
              </p>
              <p>Campaña: <Tag :value="lead.campana" severity="info" /></p>
              <p class="fuente-row">
                Fuente de adquisición:
                <Tag v-for="f in lead.fuenteAdquisicion" :key="f" :value="f" severity="secondary" class="fuente-tag" />
              </p>
            </div>
          </SectionCard>

          <!-- Card Datos envío -->
          <SectionCard class="card-envio module-card">
            <template #header>
              <span class="card-title-row"><img :src="truckIcon" alt="" class="svg-icon" /> Datos de envío</span>
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="showEditarEnvio = true" />
            </template>
            <div class="envio-meta">
              <p>Facturación a {{ lead.datosEnvio.facturacion }}</p>
              <p>{{ lead.datosEnvio.direccion }}</p>
              <p>Notas de entrega: {{ lead.datosEnvio.notas }}</p>
            </div>
          </SectionCard>
        </div>

        <!-- ═══ Columna derecha ═══ -->
        <div class="col col-right">
          <!-- Fecha de entrega -->
          <SectionCard class="card-fecha module-card">
            <template #header>
              <span class="card-title-row">Fecha de entrega</span>
              <img :src="glsLogo" alt="GLS" class="gls-logo" />
            </template>
            <p class="fecha-disclaimer">
              <i class="pi pi-info-circle" />
              Festivos de {{ lead.ciudad }} ({{ lead.pais }}) excluidos automáticamente
            </p>
            <DatePicker
              v-model="fechaEntregaDate"
              :disabled-dates="festivosLocalidad"
              :min-date="new Date()"
              date-format="dd/mm/yy"
              show-icon
              fluid
              class="fecha-picker"
            />
          </SectionCard>

          <!-- Cupón -->
          <SectionCard class="card-codigos module-card">
            <template #header><span class="card-title-row">Cupón</span></template>

            <div class="codigo-row">
              <InputText v-model="cuponInput" placeholder="Ej. DOGFY2025" class="codigo-input" />
              <Button icon="pi pi-arrow-right" size="small" />
            </div>
            <div class="badge-row">
              <span
                v-for="(c, i) in lead.cuponesAplicados"
                :key="i"
                class="chip-pv chip-pv--success"
              >
                {{ c }}
                <i class="pi pi-times remove-x" />
              </span>
            </div>
          </SectionCard>

          <!-- Presupuesto: incluye TODOS los CTAs comerciales -->
          <SectionCard class="card-presu module-card highlight-card">
            <template #header>
              <span class="card-title-row"><i class="pi pi-box" /> Presupuesto</span>
            </template>

            <!-- Toggle plan tipo -->
            <SelectButton
              v-model="planTipo"
              :options="PLAN_TIPOS"
              class="plan-toggle"
            />

            <!-- Info precios: dos columnas separadas por divisor -->
            <div class="presu-info">
              <div class="presu-info-col">
                <span class="presu-info-label">Prueba (14 días)</span>
                <span class="presu-dto">{{ presuPrueba.dto }} 🎉</span>
                <span class="presu-precio">
                  <s>{{ presuPrueba.precioOriginal }}</s>
                  <strong>{{ presuPrueba.precio }}</strong>
                </span>
              </div>
              <div class="presu-divider-v" />
              <div class="presu-info-col">
                <span class="presu-info-label">Mensualidad</span>
                <span class="presu-dto">{{ presuMensual.dto }} 🎉</span>
                <span class="presu-precio">
                  <s>{{ presuMensual.precioOriginal }}</s>
                  <strong>{{ presuMensual.precio }}</strong>
                </span>
              </div>
            </div>

            <table class="presu-table">
              <thead>
                <tr>
                  <th>Perro</th>
                  <th>gr/día</th>
                  <th>Cantidad</th><th>Tamaño</th><th>Base</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in lead.presupuesto.items" :key="i">
                  <td>{{ it.perro }}</td>
                  <td>{{ isMixto ? Math.round(parseInt(it.grDia) / 2) + 'g' : it.grDia }}</td>
                  <td>{{ isMixto ? halveQty(it.cantidad) : it.cantidad }}</td>
                  <td>{{ isMixto ? halveTamano(it.tamano) : it.tamano }}</td>
                  <td>{{ isMixto ? fmtEur(parseEur(it.base) / 2) : it.base }}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td>{{ isMixto ? Math.round(parseInt(lead.presupuesto.total.grDia) / 2) + 'g' : lead.presupuesto.total.grDia }}</td>
                  <td>{{ isMixto ? halveQty(lead.presupuesto.total.cantidad) : lead.presupuesto.total.cantidad }}</td>
                  <td>{{ isMixto ? halveTamano(lead.presupuesto.total.tamano) : lead.presupuesto.total.tamano }}</td>
                  <td>{{ isMixto ? fmtEur(parseEur(lead.presupuesto.total.base) / 2) : lead.presupuesto.total.base }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Acciones comerciales centralizadas dentro del Presupuesto -->
            <div class="presu-actions">
              <Button label="Enviar presupuesto" class="full-btn cta-primary" @click="handleEnviarPresupuesto" />
              <Button label="Formulario de pago" severity="secondary" outlined class="full-btn" />
              <Button label="Pago con tarjeta" severity="secondary" outlined class="full-btn" />
              <!-- TPV: solo visible cuando el agente está en modo feria -->
              <Button
                v-if="isAgenteEnFeria"
                label="TPV"
                icon="pi pi-credit-card"
                severity="warning"
                outlined
                class="full-btn tpv-btn"
              />
            </div>

            <!-- Indicador modo offline activo -->
            <div v-if="isAgenteEnFeria" class="feria-notice">
              <i class="pi pi-shop" /> Modo offline activo — pago en persona disponible
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  </div>

  <CrearLeadModal v-model:visible="auth.showCrearLead" />

  <EditarPerroModal
    v-model:visible="showEditarPerro"
    :perro="perroEditando"
    :canDelete="lead.perros.length > 1"
    @save="handleSavePerro"
    @delete="handleDeletePerro"
  />

  <EditarLeadModal
    v-model:visible="showEditarLead"
    :lead="{ nombre: lead.nombre, apellido: lead.apellido, email: lead.email, telefono: lead.telefono }"
  />

  <EditarEnvioModal
    v-model:visible="showEditarEnvio"
    :envio="lead.datosEnvio"
  />

  <!-- ═══ Modal: motivo No interesa ═══ -->
  <Dialog
    :visible="showNoInteresa"
    @update:visible="(v) => { if (!v) cancelNoInteresa() }"
    modal
    style="width: 420px"
    :pt="{ header: { style: 'border-bottom: 1px solid var(--n-150)' } }"
  >
    <template #header>
      <div class="ni-header">
        <span class="ni-icon"><i class="pi pi-times-circle" /></span>
        <div>
          <div class="ni-title">¿Por qué no interesa?</div>
          <div class="ni-sub">Selecciona el motivo para registrar el cierre</div>
        </div>
      </div>
    </template>

    <div class="ni-body">
      <label class="ni-label">Motivo</label>
      <Select
        v-model="noInteresaMotivo"
        :options="MOTIVOS_NO_INTERESA"
        placeholder="Selecciona un motivo..."
        class="ni-select"
      />
    </div>

    <template #footer>
      <div class="ni-footer">
        <Button label="Cancelar" severity="secondary" outlined @click="cancelNoInteresa" />
        <Button label="Confirmar" :disabled="!noInteresaMotivo" @click="confirmNoInteresa" />
      </div>
    </template>
  </Dialog>

  <Toast position="bottom-right" />
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

import Tag from 'primevue/tag'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import SectionCard from '@/components/ui/SectionCard.vue'

import CrearLeadModal from '@/components/leads/CrearLeadModal.vue'
import EditarPerroModal from '@/components/leads/EditarPerroModal.vue'
import EditarLeadModal from '@/components/leads/EditarLeadModal.vue'
import EditarEnvioModal from '@/components/leads/EditarEnvioModal.vue'
import { mockPerfilLead, ESTADOS_LEAD } from '@/data/mock'
import { useAuthStore } from '@/stores/auth'
import { useAgentesOfflineStore } from '@/stores/agentesOffline'
import dogIcon from '@/assets/icons/dog.svg'
import truckIcon from '@/assets/icons/truck.svg'
import glsLogo from '@/assets/icons/gls-logo.svg'

const auth = useAuthStore()
const offlineStore = useAgentesOfflineStore()
const toast = useToast()

function capitalize(s: string) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

// TPV visible cuando el agente logueado está en modo feria
const isAgenteEnFeria = computed(() => offlineStore.isOffline(auth.user.id))
const lead = reactive({
  ...mockPerfilLead,
  perros: mockPerfilLead.perros.map(p => ({
    ...p,
    menus: [...p.menus],
    patologias: p.patologias.map(pat => ({ ...pat })),
  })),
  presupuesto: {
    ...mockPerfilLead.presupuesto,
    items: mockPerfilLead.presupuesto.items.map(it => ({ ...it })),
  },
})
const estadoLead = ref<string>(lead.estado)
// Estado anterior — usado para revertir si el usuario cancela la creación de cita
const estadoLeadPrevio = ref<string>(lead.estado)

// "Venta" no es seleccionable manualmente — un lead pasa a Venta vía el flujo de venta,
// no editando el estado directamente. Se filtra de las opciones del dropdown.
const estadosSeleccionables = computed(() =>
  ESTADOS_LEAD.filter(e => e !== 'Venta')
)

// Regla de negocio: un lead solo puede pasar a "En cita" si tiene una cita asignada.
// Al seleccionar "En cita" en el dropdown, abrimos el modal de Crear cita pre-rellenado.
// El estado se confirma cuando la cita se guarda (handler en CrearCitaModal o vía watcher
// futuro). Por ahora aplicamos el estado optimistically y dejamos al usuario la opción de
// crear la cita en el modal.
function onEstadoChange(nuevo: string) {
  if (nuevo === 'No interesa') {
    estadoLeadPrevio.value = estadoLead.value
    noInteresaMotivo.value = ''
    showNoInteresa.value = true
    // Don't update estadoLead yet — wait for confirmation
  } else if (nuevo === 'En cita' && estadoLead.value !== 'En cita') {
    estadoLeadPrevio.value = estadoLead.value
    estadoLead.value = nuevo
    // Disparar modal global de Crear cita (pre-rellenado con este lead via auth store)
    auth.showCrearCita = true
  } else {
    estadoLeadPrevio.value = estadoLead.value
    estadoLead.value = nuevo
  }
}

// ── Copy to clipboard ────────────────────────────────
const copiedField = ref<string | null>(null)
function copyText(text: string, field: string) {
  navigator.clipboard.writeText(text).catch(() => {
    // fallback for non-secure contexts
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  })
  copiedField.value = field
  setTimeout(() => { copiedField.value = null }, 1800)
}
const agenteAsignado = ref<string>(lead.agente)
const agentesOptions = ['Juan Camilo Martinez','Laura Ruiz','Carlos Díaz','Ana Soto','María Pérez','Pablo García']

// ── Separador topbar — solo visible cuando los dos pares están en la misma línea ──
const topbarLeftRef = ref<HTMLElement | null>(null)
const sepVisible    = ref(true)

function checkSepWrap() {
  if (!topbarLeftRef.value) return
  const pairs = topbarLeftRef.value.querySelectorAll<HTMLElement>('.topbar-pair')
  if (pairs.length >= 2) {
    sepVisible.value = Math.abs(pairs[0].getBoundingClientRect().top - pairs[1].getBoundingClientRect().top) < 2
  }
}

let _sepRO: ResizeObserver | null = null
onMounted(() => {
  _sepRO = new ResizeObserver(checkSepWrap)
  if (topbarLeftRef.value) _sepRO.observe(topbarLeftRef.value)
  checkSepWrap()
})
onUnmounted(() => _sepRO?.disconnect())
const cuponInput = ref('')
const showEditarPerro  = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const perroEditando    = ref<any>(null)
const perroEditandoIdx = ref(-1)
const isNuevoPerro     = ref(false)
const showEditarLead   = ref(false)
const showEditarEnvio  = ref(false)

function openEditarPerro(perro: typeof lead.perros[0], idx: number) {
  perroEditandoIdx.value = idx
  isNuevoPerro.value = false
  perroEditando.value = perro
  showEditarPerro.value = true
}
function openNuevoPerro() {
  perroEditandoIdx.value = -1
  isNuevoPerro.value = true
  perroEditando.value = null
  showEditarPerro.value = true
}

// ── Fecha de entrega ─────────────────────────────
// Fecha inicial: próximo día laborable a 7 días vista
const _initFecha = new Date()
_initFecha.setDate(_initFecha.getDate() + 7)
if (_initFecha.getDay() === 0) _initFecha.setDate(_initFecha.getDate() + 1)
if (_initFecha.getDay() === 6) _initFecha.setDate(_initFecha.getDate() + 2)
const fechaEntregaDate = ref<Date>(_initFecha)

// Festivos: nacionales España + Comunidad de Madrid
// Se generan para el año actual y los dos siguientes para cubrir cualquier
// navegación en el calendario sin necesidad de recomputar por año visible.
function festivos(y: number): Date[] {
  return [
    new Date(y, 0,  1),  // Año Nuevo
    new Date(y, 0,  6),  // Reyes Magos
    new Date(y, 3, 18),  // Viernes Santo (aprox — varía cada año)
    new Date(y, 4,  1),  // Día del Trabajo
    new Date(y, 4,  2),  // Comunidad de Madrid
    new Date(y, 7, 15),  // Asunción de la Virgen
    new Date(y, 9, 12),  // Fiesta Nacional de España
    new Date(y, 10, 1),  // Todos los Santos
    new Date(y, 10, 9),  // Almudena (Madrid)
    new Date(y, 11, 6),  // Día de la Constitución
    new Date(y, 11, 8),  // Inmaculada Concepción
    new Date(y, 11, 25), // Navidad
  ]
}
const hoy = new Date().getFullYear()
const festivosLocalidad = [...festivos(hoy), ...festivos(hoy + 1), ...festivos(hoy + 2)]

const PLAN_TIPOS = ['Plan completo', 'Plan mixto']
const planTipo = ref<'Plan completo' | 'Plan mixto'>('Plan completo')
const isMixto  = computed(() => planTipo.value === 'Plan mixto')

// ── Helpers para simular Plan mixto (valores × 0.5) ─────────────────────
function fmtEur(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€'
}
function parseEur(s: string): number {
  return parseFloat(s.replace(',', '.').replace('€', '').replace(' ', ''))
}
function halveQty(s: string): string {
  // "28u" → "14u"
  return s.replace(/^(\d+)/, (_, n) => String(Math.round(Number(n) / 2)))
}
function halveTamano(s: string): string {
  // "2x300g" → "1x300g"  |  "4x300g" → "2x300g"
  return s.replace(/^(\d+)x/, (_, n) => String(Math.round(Number(n) / 2)) + 'x')
}

const presuPrueba = computed(() => {
  const p = lead.presupuesto.prueba
  if (!isMixto.value) return p
  const orig = parseEur(p.precioOriginal)
  const prec = parseEur(p.precio)
  return { ...p, precioOriginal: fmtEur(orig / 2), precio: fmtEur(prec / 2) + ' ' }
})
const presuMensual = computed(() => {
  const m = lead.presupuesto.mensualidad
  if (!isMixto.value) return m
  const orig = parseEur(m.precioOriginal)
  const prec = parseEur(m.precio)
  return { ...m, precioOriginal: fmtEur(orig / 2), precio: fmtEur(prec / 2) + ' ' }
})

// Edición:
//  - Estado: editable para TODOS los roles
//  - Agente asignado: solo team_lead y manager pueden reasignar
const canEditAgente = computed(() => auth.currentRole !== 'agente')

function estadoSeverity(estado: string): string {
  if (estado.startsWith('No contesta')) return 'warn'
  const map: Record<string, string> = {
    'Pendiente':   'success',
    'No interesa': 'danger',
    'En cita':     'info',
    'Cita':        'info',
    'Formulario':  'contrast',
    'Venta':       'success',
  }
  return map[estado] ?? 'secondary'
}


// ── "No interesa" modal ───────────────────────────
const showNoInteresa   = ref(false)
const noInteresaMotivo = ref('')

const MOTIVOS_NO_INTERESA = [
  'Precio',
  'Su veterinario no recomienda DogfyDiet',
  'Ghosting',
  'Interés futuro',
  'No tiene tiempo para recibir el paquete',
  'No quiere suscripción',
  'No tiene espacio en el congelador',
  'Ya es cliente',
  'Método de pago',
  'Usuario Fraudulento',
  'Envío no posible',
  'No puede comer Dogfy Diet',
  'No quiere ser contactado/Borrar datos',
  'Otro',
  'Perro fallecido',
]

function confirmNoInteresa() {
  estadoLead.value = 'No interesa'
  showNoInteresa.value = false
}

function cancelNoInteresa() {
  noInteresaMotivo.value = ''
  showNoInteresa.value = false
}

// ── Helpers para perros nuevos / editados ─────────
const MESES_LOCAL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']


function calcEdad(cumplMes: string, cumplAno: string): string {
  const mesIdx = MESES_LOCAL.indexOf(cumplMes)
  if (mesIdx === -1 || !cumplAno) return ''
  const nacimiento = new Date(parseInt(cumplAno), mesIdx, 1)
  const hoy = new Date()
  const totalMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())
  if (totalMeses < 1) return '< 1 mes'
  if (totalMeses < 12) return `${totalMeses} ${totalMeses === 1 ? 'mes' : 'meses'}`
  const anos = Math.floor(totalMeses / 12)
  const meses = totalMeses % 12
  if (meses === 0) return `${anos} ${anos === 1 ? 'año' : 'años'}`
  return `${anos} ${anos === 1 ? 'año' : 'años'} y ${meses} ${meses === 1 ? 'mes' : 'meses'}`
}

function calcEtapa(cumplMes: string, cumplAno: string): string {
  const mesIdx = MESES_LOCAL.indexOf(cumplMes)
  if (mesIdx === -1 || !cumplAno) return 'Adulto'
  const nacimiento = new Date(parseInt(cumplAno), mesIdx, 1)
  const hoy = new Date()
  const totalMeses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + (hoy.getMonth() - nacimiento.getMonth())
  return totalMeses <= 12 ? 'Cachorro' : 'Adulto'
}

function calcDefaultGr(peso: number): number {
  if (peso <= 5)  return Math.round(peso * 30)
  if (peso <= 15) return Math.round(peso * 24)
  if (peso <= 30) return Math.round(peso * 20)
  return Math.round(peso * 16)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleSavePerro(formData: any) {
  if (isNuevoPerro.value) {
    const defaultGr = calcDefaultGr(formData.peso ?? 10)
    const newPerro = {
      nombre:        formData.nombre,
      kcalDia:       `${Math.round(defaultGr * 1.0)}kcal/día`,
      gDia:          `${defaultGr}g/día`,
      plan:          'Gourmet',
      menus:         formData.menus,
      sexo:          formData.sexo,
      raza:          formData.raza,
      etapa:         calcEtapa(formData.cumplMes, formData.cumplAno),
      edad:          calcEdad(formData.cumplMes, formData.cumplAno),
      peso:          formData.peso ? `${formData.peso}kg` : '',
      forma:         formData.forma || 'Figurín',
      tipoComida:    'Gourmet',
      nivelActividad: (formData.actividad || '').toLowerCase(),
      apetito:       formData.apetito || '',
      esterilizado:  formData.esterilizado,
      cumplMes:      formData.cumplMes || '',
      cumplAno:      formData.cumplAno || '',
      patologias:    (formData.patologias as string[]).map(n => ({
        nombre: n,
        incompatible: false,
      })),
    }
    lead.perros.push(newPerro)
    lead.presupuesto.items.push({
      perro:    formData.nombre,
      grDia:    String(defaultGr),
      cantidad: '28u',
      tamano:   '2x300g',
      base:     '—',
    })
    grAlgo.value.push(defaultGr)
    grOverrides.value.push(defaultGr)
  } else {
    const idx = perroEditandoIdx.value
    if (idx === -1) return
    const perro = lead.perros[idx]
    const oldNombre = perro.nombre

    perro.nombre        = formData.nombre
    perro.raza          = formData.raza
    perro.sexo          = formData.sexo
    perro.etapa         = calcEtapa(formData.cumplMes, formData.cumplAno)
    perro.edad          = calcEdad(formData.cumplMes, formData.cumplAno)
    perro.peso          = formData.peso ? `${formData.peso}kg` : perro.peso
    perro.nivelActividad = (formData.actividad || '').toLowerCase()
    perro.forma          = formData.forma || perro.forma
    perro.esterilizado   = formData.esterilizado
    perro.menus         = formData.menus
    perro.patologias    = (formData.patologias as string[]).map(n => ({
      nombre: n,
      incompatible: PATOLOGIAS_INCOMPATIBLES.has(n),
    }))

    // Sync perro name in presupuesto if it changed
    if (oldNombre !== formData.nombre) {
      const presIdx = lead.presupuesto.items.findIndex(it => it.perro === oldNombre)
      if (presIdx !== -1) lead.presupuesto.items[presIdx].perro = formData.nombre
    }
  }
}

function handleDeletePerro() {
  const idx = perroEditandoIdx.value
  if (idx === -1 || lead.perros.length <= 1) return
  const perroNombre = lead.perros[idx].nombre
  const presIdx = lead.presupuesto.items.findIndex(it => it.perro === perroNombre)
  if (presIdx !== -1) {
    lead.presupuesto.items.splice(presIdx, 1)
  }
  lead.perros.splice(idx, 1)
  showEditarPerro.value = false
}

// ── Enviar presupuesto ────────────────────────────
function handleEnviarPresupuesto() {
  const payload = {
    leadId:    lead.id,
    plan:      planTipo.value,
    cupon:     lead.cuponesAplicados,
    referidos: lead.referidos,
    items:     lead.presupuesto.items.map(it => ({
      perro:    it.perro,
      grDia:    parseInt(it.grDia),
      cantidad: it.cantidad,
      tamano:   it.tamano,
      base:     it.base,
    })),
  }
  // TODO: llamar a la API real con el payload
  console.info('[Presupuesto] payload enviado:', payload)
  toast.add({
    severity: 'success',
    summary: 'Presupuesto enviado',
    detail:  `${planTipo.value} · gramaje según algoritmo`,
    life: 5000,
  })
}
</script>

<style scoped>
.perfil-layout { display: flex; flex-direction: column; gap: 12px; }

/* ── Top bar (primera fila del contenedor) ── */
/* Grid de 2 columnas: izquierda crece (1fr), derecha siempre pegada a la derecha (auto).
   Así los botones están siempre a la derecha, aunque el contenido izquierdo envuelva. */
.perfil-topbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  padding: 4px 4px 8px;
  gap: 8px;
  font-size: 13px;
}
/* Grupo izquierdo: Agente + sep + Estado — puede envolver internamente */
.topbar-left {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
/* Cada par label+control no se rompe internamente */
.topbar-pair {
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0;
}
.topbar-actions {
  display: flex; align-items: center; gap: 8px;
  flex-shrink: 0; flex-wrap: wrap;
  justify-content: flex-end;   /* garantiza alineación derecha dentro de la columna auto */
}
/* En tablet vertical y mobile los botones viven en el FAB Speed Dial — se ocultan aquí */
@media (max-width: 900px) {
  .topbar-actions { display: none; }
  /* Colapsar grid a 1 columna cuando no hay botones */
  .perfil-topbar { grid-template-columns: 1fr; }
}
.topbar-label { color: var(--n-500, #6b7280); font-weight: 500; }

.agente-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 20px; background: var(--n-100, #f3f4f7); }
.agente-chip .agente-avatar { width: 22px; height: 22px; border-radius: 50%; background: #e6eaf2; color: #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
.agente-chip .agente-name { font-weight: 600; font-size: 12px; }
.agente-chip-value { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.agente-chip-value .agente-avatar { width: 22px; height: 22px; border-radius: 50%; background: #e6eaf2; color: #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
/* Agente select — border fully rounded (pill shape) cuando es dropdown */
.agente-select {
  min-width: 220px;
  border-radius: 999px !important;
}
.agente-select :deep(.p-select-label) { padding: 4px 8px; }
.agente-select :deep(.p-select-dropdown) { padding-right: 10px; }
/* Estado select — sin recuadro, el pill custom ES el trigger */
.estado-select {
  min-width: unset !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  gap: 0 !important;
}
.estado-select:hover,
.estado-select:focus-within {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  outline: none !important;
}
.estado-select :deep(.p-select-label) { padding: 0 !important; line-height: 1; }
/* Ocultamos el dropdown indicator nativo de PrimeVue — ahora vive dentro del pill */
.estado-select :deep(.p-select-dropdown) { display: none !important; }

/* Pill estado con chevron integrado */
.estado-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: filter .15s;
}
.estado-pill:hover { filter: brightness(0.95); }
.estado-pill-label { line-height: 1; }
.estado-pill-chevron { font-size: 9px; opacity: 0.75; }

/* Colores por severity (mismos tokens que PrimeVue Tag) */
.estado-pill--success  { background: var(--success-bg, #dcfce7); color: #15803d; }
.estado-pill--warn     { background: #fef3c7;                    color: #a16207; }
.estado-pill--danger   { background: #fee2e2;                    color: #b91c1c; }
.estado-pill--info     { background: #dbeafe;                    color: #1e40af; }
.estado-pill--contrast { background: #ede9fe;                    color: #6d28d9; }
.estado-pill--secondary{ background: var(--n-100);               color: var(--n-700); }

.sep { color: var(--n-300, #d1d5db); margin: 0 4px; }
.cta-llamar { background: var(--brand, #ef6948) !important; border-color: var(--brand, #ef6948) !important; }

/* ── Contenedor padre unificado ── */
.config-container {
  background: #fff; border: 1px solid var(--n-200, #e6e8ee); border-radius: 14px;
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
}
.config-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px; align-items: start; }
.col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

/* ── Module cards ── */
.module-card { padding: 12px 14px !important; border-radius: 10px; }
.card-title-row { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--n-800); }
/* Botón edit (lápiz) — hover circular, no cuadrado */
.card-edit {
  margin-left: auto;
}
.card-edit:deep(.p-button),
:deep(.card-edit) {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 50% !important;
}
:deep(.card-edit:hover) {
  background: var(--n-100) !important;
}

/* Línea de gramaje */
.perro-line--gr { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.perro-plan-label { font-size: 12px; color: var(--n-500); font-weight: 500; flex-shrink: 0; }

/* ── Perro card ── */
.svg-icon { width: 18px; height: 18px; vertical-align: middle; }
.perro-section { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }
.perro-line { font-size: 13px; color: var(--n-700, #2b2b2b); margin: 0; line-height: 1.6; }
.perro-line.bold { font-weight: 600; margin-top: 4px; }
.card-divider { border: none; border-top: 1px solid var(--n-150, #ebedf2); margin: 8px 0; }
.perro-patologias-label { font-weight: 600; margin-right: 2px; }

/* ── Lead card ── */
.lead-meta p { font-size: 13px; margin: 4px 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lead-meta .bold { font-weight: 600; font-size: 14px; }
:deep(.copy-btn.p-button) {
  width: 22px !important;
  height: 22px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  color: var(--n-500) !important;
  flex-shrink: 0;
  --p-button-text-primary-hover-background: var(--n-100);
  --p-button-text-primary-active-background: var(--n-150, var(--n-200));
}
.fuente-tag { margin-right: 4px; }

/* ── Envío ── */
.envio-meta p { font-size: 13px; margin: 4px 0; color: var(--n-700, #2b2b2b); }

/* ── Fecha ── */
.gls-logo { margin-left: auto; height: 20px; width: auto; }
.fecha-disclaimer {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--n-400);
  margin: 0 0 10px;
}
.fecha-disclaimer .pi { font-size: 11px; }
.fecha-picker { width: 100%; }
.fecha-picker :deep(.p-datepicker-input) { font-size: 13px; }
.ml-auto { margin-left: auto; }

/* ── Cupón y referidos ── */
.codigo-label { font-size: 11px; font-weight: 600; color: var(--n-500); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.codigo-row { display: flex; align-items: stretch; gap: 6px; }
.codigo-row :deep(.codigo-input) { flex: 1; }
.codigo-row :deep(.p-button) { flex-shrink: 0; width: 38px; padding: 0 !important; }
.badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; align-items: center; }
.remove-x { font-size: 10px; cursor: pointer; margin-left: 6px; }

/* Chips PrimeVue-like para cupones / referidos */
.chip-pv { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.chip-pv--success { background: var(--success-bg); color: #15803d; }

/* ── Presupuesto ── */
.highlight-card { }

/* Plan toggle */
.plan-toggle { margin-bottom: 18px; width: 100%; }
.plan-toggle :deep(.p-selectbutton) { width: 100%; display: flex; }
.plan-toggle :deep(.p-togglebutton) { flex: 1; font-size: 12px; font-weight: 500; justify-content: center; }

/* Precios informativos */
.presu-info { display: flex; align-items: stretch; gap: 0; margin-bottom: 20px; }
.presu-info-col { flex: 1; display: flex; flex-direction: column; gap: 7px; padding: 0 16px; }
.presu-info-col:first-child { padding-left: 0; }
.presu-info-col:last-child  { padding-right: 0; }
.presu-info-label { font-size: 12px; color: var(--n-500); }
.presu-divider-v { width: 1px; background: var(--n-150); flex-shrink: 0; }
.presu-dto {
  display: inline-block; padding: 2px 8px; border-radius: 6px;
  background: var(--success-bg); color: #15803d;
  font-size: 12px; font-weight: 600; align-self: flex-start;
}
.presu-precio { display: flex; align-items: baseline; gap: 6px; font-size: 16px; }
.presu-precio s { color: var(--n-400); font-size: 12px; }

.presu-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; margin-bottom: 16px; }
.presu-table th, .presu-table td { text-align: left; padding: 8px 4px; }
.presu-table thead th { color: var(--n-500); font-weight: 500; border-bottom: 1px solid var(--n-200); }
.presu-table .total-row { font-weight: 700; border-top: 1px solid var(--n-200); }
.presu-actions { display: flex; flex-direction: column; gap: 10px; }
.full-btn { width: 100%; }
.cta-primary { background: var(--brand) !important; border-color: var(--brand) !important; color: #fff !important; }

.tpv-btn { border-color: var(--warning) !important; color: var(--warning) !important; }
.tpv-btn:hover { background: var(--warning-bg) !important; }
.feria-notice {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--warning); font-weight: 500;
  margin-top: 4px; padding: 6px 10px;
  background: var(--warning-bg); border-radius: 6px;
}


/* ── Add btn ── */
.add-btn { align-self: flex-start; }

/* ── Responsive: 1 columna en pantallas pequeñas ── */
@media (max-width: 1100px) {
  .config-grid { grid-template-columns: 1fr; }
}

/* ── Narrow content area (sidebar visible, panel hidden, ~350–540px content) ── */
@media (max-width: 640px) {
  .config-container { padding: 10px 8px; gap: 8px; }
  .module-card { padding: 10px 10px !important; }
  .agente-select { min-width: 150px !important; }
  .topbar-label { display: none; }          /* hide "Agente:" "Estado:" labels */
  .sep { display: none; }
  .topbar-pair { gap: 4px; }
  .topbar-actions { gap: 6px; }

  /* Budget table: scrollable instead of cramped 5 columns */
  .presu-table { display: block; overflow-x: auto; }
  .presu-table th, .presu-table td { white-space: nowrap; padding: 6px 8px; }

  /* Pricing info: stack vertically */
  .presu-info { flex-direction: column; gap: 10px; }
  .presu-divider-v { display: none; }
  .presu-info-col { padding: 0 !important; }

  /* Plan toggle full width */
  .plan-toggle { margin-bottom: 12px; }
}

:deep(.tag-formulario) { background: #ede9fe; color: #6d28d9; }

/* ── No interesa dialog ── */
.ni-header { display: flex; align-items: center; gap: 12px; }
.ni-icon {
  width: 36px; height: 36px; border-radius: 50%;
  background: #fee2e2; color: #b91c1c;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.ni-title  { font-size: 15px; font-weight: 700; color: var(--n-900); }
.ni-sub    { font-size: 12px; color: var(--n-500); margin-top: 2px; }
.ni-body   { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }
.ni-label  { font-size: 12px; font-weight: 500; color: var(--n-700); }
.ni-select { width: 100%; }
.ni-footer { display: flex; gap: 10px; width: 100%; }
.ni-footer :deep(.p-button) { flex: 1; justify-content: center; }
</style>
