<template>
  <v-container class="d-flex justify-center align-center fill-height">
    <v-card
      class="pa-10 elevation-6 rounded-xl text-center"
      style="max-width: 400px; background: #ffffffda"
    >
      <!-- Logo -->
      <img
        src="@/assets/centro-de-fe-removebg.png"
        width="120"
        alt="icono personalizado"
        class="mx-auto mb-4"
      />
      <div class="text-h6 font-weight-medium mb-6">Iniciar Sesión</div>

      <!-- Formulario -->
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="usuario"
          density="compact"
          placeholder="Usuario"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          class="mb-4"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          placeholder="Contraseña"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
          class="mb-2"
          required
        ></v-text-field>

        <v-slide-y-transition>
          <div v-if="password_error" class="error-message mb-2">
            <v-icon small color="red">mdi-alert-circle-outline</v-icon>
            {{ password_error }}
          </div>
        </v-slide-y-transition>

        <v-btn
          type="submit"
          :loading="loading"
          block
          class="mt-4 px-6 py-3 rounded-lg text-white"
          style="background: linear-gradient(135deg, #6a11cb, #2575fc)"
        >
          Iniciar Sesión
        </v-btn>
      </v-form>

      <div class="text-subtitle-2 text-disabled mt-6">
        CENTRO DE FE Y ESPERANZA SAN PELAYO <br />
        San Pelayo, Córdoba, Colombia <br />
        Cra. 7 # 10-48
      </div>
    </v-card>

    <Notificacion ref="notificacionRef" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'vue-router'
import Notificacion from '@/components/Notificacion.vue'
import api from '@/plugins/axios'

const usuario = ref('')
const password = ref('')
const loading = ref(false)
const password_error = ref('')
const visible = ref(false)
const notificacionRef = ref(null)

const userStore = useUserStore()
const router = useRouter()

const submit = async () => {
  loading.value = true
  password_error.value = ''

  try {
    const response = await api.post('/auth/login', {
      user: usuario.value,
      password: password.value,
    })

    const { user, access_token } = response.data
    notificacionRef.value.mostrar('Inicio de sesión exitoso', 'success')

    setTimeout(() => {
      userStore.login(user, access_token)
      router.push({ path: '/' })
    }, 1000)
  } catch (error) {
    password_error.value = error.response?.data?.message || 'Error de autenticación'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.error-message {
  color: red;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message v-icon {
  margin-right: 5px;
}

@media (max-width: 600px) {
  .v-card {
    margin: 20px;
    padding: 2rem;
  }
}
</style>
