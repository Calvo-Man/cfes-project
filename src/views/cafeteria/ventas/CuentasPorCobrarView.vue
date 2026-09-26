<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/plugins/axios'

/* =========================
   ESTADO
========================= */

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

/* =========================
   OPCIONES
========================= */

const metodosPago = [
  { title: 'Efectivo', value: 'EFECTIVO' },
  { title: 'Transferencia', value: 'TRANSFERENCIA' },
  { title: 'Nequi', value: 'NEQUI' },
  { title: 'Daviplata', value: 'DAVIPLATA' },
  { title: 'Tarjeta', value: 'TARJETA' },
  { title: 'Otro', value: 'OTRO' },
]

/* =========================
   COMPUTED
========================= */

const cuentasFiltradas = computed(() => {
  const texto = search.value.trim().toLowerCase()

  if (!texto) {
    return cuentas.value
  }

  return cuentas.value.filter((cliente) => {
    const nombre =
      `${cliente.nombre} ${cliente.apellido}`.toLowerCase()

    const cedula =
      cliente.cedula?.toLowerCase() || ''

    const telefono =
      cliente.telefono?.toLowerCase() || ''

    return (
      nombre.includes(texto) ||
      cedula.includes(texto) ||
      telefono.includes(texto)
    )
  })
})

const totalPorCobrar = computed(() => {
  return cuentas.value.reduce(
    (total, cliente) =>
      total + Number(cliente.saldoPendiente || 0),
    0,
  )
})

const totalPagado = computed(() => {
  return cuentas.value.reduce(
    (total, cliente) =>
      total + Number(cliente.totalPagado || 0),
    0,
  )
})

const cantidadClientes = computed(() => {
  return cuentas.value.length
})

/* =========================
   FORMATO
========================= */

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const formatDate = (date) => {
  if (!date) return '-'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'PAGADA':
      return 'success'

    case 'PARCIAL':
      return 'warning'

    case 'PENDIENTE':
      return 'error'

    default:
      return 'grey'
  }
}

const getEstadoText = (estado) => {
  switch (estado) {
    case 'PAGADA':
      return 'Pagada'

    case 'PARCIAL':
      return 'Parcial'

    case 'PENDIENTE':
      return 'Pendiente'

    default:
      return estado || '-'
  }
}

/* =========================
   NOTIFICACIONES
========================= */

const showMessage = (
  message,
  color = 'success',
) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

/* =========================
   CARGAR CUENTAS
========================= */

const cargarCuentas = async () => {
  loading.value = true

  try {
    const response = await api.get(
      '/cafeteria/pagos-credito/cuentas',
    )

    cuentas.value = response.data
  } catch (error) {
    console.error(error)

    showMessage(
      error.response?.data?.message ||
        'No fue posible cargar las cuentas por cobrar',
      'error',
    )
  } finally {
    loading.value = false
  }
}

/* =========================
   DETALLE CLIENTE
========================= */

const verDetalle = async (cliente) => {
  showDetalleDialog.value = true

  clienteDetalle.value = null

  await cargarDetalleCliente(cliente.clienteId)
}

const cargarDetalleCliente = async (clienteId) => {
  loadingDetalle.value = true

  try {
    const response = await api.get(
      `/cafeteria/pagos-credito/cliente/${clienteId}`,
    )

    clienteDetalle.value = response.data
  } catch (error) {
    console.error(error)

    showMessage(
      error.response?.data?.message ||
        'No fue posible cargar el detalle del cliente',
      'error',
    )

    showDetalleDialog.value = false
  } finally {
    loadingDetalle.value = false
  }
}

/* =========================
   REGISTRAR PAGO
========================= */

const abrirPago = (venta) => {
  selectedVenta.value = venta

  pagoForm.value = {
    monto: Number(venta.saldoPendiente),
    metodoPago: 'EFECTIVO',
    observacion: '',
  }

  showPagoDialog.value = true
}

const cerrarPago = () => {
  if (savingPago.value) return

  showPagoDialog.value = false

  selectedVenta.value = null

  pagoForm.value = {
    monto: null,
    metodoPago: 'EFECTIVO',
    observacion: '',
  }
}

const registrarPago = async () => {
  if (!selectedVenta.value) return

  const monto = Number(
    pagoForm.value.monto || 0,
  )

  const pendiente = Number(
    selectedVenta.value.saldoPendiente || 0,
  )

  if (monto <= 0) {
    showMessage(
      'El monto debe ser mayor que cero',
      'error',
    )

    return
  }

  if (monto > pendiente) {
    showMessage(
      `El monto no puede superar el saldo pendiente de ${formatCurrency(pendiente)}`,
      'error',
    )

    return
  }

  savingPago.value = true

  try {
    await api.post(
      `/cafeteria/pagos-credito/${selectedVenta.value.id}`,
      {
        monto,
        metodoPago:
          pagoForm.value.metodoPago,
        observacion:
          pagoForm.value.observacion ||
          undefined,
      },
    )

    showMessage(
      'Pago registrado correctamente',
    )

    cerrarPago()
    await cargarCuentas()

    if (clienteDetalle.value) {
      await cargarDetalleCliente(
        clienteDetalle.value.cliente.id,
      )
    }
      showPagoDialog.value = false

  } catch (error) {
    console.error(error)

    const message =
      error.response?.data?.message

    showMessage(
      Array.isArray(message)
        ? message[0]
        : message ||
            'No fue posible registrar el pago',
      'error',
    )
  } finally {
    savingPago.value = false
  }
}

/* =========================
   INICIO
========================= */

onMounted(() => {
  cargarCuentas()
})
</script>

<template>
  <v-container fluid class="pa-6">

    <!-- HEADER -->
    <div
      class="d-flex flex-wrap align-center justify-space-between mb-6"
    >
      <div>
        <div class="text-h4 font-weight-bold">
          Cuentas por cobrar
        </div>

        <div
          class="text-body-2 text-medium-emphasis mt-1"
        >
          Administra las ventas a crédito y los saldos pendientes de tus clientes.
        </div>
      </div>

      <v-btn
        icon="mdi-refresh"
        variant="tonal"
        :loading="loading"
        @click="cargarCuentas"
      />
    </div>

    <!-- RESUMEN -->
    <v-row class="mb-4">

      <v-col cols="12" sm="6" md="4">
        <v-card
          rounded="xl"
          elevation="0"
          border
          class="summary-card"
        >
          <v-card-text>
            <div class="d-flex align-center">

              <v-avatar
                color="error"
                variant="tonal"
                size="48"
              >
                <v-icon>
                  mdi-cash-clock
                </v-icon>
              </v-avatar>

              <div class="ml-4">
                <div
                  class="text-body-2 text-medium-emphasis"
                >
                  Total por cobrar
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(totalPorCobrar) }}
                </div>
              </div>

            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          rounded="xl"
          elevation="0"
          border
          class="summary-card"
        >
          <v-card-text>
            <div class="d-flex align-center">

              <v-avatar
                color="success"
                variant="tonal"
                size="48"
              >
                <v-icon>
                  mdi-cash-check
                </v-icon>
              </v-avatar>

              <div class="ml-4">
                <div
                  class="text-body-2 text-medium-emphasis"
                >
                  Total abonado
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(totalPagado) }}
                </div>
              </div>

            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card
          rounded="xl"
          elevation="0"
          border
          class="summary-card"
        >
          <v-card-text>
            <div class="d-flex align-center">

              <v-avatar
                color="warning"
                variant="tonal"
                size="48"
              >
                <v-icon>
                  mdi-account-alert-outline
                </v-icon>
              </v-avatar>

              <div class="ml-4">
                <div
                  class="text-body-2 text-medium-emphasis"
                >
                  Clientes con deuda
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ cantidadClientes }}
                </div>
              </div>

            </div>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

    <!-- BUSCADOR -->
    <v-card
      rounded="xl"
      elevation="0"
      border
      class="mb-4"
    >
      <v-card-text>

        <v-row align="center">

          <v-col cols="12" md="7">

            <v-text-field
              v-model="search"
              label="Buscar cliente"
              placeholder="Nombre, cédula o teléfono"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
            />

          </v-col>

          <v-col cols="12" md="5">
            <div class="text-body-2 text-medium-emphasis">
              {{ cuentasFiltradas.length }}
              cliente(s) con saldo pendiente
            </div>
          </v-col>

        </v-row>

      </v-card-text>
    </v-card>

    <!-- TABLA -->
    <v-card
      rounded="xl"
      elevation="0"
      border
    >

      <v-card-title class="d-flex align-center pa-5">

        <v-icon class="mr-2">
          mdi-account-cash-outline
        </v-icon>

        Clientes con deuda

      </v-card-title>

      <v-divider />

      <v-data-table
        :headers="[
          {
            title: 'Cliente',
            key: 'nombre',
          },
          {
            title: 'Cédula',
            key: 'cedula',
          },
          {
            title: 'Ventas',
            key: 'cantidadVentas',
            align: 'center',
          },
          {
            title: 'Total compras',
            key: 'totalCompras',
            align: 'end',
          },
          {
            title: 'Pagado',
            key: 'totalPagado',
            align: 'end',
          },
          {
            title: 'Pendiente',
            key: 'saldoPendiente',
            align: 'end',
          },
          {
            title: 'Acciones',
            key: 'actions',
            sortable: false,
            align: 'end',
          },
        ]"
        :items="cuentasFiltradas"
        :loading="loading"
        item-value="clienteId"
        hover
      >

        <!-- CLIENTE -->
        <template #item.nombre="{ item }">

          <div>
            <div class="font-weight-bold">
              {{ item.nombre }}
              {{ item.apellido }}
            </div>

            <div
              v-if="item.telefono"
              class="text-caption text-medium-emphasis"
            >
             Telefono: {{ item.telefono }}
            </div>
          </div>

        </template>

        <!-- CEDULA -->
        <template #item.cedula="{ item }">
          {{ item.cedula }}
        </template>

        <!-- VENTAS -->
        <template #item.cantidadVentas="{ item }">

          <v-chip
            size="small"
            variant="tonal"
          >
            {{ item.cantidadVentas }}
          </v-chip>

        </template>

        <!-- TOTAL -->
        <template #item.totalCompras="{ item }">
          {{ formatCurrency(item.totalCompras) }}
        </template>

        <!-- PAGADO -->
        <template #item.totalPagado="{ item }">

          <span class="text-success font-weight-medium">
            {{ formatCurrency(item.totalPagado) }}
          </span>

        </template>

        <!-- PENDIENTE -->
        <template #item.saldoPendiente="{ item }">

          <span class="text-error font-weight-bold">
            {{ formatCurrency(item.saldoPendiente) }}
          </span>

        </template>

        <!-- ACCIONES -->
        <template #item.actions="{ item }">

          <div class="d-flex justify-end ga-1">

            <v-btn
              size="small"
              variant="text"
              @click="verDetalle(item)"
            >

              <v-icon>
                mdi-eye
              </v-icon>

              <v-tooltip activator="parent">
                Ver cuenta
              </v-tooltip>

            </v-btn>

          </div>

        </template>

        <!-- SIN DATOS -->
        <template #no-data>

          <div class="pa-10 text-center">

            <v-icon
              size="52"
              color="grey"
              class="mb-3"
            >
              mdi-cash-check
            </v-icon>

            <div class="text-h6">
              No hay cuentas por cobrar
            </div>

            <div
              class="text-body-2 text-medium-emphasis mt-1"
            >
              Todos los clientes están al día.
            </div>

          </div>

        </template>

      </v-data-table>

    </v-card>

    <!-- =========================
         DIALOG DETALLE CLIENTE
    ========================== -->

    <v-dialog
      v-model="showDetalleDialog"
      max-width="950"
    >

      <v-card rounded="xl">

        <v-card-title class="pa-5">

          <div v-if="clienteDetalle">

            <div class="text-h5 font-weight-bold">
              {{ clienteDetalle.cliente.nombre }}
              {{ clienteDetalle.cliente.apellido }}
            </div>

            <div
              class="text-body-2 text-medium-emphasis"
            >
              C.C. {{ clienteDetalle.cliente.cedula }}

        
            </div>

          </div>

          <v-spacer />

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showDetalleDialog = false"
          />

        </v-card-title>

        <v-divider />

        <!-- LOADING -->
        <div
          v-if="loadingDetalle"
          class="d-flex justify-center pa-10"
        >
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>

        <v-card-text
          v-else-if="clienteDetalle"
          class="pa-5"
        >

          <!-- RESUMEN CLIENTE -->
          <v-row>

            <v-col cols="12" sm="4">

              <div
                class="text-caption text-medium-emphasis"
              >
                Total compras
              </div>

              <div class="text-h6 font-weight-bold">
                {{ formatCurrency(
                  clienteDetalle.totalCompras
                ) }}
              </div>

            </v-col>

            <v-col cols="12" sm="4">

              <div
                class="text-caption text-medium-emphasis"
              >
                Total pagado
              </div>

              <div
                class="text-h6 font-weight-bold text-success"
              >
                {{ formatCurrency(
                  clienteDetalle.totalPagado
                ) }}
              </div>

            </v-col>

            <v-col cols="12" sm="4">

              <div
                class="text-caption text-medium-emphasis"
              >
                Saldo pendiente
              </div>

              <div
                class="text-h6 font-weight-bold text-error"
              >
                {{ formatCurrency(
                  clienteDetalle.saldoPendiente
                ) }}
              </div>

            </v-col>

          </v-row>

          <v-divider class="my-5" />

          <!-- VENTAS -->
          <div class="text-h6 font-weight-bold mb-4">
            Ventas a crédito
          </div>

          <v-card
            v-for="venta in clienteDetalle.ventas"
            :key="venta.id"
            variant="outlined"
            rounded="lg"
            class="mb-3"
          >

            <v-card-text>

              <div
                class="d-flex flex-wrap align-center justify-space-between"
              >

                <div>

                  <div class="font-weight-bold">
                    {{ venta.numeroVenta }}
                  </div>

                  <div
                    class="text-caption text-medium-emphasis"
                  >
                    {{ formatDate(venta.createdAt) }}
                  </div>

                </div>

                <v-chip
                  :color="
                    getEstadoColor(
                      venta.estadoPago
                    )
                  "
                  size="small"
                  variant="tonal"
                >
                  {{
                    getEstadoText(
                      venta.estadoPago
                    )
                  }}
                </v-chip>

              </div>

              <v-divider class="my-3" />

              <v-row>

                <v-col cols="6" sm="3">

                  <div
                    class="text-caption text-medium-emphasis"
                  >
                    Total
                  </div>

                  <div class="font-weight-bold">
                    {{ formatCurrency(venta.total) }}
                  </div>

                </v-col>

                <v-col cols="6" sm="3">

                  <div
                    class="text-caption text-medium-emphasis"
                  >
                    Pagado
                  </div>

                  <div class="font-weight-bold text-success">
                    {{ formatCurrency(
                      venta.totalPagado
                    ) }}
                  </div>

                </v-col>

                <v-col cols="6" sm="3">

                  <div
                    class="text-caption text-medium-emphasis"
                  >
                    Pendiente
                  </div>

                  <div class="font-weight-bold text-error">
                    {{ formatCurrency(
                      venta.saldoPendiente
                    ) }}
                  </div>

                </v-col>

                <v-col
                  cols="6"
                  sm="3"
                  class="d-flex justify-end align-center"
                >

                  <v-btn
                    v-if="
                      venta.saldoPendiente > 0
                    "
                    color="primary"
                    variant="tonal"
                    size="small"
                    prepend-icon="mdi-cash-plus"
                    @click="abrirPago(venta)"
                  >
                    Registrar pago
                  </v-btn>

                </v-col>

              </v-row>

              <!-- PAGOS -->
              <div
                v-if="venta.pagos?.length"
                class="mt-4"
              >

                <div
                  class="text-body-2 font-weight-medium mb-2"
                >
                  Pagos realizados
                </div>

                <v-list
                  density="compact"
                  class="pa-0"
                >

                  <v-list-item
                    v-for="pago in venta.pagos"
                    :key="pago.id"
                    class="payment-item"
                  >

                    <template #prepend>

                      <v-avatar
                        color="success"
                        variant="tonal"
                        size="36"
                      >
                        <v-icon size="18">
                          mdi-cash-check
                        </v-icon>
                      </v-avatar>

                    </template>

                    <v-list-item-title>

                      <span class="font-weight-bold">
                        {{ formatCurrency(pago.monto) }}
                      </span>

                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="ml-2"
                      >
                        {{ pago.metodoPago }}
                      </v-chip>

                    </v-list-item-title>

                    <v-list-item-subtitle>

                      {{ formatDate(pago.createdAt) }}

                      <span
                        v-if="pago.observacion"
                      >
                        · {{ pago.observacion }}
                      </span>

                    </v-list-item-subtitle>

                  </v-list-item>

                </v-list>

              </div>

            </v-card-text>

          </v-card>

        </v-card-text>

      </v-card>

    </v-dialog>

    <!-- =========================
         DIALOG REGISTRAR PAGO
    ========================== -->

    <v-dialog
      v-model="showPagoDialog"
      max-width="500"
      
    >

      <v-card rounded="xl">

        <v-card-title class="pa-5">
          Registrar pago
        </v-card-title>

        <v-card-text>

          <div
            v-if="selectedVenta"
            class="payment-summary mb-5"
          >

            <div
              class="text-body-2 text-medium-emphasis"
            >
              {{ selectedVenta.numeroVenta }}
            </div>

            <div class="font-weight-bold">
              Venta a crédito
            </div>

            <div
              class="d-flex justify-space-between mt-3"
            >

              <span>
                Pendiente
              </span>

              <strong class="text-error">
                {{ formatCurrency(
                  selectedVenta.saldoPendiente
                ) }}
              </strong>

            </div>

          </div>

          <v-text-field
            v-model.number="pagoForm.monto"
            type="number"
            label="Monto del pago"
            prefix="$"
            variant="outlined"
            min="0"
          />

          <v-select
            v-model="pagoForm.metodoPago"
            :items="metodosPago"
            label="Método de pago"
            variant="outlined"
          />

          <v-textarea
            v-model="pagoForm.observacion"
            label="Observación"
            placeholder="Ej: Abono de deuda"
            variant="outlined"
            rows="3"
            auto-grow
          />

        </v-card-text>

        <v-card-actions class="pa-5">

          <v-spacer />

          <v-btn
            variant="text"
            :disabled="savingPago"
            @click="cerrarPago"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            :loading="savingPago"
            prepend-icon="mdi-cash-check"
            @click="registrarPago"
          >
            Registrar pago
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- SNACKBAR -->

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3500"
    >

      {{ snackbarMessage }}

      <template #actions>

        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Cerrar
        </v-btn>

      </template>

    </v-snackbar>

  </v-container>
</template>

<style scoped>
.summary-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.payment-item {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 14px;
}

.payment-summary {
  padding: 16px;
  border-radius: 14px;
  background: rgba(var(--v-theme-primary), 0.05);
}
</style>