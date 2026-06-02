<template>
  <div class="leads-view">
    <div v-if="tabs.length" class="leads-header">
      <div class="leads-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab-btn"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>
      <div class="leads-actions">
        <Select
          v-if="role === 'manager' && activeTab === 'Mi equipo'"
          v-model="paisFiltro"
          :options="['España','Francia','Italia','Alemania']"
          placeholder="Pais"
        >
          <template #value="{ value }">
            <span>Pais: {{ value || 'España' }}</span>
          </template>
        </Select>
      </div>
    </div>

    <SectionCard>
      <div class="section-toolbar">
        <!-- "+ Quiero leads" se trasladó al FAB SpeedDial -->
        <Button v-if="showTeamActions" label="Listas de difusión" icon="pi pi-comments" severity="secondary" outlined size="small" @click="showLista = true" />
        <Button v-if="showTeamActions" label="+ Asignar leads" size="small" @click="auth.showAsignarLeads = true" />
        <span class="spacer" />
        <!-- Chip filtro por estado (desde dashboard) -->
        <span v-if="estadoFiltro" class="filter-chip">
          {{ estadoFiltro }}
          <button class="filter-chip-clear" @click="router.replace({ path: '/leads' })" aria-label="Quitar filtro">
            <i class="pi pi-times" />
          </button>
        </span>
        <!-- Chips filtros del panel -->
        <FiltrosChips v-model="filtrosActivos" />
        <Button
          label="Filtros"
          icon="pi pi-filter"
          severity="secondary"
          :outlined="!filtrosActivos || !hasFiltrosActivos"
          size="small"
          :badge="filtrosBadge || undefined"
          @click="showFiltros = true"
        />
      </div>

      <DataTable
        :value="displayed"
        stripedRows
        class="leads-table"
        :selection="showMiEquipoColumns ? selected : undefined"
        @update:selection="selected = $event"
        :data-key="showMiEquipoColumns ? 'id' : undefined"
        @row-click="goToLead"
      >
        <Column v-if="showMiEquipoColumns" selectionMode="multiple" headerStyle="width:28px;padding-right:0" bodyStyle="width:28px;padding-right:0" />
        <Column v-if="showMiEquipoColumns" header="Agente" headerStyle="padding-left:6px" bodyStyle="padding-left:6px" style="min-width:84px">
          <template #body="{ data }">
            <span class="agente-cell" :title="data.agente">
              <span class="agente-avatar" aria-hidden="true">
                <img v-if="data.avatar" :src="data.avatar" :alt="data.agente" />
                <i v-else class="pi pi-user" />
              </span>
              <span class="agente-iniciales">{{ data.agenteIni }}</span>
            </span>
          </template>
        </Column>
        <Column field="estado" header="Estado" sortable style="min-width:130px">
          <template #body="{ data }">
            <Tag :value="data.estado" :severity="estadoSeverity(data.estado)" :class="{ 'tag-formulario': data.estado === 'Formulario' }" />
          </template>
        </Column>
        <Column field="telefono" header="Teléfono" style="min-width:120px" />
        <Column field="email" header="Email" style="min-width:240px" />
        <Column field="cupon" header="Cupón" sortable style="min-width:120px" />
        <Column field="campana" header="Campaña" sortable style="min-width:140px" />
        <Column v-if="showMiEquipoColumns" field="grDia" header="Gr/día" style="min-width:80px" />
        <Column v-if="showMiEquipoColumns" field="importe" header="Importe" style="min-width:90px" />
        <Column header="" headerStyle="width:28px;padding:0" bodyStyle="width:28px;padding:0;text-align:center">
          <template #body="{ data }">
            <i v-if="data.errorPago" class="pi pi-exclamation-circle error-icon" title="Error de pago" />
          </template>
        </Column>
      </DataTable>

      <div ref="sentinel" class="infinite-sentinel">
        <span v-if="hasMore" class="infinite-loading">Cargando más leads…</span>
      </div>
    </SectionCard>
  </div>

  <!-- Modal crear lead -->
  <CrearLeadModal v-model:visible="auth.showCrearLead" />

  <!-- AsignarLeadsModal vive globalmente en AppHeader (v-model:visible="auth.showAsignarLeads") -->

  <!-- Panel filtros -->
  <FiltrosPanel v-model:visible="showFiltros" modo="leads" @apply="onFiltrosAplicados" />

  <!-- Modal Lista de difusión -->
  <Dialog
    v-model:visible="showLista"
    modal
    dismissableMask
    :style="{ width: '540px' }"
    :pt="{ header: { style: 'padding: 20px 24px 0' }, content: { style: 'padding: 0 24px 24px' }, footer: { style: 'padding: 0 24px 20px' } }"
  >
    <template #header>
      <div class="lista-dialog-header">
        <div class="lista-dialog-icon"><i class="pi pi-comments" /></div>
        <div>
          <p class="lista-dialog-title">Nueva lista de difusión</p>
          <p class="lista-dialog-sub">Los mensajes se enviarán por WhatsApp</p>
        </div>
      </div>
    </template>

    <div class="lista-body">
      <!-- Nombre -->
      <div class="lista-group">
        <label class="lista-label">Nombre de la lista</label>
        <InputText v-model="nuevaLista.nombre" placeholder="p.ej. Recuperación mayo 2026" style="width:100%" />
      </div>

      <!-- Mensaje -->
      <div class="lista-group">
        <div class="lista-label-row">
          <label class="lista-label">Mensaje</label>
          <span class="lista-char-count" :class="{ 'lista-char-count--warn': nuevaLista.mensaje.length > 900 }">
            {{ nuevaLista.mensaje.length }}/1000
          </span>
        </div>
        <div class="lista-templates">
          <button
            v-for="tpl in listaTplNames"
            :key="tpl.label"
            class="lista-tpl-chip"
            @click="nuevaLista.mensaje = tpl.texto"
          >{{ tpl.label }}</button>
        </div>
        <Textarea
          v-model="nuevaLista.mensaje"
          :maxlength="1000"
          :autoResize="true"
          :rows="4"
          placeholder="Escribe el mensaje que recibirán los leads…"
          style="width:100%; resize:none"
        />
      </div>

      <!-- Preview WhatsApp -->
      <Transition name="lista-fade">
        <div v-if="nuevaLista.mensaje.trim()" class="wa-preview-wrap">
          <p class="wa-preview-label"><i class="pi pi-whatsapp" /> Vista previa</p>
          <div class="wa-preview-screen">
            <div class="wa-bubble-out">
              <span class="wa-bubble-text">{{ nuevaLista.mensaje }}</span>
              <span class="wa-bubble-time">{{ listaNow }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Destinatarios -->
      <div class="lista-group lista-group--dest">
        <label class="lista-label">Destinatarios</label>
        <div v-if="selected.length" class="dest-chips-wrap">
          <span v-for="l in selected.slice(0, 5)" :key="l.id" class="dest-chip">
            <span class="dest-ini">{{ l.nombre.split(' ').map((w: string) => w[0]).slice(0, 2).join('') }}</span>
            <span class="dest-name">{{ l.nombre.split(' ')[0] }}</span>
          </span>
          <span v-if="selected.length > 5" class="dest-more">+{{ selected.length - 5 }} más</span>
          <span class="dest-total">{{ selected.length }} leads</span>
        </div>
        <div v-else class="dest-empty">
          <i class="pi pi-info-circle" />
          Selecciona leads en la tabla antes de crear la lista
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" severity="secondary" outlined @click="showLista = false" />
      <Button
        label="Enviar lista"
        icon="pi pi-send"
        :disabled="!nuevaLista.nombre.trim() || !nuevaLista.mensaje.trim() || !selected.length"
        @click="showLista = false"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import SectionCard from '@/components/ui/SectionCard.vue'
import CrearLeadModal from '@/components/leads/CrearLeadModal.vue'
import FiltrosPanel from '@/components/ui/FiltrosPanel.vue'
import FiltrosChips from '@/components/ui/FiltrosChips.vue'
import type { FiltrosValue } from '@/components/ui/FiltrosPanel.vue'
import { mockLeads } from '@/data/mock'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()
const auth = useAuthStore()
const role = computed(() => auth.currentRole)

// Filtro de estado pre-aplicado desde query param (?estado=Pendientes)
const estadoFiltro = computed(() => (route.query.estado as string) || '')

// Tabs por rol — agente no tiene tabs; team_lead/manager tienen Personal + Mi equipo
const tabs = computed<string[]>(() =>
  role.value === 'agente' ? [] : ['Personal', 'Mi equipo']
)
const activeTab = ref<string>('Personal')
watch(role, () => { activeTab.value = role.value === 'agente' ? 'Personal' : 'Personal' }, { immediate: true })

// Acciones de equipo (Listas de difusión, Asignar leads, selección): fijas para
// team_lead/manager en ambas pestañas. Las columnas extendidas (checkbox, Agente,
// Gr/día, Importe) solo aparecen en "Mi equipo".
const showTeamActions = computed(() => role.value !== 'agente')
const showMiEquipoColumns = computed(() =>
  role.value !== 'agente' && activeTab.value === 'Mi equipo'
)

const paisFiltro = ref<string>('España')

// Panel filtros — declarados ANTES de filtered para evitar temporal dead zone
const showFiltros = ref(false)
const filtrosActivos = ref<FiltrosValue | null>(null)

// Datos según vista:
// - Agente o tab "Personal": solo MIS leads (drip-feed: 1 Pendiente arriba)
// - "Mi equipo": leads de todo el equipo (todos)
// - Manager Mi equipo: filtrado por país
const filtered = computed(() => {
  let list = !showMiEquipoColumns.value
    ? mockLeads.slice(0, 18)
    : role.value === 'manager'
      ? mockLeads.filter(l => l.pais === paisFiltro.value)
      : mockLeads

  // Filtro por estado desde query param (dashboard → leads)
  if (estadoFiltro.value) {
    const q = estadoFiltro.value.toLowerCase()
    list = list.filter(l => l.estado.toLowerCase().includes(q))
  }
  // Filtros del panel lateral
  const f = filtrosActivos.value
  if (f) {
    if (f.estados.length)
      list = list.filter(l => f.estados.some(e => l.estado.toLowerCase().includes(e.toLowerCase())))
    if (f.campana)
      list = list.filter(l => l.campana === f.campana)
    if (f.cupon)
      list = list.filter(l => (l.cupon ?? '').toLowerCase().includes(f.cupon.toLowerCase()))
  }
  return list
})

const { displayed, sentinel, hasMore } = useInfiniteScroll(filtered, 20)

const showLista = ref(false)
// showAsignar removido — ahora se usa auth.showAsignarLeads (global desde AppHeader)
const selected = ref<typeof mockLeads>([])
const nuevaLista = ref({ nombre: '', mensaje: '' })

const listaTplNames = [
  { label: 'Recuperación', texto: '¡Hola! Te escribimos desde Dogfy para recordarte que tienes un plan de alimentación pendiente para tu mascota. ¿Podemos ayudarte a retomarlo? 🐾' },
  { label: 'Seguimiento',  texto: 'Hola, ¿cómo estás? Hace unos días hablamos sobre la nutrición de tu perro. ¿Tienes alguna duda que podamos resolver?' },
  { label: 'Oferta',       texto: '🎉 ¡Tenemos una oferta especial para ti! Esta semana puedes empezar el plan de alimentación de Dogfy con un descuento exclusivo. ¿Te interesa?' },
]

const listaNow = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

function onFiltrosAplicados(f: FiltrosValue) {
  filtrosActivos.value = f
}

const hasFiltrosActivos = computed(() => {
  const f = filtrosActivos.value
  if (!f) return false
  return f.estados.length > 0 || f.planes.length > 0 || !!f.campana || !!f.cupon
})

const filtrosBadge = computed(() => {
  const f = filtrosActivos.value
  if (!f) return ''
  let c = 0
  if (f.estados.length) c++
  if (f.campana) c++
  if (f.cupon) c++
  return c > 0 ? String(c) : ''
})

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

function goToLead(event: { data: { id: string } }) {
  router.push(`/leads/${event.data.id}`)
}

</script>

<style scoped>
.leads-view { display: flex; flex-direction: column; gap: 16px; }
.leads-header { display: flex; align-items: center; justify-content: space-between; min-height: 36px; }
.leads-tabs { display: flex; gap: 4px; }
.leads-actions { display: flex; gap: 8px; align-items: center; }
.tab-btn { background: none; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--color-neutral-dark); }
.tab-btn.active { background: var(--color-brand-primary-light); color: var(--color-brand-primary); font-weight: 600; }
.section-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.section-toolbar .spacer { flex: 1; }
.error-icon { color: var(--color-error-dark); font-size: 14px; }
.crear-form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 12px; font-weight: 500; color: var(--color-neutral-dark); }
.form-row .p-inputtext,
.form-row .p-select { width: 100%; }
.form-row .hint { font-size: 12px; color: var(--n-400, #888); }
.form-row .req { color: var(--brand, #ef6948); }
.crear-lead-header { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.crear-lead-header .pi { font-size: 14px; }
.tel-input { display: flex; gap: 6px; }
.tel-input .tel-prefix { width: 76px; flex-shrink: 0; }
.tel-input .tel-number { flex: 1; }
.agente-cell { display: inline-flex; align-items: center; gap: 8px; cursor: help; }
.agente-avatar { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: #e6eaf2; color: #6b7280; overflow: hidden; flex-shrink: 0; }
.agente-avatar img { width: 100%; height: 100%; object-fit: cover; }
.agente-avatar .pi-user { font-size: 13px; }
.agente-iniciales { font-size: 12px; font-weight: 600; color: var(--n-700, #333); }
.infinite-sentinel { height: 32px; display: flex; align-items: center; justify-content: center; }
.infinite-loading { font-size: 12px; color: var(--n-400); }

:deep(.tag-formulario) { background: #ede9fe; color: #6d28d9; }

/* ── Lista de difusión modal ──────────────────────── */
.lista-dialog-header { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--n-100); margin-bottom: 20px; }
.lista-dialog-icon { width: 40px; height: 40px; border-radius: 50%; background: #ecf9f1; color: #25d366; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.lista-dialog-title { font-size: 15px; font-weight: 700; color: var(--n-900); }
.lista-dialog-sub { font-size: 12px; color: var(--n-400); margin-top: 2px; }

.lista-body { display: flex; flex-direction: column; gap: 18px; }
.lista-group { display: flex; flex-direction: column; gap: 6px; }
.lista-label { font-size: 12px; font-weight: 600; color: var(--n-700); }
.lista-label-row { display: flex; align-items: center; justify-content: space-between; }
.lista-char-count { font-size: 11px; color: var(--n-400); }
.lista-char-count--warn { color: var(--error); }

.lista-templates { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
.lista-tpl-chip {
  background: var(--brand-subtle, #fdf1ed); color: var(--brand); border: 1px solid #f5c5b4;
  border-radius: 99px; padding: 3px 10px; font-size: 11px; font-weight: 500;
  cursor: pointer; transition: background .12s;
}
.lista-tpl-chip:hover { background: #fae3da; }

/* WhatsApp preview */
.wa-preview-wrap { background: #f0f0f0; border-radius: 12px; overflow: hidden; }
.wa-preview-label { font-size: 11px; font-weight: 600; color: #25d366; padding: 10px 14px 6px; display: flex; align-items: center; gap: 5px; }
.wa-preview-label .pi { font-size: 12px; }
.wa-preview-screen { background: #e5ddd5; padding: 12px 14px 14px; display: flex; justify-content: flex-end; }
.wa-bubble-out { max-width: 80%; background: #dcf8c6; border-radius: 12px 2px 12px 12px; padding: 8px 12px 6px; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,.1); }
.wa-bubble-text { font-size: 13px; color: #111; line-height: 1.5; word-break: break-word; display: block; }
.wa-bubble-time { font-size: 10px; color: #667781; display: block; text-align: right; margin-top: 4px; }

/* Destinatarios */
.lista-group--dest { padding: 14px; background: var(--n-50); border-radius: 10px; border: 1px solid var(--n-150); }
.dest-chips-wrap { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.dest-chip { display: inline-flex; align-items: center; gap: 5px; background: var(--n-0); border: 1px solid var(--n-200); border-radius: 99px; padding: 3px 10px 3px 6px; font-size: 12px; }
.dest-ini { width: 20px; height: 20px; border-radius: 50%; background: var(--brand-subtle); color: var(--brand); font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.dest-name { color: var(--n-700); font-weight: 500; }
.dest-more { font-size: 12px; color: var(--n-500); padding: 3px 8px; background: var(--n-100); border-radius: 99px; }
.dest-total { margin-left: auto; font-size: 12px; font-weight: 600; color: var(--n-600); }
.dest-empty { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--n-400); }
.dest-empty .pi { color: var(--n-300); }

/* Fade transition for preview */
.lista-fade-enter-active, .lista-fade-leave-active { transition: opacity .2s, transform .2s; }
.lista-fade-enter-from, .lista-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* Chip de filtro activo */
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fdf1ed;
  color: var(--brand);
  border: 1px solid #f5c5b4;
  border-radius: 99px;
  padding: 2px 8px 2px 10px;
  font-size: 12px;
  font-weight: 600;
}
.filter-chip-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--brand);
  opacity: 0.7;
  transition: opacity 0.12s;
}
.filter-chip-clear:hover { opacity: 1; }
.filter-chip-clear .pi { font-size: 9px; }
</style>
