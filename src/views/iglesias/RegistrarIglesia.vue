```vue
<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="9">
        <v-card
          class="pa-6 bg-blur"
          elevation="4"
          rounded="xl"
        >
          <!-- Encabezado -->
          <div class="d-flex align-center mb-6">
            <v-avatar
              color="primary"
              size="48"
              class="mr-4"
            >
              <v-icon>mdi-church</v-icon>
            </v-avatar>

            <div>
              <h1 class="text-h5 font-weight-bold">
                Registrar Iglesia
              </h1>

              <p class="text-body-2 text-medium-emphasis">
                Registra una nueva iglesia y su administrador principal.
              </p>
            </div>
          </div>

          <v-form
            ref="form"
            v-model="valid"
            @submit.prevent="registrarIglesia"
          >
            <!-- ============================= -->
            <!-- DATOS DE LA IGLESIA -->
            <!-- ============================= -->

            <v-card
              variant="tonal"
              class="pa-5 mb-6"
              rounded="xl"
            >
              <div class="d-flex align-center mb-4">
                <v-icon
                  color="primary"
                  class="mr-2"
                >
                  mdi-church-outline
                </v-icon>

                <h2 class="text-h6 font-weight-bold">
                  Información de la iglesia
                </h2>
              </div>

              <v-row>
                <!-- Nombre -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formulario.nombre"
                    label="Nombre de la iglesia"
                    placeholder="Ej. Centro de Fe y Esperanza"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-church"
                    clearable
                  />
                </v-col>

                <!-- Departamento -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.departamento"
                    label="Departamento"
                    placeholder="Ej. Córdoba"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-map-marker"
                    clearable
                  />
                </v-col>

                <!-- Ciudad -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.ciudad"
                    label="Ciudad / Municipio"
                    placeholder="Ej. San Pelayo"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-city"
                    clearable
                  />
                </v-col>

                <!-- Dirección -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formulario.direccion"
                    label="Dirección"
                    placeholder="Ej. Carrera 7 # 12-15"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-map-marker-outline"
                    clearable
                  />
                </v-col>

                <!-- Logo -->
                <v-col cols="12" md="7">
                  <v-file-input
                    v-model="logoFile"
                    label="Logo de la iglesia"
                    variant="outlined"
                    accept="image/png,image/jpeg,image/webp"
                    prepend-icon=""
                    prepend-inner-icon="mdi-image"
                    show-size
                    clearable
                    @update:model-value="previsualizarLogo"
                  />
                </v-col>

                <!-- Preview -->
                <v-col
                  cols="12"
                  md="5"
                  class="d-flex justify-center align-center"
                >
                  <div
                    v-if="logoPreview"
                    class="text-center"
                  >
                    <v-avatar
                      size="110"
                      rounded="lg"
                      class="elevation-3"
                    >
                      <v-img
                        :src="logoPreview"
                        cover
                      />
                    </v-avatar>

                    <div class="text-caption mt-2">
                      Vista previa del logo
                    </div>
                  </div>

                  <div
                    v-else
                    class="logo-placeholder"
                  >
                    <v-icon size="48">
                      mdi-image-outline
                    </v-icon>

                    <span>
                      Sin logo
                    </span>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <!-- ============================= -->
            <!-- ADMINISTRADOR -->
            <!-- ============================= -->

            <v-card
              variant="tonal"
              class="pa-5 mb-6"
              rounded="xl"
            >
              <div class="d-flex align-center mb-4">
                <v-icon
                  color="primary"
                  class="mr-2"
                >
                  mdi-account-cog
                </v-icon>

                <h2 class="text-h6 font-weight-bold">
                  Administrador principal
                </h2>
              </div>

              <v-alert
                type="info"
                variant="tonal"
                class="mb-5"
              >
                Este usuario será el administrador inicial de la iglesia.
              </v-alert>

              <v-row>
                <!-- Nombre -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.administrador.nombre"
                    label="Nombre"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-account"
                    clearable
                  />
                </v-col>

                <!-- Apellido -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.administrador.apellido"
                    label="Apellido"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-account-outline"
                    clearable
                  />
                </v-col>

                <!-- Cédula -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.administrador.cedula"
                    label="Cédula"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-card-account-details"
                    clearable
                  />
                </v-col>

                <!-- Teléfono -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.administrador.telefono"
                    label="Teléfono"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-phone"
                    clearable
                  />
                </v-col>

                <!-- Usuario -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formulario.administrador.usuario"
                    label="Usuario"
                    placeholder="Ej. admin.cfes.sanpelayo"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-account-key"
                    clearable
                  />
                </v-col>

                <!-- Contraseña -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formulario.administrador.password"
                    label="Contraseña"
                    variant="outlined"
                    :type="mostrarPassword ? 'text' : 'password'"
                    :append-inner-icon="
                      mostrarPassword ? 'mdi-eye-off' : 'mdi-eye'
                    "
                    :rules="[rules.required, rules.password]"
                    prepend-inner-icon="mdi-lock"
                    @click:append-inner="
                      mostrarPassword = !mostrarPassword
                    "
                    clearable
                  />
                </v-col>

                <!-- Confirmar contraseña -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="confirmarPassword"
                    label="Confirmar contraseña"
                    variant="outlined"
                    :type="
                      mostrarConfirmarPassword
                        ? 'text'
                        : 'password'
                    "
                    :append-inner-icon="
                      mostrarConfirmarPassword
                        ? 'mdi-eye-off'
                        : 'mdi-eye'
                    "
                    :rules="[
                      rules.required,
                      rules.passwordMatch
                    ]"
                    prepend-inner-icon="mdi-lock-check"
                    @click:append-inner="
                      mostrarConfirmarPassword =
                        !mostrarConfirmarPassword
                    "
                    clearable
                  />
                </v-col>
              </v-row>
            </v-card>

            <!-- ============================= -->
            <!-- BOTONES -->
            <!-- ============================= -->

            <div class="d-flex justify-end ga-3">
              <v-btn
                variant="tonal"
                color="grey"
                rounded="lg"
                :disabled="loading"
                @click="resetFormulario"
              >
                Limpiar
              </v-btn>

              <v-btn
                type="submit"
                color="primary"
                rounded="lg"
                :loading="loading"
                :disabled="!valid"
                prepend-icon="mdi-church"
              >
                Registrar Iglesia
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <Notificacion ref="notificacionRef" />
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '@/plugins/axios'
import Notificacion from '@/components/Notificacion.vue'

const form = ref(null)
const valid = ref(false)
const loading = ref(false)

const mostrarPassword = ref(false)
const mostrarConfirmarPassword = ref(false)

const logoFile = ref(null)
const logoPreview = ref(null)

const confirmarPassword = ref('')

const notificacionRef = ref(null)

const formulario = reactive({
  nombre: '',
  departamento: '',
  ciudad: '',
  direccion: '',
  logo: '',

  administrador: {
    nombre: '',
    apellido: '',
    cedula: '',
    usuario: '',
    telefono: '',
    password: '',
  },
})

const rules = {
  required: (value) =>
    !!value || 'Este campo es obligatorio',

  password: (value) =>
    !value ||
    value.length >= 8 ||
    'La contraseña debe tener mínimo 8 caracteres',

  passwordMatch: (value) =>
    value === formulario.administrador.password ||
    'Las contraseñas no coinciden',
}

function previsualizarLogo(file) {
  if (!file) {
    logoPreview.value = null
    formulario.logo = ''
    return
  }

  const archivo = Array.isArray(file) ? file[0] : file

  if (!archivo) return

  logoPreview.value = URL.createObjectURL(archivo)
}

async function registrarIglesia() {
  const resultado = await form.value.validate()

  if (!resultado.valid) return

  try {
    loading.value = true

    /*
     * Por ahora enviamos el objeto directamente.
     *
     * Si el backend recibe el logo como archivo,
     * posteriormente cambiaremos esto a FormData.
     */

    const payload = {
      nombre: formulario.nombre,
      departamento: formulario.departamento,
      ciudad: formulario.ciudad,
      direccion: formulario.direccion,
      logo: formulario.logo || undefined,

      administrador: {
        nombre: formulario.administrador.nombre,
        apellido: formulario.administrador.apellido,
        cedula: formulario.administrador.cedula,
        usuario: formulario.administrador.usuario,
        telefono: formulario.administrador.telefono,
        password: formulario.administrador.password,
      },
    }

    await api.post('/iglesias', payload)

    notificacionRef.value?.mostrar(
      'Iglesia registrada correctamente',
      'success',
    )

    resetFormulario()
  } catch (error) {
    console.error(
      'Error al registrar la iglesia:',
      error,
    )

    const mensaje =
      error.response?.data?.message ||
      'No se pudo registrar la iglesia'

    notificacionRef.value?.mostrar(
      Array.isArray(mensaje)
        ? mensaje.join(', ')
        : mensaje,
      'error',
    )
  } finally {
    loading.value = false
  }
}

function resetFormulario() {
  formulario.nombre = ''
  formulario.departamento = ''
  formulario.ciudad = ''
  formulario.direccion = ''
  formulario.logo = ''

  formulario.administrador.nombre = ''
  formulario.administrador.apellido = ''
  formulario.administrador.cedula = ''
  formulario.administrador.usuario = ''
  formulario.administrador.telefono = ''
  formulario.administrador.password = ''

  confirmarPassword.value = ''

  logoFile.value = null
  logoPreview.value = null

  form.value?.resetValidation()
}
</script>

<style scoped lang="scss">
.bg-blur {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.72);
  border-radius: 20px;
}

.v-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.v-text-field {
  transition: all 0.25s ease;
}

.v-text-field:hover {
  transform: scale(1.01);
}

.logo-placeholder {
  width: 110px;
  height: 110px;
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 4px;

  color: rgba(0, 0, 0, 0.45);
}
</style>
```
