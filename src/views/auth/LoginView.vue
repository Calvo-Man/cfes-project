```vue
<template>
  <v-container fluid class="login-page d-flex align-center justify-center pa-4"
    :class="modo === 'cafeteria' ? 'theme-cafeteria' : 'theme-iglesia'">
    <div class="login-background"></div>

    <v-card class="login-card" elevation="0">

      <!-- Logo -->
      <div class="logo-container">
        <img src="@/assets/centro-de-fe-removebg.png" alt="Centro de Fe y Esperanza" class="logo" />
      </div>

      <!-- Marca -->
      <div class="brand-title">
        CFES Central
      </div>

      <div class="brand-subtitle">
        Plataforma de gestión integral
      </div>

      <!-- Selector -->
      <div class="mode-selector">

        <div class="mode-slider" :class="{ cafeteria: modo === 'cafeteria' }"></div>

        <button type="button" class="mode-option" :class="{ active: modo === 'iglesia' }"
          @click="cambiarModo('iglesia')">
          <v-icon size="18">
            mdi-church-outline
          </v-icon>

          <span>Iglesia</span>
        </button>

        <button type="button" class="mode-option" :class="{ active: modo === 'cafeteria' }"
          @click="cambiarModo('cafeteria')">
          <v-icon size="18">
            mdi-coffee-outline
          </v-icon>

          <span>Cafetería</span>
        </button>

      </div>

      <!-- Contenido dinámico -->
      <Transition name="mode-content" mode="out-in">
        <div :key="modo">

          <!-- Descripción -->
          <div class="login-heading">

            <div class="heading-accent"></div>

            <h1>
              {{
                modo === 'iglesia'
                  ? 'Plataforma de gestión integral'
                  : 'Gestión de Cafetería'
              }}
            </h1>

            <p>
              {{
                modo === 'iglesia'
                  ? 'Administra miembros, actividades y recursos desde una sola plataforma.'
                  : 'Controla ventas, inventario, compras, caja y cuentas desde un solo lugar.'
              }}
            </p>

          </div>

          <!-- Capacidades -->
          <div class="system-features">

            <template v-if="modo === 'iglesia'">

              <div class="feature">
                <v-icon size="17">
                  mdi-account-group-outline
                </v-icon>

                <span>Miembros</span>
              </div>

              <div class="feature-divider"></div>

              <div class="feature">
                <v-icon size="17">
                  mdi-calendar-check-outline
                </v-icon>

                <span>Actividades</span>
              </div>

              <div class="feature-divider"></div>

              <div class="feature">
                <v-icon size="17">
                  mdi-chart-box-outline
                </v-icon>

                <span>Gestión</span>
              </div>

            </template>

            <template v-else>

              <div class="feature">
                <v-icon size="17">
                  mdi-point-of-sale
                </v-icon>

                <span>Ventas</span>
              </div>

              <div class="feature-divider"></div>

              <div class="feature">
                <v-icon size="17">
                  mdi-package-variant-closed
                </v-icon>

                <span>Inventario</span>
              </div>

              <div class="feature-divider"></div>

              <div class="feature">
                <v-icon size="17">
                  mdi-cash-register
                </v-icon>

                <span>Caja</span>
              </div>

            </template>

          </div>

        </div>
      </Transition>

      <!-- Formulario -->
      <v-form @submit.prevent="submit">

        <div class="field-label">
          Usuario
        </div>

        <v-text-field v-model="usuario" placeholder="Ingresa tu usuario" prepend-inner-icon="mdi-account-outline"
          variant="outlined" density="compact" hide-details class="login-field" autocomplete="username"
          :disabled="loading" />

        <div class="field-label password-label">
          Contraseña
        </div>

        <v-text-field v-model="password" :type="visible ? 'text' : 'password'" :append-inner-icon="visible
          ? 'mdi-eye-off-outline'
          : 'mdi-eye-outline'
          " placeholder="Ingresa tu contraseña" prepend-inner-icon="mdi-lock-outline" variant="outlined"
          density="compact" hide-details class="login-field" autocomplete="current-password" :disabled="loading"
          @click:append-inner="visible = !visible" />

        <!-- Error -->
        <v-slide-y-transition>
          <div v-if="password_error" class="error-message">
            <v-icon size="16">
              mdi-alert-circle-outline
            </v-icon>

            <span>
              {{ password_error }}
            </span>
          </div>
        </v-slide-y-transition>

        <!-- Botón -->
        <Transition name="button-content" mode="out-in">
          <v-btn :key="modo" type="submit" block :loading="loading" :class="[
            'login-button',
            modo === 'cafeteria'
              ? 'cafeteria-button'
              : 'iglesia-button'
          ]">
            <template #prepend>
              <v-icon size="18">
                {{
                  modo === 'cafeteria'
                    ? 'mdi-coffee'
                    : 'mdi-login'
                }}
              </v-icon>
            </template>

            {{
              modo === 'cafeteria'
                ? 'Entrar a Cafetería'
                : 'Iniciar Sesión'
            }}
          </v-btn>
        </Transition>

      </v-form>

      <!-- Footer -->
      <div class="login-footer">
        <span>
          CFES Central · Plataforma de gestión
        </span>
      </div>

    </v-card>

    <Notificacion ref="notificacionRef" />

  </v-container>
</template>


<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { useUserStore } from '@/store/userStore'
import { useCafeteriaAuthStore } from '@/store/cafeteriaAuthStore'

import Notificacion from '@/components/Notificacion.vue'
import api from '@/plugins/axios'

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()
const cafeteriaAuthStore = useCafeteriaAuthStore()

/*
|--------------------------------------------------------------------------
| Modo de acceso
|--------------------------------------------------------------------------
*/

const modo = ref(
  route.query.modo === 'cafeteria'
    ? 'cafeteria'
    : 'iglesia',
)

/*
|--------------------------------------------------------------------------
| Formulario
|--------------------------------------------------------------------------
*/

const usuario = ref('')
const password = ref('')
const loading = ref(false)
const password_error = ref('')
const visible = ref(false)

const notificacionRef = ref(null)

/*
|--------------------------------------------------------------------------
| Sincronizar modo con la URL
|--------------------------------------------------------------------------
|
| Ejemplo:
|
| /login
| /login?modo=cafeteria
|
*/

watch(
  () => route.query.modo,
  (nuevoModo) => {
    modo.value =
      nuevoModo === 'cafeteria'
        ? 'cafeteria'
        : 'iglesia'
  },
)

/*
|--------------------------------------------------------------------------
| Cambiar modo
|--------------------------------------------------------------------------
*/

const cambiarModo = (nuevoModo) => {
  if (modo.value === nuevoModo) return

  modo.value = nuevoModo

  password_error.value = ''
  password.value = ''
  visible.value = false

  /*
   * Mantener la URL sincronizada con el modo.
   */
  router.replace({
    path: '/login',
    query:
      nuevoModo === 'cafeteria'
        ? { modo: 'cafeteria' }
        : {},
  })
}

/*
|--------------------------------------------------------------------------
| Submit
|--------------------------------------------------------------------------
*/

const submit = async () => {
  if (!usuario.value || !password.value) {
    password_error.value =
      'Ingresa tu usuario y contraseña'

    return
  }

  loading.value = true
  password_error.value = ''

  try {
    if (modo.value === 'iglesia') {
      await loginIglesia()
    } else {
      await loginCafeteria()
    }
  } catch (error) {
    password_error.value =
      error.response?.data?.message ||
      'Error de autenticación'
  } finally {
    loading.value = false
  }
}

/*
|--------------------------------------------------------------------------
| Login Iglesia
|--------------------------------------------------------------------------
*/

const loginIglesia = async () => {
  const response = await api.post('/auth/login', {
    user: usuario.value,
    password: password.value,
  })

  const {
    user,
    access_token,
  } = response.data

  userStore.login(
    user,
    access_token,
  )

  notificacionRef.value?.mostrar(
    'Inicio de sesión exitoso',
    'success',
  )

  setTimeout(() => {
    router.push({
      path: '/',
    })
  }, 500)
}

/*
|--------------------------------------------------------------------------
| Login Cafetería
|--------------------------------------------------------------------------
*/

const loginCafeteria = async () => {
  const response = await api.post(
    '/cafeteria/auth/login',
    {
      user: usuario.value,
      password: password.value,
    },
  )

  const {
    user,
    access_token,
    iglesia,
  } = response.data

  cafeteriaAuthStore.login(
    user,
    access_token,
    iglesia,
  )

  notificacionRef.value?.mostrar(
    'Acceso a cafetería exitoso',
    'success',
  )

  setTimeout(() => {
    router.push({
      path: '/cafeteria/dashboard',
    })
  }, 500)
}
</script>



<style scoped>
/* =========================================================
   BASE
========================================================= */

.login-page {
  min-height: 100vh;

  position: relative;

  overflow: hidden;

  background: #f5f7fb;

  transition:
    background 0.35s ease;
}

.login-background {
  position: absolute;

  inset: 0;

  background-image:
    linear-gradient(rgba(255, 255, 255, 0.8) 1px,
      transparent 1px),
    linear-gradient(90deg,
      rgba(255, 255, 255, 0.8) 1px,
      transparent 1px);

  background-size: 40px 40px;

  opacity: 0.7;
}

/* =========================================================
   CARD
========================================================= */

.login-card {
  position: relative;

  z-index: 1;

  width: 100%;
  max-width: 410px;

  padding: 25px 30px 18px;

  border-radius: 18px;

  background: rgba(255, 255, 255, 0.97);

  border: 1px solid rgba(20, 30, 50, 0.07);

  box-shadow:
    0 18px 45px rgba(20, 30, 50, 0.10);

  transition:
    box-shadow 0.35s ease;
}

/* =========================================================
   LOGO
========================================================= */

.logo-container {
  display: flex;

  justify-content: center;

  margin-bottom: 5px;
}

.logo {
  width: 64px;
  height: 64px;

  object-fit: contain;
}

/* =========================================================
   BRAND
========================================================= */

.brand-title {
  text-align: center;

  font-size: 18px;

  font-weight: 750;

  letter-spacing: -0.3px;

  color: #1d2433;

  line-height: 1.2;
}

.brand-subtitle {
  text-align: center;

  margin-top: 3px;

  font-size: 11px;

  color: #89919e;
}



/* =========================================================
   MODE SELECTOR
========================================================= */

.mode-selector {
  position: relative;

  display: flex;

  margin-top: 18px;

  padding: 3px;

  border-radius: 10px;

  background: #f0f2f6;

  gap: 3px;
}

.mode-slider {
  position: absolute;

  top: 3px;
  left: 3px;

  width: calc(50% - 4px);

  height: 34px;

  border-radius: 8px;

  background: #ffffff;

  box-shadow:
    0 3px 10px rgba(20, 30, 50, 0.10);

  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease;
}

.mode-slider.cafeteria {
  transform: translateX(calc(100% + 3px));
}

.mode-option {
  position: relative;

  z-index: 1;

  flex: 1;

  height: 34px;

  border: 0;

  border-radius: 8px;

  background: transparent;

  color: #858d99;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 6px;

  font-size: 12.5px;

  font-weight: 600;

  cursor: pointer;

  transition:
    color 0.25s ease;
}

.mode-option.active {
  color: var(--accent);
}

.theme-iglesia {
  --accent: #5965d8;
  --accent-soft: rgba(89, 101, 216, 0.10);
}

.theme-cafeteria {
  --accent: #765548;
  --accent-soft: rgba(118, 85, 72, 0.10);
}

/* =========================================================
   CONTENT
========================================================= */

.login-heading {
  margin-top: 17px;

  margin-bottom: 13px;

  text-align: center;
}

.heading-accent {
  width: 25px;
  height: 3px;

  margin: 0 auto 8px;

  border-radius: 10px;

  background: var(--accent);

  transition:
    background 0.3s ease;
}

.login-heading h1 {
  margin: 0;

  font-size: 20px;

  font-weight: 700;

  letter-spacing: -0.3px;

  color: #202631;
}

.login-heading p {
  max-width: 340px;

  margin: 5px auto 0;

  font-size: 12px;

  line-height: 1.45;

  color: #7b8492;
}

/* =========================================================
   FEATURES
========================================================= */

.system-features {
  display: flex;

  align-items: center;

  justify-content: center;

  margin: 0 0 16px;

  min-height: 25px;
}

.feature {
  display: flex;

  align-items: center;

  gap: 5px;

  padding: 0 10px;

  color: #68717f;

  font-size: 10.5px;

  font-weight: 600;

  transition:
    color 0.25s ease;
}

.feature .v-icon {
  color: var(--accent);

  transition:
    color 0.25s ease;
}

.feature-divider {
  width: 1px;

  height: 17px;

  background: #e1e4e9;
}

/* =========================================================
   MODE ANIMATION
========================================================= */

.mode-content-enter-active,
.mode-content-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.mode-content-enter-from {
  opacity: 0;

  transform: translateY(7px);
}

.mode-content-leave-to {
  opacity: 0;

  transform: translateY(-5px);
}

/* =========================================================
   FORM
========================================================= */

.field-label {
  margin-bottom: 5px;

  font-size: 11.5px;

  font-weight: 600;

  color: #424a57;
}

.password-label {
  margin-top: 11px;
}

.login-field {
  margin-bottom: 0;
}

.login-field :deep(.v-field) {
  border-radius: 9px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.login-field :deep(.v-field--focused) {
  box-shadow:
    0 0 0 3px var(--accent-soft);
}

.login-field :deep(.v-field__input) {
  min-height: 40px;

  font-size: 13px;
}

.login-field :deep(.v-field__prepend-inner) {
  padding-left: 10px;
}

.login-field :deep(.v-icon) {
  font-size: 18px;
}

/* =========================================================
   ERROR
========================================================= */

.error-message {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 8px;

  padding: 7px 9px;

  border-radius: 7px;

  background: #fff3f3;

  color: #c62828;

  font-size: 11.5px;
}

/* =========================================================
   BUTTON
========================================================= */

.login-button {
  height: 40px !important;

  margin-top: 15px;

  border-radius: 9px !important;

  text-transform: none;

  font-size: 13px;

  font-weight: 600;

  letter-spacing: 0;

  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

.login-button:hover {
  transform: translateY(-1px);
}

/* =========================================================
   BUTTON MODE ANIMATION
========================================================= */

.button-content-enter-active,
.button-content-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.button-content-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.button-content-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Iglesia */

.iglesia-button {
  color: white !important;

  background:
    linear-gradient(135deg,
      #5965d8,
      #6853c8) !important;

  box-shadow:
    0 7px 18px rgba(91, 87, 205, 0.22);
}

/* Cafetería */

.cafeteria-button {
  color: white !important;

  background:
    linear-gradient(135deg,
      #795548,
      #5d4037) !important;

  box-shadow:
    0 7px 18px rgba(93, 64, 55, 0.22);
}

/* =========================================================
   FOOTER
========================================================= */

.login-footer {
  margin-top: 16px;

  padding-top: 11px;

  border-top: 1px solid #edf0f4;

  text-align: center;

  font-size: 10px;

  color: #9aa1ad;
}

/* =========================================================
   SMALL HEIGHT
========================================================= */

@media (max-height: 700px) {

  .login-card {
    padding-top: 18px;
    padding-bottom: 13px;
  }

  .logo {
    width: 52px;
    height: 52px;
  }

  .mode-selector {
    margin-top: 12px;
  }

  .login-heading {
    margin-top: 12px;
    margin-bottom: 9px;
  }

  .login-heading h1 {
    font-size: 18px;
  }

  .login-heading p {
    font-size: 11px;
  }

  .system-features {
    margin-bottom: 11px;
  }

  .password-label {
    margin-top: 8px;
  }

  .login-button {
    margin-top: 11px;
  }

  .login-footer {
    margin-top: 10px;
    padding-top: 8px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 450px) {

  .login-page {
    padding: 12px !important;
  }

  .login-card {
    padding: 20px 20px 14px;

    border-radius: 15px;
  }

  .feature {
    padding: 0 6px;

    font-size: 9.5px;
  }
}
</style>

