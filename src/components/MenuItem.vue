<template>
  <div class="menu-item" :class="{ opened: expanded }">
    <!-- Si 'to' no es null, renderiza <router-link>, de lo contrario, renderiza un <div> -->
    <router-link v-if="to" class="button" :to="to" v-show="showItems" style="height: 50px">
      <div class="label" @click="toggleMenu() && CloseSidebar()">
        <div class="left">
          <span v-if="icon" class="material-icons">{{ icon }}</span>
          <span class="text" v-if="showLabel">{{ label }}</span>
        </div>
        <div v-if="data" class="right">
          <i class="expand material-icons arrow" :class="{ opened: expanded }"> expand_more </i>
        </div>
      </div>
    </router-link>

    <!--Si href no es null, renderiza <a>, de lo contrario, renderiza un <div>-->
    <div v-else class="button" @click="toggleMenu()" v-show="showItems" style="height: 50px">
      <a class="label" :href="href" :download="shouldDownload ? '' : null">
        <div class="left">
          <span v-if="icon" class="material-icons">{{ icon }}</span>
          <span class="text" v-if="showLabel">{{ label }}</span>
        </div>
        <div v-if="data" class="right">
          <i class="expand material-icons arrow" :class="{ opened: expanded }"> expand_more </i>
        </div>
      </a>
    </div>

    <div
      v-show="showChildren"
      :class="{ 'small-menu': smallMenu }"
      class="items-container"
      :style="{ height: containerHeight }"
      ref="container"
    >
      <menu-item
        :class="{ opened: showChildren }"
        v-for="(item, index) in data"
        :key="index"
        :data="item.children"
        :label="item.label"
        :icon="item.icon"
        :RequiresAdmin="item.RequiresAdmin"
        :to="item.to"
        :href="item.href"
        :shouldDownload="item.shouldDownload"
        :depth="depth + 1"
        :smallMenu="smallMenu"
        @click="CloseSidebar()"
      />
    </div>
  </div>
</template>
<script>
import { useUserStore } from '@/store/userStore'

export default {
  name: 'menu-item',
  data() {
    return {
      expanded: false,
      showChildren: false,
      containerHeight: 0,
      userStore: useUserStore(),
    }
  },
  props: {
    data: Array,
    label: String,
    icon: String,
    depth: Number,
    smallMenu: Boolean,
    to: String,
    href: String,
    shouldDownload: Boolean,
    RequiresAdmin: Boolean,
  },
  computed: {
    showLabel() {
      return this.smallMenu ? this.depth > 0 : true
    },
    showItems() {
      const rolesConPermiso = ['pastor', 'administrador']
      const rolUsuario = this.userStore.user.rol

      if (!this.RequiresAdmin) {
        return true // No requiere admin, mostrar siempre
      }

      // Si requiere admin, solo mostrar si el rol está en la lista
      return rolesConPermiso.includes(rolUsuario)
    },
  },
  methods: {
    handleClick() {
      this.toggleMenu()
      this.CloseSidebar()
    },
    toggleMenu() {
      this.expanded = !this.expanded
      if (!this.showChildren) {
        this.showChildren = true
        this.$nextTick(() => {
          this.containerHeight = `${this.$refs.container.scrollHeight}px`
          setTimeout(() => {
            this.containerHeight = 'fit-content'
            if (navigator.userAgent.indexOf('Firefox') !== -1) {
              this.containerHeight = '-moz-max-content'
            }
            this.$refs.container.style.overflow = 'visible'
          }, 300)
        })
      } else {
        this.containerHeight = `${this.$refs.container.scrollHeight}px`
        this.$refs.container.style.overflow = 'hidden'
        setTimeout(() => {
          this.containerHeight = '0px'
        }, 10)
        setTimeout(() => {
          this.showChildren = false
        }, 300)
      }
    },
    CloseSidebar() {
      this.$emit('CloseSidebar')
    },
  },
}
</script>

<style scoped lang="scss">
.menu-item {
  position: relative;
  width: 100%;

  .label {
    width: 100%;
    display: flex;
    justify-content: space-between;
    white-space: nowrap;
    user-select: none;
    height: 50px;
    text-decoration: none;
    box-sizing: border-box;
    transition: all 0.3s ease;

    > div {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .arrow {
      transition: all 0.3s ease;
      &.opened {
        transform: rotate(180deg);
      }
    }

    &.small-item {
      width: fit-content;
    }
  }

  .items-container {
    width: 100%;
    transition: height 0.3s ease;
    background-color: rgb(39, 39, 248);
    overflow: hidden;
    border-left: solid 1px var(--dark-alt);
  }

  .button {
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
