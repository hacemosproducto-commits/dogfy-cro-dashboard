<template>
  <div class="perfil-layout">
    <div class="config-container">
      <!-- Topbar -->
      <div class="perfil-topbar">
        <div class="topbar-info">
          <span class="topbar-label">Agente:</span>
          <Select
            v-if="canEditAgente"
            v-model="agenteAsignado"
            :options="agentesOptions"
            class="agente-select"
            :placeholder="venta.agenteAsignado ? '' : '-- Venta no asignada'"
          >
            <template #value="{ value }">
              <span v-if="value" class="agente-chip-value">
                <span class="agente-avatar"><i class="pi pi-user" /></span>
                <span class="agente-name">{{ value }}</span>
              </span>
              <span v-else class="agente-name unassigned">-- Venta no asignada</span>
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
            <span class="agente-name">{{ venta.agente }}</span>
          </span>
        </div>
      </div>

      <div class="config-grid">
        <!-- ═══ Columna izquierda ═══ -->
        <div class="col col-left">
          <!-- Card Perro -->
          <SectionCard class="card-perro module-card">
            <template #header>
              <span class="card-title-row">
                <img :src="dogIcon" alt="" class="svg-icon" />
                {{ venta.perro.nombre }}
              </span>
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="showEditarPerro = true" />
            </template>
            <div class="perro-section">
              <!-- Solo gr/día — igual que en detalle de lead -->
              <p class="perro-line">{{ venta.perro.gDia }}</p>
              <p class="perro-line">Menús: {{ venta.perro.menus.map(m => `[${m}]`).join(', ') }}</p>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <p class="perro-line">[{{ venta.perro.sexo }}] · [{{ venta.perro.raza }}]</p>
              <p class="perro-line">[{{ venta.perro.etapa }}] · [{{ venta.perro.edad }}]</p>
              <p class="perro-line">[{{ venta.perro.peso }}] · [{{ venta.perro.forma }}] · [{{ venta.perro.tipoComida }}]</p>
            </div>
            <hr class="card-divider" />
            <div class="perro-section">
              <p class="perro-line">Nivel de actividad: [{{ venta.perro.nivelActividad }}] · Esterilizado: [{{ venta.perro.esterilizado }}]</p>
              <p class="perro-line bold">Patologías:</p>
              <div class="patologias">
                <InfoTooltip
                  v-for="(p, i) in venta.perro.patologias"
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
              <div v-if="hasIncompatible" class="incompatible-banner">
                <i class="pi pi-exclamation-triangle" />
                <span>Incompatible con Dogfy Diet</span>
              </div>
            </div>
          </SectionCard>

          <!-- Card Lead ID -->
          <SectionCard class="card-lead module-card">
            <template #header>
              <span class="card-title-row"><i class="pi pi-user" /> Lead ID: [{{ venta.lead.leadCode }}]</span>
              <Button icon="pi pi-pencil" text rounded size="small" class="card-edit" @click="showEditarLead = true" />
            </template>
            <div class="lead-meta">
              <p class="bold">[{{ venta.lead.nombre }}] [{{ venta.lead.apellido }}]</p>
              <p class="copy-row">
                [{{ venta.lead.email }}]
                <Button :icon="copiedField === 'email' ? 'pi pi-check' : 'pi pi-copy'" text rounded size="small" class="copy-btn" @click="copyText(venta.lead.email, 'email')" />
              </p>
              <p class="copy-row">
                {{ venta.lead.telefono }}
                <Button :icon="copiedField === 'telefono' ? 'pi pi-check' : 'pi pi-copy'" text rounded size="small" class="copy-btn" @click="copyText(venta.lead.telefono, 'telefono')" />
              </p>
              <p>Campaña: <Tag :value="venta.lead.campana" severity="info" /></p>
              <p class="fuente-row">
                Fuente de adquisición:
                <Tag v-for="f in venta.lead.fuenteAdquisicion" :key="f" :value="f" severity="secondary" class="fuente-tag" />
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
              <p>Facturación a {{ venta.datosEnvio.facturacion }}</p>
              <p>{{ venta.datosEnvio.direccion }}</p>
              <p>Notas de entrega: {{ venta.datosEnvio.notas }}</p>
            </div>
          </SectionCard>
        </div>

        <!-- ═══ Columna derecha ═══ -->
        <div class="col col-right">
          <!-- Datos de la compra -->
          <SectionCard class="card-compra module-card">
            <template #header>
              <span class="card-title-row"><i class="pi pi-box" /> Datos de la compra</span>
              <Tag
                :value="venta.perro.plan"
                :severity="venta.perro.plan === 'Plan completo' ? 'success' : 'warn'"
                class="plan-badge"
              />
            </template>

            <div class="compra-fechas">
              <p class="compra-fecha-line"><span class="compra-fecha-label">Fecha de compra:</span> {{ venta.compra.fechaCompra }}</p>
              <p class="compra-fecha-line"><span class="compra-fecha-label">Entrega de prueba:</span> {{ venta.compra.fechaEntregaPrueba }}</p>
            </div>

            <p class="field-label">Cupones aplicados:</p>
            <div class="badge-row">
              <span v-for="(c, i) in venta.compra.cuponesAplicados" :key="i" class="chip-pv chip-pv--success">
                [{{ c }}]
              </span>
            </div>

            <div class="presu-info">
              <div class="presu-info-col">
                <span class="presu-info-label">Prueba (14 días)</span>
                <span class="presu-dto">{{ venta.compra.prueba.dto }} 🎉</span>
                <span class="presu-precio">
                  <s>{{ venta.compra.prueba.precioOriginal }}</s>
                  <strong>{{ venta.compra.prueba.precio }}</strong>
                </span>
              </div>
              <div class="presu-divider-v" />
              <div class="presu-info-col">
                <span class="presu-info-label">Mensualidad</span>
                <span class="presu-dto">{{ venta.compra.mensualidad.dto }} 🎉</span>
                <span class="presu-precio">
                  <s>{{ venta.compra.mensualidad.precioOriginal }}</s>
                  <strong>{{ venta.compra.mensualidad.precio }}</strong>
                </span>
              </div>
            </div>
          </SectionCard>

          <!-- Historial -->
          <SectionCard class="card-hist module-card">
            <template #header>
              <span class="card-title-row"><i class="pi pi-clipboard" /> Historial</span>
            </template>
            <div class="hist-pills">
              <button class="pill" :class="{ active: histTab === 'Todo' }" @click="histTab = 'Todo'">Todo</button>
              <button class="pill" :class="{ active: histTab === 'Llamadas' }" @click="histTab = 'Llamadas'">Llamadas</button>
              <button class="pill" :class="{ active: histTab === 'Comentarios' }" @click="histTab = 'Comentarios'">Comentarios</button>
            </div>
            <div class="hist-compose">
              <input v-model="nuevaNota" type="text" placeholder="Añadir comentario..." class="hist-input" @keyup.enter="addNota" />
              <Button icon="pi pi-plus" size="small" @click="addNota" />
            </div>
            <div class="hist-list">
              <InfoTooltip
                v-for="(item, i) in historialLocal"
                :key="i"
                class="hist-item-wrap"
              >
                <div class="hist-item" :class="{ 'hist-item--error': isError(item.texto) }">
                  <i :class="historialIcon(item.tipo)" class="hist-icon" />
                  <div class="hist-body">
                    <p class="hist-text" :class="{ 'hist-text--error': isError(item.texto) }">{{ item.texto }}</p>
                    <p class="hist-fecha">{{ item.fecha }}</p>
                  </div>
                </div>
                <template v-if="isError(item.texto)" #content>
                  <p class="itip-title itip-title--error">⚠ Error de pago</p>
                  <hr class="itip-sep" />
                  <template v-if="parsePaymentError(item.texto)">
                    <p class="itip-row"><strong>Método:</strong> {{ parsePaymentError(item.texto)!.metodo }}</p>
                    <p class="itip-row"><strong>Código:</strong> {{ parsePaymentError(item.texto)!.codigo }}</p>
                    <p class="itip-row"><strong>Fallo:</strong> {{ parsePaymentError(item.texto)!.fecha }}</p>
                  </template>
                  <a href="https://help.dogfydiet.com/errores-pago" target="_blank" rel="noopener" class="itip-link">Ver en Centro de Errores →</a>
                </template>
              </InfoTooltip>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  </div>

  <!-- Modales de edición — idénticos a detalle de lead -->
  <EditarPerroModal
    v-model:visible="showEditarPerro"
    :perro="venta.perro"
    @delete="showEditarPerro = false"
  />

  <EditarLeadModal
    v-model:visible="showEditarLead"
    :lead="{ nombre: venta.lead.nombre, apellido: venta.lead.apellido, email: venta.lead.email, telefono: venta.lead.telefono }"
  />

  <EditarEnvioModal
    v-model:visible="showEditarEnvio"
    :envio="venta.datosEnvio"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import SectionCard from '@/components/ui/SectionCard.vue'
import InfoTooltip from '@/components/ui/InfoTooltip.vue'
import EditarPerroModal from '@/components/leads/EditarPerroModal.vue'
import EditarLeadModal from '@/components/leads/EditarLeadModal.vue'
import EditarEnvioModal from '@/components/leads/EditarEnvioModal.vue'
import { mockPerfilVenta } from '@/data/mock'
import { useAuthStore } from '@/stores/auth'
import dogIcon from '@/assets/icons/dog.svg'
import truckIcon from '@/assets/icons/truck.svg'

const auth = useAuthStore()
const venta = mockPerfilVenta

// ── Copy to clipboard ────────────────────────────────
const copiedField = ref<string | null>(null)
function copyText(text: string, field: string) {
  navigator.clipboard.writeText(text).catch(() => {
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
const agenteAsignado = ref<string>(venta.agenteAsignado ? venta.agente : '')
const agentesOptions = ['Juan Camilo Martinez','Laura Ruiz','Carlos Díaz','Ana Soto','María Pérez','Pablo García']
const histTab = ref<'Todo' | 'Llamadas' | 'Comentarios'>('Todo')

// ── Historial local (permite añadir notas post-venta) ──
const historialLocal = ref([...venta.historial])
const nuevaNota = ref('')
function addNota() {
  const texto = nuevaNota.value.trim()
  if (!texto) return
  const now = new Date()
  const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
  const fecha = now.toLocaleDateString('es-ES', opciones).replace(',', '')
  historialLocal.value.unshift({ tipo: 'comentario', texto, fecha })
  nuevaNota.value = ''
}

const canEditAgente = computed(() => auth.currentRole !== 'agente')
const hasIncompatible = computed(() => venta.perro.patologias.some(p => p.incompatible))

// ── Modales ────────────────────────────────────────
const showEditarPerro = ref(false)
const showEditarLead  = ref(false)
const showEditarEnvio = ref(false)

// ── Tooltip incompatibilidad — igual que en detalle de lead ──
const INCOMPAT_REASONS: Record<string, string> = {
  'Insuficiencia renal':    'El exceso de proteína animal acelera el daño glomerular.',
  'Enfermedad renal':       'El exceso de proteína animal acelera el daño glomerular.',
  'Insuficiencia hepática': 'El hígado no puede metabolizar la carga proteica estándar.',
  'Pancreatitis':           'La grasa animal en la fórmula puede desencadenar episodios agudos.',
}
function incompatReason(nombre: string): string {
  return INCOMPAT_REASONS[nombre] ?? 'Esta patología presenta contraindicaciones directas con nuestra fórmula.'
}

function isError(text: string) {
  return /Error en el pago/i.test(text)
}

function parsePaymentError(texto: string) {
  // Formato: "Error en el pago: [PayPal] · Código: [action_required] · Fecha de intento: [...] · Fecha de fallo: [...]"
  const metodoM = texto.match(/Error en el pago:\s*\[?([^\]·\n]+?)\]?\s*·/)
  const codigoM = texto.match(/Código:\s*\[?([^\]·\n]+?)\]?\s*·/)
  const falloM  = texto.match(/Fecha de fallo:\s*\[?([^\]·\n]+?)\]?$/)
  if (!metodoM) return null
  return {
    metodo: metodoM[1].trim(),
    codigo: codigoM?.[1].trim() ?? '—',
    fecha:  falloM?.[1].trim()  ?? '—',
  }
}

function historialIcon(tipo: string) {
  const map: Record<string, string> = {
    whatsapp:     'pi pi-comment',
    llamada:      'pi pi-phone',
    comentario:   'pi pi-comment',
    recordatorio: 'pi pi-flag',
  }
  return map[tipo] ?? 'pi pi-circle'
}
</script>

<style scoped>
.perfil-layout { display: flex; flex-direction: column; gap: 12px; }

.config-container {
  background: #fff; border: 1px solid var(--n-200, #e6e8ee); border-radius: 14px;
  padding: 16px; display: flex; flex-direction: column; gap: 12px;
}

.perfil-topbar {
  display: flex; align-items: center; padding: 4px 4px 8px;
}
.topbar-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; }
.topbar-label { color: var(--n-500, #6b7280); font-weight: 500; }
.agente-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 20px; background: var(--n-100, #f3f4f7); }
.agente-chip .agente-avatar { width: 22px; height: 22px; border-radius: 50%; background: #e6eaf2; color: #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
.agente-chip .agente-name { font-weight: 600; font-size: 12px; }
.agente-chip-value { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; }
.agente-chip-value .agente-avatar { width: 22px; height: 22px; border-radius: 50%; background: #e6eaf2; color: #6b7280; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
.agente-select { min-width: 240px; }
.agente-select :deep(.p-select-label) { padding: 4px 8px; }
.agente-name.unassigned { color: var(--n-400, #9ca3af); font-style: italic; }

.config-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px; align-items: start; }
.col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

.module-card { padding: 12px 14px !important; border-radius: 10px; }
.card-title-row { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--n-800); }
.card-edit { margin-left: auto; }
.plan-badge { margin-left: auto; font-size: 11px; }
.svg-icon { width: 18px; height: 18px; vertical-align: middle; }

/* ── Perro ── */
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

/* patologias e historial errors usan InfoTooltip (ver InfoTooltip.vue) */

/* ── Lead ── */
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

/* ── Datos de la compra ── */
.field-label { font-size: 13px; font-weight: 500; color: var(--n-700); margin: 4px 0; }
.badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.chip-pv { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 500; }
.chip-pv--success { background: var(--success-bg); color: #15803d; }

.presu-info { display: flex; align-items: stretch; gap: 0; margin-top: 4px; }
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
.presu-precio { display: flex; align-items: baseline; gap: 6px; font-size: 15px; }
.presu-precio s { color: var(--n-400, #9ca3af); font-size: 12px; }

/* ── Historial ── */
.hist-item-wrap { display: flex; width: 100%; }
.hist-item-wrap .itip-wrap { width: 100%; }
.hist-pills { display: flex; gap: 6px; margin-bottom: 10px; }
.pill { background: var(--n-100, #f3f4f7); border: none; padding: 4px 10px; border-radius: 999px; font-size: 11px; cursor: pointer; color: var(--n-700); }
.pill.active { background: var(--brand-subtle, #fdf1ed); color: var(--brand, #ef6948); font-weight: 600; }
.hist-list { display: flex; flex-direction: column; gap: 4px; max-height: 360px; overflow-y: auto; }
.hist-item { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid var(--n-100); width: 100%; }
.hist-icon { color: var(--n-500); margin-top: 2px; font-size: 13px; }
.hist-item--error .hist-icon { color: var(--error, #c8452a); }
.hist-body { flex: 1; min-width: 0; }
.hist-text { font-size: 12px; margin: 0; color: var(--n-700); }
.hist-text--error { color: var(--error, #c8452a); font-weight: 600; }
.hist-fecha { font-size: 11px; color: var(--n-500); margin: 2px 0 0; }

/* ── Historial compose ── */
.hist-compose { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
.hist-input { flex: 1; border: 1px solid var(--n-200); border-radius: 8px; padding: 6px 10px; font-size: 12px; outline: none; background: #fff; }
.hist-input:focus { border-color: var(--brand, #ef6948); }

/* ── Fechas de compra ── */
.compra-fechas { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.compra-fecha-line { font-size: 13px; color: var(--n-700); margin: 0; }
.compra-fecha-label { font-weight: 500; color: var(--n-500); }

@media (max-width: 1100px) {
  .config-grid { grid-template-columns: 1fr; }
}
</style>
