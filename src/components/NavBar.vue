
<template>
  <header class="navbar">
    <transition name="fade-route" mode="out-in">
      <div
        class="navbar-title"
        :key="route.name"
      >
        <p>{{ route.name || '...' }}</p>
      </div>
    </transition>

    <div class="navbar-actions">
      <span class="navbar-user">
        {{ nombreUsuario }}
      </span>

      <button
        class="logout-btn"
        type="button"
        @click="logout"
      >
        <span class="material-icons">
          logout
        </span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/store/userStore'
import { useCafeteriaAuthStore } from '@/store/cafeteriaAuthStore'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()
const cafeteriaAuthStore = useCafeteriaAuthStore()

/*
|--------------------------------------------------------------------------
| Detectar sesión activa
|--------------------------------------------------------------------------
*/

const esCafeteria = computed(() => {
  return (
    route.path === '/cafeteria' ||
    route.path.startsWith('/cafeteria/')
  )
})

/*
|--------------------------------------------------------------------------
| Nombre del usuario
|--------------------------------------------------------------------------
*/

const nombreUsuario = computed(() => {
  if (esCafeteria.value) {
    return (
      cafeteriaAuthStore.nombreUsuario ||
      cafeteriaAuthStore.user?.nombre ||
      cafeteriaAuthStore.user?.user ||
      'Usuario'
    )
  }

  return (
    userStore.user?.nombre ||
    userStore.user?.user ||
    'Usuario'
  )
})

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logout = () => {
  if (esCafeteria.value) {
    cafeteriaAuthStore.logout()

    router.push({
      path: '/login',
      query: {
        modo: 'cafeteria',
      },
    })

    return
  }

  userStore.logout()

  router.push({
    path: '/login',
  })
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.navbar {
  position: fixed;
  z-index: 999;
  top: 0;
  width: 100%;
  height: 50px;
  padding: 0 1rem;

  background-color: var(--blue);
  color: white;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
}

.navbar-title p {
  margin: 0;
}

/*
|--------------------------------------------------------------------------
| Acciones
|--------------------------------------------------------------------------
*/

.navbar-actions {
  position: fixed;
  right: 10px;

  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-user {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

.logout-btn {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  background: none;
  border: none;

  color: white;
  cursor: pointer;

  border-radius: 8px;

  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.logout-btn:active {
  transform: scale(0.95);
}

/*
|--------------------------------------------------------------------------
| Animación del título
|--------------------------------------------------------------------------
*/

.fade-route-enter-active,
.fade-route-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-route-enter-from,
.fade-route-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-route-enter-to,
.fade-route-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/*
|--------------------------------------------------------------------------
| Desktop
|--------------------------------------------------------------------------
*/

@media (min-width: 1025px) {
  .navbar {
    justify-content: flex-start;
  }

  .navbar-title {
    text-align: left;
  }
}

/*
|--------------------------------------------------------------------------
| Mobile
|--------------------------------------------------------------------------
*/

@media (max-width: 600px) {
  .navbar-user {
    display: none;
  }
}
</style>
