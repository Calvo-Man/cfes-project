
<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import api from '@/plugins/axios'

// ============================================
// ESTADO GENERAL
// ============================================

const loading = ref(true)
const loadingSaldo = ref(false)
const loadingHistorial = ref(false)
const loadingDetalle = ref(false)
const guardando = ref(false)

const cajaAbierta = ref(false)

const sesion = ref({})

const saldo = ref({
  sesionId: null,
  saldoInicial: 0,
  ingresos: 0,
  egresos: 0,
  saldoActual: 0,
})

const movimientos = ref([])

// ============================================
// HISTORIAL
// ============================================

const sesiones = ref([])

const dialogDetalle = ref(false)

const sesionDetalle = ref(null)

const resumenDetalle = ref({
  sesionId: null,
  estado: null,
  saldoInicial: 0,
  totalIngresos: 0,
  totalEgresos: 0,
  saldoEsperado: 0,
  dineroContado: null,
  diferencia: null,
  cantidadMovimientos: 0,
  fechaApertura: null,
  fechaCierre: null,
})

const movimientosDetalle = ref([])

// ============================================
// DIALOGOS
// ============================================

const dialogAbrir = ref(false)
const dialogCerrar = ref(false)

// ============================================
// FORMULARIOS
// ============================================

const formAbrir = ref({
  saldoInicial: 0,
  observacion: '',
})

const formCerrar = ref({
  dineroContado: null,
  observacionCierre: '',
})

// ============================================
// SNACKBAR
// ============================================

const snackbar = ref({
  visible: false,
  mensaje: '',
  color: 'success',
})

// ============================================
// COMPUTED
// ============================================

const diferenciaCierre = computed(() => {
  if (formCerrar.value.dineroContado === null) {
    return 0
  }

  return (
    Number(formCerrar.value.dineroContado) -
    Number(saldo.value.saldoActual)
  )
})

const tipoDiferencia = computed(() => {
  if (diferenciaCierre.value === 0) {
    return 'success'
  }

  if (diferenciaCierre.value > 0) {
    return 'info'
  }

  return 'warning'
})

const textoDiferencia = computed(() => {
  if (diferenciaCierre.value === 0) {
    return 'Caja cuadrada'
  }

  if (diferenciaCierre.value > 0) {
    return 'Sobrante'
  }

  return 'Faltante'
})

const tipoDiferenciaDetalle = computed(() => {
  const diferencia = Number(
    resumenDetalle.value.diferencia
  )

  if (diferencia === 0) {
    return 'success'
  }

  if (diferencia > 0) {
    return 'info'
  }

  return 'warning'
})

const textoDiferenciaDetalle = computed(() => {
  const diferencia = Number(
    resumenDetalle.value.diferencia
  )

  if (diferencia === 0) {
    return 'Caja cuadrada'
  }

  if (diferencia > 0) {
    return 'Sobrante'
  }

  return 'Faltante'
})

// ============================================
// CARGAR CAJA ACTUAL
// ============================================

async function cargarCaja() {
  loading.value = true

  try {
    const { data } = await api.get(
      '/cafeteria/caja-sesiones/abierta'
    )

    sesion.value = data
    cajaAbierta.value = true

    await Promise.all([
      cargarSaldo(),
      cargarMovimientos(data.id),
    ])

  } catch (error) {
    const status = error.response?.status

    if (status === 400 || status === 404) {
      cajaAbierta.value = false
      sesion.value = {}
      movimientos.value = []

      saldo.value = {
        sesionId: null,
        saldoInicial: 0,
        ingresos: 0,
        egresos: 0,
        saldoActual: 0,
      }
    } else {
      console.error(
        'Error cargando caja:',
        error
      )

      mostrarMensaje(
        error.response?.data?.message ||
          'No se pudo cargar la caja.',
        'error'
      )
    }
  } finally {
    loading.value = false
  }
}

// ============================================
// SALDO
// ============================================

async function cargarSaldo() {
  loadingSaldo.value = true

  try {
    const { data } = await api.get(
      '/cafeteria/caja-sesiones/saldo'
    )

    saldo.value = data
  } catch (error) {
    console.error(
      'Error cargando saldo:',
      error
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo cargar el saldo.',
      'error'
    )
  } finally {
    loadingSaldo.value = false
  }
}

// ============================================
// MOVIMIENTOS CAJA ACTUAL
// ============================================

async function cargarMovimientos(sesionId) {
  try {
    const { data } = await api.get(
      `/cafeteria/caja-movimientos/sesion/${sesionId}`
    )

    movimientos.value = Array.isArray(data)
      ? data
      : []
  } catch (error) {
    console.error(
      'Error cargando movimientos:',
      error
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudieron cargar los movimientos.',
      'error'
    )
  }
}

// ============================================
// HISTORIAL DE SESIONES
// ============================================

async function cargarHistorial() {
  loadingHistorial.value = true

  try {
    const { data } = await api.get(
      '/cafeteria/caja-sesiones'
    )

    sesiones.value = Array.isArray(data)
      ? data
      : []
  } catch (error) {
    console.error(
      'Error cargando historial:',
      error
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo cargar el historial de cajas.',
      'error'
    )
  } finally {
    loadingHistorial.value = false
  }
}

// ============================================
// DETALLE DE SESIÓN
// ============================================

async function verDetalleSesion(sesionSeleccionada) {
  if (!sesionSeleccionada?.id) {
    return
  }

  dialogDetalle.value = true
  loadingDetalle.value = true

  sesionDetalle.value = sesionSeleccionada

  try {
    const [resumenResponse, movimientosResponse] =
      await Promise.all([
        api.get(
          `/cafeteria/caja-sesiones/${sesionSeleccionada.id}/resumen`
        ),

        api.get(
          `/cafeteria/caja-movimientos/sesion/${sesionSeleccionada.id}`
        ),
      ])

    resumenDetalle.value =
      resumenResponse.data || {
        sesionId: null,
        estado: null,
        saldoInicial: 0,
        totalIngresos: 0,
        totalEgresos: 0,
        saldoEsperado: 0,
        dineroContado: null,
        diferencia: null,
        cantidadMovimientos: 0,
        fechaApertura: null,
        fechaCierre: null,
      }

    movimientosDetalle.value =
      Array.isArray(movimientosResponse.data)
        ? movimientosResponse.data
        : []

  } catch (error) {
    console.error(
      'Error cargando detalle de sesión:',
      error
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo cargar el detalle de la sesión.',
      'error'
    )

    dialogDetalle.value = false
  } finally {
    loadingDetalle.value = false
  }
}

// ============================================
// ABRIR CAJA
// ============================================

async function abrirCaja() {
  if (
    formAbrir.value.saldoInicial === null ||
    Number(formAbrir.value.saldoInicial) < 0
  ) {
    mostrarMensaje(
      'El saldo inicial no puede ser negativo.',
      'warning'
    )

    return
  }

  guardando.value = true

  try {
    const payload = {
      saldoInicial: Number(
        formAbrir.value.saldoInicial
      ),
    }

    if (formAbrir.value.observacion.trim()) {
      payload.observacion =
        formAbrir.value.observacion.trim()
    }

    await api.post(
      '/cafeteria/caja-sesiones/abrir',
      payload
    )

    mostrarMensaje(
      'Caja abierta correctamente.',
      'success'
    )

    dialogAbrir.value = false

    formAbrir.value = {
      saldoInicial: 0,
      observacion: '',
    }

    await Promise.all([
      cargarCaja(),
      cargarHistorial(),
    ])

  } catch (error) {
    console.error(
      'Error abriendo caja:',
      error
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo abrir la caja.',
      'error'
    )
  } finally {
    guardando.value = false
  }
}

// ============================================
// CERRAR CAJA
// ============================================

async function cerrarCaja() {
  if (
    formCerrar.value.dineroContado === null ||
    Number(formCerrar.value.dineroContado) < 0
  ) {
    mostrarMensaje(
      'Ingresa el dinero contado.',
      'warning'
    )

    return
  }

  guardando.value = true

  try {
    const payload = {
      dineroContado: Number(
        formCerrar.value.dineroContado
      ),
    }

    if (
      formCerrar.value.observacionCierre.trim()
    ) {
      payload.observacionCierre =
        formCerrar.value.observacionCierre.trim()
    }

    await api.post(
      '/cafeteria/caja-sesiones/cerrar',
      payload
    )

    mostrarMensaje(
      'Caja cerrada correctamente.',
      'success'
    )

    dialogCerrar.value = false

    formCerrar.value = {
      dineroContado: null,
      observacionCierre: '',
    }

    await Promise.all([
      cargarCaja(),
      cargarHistorial(),
    ])

  } catch (error) {
    console.error(
      'Error cerrando caja:',
      error
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo cerrar la caja.',
      'error'
    )
  } finally {
    guardando.value = false
  }
}

// ============================================
// ACTUALIZAR
// ============================================

async function actualizarCaja() {
  if (!sesion.value?.id) {
    return
  }

  await Promise.all([
    cargarSaldo(),
    cargarMovimientos(sesion.value.id),
    cargarHistorial(),
  ])
}

// ============================================
// FORMATEOS
// ============================================

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)
}

function formatoFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function nombreMiembro(miembro) {
  if (!miembro) {
    return 'Sin información'
  }

  if (miembro.nombreCompleto) {
    return miembro.nombreCompleto
  }

  if (miembro.nombre) {
    return `${miembro.nombre} ${miembro.apellido || ''}`.trim()
  }

  if (miembro.name) {
    return `${miembro.name} ${miembro.apellido || ''}`.trim()
  }

  return `Miembro #${miembro.id}`
}

function textoConcepto(concepto) {
  const textos = {
    VENTA: 'Venta',
    ANULACION_VENTA: 'Anulación de venta',
    COMPRA: 'Compra',
    ANULACION_COMPRA: 'Anulación de compra',
    PAGO_PROVEEDOR: 'Pago a proveedor',
    AJUSTE: 'Ajuste',
    DONACION: 'Donación',
    GASTO: 'Gasto',
    APERTURA_CAJA: 'Apertura de caja',
    CIERRE_CAJA: 'Cierre de caja',
  }

  return textos[concepto] || concepto
}

function colorEstado(estado) {
  if (estado === 'ABIERTA') {
    return 'success'
  }

  if (estado === 'CERRADA') {
    return 'grey'
  }

  return 'default'
}

function textoEstado(estado) {
  if (estado === 'ABIERTA') {
    return 'Abierta'
  }

  if (estado === 'CERRADA') {
    return 'Cerrada'
  }

  return estado || 'Sin estado'
}

// ============================================
// SNACKBAR
// ============================================

function mostrarMensaje(
  mensaje,
  color = 'success'
) {
  snackbar.value = {
    visible: true,
    mensaje,
    color,
  }
}

// ============================================
// INIT
// ============================================

onMounted(async () => {
  await Promise.all([
    cargarCaja(),
    cargarHistorial(),
  ])
})
</script>

<template>
  <v-container fluid class="pa-4">

    <!-- ===================================== -->
    <!-- ENCABEZADO -->
    <!-- ===================================== -->

    <div class="d-flex align-center justify-space-between mb-6">

      <div>
        <h1 class="text-h5 font-weight-bold">
          Caja
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Control de apertura, movimientos y cierre de caja
        </p>
      </div>

      <v-chip
        :color="cajaAbierta ? 'success' : 'error'"
        variant="tonal"
        size="large"
      >
        <v-icon
          :icon="
            cajaAbierta
              ? 'mdi-lock-open-variant'
              : 'mdi-lock'
          "
          class="mr-2"
        />

        {{ cajaAbierta ? 'Caja abierta' : 'Caja cerrada' }}
      </v-chip>

    </div>

    <!-- ===================================== -->
    <!-- LOADING -->
    <!-- ===================================== -->

    <div
      v-if="loading"
      class="d-flex justify-center py-12"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <template v-else>

      <!-- ===================================== -->
      <!-- CAJA CERRADA -->
      <!-- ===================================== -->

      <v-card
        v-if="!cajaAbierta"
        max-width="650"
        class="mx-auto"
        rounded="lg"
        border
        elevation="0"
      >
        <v-card-text class="pa-8 text-center">

          <v-icon
            icon="mdi-cash-register"
            size="72"
            color="grey"
          />

          <h2 class="text-h5 font-weight-bold mt-4">
            La caja está cerrada
          </h2>

          <p class="text-body-2 text-medium-emphasis mt-2 mb-6">
            Abre una sesión de caja para comenzar a registrar
            ventas y movimientos.
          </p>

          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-lock-open-variant"
            @click="dialogAbrir = true"
          >
            Abrir caja
          </v-btn>

        </v-card-text>
      </v-card>

      <!-- ===================================== -->
      <!-- CAJA ABIERTA -->
      <!-- ===================================== -->

      <template v-else>

        <!-- ===================================== -->
        <!-- RESUMEN -->
        <!-- ===================================== -->

        <v-row>

          <!-- SALDO INICIAL -->

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
              class="stat-card"
            >
              <v-card-text>

                <div
                  class="d-flex align-center justify-space-between"
                >

                  <div>
                    <div class="text-body-2 text-medium-emphasis">
                      Saldo inicial
                    </div>

                    <div class="text-h5 font-weight-bold mt-1">
                      {{ formatoMoneda(saldo.saldoInicial) }}
                    </div>
                  </div>

                  <v-avatar
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="mdi-cash-plus" />
                  </v-avatar>

                </div>

              </v-card-text>
            </v-card>
          </v-col>

          <!-- INGRESOS -->

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
              class="stat-card"
            >
              <v-card-text>

                <div
                  class="d-flex align-center justify-space-between"
                >

                  <div>
                    <div class="text-body-2 text-medium-emphasis">
                      Ingresos
                    </div>

                    <div class="text-h5 font-weight-bold text-success mt-1">
                      {{ formatoMoneda(saldo.ingresos) }}
                    </div>
                  </div>

                  <v-avatar
                    color="success"
                    variant="tonal"
                  >
                    <v-icon icon="mdi-arrow-down-circle-outline" />
                  </v-avatar>

                </div>

              </v-card-text>
            </v-card>
          </v-col>

          <!-- EGRESOS -->

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
              class="stat-card"
            >
              <v-card-text>

                <div
                  class="d-flex align-center justify-space-between"
                >

                  <div>
                    <div class="text-body-2 text-medium-emphasis">
                      Egresos
                    </div>

                    <div class="text-h5 font-weight-bold text-error mt-1">
                      {{ formatoMoneda(saldo.egresos) }}
                    </div>
                  </div>

                  <v-avatar
                    color="error"
                    variant="tonal"
                  >
                    <v-icon icon="mdi-arrow-up-circle-outline" />
                  </v-avatar>

                </div>

              </v-card-text>
            </v-card>
          </v-col>

          <!-- SALDO ACTUAL -->

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
              class="stat-card"
            >
              <v-card-text>

                <div
                  class="d-flex align-center justify-space-between"
                >

                  <div>
                    <div class="text-body-2 text-medium-emphasis">
                      Saldo actual
                    </div>

                    <div class="text-h5 font-weight-bold text-primary mt-1">
                      {{ formatoMoneda(saldo.saldoActual) }}
                    </div>
                  </div>

                  <v-avatar
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="mdi-cash-multiple" />
                  </v-avatar>

                </div>

              </v-card-text>
            </v-card>
          </v-col>

        </v-row>

        <!-- ===================================== -->
        <!-- INFORMACIÓN + MOVIMIENTOS -->
        <!-- ===================================== -->

        <v-row class="mt-2">

          <!-- SESIÓN -->

          <v-col
            cols="12"
            md="5"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
            >

              <v-card-title class="d-flex align-center">
                <v-icon
                  icon="mdi-information-outline"
                  class="mr-2"
                />

                Sesión actual
              </v-card-title>

              <v-divider />

              <v-card-text>

                <div class="info-row">
                  <span>
                    Número de sesión
                  </span>

                  <strong>
                    #{{ sesion.id }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>
                    Fecha de apertura
                  </span>

                  <strong>
                    {{ formatoFecha(sesion.fechaApertura) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span>
                    Abierta por
                  </span>

                  <strong>
                    {{ nombreMiembro(sesion.abiertaPor) }}
                  </strong>
                </div>

                <div
                  v-if="sesion.observacion"
                  class="mt-4"
                >
                  <div class="text-caption text-medium-emphasis">
                    Observación
                  </div>

                  <div class="text-body-2 mt-1">
                    {{ sesion.observacion }}
                  </div>
                </div>

              </v-card-text>

              <v-divider />

              <v-card-actions class="pa-4">

                <v-btn
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-refresh"
                  :loading="loadingSaldo"
                  @click="actualizarCaja"
                >
                  Actualizar
                </v-btn>

                <v-spacer />

                <v-btn
                  color="error"
                  prepend-icon="mdi-lock"
                  @click="dialogCerrar = true"
                >
                  Cerrar caja
                </v-btn>

              </v-card-actions>

            </v-card>
          </v-col>

          <!-- MOVIMIENTOS -->

          <v-col
            cols="12"
            md="7"
          >
            <v-card
              rounded="lg"
              border
              elevation="0"
            >

              <v-card-title
                class="d-flex align-center justify-space-between"
              >

                <div class="d-flex align-center">

                  <v-icon
                    icon="mdi-format-list-bulleted"
                    class="mr-2"
                  />

                  Movimientos

                  <v-chip
                    class="ml-2"
                    size="small"
                    variant="tonal"
                  >
                    {{ movimientos.length }}
                  </v-chip>

                </div>

              </v-card-title>

              <v-divider />

              <v-card-text class="pa-0">

                <div
                  v-if="movimientos.length === 0"
                  class="text-center py-10"
                >

                  <v-icon
                    icon="mdi-receipt-text-outline"
                    size="50"
                    color="grey-lighten-1"
                  />

                  <div class="text-body-1 mt-3">
                    No hay movimientos todavía.
                  </div>

                  <div class="text-caption text-medium-emphasis mt-1">
                    Las ventas aparecerán aquí automáticamente.
                  </div>

                </div>

                <v-list
                  v-else
                  lines="two"
                  class="py-0"
                >

                  <v-list-item
                    v-for="movimiento in movimientos"
                    :key="movimiento.id"
                  >

                    <template #prepend>

                      <v-avatar
                        :color="
                          movimiento.tipo === 'INGRESO'
                            ? 'success'
                            : 'error'
                        "
                        variant="tonal"
                      >

                        <v-icon
                          :icon="
                            movimiento.tipo === 'INGRESO'
                              ? 'mdi-arrow-down'
                              : 'mdi-arrow-up'
                          "
                        />

                      </v-avatar>

                    </template>

                    <v-list-item-title>
                      {{ textoConcepto(movimiento.concepto) }}
                    </v-list-item-title>

                    <v-list-item-subtitle>
                      {{ formatoFecha(movimiento.createdAt) }}
                    </v-list-item-subtitle>

                    <template #append>

                      <div
                        class="font-weight-bold"
                        :class="
                          movimiento.tipo === 'INGRESO'
                            ? 'text-success'
                            : 'text-error'
                        "
                      >

                        {{
                          movimiento.tipo === 'INGRESO'
                            ? '+'
                            : '-'
                        }}

                        {{ formatoMoneda(movimiento.monto) }}

                      </div>

                    </template>

                  </v-list-item>

                </v-list>

              </v-card-text>

            </v-card>
          </v-col>

        </v-row>

      </template>

      <!-- ===================================== -->
      <!-- HISTORIAL DE CAJAS -->
      <!-- ===================================== -->

      <v-card
        rounded="lg"
        border
        elevation="0"
        class="mt-6"
      >

        <v-card-title
          class="d-flex align-center justify-space-between"
        >

          <div class="d-flex align-center">

            <v-icon
              icon="mdi-history"
              class="mr-2"
            />

            Historial de cajas

            <v-chip
              class="ml-2"
              size="small"
              variant="tonal"
            >
              {{ sesiones.length }}
            </v-chip>

          </div>

          <v-btn
            icon="mdi-refresh"
            variant="text"
            :loading="loadingHistorial"
            @click="cargarHistorial"
          />

        </v-card-title>

        <v-divider />

        <!-- LOADING HISTORIAL -->

        <div
          v-if="loadingHistorial"
          class="d-flex justify-center py-10"
        >

          <v-progress-circular
            indeterminate
            color="primary"
          />

        </div>

        <!-- SIN HISTORIAL -->

        <div
          v-else-if="sesiones.length === 0"
          class="text-center py-10"
        >

          <v-icon
            icon="mdi-history"
            size="52"
            color="grey-lighten-1"
          />

          <div class="text-body-1 mt-3">
            No hay sesiones registradas.
          </div>

        </div>

        <!-- TABLA -->

        <v-table
          v-else
          hover
          class="caja-table"
        >

          <thead>
            <tr>

              <th>
                Sesión
              </th>

              <th>
                Apertura
              </th>

              <th>
                Cierre
              </th>

              <th>
                Saldo inicial
              </th>

              <th>
                Saldo final
              </th>

              <th>
                Estado
              </th>

              <th class="text-right">
                Acción
              </th>

            </tr>
          </thead>

          <tbody>

            <tr
              v-for="item in sesiones"
              :key="item.id"
            >

              <td>
                <strong>
                  #{{ item.id }}
                </strong>
              </td>

              <td>
                {{ formatoFecha(item.fechaApertura) }}
              </td>

              <td>
                {{ formatoFecha(item.fechaCierre) }}
              </td>

              <td>
                {{ formatoMoneda(item.saldoInicial) }}
              </td>

              <td>
                {{ formatoMoneda(item.saldoFinal) }}
              </td>

              <td>

                <v-chip
                  :color="colorEstado(item.estado)"
                  variant="tonal"
                  size="small"
                >
                  {{ textoEstado(item.estado) }}
                </v-chip>

              </td>

              <td class="text-right">

                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-eye-outline"
                  @click="verDetalleSesion(item)"
                >
                  Ver detalle
                </v-btn>

              </td>

            </tr>

          </tbody>

        </v-table>

      </v-card>

    </template>

    <!-- ===================================== -->
    <!-- DIALOGO ABRIR CAJA -->
    <!-- ===================================== -->

    <v-dialog
      v-model="dialogAbrir"
      max-width="500"
    >

      <v-card rounded="lg">

        <v-card-title class="pa-5">
          Abrir caja
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">

          <p class="text-body-2 text-medium-emphasis mb-5">
            Ingresa el dinero disponible al comenzar esta
            sesión de caja.
          </p>

          <v-text-field
            v-model.number="formAbrir.saldoInicial"
            label="Saldo inicial"
            type="number"
            min="0"
            prefix="$"
            variant="outlined"
            prepend-inner-icon="mdi-cash"
          />

          <v-textarea
            v-model="formAbrir.observacion"
            label="Observación"
            placeholder="Opcional"
            rows="3"
            auto-grow
            maxlength="500"
            variant="outlined"
          />

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogAbrir = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            :loading="guardando"
            :disabled="formAbrir.saldoInicial < 0"
            prepend-icon="mdi-lock-open-variant"
            @click="abrirCaja"
          >
            Abrir caja
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- ===================================== -->
    <!-- DIALOGO CERRAR CAJA -->
    <!-- ===================================== -->

    <v-dialog
      v-model="dialogCerrar"
      max-width="550"
    >

      <v-card rounded="lg">

        <v-card-title class="pa-5">
          Cerrar caja
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">

          <div class="resumen-cierre">

            <div class="info-row">
              <span>
                Saldo esperado
              </span>

              <strong>
                {{ formatoMoneda(saldo.saldoActual) }}
              </strong>
            </div>

          </div>

          <v-alert
            type="info"
            variant="tonal"
            class="my-4"
          >
            Cuenta físicamente el dinero disponible en caja
            e ingresa el valor exacto.
          </v-alert>

          <v-text-field
            v-model.number="formCerrar.dineroContado"
            label="Dinero contado"
            type="number"
            min="0"
            prefix="$"
            variant="outlined"
            prepend-inner-icon="mdi-cash-check"
          />

          <!-- DIFERENCIA -->

          <v-alert
            v-if="formCerrar.dineroContado !== null"
            :type="tipoDiferencia"
            variant="tonal"
            class="mt-2"
          >

            <div
              class="d-flex justify-space-between align-center"
            >

              <div>
                <div class="font-weight-medium">
                  {{ textoDiferencia }}
                </div>

                <div class="text-caption">
                  Diferencia respecto al saldo esperado
                </div>
              </div>

              <strong>
                {{ formatoMoneda(diferenciaCierre) }}
              </strong>

            </div>

          </v-alert>

          <v-textarea
            v-model="formCerrar.observacionCierre"
            label="Observación del cierre"
            placeholder="Opcional"
            rows="3"
            auto-grow
            maxlength="500"
            variant="outlined"
            class="mt-4"
          />

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogCerrar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            :loading="guardando"
            :disabled="formCerrar.dineroContado === null"
            prepend-icon="mdi-lock"
            @click="cerrarCaja"
          >
            Confirmar cierre
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- ===================================== -->
    <!-- DIALOGO DETALLE SESIÓN -->
    <!-- ===================================== -->

    <v-dialog
      v-model="dialogDetalle"
      max-width="1000"
      scrollable
    >

      <v-card rounded="lg">

        <!-- HEADER -->

        <v-card-title
          class="pa-5 d-flex align-center justify-space-between"
        >

          <div>

            <div class="text-h6 font-weight-bold">
              Detalle de sesión
            </div>

            <div
              v-if="sesionDetalle"
              class="text-body-2 text-medium-emphasis mt-1"
            >
              Sesión #{{ sesionDetalle.id }}
            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="dialogDetalle = false"
          />

        </v-card-title>

        <v-divider />

        <!-- LOADING -->

        <div
          v-if="loadingDetalle"
          class="d-flex justify-center py-12"
        >

          <v-progress-circular
            indeterminate
            color="primary"
            size="45"
          />

        </div>

        <template v-else>

          <v-card-text class="pa-5">

            <!-- ESTADO -->

            <div class="d-flex align-center mb-5">

              <span class="text-body-2 text-medium-emphasis mr-3">
                Estado
              </span>

              <v-chip
                :color="
                  colorEstado(resumenDetalle.estado)
                "
                variant="tonal"
              >
                {{ textoEstado(resumenDetalle.estado) }}
              </v-chip>

            </div>

            <!-- RESUMEN -->

            <v-row>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  border
                  rounded="lg"
                  elevation="0"
                >
                  <v-card-text>

                    <div class="text-caption text-medium-emphasis">
                      Saldo inicial
                    </div>

                    <div class="text-h6 font-weight-bold mt-1">
                      {{
                        formatoMoneda(
                          resumenDetalle.saldoInicial
                        )
                      }}
                    </div>

                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  border
                  rounded="lg"
                  elevation="0"
                >
                  <v-card-text>

                    <div class="text-caption text-medium-emphasis">
                      Ingresos
                    </div>

                    <div class="text-h6 font-weight-bold text-success mt-1">
                      {{
                        formatoMoneda(
                          resumenDetalle.totalIngresos
                        )
                      }}
                    </div>

                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  border
                  rounded="lg"
                  elevation="0"
                >
                  <v-card-text>

                    <div class="text-caption text-medium-emphasis">
                      Egresos
                    </div>

                    <div class="text-h6 font-weight-bold text-error mt-1">
                      {{
                        formatoMoneda(
                          resumenDetalle.totalEgresos
                        )
                      }}
                    </div>

                  </v-card-text>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                sm="6"
                md="3"
              >
                <v-card
                  border
                  rounded="lg"
                  elevation="0"
                >
                  <v-card-text>

                    <div class="text-caption text-medium-emphasis">
                      Saldo esperado
                    </div>

                    <div class="text-h6 font-weight-bold text-primary mt-1">
                      {{
                        formatoMoneda(
                          resumenDetalle.saldoEsperado
                        )
                      }}
                    </div>

                  </v-card-text>
                </v-card>
              </v-col>

            </v-row>

            <!-- CIERRE -->

            <v-card
              v-if="resumenDetalle.estado === 'CERRADA'"
              border
              rounded="lg"
              elevation="0"
              class="mt-5"
            >

              <v-card-title>
                Información del cierre
              </v-card-title>

              <v-divider />

              <v-card-text>

                <v-row>

                  <v-col
                    cols="12"
                    sm="6"
                  >

                    <div class="info-row">
                      <span>
                        Dinero contado
                      </span>

                      <strong>
                        {{
                          formatoMoneda(
                            resumenDetalle.dineroContado
                          )
                        }}
                      </strong>
                    </div>

                    <div class="info-row">
                      <span>
                        Diferencia
                      </span>

                      <strong
                        :class="
                          resumenDetalle.diferencia === 0
                            ? 'text-success'
                            : resumenDetalle.diferencia > 0
                              ? 'text-info'
                              : 'text-warning'
                        "
                      >
                        {{
                          formatoMoneda(
                            resumenDetalle.diferencia
                          )
                        }}
                      </strong>
                    </div>

                    <div class="mt-3">

                      <v-chip
                        :color="tipoDiferenciaDetalle"
                        variant="tonal"
                      >
                        {{ textoDiferenciaDetalle }}
                      </v-chip>

                    </div>

                  </v-col>

                  <v-col
                    cols="12"
                    sm="6"
                  >

                    <div class="info-row">
                      <span>
                        Fecha de apertura
                      </span>

                      <strong>
                        {{
                          formatoFecha(
                            resumenDetalle.fechaApertura
                          )
                        }}
                      </strong>
                    </div>

                    <div class="info-row">
                      <span>
                        Fecha de cierre
                      </span>

                      <strong>
                        {{
                          formatoFecha(
                            resumenDetalle.fechaCierre
                          )
                        }}
                      </strong>
                    </div>

                  </v-col>

                </v-row>

              </v-card-text>

            </v-card>

            <!-- PERSONAS -->

            <v-card
              v-if="sesionDetalle"
              border
              rounded="lg"
              elevation="0"
              class="mt-5"
            >

              <v-card-title>
                Personal responsable
              </v-card-title>

              <v-divider />

              <v-card-text>

                <div class="info-row">
                  <span>
                    Abierta por
                  </span>

                  <strong>
                    {{ nombreMiembro(sesionDetalle.abiertaPor) }}
                  </strong>
                </div>

                <div
                  v-if="sesionDetalle.cerradaPor"
                  class="info-row"
                >
                  <span>
                    Cerrada por
                  </span>

                  <strong>
                    {{ nombreMiembro(sesionDetalle.cerradaPor) }}
                  </strong>
                </div>

              </v-card-text>

            </v-card>

            <!-- MOVIMIENTOS -->

            <v-card
              border
              rounded="lg"
              elevation="0"
              class="mt-5"
            >

              <v-card-title
                class="d-flex align-center"
              >

                <v-icon
                  icon="mdi-format-list-bulleted"
                  class="mr-2"
                />

                Movimientos

                <v-chip
                  size="small"
                  variant="tonal"
                  class="ml-2"
                >
                  {{ movimientosDetalle.length }}
                </v-chip>

              </v-card-title>

              <v-divider />

              <div
                v-if="movimientosDetalle.length === 0"
                class="text-center py-8"
              >

                <v-icon
                  icon="mdi-receipt-text-outline"
                  size="45"
                  color="grey-lighten-1"
                />

                <div class="text-body-2 mt-2">
                  No hay movimientos registrados.
                </div>

              </div>

              <v-list
                v-else
                lines="two"
                class="py-0"
              >

                <v-list-item
                  v-for="movimiento in movimientosDetalle"
                  :key="movimiento.id"
                >

                  <template #prepend>

                    <v-avatar
                      :color="
                        movimiento.tipo === 'INGRESO'
                          ? 'success'
                          : 'error'
                      "
                      variant="tonal"
                    >

                      <v-icon
                        :icon="
                          movimiento.tipo === 'INGRESO'
                            ? 'mdi-arrow-down'
                            : 'mdi-arrow-up'
                        "
                      />

                    </v-avatar>

                  </template>

                  <v-list-item-title>
                    {{ textoConcepto(movimiento.concepto) }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ formatoFecha(movimiento.createdAt) }}
                  </v-list-item-subtitle>

                  <template #append>

                    <div
                      class="font-weight-bold"
                      :class="
                        movimiento.tipo === 'INGRESO'
                          ? 'text-success'
                          : 'text-error'
                      "
                    >

                      {{
                        movimiento.tipo === 'INGRESO'
                          ? '+'
                          : '-'
                      }}

                      {{ formatoMoneda(movimiento.monto) }}

                    </div>

                  </template>

                </v-list-item>

              </v-list>

            </v-card>

          </v-card-text>

        </template>

      </v-card>

    </v-dialog>

    <!-- ===================================== -->
    <!-- SNACKBAR -->
    <!-- ===================================== -->

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      timeout="3500"
    >

      {{ snackbar.mensaje }}

      <template #actions>

        <v-btn
          variant="text"
          @click="snackbar.visible = false"
        >
          Cerrar
        </v-btn>

      </template>

    </v-snackbar>

  </v-container>
</template>

<style scoped>
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.info-row span {
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.caja-table th {
  white-space: nowrap;
  font-weight: 600 !important;
}

.caja-table td {
  white-space: nowrap;
}

.resumen-cierre {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 10px;
  padding: 4px 16px;
}
</style>
