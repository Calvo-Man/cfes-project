export const MenuSideBar = [
  {
    label: 'Página principal', // Se añadió la tilde en "Página"
    icon: 'home',
    to: '/',
    RequiresAdmin: false,
    RequiresPastor: false,
  },
  {
    label: 'Mi perfil',
    icon: 'person',
    to: '/perfil',
    RequiresAdmin: false,
    RequiresPastor: false,
  },

  // =========================
  // OPERACIÓN
  // =========================

  {
    label: 'Dashboard',
    icon: 'dashboard',
    to: '/cafeteria/dashboard',
    permiso: 'CAFETERIA_DASHBOARD',
  },
  {
    label: 'Reportes',
    icon: 'bar_chart',
    to: '/cafeteria/reportes',
    permiso: 'CAFETERIA_REPORTES',
  },

  {
    label: 'Ventas',
    icon: 'point_of_sale',
    to: '/cafeteria/ventas',
    permiso: 'CAFETERIA_VENTAS',
  },

  {
    label: 'Inventario',
    icon: 'inventory_2',
    to: '/cafeteria/inventario',
    permiso: 'CAFETERIA_INVENTARIO',
  },

  {
    label: 'Compras',
    icon: 'shopping_cart',
    to: '/cafeteria/compras',
    permiso: 'CAFETERIA_COMPRAS',
  },

  // =========================
  // DINERO
  // =========================

  {
    label: 'Caja',
    icon: 'account_balance_wallet',
    to: '/cafeteria/caja',
    permiso: 'CAFETERIA_CAJA',
  },

  {
    label: 'Cuentas',
    icon: 'account_balance',
    to: '/cafeteria/cuentas',
    permiso: 'CAFETERIA_CUENTAS',
  },

  {
    label: 'Cuentas por cobrar',
    icon: 'request_quote',
    to: '/cafeteria/cuentas-por-cobrar',
    permiso: 'CAFETERIA_CUENTAS_COBRAR',
  },

  {
    label: 'Pagos a proveedores',
    icon: 'payments',
    to: '/cafeteria/pago-proveedores',
    permiso: 'CAFETERIA_PAGOS_PROVEEDORES',
  },

  // =========================
  // CATÁLOGO
  // =========================

  {
    label: 'Productos',
    icon: 'local_cafe',
    to: '/cafeteria/productos',
    permiso: 'CAFETERIA_PRODUCTOS',
  },

  {
    label: 'Categorías',
    icon: 'category',
    to: '/cafeteria/categorias',
    permiso: 'CAFETERIA_CATEGORIAS',
  },

  // =========================
  // PROVEEDORES
  // =========================

  {
    label: 'Proveedores',
    icon: 'local_shipping',
    to: '/cafeteria/proveedores',
    permiso: 'CAFETERIA_PROVEEDORES',
  },
  // =========================
  // ADMINISTRACIÓN
  // =========================
  {
    label: 'Permisos cafetería',
    icon: 'admin_panel_settings',
    to: '/permisos',
    requiresAdmin: true,
    requiresPastor: true,
  },

  {
    label: 'Iglesias',
    icon: 'church',
    RequiresAdmin: false,
    RequiresPastor: false,

    children: [
      {
        label: 'Registrar iglesia',
        icon: '',
        to: '/registrar-iglesia',
        RequiresAdmin: true,
        RequiresPastor: true,
      },
      {
        label: 'Ver iglesias',
        icon: '',
        to: '/ver-iglesias',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
    ],
  },
  {
    label: 'Mi casa de fe',
    icon: 'volunteer_activism',
    to: '/mi-casa-de-fe',
    RequiresAdmin: false,
    RequiresPastor: false,
  },
  {
    label: 'Estadisticas',
    icon: 'bar_chart',
    to: '/estadisticas',
    RequiresAdmin: false,
    RequiresPastor: false,
  },
  {
    label: 'Cronogramas',
    icon: 'event',

    RequiresAdmin: false,
    RequiresPastor: false,

    children: [
      {
        label: 'Calendario general',
        icon: '',
        to: '/calendario',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
      {
        label: 'Calendario de aseo',
        icon: '',
        to: '/aseo',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
    ],
  },
  {
    label: 'Servidores',
    icon: 'groups',
    RequiresAdmin: false,
    RequiresPastor: false,

    children: [
      {
        label: 'Administrar servidores',
        icon: '',
        to: '/servidores',
        RequiresAdmin: true,
        RequiresPastor: true,
      },
      {
        label: 'Listado de servidores',
        icon: '',
        to: '/listado-servidores',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
      {
        label: 'Ver contratos',
        icon: '',
        to: '/ver-contratos',
        RequiresAdmin: true,
        RequiresPastor: true,
      },
    ],
  },

  {
    label: 'Asistencias',
    icon: 'emoji_people',
    RequiresAdmin: false,
    RequiresPastor: false,

    children: [
      {
        label: 'Registrar asistencia',
        icon: '',
        to: '/registro-asistencia',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
      {
        label: 'Asistencias recurrentes',
        icon: '',
        to: '/ver-asistencias/recurrente',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
    ],
  },
  {
    label: 'Casas de fe',
    icon: 'church',
    RequiresAdmin: false,
    RequiresPastor: false,

    children: [
      {
        label: 'Registro casa de fe',
        icon: '',
        to: '/casas-de-fe/agregar',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
      {
        label: 'Ver de casas de fe',
        icon: '',
        to: '/casas-de-fe/control',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
    ],
  },
  {
    label: 'Oraciones',
    icon: 'volunteer_activism',
    RequiresAdmin: false,
    RequiresPastor: false,

    children: [
      {
        label: 'Realizar peticiones',
        icon: '',
        to: '/realizar-peticiones',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
      {
        label: 'Ver peticiones',
        icon: '',
        to: '/peticiones',
        RequiresAdmin: false,
        RequiresPastor: false,
      },
    ],
  },
  {
    label: 'Envio de mensajes',
    icon: 'message',
    to: '/envio-mensajes',
    RequiresAdmin: true,
    RequiresPastor: true,
  },
  {
    label: 'Banco de preguntas',
    icon: 'quiz',
    to: '/banco-preguntas',
    RequiresAdmin: true,
    RequiresPastor: true,
  },
]
