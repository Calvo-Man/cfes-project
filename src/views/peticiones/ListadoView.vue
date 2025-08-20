<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title> 📖 Lista de Peticiones de Oración </v-card-title>

      <v-data-table :headers="headers" :items="peticiones" :loading="loading" class="elevation-2">
        <template #item.estado="{ item }">
          <v-chip :color="getEstadoColor(item.estado)" dark small>
            {{ item.estado }}
          </v-chip>
        </template>

        <template #item.acciones="{ item }">
          <v-btn size="small" variant="outlined" color="primary" @click="verPeticion(item)">
            Ver
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogo para ver detalle -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title> ✨ Petición de {{ peticionSeleccionada?.nombre }} </v-card-title>
        <v-card-text>
          <p><strong>Categoría:</strong> {{ peticionSeleccionada?.categoria }}</p>
          <p><strong>Teléfono:</strong> {{ peticionSeleccionada?.telefono || 'No registrado' }}</p>
          <p><strong>Contenido:</strong></p>
          <p>{{ peticionSeleccionada?.contenido }}</p>
          <p><strong>Estado:</strong> {{ peticionSeleccionada?.estado }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="dialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const peticiones = ref([])
const loading = ref(false)
const dialog = ref(false)
const peticionSeleccionada = ref(null)

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Contenido', key: 'contenido' },
  { title: 'Estado', key: 'estado' },
  { title: 'Acciones', key: 'acciones', sortable: false },
]

const fetchPeticiones = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/peticiones')
    peticiones.value = data
  } catch (error) {
    console.error('Error al cargar peticiones:', error)
  } finally {
    loading.value = false
  }
}

const verPeticion = (item) => {
  peticionSeleccionada.value = item
  dialog.value = true
}

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'pendiente':
      return 'orange'
    case 'en proceso':
      return 'blue'
    case 'atendida':
      return 'green'
    default:
      return 'grey'
  }
}

onMounted(fetchPeticiones)
</script>
