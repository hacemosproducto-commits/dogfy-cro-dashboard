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
          <Button label="Reportar lead falso" severity="secondary" outlined size="small" />
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
              <span class="ps-stitle">Nutrición</span>
              <div class="ps-nutri-row">
                <div class="ps-gr-hero">
                  <template v-if="perroGrData(perro.nombre).active">
                    <span class="ps-gr-num">{{ isMixto ? Math.round(perroGrData(perro.nombre).valor / 2) : perroGrData(perro.nombre).valor }}</span>
                  </template>
                  <template v-else>
                    <span class="ps-gr-num">{{ isMixto ? Math.round(parseInt(perro.gDia) / 2) : parseInt(perro.gDia) }}</span>
                  </template>
                  <span class="ps-gr-unit">g/día</span>
                </div>
                <span class="ps-plan-pill" :class="isMixto ? 'ps-plan-pill--mixto' : 'ps-plan-pill--completo'">
                  {{ isMixto ? 'Plan mixto' : 'Plan completo' }}
                </span>
              </div>
              <div v-if="perroGrData(perro.nombre).active" class="ps-delta-row">
                <span class="gr-delta-chip">Δ {{ perroGrData(perro.nombre).delta > 0 ? '+' : '' }}{{ isMixto ? Math.round(perroGrData(perro.nombre).delta / 2) : perroGrData(perro.nombre).delta }}g vs algoritmo</span>
              </div>
              <div class="ps-inline-row">
                <span class="ps-key">Tipo</span>
                <span class="ps-val">{{ perro.tipoComida }}</span>
              </div>
              <div class="ps-menus-row">
                <span class="ps-key">Menús</span>
                <div class="ps-chips">
                  <span v-for="m in perro.menus" :key="m" class="ps-chip">{{ m }}</span>
                </div>
              </div>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <span class="ps-stitle">Físico</span>
              <div class="ps-grid2">
                <div class="ps-pair"><span class="ps-key">Sexo</span><span class="ps-val">{{ perro.sexo }}</span></div>
                <div class="ps-pair"><span class="ps-key">Peso</span><span class="ps-val">{{ perro.peso }}</span></div>
                <div class="ps-pair"><span class="ps-key">Raza</span><span class="ps-val">{{ perro.raza }}</span></div>
                <div class="ps-pair"><span class="ps-key">Edad</span><span class="ps-val">{{ perro.edad }}</span></div>
                <div class="ps-pair"><span class="ps-key">Etapa</span><span class="ps-val">{{ perro.etapa }}</span></div>
                <div class="ps-pair"><span class="ps-key">Silueta</span><span class="ps-val">{{ perro.forma }}</span></div>
              </div>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <span class="ps-stitle">Salud</span>
              <div class="ps-grid2 ps-grid2--mb">
                <div class="ps-pair"><span class="ps-key">Actividad</span><span class="ps-val">{{ capitalize(perro.nivelActividad) }}</span></div>
                <div class="ps-pair"><span class="ps-key">Esterilizado</span><span class="ps-val">{{ perro.esterilizado }}</span></div>
              </div>
              <template v-if="perro.patologias.length">
                <p class="ps-pat-label">Patologías</p>
                <div class="patologias">
                  <InfoTooltip v-for="(p, i) in perro.patologias" :key="i">
                    <Tag :value="p.nombre" :severity="p.incompatible ? 'danger' : 'info'" :icon="p.incompatible ? 'pi pi-exclamation-triangle' : 'pi pi-info-circle'" />
                    <template #content>
                      <template v-if="p.incompatible">
                        <p class="itip-title itip-title--error">⚠ Incompatible con Dogfy</p>
                        <hr class="itip-sep" />
                        <p class="itip-row">{{ incompatReason(p.nombre) }}</p>
                        <p class="itip-row">La fórmula estándar no puede adaptarse a esta patología.</p>
                        <a href="https://help.dogfydiet.com/patologias" target="_blank" rel="noopener" class="itip-link">Ver más en Help Center →</a>
                      </template>
                      <template v-else>
                        <p class="itip-title" style="color: var(--n-800)">✓ Compatible con Dogfy</p>
                        <hr class="itip-sep" />
                        <p class="itip-row">{{ compatReason(p.nombre) }}</p>
                      </template>
                    </template>
                  </InfoTooltip>
                </div>
              </template>
              <p v-else class="ps-key" style="margin-top: 2px;">Sin patologías</p>
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
          <Button label="Enlazar otro lead" icon="pi pi-user-plus" severity="secondary" outlined size="small" class="add-btn" />

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

          <!-- Cupón + Código de referidos -->
          <SectionCard class="card-codigos module-card">
            <template #header><span class="card-title-row">Cupón y referidos</span></template>

            <!-- Cupón -->
            <div class="codigo-label">Cupón</div>
            <div class="codigo-row">
              <InputText v-model="cuponInput" placeholder="Ej. DOGFY2025" class="codigo-input" />
              <Button icon="pi pi-arrow-right" size="small" />
            </div>
            <div class="badge-row">
              <span
                v-for="(c, i) in lead.cuponesAplicados"
                :key="i"
                class="chip-pv"
                :class="i === 0 ? 'chip-pv--readonly' : 'chip-pv--success'"
              >
                {{ c }}
                <i v-if="i > 0" class="pi pi-times remove-x" />
                <i v-else class="pi pi-lock readonly-icon" title="Solo lectura" />
              </span>
            </div>

            <hr class="card-divider" style="margin: 10px 0" />

            <!-- Código de referidos -->
            <div class="codigo-label">Código de referidos</div>
            <div class="codigo-row">
              <InputText v-model="referidoInput" placeholder="Ej. AMIGO-202" class="codigo-input" />
              <Button icon="pi pi-arrow-right" size="small" />
            </div>
            <div class="badge-row">
              <span
                v-for="(r, i) in lead.referidos"
                :key="i"
                class="chip-pv chip-pv--success"
              >
                {{ r }}
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
                  <td>
                    <template v-if="overrideEnabled">
                      <div class="gr-cell">
                        <div class="gr-input-row">
                          <InputNumber
                            :modelValue="getGr(i)"
                            @update:modelValue="setGr(i, $event)"
                            :min="1" :max="9999"
                            inputClass="gr-inp"
                            suffix="g"
                          />
                          <span
                            class="gr-chain"
                            :class="{ 'gr-chain--override': displayGr[i] !== displayAlgo[i] }"
                            :title="displayGr[i] !== displayAlgo[i] ? 'Override activo: ' + displayGr[i] + 'g (alg: ' + displayAlgo[i] + 'g)' : 'Sigue el algoritmo: ' + displayAlgo[i] + 'g'"
                          >
                            <i class="pi pi-link" />
                          </span>
                        </div>
                        <span
                          v-if="displayGr[i] !== displayAlgo[i]"
                          :class="['gr-delta', displayGr[i] > displayAlgo[i] ? 'gr-delta--up' : 'gr-delta--down']"
                        >{{ displayGr[i] > displayAlgo[i] ? '+' : '' }}{{ displayGr[i] - displayAlgo[i] }}g vs alg.</span>
                      </div>
                    </template>
                    <template v-else>{{ displayGr[i] }}g</template>
                  </td>
                  <td>{{ isMixto ? halveQty(it.cantidad) : it.cantidad }}</td>
                  <td>{{ isMixto ? halveTamano(it.tamano) : it.tamano }}</td>
                  <td>{{ isMixto ? fmtEur(parseEur(it.base) / 2) : it.base }}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td>
                    <template v-if="overrideEnabled">
                      <span>{{ displayGrTotal }}g</span>
                      <span v-if="displayGrTotal !== displayAlgo.reduce((s,v)=>s+v,0)"
                            :class="['gr-delta', 'gr-delta--neutral']">
                        (alg: {{ displayAlgo.reduce((s,v)=>s+v,0) }}g)
                      </span>
                    </template>
                    <template v-else>{{ isMixto ? Math.round(parseInt(lead.presupuesto.total.grDia) / 2) + 'g' : lead.presupuesto.total.grDia }}</template>
                  </td>
                  <td>{{ isMixto ? halveQty(lead.presupuesto.total.cantidad) : lead.presupuesto.total.cantidad }}</td>
                  <td>{{ isMixto ? halveTamano(lead.presupuesto.total.tamano) : lead.presupuesto.total.tamano }}</td>
                  <td>{{ isMixto ? fmtEur(parseEur(lead.presupuesto.total.base) / 2) : lead.presupuesto.total.base }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Acciones comerciales centralizadas dentro del Presupuesto -->
            <div v-if="leadIncompatible" class="incompat-notice">
              <i class="pi pi-ban" />
              <div>
                <span class="incompat-notice-title">Venta bloqueada</span>
                <span class="incompat-notice-sub">Uno o más perros tienen una patología incompatible con Dogfy Diet.</span>
              </div>
            </div>
            <div class="presu-actions">
              <Button label="Enviar presupuesto" class="full-btn cta-primary" :disabled="leadIncompatible" @click="handleEnviarPresupuesto" />
              <Button label="Formulario de pago" severity="secondary" outlined class="full-btn" :disabled="leadIncompatible" />
              <Button label="Pago con tarjeta" severity="secondary" outlined class="full-btn" :disabled="leadIncompatible" />
              <Button label="Bizum" severity="secondary" outlined class="full-btn" :disabled="leadIncompatible" />
              <!-- TPV: solo visible cuando el agente está en modo feria -->
              <Button
                v-if="isAgenteEnFeria"
                label="TPV"
                icon="pi pi-credit-card"
                severity="warning"
                outlined
                class="full-btn tpv-btn"
                :disabled="leadIncompatible"
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
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import SectionCard from '@/components/ui/SectionCard.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
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
const referidoInput = ref('')
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
// Display gramaje efectivo en tabla (grOverride × factor)
const displayGr = computed(() =>
  grOverrides.value.map(v => isMixto.value ? Math.round(v / 2) : v)
)
const displayGrTotal = computed(() =>
  displayGr.value.reduce((s, v) => s + v, 0)
)
// Display valor del algoritmo (también ajustado al factor mixto)
const displayAlgo = computed(() =>
  grAlgo.value.map(v => isMixto.value ? Math.round(v / 2) : v)
)

// Getters/setters para el InputNumber — en mixto muestra mitad y guarda el doble
function getGr(i: number): number {
  return displayGr.value[i]
}
function setGr(i: number, val: number | null) {
  if (val == null) return
  grOverrides.value[i] = isMixto.value ? val * 2 : val
}

// ── Override de gramaje ───────────────────────────
// TODO: conectar al config de país cuando exista store global
const overrideEnabled = ref(true)  // demo: true; en prod leer de ConfiguracionView store

const grAlgo = ref<number[]>(lead.presupuesto.items.map(it => parseInt(it.grDia)))
const grOverrides = ref<number[]>([...grAlgo.value])

// ── Gramaje override por perro — para sincronizar la card del perro con el presupuesto ──
function perroGrData(nombre: string): { active: boolean; valor: number; algo: number; delta: number } {
  const idx = lead.presupuesto.items.findIndex(it => it.perro === nombre)
  if (idx === -1 || !overrideEnabled.value) return { active: false, valor: 0, algo: 0, delta: 0 }
  const algo  = grAlgo.value[idx]
  const valor = grOverrides.value[idx]
  return { active: valor !== algo, valor, algo, delta: valor - algo }
}

// ── Razones de incompatibilidad por patología ─────
const INCOMPAT_REASONS: Record<string, string> = {
  'Insuficiencia renal':   'El exceso de proteína animal acelera el daño glomerular.',
  'Enfermedad renal':      'El exceso de proteína animal acelera el daño glomerular.',
  'Insuficiencia hepática':'El hígado no puede metabolizar la carga proteica estándar.',
  'Pancreatitis':          'La grasa animal en la fórmula puede desencadenar episodios agudos.',
}
function incompatReason(nombre: string): string {
  return INCOMPAT_REASONS[nombre] ?? 'Esta patología presenta contraindicaciones directas con nuestra fórmula.'
}

// ── Razones de compatibilidad por patología ────────
const COMPAT_REASONS: Record<string, string> = {
  'Diabetes':             'Sin cereales ni azúcares añadidos — ayuda a estabilizar la glucemia y reduce los picos de insulina.',
  'Artritis':             'La proteína de alta digestibilidad y los omega-3 apoyan la salud articular y reducen la inflamación.',
  'Obesidad':             'Gramaje ajustado al peso objetivo del perro. Control preciso de calorías sin dieta de golpe.',
  'Epilepsia':            'La dieta no interfiere con la medicación antiepiléptica. Coordinamos con el veterinario si es necesario.',
  'Alergias alimentarias':'Excluimos los alérgenos identificados y formulamos con proteínas alternativas seguras.',
}
function compatReason(nombre: string): string {
  return COMPAT_REASONS[nombre] ?? 'Esta condición es compatible con nuestra fórmula. Adaptamos el plan si el veterinario lo recomienda.'
}

// ── Incompatibilidad global del lead ──────────────
const leadIncompatible = computed(() =>
  lead.perros.some(dog => dog.patologias.some((p: { incompatible: boolean }) => p.incompatible))
)

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
const PATOLOGIAS_INCOMPATIBLES = new Set(['Insuficiencia renal', 'Insuficiencia hepática', 'Pancreatitis'])

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
        incompatible: PATOLOGIAS_INCOMPATIBLES.has(n),
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
    grAlgo.value.splice(presIdx, 1)
    grOverrides.value.splice(presIdx, 1)
  }
  lead.perros.splice(idx, 1)
  showEditarPerro.value = false
}

// ── Enviar presupuesto ────────────────────────────
function handleEnviarPresupuesto() {
  // Construye el payload final aplicando los overrides de gramaje
  const itemsFinales = lead.presupuesto.items.map((it, i) => ({
    perro:    it.perro,
    grDia:    overrideEnabled.value ? grOverrides.value[i] : parseInt(it.grDia),
    grAlgo:   grAlgo.value[i],
    override: overrideEnabled.value && grOverrides.value[i] !== grAlgo.value[i],
    cantidad: it.cantidad,
    tamano:   it.tamano,
    base:     it.base,
  }))
  const payload = {
    leadId:    lead.id,
    plan:      planTipo.value,
    cupon:     lead.cuponesAplicados,
    referidos: lead.referidos,
    items:     itemsFinales,
    overrides: itemsFinales.filter(it => it.override).map(it => ({
      perro: it.perro, grFinal: it.grDia, grAlgo: it.grAlgo,
      delta: it.grDia - it.grAlgo,
    })),
  }
  // TODO: llamar a la API real con el payload
  console.info('[Presupuesto] payload enviado:', payload)

  const hasOverrides = payload.overrides.length > 0
  toast.add({
    severity: 'success',
    summary: 'Presupuesto enviado',
    detail: hasOverrides
      ? `${planTipo.value} · ${payload.overrides.map(o => `${o.perro}: ${o.grFinal}g (${o.delta > 0 ? '+' : ''}${o.delta}g vs alg.)`).join(' · ')}`
      : `${planTipo.value} · gramaje según algoritmo`,
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

/* ── Override gramaje — asterisco + chip delta en card perro ── */
.gr-override-wrap {
  display: inline-flex; align-items: baseline; gap: 6px; position: relative;
  flex-wrap: wrap;
}
/* Línea de gramaje — flex para label + valor inline */
.perro-line--gr { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.perro-plan-label { font-size: 12px; color: var(--n-500); font-weight: 500; flex-shrink: 0; }

/* Chip delta visible — azul informativo (override no es necesariamente malo, puede ser
   la decisión correcta para ese perro específico) */
.gr-delta-chip {
  display: inline-flex; align-items: center;
  background: #CFFAFE; color: #0e7490;
  font-size: 11px; font-weight: 600;
  padding: 2px 8px; border-radius: 6px;
  line-height: 1.4;
  white-space: nowrap;
}
.gr-asterisk-badge {
  position: relative; display: inline-block;
  font-size: 11px; font-weight: 700; color: var(--brand, #ef6948);
  top: -3px; cursor: default; line-height: 1;
}
.gr-asterisk-tip {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  left: 0; transform: none;
  width: 170px;
  background: #fff;
  border: 1px solid var(--n-200);
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.10);
  padding: 8px 10px;
  flex-direction: column; gap: 3px;
  z-index: 300; pointer-events: none;
  white-space: normal; text-align: left;
}
.gr-asterisk-badge:hover .gr-asterisk-tip { display: flex; }
.gr-asterisk-tip strong { font-size: 11px; color: var(--brand, #ef6948); }
.gr-asterisk-tip span   { font-size: 11px; color: var(--n-600); line-height: 1.5; }

/* patologias: wrap uses InfoTooltip component (see InfoTooltip.vue for shared styles) */

/* ── Perro card ── */
.svg-icon { width: 18px; height: 18px; vertical-align: middle; }
.perro-section { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }
.card-divider { border: none; border-top: 1px solid var(--n-150, #ebedf2); margin: 8px 0; }
.patologias { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
.ps-stitle { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 2px; }
.ps-nutri-row { display: flex; align-items: center; justify-content: space-between; }
.ps-gr-hero { display: flex; align-items: baseline; gap: 4px; }
.ps-gr-num { font-size: 28px; font-weight: 600; color: var(--n-800); line-height: 1.1; }
.ps-gr-unit { font-size: 13px; color: var(--n-400); }
.ps-delta-row { margin-top: 2px; }
.ps-plan-pill { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px; white-space: nowrap; flex-shrink: 0; }
.ps-plan-pill--completo { background: var(--success-bg); color: #15803d; }
.ps-plan-pill--mixto { background: #FFF7ED; color: #C2410C; }
.ps-inline-row { display: flex; align-items: center; gap: 8px; }
.ps-menus-row { display: flex; align-items: flex-start; gap: 8px; }
.ps-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.ps-chip { font-size: 12px; background: var(--n-50); color: var(--n-700); padding: 2px 9px; border-radius: 100px; border: 1px solid var(--n-150); white-space: nowrap; }
.ps-key { font-size: 11px; color: var(--n-400); }
.ps-val { font-size: 13px; font-weight: 500; color: var(--n-700); }
.ps-pair { display: flex; flex-direction: column; gap: 1px; }
.ps-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
.ps-grid2--mb { margin-bottom: 8px; }
.ps-pat-label { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 4px; }
.incompat-notice {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff1f0; border-radius: 8px; padding: 10px 12px;
  color: #c8452a; margin-bottom: 8px;
}
.incompat-notice .pi { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
.incompat-notice > div { display: flex; flex-direction: column; gap: 2px; }
.incompat-notice-title { font-size: 13px; font-weight: 700; }
.incompat-notice-sub   { font-size: 12px; line-height: 1.4; }

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
.chip-pv--readonly { background: var(--n-100); color: var(--n-500); cursor: not-allowed; }
.readonly-icon { font-size: 10px; opacity: 0.6; }

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

/* Disabled override — aplica a todos los botones de acción cuando la venta está bloqueada */
.presu-actions :deep(.p-button:disabled),
.presu-actions :deep(.p-button[data-p-disabled="true"]) {
  background: var(--n-100) !important;
  border-color: var(--n-200) !important;
  color: var(--n-400) !important;
  opacity: 1 !important;
  cursor: not-allowed !important;
  pointer-events: none;
}
.tpv-btn { border-color: var(--warning) !important; color: var(--warning) !important; }
.tpv-btn:hover { background: var(--warning-bg) !important; }
.feria-notice {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: var(--warning); font-weight: 500;
  margin-top: 4px; padding: 6px 10px;
  background: var(--warning-bg); border-radius: 6px;
}

/* Gramaje override — icono de cadena por fila */
.gr-cell { display: flex; flex-direction: column; gap: 3px; }
.gr-input-row { display: flex; align-items: center; gap: 6px; }
.gr-input-row :deep(.gr-inp) { width: 68px; font-size: 12px; padding: 4px 6px; }

/* Cadena: intacta = algoritmo, rota = override */
.gr-chain {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; flex-shrink: 0;
  color: var(--n-300);
  transition: color 0.15s;
  cursor: default;
}
.gr-chain--override { color: var(--brand, #ef6948); }
.gr-chain--override::after {
  content: '';
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 16px; height: 1.5px;
  background: var(--brand, #ef6948);
  border-radius: 1px;
}

/* Delta de override en tabla presupuesto — mismo color azul informativo que el chip de la card.
   No diferenciamos +/- porque el override puede ser una decisión válida en ambos sentidos. */
.gr-delta { font-size: 10px; font-weight: 600; align-self: flex-start; padding: 2px 7px; border-radius: 6px; line-height: 1.4; }
.gr-delta--up,
.gr-delta--down    { background: #CFFAFE; color: #0e7490; }
.gr-delta--neutral { background: var(--n-100); color: var(--n-500); font-weight: 400; }

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
