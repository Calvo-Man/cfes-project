<template>
  <v-container class="py-4" style="max-width: 900px">
    <v-row justify="center">
      <v-col cols="12">
        <!-- Título -->
        <v-col cols="12" class="text-center bg-primary pa-2 rounded-lg mb-4 elevation-2">
          <h2 class="text-h5 font-weight-bold text-white">
            Calendario de Aseo - {{ nombreMes }} {{ año }}
          </h2>
        </v-col>

        <!-- Calendario con animación -->
        <transition name="fade-slide" mode="out-in">
          <div class="calendar-grid" :key="estado.mes + '-' + estado.año">
            <!-- Encabezados -->
            <div class="day-header" v-for="d in diasSemana" :key="d">{{ d }}</div>

            <!-- Espacios vacíos -->
            <div v-for="n in diaInicioMes" :key="'vacio' + n"></div>

            <!-- Días del mes -->
            <div
              v-for="dia in diasEnMes"
              :key="'dia' + dia"
              class="calendar-day"
              :class="{ asignado: esDiaAsignado(dia), libre: !esDiaAsignado(dia) }"
            >
              <div class="dia-numero">{{ dia }}</div>
              <transition-group name="fade" tag="div">
                <div
                  v-for="persona in asignacionesPorFecha(claveFecha(dia))"
                  :key="persona.id"
                  class="asignaion font-weight-bold"
                >
                  <v-chip
                    size="small"
                    :color="persona.id === userId ? 'black' : 'white'"
                    :variant="persona.id === userId ? 'elevated' : 'tonal'"
                    class="mb-1"
                  >
                    {{ persona.name }} {{ persona.apellido }}
                  </v-chip>
                </div>
              </transition-group>
            </div>
          </div>
        </transition>
      </v-col>

      <!-- Navegación -->
      <v-col cols="12" class="text-center mt-4">
        <v-btn
          @click="cambiarMes(-1)"
          :disabled="
            !tieneAsignaciones(
              estado.mes - 1 < 0 ? 11 : estado.mes - 1,
              estado.mes - 1 < 0 ? estado.año - 1 : estado.año,
            )
          "
          color="primary"
          class="mx-2"
          variant="elevated"
        >
          <v-icon start>mdi-chevron-left</v-icon>
          Anterior
        </v-btn>

        <v-btn
          @click="cambiarMes(1)"
          :disabled="
            !tieneAsignaciones(
              estado.mes + 1 > 11 ? 0 : estado.mes + 1,
              estado.mes + 1 > 11 ? estado.año + 1 : estado.año,
            )
          "
          color="primary"
          variant="elevated"
        >
          Siguiente
          <v-icon end>mdi-chevron-right</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
//import { io } from 'socket.io-client'

import api from '@/plugins/axios'
import { useUserStore } from '@/store/userStore'

import { ref, reactive, computed, onMounted } from 'vue'

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const userStore = useUserStore()
const userId = userStore.user.id

const estado = reactive({
  mes: new Date().getMonth(),
  año: new Date().getFullYear(),
  asignacionesPorMes: {},
})

const asignaciones = ref([])

const nombreMes = computed(() =>
  new Date(estado.año, estado.mes).toLocaleString('es-CO', { month: 'long' }),
)

const diasEnMes = computed(() => new Date(estado.año, estado.mes + 1, 0).getDate())
const diaInicioMes = computed(() => new Date(estado.año, estado.mes, 1).getDay())
const año = computed(() => estado.año)

function claveFecha(dia) {
  const mesStr = String(estado.mes + 1).padStart(2, '0')
  const diaStr = String(dia).padStart(2, '0')
  return `${estado.año}-${mesStr}-${diaStr}`
}
function tieneAsignaciones(mes, año) {
  const clave = `${año}-${String(mes + 1).padStart(2, '0')}`
  return estado.asignacionesPorMes.hasOwnProperty(clave)
}

function esDiaAsignado(dia) {
  const fecha = claveFecha(dia)
  const mesClave = `${estado.año}-${String(estado.mes + 1).padStart(2, '0')}`
  return (
    estado.asignacionesPorMes[mesClave] &&
    estado.asignacionesPorMes[mesClave].some((a) => a.fecha === fecha)
  )
}

function asignacionesPorFecha(fecha) {
  const mesClave = `${estado.año}-${String(estado.mes + 1).padStart(2, '0')}`
  const asignacionesMes = estado.asignacionesPorMes[mesClave] || []
  return asignacionesMes.filter((a) => a.fecha === fecha).map((a) => a.miembro)
}

function cambiarMes(delta) {
  estado.mes += delta
  if (estado.mes < 0) {
    estado.mes = 11
    estado.año--
  } else if (estado.mes > 11) {
    estado.mes = 0
    estado.año++
  }
}

async function obtenerAsignaciones() {
  try {
    const response = await api.get('/aseos/agrupado-por-mes')
    estado.asignacionesPorMes = response.data
  } catch (error) {
    console.error('Error al obtener las asignaciones:', error)
  }
}

onMounted(async () => {
  await obtenerAsignaciones()
})
</script>

<style scoped lang="scss">
/* Grid calendario */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

/* Cabecera días */
.day-header {
  font-weight: bold;
  text-align: center;
  color: var(--dark);
}

/* Estilos de día */
.calendar-day {
  border: 1px solid #ddd;
  border-radius: 10px;
  min-height: 90px;
  padding: 6px;
  background-color: #fdfdfd;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}

/* Día asignado */
.calendar-day.asignado {
  background-color: var(--blue);
  color: var(--light);
  font-weight: 500;
}

/* Día libre */
.calendar-day.libre {
  background-color: #f0f0f0;
  opacity: 0.8;
}

/* Número de día */
.dia-numero {
  font-weight: bold;
  margin-bottom: 4px;
}

/* Nombres */
.asignacion {
  font-size: 0.85rem;
  margin-top: 2px;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.25);
}

/* Resaltar usuario conectado */
.resaltado-usuario {
  color: #fbc02d;
  font-weight: bold;
  background-color: black;
  border-radius: 6px;
}

/* Animaciones */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
