
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

import { useUserStore } from '@/store/userStore'
import { useCafeteriaAuthStore } from '@/store/cafeteriaAuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Busca la primera ruta de cafetería
 * que el usuario tenga permitida.
 */
const obtenerPrimeraRutaCafeteriaPermitida = (
  cafeteriaStore,
) => {
  const rutasCafeteria = router
    .getRoutes()
    .filter((route) => {
      return (
        route.path === '/cafeteria' ||
        route.path.startsWith('/cafeteria/')
      )
    })

  const rutaPermitida = rutasCafeteria.find((route) => {
    const permiso = route.meta?.cafeteriaPermission

    // Ruta sin permiso específico
    if (!permiso) {
      return true
    }

    return cafeteriaStore.tienePermiso(permiso)
  })

  return rutaPermitida?.path || null
}

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const cafeteriaStore = useCafeteriaAuthStore()

  const isAuthenticated =
    userStore.isAuthenticated

  const isCafeteriaAuthenticated =
    cafeteriaStore.isAuthenticated

  const userRole = String(
    userStore.user?.rol || '',
  )
    .trim()
    .toLowerCase()

  const isCafeteriaRoute =
    to.path === '/cafeteria' ||
    to.path.startsWith('/cafeteria/')

  // =====================================================
  // LOGIN
  // =====================================================

  if (to.path === '/login') {
    const modo = to.query.modo

    // ---------------------------------------------------
    // LOGIN DE CAFETERÍA
    // ---------------------------------------------------

    if (modo === 'cafeteria') {
      if (isCafeteriaAuthenticated) {
        const rutaPermitida =
          obtenerPrimeraRutaCafeteriaPermitida(
            cafeteriaStore,
          )

        if (rutaPermitida) {
          return next({
            path: rutaPermitida,
          })
        }

        // Tiene sesión pero no tiene ningún permiso.
        cafeteriaStore.logout()
        userStore.logout()

        return next({
          path: '/login',
          query: {
            modo: 'cafeteria',
          },
        })
      }

      return next()
    }

    // ---------------------------------------------------
    // LOGIN NORMAL
    // ---------------------------------------------------

    if (isAuthenticated) {
      return next({
        path: '/',
      })
    }

    return next()
  }

  // =====================================================
  // RUTAS DE CAFETERÍA
  // =====================================================

  if (isCafeteriaRoute) {
    // ---------------------------------------------------
    // NO TIENE SESIÓN DE CAFETERÍA
    // ---------------------------------------------------

    if (!isCafeteriaAuthenticated) {
      console.log(
        '[Router] Sin sesión de cafetería. Limpiando credenciales.',
      )

      cafeteriaStore.logout()
        userStore.logout()

      return next({
        path: '/login',
        query: {
          modo: 'cafeteria',
        },
      })
    }

    // ---------------------------------------------------
    // VERIFICAR PERMISO DE LA RUTA
    // ---------------------------------------------------

    const cafeteriaPermission =
      to.meta?.cafeteriaPermission

    if (cafeteriaPermission) {
      const tienePermiso =
        cafeteriaStore.tienePermiso(
          cafeteriaPermission,
        )

      if (!tienePermiso) {
        console.log(
          '[Router] Sin permiso de cafetería:',
          cafeteriaPermission,
        )

        const rutaPermitida =
          obtenerPrimeraRutaCafeteriaPermitida(
            cafeteriaStore,
          )

        // Tiene otra sección permitida.
        if (rutaPermitida) {
          return next({
            path: rutaPermitida,
          })
        }

        // No tiene ninguna sección permitida.
        console.log(
          '[Router] Sin permisos de cafetería. Cerrando sesión.',
        )

        cafeteriaStore.logout()
        userStore.logout()

        return next({
          path: '/login',
          query: {
            modo: 'cafeteria',
          },
        })
      }
    }

    return next()
  }

  // =====================================================
  // RUTAS DEL SISTEMA NORMAL
  // =====================================================

  const requiereAuth = to.matched.some(
    (record) => record.meta?.requiresAuth,
  )

  if (requiereAuth) {
    // ---------------------------------------------------
    // NO TIENE SESIÓN NORMAL
    // ---------------------------------------------------

    if (!isAuthenticated) {
      console.log(
        '[Router] Sin sesión normal. Limpiando credenciales.',
      )

      userStore.logout()
      cafeteriaStore.logout()

      return next({
        path: '/login',
      })
    }

    // ---------------------------------------------------
    // REQUISITOS DE ROL
    // ---------------------------------------------------

    const requiereAdmin = to.matched.some(
      (record) => record.meta?.requiresAdmin,
    )

    const requierePastor = to.matched.some(
      (record) => record.meta?.requiresPastor,
    )

    // ---------------------------------------------------
    // ADMINISTRADOR O PASTOR
    // ---------------------------------------------------

    if (requiereAdmin && requierePastor) {
      const tieneRolPermitido =
        userRole === 'administrador' ||
        userRole === 'pastor'

      if (!tieneRolPermitido) {
        console.log(
          '[Router] Rol no autorizado:',
          userRole,
        )

        userStore.logout()
      cafeteriaStore.logout()

        return next({
          path: '/login',
        })
      }
    }

    // ---------------------------------------------------
    // SOLO ADMINISTRADOR
    // ---------------------------------------------------

    else if (requiereAdmin) {
      if (userRole !== 'administrador') {
        console.log(
          '[Router] Se requiere administrador. Rol actual:',
          userRole,
        )

        userStore.logout()
      cafeteriaStore.logout()

        return next({
          path: '/login',
        })
      }
    }

    // ---------------------------------------------------
    // SOLO PASTOR
    // ---------------------------------------------------

    else if (requierePastor) {
      if (userRole !== 'pastor') {
        console.log(
          '[Router] Se requiere pastor. Rol actual:',
          userRole,
        )

        userStore.logout()
      cafeteriaStore.logout()

        return next({
          path: '/login',
        })
      }
    }
  }

  // =====================================================
  // ACCESO PERMITIDO
  // =====================================================

  return next()
})

export default function (app) {
  app.use(router)
}

export { router }
