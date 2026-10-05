
<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
} from 'vue'

import { io } from 'socket.io-client'
import WhatsappIcon from './WhatsappIcon.vue'
import api from '@/plugins/axios'
import { useUserStore } from '@/store/userStore'
const userStore = useUserStore()

const dialog = ref(false)
const estado = ref('DISCONNECTED')
const qr = ref(null)
const cargando = ref(false)

let socket = null

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_BACKEND


// ============================================================
// PERMISOS
// ============================================================

const isAdminOrPastor = computed(() => {
  const rol = String(
    userStore.user?.rol || '',
  )
    .trim()
    .toLowerCase()

  return (
    rol === 'administrador' ||
    rol === 'pastor'
  )
})


// ============================================================
// IGLESIA
// ============================================================

function getIglesiaId() {
  return (
    userStore.user?.iglesiaId ||
    userStore.user?.iglesia?.id ||
    userStore.user?.iglesi?.id ||
    null
  )
}


// ============================================================
// INFORMACIÓN DEL ESTADO
// ============================================================

const estadoInfo = computed(() => {
  switch (estado.value) {
    case 'QR_READY':
      return {
        title: 'WhatsApp requiere conexión',
        description:
          'Escanea el código QR desde WhatsApp para conectar la cuenta.',
        icon: 'qr_code_2',
        className: 'status-warning',
        label: 'Esperando escaneo',
      }

    case 'READY':
      return {
        title: 'WhatsApp conectado',
        description:
          'La conexión está activa y funcionando correctamente.',
        icon: 'check_circle',
        className: 'status-success',
        label: 'Conectado',
      }

    case 'DISCONNECTED':
    default:
      return {
        title: 'WhatsApp desconectado',
        description:
          'Estamos intentando establecer la conexión.',
        icon: 'cloud_off',
        className: 'status-danger',
        label: 'Desconectado',
      }
  }
})


// ============================================================
// CLASE DEL BOTÓN
// ============================================================

const buttonClass = computed(() => {
  switch (estado.value) {
    case 'READY':
      return 'connected'

    case 'QR_READY':
      return 'waiting'

    case 'DISCONNECTED':
    default:
      return 'disconnected'
  }
})


// ============================================================
// OBTENER ESTADO
// ============================================================

async function obtenerEstado() {
  try {
    const { data } = await api.get(
      '/whatsapp/status',
    )

    console.log(
      'Respuesta HTTP WhatsApp:',
      data,
    )

    estado.value =
      data.status || 'DISCONNECTED'

    qr.value =
      data.qr || null

  } catch (error) {
    console.error(
      'Error obteniendo estado de WhatsApp:',
      error,
    )

    estado.value = 'DISCONNECTED'
    qr.value = null
  }
}


// ============================================================
// ABRIR WHATSAPP
// ============================================================

async function abrirWhatsapp() {
  dialog.value = true

  await obtenerEstado()

  /*
   * Si no existe una sesión para esta iglesia,
   * solicitar al backend que la cree.
   */

  if (
    estado.value === 'DISCONNECTED'
  ) {
    await conectarWhatsapp()
  }
}


// ============================================================
// CONECTAR WHATSAPP
// ============================================================

async function conectarWhatsapp() {
  if (cargando.value) {
    return
  }

  cargando.value = true

  try {
    const { data } =
      await api.post(
        '/whatsapp/connect',
      )

    estado.value =
      data.status || 'DISCONNECTED'

    qr.value =
      data.qr || null

  } catch (error) {
    console.error(
      'Error conectando WhatsApp:',
      error,
    )

    estado.value =
      'DISCONNECTED'

    qr.value = null

  } finally {
    cargando.value = false
  }
}


// ============================================================
// SOCKET.IO
// ============================================================

function conectarSocket() {
  if (!userStore.token) {
    console.warn(
      'No existe token de autenticación',
    )

    return
  }

  if (!SOCKET_URL) {
    console.warn(
      'VITE_SOCKET_BACKEND no está configurado',
    )

    return
  }

  console.log(
    'Conectando Socket.IO a:',
    SOCKET_URL,
  )

  socket = io(
    SOCKET_URL,
    {
      transports: ['websocket'],

      auth: {
        token: userStore.token,
      },
    },
  )


  // ----------------------------------------------------------
  // CONECTADO
  // ----------------------------------------------------------

  socket.on(
    'connect',
    () => {
      console.log(
        'Socket conectado:',
        socket.id,
      )
    },
  )


  // ----------------------------------------------------------
  // DESCONECTADO
  // ----------------------------------------------------------

  socket.on(
    'disconnect',
    (reason) => {
      console.log(
        'Socket desconectado:',
        reason,
      )
    },
  )


  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  socket.on(
    'connect_error',
    (error) => {
      console.error(
        'Error conectando Socket:',
        error.message,
      )
    },
  )


  // ----------------------------------------------------------
  // ESTADO WHATSAPP
  // ----------------------------------------------------------

  socket.on(
    'whatsapp:status',
    (data) => {
      console.log(
        'Evento WhatsApp recibido:',
        data,
      )

      const iglesiaId =
        getIglesiaId()

      /*
       * Evitar recibir eventos
       * de otra iglesia.
       */

      if (
        iglesiaId &&
        data.iglesiaId != null &&
        Number(data.iglesiaId) !==
        Number(iglesiaId)
      ) {
        console.log(
          'Evento de otra iglesia ignorado',
        )

        return
      }

      estado.value =
        data.status || 'DISCONNECTED'

      qr.value =
        data.qr || null
    },
  )
}


// ============================================================
// CERRAR SOCKET
// ============================================================

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
})


// ============================================================
// INICIAR
// ============================================================

onMounted(() => {
  console.log(
    'Usuario WhatsApp:',
    userStore.user,
  )

  console.log(
    'Rol WhatsApp:',
    userStore.user?.rol,
  )

  console.log(
    'Puede administrar WhatsApp:',
    isAdminOrPastor.value,
  )

  conectarSocket()
})
</script>


<template>

  <!-- ========================================================
       WHATSAPP
  ========================================================= -->

  <template v-if="isAdminOrPastor">

    <!-- ======================================================
         BOTÓN FLOTANTE
    ======================================================= -->

    <button type="button" class="whatsapp-fab" :class="buttonClass" title="Estado de WhatsApp"
      aria-label="Abrir estado de WhatsApp" @click="abrirWhatsapp">
      <span class="status-dot"></span>

      <WhatsappIcon class="whatsapp-logo" />
    </button>


    <!-- ======================================================
         MODAL
    ======================================================= -->

    <transition name="modal">

      <div v-if="dialog" class="dialog-backdrop" @click.self="dialog = false">

        <div class="dialog">

          <!-- ==================================================
               HEADER
          =================================================== -->

          <div class="dialog-header">

            <div class="dialog-title">

              <div class="whatsapp-icon">

                <div class="whatsapp-icon">
                  <WhatsappIcon class="whatsapp-logo-modal" />
                </div>

              </div>

              <div>

                <h3>
                  WhatsApp
                </h3>

                <span>
                  Conexión del sistema
                </span>

              </div>

            </div>


            <button type="button" class="close-button" aria-label="Cerrar" @click="dialog = false">

              <span class="material-icons">
                close
              </span>

            </button>

          </div>


          <!-- ==================================================
               ESTADO
          =================================================== -->

          <div class="status-card" :class="estadoInfo.className">

            <div class="status-icon">

              <span class="material-icons">
                {{ estadoInfo.icon }}
              </span>

            </div>


            <div class="status-content">

              <strong>
                {{ estadoInfo.title }}
              </strong>

              <span>
                {{ estadoInfo.description }}
              </span>

            </div>


            <div class="status-label">
              {{ estadoInfo.label }}
            </div>

          </div>


          <!-- ==================================================
               CARGANDO
          =================================================== -->

          <div v-if="cargando" class="loading-message">

            <span class="material-icons">
              sync
            </span>

            <div>

              <strong>
                Preparando WhatsApp
              </strong>

              <span>
                Estamos iniciando la conexión.
              </span>

            </div>

          </div>


          <!-- ==================================================
               QR
          =================================================== -->

          <div v-else-if="
            estado === 'QR_READY' &&
            qr
          " class="qr-section">

            <div class="qr-container">

              <img :src="qr" alt="Código QR de WhatsApp" />

            </div>


            <div class="qr-info">

              <strong>
                Escanea el código QR
              </strong>

              <span>
                Abre WhatsApp en tu celular,
                entra a
                <b>Dispositivos vinculados</b>
                y escanea este código.
              </span>

            </div>

          </div>


          <!-- ==================================================
               CONECTADO
          =================================================== -->

          <div v-else-if="
            estado === 'READY'
          " class="connected-message">

            <div class="connected-icon">

              <span class="material-icons">
                verified
              </span>

            </div>

            <div>

              <strong>
                Todo está funcionando
              </strong>

              <span>
                El sistema puede utilizar
                la conexión de WhatsApp.
              </span>

            </div>

          </div>


          <!-- ==================================================
               DESCONECTADO
          =================================================== -->

          <div v-else class="disconnected-message">

            <span class="material-icons">
              sync
            </span>

            <div>

              <strong>
                Intentando conectar
              </strong>

              <span>
                La conexión se está estableciendo.
                Esto puede tardar unos segundos.
              </span>

            </div>

          </div>


          <!-- ==================================================
               FOOTER
          =================================================== -->

          <div class="dialog-footer">

            <span class="live-status">

              <span class="live-dot" :class="buttonClass"></span>

              Actualización en tiempo real

            </span>


            <button type="button" class="close-main-button" @click="dialog = false">
              Cerrar
            </button>

          </div>

        </div>

      </div>

    </transition>

  </template>

</template>


<style scoped>

.whatsapp-logo {
  width: 24px;
  height: 24px;
}

.whatsapp-logo-modal {
  width: 22px;
  height: 22px;
}
/* ============================================================
   BOTÓN FLOTANTE
============================================================ */

.whatsapp-fab {

  position: fixed;

  right: 22px;
  bottom: 22px;

  width: 48px;
  height: 48px;

  display: flex;

  align-items: center;
  justify-content: center;

  border: none;

  border-radius: 50%;

  color: white;

  cursor: pointer;

  z-index: 9999;

  box-shadow:
    0 6px 18px rgba(0, 0, 0, .16);

  transition:
    transform .2s ease,
    box-shadow .2s ease;

}


.whatsapp-fab.connected {
  background: #16845b;
}


.whatsapp-fab.waiting {
  background: #c98916;
}


.whatsapp-fab.disconnected {
  background: #687482;
}


.whatsapp-fab:hover {

  transform:
    translateY(-2px);

  box-shadow:
    0 9px 24px rgba(0, 0, 0, .20);

}


.whatsapp-fab:active {

  transform:
    scale(.94);

}




/* ============================================================
   PUNTO DE ESTADO
============================================================ */

.status-dot {

  position: absolute;

  top: 3px;
  right: 3px;

  width: 9px;
  height: 9px;

  border-radius: 50%;

  background: #d4dbe2;

  border: 2px solid white;

}


.whatsapp-fab.connected .status-dot {
  background: #45d58d;
}


.whatsapp-fab.waiting .status-dot {
  background: #ffd166;
}


.whatsapp-fab.disconnected .status-dot {
  background: #ff7474;
}


/* ============================================================
   BACKDROP
============================================================ */

.dialog-backdrop {

  position: fixed;

  inset: 0;

  z-index: 10000;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(15, 23, 42, .42);

  backdrop-filter:
    blur(4px);

}


/* ============================================================
   MODAL
============================================================ */

.dialog {

  width: 100%;

  max-width: 460px;

  overflow: hidden;

  background: white;

  border:
    1px solid rgba(15, 23, 42, .08);

  border-radius: 18px;

  box-shadow:
    0 24px 70px rgba(15, 23, 42, .22);

}


/* ============================================================
   HEADER
============================================================ */

.dialog-header {

  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 18px 20px;

  border-bottom:
    1px solid #edf0f3;

}


.dialog-title {

  display: flex;

  align-items: center;

  gap: 11px;

}


.whatsapp-icon {

  width: 38px;
  height: 38px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    #edf8f2;

  color:
    #16845b;

}


.whatsapp-icon .material-icons {

  font-size: 21px;

}


.dialog-title h3 {

  margin: 0;

  color:
    #172033;

  font-size: 15px;

  font-weight: 700;

}


.dialog-title span {

  display: block;

  margin-top: 2px;

  color:
    #8994a3;

  font-size: 11px;

}


.close-button {

  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 0;

  border: none;

  border-radius: 8px;

  background:
    transparent;

  color:
    #8b96a5;

  cursor: pointer;

  transition:
    background .2s ease,
    color .2s ease;

}


.close-button:hover {

  background:
    #f3f5f7;

  color:
    #273449;

}


.close-button .material-icons {

  font-size: 19px;

}


/* ============================================================
   STATUS CARD
============================================================ */

.status-card {

  position: relative;

  display: flex;

  align-items: center;

  gap: 12px;

  margin: 18px 20px 0;

  padding: 13px;

  border-radius: 12px;

  border: 1px solid;

}


.status-success {

  background: #f1faf5;

  border-color: #d1eddd;

}


.status-warning {

  background: #fff9ed;

  border-color: #f4e3bc;

}


.status-danger {

  background: #f7f8fa;

  border-color: #e1e5ea;

}


.status-icon {

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

}


.status-success .status-icon {

  background: #dff4e8;

  color: #16845b;

}


.status-warning .status-icon {

  background: #fff0c9;

  color: #b57a0c;

}


.status-danger .status-icon {

  background: #e8ecf0;

  color: #687482;

}


.status-icon .material-icons {

  font-size: 20px;

}


.status-content {

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;

}


.status-content strong {

  color: #273449;

  font-size: 12.5px;

}


.status-content span {

  color: #7b8797;

  font-size: 10.5px;

  line-height: 1.4;

}


.status-label {

  margin-left: auto;

  flex-shrink: 0;

  padding: 4px 7px;

  border-radius: 20px;

  background: rgba(0, 0, 0, .045);

  color: #667281;

  font-size: 9px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: .4px;

}


/* ============================================================
   QR
============================================================ */

.qr-section {

  display: flex;

  flex-direction: column;

  align-items: center;

  padding:
    20px 20px 12px;

}


.qr-container {

  width: 220px;
  height: 220px;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 9px;

  background: white;

  border:
    1px solid #e4e8ed;

  border-radius: 14px;

  box-shadow:
    0 5px 18px rgba(15, 23, 42, .07);

}


.qr-container img {

  width: 100%;
  height: 100%;

  object-fit: contain;

}


.qr-info {

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 4px;

  max-width: 330px;

  margin-top: 13px;

  text-align: center;

}


.qr-info strong {

  color:
    #273449;

  font-size: 12px;

}


.qr-info span {

  color:
    #8994a3;

  font-size: 10.5px;

  line-height: 1.5;

}


.qr-info b {

  color:
    #526173;

}


/* ============================================================
   CONECTADO / DESCONECTADO / CARGANDO
============================================================ */

.connected-message,
.disconnected-message,
.loading-message {

  display: flex;

  align-items: center;

  gap: 11px;

  margin: 18px 20px;

  padding: 14px;

  border-radius: 11px;

}


.connected-message {

  background:
    #f5faf7;

  border:
    1px solid #e1f0e7;

}


.disconnected-message,
.loading-message {

  background:
    #f7f8fa;

  border:
    1px solid #e8ebef;

}


.connected-icon {

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    #dff4e8;

  color:
    #16845b;

}


.connected-icon .material-icons {

  font-size: 20px;

}


.disconnected-message>.material-icons,
.loading-message>.material-icons {

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    #e9edf1;

  color:
    #6e7987;

  font-size: 19px;

  animation:
    rotate 1.2s linear infinite;

}


.connected-message div:last-child,
.disconnected-message div:last-child,
.loading-message div:last-child {

  display: flex;

  flex-direction: column;

  gap: 3px;

}


.connected-message strong,
.disconnected-message strong,
.loading-message strong {

  color:
    #273449;

  font-size: 12px;

}


.connected-message span,
.disconnected-message span,
.loading-message span {

  color:
    #8994a3;

  font-size: 10.5px;

  line-height: 1.4;

}


/* ============================================================
   FOOTER
============================================================ */

.dialog-footer {

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    13px 20px;

  border-top:
    1px solid #edf0f3;

  background:
    #fafbfc;

}


.live-status {

  display: flex;

  align-items: center;

  gap: 6px;

  color:
    #8994a3;

  font-size: 10px;

}


.live-dot {

  width: 6px;
  height: 6px;

  border-radius: 50%;

}


.live-dot.connected {

  background:
    #31b978;

  box-shadow:
    0 0 0 3px rgba(49, 185, 120, .10);

}


.live-dot.waiting {

  background:
    #d69a22;

}


.live-dot.disconnected {

  background:
    #9aa4af;

}


.close-main-button {

  min-height: 32px;

  padding:
    0 13px;

  border:
    1px solid #dce2e8;

  border-radius: 7px;

  background:
    white;

  color:
    #526173;

  font-family: inherit;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background .2s ease,
    border-color .2s ease;

}


.close-main-button:hover {

  background:
    #f5f7f9;

  border-color:
    #cbd3dc;

}


/* ============================================================
   ANIMACIONES
============================================================ */

.modal-enter-active,
.modal-leave-active {

  transition:
    opacity .2s ease;

}


.modal-enter-active .dialog,
.modal-leave-active .dialog {

  transition:
    transform .22s ease,
    opacity .22s ease;

}


.modal-enter-from,
.modal-leave-to {

  opacity: 0;

}


.modal-enter-from .dialog,
.modal-leave-to .dialog {

  opacity: 0;

  transform:
    translateY(10px) scale(.98);

}


@keyframes rotate {

  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }

}


/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 600px) {

  .whatsapp-fab {

    right: 15px;
    bottom: 15px;

    width: 45px;
    height: 45px;

  }


  .dialog-backdrop {

    padding: 12px;

    align-items: flex-end;

  }


  .dialog {

    max-width: none;

    border-radius:
      18px 18px 14px 14px;

  }


  .qr-container {

    width: 200px;
    height: 200px;

  }


  .status-card {

    margin-left: 14px;
    margin-right: 14px;

  }


  .dialog-header {

    padding:
      16px;

  }


  .dialog-footer {

    padding:
      12px 16px;

  }

}
</style>
