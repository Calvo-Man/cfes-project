<template>
  <div class="container-div">
    <v-row class="mb-1">
      <!-- Formulario -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 elevation-3 form-container rounded-xl">
          <h2 class="text-h5 font-weight-bold mb-4">Agregar casa de fe</h2>
          <v-form @submit.prevent="sendForm">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model="form.nombre"
                  label="Nombre de la casa de fe"
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.carrera"
                  label="Carrera"
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.calle"
                  label="Calle"
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.direccion"
                  label="Dirección completa"
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                  readonly
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.barrio"
                  label="Barrio"
                  type="text"
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.categoria"
                  :items="categories"
                  item-value="value"
                  item-title="label"
                  label="Categoria de la casa de fe"
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                />
              </v-col>
              <v-col cols="12">
                <!-- Encargados con búsqueda y selección múltiple -->
                <v-autocomplete
                  v-model="form.encargadosId"
                  :items="encargados.miembros"
                  :item-title="(item) => `${item.name} ${item.apellido} - ${item.rol}`"
                  item-value="id"
                  label="Seleccionar encargados"
                  multiple
                  chips
                  clearable
                  variant="outlined"
                  density="comfortable"
                  class="custom-input"
                  hide-selected
                />
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn color="primary" type="submit" class="animated-btn">Submit</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>

      <!-- Mapa -->
      <v-col cols="12" md="6">
        <div id="google-map" class="map-container shadow-sm rounded-xl"></div>
      </v-col>
    </v-row>

    <!-- Listado -->
    <v-card v-if="casas.length > 0" class="pa-4 elevation-2 list-container rounded-xl mt-6">
      <h2 class="text-h6 font-weight-bold mb-4">Listado de Casas de Fe</h2>

      <v-data-table
        :headers="headers"
        :items="casas"
        :loading="loading"
        class="elevation-1 custom-table"
        density="comfortable"
      >
        <template #item.encargadosId="{ item }">
          <div>
            <v-fade-transition group>
              <v-chip
                v-for="(encargados, index) in item.encargadosId"
                :key="index"
                small
                class="ma-1"
                color="blue lighten-4"
                text-color="blue darken-4"
              >
                {{ encargados.name }} {{ encargados.apellido }}
              </v-chip>
            </v-fade-transition>
          </div>
        </template>

        <template #item.acciones="{ item }">
          <v-btn
            icon
            color="green"
            size="x-small"
            class="mr-2 animated-icon"
            @click="verCasa(item.id)"
          >
            <i class="material-icons icon-sm">visibility</i>
          </v-btn>
          <v-btn
            v-if="userStore.user.rol === 'pastor' || userStore.user.rol === 'administrador'"
            icon
            color="primary"
            class="mr-2 animated-icon"
            size="x-small"
            @click="editar(item)"
          >
            <i class="material-icons icon-sm">edit</i>
          </v-btn>
          <v-btn
            v-if="userStore.user.rol === 'pastor' || userStore.user.rol === 'administrador'"
            icon
            color="red"
            size="x-small"
            class="mr-2 animated-icon"
            @click="confirmDelete(item)"
          >
            <i class="material-icons icon-sm">delete</i>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
  <Notificacion ref="notificacionRef" />

  <!-- Diálogo de confirmación -->
  <v-dialog
    v-model="dialogDelete"
    v-if="userStore.user.rol === 'pastor' || userStore.user.rol === 'administrador'"
    max-width="600"
  >
    <v-card class="rounded-xl">
      <v-card-title class="text-h5"> Eliminar casa de fe </v-card-title>
      <v-card-text>
        <p>¿Estas seguro de continuar?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="green" variant="elevated" @click="dialogDelete = false"> Cancelar </v-btn>
        <v-btn color="red" variant="elevated" @click="eliminar"> Continuar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'
import { useUserStore } from '@/store/userStore'

const headers = ref([
  { title: 'Nombre', value: 'nombre' },
  { title: 'Categoria', value: 'categoria' },
  { title: 'Dirección', value: 'direccion' },
  { title: 'Encargados', value: 'encargadosId' },
  { title: 'Acciones', value: 'acciones', sortable: false },
])
const categories = [
  { label: 'Niños', value: 'Niños' },
  { label: 'Jovenes', value: 'Jovenes' },
  { label: 'Adultos', value: 'Adultos' },
]
const loading = ref(false)
const notificacionRef = ref(null)
const dialogDelete = ref(false)
const casaIdToDelete = ref(null)
const casas = ref([])
const encargados = ref([])
const userStore = useUserStore()
const ultimoCampoEscrito = ref('')
const form = ref({
  nombre: '',
  longitud: null,
  latitud: null,
  direccion: '',
  barrio: '',
  carrera: '',
  calle: '',
  encargadosId: [],
  categoria: '',
})

let map
let marker
let marcadoresExistentes = []
let infoWindow = null
let debounceTimer = null

onMounted(async () => {
  getMembers()
  initMap()
  await getCasas()
  renderMarcadores()
})

function esperarGoogleMaps() {
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(check)
        resolve()
      }
    }, 100)
  })
}

async function getCasas() {
  try {
    const response = await api.get('/casas-de-fe')
    casas.value = response.data
  } catch (error) {
    console.error('Error al obtener las casas:', error)
    casas.value = []
  }
}

async function getMembers() {
  try {
    const response = await api.get('/miembros')
    encargados.value = response.data
  } catch (error) {
    console.error('Error al obtener los encargados:', error)
    encargados.value = []
  }
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

async function initMap() {
  const lat = parseFloat(form.value.latitud) || 8.960823
  const lng = parseFloat(form.value.longitud) || -75.838673
  const center = { lat, lng }

  map = await new google.maps.Map(document.getElementById('google-map'), {
    center,
    zoom: 13,
  })

  marker = await new google.maps.Marker({
    position: center,
    map,
    draggable: false,
    icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  })

  map.addListener('click', async (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    form.value.latitud = lat.toFixed(6)
    form.value.longitud = lng.toFixed(6)
    marker.setPosition({ lat, lng })

    try {
      const direccion = await obtenerDireccionPorCoordenadas(lat, lng)
      form.value.direccion = direccion.split(',')[0]
    } catch (error) {
      console.error('Error al obtener dirección:', error)
    }
  })
}

async function renderMarcadores() {
  marcadoresExistentes.forEach((m) => m.setMap(null))
  marcadoresExistentes = casas.value.map((casa) => {
    return new google.maps.Marker({
      position: {
        lat: parseFloat(casa.latitud),
        lng: parseFloat(casa.longitud),
      },
      map,
      title: casa.nombre,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    })
  })
}

watch(
  () => [form.value.latitud, form.value.longitud],
  ([latStr, lngStr]) => {
    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)
    if (!isNaN(lat) && !isNaN(lng) && map && marker) {
      const newPos = { lat, lng }
      marker.setPosition(newPos)
      map.setCenter(newPos)
    }
  },
)
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
    const response = await api.post('/casas-de-fe', payload)
    form.value = {
      nombre: '',
      longitud: null,
      latitud: null,
      direccion: '',
      encargadosId: [],
    }
    notificacionRef.value.mostrar('Casa de fe registrada', 'success') // 👈 aquí la notificación de update

    await getCasas()
    renderMarcadores()
  } catch (error) {
    console.error('Error al enviar el formulario:', error)
    notificacionRef.value.mostrar('Error al registrar la casa de fe', 'error')
  }
}

async function eliminar() {
  try {
    await api.delete(`/casas-de-fe/${casaIdToDelete.value.id}`)
    notificacionRef.value.mostrar('Casa de fe eliminada', 'error') // 👈 aquí la notificación de update

    await getCasas()
    renderMarcadores()
  } catch (error) {
    console.error('Error al eliminar la casa:', error)
  }

  dialogDelete.value = false
}
function confirmDelete(item) {
  casaIdToDelete.value = item
  dialogDelete.value = true
}

function verCasa(id) {
  const casa = casas.value.find((c) => c.id === id)
  if (!casa || !map) return

  const lat = parseFloat(casa.latitud)
  const lng = parseFloat(casa.longitud)
  const posicion = { lat, lng }

  map.setCenter(posicion)
  map.setZoom(16)
  marker.setPosition(posicion)

  if (!infoWindow) {
    infoWindow = new google.maps.InfoWindow()
  }
  const url = `https://www.google.com/maps?q=${lat},${lng}`
  infoWindow.setContent(`
  <div style="min-width: 300px; max-width: 380px; font-family: 'Roboto', sans-serif; color: #2c3e50; padding: 8px;">
    <h2 style="margin: 0 0 6px; font-size: 18px;">🏠 Casa de Fe</h2>
    <p style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">${casa.nombre}</p>

    <div style="margin-bottom: 8px;">
      <p style="margin: 4px 0;"><strong>📍 Dirección:</strong> ${casa.direccion || 'No disponible'}</p>
      <p style="margin: 4px 0;"><strong>👤 Encargado(s):</strong> ${casa.encargadosId.map((encargado) => encargado.name).join(', ') || 'Sin asignar'}</p>
      <p style="margin: 4px 0;"><strong>👥 Miembros:</strong> ${casa.miembros?.length ?? 0}</p>
    </div>

    <a href="${url}" target="_blank"
       style="
         display: inline-block;
         background-color: #1976d2;
         color: white;
         padding: 8px 14px;
         text-decoration: none;
         border-radius: 6px;
         font-weight: 500;
         transition: background-color 0.3s;
       "
       onmouseover="this.style.backgroundColor='#125ea2'"
       onmouseout="this.style.backgroundColor='#1976d2'">
      🌍 Ver en Google Maps
    </a>
  </div>
`)

  infoWindow.open(map, marker)
}
</script>

<style scoped>
.form-container,
.list-container {
  background-color: var(--blur-light);
  transition: transform 0.2s ease-in-out;
}
.form-container:hover,
.list-container:hover {
  transform: translateY(-2px);
}

.map-container {
  height: 500px;
  border-radius: 12px;
  transition: box-shadow 0.3s;
}
.map-container:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.icon-sm {
  font-size: 18px;
}

.container-div {
  padding: 20px;
}

/* Animación en chips */
.v-chip {
  transition: all 0.3s ease;
}
.v-chip:hover {
  transform: scale(1.05);
}

/* Animación en botones */
.animated-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px 16px;
}
.animated-btn:hover {
  transform: scale(1.05);
}

/* Icon buttons animados */
.animated-icon {
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}
.animated-icon:hover {
  transform: scale(1.2);
}

/* Tabla con hover */
.custom-table tbody tr:hover {
  background-color: rgba(25, 118, 210, 0.08);
}
</style>
