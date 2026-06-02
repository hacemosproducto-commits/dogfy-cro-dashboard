<template>
  <SectionCard :title="!total ? title : undefined" class="leads-estado-card">
    <!-- Cabecera con total (modo dashboard) -->
    <RouterLink v-if="total !== undefined" :to="totalLink" class="leads-total-link">
      <span class="leads-total-num">{{ total }}</span>
      <span class="leads-total-sub">{{ totalLabel }}</span>
      <i class="pi pi-arrow-right" style="font-size:11px;color:var(--n-400)" />
    </RouterLink>

    <div class="le-list">
      <RouterLink
        v-for="item in estados"
        :key="item.label"
        :to="{ path: leadsBasePath, query: { estado: item.estado } }"
        class="le-row"
      >
        <span class="le-label">{{ item.label }}</span>
        <span class="le-val">{{ item.val }}</span>
      </RouterLink>

      <RouterLink v-if="erroresPago !== undefined" :to="erroresPath" class="le-row le-error">
        <span class="le-dot" />
        <span class="le-label">Error de pago</span>
        <span class="le-badge">{{ erroresPago }}</span>
        <i class="pi pi-chevron-right" style="font-size:10px;color:var(--n-300)" />
      </RouterLink>
    </div>
  </SectionCard>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import SectionCard from '@/components/ui/SectionCard.vue'

export interface LeadEstadoItem {
  label: string
  estado: string   // se pasa como query param `?estado=`
  val: number | string
}

withDefaults(defineProps<{
  estados: LeadEstadoItem[]
  erroresPago?: number
  /** Si se pasa total, renderiza la cabecera "N Leads activos" en lugar del título */
  total?: number | string
  totalLabel?: string
  totalLink?: string
  /** Path base al que navegan los items (acepta query.estado) */
  leadsBasePath?: string
  erroresPath?: string
  /** Título cuando no hay total (modo "Leads por estado") */
  title?: string
}>(), {
  totalLabel: 'Leads activos',
  totalLink: '/leads',
  leadsBasePath: '/leads',
  erroresPath: '/errores-pago',
  title: 'Leads por estado',
})
</script>

<style scoped>
/* Cabecera total — modo dashboard */
.leads-total-link {
  display: flex; align-items: center; gap: 6px;
  text-decoration: none;
  margin-bottom: 10px; padding-bottom: 10px;
  border-bottom: 1px solid var(--n-150);
}
.leads-total-num { font-size: 24px; font-weight: 700; color: var(--n-900); letter-spacing: -0.5px; }
.leads-total-sub { font-size: 12px; color: var(--n-500); flex: 1; }

/* Lista de estados */
.le-list { display: flex; flex-direction: column; }
.le-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; padding: 5px 6px;
  border-bottom: 1px solid var(--n-100);
  cursor: pointer; text-decoration: none; color: inherit;
  border-radius: 6px; transition: background .12s;
}
.le-row:hover { background: var(--n-50); }
.le-row:last-child { border-bottom: none; }
.le-label { flex: 1; color: var(--n-500); }
.le-val   { font-weight: 600; color: var(--n-800); }

/* Fila Error de pago — patrón compartido con dashboards */
.le-error {
  background: var(--error-bg); border-radius: 6px;
  border-bottom: none !important;
  padding: 6px 6px; margin-top: 2px;
}
.le-error:hover { background: #fce3dc; }
.le-error .le-label { color: var(--error); flex: 1; }
.le-dot   { width: 6px; height: 6px; border-radius: 50%; background: var(--error); flex-shrink: 0; }
.le-badge {
  background: transparent; color: var(--error);
  font-weight: 700; font-size: 12px; padding: 0;
}
</style>
