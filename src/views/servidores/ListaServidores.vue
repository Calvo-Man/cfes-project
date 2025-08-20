<template>
  <v-card class="pa-4 elevation-2 list-container bg-blur">
    <h2 class="text-h6 font-weight-bold mb-4">Listado de Servidores</h2>

    <v-data-table
      :headers="headers"
      :items="servidores"
      :loading="loading"
      class="elevation-1"
      density="comfortable"
    >
      <template #item.activo="{ item }">
        <v-chip
          small
          variant="outlined"
          :color="item.activo ? 'success' : 'error'"
          label
          text-color="white"
          class="ma-1"
        >
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>

      <template #item.disponibilidad_aseo="{ item }">
        <v-chip
          small
          variant="outlined"
          :color="item.disponibilidad_aseo ? 'success' : 'error'"
          label
          text-color="white"
          class="ma-1"
        >
          {{ item.disponibilidad_aseo ? 'Si' : 'No' }}
        </v-chip>
      </template>
    </v-data-table>
  </v-card>

  <Notificacion ref="notificacionRef" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'

const notificacionRef = ref(null)
const servidores = ref([])
const loading = ref(false)

const headers = computed(() => [
  { title: 'Nombre', value: 'name' },
  { title: 'Apellido', value: 'apellido' },
  { title: 'Teléfono', value: 'telefono' },
  { title: 'Cédula', value: 'cedula' },
  { title: 'Rol', value: 'rol' },
  { title: 'Cargo', value: 'cargo' },
  { title: 'Día de aseo', value: 'horario_aseo', sortable: true },
  { title: 'Disponibilidad', value: 'disponibilidad_aseo', sortable: true },
  { title: 'Estado', value: 'activo', sortable: true },
])

onMounted(() => {
  obtenerServidores()
})

async function obtenerServidores() {
  try {
    const response = await api.get('/miembros')
    servidores.value = response.data.miembros
  } catch (error) {
    console.error('Error al obtener los servidores:', error)
  }
}
</script>

<style scoped>
.bg-blur {
  background-color: var(--blur-light);
}
</style>
