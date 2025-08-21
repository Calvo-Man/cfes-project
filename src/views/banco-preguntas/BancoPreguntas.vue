<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6 elevation-3 rounded-xl" style="background: #ffffffda">
          <v-card-title class="text-h5 font-weight-bold"
            >✍️ Agregar Pregunta Teológica</v-card-title
          >

          <v-card-text>
            <v-form ref="form" @submit.prevent="enviarPregunta">
              <v-text-field
                v-model="pregunta"
                label="Pregunta"
                outlined
                required
                :rules="[(v) => !!v || 'La pregunta es obligatoria']"
              />

              <v-textarea
                v-model="respuesta"
                label="Respuesta"
                rows="5"
                outlined
                required
                :rules="[(v) => !!v || 'La respuesta es obligatoria']"
              />

              <v-text-field v-model="fuente" label="Fuente (opcional)" outlined class="mb-4" />

              <v-btn
                color="primary"
                type="submit"
                :loading="cargando"
                class="px-6 py-2 rounded-lg text-white"
                style="background: linear-gradient(135deg, #6a11cb, #2575fc)"
              >
                Guardar
              </v-btn>

              <v-alert v-if="mensaje" :type="mensaje.tipo" class="mt-4" border="left" prominent>
                {{ mensaje.texto }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
    await api.post('/teologia/agregar', {
      pregunta: pregunta.value,
      respuesta: respuesta.value,
      fuente: fuente.value || 'No proporcionada',
    })

    mensaje.value = { tipo: 'success', texto: 'Pregunta agregada correctamente' }
    pregunta.value = ''
    respuesta.value = ''
    fuente.value = ''

    // Ocultar mensaje automáticamente después de 3 segundos
    setTimeout(() => {
      mensaje.value = null
    }, 3000)
  } catch (e) {
    mensaje.value = { tipo: 'error', texto: 'Error al guardar la pregunta' }
    console.error(e)
  } finally {
    cargando.value = false
  }
}
</script>
