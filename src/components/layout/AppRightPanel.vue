<template>
  <aside
    v-if="showPanel"
    class="right-panel"
    :class="{
      'right-panel--tv': isTvMode,
      'right-panel--uw': auth.isUwMode,
      'right-panel--perfil-lead': isPerfilLead,
      'right-panel--perfil-venta': isPerfilVenta,
    }"
  >

    <!-- ── Collapsed icon strip (TV only, ≤900px) ── -->
    <div class="rp-icon-strip">
      <i v-for="ic in stripIcons" :key="ic" :class="`pi ${ic}`" />
    </div>

    <!-- ── Full content ── -->
    <div class="right-panel-inner">

      <!-- ── PERFIL VENTA: solo WhatsApp (el historial vive dentro de la página) ── -->
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
        <SectionCard v-if="showCalendarWidget" :title="weekRangeLabel">
          <template #header>
            <div class="wcal-nav-row">
              <button class="wcal-nav" @click="weekOffset--"><i class="pi pi-chevron-left" /></button>
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
          <div class="cita-item" v-for="c in mockProximasCitas" :key="c.id">
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
                <i v-if="r.completado" class="pi pi-check" style="font-size:9px" />
              </button>
              <div class="rec-body" @click="toggleExpand(r.id)">
                <p class="rec-titulo">{{ r.titulo }}</p>
                <p class="rec-meta">{{ r.fechaStr }}<span v-if="r.lead"> · {{ r.lead }}</span></p>
                <div v-if="expandedRecId === r.id && (r.descripcion || r.lead)" class="rec-detail">
                  <p v-if="r.descripcion" class="rec-desc">{{ r.descripcion }}</p>
                </div>
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
            <span class="obj-val">749/2.430</span>
            <span class="obj-pct">31%</span>
          </div>
          <p class="obj-label">Objetivo mensual</p>
          <ProgressBar :value="31" style="height:6px;margin-top:8px" />
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
                <i v-if="r.completado" class="pi pi-check" style="font-size:9px" />
              </button>
              <div class="rec-body" @click="toggleExpand(r.id)">
                <p class="rec-titulo">{{ r.titulo }}</p>
                <p class="rec-meta">{{ r.fechaStr }}<span v-if="r.lead"> · {{ r.lead }}</span></p>
                <div v-if="expandedRecId === r.id && (r.descripcion || r.lead)" class="rec-detail">
                  <p v-if="r.descripcion" class="rec-desc">{{ r.descripcion }}</p>
                </div>
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
                <i v-if="r.completado" class="pi pi-check" style="font-size:9px" />
              </button>
              <div class="rec-body" @click="toggleExpand(r.id)">
                <p class="rec-titulo">{{ r.titulo }}</p>
                <p class="rec-meta">{{ r.fechaStr }}<span v-if="r.lead"> · {{ r.lead }}</span></p>
                <div v-if="expandedRecId === r.id && (r.descripcion || r.lead)" class="rec-detail">
                  <p v-if="r.descripcion" class="rec-desc">{{ r.descripcion }}</p>
                </div>
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
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRetoStore } from '@/stores/reto'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import SectionCard from '@/components/ui/SectionCard.vue'
import CrearCitaModal from '@/components/ui/CrearCitaModal.vue'
import CrearRecordatorioModal from '@/components/ui/CrearRecordatorioModal.vue'
import EditarRetoModal from '@/components/ui/EditarRetoModal.vue'
import { mockProximasCitas, mockObjetivosPaises, mockLeadsPaises, mockPerfilLead } from '@/data/mock'
import { CHART_COLORS } from '@/theme/palette'

const auth = useAuthStore()
const retoStore = useRetoStore()
const route = useRoute()

// ── Pages where the right panel is visible ───────
// Same composition per role across these screens.
// Hidden on: /leads/:id (perfil detail), /configuracion
const PANEL_ROUTES = [
  'dashboard',
  'leads',
  'ventas',
  'errores-pago',
  'agentes',
  'exportaciones',
  'calendario',
  'notificaciones',
  'perfil-lead',
  'perfil-venta',
]
const showPanel = computed(() => PANEL_ROUTES.includes(String(route.name)))
const isPerfilLead  = computed(() => route.name === 'perfil-lead')
const isPerfilVenta = computed(() => route.name === 'perfil-venta')

// Modales
const showCrearCita         = ref(false)
const showCrearRecordatorio = ref(false)
const showEditarReto        = ref(false)

// ── Recordatorios (to-do list reactivo) ───────────
interface Recordatorio {
  id: string
  titulo: string
  descripcion?: string
  lead?: string
  fechaStr: string
  completado: boolean
}
const recordatoriosLocal = ref<Recordatorio[]>([
  { id: '1', titulo: 'Avisar renovación a Carlos García', descripcion: 'Cliente con plan premium, renovación el 20 de feb', lead: 'Carlos García', fechaStr: 'Lun 16 feb · 10:00', completado: false },
  { id: '2', titulo: 'Llamar a María López', fechaStr: 'Lun 16 feb · 12:00', completado: false },
  { id: '3', titulo: 'Enviar presupuesto Plan B', lead: 'Ana Soto', fechaStr: 'Mar 17 feb · 09:00', completado: false },
  { id: '4', titulo: 'Seguimiento post-venta Spike', fechaStr: 'Mié 18 feb · 11:00', completado: false },
])
const expandedRecId = ref<string | null>(null)

function toggleRec(id: string) {
  const r = recordatoriosLocal.value.find(r => r.id === id)
  if (r) r.completado = !r.completado
}
function toggleExpand(id: string) {
  expandedRecId.value = expandedRecId.value === id ? null : id
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

/* Week calendar */
.wcal-nav-row { display: flex; align-items: center; gap: 2px; }
.wcal-nav { background: none; border: none; padding: 2px 4px; cursor: pointer; color: var(--n-400); border-radius: 4px; transition: color .12s, background .12s; }
.wcal-nav:hover { color: var(--n-700); background: var(--n-100); }
.wcal-nav .pi { font-size: 10px; }
.week-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.wday-col { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px 2px; border-radius: 8px; }
.wday-label { font-size: 10px; font-weight: 500; color: var(--n-400); letter-spacing: 0.02em; }
.wday-num { font-size: 13px; font-weight: 500; color: var(--n-700); width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.wday-col--today .wday-num { background: var(--n-200); color: var(--n-800); font-weight: 700; }
.wday-col--today .wday-label { color: var(--n-600); font-weight: 600; }
.wday-dot { width: 5px; height: 5px; border-radius: 50%; }
.wday-dot--on  { background: var(--brand); }
.wday-dot--off { background: transparent; }
.wcal-ver-link { color: var(--n-400); text-decoration: none; padding: 2px 4px; border-radius: 4px; display: flex; align-items: center; transition: color .12s, background .12s; }
.wcal-ver-link:hover { color: var(--brand); background: var(--n-100); }
.wcal-ver-link .pi { font-size: 10px; }

/* Citas */
.cita-item  { display: flex; gap: 8px; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid var(--n-100); }
.cita-item:last-child { border-bottom: none; }
.cita-dot   { width: 6px; height: 6px; border-radius: 50%; background: var(--n-300); margin-top: 5px; flex-shrink: 0; }
.cita-title { font-size: 12px; font-weight: 500; color: var(--n-700); }

/* Notificaciones "ver todas" link */
.notif-ver-todas {
  font-size: 11px; font-weight: 500; color: var(--brand, #ef6948);
  text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
}
.notif-ver-todas:hover { text-decoration: underline; }
.notif-ver-todas .pi { font-size: 9px; }

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
  flex-shrink: 0; margin-top: 1px;
  width: 18px; height: 18px; border-radius: 50%;
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

/* ── Perfil-venta: panel ancho con WhatsApp ocupando todo el alto ── */
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
}
.right-panel--perfil-venta .wa-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.right-panel--perfil-venta .wa-card :deep(.section-card__header),
.right-panel--perfil-venta .wa-card .wa-compose { flex-shrink: 0; }
</style>
