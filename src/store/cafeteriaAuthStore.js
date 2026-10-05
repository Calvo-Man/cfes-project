
import { defineStore } from 'pinia'

const getStorageObject = (key) => {
  try {
    const value = localStorage.getItem(key)

    return value ? JSON.parse(value) : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

export const useCafeteriaAuthStore = defineStore(
  'cafeteriaAuth',
  {
    state: () => ({
      token: localStorage.getItem('cafeteria_token') || null,

      user: getStorageObject('cafeteria_user'),

      iglesia: getStorageObject('cafeteria_iglesia'),
    }),

    getters: {
      isAuthenticated: (state) => {
        return !!state.token
      },

      permisos: (state) => {
        return state.user?.permisos || []
      },

      tienePermiso: (state) => {
        return (permiso) => {
          return (
            state.user?.permisos?.includes(permiso) ||
            false
          )
        }
      },

      nombreUsuario: (state) => {
        return state.user?.nombre || state.user?.user || ''
      },

      nombreIglesia: (state) => {
        return (
          state.iglesia?.nombre ||
          state.iglesia?.name ||
          ''
        )
      },
    },

    actions: {
      login(user, token, iglesia) {
        this.token = token
        this.user = user
        this.iglesia = iglesia

        localStorage.setItem(
          'cafeteria_token',
          token,
        )

        localStorage.setItem(
          'cafeteria_user',
          JSON.stringify(user),
        )

        localStorage.setItem(
          'cafeteria_iglesia',
          JSON.stringify(iglesia),
        )
      },

      logout() {
        this.token = null
        this.user = null
        this.iglesia = null

        localStorage.removeItem(
          'cafeteria_token',
        )

        localStorage.removeItem(
          'cafeteria_user',
        )

        localStorage.removeItem(
          'cafeteria_iglesia',
        )
      },
    },
  },
)

