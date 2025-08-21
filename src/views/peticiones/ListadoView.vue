<template>
  <v-container class="py-6">
    <v-card class="pa-4">
      <v-card-title class="text-h5 font-weight-bold">
        📖 Lista de Peticiones de Oración
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="peticiones"
        :loading="loading"
        class="elevation-2"
        dense
        :items-per-page="10"
      >
        <template #item.estado="{ item }">
          <v-chip :color="getEstadoColor(item.estado)" dark small class="text-capitalize">
            {{ item.estado }}
          </v-chip>
        </template>

        <template #item.contenido="{ item }">
          <span class="text-truncate" style="max-width: 200px">
            {{ item.contenido }}
          </span>
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
        <v-card-title class="text-h6 font-weight-bold">
          ✨ Petición de {{ peticionSeleccionada?.nombre }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium"> Categoría </v-list-item-title>
                <v-list-item-subtitle>{{
                  peticionSeleccionada?.categoria || 'General'
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium"> Teléfono </v-list-item-title>
                <v-list-item-subtitle>{{
                  peticionSeleccionada?.telefono || 'No registrado'
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">Contenido</v-list-item-title>
                <v-list-item-subtitle>{{ peticionSeleccionada?.contenido }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="font-weight-medium">Estado</v-list-item-title>
                <v-chip
                  :color="getEstadoColor(peticionSeleccionada?.estado)"
                  dark
                  small
                  class="text-capitalize"
                >
                  {{ peticionSeleccionada?.estado }}
                </v-chip>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="dialog = false">Cerrar</v-btn>
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
      return 'orange darken-2'
    case 'en proceso':
      return 'blue darken-2'
    case 'atendida':
      return 'green darken-2'
    default:
      return 'grey'
  }
}

onMounted(fetchPeticiones)
</script>
