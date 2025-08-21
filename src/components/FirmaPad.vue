<template>
  <v-card class="pa-6 firma-pad-container mx-auto rounded-xl elevation-3">
    <v-card-title class="text-h6 font-weight-bold text-center">Firma Digital</v-card-title>

    <v-card-text>
      <div style="font-size: 14px; line-height: 1.6">
        <h3 class="text-center mb-4">CONSENTIMIENTO INFORMADO Y EXONERACIÓN DE RESPONSABILIDAD</h3>

        <p>
          Yo, <strong>{{ nombre }}</strong
          >, con documento de identidad No. <strong>{{ cedula }}</strong
          >, manifiesto que participo de manera voluntaria en las actividades organizadas por la
          iglesia <strong>{{ iglesia }}</strong
          >, con domicilio en {{ direccion }}, y fui informado de lo siguiente:
        </p>

        <!-- Sección resumida para lectura rápida -->
        <h4>Voluntariedad del servicio</h4>
        <p>El Servidor declara que presta su servicio de manera totalmente voluntaria...</p>

        <h4>Reconocimiento de riesgos</h4>
        <p>
          El Servidor entiende que su labor puede implicar riesgos físicos, emocionales o
          materiales...
        </p>

        <h4>Obligaciones del Servidor</h4>
        <ul>
          <li>Cumplir instrucciones de pastores, líderes y coordinadores.</li>
          <li>Mantener conducta respetuosa y ética.</li>
          <li>No poner en riesgo a terceros.</li>
          <li>Usar correctamente los equipos e instalaciones.</li>
        </ul>

        <h4>Exoneración de responsabilidad</h4>
        <p>
          El Servidor libera y exonera de responsabilidad a la Iglesia, salvo dolo o negligencia
          grave.
        </p>

        <h4>Protección legal y confidencialidad</h4>
        <p>Se compromete a ceñirse a la ley y guardar reserva sobre información sensible.</p>

        <h4>Uso de imagen</h4>
        <p>Autoriza a la Iglesia a usar su imagen con fines de promoción, sin compensación.</p>

        <p class="mt-2">
          En {{ ciudad }}, a fecha <strong>{{ fecha }}</strong
          >.
        </p>
      </div>

      <!-- Indicaciones -->
      <p class="text-subtitle-2 mt-4 mb-2 text-center">✍️ Firma aquí con el mouse o tu dedo</p>

      <!-- Canvas de firma -->
      <canvas
        ref="canvas"
        class="firma-pad mb-3"
        @mousedown="empezarDibujo"
        @mousemove="dibujar"
        @mouseup="terminarDibujo"
        @mouseleave="terminarDibujo"
        @touchstart="empezarDibujoTouch"
        @touchmove="dibujarTouch"
        @touchend="terminarDibujo"
      ></canvas>

      <!-- Botones -->
      <v-row justify="center" class="mt-3" dense>
        <v-col cols="12" sm="4">
          <v-btn block color="grey" outlined @click="limpiar">Limpiar</v-btn>
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn block color="red" outlined @click="cancelar">Cancelar</v-btn>
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn block color="green darken-1" dark @click="firmar">Firmar Contrato</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'

const emit = defineEmits(['cancelar', 'firmado'])
const props = defineProps({
  nombre: String,
  cedula: String,
  actividad: String,
  iglesia: String,
  direccion: String,
  fecha: String,
  lugar: String,
  ciudad: String,
})

const canvas = ref(null)
let ctx
let dibujando = false

const getCanvasCoords = (e) => {
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

const empezarDibujo = (e) => {
  dibujando = true
  const { x, y } = getCanvasCoords(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const dibujar = (e) => {
  if (!dibujando) return
  const { x, y } = getCanvasCoords(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

const terminarDibujo = () => {
  dibujando = false
}

const empezarDibujoTouch = (e) => {
  e.preventDefault()
  const touch = e.touches[0]
  const { x, y } = getCanvasCoords(touch)
  ctx.beginPath()
  ctx.moveTo(x, y)
  dibujando = true
}

const dibujarTouch = (e) => {
  if (!dibujando) return
  const touch = e.touches[0]
  const { x, y } = getCanvasCoords(touch)
  ctx.lineTo(x, y)
  ctx.stroke()
}

const limpiar = () => {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
}

const cancelar = () => {
  limpiar()
  dibujando = false
  emit('cancelar')
}

const firmar = () => {
  const imagenBase64 = canvas.value.toDataURL('image/png')
  emit('firmado', imagenBase64)
}

onMounted(() => {
  const canvasEl = canvas.value
  const scale = window.devicePixelRatio || 1
  const width = canvasEl.offsetWidth
  const height = canvasEl.offsetHeight

  canvasEl.width = width * scale
  canvasEl.height = height * scale
  canvasEl.style.width = `${width}px`
  canvasEl.style.height = `${height}px`

  ctx = canvasEl.getContext('2d')
  ctx.scale(scale, scale)
  ctx.lineWidth = 2.5
  ctx.strokeStyle = '#000'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
})
</script>

<style scoped>
.firma-pad-container {
  background-color: #f9f9f9;
}
.firma-pad {
  width: 100%;
  height: 300px;
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 8px;
  cursor: crosshair;
  touch-action: none;
}
</style>
