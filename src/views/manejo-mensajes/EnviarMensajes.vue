<template>
  <v-card class="pa-6 mt-10 elevation-3 rounded-xl mx-auto" max-width="600">
    <!-- Título -->
    <v-card-title class="text-h6 font-weight-bold"> ✉️ Enviar Mensaje </v-card-title>

    <v-card-text>
      <v-form ref="form" @submit.prevent="enviarMensaje">
        <!-- Campo de mensaje -->
        <v-textarea
          v-model="mensaje.contenido"
          label="Mensaje (puedes incluir links)"
          outlined
          rows="4"
          required
          prepend-inner-icon="mdi-message-text-outline"
          :rules="[(v) => !!v || 'El mensaje es obligatorio']"
        />

        <!-- Vista previa si detecta link -->
        <v-sheet v-if="primerLink" class="mt-3 pa-2 rounded-lg" elevation="1" color="#f0f4ff">
          <small class="text-subtitle-2 font-weight-medium">Vista previa del link:</small>
          <div>
            <a
              :href="primerLink"
              target="_blank"
              class="text-blue-darken-2 text-decoration-underline"
            >
              {{ primerLink }}
            </a>
          </div>
        </v-sheet>

        <!-- Selección de destinatarios (Miembros) -->
        <v-autocomplete
          v-model="destinatariosMiembros"
          :items="opcionesMiembros"
          item-title="label"
          item-value="value"
          label="Enviar a (Miembros)"
          multiple
          outlined
          chips
          clearable
          prepend-inner-icon="mdi-account-multiple-outline"
          :menu-props="{ maxHeight: 200 }"
          class="mt-4"
        />

        <!-- Selección de destinatarios (Asistentes) -->
        <v-autocomplete
          v-model="destinatariosAsistentes"
          :items="opcionesAsistentes"
          item-title="label"
          item-value="value"
          label="Enviar a (Asistentes)"
          multiple
          outlined
          chips
          clearable
          prepend-inner-icon="mdi-account-group-outline"
          :menu-props="{ maxHeight: 200 }"
          class="mt-4"
        />

        <!-- Botón enviar -->
        <div class="d-flex justify-end mt-6">
          <v-btn
            color="primary"
            type="submit"
            :loading="loading"
            class="px-6 py-2 rounded-lg text-white"
            prepend-icon="mdi-send"
            style="background: linear-gradient(135deg, #6a11cb, #2575fc)"
          >
            Enviar
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>

  <!-- Notificación -->
  <Notificacion ref="notificacionRef" />
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'

const mensaje = ref({
  contenido: '',
  enviado_a: [], // este será el que realmente se manda
})

const destinatariosMiembros = ref([])
const destinatariosAsistentes = ref([])

const notificacionRef = ref(null)

const opcionesMiembros = [
  { label: 'Pastores', value: 'pastores' },
  { label: 'Administradores', value: 'administradores' },
  { label: 'Líderes', value: 'lideres' },
  { label: 'Servidores', value: 'servidores' },
]

const opcionesAsistentes = [
  { label: 'Todos', value: 'Asistentes' },
  { label: 'Jóvenes', value: 'Jovenes' },
  { label: 'Mujeres', value: 'Mujeres' },
  { label: 'Hombres', value: 'Hombres' },
]

const loading = ref(false)

const primerLink = computed(() => {
  const match = mensaje.value.contenido.match(/https?:\/\/[^\s]+/)
  return match ? match[0] : null
})

const enviarMensaje = async () => {
  // unimos seleccionados de los dos autocompletes
  mensaje.value.enviado_a = [...destinatariosMiembros.value, ...destinatariosAsistentes.value]

  if (!mensaje.value.contenido || mensaje.value.enviado_a.length === 0) {
    notificacionRef.value.mostrar('Por favor, completa todos los campos', 'warning')
    return
  }

  loading.value = true
  try {
    const response = await api.post('/manejo-de-mensajes/enviar-mensajes', mensaje.value)
    notificacionRef.value.mostrar(
      `✅ El mensaje será enviado a ${response.data.total} destinatarios`,
      'success',
    )
    mensaje.value.contenido = ''
    mensaje.value.enviado_a = []
    destinatariosMiembros.value = []
    destinatariosAsistentes.value = []
  } catch (error) {
    console.error(error)
    notificacionRef.value.mostrar('❌ Error al enviar los mensajes', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-card {
  background: #ffffffda;
}
</style>
