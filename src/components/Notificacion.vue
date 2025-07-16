<!-- components/Notificacion.vue -->
<template>
  <v-snackbar
    v-model="visible"
    :color="color"
    :timeout="timeout"
    location="top right"
    elevation="6"
  >
    <v-icon start class="mr-2">{{ icon }}</v-icon>
    {{ mensaje }}
  </v-snackbar>
</template>

<script setup>
import { ref, defineExpose } from 'vue'

const visible = ref(false)
const mensaje = ref('')
const color = ref('success')
const icon = ref('mdi-check-circle')
const timeout = ref(3000)

function mostrar(m, tipo = 'success') {
  mensaje.value = m

  switch (tipo) {
    case 'success':
      color.value = 'green'
      icon.value = 'mdi-check-circle'
      break
    case 'error':
      color.value = 'red'
      icon.value = 'mdi-alert-circle'
      break
    case 'update':
      color.value = 'blue'
      icon.value = 'mdi-pencil-circle'
      break
    case 'warning':
      color.value = 'orange'
      icon.value = 'mdi-alert'
      break
    default:
      color.value = 'grey'
      icon.value = 'mdi-information'
  }

  visible.value = true
}

defineExpose({ mostrar })
</script>
