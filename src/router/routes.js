import RouterViews from '@/views/RouterViews.vue'

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
  },
  {
    path: '/login-admin',
    name: 'LoginAdmin',
    component: () => import('../views/auth/LoginAdmin.vue'),
  },
  {
    path: '/',
    component: RouterViews,
    meta: { requiresAuth: true },

    children: [
      {
        path: '',
        name: 'Pagina principal',
        component: () => import('../views/HomeView.vue'),
      },

      // =========================
      // CAFETERÍA
      // =========================

      {
        path: 'cafeteria/dashboard',
        name: 'Dashboard',
        component: () => import('../views/cafeteria/DashboardCafeteria.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_DASHBOARD',
        },
      },
      {
        path: 'cafeteria/reportes',
        name: 'Reportes',
        component: () => import('../views/cafeteria/reportes/ReportesView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_REPORTES',
        },
      },

      {
        path: 'cafeteria/compras',
        name: 'Compras',
        component: () => import('../views/cafeteria/compras/ComprasView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_COMPRAS',
        },
      },

      {
        path: 'cafeteria/pago-proveedores',
        name: 'Pagos a proveedores',
        component: () => import('../views/cafeteria/compras/PagosProveedoresView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_PAGOS_PROVEEDORES',
        },
      },

      {
        path: 'cafeteria/ventas',
        name: 'Ventas',
        component: () => import('../views/cafeteria/ventas/VentasView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_VENTAS',
        },
      },

      {
        path: 'cafeteria/cuentas',
        name: 'Cuentas',
        component: () => import('../views/cafeteria/cuentas/CuentasView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_CUENTAS',
        },
      },

      {
        path: 'cafeteria/cuentas-por-cobrar',
        name: 'Cuentas por cobrar',
        component: () => import('../views/cafeteria/ventas/CuentasPorCobrarView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_CUENTAS_COBRAR',
        },
      },

      {
        path: 'cafeteria/productos',
        name: 'Productos',
        component: () => import('../views/cafeteria/productos/ProductosView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_PRODUCTOS',
        },
      },

      {
        path: 'cafeteria/categorias',
        name: 'Categorias',
        component: () => import('../views/cafeteria/categorias/CategoriasView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_CATEGORIAS',
        },
      },

      {
        path: 'cafeteria/inventario',
        name: 'Inventario',
        component: () => import('../views/cafeteria/inventario/InventarioView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_INVENTARIO',
        },
      },

      {
        path: 'cafeteria/proveedores',
        name: 'Proveedores',
        component: () => import('../views/cafeteria/proveedores/ProveedoresView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_PROVEEDORES',
        },
      },

      {
        path: 'cafeteria/caja',
        name: 'Caja',
        component: () => import('../views/cafeteria/caja/CajaView.vue'),
        meta: {
          cafeteriaPermission: 'CAFETERIA_CAJA',
        },
      },

      // =========================
      // SISTEMA NORMAL
      // =========================

      {
        path: '/perfil',
        name: 'Perfil',
        component: () => import('../views/servidores/PerfilView.vue'),
      },

      {
        path: 'permisos',
        name: 'Permisos de cafetería',
        component: () => import('../views/cafeteria/permisos/PermisosCafeteriaView.vue'),
      },

      {
        path: 'registrar-iglesia',
        name: 'Registrar iglesia',
        component: () => import('../views/iglesias/RegistrarIglesia.vue'),
        meta: {
          requiresAdmin: true,
          requiresPastor: true,
        },
      },

      {
        path: 'mi-casa-de-fe',
        name: 'Mi casa de fe',
        component: () => import('../views/casas-de-fe/MicasaView.vue'),
      },

      {
        path: 'aseo',
        name: 'Calendario de aseo',
        component: () => import('../views/cronogramas/CalendarioAseo.vue'),
      },

      {
        path: 'calendario',
        name: 'Calendario general',
        component: () => import('../views/cronogramas/CalendarioGeneral.vue'),
      },

      {
        path: 'servidores',
        name: 'Servidores',
        component: () => import('../views/servidores/AgregarServidor.vue'),
        meta: {
          requiresAdmin: true,
          requiresPastor: true,
        },
      },

      {
        path: 'ver-contratos',
        name: 'Contratos de voluntariado',
        component: () => import('../views/servidores/ContratosVista.vue'),
        meta: {
          requiresAdmin: true,
          requiresPastor: true,
        },
      },

      {
        path: 'listado-servidores',
        name: 'Listado de servidores',
        component: () => import('../views/servidores/ListaServidores.vue'),
      },

      {
        path: 'registro-asistencia',
        name: 'Registro de asistencia',
        component: () => import('../views/asistencia/RegistroAsistencia.vue'),
      },

      {
        path: 'ver-asistencias/recurrente',
        name: 'Listado de asistencia',
        component: () => import('../views/asistencia/ListaRecurrentes.vue'),
      },

      {
        path: 'casas-de-fe/agregar',
        name: 'Registro de Casas de Fe',
        component: () => import('../views/casas-de-fe/AgregarCasaDeFe.vue'),
      },

      {
        path: 'casas-de-fe/control',
        name: 'Casas de Fe',
        component: () => import('../views/casas-de-fe/ControlCasaDeFe.vue'),
      },

      {
        path: 'estadisticas',
        name: 'Estadisticas',
        component: () => import('../views/estadisticas/EstadisticasView.vue'),
      },

      {
        path: 'realizar-peticiones',
        name: 'Realizar peticiones',
        component: () => import('../views/peticiones/PeticionesView.vue'),
      },

      {
        path: 'peticiones',
        name: 'Peticiones',
        component: () => import('../views/peticiones/ListadoView.vue'),
      },

      {
        path: 'envio-mensajes',
        name: 'Envio de mensajes',
        component: () => import('../views/manejo-mensajes/EnviarMensajes.vue'),
        meta: {
          requiresAdmin: true,
          requiresPastor: true,
        },
      },

      {
        path: 'banco-preguntas',
        name: 'Banco de preguntas',
        component: () => import('../views/banco-preguntas/BancoPreguntas.vue'),
        meta: {
          requiresAdmin: true,
          requiresPastor: true,
        },
      },
    ],
  },

  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]
