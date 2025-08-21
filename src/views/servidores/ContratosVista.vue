<template>
  <v-container>
    <v-card>
      <v-card-title>
        Lista de Contratos
        <v-spacer />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="contratos"
        :loading="loading"
        class="elevation-1"
        item-value="id"
      >
        <!-- Mostrar firma como imagen -->
        <template #item.firma="{ item }">
          <v-img
            v-if="item.firma"
            :src="item.firma"
            max-width="120"
            max-height="50"
            class="firma"
            alt="Firma del contrato"
            contain
            @click="verFirma(item.firma)"
          />
          <span v-else>No disponible</span>
        </template>

        <!-- Mostrar estado del contrato -->
        <template #item.vigente="{ item }">
          <v-chip :color="item.vigente ? 'green' : 'red'" dark>
            {{ item.vigente ? 'Vigente' : 'No vigente' }}
          </v-chip>
        </template>

        <!-- Mostrar nombre del miembro -->
        <template #item.miembro="{ item }">
          {{ item.miembro?.name }} {{ item.miembro?.apellido }}
        </template>

        <!-- Formatear fecha -->
        <template #item.fecha="{ item }">
          {{ formatFecha(item.fecha) }}
        </template>

        <!-- Acciones -->
        <template #item.acciones="{ item }">
          <v-btn size="small" variant="text" icon="mdi-eye" @click="verFirma(item.firma)" />
          <v-btn size="small" variant="text" icon="mdi-pencil" @click="editarContrato(item)" />
          <v-btn
            size="small"
            variant="text"
            icon="mdi-delete"
            color="red"
            @click="eliminarContrato(item.id)"
          />
        </template>
      </v-data-table>
    </v-card>
  </v-container>

  <!-- Modal para ver firma -->
  <v-dialog v-model="dialogFirma" max-width="600">
    <v-card>
      <v-card-title> Firma </v-card-title>
      <v-card-text>
        <v-img :src="firma" max-width="600" contain />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogFirma = false"> Cerrar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const contratos = ref([])
const dialogFirma = ref(false)
const firma = ref('')
const loading = ref(false)

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Miembro', value: 'miembro' },
  { title: 'Fecha', value: 'fecha' },
  { title: 'Firma', value: 'firma' },
  { title: 'Vigente', value: 'vigente' },
  { title: 'Acciones', value: 'acciones', sortable: false },
]

onMounted(async () => {
  try {
    loading.value = true
    const { data } = await api.get('/contratos')
    contratos.value = data
  } catch (err) {
    console.error('Error cargando contratos:', err)
  } finally {
    loading.value = false
  }
})

function verFirma(valor) {
  firma.value = valor
  dialogFirma.value = true
}

function formatFecha(fecha) {
  if (!fecha) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(fecha))
}

function editarContrato(item) {
  console.log('Editar contrato:', item)
  // Aquí abres un modal de edición o navegas a otra vista
}

function eliminarContrato(id) {
  console.log('Eliminar contrato con ID:', id)
  // Aquí llamas a tu API para eliminar
}
</script>

<style scoped>
.firma {
  cursor: pointer;
}
</style>
