<template>
  <div class="app-header">
    <div class="header-left">
      <Avatar :label="initials" shape="circle" class="user-avatar" />
      <div class="user-info">
        <span class="user-name">{{ auth.user.nombre }}<span class="user-rol">, {{ roleLabel }}</span></span>
        <div class="user-status">
          <ToggleSwitch v-model="disponible" class="status-toggle" />
          <span class="status-label" :class="disponible ? 'status-on' : 'status-off'">
            {{ disponible ? 'DISPONIBLE' : 'NO DISPONIBLE' }}
          </span>
        </div>
      </div>
    </div>

    <div class="header-right">
      <IconField>
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Buscar..." class="header-search" />
      </IconField>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Avatar from 'primevue/avatar'
import ToggleSwitch from 'primevue/toggleswitch'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import type { Role } from '@/data/mock'

const auth = useAuthStore()
const search = ref('')
const disponible = ref(true)

const initials = computed(() =>
  auth.user.nombre.split(' ').slice(0, 2).map((n: string) => n[0]).join('')
)

const roleLabels: Record<Role, string> = {
  agente:    'Comercial',
  team_lead: 'Team Lead',
  manager:   'Manager',
}

const roleLabel = computed(() => roleLabels[auth.currentRole])
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 16px 0 14px;
  gap: 12px;
  margin-bottom: 4px;
  flex-shrink: 0;
  /* No card — sits directly on the content surface */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  background: var(--n-200) !important;
  color: var(--n-600) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  width: 34px !important;
  height: 34px !important;
  flex-shrink: 0 !important;
  min-width: 34px !important;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-800);
  line-height: 1.2;
}

.user-rol {
  font-weight: 400;
  color: var(--n-500);
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
}

.status-on  { color: var(--success); }
.status-off { color: var(--n-400); }

.header-right {
  margin-left: auto;
  flex-shrink: 0;
}

.header-search {
  width: 220px;
  background: var(--n-0) !important;
  border-color: var(--n-200) !important;
  border-radius: 99px !important;
}
</style>
