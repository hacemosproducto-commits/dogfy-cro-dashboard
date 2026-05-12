<template>
  <div class="notif-view">
    <div class="notif-header">
      <h2 class="view-title">Notificaciones</h2>
      <button class="mark-all-btn" @click="marcarTodasLeidas">Marcar todas como leídas</button>
    </div>
    <div class="notif-filters">
      <button v-for="f in filtros" :key="f" class="tab-btn" :class="{ active: filtroActivo === f }" @click="filtroActivo = f">
        {{ f }}
        <span v-if="conteo[f]" class="tab-badge">{{ conteo[f] }}</span>
      </button>
    </div>
    <SectionCard>
      <div class="notif-feed">
        <div
          v-for="n in notificacionesFiltradas"
          :key="n.id"
          class="nf-item"
          :class="{ 'nf-item--unread': !n.leida }"
          @click="n.leida = true"
        >
          <div class="nf-icon" :class="[`nf-icon--${n.tipo}`, { 'nf-icon--read': n.leida }]">
            <i :class="iconMap[n.tipo]" />
          </div>
          <div class="nf-content">
            <p class="nf-texto">{{ n.texto }}</p>
            <p class="nf-fecha">{{ n.fecha }}</p>
          </div>
          <div class="nf-right">
            <span v-if="!n.leida" class="nf-unread-dot" />
            <Tag :value="tagLabel[n.tipo]" :severity="tagSeverity[n.tipo]" size="small" />
          </div>
        </div>
        <p v-if="!notificacionesFiltradas.length" class="nf-empty">No hay notificaciones en esta categoría.</p>
      </div>
    </SectionCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tag from 'primevue/tag'
import SectionCard from '@/components/ui/SectionCard.vue'

type TipoNotif = 'chat' | 'cita' | 'recordatorio' | 'error'

interface Notif {
  id: number
  tipo: TipoNotif
  texto: string
  fecha: string
  leida: boolean
}

const filtros = ['Todos', 'Chats', 'Citas', 'Recordatorios', 'Alertas de pago']
const filtroActivo = ref('Todos')

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
  error:        'Pago',
}

const tagSeverity: Record<TipoNotif, string> = {
  chat:         'success',
  cita:         'info',
  recordatorio: 'secondary',
  error:        'danger',
}

const filtroMap: Record<string, TipoNotif | null> = {
  'Todos':           null,
  'Chats':           'chat',
  'Citas':           'cita',
  'Recordatorios':   'recordatorio',
  'Alertas de pago': 'error',
}

const notificaciones = ref<Notif[]>([
  { id: 1,  tipo: 'chat',         texto: 'María García te ha enviado un mensaje por WhatsApp',           fecha: 'Hoy · 10:00',        leida: false },
  { id: 2,  tipo: 'cita',         texto: 'Cita confirmada con el papá de Spike para el martes 18',       fecha: 'Hoy · 09:55',        leida: false },
  { id: 3,  tipo: 'error',        texto: 'Error de pago detectado — Lead #4 · insufficient_funds',       fecha: 'Hoy · 09:30',        leida: false },
  { id: 4,  tipo: 'recordatorio', texto: 'Avisar renovación a Carlos García antes de las 12:00',         fecha: 'Hoy · 09:15',        leida: false },
  { id: 5,  tipo: 'chat',         texto: 'Carlos López ha respondido a tu mensaje',                      fecha: 'Hoy · 09:00',        leida: false },
  { id: 6,  tipo: 'error',        texto: 'Error de pago — Lead #11 · card_declined · 3 intentos',       fecha: 'Hoy · 08:47',        leida: false },
  { id: 7,  tipo: 'cita',         texto: 'Recordatorio: cita con Ana Soto en 30 minutos',                fecha: 'Hoy · 08:30',        leida: true  },
  { id: 8,  tipo: 'recordatorio', texto: 'Seguimiento post-venta pendiente — Spike Premium',             fecha: 'Hoy · 08:00',        leida: true  },
  { id: 9,  tipo: 'chat',         texto: 'Nuevo mensaje de Laura Martínez — lleva 2h sin respuesta',     fecha: 'Ayer · 19:42',       leida: true  },
  { id: 10, tipo: 'cita',         texto: 'Cita cancelada por el cliente — Beatriz Ruiz (martes 18)',     fecha: 'Ayer · 18:10',       leida: true  },
  { id: 11, tipo: 'error',        texto: 'Error de pago resuelto — Lead #7 · marcado como gestionado',  fecha: 'Ayer · 17:55',       leida: true  },
  { id: 12, tipo: 'recordatorio', texto: 'Enviar presupuesto Plan B a Ana Soto',                         fecha: 'Ayer · 16:30',       leida: true  },
  { id: 13, tipo: 'chat',         texto: 'Pedro Jiménez ha leído tu mensaje pero no ha respondido',      fecha: 'Ayer · 15:00',       leida: true  },
  { id: 14, tipo: 'cita',         texto: 'Nueva cita creada con la mamá de Rocky — jue 20 a las 11:00', fecha: 'Ayer · 13:20',       leida: true  },
  { id: 15, tipo: 'error',        texto: 'Error de pago detectado — Lead #23 · do_not_honor',           fecha: 'Ayer · 11:05',       leida: true  },
  { id: 16, tipo: 'recordatorio', texto: 'Llamar a cliente VIP antes del mediodía — prioridad alta',    fecha: 'Lun 16 feb · 10:00', leida: true  },
  { id: 17, tipo: 'chat',         texto: 'Sofía Castro pregunta por el estado de su pedido',             fecha: 'Lun 16 feb · 09:30', leida: true  },
  { id: 18, tipo: 'cita',         texto: 'Cita reprogramada — Pablo Moreno de lunes a miércoles 19',    fecha: 'Lun 16 feb · 08:55', leida: true  },
  { id: 19, tipo: 'error',        texto: 'Error de pago — Lead #31 · expired_card · requiere acción',   fecha: 'Lun 16 feb · 08:15', leida: true  },
  { id: 20, tipo: 'recordatorio', texto: 'Renovación pendiente — contrato Lead #8 vence esta semana',   fecha: 'Lun 16 feb · 08:00', leida: true  },
])

const notificacionesFiltradas = computed(() => {
  const tipo = filtroMap[filtroActivo.value]
  if (!tipo) return notificaciones.value
  return notificaciones.value.filter(n => n.tipo === tipo)
})

const conteo = computed((): Record<string, number> => {
  const unread = notificaciones.value.filter(n => !n.leida)
  return {
    'Todos':           unread.length,
    'Chats':           unread.filter(n => n.tipo === 'chat').length,
    'Citas':           unread.filter(n => n.tipo === 'cita').length,
    'Recordatorios':   unread.filter(n => n.tipo === 'recordatorio').length,
    'Alertas de pago': unread.filter(n => n.tipo === 'error').length,
  }
})

function marcarTodasLeidas() {
  notificaciones.value.forEach(n => n.leida = true)
}
</script>

<style scoped>
.notif-view { display: flex; flex-direction: column; gap: 16px; }

.notif-header { display: flex; align-items: center; justify-content: space-between; }
.view-title { font-size: 20px; font-weight: 700; }
.mark-all-btn { font-size: 12px; color: var(--color-brand-primary); background: none; border: none; cursor: pointer; font-weight: 500; }
.mark-all-btn:hover { text-decoration: underline; }

/* Filtros */
.notif-filters { display: flex; gap: 4px; }
.tab-btn { background: none; border: none; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--color-neutral-dark); display: inline-flex; align-items: center; gap: 6px; }
.tab-btn.active { background: var(--color-brand-primary-light); color: var(--color-brand-primary); font-weight: 600; }
.tab-badge { font-size: 10px; font-weight: 700; background: var(--color-brand-primary); color: #fff; border-radius: 10px; padding: 1px 6px; line-height: 1.4; }

/* Feed */
.notif-feed { display: flex; flex-direction: column; }
.nf-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 8px; border-bottom: 1px solid var(--n-100, #f3f4f6);
  cursor: pointer; border-radius: 8px; transition: background 0.1s;
}
.nf-item:last-child { border-bottom: none; }
.nf-item:hover { background: var(--n-50, #f9fafb); }
.nf-item--unread .nf-texto { font-weight: 600; color: var(--n-900); }

.nf-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; }

/* No leída: círculo de color */
.nf-icon--chat        { background: #ecf9f1; color: #0aaa46; }
.nf-icon--cita        { background: var(--n-100, #f3f4f6); color: var(--n-500, #6b7280); }
.nf-icon--error       { background: var(--color-error-light, #fee2e2); color: var(--color-error-dark, #dc2626); }
.nf-icon--recordatorio{ background: #eff6ff; color: #3b82f6; }

/* Leída: sin círculo, icono en gris neutro */
.nf-icon--read { background: transparent !important; color: var(--n-300, #d1d5db) !important; }

.nf-content { flex: 1; min-width: 0; }
.nf-texto { font-size: 13px; color: var(--n-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nf-fecha { font-size: 11px; color: var(--n-400); margin-top: 2px; }

.nf-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.nf-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-brand-primary); flex-shrink: 0; }

.nf-empty { font-size: 13px; color: var(--n-400); text-align: center; padding: 24px 0; }
</style>
