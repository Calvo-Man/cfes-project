<template>
  <header class="navbar">
    <div class="navbar-title">
      <p>{{ route.name || '...' }}</p>
    </div>

    <button class="logout-btn" @click="logout">
      <span class="material-icons">logout</span>
    </button>
  </header>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const logout = () => {
  userStore.logout()
  router.push('/login')
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
  justify-content: center; /* centro por defecto */
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
}

/* Botón de logout siempre a la derecha */
.logout-btn {
  position: fixed;
  right: 10px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
}
.logout-btn:hover {
  opacity: 0.8;
}

/* 🖥️ Cuando el ancho es mayor a 1024px, alineamos el texto a la izquierda */
@media (min-width: 1025px) {
  .navbar {
    justify-content: flex-start;
  }

  .navbar-title {
    text-align: left;
  }
}
</style>
