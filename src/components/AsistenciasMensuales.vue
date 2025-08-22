<template>
  <v-card class="pa-6 elevation-3 estadisticas-card">
    <v-fade-transition mode="out-in">
      <div>
        <v-card-title class="estadisticas-title"> 📊 Asistencias Mensuales </v-card-title>

        <!-- Gráfico con animación -->
        <LineChart
          :labels="chartData.labels"
          :data="chartData.datasets[0].data"
          title="Asistencias por mes"
        />
      </div>
    </v-fade-transition>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import LineChart from '@/components/LineChart.vue'

const props = defineProps({
  asistencias: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const chartData = computed(() => ({
  labels: props.asistencias.map((a) => a.nombreMes),
  datasets: [
    {
      label: 'Asistencias',
      data: props.asistencias.map((a) => a.total),
      fill: false,
      borderColor: '#42A5F5',
      backgroundColor: '#42A5F5',
      tension: 0.3, // curva más suave
    },
  ],
}))
</script>

<style scoped>
.estadisticas-card {
  max-width: 900px;
  margin: auto;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff, #f3f8ff);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.estadisticas-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.estadisticas-title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 1rem;
}
</style>
