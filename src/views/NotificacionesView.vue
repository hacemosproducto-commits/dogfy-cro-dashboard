<template>
  <div class="notif-view">
    <div class="notif-header">
      <h2 class="view-title">Notificaciones</h2>
      <button class="mark-all-btn mark-all-btn--header" @click="marcarTodasLeidas">Marcar todas como leídas</button>
    </div>
    <!-- ── Filtros unificados ── -->
    <div class="notif-filters">
      <div class="filter-pills">
        <button
          v-for="f in filtros" :key="f"
          class="filter-pill" :class="{ active: filtroActivo === f }"
          @click="filtroActivo = f"
        >{{ f }}</button>
      </div>
      <span class="filters-spacer" />
      <!-- Agente (TL / Manager) -->
      <Select
        v-if="role !== 'agente'"
        v-model="filtroAgente"
        :options="agentesDisponibles"
        placeholder="Agente"
        showClear
        class="agente-select"
      />
      <button class="mark-all-btn mark-all-btn--filters" @click="marcarTodasLeidas">Marcar todas como leídas</button>
    </div>
    <SectionCard>
      <div class="notif-feed">
        <div
          v-for="n in notificacionesFiltradas"
          :key="n.id"
          class="nf-item"
          :class="{ 'nf-item--unread': !n.leida, 'nf-item--hecho': n.hecho }"
          @click="openDetail(n)"
        >
          <div class="nf-icon" :class="[`nf-icon--${n.tipo}`, { 'nf-icon--read': n.leida }]">
            <i :class="n.hecho ? 'pi pi-check' : iconMap[n.tipo]" />
          </div>
          <div class="nf-content">
            <p class="nf-texto" :class="{ 'nf-texto--hecho': n.hecho }">{{ n.texto }}</p>
            <p class="nf-fecha">{{ n.fecha }}</p>
          </div>
          <div class="nf-right">
            <Tag v-if="!n.hecho" :value="tagLabel[n.tipo]" :severity="tagSeverity[n.tipo]" size="small" />
            <Tag v-else value="Hecho" severity="success" size="small" />
          </div>
        </div>
        <p v-if="!notificacionesFiltradas.length" class="nf-empty">No hay notificaciones en esta categoría.</p>
      </div>
    </SectionCard>
  </div>

  <!-- ── Detail dialog (bottom sheet ≤900px / centered popup >900px) ── -->
  <Dialog
    v-model:visible="showDetail"
    :modal="true"
    :position="dialogPosition"
    :draggable="false"
    :style="dialogStyle"
    :class="dialogClass"
    :pt="{ root: { style: 'padding:0' }, header: { style: 'padding: 16px 20px 12px; border-bottom: 1px solid var(--n-100); align-items: flex-start' }, content: { style: 'padding: 0 20px 24px' } }"
  >
    <template #header>
      <div class="detail-header">
        <div class="detail-icon" :class="`nf-icon--${selected?.tipo}`">
          <i :class="iconMap[selected?.tipo ?? 'chat']" />
        </div>
        <div>
          <Tag :value="tagLabel[selected?.tipo ?? 'chat']" :severity="tagSeverity[selected?.tipo ?? 'chat']" size="small" />
          <p class="detail-fecha">{{ selected?.fecha }}</p>
        </div>
      </div>
    </template>

    <p class="detail-texto">{{ selected?.texto }}</p>

    <div class="detail-actions">
      <!-- ── Chat: ir a la conversación del lead ── -->
      <template v-if="selected?.tipo === 'chat'">
        <Button label="Abrir conversación" icon="pi pi-whatsapp" @click="navTo(selected.leadId ? `/leads/${selected.leadId}` : null)" />
      </template>

      <!-- ── Cita: agenda del día + lead ── -->
      <template v-else-if="selected?.tipo === 'cita'">
        <Button label="Ver en agenda" icon="pi pi-calendar" :outlined="!!selected.leadId" @click="navTo('/calendario')" />
        <Button v-if="selected.leadId" label="Ir al lead" icon="pi pi-user" @click="navTo(`/leads/${selected.leadId}`)" />
      </template>

      <!-- ── Error de pago: lead + llamar ── -->
      <template v-else-if="selected?.tipo === 'error'">
        <Button label="Gestionar en lead" icon="pi pi-user" :outlined="!!selected.phone" @click="navTo(selected.leadId ? `/leads/${selected.leadId}` : null)" />
        <Button v-if="selected.phone" label="Llamar" icon="pi pi-phone" @click="callLead(selected.phone!)" />
      </template>

      <!-- ── Recordatorio: aplazar + hecho ── -->
      <template v-else-if="selected?.tipo === 'recordatorio'">
        <Button label="Aplazar" icon="pi pi-clock" outlined @click="abrirAplazar" />
        <Button label="Marcar como hecho" icon="pi pi-check" @click="marcarHecho" />
      </template>
    </div>
  </Dialog>

  <!-- ── Sheet 1: opciones rápidas ── -->
  <Dialog
    v-model:visible="showAplazar"
    :modal="true"
    :position="dialogPosition"
    :draggable="false"
    :style="dialogStyle"
    :class="dialogClass"
    header="Aplazar hasta…"
    :pt="{ root: { style: 'padding:0' }, header: { style: 'padding: 16px 20px 14px; border-bottom: 1px solid var(--n-100)' }, content: { style: 'padding: 8px 12px 20px' } }"
  >
    <div class="aplazar-sheet">
      <button class="aplazar-row" @click="aplazar('1h')">
        <span class="aplazar-row-icon"><i class="pi pi-clock" /></span>
        <span class="aplazar-row-body">
          <span class="aplazar-row-label">En 1 hora</span>
          <span class="aplazar-row-hint">{{ aplazarHint1h }}</span>
        </span>
      </button>
      <button class="aplazar-row" @click="aplazar('manana')">
        <span class="aplazar-row-icon"><i class="pi pi-sun" /></span>
        <span class="aplazar-row-body">
          <span class="aplazar-row-label">Mañana</span>
          <span class="aplazar-row-hint">{{ aplazarHintManana }}</span>
        </span>
      </button>
      <div class="aplazar-sep" />
      <button class="aplazar-row" @click="abrirPersonalizado">
        <span class="aplazar-row-icon"><i class="pi pi-calendar" /></span>
        <span class="aplazar-row-body">
          <span class="aplazar-row-label">Fecha personalizada</span>
        </span>
        <i class="pi pi-chevron-right aplazar-row-chevron" />
      </button>
    </div>
  </Dialog>

  <!-- ── Sheet 2: calendario inline ── -->
  <Dialog
    v-model:visible="showCustomAplazar"
    :modal="true"
    :position="dialogPosition"
    :draggable="false"
    :style="dialogStyle"
    :class="dialogClass"
    :pt="{ root: { style: 'padding:0' }, header: { style: 'padding: 12px 16px; border-bottom: 1px solid var(--n-100); align-items: center' }, content: { style: 'padding: 16px 20px 24px' } }"
  >
    <template #header>
      <button class="aplazar-back-btn" @click="showCustomAplazar = false; showAplazar = true">
        <i class="pi pi-arrow-left" />
      </button>
      <span class="aplazar-custom-title">Fecha personalizada</span>
    </template>
    <div class="aplazar-custom-sheet">
      <DatePicker v-model="aplazarFecha" inline showTime hourFormat="24" :minDate="new Date()" />
      <Button label="Confirmar" icon="pi pi-check" :disabled="!aplazarFecha" @click="aplazar('custom')" class="aplazar-confirm-btn" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import SectionCard from '@/components/ui/SectionCard.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const role = computed(() => auth.currentRole)

type TipoNotif = 'chat' | 'cita' | 'recordatorio' | 'error'

interface Notif {
  id: number
  tipo: TipoNotif
  texto: string
  fecha: string
  leida: boolean
  hecho?: boolean      // recordatorios completados
  leadId?: string      // chat, cita, error
  phone?: string       // error de pago → llamar
  agente?: string      // para filtro por agente (TL/Manager)
}

// Un único eje de filtrado: tipo + estado de lectura unificados
const filtros = ['Todos', 'No leídos', 'Chats', 'Citas', 'Recordatorios', 'Errores de pago']
const filtroActivo = ref('Todos')

// ── Filtro por agente (TL / Manager) ──
const filtroAgente = ref('')
const agentesDisponibles = computed(() => {
  const nombres = new Set(notificaciones.value.map(n => n.agente).filter(Boolean) as string[])
  return [...nombres].sort()
})

const iconMap: Record<TipoNotif, string> = {
  chat:         'pi pi-comments',
  cita:         'pi pi-calendar',
  recordatorio: 'pi pi-bookmark',
  error:        'pi pi-exclamation-circle',
}
const tagLabel: Record<TipoNotif, string> = {
  chat:         'Chat',
  cita:         'Cita',
  recordatorio: 'Recordatorio',
  error:        'Error pago',
}
const tagSeverity: Record<TipoNotif, string> = {
  chat:         'success',
  cita:         'info',
  recordatorio: 'secondary',
  error:        'danger',
}
const tipoMap: Record<string, TipoNotif | null> = {
  'Chats':           'chat',
  'Citas':           'cita',
  'Recordatorios':   'recordatorio',
  'Errores de pago': 'error',
}

const notificaciones = ref<Notif[]>([
  { id: 1,  tipo: 'chat',         texto: 'María García te ha enviado un mensaje por WhatsApp',           fecha: 'Hoy · 10:00',        leida: false, leadId: '1',  agente: 'Juan C.'  },
  { id: 2,  tipo: 'cita',         texto: 'Cita confirmada con el papá de Spike para el martes 18',       fecha: 'Hoy · 09:55',        leida: false, leadId: '2',  agente: 'Laura R.' },
  { id: 3,  tipo: 'error',        texto: 'Error de pago detectado — Lead #4 · insufficient_funds',       fecha: 'Hoy · 09:30',        leida: false, leadId: '4',  phone: '+34 699 652 338', agente: 'Carlos D.' },
  { id: 4,  tipo: 'recordatorio', texto: 'Avisar renovación a Carlos García antes de las 12:00',         fecha: 'Hoy · 09:15',        leida: false, agente: 'Juan C.' },
  { id: 5,  tipo: 'chat',         texto: 'Carlos López ha respondido a tu mensaje',                      fecha: 'Hoy · 09:00',        leida: false, leadId: '5',  agente: 'Ana S.'   },
  { id: 6,  tipo: 'error',        texto: 'Error de pago — Lead #11 · card_declined · 3 intentos',        fecha: 'Hoy · 08:47',        leida: false, leadId: '11', phone: '+34 611 223 344', agente: 'Laura R.' },
  { id: 7,  tipo: 'cita',         texto: 'Recordatorio: cita con Ana Soto en 30 minutos',                fecha: 'Hoy · 08:30',        leida: true,  leadId: '7',  agente: 'Carlos D.' },
  { id: 8,  tipo: 'recordatorio', texto: 'Seguimiento post-venta pendiente — Spike Premium',             fecha: 'Hoy · 08:00',        leida: true,  agente: 'Juan C.'  },
  { id: 9,  tipo: 'chat',         texto: 'Nuevo mensaje de Laura Martínez — lleva 2h sin respuesta',     fecha: 'Ayer · 19:42',       leida: true,  leadId: '9',  agente: 'María T.' },
  { id: 10, tipo: 'cita',         texto: 'Cita cancelada por el cliente — Beatriz Ruiz (martes 18)',     fecha: 'Ayer · 18:10',       leida: true,  leadId: '10', agente: 'Ana S.'   },
  { id: 11, tipo: 'error',        texto: 'Error de pago resuelto — Lead #7 · marcado como gestionado',  fecha: 'Ayer · 17:55',       leida: true,  leadId: '7',  phone: '+34 622 334 455', agente: 'Juan C.' },
  { id: 12, tipo: 'recordatorio', texto: 'Enviar presupuesto Plan B a Ana Soto',                         fecha: 'Ayer · 16:30',       leida: true,  agente: 'Laura R.' },
  { id: 13, tipo: 'chat',         texto: 'Pedro Jiménez ha leído tu mensaje pero no ha respondido',      fecha: 'Ayer · 15:00',       leida: true,  leadId: '13', agente: 'Carlos D.' },
  { id: 14, tipo: 'cita',         texto: 'Nueva cita creada con la mamá de Rocky — jue 20 a las 11:00', fecha: 'Ayer · 13:20',       leida: true,  leadId: '14', agente: 'María T.' },
  { id: 15, tipo: 'error',        texto: 'Error de pago detectado — Lead #23 · do_not_honor',            fecha: 'Ayer · 11:05',       leida: true,  leadId: '23', phone: '+34 633 445 566', agente: 'Ana S.' },
  { id: 16, tipo: 'recordatorio', texto: 'Llamar a cliente VIP antes del mediodía — prioridad alta',     fecha: 'Lun 16 feb · 10:00', leida: true,  agente: 'Juan C.'  },
  { id: 17, tipo: 'chat',         texto: 'Sofía Castro pregunta por el estado de su pedido',              fecha: 'Lun 16 feb · 09:30', leida: true,  leadId: '17', agente: 'Laura R.' },
  { id: 18, tipo: 'cita',         texto: 'Cita reprogramada — Pablo Moreno de lunes a miércoles 19',     fecha: 'Lun 16 feb · 08:55', leida: true,  leadId: '18', agente: 'Carlos D.' },
  { id: 19, tipo: 'error',        texto: 'Error de pago — Lead #31 · expired_card · requiere acción',    fecha: 'Lun 16 feb · 08:15', leida: true,  leadId: '31', phone: '+34 644 556 677', agente: 'María T.' },
  { id: 20, tipo: 'recordatorio', texto: 'Renovación pendiente — contrato Lead #8 vence esta semana',    fecha: 'Lun 16 feb · 08:00', leida: true,  agente: 'Ana S.'   },
])

const notificacionesFiltradas = computed(() => {
  let list = notificaciones.value
  if (filtroActivo.value === 'No leídos') {
    list = list.filter(n => !n.leida)
  } else {
    const tipo = tipoMap[filtroActivo.value]
    if (tipo) list = list.filter(n => n.tipo === tipo)
  }
  if (filtroAgente.value) list = list.filter(n => n.agente === filtroAgente.value)
  return list
})

// ── Responsive dialog position ─────────────────────────
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1440)
function onResize() { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// > 900px → centered popup; ≤ 900px → bottom sheet
const isWide = computed(() => windowWidth.value >= 900)
const dialogPosition = computed(() => isWide.value ? 'center' : 'bottom')
const dialogStyle = computed(() => isWide.value
  ? { width: '100%', maxWidth: '480px' }
  : { width: '100%', maxWidth: '520px', margin: '0 auto' }
)
const dialogClass = computed(() => isWide.value ? 'detail-dialog--center' : 'detail-dialog--bottom')

// ── Detail sheet ───────────────────────────────────────
const showDetail = ref(false)
const selected   = ref<Notif | null>(null)

function openDetail(n: Notif) {
  selected.value = n
  n.leida = true        // auto-mark as read on open
  showDetail.value = true
}

function navTo(path: string | null) {
  showDetail.value = false
  if (path) router.push(path)
}

function callLead(phone: string) {
  showDetail.value = false
  window.open(`tel:${phone.replace(/\s/g, '')}`)
}

function marcarHecho() {
  if (selected.value) selected.value.hecho = true
  showDetail.value = false
}

// ── Aplazar (snooze) ──────────────────────────────
const showAplazar       = ref(false)
const showCustomAplazar = ref(false)
const aplazarFecha      = ref<Date | null>(null)

function abrirAplazar() {
  showDetail.value = false
  showAplazar.value = true
}

function abrirPersonalizado() {
  aplazarFecha.value = null
  showAplazar.value = false
  showCustomAplazar.value = true
}

function horaDeNotif(): string {
  return selected.value?.fecha?.split('·')[1]?.trim() ?? '09:00'
}

const aplazarHint1h = computed(() => {
  const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0)
  return `Hoy · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

const aplazarHintManana = computed(() => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const d = new Date(); d.setDate(d.getDate() + 1)
  return `${dias[d.getDay()]} · ${horaDeNotif()}`
})

function aplazar(_opcion: '1h' | 'manana' | 'custom') {
  showAplazar.value = false
  showCustomAplazar.value = false
  aplazarFecha.value = null
  // En producción aquí se actualizaría la fecha del recordatorio
}

function marcarTodasLeidas() {
  notificaciones.value.forEach(n => n.leida = true)
}
</script>

<style scoped>
.notif-view { display: flex; flex-direction: column; gap: 16px; }

.notif-header { display: flex; align-items: center; justify-content: space-between; }
.view-title { font-size: 20px; font-weight: 700; }
.mark-all-btn--header { display: none; }

/* ── Filtros unificados ── */
.notif-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Grupos de pills */
.filter-pills { display: flex; gap: 2px; background: var(--n-100); border-radius: 8px; padding: 2px; flex-shrink: 0; }
.filter-pill {
  padding: 5px 10px; border-radius: 6px; border: none; background: transparent;
  font-size: 12px; font-weight: 500; color: var(--n-500); cursor: pointer;
  transition: background .12s, color .12s; white-space: nowrap;
}
.filter-pill:hover  { background: var(--n-0); color: var(--n-700); }
.filter-pill.active { background: var(--n-0); color: var(--n-900); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }

/* Espaciador flexible empuja agente-select y mark-all a la derecha */
.filters-spacer { flex: 1; min-width: 8px; }

/* Agente select */
.agente-select { min-width: 160px; flex-shrink: 0; }
:deep(.agente-select.p-select) { font-size: 13px; }

.mark-all-btn {
  flex-shrink: 0; font-size: 12px; font-weight: 500;
  color: var(--n-600); background: var(--n-0); border: 1px solid var(--n-200);
  border-radius: 8px; padding: 6px 14px; cursor: pointer; white-space: nowrap;
  transition: background 0.15s, border-color 0.15s;
}
.mark-all-btn:hover { background: var(--n-50); border-color: var(--n-300); }

/* Tablet vertical + mobile: mark-all sube al header */
@media (max-width: 900px) {
  .mark-all-btn--filters { display: none; }
  .mark-all-btn--header  { display: inline-flex; }
  .filters-spacer        { display: none; }
}

/* Feed */
.notif-feed { display: flex; flex-direction: column; }
.nf-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 8px; border-bottom: 1px solid var(--n-100);
  cursor: pointer; border-radius: 8px; transition: background 0.1s;
}
.nf-item:last-child { border-bottom: none; }
.nf-item:hover { background: var(--n-50); }
.nf-item--unread .nf-texto { font-weight: 600; color: var(--n-900); }
.nf-item--hecho { opacity: 0.6; }

.nf-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }
.nf-icon--chat        { background: #ecf9f1; color: #0aaa46; }
.nf-icon--cita        { background: var(--n-100); color: var(--n-500); }
.nf-icon--error       { background: #fee2e2; color: #dc2626; }
.nf-icon--recordatorio{ background: #eff6ff; color: #3b82f6; }
.nf-icon--read { background: transparent !important; color: var(--n-300) !important; }

.nf-content { flex: 1; min-width: 0; }
.nf-texto { font-size: 13px; color: var(--n-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nf-texto--hecho { text-decoration: line-through; color: var(--n-400); }
.nf-fecha { font-size: 11px; color: var(--n-400); margin-top: 2px; }

.nf-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nf-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand); flex-shrink: 0; }

.nf-empty { font-size: 13px; color: var(--n-400); text-align: center; padding: 24px 0; }

/* ── Dialog border radius variants ──────────────── */
:global(.detail-dialog--bottom.p-dialog) { border-radius: 16px 16px 0 0 !important; }
:global(.detail-dialog--center.p-dialog) { border-radius: 12px !important; }

/* ── Aplazar sheets ──────────────────────────────── */
.aplazar-sheet { display: flex; flex-direction: column; gap: 2px; }
.aplazar-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 8px; border-radius: 10px; border: none; background: none;
  cursor: pointer; width: 100%; text-align: left; transition: background 0.1s;
}
.aplazar-row:hover { background: var(--n-50); }
.aplazar-row-icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--n-100); color: var(--n-600);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.aplazar-row-body  { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.aplazar-row-label { font-size: 14px; color: var(--n-800); font-weight: 500; }
.aplazar-row-hint  { font-size: 12px; color: var(--n-400); }
.aplazar-row-chevron { color: var(--n-400); font-size: 12px; flex-shrink: 0; margin-left: auto; }
.aplazar-sep { height: 1px; background: var(--n-150); margin: 6px 0; }

.aplazar-back-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  border: none; background: none; cursor: pointer; color: var(--n-600);
  margin-right: 8px; transition: background 0.1s;
}
.aplazar-back-btn:hover { background: var(--n-100); }
.aplazar-custom-title { font-size: 15px; font-weight: 600; color: var(--n-800); }

.aplazar-custom-sheet { display: flex; flex-direction: column; gap: 16px; align-items: center; }
.aplazar-confirm-btn  { width: 100%; justify-content: center; }
:deep(.aplazar-custom-sheet .p-datepicker) { width: 100% !important; border: none !important; box-shadow: none !important; }

/* ── Detail sheet ────────────────────────────────── */
.detail-header {
  display: flex; align-items: center; gap: 12px;
  flex: 1; min-width: 0;
}
.detail-icon {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.detail-fecha { font-size: 11px; color: var(--n-400); margin-top: 4px; }

.detail-texto {
  font-size: 14px; color: var(--n-800); line-height: 1.6;
  padding: 16px 0 20px; white-space: normal;
}

.detail-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.detail-actions :deep(.p-button) { flex: 1; min-width: 0; justify-content: center; }
/* Outlined secondary style aplicado globalmente desde main.css */
</style>
