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

  // Evitar que un usuario logueado entre al login
  if (to.path === '/login' && isAuthenticated) {
    return next({ path: '/' })
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return next({ path: '/login' })
    }

    // Roles permitidos según meta
    if (to.matched.some((record) => record.meta.requiresAdmin && record.meta.requiresPastor)) {
      if (!['administrador', 'pastor'].includes(userRole)) {
        return next({ path: '/' })
      }
    } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (userRole !== 'administrador') {
        return next({ path: '/' })
      }
    } else if (to.matched.some((record) => record.meta.requiresPastor)) {
      if (userRole !== 'pastor') {
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
