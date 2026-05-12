import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockRetoSemanal } from '@/data/mock'

export interface RetoSemanal {
  titulo: string
  descripcion: string
  linkReglas: string
}

export const useRetoStore = defineStore('reto', () => {
  const reto = ref<RetoSemanal>({ ...mockRetoSemanal })

  function updateReto(data: RetoSemanal) {
    reto.value = { ...data }
  }

  return { reto, updateReto }
})
