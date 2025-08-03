// src/plugins/axios.js
import axios from 'axios'
import { useUserStore } from '@/store/userStore'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND,
  timeout: 20000,
})

// Interceptor para agregar token a cada petición
api.interceptors.request.use((config) => {
  const store = useUserStore()
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const store = useUserStore()
    const status = error.response?.status

    if (status === 401) {
      // Token inválido o expirado
      store.logout()
      router.push({ path: '/login' }) // redirige al login
    }

    return Promise.reject(error)
  },
)

export default api
