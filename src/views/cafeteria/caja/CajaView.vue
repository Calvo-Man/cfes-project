
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
  <v-container fluid class="caja-page pa-4 pa-md-6">

    <!-- ===================================================== -->
    <!-- HEADER -->
    <!-- ===================================================== -->

    <div class="page-header mb-6">

      <div class="page-header-main">

        <div class="page-icon">
          <v-icon icon="mdi-cash-register" size="26" />
        </div>

        <div>
          <div class="d-flex align-center ga-3 flex-wrap">
            <h1 class="page-title">
              Caja
            </h1>

            <v-chip
              :color="cajaAbierta ? 'success' : 'grey'"
              variant="tonal"
              size="small"
              class="status-chip"
            >
              <span
                class="status-dot"
                :class="cajaAbierta ? 'status-dot-active' : ''"
              />

              {{ cajaAbierta ? 'Caja abierta' : 'Caja cerrada' }}
            </v-chip>
          </div>

          <p class="page-subtitle">
            Control de apertura, movimientos y cierre de caja
          </p>
        </div>

      </div>

      <v-btn
        v-if="cajaAbierta"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="loadingSaldo"
        @click="actualizarCaja"
      >
        Actualizar
      </v-btn>

    </div>


    <!-- ===================================================== -->
    <!-- LOADING PRINCIPAL -->
    <!-- ===================================================== -->

    <div
      v-if="loading"
      class="loading-container"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="44"
        width="3"
      />
    </div>


    <template v-else>


      <!-- ===================================================== -->
      <!-- CAJA CERRADA -->
      <!-- ===================================================== -->

      <v-card
        v-if="!cajaAbierta"
        class="closed-card"
        rounded="xl"
        border
        elevation="0"
      >

        <v-card-text class="closed-card-content">

          <div class="closed-icon">
            <v-icon
              icon="mdi-lock-outline"
              size="38"
            />
          </div>

          <h2 class="closed-title">
            La caja está cerrada
          </h2>

          <p class="closed-description">
            Abre una sesión de caja para comenzar a registrar
            ventas y movimientos.
          </p>

          <v-btn
            color="primary"
            size="large"
            rounded="lg"
            prepend-icon="mdi-lock-open-variant"
            @click="dialogAbrir = true"
          >
            Abrir caja
          </v-btn>

        </v-card-text>

      </v-card>


      <!-- ===================================================== -->
      <!-- CAJA ABIERTA -->
      <!-- ===================================================== -->

      <template v-else>


        <!-- ================================================= -->
        <!-- RESUMEN -->
        <!-- ================================================= -->

        <v-row class="summary-row">

          <!-- SALDO INICIAL -->

          <v-col
            cols="12"
            sm="6"
            lg="3"
          >
            <v-card
              class="metric-card"
              rounded="xl"
              border
              elevation="0"
            >

              <v-card-text>

                <div class="metric-top">

                  <div class="metric-icon metric-icon-primary">
                    <v-icon
                      icon="mdi-cash-plus"
                      size="21"
                    />
                  </div>

                  <span class="metric-label">
                    Saldo inicial
                  </span>

                </div>

                <div class="metric-value">
                  {{ formatoMoneda(saldo.saldoInicial) }}
                </div>

                <div class="metric-description">
                  Dinero al abrir la sesión
                </div>

              </v-card-text>

            </v-card>
          </v-col>


          <!-- INGRESOS -->

          <v-col
            cols="12"
            sm="6"
            lg="3"
          >
            <v-card
              class="metric-card"
              rounded="xl"
              border
              elevation="0"
            >

              <v-card-text>

                <div class="metric-top">

                  <div class="metric-icon metric-icon-success">
                    <v-icon
                      icon="mdi-arrow-down-circle-outline"
                      size="21"
                    />
                  </div>

                  <span class="metric-label">
                    Ingresos
                  </span>

                </div>

                <div class="metric-value text-success">
                  {{ formatoMoneda(saldo.ingresos) }}
                </div>

                <div class="metric-description">
                  Dinero recibido durante la sesión
                </div>

              </v-card-text>

            </v-card>
          </v-col>


          <!-- EGRESOS -->

          <v-col
            cols="12"
            sm="6"
            lg="3"
          >
            <v-card
              class="metric-card"
              rounded="xl"
              border
              elevation="0"
            >

              <v-card-text>

                <div class="metric-top">

                  <div class="metric-icon metric-icon-error">
                    <v-icon
                      icon="mdi-arrow-up-circle-outline"
                      size="21"
                    />
                  </div>

                  <span class="metric-label">
                    Egresos
                  </span>

                </div>

                <div class="metric-value text-error">
                  {{ formatoMoneda(saldo.egresos) }}
                </div>

                <div class="metric-description">
                  Dinero retirado durante la sesión
                </div>

              </v-card-text>

            </v-card>
          </v-col>


          <!-- SALDO ACTUAL -->

          <v-col
            cols="12"
            sm="6"
            lg="3"
          >
            <v-card
              class="metric-card metric-card-current"
              rounded="xl"
              border
              elevation="0"
            >

              <v-card-text>

                <div class="metric-top">

                  <div class="metric-icon metric-icon-primary">
                    <v-icon
                      icon="mdi-cash-multiple"
                      size="21"
                    />
                  </div>

                  <span class="metric-label">
                    Saldo actual
                  </span>

                </div>

                <div class="metric-value text-primary">
                  {{ formatoMoneda(saldo.saldoActual) }}
                </div>

                <div class="metric-description">
                  Saldo esperado en caja
                </div>

              </v-card-text>

            </v-card>
          </v-col>

        </v-row>


        <!-- ================================================= -->
        <!-- SESIÓN + MOVIMIENTOS -->
        <!-- ================================================= -->

        <v-row class="content-row">


          <!-- =============================================== -->
          <!-- SESIÓN ACTUAL -->
          <!-- =============================================== -->

          <v-col
            cols="12"
            lg="4"
          >

            <v-card
              class="section-card session-card"
              rounded="xl"
              border
              elevation="0"
            >

              <v-card-item>

                <template #prepend>
                  <div class="section-icon">
                    <v-icon
                      icon="mdi-information-outline"
                      size="20"
                    />
                  </div>
                </template>

                <v-card-title class="section-title">
                  Sesión actual
                </v-card-title>

                <v-card-subtitle>
                  Información de la caja activa
                </v-card-subtitle>

              </v-card-item>

              <v-divider />

              <v-card-text class="pa-5">

                <div class="session-number">

                  <span class="session-number-label">
                    Sesión
                  </span>

                  <span class="session-number-value">
                    #{{ sesion.id }}
                  </span>

                </div>


                <div class="info-list">

                  <div class="info-row">

                    <div class="info-label">
                      <v-icon
                        icon="mdi-calendar-outline"
                        size="17"
                      />

                      Apertura
                    </div>

                    <strong>
                      {{ formatoFecha(sesion.fechaApertura) }}
                    </strong>

                  </div>


                  <div class="info-row">

                    <div class="info-label">
                      <v-icon
                        icon="mdi-account-outline"
                        size="17"
                      />

                      Abierta por
                    </div>

                    <strong>
                      {{ nombreMiembro(sesion.abiertaPor) }}
                    </strong>

                  </div>

                </div>


                <!-- OBSERVACIÓN -->

                <div
                  v-if="sesion.observacion"
                  class="session-note"
                >

                  <div class="session-note-label">
                    <v-icon
                      icon="mdi-note-text-outline"
                      size="16"
                    />

                    Observación
                  </div>

                  <div class="session-note-text">
                    {{ sesion.observacion }}
                  </div>

                </div>

              </v-card-text>


              <v-divider />


              <v-card-actions class="session-actions">

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


          <!-- =============================================== -->
          <!-- MOVIMIENTOS -->
          <!-- =============================================== -->

          <v-col
            cols="12"
            lg="8"
          >

            <v-card
              class="section-card"
              rounded="xl"
              border
              elevation="0"
            >

              <v-card-item>

                <template #prepend>
                  <div class="section-icon">
                    <v-icon
                      icon="mdi-swap-vertical"
                      size="20"
                    />
                  </div>
                </template>

                <v-card-title class="section-title">
                  Movimientos
                </v-card-title>

                <v-card-subtitle>
                  Actividad registrada en esta sesión
                </v-card-subtitle>

                <template #append>

                  <v-chip
                    size="small"
                    variant="tonal"
                    color="primary"
                  >
                    {{ movimientos.length }}
                  </v-chip>

                </template>

              </v-card-item>

              <v-divider />


              <!-- SIN MOVIMIENTOS -->

              <div
                v-if="movimientos.length === 0"
                class="empty-state"
              >

                <div class="empty-icon">
                  <v-icon
                    icon="mdi-receipt-text-outline"
                    size="30"
                  />
                </div>

                <div class="empty-title">
                  No hay movimientos todavía
                </div>

                <div class="empty-description">
                  Las ventas y movimientos de caja aparecerán aquí.
                </div>

              </div>


              <!-- MOVIMIENTOS -->

              <v-list
                v-else
                class="movement-list"
                lines="two"
              >

                <v-list-item
                  v-for="movimiento in movimientos"
                  :key="movimiento.id"
                  class="movement-item"
                >

                  <template #prepend>

                    <div
                      class="movement-icon"
                      :class="
                        movimiento.tipo === 'INGRESO'
                          ? 'movement-icon-income'
                          : 'movement-icon-expense'
                      "
                    >

                      <v-icon
                        :icon="
                          movimiento.tipo === 'INGRESO'
                            ? 'mdi-arrow-down'
                            : 'mdi-arrow-up'
                        "
                        size="19"
                      />

                    </div>

                  </template>


                  <v-list-item-title class="movement-title">
                    {{ textoConcepto(movimiento.concepto) }}
                  </v-list-item-title>

                  <v-list-item-subtitle class="movement-date">
                    {{ formatoFecha(movimiento.createdAt) }}
                  </v-list-item-subtitle>


                  <template #append>

                    <div class="movement-amount-wrapper">

                      <div
                        class="movement-amount"
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

                    </div>

                  </template>

                </v-list-item>

              </v-list>

            </v-card>

          </v-col>

        </v-row>

      </template>


      <!-- ===================================================== -->
      <!-- HISTORIAL -->
      <!-- ===================================================== -->

      <v-card
        class="section-card history-card mt-6"
        rounded="xl"
        border
        elevation="0"
      >

        <v-card-item>

          <template #prepend>

            <div class="section-icon">
              <v-icon
                icon="mdi-history"
                size="20"
              />
            </div>

          </template>

          <v-card-title class="section-title">
            Historial de cajas
          </v-card-title>

          <v-card-subtitle>
            Consulta las sesiones anteriores y sus cierres
          </v-card-subtitle>

          <template #append>

            <div class="d-flex align-center ga-2">

              <v-chip
                size="small"
                variant="tonal"
              >
                {{ sesiones.length }} sesiones
              </v-chip>

              <v-btn
                icon="mdi-refresh"
                variant="text"
                size="small"
                :loading="loadingHistorial"
                @click="cargarHistorial"
              />

            </div>

          </template>

        </v-card-item>

        <v-divider />


        <!-- LOADING -->

        <div
          v-if="loadingHistorial"
          class="history-loading"
        >

          <v-progress-circular
            indeterminate
            color="primary"
            size="38"
          />

          <span>
            Cargando historial...
          </span>

        </div>


        <!-- VACÍO -->

        <div
          v-else-if="sesiones.length === 0"
          class="empty-state history-empty"
        >

          <div class="empty-icon">
            <v-icon
              icon="mdi-history"
              size="30"
            />
          </div>

          <div class="empty-title">
            No hay sesiones registradas
          </div>

          <div class="empty-description">
            Las sesiones cerradas aparecerán aquí.
          </div>

        </div>


        <!-- TABLA -->

        <div
          v-else
          class="history-table-wrapper"
        >

          <v-table
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

                  <div class="session-table-id">
                    #{{ item.id }}
                  </div>

                </td>


                <td>
                  {{ formatoFecha(item.fechaApertura) }}
                </td>


                <td>
                  {{ formatoFecha(item.fechaCierre) }}
                </td>


                <td class="money-cell">
                  {{ formatoMoneda(item.saldoInicial) }}
                </td>


                <td class="money-cell">
                  {{ formatoMoneda(item.saldoFinal) }}
                </td>


                <td>

                  <v-chip
                    :color="colorEstado(item.estado)"
                    variant="tonal"
                    size="small"
                  >
                    <span class="table-status-dot" />

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

        </div>

      </v-card>

    </template>


    <!-- ===================================================== -->
    <!-- DIALOGO ABRIR CAJA -->
    <!-- ===================================================== -->

    <v-dialog
      v-model="dialogAbrir"
      max-width="500"
    >

      <v-card
        rounded="xl"
        class="dialog-card"
      >

        <v-card-item class="dialog-header">

          <template #prepend>

            <div class="dialog-icon dialog-icon-primary">
              <v-icon
                icon="mdi-lock-open-variant"
                size="23"
              />
            </div>

          </template>

          <v-card-title>
            Abrir caja
          </v-card-title>

          <v-card-subtitle>
            Inicia una nueva sesión de caja
          </v-card-subtitle>

        </v-card-item>

        <v-divider />

        <v-card-text class="pa-6">

          <p class="dialog-description">
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
            hide-details="auto"
            class="mb-4"
          />


          <v-textarea
            v-model="formAbrir.observacion"
            label="Observación"
            placeholder="Opcional"
            rows="3"
            auto-grow
            maxlength="500"
            variant="outlined"
            counter
            hide-details="auto"
          />

        </v-card-text>


        <v-divider />


        <v-card-actions class="dialog-actions">

          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogAbrir = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            rounded="lg"
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


    <!-- ===================================================== -->
    <!-- DIALOGO CERRAR CAJA -->
    <!-- ===================================================== -->

    <v-dialog
      v-model="dialogCerrar"
      max-width="550"
    >

      <v-card
        rounded="xl"
        class="dialog-card"
      >

        <v-card-item class="dialog-header">

          <template #prepend>

            <div class="dialog-icon dialog-icon-error">
              <v-icon
                icon="mdi-lock"
                size="23"
              />
            </div>

          </template>

          <v-card-title>
            Cerrar caja
          </v-card-title>

          <v-card-subtitle>
            Realiza el arqueo de la sesión
          </v-card-subtitle>

        </v-card-item>

        <v-divider />

        <v-card-text class="pa-6">

          <!-- SALDO ESPERADO -->

          <div class="expected-balance">

            <div>

              <div class="expected-label">
                Saldo esperado
              </div>

              <div class="expected-value">
                {{ formatoMoneda(saldo.saldoActual) }}
              </div>

            </div>

            <div class="expected-icon">
              <v-icon
                icon="mdi-cash-check"
                size="25"
              />
            </div>

          </div>


          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="my-5"
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
            hide-details="auto"
          />


          <!-- DIFERENCIA -->

          <v-alert
            v-if="formCerrar.dineroContado !== null"
            :type="tipoDiferencia"
            variant="tonal"
            density="comfortable"
            class="mt-4"
          >

            <div class="difference-content">

              <div>

                <div class="font-weight-medium">
                  {{ textoDiferencia }}
                </div>

                <div class="text-caption">
                  Diferencia respecto al saldo esperado
                </div>

              </div>

              <strong class="difference-value">
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
            counter
            hide-details="auto"
            class="mt-4"
          />

        </v-card-text>


        <v-divider />


        <v-card-actions class="dialog-actions">

          <v-spacer />

          <v-btn
            variant="text"
            @click="dialogCerrar = false"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            rounded="lg"
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


    <!-- ===================================================== -->
    <!-- DIALOGO DETALLE SESIÓN -->
    <!-- ===================================================== -->

    <v-dialog
      v-model="dialogDetalle"
      max-width="1000"
      scrollable
    >

      <v-card
        rounded="xl"
        class="dialog-card"
      >

        <!-- HEADER -->

        <v-card-item class="dialog-header">

          <template #prepend>

            <div class="dialog-icon dialog-icon-primary">
              <v-icon
                icon="mdi-file-document-outline"
                size="23"
              />
            </div>

          </template>

          <v-card-title>
            Detalle de sesión
          </v-card-title>

          <v-card-subtitle v-if="sesionDetalle">
            Sesión #{{ sesionDetalle.id }}
          </v-card-subtitle>

          <template #append>

            <v-btn
              icon="mdi-close"
              variant="text"
              @click="dialogDetalle = false"
            />

          </template>

        </v-card-item>

        <v-divider />


        <!-- LOADING -->

        <div
          v-if="loadingDetalle"
          class="detail-loading"
        >

          <v-progress-circular
            indeterminate
            color="primary"
            size="45"
            width="3"
          />

          <span>
            Cargando detalle...
          </span>

        </div>


        <template v-else>

          <v-card-text class="pa-6">


            <!-- ESTADO -->

            <div class="detail-status">

              <span class="detail-status-label">
                Estado de la sesión
              </span>

              <v-chip
                :color="colorEstado(resumenDetalle.estado)"
                variant="tonal"
              >
                {{ textoEstado(resumenDetalle.estado) }}
              </v-chip>

            </div>


            <!-- RESUMEN -->

            <v-row class="detail-summary">

              <v-col
                cols="12"
                sm="6"
                md="3"
              >

                <div class="detail-metric">

                  <div class="detail-metric-label">
                    Saldo inicial
                  </div>

                  <div class="detail-metric-value">
                    {{ formatoMoneda(resumenDetalle.saldoInicial) }}
                  </div>

                </div>

              </v-col>


              <v-col
                cols="12"
                sm="6"
                md="3"
              >

                <div class="detail-metric">

                  <div class="detail-metric-label">
                    Ingresos
                  </div>

                  <div class="detail-metric-value text-success">
                    {{ formatoMoneda(resumenDetalle.totalIngresos) }}
                  </div>

                </div>

              </v-col>


              <v-col
                cols="12"
                sm="6"
                md="3"
              >

                <div class="detail-metric">

                  <div class="detail-metric-label">
                    Egresos
                  </div>

                  <div class="detail-metric-value text-error">
                    {{ formatoMoneda(resumenDetalle.totalEgresos) }}
                  </div>

                </div>

              </v-col>


              <v-col
                cols="12"
                sm="6"
                md="3"
              >

                <div class="detail-metric detail-metric-highlight">

                  <div class="detail-metric-label">
                    Saldo esperado
                  </div>

                  <div class="detail-metric-value text-primary">
                    {{ formatoMoneda(resumenDetalle.saldoEsperado) }}
                  </div>

                </div>

              </v-col>

            </v-row>


            <!-- =========================================== -->
            <!-- INFORMACIÓN DEL CIERRE -->
            <!-- =========================================== -->

            <v-card
              v-if="resumenDetalle.estado === 'CERRADA'"
              border
              rounded="xl"
              elevation="0"
              class="detail-section"
            >

              <v-card-item>

                <template #prepend>

                  <div class="small-section-icon">
                    <v-icon
                      icon="mdi-lock-check-outline"
                      size="18"
                    />
                  </div>

                </template>

                <v-card-title>
                  Información del cierre
                </v-card-title>

              </v-card-item>

              <v-divider />

              <v-card-text>

                <v-row>

                  <v-col
                    cols="12"
                    md="6"
                  >

                    <div class="info-row">

                      <div class="info-label">
                        <v-icon
                          icon="mdi-cash-check"
                          size="17"
                        />

                        Dinero contado
                      </div>

                      <strong>
                        {{ formatoMoneda(resumenDetalle.dineroContado) }}
                      </strong>

                    </div>


                    <div class="info-row">

                      <div class="info-label">
                        <v-icon
                          icon="mdi-scale-balance"
                          size="17"
                        />

                        Diferencia
                      </div>

                      <strong
                        :class="
                          resumenDetalle.diferencia === 0
                            ? 'text-success'
                            : resumenDetalle.diferencia > 0
                              ? 'text-info'
                              : 'text-warning'
                        "
                      >
                        {{ formatoMoneda(resumenDetalle.diferencia) }}
                      </strong>

                    </div>


                    <div class="mt-4">

                      <v-chip
                        :color="tipoDiferenciaDetalle"
                        variant="tonal"
                        size="small"
                      >
                        {{ textoDiferenciaDetalle }}
                      </v-chip>

                    </div>

                  </v-col>


                  <v-col
                    cols="12"
                    md="6"
                  >

                    <div class="info-row">

                      <div class="info-label">
                        <v-icon
                          icon="mdi-calendar-outline"
                          size="17"
                        />

                        Fecha de apertura
                      </div>

                      <strong>
                        {{ formatoFecha(resumenDetalle.fechaApertura) }}
                      </strong>

                    </div>


                    <div class="info-row">

                      <div class="info-label">
                        <v-icon
                          icon="mdi-calendar-check-outline"
                          size="17"
                        />

                        Fecha de cierre
                      </div>

                      <strong>
                        {{ formatoFecha(resumenDetalle.fechaCierre) }}
                      </strong>

                    </div>

                  </v-col>

                </v-row>

              </v-card-text>

            </v-card>


            <!-- =========================================== -->
            <!-- PERSONAL -->
            <!-- =========================================== -->

            <v-card
              v-if="sesionDetalle"
              border
              rounded="xl"
              elevation="0"
              class="detail-section"
            >

              <v-card-item>

                <template #prepend>

                  <div class="small-section-icon">
                    <v-icon
                      icon="mdi-account-group-outline"
                      size="18"
                    />
                  </div>

                </template>

                <v-card-title>
                  Personal responsable
                </v-card-title>

              </v-card-item>

              <v-divider />

              <v-card-text>

                <div class="info-row">

                  <div class="info-label">
                    <v-icon
                      icon="mdi-account-outline"
                      size="17"
                    />

                    Abierta por
                  </div>

                  <strong>
                    {{ nombreMiembro(sesionDetalle.abiertaPor) }}
                  </strong>

                </div>


                <div
                  v-if="sesionDetalle.cerradaPor"
                  class="info-row"
                >

                  <div class="info-label">
                    <v-icon
                      icon="mdi-account-check-outline"
                      size="17"
                    />

                    Cerrada por
                  </div>

                  <strong>
                    {{ nombreMiembro(sesionDetalle.cerradaPor) }}
                  </strong>

                </div>

              </v-card-text>

            </v-card>


            <!-- =========================================== -->
            <!-- MOVIMIENTOS DETALLE -->
            <!-- =========================================== -->

            <v-card
              border
              rounded="xl"
              elevation="0"
              class="detail-section"
            >

              <v-card-item>

                <template #prepend>

                  <div class="small-section-icon">
                    <v-icon
                      icon="mdi-format-list-bulleted"
                      size="18"
                    />
                  </div>

                </template>

                <v-card-title>
                  Movimientos
                </v-card-title>

                <template #append>

                  <v-chip
                    size="small"
                    variant="tonal"
                  >
                    {{ movimientosDetalle.length }}
                  </v-chip>

                </template>

              </v-card-item>

              <v-divider />


              <!-- VACÍO -->

              <div
                v-if="movimientosDetalle.length === 0"
                class="empty-state"
              >

                <div class="empty-icon">
                  <v-icon
                    icon="mdi-receipt-text-outline"
                    size="28"
                  />
                </div>

                <div class="empty-title">
                  No hay movimientos registrados
                </div>

              </div>


              <!-- MOVIMIENTOS -->

              <v-list
                v-else
                lines="two"
                class="movement-list"
              >

                <v-list-item
                  v-for="movimiento in movimientosDetalle"
                  :key="movimiento.id"
                  class="movement-item"
                >

                  <template #prepend>

                    <div
                      class="movement-icon"
                      :class="
                        movimiento.tipo === 'INGRESO'
                          ? 'movement-icon-income'
                          : 'movement-icon-expense'
                      "
                    >

                      <v-icon
                        :icon="
                          movimiento.tipo === 'INGRESO'
                            ? 'mdi-arrow-down'
                            : 'mdi-arrow-up'
                        "
                        size="19"
                      />

                    </div>

                  </template>


                  <v-list-item-title class="movement-title">
                    {{ textoConcepto(movimiento.concepto) }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ formatoFecha(movimiento.createdAt) }}
                  </v-list-item-subtitle>


                  <template #append>

                    <div
                      class="movement-amount"
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


    <!-- ===================================================== -->
    <!-- SNACKBAR -->
    <!-- ===================================================== -->

    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      timeout="3500"
      rounded="lg"
    >

      <div class="d-flex align-center">

        <v-icon
          :icon="
            snackbar.color === 'success'
              ? 'mdi-check-circle-outline'
              : 'mdi-alert-circle-outline'
          "
          class="mr-3"
        />

        {{ snackbar.mensaje }}

      </div>

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

.caja-page {
  max-width: 1600px;
  margin: 0 auto;
}


/* ========================================================= */
/* HEADER */
/* ========================================================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-header-main {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.10);
}

.page-title {
  margin: 0;
  font-size: 1.55rem;
  line-height: 1.2;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 5px 0 0;

  color: rgba(var(--v-theme-on-surface), 0.60);

  font-size: 0.875rem;
}

.status-chip {
  font-weight: 600;
}

.status-dot,
.table-status-dot {
  width: 7px;
  height: 7px;

  margin-right: 7px;

  border-radius: 50%;

  background: currentColor;
}

.status-dot-active {
  box-shadow: 0 0 0 3px rgba(var(--v-theme-success), 0.12);
}


/* ========================================================= */
/* LOADING */
/* ========================================================= */

.loading-container {
  min-height: 400px;

  display: flex;
  align-items: center;
  justify-content: center;
}


/* ========================================================= */
/* CAJA CERRADA */
/* ========================================================= */

.closed-card {
  max-width: 620px;
  margin: 70px auto;
}

.closed-card-content {
  padding: 52px 35px !important;
  text-align: center;
}

.closed-icon {
  width: 76px;
  height: 76px;

  margin: 0 auto 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 22px;

  color: rgba(var(--v-theme-on-surface), 0.55);
  background: rgba(var(--v-theme-on-surface), 0.06);
}

.closed-title {
  margin: 0;

  font-size: 1.35rem;
  font-weight: 700;
}

.closed-description {
  max-width: 420px;

  margin: 9px auto 25px;

  color: rgba(var(--v-theme-on-surface), 0.60);

  font-size: 0.9rem;
  line-height: 1.6;
}


/* ========================================================= */
/* METRIC CARDS */
/* ========================================================= */

.summary-row {
  margin-bottom: 4px;
}

.metric-card {
  height: 100%;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.metric-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.055) !important;
}

.metric-card-current {
  border-color: rgba(var(--v-theme-primary), 0.20) !important;
  background:
    linear-gradient(
      135deg,
      rgba(var(--v-theme-primary), 0.025),
      rgba(var(--v-theme-primary), 0.07)
    );
}

.metric-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-icon {
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.metric-icon-primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.10);
}

.metric-icon-success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.10);
}

.metric-icon-error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.10);
}

.metric-label {
  color: rgba(var(--v-theme-on-surface), 0.62);

  font-size: 0.8rem;
  font-weight: 600;
}

.metric-value {
  margin-top: 16px;

  font-size: 1.45rem;
  line-height: 1.1;
  font-weight: 750;
  letter-spacing: -0.025em;
}

.metric-description {
  margin-top: 7px;

  color: rgba(var(--v-theme-on-surface), 0.48);

  font-size: 0.73rem;
}


/* ========================================================= */
/* SECTIONS */
/* ========================================================= */

.content-row {
  margin-top: 8px;
}

.section-card {
  height: 100%;
  overflow: hidden;

  transition:
    box-shadow 0.18s ease;
}

.section-card:hover {
  box-shadow:
    0 6px 22px rgba(0, 0, 0, 0.035) !important;
}

.section-title {
  font-size: 0.98rem !important;
  font-weight: 700 !important;
}

.section-icon {
  width: 38px;
  height: 38px;

  margin-right: 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.09);
}


/* ========================================================= */
/* SESSION */
/* ========================================================= */

.session-card {
  min-height: 100%;
}

.session-number {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 14px 16px;

  border-radius: 11px;

  background: rgba(var(--v-theme-primary), 0.055);
}

.session-number-label {
  color: rgba(var(--v-theme-on-surface), 0.60);

  font-size: 0.78rem;
  font-weight: 600;
}

.session-number-value {
  color: rgb(var(--v-theme-primary));

  font-size: 1rem;
  font-weight: 750;
}

.info-list {
  margin-top: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 18px;

  padding: 12px 0;

  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.07);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;

  color: rgba(var(--v-theme-on-surface), 0.60);

  font-size: 0.82rem;
}

.info-row strong {
  text-align: right;

  font-size: 0.82rem;
}

.session-note {
  margin-top: 18px;

  padding: 13px 15px;

  border-radius: 11px;

  background: rgba(var(--v-theme-on-surface), 0.035);
}

.session-note-label {
  display: flex;
  align-items: center;
  gap: 7px;

  color: rgba(var(--v-theme-on-surface), 0.55);

  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.session-note-text {
  margin-top: 7px;

  font-size: 0.83rem;
  line-height: 1.5;
}

.session-actions {
  padding: 15px 20px !important;
}


/* ========================================================= */
/* MOVEMENTS */
/* ========================================================= */

.movement-list {
  padding: 0 !important;
}

.movement-item {
  min-height: 70px;

  padding-top: 8px !important;
  padding-bottom: 8px !important;

  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.movement-item:last-child {
  border-bottom: 0;
}

.movement-icon {
  width: 39px;
  height: 39px;

  margin-right: 3px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;
}

.movement-icon-income {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.10);
}

.movement-icon-expense {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.10);
}

.movement-title {
  font-size: 0.86rem !important;
  font-weight: 600 !important;
}

.movement-date {
  margin-top: 2px;

  font-size: 0.74rem !important;
}

.movement-amount-wrapper {
  min-width: 115px;
  text-align: right;
}

.movement-amount {
  font-size: 0.88rem;
  font-weight: 700;
}


/* ========================================================= */
/* EMPTY STATES */
/* ========================================================= */

.empty-state {
  padding: 52px 25px;

  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;

  margin: 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 16px;

  color: rgba(var(--v-theme-on-surface), 0.42);
  background: rgba(var(--v-theme-on-surface), 0.055);
}

.empty-title {
  margin-top: 15px;

  font-size: 0.9rem;
  font-weight: 650;
}

.empty-description {
  margin-top: 5px;

  color: rgba(var(--v-theme-on-surface), 0.50);

  font-size: 0.77rem;
}


/* ========================================================= */
/* HISTORY */
/* ========================================================= */

.history-card {
  overflow: hidden;
}

.history-loading {
  min-height: 220px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 12px;

  color: rgba(var(--v-theme-on-surface), 0.55);

  font-size: 0.8rem;
}

.history-empty {
  min-height: 250px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.history-table-wrapper {
  overflow-x: auto;
}

.caja-table {
  min-width: 900px;
}

.caja-table th {
  height: 46px !important;

  background: rgba(var(--v-theme-on-surface), 0.025);

  color: rgba(var(--v-theme-on-surface), 0.55) !important;

  font-size: 0.72rem !important;
  font-weight: 700 !important;

  text-transform: uppercase;
  letter-spacing: 0.035em;
}

.caja-table td {
  height: 62px !important;

  font-size: 0.8rem;

  white-space: nowrap;
}

.session-table-id {
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.money-cell {
  font-weight: 600;
}


/* ========================================================= */
/* DIALOGS */
/* ========================================================= */

.dialog-card {
  overflow: hidden;
}

.dialog-header {
  padding: 20px 24px !important;
}

.dialog-icon {
  width: 42px;
  height: 42px;

  margin-right: 5px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
}

.dialog-icon-primary {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.10);
}

.dialog-icon-error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.10);
}

.dialog-description {
  margin: 0 0 20px;

  color: rgba(var(--v-theme-on-surface), 0.60);

  font-size: 0.83rem;
  line-height: 1.55;
}

.dialog-actions {
  min-height: 68px;

  padding: 12px 20px !important;
}


/* ========================================================= */
/* CIERRE */
/* ========================================================= */

.expected-balance {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 17px 18px;

  border-radius: 14px;

  border: 1px solid rgba(var(--v-theme-primary), 0.12);

  background: rgba(var(--v-theme-primary), 0.055);
}

.expected-label {
  color: rgba(var(--v-theme-on-surface), 0.60);

  font-size: 0.76rem;
  font-weight: 600;
}

.expected-value {
  margin-top: 4px;

  color: rgb(var(--v-theme-primary));

  font-size: 1.35rem;
  font-weight: 750;
}

.expected-icon {
  width: 44px;
  height: 44px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.10);
}

.difference-content {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;
}

.difference-value {
  font-size: 1rem;
}


/* ========================================================= */
/* DETAIL */
/* ========================================================= */

.detail-loading {
  min-height: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 15px;

  color: rgba(var(--v-theme-on-surface), 0.55);

  font-size: 0.82rem;
}

.detail-status {
  display: flex;
  align-items: center;
  gap: 12px;

  margin-bottom: 22px;
}

.detail-status-label {
  color: rgba(var(--v-theme-on-surface), 0.55);

  font-size: 0.78rem;
}

.detail-summary {
  margin-bottom: 2px;
}

.detail-metric {
  height: 100%;

  padding: 17px;

  border-radius: 13px;

  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);

  background: rgba(var(--v-theme-on-surface), 0.018);
}

.detail-metric-highlight {
  border-color: rgba(var(--v-theme-primary), 0.14);

  background: rgba(var(--v-theme-primary), 0.045);
}

.detail-metric-label {
  color: rgba(var(--v-theme-on-surface), 0.55);

  font-size: 0.73rem;
  font-weight: 600;
}

.detail-metric-value {
  margin-top: 8px;

  font-size: 1.05rem;
  font-weight: 750;
}

.detail-section {
  margin-top: 18px;
  overflow: hidden;
}

.small-section-icon {
  width: 34px;
  height: 34px;

  margin-right: 4px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}


/* ========================================================= */
/* RESPONSIVE */
/* ========================================================= */

@media (max-width: 700px) {

  .caja-page {
    padding: 14px !important;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-header-main {
    align-items: flex-start;
  }

  .page-icon {
    width: 42px;
    height: 42px;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-subtitle {
    font-size: 0.78rem;
  }

  .page-header > .v-btn {
    display: none;
  }

  .metric-value {
    font-size: 1.3rem;
  }

  .session-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .session-actions .v-spacer {
    display: none;
  }

  .session-actions .v-btn:last-child {
    margin-left: auto;
  }

  .movement-amount-wrapper {
    min-width: auto;
  }

  .movement-amount {
    font-size: 0.8rem;
  }

  .dialog-header {
    padding: 17px 18px !important;
  }

  .dialog-card .v-card-text {
    padding: 20px !important;
  }

  .difference-content {
    align-items: flex-start;
  }

  .detail-status {
    justify-content: space-between;
  }

}

</style>