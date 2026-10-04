<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MenuItem from './MenuItem.vue'
import { MenuSideBar } from '@/assets/js/MenuSideBar'
import logoURL from '@/assets/triangulo-logo.png'

const is_expanded = ref(true)
const sidebarRef = ref(null)

const menuTree = MenuSideBar

const isMobile = () => {
  return window.innerWidth <= 1024
}

const updateMenuState = () => {
  if (isMobile()) {
    is_expanded.value = false
  }
}

const toggleSidebar = () => {
  is_expanded.value = !is_expanded.value
}

const closeSidebar = () => {
  if (isMobile()) {
    is_expanded.value = false
  }
}

const closeSidebarIfClickedOutside = (event) => {
  if (!isMobile()) return

  if (
    sidebarRef.value &&
    !sidebarRef.value.contains(event.target)
  ) {
    is_expanded.value = false
  }
}

onMounted(() => {
  updateMenuState()

  window.addEventListener('resize', updateMenuState)
  window.addEventListener('click', closeSidebarIfClickedOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMenuState)
  window.removeEventListener('click', closeSidebarIfClickedOutside)
})
</script>

<template>
  <!-- Botón móvil -->
  <button v-if="!is_expanded" class="mobile-menu-button" @click.stop="toggleSidebar">
    <span class="material-icons">
      menu
    </span>
  </button>

  <aside ref="sidebarRef" class="sidebar" :class="{ 'is-expanded': is_expanded }">

    <!-- HEADER -->
    <div class="sidebar-header">

      <div class="brand">

        <div class="brand-logo">
          <img :src="logoURL" alt="CFES" />
        </div>

        <div v-if="is_expanded" class="brand-info">
          <span class="brand-title">
            CFES
          </span>

          <span class="brand-subtitle">
            Administración
          </span>
        </div>

      </div>
      <button class="collapse-button" :class="{ 'is-collapsed': !is_expanded }" @click.stop="toggleSidebar"
        :title="is_expanded ? 'Contraer menú' : 'Expandir menú'">
        <span class="material-icons">
          {{ is_expanded ? 'chevron_left' : 'chevron_right' }}
        </span>
      </button>

    </div>


    <div class="sidebar-divider"></div>


    <!-- MENU -->
    <div class="sidebar-content">

      <div v-if="is_expanded" class="navigation-label">
        MENÚ PRINCIPAL
      </div>

      <nav class="menu">

        <MenuItem v-for="(item, index) in menuTree" :key="index" :data="item.children" :label="item.label"
          :icon="item.icon" :to="item.to" :href="item.href" :RequiresAdmin="item.RequiresAdmin"
          :RequiresPastor="item.RequiresPastor" :depth="0" :smallMenu="!is_expanded" @closeSidebar="closeSidebar" />

      </nav>

    </div>


    <!-- FOOTER -->
    <div class="sidebar-footer">

      <div class="footer-divider"></div>

      <div class="footer-user">

        <div class="user-avatar">
          <span class="material-icons">
            person
          </span>
        </div>

        <div v-if="is_expanded" class="user-info">
          <span class="user-name">
            Usuario
          </span>

          <span class="user-role">
            Administración
          </span>
        </div>

      </div>

    </div>

  </aside>
</template>


<style scoped lang="scss">
.sidebar {
  --sidebar-expanded: 260px;
  --sidebar-collapsed: 76px;

  position: sticky;
  top: 0;
  left: 0;

  width: var(--sidebar-collapsed);
  min-width: var(--sidebar-collapsed);
  height: 100vh;

  flex-shrink: 0;

  display: flex;
  flex-direction: column;

  background: linear-gradient(180deg,
      var(--blue) 0%,
      #0b3c66 100%);

  color: var(--light);

  z-index: 1000;

  overflow: hidden;

  box-shadow: 4px 0 18px rgba(0, 0, 0, .10);

  transition:
    width .28s cubic-bezier(.4, 0, .2, 1),
    min-width .28s cubic-bezier(.4, 0, .2, 1),
    box-shadow .28s ease;
}

.sidebar.is-expanded {
  width: var(--sidebar-expanded);
  min-width: var(--sidebar-expanded);

  box-shadow: 6px 0 25px rgba(0, 0, 0, .13);
}


/* =========================================
   EXPANDIDO
========================================= */

.sidebar.is-expanded {
  width: var(--sidebar-expanded);

  box-shadow: 6px 0 25px rgba(0, 0, 0, .13);
}


/* =========================================
   HEADER
========================================= */

.sidebar-header {
  min-height: 82px;

  padding: 16px 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-shrink: 0;
}


.brand {
  display: flex;
  align-items: center;

  min-width: 0;
}


.brand-logo {
  width: 48px;
  height: 48px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 14px;

  background: rgba(255, 255, 255, .12);
}


.brand-logo img {
  width: 34px;
  height: 34px;

  object-fit: contain;
}


.brand-info {
  display: flex;
  flex-direction: column;

  margin-left: 12px;

  white-space: nowrap;
}


.brand-title {
  font-size: 17px;
  font-weight: 700;
}


.brand-subtitle {
  margin-top: 2px;

  font-size: 11px;

  color: rgba(255, 255, 255, .60);
}


/* =========================================
   BOTON COMPRIMIR
========================================= */

/* =========================================
   BOTÓN DE COLAPSAR
========================================= */

.collapse-button {
  position: absolute;
  top: 24px;
  right: 12px;

  width: 30px;
  height: 30px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 9px;

  background: rgba(255, 255, 255, 0.09);
  color: white;

  cursor: pointer;
  z-index: 5;

  transition:
    background .2s ease,
    transform .2s ease;
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.18);
}

/* Sidebar contraído en escritorio */

@media (min-width: 1025px) {
  .sidebar:not(.is-expanded) .sidebar-header {
    justify-content: center;
    padding: 16px 0;
  }

  .sidebar:not(.is-expanded) .brand {
    justify-content: center;
  }

  .sidebar:not(.is-expanded) .collapse-button {
    top: 88px;
    right: 50%;
    transform: translateX(50%);

    width: 28px;
    height: 28px;

    background: rgba(255, 255, 255, 0.10);
  }

  .sidebar:not(.is-expanded) .collapse-button:hover {
    background: rgba(255, 255, 255, 0.20);
  }
}
.collapse-button .material-icons {
  font-size: 21px;
}


/* =========================================
   DIVIDER
========================================= */

.sidebar-divider,
.footer-divider {
  height: 1px;

  margin: 0 14px;

  background: rgba(255, 255, 255, .09);
}


/* =========================================
   CONTENT
========================================= */

.sidebar-content {
  flex: 1;

  min-height: 0;

  overflow: hidden;
}


/* =========================================
   LABEL
========================================= */

.navigation-label {
  height: 42px;

  display: flex;
  align-items: center;

  padding: 0 18px;

  color: rgba(255, 255, 255, .40);

  font-size: 10px;

  font-weight: 700;

  letter-spacing: 1px;
}


/* =========================================
   MENU - SCROLLBAR PREMIUM
========================================= */
.sidebar-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu {
  height: calc(100vh - 145px);
  min-height: 0;

  overflow-y: auto;
  overflow-x: hidden;

  padding: 8px 10px 20px;

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.22) transparent;

  /* Evita movimientos visuales al aparecer el scroll */
  scrollbar-gutter: stable;
}

/* Chrome, Edge y Safari */

.menu::-webkit-scrollbar {
  width: 5px;
}

.menu::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

.menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.20);

  border-radius: 20px;

  border: 1px solid transparent;
  background-clip: padding-box;

  transition: background 0.25s ease;
}

.menu:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.42);
  background-clip: padding-box;
}

.menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.68);
  background-clip: padding-box;
}

/* Scrollbar discreto cuando el menú está comprimido */

.sidebar:not(.is-expanded) .menu {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

.sidebar:not(.is-expanded) .menu::-webkit-scrollbar {
  width: 3px;
}

.sidebar:not(.is-expanded) .menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
}

/* =========================================
   FOOTER
========================================= */

.sidebar-footer {
  flex-shrink: 0;

  padding-bottom: 14px;
}


.footer-user {
  min-height: 60px;

  display: flex;
  align-items: center;

  padding: 10px 14px;
}


.user-avatar {
  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: rgba(255, 255, 255, .12);
}


.user-avatar .material-icons {
  font-size: 21px;
}


.user-info {
  display: flex;
  flex-direction: column;

  margin-left: 10px;
}


.user-name {
  font-size: 13px;
  font-weight: 600;
}


.user-role {
  margin-top: 2px;

  font-size: 10px;

  color: rgba(255, 255, 255, .50);
}


/* =========================================
   MOBILE
========================================= */

.mobile-menu-button {
  position: fixed;

  top: 16px;
  left: 16px;

  width: 44px;
  height: 44px;

  z-index: 1100;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 12px;

  background: var(--blue);

  color: white;

  box-shadow: 0 5px 18px rgba(0, 0, 0, .20);

  cursor: pointer;
}


/* =========================================
   MOBILE SIDEBAR
========================================= */

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;

    width: 260px;
    min-width: 260px;

    transform: translateX(-100%);

    transition:
      transform .28s cubic-bezier(.4, 0, .2, 1);
  }

  .sidebar.is-expanded {
    width: 260px;
    min-width: 260px;

    transform: translateX(0);
  }
}


/* =========================================
   DESKTOP
========================================= */

@media (min-width: 1025px) {

  .mobile-menu-button {
    display: none;
  }

}
</style>