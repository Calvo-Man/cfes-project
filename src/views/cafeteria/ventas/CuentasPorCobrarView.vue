<template>
  <div class="cuentas-page pa-4 pa-md-5">

    <!-- HEADER -->
    <div class="page-header d-flex align-center justify-space-between">
      <div class="d-flex align-center ga-3">
        <div class="page-icon">
          <v-icon size="21">mdi-account-cash-outline</v-icon>
        </div>

        <div>
          <h1 class="page-title">Cuentas por cobrar</h1>
          <p class="page-subtitle">
            Control y seguimiento de créditos pendientes
          </p>
        </div>
      </div>

      <v-btn
        variant="tonal"
        size="small"
        :loading="loading"
        prepend-icon="mdi-refresh"
        @click="cargarCuentas"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- MÉTRICAS -->
    <v-row class="mb-3" dense>
      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="metric-label">Total por cobrar</div>
                <div class="metric-value">
                  {{ formatCurrency(totalPorCobrar) }}
                </div>
                <div class="metric-foot">
                  Saldo pendiente
                </div>
              </div>

              <div class="metric-icon">
                <v-icon size="18">mdi-cash-clock</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="metric-label">Total abonado</div>
                <div class="metric-value">
                  {{ formatCurrency(totalPagado) }}
                </div>
                <div class="metric-foot">
                  Pagos registrados
                </div>
              </div>

              <div class="metric-icon">
                <v-icon size="18">mdi-cash-check</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="metric-label">Clientes con deuda</div>
                <div class="metric-value">
                  {{ cantidadClientes }}
                </div>
                <div class="metric-foot">
                  Clientes pendientes
                </div>
              </div>

              <div class="metric-icon">
                <v-icon size="18">mdi-account-alert-outline</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="metric-card" elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="metric-label">Créditos pendientes</div>
                <div class="metric-value">
                  {{ cantidadVentasPendientes }}
                </div>
                <div class="metric-foot">
                  Ventas por cobrar
                </div>
              </div>

              <div class="metric-icon">
                <v-icon size="18">mdi-file-clock-outline</v-icon>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- TABLA -->
    <v-card class="main-card" elevation="0">

      <div class="toolbar d-flex align-center justify-space-between flex-wrap">
        <div>
          <div class="section-title">Clientes con saldo pendiente</div>
          <div class="section-subtitle">
            Consulta créditos y registra abonos
          </div>
        </div>

        <v-text-field
          v-model="search"
          class="search-field"
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar cliente, cédula o teléfono..."
          hide-details
          clearable
        />
      </div>

      <v-divider />

      <v-data-table
        :headers="headers"
        :items="cuentasFiltradas"
        :loading="loading"
        class="accounts-table"
        density="compact"
        item-value="clienteId"
        hide-default-footer
        no-data-text="No hay cuentas por cobrar"
      >

        <!-- CLIENTE -->
        <template #item.cliente="{ item }">
          <div class="d-flex align-center ga-2 py-1">
            <v-avatar size="34" color="primary" variant="tonal">
              <span class="avatar-text">
                {{ iniciales(item.nombre, item.apellido) }}
              </span>
            </v-avatar>

            <div class="client-info">
              <div class="client-name">
                {{ item.nombre }} {{ item.apellido }}
              </div>

              <div class="client-phone">
                {{ item.telefono || 'Sin teléfono' }}
              </div>
            </div>
          </div>
        </template>

        <!-- CÉDULA -->
        <template #item.cedula="{ item }">
          <span class="table-muted">
            {{ item.cedula || 'Sin cédula' }}
          </span>
        </template>

        <!-- VENTAS -->
        <template #item.cantidadVentas="{ item }">
          <span class="sales-count">
            {{ item.cantidadVentas }}
          </span>
        </template>

        <!-- TOTAL COMPRAS -->
        <template #item.totalCompras="{ item }">
          <span class="money">
            {{ formatCurrency(item.totalCompras) }}
          </span>
        </template>

        <!-- PAGADO -->
        <template #item.totalPagado="{ item }">
          <span class="money paid">
            {{ formatCurrency(item.totalPagado) }}
          </span>
        </template>

        <!-- PENDIENTE -->
        <template #item.saldoPendiente="{ item }">
          <span class="money pending">
            {{ formatCurrency(item.saldoPendiente) }}
          </span>
        </template>

        <!-- ACCIONES -->
        <template #item.acciones="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-tooltip text="Ver detalle">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  @click="abrirDetalle(item.clienteId)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- EMPTY -->
        <template #no-data>
          <div class="empty-state">
            <v-icon size="34" color="grey">mdi-account-search-outline</v-icon>
            <div class="empty-title">
              {{ search ? 'No se encontraron clientes' : 'No hay cuentas pendientes' }}
            </div>
            <div class="empty-text">
              {{ search
                ? 'Prueba con otro nombre, cédula o teléfono.'
                : 'Actualmente no existen créditos pendientes de pago.'
              }}
            </div>
          </div>
        </template>

      </v-data-table>
    </v-card>

    <!-- ====================================================== -->
    <!-- DETALLE CLIENTE -->
    <!-- ====================================================== -->

    <v-dialog
      v-model="showDetalleDialog"
      max-width="850"
      scrollable
    >
      <v-card class="dialog-card">

        <div class="dialog-header d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="40">
              <v-icon>mdi-account-cash-outline</v-icon>
            </v-avatar>

            <div>
              <div class="dialog-title">
                {{ clienteDetalle?.cliente?.nombre }}
                {{ clienteDetalle?.cliente?.apellido }}
              </div>

              <div class="dialog-subtitle">
                {{ clienteDetalle?.cliente?.cedula || 'Sin cédula' }}
                <span v-if="clienteDetalle?.cliente?.telefono">
                  · {{ clienteDetalle.cliente.telefono }}
                </span>
              </div>
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showDetalleDialog = false"
          />
        </div>

        <v-divider />

        <v-card-text class="pa-4">

          <v-progress-linear
            v-if="loadingDetalle"
            indeterminate
            color="primary"
            class="mb-4"
          />

          <template v-if="clienteDetalle && !loadingDetalle">

            <!-- RESUMEN -->
            <div class="detail-summary mb-4">

              <div class="detail-stat">
                <span>Total créditos</span>
                <strong>
                  {{ formatCurrency(clienteDetalle.totalCompras) }}
                </strong>
              </div>

              <div class="detail-stat">
                <span>Total pagado</span>
                <strong class="paid">
                  {{ formatCurrency(clienteDetalle.totalPagado) }}
                </strong>
              </div>

              <div class="detail-stat">
                <span>Saldo pendiente</span>
                <strong class="pending">
                  {{ formatCurrency(clienteDetalle.saldoPendiente) }}
                </strong>
              </div>

            </div>

            <!-- VENTAS -->
            <div class="subsection-title">
              Créditos del cliente
            </div>

            <div class="sales-list">

              <div
                v-for="venta in clienteDetalle.ventas"
                :key="venta.id"
                class="sale-card"
              >

                <div class="sale-header d-flex align-center justify-space-between">

                  <div>
                    <div class="sale-number">
                      Venta #{{ venta.numeroVenta }}
                    </div>

                    <div class="sale-date">
                      {{ formatDate(venta.createdAt) }}
                    </div>
                  </div>

                  <v-chip
                    :color="getEstadoColor(venta.estadoPago)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ getEstadoText(venta.estadoPago) }}
                  </v-chip>

                </div>

                <v-divider />

                <div class="sale-amounts">

                  <div>
                    <span>Total</span>
                    <strong>
                      {{ formatCurrency(venta.total) }}
                    </strong>
                  </div>

                  <div>
                    <span>Pagado</span>
                    <strong class="paid">
                      {{ formatCurrency(venta.totalPagado) }}
                    </strong>
                  </div>

                  <div>
                    <span>Pendiente</span>
                    <strong class="pending">
                      {{ formatCurrency(venta.saldoPendiente) }}
                    </strong>
                  </div>

                </div>

                <!-- HISTORIAL -->
                <div
                  v-if="venta.pagos?.length"
                  class="history-section"
                >
                  <div class="history-title">
                    Historial de pagos
                  </div>

                  <div
                    v-for="pago in venta.pagos"
                    :key="pago.id"
                    class="payment-row"
                  >
                    <div>
                      <div class="payment-method">
                        {{ formatMetodoPago(pago.metodoPago) }}
                      </div>

                      <div class="payment-date">
                        {{ formatDate(pago.createdAt) }}

                        <span v-if="pago.observacion">
                          · {{ pago.observacion }}
                        </span>
                      </div>
                    </div>

                    <strong class="paid">
                      {{ formatCurrency(pago.monto) }}
                    </strong>
                  </div>
                </div>

                <!-- ACCIÓN -->
                <div
                  v-if="Number(venta.saldoPendiente) > 0"
                  class="sale-actions"
                >
                  <v-btn
                    color="primary"
                    size="small"
                    variant="tonal"
                    prepend-icon="mdi-cash-plus"
                    @click="abrirPago(venta)"
                  >
                    Registrar abono
                  </v-btn>
                </div>

              </div>

            </div>

          </template>

        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-2">
          <v-spacer />

          <v-btn
            variant="text"
            size="small"
            @click="showDetalleDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- ====================================================== -->
    <!-- REGISTRAR PAGO -->
    <!-- ====================================================== -->

    <v-dialog
      v-model="showPagoDialog"
      max-width="480"
      persistent
    >
      <v-card class="dialog-card">

        <div class="dialog-header d-flex align-center justify-space-between">

          <div>
            <div class="dialog-title">
              Registrar abono
            </div>

            <div class="dialog-subtitle">
              Venta #{{ selectedVenta?.numeroVenta }}
            </div>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="savingPago"
            @click="showPagoDialog = false"
          />

        </div>

        <v-divider />

        <v-card-text>

          <!-- SALDO -->
          <div class="payment-highlight mb-4">

            <div>
              <span>Saldo pendiente</span>
              <strong>
                {{ formatCurrency(selectedVenta?.saldoPendiente || 0) }}
              </strong>
            </div>

            <v-btn
              size="x-small"
              variant="tonal"
              color="primary"
              @click="pagarSaldoCompleto"
            >
              Pagar todo
            </v-btn>

          </div>

          <!-- MONTO -->
          <div class="field-label">
            Monto del abono
          </div>

          <v-text-field
            v-model.number="pagoForm.monto"
            type="number"
            min="0"
            step="100"
            prefix="$"
            placeholder="0"
            variant="outlined"
            density="compact"
            hide-details="auto"
            class="mb-4"
          />

          <!-- MÉTODO -->
          <div class="field-label">
            Método de pago
          </div>

          <v-select
            v-model="pagoForm.metodoPago"
            :items="metodosPago"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          >
            <template #selection="{ item }">
              <div class="d-flex align-center ga-2">
                <v-icon size="18">
                  {{ item.raw.icon }}
                </v-icon>

                <span>{{ item.title }}</span>
              </div>
            </template>

            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon>
                    {{ item.raw.icon }}
                  </v-icon>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- OBSERVACIÓN -->
          <div class="field-label">
            Observación
          </div>

          <v-textarea
            v-model="pagoForm.observacion"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            placeholder="Opcional"
            hide-details
          />

        </v-card-text>

        <v-divider />

        <v-card-actions class="px-4 py-3">

          <v-btn
            variant="text"
            size="small"
            :disabled="savingPago"
            @click="showPagoDialog = false"
          >
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn
            color="primary"
            size="small"
            variant="flat"
            :loading="savingPago"
            prepend-icon="mdi-cash-check"
            @click="registrarPago"
          >
            Registrar abono
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="bottom right"
      timeout="3000"
    >
      {{ snackbarMessage }}

      <template #actions>
        <v-btn
          variant="text"
          size="small"
          @click="snackbar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios'

/* ============================================================
   ESTADO
============================================================ */

const cuentas = ref([])
const clienteDetalle = ref(null)

const loading = ref(false)
const loadingDetalle = ref(false)
const savingPago = ref(false)

const showDetalleDialog = ref(false)
const showPagoDialog = ref(false)

const selectedVenta = ref(null)

const search = ref('')

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

const pagoForm = ref({
  monto: null,
  metodoPago: 'EFECTIVO',
  observacion: '',
})

/* ============================================================
   TABLA
============================================================ */

const headers = [
  {
    title: 'Cliente',
    key: 'cliente',
    sortable: true,
  },
  {
    title: 'Cédula',
    key: 'cedula',
    sortable: true,
  },
  {
    title: 'Créditos',
    key: 'cantidadVentas',
    align: 'center',
    sortable: true,
  },
  {
    title: 'Compras',
    key: 'totalCompras',
    align: 'end',
    sortable: true,
  },
  {
    title: 'Pagado',
    key: 'totalPagado',
    align: 'end',
    sortable: true,
  },
  {
    title: 'Pendiente',
    key: 'saldoPendiente',
    align: 'end',
    sortable: true,
  },
  {
    title: '',
    key: 'acciones',
    align: 'end',
    sortable: false,
  },
]

/* ============================================================
   MÉTODOS DE PAGO
============================================================ */

const metodosPago = [
  {
    title: 'Efectivo',
    value: 'EFECTIVO',
    icon: 'mdi-cash',
  },
  {
    title: 'Transferencia',
    value: 'TRANSFERENCIA',
    icon: 'mdi-bank-transfer',
  },
  {
    title: 'Nequi',
    value: 'NEQUI',
    icon: 'mdi-cellphone',
  },
  {
    title: 'Daviplata',
    value: 'DAVIPLATA',
    icon: 'mdi-wallet-outline',
  },
  {
    title: 'Tarjeta',
    value: 'TARJETA',
    icon: 'mdi-credit-card-outline',
  },
]

/* ============================================================
   COMPUTED
============================================================ */

const cuentasFiltradas = computed(() => {
  const texto = search.value.trim().toLowerCase()

  if (!texto) {
    return cuentas.value
  }

  return cuentas.value.filter((item) => {
    const nombre = `${item.nombre || ''} ${item.apellido || ''}`.toLowerCase()
    const cedula = String(item.cedula || '').toLowerCase()
    const telefono = String(item.telefono || '').toLowerCase()

    return (
      nombre.includes(texto) ||
      cedula.includes(texto) ||
      telefono.includes(texto)
    )
  })
})

const totalPorCobrar = computed(() => {
  return cuentas.value.reduce(
    (total, item) => total + Number(item.saldoPendiente || 0),
    0
  )
})

const totalPagado = computed(() => {
  return cuentas.value.reduce(
    (total, item) => total + Number(item.totalPagado || 0),
    0
  )
})

const cantidadClientes = computed(() => {
  return cuentas.value.length
})

const cantidadVentasPendientes = computed(() => {
  return cuentas.value.reduce(
    (total, item) => total + Number(item.cantidadVentas || 0),
    0
  )
})

/* ============================================================
   CARGAR CUENTAS
============================================================ */

async function cargarCuentas() {
  loading.value = true

  try {
    const response = await api.get('/cafeteria/pagos-credito/cuentas')

    cuentas.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    console.error('Error cargando cuentas por cobrar:', error)

    mostrarSnackbar(
      error?.response?.data?.message ||
      'No se pudieron cargar las cuentas por cobrar.',
      'error'
    )
  } finally {
    loading.value = false
  }
}

/* ============================================================
   DETALLE CLIENTE
============================================================ */

async function abrirDetalle(clienteId) {
  showDetalleDialog.value = true
  loadingDetalle.value = true
  clienteDetalle.value = null

  try {
    const response = await api.get(
      `/cafeteria/pagos-credito/cliente/${clienteId}`
    )

    clienteDetalle.value = response.data
  } catch (error) {
    console.error('Error cargando detalle:', error)

    mostrarSnackbar(
      error?.response?.data?.message ||
      'No se pudo cargar el detalle del cliente.',
      'error'
    )

    showDetalleDialog.value = false
  } finally {
    loadingDetalle.value = false
  }
}

/* ============================================================
   ABRIR PAGO
============================================================ */

function abrirPago(venta) {
  selectedVenta.value = venta

  pagoForm.value = {
    monto: null,
    metodoPago: 'EFECTIVO',
    observacion: '',
  }

  showPagoDialog.value = true
}

/* ============================================================
   PAGAR SALDO COMPLETO
============================================================ */

function pagarSaldoCompleto() {
  if (!selectedVenta.value) return

  pagoForm.value.monto = Number(
    selectedVenta.value.saldoPendiente || 0
  )
}

/* ============================================================
   REGISTRAR PAGO
============================================================ */

async function registrarPago() {
  if (!selectedVenta.value) return

  const monto = Number(pagoForm.value.monto)
  const saldoPendiente = Number(
    selectedVenta.value.saldoPendiente || 0
  )

  if (!Number.isFinite(monto) || monto <= 0) {
    mostrarSnackbar(
      'El monto del abono debe ser mayor que cero.',
      'error'
    )
    return
  }

  if (monto > saldoPendiente) {
    mostrarSnackbar(
      'El abono no puede superar el saldo pendiente.',
      'error'
    )
    return
  }

  savingPago.value = true

  try {
    await api.post(
      `/cafeteria/pagos-credito/${selectedVenta.value.id}`,
      {
        monto,
        metodoPago: pagoForm.value.metodoPago,
        observacion:
          pagoForm.value.observacion.trim() || undefined,
      }
    )

    mostrarSnackbar(
      'Abono registrado correctamente.',
      'success'
    )

    showPagoDialog.value = false

    await cargarCuentas()

    if (clienteDetalle.value?.cliente?.id) {
      await abrirDetalle(clienteDetalle.value.cliente.id)
    }
  } catch (error) {
    console.error('Error registrando pago:', error)

    mostrarSnackbar(
      error?.response?.data?.message ||
      'No se pudo registrar el abono.',
      'error'
    )
  } finally {
    savingPago.value = false
  }
}

/* ============================================================
   UTILIDADES
============================================================ */

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeZone: 'America/Bogota',
  }).format(new Date(value))
}

function iniciales(nombre, apellido) {
  const inicial1 = nombre?.charAt(0)?.toUpperCase() || ''
  const inicial2 = apellido?.charAt(0)?.toUpperCase() || ''

  return `${inicial1}${inicial2}`
}

function formatMetodoPago(metodo) {
  const nombres = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TARJETA: 'Tarjeta',
  }

  return nombres[metodo] || metodo
}

function getEstadoColor(estado) {
  switch (estado) {
    case 'PAGADA':
    case 'PAGADO':
      return 'success'

    case 'PARCIAL':
      return 'warning'

    case 'PENDIENTE':
      return 'error'

    default:
      return 'grey'
  }
}

function getEstadoText(estado) {
  switch (estado) {
    case 'PAGADA':
    case 'PAGADO':
      return 'Pagada'

    case 'PARCIAL':
      return 'Parcial'

    case 'PENDIENTE':
      return 'Pendiente'

    default:
      return estado || 'Sin estado'
  }
}

function mostrarSnackbar(message, color = 'success') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

/* ============================================================
   INIT
============================================================ */

onMounted(() => {
  cargarCuentas()
})
</script>

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

/* ============================================================
   MÉTRICAS
============================================================ */

.metric-card {
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 13px;
  background: rgb(var(--v-theme-surface));
  transition: border-color 0.18s ease, transform 0.18s ease;
}

.metric-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.22);
  transform: translateY(-1px);
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
  margin-top: 10px;
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

/* ============================================================
   CARD PRINCIPAL
============================================================ */

.main-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 13px;
  background: rgb(var(--v-theme-surface));
}

.toolbar {
  gap: 14px;
  padding: 13px 16px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.2;
}

.section-subtitle {
  margin-top: 2px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.search-field {
  width: 100%;
  max-width: 300px;
}

/* ============================================================
   TABLA
============================================================ */

.accounts-table :deep(.v-data-table__th) {
  height: 38px !important;
  padding: 8px 12px !important;
  font-size: 0.68rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.accounts-table :deep(.v-data-table__td) {
  padding: 7px 12px !important;
  font-size: 0.78rem;
}

.accounts-table :deep(.v-data-table__tr) {
  height: 54px;
}

.accounts-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.025);
}

.accounts-table :deep(.v-avatar) {
  width: 34px !important;
  height: 34px !important;
}

.avatar-text {
  font-size: 0.7rem;
  font-weight: 700;
}

.client-name {
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
}

.client-phone {
  margin-top: 2px;
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.table-muted {
  font-size: 0.74rem;
  color: rgba(var(--v-theme-on-surface), 0.60);
}

.sales-count {
  display: inline-flex;
  min-width: 24px;
  justify-content: center;
  font-weight: 600;
}

.money {
  font-size: 0.76rem;
  font-weight: 600;
}

.paid {
  color: rgb(var(--v-theme-success));
}

.pending {
  color: rgb(var(--v-theme-error));
}

/* ============================================================
   EMPTY
============================================================ */

.empty-state {
  padding: 42px 20px;
  text-align: center;
}

.empty-title {
  margin-top: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}

.empty-text {
  margin-top: 3px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.50);
}

/* ============================================================
   DIALOGS
============================================================ */

.dialog-card {
  overflow: hidden;
  border-radius: 14px !important;
}

.dialog-header {
  padding: 15px 18px;
}

.dialog-title {
  font-size: 0.95rem;
  font-weight: 700;
}

.dialog-subtitle {
  margin-top: 2px;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

/* ============================================================
   DETALLE
============================================================ */

.detail-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 11px;
  background: rgba(var(--v-theme-primary), 0.025);
}

.detail-stat {
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-stat + .detail-stat {
  border-left: 1px solid rgba(var(--v-border-color), 0.10);
}

.detail-stat span {
  font-size: 0.67rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.detail-stat strong {
  font-size: 0.95rem;
  font-weight: 700;
}

.subsection-title {
  margin-bottom: 9px;
  font-size: 0.78rem;
  font-weight: 650;
}

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sale-card {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.10);
  border-radius: 11px;
}

.sale-header {
  padding: 11px 14px;
}

.sale-number {
  font-size: 0.78rem;
  font-weight: 650;
}

.sale-date {
  margin-top: 2px;
  font-size: 0.65rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.sale-amounts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 11px 14px;
}

.sale-amounts > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sale-amounts span {
  font-size: 0.64rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.sale-amounts strong {
  font-size: 0.78rem;
}

.history-section {
  margin: 0 14px;
  padding: 10px 0;
  border-top: 1px solid rgba(var(--v-border-color), 0.10);
}

.history-title {
  margin-bottom: 7px;
  font-size: 0.68rem;
  font-weight: 650;
  color: rgba(var(--v-theme-on-surface), 0.65);
}

.payment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
}

.payment-method {
  font-size: 0.7rem;
  font-weight: 600;
}

.payment-date {
  margin-top: 2px;
  font-size: 0.62rem;
  color: rgba(var(--v-theme-on-surface), 0.46);
}

.payment-row strong {
  font-size: 0.72rem;
  white-space: nowrap;
}

.sale-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 14px 12px;
}

/* ============================================================
   PAGO
============================================================ */

.payment-highlight {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 11px;
  background: rgba(var(--v-theme-primary), 0.07);
  border: 1px solid rgba(var(--v-theme-primary), 0.10);
}

.payment-highlight > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.payment-highlight span {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.52);
}

.payment-highlight strong {
  font-size: 1.05rem;
  color: rgb(var(--v-theme-error));
}

.dialog-card :deep(.v-card-text) {
  padding: 18px !important;
}

.field-label {
  margin-bottom: 5px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 700px) {
  .cuentas-page {
    padding: 14px !important;
  }

  .page-title {
    font-size: 1.15rem;
  }

  .page-subtitle {
    font-size: 0.7rem;
  }

  .toolbar {
    align-items: stretch !important;
  }

  .search-field {
    max-width: none;
  }

  .detail-summary {
    grid-template-columns: 1fr;
  }

  .detail-stat + .detail-stat {
    border-left: none;
    border-top: 1px solid rgba(var(--v-border-color), 0.10);
  }

  .sale-amounts {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .sale-amounts > div {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>