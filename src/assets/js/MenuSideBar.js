export const MenuSideBar = [
  {
    label: 'Página principal', // Se añadió la tilde en "Página"
    icon: 'home',
    to: '/',
    noRequiresAdmin: true,
  },
  {
    label: 'Mi perfil',
    icon: 'person',
    to: '/perfil',
    noRequiresAdmin: true,
  },
  {
    label: 'Mi casa de fe',
    icon: 'volunteer_activism',
    to: '/mi-casa-de-fe',
    noRequiresAdmin: true,
  },
  {
    label: 'Cronogramas',
    icon: 'event',

    noRequiresAdmin: true,
    children: [
      {
        label: 'Calendario general',
        icon: '',
        to: '/calendario',
        noRequiresAdmin: true,
      },
      {
        label: 'Calendario de aseo',
        icon: '',
        to: '/aseo',
        noRequiresAdmin: true,
      },
    ],
  },
  {
    label: 'Servidores',
    icon: 'groups',
    noRequiresAdmin: true,
    children: [
      // {
      //   label: 'Ver servidores',
      //   icon: '',
      //   to: '/ver-servidores',
      //   noRequiresAdmin: true,
      // },
      {
        label: 'Agregar servidor',
        icon: '',
        to: '/servidores',
        noRequiresAdmin: true,
      },
    ],
  },

  {
    label: 'Asistencias',
    icon: 'emoji_people',
    noRequiresAdmin: true,
    children: [
      {
        label: 'Registrar asistencia',
        icon: '',
        to: '/registro-asistencia',
        noRequiresAdmin: true,
      },
    ],
  },
  {
    label: 'Casas de fe',
    icon: 'church',
    noRequiresAdmin: true,
    children: [
      {
        label: 'Registro casa de fe',
        icon: '',
        to: '/casas-de-fe/agregar',
        noRequiresAdmin: true,
      },
      {
        label: 'Ver de casas de fe',
        icon: '',
        to: '/casas-de-fe/control',
        noRequiresAdmin: true,
      },
    ],
  },
]
