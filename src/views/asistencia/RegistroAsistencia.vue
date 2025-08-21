<template>
  <v-row class="pa-4">
    <!-- Formulario -->
    <v-col cols="12" md="6">
      <v-card class="pa-6 elevation-3 mx-auto form-container rounded-xl">
        <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">📝 Registrar asistencia</h2>
        <v-form @submit.prevent="sendForm">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.nombre"
                label="Nombre"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.apellido"
                label="Apellido"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.telefono"
                label="Teléfono"
                type="tel"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.carrera"
                label="Carrera"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="form.calle"
                label="Calle"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.direccion"
                label="Dirección completa"
                variant="outlined"
                density="comfortable"
                readonly
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.barrio"
                label="Barrio"
                type="text"
                variant="outlined"
                density="comfortable"
                required
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.categoria"
                :items="categoria"
                label="Categoría"
                variant="outlined"
                density="comfortable"
                item-value="value"
                item-title="label"
              />
            </v-col>

            <v-col cols="12" class="text-right">
              <v-btn color="primary" type="submit" rounded="lg" elevation="2"> Guardar </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-col>

    <!-- Mapa -->
    <v-col cols="12" md="6">
      <v-card class="elevation-2 rounded-xl overflow-hidden">
        <div id="asistencia-map" class="map-container"></div>
      </v-card>
    </v-col>
  </v-row>

  <!-- Tabla -->
  <v-card class="pa-4 elevation-2 list-container rounded-xl">
    <h2 class="text-h6 font-weight-bold mb-4">📋 Listado de Asistencias</h2>

    <v-data-table
      :headers="headers"
      :items="asistencias"
      :loading="loading"
      class="elevation-1 rounded-lg"
      density="comfortable"
      hover
      fixed-header
      height="400px"
    >
      <template #item.encargadosId="{ item }">
        <div>
          <v-chip
            v-for="(encargados, index) in item.encargadosId"
            :key="index"
            size="small"
            class="ma-1"
            color="blue-lighten-4"
            text-color="blue-darken-4"
            label
          >
            {{ encargados.name }} {{ encargados.apellido }}
          </v-chip>
        </div>
      </template>

      <template #item.acciones="{ item }">
        <v-btn icon class="mr-2" size="x-small" color="blue" variant="tonal" @click="editar(item)">
          <i class="material-icons icon-sm">edit</i>
        </v-btn>
        <v-btn icon color="red" size="x-small" variant="tonal" @click="eliminar(item)">
          <i class="material-icons icon-sm">delete</i>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <!-- Notificación -->
  <Notificacion ref="notificacionRef" />

  <!-- Diálogo Eliminar -->
  <v-dialog v-model="dialogDelete" max-width="500">
    <v-card class="rounded-xl">
      <v-card-title class="text-h5 font-weight-bold"> ⚠️ Eliminar asistencia </v-card-title>
      <v-card-text>
        <p>¿Estás seguro de que deseas continuar?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="dialogDelete = false"> Cancelar </v-btn>
        <v-btn color="red" variant="elevated" @click="confirmDelete"> Eliminar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import Notificacion from '@/components/Notificacion.vue'

import api from '@/plugins/axios'

const form = ref({
  nombre: '',
  apellido: '',
  telefono: '',
  barrio: '',
  carrera: '',
  calle: '',
  direccion: '',
  categoria: '',
  latitud: null,
  longitud: null,
})

const loading = ref(false)

const categoria = [
  { label: 'Niños', value: 'Niños' },
  { label: 'Jovenes', value: 'Jovenes' },
  { label: 'Adultos', value: 'Adultos' },
]

const headers = ref([
  { title: 'Nombre', value: 'nombre' },
  { title: 'Apellido', value: 'apellido' },
  { title: 'Telefono', value: 'telefono' },
  { title: 'Barrio', value: 'barrio' },
  { title: 'Direccion', value: 'direccion' },
  { title: 'Acciones', value: 'acciones', sortable: false },
])

const asistencias = ref([])
const notificacionRef = ref(null)
const casa_id = ref(null)
const dialogDelete = ref(false)
const ultimoCampoEscrito = ref('')
let map = null
let marker = null
let debounceTimer = null

onMounted(async () => {
  await obtenerAsistencias()

  const checkGoogleMaps = setInterval(async () => {
    if (window.google && window.google.maps) {
      await nextTick()
      initMap()
      clearInterval(checkGoogleMaps)
    }
  }, 100)
})

onUnmounted(() => {
  if (map) {
    google.maps.event.clearInstanceListeners(map)
    map = null
    marker = null
  }
})

watch(
  () => form.value.calle,
  (nuevaCalle) => {
    if (nuevaCalle && !ultimoCampoEscrito.value) ultimoCampoEscrito.value = 'calle'
    if (!nuevaCalle && ultimoCampoEscrito.value === 'calle') ultimoCampoEscrito.value = ''
    actualizarDireccion()
  },
)

watch(
  () => form.value.carrera,
  (nuevaCarrera) => {
    if (nuevaCarrera && !ultimoCampoEscrito.value) ultimoCampoEscrito.value = 'carrera'
    if (!nuevaCarrera && ultimoCampoEscrito.value === 'carrera') ultimoCampoEscrito.value = ''
    actualizarDireccion()
  },
)
watch(
  () => form.value.barrio,
  (nuevoBarrio) => {
    if (nuevoBarrio && !form.value.direccion) actualizarDireccion()
  },
)

function actualizarDireccion() {
  const { calle, carrera } = form.value
  if (!calle || (!carrera && form.value.barrio)) {
    debounceBuscarDireccion()
  }
  if (calle && carrera) {
    form.value.direccion =
      ultimoCampoEscrito.value === 'calle'
        ? `Cl. ${calle} #${carrera}`
        : `Carrera ${carrera} #${calle}`

    debounceBuscarDireccion()
  } else {
    form.value.direccion = ''
  }
}

function debounceBuscarDireccion() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    buscarDireccion()
  }, 600)
}

async function buscarDireccion() {
  let direccionCompleta = null
  if (form.value.direccion) {
    direccionCompleta = `${form.value.direccion}, San Pelayo, Córdoba, Colombia`
    console.log(direccionCompleta)
  }
  if (form.value.barrio) {
    direccionCompleta = `${form.value.barrio}, San Pelayo, Córdoba, Colombia`
  }

  const geocoder = new google.maps.Geocoder()
  geocoder.geocode({ address: direccionCompleta }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const location = results[0].geometry.location
      const lat = location.lat()
      const lng = location.lng()

      form.value.latitud = lat.toFixed(6)
      form.value.longitud = lng.toFixed(6)

      const posicion = { lat, lng }
      map.setCenter(posicion)
      map.setZoom(17)
      marker.setPosition(posicion)
    } else {
      console.warn('No se encontró la dirección dentro de San Pelayo.')
    }
  })
}

async function initMap() {
  const defaultCenter = {
    lat: parseFloat(form.value.latitud) || 8.9608,
    lng: parseFloat(form.value.longitud) || -75.8386,
  }

  map = new google.maps.Map(document.getElementById('asistencia-map'), {
    center: defaultCenter,
    zoom: 14,
  })

  marker = new google.maps.Marker({
    position: defaultCenter,
    map,
    draggable: false,
  })

  map.addListener('click', async (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    form.value.latitud = lat.toFixed(6)
    form.value.longitud = lng.toFixed(6)
    marker.setPosition({ lat, lng })

    try {
      const direccion = await obtenerDireccionPorCoordenadas(lat, lng)
      form.value.direccion = direccion
        .split(',')[0]
        .trim()
        .replace(/\s*#\s*/g, ' #')
    } catch (err) {
      console.error('Error obteniendo dirección:', err)
    }
  })
}

async function obtenerCoordenadasPorDireccion(direccion) {
  const geocoder = new google.maps.Geocoder()
  return await new Promise((resolve, reject) => {
    geocoder.geocode({ address: direccion }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        const lat = location.lat()
        const lng = location.lng()
        resolve({ lat, lng })
      } else {
        reject('Error al obtener las coordenadas')
      }
    })
  })
}

async function obtenerDireccionPorCoordenadas(lat, lng) {
  form.value.latitud = lat.toFixed(6)
  form.value.longitud = lng.toFixed(6)
  const geocoder = new google.maps.Geocoder()
  return await new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK') {
        resolve(results[0]?.formatted_address || 'Dirección no encontrada')
      } else {
        reject(status)
      }
    })
  })
}

const sendForm = () => {
  submitForm()
}

async function submitForm() {
  try {
    const payload = {
      ...form.value,
      latitud: Number(form.value.latitud),
      longitud: Number(form.value.longitud),
    }
    const response = await api.post('/asistencias', payload)
    limpiarForm()
    notificacionRef.value.mostrar('Asistencia registrada', 'success') // 👈 aquí la notificación de update

    await obtenerAsistencias()
  } catch (error) {
    console.error(error)
    notificacionRef.value.mostrar('Error al registrar la asistencia', 'error')
  }
}

function limpiarForm() {
  form.value = {
    nombre: '',
    apellido: '',
    telefono: '',
    barrio: '',
    carrera: '',
    calle: '',
    direccion: '',
    latitud: null,
    longitud: null,
  }
}

async function obtenerAsistencias() {
  try {
    const response = await api.get('/asistencias')
    asistencias.value = response.data
  } catch (error) {
    console.error('Error al obtener las asistencias:', error)
    notificacionRef.value.mostrar('Error al obtener las asistencias', 'error') // 👈 aquí la notificación de update
  }
}

async function editar(item) {
  try {
    await api.put(`/asistencias/${item.id}`, item)
    obtenerAsistencias()
    notificacionRef.value.mostrar('Asistencia actualizada', 'success') // 👈 aquí la notificación de update
  } catch (error) {
    console.error('Error al actualizar la asistencia:', error)
    notificacionRef.value.mostrar('Error al actualizar la asistencia', 'error')
  }
}

async function eliminar(item) {
  dialogDelete.value = true
  casa_id.value = item
}
async function confirmDelete() {
  try {
    await api.delete(`/asistencias/${casa_id.value.id}`)
    obtenerAsistencias()
    notificacionRef.value.mostrar('Asistencia eliminada', 'error')
  } catch (error) {
    console.error('Error al eliminar la asistencia:', error)
    notificacionRef.value.mostrar('Error al eliminar la asistencia', 'error')
  }
  dialogDelete.value = false
}
</script>

<style scoped lang="scss">
.form-container {
  background-color: var(--blur-light);
  backdrop-filter: blur(6px);
}
.list-container {
  background-color: var(--grey);
  margin-top: 1rem;
}
.icon-sm {
  font-size: 18px;
}
.map-container {
  height: 500px;
  border-radius: 12px;
}
.v-data-table .v-data-table__tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease-in-out;
}
</style>
