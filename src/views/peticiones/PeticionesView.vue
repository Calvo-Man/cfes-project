<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-6 bg-blur" elevation="4">
          <v-card-title class="text-h5 font-weight-bold"> ✝️ Petición de Oración </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="guardarPeticion" ref="form">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="peticion.nombre"
                    label="Nombre"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'El nombre es requerido']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="peticion.telefono"
                    label="Teléfono"
                    outlined
                    dense
                    :rules="[(v) => !!v || 'El teléfono es requerido']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="peticion.categoria" label="Categoría" outlined dense />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="peticion.contenido"
                    label="Escribe tu petición"
                    rows="4"
                    outlined
                    required
                  />
                </v-col>
                <v-col cols="12">
                  <v-btn type="submit" color="primary" block class="mt-4" :loading="cargando">
                    Enviar Petición
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-divider class="my-6"></v-divider>

          <v-card-text>
            <h3 class="text-h6 mb-4">📖 Peticiones recientes</h3>
            <v-sheet
              elevation="1"
              class="rounded-lg pa-4"
              style="max-height: 300px; overflow-y: auto"
            >
              <v-list two-line>
                <v-list-item
                  v-for="(item, i) in peticiones"
                  :key="i"
                  class="mb-2"
                  rounded
                  style="background: #f5f5f5"
                >
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-medium">
                      {{ item.nombre }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <strong>Petición:</strong> {{ item.contenido }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle>
                      <strong>Categoria:</strong> {{ item.categoria || 'General' }},
                      <strong>Teléfono:</strong> {{ item.telefono || 'No proporcionado' }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const peticion = ref({
  nombre: '',
  contenido: '',
  categoria: '',
  telefono: '',
})

const cargando = ref(false)
const peticiones = ref([])

const guardarPeticion = async () => {
  if (!peticion.value.contenido) return
  try {
    cargando.value = true
    await api.post('/peticiones', {
      nombre: peticion.value.nombre || 'Anonimo',
      contenido: peticion.value.contenido,
      categoria: peticion.value.categoria,
      telefono: peticion.value.telefono,
    })
    peticion.value = { nombre: '', contenido: '', categoria: '', telefono: '' }
    obtenerPeticiones()
  } catch (e) {
    console.error(e)
  } finally {
    cargando.value = false
  }
}

const obtenerPeticiones = async () => {
  try {
    const { data } = await api.get('/peticiones')
    peticiones.value = data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  obtenerPeticiones()
})
</script>
<style scoped lang="scss"></style>
