<template>
  <v-container>
    <v-card>
      <v-card-title>Agregar Pregunta Teológica</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="enviarPregunta">
          <v-text-field v-model="pregunta" label="Pregunta" required></v-text-field>

          <v-textarea v-model="respuesta" label="Respuesta" rows="5" required></v-textarea>
          <v-text-field v-model="fuente" label="Fuente (opcional)"></v-text-field>

          <v-btn color="primary" type="submit" :loading="cargando"> Guardar </v-btn>

          <v-alert v-if="mensaje" :type="mensaje.tipo" class="mt-4" border="left">
            {{ mensaje.texto }}
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'

const pregunta = ref('')
const respuesta = ref('')
const fuente = ref('')
const mensaje = ref(null)
const cargando = ref(false)

const enviarPregunta = async () => {
  if (!pregunta.value || !respuesta.value) {
    mensaje.value = { tipo: 'error', texto: 'Ambos campos son obligatorios' }
    return
  }

  cargando.value = true
  try {
    const res = await api.post('/teologia/agregar', {
      pregunta: pregunta.value,
      respuesta: respuesta.value,
      fuente: fuente.value || null,
    })

    mensaje.value = { tipo: 'success', texto: 'Pregunta agregada correctamente' }
    pregunta.value = ''
    respuesta.value = ''
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: 'Error al guardar la pregunta' }
    console.error(e)
  } finally {
    cargando.value = false
  }
}
</script>
