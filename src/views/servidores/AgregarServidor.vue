<template>
  <v-container>
    <!-- Formulario de Registro -->
    <v-row v-if="esPastor" justify="center" align="center">
      <v-col cols="12">
        <v-card
          class="pa-6 ma-4 mx-auto bg-blur"
          elevation="4"
          max-width="950"
          rounded="xl"
          transition="scale-transition"
        >
          <v-card-title class="text-h6 font-weight-bold">📝 Registrar Servidor </v-card-title>

          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <!-- Nombre -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Nombre"
                  v-model="miembro.name"
                  :rules="[rules.required]"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Apellido -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Apellido"
                  v-model="miembro.apellido"
                  :rules="[rules.required]"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Usuario -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Usuario"
                  v-model="miembro.user"
                  :rules="[rules.required]"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Password con icono dinámico -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Contraseña"
                  v-model="miembro.password"
                  :type="mostrarPassword ? 'text' : 'password'"
                  :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="mostrarPassword = !mostrarPassword"
                  :rules="[rules.required]"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Teléfono -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Teléfono"
                  v-model="miembro.telefono"
                  :rules="[rules.required]"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Cédula -->
              <v-col cols="12" md="6">
                <v-text-field
                  label="Cédula"
                  v-model="miembro.cedula"
                  :rules="[rules.required]"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Rol -->
              <v-col cols="12" md="6">
                <v-select
                  label="Rol"
                  v-model="miembro.rol"
                  :items="roles"
                  :rules="[rules.required]"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Cargo -->
              <v-col cols="12" md="6">
                <v-autocomplete
                  label="Cargo"
                  v-model="miembro.cargo"
                  :items="cargos"
                  :rules="[rules.required]"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  clearable
                />
              </v-col>

              <!-- Botón firmar -->
              <v-col cols="12" class="text-center">
                <v-btn
                  color="primary"
                  :disabled="!valid"
                  class="mt-4"
                  @click="DialogFirmarConsetimiento"
                  rounded="lg"
                  v-ripple
                >
                  Firmar Consentimiento de Voluntariado
                </v-btn>
              </v-col>

              <!-- Modal Firma -->
              <v-dialog v-model="dialogFirma" transition="dialog-transition" max-width="700">
                <FirmaPad
                  ref="firmaPad"
                  :nombre="miembro.name + ' ' + miembro.apellido"
                  :cedula="miembro.cedula || 'N/A'"
                  :actividad="'Voluntariado como ' + (miembro.cargo || '')"
                  :iglesia="'Centro de Fe y Esperanza San Pelayo'"
                  :direccion="'Carrera 7 calle 12, San Pelayo, Córdoba'"
                  :fecha="new Date().toISOString().split('T')[0]"
                  :lugar="'Sede principal'"
                  :ciudad="'San Pelayo'"
                  @firmado="guardarFirma"
                  @cancelar="cerrarDialogo"
                />
              </v-dialog>

              <!-- Botón Guardar -->
              <v-col cols="12" class="text-center">
                <v-btn
                  color="success"
                  :loading="loading"
                  :disabled="!Firmado"
                  class="mt-4"
                  @click="guardar"
                  rounded="lg"
                  v-ripple
                >
                  Guardar
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <!-- Listado -->
    <v-card class="pa-4 elevation-3 list-container bg-blur mt-6" rounded="xl">
      <div class="d-flex justify-space-between align-center mb-4">
        <h2 class="text-h6 font-weight-bold">Listado de Servidores</h2>
      </div>

      <!-- Buscador -->
      <v-text-field
        v-model="search"
        label="Buscar servidor..."
        variant="outlined"
        density="compact"
        clearable
        class="mb-"
        hide-details
        prepend-inner-icon="mdi-magnify"
      />

      <v-divider class="mb-4"></v-divider>

      <v-data-table
        :headers="headers"
        :items="servidores"
        :loading="loading"
        :search="search"
        class="elevation-1"
        density="comfortable"
        hover
        transition="fade-transition"
      >
        <!-- Estado -->
        <template #item.activo="{ item }">
          <v-chip
            small
            variant="elevated"
            :color="item.activo ? 'success' : 'error'"
            text-color="white"
            class="ma-1"
            @click="confirmDelete(item)"
          >
            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Disponibilidad -->
        <template #item.disponibilidad_aseo="{ item }">
          <v-chip
            small
            variant="elevated"
            :color="item.disponibilidad_aseo ? 'success' : 'error'"
            text-color="white"
            class="ma-1"
            @click="confirmDisponibilidad(item)"
          >
            {{ item.disponibilidad_aseo ? 'Sí' : 'No' }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template #item.acciones="{ item }">
          <v-btn icon color="red" size="small" class="mr-2" v-ripple @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo eliminar -->
    <v-dialog v-model="dialogDelete" transition="dialog-bottom-transition" max-width="600">
      <v-card>
        <v-card-title class="text-h6">Cambiar Estado del Servidor</v-card-title>
        <v-card-text>¿Estás seguro de continuar?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="dialogDelete = false">Cancelar</v-btn>
          <v-btn color="red" @click="eliminar" :loading="loading">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo disponibilidad -->
    <v-dialog v-model="dialogDisponibilidad" transition="dialog-bottom-transition" max-width="600">
      <v-card>
        <v-card-title class="text-h6">Cambiar Disponibilidad de Aseo</v-card-title>
        <v-card-text>¿Estás seguro de continuar?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="dialogDisponibilidad = false">Cancelar</v-btn>
          <v-btn color="red" @click="cambiarDisponibilidad" :loading="loading">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Notificacion ref="notificacionRef" />
  </v-container>
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
const search = ref('')
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
  { label: 'Administrador', value: 'Administrador' },
  { label: 'Intersecion', value: 'Intersección' },
  { label: 'Alabanza', value: 'Alabanza' },
  { label: 'Diacono', value: 'Diacono' },
  { label: 'Red MIA', value: 'Red MIA' },
  { label: 'Jovenes', value: 'Jovenes' },
  { label: 'Mujeres', value: 'Mujeres' },
  { label: 'Hombres', value: 'Hombres' },
  { label: 'Redes', value: 'Redes' },
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
    loading.value = true
    await api.post('/miembros/create', miembro)
    notificacionRef.value.mostrar('Nuevo servidor registrado', 'success')
    await obtenerServidores()
    resetFormulario()
  } catch (error) {
    console.error('Error al registrar el servidor:', error)
    notificacionRef.value.mostrar('Error al registrar el servidor', 'error')
  }
  loading.value = false
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

<style scoped lang="scss">
/* Fondo con efecto blur */
.bg-blur {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  transition: all 0.3s ease;
}

/* Hover en tarjetas */
.v-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.v-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

/* Inputs */
.v-text-field,
.v-select {
  transition: all 0.3s ease;
}
.v-text-field:hover,
.v-select:hover {
  transform: scale(1.02);
}

/* Botones */
.v-btn {
  transition: all 0.3s ease;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.v-btn:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* Chips con animación */
.v-chip {
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.25s ease;
}
.v-chip:hover {
  transform: scale(1.08);
  cursor: pointer;
}

/* Encabezados */
h2,
.v-card-title {
  font-weight: 700 !important;
  letter-spacing: 0.5px;
  color: #333;
}

/* Animaciones de transición */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition: all 0.4s ease;
}
.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
