<template>
  <div class="container-div">
    <v-row class="mb-1">
      <!-- Formulario -->
      <v-col cols="12" md="6">
        <v-card class="pa-6 elevation-3 form-container">
          <h2 class="text-h5 font-weight-bold mb-4">Agregar casa de fe</h2>
          <v-form @submit.prevent="sendForm">
            <v-row dense>
              <v-col cols="12">
                <v-text-field v-model="form.nombre" label="Nombre" required />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="form.direccion" label="Dirección" required />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.encargadosId"
                  :items="encargados.miembros"
                  item-value="id"
                  :item-title="(item) => `${item.name} ${item.apellido} - ${item.rol}`"
                  label="Encargados"
                  multiple
                />
              </v-col>
              <v-col cols="12" class="text-right">
                <v-btn color="primary" type="submit">Submit</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>

      <!-- Mapa -->
      <v-col cols="12" md="6">
        <div id="google-map" class="map-container"></div>
      </v-col>
    </v-row>

    <v-card v-if="casas.length > 0" class="pa-4 elevation-2 list-container">
      <h2 class="text-h6 font-weight-bold mb-4">Listado de Casas de Fe</h2>

      <v-data-table :headers="headers" :items="casas" class="elevation-1" density="comfortable">
        <template #item.encargadosId="{ item }">
          <div>
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
          </div>
        </template>

        <template #item.acciones="{ item }">
          <v-btn icon color="green" size="x-small" class="mr-2" @click="verCasa(item.id)">
            <i class="material-icons icon-sm">visibility</i>
          </v-btn>
          <v-btn icon color="primary" class="mr-2" size="x-small" @click="editar(item)">
            <i class="material-icons icon-sm">edit</i>
          </v-btn>
          <v-btn icon color="red" size="x-small" class="mr-2" @click="confirmDelete(item)">
            <i class="material-icons icon-sm">delete</i>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
  <Notificacion ref="notificacionRef" />

  <v-dialog v-model="dialogDelete" max-width="600">
    <v-card>
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

const headers = ref([
  { title: 'Nombre', value: 'nombre' },
  { title: 'Dirección', value: 'direccion' },
  { title: 'Encargados', value: 'encargadosId' },
  { title: 'Acciones', value: 'acciones', sortable: false },
])
const notificacionRef = ref(null)
const dialogDelete = ref(false)
const casaIdToDelete = ref(null)
const casas = ref([])
const encargados = ref([])
const form = ref({
  nombre: '',
  longitud: null,
  latitud: null,
  direccion: '',
  encargadosId: [],
})

let map
let marker
let marcadoresExistentes = []
let infoWindow = null

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
  const geocoder = new google.maps.Geocoder()
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve(results[0].formatted_address)
      } else {
        reject('Error en geocodificación: ' + status)
      }
    })
  })
}

function initMap() {
  const lat = parseFloat(form.value.latitud) || 8.960823
  const lng = parseFloat(form.value.longitud) || -75.838673
  const center = { lat, lng }

  map = new google.maps.Map(document.getElementById('google-map'), {
    center,
    zoom: 13,
  })

  marker = new google.maps.Marker({
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

function renderMarcadores() {
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
    <div style="min-width: 200px;">
      <h3>Casa de Fé ${casa.nombre}</h3>
      <a href="${url}" target="_blank" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
        Ver en Google Maps
      </a>
    </div>
  `)
  infoWindow.open(map, marker)
}
</script>

<style scoped>
.form-container {
  width: 100%;
  background-color: var(--blur-light);
}
.map-container {
  height: 500px;
  border-radius: 8px;
}
.icon-sm {
  font-size: 18px;
}
.list-container {
  background-color: var(--blur-light);
}
.container-div {
  padding: 20px;
}
</style>
