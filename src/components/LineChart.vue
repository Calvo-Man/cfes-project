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
  Filler,
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
  Filler,
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

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')

  // 🔹 Crear gradiente de color para el fondo
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(124, 77, 255, 0.4)')
  gradient.addColorStop(1, 'rgba(124, 77, 255, 0)')

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.title,
          data: props.data,
          fill: true,
          backgroundColor: gradient,
          borderColor: 'rgba(124, 77, 255, 1)',
          borderWidth: 2,
          tension: 0.35, // 🔹 Curvatura más natural
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#7C4DFF',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#7C4DFF',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        tension: {
          duration: 1000,
          easing: 'easeOutQuad',
          from: 0.5,
          to: 0.35,
          loop: false,
        },
        radius: {
          duration: 400,
          easing: 'linear',
          loop: (ctx) => ctx.active,
        },
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#444',
            font: {
              size: 14,
              weight: '600',
            },
          },
        },
        title: {
          display: !!props.title,
          text: props.title,
          color: '#333',
          font: {
            size: 18,
            weight: 'bold',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          titleFont: { size: 14 },
          bodyFont: { size: 13 },
          padding: 10,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#555',
          },
          grid: {
            color: 'rgba(0,0,0,0.05)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#555',
          },
          grid: {
            color: 'rgba(0,0,0,0.05)',
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
  height: 320px;
  padding: 1rem;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 600px) {
    height: 250px;
  }
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
