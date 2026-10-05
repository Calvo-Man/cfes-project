
// src/store/userStore.js

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),

  actions: {
    login(user, token) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
    },

    logout() {
      // Limpiar completamente el estado de Pinia
      this.user = null
      this.token = null
      this.isAuthenticated = false

      // Eliminar la sesión persistida
      localStorage.removeItem('user')
    },

    actualizarHorarioPreferido(horario) {
      if (this.user) {
        this.user.horario_aseo = horario
      }
    },
  },

  persist: {
    key: 'user',
  },
})
