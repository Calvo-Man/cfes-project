
<template>
  <div class="pagos-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <div class="eyebrow">
          <span class="material-icons">account_balance</span>
          CUENTAS POR PAGAR
        </div>

        <h1>Pagos a proveedores</h1>

        <p>
          Controla las compras pendientes y registra los abonos realizados.
        </p>
      </div>

      <div class="header-badge">
        <span class="material-icons">receipt_long</span>
        {{ cantidadPendientes }} pendientes
      </div>
    </div>

    <!-- RESUMEN -->
    <div class="summary-grid">

      <div class="summary-card debt-card">
        <div class="summary-icon">
          <span class="material-icons">payments</span>
        </div>

        <div class="summary-content">
          <span class="summary-label">Por pagar</span>

          <strong>
            {{ formatearMoneda(totalPorPagar) }}
          </strong>

          <small>
            Saldo pendiente
          </small>
        </div>
      </div>

      <div class="summary-card paid-card">
        <div class="summary-icon">
          <span class="material-icons">check_circle</span>
        </div>

        <div class="summary-content">
          <span class="summary-label">Total pagado</span>

          <strong>
            {{ formatearMoneda(totalPagado) }}
          </strong>

          <small>
            Pagos registrados
          </small>
        </div>
      </div>

      <div class="summary-card pending-card">
        <div class="summary-icon">
          <span class="material-icons">pending_actions</span>
        </div>

        <div class="summary-content">
          <span class="summary-label">Cuentas pendientes</span>

          <strong>
            {{ cantidadPendientes }}
          </strong>

          <small>
            Compras con saldo
          </small>
        </div>
      </div>

    </div>

    <!-- CONTENIDO -->
    <div class="content-card">

      <!-- TOOLBAR -->
      <div class="toolbar">

        <div class="toolbar-title">
          <div class="toolbar-icon">
            <span class="material-icons">account_balance_wallet</span>
          </div>

          <div>
            <h2>Compras pendientes</h2>
            <span>
              {{ comprasFiltradas.length }} registros encontrados
            </span>
          </div>
        </div>

        <div class="filters">

          <div class="search-box">
            <span class="material-icons">search</span>

            <input
              v-model="search"
              type="text"
              placeholder="Buscar compra o proveedor..."
            />

            <button
              v-if="search"
              class="clear-search"
              @click="search = ''"
            >
              <span class="material-icons">close</span>
            </button>
          </div>

          <select v-model="filtroEstado" class="filter-select">
            <option
              v-for="estado in estados"
              :key="estado.value"
              :value="estado.value"
            >
              {{ estado.title }}
            </option>
          </select>

          <button
            class="refresh-button"
            :disabled="loading"
            @click="cargarCompras"
          >
            <span
              class="material-icons"
              :class="{ spinning: loading }"
            >
              refresh
            </span>
          </button>

        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="loading-state">
        <div class="loader"></div>
        <span>Cargando cuentas por pagar...</span>
      </div>

      <!-- EMPTY -->
      <div
        v-else-if="comprasFiltradas.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          <span class="material-icons">
            account_balance_wallet
          </span>
        </div>

        <h3>No hay cuentas pendientes</h3>

        <p>
          No existen compras con saldo pendiente que coincidan
          con los filtros actuales.
        </p>
      </div>

      <!-- TABLE -->
      <div v-else class="table-wrapper">

        <table class="payments-table">

          <thead>
            <tr>
              <th>COMPRA</th>
              <th>PROVEEDOR</th>
              <th>FECHA</th>
              <th>TOTAL</th>
              <th>PAGADO</th>
              <th>PENDIENTE</th>
              <th>ESTADO</th>
              <th class="actions-header">ACCIONES</th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="compra in comprasFiltradas"
              :key="compra.id"
            >

              <!-- COMPRA -->
              <td>
                <div class="purchase-cell">
                  <div class="purchase-icon">
                    <span class="material-icons">
                      receipt
                    </span>
                  </div>

                  <div>
                    <strong>
                      {{ compra.numeroCompra || `COMP-${compra.id}` }}
                    </strong>

                    <span>
                      {{ compra.numeroFactura || 'Sin factura' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- PROVEEDOR -->
              <td>
                <div class="provider-cell">
                  <div class="provider-avatar">
                    {{ inicialProveedor(compra) }}
                  </div>

                  <span>
                    {{ nombreProveedor(compra) }}
                  </span>
                </div>
              </td>

              <!-- FECHA -->
              <td>
                <span class="date-cell">
                  {{ formatearFecha(compra.createdAt || compra.fecha) }}
                </span>
              </td>

              <!-- TOTAL -->
              <td>
                <strong class="amount">
                  {{ formatearMoneda(compra.total) }}
                </strong>
              </td>

              <!-- PAGADO -->
              <td>
                <span class="paid-amount">
                  {{ formatearMoneda(compra.montoPagado) }}
                </span>
              </td>

              <!-- PENDIENTE -->
              <td>
                <strong class="pending-amount">
                  {{ formatearMoneda(saldoPendiente(compra)) }}
                </strong>
              </td>

              <!-- ESTADO -->
              <td>
                <span
                  class="status-badge"
                  :class="estadoClass(compra.estadoPago)"
                >
                  <span class="status-dot"></span>
                  {{ textoEstado(compra.estadoPago) }}
                </span>
              </td>

              <!-- ACCIONES -->
              <td>
                <div class="row-actions">

                  <button
                    class="action-button detail"
                    title="Ver pagos"
                    @click="verDetalle(compra)"
                  >
                    <span class="material-icons">
                      visibility
                    </span>
                  </button>

                  <button
                    class="pay-button"
                    @click="abrirPago(compra)"
                  >
                    <span class="material-icons">
                      payments
                    </span>

                    Registrar abono
                  </button>

                </div>
              </td>

            </tr>

          </tbody>
        </table>

      </div>
    </div>

    <!-- ===================================================== -->
    <!-- DETALLE DE PAGOS -->
    <!-- ===================================================== -->

    <div
      v-if="showDetalleDialog"
      class="modal-overlay"
      @click.self="showDetalleDialog = false"
    >

      <div class="modal detail-modal">

        <div class="modal-header">

          <div>
            <span class="modal-eyebrow">
              HISTORIAL DE PAGOS
            </span>

            <h2>
              {{ selectedCompra?.numeroCompra || `COMP-${selectedCompra?.id}` }}
            </h2>

            <p>
              {{ nombreProveedor(selectedCompra) }}
            </p>
          </div>

          <button
            class="modal-close"
            @click="showDetalleDialog = false"
          >
            <span class="material-icons">close</span>
          </button>

        </div>

        <!-- RESUMEN DETALLE -->
        <div class="detail-summary">

          <div>
            <span>Total compra</span>
            <strong>
              {{ formatearMoneda(selectedCompra?.total) }}
            </strong>
          </div>

          <div>
            <span>Pagado</span>
            <strong class="green">
              {{ formatearMoneda(selectedCompra?.montoPagado) }}
            </strong>
          </div>

          <div>
            <span>Pendiente</span>
            <strong class="red">
              {{ formatearMoneda(
                saldoPendiente(selectedCompra)
              ) }}
            </strong>
          </div>

        </div>

        <div class="history-section">

          <div class="section-title">
            <span class="material-icons">history</span>
            <span>Movimientos</span>
          </div>

          <div
            v-if="loadingPagos"
            class="history-loading"
          >
            <div class="small-loader"></div>
            Cargando historial...
          </div>

          <div
            v-else-if="pagos.length === 0"
            class="history-empty"
          >
            <span class="material-icons">history_toggle_off</span>
            <span>No hay pagos registrados.</span>
          </div>

          <div v-else class="payment-history">

            <div
              v-for="pago in pagos"
              :key="pago.id"
              class="history-item"
            >

              <div class="history-icon">
                <span class="material-icons">
                  {{ iconoMetodoPago(pago.metodoPago) }}
                </span>
              </div>

              <div class="history-info">

                <strong>
                  {{ textoMetodoPago(pago.metodoPago) }}
                </strong>

                <span>
                  {{ formatearFechaHora(
                    pago.createdAt || pago.fecha
                  ) }}
                </span>

                <small v-if="pago.observacion">
                  {{ pago.observacion }}
                </small>

              </div>

              <strong class="history-amount">
                + {{ formatearMoneda(pago.monto) }}
              </strong>

            </div>

          </div>

        </div>

        <div class="modal-footer">

          <button
            class="secondary-button"
            @click="showDetalleDialog = false"
          >
            Cerrar
          </button>

          <button
            v-if="
              selectedCompra &&
              saldoPendiente(selectedCompra) > 0
            "
            class="primary-button"
            @click="abrirPagoDesdeDetalle"
          >
            <span class="material-icons">payments</span>
            Registrar abono
          </button>

        </div>

      </div>

    </div>

    <!-- ===================================================== -->
    <!-- MODAL REGISTRAR PAGO -->
    <!-- ===================================================== -->

    <div
      v-if="showPagoDialog"
      class="modal-overlay"
      @click.self="cerrarPago"
    >

      <div class="modal payment-modal">

        <div class="modal-header">

          <div>
            <span class="modal-eyebrow">
              NUEVO MOVIMIENTO
            </span>

            <h2>Registrar abono</h2>

            <p>
              {{ selectedCompra?.numeroCompra }}
              ·
              {{ nombreProveedor(selectedCompra) }}
            </p>
          </div>

          <button
            class="modal-close"
            @click="cerrarPago"
          >
            <span class="material-icons">close</span>
          </button>

        </div>

        <!-- SALDO -->
        <div class="balance-card">

          <div class="balance-icon">
            <span class="material-icons">
              account_balance
            </span>
          </div>

          <div>
            <span>Saldo pendiente</span>

            <strong>
              {{ formatearMoneda(
                saldoPendiente(selectedCompra)
              ) }}
            </strong>
          </div>

        </div>

        <!-- FORM -->
        <div class="form-grid">

          <!-- MONTO -->
          <div class="form-group full">

            <label>Monto del abono</label>

            <div class="amount-input">

              <span>$</span>

              <input
                v-model.number="pagoForm.monto"
                type="number"
                min="1"
                :max="saldoPendiente(selectedCompra)"
                step="100"
                placeholder="0"
              />

            </div>

            <small>
              Máximo permitido:
              {{ formatearMoneda(
                saldoPendiente(selectedCompra)
              ) }}
            </small>

          </div>

          <!-- METODO -->
          <div class="form-group full">

            <label>Cuenta / método de pago</label>

            <div class="payment-methods">

              <button
                v-for="metodo in metodosPago"
                :key="metodo.value"
                type="button"
                class="method-card"
                :class="{
                  selected:
                    pagoForm.metodoPago === metodo.value
                }"
                @click="
                  pagoForm.metodoPago = metodo.value
                "
              >

                <span class="material-icons">
                  {{ iconoMetodoPago(metodo.value) }}
                </span>

                <span>
                  {{ metodo.title }}
                </span>

                <span
                  v-if="
                    pagoForm.metodoPago === metodo.value
                  "
                  class="selected-check"
                >
                  <span class="material-icons">
                    check
                  </span>
                </span>

              </button>

            </div>

          </div>

          <!-- OBSERVACION -->
          <div class="form-group full">

            <label>Observación</label>

            <textarea
              v-model="pagoForm.observacion"
              rows="3"
              placeholder="Ej: Abono correspondiente a factura..."
            ></textarea>

          </div>

        </div>

        <!-- INFO CUENTA -->
        <div class="account-info">

          <span class="material-icons">
            account_balance_wallet
          </span>

          <div>
            <strong>
              Movimiento financiero automático
            </strong>

            <p>
              El pago se registrará como ingreso en la
              cuenta asociada al método seleccionado.
            </p>
          </div>

        </div>

        <!-- FOOTER -->
        <div class="modal-footer">

          <button
            class="secondary-button"
            :disabled="savingPago"
            @click="cerrarPago"
          >
            Cancelar
          </button>

          <button
            class="primary-button"
            :disabled="savingPago"
            @click="registrarPago"
          >

            <span
              v-if="savingPago"
              class="button-loader"
            ></span>

            <span
              v-else
              class="material-icons"
            >
              payments
            </span>

            {{ savingPago
              ? 'Registrando...'
              : 'Registrar abono'
            }}

          </button>

        </div>

      </div>

    </div>

    <!-- SNACKBAR -->
    <Transition name="snackbar">

      <div
        v-if="snackbar"
        class="snackbar"
        :class="`snackbar-${snackbarColor}`"
      >

        <span class="material-icons">
          {{
            snackbarColor === 'success'
              ? 'check_circle'
              : 'error'
          }}
        </span>

        <span>{{ snackbarMessage }}</span>

        <button @click="snackbar = false">
          <span class="material-icons">close</span>
        </button>

      </div>

    </Transition>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/plugins/axios'

/* =========================================================
   STATE
========================================================= */

const compras = ref([])
const pagos = ref([])

const loading = ref(false)
const loadingPagos = ref(false)
const savingPago = ref(false)

const selectedCompra = ref(null)

const showPagoDialog = ref(false)
const showDetalleDialog = ref(false)

const search = ref('')
const filtroEstado = ref('TODOS')

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const pagoForm = ref({
  monto: null,
  metodoPago: 'EFECTIVO',
  observacion: '',
})

/* =========================================================
   FILTROS
========================================================= */

const estados = [
  {
    title: 'Todas pendientes',
    value: 'TODOS',
  },
  {
    title: 'Pendientes',
    value: 'PENDIENTE',
  },
  {
    title: 'Parciales',
    value: 'PARCIAL',
  },
]

const metodosPago = [
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

/* =========================================================
   COMPUTED
========================================================= */

const comprasFiltradas = computed(() => {
  let resultado = compras.value.filter((compra) => {
    if (compra.estado === 'ANULADA') {
      return false
    }

    const total = Number(compra.total || 0)
    const pagado = Number(compra.montoPagado || 0)

    // Esta vista solo trabaja con cuentas que todavía tienen saldo.
    return total > pagado
  })

  if (filtroEstado.value !== 'TODOS') {
    resultado = resultado.filter(
      (compra) =>
        compra.estadoPago === filtroEstado.value,
    )
  }

  if (search.value.trim()) {
    const termino = search.value
      .toLowerCase()
      .trim()

    resultado = resultado.filter((compra) => {
      const numeroCompra =
        String(compra.numeroCompra || '').toLowerCase()

      const numeroFactura =
        String(compra.numeroFactura || '').toLowerCase()

      const proveedor =
        nombreProveedor(compra).toLowerCase()

      return (
        numeroCompra.includes(termino) ||
        numeroFactura.includes(termino) ||
        proveedor.includes(termino)
      )
    })
  }

  return resultado
})

const totalPorPagar = computed(() => {
  return compras.value.reduce((total, compra) => {
    if (compra.estado === 'ANULADA') {
      return total
    }

    const pendiente =
      Number(compra.total || 0) -
      Number(compra.montoPagado || 0)

    return total + Math.max(pendiente, 0)
  }, 0)
})

const totalPagado = computed(() => {
  return compras.value.reduce((total, compra) => {
    if (compra.estado === 'ANULADA') {
      return total
    }

    return total + Number(compra.montoPagado || 0)
  }, 0)
})

const cantidadPendientes = computed(() => {
  return compras.value.filter((compra) => {
    if (compra.estado === 'ANULADA') {
      return false
    }

    return (
      Number(compra.total || 0) >
      Number(compra.montoPagado || 0)
    )
  }).length
})

/* =========================================================
   API
========================================================= */

async function cargarCompras() {
  loading.value = true

  try {
    const response = await api.get('/compras')

    compras.value = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []
  } catch (error) {
    mostrarSnackbar(
      error.response?.data?.message ||
        'No se pudieron cargar las compras.',
      'error',
    )
  } finally {
    loading.value = false
  }
}

async function cargarPagos(compraId) {
  loadingPagos.value = true

  try {
    const response = await api.get(
      `/compras/${compraId}/pagos`,
    )

    pagos.value = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []
  } catch (error) {
    pagos.value = []

    mostrarSnackbar(
      error.response?.data?.message ||
        'No se pudo cargar el historial de pagos.',
      'error',
    )
  } finally {
    loadingPagos.value = false
  }
}

/* =========================================================
   DETALLE
========================================================= */

async function verDetalle(compra) {
  selectedCompra.value = compra
  pagos.value = []

  showDetalleDialog.value = true

  await cargarPagos(compra.id)
}

function abrirPagoDesdeDetalle() {
  showDetalleDialog.value = false

  abrirPago(selectedCompra.value)
}

/* =========================================================
   REGISTRAR PAGO
========================================================= */

function abrirPago(compra) {
  selectedCompra.value = compra

  pagoForm.value = {
    monto: saldoPendiente(compra),
    metodoPago: 'EFECTIVO',
    observacion: '',
  }

  showPagoDialog.value = true
}

function cerrarPago() {
  if (savingPago.value) {
    return
  }

  showPagoDialog.value = false

  pagoForm.value = {
    monto: null,
    metodoPago: 'EFECTIVO',
    observacion: '',
  }
}

async function registrarPago() {
  if (!selectedCompra.value) {
    return
  }

  const monto = Number(pagoForm.value.monto)
  const pendiente = saldoPendiente(
    selectedCompra.value,
  )

  if (!Number.isFinite(monto) || monto <= 0) {
    mostrarSnackbar(
      'El monto del abono debe ser mayor que cero.',
      'error',
    )
    return
  }

  if (monto > pendiente) {
    mostrarSnackbar(
      'El abono no puede superar el saldo pendiente.',
      'error',
    )
    return
  }

  if (!pagoForm.value.metodoPago) {
    mostrarSnackbar(
      'Selecciona el método de pago.',
      'error',
    )
    return
  }

  savingPago.value = true

  try {
    await api.post(
      `/compras/${selectedCompra.value.id}/pagos`,
      {
        monto,
        metodoPago: pagoForm.value.metodoPago,
        observacion:
          pagoForm.value.observacion?.trim() || undefined,
      },
    )

    mostrarSnackbar(
      'Abono registrado correctamente.',
      'success',
    )

    const compraId = selectedCompra.value.id

    cerrarPago()

    await cargarCompras()

    const compraActualizada =
      compras.value.find(
        (compra) => compra.id === compraId,
      )

    if (compraActualizada) {
      selectedCompra.value = compraActualizada
    }

  } catch (error) {
    mostrarSnackbar(
      error.response?.data?.message ||
        'No se pudo registrar el abono.',
      'error',
    )
  } finally {
    savingPago.value = false
  }
}

/* =========================================================
   HELPERS
========================================================= */

function saldoPendiente(compra) {
  if (!compra) {
    return 0
  }

  const total = Number(compra.total || 0)
  const pagado = Number(compra.montoPagado || 0)

  return Math.max(total - pagado, 0)
}

function nombreProveedor(compra) {
  if (!compra) {
    return 'Sin proveedor'
  }

  if (typeof compra.proveedor === 'string') {
    return compra.proveedor
  }

  return (
    compra.proveedor?.nombre ||
    compra.proveedor?.razonSocial ||
    compra.proveedor?.nombreCompleto ||
    'Sin proveedor'
  )
}

function inicialProveedor(compra) {
  const nombre = nombreProveedor(compra)

  if (!nombre || nombre === 'Sin proveedor') {
    return '?'
  }

  return nombre
    .trim()
    .charAt(0)
    .toUpperCase()
}

function textoEstado(estado) {
  const estados = {
    PENDIENTE: 'Pendiente',
    PARCIAL: 'Parcial',
    PAGADO: 'Pagado',
  }

  return estados[estado] || estado || 'Sin estado'
}

function estadoClass(estado) {
  return {
    PENDIENTE: 'status-pending',
    PARCIAL: 'status-partial',
    PAGADO: 'status-paid',
  }[estado] || ''
}

function textoMetodoPago(metodo) {
  const metodos = {
    EFECTIVO: 'Efectivo',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
  }

  return metodos[metodo] || metodo || 'Desconocido'
}

function iconoMetodoPago(metodo) {
  const iconos = {
    EFECTIVO: 'payments',
    NEQUI: 'phone_android',
    DAVIPLATA: 'account_balance_wallet',
    TRANSFERENCIA: 'account_balance',
    TARJETA: 'credit_card',
  }

  return iconos[metodo] || 'payments'
}

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor || 0))
}

function formatearFecha(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha'
  }

  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatearFechaHora(fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha'
  }

  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function mostrarSnackbar(message, color = 'success') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true

  setTimeout(() => {
    snackbar.value = false
  }, 3500)
}

/* =========================================================
   INIT
========================================================= */

onMounted(() => {
  cargarCompras()
})
</script>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.pagos-page {
  min-height: 100%;
  padding: 28px;
  background: #f6f7f9;
  color: #18212f;
}

/* =========================================================
   HEADER
========================================================= */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #667085;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  margin-bottom: 7px;
}

.eyebrow .material-icons {
  font-size: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.page-header p {
  margin: 7px 0 0;
  color: #667085;
  font-size: 14px;
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid #e4e7ec;
  border-radius: 10px;
  background: white;
  color: #475467;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
}

.header-badge .material-icons {
  font-size: 18px;
  color: #667085;
}

/* =========================================================
   SUMMARY
========================================================= */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}

.summary-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 122px;
  padding: 20px;
  border: 1px solid #eaecf0;
  border-radius: 14px;
  background: white;
  box-shadow: 0 2px 5px rgba(16, 24, 40, 0.035);
  overflow: hidden;
}

.summary-card::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  right: -30px;
  bottom: -30px;
  border-radius: 50%;
  background: #f9fafb;
}

.summary-icon {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 12px;
}

.debt-card .summary-icon {
  background: #fff4ed;
  color: #d95f0f;
}

.paid-card .summary-icon {
  background: #ecfdf3;
  color: #039855;
}

.pending-card .summary-icon {
  background: #fffaeb;
  color: #dc6803;
}

.summary-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
}

.summary-label {
  color: #667085;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.summary-content strong {
  color: #101828;
  font-size: 23px;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.summary-content small {
  margin-top: 3px;
  color: #98a2b3;
  font-size: 11px;
}

/* =========================================================
   CONTENT
========================================================= */

.content-card {
  border: 1px solid #eaecf0;
  border-radius: 14px;
  background: white;
  box-shadow: 0 2px 5px rgba(16, 24, 40, 0.035);
  overflow: hidden;
}

/* =========================================================
   TOOLBAR
========================================================= */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaecf0;
}

.toolbar-title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: #f2f4f7;
  color: #344054;
}

.toolbar-icon .material-icons {
  font-size: 20px;
}

.toolbar-title h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #101828;
}

.toolbar-title span {
  display: block;
  margin-top: 2px;
  color: #98a2b3;
  font-size: 11px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 9px;
}

.search-box {
  display: flex;
  align-items: center;
  width: 260px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: white;
  transition: 0.2s;
}

.search-box:focus-within {
  border-color: #98a2b3;
  box-shadow: 0 0 0 3px #f2f4f7;
}

.search-box > .material-icons {
  color: #98a2b3;
  font-size: 18px;
}

.search-box input {
  width: 100%;
  height: 100%;
  padding: 0 8px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #101828;
  font-family: inherit;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #98a2b3;
}

.clear-search {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #98a2b3;
}

.clear-search .material-icons {
  font-size: 16px;
}

.filter-select {
  height: 38px;
  min-width: 135px;
  padding: 0 30px 0 11px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  outline: none;
  background: white;
  color: #344054;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
}

.refresh-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: white;
  color: #475467;
  cursor: pointer;
}

.refresh-button:hover:not(:disabled) {
  background: #f9fafb;
}

.refresh-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-button .material-icons {
  font-size: 19px;
}

/* =========================================================
   TABLE
========================================================= */

.table-wrapper {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

.payments-table th {
  height: 43px;
  padding: 0 16px;
  border-bottom: 1px solid #eaecf0;
  background: #fcfcfd;
  color: #667085;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-align: left;
  white-space: nowrap;
}

.payments-table td {
  height: 72px;
  padding: 10px 16px;
  border-bottom: 1px solid #f2f4f7;
  vertical-align: middle;
}

.payments-table tbody tr {
  transition: background 0.15s;
}

.payments-table tbody tr:hover {
  background: #fcfcfd;
}

.actions-header {
  text-align: right !important;
}

/* =========================================================
   PURCHASE
========================================================= */

.purchase-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.purchase-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 8px;
  background: #f2f4f7;
  color: #475467;
}

.purchase-icon .material-icons {
  font-size: 18px;
}

.purchase-cell strong {
  display: block;
  color: #101828;
  font-size: 12px;
  font-weight: 700;
}

.purchase-cell span {
  display: block;
  margin-top: 3px;
  color: #98a2b3;
  font-size: 10px;
}

/* =========================================================
   PROVIDER
========================================================= */

.provider-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.provider-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  border-radius: 50%;
  background: #eef2f6;
  color: #475467;
  font-size: 11px;
  font-weight: 750;
}

.provider-cell span:last-child {
  max-width: 180px;
  overflow: hidden;
  color: #344054;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date-cell {
  color: #667085;
  font-size: 11px;
}

.amount {
  color: #344054;
  font-size: 12px;
}

.paid-amount {
  color: #039855;
  font-size: 12px;
  font-weight: 600;
}

.pending-amount {
  color: #d92d20;
  font-size: 12px;
}

/* =========================================================
   STATUS
========================================================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.status-pending {
  background: #fef3f2;
  color: #b42318;
}

.status-pending .status-dot {
  background: #f04438;
}

.status-partial {
  background: #fffaeb;
  color: #b54708;
}

.status-partial .status-dot {
  background: #f79009;
}

.status-paid {
  background: #ecfdf3;
  color: #027a48;
}

.status-paid .status-dot {
  background: #12b76a;
}

/* =========================================================
   ACTIONS
========================================================= */

.row-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 7px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  background: white;
  color: #667085;
  cursor: pointer;
}

.action-button:hover {
  background: #f9fafb;
  color: #344054;
}

.action-button .material-icons {
  font-size: 18px;
}

.pay-button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 11px;
  border: 1px solid #344054;
  border-radius: 8px;
  background: #344054;
  color: white;
  font-family: inherit;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
  transition: 0.15s;
}

.pay-button:hover {
  background: #182230;
}

.pay-button .material-icons {
  font-size: 16px;
}

/* =========================================================
   EMPTY / LOADING
========================================================= */

.loading-state,
.empty-state {
  min-height: 330px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: #667085;
}

.loader,
.small-loader {
  border: 3px solid #eaecf0;
  border-top-color: #475467;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader {
  width: 28px;
  height: 28px;
}

.small-loader {
  width: 20px;
  height: 20px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 5px;
  border-radius: 14px;
  background: #f2f4f7;
  color: #667085;
}

.empty-icon .material-icons {
  font-size: 27px;
}

.empty-state h3 {
  margin: 0;
  color: #344054;
  font-size: 15px;
}

.empty-state p {
  max-width: 390px;
  margin: 0;
  color: #98a2b3;
  font-size: 12px;
  text-align: center;
  line-height: 1.5;
}

/* =========================================================
   MODAL
========================================================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(16, 24, 40, 0.55);
  backdrop-filter: blur(3px);
}

.modal {
  width: min(100%, 600px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 16px;
  background: white;
  box-shadow:
    0 24px 48px rgba(16, 24, 40, 0.18),
    0 4px 12px rgba(16, 24, 40, 0.08);
  animation: modalIn 0.18s ease-out;
}

.detail-modal {
  width: min(100%, 650px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #eaecf0;
}

.modal-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #98a2b3;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.1em;
}

.modal-header h2 {
  margin: 0;
  color: #101828;
  font-size: 20px;
  font-weight: 750;
}

.modal-header p {
  margin: 4px 0 0;
  color: #667085;
  font-size: 12px;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: #f2f4f7;
  color: #667085;
  cursor: pointer;
}

.modal-close:hover {
  background: #eaecf0;
}

.modal-close .material-icons {
  font-size: 18px;
}

/* =========================================================
   DETAIL
========================================================= */

.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 18px 24px;
  border: 1px solid #eaecf0;
  border-radius: 10px;
  overflow: hidden;
}

.detail-summary > div {
  padding: 13px 15px;
  border-right: 1px solid #eaecf0;
}

.detail-summary > div:last-child {
  border-right: 0;
}

.detail-summary span {
  display: block;
  margin-bottom: 4px;
  color: #98a2b3;
  font-size: 10px;
  font-weight: 600;
}

.detail-summary strong {
  color: #344054;
  font-size: 14px;
}

.detail-summary .green {
  color: #039855;
}

.detail-summary .red {
  color: #d92d20;
}

.history-section {
  padding: 0 24px 18px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 11px;
  color: #344054;
  font-size: 12px;
  font-weight: 700;
}

.section-title .material-icons {
  font-size: 17px;
}

.payment-history {
  border: 1px solid #eaecf0;
  border-radius: 10px;
  overflow: hidden;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 67px;
  padding: 10px 13px;
  border-bottom: 1px solid #f2f4f7;
}

.history-item:last-child {
  border-bottom: 0;
}

.history-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 9px;
  background: #ecfdf3;
  color: #039855;
}

.history-icon .material-icons {
  font-size: 18px;
}

.history-info {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.history-info strong {
  color: #344054;
  font-size: 11px;
}

.history-info span {
  margin-top: 2px;
  color: #98a2b3;
  font-size: 9px;
}

.history-info small {
  margin-top: 3px;
  overflow: hidden;
  color: #667085;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-amount {
  color: #039855;
  font-size: 12px;
}

.history-loading,
.history-empty {
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #98a2b3;
  font-size: 11px;
  border: 1px solid #eaecf0;
  border-radius: 10px;
}

.history-empty .material-icons {
  font-size: 19px;
}

/* =========================================================
   PAYMENT FORM
========================================================= */

.balance-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 24px 20px;
  padding: 15px;
  border: 1px solid #fedf89;
  border-radius: 11px;
  background: #fffcf5;
}

.balance-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 9px;
  background: #fef0c7;
  color: #b54708;
}

.balance-icon .material-icons {
  font-size: 20px;
}

.balance-card span {
  display: block;
  margin-bottom: 2px;
  color: #b54708;
  font-size: 10px;
  font-weight: 600;
}

.balance-card strong {
  color: #7a2e0b;
  font-size: 19px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 17px;
  padding: 0 24px;
}

.form-group {
  min-width: 0;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  color: #344054;
  font-size: 11px;
  font-weight: 650;
}

.form-group small {
  display: block;
  margin-top: 5px;
  color: #98a2b3;
  font-size: 9px;
}

.amount-input {
  display: flex;
  align-items: center;
  height: 45px;
  border: 1px solid #d0d5dd;
  border-radius: 9px;
  background: white;
  overflow: hidden;
}

.amount-input:focus-within {
  border-color: #667085;
  box-shadow: 0 0 0 3px #f2f4f7;
}

.amount-input > span {
  padding-left: 13px;
  color: #667085;
  font-size: 15px;
  font-weight: 650;
}

.amount-input input {
  width: 100%;
  height: 100%;
  padding: 0 13px 0 6px;
  border: 0;
  outline: 0;
  color: #101828;
  font-family: inherit;
  font-size: 16px;
  font-weight: 650;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
}

.method-card {
  position: relative;
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  padding: 7px;
  border: 1px solid #e4e7ec;
  border-radius: 9px;
  background: white;
  color: #667085;
  font-family: inherit;
  font-size: 9px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;
}

.method-card:hover {
  border-color: #98a2b3;
  background: #fcfcfd;
}

.method-card .material-icons {
  font-size: 20px;
}

.method-card.selected {
  border-color: #344054;
  background: #f9fafb;
  color: #101828;
  box-shadow: inset 0 0 0 1px #344054;
}

.selected-check {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #344054;
  color: white !important;
}

.selected-check .material-icons {
  font-size: 10px !important;
}

.form-group textarea {
  width: 100%;
  padding: 10px 11px;
  border: 1px solid #d0d5dd;
  border-radius: 9px;
  outline: none;
  resize: vertical;
  color: #344054;
  font-family: inherit;
  font-size: 11px;
  box-sizing: border-box;
}

.form-group textarea:focus {
  border-color: #667085;
  box-shadow: 0 0 0 3px #f2f4f7;
}

/* =========================================================
   ACCOUNT INFO
========================================================= */

.account-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 18px 24px 0;
  padding: 11px 12px;
  border-radius: 9px;
  background: #f8f9fb;
}

.account-info > .material-icons {
  margin-top: 1px;
  color: #667085;
  font-size: 18px;
}

.account-info strong {
  display: block;
  color: #475467;
  font-size: 10px;
}

.account-info p {
  margin: 2px 0 0;
  color: #98a2b3;
  font-size: 9px;
  line-height: 1.45;
}

/* =========================================================
   FOOTER
========================================================= */

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 18px 24px;
  margin-top: 20px;
  border-top: 1px solid #eaecf0;
}

.secondary-button,
.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.secondary-button {
  border: 1px solid #d0d5dd;
  background: white;
  color: #344054;
}

.secondary-button:hover:not(:disabled) {
  background: #f9fafb;
}

.primary-button {
  border: 1px solid #344054;
  background: #344054;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background: #182230;
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.primary-button .material-icons {
  font-size: 17px;
}

/* =========================================================
   SNACKBAR
========================================================= */

.snackbar {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 9px;
  max-width: 400px;
  padding: 12px 13px;
  border: 1px solid #eaecf0;
  border-radius: 10px;
  background: white;
  color: #344054;
  box-shadow:
    0 12px 24px rgba(16, 24, 40, 0.12),
    0 2px 5px rgba(16, 24, 40, 0.05);
  font-size: 11px;
  font-weight: 550;
}

.snackbar-success > .material-icons {
  color: #12b76a;
}

.snackbar-error > .material-icons {
  color: #f04438;
}

.snackbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #98a2b3;
  cursor: pointer;
}

.snackbar button .material-icons {
  font-size: 16px;
}

/* =========================================================
   ANIMATIONS
========================================================= */

.spinning {
  animation: spin 0.8s linear infinite;
}

.button-loader {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.snackbar-enter-active,
.snackbar-leave-active {
  transition: 0.2s ease;
}

.snackbar-enter-from,
.snackbar-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .summary-card:last-child {
    grid-column: 1 / -1;
  }

  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    width: 100%;
  }

  .search-box {
    flex: 1;
    width: auto;
  }
}

@media (max-width: 700px) {
  .pagos-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 23px;
  }

  .header-badge {
    align-self: stretch;
    justify-content: center;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card:last-child {
    grid-column: auto;
  }

  .toolbar {
    padding: 15px;
  }

  .filters {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .search-box {
    flex: 1 1 100%;
  }

  .filter-select {
    flex: 1;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal {
    width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }

  .detail-summary {
    grid-template-columns: 1fr;
  }

  .detail-summary > div {
    border-right: 0;
    border-bottom: 1px solid #eaecf0;
  }

  .detail-summary > div:last-child {
    border-bottom: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.full {
    grid-column: auto;
  }

  .payment-methods {
    grid-template-columns: repeat(3, 1fr);
  }

  .modal-header,
  .modal-footer {
    padding-left: 18px;
    padding-right: 18px;
  }

  .balance-card,
  .history-section,
  .account-info {
    margin-left: 18px;
    margin-right: 18px;
  }

  .form-grid {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>

