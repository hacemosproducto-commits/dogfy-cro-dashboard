import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockAgente, mockTeamLead, mockManager, type Role } from '@/data/mock'

const USERS = { agente: mockAgente, team_lead: mockTeamLead, manager: mockManager }

// UW kicks in when sidebar(210) + panel(354) + content(900) fit comfortably
const UW_THRESHOLD = 1600

export const useAuthStore = defineStore('auth', () => {
  const currentRole = ref<Role>('agente')
  const user = computed(() => USERS[currentRole.value])

  // Preview width — null means fluid (full viewport)
  const previewWidth = ref<number | null>(null)

  // Reactive actual viewport width (falls back to window.innerWidth)
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)
  const onResize = () => { windowWidth.value = window.innerWidth }
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize)
  }

  // UW active when either the preview or real viewport is wide enough
  const isUwMode = computed(() => (previewWidth.value ?? windowWidth.value) >= UW_THRESHOLD)

  // Mobile preview: preview width set to ≤480px
  const isMobPreview = computed(() => previewWidth.value !== null && previewWidth.value <= 480)

  function switchRole(role: Role) {
    currentRole.value = role
  }

  function setPreviewWidth(w: number | null) {
    previewWidth.value = w
  }

  // Mobile right panel drawer
  const mobilePanelOpen = ref(false)
  function toggleMobilePanel() { mobilePanelOpen.value = !mobilePanelOpen.value }
  function closeMobilePanel() { mobilePanelOpen.value = false }

  // Global modal triggers — disparados por FAB SpeedDial, botones contextuales y otros
  const showCrearLead         = ref(false)
  const showCrearCita         = ref(false)
  const showCrearRecordatorio = ref(false)
  const showAsignarLeads      = ref(false)
  // Bottom sheets full-screen para perfil-lead / perfil-venta (mobile)
  const showWhatsappSheet     = ref(false)
  const showHistorialSheet    = ref(false)

  function logout() {
    currentRole.value = 'agente'
    window.location.href = '/'
  }

  return {
    currentRole, user, switchRole, logout,
    previewWidth, setPreviewWidth, isUwMode, isMobPreview,
    mobilePanelOpen, toggleMobilePanel, closeMobilePanel,
    showCrearLead, showCrearCita, showCrearRecordatorio, showAsignarLeads,
    showWhatsappSheet, showHistorialSheet,
  }
})
