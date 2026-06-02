import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface FeriaEvent {
  agenteId: string
  eventName: string
  startDate: Date
  endDate: Date
  activatedBy: string // role that activated it
}

export const useAgentesOfflineStore = defineStore('agentesOffline', () => {
  // Map agenteId → FeriaEvent
  const offlineMap = ref<Map<string, FeriaEvent>>(new Map())

  function activarFeria(event: FeriaEvent) {
    offlineMap.value.set(event.agenteId, event)
  }

  function desactivarFeria(agenteId: string) {
    offlineMap.value.delete(agenteId)
  }

  function isOffline(agenteId: string): boolean {
    const ev = offlineMap.value.get(agenteId)
    if (!ev) return false
    const now = new Date()
    return now >= ev.startDate && now <= ev.endDate
  }

  function getEvent(agenteId: string): FeriaEvent | null {
    return offlineMap.value.get(agenteId) ?? null
  }

  // Format end date nicely: "hasta el mar 24 may · 18:00"
  function formatEndDate(d: Date): string {
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`
  }

  return { offlineMap, activarFeria, desactivarFeria, isOffline, getEvent, formatEndDate }
})
