<template>
  <v-container>
    <v-card>
      <v-card-title>
        Lista de Contratos
        <v-spacer />
      </v-card-title>

      <v-data-table :headers="headers" :items="contratos" class="elevation-1" item-value="id">
        <!-- Mostrar firma como imagen -->
        <template #item.firma="{ item }">
          <v-img
            v-if="item.firma"
            :src="item.firma"
            max-width="150"
            height="60"
            class="firma"
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
      </v-data-table>
    </v-card>
  </v-container>
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
import { ref, onMounted, reactive } from 'vue'
import api from '@/plugins/axios'

const contratos = ref([])
const dialogFirma = ref(false)
const firma = ref('')

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Miembro', value: 'miembro' }, // clave simple, slot personalizado se encarga
  { title: 'Fecha', value: 'fecha' },
  { title: 'Firma', value: 'firma' },
  { title: 'Vigente', value: 'vigente' },
]

onMounted(async () => {
  try {
    const { data } = await api.get('/contratos')
    contratos.value = data
  } catch (err) {
    console.error('Error cargando contratos:', err)
  }
})

function verFirma(valor) {
  firma.value = valor
  dialogFirma.value = true
}
</script>
<style scoped>
.firma-pad-container {
  background-color: var(--grey);
}
.firma {
  cursor: pointer;
}
</style>
