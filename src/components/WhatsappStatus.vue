// Este componente muestra el estado de la conexión con WhatsApp y el QR para escanear -
WhatsappStatus.vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const estado = ref('DISCONNECTED')
const qr = ref(null)
const dialog = ref(false)

let socket

onMounted(() => {
  if (!socket) {
    socket = io('http://localhost:3000')
  }

  socket.on('whatsapp:status', (data) => {
    estado.value = data.status
    qr.value = data.qr
  })
})
onUnmounted(() => {
  socket?.disconnect()
})

const getColor = () => {
  if (estado.value === 'READY') return 'green'
  if (estado.value === 'QR_READY') return 'orange'
  return 'red'
}

const getText = () => {
  if (estado.value === 'READY') return 'Conectado'
  if (estado.value === 'QR_READY') return 'Escanear QR'
  return 'Desconectado'
}
</script>

<template>
  <!-- 🔘 Botón flotante -->
  <button class="whatsapp-btn" :style="{ background: getColor() }" @click="dialog = true">
    📱
  </button>

  <!-- 🪟 Dialog -->
  <div v-if="dialog" class="dialog-backdrop" @click.self="dialog = false">
    <div class="dialog">
      <h3>Estado WhatsApp</h3>

      <p>
        <strong>{{ getText() }}</strong>
      </p>

      <!-- QR -->
      <div v-if="estado === 'QR_READY' && qr">
        <img :src="qr" alt="QR WhatsApp" />
        <p>Escanea este código con tu WhatsApp</p>
      </div>

      <!-- Conectado -->
      <div v-else-if="estado === 'READY'">
        <p>✅ Todo está funcionando correctamente</p>
      </div>

      <!-- Desconectado -->
      <div v-else>
        <p>❌ Bot desconectado</p>
      </div>

      <button @click="dialog = false">Cerrar</button>
    </div>
  </div>
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
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

img {
  width: 250px;
  margin-top: 10px;
}
</style>
