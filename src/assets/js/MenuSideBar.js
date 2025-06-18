export const MenuSidebar = [
  {
    label: 'Página principal', // Se añadió la tilde en "Página"
    icon: 'home',
    to: '/home',
    noRequiresAdmin: true,
  },
  {
    label: 'Quiénes somos', // Se añadió la tilde en "Quiénes"
    icon: 'groups',
    to: '',
    noRequiresAdmin: true,
    children: [
      {
        label: 'Introducción',
        icon: '',
        href: '/home#introduccion',
        noRequiresAdmin: true,
      },
      {
        label: 'Sobre nosotros',
        icon: '',
        href: '/home#nosotros',
        to: '',
        noRequiresAdmin: true,
      },
    ],
  },
]
