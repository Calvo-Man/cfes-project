<template>
  <v-container class="py-6 d-flex justify-center">
    <v-card class="pa-6 bg-blur" max-width="800" elevation="5">
      <!-- Título -->
      <v-row class="mb-4" justify="center">
        <v-col cols="12" class="text-center">
          <v-icon color="primary" size="40">mdi-account-circle</v-icon>
          <h2 class="text-h5 font-weight-bold mt-2">Mi Perfil</h2>
        </v-col>
      </v-row>

      <!-- Datos personales -->
      <v-divider class="mb-3" />
      <v-row dense>
        <v-col cols="12" sm="6"
          ><v-icon class="mr-1" color="primary">mdi-account</v-icon><strong>Nombres:</strong>
          {{ usuario.name }}</v-col
        >
        <v-col cols="12" sm="6"
          ><v-icon class="mr-1" color="primary">mdi-account</v-icon><strong>Apellidos:</strong>
          {{ usuario.apellido }}</v-col
        >
        <v-col cols="12" sm="6"
          ><v-icon class="mr-1" color="primary">mdi-account-key</v-icon><strong>Usuario:</strong>
          {{ usuario.user }}</v-col
        >
        <v-col cols="12" sm="6"
          ><v-icon class="mr-1" color="primary">mdi-star</v-icon><strong>Rol:</strong>
          {{ usuario.rol }}</v-col
        >
      </v-row>

      <!-- Asignaciones -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2">
        <v-icon color="green" class="mr-2">mdi-calendar-check</v-icon>
        Días asignados de aseo
      </h3>
      <v-table v-if="asignaciones.length" density="compact">
        <tbody>
          <tr v-for="(fecha, i) in asignaciones" :key="i">
            <td><v-icon size="small" color="teal">mdi-calendar</v-icon> {{ fecha }}</td>
          </tr>
        </tbody>
      </v-table>
      <p v-else class="text-caption">No tienes asignaciones este mes.</p>

      <!-- Casas de fe -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2">
        <v-icon color="orange" class="mr-2">mdi-home-city</v-icon>
        Casas de Fe
      </h3>
      <v-table v-if="casas.length" density="compact">
        <tbody>
          <tr v-for="casa in casas" :key="casa.id">
            <td>
              <v-icon size="small" color="orange">mdi-home</v-icon> {{ casa.nombre }} –
              {{ casa.direccion }}
            </td>
          </tr>
        </tbody>
      </v-table>
      <p v-else class="text-caption">No estás a cargo de ninguna casa.</p>

      <!-- Preferencia de horario -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2">
        <v-icon color="purple" class="mr-2">mdi-clock-outline</v-icon>
        Preferencia de aseo
      </h3>
      <v-row dense>
        <v-col cols="8" sm="6">
          <v-select
            v-model="horarioPreferido"
            :items="[
              { title: 'Domingo', value: 'domingo' },
              { title: 'Jueves', value: 'jueves' },
              { title: 'Cualquiera', value: 'cualquiera' },
            ]"
            density="compact"
            label="Día preferido"
            prepend-inner-icon="mdi-clock-time-four-outline"
          />
        </v-col>
        <v-col cols="4" sm="6" class="d-flex align-center">
          <v-btn @click="mostrarConfirmacion" color="purple" variant="elevated" size="small"
            >Guardar</v-btn
          >
        </v-col>
      </v-row>

      <!-- Cambiar contraseña -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2">
        <v-icon color="red" class="mr-2">mdi-lock-reset</v-icon>
        Contraseña
      </h3>
      <v-row dense>
        <v-col cols="8" sm="6">
          <v-text-field
            v-model="passwordNueva"
            :type="mostrarPassword ? 'text' : 'password'"
            :append-inner-icon="mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="mostrarPassword = !mostrarPassword"
            label="Nueva contraseña"
            density="compact"
          />
        </v-col>
        <v-col cols="4" sm="6" class="d-flex align-center">
          <v-btn @click="cambiarPasswordConfirm" color="red" variant="elevated" size="small"
            >Actualizar</v-btn
          >
        </v-col>
      </v-row>
    </v-card>
    <Notificacion ref="notificacionRef" />
  </v-container>
  <v-dialog v-model="confirmChange" max-width="500">
    <v-card>
      <v-card-title class="text-h5"> Cambiar preferencia de horario </v-card-title>
      <v-card-text>
        <p>
          <strong>Nota: </strong>El horario de aseo se genera de manera automáticamente los dias 25
          de cada mes usando la preferencia seleccionada.
        </p>
        <p>¿Estas seguro de continuar?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="green" variant="elevated" @click="confirmChange = false"> Cancelar </v-btn>
        <v-btn color="red" variant="elevated" @click="actualizarHorario"> Continuar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="passwordChange" max-width="500">
    <v-card>
      <v-card-title class="text-h5"> Cambiar contraseña </v-card-title>
      <v-card-text>
        <p>¿Estas seguro de continuar?</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="green" variant="elevated" @click="passwordChange = false"> Cancelar </v-btn>
        <v-btn color="red" variant="elevated" @click="cambiarPassword"> Continuar </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useUserStore } from '@/store/userStore'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'

const userStore = useUserStore()
const usuario = computed(() => userStore.user)
const mostrarPassword = ref(false)
const notificacionRef = ref(null)
const passwordNueva = ref('')
const confirmChange = ref(false)
const passwordChange = ref(false)
const horarioPreferido = ref('')
const asignaciones = ref([])
const casas = ref([])

// Cambiar contraseña
const cambiarPassword = async () => {
  if (!passwordNueva.value) {
    notificacionRef.value.mostrar('Por favor ingresa una contraseña', 'warning')
    return
  }

  try {
    await api.patch(`/auth/change-password`, {
      password: passwordNueva.value,
      user: usuario.value.user,
    })
    passwordNueva.value = ''
    notificacionRef.value.mostrar('Contraseña actualizada', 'update')
  } catch (error) {
    console.error(error)
    alert('Error al cambiar la contraseña')
  }

  passwordChange.value = false
}
const cambiarPasswordConfirm = () => {
  if (!passwordNueva.value) {
    notificacionRef.value.mostrar('Por favor ingresa una contraseña', 'warning')
    return
  }
  passwordChange.value = true
}
const resetPasswordNueva = () => {
  passwordNueva.value = ''
}
watch(
  () => passwordChange.value,
  (passwordChange) => {
    if (!passwordChange && passwordNueva.value) resetPasswordNueva()
  },
)
// Actualizar horario de aseo
const actualizarHorario = async () => {
  try {
    const { data } = await api.patch(`/miembros/horario/${usuario.value.id}`, {
      horario_aseo: horarioPreferido.value,
    })
    // 🔄 Actualizar el store localmente
    userStore.actualizarHorarioPreferido(horarioPreferido.value)
    notificacionRef.value.mostrar('Horario actualizado', 'update') // 👈 aquí la notificación de update
  } catch (error) {
    notificacionRef.value.mostrar('Error al actualizar el horario', 'error')
    const mensaje = error.response?.data?.message || 'Error al guardar el horario'
  }
  confirmChange.value = false
}
const mostrarConfirmacion = () => {
  if (!horarioPreferido.value) {
    notificacionRef.value.mostrar('Por favor selecciona un horario', 'warning')
    return
  }
  confirmChange.value = true
}

// Obtener días de aseo asignados
const obtenerAsignaciones = async () => {
  try {
    const { data } = await api.get(`/miembros/asignedAseosCurrentMonth/${usuario.value.id}`)
    asignaciones.value = data // espera un array de fechas string
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error)
  }
}

// Obtener casas de fe a cargo
const obtenerCasas = async () => {
  try {
    const { data } = await api.get('/casas-de-fe')
    casas.value = data.filter((c) => c.encargadosId.some((e) => e.id === usuario.value.id))
  } catch (error) {
    console.error('Error obteniendo casas de fe:', error)
  }
}

onMounted(() => {
  horarioPreferido.value = usuario.value.horario_aseo
  obtenerAsignaciones()
  obtenerCasas()
})
</script>
<style scoped>
.bg-blur {
  background-color: var(--blur-light);
}
</style>
