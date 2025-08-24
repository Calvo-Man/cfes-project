<template>
  <v-container>
    <v-card class="pa-4 elevation-2 list-container bg-blur">
      <h2 class="text-h6 font-weight-bold mb-4">Listado de Servidores</h2>

      <v-data-table
        :headers="headers"
        :items="servidores"
        :loading="loading"
        class="elevation-1 servidores-table"
        density="comfortable"
      >
        <!-- Estado activo/inactivo -->
        <template #item.activo="{ item }">
          <transition name="scale-fade">
            <v-chip
              v-if="item"
              small
              variant="outlined"
              :color="item.activo ? 'success' : 'error'"
              label
              text-color="white"
              class="ma-1"
            >
              {{ item.activo ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </transition>
        </template>

        <!-- Disponibilidad de aseo -->
        <template #item.disponibilidad_aseo="{ item }">
          <transition name="scale-fade">
            <v-chip
              v-if="item"
              small
              variant="outlined"
              :color="item.disponibilidad_aseo ? 'success' : 'error'"
              label
              text-color="white"
              class="ma-1"
            >
              {{ item.disponibilidad_aseo ? 'Sí' : 'No' }}
            </v-chip>
          </transition>
        </template>

        <!-- Columna de acciones -->
        <template #item.acciones="{ item }">
          <v-btn icon size="small" color="primary" variant="text" @click="verDetalle(item)">
            <v-icon>mdi-eye</v-icon>
          </v-btn>
          <v-btn icon size="small" color="secondary" variant="text" @click="editar(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>

        <!-- Loader animado -->
        <template #loading>
          <v-skeleton-loader type="table-row" class="w-100" :loading="loading" :rows="5" />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
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
  { title: 'Acciones', value: 'acciones', sortable: false },
])

onMounted(() => {
  obtenerServidores()
})

async function obtenerServidores() {
  try {
    loading.value = true
    const response = await api.get('/miembros')
    servidores.value = response.data.miembros
  } catch (error) {
    console.error('Error al obtener los servidores:', error)
  } finally {
    loading.value = false
  }
}

function verDetalle(item) {
  notificacionRef.value.mostrar(`Detalles de ${item.name}`)
}

function editar(item) {
  notificacionRef.value.mostrar(`Editar servidor ${item.name}`)
}
</script>

<style scoped>
.bg-blur {
  background-color: var(--blur-light);
}

/* Hover en filas */
.servidores-table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.08);
  transform: scale(1.01);
  transition: all 0.2s ease-in-out;
}

/* Animación para chips */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s ease;
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
</style>
