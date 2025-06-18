// main.js
import { createApp } from 'vue'
import App from './App.vue'

// Vue Router
import router from './router/index'

// Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as component from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Pinia + Persistencia
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Crear app y plugins
const app = createApp(App)

const vuetify = createVuetify({
  components: {
    ...component,
  },
  directives,
  ssr: true,
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Usar plugins
app.use(router)
app.use(vuetify)
app.use(pinia)

// Montar app
app.mount('#app')
