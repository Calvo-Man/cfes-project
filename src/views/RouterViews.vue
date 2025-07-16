<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
</script>
<template>
  <div class="container-view">
    <NavBar />
    <div class="divider mt-14">
      <RouterView />
    </div>
  </div>
</template>
<style scoped>
.navbar {
  background-color: var(--blue);
  color: var(--light);
}
</style>
