<template>
  <v-card class="pa-4 firma-pad-container">
    <v-card-title>Firma Digital</v-card-title>
    <v-card-text>
      <v-card-text>
        <div style="font-size: 14px; line-height: 1.6">
          <h3 style="text-align: center; margin-bottom: 16px">
            CONSENTIMIENTO INFORMADO Y EXONERACIÓN DE RESPONSABILIDAD
          </h3>

          <p>
            Yo, <strong>{{ nombre }}</strong
            >, con documento de identidad No. <strong>{{ cedula }}</strong
            >, manifiesto que participo de manera voluntaria en las actividades organizadas por la
            iglesia <strong>{{ iglesia }}</strong
            >, con domicilio en {{ direccion }}, y fui informado de lo siguiente:
          </p>

          <h4>Voluntariedad del servicio</h4>
          <p>
            El Servidor declara que presta su servicio de manera totalmente voluntaria, sin que
            exista relación laboral, contrato de trabajo ni contraprestación económica alguna por
            parte de la Iglesia.
          </p>

          <h4>Reconocimiento de riesgos</h4>
          <p>
            El Servidor entiende que su labor puede implicar riesgos físicos, emocionales o
            materiales derivados de la naturaleza de las actividades de servicio, y los asume bajo
            su entera responsabilidad.
          </p>

          <h4>Obligaciones del Servidor</h4>
          <ul>
            <li>Cumplir con las instrucciones de los pastores, líderes y coordinadores.</li>
            <li>Mantener una conducta respetuosa y ética en todo momento.</li>
            <li>No poner en riesgo la integridad física o moral de otras personas.</li>
            <li>Usar correctamente los equipos, instalaciones y materiales de la Iglesia.</li>
          </ul>

          <h4>Exoneración de responsabilidad</h4>
          <p>
            El Servidor libera y exonera de toda responsabilidad a la Iglesia, sus líderes,
            pastores, voluntarios y representantes, por cualquier accidente, lesión, enfermedad,
            daño o pérdida que pueda sufrir durante el desarrollo de sus funciones, salvo en casos
            de dolo o negligencia grave comprobada por autoridad competente.
          </p>

          <h4>Protección legal</h4>
          <p>
            El Servidor reconoce que cualquier reclamación, demanda o queja que interponga deberá
            ceñirse a las leyes vigentes, y renuncia expresamente a iniciar acciones infundadas
            contra la Iglesia o sus miembros.
          </p>

          <h4>Confidencialidad</h4>
          <p>
            El Servidor se compromete a guardar reserva sobre cualquier información sensible o
            privada a la que tenga acceso en el ejercicio de su servicio.
          </p>

          <h4>Uso de imagen</h4>
          <p>
            El Servidor autoriza de manera libre, voluntaria e informada a la Iglesia para tomar,
            grabar y difundir fotografías, videos o audios en los que aparezca su imagen o voz, con
            fines de promoción, difusión y registro de las actividades eclesiásticas, sin que esto
            genere derecho a remuneración o compensación alguna.
          </p>

          <p>
            En la ciudad de <strong>{{ ciudad }}</strong
            >, a fecha <strong>{{ fecha }}</strong
            >.
          </p>
        </div>
      </v-card-text>
    </v-card-text>
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
import { ref, onMounted, defineEmits, computed } from 'vue'

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
