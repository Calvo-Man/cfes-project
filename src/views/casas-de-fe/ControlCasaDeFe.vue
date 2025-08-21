<template>
  <v-row justify="center" class="mt-10">
    <v-col cols="12" md="6" class="card-container text-center">
      <v-card v-if="casas.length == 0">
        <v-slide-y-transition>
          <v-card color="primary" dark>
            <v-card-title class="justify-center">
              <v-icon class="mr-2">mdi-church</v-icon> No hay casas de fé registradas
            </v-card-title>
            <v-card-text>
              Registra tú casa de fe y comienza a gestionarla.
              <br />
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn to="/casas-de-fe/agregar" color="white" text>Registrar</v-btn>
            </v-card-actions>
          </v-card>
        </v-slide-y-transition>
      </v-card>
    </v-col>
  </v-row>
  <v-container>
    <v-expansion-panels>
      <v-expansion-panel
        v-for="(casa, index) in casas"
        :key="index"
        class="mb-3 rounded-xl elevation-2"
      >
        <!-- Panel título -->
        <v-expansion-panel-title v-slot="{ expanded }">
          <v-row no-gutters class="align-center flex-wrap">
            <!-- Nombre de la casa -->
            <v-col cols="12" sm="4" class="d-flex align-center mb-2 mb-sm-0">
              <v-icon color="primary" class="mr-2">mdi-home-city</v-icon>
              <v-chip color="blue-darken-4" variant="outlined" label>{{ casa.nombre }}</v-chip>
            </v-col>

            <v-col cols="12" sm="8">
              <v-fade-transition leave-absolute>
                <span v-if="expanded" class="text-body-1 font-weight-bold text-primary">
                  Información de la Casa de Fe
                </span>

                <v-row v-else no-gutters class="align-center flex-wrap">
                  <!-- Encargados -->
                  <v-col cols="12" sm="6" class="mb-1">
                    <v-chip
                      v-for="encargado in casa.encargadosId"
                      :key="encargado.id"
                      class="ma-1"
                      color="deep-purple-darken-4"
                      label
                      variant="outlined"
                      size="small"
                    >
                      👤 {{ encargado.name }} {{ encargado.apellido }}
                    </v-chip>
                  </v-col>

                  <!-- Miembros y pendientes -->
                  <v-col cols="12" sm="6" class="d-flex flex-wrap">
                    <v-chip color="primary" variant="outlined" size="small" class="mr-2 mb-1">
                      👥 {{ casa.miembros.length }} miembros
                    </v-chip>
                    <v-chip
                      :color="casa.asistencias.length > 0 ? 'red-darken-4' : 'green-darken-4'"
                      :text-color="casa.asistencias.length > 0 ? 'red-darken-2' : 'green-darken-2'"
                      label
                      variant="outlined"
                      size="small"
                      class="mb-1"
                    >
                      🔔 {{ casa.asistencias.length }} pendientes
                    </v-chip>
                  </v-col>
                </v-row>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-expansion-panel-title>

        <!-- Panel contenido -->
        <v-expansion-panel-text>
          <v-row>
            <!-- Información de la casa -->
            <v-col cols="12" md="6">
              <v-card class="pa-3 mb-4 rounded-lg" elevation="2">
                <h3 class="mb-2">📍 Información</h3>
                <p><strong>Nombre:</strong> {{ casa.nombre }}</p>
                <p>
                  <strong>Dirección:</strong>
                  <v-chip class="ma-1" color="blue-darken-4" label size="small">
                    Calle 12 #7-40
                  </v-chip>
                </p>
                <p>
                  <strong>Barrio:</strong>
                  <v-chip class="ma-1" color="blue-darken-4" label size="small">
                    {{ casa.barrio }}
                  </v-chip>
                </p>
              </v-card>
            </v-col>

            <!-- Encargados -->
            <v-col cols="12" md="6">
              <v-card class="pa-3 mb-4 rounded-lg" elevation="2">
                <h3 class="mb-2">👤 Encargados</h3>
                <v-chip
                  v-for="encargado in casa.encargadosId"
                  :key="encargado.id"
                  class="ma-1"
                  color="deep-purple-darken-4"
                  label
                >
                  {{ encargado.name }} {{ encargado.apellido }} - {{ encargado.rol }}
                </v-chip>
              </v-card>
            </v-col>

            <!-- Miembros -->
            <v-col cols="12">
              <v-card class="pa-3 mb-4 rounded-lg" elevation="2" max-height="400">
                <div class="d-flex justify-space-between align-center mb-2">
                  <h3>🧑‍🤝‍🧑 Miembros</h3>
                  <v-btn
                    v-if="userStore.user.rol === 'pastor'"
                    variant="outlined"
                    @click="openDialog(casa.id)"
                    >Agregar</v-btn
                  >
                </div>

                <!-- Contenedor para scroll horizontal -->
                <div style="overflow-x: auto">
                  <v-list dense style="min-width: 600px">
                    <!-- min-width para forzar scroll si es necesario -->
                    <v-list-item
                      v-for="miembro in casa.miembros"
                      :key="miembro.id"
                      class="rounded-lg"
                    >
                      <v-icon color="primary" small class="mr-1">mdi-account</v-icon>
                      {{ miembro.nombre }} {{ miembro.apellido }}

                      <v-icon small class="mr-1">mdi-phone</v-icon>
                      {{ miembro.telefono }}

                      <v-icon small class="mr-1">mdi-home</v-icon>
                      {{ miembro.direccion }}
                    </v-list-item>
                  </v-list>
                </div>
              </v-card>
            </v-col>

            <!-- Asistencias -->
            <v-col cols="12">
              <v-card class="pa-3 mb-4 rounded-lg" elevation="2" max-height="400">
                <h3 class="mb-2">🔔 Asistencias Pendientes</h3>

                <!-- Contenedor con scroll horizontal -->
                <div style="overflow-x: auto">
                  <v-list dense style="min-width: 700px">
                    <!-- Ajusta el ancho mínimo según necesites -->
                    <v-list-item
                      v-for="asistencia in casa.asistencias"
                      :key="asistencia.id"
                      class="rounded-lg"
                    >
                      <v-icon color="primary" small class="mr-1">mdi-account</v-icon>
                      {{ asistencia.nombre }} {{ asistencia.apellido }}

                      <v-icon color="primary" small class="ml-2 mr-1">mdi-phone</v-icon>
                      {{ asistencia.telefono }}

                      <v-icon color="primary" small class="ml-2 mr-1">mdi-home</v-icon>
                      {{ asistencia.direccion }}
                    </v-list-item>
                  </v-list>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
  <v-dialog v-model="dialog" v-if="userStore.user.rol === 'pastor'" max-width="500">
    <v-card>
      <v-card-title>Registrar Miembro</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            label="Nombre"
            v-model="nombre"
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />
          <v-text-field
            label="Apellido"
            v-model="apellido"
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />
          <v-text-field
            label="Teléfono"
            v-model="telefono"
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />
          <v-text-field
            label="Dirección"
            v-model="direccion"
            :rules="[(v) => !!v || 'Campo obligatorio']"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" @click="guardar" :disabled="!valid">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogAsistencia" v-if="userStore.user.rol === 'pastor'" max-width="500">
    <v-card>
      <v-card-title>Confirmar Asistencia</v-card-title>
      <v-card-text>
        <p>¿Estas seguro de confirmar la asistencia a esta persona?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogAsistencia = false">Cancelar</v-btn>
        <v-btn color="primary" @click="addAsistenciaToMember">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogDeleteMiembro" v-if="userStore.user.rol === 'pastor'" max-width="500">
    <v-card>
      <v-card-title>Eliminar Miembro</v-card-title>
      <v-card-text>
        <p>¿Estas seguro de eliminar este miembro?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogDeleteMiembro = false">Cancelar</v-btn>
        <v-btn color="primary" @click="eliminarMiembro">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogDeleteAsistencia" v-if="userStore.user.rol === 'pastor'" max-width="500">
    <v-card>
      <v-card-title>Eliminar Asistencia</v-card-title>
      <v-card-text>
        <p>¿Estas seguro de eliminar esta asistencia?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialogDeleteAsistencia = false">Cancelar</v-btn>
        <v-btn color="primary" @click="eliminarAsistencia">Confirmar</v-btn>
      </v-card-actions></v-card
    >
  </v-dialog>
  <Notificacion ref="notificacionRef" />
</template>
<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'
import { useUserStore } from '@/store/userStore'
import { toRefs } from 'vue'
// Refs y reactivos
const notificacionRef = ref(null)
const isDesktop = ref(false)
const dialog = ref(false)
const valid = ref(false)
const casas = ref([])

const form = reactive({
  nombre: null,
  apellido: null,
  telefono: null,
  direccion: null,
  casasDeFeId: null,
})
const { nombre, apellido, telefono, direccion, casasDeFeId } = toRefs(form)
// Obtener el ID del usuario desde el store
const userStore = useUserStore()
//const user = userStore.user.user

// Función para obtener las casas
const getCasas = async () => {
  try {
    const response = await api.get(`/casas-de-fe`)
    casas.value = response.data
  } catch (error) {
    console.error('Error al obtener las casas:', error)
    if (error.response && error.response.status === 404) {
      casas.value = []
    }
  }
}

// Guardar nuevo miembro
const guardar = async () => {
  try {
    await api.post('/miembro-casa-de-fe', {
      nombre: form.nombre,
      apellido: form.apellido,
      telefono: form.telefono,
      direccion: form.direccion,
      casasDeFeId: Number(form.casasDeFeId),
    })

    notificacionRef.value.mostrar('Miembro registrado', 'success')
    closeDialog()
    getCasas()
  } catch (error) {
    console.error('Error al guardar el miembro:', error)
    notificacionRef.value.mostrar('Error al registrar el miembro', 'error')
  }
}

// Diálogo
const openDialog = (id) => {
  form.casasDeFeId = id
  dialog.value = true
}

const closeDialog = () => {
  form.nombre = null
  form.apellido = null
  form.telefono = null
  form.direccion = null
  form.casasDeFeId = null
  dialog.value = false
}

// Tamaño pantalla
const checkSize = () => {
  isDesktop.value = window.innerWidth > 1024
}

// Hooks
onMounted(() => {
  getCasas()
  checkSize()
  window.addEventListener('resize', checkSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkSize)
})

// Reiniciar form al cerrar el diálogo
watch(dialog, (val) => {
  if (!val) {
    form.nombre = null
    form.apellido = null
    form.telefono = null
    form.direccion = null
    form.casasDeFeId = null
  }
})

const asistenciaToMember = reactive({
  asistenciaId: null,
  casasDeFeId: null,
})
async function addAsistenciaToMember() {
  try {
    await api.post('/miembro-casa-de-fe/asistencia/miembro', {
      asistenciaId: Number(asistenciaToMember.asistenciaId),
      casasDeFeId: Number(asistenciaToMember.casasDeFeId),
    })
    notificacionRef.value.mostrar('Asistencia registrada', 'success')
    getCasas()
  } catch (error) {
    console.error('Error al registrar la asistencia:', error)
    notificacionRef.value.mostrar('Error al registrar la asistencia', 'error')
  }
  dialogAsistencia.value = false
}
const dialogAsistencia = ref(false)
function openDialogAsistencia(idAsistencia, idCasa) {
  asistenciaToMember.asistenciaId = idAsistencia
  asistenciaToMember.casasDeFeId = idCasa
  dialogAsistencia.value = true
}

async function eliminarMiembro() {
  try {
    await api.delete(`/miembro-casa-de-fe/${miembroDeleteId.value}`)
    notificacionRef.value.mostrar('Miembro eliminado', 'success')
    getCasas()
  } catch (error) {
    console.error('Error al eliminar el miembro:', error)
    notificacionRef.value.mostrar('Error al eliminar el miembro', 'error')
  }
  dialogDeleteMiembro.value = false
}
const dialogDeleteMiembro = ref(false)
const miembroDeleteId = ref(null)
function openDialogDeleteMiembro(id) {
  dialogDeleteMiembro.value = true
  miembroDeleteId.value = id
}
async function eliminarAsistencia() {
  try {
    await api.delete(`/asistencias/${asistenciaDeleteId.value}`)
    notificacionRef.value.mostrar('Asistencia eliminada', 'success')
    getCasas()
  } catch (error) {
    console.error('Error al eliminar la asistencia:', error)
    notificacionRef.value.mostrar('Error al eliminar la asistencia', 'error')
  }
  dialogDeleteAsistencia.value = false
}
const dialogDeleteAsistencia = ref(false)
const asistenciaDeleteId = ref(null)
function openDialogDeleteAsistencia(id) {
  dialogDeleteAsistencia.value = true
  asistenciaDeleteId.value = id
}
</script>

<style scoped>
.v-expansion-panel {
  background-color: var(--blur-light);
}
.content-person {
  max-height: 400px;
  overflow: auto;
  white-space: nowrap; /* fuerza el desborde horizontal en texto inline */
}
.list-scroll {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin; /* Delgada */
  scrollbar-color: var(--dark-alt) var(--grey); /* thumb - track */
}
.list-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.list-scroll::-webkit-scrollbar-track {
  background-color: var(--grey); /* Track gris claro */
  border-radius: 10px;
}
.list-scroll::-webkit-scrollbar-thumb {
  background-color: var(--dark-alt); /* Color oscuro */
  border-radius: 10px;
}
</style>
