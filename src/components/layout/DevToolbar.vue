<template>
  <div class="dev-toolbar">
    <!-- Role switcher -->
    <div class="dt-group" title="Cambiar rol (solo QA)">
      <i class="pi pi-user dt-icon" />
      <button
        v-for="role in roles"
        :key="role.value"
        class="dt-btn"
        :class="{ 'dt-btn--active': auth.currentRole === role.value }"
        @click="auth.switchRole(role.value)"
      >{{ role.label }}</button>
    </div>

    <div class="dt-sep" />

    <!-- Breakpoint switcher -->
    <div class="dt-group" title="Simular breakpoint (solo QA)">
      <i class="pi pi-desktop dt-icon" />
      <button
        v-for="bp in breakpoints"
        :key="bp.label"
        class="dt-btn"
        :class="{ 'dt-btn--active': auth.previewWidth === bp.width }"
        @click="toggleBreakpoint(bp.width)"
      >{{ bp.label }}</button>
      <!-- Reset to fluid -->
      <button
        v-if="auth.previewWidth !== null"
        class="dt-btn dt-btn--reset"
        title="Volver a fluid"
        @click="auth.setPreviewWidth(null)"
      >✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/data/mock'

const auth = useAuthStore()

const roles: { label: string; value: Role }[] = [
  { label: 'Agente',    value: 'agente' },
  { label: 'Team Lead', value: 'team_lead' },
  { label: 'Manager',   value: 'manager' },
]

const breakpoints = [
  { label: 'TV',   width: 768  },
  { label: 'TH',   width: 1024 },
  { label: '1440', width: 1440 },
  { label: 'HD',   width: 1920 },
  { label: 'UW',   width: 2560 },
]

function toggleBreakpoint(width: number) {
  auth.setPreviewWidth(auth.previewWidth === width ? null : width)
}
</script>

<style scoped>
.dev-toolbar {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: 2px;

  background: rgba(28, 28, 30, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 99px;
  padding: 4px 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.2);
}

.dt-group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.dt-icon {
  font-size: 10px;
  color: rgba(255,255,255,0.3);
  margin-right: 4px;
  margin-left: 2px;
}

.dt-sep {
  width: 1px;
  height: 14px;
  background: rgba(255,255,255,0.12);
  margin: 0 6px;
  flex-shrink: 0;
}

.dt-btn {
  background: none;
  border: none;
  padding: 4px 9px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
  font-family: inherit;
}

.dt-btn:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
}

.dt-btn--active {
  background: rgba(255,255,255,0.16);
  color: #fff;
  font-weight: 600;
}

.dt-btn--reset {
  color: rgba(255,255,255,0.3);
  padding: 4px 7px;
  font-size: 10px;
}

.dt-btn--reset:hover {
  color: rgba(255, 100, 100, 0.9);
  background: rgba(255, 80, 80, 0.12);
}
</style>
