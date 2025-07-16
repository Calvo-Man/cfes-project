<template>
  <v-container v-if="esPastor" class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-card class="pa-4 ma-4 mx-auto" elevation="3" max-width="800">
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

              <v-col cols="12" class="text-center">
                <v-btn color="primary" :disabled="!valid" class="mt-4" @click="guardar">
                  Guardar
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-card class="pa-4 elevation-2 list-container">
    <h2 class="text-h6 font-weight-bold mb-4">Listado de Servidores</h2>

    <v-data-table :headers="headers" :items="servidores" class="elevation-1" density="comfortable">
      <template #item.acciones="{ item }">
        <v-btn icon class="mr-2" size="x-small" @click="editar(item)">
          <i class="material-icons icon-sm">edit</i>
        </v-btn>
        <v-btn icon color="red" size="x-small" class="mr-2" @click="eliminar(item)">
          <i class="material-icons icon-sm">delete</i>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
  <Notificacion ref="notificacionRef" />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'

const form = ref(null)
const valid = ref(false)
const mostrarPassword = ref(false)
import { useUserStore } from '@/store/userStore'
const notificacionRef = ref(null)

const userStore = useUserStore()
const esPastor = ref(userStore.user?.rol === 'pastor')

const miembro = reactive({
  name: '',
  apellido: '',
  user: '',
  password: '',
  telefono: '',
  rol: null,
})
const headers = computed(() => {
  const baseHeaders = [
    { title: 'Nombre', value: 'name' },
    { title: 'Apellido', value: 'apellido' },
    { title: 'Teléfono', value: 'telefono' },
    { title: 'Rol', value: 'rol' },
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
]

const rules = {
  required: (v) => !!v || 'Este campo es obligatorio',
}
onMounted(() => {
  obtenerServidores()
})
const guardar = async () => {
  const isValid = await form.value.validate()
  if (!isValid) return

  try {
    await api.post('/miembros/create', miembro)
    this.notificacionRef.mostrar('Miembro registrado', 'success')

    await obtenerServidores()
    resetFormulario()
  } catch (error) {
    console.error('❌ Error al guardar el miembro', error)
  }
}

function resetFormulario() {
  miembro.name = ''
  miembro.apellido = ''
  miembro.user = ''
  miembro.password = ''
  miembro.telefono = ''
  miembro.rol = null
  form.value.resetValidation()
}

async function obtenerServidores() {
  try {
    const response = await api.get('/miembros')
    servidores.value = response.data.miembros
  } catch (error) {
    console.error('Error al obtener los servidores:', error)
  }
}
</script>

<style scoped>
html,
body,
.v-container.fill-height {
  height: 100%;
}
</style>
