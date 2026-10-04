<script>
import { useUserStore } from '@/store/userStore'

export default {
  name: 'MenuItem',

  props: {
    data: {
      type: Array,
      default: () => [],
    },

    label: {
      type: String,
      default: '',
    },

    icon: {
      type: String,
      default: '',
    },

    depth: {
      type: Number,
      default: 0,
    },

    smallMenu: {
      type: Boolean,
      default: false,
    },

    to: {
      type: String,
      default: null,
    },

    href: {
      type: String,
      default: null,
    },

    shouldDownload: {
      type: Boolean,
      default: false,
    },

    RequiresAdmin: {
      type: Boolean,
      default: false,
    },

    RequiresPastor: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['closeSidebar'],

  data() {
    return {
      expanded: false,
      showChildren: false,
      containerHeight: '0px',

      userStore: useUserStore(),
    }
  },

  computed: {

    /*
     * Determina si este elemento tiene submenús
     */
    hasChildren() {
      return Array.isArray(this.data) && this.data.length > 0
    },

    /*
     * Determina si el usuario puede ver este elemento
     */
    showItems() {
      const rolUsuario = this.userStore.user?.rol

      // No requiere permisos especiales
      if (!this.RequiresAdmin && !this.RequiresPastor) {
        return true
      }

      // Requiere Admin o Pastor
      if (this.RequiresAdmin && this.RequiresPastor) {
        return (
          rolUsuario === 'administrador' ||
          rolUsuario === 'pastor'
        )
      }

      // Solo Admin
      if (this.RequiresAdmin) {
        return rolUsuario === 'administrador'
      }

      // Solo Pastor
      if (this.RequiresPastor) {
        return rolUsuario === 'pastor'
      }

      return false
    },

    /*
     * Clases dinámicas del elemento
     */
    itemClasses() {
      return {
        'is-collapsed':
          this.smallMenu && this.depth === 0,

        'has-children':
          this.hasChildren,

        'is-open':
          this.expanded,
      }
    },
  },

  methods: {

    /*
     * Click sobre un elemento
     */
    handleClick() {

      if (this.hasChildren) {
        this.toggleMenu()
      }

      this.closeSidebarOnMobile()
    },


    /*
     * Abrir / cerrar submenú
     */
    toggleMenu() {

      if (!this.hasChildren) {
        this.closeSidebarOnMobile()
        return
      }

      if (this.expanded) {
        this.closeChildren()
      } else {
        this.openChildren()
      }

      this.expanded = !this.expanded
    },


    /*
     * Abrir submenú con animación
     */
    openChildren() {

      this.showChildren = true

      this.$nextTick(() => {

        const container = this.$refs.container

        if (!container) return

        container.style.overflow = 'hidden'

        this.containerHeight =
          `${container.scrollHeight}px`

        setTimeout(() => {

          if (!this.expanded) return

          this.containerHeight = 'fit-content'

          container.style.overflow = 'visible'

        }, 300)
      })
    },


    /*
     * Cerrar submenú con animación
     */
    closeChildren() {

      const container = this.$refs.container

      if (!container) {
        this.showChildren = false
        this.containerHeight = '0px'
        return
      }

      container.style.overflow = 'hidden'

      this.containerHeight =
        `${container.scrollHeight}px`

      requestAnimationFrame(() => {
        this.containerHeight = '0px'
      })

      setTimeout(() => {

        this.showChildren = false

      }, 300)
    },


    /*
     * Cierra el sidebar solamente en móvil
     */
    closeSidebarOnMobile() {

      if (window.innerWidth < 1024) {
        this.$emit('closeSidebar')
      }
    },
  },
}
</script>


<template>

  <!-- =====================================================
       ITEM
  ====================================================== -->

  <div v-if="showItems" class="menu-item" :class="itemClasses">

    <!-- ===================================================
         ITEM PRINCIPAL
    ==================================================== -->

    <!-- ROUTER LINK -->

    <router-link v-if="to" :to="to" class="menu-link" :title="smallMenu ? label : ''" @click="closeSidebarOnMobile">

      <div class="menu-link-content">

        <!-- ICONO -->

        <span v-if="icon" class="material-icons menu-icon">
          {{ icon }}
        </span>


        <!-- TEXTO -->

        <span v-if="!smallMenu || depth > 0" class="menu-text">
          {{ label }}
        </span>

      </div>


      <!-- FLECHA -->

      <span v-if="hasChildren && !smallMenu" class="material-icons menu-arrow" :class="{ rotated: expanded }">
        expand_more
      </span>

    </router-link>


    <!-- ===================================================
         ITEM SIN ROUTER
    ==================================================== -->

    <div v-else class="menu-link" :title="smallMenu ? label : ''" @click="handleClick">

      <div class="menu-link-content">

        <!-- ICONO -->

        <span v-if="icon" class="material-icons menu-icon">
          {{ icon }}
        </span>


        <!-- TEXTO -->

        <span v-if="!smallMenu || depth > 0" class="menu-text">
          {{ label }}
        </span>

      </div>


      <!-- FLECHA -->

      <span v-if="hasChildren && !smallMenu" class="material-icons menu-arrow" :class="{ rotated: expanded }">
        expand_more
      </span>

    </div>


    <!-- ===================================================
         SUBMENÚ NORMAL
    ==================================================== -->

    <div v-if="hasChildren && !smallMenu" v-show="showChildren" ref="container" class="items-container"
      :style="{ height: containerHeight }">

      <MenuItem v-for="(item, index) in data" :key="index" :data="item.children" :label="item.label" :icon="item.icon"
        :RequiresAdmin="item.RequiresAdmin" :RequiresPastor="item.RequiresPastor" :to="item.to" :href="item.href"
        :shouldDownload="item.shouldDownload" :depth="depth + 1" :smallMenu="smallMenu"
        @closeSidebar="$emit('closeSidebar')" />

    </div>


    <!-- ===================================================
         SUBMENÚ FLOTANTE
         SOLO SIDEBAR COMPRIMIDO
    ==================================================== -->

    <div v-if="
      hasChildren &&
      smallMenu &&
      depth === 0
    " class="collapsed-submenu">

      <!-- TITULO -->

      <div class="collapsed-submenu-title">

        {{ label }}

      </div>


      <!-- ITEMS -->

      <div class="collapsed-submenu-list">

        <template v-for="(item, index) in data" :key="index">

          <router-link v-if="item.to" :to="item.to" class="collapsed-submenu-item" @click="closeSidebarOnMobile">

            <span v-if="item.icon" class="material-icons">
              {{ item.icon }}
            </span>

            <span>
              {{ item.label }}
            </span>

          </router-link>


          <a v-else-if="item.href" :href="item.href" :download="item.shouldDownload
              ? ''
              : null
            " class="collapsed-submenu-item" @click="closeSidebarOnMobile">

            <span v-if="item.icon" class="material-icons">
              {{ item.icon }}
            </span>

            <span>
              {{ item.label }}
            </span>

          </a>

        </template>

      </div>

    </div>

  </div>

</template>


<style scoped lang="scss">
/* =========================================================
   ITEM
========================================================= */

.menu-item {
  position: relative;

  width: 100%;

  margin-bottom: 4px;
}


/* =========================================================
   LINK PRINCIPAL
========================================================= */

.menu-link {
  position: relative;

  width: 100%;
  height: 48px;

  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 0 12px;

  box-sizing: border-box;

  border-radius: 11px;

  text-decoration: none;

  color: rgba(255, 255, 255, .78);

  cursor: pointer;

  transition:
    background .2s ease,
    color .2s ease,
    transform .2s ease;
}


/* =========================================================
   CONTENIDO IZQUIERDO
========================================================= */

.menu-link-content {
  min-width: 0;

  display: flex;

  align-items: center;

  gap: 13px;
}


/* =========================================================
   ICONO
========================================================= */

.menu-icon {
  width: 24px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  font-size: 21px;

  color: rgba(255, 255, 255, .72);

  transition:
    color .2s ease,
    transform .2s ease;
}


/* =========================================================
   TEXTO
========================================================= */

.menu-text {
  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;

  font-size: 13.5px;

  font-weight: 500;

  letter-spacing: .05px;
}


/* =========================================================
   FLECHA
========================================================= */

.menu-arrow {
  flex-shrink: 0;

  font-size: 19px;

  color: rgba(255, 255, 255, .45);

  transition:
    transform .25s ease,
    color .2s ease;
}


.menu-arrow.rotated {
  transform: rotate(180deg);

  color: rgba(255, 255, 255, .9);
}


/* =========================================================
   HOVER
========================================================= */

.menu-link:hover {

  background: rgba(255, 255, 255, .09);

  color: white;

  transform: translateX(2px);
}


.menu-link:hover .menu-icon {

  color: white;

  transform: scale(1.05);
}


.menu-link:hover .menu-arrow {

  color: white;
}


/* =========================================================
   ROUTE ACTIVA
========================================================= */

.menu-link.router-link-exact-active {

  background:
    linear-gradient(90deg,
      rgba(255, 255, 255, .16),
      rgba(255, 255, 255, .06));

  color: white;

  box-shadow:
    inset 3px 0 0 rgba(255, 255, 255, .9);
}


.menu-link.router-link-exact-active .menu-icon {

  color: white;
}


/* =========================================================
   SUBMENÚ NORMAL
========================================================= */

.items-container {

  width: 100%;

  margin-top: 3px;

  margin-left: 18px;

  padding-left: 7px;

  overflow: hidden;

  border-left:
    1px solid rgba(255, 255, 255, .13);

  transition:
    height .3s ease;
}


/* =========================================================
   ITEMS HIJOS
========================================================= */

.items-container :deep(.menu-link) {

  height: 42px;

  border-radius: 8px;

  padding-left: 10px;
}


.items-container :deep(.menu-text) {

  font-size: 12.5px;
}


.items-container :deep(.menu-icon) {

  font-size: 18px;
}


/* =========================================================
   SIDEBAR COMPRIMIDO
========================================================= */

.menu-item.is-collapsed {

  width: 56px;

  margin-left: auto;
  margin-right: auto;
}


.menu-item.is-collapsed .menu-link {

  width: 56px;

  height: 48px;

  padding: 0;

  justify-content: center;
}


.menu-item.is-collapsed .menu-link-content {

  justify-content: center;

  gap: 0;
}


.menu-item.is-collapsed .menu-icon {

  width: auto;

  margin: 0;

  font-size: 22px;
}


/* =========================================================
   TOOLTIP NATIVO
========================================================= */

.menu-item.is-collapsed .menu-link {

  cursor: pointer;
}


/* =========================================================
   SUBMENÚ FLOTANTE
========================================================= */

.collapsed-submenu {

  position: fixed;

  left: 84px;

  min-width: 215px;

  max-width: 260px;

  padding: 8px;

  background:
    linear-gradient(180deg,
      #0b4775,
      #08385f);

  border:
    1px solid rgba(255, 255, 255, .08);

  border-radius: 13px;

  box-shadow:
    8px 12px 32px rgba(0, 0, 0, .28);

  opacity: 0;

  visibility: hidden;

  transform: translateX(-8px);

  transition:
    opacity .18s ease,
    transform .18s ease,
    visibility .18s ease;

  z-index: 2000;
}


/* Mostrar submenu al pasar mouse */

.menu-item.is-collapsed:hover .collapsed-submenu {

  opacity: 1;

  visibility: visible;

  transform: translateX(0);
}


/* =========================================================
   TITULO SUBMENÚ
========================================================= */

.collapsed-submenu-title {

  padding: 9px 11px 8px;

  color: rgba(255, 255, 255, .5);

  font-size: 10px;

  font-weight: 700;

  letter-spacing: 1px;

  text-transform: uppercase;
}


/* =========================================================
   LISTA
========================================================= */

.collapsed-submenu-list {

  display: flex;

  flex-direction: column;

  gap: 2px;
}


/* =========================================================
   ITEM DEL SUBMENÚ
========================================================= */

.collapsed-submenu-item {

  display: flex;

  align-items: center;

  gap: 10px;

  min-height: 40px;

  padding: 8px 10px;

  border-radius: 8px;

  color: rgba(255, 255, 255, .78);

  font-size: 12.5px;

  text-decoration: none;

  transition:
    background .18s ease,
    color .18s ease;
}


.collapsed-submenu-item:hover {

  background:
    rgba(255, 255, 255, .10);

  color: white;
}


.collapsed-submenu-item .material-icons {

  flex-shrink: 0;

  font-size: 18px;

  opacity: .75;
}


/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 1024px) {

  /*
   * En móvil NO usamos el menú flotante.
   * El sidebar vuelve a comportarse como
   * un menú normal expandido.
   */

  .menu-item.is-collapsed {

    width: 100%;

    margin: 0 0 4px;
  }


  .menu-item.is-collapsed .menu-link {

    width: 100%;

    height: 48px;

    padding: 0 12px;

    justify-content: space-between;
  }


  .menu-item.is-collapsed .menu-link-content {

    justify-content: flex-start;

    gap: 13px;
  }


  .menu-item.is-collapsed .menu-text {

    display: inline;
  }


  .menu-item.is-collapsed .menu-icon {

    width: 24px;

    font-size: 21px;
  }


  .collapsed-submenu {

    display: none;
  }

}
</style>