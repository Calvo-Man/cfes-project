<script setup>
import { useUserStore } from '@/store/userStore'
import SideBar from '@/components/SideBarw.vue'
import { Analytics } from '@vercel/analytics/vue'

const userStore = useUserStore()
</script>

<template>
  <div class="app">
    <Analytics />

    <SideBar v-if="userStore.isAuthenticated" />

    <v-app
      style="background: var(--grey)"
      class="scrollable-nav container"
    >
      <div class="fondo-personalizado">
        <img
          src="/img/centro-de-fe-removebg.png"
          alt=""
        />
      </div>

      <RouterView />
    </v-app>
  </div>
</template>
<style lang="scss">
:root {
  --primary: #4ade80;
  --grey: #d3d7e0;
  --red-dark: #eb2929;
  --dark: #0b0b0c;
  --dark-alt: #334155;
  --light: #ffffff;
  --blue: #1359ee;
  --blur-light: rgba(255, 255, 255, 0.856);

  --sidebar-expanded: 260px;
  --sidebar-collapsed: 76px;
}

.bg-blue {
  background-color: var(--blue);
}

.bg-blur {
  background-color: var(--blur-light) !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Fira sans', sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--light);
}

button {
  cursor: pointer;
}

.dialog-title {
  font-family: 'Nunito', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.v-hover {
  transition: all 0.1s ease-in-out;
}

.v-hover:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.app {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.app > .container {
  flex: 1 1 auto;
  min-width: 0;
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

main {
  flex: 1 1 0;
  padding: 1.5rem;

  @media (max-width: 1024px) {
    padding: 0;
  }
}

.container {
  position: relative;
  z-index: 1;
  max-height: 100vh;
  overflow-y: auto;
}

.fondo-personalizado {
  position: fixed;
  top: 50%;
  left: 60%;
  transform: translate(-50%, -50%);
  z-index: -1;

  img {
    height: auto;
    opacity: 0.5;
  }

  @media (max-width: 1024px) {
    left: 50%;
  }
}

/*
|--------------------------------------------------------------------------
| SCROLLBAR
|--------------------------------------------------------------------------
*/

.scrollable-nav::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollable-nav::-webkit-scrollbar-track {
  background-color: var(--grey);
  border-radius: 10px;
}

.scrollable-nav::-webkit-scrollbar-thumb {
  background-color: var(--dark-alt);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.3s;
}

.scrollable-nav::-webkit-scrollbar-thumb:hover {
  background-color: var(--blue);
}

.scrollable-nav {
  scrollbar-width: thin;
  scrollbar-color: var(--dark-alt) var(--grey);

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: var(--grey);
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--dark-alt);
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: padding-box;
    transition: background-color 0.3s;
  }
}
</style>