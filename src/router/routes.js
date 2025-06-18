export const routes = [
  {
    path: '/not-found',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },

  {
    path: '/:catchAll(.*)',
    name: 'NotFoundRedirect', // You can give this route a name to clarify it's for redirecting
    redirect: { path: '/not-found' },
  },
]
