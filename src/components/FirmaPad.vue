<template>
  <v-card class="pa-4 firma-pad-container">
    <v-card-title>Firma Digital</v-card-title>
    <canvas
      ref="canvas"
      class="firma-pad"
      @mousedown="empezarDibujo"
      @mousemove="dibujar"
      @mouseup="terminarDibujo"
      @mouseleave="terminarDibujo"
      @touchstart="empezarDibujoTouch"
      @touchmove="dibujarTouch"
      @touchend="terminarDibujo"
    ></canvas>
    <v-spacer></v-spacer>
    <v-btn class="mt-2" @click="limpiar" color="blue">Limpiar</v-btn>
    <v-btn class="mt-2" @click="cancelar" color="red">Cancelar</v-btn>
    <v-btn class="mt-2" @click="firmar" color="success">Firmar Contrato</v-btn>
  </v-card>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'

const emit = defineEmits(['cancelar', 'firmado'])

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
  emit('cancelar') // << emitir al padre
}

const firmar = () => {
  const imagenBase64 = canvas.value.toDataURL('image/png')
  emit('firmado', imagenBase64) // << emitir al padre
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
  ctx.lineWidth = 2
  ctx.strokeStyle = '#000'
})
</script>

<style scoped>
.firma-pad-container {
  background-color: var(--grey);
}
.firma-pad {
  width: 100%;
  height: 300px;
  background-color: #fff;
  border: 1px solid #ccc;
  cursor: url('./complementos/pluma.cur'), crosshair;
  touch-action: none;
}
</style>
