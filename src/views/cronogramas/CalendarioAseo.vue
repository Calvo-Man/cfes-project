<template>
  <v-container class="py-4" style="max-width: 900px">
    <v-row justify="center">
      <v-col cols="12">
        <v-col cols="12" class="text-center bg-primary pa-0">
          <h2 class="text-h5 font-weight-bold">Calendario de Aseo - {{ nombreMes }} {{ año }}</h2>
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
            :class="{ asignado: esDiaAsignado(dia), libre: !esDiaAsignado(dia) }"
          >
            <div class="dia-numero">{{ dia }}</div>
            <div
              class="asignacion font-weight-bold"
              v-for="persona in asignacionesPorFecha(claveFecha(dia))"
              :key="persona.id"
              :class="{ 'resaltado-usuario': persona.id === userId }"
            >
              {{ persona.name }} {{ persona.apellido }}
            </div>
          </div>
        </div>
      </v-col>

      <!-- Navegación -->
      <v-col cols="12" class="text-center">
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
        >
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
        >
          Siguiente
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { io } from 'socket.io-client'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'
// import { nextTick } from 'vue'
import api from '@/plugins/axios'
import { useUserStore } from '@/store/userStore'

import { ref, reactive, computed, onMounted } from 'vue'

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const userStore = useUserStore()
const userId = 100

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
const mostrarPDF = ref(false)
const socket = io('http://localhost:3000') // Cambia al dominio real si es producción

socket.on('nuevo-horario', async () => {
  console.log('📢 Se generó un nuevo horario desde el backend')
  //await obtenerAsignaciones()
  setTimeout(() => {
    generarYEnviarPDF()
  }, 500) // Le das tiempo a Vue de renderizar
})
// async function generarYEnviarPDF() {
//   mostrarPDF.value = true
//   await nextTick()

//   const elemento = document.getElementById('pdf-target')
//   const canvas = await html2canvas(elemento, { scale: 2 })
//   const imgData = canvas.toDataURL('image/jpeg', 1.0)

//   const pdf = new jsPDF({
//     orientation: 'portrait',
//     unit: 'mm',
//     format: 'a4',
//   })

//   // Cálculo dinámico
//   const imgProps = pdf.getImageProperties(imgData)
//   const pdfWidth = pdf.internal.pageSize.getWidth()
//   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

//   pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
//   const pdfBlob = pdf.output('blob')

//   mostrarPDF.value = false

//   const formData = new FormData()
//   formData.append('pdf', pdfBlob, `calendario-aseo-${estado.año}-${estado.mes + 1}.pdf`)

//   try {
//     await api.post('/aseos/enviar', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })
//     console.log('✅ PDF enviado correctamente')
//   } catch (err) {
//     console.error('❌ Error al enviar el PDF', err)
//   }
// }
</script>

<style scoped lang="scss">
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.resaltado-usuario {
  color: yellow; // Amarillo
  font-weight: bold;
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
.pdf-container {
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--grey);
  position: relative;
  z-index: 1;

  .fondo-personalizado {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;

    img {
      height: auto;
      opacity: 0.5;
    }
  }
}
</style>
