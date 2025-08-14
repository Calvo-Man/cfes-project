<template>
  <v-card class="pa-4" max-width="700">
    <v-card-title>Enviar Mensaje</v-card-title>
    <v-card-text>
      <v-form ref="form" @submit.prevent="enviarMensaje">
        <!-- Campo de mensaje -->
        <v-textarea
          v-model="mensaje.contenido"
          label="Mensaje (puedes incluir links)"
          outlined
          rows="4"
          required
        ></v-textarea>

        <!-- Vista previa si detecta link -->
        <div v-if="primerLink">
          <small>Vista previa del link:</small>
          <a :href="primerLink" target="_blank">{{ primerLink }}</a>
        </div>

        <!-- Selección de destinatarios -->
        <v-select
          v-model="mensaje.enviado_a"
          :items="opcionesDestinatarios"
          label="Enviar a"
          multiple
          outlined
          required
        ></v-select>

        <!-- Botón enviar -->
        <v-btn class="mt-4" color="primary" type="submit" :loading="loading"> Enviar </v-btn>
      </v-form>
    </v-card-text>
  </v-card>
  <Notificacion ref="notificacionRef" />
</template>

<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'
import { computed } from 'vue'
import Notificacion from '@/components/Notificacion.vue'

const mensaje = ref({
  contenido: '',
  enviado_a: [],
})

const notificacionRef = ref(null)

const opcionesDestinatarios = ['lideres', 'servidores', 'asistentes']
const loading = ref(false)

const primerLink = computed(() => {
  const match = mensaje.value.contenido.match(/https?:\/\/[^\s]+/)
  return match ? match[0] : null
})

const enviarMensaje = async () => {
  if (!mensaje.value.contenido || mensaje.value.enviado_a.length === 0) {
    alert('Por favor, completa todos los campos')
    return
  }

  loading.value = true
  try {
    // Ajusta la URL a tu endpoint en NestJS
    const response = await api.post('/manejo-de-mensajes/enviar-mensajes', mensaje.value)
    notificacionRef.value.mostrar(
      `El mensaje sera enviado a ${response.data.total} destinatarios`,
      'success',
    ) // 👈 aquí la notificación de update
    mensaje.value.contenido = ''
    mensaje.value.enviado_a = []
  } catch (error) {
    console.error(error)
    notificacionRef.value.mostrar('Error al enviar los mensajes', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  margin: auto;
  background-color: var(--blur-light);
}
</style>
