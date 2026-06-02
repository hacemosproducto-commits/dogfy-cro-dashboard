<template>
  <div class="cal-view">

    <!-- ── Toolbar ───────────────────────────────────── -->
    <div class="cal-toolbar">
      <div class="cal-nav">
        <button class="btn-hoy" @click="goToday">Hoy</button>
        <!-- hide prev/next on mobile — navigation is via scroll -->
        <template v-if="!isMob">
          <button class="btn-nav" @click="prev"><i class="pi pi-chevron-left" /></button>
          <button class="btn-nav" @click="next"><i class="pi pi-chevron-right" /></button>
          <span class="cal-label">{{ label }}</span>
        </template>
      </div>
      <div class="cal-nav-right">
        <Button icon="pi pi-plus" label="Crear cita" size="small" @click="showModal = true" />
        <div class="vista-toggle">
          <button v-for="v in vistas" :key="v" class="vt-btn" :class="{ active: vista === v }" @click="vista = v">{{ v }}</button>
        </div>
      </div>
    </div>

    <!-- ══════════════ DESKTOP views ══════════════════════ -->

    <!-- ── Mes (desktop) ─────────────────────────────── -->
    <div v-if="vista === 'Mes' && !isMob" class="cal-card">
      <div class="month-grid">
        <div v-for="d in DOW" :key="d" class="month-dow">{{ d }}</div>
        <div
          v-for="cell in calDays" :key="cell.iso"
          class="month-cell"
          :class="{ 'out': !cell.inMonth, 'today': cell.isToday }"
          @click="gotoDay(cell.date)"
        >
          <span class="cell-num" :class="{ 'today-badge': cell.isToday }">{{ cell.date.getDate() }}</span>
          <div class="cell-events">
            <div v-for="ev in cell.events" :key="ev.id" class="event-pill" :class="`ev-${ev.color}`">
              <span class="ep-bar" />
              <span class="ep-text">{{ ev.titulo }}</span>
              <span class="ep-time">{{ fmtTime(ev.fecha) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Semana (desktop only) ─────────────────────── -->
    <div v-else-if="vista === 'Semana'" class="cal-card time-view">
      <div class="tv-head">
        <div class="tv-gutter" />
        <div
          v-for="(wd, i) in weekDays" :key="wd.iso"
          class="tv-col-head" :class="{ 'today-col-head': wd.isToday }"
        >
          <span class="tv-dow">{{ DOW[i] }}</span>
          <span class="tv-daynum" :class="{ 'today-badge': wd.isToday }">{{ wd.date.getDate() }}</span>
        </div>
      </div>
      <div class="tv-body">
        <div class="tv-times">
          <div v-for="h in HOURS" :key="h" class="tv-time-slot">
            <span class="tv-time-label">{{ h }}:00</span>
          </div>
        </div>
        <div class="tv-cols">
          <div
            v-for="wd in weekDays" :key="wd.iso"
            class="tv-col" :class="{ 'today-col': wd.isToday }"
          >
            <div v-for="h in HOURS" :key="h" class="tv-hour-cell" />
            <div
              v-for="ev in wd.events" :key="ev.id"
              class="event-block" :class="[`ev-${ev.color}`, { 'has-lead': ev.leadId }]"
              :style="evStyle(ev)"
              @click.stop="goToLead(ev)"
            >
              <span class="eb-time">{{ fmtTime(ev.fecha) }}</span>
              <span class="eb-title">{{ ev.titulo }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Día (desktop time grid) ───────────────────── -->
    <div v-else-if="vista === 'Día' && !isMob" class="cal-card time-view">
      <div class="tv-body">
        <div class="tv-times">
          <div v-for="h in HOURS" :key="h" class="tv-time-slot">
            <span class="tv-time-label">{{ h }}:00</span>
          </div>
        </div>
        <div class="tv-cols">
          <div class="tv-col today-col" style="flex:1">
            <div v-for="h in HOURS" :key="h" class="tv-hour-cell" />
            <div
              v-for="ev in dayEvents" :key="ev.id"
              class="event-block" :class="[`ev-${ev.color}`, { 'has-lead': ev.leadId }]"
              :style="evStyle(ev)"
              @click.stop="goToLead(ev)"
            >
              <span class="eb-time">{{ fmtTime(ev.fecha) }}</span>
              <span class="eb-title">{{ ev.titulo }}</span>
              <span class="eb-lead">{{ ev.lead }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════ MOBILE views ═══════════════════════ -->

    <!-- ── Mes mobile: scrollable multi-month ────────── -->
    <div v-else-if="vista === 'Mes' && isMob" class="mob-months-scroll" ref="monthsScrollRef">
      <div
        v-for="m in mobileMonths" :key="m.key"
        :id="`mob-month-${m.key}`"
        class="mob-month-block"
      >
        <div class="mob-month-title" :class="{ 'mob-month-title--current': m.isCurrentMonth }">
          {{ m.label }}
        </div>
        <div class="mob-month-grid">
          <div v-for="d in DOW" :key="d" class="mob-dow">{{ d }}</div>
          <div
            v-for="cell in m.days" :key="cell.iso"
            class="mob-cell"
            :class="{ 'mob-cell--out': !cell.inMonth, 'mob-cell--today': cell.isToday }"
            @click="cell.inMonth && gotoDay(cell.date)"
          >
            <span class="mob-cell-num" :class="{ 'today-badge': cell.isToday && cell.inMonth }">
              {{ cell.date.getDate() }}
            </span>
            <div v-if="cell.inMonth" class="mob-cell-events">
              <div
                v-for="ev in cell.events.slice(0, 2)" :key="ev.id"
                class="mob-pill" :class="`epm-${ev.color}`"
              >
                <span class="epm-dot" />
                <span class="epm-text">{{ ev.titulo }}</span>
              </div>
              <span v-if="cell.events.length > 2" class="mob-cell-more">+{{ cell.events.length - 2 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Día mobile: continuous agenda scroll ───────── -->
    <div v-else-if="vista === 'Día' && isMob" class="mob-agenda-scroll" ref="agendaScrollRef">
      <template v-for="group in agendaGroups" :key="group.dateKey">
        <div
          :id="`ag-${group.dateKey}`"
          class="ag-group"
          :class="{ 'ag-group--today': group.isToday }"
        >
          <!-- Date column -->
          <div class="ag-date-col">
            <span class="ag-dow">{{ group.dow }}</span>
            <span class="ag-num" :class="{ 'today-badge': group.isToday }">{{ group.dayNum }}</span>
            <span class="ag-mon">{{ group.mon }}</span>
          </div>

          <!-- Events column -->
          <div class="ag-events-col">
            <div v-if="group.events.length === 0" class="ag-no-events">Sin citas</div>
            <div
              v-for="ev in group.events" :key="ev.id"
              class="ag-event" :class="[`ev-${ev.color}`, { 'has-lead': ev.leadId }]"
              @click="goToLead(ev)"
            >
              <div class="ag-ev-header">
                <span class="ag-ev-title">{{ ev.titulo }}</span>
                <i v-if="ev.leadId" class="pi pi-chevron-right ag-ev-chevron" />
              </div>
              <div class="ag-ev-meta">
                <span>{{ fmtTime(ev.fecha) }}</span>
                <span class="ag-ev-sep">·</span>
                <span>{{ ev.duracion }} min</span>
                <span class="ag-ev-sep">·</span>
                <span>{{ ev.lead }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

  </div>

  <!-- ── Modal crear cita ──────────────────────────── -->
  <CrearCitaModal v-model:visible="showModal" />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import CrearCitaModal from '@/components/ui/CrearCitaModal.vue'
import { useAuthStore } from '@/stores/auth'

// ── Constants ──────────────────────────────────────────
const DOW    = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const HOURS  = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const HOUR_H = 64
const H_START = 8
const ALL_VISTAS = ['Día', 'Semana', 'Mes'] as const
type Vista = typeof ALL_VISTAS[number]

// ── Router ─────────────────────────────────────────────
const router = useRouter()
const route  = useRoute()
function goToLead(ev: Cita) {
  if (ev.leadId) router.push(`/leads/${ev.leadId}`)
}

// Navegación desde widget del panel derecho: ?dia=YYYY-MM-DD → ir a vista Día
function applyDiaQuery(dia: unknown) {
  if (typeof dia !== 'string' || !dia) return
  const parts = dia.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  currentDate.value = d
  vista.value = 'Día'
  nextTick(() => {
    const key = dateKey(d)
    agendaScrollRef.value?.querySelector(`#ag-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
watch(() => route.query.dia, (dia) => applyDiaQuery(dia))

// ── Mobile detection ───────────────────────────────────
const auth = useAuthStore()
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const onResize = () => { windowWidth.value = window.innerWidth }
onMounted(() => {
  window.addEventListener('resize', onResize)
  if (route.query.dia) nextTick(() => applyDiaQuery(route.query.dia))
})
onUnmounted(() => window.removeEventListener('resize', onResize))
const isMob = computed(() => auth.isMobPreview || windowWidth.value <= 480)

const vistas = computed<Vista[]>(() =>
  isMob.value ? ['Día', 'Mes'] : ['Día', 'Semana', 'Mes']
)
watch(isMob, (mob) => {
  if (mob && vista.value === 'Semana') vista.value = 'Día'
})

// ── Types ──────────────────────────────────────────────
interface Cita {
  id: number
  titulo: string
  lead: string
  leadId: string | null
  fecha: Date
  duracion: number
  color: 'brand' | 'teal' | 'violet'
}

// ── Mock data ──────────────────────────────────────────
const mockCitas: Cita[] = [
  { id: 1,  titulo: 'Cita papá de Spike',        lead: 'Carlos García',   leadId: '1',  fecha: new Date(2026, 3, 28, 10,  0), duracion: 30,  color: 'brand'  },
  { id: 2,  titulo: 'Seguimiento Luna',           lead: 'María López',     leadId: '2',  fecha: new Date(2026, 3, 28, 14, 30), duracion: 45,  color: 'brand'  },
  { id: 3,  titulo: 'Demo Dogfy Diet',            lead: 'Juan Martínez',   leadId: '3',  fecha: new Date(2026, 3, 29, 11,  0), duracion: 60,  color: 'teal'   },
  { id: 4,  titulo: 'Cita perro Max',             lead: 'Ana Rodríguez',   leadId: '4',  fecha: new Date(2026, 3, 30,  9, 30), duracion: 30,  color: 'brand'  },
  { id: 5,  titulo: 'Llamada cierre venta',       lead: 'Pedro Sánchez',   leadId: '5',  fecha: new Date(2026, 3, 30, 16,  0), duracion: 30,  color: 'teal'   },
  { id: 6,  titulo: 'Nueva mascota Coco',         lead: 'Sofía Moreno',    leadId: '6',  fecha: new Date(2026, 4,  1, 10,  0), duracion: 45,  color: 'brand'  },
  { id: 7,  titulo: 'Revisión plan nutricional',  lead: 'Roberto Díaz',    leadId: '7',  fecha: new Date(2026, 4,  2, 15,  0), duracion: 30,  color: 'violet' },
  { id: 8,  titulo: 'Seguimiento Bruno',          lead: 'Laura Torres',    leadId: '8',  fecha: new Date(2026, 4,  5, 11,  0), duracion: 30,  color: 'brand'  },
  { id: 9,  titulo: 'Cierre venta premium',       lead: 'Miguel Ruiz',     leadId: '9',  fecha: new Date(2026, 4,  7, 15,  0), duracion: 60,  color: 'teal'   },
  { id: 10, titulo: 'Cita familia López',         lead: 'Carmen López',    leadId: '10', fecha: new Date(2026, 4, 12, 10,  0), duracion: 30,  color: 'brand'  },
  { id: 11, titulo: 'Demo pack senior',           lead: 'Isabel Gómez',    leadId: '11', fecha: new Date(2026, 4, 14,  9,  0), duracion: 45,  color: 'violet' },
  { id: 12, titulo: 'Seguimiento Nala',           lead: 'David Fernández', leadId: '12', fecha: new Date(2026, 4, 19, 11, 30), duracion: 30,  color: 'brand'  },
  { id: 13, titulo: 'Cita nueva cliente',         lead: 'Pilar Castro',    leadId: '13', fecha: new Date(2026, 4, 21, 14,  0), duracion: 30,  color: 'teal'   },
  { id: 14, titulo: 'Cierre perro Rocky',         lead: 'Antonio Ruiz',    leadId: '14', fecha: new Date(2026, 4, 26, 10,  0), duracion: 60,  color: 'brand'  },
]

// ── State ──────────────────────────────────────────────
const vista       = ref<Vista>('Mes')
const currentDate = ref(new Date(2026, 3, 28))
const showModal   = ref(false)

// Scroll refs for mobile views
const monthsScrollRef = ref<HTMLElement | null>(null)
const agendaScrollRef = ref<HTMLElement | null>(null)

// ── Helpers ────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getMondayOfWeek(d: Date): Date {
  const copy = new Date(d)
  const day = copy.getDay()
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1))
  copy.setHours(0, 0, 0, 0)
  return copy
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const TODAY = new Date(2026, 3, 28)

// ── Desktop computed ───────────────────────────────────
const label = computed(() => {
  if (vista.value === 'Mes') {
    return currentDate.value.toLocaleDateString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()) + ' ' + currentDate.value.getFullYear()
  }
  if (vista.value === 'Semana') {
    const mon = getMondayOfWeek(currentDate.value)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    return `${mon.toLocaleDateString('es-ES', opts)} – ${sun.toLocaleDateString('es-ES', opts)} ${sun.getFullYear()}`
  }
  return currentDate.value.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
})

const calDays = computed(() => {
  const y  = currentDate.value.getFullYear()
  const mo = currentDate.value.getMonth()
  const start = getMondayOfWeek(new Date(y, mo, 1))
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i)
    return { date: d, iso: d.toISOString(), inMonth: d.getMonth() === mo, isToday: isSameDay(d, TODAY), events: mockCitas.filter(c => isSameDay(c.fecha, d)) }
  })
})

const weekDays = computed(() => {
  const mon = getMondayOfWeek(currentDate.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i)
    return { date: d, iso: d.toISOString(), isToday: isSameDay(d, TODAY), events: mockCitas.filter(c => isSameDay(c.fecha, d)) }
  })
})

const dayEvents = computed(() => mockCitas.filter(c => isSameDay(c.fecha, currentDate.value)))

// ── Mobile: multi-month scroll ─────────────────────────
// 12 months starting from the month containing TODAY
const mobileMonths = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 1)
    const y = d.getFullYear(); const mo = d.getMonth()
    const start = getMondayOfWeek(new Date(y, mo, 1))
    const allDays = Array.from({ length: 42 }, (_, j) => {
      const day = new Date(start); day.setDate(start.getDate() + j)
      return { date: day, iso: day.toISOString(), inMonth: day.getMonth() === mo, isToday: isSameDay(day, TODAY), events: mockCitas.filter(c => isSameDay(c.fecha, day)) }
    })
    // Drop the last row if it contains no days from this month
    const days = allDays.slice(35).some(c => c.inMonth) ? allDays : allDays.slice(0, 35)
    return {
      key: `${y}-${mo}`,
      label: d.toLocaleDateString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()) + ' ' + y,
      isCurrentMonth: y === TODAY.getFullYear() && mo === TODAY.getMonth(),
      days,
    }
  })
})

// ── Mobile: continuous agenda scroll ──────────────────
// Days with events in the next 180 days; always include TODAY
const agendaGroups = computed(() => {
  const groups = []
  for (let i = 0; i < 180; i++) {
    const d = new Date(TODAY); d.setDate(TODAY.getDate() + i)
    const events = mockCitas.filter(c => isSameDay(c.fecha, d))
    if (events.length > 0 || isSameDay(d, TODAY)) {
      groups.push({
        dateKey: dateKey(d),
        isToday: isSameDay(d, TODAY),
        dayNum: d.getDate(),
        dow: d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase(),
        mon: d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
        events,
      })
    }
  }
  return groups
})

// ── Navigation ─────────────────────────────────────────
async function goToday() {
  currentDate.value = new Date(TODAY)
  if (isMob.value) {
    await nextTick()
    if (vista.value === 'Mes') {
      const key = `${TODAY.getFullYear()}-${TODAY.getMonth()}`
      monthsScrollRef.value?.querySelector(`#mob-month-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      agendaScrollRef.value?.querySelector(`#ag-${dateKey(TODAY)}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

function gotoDay(d: Date) {
  currentDate.value = new Date(d)
  vista.value = 'Día'
  if (isMob.value) {
    nextTick(() => {
      const key = dateKey(d)
      const el = agendaScrollRef.value?.querySelector(`#ag-${key}`) as HTMLElement | null
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }
}

function prev() {
  const d = new Date(currentDate.value)
  if      (vista.value === 'Mes')    d.setMonth(d.getMonth() - 1)
  else if (vista.value === 'Semana') d.setDate(d.getDate() - 7)
  else                               d.setDate(d.getDate() - 1)
  currentDate.value = d
}
function next() {
  const d = new Date(currentDate.value)
  if      (vista.value === 'Mes')    d.setMonth(d.getMonth() + 1)
  else if (vista.value === 'Semana') d.setDate(d.getDate() + 7)
  else                               d.setDate(d.getDate() + 1)
  currentDate.value = d
}

// ── Scroll to today on mount ───────────────────────────
onMounted(async () => {
  if (isMob.value) {
    await nextTick()
    // Scroll month view to current month
    const key = `${TODAY.getFullYear()}-${TODAY.getMonth()}`
    monthsScrollRef.value?.querySelector(`#mob-month-${key}`)?.scrollIntoView({ block: 'start' })
  }
})

// When switching to Día on mobile, scroll to today or currentDate
watch([vista, isMob], async ([v, mob]) => {
  if (mob && v === 'Día') {
    await nextTick()
    const key = dateKey(currentDate.value)
    const el = agendaScrollRef.value?.querySelector(`#ag-${key}`) as HTMLElement | null
    ;(el ?? agendaScrollRef.value?.querySelector(`#ag-${dateKey(TODAY)}`))?.scrollIntoView({ block: 'start' })
  }
})

// ── Event positioning (desktop time grid) ─────────────
function evStyle(ev: Cita) {
  const h = ev.fecha.getHours() - H_START
  const m = ev.fecha.getMinutes()
  return { top: `${h * HOUR_H + (m / 60) * HOUR_H}px`, height: `${Math.max(24, (ev.duracion / 60) * HOUR_H - 2)}px` }
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────── */
.cal-view { display: flex; flex-direction: column; gap: 12px; height: 100%; }

/* ── Toolbar ─────────────────────────────────────── */
.cal-toolbar { display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.cal-nav { display: flex; align-items: center; gap: 4px; }
.btn-hoy {
  background: var(--n-0); border: 1px solid var(--n-200); border-radius: 7px;
  padding: 6px 14px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--n-700);
}
.btn-hoy:hover { background: var(--n-100); }
.btn-nav {
  background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px;
  color: var(--n-400); display: flex; align-items: center; font-size: 12px;
}
.btn-nav:hover { background: var(--n-100); color: var(--n-700); }
.cal-label { font-size: 14px; font-weight: 600; color: var(--n-800); text-transform: capitalize; margin-left: 8px; min-width: 180px; }
.cal-nav-right { display: flex; align-items: center; gap: 8px; }

.vista-toggle { display: flex; background: var(--n-100); border-radius: 8px; padding: 3px; }
.vt-btn { background: none; border: none; padding: 5px 14px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; color: var(--n-500); }
.vt-btn.active { background: var(--n-0); color: var(--n-800); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }

/* ── Card wrapper ────────────────────────────────── */
.cal-card {
  background: var(--n-0); border-radius: var(--card-radius); border: var(--card-border);
  box-shadow: var(--card-shadow); overflow: hidden; flex: 1; min-height: 0;
}

/* ── Month (desktop) ─────────────────────────────── */
.month-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); height: 100%; }
.month-dow { padding: 9px 10px; font-size: 11px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--n-150); border-right: 1px solid var(--n-100); min-width: 0; }
.month-dow:last-of-type { border-right: none; }
.month-cell { min-height: 110px; padding: 8px 8px 6px; border-right: 1px solid var(--n-100); border-bottom: 1px solid var(--n-100); cursor: pointer; transition: background .1s; min-width: 0; overflow: hidden; }
.month-cell:hover { background: var(--n-50); }
.month-cell:nth-child(7n) { border-right: none; }
.month-cell.out { background: var(--n-50); }
.month-cell.out .cell-num { color: var(--n-300); }
.cell-num { font-size: 13px; font-weight: 500; color: var(--n-600); display: block; margin-bottom: 5px; }
.today-badge { background: var(--brand); color: #fff !important; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.cell-events { display: flex; flex-direction: column; gap: 3px; }
.event-pill { display: flex; align-items: center; gap: 5px; border-radius: 5px; padding: 3px 6px; overflow: hidden; }
.ep-bar { width: 3px; height: 14px; border-radius: 2px; flex-shrink: 0; }
.ep-text { font-size: 11px; font-weight: 500; color: var(--n-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.ep-time { font-size: 10px; color: var(--n-400); flex-shrink: 0; }
.ev-brand .ep-bar { background: var(--brand); }
.ev-brand { background: #fde8e2; }
.ev-teal  .ep-bar { background: #2ba58e; }
.ev-teal  { background: #e0f5f1; }
.ev-violet .ep-bar { background: #7c5cbf; }
.ev-violet { background: #ede8f8; }

/* ── Time grid (desktop Semana / Día) ────────────── */
.time-view { display: flex; flex-direction: column; }
.tv-head { display: flex; border-bottom: 1px solid var(--n-150); flex-shrink: 0; }
.tv-gutter { width: 52px; flex-shrink: 0; }
.tv-col-head { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px 4px 6px; gap: 3px; }
.tv-dow { font-size: 10px; font-weight: 600; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.05em; }
.tv-col-head.today-col-head .tv-dow { color: var(--brand); }
.tv-daynum { font-size: 18px; font-weight: 700; color: var(--n-700); line-height: 1; }
.tv-body { display: flex; overflow-y: auto; flex: 1; padding-top: 10px; }
.tv-times { width: 52px; flex-shrink: 0; }
.tv-time-slot { height: 64px; display: flex; align-items: flex-start; justify-content: flex-end; padding: 0 8px; }
.tv-time-label { font-size: 10px; color: var(--n-400); margin-top: -6px; }
.tv-time-slot:first-child .tv-time-label { margin-top: 0; }
.tv-cols { display: flex; flex: 1; overflow-x: auto; }
.tv-col { flex: 1; position: relative; border-left: 1px solid var(--n-100); min-width: 80px; }
.tv-col.today-col { background: rgba(239, 105, 72, 0.025); }
.tv-hour-cell { height: 64px; border-bottom: 1px solid var(--n-100); }
.event-block { position: absolute; left: 3px; right: 3px; border-radius: 6px; padding: 4px 7px; border-left: 3px solid transparent; overflow: hidden; cursor: pointer; transition: filter .12s; }
.event-block:hover { filter: brightness(.95); }
.event-block .eb-time  { font-size: 10px; font-weight: 600; display: block; }
.event-block .eb-title { font-size: 11px; font-weight: 500; color: var(--n-800); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-block .eb-lead  { font-size: 10px; color: var(--n-500); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.ev-brand.event-block { background: #fde8e2; border-left-color: var(--brand); }
.ev-brand.event-block .eb-time { color: var(--brand); }
.ev-teal.event-block  { background: #e0f5f1; border-left-color: #2ba58e; }
.ev-teal.event-block  .eb-time { color: #2ba58e; }
.ev-violet.event-block { background: #ede8f8; border-left-color: #7c5cbf; }
.ev-violet.event-block .eb-time { color: #7c5cbf; }
.has-lead { cursor: pointer; }

/* ═══════════════ MOBILE VIEWS ═══════════════════════ */

/* ── Mobile: multi-month scroll ─────────────────────── */
.mob-months-scroll {
  flex: 1; min-height: 0;
  overflow-y: auto;
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  -webkit-overflow-scrolling: touch;
}

.mob-month-block { padding-bottom: 8px; }

.mob-month-title {
  position: sticky; top: 0; z-index: 2;
  background: var(--n-0);
  padding: 14px 16px 8px;
  font-size: 15px; font-weight: 700; color: var(--n-700);
  text-transform: capitalize;
  border-bottom: 1px solid var(--n-100);
}
.mob-month-title--current { color: var(--n-700); }

.mob-month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.mob-dow {
  padding: 6px 0;
  text-align: center;
  font-size: 10px; font-weight: 600; color: var(--n-400);
  text-transform: uppercase; letter-spacing: 0.04em;
}

.mob-cell {
  min-height: 52px;
  padding: 5px 3px 4px;
  cursor: pointer;
  overflow: hidden;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  border-bottom: 1px solid var(--n-50);
}
.mob-cell:active { background: var(--n-50); }
.mob-cell--out .mob-cell-num { color: var(--n-400); }
.mob-cell--out { opacity: 1; pointer-events: none; }
.mob-cell--out .mob-pill { opacity: 0.45; }

.mob-cell-num {
  font-size: 13px; font-weight: 500; color: var(--n-700);
  width: 26px; height: 26px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}
/* today-badge already defined above, reused here */

.mob-cell-events {
  width: 100%;
  display: flex; flex-direction: column; gap: 2px;
  align-items: stretch;
  overflow: hidden;
}

/* Compact event pills for mobile month */
.mob-pill {
  display: flex; align-items: center; gap: 3px;
  border-radius: 4px; padding: 1px 4px;
  overflow: hidden; min-width: 0;
}
.epm-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.epm-text { font-size: 9px; font-weight: 500; color: var(--n-800); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mob-cell-more { font-size: 9px; color: var(--n-400); font-weight: 600; padding-left: 4px; }
.epm-brand { background: #fde8e2; }
.epm-brand .epm-dot { background: var(--brand); }
.epm-teal  { background: #e0f5f1; }
.epm-teal  .epm-dot { background: #2ba58e; }
.epm-violet { background: #ede8f8; }
.epm-violet .epm-dot { background: #7c5cbf; }

/* ── Mobile: agenda scroll (Día view) ──────────────── */
.mob-agenda-scroll {
  flex: 1; min-height: 0;
  overflow-y: auto;
  background: var(--n-0);
  border-radius: var(--card-radius);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  -webkit-overflow-scrolling: touch;
}

.ag-group {
  display: flex; align-items: flex-start;
  border-bottom: 1px solid var(--n-100);
  min-height: 56px;
}
.ag-group--today .ag-date-col { background: rgba(239, 105, 72, 0.04); }

/* Left: date column */
.ag-date-col {
  width: 52px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: 14px 0 10px;
  gap: 1px;
}
.ag-dow { font-size: 9px; font-weight: 700; color: var(--n-400); text-transform: uppercase; letter-spacing: 0.05em; }
.ag-num {
  font-size: 18px; font-weight: 700; color: var(--n-700); line-height: 1;
  width: 32px; height: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
}
/* today-badge reused for ag-num */
.ag-mon { font-size: 9px; color: var(--n-400); text-transform: uppercase; font-weight: 500; }

/* Right: events */
.ag-events-col {
  flex: 1;
  padding: 10px 14px 10px 10px;
  display: flex; flex-direction: column; gap: 6px;
  border-left: 1px solid var(--n-100);
}
.ag-no-events { font-size: 12px; color: var(--n-300); padding: 6px 0; }

.ag-event {
  border-radius: 8px; padding: 9px 10px;
  cursor: pointer; transition: filter .1s;
}
.ag-event:hover { filter: brightness(.96); }
.ag-ev-header { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 3px; }
.ag-ev-title { font-size: 13px; font-weight: 600; color: var(--n-800); }
.ag-ev-chevron { font-size: 10px; color: var(--n-400); }
.has-lead:hover .ag-ev-chevron { color: var(--brand); }
.ag-ev-meta { font-size: 11px; color: var(--n-500); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.ag-ev-sep { color: var(--n-300); }

/* Agenda event colors */
.ev-brand.ag-event { background: #fde8e2; border-left: 3px solid var(--brand); }
.ev-teal.ag-event  { background: #e0f5f1; border-left: 3px solid #2ba58e; }
.ev-violet.ag-event { background: #ede8f8; border-left: 3px solid #7c5cbf; }

/* ── Mobile toolbar ──────────────────────────────── */
@media (max-width: 480px) {
  .cal-toolbar { flex-wrap: wrap; gap: 6px; }
  .cal-nav     { flex: 1; }
  .cal-nav-right { width: 100%; justify-content: space-between; }
}

/* ── Modal form ──────────────────────────────────── */
.crear-form { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.form-row :deep(.p-inputtext),
.form-row :deep(.p-datepicker),
.form-row :deep(.p-textarea) { width: 100%; }
</style>
