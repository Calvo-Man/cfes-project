<template>
  <v-container>
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
    <!-- Tabla de Asistencias -->
    <v-card class="pa-4 elevation-2 list-container rounded-xl mt-6">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h6 font-weight-bold">Listado de Nuevas Asistencias</h2>
      </div>
      <!-- Buscador -->
      <v-text-field
        v-model="search"
        label="Buscar asistencia..."
        variant="outlined"
        clearable
        density="compact"
        prepend-inner-icon="mdi-magnify"
        hide-details
        class="mb-4"
      />

      <v-data-table
        :headers="headersAsistencias"
        :items="asistencias"
        :loading="loading"
        :search="search"
        class="elevation-1 custom-table"
        density="comfortable"
      >
        <template #item.recurrente="{ item }">
          <v-chip
            small
            variant="outlined"
            :color="item.recurrente ? 'success' : 'error'"
            label
            class="text-capitalize"
            @click="dialogConfirmRecurrente(item.id)"
          >
            {{ item.recurrente ? 'Si' : 'No' }}
          </v-chip>
        </template>
        <!-- Columna: Acciones -->
        <template #item.acciones="{ item }">
          <v-btn
            icon
            color="green"
            size="x-small"
            class="mr-2 animated-icon"
            @click="verPosicion(item.id)"
          >
            <i class="material-icons icon-sm">visibility</i>
          </v-btn>
          <v-btn
            v-if="userStore.user.rol === 'pastor' || userStore.user.rol === 'administrador'"
            icon
            color="primary"
            size="x-small"
            class="mr-2 animated-icon"
            @click="DialogUpdate(item)"
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
  </v-container>
  <!-- Notificación -->
  <Notificacion ref="notificacionRef" />
  <!-- Diálogo Actualizar-->
  <v-dialog v-model="dialogUpdate" max-width="800">
    <v-card class="pa-6 elevation-3 mx-auto form-container rounded-xl">
      <h2 class="text-h5 font-weight-bold mb-4 d-flex align-center">📝 Registrar asistencia</h2>
      <v-form @submit.prevent="updateForm">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="formUpdate.nombre"
              label="Nombre"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formUpdate.apellido"
              label="Apellido"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formUpdate.telefono"
              label="Teléfono"
              type="tel"
              variant="outlined"
              density="comfortable"
              required
            />
          </v-col>

          <v-col cols="12">
            <v-select
              v-model="formUpdate.categoria"
              :items="categoria"
              label="Categoría"
              variant="outlined"
              density="comfortable"
              item-value="value"
              item-title="label"
            />
          </v-col>

          <v-col cols="12" class="text-right">
            <v-btn
              color="success"
              rounded="lg"
              elevation="2"
              @click="dialogUpdate = false"
              class="mr-2"
            >
              Cancelar
            </v-btn>
            <v-btn color="primary" type="submit" rounded="lg" elevation="2"> Guardar </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-dialog>

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
  <v-dialog v-model="dialogRecurrente" max-width="500">
    <v-card class="rounded-xl">
      <v-card-title class="text-h5 font-weight-bold">
        Actualizar asistencia a recurrente
      </v-card-title>
      <v-card-text>
        <p>¿Estás seguro de que deseas continuar?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="success" variant="elevated" @click="dialogRecurrente = false">
          Cancelar
        </v-btn>
        <v-btn color="red" variant="elevated" @click="confirmRecurrente"> Confirmar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch, onUnmounted, nextTick } from 'vue'
import Notificacion from '@/components/Notificacion.vue'
import { useUserStore } from '@/store/userStore'

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
let infoWindow = null
const search = ref('')
const dialogRecurrente = ref(false)

const formUpdate = ref({
  id: null,
  nombre: '',
  apellido: '',
  telefono: '',
  //barrio: '',
  //carrera: '',
  //calle: '',
  //direccion: '',
  categoria: '',
  //latitud: null,
  //longitud: null,
})

const loading = ref(false)

const categoria = [
  { label: 'Niños', value: 'Niños' },
  { label: 'Jovenes', value: 'Jovenes' },
  { label: 'Mujeres', value: 'Mujeres' },
  { label: 'Hombres', value: 'Hombres' },
]

const headersAsistencias = ref([
  { title: 'Nombre', value: 'nombre' },
  { title: 'Apellido', value: 'apellido' },
  { title: 'Telefono', value: 'telefono' },
  { title: 'Categoria', value: 'categoria' },
  { title: 'Recurrente', value: 'recurrente' },
  { title: 'Barrio', value: 'barrio' },
  { title: 'Direccion', value: 'direccion' },
  { title: 'Acciones', value: 'acciones', sortable: false },
])

const asistencias = ref([])
let marcadoresExistentes = []

const userStore = useUserStore()
const notificacionRef = ref(null)
const casa_id = ref(null)
const dialogDelete = ref(false)
const dialogUpdate = ref(false)
const ultimoCampoEscrito = ref('')
let map = null
let marker = null
let debounceTimer = null

onMounted(async () => {
  await obtenerAsistencias()
  await renderMarcadores()
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
function verPosicion(id) {
  const persona = asistencias.value.find((asistencia) => asistencia.id === id)
  if (!persona || !map) return

  const lat = parseFloat(persona.latitud)
  const lng = parseFloat(persona.longitud)
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
    <h4 style="margin: 0 0 6px; font-size: 18px;">👤 ${persona.nombre}</h4>
    <div style="margin-bottom: 8px;">
      <p style="margin: 4px 0;"><strong>📍 Dirección:</strong> ${persona.direccion || 'No disponible'}</p>
      <p style="margin: 4px 0;"><strong>👤 Categoria:</strong> ${persona.categoria}</p>
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
async function renderMarcadores() {
  marcadoresExistentes.forEach((m) => m.setMap(null))
  marcadoresExistentes = asistencias.value.map((asistencia) => {
    return new google.maps.Marker({
      position: {
        lat: parseFloat(asistencia.latitud),
        lng: parseFloat(asistencia.longitud),
      },
      map,
      title: casa.nombre,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    })
  })
}
async function confirmRecurrente() {
  try {
    const response = await api.patch(`/asistencias/setRecurrente/${form.value.id}`)
    notificacionRef.value.mostrar(response.data.message, response.data.color)
    obtenerAsistencias()
    dialogRecurrente.value = false
  } catch (error) {
    console.error(error)
    notificacionRef.value.mostrar('Error al marcar como recurrente', 'error')
    dialogRecurrente.value = false
  }
}
function dialogConfirmRecurrente(item) {
  form.value.id = item
  dialogRecurrente.value = true
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
const updateForm = () => {
  updateAsistencia()
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
    notificacionRef.value.mostrar(error.response.data.message, 'error')
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
    const response = await api.get('/asistencias/findNoRecurrentes')
    asistencias.value = response.data
  } catch (error) {
    console.error('Error al obtener las asistencias:', error)
    notificacionRef.value.mostrar('Error al obtener las asistencias', 'error') // 👈 aquí la notificación de update
  }
}

function DialogUpdate(item) {
  dialogUpdate.value = true
  formUpdate.value.id = item.id
  formUpdate.value.nombre = item.nombre
  formUpdate.value.apellido = item.apellido
  formUpdate.value.telefono = item.telefono
  formUpdate.value.categoria = item.categoria
}

async function updateAsistencia() {
  try {
    await api.patch(`/asistencias/${formUpdate.value.id}`, formUpdate.value)
    obtenerAsistencias()
    notificacionRef.value.mostrar('Asistencia actualizada', 'success') // 👈 aquí la notificación de update
    dialogUpdate.value = false
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

.map-container {
  height: 500px;
  border-radius: 12px;
}
.v-data-table .v-data-table__tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transition: background-color 0.2s ease-in-out;
}
/* Contenedor general de las tablas */
.list-container {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
  transition:
    box-shadow 0.3s ease,
    transform 0.2s ease;
}

.list-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* Estilos de la tabla */
.custom-table {
  border-radius: 12px;
  overflow: hidden;
  font-size: 0.9rem;
}

.custom-table thead {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #374151;
}

.custom-table tbody tr:hover {
  background-color: #f0f9ff;
  transition: background-color 0.2s ease;
}

/* Íconos de acción con animación */
.animated-icon {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.animated-icon:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* Tamaño más compacto para íconos */
.icon-sm {
  font-size: 18px;
}
</style>
