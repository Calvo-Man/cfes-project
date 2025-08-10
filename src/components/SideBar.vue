<script setup>
//SideBar.vue
import { ref, onMounted, onBeforeUnmount } from 'vue'
//import logoURL from '../assets/logo.png'
import MenuItem from './MenuItem.vue'

// Reactive state for the menu (sidebar expanded/collapsed)
const is_expanded = ref(true)

// Function to update sidebar state based on window width
const updateMenuState = () => {
  if (window.innerWidth > 1024) {
    is_expanded.value = true // Expanded for larger screens
  } else {
    is_expanded.value = false // Collapsed for smaller screens
  }
}

// Initial check for window size when the component mounts
onMounted(() => {
  updateMenuState() // Check the window size
  window.addEventListener('resize', updateMenuState) // Add resize listener
})

// Function to toggle sidebar on small screens (less than 1024px)
const toggleSidebar = () => {
  if (window.innerWidth < 1024) {
    is_expanded.value = !is_expanded.value
  }
}

// Cerrar el sidebar cuando se emite el evento
const closeSidebar = () => {
  if (window.innerWidth < 1024) {
    is_expanded.value = false
  }
}

// Ref for sidebar element to detect clicks outside
const sidebarRef = ref(null)

// Function to close sidebar when clicking outside
const closeSidebarIfClickedOutside = (event) => {
  if (window.innerWidth > 1024) return
  // Close sidebar if click is outside the sidebar or menu toggle button
  if (sidebarRef.value && !sidebarRef.value.contains(event.target)) {
    is_expanded.value = false
  }
}

// Add event listener on mount, and remove on before unmount
onMounted(() => {
  window.addEventListener('click', closeSidebarIfClickedOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeSidebarIfClickedOutside)
})
</script>

<template>
  <div>
    <button
      class="menu-toggle-no-expande"
      :class="`${is_expanded ? 'is-expanded' : ''}`"
      @click.stop="toggleSidebar"
    >
      <h3>Menu</h3>
      <span class="material-icons">keyboard_double_arrow_right</span>
    </button>
  </div>
  <aside
    ref="sidebarRef"
    :class="`${is_expanded ? 'is-expanded' : ''}`"
    class="scrollable-nav-main"
  >
    <div class="logo">
      <img :src="logoURL" alt="" />
    </div>
    <div class="menu-toggle-wrap">
      <button class="menu-toggle" @click="toggleSidebar">
        <span class="material-icons">keyboard_double_arrow_right</span>
      </button>
    </div>
    <h3>Menu</h3>

    <div class="menu scrollable-nav-main">
      <MenuItem
        v-for="(item, index) in menuTree"
        :key="index"
        :data="item.children"
        :label="item.label"
        :icon="item.icon"
        :to="item.to"
        :RequiresAdmin="item.RequiresAdmin"
        :RequiresPastor="item.RequiresPastor"
        :href="item.href"
        :depth="0"
        :smallMenu="smallMenu"
        @closeSidebar="closeSidebar"
      />
    </div>
  </aside>
</template>
<script>
import MenuItem from './MenuItem.vue'
import store from '@/store/userStore'
import { MenuSideBar } from '@/assets/js/MenuSideBar'

export default {
  name: 'SideBar',
  data: () => ({
    smallMenu: false,
    is_expanded: true,
    //Menu de opciones de la barra lateral
    menuTree: MenuSideBar,
    dialogLogout: false,
  }),
  components: {
    MenuItem,
  },
  methods: {
    DialogLogout() {
      this.dialogLogout = true
    },
    closeLogout() {
      this.dialogLogout = false
    },
    logoutConfirm() {
      store.dispatch('logout')
      this.$router.push({ path: '/' })
      this.dialogLogout = false
    },
  },
}
</script>

<style lang="scss">
.logout {
  height: 19vh;
}
.menu-toggle-no-expanded {
  display: flex;
  position: absolute;
  z-index: 991;
  .material-icons {
    position: absolute;
    top: 10px;
    left: 65px;
    font-size: 2rem;
    color: var(--dark);
    transition: 0.2s ease-out;
  }

  &:hover {
    .material-icons {
      color: var(--red-dark);
      transform: translateX(0.5rem);
    }
    h3 {
      color: var(--red-dark);
    }
  }
  &.is-expanded {
    display: none;
    opacity: 0;
  }
  h3 {
    position: absolute;
    top: 15px;
    left: 25px;
    color: var(--dark);
    font-size: 0.985rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }
}
aside {
  max-height: 100vh;
  display: flex;
  flex-direction: column;

  background-color: var(--blue);
  color: var(--light);

  width: calc(2.5rem + 32px);
  overflow: hidden;
  min-height: 100vh;
  padding: 1rem;
  opacity: 0;
  transition: 0.2s ease-in-out;
  display: none;

  .flex {
    flex: 1 1 0%;
  }

  .logo {
    margin-bottom: 1rem;

    img {
      width: 2rem;
    }
  }
  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    margin-bottom: -1rem;

    position: relative;
    top: 0;
    transition: 0.2s ease-in-out;

    .menu-toggle {
      transition: 0.2s ease-in-out;
      .material-icons {
        font-size: 2rem;
        color: var(--dark);
        transition: 0.2s ease-out;
      }

      &:hover {
        .material-icons {
          color: var(--red-dark);
          //transform: translateX(0.5rem);
        }
      }
    }
  }

  h3,
  .button .text {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  h3 {
    color: var(--light);
    font-size: 0.975rem;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .menu {
    margin: 0 -1rem;
    max-height: 100vh;
    overflow-y: auto;
    .button {
      display: flex;
      align-items: center;
      text-decoration: none;

      transition: 0.2s ease-in-out;
      padding: 0.5rem 1rem;

      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-in-out;
      }
      .text {
        color: var(--light);
        transition: 0.2s ease-in-out;
      }

      &:hover {
        background-color: var(--dark);
        box-shadow: 10px 1px 4px var(--dark);

        .material-icons,
        .text {
          color: var(--light);
        }
      }

      &.router-link-exact-active {
        background-color: var(--dark);
        border-right: 5px solid var(--light);

        .material-icons,
        .text {
          color: var(--light);
        }
      }
    }
  }

  .footer {
    opacity: 0;
    transition: opacity 0.3s ease-in-out;

    p {
      font-size: 0.875rem;
      color: var(--grey);
    }
  }

  &.is-expanded {
    width: var(--sidebar-width);
    display: flex;
    opacity: 1;
    transition: 0.3s ease-in-out;
    .menu-toggle-wrap {
      top: -3rem;

      .menu-toggle {
        display: none;
        @media (max-width: 1024px) {
          transform: rotate(-180deg);
          display: flex;
        }
      }
    }

    h3,
    .button .text {
      opacity: 1;
    }

    .button {
      .material-icons {
        margin-right: 1rem;
      }
    }

    .footer {
      opacity: 0;
    }
  }

  @media (max-width: 1024px) {
    position: absolute;
    z-index: 991;
  }
}
/* Personaliza las barras de desplazamiento para navegadores basados en Webkit (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 1px; /* Ancho de la barra de scroll */
}

/* Personaliza el "track" o fondo sobre el que se desplaza */
::-webkit-scrollbar-track {
  background: #f1f1f1; /* Color de fondo del track */
}

/* Personaliza el "thumb" o control deslizante */
::-webkit-scrollbar-thumb {
  background: var(--light); /* Color del control */
}

/* Cambia el color del "thumb" cuando está en hover */
::-webkit-scrollbar-thumb:hover {
  background: #1298cd;
}

/* Cambia el color del "thumb" cuando se presiona */
::-webkit-scrollbar-thumb:active {
  background: #333;
}

/* Personaliza las barras de desplazamiento para Firefox */
.scrollable-nav-main {
  scrollbar-width: thin; /* Ancho de la barra de desplazamiento */
  scrollbar-color: var(--dark) var(--light); /* Color del "thumb" y del track */
}
</style>
