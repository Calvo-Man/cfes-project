<template>
  <v-container v-if="isDesktop">
    <v-expansion-panels>
      <v-expansion-panel v-for="(casa, index) in casas" :key="index" class="v-expansion-panel">
        <v-expansion-panel-title v-slot="{ expanded }">
          <v-row no-gutters>
            <v-col class="d-flex justify-start" cols="4">
              <!-- <p class="text-body-1">{{ casa.nombre }}</p> -->
              <v-chip>{{ casa.nombre }}</v-chip>
            </v-col>
            <v-col class="text-seconday" cols="8">
              <v-fade-transition leave-absolute>
                <span v-if="expanded" class="text-body-1 font-weight-bold"
                  >Información de la casa de fe</span
                >
                <v-row v-else style="width: 100%" no-gutters>
                  <v-col class="d-flex justify-start" cols="6">
                    <ul>
                      <li
                        v-for="encargado in casa.encargadosId"
                        :key="encargado.id"
                        small
                        class="ma-1"
                        color="blue lighten-4"
                      >
                        {{ encargado.name }} {{ encargado.apellido }}
                      </li>
                    </ul>
                  </v-col>
                  <v-col class="d-flex justify-start" cols="6"
                    ><p class="text-body-1 mr-1">
                      Miembros:
                      <v-chip color="blue " label small>{{ casa.miembros.length }}</v-chip>
                    </p>
                    <p class="text-body-1">
                      Pendientes:
                      <v-chip
                        :color="casa.asistencias.length > 0 ? 'red lighten-4' : 'green lighten-4'"
                        :text-color="
                          casa.asistencias.length > 0 ? 'red darken-2' : 'green darken-2'
                        "
                        label
                        small
                      >
                        {{ casa.asistencias.length }}
                      </v-chip>
                    </p>
                  </v-col>
                </v-row>
              </v-fade-transition>
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <!-- Información general -->
            <v-col cols="12" md="6">
              <v-card class="pa-3 mb-4" elevation="2">
                <h3 class="mb-2">📍 Información de la Casa</h3>
                <p><strong>Nombre:</strong> {{ casa.nombre }}</p>
                <p>
                  <strong>Direccion:</strong>
                  <v-chip class="ma-1" color="blue lighten-4" label>{{ casa.direccion }}</v-chip>
                </p>
              </v-card>

              <v-card class="pa-3" elevation="2">
                <h3 class="mb-2">👤 Encargados</h3>
                <v-chip
                  v-for="encargado in casa.encargadosId"
                  :key="encargado.id"
                  class="ma-1"
                  color="deep-purple lighten-4"
                  label
                >
                  {{ encargado.name }} {{ encargado.apellido }} - {{ encargado.rol }} -
                  {{ encargado.telefono }}
                </v-chip>
              </v-card>
            </v-col>

            <!-- Asistencias -->
            <v-col cols="12" md="6">
              <v-card class="pa-3 mb-4" elevation="2">
                <h3 class="mb-2">🧑‍🤝‍🧑 Miembros</h3>
                <v-list dense>
                  <v-list-item v-for="asistencia in casa.miembros" :key="asistencia.id">
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-icon color="primary" small class="mr-1">mdi-account</v-icon>
                        {{ asistencia.nombre }} {{ asistencia.apellido }}
                        <v-icon color="primary" small class="mr-1">mdi-phone</v-icon>
                        {{ asistencia.telefono }}
                        <v-icon color="primary" small class="mr-1">mdi-home</v-icon>
                        {{ asistencia.direccion }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card class="pa-3 mb-4" elevation="2">
                <h3 class="mb-2">🔔 Asistencias Pendientes</h3>
                <v-list dense>
                  <v-list-item v-for="asistencia in casa.asistencias" :key="asistencia.id">
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-icon color="primary" small class="mr-1">mdi-account</v-icon>
                        {{ asistencia.nombre }} {{ asistencia.apellido }}
                        <v-icon color="primary" small class="mr-1">mdi-phone</v-icon>
                        {{ asistencia.telefono }}
                        <v-icon color="primary" small class="mr-1">mdi-home</v-icon>
                        {{ asistencia.direccion }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
  <v-expansion-panels v-else>
    <v-expansion-panel v-for="(casa, index) in casas" :key="index" class="v-expansion-panel">
      <v-expansion-panel-title v-slot="{ expanded }">
        <v-row no-gutters>
          <v-col class="d-flex justify-start" cols="4">
            <!-- <p class="text-body-1">{{ casa.nombre }}</p> -->
            <v-chip>{{ casa.nombre }}</v-chip>
          </v-col>
          <v-col class="text-seconday" cols="8">
            <v-fade-transition leave-absolute>
              <span v-if="expanded" class="text-body-1 font-weight-bold"
                >Información de la casa de fe</span
              >
              <v-row v-else style="width: 100%" no-gutters>
                <v-col class="d-flex justify-start" cols="6">
                  <ul>
                    <li
                      v-for="encargado in casa.encargadosId"
                      :key="encargado.id"
                      small
                      class="ma-1"
                      color="blue lighten-4"
                    >
                      {{ encargado.name }} {{ encargado.apellido }}
                    </li>
                  </ul>
                </v-col>
                <v-col class="d-flex justify-start" cols="6"
                  ><p class="text-body-1 mr-1">
                    Miembros: <v-chip color="blue " label small>{{ casa.miembros.length }}</v-chip>
                  </p>
                  <p class="text-body-1">
                    Pendientes:
                    <v-chip
                      :color="casa.asistencias.length > 0 ? 'red lighten-4' : 'green lighten-4'"
                      :text-color="casa.asistencias.length > 0 ? 'red darken-2' : 'green darken-2'"
                      label
                      small
                    >
                      {{ casa.asistencias.length }}
                    </v-chip>
                  </p>
                </v-col>
              </v-row>
            </v-fade-transition>
          </v-col>
        </v-row>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row>
          <!-- Información general -->
          <v-col cols="12" md="6">
            <v-card class="pa-3 mb-4" elevation="2">
              <h3 class="mb-2">📍 Información de la Casa</h3>
              <p><strong>Nombre:</strong> {{ casa.nombre }}</p>
              <p>
                <strong>Direccion:</strong>
                <v-chip class="ma-1" color="blue lighten-4" label>{{ casa.direccion }}</v-chip>
              </p>
            </v-card>

            <v-card class="pa-3" elevation="2">
              <h3 class="mb-2">👤 Encargados</h3>
              <v-chip
                v-for="encargado in casa.encargadosId"
                :key="encargado.id"
                class="ma-1"
                color="deep-purple lighten-4"
                label
              >
                {{ encargado.name }} {{ encargado.apellido }} - {{ encargado.rol }} -
                {{ encargado.telefono }}
              </v-chip>
            </v-card>
          </v-col>

          <!-- Asistencias -->
          <v-col cols="12" md="6">
            <v-card class="pa-3 mb-4" elevation="2">
              <h3 class="mb-2">🧑‍🤝‍🧑 Miembros</h3>
              <v-list dense>
                <v-list-item v-for="asistencia in casa.miembros" :key="asistencia.id">
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-icon color="primary" small class="mr-1">mdi-account</v-icon>
                      {{ asistencia.nombre }} {{ asistencia.apellido }}
                      <v-icon color="primary" small class="mr-1">mdi-phone</v-icon>
                      {{ asistencia.telefono }}
                      <v-icon color="primary" small class="mr-1">mdi-home</v-icon>
                      {{ asistencia.direccion }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-3 mb-4" elevation="2">
              <h3 class="mb-2">🔔 Asistencias Pendientes</h3>
              <v-list dense>
                <v-list-item v-for="asistencia in casa.asistencias" :key="asistencia.id">
                  <v-list-item-content>
                    <v-list-item-title>
                      <v-icon color="primary" small class="mr-1">mdi-account</v-icon>
                      {{ asistencia.nombre }} {{ asistencia.apellido }}
                      <v-icon color="primary" small class="mr-1">mdi-phone</v-icon>
                      {{ asistencia.telefono }}
                      <v-icon color="primary" small class="mr-1">mdi-home</v-icon>
                      {{ asistencia.direccion }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script>
import api from '@/plugins/axios'

export default {
  data: () => ({
    casas: [],
    user_id: 20,
    trip: {},
    isDesktop: false,
    dialog: false,
    valid: false,
    form: {
      nombre: null,
      apellido: null,
      telefono: null,
      direccion: null,
      casasDeFeId: null,
    },
  }),
  mounted() {
    this.getCasas()
    this.checkSize()
    window.addEventListener('resize', this.checkSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkSize)
  },
  methods: {
    async getCasas() {
      try {
        const response = await api.get('/casas-de-fe')
        this.casas = response.data
      } catch (error) {
        console.error('Error al obtener las casas:', error)
        if (error.response && error.response.status === 404) {
          this.casas = []
        }
      }
    },
    openDialog() {
      this.dialog = true
    },
    checkSize() {
      this.isDesktop = window.innerWidth > 1024
    },
  },
}
</script>
<style scoped>
.v-expansion-panel {
  background-color: var(--blur-light);
}
</style>
