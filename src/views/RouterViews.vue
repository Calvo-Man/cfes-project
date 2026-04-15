<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import WhatsappStatus from '@/components/WhatsappStatus.vue'
</script>

<template>
  <div class="container-view">
    <NavBar />
    <div class="divider mt-14">
      <RouterView />
      <WhatsappStatus />
    </div>
  </div>
</template>

<style scoped>
.navbar {
  background-color: var(--blue);
  color: var(--light);
}
</style>