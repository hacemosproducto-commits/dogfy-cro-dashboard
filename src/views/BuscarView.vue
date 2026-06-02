<template>
  <div class="buscar-view">
    <!-- Header de resultados -->
    <div class="buscar-header">
      <h1 class="buscar-title">
        <span v-if="query">
          {{ totalResults }} resultado{{ totalResults !== 1 ? 's' : '' }} para
          <span class="buscar-query">"{{ query }}"</span>
        </span>
        <span v-else class="buscar-empty-title">Escribe algo para buscar</span>
      </h1>
    </div>

    <template v-if="query && totalResults === 0">
      <div class="buscar-no-results">
        <div class="buscar-no-illustration">
          <div class="no-circle">
            <i class="pi pi-search" />
          </div>
        </div>
        <p class="buscar-no-title">Sin resultados para <span class="buscar-query">"{{ query }}"</span></p>
        <p class="buscar-no-sub">No encontramos ningún lead ni venta que coincida con tu búsqueda.</p>
        <ul class="buscar-no-tips">
          <li>Comprueba que no haya errores tipográficos</li>
          <li>Prueba con nombre, email, teléfono o código</li>
          <li>Intenta con una parte del término (ej: "garc" en vez de "García")</li>
        </ul>
        <Button label="Limpiar búsqueda" severity="secondary" outlined size="small" icon="pi pi-times" @click="router.push('/leads')" />
      </div>
    </template>

    <template v-else-if="query">
      <!-- Leads -->
      <SectionCard v-if="leadResults.length" class="buscar-section">
        <template #title>
          <span class="section-title-row">
            <i class="pi pi-user" />
            Leads
            <span class="section-count">{{ leadResults.length }}</span>
          </span>
        </template>

        <DataTable :value="leadResults" @row-click="goToLead" class="buscar-table" stripedRows>
          <Column header="Nombre" style="min-width:200px">
            <template #body="{ data }">
              <div class="res-name-cell">
                <span class="res-avatar">{{ ini(data.nombre, data.apellido) }}</span>
                <span class="res-name" v-html="hl(data.nombre + ' ' + data.apellido)" />
              </div>
            </template>
          </Column>
          <Column header="Email" style="min-width:220px">
            <template #body="{ data }">
              <span class="res-secondary" v-html="hl(data.email)" />
            </template>
          </Column>
          <Column header="Teléfono" style="min-width:140px">
            <template #body="{ data }">
              <span class="res-secondary" v-html="hl(data.telefono)" />
            </template>
          </Column>
          <Column header="Campaña" style="min-width:160px">
            <template #body="{ data }">
              <span class="res-secondary" v-html="hl(data.campana)" />
            </template>
          </Column>
          <Column header="Cupón / Referido" style="min-width:140px">
            <template #body="{ data }">
              <span v-if="data.cupon || data.codigoAmigo" class="res-secondary"
                v-html="hl(data.cupon || data.codigoAmigo)" />
              <span v-else class="res-dim">—</span>
            </template>
          </Column>
          <Column header="Estado / Plan" style="min-width:130px">
            <template #body="{ data }">
              <Tag :value="data.estado" :severity="estadoSev(data.estado)" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>

      <!-- Ventas -->
      <SectionCard v-if="ventaResults.length" class="buscar-section">
        <template #title>
          <span class="section-title-row">
            <i class="pi pi-shopping-cart" />
            Ventas
            <span class="section-count">{{ ventaResults.length }}</span>
          </span>
        </template>

        <DataTable :value="ventaResults" @row-click="goToVenta" class="buscar-table" stripedRows>
          <Column header="Nombre" style="min-width:200px">
            <template #body="{ data }">
              <div class="res-name-cell">
                <span class="res-avatar res-avatar--venta"><i class="pi pi-shopping-cart" /></span>
                <div class="res-name-stack">
                  <span class="res-name" v-html="hl(data.nombre + ' ' + data.apellido)" />
                  <span class="res-code" v-html="hl(data.ventaCode)" />
                </div>
              </div>
            </template>
          </Column>
          <Column header="Email" style="min-width:220px">
            <template #body="{ data }">
              <span class="res-secondary" v-html="hl(data.email)" />
            </template>
          </Column>
          <Column header="Teléfono" style="min-width:140px">
            <template #body="{ data }">
              <span class="res-secondary" v-html="hl(data.telefono)" />
            </template>
          </Column>
          <Column header="Campaña" style="min-width:160px">
            <template #body="{ data }">
              <span class="res-secondary" v-html="hl(data.campana)" />
            </template>
          </Column>
          <Column header="Cupón / Referido" style="min-width:140px">
            <template #body="{ data }">
              <span v-if="data.cupon || data.codigoAmigo" class="res-secondary"
                v-html="hl(data.cupon || data.codigoAmigo)" />
              <span v-else class="res-dim">—</span>
            </template>
          </Column>
          <Column header="Estado / Plan" style="min-width:130px">
            <template #body="{ data }">
              <div class="res-plan-cell">
                <span class="plan-badge" :class="data.plan === 'Prueba' ? 'badge--prueba' : 'badge--mens'">
                  {{ data.plan }}
                </span>
                <span class="res-dim res-fecha">{{ data.fecha }} · {{ data.importe }}</span>
              </div>
            </template>
          </Column>
        </DataTable>
      </SectionCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import SectionCard from '@/components/ui/SectionCard.vue'
import { mockSearchLeads, mockSearchVentas } from '@/data/mock'

const route = useRoute()
const router = useRouter()

const query = computed(() => (route.query.q as string) || '')

function matchesQuery(fields: string[], q: string) {
  const lq = q.toLowerCase()
  return fields.some(f => f.toLowerCase().includes(lq))
}

const leadResults = computed(() => {
  if (!query.value) return []
  return mockSearchLeads.filter(l =>
    matchesQuery([l.nombre, l.apellido, l.email, l.telefono, l.campana, l.cupon, l.codigoAmigo], query.value)
  )
})

const ventaResults = computed(() => {
  if (!query.value) return []
  return mockSearchVentas.filter(v =>
    matchesQuery([v.nombre, v.apellido, v.email, v.telefono, v.ventaCode, v.campana, v.cupon, v.codigoAmigo], query.value)
  )
})

const totalResults = computed(() => leadResults.value.length + ventaResults.value.length)

function hl(text: string): string {
  if (!query.value) return text
  const escaped = query.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

function ini(nombre: string, apellido: string) {
  return (nombre[0] ?? '') + (apellido[0] ?? '')
}

function estadoSev(estado: string): string {
  if (estado.startsWith('No contesta')) return 'warn'
  const map: Record<string, string> = {
    'Pendiente': 'success', 'No interesa': 'danger',
    'En cita': 'info', 'Formulario': 'contrast', 'Venta': 'success',
  }
  return map[estado] ?? 'secondary'
}

function goToLead(e: { data: { id: string } }) {
  router.push(`/leads/${e.data.id}`)
}
function goToVenta(e: { data: { id: string } }) {
  router.push(`/ventas/${e.data.id}`)
}
</script>

<style scoped>
.buscar-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.buscar-header {
  padding: 4px 0 8px;
}

.buscar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--n-800);
}

.buscar-query {
  color: var(--brand);
}

.buscar-empty-title {
  color: var(--n-400);
  font-weight: 400;
}

/* No results */
.buscar-no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 72px 24px 80px;
  text-align: center;
}

.buscar-no-illustration {
  margin-bottom: 8px;
}

.no-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--n-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--n-400);
}

.buscar-no-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--n-700);
  margin: 0;
}

.buscar-no-sub {
  font-size: 13px;
  color: var(--n-400);
  max-width: 340px;
  margin: 0;
}

.buscar-no-tips {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: var(--n-50);
  border: 1px solid var(--n-100);
  border-radius: 10px;
  padding: 14px 20px;
  text-align: left;
}

.buscar-no-tips li {
  font-size: 12px;
  color: var(--n-500);
  padding-left: 14px;
  position: relative;
}

.buscar-no-tips li::before {
  content: '·';
  position: absolute;
  left: 4px;
  color: var(--n-400);
  font-weight: 700;
}

/* Section title */
.section-title-row {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
}

.section-count {
  background: var(--n-100);
  color: var(--n-600);
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 99px;
}

/* Table cells */
.res-name-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.res-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--n-100);
  color: var(--n-600);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.res-avatar--venta {
  font-size: 12px;
  color: var(--n-500);
}

.res-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-800);
}

.res-secondary {
  font-size: 12px;
  color: var(--n-600);
}

.res-dim {
  font-size: 12px;
  color: var(--n-300);
}

.res-name-stack {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.res-plan-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.res-fecha {
  font-size: 11px;
  color: var(--n-400);
  white-space: nowrap;
}

.res-code {
  font-size: 11px;
  font-weight: 600;
  color: var(--n-500);
}

.res-importe {
  font-size: 13px;
  font-weight: 600;
  color: var(--n-800);
}

.plan-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
}
.badge--prueba { background: #ede9fe; color: #6d28d9; }
.badge--mens   { background: #dbeafe; color: #1d4ed8; }

/* Highlight */
:deep(mark) {
  background: #fef08a;
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}

/* Row cursor */
:deep(.buscar-table .p-datatable-tbody > tr) {
  cursor: pointer;
}
</style>
