<template>
  <v-container class="py-6">
    <v-card class="dashboard-container bg-blur pa-6">
      <!-- Bienvenida -->
      <v-row justify="center" class="mb-6">
        <v-col cols="12" md="8" class="text-center">
          <v-scale-transition>
            <h2 class="text-h5 font-weight-bold fade-in">
              {{ capitalizarPrimeraLetra(usuario?.rol) }} {{ usuario?.name }}
              {{ usuario?.apellido }}
            </h2>
          </v-scale-transition>
          <v-fade-transition>
            <p class="text-subtitle-1 mt-2">
              <span class="font-weight-bold">Bienvenido a CFESConnect</span>, tu herramienta
              inteligente para mantenerte conectado con tu comunidad. Aquí podrás ver tus
              asignaciones de aseo, consultar actividades y eventos, acceder a tu casa de fe,
              recibir notificaciones importantes por WhatsApp, y hasta hacer preguntas a nuestro
              asistente virtual sobre temas de la iglesia. Todo pensado para que tu participación
              sea más sencilla y organizada.
            </p>
          </v-fade-transition>
        </v-col>
      </v-row>

      <!-- Versículo del día -->
      <v-row justify="center" class="mb-8">
        <v-col cols="12" md="8">
          <v-fade-transition>
            <v-card class="verse-card pa-4 elevation-3">
              <blockquote>
                "{{ versiculoDelDia.texto }}"
                <br />
                <strong>{{ versiculoDelDia.referencia }}</strong>
              </blockquote>
            </v-card>
          </v-fade-transition>
        </v-col>
      </v-row>

      <!-- Estadísticas -->
      <v-row justify="center" class="mb-10">
        <v-col cols="12" sm="6" md="3" v-for="(stat, i) in estadisticasList" :key="i">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              class="stat-card pa-4 text-center"
              :class="{ 'stat-card-hover': isHovering }"
              :style="{ background: statGradient(stat.color) }"
            >
              <v-icon size="36" class="mb-2">{{ stat.icon }}</v-icon>
              <h3 class="text-h6 mb-1">{{ stat.title }}</h3>
              <p class="text-h5 font-weight-bold mb-0">{{ stat.value }} {{ stat.suffix }}</p>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <!-- Accesos rápidos -->
      <v-row justify="center" align="stretch">
        <v-col cols="12" sm="6" md="4" v-for="(item, i) in accesosRapidos" :key="i">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              class="quick-access pa-4 elevation-4"
              :class="{ 'quick-access-hover': isHovering }"
              :style="{ background: itemGradient(item.color) }"
            >
              <v-card-title class="justify-center">
                <v-icon class="mr-2">{{ item.icon }}</v-icon> {{ item.title }}
              </v-card-title>
              <v-card-text class="text-center">
                {{ item.text }}
                <br />
                <small v-if="item.subtext">{{ item.subtext }}</small>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn :to="item.link" text class="btn-fade">Ir</v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { versiculos } from '@/assets/versiculos'
import api from '@/plugins/axios'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()
const usuario = computed(() => userStore.user)

const estadisticas = ref({
  casas: 0,
  miembros: 0,
  eventos: 0,
  asistencias: 0,
})

const estadisticasList = computed(() => [
  {
    title: 'Casas de Fe',
    value: estadisticas.value.casas,
    suffix: 'registradas',
    color: 'purple',
    icon: 'mdi-home-city',
  },
  {
    title: 'Miembros',
    value: estadisticas.value.miembros,
    suffix: 'activos',
    color: 'teal',
    icon: 'mdi-account-group',
  },
  {
    title: 'Eventos',
    value: estadisticas.value.eventos,
    suffix: 'este mes',
    color: 'indigo',
    icon: 'mdi-calendar-star',
  },
  {
    title: 'Asistencias',
    value: estadisticas.value.asistencias,
    suffix: 'este mes',
    color: 'deep-purple',
    icon: 'mdi-bell-check',
  },
])

const accesosRapidos = [
  {
    title: 'Casas de Fe',
    icon: 'mdi-church',
    text: 'Visualiza y gestiona las Casas de Fe de tu iglesia.',
    subtext: 'Registra tu casa de fe y comienza a gestionarla.',
    link: '/casas-de-fe/agregar',
    color: 'purple',
  },
  {
    title: 'Calendario de Aseo',
    icon: 'mdi-broom',
    text: 'Consulta el calendario mensual de limpieza.',
    subtext: 'Se genera automáticamente el 25 de cada mes.',
    link: '/aseo',
    color: 'teal',
  },
  {
    title: 'Asistencias',
    icon: 'mdi-account-group',
    text: 'Lleva un control de quiénes asisten a los eventos y reuniones.',
    link: '/registro-asistencia',
    color: 'indigo',
  },
]

// Versículo del día
const hoy = new Date()
const indice = hoy.getDate() % versiculos.length
const versiculoDelDia = ref(versiculos[indice])

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

function statGradient(color) {
  switch (color) {
    case 'purple':
      return 'linear-gradient(135deg, #9b30ff, #7a1fff)' // morado intenso
    case 'teal':
      return 'linear-gradient(135deg, #00bfa5, #009e87)' // verde agua brillante
    case 'indigo':
      return 'linear-gradient(135deg, #4b6ef5, #2f46e5)' // azul intenso
    case 'deep-purple':
      return 'linear-gradient(135deg, #7c4dff, #651fff)' // lavanda vibrante
    default:
      return '#fff'
  }
}

function itemGradient(color) {
  switch (color) {
    case 'purple':
      return 'linear-gradient(135deg, #b14cff, #8f00ff)' // morado vivo
    case 'teal':
      return 'linear-gradient(135deg, #00bfa5, #009e87)' // verde agua brillante
    case 'indigo':
      return 'linear-gradient(135deg, #5c6bc0, #3949ab)' // azul vibrante
    default:
      return '#fff'
  }
}
</script>

<style scoped>
.dashboard-container {
  border-radius: 20px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.15);
}

/* Estadísticas */
.stat-card {
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.stat-card-hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

/* Accesos rápidos */
.quick-access {
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.quick-access-hover {
  transform: translateY(-8px) scale(1.04);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

/* Botones dentro de tarjetas */
.btn-fade {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
.btn-fade:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Versículo estilo neumorphism */
.verse-card {
  border-radius: 20px;
  background: #f9f9f9;
  color: #4a148c;
  text-align: center;
  font-style: italic;
  padding: 20px;
  box-shadow:
    4px 4px 12px rgba(0, 0, 0, 0.1),
    -4px -4px 12px rgba(255, 255, 255, 0.7);
}

/* Animaciones */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
