<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { io } from 'socket.io-client'
import api from '@/plugins/axios'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

const dialog = ref(false)

const estado = ref('DISCONNECTED')
const qr = ref(null)

let socket = null

const SOCKET_URL = import.meta.env.VITE_SOCKET_BACKEND

/**
 * Verificar si el usuario puede administrar WhatsApp
 */
const isAdminOrPastor = computed(() => {
  return (
    userStore.user?.rol === 'administrador' ||
    userStore.user?.rol === 'pastor'
  )
})

/**
 * Obtener la iglesia del usuario
 */
function getIglesiaId() {
  return (
    userStore.user?.iglesiaId ||
    userStore.user?.iglesia?.id ||
    userStore.user?.iglesi?.id ||
    null
  )
}

/**
 * Abrir diálogo de WhatsApp
 */
async function abrirWhatsapp() {
  dialog.value = true

  try {
    const { data } = await api.get('/whatsapp/status')
    console.log('Respuesta HTTP', data)

    estado.value = data.status
    qr.value = data.qr

    /*
     * Si no existe una sesión para esta iglesia,
     * solicitar al backend que la cree.
     */
    if (data.status === 'DISCONNECTED') {
      await conectarWhatsapp()
    }
  } catch (error) {
    console.error(
      '❌ Error obteniendo estado de WhatsApp:',
      error
    )

    estado.value = 'DISCONNECTED'
    qr.value = null
  }
}

/**
 * Inicializar WhatsApp para la iglesia
 */
async function conectarWhatsapp() {
  try {
    const { data } = await api.post('/whatsapp/connect')

    estado.value = data.status
    qr.value = data.qr
  } catch (error) {
    console.error(
      '❌ Error conectando WhatsApp:',
      error
    )
  }
}

/**
 * Obtener texto según el estado
 */
function getText() {
  switch (estado.value) {
    case 'QR_READY':
      return 'Escanea el código QR con WhatsApp'

    case 'READY':
      return 'WhatsApp conectado correctamente'

    case 'DISCONNECTED':
    default:
      return 'Conectando WhatsApp...'
  }
}

/**
 * Obtener color según el estado
 */
function getColor() {
  switch (estado.value) {
    case 'QR_READY':
      return '#f39c12'

    case 'READY':
      return '#27ae60'

    case 'DISCONNECTED':
    default:
      return '#c0392b'
  }
}

/**
 * Conectar Socket.IO
 */
function conectarSocket() {
  if (!userStore.token) {
    console.warn('⚠️ No existe token de autenticación')
    return
  }

  console.log('🔌 Conectando Socket.IO a:', SOCKET_URL)

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: {
      token: userStore.token,
    },
  })

  socket.on('connect', () => {
    console.log('🔌 Socket conectado')
    console.log('🆔 Socket ID:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket desconectado:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('⚠️ Error conectando Socket:', error.message)
  })

  socket.on('whatsapp:status', (data) => {
    console.log('📡📡📡 EVENTO WHATSAPP RECIBIDO 📡📡📡')
    console.log('Datos:', data)

    const iglesiaId = getIglesiaId()

    console.log('🏛️ Iglesia del usuario:', iglesiaId)
    console.log('🏛️ Iglesia del evento:', data.iglesiaId)

    if (
      iglesiaId &&
      data.iglesiaId !== iglesiaId
    ) {
      console.log('🚫 Evento de otra iglesia')
      return
    }

    estado.value = data.status
    qr.value = data.qr
  })
}

/**
 * Cerrar Socket.IO
 */
onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
})

/**
 * Iniciar Socket.IO
 */
onMounted(() => {
  conectarSocket()
})
</script>
<template>
  <template v-if="isAdminOrPastor">
    <!-- 🔘 Botón flotante -->
    <button class="whatsapp-btn" :style="{ background: getColor() }" @click="abrirWhatsapp()">
      📱
    </button>

    <div v-if="dialog" class="dialog-backdrop" @click.self="dialog = false">
      <div class="dialog">
        <h3>Estado WhatsApp</h3>

        <p>
          <strong>{{ getText() }}</strong>
        </p>

        <div v-if="qr">
          <img :src="qr" alt="QR WhatsApp" />
          <p>Escanea este código con tu WhatsApp</p>
          <p>{{ estado }}</p>

          <p>{{ qr ? 'SI HAY QR' : 'NO HAY QR' }}</p>

          <p>{{ qr?.substring(0, 40) }}</p>
        </div>

        <div v-else-if="estado === 'READY'">
          <p>✅ Todo está funcionando correctamente</p>
        </div>

        <div v-else>
          <p>❌ Bot desconectado</p>
        </div>

        <button @click="dialog = false">
          Cerrar
        </button>
      </div>
    </div>
  </template>
</template>

<style scoped>
.whatsapp-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 9999;
}

.dialog-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  min-width: 320px;
}

img {
  width: 250px;
  margin-top: 10px;
}

button {
  margin-top: 15px;
}
</style>