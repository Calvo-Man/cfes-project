
<template>
  <v-container fluid class="pa-4">

    <!-- ENCABEZADO -->
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
          :icon="cajaAbierta ? 'mdi-lock-open-variant' : 'mdi-lock'"
          class="mr-2"
        />

        {{ cajaAbierta ? 'Caja abierta' : 'Caja cerrada' }}
      </v-chip>
    </div>

    <!-- LOADING -->
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

        <!-- RESUMEN -->
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
                <div class="d-flex align-center justify-space-between">
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
                <div class="d-flex align-center justify-space-between">
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
                <div class="d-flex align-center justify-space-between">
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
                <div class="d-flex align-center justify-space-between">
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

        <!-- INFORMACIÓN DE SESIÓN -->
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
              <v-card-title class="d-flex align-center justify-space-between">
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
            <div class="d-flex justify-space-between align-center">
              <span>
                Diferencia
              </span>

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

<script setup>
import {
  computed,
  onMounted,
  ref,
} from 'vue'

import api from '@/plugins/axios'

// ============================================
// ESTADO
// ============================================

const loading = ref(true)
const loadingSaldo = ref(false)
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

const dialogAbrir = ref(false)
const dialogCerrar = ref(false)

const formAbrir = ref({
  saldoInicial: 0,
  observacion: '',
})

const formCerrar = ref({
  dineroContado: null,
  observacionCierre: '',
})

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

// ============================================
// CARGAR CAJA
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
// MOVIMIENTOS
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

    await cargarCaja()

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

    await cargarCaja()

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

  if (miembro.name) {
    return miembro.name + ' ' + miembro.apellido
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

onMounted(() => {
  cargarCaja()
})
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.07) !important;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
}

.resumen-cierre {
  background: #f5f7fa;
  border-radius: 10px;
  padding: 8px 16px;
}
</style>

