// router/index.js o router/index.ts
import RouterViews from '@/views/RouterViews.vue'

export const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
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
      {
        path: '/perfil',
        name: 'Perfil',
        component: () => import('../views/servidores/PerfilView.vue'),
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
        meta: { requiresAdmin: true, requiresPastor: true },
      },
      {
        path: 'ver-contratos',
        name: 'Contratos de voluntariado',
        component: () => import('../views/servidores/ContratosVista.vue'),
        meta: { requiresAdmin: true, requiresPastor: true },
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
        path: 'banco-preguntas',
        name: 'Banco de preguntas',
        component: () => import('../views/banco-preguntas/BancoPreguntas.vue'),
        meta: { requiresAdmin: true, requiresPastor: true },
      },
    ],
  },

  {
    path: '/:catchAll(.*)',
    redirect: '/',
  },
]
