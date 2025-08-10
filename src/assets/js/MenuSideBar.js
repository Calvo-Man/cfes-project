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
  {
    label: 'Mi casa de fe',
    icon: 'volunteer_activism',
    to: '/mi-casa-de-fe',
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
    label: 'Banco de preguntas',
    icon: 'quiz',
    to: '/banco-preguntas',
    RequiresAdmin: true,
    RequiresPastor: true,
  },
]
