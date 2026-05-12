<template>
  <div class="cal-view">

    <!-- ── Toolbar ───────────────────────────────────── -->
    <div class="cal-toolbar">
      <div class="cal-nav">
        <button class="btn-hoy" @click="goToday">Hoy</button>
        <button class="btn-nav" @click="prev"><i class="pi pi-chevron-left" /></button>
        <button class="btn-nav" @click="next"><i class="pi pi-chevron-right" /></button>
        <span class="cal-label">{{ label }}</span>
      </div>
      <div class="cal-nav-right">
        <Button icon="pi pi-plus" label="Crear cita" size="small" @click="showModal = true" />
        <div class="vista-toggle">
          <button v-for="v in VISTAS" :key="v" class="vt-btn" :class="{ active: vista === v }" @click="vista = v">{{ v }}</button>
        </div>
      </div>
    </div>

    <!-- ── Mes ───────────────────────────────────────── -->
    <div v-if="vista === 'Mes'" class="cal-card">
      <div class="month-grid">
        <!-- Cabecera días — misma cuadrícula que las celdas -->
        <div v-for="d in DOW" :key="d" class="month-dow">{{ d }}</div>
        <!-- Celdas -->
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

    <!-- ── Semana ─────────────────────────────────────── -->
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
              class="event-block" :class="`ev-${ev.color}`"
              :style="evStyle(ev)"
            >
              <span class="eb-time">{{ fmtTime(ev.fecha) }}</span>
              <span class="eb-title">{{ ev.titulo }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Día ───────────────────────────────────────── -->
    <div v-else class="cal-card time-view">
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
              class="event-block" :class="`ev-${ev.color}`"
              :style="evStyle(ev)"
            >
              <span class="eb-time">{{ fmtTime(ev.fecha) }}</span>
              <span class="eb-title">{{ ev.titulo }}</span>
              <span class="eb-lead">{{ ev.lead }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- ── Modal crear cita ──────────────────────────── -->
  <CrearCitaModal v-model:visible="showModal" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import CrearCitaModal from '@/components/ui/CrearCitaModal.vue'

// ── Constants ──────────────────────────────────────────
const DOW    = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const HOURS  = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
const HOUR_H = 64   // px per hour in time grid
const H_START = 8   // first hour shown
const VISTAS = ['Día', 'Semana', 'Mes'] as const

// ── Types ──────────────────────────────────────────────
interface Cita {
  id: number
  titulo: string
  lead: string
  fecha: Date
  duracion: number   // minutes
  color: 'brand' | 'teal' | 'violet'
}

// ── Mock data ──────────────────────────────────────────
const mockCitas: Cita[] = [
  // Week of Apr 28 – May 4, 2026
  { id: 1,  titulo: 'Cita papá de Spike',        lead: 'Carlos García',   fecha: new Date(2026, 3, 28, 10,  0), duracion: 30,  color: 'brand'  },
  { id: 2,  titulo: 'Seguimiento Luna',           lead: 'María López',     fecha: new Date(2026, 3, 28, 14, 30), duracion: 45,  color: 'brand'  },
  { id: 3,  titulo: 'Demo Dogfy Diet',            lead: 'Juan Martínez',   fecha: new Date(2026, 3, 29, 11,  0), duracion: 60,  color: 'teal'   },
  { id: 4,  titulo: 'Cita perro Max',             lead: 'Ana Rodríguez',   fecha: new Date(2026, 3, 30,  9, 30), duracion: 30,  color: 'brand'  },
  { id: 5,  titulo: 'Llamada cierre venta',       lead: 'Pedro Sánchez',   fecha: new Date(2026, 3, 30, 16,  0), duracion: 30,  color: 'teal'   },
  { id: 6,  titulo: 'Nueva mascota Coco',         lead: 'Sofía Moreno',    fecha: new Date(2026, 4,  1, 10,  0), duracion: 45,  color: 'brand'  },
  { id: 7,  titulo: 'Revisión plan nutricional',  lead: 'Roberto Díaz',    fecha: new Date(2026, 4,  2, 15,  0), duracion: 30,  color: 'violet' },
  // More dates for month view
  { id: 8,  titulo: 'Seguimiento Bruno',          lead: 'Laura Torres',    fecha: new Date(2026, 4,  5, 11,  0), duracion: 30,  color: 'brand'  },
  { id: 9,  titulo: 'Cierre venta premium',       lead: 'Miguel Ruiz',     fecha: new Date(2026, 4,  7, 15,  0), duracion: 60,  color: 'teal'   },
  { id: 10, titulo: 'Cita familia López',         lead: 'Carmen López',    fecha: new Date(2026, 4, 12, 10,  0), duracion: 30,  color: 'brand'  },
  { id: 11, titulo: 'Demo pack senior',           lead: 'Isabel Gómez',    fecha: new Date(2026, 4, 14,  9,  0), duracion: 45,  color: 'violet' },
  { id: 12, titulo: 'Seguimiento Nala',           lead: 'David Fernández', fecha: new Date(2026, 4, 19, 11, 30), duracion: 30,  color: 'brand'  },
  { id: 13, titulo: 'Cita nueva cliente',         lead: 'Pilar Castro',    fecha: new Date(2026, 4, 21, 14,  0), duracion: 30,  color: 'teal'   },
  { id: 14, titulo: 'Cierre perro Rocky',         lead: 'Antonio Ruiz',    fecha: new Date(2026, 4, 26, 10,  0), duracion: 60,  color: 'brand'  },
]

// ── State ──────────────────────────────────────────────
const vista      = ref<typeof VISTAS[number]>('Mes')
const currentDate = ref(new Date(2026, 3, 28))  // Apr 28
const showModal = ref(false)

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

function fmtTime(d: Date) {
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const TODAY = new Date(2026, 3, 28)

// ── Computed ───────────────────────────────────────────
const label = computed(() => {
  if (vista.value === 'Mes') {
    return currentDate.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }
  if (vista.value === 'Semana') {
    const mon = getMondayOfWeek(currentDate.value)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const s1 = mon.toLocaleDateString('es-ES', opts)
    const s2 = sun.toLocaleDateString('es-ES', opts)
    return `${s1} – ${s2} ${sun.getFullYear()}`
  }
  return currentDate.value.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
})


const calDays = computed(() => {
  const y  = currentDate.value.getFullYear()
  const mo = currentDate.value.getMonth()
  const start = getMondayOfWeek(new Date(y, mo, 1))
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return {
      date: d,
      iso: d.toISOString(),
      inMonth: d.getMonth() === mo,
      isToday: isSameDay(d, TODAY),
      events: mockCitas.filter(c => isSameDay(c.fecha, d)),
    }
  })
})

const weekDays = computed(() => {
  const mon = getMondayOfWeek(currentDate.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return { date: d, iso: d.toISOString(), isToday: isSameDay(d, TODAY), events: mockCitas.filter(c => isSameDay(c.fecha, d)) }
  })
})

const dayEvents = computed(() =>
  mockCitas.filter(c => isSameDay(c.fecha, currentDate.value))
)

// ── Navigation ─────────────────────────────────────────
function goToday()  { currentDate.value = new Date(TODAY) }
function gotoDay(d: Date) { currentDate.value = new Date(d); vista.value = 'Día' }

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

// ── Event positioning ──────────────────────────────────
function evStyle(ev: Cita) {
  const h = ev.fecha.getHours() - H_START
  const m = ev.fecha.getMinutes()
  const top    = h * HOUR_H + (m / 60) * HOUR_H
  const height = Math.max(24, (ev.duracion / 60) * HOUR_H - 2)
  return { top: `${top}px`, height: `${height}px` }
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────── */
.cal-view { display: flex; flex-direction: column; gap: 12px; height: 100%; }

/* ── Toolbar ─────────────────────────────────────── */
.cal-toolbar { display: flex; align-items: center; justify-content: space-between; }
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

/* ── Month — un único grid para header + celdas ──── */
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  height: 100%;
}

/* Header row — primeras 7 celdas del grid */
.month-dow {
  padding: 9px 10px;
  font-size: 11px; font-weight: 600; color: var(--n-400);
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid var(--n-150);
  border-right: 1px solid var(--n-100);
  min-width: 0;
}
.month-dow:last-of-type { border-right: none; }

/* Celdas de días */
.month-cell {
  min-height: 110px; padding: 8px 8px 6px;
  border-right: 1px solid var(--n-100); border-bottom: 1px solid var(--n-100);
  cursor: pointer; transition: background .1s; min-width: 0; overflow: hidden;
}
.month-cell:hover { background: var(--n-50); }
.month-cell:nth-child(7n) { border-right: none; }
.month-cell.out { background: var(--n-50); }
.month-cell.out .cell-num { color: var(--n-300); }

.cell-num { font-size: 13px; font-weight: 500; color: var(--n-600); display: block; margin-bottom: 5px; }
.today-badge {
  background: var(--brand); color: #fff !important;
  width: 24px; height: 24px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}

/* Event pills – month */
.cell-events { display: flex; flex-direction: column; gap: 3px; }
.event-pill { display: flex; align-items: center; gap: 5px; border-radius: 5px; padding: 3px 6px; overflow: hidden; }
.ep-bar { width: 3px; height: 14px; border-radius: 2px; flex-shrink: 0; }
.ep-text { font-size: 11px; font-weight: 500; color: var(--n-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.ep-time { font-size: 10px; color: var(--n-400); flex-shrink: 0; }

/* color variants */
.ev-brand .ep-bar { background: var(--brand, #ef6948); }
.ev-brand { background: #fde8e2; }
.ev-teal  .ep-bar { background: #2ba58e; }
.ev-teal  { background: #e0f5f1; }
.ev-violet .ep-bar { background: #7c5cbf; }
.ev-violet { background: #ede8f8; }

/* ── Time grid (Semana / Día) ────────────────────── */
.time-view { display: flex; flex-direction: column; }

.tv-head { display: flex; border-bottom: 1px solid var(--n-150); flex-shrink: 0; }
.tv-gutter { width: 52px; flex-shrink: 0; }
.tv-col-head { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 8px 4px 6px; gap: 3px; }
.tv-col-head.today-col-head { color: var(--brand); }
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

/* Event blocks – time view */
.event-block {
  position: absolute; left: 3px; right: 3px;
  border-radius: 6px; padding: 4px 7px;
  border-left: 3px solid transparent;
  overflow: hidden; cursor: pointer; transition: filter .12s;
}
.event-block:hover { filter: brightness(.95); }
.event-block .eb-time  { font-size: 10px; font-weight: 600; display: block; }
.event-block .eb-title { font-size: 11px; font-weight: 500; color: var(--n-800); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.event-block .eb-lead  { font-size: 10px; color: var(--n-500); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }

.ev-brand.event-block { background: #fde8e2; border-left-color: var(--brand, #ef6948); }
.ev-brand.event-block .eb-time { color: var(--brand, #ef6948); }
.ev-teal.event-block  { background: #e0f5f1; border-left-color: #2ba58e; }
.ev-teal.event-block  .eb-time { color: #2ba58e; }
.ev-violet.event-block { background: #ede8f8; border-left-color: #7c5cbf; }
.ev-violet.event-block  .eb-time { color: #7c5cbf; }

/* ── Modal form ──────────────────────────────────── */
.crear-form { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--n-600); }
.form-row :deep(.p-inputtext),
.form-row :deep(.p-datepicker),
.form-row :deep(.p-textarea) { width: 100%; }
</style>
