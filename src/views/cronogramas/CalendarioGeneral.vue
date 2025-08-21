<template>
  <v-container class="py-4 calendar-container" style="max-width: 950px">
    <v-row justify="center">
      <v-col cols="12">
        <!-- Encabezado del mes -->
        <v-card flat class="text-center bg-primary text-white py-3 rounded-lg elevation-2 fade-in">
          <h2 class="text-h5 font-weight-bold">{{ nombreMes.toUpperCase() }} {{ año }}</h2>
        </v-card>

        <!-- Grilla calendario -->
        <div class="calendar-grid mt-4">
          <!-- Encabezados -->
          <div class="day-header" v-for="d in diasSemana" :key="d">{{ d }}</div>

          <!-- Espacios vacíos -->
          <div v-for="n in diaInicioMes" :key="'vacio' + n" class="empty-day"></div>

          <!-- Días -->
          <div
            v-for="dia in diasEnMes"
            :key="'dia' + dia"
            class="calendar-day"
            @click="asignarEvento(dia, estado.mes, estado.año)"
            :class="{ asignado: esDiaAsignado(dia), libre: !esDiaAsignado(dia) }"
          >
            <div class="dia-numero">{{ dia }}</div>

            <transition-group name="fade" tag="div">
              <div
                class="asignacion"
                v-for="evento in asignacionesPorFecha(claveFecha(dia))"
                :key="evento.id"
              >
                <v-chip size="x-small" color="white" text-color="black" class="mb-1">
                  {{ evento.name }}
                </v-chip>
              </div>
            </transition-group>
          </div>
        </div>
      </v-col>

      <!-- Modal eventos del día -->
      <v-dialog v-model="showEventosDelDia" max-width="500" transition="dialog-bottom-transition">
        <v-card class="elevation-3">
          <v-card-title class="font-weight-bold">
            Eventos para {{ fechaEvento }}
            <v-spacer />
            <v-btn
              variant="tonal"
              size="small"
              v-if="userStore.user.rol !== 'servidor'"
              @click="showAgendar = true"
              prepend-icon="mdi-plus"
              >Agregar</v-btn
            >
          </v-card-title>

          <v-card-text>
            <v-list density="compact" v-if="eventosDelDiaSeleccionado.length > 0">
              <v-list-item
                v-for="(evento, index) in eventosDelDiaSeleccionado"
                :key="index"
                class="rounded-lg hoverable"
              >
                <v-list-item-content>
                  <v-list-item-title class="text-subtitle-1 font-weight-medium">{{
                    evento.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{ evento.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <p v-else class="text-grey text-center">No hay eventos en este día</p>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" variant="flat" @click="showEventosDelDia = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Botones navegación -->
      <div class="calendar-navigation">
        <v-btn icon="mdi-chevron-left" color="primary" variant="elevated" @click="cambiarMes(-1)" />
        <v-btn icon="mdi-chevron-right" color="primary" variant="elevated" @click="cambiarMes(1)" />
      </div>
    </v-row>
  </v-container>

  <!-- Modal agendar evento -->
  <v-dialog
    v-model="showAgendar"
    v-if="userStore.user.rol !== 'servidor'"
    @update:modelValue="onDialogChange"
    max-width="600"
    transition="scale-transition"
  >
    <v-card class="pa-3 elevation-3">
      <h3 class="dialog-title mb-2">Agendar {{ fechaEvento }}</h3>
      <v-card-text>
        <v-form ref="form">
          <v-text-field label="Nombre de evento" v-model="events.name" required></v-text-field>
          <v-textarea
            label="Descripción"
            v-model="events.description"
            rows="3"
            auto-grow
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="tonal" color="red" @click="cerrarModal"> Cerrar </v-btn>
        <v-btn variant="flat" color="primary" @click="crearEvento"> Agendar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <Notificacion ref="notificacionRef" />
</template>

<script setup>
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'
import { useUserStore } from '@/store/userStore'
import { ref, reactive, computed, onMounted } from 'vue'

const events = ref({
  name: null,
  description: null,
  date: null,
})
const showEventosDelDia = ref(false)
const eventosDelDiaSeleccionado = ref([])
const userStore = useUserStore()
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const showAgendar = ref(false)
const getEvents = ref({
  events: [],
})
const estado = reactive({
  mes: new Date().getMonth(),
  año: new Date().getFullYear(),
  asignacionesPorMes: {},
})
const notificacionRef = ref(null)

// ===== FUNCIONES DE FECHA SEGURAS (sin desfase por zona horaria) =====
function formatearFechaLocal(date) {
  const anio = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function claveFecha(dia) {
  return formatearFechaLocal(new Date(estado.año, estado.mes, dia))
}

function esDiaAsignado(dia) {
  const fecha = claveFecha(dia)
  const mesClave = `${estado.año}-${String(estado.mes + 1).padStart(2, '0')}`
  const asignaciones = estado.asignacionesPorMes[mesClave] || []
  return asignaciones.some((evento) => evento.date === fecha)
}

function asignacionesPorFecha(fecha) {
  const mesClave = `${estado.año}-${String(estado.mes + 1).padStart(2, '0')}`
  const eventosMes = estado.asignacionesPorMes[mesClave] || []
  return eventosMes.filter((evento) => evento.date === fecha)
}

const nombreMes = computed(() =>
  new Date(estado.año, estado.mes).toLocaleString('es-CO', { month: 'long' }),
)
const diasEnMes = computed(() => new Date(estado.año, estado.mes + 1, 0).getDate())
const diaInicioMes = computed(() => new Date(estado.año, estado.mes, 1).getDay())
const año = computed(() => estado.año)
const fechaEvento = computed(() => {
  if (!events.value.date) return ''
  const fecha = new Date(events.value.date + 'T00:00:00')
  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

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

onMounted(async () => {
  await obtenerEventos()
})
async function obtenerEventos() {
  try {
    const response = await api.get('/eventos')
    getEvents.value.events = response.data
    estado.asignacionesPorMes = response.data
  } catch (error) {
    console.error('Error al obtener las asignaciones:', error)
  }
}

async function asignarEvento(dia, mes, año) {
  const fecha = new Date(año, mes, dia)
  const clave = claveFecha(dia)
  const asignaciones = asignacionesPorFecha(clave)
  showEventosDelDia.value = false

  if (asignaciones.length > 0) {
    eventosDelDiaSeleccionado.value = asignaciones
    events.value.date = formatearFechaLocal(fecha)
    showEventosDelDia.value = true
  } else {
    if (userStore.user.rol !== 'servidor') {
      showEventosDelDia.value = false
      showAgendar.value = true
      events.value.date = formatearFechaLocal(fecha)
    }
  }
}

async function crearEvento() {
  try {
    const response = await api.post('/eventos', events.value)
    console.log('Evento creado:', response.data)
    obtenerEventos()
    cerrarModal()

    notificacionRef.value.mostrar('Evento creado', 'success')
  } catch (error) {
    console.error('Error al crear el evento:', error)
    notificacionRef.value.mostrar('Error al crear el evento', 'error')
  }
}
function cerrarModal() {
  events.value = {
    name: null,
    description: null,
    date: null,
  }
  showAgendar.value = false
  showEventosDelDia.value = false
}
function onDialogChange(val) {
  showAgendar.value = val
  if (!val) {
    cerrarModal()
  }
}
</script>

<style scoped lang="scss">
.calendar-container {
  position: relative;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-header {
  font-weight: bold;
  text-align: center;
  color: var(--dark);
  padding: 4px;
}

.calendar-day {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  min-height: 90px;
  padding: 6px;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.25s ease;
}

.calendar-day:hover {
  transform: scale(1.05);
  background-color: #e3f2fd;
}

.calendar-day.asignado {
  background-color: var(--blue);
  color: white;
}

.calendar-day.libre {
  background-color: #f5f5f596;
}

.dia-numero {
  font-weight: bold;
  margin-bottom: 4px;
}

.asignacion {
  font-size: 0.75rem;
}

.empty-day {
  background-color: transparent;
}

.calendar-navigation {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
