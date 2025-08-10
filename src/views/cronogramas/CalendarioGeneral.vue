<template>
  <v-container class="py-4" style="max-width: 900px">
    <v-row justify="center">
      <v-col cols="12">
        <v-col cols="12" class="text-center bg-primary pa-0">
          <h2 class="text-h5 font-weight-bold">Calendario General - {{ nombreMes }} {{ año }}</h2>
        </v-col>
        <div class="calendar-grid">
          <!-- Encabezados -->
          <div class="day-header" v-for="d in diasSemana" :key="d">{{ d }}</div>

          <!-- Espacios vacíos según el día de inicio del mes -->
          <div v-for="n in diaInicioMes" :key="'vacio' + n"></div>

          <!-- Días del mes -->
          <div
            v-for="dia in diasEnMes"
            :key="'dia' + dia"
            class="calendar-day"
            @click="asignarEvento(dia, estado.mes, estado.año)"
            :class="{ asignado: esDiaAsignado(dia), libre: !esDiaAsignado(dia) }"
          >
            <div class="dia-numero">{{ dia }}</div>
            <div
              class="asignacion"
              v-for="evento in asignacionesPorFecha(claveFecha(dia))"
              :key="evento.id"
            >
              <p class="name-event text-body-2">{{ evento.name }}</p>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Modal eventos del día -->
      <v-dialog v-model="showEventosDelDia" max-width="500">
        <v-card>
          <v-card-title class="font-weight-bold">
            Eventos para {{ fechaEvento }}
            <v-btn
              variant="outlined"
              v-if="userStore.user.rol !== 'servidor'"
              @click="showAgendar = true"
              >Agregar</v-btn
            >
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="(evento, index) in eventosDelDiaSeleccionado" :key="index">
                <v-list-item-content>
                  <v-list-item-title class="text-subtitle-1 font-weight-medium">{{
                    evento.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle>{{ evento.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="showEventosDelDia = false">Cerrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Navegación -->
      <v-col cols="12" class="text-center">
        <v-btn @click="cambiarMes(-1)" color="primary" class="mx-2"> Anterior </v-btn>
        <v-btn @click="cambiarMes(1)" color="primary"> Siguiente </v-btn>
      </v-col>
    </v-row>
  </v-container>

  <!-- Modal agendar evento -->
  <v-dialog
    v-model="showAgendar"
    v-if="userStore.user.rol !== 'servidor'"
    @update:modelValue="onDialogChange"
    max-width="600"
  >
    <v-card class="pa-3 elevation-3">
      <h3 class="dialog-title">Agendar {{ fechaEvento }}</h3>
      <v-card-text>
        <v-form ref="form">
          <v-text-field label="Nombre de evento" v-model="events.name" required></v-text-field>
          <v-text-field label="Descripción" v-model="events.description" required></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" @click="cerrarModal"> Cerrar </v-btn>
        <v-btn color="primary" @click="crearEvento"> Agendar </v-btn>
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
}
function onDialogChange(val) {
  showAgendar.value = val
  if (!val) {
    cerrarModal()
  }
}
</script>

<style scoped lang="scss">
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.day-header {
  font-weight: bold;
  text-align: center;
  color: var(--dark);
}
.calendar-day {
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 80px;
  padding: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
}
.calendar-day.asignado {
  background-color: var(--blue);
  color: var(--light);
}
.calendar-day.libre {
  background-color: #f0f0f0;
  opacity: 0.7;
}
.dia-numero {
  font-weight: bold;
}
.asignacion {
  font-size: 0.8rem;
  margin-top: 4px;
}
</style>
