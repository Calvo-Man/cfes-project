<template>
  <v-row v-if="esPastor" justify="center" align="center">
    <v-col cols="12">
      <v-card class="pa-4 ma-4 mx-auto bg-blur" elevation="3" max-width="900">
        <v-card-title class="text-h6 font-weight-bold">Registrar Servidor</v-card-title>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Nombre"
                v-model="miembro.name"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Apellido"
                v-model="miembro.apellido"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Usuario"
                v-model="miembro.user"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Contraseña"
                v-model="miembro.password"
                :type="mostrarPassword ? 'text' : 'password'"
                :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="mostrarPassword = !mostrarPassword"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                label="Teléfono"
                v-model="miembro.telefono"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Cédula"
                v-model="miembro.cedula"
                :rules="[rules.required]"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                label="Rol"
                v-model="miembro.rol"
                :items="roles"
                :rules="[rules.required]"
                item-title="label"
                item-value="value"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Cargo"
                v-model="miembro.cargo"
                :items="cargos"
                :rules="[rules.required]"
                item-title="label"
                item-value="value"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" class="text-center">
              <v-btn
                color="primary"
                :disabled="!valid"
                class="mt-4"
                @click="DialogFirmarConsetimiento"
              >
                Firmar Consentimiento de voluntariado
              </v-btn>
            </v-col>
            <v-dialog v-model="dialogFirma">
              <FirmaPad
                ref="firmaPad"
                :nombre="miembro.name + ' ' + miembro.apellido"
                :cedula="miembro.cedula || 'N/A'"
                :actividad="'Voluntariado como ' + (miembro.cargo || '')"
                :iglesia="'Centro de Fe y Esperanza San Pelayo'"
                :direccion="'Dirección de la iglesia aquí'"
                :fecha="new Date().toISOString().split('T')[0]"
                :lugar="'Sede principal'"
                :ciudad="'San Pelayo'"
                @firmado="guardarFirma"
                @cancelar="cerrarDialogo"
              />
            </v-dialog>

            <v-col cols="12" class="text-center">
              <v-btn color="primary" :disabled="!Firmado" class="mt-4" @click="guardar">
                Guardar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
  <v-card class="pa-4 elevation-2 list-container bg-blur">
    <h2 class="text-h6 font-weight-bold mb-4">Listado de Servidores</h2>

    <v-data-table
      :headers="headers"
      :items="servidores"
      :loading="loading"
      class="elevation-1"
      density="comfortable"
    >
      <template #item.activo="{ item }">
        <v-chip
          small
          variant="outlined"
          :color="item.activo ? 'success' : 'error'"
          label
          text-color="white"
          class="ma-1 v-hover"
          @click="confirmDelete(item)"
        >
          {{ item.activo ? 'Activo' : 'Inactivo' }}
        </v-chip>
      </template>
      <template #item.disponibilidad_aseo="{ item }">
        <v-chip
          small
          variant="outlined"
          :color="item.disponibilidad_aseo ? 'success' : 'error'"
          label
          text-color="white"
          class="ma-1 v-hover"
          @click="confirmDisponibilidad(item)"
        >
          {{ item.disponibilidad_aseo ? 'Si' : 'No' }}
        </v-chip>
      </template>
      <template #item.acciones="{ item }">
        <v-btn icon color="red" size="x-small" class="mr-2" @click="confirmDelete(item)">
          <i class="material-icons icon-sm">delete</i>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
  <Notificacion ref="notificacionRef" />
  <v-dialog v-model="dialogDelete" max-width="900">
    <v-card>
      <v-card-title class="text-h5">Cambiar Estado del Servidor</v-card-title>
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
  <v-dialog v-model="dialogDisponibilidad" max-width="900">
    <v-card>
      <v-card-title class="text-h5">Cambiar Disponibilidad de Aseo</v-card-title>
      <v-card-text>
        <p>¿Estas seguro de continuar?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="green" variant="elevated" @click="dialogDisponibilidad = false">
          Cancelar
        </v-btn>
        <v-btn color="red" variant="elevated" @click="cambiarDisponibilidad"> Continuar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <Notificacion ref="notificacionRef" />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'
import FirmaPad from '@/components/FirmaPad.vue'

const loading = ref(false)
const form = ref(null)
const valid = ref(false)
const mostrarPassword = ref(false)
import { useUserStore } from '@/store/userStore'
const notificacionRef = ref(null)
const dialogFirma = ref(false)
const dialogDisponibilidad = ref(false)
const Firmado = ref(false)

const userStore = useUserStore()
const esPastor = ref(userStore.user?.rol === 'pastor' || userStore.user?.rol === 'administrador')

const miembro = reactive({
  name: '',
  apellido: '',
  user: '',
  password: '',
  telefono: '',
  cedula: '',
  rol: null,
  cargo: null,
  firma: null,
})
const headers = computed(() => {
  const baseHeaders = [
    { title: 'Nombre', value: 'name' },
    { title: 'Apellido', value: 'apellido' },
    { title: 'Teléfono', value: 'telefono' },
    { title: 'Cedula', value: 'cedula' },
    { title: 'Rol', value: 'rol' },
    { title: 'Cargo', value: 'cargo' },
    { title: 'Dia de aseo', value: 'horario_aseo', sortable: true },
    { title: 'Disponibilidad para aseo', value: 'disponibilidad_aseo', sortable: true },
    { title: 'Estado', value: 'activo', sortable: true },
  ]

  // Si es pastor, añade columna de acciones
  if (esPastor.value) {
    baseHeaders.push({
      title: 'Acciones',
      value: 'acciones',
      sortable: false,
    })
  }

  return baseHeaders
})

const servidores = ref([])
const roles = [
  { label: 'Pastor', value: 'pastor' },
  { label: 'Servidor', value: 'servidor' },
  { label: 'Líder', value: 'lider' },
  { label: 'Administrador', value: 'administrador' },
]
const cargos = [
  { label: 'Alabanza', value: 'Alabanza' },
  { label: 'Diacono', value: 'Diacono' },
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Red MIA', value: 'Red MIA' },
  { label: 'Jovenes', value: 'Jovenes' },
  { label: 'Ninguno', value: 'Ninguno' },
]

const rules = {
  required: (v) => !!v || 'Este campo es obligatorio',
}
onMounted(() => {
  obtenerServidores()
})

async function guardar() {
  const isValid = await form.value.validate()
  if (!isValid) return
  try {
    await api.post('/miembros/create', miembro)
    notificacionRef.value.mostrar('Nuevo servidor registrado', 'success')
    await obtenerServidores()
    resetFormulario()
  } catch (error) {
    console.error('Error al registrar el servidor:', error)
    notificacionRef.value.mostrar('Error al registrar el servidor', 'error')
  }
}
function DialogFirmarConsetimiento() {
  dialogFirma.value = true
}
const cerrarDialogo = () => {
  dialogFirma.value = false
}

const guardarFirma = (firmaBase64) => {
  Firmado.value = true
  console.log('Firma recibida:', firmaBase64)
  miembro.firma = firmaBase64
  // Aquí puedes guardar la firma o enviarla al backend
  dialogFirma.value = false
}

function resetFormulario() {
  miembro.name = ''
  miembro.apellido = ''
  miembro.user = ''
  miembro.password = ''
  miembro.telefono = ''
  miembro.cedula = ''
  miembro.rol = null
  miembro.cargo = null
  Firmado.value = false
}

async function obtenerServidores() {
  try {
    const response = await api.get('/miembros')
    servidores.value = response.data.miembros
  } catch (error) {
    console.error('Error al obtener los servidores:', error)
  }
}

const miembroIdToDelete = ref(null)
const dialogDelete = ref(false)
async function confirmDelete(item) {
  miembroIdToDelete.value = item
  dialogDelete.value = true
}
async function confirmDisponibilidad(item) {
  miembroIdToDelete.value = item
  dialogDisponibilidad.value = true
}
async function cambiarDisponibilidad() {
  try {
    const response = await api.patch(
      `/miembros/cambiarDisponibilidadDeAseo/${miembroIdToDelete.value.id}`,
    )
    obtenerServidores()
    notificacionRef.value.mostrar(response.data.message, response.data.color)
  } catch (error) {
    console.error('Error al cambiar la disponibilidad:', error)
  }
  dialogDisponibilidad.value = false
}
async function eliminar() {
  try {
    const response = await api.delete(`/miembros/cambiarEstado/${miembroIdToDelete.value.id}`)
    obtenerServidores()
    notificacionRef.value.mostrar(response.data.message, response.data.color)
  } catch (error) {
    console.error('Error al eliminar el miembro:', error)
  }
  dialogDelete.value = false
}
</script>

<style scoped>
html,
body,
.v-container.fill-height {
  height: 100%;
}
.bg-blur {
  background-color: var(--blur-light);
}
</style>
