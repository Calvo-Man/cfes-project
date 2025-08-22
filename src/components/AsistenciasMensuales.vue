<template>
  <v-card class="pa-4">
    <v-card-title> 📊 Asistencias Mensuales </v-card-title>
    <!-- Gráfico opcional -->
    <LineChart
      :labels="asistencias.map((a) => a.nombreMes)"
      :data="asistencias.map((a) => a.total)"
      title="Asistencias por mes"
    />
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import LineChart from '@/components/LineChart.vue' // Componente de gráfico opcional

// Props que recibe el componente
const props = defineProps({
  asistencias: {
    type: Array,
    required: true,
    default: () => [],
  },
})

// Headers de la tabla
const headers = [
  { text: 'Año', value: 'anio' },
  { text: 'Mes', value: 'nombreMes' },
  { text: 'Total Asistencias', value: 'total' },
]

// Preparar los datos para el gráfico
const chartData = computed(() => ({
  labels: props.asistencias.map((a) => a.nombreMes),
  datasets: [
    {
      label: 'Asistencias',
      data: props.asistencias.map((a) => a.total),
      fill: false,
      borderColor: '#1976D2',
      tension: 0.1,
    },
  ],
}))
</script>

<style scoped>
.v-card {
  max-width: 800px;
  margin: auto;
}
</style>
