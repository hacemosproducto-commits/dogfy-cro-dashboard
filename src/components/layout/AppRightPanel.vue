<template>
  <!-- Mobile overlay -->
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="auth.mobilePanelOpen" class="mobile-panel-overlay" @click="auth.closeMobilePanel()" />
    </Transition>
  </Teleport>

  <aside
    v-if="showPanel"
    class="right-panel"
    :class="{
      'right-panel--tv': isTvMode,
      'right-panel--uw': auth.isUwMode,
      'right-panel--perfil-lead': isPerfilLead,
      'right-panel--perfil-venta': isPerfilVenta,
      'right-panel--mobile-open': auth.mobilePanelOpen,
    }"
  >

    <!-- ── Collapsed icon strip (TV only, ≤900px) ── -->
    <div class="rp-icon-strip">
      <i v-for="ic in stripIcons" :key="ic" :class="`pi ${ic}`" />
    </div>

    <!-- ── Full content ── -->
    <div class="right-panel-inner">

      <!-- ── PERFIL VENTA: WhatsApp + Historial (mismo patrón que perfil lead) ── -->
      <template v-if="isPerfilVenta">
        <SectionCard class="wa-card">
          <template #header>
            <span class="wa-title"><i class="pi pi-whatsapp" /> WhatsApp</span>
            <span class="wa-conn"><span class="wa-dot" /> Conectado <i class="pi pi-chevron-down" /></span>
          </template>
          <div class="wa-chat">
            <div class="wa-date-pill">Fri, Jul 26</div>
            <div class="wa-msg out">Good morning!</div>
            <div class="wa-msg out">Dogfy looks amazing!</div>
            <div class="wa-msg in file">📎 IMG_0483 · png · 2.8 MB</div>
            <div class="wa-msg in file">📎 IMG_0484 · png · 2.6 MB</div>
          </div>
          <div class="wa-compose">
            <Button icon="pi pi-plus" text rounded size="small" />
            <input type="text" placeholder="Mensaje" class="wa-input" />
            <Button icon="pi pi-microphone" text rounded size="small" />
          </div>
        </SectionCard>

        <SectionCard class="hist-card">
          <template #header>
            <span class="hist-title">Historial <i class="pi pi-chevron-up" /></span>
          </template>
          <div class="hist-pills">
            <button class="pill" :class="{ active: histTab === 'Todo' }" @click="histTab = 'Todo'">Todo</button>
            <button class="pill" :class="{ active: histTab === 'Llamadas' }" @click="histTab = 'Llamadas'">Llamadas</button>
            <button class="pill" :class="{ active: histTab === 'Comentarios' }" @click="histTab = 'Comentarios'">Comentarios</button>
          </div>
          <div class="hist-list">
            <div v-for="(item, i) in mockPerfilLead.historial" :key="i" class="hist-item">
              <i :class="histIcon(item.tipo)" class="hist-icon" />
              <div class="hist-body">
                <p class="hist-text">{{ item.texto }}</p>
                <p class="hist-fecha">{{ item.fecha }}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </template>

      <!-- ── PERFIL LEAD: WhatsApp + Historial ── -->
      <template v-else-if="isPerfilLead">
        <SectionCard class="wa-card">
          <template #header>
            <span class="wa-title"><i class="pi pi-whatsapp" /> WhatsApp</span>
            <span class="wa-conn"><span class="wa-dot" /> Conectado <i class="pi pi-chevron-down" /></span>
          </template>
          <div class="wa-chat">
            <div class="wa-date-pill">Fri, Jul 26</div>
            <div class="wa-msg out">Good morning!</div>
            <div class="wa-msg out">Dogfy looks amazing!</div>
            <div class="wa-msg in file">📎 IMG_0483 · png · 2.8 MB</div>
            <div class="wa-msg in file">📎 IMG_0484 · png · 2.6 MB</div>
          </div>
          <div class="wa-compose">
            <Button icon="pi pi-plus" text rounded size="small" />
            <input type="text" placeholder="Mensaje" class="wa-input" />
            <Button icon="pi pi-microphone" text rounded size="small" />
          </div>
        </SectionCard>

        <SectionCard class="hist-card">
          <template #header>
            <span class="hist-title">Historial <i class="pi pi-chevron-up" /></span>
          </template>
          <div class="hist-pills">
            <button class="pill" :class="{ active: histTab === 'Todo' }" @click="histTab = 'Todo'">Todo</button>
            <button class="pill" :class="{ active: histTab === 'Llamadas' }" @click="histTab = 'Llamadas'">Llamadas</button>
            <button class="pill" :class="{ active: histTab === 'Comentarios' }" @click="histTab = 'Comentarios'">Comentarios</button>
          </div>
          <div class="hist-compose">
            <input v-model="nuevoComentario" type="text" placeholder="Añadir comentario..." class="hist-input" />
            <Button icon="pi pi-plus" size="small" />
          </div>
          <div class="hist-list">
            <div v-for="(item, i) in mockPerfilLead.historial" :key="i" class="hist-item">
              <i :class="histIcon(item.tipo)" class="hist-icon" />
              <div class="hist-body">
                <p class="hist-text">{{ item.texto }}</p>
                <p class="hist-fecha">{{ item.fecha }}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </template>

      <!-- AGENTE -->
      <template v-else-if="auth.currentRole === 'agente'">
        <SectionCard v-if="showCalendarWidget">
          <template #header>
            <div class="wcal-nav-row">
              <button class="wcal-nav" @click="weekOffset--"><i class="pi pi-chevron-left" /></button>
              <span class="wcal-title">{{ weekRangeLabel }}</span>
              <button class="wcal-nav" @click="weekOffset++"><i class="pi pi-chevron-right" /></button>
              <RouterLink to="/calendario" class="wcal-ver-link"><i class="pi pi-arrow-right" /></RouterLink>
            </div>
          </template>
          <div class="week-days">
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="wday-col"
              :class="{ 'wday-col--today': day.isToday }"
              @click="router.push({ path: '/calendario', query: { dia: day.date } })"
            >
              <span class="wday-label">{{ day.label }}</span>
              <span class="wday-num">{{ day.num }}</span>
              <span class="wday-dot" :class="day.hasEvent ? 'wday-dot--on' : 'wday-dot--off'" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Próximas citas">
          <template #header>
            <Button icon="pi pi-plus" text rounded size="small" @click="showCrearCita = true" />
          </template>
          <div class="cita-item" v-for="c in mockProximasCitas" :key="c.id" @click="openCita(c)">
            <span class="cita-dot" />
            <div>
              <p class="cita-title">{{ c.titulo }}</p>
              <p class="item-fecha text-muted">{{ c.fecha }}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recordatorios">
          <template #header>
            <Button icon="pi pi-plus" text rounded size="small" @click="showCrearRecordatorio = true" />
          </template>
          <div class="rec-todo-list">
            <div
              v-for="r in recordatoriosLocal"
              :key="r.id"
              class="rec-todo"
              :class="{ 'rec-todo--done': r.completado }"
            >
              <button class="rec-check" :class="{ 'rec-check--done': r.completado }" @click.stop="toggleRec(r.id)">
                <i v-if="r.completado" class="pi pi-check" style="font-size:8px" />
              </button>
              <div class="rec-body" @click="openRec(r)">
                <p class="rec-titulo">{{ r.titulo }}</p>
                <p class="rec-meta">{{ r.fechaStr }}<span v-if="r.lead"> · {{ r.lead }}</span></p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard v-if="showNotificationsWidget" title="Notificaciones">
          <template #header>
            <RouterLink to="/notificaciones" class="notif-ver-todas">Ver todas <i class="pi pi-arrow-right" /></RouterLink>
          </template>
          <div class="rec-item" v-for="n in 3" :key="n">
            <i class="pi pi-comments rec-icon" />
            <div>
              <p class="rec-texto">[mensaje de whatsapp...]</p>
              <p class="item-fecha text-muted">Lunes, 16 feb · 10:00</p>
            </div>
          </div>
        </SectionCard>
      </template>

      <!-- TEAM LEAD -->
      <template v-else-if="auth.currentRole === 'team_lead'">
        <SectionCard>
          <div class="obj-top">
            <span class="obj-val">{{ mockKpisTL.ventasMes.actual.toLocaleString('es-ES') }}/{{ mockKpisTL.ventasMes.objetivo.toLocaleString('es-ES') }}</span>
            <span class="obj-pct">{{ objMensualpct }}%</span>
          </div>
          <p class="obj-label">Objetivo mensual</p>
          <ProgressBar :value="objMensualpct" style="height:6px;margin-top:8px" />
        </SectionCard>

        <SectionCard class="reto-card">
          <div class="reto-edit-row">
            <span class="reto-eyebrow">Reto semanal</span>
            <Button icon="pi pi-pencil" text rounded size="small" @click="showEditarReto = true" />
          </div>
          <p class="reto-title">{{ retoStore.reto.titulo }}</p>
          <p class="reto-desc">{{ retoStore.reto.descripcion }}</p>
          <a v-if="retoStore.reto.linkReglas" :href="retoStore.reto.linkReglas" class="reto-link" target="_blank" rel="noopener">Ver reglas →</a>
        </SectionCard>

        <SectionCard title="Recordatorios">
          <template #header>
            <Button icon="pi pi-plus" text rounded size="small" @click="showCrearRecordatorio = true" />
          </template>
          <div class="rec-todo-list">
            <div
              v-for="r in recordatoriosLocal"
              :key="r.id"
              class="rec-todo"
              :class="{ 'rec-todo--done': r.completado }"
            >
              <button class="rec-check" :class="{ 'rec-check--done': r.completado }" @click.stop="toggleRec(r.id)">
                <i v-if="r.completado" class="pi pi-check" style="font-size:8px" />
              </button>
              <div class="rec-body" @click="openRec(r)">
                <p class="rec-titulo">{{ r.titulo }}</p>
                <p class="rec-meta">{{ r.fechaStr }}<span v-if="r.lead"> · {{ r.lead }}</span></p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard v-if="showNotificationsWidget" title="Notificaciones">
          <template #header>
            <RouterLink to="/notificaciones" class="notif-ver-todas">Ver todas <i class="pi pi-arrow-right" /></RouterLink>
          </template>
          <div class="rec-item" v-for="n in 3" :key="n">
            <i class="pi pi-comments rec-icon" />
            <div>
              <p class="rec-texto">[mensaje de whatsapp...]</p>
              <p class="item-fecha text-muted">Lunes, 16 feb · 10:00</p>
            </div>
          </div>
        </SectionCard>
      </template>

      <!-- MANAGER -->
      <template v-else>
        <SectionCard title="Objetivos mes">
          <div class="obj-row" v-for="o in mockObjetivosPaises" :key="o.pais">
            <div class="obj-info">
              <span class="obj-pais">{{ o.flag }} {{ o.pais }}</span>
              <span class="obj-nums">{{ o.actual.toLocaleString() }}/{{ o.objetivo.toLocaleString() }}</span>
            </div>
            <div class="obj-bar-track">
              <div class="obj-bar-fill" :style="{ width: Math.round((o.actual/o.objetivo)*100) + '%', background: 'var(--success)' }" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Leads por país">
          <div class="lp-row" v-for="(l, i) in mockLeadsPaises" :key="l.pais">
            <span class="lp-flag">{{ l.flag }} {{ l.pais }}</span>
            <div class="lp-bar-wrap">
              <div class="lp-bar" :style="{ width: `${Math.round((l.leads / maxLeads) * 100)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }" />
            </div>
            <span class="lp-count">{{ l.leads.toLocaleString() }}</span>
          </div>
        </SectionCard>

        <SectionCard title="Recordatorios">
          <template #header>
            <Button icon="pi pi-plus" text rounded size="small" @click="showCrearRecordatorio = true" />
          </template>
          <div class="rec-todo-list">
            <div
              v-for="r in recordatoriosLocal.slice(0, 3)"
              :key="r.id"
              class="rec-todo"
              :class="{ 'rec-todo--done': r.completado }"
            >
              <button class="rec-check" :class="{ 'rec-check--done': r.completado }" @click.stop="toggleRec(r.id)">
                <i v-if="r.completado" class="pi pi-check" style="font-size:8px" />
              </button>
              <div class="rec-body" @click="openRec(r)">
                <p class="rec-titulo">{{ r.titulo }}</p>
                <p class="rec-meta">{{ r.fechaStr }}<span v-if="r.lead"> · {{ r.lead }}</span></p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard v-if="showNotificationsWidget" title="Notificaciones">
          <template #header>
            <RouterLink to="/notificaciones" class="notif-ver-todas">Ver todas <i class="pi pi-arrow-right" /></RouterLink>
          </template>
          <div class="rec-item" v-for="n in 3" :key="n">
            <i class="pi pi-comments rec-icon" />
            <div>
              <p class="rec-texto">[mensaje de whatsapp...]</p>
              <p class="item-fecha text-muted">Lunes, 16 feb · 10:00</p>
            </div>
          </div>
        </SectionCard>
      </template>

    </div>

    <CrearCitaModal v-model:visible="showCrearCita" />
    <CrearRecordatorioModal v-model:visible="showCrearRecordatorio" @save="addRecordatorio" />
    <EditarRetoModal v-model:visible="showEditarReto" :reto="retoStore.reto" @save="retoStore.updateReto" />

  <!-- ── Cita detail dialog ── -->
  <Dialog
    v-model:visible="showCitaDialog"
    :modal="true"
    :position="_dialogPos"
    :draggable="false"
    :style="_dialogStyle"
    :class="_dialogClass"
    :pt="_dialogPt"
  >
    <template #header>
      <div class="detail-header">
        <div class="detail-icon nf-icon--cita"><i class="pi pi-calendar" /></div>
        <div>
          <Tag value="Cita" severity="info" size="small" />
          <p class="detail-fecha">{{ selectedCita?.fecha }}</p>
        </div>
      </div>
    </template>
    <p class="detail-texto">{{ selectedCita?.titulo }}</p>
    <div class="detail-actions">
      <Button label="Ver en agenda" icon="pi pi-calendar"
        :outlined="!!selectedCita?.leadId"
        @click="() => { showCitaDialog = false; router.push({ path: '/calendario', query: { dia: selectedCita?.date } }) }" />
      <Button v-if="selectedCita?.leadId" label="Ir al lead" icon="pi pi-user"
        @click="navFromCita(`/leads/${selectedCita.leadId}`)" />
    </div>
  </Dialog>

  <!-- ── Recordatorio detail dialog ── -->
  <Dialog
    v-model:visible="showRecDialog"
    :modal="true"
    :position="_dialogPos"
    :draggable="false"
    :style="_dialogStyle"
    :class="_dialogClass"
    :pt="_dialogPt"
  >
    <template #header>
      <div class="detail-header">
        <div class="detail-icon nf-icon--recordatorio"><i class="pi pi-bookmark" /></div>
        <div>
          <Tag value="Recordatorio" severity="secondary" size="small" />
          <p class="detail-fecha">{{ selectedRec?.fechaStr }}</p>
        </div>
      </div>
    </template>
    <p class="detail-texto">{{ selectedRec?.titulo }}</p>
    <p v-if="selectedRec?.descripcion" class="detail-desc">{{ selectedRec.descripcion }}</p>
    <div class="detail-actions">
      <Button label="Aplazar" icon="pi pi-clock" outlined @click="abrirAplazarRec" />
      <Button label="Marcar como hecho" icon="pi pi-check" @click="marcarRecHecho" />
    </div>
  </Dialog>

  <!-- ── Sheet 1: opciones rápidas ── -->
  <Dialog
    v-model:visible="showAplazarRec"
    :modal="true"
    :position="_dialogPos"
    :draggable="false"
    :style="_dialogStyle"
    :class="_dialogClass"
    header="Aplazar hasta…"
    :pt="{ root: { style: 'padding:0' }, header: { style: 'padding: 16px 20px 14px; border-bottom: 1px solid var(--n-100)' }, content: { style: 'padding: 8px 12px 20px' } }"
  >
    <div class="aplazar-sheet">
      <button class="aplazar-row" @click="aplazarRec('1h')">
        <span class="aplazar-row-icon"><i class="pi pi-clock" /></span>
        <span class="aplazar-row-body">
          <span class="aplazar-row-label">En 1 hora</span>
          <span class="aplazar-row-hint">{{ aplazarHint1h }}</span>
        </span>
      </button>
      <button class="aplazar-row" @click="aplazarRec('manana')">
        <span class="aplazar-row-icon"><i class="pi pi-sun" /></span>
        <span class="aplazar-row-body">
          <span class="aplazar-row-label">Mañana</span>
          <span class="aplazar-row-hint">{{ aplazarHintManana }}</span>
        </span>
      </button>
      <div class="aplazar-sep" />
      <button class="aplazar-row" @click="abrirCustomRec">
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
    v-model:visible="showCustomRec"
    :modal="true"
    :position="_dialogPos"
    :draggable="false"
    :style="_dialogStyle"
    :class="_dialogClass"
    :pt="{ root: { style: 'padding:0' }, header: { style: 'padding: 12px 16px; border-bottom: 1px solid var(--n-100); align-items: center' }, content: { style: 'padding: 16px 20px 24px' } }"
  >
    <template #header>
      <button class="aplazar-back-btn" @click="showCustomRec = false; showAplazarRec = true">
        <i class="pi pi-arrow-left" />
      </button>
      <span class="aplazar-custom-title">Fecha personalizada</span>
    </template>
    <div class="aplazar-custom-sheet">
      <DatePicker v-model="aplazarFechaRec" inline showTime hourFormat="24" :minDate="new Date()" />
      <Button label="Confirmar" icon="pi pi-check" :disabled="!aplazarFechaRec" @click="aplazarRec('custom')" class="aplazar-confirm-btn" />
    </div>
  </Dialog>

  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRetoStore } from '@/stores/reto'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import SectionCard from '@/components/ui/SectionCard.vue'
import CrearCitaModal from '@/components/ui/CrearCitaModal.vue'
import CrearRecordatorioModal from '@/components/ui/CrearRecordatorioModal.vue'
import EditarRetoModal from '@/components/ui/EditarRetoModal.vue'
import { mockProximasCitas, mockObjetivosPaises, mockLeadsPaises, mockPerfilLead, mockKpisTL } from '@/data/mock'
import { CHART_COLORS } from '@/theme/palette'

const auth = useAuthStore()
const retoStore = useRetoStore()
const route  = useRoute()
const router = useRouter()

// ── Responsive dialog (bottom sheet ≤900 / centered >900) ────────────────────
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1440)
function _onResize() { windowWidth.value = window.innerWidth }
onMounted(()  => window.addEventListener('resize', _onResize))
onUnmounted(() => window.removeEventListener('resize', _onResize))
const _isWide        = computed(() => windowWidth.value >= 900)
const _dialogPos     = computed(() => _isWide.value ? 'center' : 'bottom')
const _dialogStyle   = computed(() => _isWide.value
  ? { width: '100%', maxWidth: '480px' }
  : { width: '100%', maxWidth: '520px', margin: '0 auto' }
)
const _dialogClass   = computed(() => _isWide.value ? 'detail-dialog--center' : 'detail-dialog--bottom')
const _dialogPt      = { root: { style: 'padding:0' }, header: { style: 'padding: 16px 20px 12px; border-bottom: 1px solid var(--n-100); align-items: flex-start' }, content: { style: 'padding: 0 20px 24px' } }

// ── Cita detail dialog ────────────────────────────────────────────────────────
type CitaItem = typeof mockProximasCitas[0]
const showCitaDialog = ref(false)
const selectedCita   = ref<CitaItem | null>(null)

function openCita(c: CitaItem) {
  selectedCita.value = c
  showCitaDialog.value = true
}
function navFromCita(path: string | null) {
  showCitaDialog.value = false
  if (path) router.push(path)
}

// ── Recordatorio detail dialog ────────────────────────────────────────────────
interface Recordatorio {
  id: string
  titulo: string
  descripcion?: string
  lead?: string
  fechaStr: string
  completado: boolean
}
const showRecDialog  = ref(false)
const selectedRec    = ref<Recordatorio | null>(null)

function openRec(r: Recordatorio) {
  selectedRec.value = r
  showRecDialog.value = true
}
function marcarRecHecho() {
  if (selectedRec.value) toggleRec(selectedRec.value.id)
  showRecDialog.value = false
}
// ── Aplazar (snooze) ──────────────────────────────
const showAplazarRec  = ref(false)
const showCustomRec   = ref(false)
const aplazarFechaRec = ref<Date | null>(null)

function abrirAplazarRec() {
  showRecDialog.value = false
  showAplazarRec.value = true
}

function abrirCustomRec() {
  aplazarFechaRec.value = null
  showAplazarRec.value = false
  showCustomRec.value = true
}

function horaDeRec(): string {
  return selectedRec.value?.fechaStr?.split('·')[1]?.trim() ?? '09:00'
}

const aplazarHint1h = computed(() => {
  const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0)
  return `Hoy · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

const aplazarHintManana = computed(() => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const d = new Date(); d.setDate(d.getDate() + 1)
  return `${dias[d.getDay()]} · ${horaDeRec()}`
})

function aplazarRec(_tipo: '1h' | 'manana' | 'custom') {
  showAplazarRec.value = false
  showCustomRec.value = false
  aplazarFechaRec.value = null
}

// ── Pages where the right panel is visible ───────
// Same composition per role across these screens.
// Hidden on: /leads/:id (perfil detail), /configuracion
const PANEL_ROUTES = [
  'dashboard',
  'leads',
  'ventas',
  'errores-pago',
  'agentes',
  'detalle-agente',
  'exportaciones',
  'calendario',
  'notificaciones',
  'configuracion',
  'buscar',
  'perfil-lead',
  'perfil-venta',
]

// Nota: la navegación secundaria (Errores, Agentes, Exportaciones, etc.)
// se accede ahora desde el bottom sheet "Más" del AppBottomNav.
// Este drawer está reservado 100% a widgets contextuales (recordatorios,
// citas, calendario semanal, etc.).
const showPanel = computed(() => PANEL_ROUTES.includes(String(route.name)))
const isPerfilLead  = computed(() => route.name === 'perfil-lead')
const isPerfilVenta = computed(() => route.name === 'perfil-venta')

// Modales — Crear cita y Crear recordatorio se conectan al store global
// para que el FAB SpeedDial (en AppHeader) y los widgets "+" disparen la misma instancia.
const showCrearCita = computed({
  get: () => auth.showCrearCita,
  set: (v) => { auth.showCrearCita = v },
})
const showCrearRecordatorio = computed({
  get: () => auth.showCrearRecordatorio,
  set: (v) => { auth.showCrearRecordatorio = v },
})
const showEditarReto = ref(false)

// ── Recordatorios (to-do list reactivo) ───────────
const recordatoriosLocal = ref<Recordatorio[]>([
  { id: '1', titulo: 'Avisar renovación a Carlos García', descripcion: 'Cliente con plan premium, renovación el 20 de feb', lead: 'Carlos García', fechaStr: 'Lun 16 feb · 10:00', completado: false },
  { id: '2', titulo: 'Llamar a María López', fechaStr: 'Lun 16 feb · 12:00', completado: false },
  { id: '3', titulo: 'Enviar presupuesto Plan B', lead: 'Ana Soto', fechaStr: 'Mar 17 feb · 09:00', completado: false },
  { id: '4', titulo: 'Seguimiento post-venta Spike', fechaStr: 'Mié 18 feb · 11:00', completado: false },
])
function toggleRec(id: string) {
  const r = recordatoriosLocal.value.find(r => r.id === id)
  if (r) r.completado = !r.completado
}
function addRecordatorio(data: { nota: string; lead: string; fecha: Date }) {
  const fecha = data.fecha
    ? data.fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Sin fecha'
  recordatoriosLocal.value.unshift({
    id: Date.now().toString(),
    titulo: data.nota,
    descripcion: undefined,
    lead: data.lead || undefined,
    fechaStr: fecha,
    completado: false,
  })
}

// Perfil lead: WhatsApp + Historial
const histTab = ref<'Todo' | 'Llamadas' | 'Comentarios'>('Todo')
const nuevoComentario = ref('')
function histIcon(tipo: string) {
  const map: Record<string, string> = {
    whatsapp: 'pi pi-comment',
    llamada: 'pi pi-phone',
    comentario: 'pi pi-comment',
    recordatorio: 'pi pi-flag',
  }
  return map[tipo] ?? 'pi pi-circle'
}

// ── Pages that exclude specific widgets ──────────
// /calendario: hide the weekly-calendar widget (agente-only card)
const objMensualpct = computed(() => Math.round(mockKpisTL.ventasMes.actual / mockKpisTL.ventasMes.objetivo * 100))

const showCalendarWidget      = computed(() => route.name !== 'calendario')
// /notificaciones: hide the notifications widget (redundant on that page)
const showNotificationsWidget = computed(() => route.name !== 'notificaciones')

// ── TV mode: real viewport ≤1024px OR preview toolbar ≤1024px ──
const isTvMode = computed(() =>
  auth.previewWidth !== null && auth.previewWidth <= 1024
)

// ── Icon strip (role-aware) ───────────────────────
const stripIcons = computed(() => {
  if (isPerfilLead.value)  return ['pi-whatsapp', 'pi-comments']
  if (isPerfilVenta.value) return ['pi-whatsapp']

  const base: string[] =
    auth.currentRole === 'agente'    ? ['pi-calendar', 'pi-bookmark'] :
    auth.currentRole === 'team_lead' ? ['pi-chart-bar', 'pi-star', 'pi-bookmark'] :
                                       ['pi-flag', 'pi-globe', 'pi-bookmark']

  // Drop calendar icon on /calendario (agente only)
  const withCalendar = showCalendarWidget.value
    ? base
    : base.filter(i => i !== 'pi-calendar')

  // Append bell for notifications, unless we're on /notificaciones
  return showNotificationsWidget.value
    ? [...withCalendar, 'pi-bell']
    : withCalendar
})

// ── Week calendar ─────────────────────────────────
const weekOffset = ref(0)

const DAY_LABELS   = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
const MONTH_LABELS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function isoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

function getMondayOf(date: Date) {
  const d = new Date(date)
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}

const weekDays = computed(() => {
  const today    = new Date()
  const todayIso = isoDate(today)
  const eventDates = new Set(mockProximasCitas.map(c => c.date))

  const monday = getMondayOf(today)
  monday.setDate(monday.getDate() + weekOffset.value * 7)

  return DAY_LABELS.map((label, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = isoDate(d)
    return { label, num: d.getDate(), date: iso, isToday: iso === todayIso, hasEvent: eventDates.has(iso) }
  })
})

const weekRangeLabel = computed(() => {
  const first = weekDays.value[0]
  const last  = weekDays.value[6]
  const [fy, fm, fd] = first.date.split('-').map(Number)
  const [,   lm, ld] = last.date.split('-').map(Number)
  const sameMonth = fm === lm
  return sameMonth
    ? `${fd}–${ld} ${MONTH_LABELS[fm - 1]} ${fy}`
    : `${fd} ${MONTH_LABELS[fm - 1]} – ${ld} ${MONTH_LABELS[lm - 1]}`
})

// ── Manager ───────────────────────────────────────
const maxLeads = computed(() => Math.max(...mockLeadsPaises.map(l => l.leads)))

// Reset week nav on route/role change
watch(() => route.path,         () => { weekOffset.value = 0 })
watch(() => auth.currentRole,   () => { weekOffset.value = 0 })
</script>

<style scoped>
/* ══════════════════════════════════════════
   Desktop (> 900px): panel in normal flex flow
   ══════════════════════════════════════════ */
.right-panel {
  width: var(--rightbar-width);
  flex-shrink: 0;
  overflow-y: auto;
  border-left: 1px solid var(--n-150);
  background: var(--n-0);
  scrollbar-width: thin;
  scrollbar-color: var(--n-200) transparent;
  position: relative; /* for absolute icon-strip positioning */
}

/* TH: slightly narrower */
@media (max-width: 1100px) {
  .right-panel { width: 220px; }
}

.right-panel-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 14px;
}

/* Icon strip: hidden on desktop */
.rp-icon-strip { display: none; }


/* ══════════════════════════════════════════
   Tablet vertical (≤ 1024px): always-visible 48px strip
   that expands on hover — same pattern as
   the left sidebar
   ══════════════════════════════════════════ */
@media (max-width: 1024px) {

  /* ── Collapsed strip ── */
  .right-panel {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 48px;
    flex-shrink: 0;
    overflow: hidden;
    z-index: 200;
    border-left: 1px solid var(--n-150);
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.07);
    transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  /* ── Expanded on hover ── */
  .right-panel:hover {
    width: var(--rightbar-width);
    overflow-y: auto;
    cursor: default;
  }

  /* ── Icon strip (visible when collapsed) ── */
  .rp-icon-strip {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 28px;
    gap: 24px;
    position: absolute;
    left: 0;
    top: 0;
    width: 48px;
    z-index: 1;
    opacity: 1;
    transition: opacity 0.12s ease;
    pointer-events: none; /* don't block hover on panel */
  }

  .rp-icon-strip .pi {
    font-size: 15px;
    color: var(--n-400);
  }

  /* Fade icons out as panel expands */
  .right-panel:hover .rp-icon-strip {
    opacity: 0;
  }

  /* ── Full content (fades in on expand) ── */
  .right-panel-inner {
    opacity: 0;
    min-width: var(--rightbar-width); /* prevent reflow during transition */
    transition: opacity 0.18s ease 0.08s;
  }

  .right-panel:hover .right-panel-inner {
    opacity: 1;
  }
}


/* ══════════════════════════════════════════
   Preview-toolbar overlay mode (previewWidth ≤ 1024px)
   Panel is absolute (out of flex flow) so it overlays
   the content like the left sidebar does.
   ══════════════════════════════════════════ */
.right-panel--tv {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 48px;
  overflow: hidden;
  cursor: pointer;
  border-left: 1px solid var(--n-150);
  box-shadow: -2px 0 16px rgba(0, 0, 0, 0.07);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  background: var(--n-0);
}

.right-panel--tv:hover {
  width: var(--rightbar-width);
  overflow-y: auto;
  cursor: default;
}

.right-panel--tv .rp-icon-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 28px;
  gap: 24px;
  position: absolute;
  left: 0;
  top: 0;
  width: 48px;
  z-index: 1;
  opacity: 1;
  transition: opacity 0.12s ease;
  pointer-events: none;
}

.right-panel--tv .rp-icon-strip .pi {
  font-size: 15px;
  color: var(--n-400);
}

.right-panel--tv:hover .rp-icon-strip {
  opacity: 0;
}

.right-panel--tv .right-panel-inner {
  opacity: 0;
  min-width: var(--rightbar-width);
  transition: opacity 0.18s ease 0.08s;
}

.right-panel--tv:hover .right-panel-inner {
  opacity: 1;
}


/* ══════════════════════════════════════════
   Ultra-wide mode — panel siempre expandido,
   anula cualquier colapso de media query
   ══════════════════════════════════════════ */
.right-panel--uw {
  width: var(--rightbar-width) !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  position: relative !important;
  cursor: default !important;
}
.right-panel--uw .rp-icon-strip { display: none !important; }
.right-panel--uw .right-panel-inner { opacity: 1 !important; min-width: 0 !important; }


/* ══════════════════════════════════════════
   Widget styles
   ══════════════════════════════════════════ */

/* ── CTA icon buttons — hover circular gris (token compartido) ── */
/* Aplica a: wcal-nav, wcal-ver-link, + buttons en headers de widgets */
:deep(.section-card__header .p-button-text.p-button-rounded) {
  width: 28px !important; height: 28px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  color: var(--brand) !important;
  background: transparent !important;
  transition: background .12s;
}
:deep(.section-card__header .p-button-text.p-button-rounded:hover) {
  background: var(--n-100) !important;
  color: var(--brand) !important;
}

.wcal-nav, .wcal-ver-link {
  background: none; border: none;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .12s;
  text-decoration: none;
}
.wcal-nav { color: var(--n-400); }
.wcal-nav:hover { background: var(--n-100); color: var(--n-700); }
.wcal-ver-link { color: var(--brand); }
.wcal-ver-link:hover { background: var(--n-100); color: var(--brand); }
.wcal-nav .pi, .wcal-ver-link .pi { font-size: 10px; }

/* Week calendar */
.wcal-nav-row { display: flex; align-items: center; gap: 2px; width: 100%; }
.wcal-title { font-size: 13px; font-weight: 600; color: var(--n-800); flex: 1; text-align: center; white-space: nowrap; }
.week-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; padding: 0 2px; }
.wday-col { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px 0; min-width: 0; border-radius: 8px; cursor: pointer; transition: background .12s; }
.wday-col:hover { background: var(--n-100); }
.wday-col--today:hover { background: var(--n-150); }
.wday-label { font-size: 10px; font-weight: 500; color: var(--n-400); letter-spacing: 0.02em; }
.wday-num { font-size: 13px; font-weight: 500; color: var(--n-700); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.wday-col--today .wday-num { background: var(--n-200); color: var(--n-800); font-weight: 700; }
.wday-col--today .wday-label { color: var(--n-600); font-weight: 600; }
.wday-dot { width: 5px; height: 5px; border-radius: 50%; }
.wday-dot--on  { background: var(--brand); }
.wday-dot--off { background: transparent; }

/* Citas — clickable rows */
.cita-item  { display: flex; gap: 8px; align-items: center; padding: 6px 4px; border-bottom: 1px solid var(--n-100); border-radius: 6px; cursor: pointer; transition: background .12s; }
.cita-item:last-child { border-bottom: none; }
.cita-item:hover { background: var(--n-50); }
.cita-dot   { width: 6px; height: 6px; border-radius: 50%; background: var(--n-300); flex-shrink: 0; }
.cita-title { font-size: 12px; font-weight: 500; color: var(--n-700); flex: 1; }

/* Notificaciones "ver todas" link */
.notif-ver-todas {
  font-size: 11px; font-weight: 500; color: var(--brand, #ef6948);
  text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
}
.notif-ver-todas:hover { text-decoration: underline; }
.notif-ver-todas .pi { font-size: 9px; }

/* ── Detail dialog (shared with NotificacionesView) ── */
.detail-header { display: flex; gap: 12px; align-items: flex-start; }
.detail-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }
.nf-icon--cita         { background: var(--info-bg);    color: var(--info); }
.nf-icon--recordatorio { background: var(--n-100);      color: var(--n-500); }
.detail-fecha  { font-size: 11px; color: var(--n-400); margin-top: 4px; }
.detail-texto  { font-size: 14px; color: var(--n-700); margin: 0 0 16px; }
.detail-desc   { font-size: 12px; color: var(--n-500); margin: -8px 0 16px; }
.detail-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.detail-actions .p-button { flex: 1; min-width: 120px; justify-content: center; }

/* bottom-sheet border radius */
:global(.detail-dialog--bottom .p-dialog) { border-radius: 16px 16px 0 0 !important; }
:global(.detail-dialog--center .p-dialog) { border-radius: 12px !important; }

/* Recordatorios / Notifs */
.rec-item { display: flex; gap: 8px; align-items: flex-start; padding: 5px 0; border-bottom: 1px solid var(--n-100); }
.rec-item:last-child { border-bottom: none; }
.rec-icon  { color: var(--n-300); font-size: 11px; margin-top: 3px; flex-shrink: 0; }
.rec-texto { font-size: 12px; color: var(--n-700); }
.item-fecha { font-size: 11px; color: var(--n-400); margin-top: 1px; }

/* Team Lead */
.reto-card      { background: #FEF9C3 !important; border-color: #fde68a !important; }
:deep(.p-progressbar-value) { background: var(--success) !important; }
.obj-top   { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2px; }
.obj-val   { font-size: 20px; font-weight: 700; color: var(--n-900); }
.obj-pct   { font-size: 12px; color: var(--n-400); }
.obj-label { font-size: 12px; color: var(--n-500); }
.reto-edit-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.reto-eyebrow  { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.06em; }
.reto-title    { font-size: 13px; font-weight: 700; color: var(--n-800); margin-bottom: 6px; }
.reto-desc     { font-size: 12px; color: var(--n-600); line-height: 1.6; margin-bottom: 8px; }
.reto-link     { font-size: 12px; color: var(--brand); font-weight: 500; text-decoration: none; }

/* ── Recordatorios: to-do list ── */
.rec-todo-list { display: flex; flex-direction: column; gap: 2px; }
.rec-todo {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 6px 4px; border-radius: 8px; cursor: default;
  transition: background 0.12s;
}
.rec-todo:hover { background: var(--n-50, #f9fafb); }

.rec-check {
  flex-shrink: 0; margin-top: 2px;
  width: 15px; height: 15px; border-radius: 50%;
  border: 1.5px solid var(--n-300, #d1d5db);
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s, background 0.15s;
  color: #fff;
}
.rec-check:hover { border-color: var(--brand, #ef6948); }
.rec-check--done { border-color: var(--n-300); background: var(--n-300); }

.rec-body { flex: 1; min-width: 0; cursor: pointer; }
.rec-titulo {
  font-size: 12px; font-weight: 500; color: var(--n-800);
  margin: 0; line-height: 1.4; transition: color 0.15s;
}
.rec-todo--done .rec-titulo { text-decoration: line-through; color: var(--n-400); }
.rec-meta { font-size: 11px; color: var(--n-500); margin: 2px 0 0; }
.rec-todo--done .rec-meta { color: var(--n-300); }

.rec-detail { margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--n-100); }
.rec-desc { font-size: 11px; color: var(--n-600); margin: 0; line-height: 1.5; }

/* Manager */
.obj-row      { margin-bottom: 10px; }
.obj-row:last-child { margin-bottom: 0; }
.obj-info     { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
.obj-bar-track { height: 5px; background: var(--n-100); border-radius: 99px; overflow: hidden; }
.obj-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.obj-pais  { color: var(--n-600); }
.obj-nums  { font-weight: 600; color: var(--n-800); }
.lp-row    { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 12px; }
.lp-row:last-child { margin-bottom: 0; }
.lp-flag   { width: 70px; flex-shrink: 0; color: var(--n-600); }
.lp-bar-wrap { flex: 1; height: 6px; background: var(--n-100); border-radius: 3px; overflow: hidden; }
.lp-bar    { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.lp-count  { width: 36px; text-align: right; font-weight: 600; color: var(--n-800); }

/* ── Perfil lead: WhatsApp ── */
.wa-title { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #25d366; }
.wa-conn  { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--n-500); margin-left: auto; }
.wa-conn .wa-dot { width: 8px; height: 8px; border-radius: 50%; background: #25d366; display: inline-block; }
.wa-chat {
  background: #ece5dd; border-radius: 10px; padding: 10px;
  display: flex; flex-direction: column; gap: 6px;
  flex: 1;                /* fills the available space inside the wa-card */
  min-height: 180px;
  overflow-y: auto;
}
.wa-date-pill { align-self: center; background: rgba(255,255,255,0.7); padding: 3px 10px; border-radius: 999px; font-size: 11px; color: var(--n-600); }
.wa-msg { max-width: 80%; padding: 6px 10px; border-radius: 8px; font-size: 12px; background: #fff; align-self: flex-start; }
.wa-msg.out { background: #dcf8c6; align-self: flex-end; }
.wa-compose { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
.wa-input { flex: 1; border: 1px solid var(--n-200); border-radius: 8px; padding: 6px 10px; font-size: 12px; outline: none; }

/* ── Perfil lead: Historial ── */
.hist-title { font-size: 13px; font-weight: 600; color: var(--n-800); display: inline-flex; align-items: center; gap: 6px; }
.hist-pills { display: flex; gap: 6px; margin-bottom: 10px; }
.pill { background: var(--n-100); border: none; padding: 4px 10px; border-radius: 999px; font-size: 11px; cursor: pointer; color: var(--n-700); }
.pill.active { background: var(--brand-subtle, #fdf1ed); color: var(--brand, #ef6948); font-weight: 600; }
.hist-compose { display: flex; gap: 6px; align-items: center; margin-bottom: 10px; }
.hist-input { flex: 1; border: 1px solid var(--n-200); border-radius: 8px; padding: 6px 10px; font-size: 12px; outline: none; }
.hist-list { display: flex; flex-direction: column; gap: 6px; max-height: 360px; overflow-y: auto; }
.hist-item { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid var(--n-100); }
.hist-icon { color: var(--n-500); margin-top: 2px; font-size: 13px; }
.hist-body { flex: 1; min-width: 0; }
.hist-text { font-size: 12px; margin: 0; color: var(--n-700); }
.hist-fecha { font-size: 11px; color: var(--n-500); margin: 2px 0 0; }

/* ══════════════════════════════════════════
   Perfil-lead: panel más ancho + WA al 60vh
   ══════════════════════════════════════════ */
.right-panel--perfil-lead {
  width: 380px;             /* más ancho que el default (--rightbar-width ≈ 280-320) */
  height: 100vh;            /* fija al alto del viewport para repartir 60% WA + resto Hist */
  overflow: hidden;         /* el scroll se delega al historial */
  position: sticky;
  top: 0;
}
@media (max-width: 1100px) {
  .right-panel--perfil-lead { width: 320px; }
}
.right-panel--perfil-lead .right-panel-inner {
  height: 100%;             /* el panel ya tiene overflow-y:auto, esto sirve como contenedor */
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* WhatsApp ocupa 60% del viewport alto */
.right-panel--perfil-lead .wa-card {
  height: 60vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.right-panel--perfil-lead .wa-card :deep(.section-card__header) { flex-shrink: 0; }
.right-panel--perfil-lead .wa-card .wa-compose { flex-shrink: 0; }
/* Historial ocupa el resto y es scrolleable */
.right-panel--perfil-lead .hist-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;            /* permite que el flex child colapse y scrollee */
}
.right-panel--perfil-lead .hist-card :deep(.section-card__header),
.right-panel--perfil-lead .hist-card .hist-pills,
.right-panel--perfil-lead .hist-card .hist-compose { flex-shrink: 0; }
.right-panel--perfil-lead .hist-card .hist-list {
  flex: 1;
  overflow-y: auto;
  max-height: none;         /* sobreescribe el 360px por defecto */
  min-height: 0;
}

/* ── Perfil-venta: mismo layout que perfil-lead (60% WA + resto Historial) ── */
.right-panel--perfil-venta {
  width: 380px;
  height: 100vh;
  overflow: hidden;
  position: sticky;
  top: 0;
}
@media (max-width: 1100px) {
  .right-panel--perfil-venta { width: 320px; }
}
.right-panel--perfil-venta .right-panel-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.right-panel--perfil-venta .wa-card {
  height: 60vh;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.right-panel--perfil-venta .wa-card :deep(.section-card__header) { flex-shrink: 0; }
.right-panel--perfil-venta .wa-card .wa-compose { flex-shrink: 0; }
.right-panel--perfil-venta .hist-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.right-panel--perfil-venta .hist-card :deep(.section-card__header),
.right-panel--perfil-venta .hist-card .hist-pills,
.right-panel--perfil-venta .hist-card .hist-compose { flex-shrink: 0; }
.right-panel--perfil-venta .hist-card .hist-list {
  flex: 1;
  overflow-y: auto;
  max-height: none;
  min-height: 0;
}

/* ── Narrow tablet: hide strip, slide-in drawer only ────── */
@media (max-width: 640px) {
  .right-panel {
    position: fixed !important;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px !important;
    height: 100dvh !important;
    z-index: 400;
    transform: translateX(100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 24px rgba(0,0,0,0.12);
    overflow-y: auto;
  }
}

/* ── Mobile drawer ──────────────────────────────── */
@media (max-width: 480px) {
  .right-panel {
    position: fixed !important;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px !important;
    height: 100dvh !important;
    z-index: 400;
    transform: translateX(100%);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -4px 0 24px rgba(0,0,0,0.12);
    overflow-y: auto;
  }
  /* En mobile el panel NO se abre por hover sino por clic → el contenido
     debe estar visible siempre (anula el opacity:0 del breakpoint ≤1024px) */
  .right-panel-inner {
    opacity: 1 !important;
    min-width: 0 !important;
    /* Padding-bottom para que el contenido no quede oculto por el bottom nav */
    padding-bottom: calc(76px + env(safe-area-inset-bottom)) !important;
  }
  .right-panel--mobile-open {
    transform: translateX(0);
  }
  /* Ocultar el icon strip colapsado — no aplica en mobile */
  .rp-icon-strip { display: none !important; }
}

/* Equivalente .is-mob (preview mode) */
.is-mob .right-panel-inner {
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
}

.mobile-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 399;
}
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

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
</style>
