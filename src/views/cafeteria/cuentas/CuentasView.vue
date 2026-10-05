<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'

/* ============================================================
   ESTADO
============================================================ */

const cuentas = ref([])
const loading = ref(false)
const error = ref('')

const dialogCrear = ref(false)
const dialogMovimientos = ref(false)
const dialogTransferencia = ref(false)

const cuentaSeleccionada = ref(null)
const movimientos = ref([])
const loadingMovimientos = ref(false)
const loadingTransferencia = ref(false)

const form = ref({
  nombre: '',
  tipo: '',
})

const transferenciaForm = ref({
  cuentaOrigenId: null,
  cuentaDestinoId: null,
  monto: null,
  observacion: '',
})

const dialogOperacionSaldo = ref(false)
const loadingOperacionSaldo = ref(false)
const tipoOperacionSaldo = ref('INGRESO')

const operacionSaldoForm = ref({
  monto: null,
  observacion: '',
})

/* ============================================================
   TIPOS DE CUENTA
============================================================ */

const tiposCuenta = [
  {
    title: 'Efectivo',
    value: 'EFECTIVO',
  },
  {
    title: 'Nequi',
    value: 'NEQUI',
  },
  {
    title: 'Daviplata',
    value: 'DAVIPLATA',
  },
  {
    title: 'Transferencia',
    value: 'TRANSFERENCIA',
  },
  {
    title: 'Tarjeta',
    value: 'TARJETA',
  },
]

/* ============================================================
   COMPUTED
============================================================ */

const totalDisponible = computed(() => {
  return cuentas.value
    .filter(cuenta => cuenta.activo)
    .reduce((total, cuenta) => {
      return total + Number(cuenta.saldo || 0)
    }, 0)
})

const cuentasActivas = computed(() => {
  return cuentas.value.filter(cuenta => cuenta.activo).length
})

const cuentasInactivas = computed(() => {
  return cuentas.value.filter(cuenta => !cuenta.activo).length
})

const cuentaOrigenSeleccionada = computed(() => {
  return cuentas.value.find(
    cuenta => cuenta.id === transferenciaForm.value.cuentaOrigenId
  ) || null
})

const cuentasDestinoDisponibles = computed(() => {
  return cuentas.value.filter(cuenta =>
    cuenta.activo &&
    cuenta.id !== transferenciaForm.value.cuentaOrigenId
  )
})

const montoTransferenciaValido = computed(() => {
  const monto = Number(transferenciaForm.value.monto)

  return (
    Number.isFinite(monto) &&
    monto > 0 &&
    cuentaOrigenSeleccionada.value &&
    monto <= Number(cuentaOrigenSeleccionada.value.saldo || 0)
  )
})

const puedeTransferir = computed(() => {
  return (
    transferenciaForm.value.cuentaOrigenId &&
    transferenciaForm.value.cuentaDestinoId &&
    montoTransferenciaValido.value &&
    !loadingTransferencia.value
  )
})

const esIngresoSaldo = computed(() => {
  return tipoOperacionSaldo.value === 'INGRESO'
})

const saldoDisponibleOperacion = computed(() => {
  return Number(cuentaSeleccionada.value?.saldo || 0)
})

const montoOperacionValido = computed(() => {
  const monto = Number(operacionSaldoForm.value.monto)

  if (!Number.isFinite(monto) || monto <= 0) {
    return false
  }

  if (!esIngresoSaldo.value && monto > saldoDisponibleOperacion.value) {
    return false
  }

  return true
})

const puedeGuardarOperacionSaldo = computed(() => {
  return (
    cuentaSeleccionada.value?.activo &&
    montoOperacionValido.value &&
    !loadingOperacionSaldo.value
  )
})

/* ============================================================
   UTILIDADES
============================================================ */

const formatearDinero = (valor) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor || 0))
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(new Date(fecha))
}

const obtenerIcono = (tipo) => {
  const iconos = {
    EFECTIVO: 'mdi-cash',
    NEQUI: 'mdi-cellphone',
    DAVIPLATA: 'mdi-wallet',
    TRANSFERENCIA: 'mdi-bank-transfer',
    TARJETA: 'mdi-credit-card-outline',
  }

  return iconos[tipo] || 'mdi-wallet-outline'
}

const obtenerColor = (tipo) => {
  const colores = {
    EFECTIVO: 'success',
    NEQUI: 'deep-purple',
    DAVIPLATA: 'red',
    TRANSFERENCIA: 'blue',
    TARJETA: 'orange',
  }

  return colores[tipo] || 'primary'
}

const obtenerNombreTipo = (tipo) => {
  const cuenta = tiposCuenta.find(item => item.value === tipo)

  return cuenta ? cuenta.title : tipo
}

const obtenerSignoMovimiento = (tipo) => {
  return tipo === 'INGRESO' ? '+' : '-'
}

const obtenerColorMovimiento = (tipo) => {
  return tipo === 'INGRESO' ? 'success' : 'error'
}

const obtenerIconoMovimiento = (tipo) => {
  return tipo === 'INGRESO'
    ? 'mdi-arrow-down-left'
    : 'mdi-arrow-up-right'
}

const obtenerTextoConcepto = (concepto) => {
  const conceptos = {
    VENTA: 'Venta',
    PAGO_CREDITO: 'Pago de crédito',
    COMPRA: 'Compra',
    PAGO_PROVEEDOR: 'Pago a proveedor',
    RETIRO: 'Retiro',
    AJUSTE: 'Ajuste',
    INGRESO_MANUAL: 'Ingreso manual',
    EGRESO_MANUAL: 'Egreso manual',
    TRANSFERENCIA: 'Transferencia',
    ANULACION_COMPRA: 'Anulación de compra',
  }

  return conceptos[concepto] || concepto
}

/* ============================================================
   CUENTAS
============================================================ */

const cargarCuentas = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await api.get('/cafeteria/cuentas')

    cuentas.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (err) {
    console.error('Error cargando cuentas:', err)

    error.value =
      err.response?.data?.message ||
      'No fue posible cargar las cuentas.'
  } finally {
    loading.value = false
  }
}

/* ============================================================
   CREAR CUENTA
============================================================ */

const abrirCrearCuenta = () => {
  form.value = {
    nombre: '',
    tipo: '',
  }

  dialogCrear.value = true
}

const cerrarCrearCuenta = () => {
  dialogCrear.value = false
}

const crearCuenta = async () => {
  if (!form.value.nombre.trim() || !form.value.tipo) {
    return
  }

  try {
    await api.post('/cafeteria/cuentas', {
      nombre: form.value.nombre.trim(),
      tipo: form.value.tipo,
    })

    dialogCrear.value = false

    await cargarCuentas()
  } catch (err) {
    console.error('Error creando cuenta:', err)

    error.value =
      err.response?.data?.message ||
      'No fue posible crear la cuenta.'
  }
}

/* ============================================================
   ACTIVAR / DESACTIVAR
============================================================ */

const cambiarEstado = async (cuenta) => {
  try {
    await api.patch(
      `/cafeteria/cuentas/${cuenta.id}/estado`,
      {
        activo: !cuenta.activo,
      }
    )

    await cargarCuentas()
  } catch (err) {
    console.error('Error cambiando estado:', err)

    error.value =
      err.response?.data?.message ||
      'No fue posible cambiar el estado de la cuenta.'
  }
}

/* ============================================================
   TRANSFERENCIAS
============================================================ */

const abrirTransferencia = () => {
  transferenciaForm.value = {
    cuentaOrigenId: null,
    cuentaDestinoId: null,
    monto: null,
    observacion: '',
  }

  error.value = ''
  dialogTransferencia.value = true
}

const cerrarTransferencia = () => {

  dialogTransferencia.value = false

  transferenciaForm.value = {
    cuentaOrigenId: null,
    cuentaDestinoId: null,
    monto: null,
    observacion: '',
  }
}

/* ============================================================
   INGRESO / RETIRO MANUAL DE SALDO
============================================================ */

const abrirOperacionSaldo = (cuenta, operacion) => {
  cuentaSeleccionada.value = cuenta
  tipoOperacionSaldo.value = operacion

  operacionSaldoForm.value = {
    monto: null,
    observacion: '',
  }

  error.value = ''
  dialogOperacionSaldo.value = true
}

const cerrarOperacionSaldo = () => {

  dialogOperacionSaldo.value = false

  operacionSaldoForm.value = {
    monto: null,
    observacion: '',
  }

  cuentaSeleccionada.value = null
}

const guardarOperacionSaldo = async () => {
  if (!puedeGuardarOperacionSaldo.value) return

  loadingOperacionSaldo.value = true
  error.value = ''

  const cuentaId = cuentaSeleccionada.value.id

  const endpoint = esIngresoSaldo.value
    ? 'ingreso'
    : 'retiro'

  try {
    await api.post(
      `/cafeteria/movimientos-cuenta/${cuentaId}/${endpoint}`,
      {
        monto: Number(operacionSaldoForm.value.monto),
        observacion:
          operacionSaldoForm.value.observacion?.trim() || undefined,
      }
    )


    await cargarCuentas()

    // Si el historial está abierto para esta cuenta,
    // actualizamos sus movimientos.
    if (
      dialogMovimientos.value &&
      cuentaSeleccionada.value?.id === cuentaId
    ) {
      await verMovimientos(
        cuentas.value.find(cuenta => cuenta.id === cuentaId) ||
        cuentaSeleccionada.value
      )
    }

    cerrarOperacionSaldo()
    cuentaSeleccionada.value = null

    operacionSaldoForm.value = {
      monto: null,
      observacion: '',
    }
  } catch (err) {
    console.error(
      `Error realizando ${endpoint} manual:`,
      err
    )

    error.value =
      err.response?.data?.message ||
      `No fue posible ${esIngresoSaldo.value ? 'agregar' : 'retirar'} el saldo.`
  } finally {
    loadingOperacionSaldo.value = false
  }
}

const seleccionarCuentaOrigen = () => {
  // Si la cuenta destino termina siendo igual a la nueva cuenta origen,
  // la limpiamos para evitar una transferencia hacia la misma cuenta.
  if (
    transferenciaForm.value.cuentaDestinoId ===
    transferenciaForm.value.cuentaOrigenId
  ) {
    transferenciaForm.value.cuentaDestinoId = null
  }
}

const transferirDinero = async () => {
  if (!puedeTransferir.value) {
    return
  }

  loadingTransferencia.value = true
  error.value = ''

  try {
    await api.post('/cafeteria/movimientos-cuenta/transferencia', {
      cuentaOrigenId:
        transferenciaForm.value.cuentaOrigenId,

      cuentaDestinoId:
        transferenciaForm.value.cuentaDestinoId,

      monto: Number(
        transferenciaForm.value.monto
      ),

      observacion:
        transferenciaForm.value.observacion?.trim() || undefined,
    })

    
    await cargarCuentas()
    cerrarTransferencia()
  } catch (err) {
    console.error('Error realizando transferencia:', err)

    error.value =
      err.response?.data?.message ||
      'No fue posible realizar la transferencia.'
  } finally {
    loadingTransferencia.value = false
  }
}

/* ============================================================
   MOVIMIENTOS
============================================================ */

const verMovimientos = async (cuenta) => {
  cuentaSeleccionada.value = cuenta
  movimientos.value = []

  dialogMovimientos.value = true
  loadingMovimientos.value = true

  try {
    const response = await api.get(
      `/cafeteria/cuentas/${cuenta.id}/movimientos`
    )

    cuentaSeleccionada.value = response.data.cuenta
    movimientos.value = Array.isArray(response.data.movimientos)
      ? response.data.movimientos
      : []
  } catch (err) {
    console.error('Error cargando movimientos:', err)

    error.value =
      err.response?.data?.message ||
      'No fue posible cargar los movimientos.'

    dialogMovimientos.value = false
  } finally {
    loadingMovimientos.value = false
  }
}

const cerrarMovimientos = () => {
  dialogMovimientos.value = false
  cuentaSeleccionada.value = null
  movimientos.value = []
}

/* ============================================================
   INICIO
============================================================ */

onMounted(() => {
  cargarCuentas()
})
</script>

<template>
  <div class="cuentas-page pa-4 pa-md-5">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <div class="page-header d-flex align-center justify-space-between">

      <div class="d-flex align-center ga-3">

        <div class="page-icon">
          <v-icon size="21">
            mdi-wallet-outline
          </v-icon>
        </div>

        <div>
          <h1 class="page-title">
            Cuentas financieras
          </h1>

          <p class="page-subtitle">
            Control del dinero disponible de la cafetería
          </p>
        </div>

      </div>

      <div class="header-actions">

        <v-btn color="primary" size="small" variant="tonal" prepend-icon="mdi-swap-horizontal"
          :disabled="cuentasActivas < 2" @click="abrirTransferencia">
          Transferir
        </v-btn>

        <v-btn color="primary" size="small" variant="flat" prepend-icon="mdi-plus" @click="abrirCrearCuenta">
          Nueva cuenta
        </v-btn>

      </div>

    </div>

    <!-- =====================================================
         ERROR
    ====================================================== -->

    <v-alert v-if="error" type="error" variant="tonal" density="compact" closable class="mb-3"
      @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- =====================================================
         MÉTRICAS
    ====================================================== -->

    <v-row dense class="mb-3">

      <v-col cols="12" sm="6" md="4">

        <v-card class="metric-card" elevation="0">
          <v-card-text>

            <div class="d-flex justify-space-between align-start">

              <div>

                <div class="metric-label">
                  Dinero disponible
                </div>

                <div class="metric-value">
                  {{ formatearDinero(totalDisponible) }}
                </div>

                <div class="metric-foot">
                  Saldo de cuentas activas
                </div>

              </div>

              <div class="metric-icon">
                <v-icon size="18">
                  mdi-wallet
                </v-icon>
              </div>

            </div>

          </v-card-text>
        </v-card>

      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-card class="metric-card" elevation="0">
          <v-card-text>

            <div class="d-flex justify-space-between align-start">

              <div>

                <div class="metric-label">
                  Cuentas activas
                </div>

                <div class="metric-value">
                  {{ cuentasActivas }}
                </div>

                <div class="metric-foot">
                  Cuentas disponibles
                </div>

              </div>

              <div class="metric-icon success">
                <v-icon size="18">
                  mdi-check-circle-outline
                </v-icon>
              </div>

            </div>

          </v-card-text>
        </v-card>

      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-card class="metric-card" elevation="0">
          <v-card-text>

            <div class="d-flex justify-space-between align-start">

              <div>

                <div class="metric-label">
                  Total de cuentas
                </div>

                <div class="metric-value">
                  {{ cuentas.length }}
                </div>

                <div class="metric-foot">
                  {{ cuentasInactivas }}
                  inactivas
                </div>

              </div>

              <div class="metric-icon">
                <v-icon size="18">
                  mdi-bank-outline
                </v-icon>
              </div>

            </div>

          </v-card-text>
        </v-card>

      </v-col>

    </v-row>

    <!-- =====================================================
         LOADING
    ====================================================== -->

    <v-card v-if="loading" class="loading-card" elevation="0">
      <v-card-text class="py-10 text-center">
        <v-progress-circular indeterminate color="primary" size="32" />

        <div class="loading-text">
          Cargando cuentas...
        </div>
      </v-card-text>
    </v-card>

    <!-- =====================================================
         CUENTAS
    ====================================================== -->

    <template v-else>

      <div v-if="cuentas.length" class="accounts-grid">

        <v-card v-for="cuenta in cuentas" :key="cuenta.id" class="account-card"
          :class="{ 'account-disabled': !cuenta.activo }" elevation="0" @click="verMovimientos(cuenta)">

          <v-card-text>

            <!-- CABECERA -->

            <div class="d-flex justify-space-between align-start">

              <div class="account-icon" :class="`account-icon-${cuenta.tipo.toLowerCase()}`">
                <v-icon size="20">
                  {{ obtenerIcono(cuenta.tipo) }}
                </v-icon>
              </div>

              <v-menu>

                <template #activator="{ props }">

                  <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" density="comfortable" size="small"
                    @click.stop />

                </template>
                <v-list density="compact">

                  <v-list-item prepend-icon="mdi-history" title="Ver movimientos" @click="verMovimientos(cuenta)" />

                  <v-divider class="my-1" />

                  <v-list-item prepend-icon="mdi-plus-circle-outline" title="Agregar saldo" :disabled="!cuenta.activo"
                    @click="abrirOperacionSaldo(cuenta, 'INGRESO')" />

                  <v-list-item prepend-icon="mdi-minus-circle-outline" title="Retirar saldo"
                    :disabled="!cuenta.activo || Number(cuenta.saldo) <= 0"
                    @click="abrirOperacionSaldo(cuenta, 'EGRESO')" />

                  <v-divider class="my-1" />

                  <v-list-item :prepend-icon="cuenta.activo
                    ? 'mdi-pause-circle-outline'
                    : 'mdi-play-circle-outline'
                    " :title="cuenta.activo
                      ? 'Desactivar cuenta'
                      : 'Activar cuenta'
                      " @click="cambiarEstado(cuenta)" />

                </v-list>

              </v-menu>

            </div>

            <!-- INFORMACIÓN -->

            <div class="account-info">

              <div class="account-type">
                {{ obtenerNombreTipo(cuenta.tipo) }}
              </div>

              <div class="account-name">
                {{ cuenta.nombre }}
              </div>

              <div class="account-balance">
                {{ formatearDinero(cuenta.saldo) }}
              </div>

            </div>

            <!-- FOOTER -->

            <div class="account-footer">

              <div class="d-flex align-center ga-2">

                <span class="status-dot" :class="{
                  active: cuenta.activo
                }" />

                <span class="account-status">
                  {{ cuenta.activo ? 'Activa' : 'Inactiva' }}
                </span>

              </div>

              <span class="movement-link">
                Ver movimientos
                <v-icon size="13">
                  mdi-chevron-right
                </v-icon>
              </span>

            </div>

          </v-card-text>

        </v-card>

      </div>

      <!-- ===================================================
           SIN CUENTAS
      ==================================================== -->

      <v-card v-else class="empty-card" elevation="0">

        <v-icon size="40" color="grey">
          mdi-wallet-outline
        </v-icon>

        <div class="empty-title">
          No hay cuentas configuradas
        </div>

        <div class="empty-text">
          Crea las cuentas donde la cafetería administra su dinero.
        </div>

        <v-btn color="primary" size="small" class="mt-4" prepend-icon="mdi-plus" @click="abrirCrearCuenta">
          Crear cuenta
        </v-btn>

      </v-card>

    </template>

    <!-- =====================================================
         DIALOG CREAR
    ====================================================== -->

    <v-dialog v-model="dialogCrear" max-width="460">

      <v-card class="dialog-card">

        <div class="dialog-header">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon">
              <v-icon size="19">
                mdi-wallet-plus-outline
              </v-icon>
            </div>

            <div>

              <div class="dialog-title">
                Nueva cuenta
              </div>

              <div class="dialog-subtitle">
                Configura una cuenta financiera
              </div>

            </div>

          </div>

          <v-btn icon="mdi-close" variant="text" size="small" @click="cerrarCrearCuenta" />

        </div>

        <v-divider />

        <v-card-text class="pa-4">

          <div class="field-label">
            Nombre de la cuenta
          </div>

          <v-text-field v-model="form.nombre" placeholder="Ej. Nequi Cafetería" variant="outlined" density="compact"
            prepend-inner-icon="mdi-wallet-outline" hide-details class="mb-4" />

          <div class="field-label">
            Tipo de cuenta
          </div>

          <v-select v-model="form.tipo" :items="tiposCuenta" item-title="title" item-value="value"
            placeholder="Selecciona un tipo" variant="outlined" density="compact" prepend-inner-icon="mdi-shape-outline"
            hide-details />

        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-3">

          <v-btn variant="text" size="small" @click="cerrarCrearCuenta">
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn color="primary" variant="flat" size="small" :disabled="!form.nombre.trim() || !form.tipo"
            @click="crearCuenta">
            Crear cuenta
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- =====================================================
     DIALOG INGRESO / RETIRO DE SALDO
====================================================== -->

    <v-dialog v-model="dialogOperacionSaldo" max-width="460" persistent>

      <v-card class="dialog-card">

        <!-- HEADER -->

        <div class="dialog-header">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon" :class="esIngresoSaldo
                ? 'balance-income-icon'
                : 'balance-expense-icon'
              ">

              <v-icon size="19">
                {{
                  esIngresoSaldo
                    ? 'mdi-plus-circle-outline'
                    : 'mdi-minus-circle-outline'
                }}
              </v-icon>

            </div>

            <div>

              <div class="dialog-title">
                {{ esIngresoSaldo ? 'Agregar saldo' : 'Retirar saldo' }}
              </div>

              <div class="dialog-subtitle">
                {{ cuentaSeleccionada?.nombre }}
              </div>

            </div>

          </div>

          <v-btn icon="mdi-close" variant="text" size="small" :disabled="loadingOperacionSaldo"
            @click="cerrarOperacionSaldo" />

        </div>

        <v-divider />

        <v-card-text class="pa-4">

          <!-- SALDO ACTUAL -->

          <div class="balance-current">

            <span>
              Saldo actual
            </span>

            <strong>
              {{ formatearDinero(saldoDisponibleOperacion) }}
            </strong>

          </div>

          <!-- MONTO -->

          <div class="field-label">
            {{ esIngresoSaldo ? 'Monto a agregar' : 'Monto a retirar' }}
          </div>

          <v-text-field v-model.number="operacionSaldoForm.monto" type="number" min="0" step="1000" placeholder="0"
            variant="outlined" density="compact" prefix="$" hide-details="auto" :error="!esIngresoSaldo &&
              Number(operacionSaldoForm.monto) > saldoDisponibleOperacion
              " :error-messages="!esIngresoSaldo &&
            Number(operacionSaldoForm.monto) > saldoDisponibleOperacion
            ? 'El monto supera el saldo disponible'
            : ''
          " class="amount-input mb-4" />

          <!-- OBSERVACIÓN -->

          <div class="field-label">
            Motivo de la operación
            <span class="optional">
              Opcional
            </span>
          </div>

          <v-textarea v-model="operacionSaldoForm.observacion" :placeholder="esIngresoSaldo
              ? 'Ej. Saldo inicial de caja'
              : 'Ej. Retiro para gastos de cafetería'
            " variant="outlined" density="compact" rows="2" auto-grow hide-details />

          <!-- RESUMEN -->

          <div v-if="montoOperacionValido" class="balance-summary">

            <div class="summary-row">

              <span>
                {{ esIngresoSaldo ? 'Saldo actual' : 'Saldo actual' }}
              </span>

              <strong>
                {{ formatearDinero(saldoDisponibleOperacion) }}
              </strong>

            </div>

            <div class="summary-row">

              <span>
                {{ esIngresoSaldo ? 'Ingreso' : 'Retiro' }}
              </span>

              <strong :class="esIngresoSaldo
                  ? 'summary-income'
                  : 'summary-expense'
                ">
                {{ esIngresoSaldo ? '+' : '-' }}
                {{ formatearDinero(operacionSaldoForm.monto) }}
              </strong>

            </div>

            <v-divider class="my-2" />

            <div class="summary-row">

              <strong>
                Saldo resultante
              </strong>

              <strong class="resulting-balance">
                {{
                  formatearDinero(
                    saldoDisponibleOperacion +
                    (
                      esIngresoSaldo
                        ? Number(operacionSaldoForm.monto)
                        : -Number(operacionSaldoForm.monto)
                    )
                  )
                }}
              </strong>

            </div>

          </div>

        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-3">

          <v-btn variant="text" size="small" :disabled="loadingOperacionSaldo" @click="cerrarOperacionSaldo">
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn :color="esIngresoSaldo ? 'success' : 'error'" variant="flat" size="small"
            :loading="loadingOperacionSaldo" :disabled="!puedeGuardarOperacionSaldo" :prepend-icon="esIngresoSaldo
                ? 'mdi-plus'
                : 'mdi-minus'
              " @click="guardarOperacionSaldo">
            {{ esIngresoSaldo ? 'Agregar saldo' : 'Confirmar retiro' }}
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- =====================================================
         DIALOG TRANSFERENCIA
    ====================================================== -->

    <v-dialog v-model="dialogTransferencia" max-width="500" persistent>

      <v-card class="dialog-card">

        <!-- HEADER -->

        <div class="dialog-header">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon transfer-icon">
              <v-icon size="19">
                mdi-swap-horizontal
              </v-icon>
            </div>

            <div>

              <div class="dialog-title">
                Transferir dinero
              </div>

              <div class="dialog-subtitle">
                Mueve dinero entre tus cuentas financieras
              </div>

            </div>

          </div>

          <v-btn icon="mdi-close" variant="text" size="small" :disabled="loadingTransferencia"
            @click="cerrarTransferencia" />

        </div>

        <v-divider />

        <v-card-text class="pa-4">

          <!-- ORIGEN -->

          <div class="field-label">
            Cuenta de origen
          </div>

          <v-select v-model="transferenciaForm.cuentaOrigenId" :items="cuentas.filter(cuenta => cuenta.activo)"
            item-title="nombre" item-value="id" placeholder="Selecciona la cuenta de origen" variant="outlined"
            density="compact" prepend-inner-icon="mdi-arrow-up-right" hide-details class="mb-2"
            @update:model-value="seleccionarCuentaOrigen">

            <template #item="{ props, item }">

              <v-list-item v-bind="props" :title="item.raw.nombre"
                :subtitle="`${obtenerNombreTipo(item.raw.tipo)} · ${formatearDinero(item.raw.saldo)}`">

                <template #prepend>

                  <div class="select-account-icon" :class="`account-icon-${item.raw.tipo.toLowerCase()}`">
                    <v-icon size="16">
                      {{ obtenerIcono(item.raw.tipo) }}
                    </v-icon>
                  </div>

                </template>

              </v-list-item>

            </template>

            <template #selection="{ item }">

              <div class="selected-account">

                <div class="select-account-icon" :class="`account-icon-${item.raw.tipo.toLowerCase()}`">
                  <v-icon size="15">
                    {{ obtenerIcono(item.raw.tipo) }}
                  </v-icon>
                </div>

                <span>
                  {{ item.raw.nombre }}
                </span>

              </div>

            </template>

          </v-select>

          <!-- SALDO DISPONIBLE -->

          <div v-if="cuentaOrigenSeleccionada" class="available-balance">

            <span>
              Saldo disponible
            </span>

            <strong>
              {{ formatearDinero(cuentaOrigenSeleccionada.saldo) }}
            </strong>

          </div>

          <!-- MONTO -->

          <div class="field-label amount-label">
            Monto a transferir
          </div>

          <v-text-field v-model.number="transferenciaForm.monto" type="number" min="0" step="1000" placeholder="0"
            variant="outlined" density="compact" prefix="$" hide-details :error="transferenciaForm.monto > 0 &&
              cuentaOrigenSeleccionada &&
              Number(transferenciaForm.monto) >
              Number(cuentaOrigenSeleccionada.saldo)
              " :error-messages="transferenciaForm.monto > 0 &&
                cuentaOrigenSeleccionada &&
                Number(transferenciaForm.monto) >
                Number(cuentaOrigenSeleccionada.saldo)
                ? 'El monto supera el saldo disponible'
                : ''
                " class="amount-input" />

          <!-- DESTINO -->

          <div class="field-label destination-label">
            Cuenta de destino
          </div>

          <v-select v-model="transferenciaForm.cuentaDestinoId" :items="cuentasDestinoDisponibles" item-title="nombre"
            item-value="id" placeholder="Selecciona la cuenta destino" variant="outlined" density="compact"
            prepend-inner-icon="mdi-arrow-down-left" hide-details class="mb-4">

            <template #item="{ props, item }">

              <v-list-item v-bind="props" :title="item.raw.nombre" :subtitle="obtenerNombreTipo(item.raw.tipo)">

                <template #prepend>

                  <div class="select-account-icon" :class="`account-icon-${item.raw.tipo.toLowerCase()}`">
                    <v-icon size="16">
                      {{ obtenerIcono(item.raw.tipo) }}
                    </v-icon>
                  </div>

                </template>

              </v-list-item>

            </template>

            <template #selection="{ item }">

              <div class="selected-account">

                <div class="select-account-icon" :class="`account-icon-${item.raw.tipo.toLowerCase()}`">
                  <v-icon size="15">
                    {{ obtenerIcono(item.raw.tipo) }}
                  </v-icon>
                </div>

                <span>
                  {{ item.raw.nombre }}
                </span>

              </div>

            </template>

          </v-select>

          <!-- RESUMEN -->

          <div v-if="
            cuentaOrigenSeleccionada &&
            transferenciaForm.cuentaDestinoId &&
            Number(transferenciaForm.monto) > 0
          " class="transfer-summary">

            <div class="summary-row">

              <span>
                {{ cuentaOrigenSeleccionada.nombre }}
              </span>

              <strong class="summary-expense">
                - {{ formatearDinero(transferenciaForm.monto) }}
              </strong>

            </div>

            <div class="summary-arrow">
              <v-icon size="15">
                mdi-arrow-down
              </v-icon>
            </div>

            <div class="summary-row">

              <span>
                {{
                  cuentas.find(
                    cuenta =>
                      cuenta.id ===
                      transferenciaForm.cuentaDestinoId
                  )?.nombre
                }}
              </span>

              <strong class="summary-income">
                + {{ formatearDinero(transferenciaForm.monto) }}
              </strong>

            </div>

          </div>

          <!-- OBSERVACIÓN -->

          <div class="field-label observation-label">
            Observación
            <span class="optional">
              Opcional
            </span>
          </div>

          <v-textarea v-model="transferenciaForm.observacion" placeholder="Ej. Traslado de efectivo a Nequi"
            variant="outlined" density="compact" rows="2" auto-grow hide-details />

        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-3">

          <v-btn variant="text" size="small" :disabled="loadingTransferencia" @click="cerrarTransferencia">
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn color="primary" variant="flat" size="small" :loading="loadingTransferencia"
            :disabled="!puedeTransferir" prepend-icon="mdi-swap-horizontal" @click="transferirDinero">
            Transferir dinero
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- =====================================================
         DIALOG MOVIMIENTOS
    ====================================================== -->

    <v-dialog v-model="dialogMovimientos" max-width="760" scrollable>

      <v-card class="dialog-card">

        <!-- HEADER -->

        <div class="dialog-header">

          <div v-if="cuentaSeleccionada" class="d-flex align-center ga-3">

            <div class="account-icon" :class="`
                account-icon-${cuentaSeleccionada.tipo.toLowerCase()}
              `">
              <v-icon size="20">
                {{ obtenerIcono(cuentaSeleccionada.tipo) }}
              </v-icon>
            </div>

            <div>

              <div class="dialog-title">
                {{ cuentaSeleccionada.nombre }}
              </div>

              <div class="dialog-subtitle">

                {{ obtenerNombreTipo(cuentaSeleccionada.tipo) }}

                <span class="separator">
                  ·
                </span>

                Saldo:

                <strong>
                  {{ formatearDinero(cuentaSeleccionada.saldo) }}
                </strong>

              </div>

            </div>

          </div>

          <v-btn icon="mdi-close" variant="text" size="small" @click="cerrarMovimientos" />

        </div>

        <v-divider />

        <!-- LOADING -->

        <div v-if="loadingMovimientos" class="loading-movements">

          <v-progress-circular indeterminate color="primary" size="30" />

          <span>
            Cargando movimientos...
          </span>

        </div>

        <!-- MOVIMIENTOS -->

        <div v-else-if="movimientos.length" class="movements-list">

          <div v-for="movimiento in movimientos" :key="movimiento.id" class="movement-item">

            <!-- ICONO -->

            <div class="movement-icon" :class="movimiento.tipo === 'INGRESO'
              ? 'movement-income'
              : 'movement-expense'
              ">

              <v-icon size="17">
                {{ obtenerIconoMovimiento(movimiento.tipo) }}
              </v-icon>

            </div>

            <!-- INFORMACIÓN -->

            <div class="movement-info">

              <div class="movement-top">

                <span class="movement-concept">
                  {{ obtenerTextoConcepto(movimiento.concepto) }}
                </span>

                <span class="movement-amount" :class="movimiento.tipo === 'INGRESO'
                  ? 'amount-income'
                  : 'amount-expense'
                  ">
                  {{ obtenerSignoMovimiento(movimiento.tipo) }}
                  {{ formatearDinero(movimiento.monto) }}
                </span>

              </div>

              <div class="movement-meta">

                <span>
                  {{ formatearFecha(movimiento.createdAt) }}
                </span>

                <span v-if="movimiento.numeroReferencia">
                  · {{ movimiento.numeroReferencia }}
                </span>

              </div>

              <div v-if="movimiento.observacion" class="movement-observation">
                {{ movimiento.observacion }}
              </div>

            </div>

            <!-- SALDO -->

            <div class="movement-balance">

              <span>
                Saldo
              </span>

              <strong>
                {{ formatearDinero(movimiento.saldoNuevo) }}
              </strong>

            </div>

          </div>

        </div>

        <!-- SIN MOVIMIENTOS -->

        <div v-else class="empty-movements">

          <v-icon size="38" color="grey">
            mdi-history
          </v-icon>

          <div class="empty-title">
            No hay movimientos
          </div>

          <div class="empty-text">
            Esta cuenta todavía no tiene movimientos registrados.
          </div>

        </div>

        <v-divider />

        <v-card-actions class="px-4 py-2">

          <v-spacer />

          <v-btn variant="text" size="small" @click="cerrarMovimientos">
            Cerrar
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

  </div>
</template>

<style scoped>
/* ============================================================
   BASE
============================================================ */

.cuentas-page {
  min-height: 100%;
  background: rgb(var(--v-theme-background));
}

/* ============================================================
   HEADER
============================================================ */

.page-header {
  gap: 12px;
  margin-bottom: 18px;
}

.page-icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.10);
  color: rgb(var(--v-theme-primary));
}

.page-title {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-background), 0.58);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ============================================================
   MÉTRICAS
============================================================ */

.metric-card {
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 13px;
  background: rgb(var(--v-theme-surface));
}

.metric-card :deep(.v-card-text) {
  padding: 14px 16px;
}

.metric-label {
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-weight: 500;
}

.metric-value {
  margin-top: 9px;
  font-size: 1.25rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.metric-foot {
  margin-top: 7px;
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.46);
}

.metric-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.09);
  color: rgb(var(--v-theme-primary));
}

.metric-icon.success {
  background: rgba(var(--v-theme-success), 0.10);
  color: rgb(var(--v-theme-success));
}

/* ============================================================
   LOADING
============================================================ */

.loading-card {
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 13px;
}

.loading-text {
  margin-top: 9px;
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.50);
}

/* ============================================================
   CUENTAS
============================================================ */

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.account-card {
  min-width: 0;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 13px;
  cursor: pointer;
  background: rgb(var(--v-theme-surface));
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.account-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.22);
  transform: translateY(-2px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.06) !important;
}

.account-card :deep(.v-card-text) {
  padding: 15px;
}

.account-disabled {
  opacity: 0.58;
}

.account-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account-icon-efectivo {
  background: rgba(var(--v-theme-success), 0.10);
  color: rgb(var(--v-theme-success));
}

.account-icon-nequi {
  background: rgba(92, 52, 150, 0.10);
  color: rgb(92, 52, 150);
}

.account-icon-daviplata {
  background: rgba(var(--v-theme-error), 0.10);
  color: rgb(var(--v-theme-error));
}

.account-icon-transferencia {
  background: rgba(var(--v-theme-primary), 0.10);
  color: rgb(var(--v-theme-primary));
}

.account-icon-tarjeta {
  background: rgba(220, 140, 20, 0.10);
  color: rgb(190, 115, 10);
}

.account-info {
  margin-top: 14px;
}

.account-type {
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.50);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.account-name {
  margin-top: 3px;
  font-size: 0.86rem;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-balance {
  margin-top: 13px;
  font-size: 1.28rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.account-footer {
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(var(--v-border-color), 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(var(--v-theme-on-surface), 0.30);
}

.status-dot.active {
  background: rgb(var(--v-theme-success));
}

.account-status {
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.movement-link {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.65rem;
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
/* ============================================================
   OPERACIONES MANUALES DE SALDO
============================================================ */

.balance-income-icon {
  background: rgba(var(--v-theme-success), 0.10);
  color: rgb(var(--v-theme-success));
}

.balance-expense-icon {
  background: rgba(var(--v-theme-error), 0.10);
  color: rgb(var(--v-theme-error));
}

.balance-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  margin-bottom: 18px;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 9px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.balance-current span {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

.balance-current strong {
  font-size: 0.9rem;
  font-weight: 700;
}

.balance-summary {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 9px;
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.balance-summary .summary-row {
  min-height: 25px;
}

.resulting-balance {
  font-size: 0.82rem !important;
  font-weight: 700;
}

/* ============================================================
   EMPTY
============================================================ */

.empty-card {
  padding: 42px 20px;
  text-align: center;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 13px;
}

.empty-title {
  margin-top: 9px;
  font-size: 0.85rem;
  font-weight: 650;
}

.empty-text {
  margin-top: 3px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.50);
}

/* ============================================================
   DIALOG
============================================================ */

.dialog-card {
  overflow: hidden;
  border-radius: 14px !important;
}

.dialog-header {
  min-height: 64px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialog-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-primary), 0.09);
  color: rgb(var(--v-theme-primary));
}

.transfer-icon {
  background: rgba(var(--v-theme-primary), 0.10);
  color: rgb(var(--v-theme-primary));
}

.dialog-title {
  font-size: 0.92rem;
  font-weight: 700;
}

.dialog-subtitle {
  margin-top: 2px;
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.50);
}

.dialog-subtitle strong {
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.separator {
  margin: 0 3px;
}

/* ============================================================
   CAMPOS
============================================================ */

.field-label {
  margin-bottom: 5px;
  font-size: 0.73rem;
  font-weight: 600;
}

.amount-label {
  margin-top: 14px;
}

.destination-label {
  margin-top: 14px;
}

.observation-label {
  margin-top: 14px;
}

.optional {
  margin-left: 4px;
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.42);
}

.amount-input :deep(input) {
  font-size: 0.95rem;
  font-weight: 650;
}

/* ============================================================
   SELECT DE CUENTAS
============================================================ */

.select-account-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.selected-account {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 550;
}

/* ============================================================
   SALDO DISPONIBLE
============================================================ */

.available-balance {
  margin-top: 7px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.045);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.available-balance span {
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.available-balance strong {
  font-size: 0.72rem;
  color: rgb(var(--v-theme-primary));
}

/* ============================================================
   RESUMEN TRANSFERENCIA
============================================================ */

.transfer-summary {
  margin-top: 12px;
  padding: 10px 11px;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 9px;
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.69rem;
}

.summary-row span {
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.summary-row strong {
  font-size: 0.7rem;
}

.summary-expense {
  color: rgb(var(--v-theme-error));
}

.summary-income {
  color: rgb(var(--v-theme-success));
}

.summary-arrow {
  height: 18px;
  display: flex;
  align-items: center;
  color: rgba(var(--v-theme-on-surface), 0.35);
}

/* ============================================================
   MOVIMIENTOS
============================================================ */

.movements-list {
  padding: 2px 16px;
}

.movement-item {
  min-height: 62px;
  padding: 9px 0;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
}

.movement-item:last-child {
  border-bottom: none;
}

.movement-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.movement-income {
  background: rgba(var(--v-theme-success), 0.10);
  color: rgb(var(--v-theme-success));
}

.movement-expense {
  background: rgba(var(--v-theme-error), 0.10);
  color: rgb(var(--v-theme-error));
}

.movement-info {
  min-width: 0;
  flex: 1;
}

.movement-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.movement-concept {
  font-size: 0.75rem;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movement-amount {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 700;
}

.amount-income {
  color: rgb(var(--v-theme-success));
}

.amount-expense {
  color: rgb(var(--v-theme-error));
}

.movement-meta {
  margin-top: 2px;
  font-size: 0.63rem;
  color: rgba(var(--v-theme-on-surface), 0.46);
}

.movement-observation {
  margin-top: 3px;
  font-size: 0.64rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movement-balance {
  min-width: 100px;
  text-align: right;
}

.movement-balance span {
  display: block;
  font-size: 0.59rem;
  color: rgba(var(--v-theme-on-surface), 0.43);
}

.movement-balance strong {
  font-size: 0.68rem;
  font-weight: 600;
}

.loading-movements {
  min-height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.50);
}

.empty-movements {
  padding: 48px 20px;
  text-align: center;
}

/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1200px) {
  .accounts-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .accounts-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .cuentas-page {
    padding: 14px !important;
  }

  .page-title {
    font-size: 1.15rem;
  }

  .page-subtitle {
    font-size: 0.7rem;
  }

  .page-header {
    align-items: flex-start !important;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .movement-balance {
    display: none;
  }

  .movement-top {
    align-items: flex-start;
  }

  .movement-amount {
    font-size: 0.7rem;
  }
}
</style>