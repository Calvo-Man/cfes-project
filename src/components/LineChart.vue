<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'

// Registrar módulos necesarios
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
)

const props = defineProps({
  labels: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Gráfico',
  },
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return

  // Si ya había un gráfico, destruirlo antes de crear otro
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.title,
          data: props.data,
          fill: true,
          backgroundColor: 'rgba(124, 77, 255, 0.2)',
          borderColor: 'rgba(124, 77, 255, 1)',
          tension: 0.3,
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 🔹 Muy importante para móviles
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: !!props.title,
          text: props.title,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

onMounted(() => {
  createChart()
})

watch([() => props.labels, () => props.data], () => {
  createChart()
})
</script>

<style scoped lang="scss">
.chart-container {
  width: 100%;
  height: 300px;

  @media (max-width: 600px) {
    height: 250px;
  }
}
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
