<template>
  <v-container>
    <v-card class="pa-6 mx-auto" max-width="600">
      <v-card-title class="text-h6">✝️ Petición de Oración</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="guardarPeticion">
          <v-text-field v-model="peticion.nombre" label="Nombre" outlined dense />
          <v-text-field v-model="peticion.categoria" label="Categoria" outlined dense />
          <v-text-field v-model="peticion.telefono" label="Telefono" outlined dense></v-text-field>
          <v-textarea
            v-model="peticion.contenido"
            label="Escribe tu petición"
            rows="4"
            outlined
            required
          />
          <v-btn type="submit" color="primary" block class="mt-4" :loading="cargando">
            Enviar Petición
          </v-btn>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text>
        <h3 class="text-h6 mb-2">📖 Peticiones recientes</h3>
        <v-list>
          <v-list-item v-for="(item, i) in peticiones" :key="i">
            <v-list-item-content>
              <v-list-item-title>{{ item.nombre }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.contenido }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
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
  try {
    cargando.value = true
    await api.post('/peticiones', {
      nombre: peticion.value.nombre || 'Anonimo',
      contenido: peticion.value.contenido,
      categoria: peticion.value.categoria,
      telefono: peticion.value.telefono,
    })
    peticion.value.contenido = ''
    peticion.value.categoria = ''
    peticion.value.telefono = ''
    peticion.value.nombre = ''
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
