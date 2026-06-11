<template>
  <div class="chats-view">

    <!-- ── Tabs + filtros ── -->
    <div class="chats-header">
      <div v-if="tabs.length" class="chats-tabs">
        <button
          v-for="t in tabs" :key="t"
          class="tab-btn" :class="{ active: activeTab === t }"
          @click="activeTab = t"
        >{{ t }}</button>
      </div>
      <div class="chats-actions">
        <!-- Leídos / No leídos -->
        <div class="lectura-pills">
          <button
            v-for="opt in lecturaOpts" :key="opt.value"
            class="lectura-pill" :class="{ active: filtroLectura === opt.value }"
            @click="filtroLectura = opt.value"
          >{{ opt.label }}</button>
        </div>
        <!-- Filtro país (manager + Mi equipo) -->
        <Select
          v-if="auth.currentRole === 'manager' && activeTab === 'Mi equipo'"
          v-model="paisFiltro"
          :options="['España','Francia','Italia','Alemania']"
          placeholder="País"
        >
          <template #value="{ value }">
            <span>País: {{ value || 'España' }}</span>
          </template>
        </Select>
      </div>
    </div>

    <!-- ── Lista de conversaciones ── -->
    <SectionCard>
      <div class="conv-list">
        <div
          v-for="c in displayedConvs" :key="c.id"
          class="conv-item"
          :class="{ 'conv-item--unread': c.noLeidos > 0 }"
          @click="openConv(c)"
        >
          <!-- Avatar -->
          <div class="conv-avatar">
            <span class="conv-initials">{{ c.iniciales }}</span>
            <span class="wa-badge"><i class="pi pi-whatsapp" /></span>
          </div>

          <!-- Contenido -->
          <div class="conv-body">
            <div class="conv-row-top">
              <span class="conv-name">{{ c.nombre }}</span>
              <span class="conv-time">{{ c.hora }}</span>
            </div>
            <div class="conv-row-bot">
              <span class="conv-preview" :class="{ 'conv-preview--unread': c.noLeidos > 0 }">{{ c.ultimoMensaje }}</span>
              <span v-if="c.noLeidos > 0" class="conv-badge">{{ c.noLeidos }}</span>
            </div>
            <div class="conv-meta">
              <Tag :value="c.estado" :severity="estadoSeverity(c.estado)" class="conv-tag" />
              <span v-if="c.agente && activeTab === 'Mi equipo'" class="conv-agente">
                <i class="pi pi-user" style="font-size:10px" /> {{ c.agente }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="displayedConvs.length === 0" class="conv-empty">
          <i class="pi pi-comments" style="font-size:28px;color:var(--n-300)" />
          <p>Sin conversaciones activas</p>
        </div>
      </div>
    </SectionCard>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import SectionCard from '@/components/ui/SectionCard.vue'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// ── Tabs según rol ──
const tabs = computed(() => {
  if (auth.currentRole === 'agente') return []
  return ['Mi equipo', 'Mis datos']
})
const activeTab = ref(tabs.value[0] ?? 'Mis datos')
const paisFiltro = ref('España')

// ── Filtro leídos / no leídos ──
const filtroLectura = ref<'todos' | 'noLeidos' | 'leidos'>('todos')
const lecturaOpts = [
  { value: 'todos',    label: 'Todos'      },
  { value: 'noLeidos', label: 'No leídos'  },
  { value: 'leidos',   label: 'Leídos'     },
]

// ── Mock conversations ──
interface Conv {
  id: string
  nombre: string
  iniciales: string
  ultimoMensaje: string
  hora: string
  noLeidos: number
  estado: string
  agente: string
  pais: string
  esMio: boolean
}

const mockConvs: Conv[] = [
  // ── No leídos ──────────────────────────────────────────────────────────────
  { id: '1',  nombre: 'Laura García',    iniciales: 'LG', ultimoMensaje: 'Perfecto, mañana lo confirmo',       hora: '10:42', noLeidos: 2, estado: 'Pendiente',   agente: 'Juan C.',  pais: 'España',   esMio: true  },
  { id: '3',  nombre: 'Sophie Martin',   iniciales: 'SM', ultimoMensaje: '¿Puedo cambiar la fecha de entrega?', hora: '09:53', noLeidos: 1, estado: 'Formulario',  agente: 'Juan C.',  pais: 'Francia',  esMio: true  },
  { id: '6',  nombre: 'Carmen López',    iniciales: 'CL', ultimoMensaje: '¿Tienen plan sin salmón?',            hora: 'Ayer',  noLeidos: 3, estado: 'Pendiente',   agente: 'Juan C.',  pais: 'España',   esMio: true  },
  { id: '11', nombre: 'Marco Bianchi',   iniciales: 'MB', ultimoMensaje: 'Hola, ¿sigue disponible la oferta?',  hora: 'Ayer',  noLeidos: 1, estado: 'No contesta', agente: 'Laura R.', pais: 'Italia',   esMio: false },
  { id: '12', nombre: 'Céline Dupont',   iniciales: 'CD', ultimoMensaje: 'Mi perro rechaza el plan estándar',   hora: 'Lun',   noLeidos: 2, estado: 'En cita',     agente: 'Ana S.',   pais: 'Francia',  esMio: false },
  // ── Leídos ─────────────────────────────────────────────────────────────────
  { id: '2',  nombre: 'Silvia Torres',   iniciales: 'ST', ultimoMensaje: 'Hola, recibí el pedido, todo bien',   hora: '09:10', noLeidos: 0, estado: 'Venta',       agente: 'Juan C.',  pais: 'España',   esMio: true  },
  { id: '7',  nombre: 'Roberto Gómez',   iniciales: 'RG', ultimoMensaje: 'Ok perfecto, hasta el lunes',         hora: '08:45', noLeidos: 0, estado: 'En cita',     agente: 'Juan C.',  pais: 'España',   esMio: true  },
  { id: '4',  nombre: 'Ana Rodríguez',   iniciales: 'AR', ultimoMensaje: 'El perro ya come mejor, gracias',     hora: 'Ayer',  noLeidos: 0, estado: 'Venta',       agente: 'Carlos D.', pais: 'España',  esMio: false },
  { id: '5',  nombre: 'Thomas Müller',   iniciales: 'TM', ultimoMensaje: 'No me interesa por ahora',            hora: 'Ayer',  noLeidos: 0, estado: 'No interesa', agente: 'Ana S.',   pais: 'Alemania', esMio: false },
  { id: '8',  nombre: 'Pierre Dubois',   iniciales: 'PD', ultimoMensaje: 'Confirmado, muchas gracias',          hora: 'Ayer',  noLeidos: 0, estado: 'Venta',       agente: 'Laura R.', pais: 'Francia',  esMio: false },
  { id: '9',  nombre: 'Isabel Fernández',iniciales: 'IF', ultimoMensaje: 'Llamadme esta tarde por favor',       hora: 'Lun',   noLeidos: 0, estado: 'No contesta', agente: 'Carlos D.', pais: 'España',  esMio: false },
  { id: '10', nombre: 'Franz Bauer',     iniciales: 'FB', ultimoMensaje: 'Entendido, lo pensaré esta semana',   hora: 'Lun',   noLeidos: 0, estado: 'Formulario',  agente: 'Ana S.',   pais: 'Alemania', esMio: false },
]

const displayedConvs = computed(() => {
  let list = mockConvs
  if (auth.currentRole === 'manager' && activeTab.value === 'Mi equipo') {
    list = list.filter(c => c.pais === paisFiltro.value)
  }
  if (auth.currentRole === 'agente' || activeTab.value === 'Mis datos') {
    list = list.filter(c => c.esMio)
  }
  if (filtroLectura.value === 'noLeidos') list = list.filter(c => c.noLeidos > 0)
  if (filtroLectura.value === 'leidos')   list = list.filter(c => c.noLeidos === 0)
  return list
})

function estadoSeverity(estado: string): string {
  if (estado.startsWith('No contesta')) return 'warn'
  const map: Record<string, string> = {
    'Pendiente':   'success',
    'No interesa': 'danger',
    'En cita':     'info',
    'Formulario':  'contrast',
    'Venta':       'success',
  }
  return map[estado] ?? 'secondary'
}

function openConv(c: Conv) {
  router.push(`/leads/${c.id}`)
}
</script>

<style scoped>
.chats-view { display: flex; flex-direction: column; gap: 16px; }

/* ── Header ── */
.chats-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; min-height: 36px; }
.chats-tabs   { display: flex; gap: 4px; }
.chats-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Leídos pills */
.lectura-pills { display: flex; gap: 2px; background: var(--n-100); border-radius: 8px; padding: 2px; }
.lectura-pill {
  padding: 4px 10px; border-radius: 6px; border: none; background: transparent;
  font-size: 12px; font-weight: 500; color: var(--n-500); cursor: pointer;
  transition: background .12s, color .12s; white-space: nowrap;
}
.lectura-pill:hover  { background: var(--n-0); color: var(--n-700); }
.lectura-pill.active { background: var(--n-0); color: var(--n-900); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.tab-btn {
  padding: 6px 14px; border-radius: 8px; border: none; background: transparent;
  font-size: 13px; font-weight: 500; color: var(--n-500); cursor: pointer;
  transition: background .15s, color .15s;
}
.tab-btn:hover  { background: var(--n-100); color: var(--n-700); }
.tab-btn.active { background: var(--n-100); color: var(--n-900); font-weight: 600; }

/* ── Lista ── */
.conv-list { display: flex; flex-direction: column; }

.conv-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 4px; border-bottom: 1px solid var(--n-100);
  cursor: pointer; border-radius: 8px;
  transition: background .12s;
}
.conv-item:last-child { border-bottom: none; }
.conv-item:hover { background: var(--n-50); }

/* Avatar */
.conv-avatar {
  position: relative; flex-shrink: 0;
  width: 42px; height: 42px; border-radius: 50%;
  background: var(--n-100);
  display: flex; align-items: center; justify-content: center;
}
.conv-initials {
  font-size: 14px; font-weight: 600; color: var(--n-600);
}
.wa-badge {
  position: absolute; bottom: -2px; right: -2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: #25D366; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; border: 2px solid #fff;
}

/* Cuerpo */
.conv-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.conv-row-top { display: flex; align-items: center; justify-content: space-between; gap: 6px; }

/* Leído: nombre tenue */
.conv-name { font-size: 13px; font-weight: 400; color: var(--n-500); }
.conv-time { font-size: 11px; color: var(--n-400); flex-shrink: 0; }

/* No leído: nombre destacado + hora verde */
.conv-item--unread .conv-name { font-weight: 700; color: var(--n-900); }
.conv-item--unread .conv-time { color: #25D366; font-weight: 600; }

.conv-row-bot { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.conv-preview {
  font-size: 12px; color: var(--n-400);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  flex: 1; min-width: 0;
}
.conv-preview--unread { color: var(--n-800); font-weight: 500; }
.conv-badge {
  flex-shrink: 0;
  min-width: 18px; height: 18px; border-radius: 9px;
  background: #25D366; color: #fff;
  font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}

.conv-meta { display: flex; align-items: center; gap: 8px; }
.conv-tag  { font-size: 10px !important; padding: 2px 6px !important; }
.conv-agente { font-size: 11px; color: var(--n-400); display: flex; align-items: center; gap: 3px; }

/* Vacío */
.conv-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 48px 0; color: var(--n-400); font-size: 13px;
}
</style>
