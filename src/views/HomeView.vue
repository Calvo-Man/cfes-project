<template>
  <v-container class="">
    <v-card class="card-container">
      <!-- Nombre del usuario -->
      <v-row justify="center" class="mb-4">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h5 font-weight-medium">
            Bienvenido, {{ capitalizarPrimeraLetra(usuario?.rol) }} {{ usuario?.name }}
            {{ usuario?.apellido }}
          </h2>
        </v-col>
      </v-row>

      <!-- Mensaje de bienvenida -->
      <v-row justify="center" class="mb-4">
        <v-col cols="12" md="8" class="text-center">
          <h1 class="text-h4 font-weight-bold mb-4">Sistema de Gestion Centro de Fe y Esperanza</h1>
          <p class="text-subtitle-1">
            Plataforma para fortalecer la organización cristiana mediante la gestión de las Casas de
            Fe, el calendario de aseo y el control de asistencias.
          </p>
        </v-col>
      </v-row>
      <!-- Frase bíblica -->
      <v-row justify="center" class="mt-">
        <v-col cols="12" md="8" class="text-center">
          <blockquote class="text-caption font-italic text-center">
            "{{ versiculoDelDia.texto }}"
            <br />
            <strong>{{ versiculoDelDia.referencia }}</strong>
          </blockquote>
        </v-col>
      </v-row>
      <!-- Estadísticas -->
      <v-row justify="center" class="mb-8">
        <v-col cols="12" sm="4" class="text-center">
          <v-card color="primary" dark>
            <v-card-title class="justify-center">Casas de Fe</v-card-title>
            <v-card-text>{{ estadisticas.casas }} registradas</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" class="text-center">
          <v-card color="teal" dark>
            <v-card-title class="justify-center">Miembros</v-card-title>
            <v-card-text>{{ estadisticas.miembros }} activos</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" class="text-center">
          <v-card color="indigo" dark>
            <v-card-title class="justify-center">Eventos</v-card-title>
            <v-card-text>{{ estadisticas.eventos }} este mes</v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4" class="text-center">
          <v-card color="indigo" dark>
            <v-card-title class="justify-center">Asistencias</v-card-title>
            <v-card-text>{{ estadisticas.asistencias }} este mes</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Accesos rápidos con iconos y animaciones -->
      <v-row justify="center" class="text-center" align="stretch">
        <v-col cols="12" sm="6" md="4">
          <v-slide-y-transition>
            <v-card color="primary" dark>
              <v-card-title class="justify-center">
                <v-icon class="mr-2">mdi-church</v-icon> Casas de Fe
              </v-card-title>
              <v-card-text>
                Visualiza y gestiona las Casas de Fe de tu iglesia.
                <br />
                <small>Sólo los pastores pueden crear nuevas casas.</small>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn to="/casas-de-fe/control" color="white" text>Ver casas</v-btn>
              </v-card-actions>
            </v-card>
          </v-slide-y-transition>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-slide-y-transition>
            <v-card color="teal" dark>
              <v-card-title class="justify-center">
                <v-icon class="mr-2">mdi-broom</v-icon> Calendario de Aseo
              </v-card-title>
              <v-card-text>
                Consulta el calendario mensual de limpieza.
                <br />
                <small>Se genera automáticamente el 25 de cada mes.</small>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn to="/aseo" color="white" text>Ver calendario</v-btn>
              </v-card-actions>
            </v-card>
          </v-slide-y-transition>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-slide-y-transition>
            <v-card color="indigo" dark>
              <v-card-title class="justify-center">
                <v-icon class="mr-2">mdi-account-group</v-icon> Asistencias
              </v-card-title>
              <v-card-text>
                Lleva un control de quiénes asisten a los eventos y reuniones.
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn to="/registro-asistencia" color="white" text>Registrar</v-btn>
              </v-card-actions>
            </v-card>
          </v-slide-y-transition>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { versiculos } from '@/assets/versiculos'
// Login.vue, Eventos.vue, etc.
import api from '@/plugins/axios'

// Suponiendo que tienes un store o sesión con el usuario
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()
const usuario = computed(() => userStore.user)

const estadisticas = ref({
  casas: null,
  miembros: null,
  eventos: null,
  asistencias: null,
})

const hoy = new Date()
const diaDelAno = hoy.getFullYear() + '-' + hoy.getMonth() + '-' + hoy.getDate()
const indice = hoy.getDate() % versiculos.length // cambia diariamente
const versiculoDelDia = ref(versiculos[indice])

// Cargar estadísticas desde el backend
onMounted(async () => {
  try {
    const [eventos, asistencias, miembros, casas] = await Promise.all([
      api.get('/eventos/count'),
      api.get('/asistencias/count'),
      api.get('/miembros/count'),
      api.get('/casas-de-fe/count'),
    ])

    estadisticas.value.eventos = eventos.data
    estadisticas.value.asistencias = asistencias.data
    estadisticas.value.miembros = miembros.data
    estadisticas.value.casas = casas.data
  } catch (error) {
    console.error('Error cargando estadísticas:', error)
  }
})
function capitalizarPrimeraLetra(texto) {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}
</script>

<style scoped>
.card-container {
  background-color: var(--blur-light);
  height: 100%;
  padding: 20px;
}
</style>
