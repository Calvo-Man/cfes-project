<template>
  <v-card class="pa-6 rounded-xl shadow-lg hover:shadow-xl transition-all" elevation="6">
    <!-- Título animado -->
    <v-card-title class="text-h6 font-weight-bold d-flex align-center">
      <v-icon color="primary" class="mr-2">mdi-hands-pray</v-icon>
      Peticiones Mensuales
    </v-card-title>

    <!-- Gráfico con transición -->
    <transition name="fade-slide" mode="out-in">
      <LineChart
        v-if="peticiones.length"
        :labels="peticiones.map((p) => p.nombreMes)"
        :data="peticiones.map((p) => p.total)"
        title="Peticiones por mes"
      />
      <div v-else class="text-center pa-4 grey--text">No hay peticiones registradas 📭</div>
    </transition>
  </v-card>
</template>

<script setup>
import LineChart from '@/components/LineChart.vue'

const props = defineProps({
  peticiones: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const headers = [
  { text: 'Año', value: 'anio' },
  { text: 'Mes', value: 'nombreMes' },
  { text: 'Total Peticiones', value: 'total' },
]
</script>

<style scoped>
.v-card {
  max-width: 850px;
  margin: auto;
  background: linear-gradient(145deg, #ffffff, #f5f7fa);
  transition: all 0.3s ease-in-out;
}

/* Animación fade-slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
