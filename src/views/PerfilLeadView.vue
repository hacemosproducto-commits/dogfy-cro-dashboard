<template>
  <div class="perfil-layout">
    <!-- ═══ Contenedor padre unificado ═══
         Topbar (agente/estado/CTAs) + todos los módulos del lead. -->
    <div class="config-container">
      <!-- Topbar como primera fila del contenedor -->
      <div class="perfil-topbar">
        <div class="topbar-info">
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

          <span class="sep">|</span>
          <span class="topbar-label">Estado:</span>
          <Select v-model="estadoLead" :options="ESTADOS_LEAD" class="estado-select">
            <template #value="{ value }">
              <Tag :value="value || estadoLead" :severity="estadoSeverity(value || estadoLead)" :class="{ 'tag-formulario': (value || estadoLead) === 'Formulario' }" />
            </template>
            <template #option="{ option }">
              <Tag :value="option" :severity="estadoSeverity(option)" :class="{ 'tag-formulario': option === 'Formulario' }" />
            </template>
          </Select>
        </div>

        <div class="topbar-actions">
          <Button label="+ Crear lead" severity="secondary" outlined size="small" @click="showCrear = true" />
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
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="openEditarPerro(perro)" />
            </template>
            <div class="perro-section">
              <p class="perro-line">
                <template v-if="perroGrData(perro.nombre).active">
                  <span class="gr-override-wrap">
                    {{ perroGrData(perro.nombre).valor }}g/día<span class="gr-asterisk-badge">*
                      <span class="gr-asterisk-tip">
                        <strong>Override activo</strong>
                        <span>Ajustado: {{ perroGrData(perro.nombre).valor }}g/día</span>
                        <span>Algoritmo: {{ perroGrData(perro.nombre).algo }}g/día</span>
                        <span>Δ {{ perroGrData(perro.nombre).delta > 0 ? '+' : '' }}{{ perroGrData(perro.nombre).delta }}g</span>
                      </span>
                    </span>
                  </span>
                </template>
                <template v-else>{{ perro.gDia }}</template>
              </p>
              <p class="perro-line">Menús: {{ perro.menus.map(m => `[${m}]`).join(', ') }}</p>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <p class="perro-line">[{{ perro.sexo }}] · [{{ perro.raza }}]</p>
              <p class="perro-line">[{{ perro.etapa }}] · [{{ perro.edad }}]</p>
              <p class="perro-line">[{{ perro.peso }}] · [{{ perro.forma }}] · [{{ perro.tipoComida }}]</p>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <p class="perro-line">Nivel de actividad: [{{ perro.nivelActividad }}] · Esterilizado: [{{ perro.esterilizado }}]</p>
              <p class="perro-line bold">Patologías:</p>
              <div class="patologias">
                <InfoTooltip
                  v-for="(p, i) in perro.patologias"
                  :key="i"
                >
                  <Tag
                    :value="p.nombre"
                    :severity="p.incompatible ? 'danger' : 'info'"
                    :icon="p.incompatible ? 'pi pi-exclamation-triangle' : 'pi pi-info-circle'"
                  />
                  <template v-if="p.incompatible" #content>
                    <p class="itip-title itip-title--error">⚠ {{ p.nombre }}</p>
                    <hr class="itip-sep" />
                    <p class="itip-row">{{ incompatReason(p.nombre) }}</p>
                    <p class="itip-row">La fórmula estándar no puede adaptarse a esta patología.</p>
                    <a href="https://help.dogfydiet.com/patologias" target="_blank" rel="noopener" class="itip-link">Ver más en Help Center →</a>
                  </template>
                </InfoTooltip>
              </div>
              <div v-if="hasIncompatible(perro)" class="incompatible-banner">
                <i class="pi pi-exclamation-triangle" />
                <span>Incompatible con Dogfy Diet</span>
              </div>
            </div>
          </SectionCard>
          <Button label="Añade otro perro" icon="pi pi-plus-circle" severity="secondary" outlined size="small" class="add-btn" @click="openNuevoPerro" />

          <!-- Card Lead ID -->
          <SectionCard class="card-lead module-card">
            <template #header>
              <span class="card-title-row"><i class="pi pi-user" /> Lead ID: [{{ lead.leadCode }}]</span>
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="showEditarLead = true" />
            </template>
            <div class="lead-meta">
              <p class="bold">[{{ lead.nombre }}] [{{ lead.apellido }}]</p>
              <p class="copy-row">
                [{{ lead.email }}]
                <Button icon="pi pi-copy" text rounded size="small" class="copy-btn" />
              </p>
              <p class="copy-row">
                {{ lead.telefono }}
                <Button icon="pi pi-copy" text rounded size="small" class="copy-btn" />
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
              <InputText v-model="cuponInput" placeholder="[cupón pregrabado de agente]" class="codigo-input" />
              <Button icon="pi pi-arrow-right" size="small" />
            </div>
            <div class="badge-row">
              <span
                v-for="(c, i) in lead.cuponesAplicados"
                :key="i"
                class="chip-pv"
                :class="i === 0 ? 'chip-pv--readonly' : 'chip-pv--success'"
              >
                [{{ c }}]
                <i v-if="i > 0" class="pi pi-times remove-x" />
                <i v-else class="pi pi-lock readonly-icon" title="Solo lectura" />
              </span>
            </div>

            <hr class="card-divider" style="margin: 10px 0" />

            <!-- Código de referidos -->
            <div class="codigo-label">Código de referidos</div>
            <div class="codigo-row">
              <InputText v-model="referidoInput" placeholder="[AMIGO-202]" class="codigo-input" />
              <Button icon="pi pi-arrow-right" size="small" />
            </div>
            <div class="badge-row">
              <span
                v-for="(r, i) in lead.referidos"
                :key="i"
                class="chip-pv chip-pv--success"
              >
                [{{ r }}]
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
                <span class="presu-dto">{{ lead.presupuesto.prueba.dto }} 🎉</span>
                <span class="presu-precio">
                  <s>{{ lead.presupuesto.prueba.precioOriginal }}</s>
                  <strong>{{ lead.presupuesto.prueba.precio }}</strong>
                </span>
              </div>
              <div class="presu-divider-v" />
              <div class="presu-info-col">
                <span class="presu-info-label">Mensualidad</span>
                <span class="presu-dto">{{ lead.presupuesto.mensualidad.dto }} 🎉</span>
                <span class="presu-precio">
                  <s>{{ lead.presupuesto.mensualidad.precioOriginal }}</s>
                  <strong>{{ lead.presupuesto.mensualidad.precio }}</strong>
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
                            v-model="grOverrides[i]"
                            :min="1" :max="9999"
                            inputClass="gr-inp"
                            suffix="g"
                          />
                          <span
                            class="gr-chain"
                            :class="{ 'gr-chain--override': grOverrides[i] !== grAlgo[i] }"
                            :title="grOverrides[i] !== grAlgo[i] ? 'Override activo: ' + grOverrides[i] + 'g (alg: ' + grAlgo[i] + 'g)' : 'Sigue el algoritmo: ' + grAlgo[i] + 'g'"
                          >
                            <i class="pi pi-link" />
                          </span>
                        </div>
                        <span
                          v-if="grOverrides[i] !== grAlgo[i]"
                          :class="['gr-delta', grOverrides[i] > grAlgo[i] ? 'gr-delta--up' : 'gr-delta--down']"
                        >{{ grOverrides[i] > grAlgo[i] ? '+' : '' }}{{ grOverrides[i] - grAlgo[i] }}g vs alg.</span>
                      </div>
                    </template>
                    <template v-else>{{ it.grDia }}</template>
                  </td>
                  <td>{{ it.cantidad }}</td><td>{{ it.tamano }}</td><td>{{ it.base }}</td>
                </tr>
                <tr class="total-row">
                  <td>Total:</td>
                  <td>
                    <template v-if="overrideEnabled">
                      <span>{{ grOverrides.reduce((s, v) => s + v, 0) }}g</span>
                      <span v-if="grOverrides.reduce((s,v)=>s+v,0) !== grAlgo.reduce((s,v)=>s+v,0)"
                            :class="['gr-delta', 'gr-delta--neutral']">
                        (alg: {{ grAlgo.reduce((s,v)=>s+v,0) }}g)
                      </span>
                    </template>
                    <template v-else>{{ lead.presupuesto.total.grDia }}</template>
                  </td>
                  <td>{{ lead.presupuesto.total.cantidad }}</td>
                  <td>{{ lead.presupuesto.total.tamano }}</td>
                  <td>{{ lead.presupuesto.total.base }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Acciones comerciales centralizadas dentro del Presupuesto -->
            <div class="presu-actions">
              <Button label="Enviar presupuesto" class="full-btn cta-primary" @click="handleEnviarPresupuesto" />
              <Button label="Formulario de pago" severity="secondary" outlined class="full-btn" />
              <Button label="Pago con tarjeta" severity="secondary" outlined class="full-btn" />
              <Button label="Bizum" severity="secondary" outlined class="full-btn" />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  </div>

  <CrearLeadModal v-model:visible="showCrear" />

  <EditarPerroModal
    v-model:visible="showEditarPerro"
    :perro="perroEditando"
    @delete="showEditarPerro = false"
  />

  <EditarLeadModal
    v-model:visible="showEditarLead"
    :lead="{ nombre: lead.nombre, apellido: lead.apellido, email: lead.email, telefono: lead.telefono }"
  />

  <EditarEnvioModal
    v-model:visible="showEditarEnvio"
    :envio="lead.datosEnvio"
  />

  <Toast position="bottom-right" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import SectionCard from '@/components/ui/SectionCard.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import CrearLeadModal from '@/components/leads/CrearLeadModal.vue'
import EditarPerroModal from '@/components/leads/EditarPerroModal.vue'
import EditarLeadModal from '@/components/leads/EditarLeadModal.vue'
import EditarEnvioModal from '@/components/leads/EditarEnvioModal.vue'
import { mockPerfilLead, ESTADOS_LEAD } from '@/data/mock'
import { useAuthStore } from '@/stores/auth'
import dogIcon from '@/assets/icons/dog.svg'
import truckIcon from '@/assets/icons/truck.svg'
import glsLogo from '@/assets/icons/gls-logo.svg'

const auth = useAuthStore()
const toast = useToast()
const lead = mockPerfilLead
const estadoLead = ref<string>(lead.estado)
const agenteAsignado = ref<string>(lead.agente)
const agentesOptions = ['Juan Camilo Martinez','Laura Ruiz','Carlos Díaz','Ana Soto','María Pérez','Pablo García']
const cuponInput = ref('')
const referidoInput = ref('')
const showCrear        = ref(false)
const showEditarPerro  = ref(false)
const perroEditando    = ref<typeof lead.perros[0] | null>(null)
const showEditarLead   = ref(false)
const showEditarEnvio  = ref(false)

function openEditarPerro(perro: typeof lead.perros[0]) {
  perroEditando.value = perro
  showEditarPerro.value = true
}
function openNuevoPerro() {
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

// ── Override de gramaje ───────────────────────────
// TODO: conectar al config de país cuando exista store global
const overrideEnabled = ref(true)  // demo: true; en prod leer de ConfiguracionView store

const grAlgo = lead.presupuesto.items.map(it => parseInt(it.grDia))
const grOverrides = ref<number[]>([...grAlgo])

// ── Gramaje override por perro — para sincronizar la card del perro con el presupuesto ──
function perroGrData(nombre: string): { active: boolean; valor: number; algo: number; delta: number } {
  const idx = lead.presupuesto.items.findIndex(it => it.perro === nombre)
  if (idx === -1 || !overrideEnabled.value) return { active: false, valor: 0, algo: 0, delta: 0 }
  const algo  = grAlgo[idx]
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

function hasIncompatible(perro: { patologias: { incompatible: boolean }[] }) {
  return perro.patologias.some(p => p.incompatible)
}

// ── Enviar presupuesto ────────────────────────────
function handleEnviarPresupuesto() {
  // Construye el payload final aplicando los overrides de gramaje
  const itemsFinales = lead.presupuesto.items.map((it, i) => ({
    perro:    it.perro,
    grDia:    overrideEnabled.value ? grOverrides.value[i] : parseInt(it.grDia),
    grAlgo:   grAlgo[i],
    override: overrideEnabled.value && grOverrides.value[i] !== grAlgo[i],
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
.perfil-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 4px 8px;
  gap: 16px; flex-wrap: wrap;
}
.topbar-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; }
.topbar-label { color: var(--n-500, #6b7280); font-weight: 500; }

.agente-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 20px; background: var(--n-100, #f3f4f7); }
.agente-chip .agente-avatar { width: 22px; height: 22px; border-radius: 50%; background: #e6eaf2; color: #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
.agente-chip .agente-name { font-weight: 600; font-size: 12px; }
.agente-chip-value { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.agente-chip-value .agente-avatar { width: 22px; height: 22px; border-radius: 50%; background: #e6eaf2; color: #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
.agente-select { min-width: 220px; }
.agente-select :deep(.p-select-label) { padding: 4px 8px; }
/* Estado select — sin recuadro, el tag ES el trigger */
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
}
.estado-select :deep(.p-select-label) { padding: 0 !important; line-height: 1; }
.estado-select :deep(.p-select-dropdown) {
  width: 20px !important;
  padding: 0 2px 0 0 !important;
  color: var(--n-400);
}

.sep { color: var(--n-300, #d1d5db); margin: 0 4px; }
.topbar-actions { display: flex; gap: 8px; align-items: center; }
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
.card-edit { margin-left: auto; }

/* ── Override gramaje — asterisco en card perro ── */
.gr-override-wrap {
  display: inline-flex; align-items: baseline; gap: 1px; position: relative;
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
.perro-line { font-size: 13px; color: var(--n-700, #2b2b2b); margin: 0; line-height: 1.6; }
.perro-line.bold { font-weight: 600; margin-top: 4px; }
.card-divider { border: none; border-top: 1px solid var(--n-150, #ebedf2); margin: 8px 0; }
.patologias { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.incompatible-banner {
  display: flex; align-items: center; gap: 6px;
  background: #fff1f0; border: 1px solid #ffd0cb; color: #c8452a;
  padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
  margin-top: 10px;
}

/* ── Lead card ── */
.lead-meta p { font-size: 13px; margin: 4px 0; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.lead-meta .bold { font-weight: 600; font-size: 14px; }
.lead-meta .copy-row .copy-btn { padding: 0; width: 22px; height: 22px; }
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
.codigo-row { display: flex; align-items: center; gap: 6px; }
.codigo-row :deep(.codigo-input) { flex: 1; }
.codigo-row :deep(.p-button) { flex-shrink: 0; }
.badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; align-items: center; }
.remove-x { font-size: 10px; cursor: pointer; margin-left: 6px; }

/* Chips PrimeVue-like para cupones / referidos */
.chip-pv { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
.chip-pv--success { background: var(--success-bg); color: var(--success); }
.chip-pv--readonly { background: var(--n-100); color: var(--n-500); cursor: not-allowed; }
.readonly-icon { font-size: 10px; opacity: 0.6; }

/* ── Presupuesto ── */
.highlight-card { box-shadow: 0 0 0 2px rgba(239,105,72,0.08); border: 1px solid var(--brand-subtle, #fdf1ed) !important; }

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
  background: var(--success-bg); color: var(--success);
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

.gr-delta { font-size: 10px; font-weight: 600; align-self: flex-start; padding: 1px 5px; border-radius: 4px; }
.gr-delta--up   { background: var(--success-bg); color: var(--success); }
.gr-delta--down { background: var(--error-bg);   color: var(--error); }
.gr-delta--neutral { background: var(--n-100); color: var(--n-500); font-weight: 400; }

/* ── Add btn ── */
.add-btn { align-self: flex-start; }

/* ── Responsive: 1 columna en pantallas pequeñas ── */
@media (max-width: 1100px) {
  .config-grid { grid-template-columns: 1fr; }
}

:deep(.tag-formulario) { background: #ede9fe; color: #6d28d9; }
</style>
