<template>
  <DashboardAgente v-if="auth.currentRole === 'agente'" />
  <DashboardTeamLead v-else-if="auth.currentRole === 'team_lead'" />
  <DashboardManager v-else />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import DashboardAgente from '@/components/dashboard/DashboardAgente.vue'
import DashboardTeamLead from '@/components/dashboard/DashboardTeamLead.vue'
import DashboardManager from '@/components/dashboard/DashboardManager.vue'

const auth = useAuthStore()
</script>
