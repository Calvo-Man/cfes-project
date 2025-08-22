<template>
  <v-container>
    <!-- Título -->
    <h2 class="mb-8 text-center text-white bg-primary pa-2 rounded-lg text-h4 font-weight-bold">
      📊 Estadísticas Generales
    </h2>

    <!-- Tarjetas resumen -->
    <v-row class="mb-12">
      <v-col v-for="(item, index) in resumen" :key="index" cols="6" md="3">
        <v-card class="pa-6 text-center rounded-xl stat-card" elevation="6">
          <transition name="fade-up">
            <h3 class="text-h5 font-weight-bold text-primary">
              {{ item.valor }}
            </h3>
          </transition>
          <p class="grey--text mt-2">{{ item.titulo }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Asistencias Mensuales -->
    <v-row justify="center" class="mb-12">
      <v-col cols="12" md="6">
        <transition name="fade-slide">
          <AsistenciasMensuales :asistencias="asistenciasMensuales" />
        </transition>
      </v-col>

      <!-- Peticiones Mensuales -->
      <v-col cols="12" md="6">
        <transition name="fade-slide">
          <PeticionesMensuales :peticiones="peticionesMensuales" />
        </transition>
      </v-col>
    </v-row>

    <!-- Comparativa -->
    <h3 class="text-center mb-6 text-h6 font-weight-bold">📈 Comparativa General</h3>
    <v-row>
      <v-col cols="12" md="6">
        <transition name="fade-slide">
          <LineChart
            v-if="asistencias.length"
            :labels="asistencias.map((a) => a.nombreMes)"
            :data="asistencias.map((a) => a.total)"
            title="Asistencias mensuales"
          />
        </transition>
      </v-col>

      <v-col cols="12" md="6">
        <transition name="fade-slide">
          <LineChart
            v-if="peticiones.length"
            :labels="peticiones.map((p) => p.nombreMes)"
            :data="peticiones.map((p) => p.total)"
            title="Peticiones mensuales"
          />
        </transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import LineChart from '@/components/LineChart.vue'
import api from '@/plugins/axios'
import AsistenciasMensuales from '@/components/AsistenciasMensuales.vue'
import PeticionesMensuales from '@/components/PeticionesMensuales.vue'

const estadisticas = ref({
  miembros: 0,
  casas: 0,
  eventos: 0,
  asistencias: 0,
})
const asistenciasMensuales = ref([])
const peticionesMensuales = ref([])

const asistencias = ref([])
const peticiones = ref([])

const resumen = computed(() => [
  { titulo: 'Miembros', valor: estadisticas.value.miembros },
  { titulo: 'Casas de Fe', valor: estadisticas.value.casas },
  { titulo: 'Eventos', valor: estadisticas.value.eventos },
  { titulo: 'Asistencias', valor: estadisticas.value.asistencias },
])

onMounted(async () => {
  try {
    const [eventos, asistenciasCount, miembros, casas, asistenciasPorMes, peticionesPorMes] =
      await Promise.all([
        api.get('/eventos/count'),
        api.get('/asistencias/count'),
        api.get('/miembros/count'),
        api.get('/casas-de-fe/count'),
        api.get('/asistencias/countAllPerMonth'),
        api.get('/peticiones/mensuales'),
      ])
    estadisticas.value.eventos = eventos.data
    estadisticas.value.asistencias = asistenciasCount.data
    estadisticas.value.miembros = miembros.data
    estadisticas.value.casas = casas.data
    asistenciasMensuales.value = asistenciasPorMes.data
    peticionesMensuales.value = peticionesPorMes.data
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  }
})
</script>

<style scoped>
/* Tarjetas resumen */
.stat-card {
  background: linear-gradient(135deg, #f5f7fa, #e4ebf7);
  transition: all 0.3s ease-in-out;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* Animación fade-slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Animación fade-up */
.fade-up-enter-active {
  transition: all 0.5s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
</style>
