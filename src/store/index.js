// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    timeSpent: 0,
  }),

  getters: {
    getUser: (state) => state.user,
    isAuthenticated: (state) => state.isAuthenticated,
  },

  actions: {
    login() {
      this.isAuthenticated = true
    },
    logout() {
      this.isAuthenticated = false
    },
    setUser(user) {
      this.user = user
    },
    deleteUser() {
      this.user = null
    },
    setTimeSpent(timeSpent) {
      this.timeSpent = timeSpent
    },
  },

  // Persistencia
  persist: true, // o { storage: sessionStorage } si prefieres sesión
})
