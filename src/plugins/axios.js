
// src/plugins/axios.js

import axios from 'axios'

import { useUserStore } from '@/store/userStore'
import { useCafeteriaAuthStore } from '@/store/cafeteriaAuthStore'

import { router } from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND,
  timeout: 20000,
})

// =====================================================
// DETERMINAR SI ES UNA RUTA DE CAFETERÍA
// =====================================================

const esRutaCafeteria = (url = '') => {
  // Esta ruta pertenece al sistema normal
  if (
    url === '/cafeteria/permisos' ||
    url.startsWith('/cafeteria/permisos/')
  ) {
    return false
  }

  return (
    url === '/cafeteria' ||
    url.startsWith('/cafeteria/')
  )
}

// =====================================================
// CERRAR TODAS LAS SESIONES
// =====================================================

const cerrarTodasLasSesiones = () => {
  const userStore = useUserStore()
  const cafeteriaStore = useCafeteriaAuthStore()

  userStore.logout()
  cafeteriaStore.logout()
}

// =====================================================
// REQUEST INTERCEPTOR
// =====================================================

api.interceptors.request.use(
  (config) => {
    const url = config.url || ''

    // -------------------------------------------------
    // CAFETERÍA
    // -------------------------------------------------

    if (esRutaCafeteria(url)) {
      const cafeteriaStore =
        useCafeteriaAuthStore()

      if (cafeteriaStore.token) {
        config.headers = config.headers || {}

        config.headers.Authorization =
          `Bearer ${cafeteriaStore.token}`
      }

      return config
    }

    // -------------------------------------------------
    // SISTEMA NORMAL
    // -------------------------------------------------

    const userStore = useUserStore()

    if (userStore.token) {
      config.headers = config.headers || {}

      config.headers.Authorization =
        `Bearer ${userStore.token}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
  (response) => {
    return response
  },

  (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''

    console.log('ERROR API:', {
      status,
      url,
      esCafeteria: esRutaCafeteria(url),
    })

    if (status === 401) {
      console.log(
        '401 detectado. Cerrando ambas sesiones.',
      )

      cerrarTodasLasSesiones()

      if (esRutaCafeteria(url)) {
        return router.push({
          path: '/login',
          query: {
            modo: 'cafeteria',
          },
        })
      }

      return router.push({
        path: '/login',
      })
    }

    return Promise.reject(error)
  },
)

export default api
