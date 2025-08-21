<template>
  <v-container class="py-6 d-flex justify-center">
    <v-card class="pa-6 bg-blur rounded-xl profile-card" elevation="8">
      <!-- Título -->
      <v-row class="mb-4" justify="center">
        <v-col cols="12" class="text-center fade-slide">
          <v-avatar size="80" class="mb-2" color="primary">
            <v-icon size="48">mdi-account-circle</v-icon>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold mt-2">{{ usuario.name }} {{ usuario.apellido }}</h2>
          <v-chip
            :color="usuario.rol === 'Administrador' ? 'gradient-red' : 'gradient-blue'"
            size="small"
            variant="flat"
            class="mt-1 white--text"
          >
            {{ usuario.rol }}
          </v-chip>
        </v-col>
      </v-row>

      <!-- Datos personales -->
      <v-divider class="mb-4" />
      <v-row dense class="fade-slide delay-100">
        <v-col cols="12" sm="6">
          <v-icon class="mr-1" color="primary">mdi-account</v-icon>
          <strong>Nombres:</strong> {{ usuario.name }}
        </v-col>
        <v-col cols="12" sm="6">
          <v-icon class="mr-1" color="primary">mdi-account</v-icon>
          <strong>Apellidos:</strong> {{ usuario.apellido }}
        </v-col>
        <v-col cols="12" sm="6">
          <v-icon class="mr-1" color="primary">mdi-account-key</v-icon>
          <strong>Usuario:</strong> {{ usuario.user }}
        </v-col>
        <v-col cols="12" sm="6">
          <v-icon class="mr-1" color="primary">mdi-star</v-icon>
          <strong>Rol:</strong> {{ usuario.rol }}
        </v-col>
      </v-row>

      <!-- Asignaciones -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2 d-flex align-center fade-slide delay-200">
        <v-icon color="green" class="mr-2">mdi-calendar-check</v-icon>
        Días asignados de aseo
      </h3>
      <div class="scroll-container fade-slide delay-300">
        <v-skeleton-loader v-if="loadingAsignaciones" type="table-row@3" class="mb-2" />
        <v-table v-else-if="asignaciones.length" density="compact">
          <transition-group name="fade-slide" tag="tbody">
            <tr v-for="(fecha, i) in asignaciones" :key="i" class="hoverable">
              <td>
                <v-icon size="small" color="teal" class="mr-1">mdi-calendar</v-icon>
                {{ fecha.fecha }}
              </td>
            </tr>
          </transition-group>
        </v-table>
        <p v-else class="text-caption d-flex align-center">
          <v-icon size="small" color="grey" class="mr-1">mdi-calendar-remove</v-icon>
          No tienes asignaciones este mes.
        </p>
      </div>

      <!-- Casas de fe -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2 d-flex align-center fade-slide delay-400">
        <v-icon color="orange" class="mr-2">mdi-home-city</v-icon>
        Casas de Fe
      </h3>
      <div class="scroll-container fade-slide delay-500">
        <v-skeleton-loader v-if="loadingCasas" type="list-item@3" class="mb-2" />
        <v-list v-else-if="casas.length">
          <transition-group name="fade-slide" tag="div">
            <v-list-item
              v-for="casa in casas"
              :key="casa.id"
              class="hoverable rounded elevation-1 pa-2 mb-1"
            >
              <v-list-item-title>
                <v-icon size="small" color="orange" class="mr-1">mdi-home</v-icon>
                {{ casa.nombre }} – {{ casa.direccion }}
              </v-list-item-title>
            </v-list-item>
          </transition-group>
        </v-list>
        <p v-else class="text-caption d-flex align-center">
          <v-icon size="small" color="grey" class="mr-1">mdi-home-off</v-icon>
          No estás a cargo de ninguna casa.
        </p>
      </div>

      <!-- Preferencia de horario -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2 d-flex align-center fade-slide delay-600">
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
          <v-btn
            @click="mostrarConfirmacion"
            color="purple"
            variant="elevated"
            size="small"
            :loading="loadingHorario"
            :disabled="loadingHorario"
            class="hover-scale"
          >
            Guardar
          </v-btn>
        </v-col>
      </v-row>

      <!-- Cambiar contraseña -->
      <v-divider class="my-4" />
      <h3 class="text-subtitle-1 font-weight-medium mb-2 d-flex align-center fade-slide delay-700">
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
          <v-btn
            @click="cambiarPasswordConfirm"
            color="red"
            variant="elevated"
            size="small"
            :loading="loadingPassword"
            :disabled="loadingPassword"
            class="hover-scale"
          >
            Actualizar
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <!-- Confirmar cambio de preferencia -->
    <v-dialog v-model="confirmChange" max-width="500" transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="text-h5"> Cambiar preferencia de horario </v-card-title>
        <v-card-text>
          <p>
            <strong>Nota: </strong>El horario de aseo se genera automáticamente los días 25 de cada
            mes usando la preferencia seleccionada.
          </p>
          <p>¿Estás seguro de continuar?</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="green" variant="elevated" @click="confirmChange = false"> Cancelar </v-btn>
          <v-btn color="red" variant="elevated" @click="actualizarHorario"> Continuar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Confirmar cambio de contraseña -->
    <v-dialog v-model="passwordChange" max-width="500" transition="dialog-bottom-transition">
      <v-card>
        <v-card-title class="text-h5"> Cambiar contraseña </v-card-title>
        <v-card-text> <p>¿Estás seguro de continuar?</p> </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="green" variant="elevated" @click="passwordChange = false"> Cancelar </v-btn>
          <v-btn color="red" variant="elevated" @click="cambiarPassword"> Continuar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Notificacion ref="notificacionRef" />
  </v-container>
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

// Loaders
const loadingAsignaciones = ref(false)
const loadingCasas = ref(false)
const loadingPassword = ref(false)
const loadingHorario = ref(false)

// Cambiar contraseña
const cambiarPassword = async () => {
  if (!passwordNueva.value) {
    notificacionRef.value?.mostrar('Por favor ingresa una contraseña', 'warning')
    return
  }
  try {
    loadingPassword.value = true
    await api.patch(`/auth/change-password`, {
      password: passwordNueva.value,
      user: usuario.value.user,
    })
    passwordNueva.value = ''
    notificacionRef.value?.mostrar('Contraseña actualizada', 'update')
  } catch (error) {
    console.error(error)
    notificacionRef.value?.mostrar('Error al cambiar la contraseña', 'error')
  } finally {
    loadingPassword.value = false
    passwordChange.value = false
  }
}

const cambiarPasswordConfirm = () => {
  if (!passwordNueva.value) {
    notificacionRef.value?.mostrar('Por favor ingresa una contraseña', 'warning')
    return
  }
  passwordChange.value = true
}

const resetPasswordNueva = () => {
  passwordNueva.value = ''
}

watch(
  () => passwordChange.value,
  (open) => {
    if (!open && passwordNueva.value) resetPasswordNueva()
  },
)

// Actualizar horario de aseo
const actualizarHorario = async () => {
  try {
    loadingHorario.value = true
    await api.patch(`/miembros/horario/${usuario.value.id}`, {
      horario_aseo: horarioPreferido.value,
    })
    // Actualizar store localmente si tienes esta acción
    if (typeof userStore.actualizarHorarioPreferido === 'function') {
      userStore.actualizarHorarioPreferido(horarioPreferido.value)
    }
    notificacionRef.value?.mostrar('Horario actualizado', 'update')
  } catch (error) {
    console.error(error)
    notificacionRef.value?.mostrar('Error al actualizar el horario', 'error')
  } finally {
    loadingHorario.value = false
    confirmChange.value = false
  }
}

const mostrarConfirmacion = () => {
  if (!horarioPreferido.value) {
    notificacionRef.value?.mostrar('Por favor selecciona un horario', 'warning')
    return
  }
  confirmChange.value = true
}

// Obtener días de aseo asignados
const obtenerAsignaciones = async () => {
  loadingAsignaciones.value = true
  try {
    const { data } = await api.get(`/miembros/asignedAseosCurrentMonth/${usuario.value.id}`)
    asignaciones.value = data // se espera [{ fecha: 'YYYY-MM-DD' }, ...]
  } catch (error) {
    console.error('Error obteniendo asignaciones:', error)
  } finally {
    loadingAsignaciones.value = false
  }
}

// Obtener casas de fe a cargo
const obtenerCasas = async () => {
  loadingCasas.value = true
  try {
    const { data } = await api.get('/casas-de-fe')
    casas.value = data.filter(
      (c) => Array.isArray(c.encargadosId) && c.encargadosId.some((e) => e.id === usuario.value.id),
    )
  } catch (error) {
    console.error('Error obteniendo casas de fe:', error)
  } finally {
    loadingCasas.value = false
  }
}

onMounted(() => {
  horarioPreferido.value = usuario.value.horario_aseo
  obtenerAsignaciones()
  obtenerCasas()
})
</script>

<style scoped>
/* Fondo blur y tarjeta elegante */
.bg-blur {
  background-color: var(--blur-light);
}

/* Tarjeta principal */
.profile-card {
  border-radius: 20px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Chips degradados */
.gradient-red {
  background: linear-gradient(45deg, #ff6b6b, #ff4757);
}
.gradient-blue {
  background: linear-gradient(45deg, #1e90ff, #00c6ff);
}

/* Hover en botones */
.hover-scale {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Scroll interno estilizado */
.scroll-container {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}
.scroll-container::-webkit-scrollbar {
  width: 6px;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* Hover suave en filas/listas */
.hoverable {
  transition:
    background-color 0.25s ease,
    transform 0.25s ease;
}
.hoverable:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateX(4px);
}

/* Fade + slide */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Aparición sutil del bloque de datos personales */
.fade-slide.delay-100 {
  animation: fadeSlide 0.35s ease 0.1s both;
}
.fade-slide.delay-200 {
  animation: fadeSlide 0.35s ease 0.2s both;
}
.fade-slide.delay-300 {
  animation: fadeSlide 0.35s ease 0.3s both;
}
.fade-slide.delay-400 {
  animation: fadeSlide 0.35s ease 0.4s both;
}
.fade-slide.delay-500 {
  animation: fadeSlide 0.35s ease 0.5s both;
}
.fade-slide.delay-600 {
  animation: fadeSlide 0.35s ease 0.6s both;
}
.fade-slide.delay-700 {
  animation: fadeSlide 0.35s ease 0.7s both;
}

@keyframes fadeSlide {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
