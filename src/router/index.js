import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { useUserStore } from '@/store/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const store = useUserStore()

  const isAuthenticated = store.isAuthenticated
  const userRole = store.user?.rol || ''

  // ⛔ Impedir acceso a /login si ya está autenticado
  if (to.path === '/login' && isAuthenticated) {
    return next({ path: '/' }) // o a donde quieras redirigir después de login
  }
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return next({ path: '/login' }) // ✅ corregido
    }

    if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (userRole !== 'administrador') {
        return next({ path: '/' })
      }
    }

    if (to.matched.some((record) => record.meta.requiresAdmin && record.meta.requiresPastor)) {
      if (userRole !== 'administrador' && userRole !== 'pastor') {
        return next({ path: '/' })
      }
    }
  }

  next()
})

export default function (app) {
  app.use(router)
}

export { router }
