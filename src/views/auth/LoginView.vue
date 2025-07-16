<template>
  <div>
    <v-card class="mx-auto pa-12 pb-8 mt-12" elevation="8" max-width="448" rounded="lg">
      <img
        src="@/assets/centro-de-fe-removebg.png"
        width="120"
        alt="icono personalizado"
        class="logo"
        style="display: block; margin: 0 auto"
      />
      <div class="text-subtitle-1 text-medium-emphasis">Usuario</div>

      <!-- Formulario de inicio de sesión -->
      <form @submit.prevent="submit">
        <v-text-field
          v-model="usuario"
          density="compact"
          placeholder="Usuario"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
        ></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
          Contraseña
        </div>

        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
          :type="visible ? 'text' : 'password'"
          density="compact"
          :rules="passwordRules"
          placeholder="Introduce tu contraseña"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          @click:append-inner="visible = !visible"
        ></v-text-field>
        <span v-if="password_error" class="error-message">
          <v-icon small color="red">mdi-alert-circle-outline</v-icon>
          {{ password_error }}
        </span>

        <v-btn
          type="submit"
          :loading="loading"
          class="mb-8"
          color="blue"
          size="large"
          variant="tonal"
          block
        >
          Iniciar Sesión
        </v-btn>
      </form>

      <h5 class="text-disabled mt-4 text-center">
        CENTRO DE FE Y ESPERANZA SAN PELAYO
        <br />
        San Pelayo, Córdoba, Colombia
        <br />
        Cra. 7 # 10-48
      </h5>
    </v-card>

    <Notificacion ref="notificacionRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'vue-router'
import Notificacion from '@/components/Notificacion.vue'

const usuario = ref('')
const password = ref('')
const loading = ref(false)
const password_error = ref('')
const notificacionRef = ref(null)

const userStore = useUserStore()
const router = useRouter()
const visible = ref(false)
const submit = async () => {
  loading.value = true
  password_error.value = ''

  try {
    const response = await axios
      .post('http://localhost:3000/auth/login', {
        user: usuario.value,
        password: password.value,
      })
      .then()

    const { user, access_token } = response.data
    notificacionRef.value.mostrar('Inicio de sesión exitoso', 'success') // 👈 aquí la notificación de update

    // Redirigir al inicio tras un segundo
    setTimeout(() => {
      userStore.login(user, access_token) // ✅ usa la acción de Pinia
      router.push({ path: '/' })
    }, 1000)
  } catch (error) {
    password_error.value = error.response?.data?.message || 'Error de autenticación'
  }

  loading.value = false
}
</script>

<style scoped lang="scss">
.bg-dark {
  background-color: var(--dark);
}

.card-header {
  background-color: var(--dark);
  color: white;
}

.form-item {
  justify-content: center;
  align-items: center; /* Centra la imagen verticalmente */
}
.error-message {
  color: red;
  font-size: 0.9rem;
  margin-top: 0px;
  display: flex;
  align-items: center;
}

.error-message v-icon {
  margin-right: 5px;
}

@media (max-width: 600px) {
  .form-container {
    margin-left: 10px;
    margin-right: 10px;
  }
}
</style>
