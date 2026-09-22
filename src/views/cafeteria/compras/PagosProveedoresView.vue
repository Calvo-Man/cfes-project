<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/plugins/axios'

/* =========================
   ESTADO
========================= */

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

/* =========================
   OPCIONES
========================= */

const estados = [
  { title: 'Todos', value: 'TODOS' },
  { title: 'Pendientes', value: 'PENDIENTE' },
  { title: 'Parciales', value: 'PARCIAL' },
  { title: 'Pagadas', value: 'PAGADO' },
]

const metodosPago = [
  { title: 'Efectivo', value: 'EFECTIVO' },
  { title: 'Transferencia', value: 'TRANSFERENCIA' },
  { title: 'Nequi', value: 'NEQUI' },
  { title: 'Daviplata', value: 'DAVIPLATA' },
  { title: 'Otro', value: 'OTRO' },
]

/* =========================
   COMPUTED
========================= */

const comprasFiltradas = computed(() => {
  let resultado = [...compras.value]

  if (filtroEstado.value !== 'TODOS') {
    resultado = resultado.filter(
      (compra) => compra.estadoPago === filtroEstado.value,
    )
  }

  if (search.value.trim()) {
    const texto = search.value.toLowerCase().trim()

    resultado = resultado.filter((compra) => {
      const numero = compra.numeroCompra?.toLowerCase() || ''
      const proveedor = compra.proveedor?.nombre?.toLowerCase() || ''

      return (
        numero.includes(texto) ||
        proveedor.includes(texto)
      )
    })
  }

  return resultado
})

const totalPorPagar = computed(() => {
  return compras.value.reduce((total, compra) => {
    if (compra.estado === 'ANULADA') return total

    const totalCompra = Number(compra.total || 0)
    const pagado = Number(compra.montoPagado || 0)

    return total + Math.max(0, totalCompra - pagado)
  }, 0)
})

const totalPagado = computed(() => {
  return compras.value.reduce((total, compra) => {
    return total + Number(compra.montoPagado || 0)
  }, 0)
})

const cantidadPendientes = computed(() => {
  return compras.value.filter(
    (compra) =>
      compra.estado !== 'ANULADA' &&
      Number(compra.total || 0) >
      Number(compra.montoPagado || 0),
  ).length
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

const getPendiente = (compra) => {
  return Math.max(
    0,
    Number(compra.total || 0) -
    Number(compra.montoPagado || 0),
  )
}

const getEstadoColor = (estado) => {
  switch (estado) {
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

const getEstadoText = (estado) => {
  switch (estado) {
    case 'PAGADO':
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

const showMessage = (message, color = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

/* =========================
   CARGAR COMPRAS
========================= */

const cargarCompras = async () => {
  loading.value = true

  try {
    const response = await api.get('/compras')

    compras.value = response.data
  } catch (error) {
    console.error(error)

    showMessage(
      error.response?.data?.message ||
      'No fue posible cargar las compras',
      'error',
    )
  } finally {
    loading.value = false
  }
}

/* =========================
   VER DETALLE
========================= */

const verDetalle = async (compra) => {
  selectedCompra.value = compra
  showDetalleDialog.value = true

  await cargarPagos(compra.id)
}

const cargarPagos = async (compraId) => {
  loadingPagos.value = true

  try {
    const response = await api.get(
      `/compras/${compraId}/pagos`,
    )

    pagos.value = response.data
  } catch (error) {
    console.error(error)

    showMessage(
      error.response?.data?.message ||
      'No fue posible cargar los pagos',
      'error',
    )
  } finally {
    loadingPagos.value = false
  }
}

/* =========================
   REGISTRAR PAGO
========================= */

const abrirPago = (compra) => {
  selectedCompra.value = compra

  pagoForm.value = {
    monto: getPendiente(compra),
    metodoPago: 'EFECTIVO',
    observacion: '',
  }

  showPagoDialog.value = true
}

const cerrarPago = () => {
  if (savingPago.value) return

  showPagoDialog.value = false

  pagoForm.value = {
    monto: null,
    metodoPago: 'EFECTIVO',
    observacion: '',
  }
}

const registrarPago = async () => {
  if (!selectedCompra.value) return

  const monto = Number(pagoForm.value.monto || 0)
  const pendiente = getPendiente(selectedCompra.value)

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
      `/compras/${selectedCompra.value.id}/pagos`,
      {
        monto,
        metodoPago: pagoForm.value.metodoPago,
        observacion:
          pagoForm.value.observacion || undefined,
      },
    )

    showMessage('Pago registrado correctamente')

    cerrarPago()

    await cargarCompras()

    if (selectedCompra.value) {
      const compraActualizada = compras.value.find(
        (compra) =>
          compra.id === selectedCompra.value.id,
      )

      if (compraActualizada) {
        selectedCompra.value = compraActualizada
        await cargarPagos(compraActualizada.id)
      }
    }
  } catch (error) {
    console.error(error)

    showMessage(
      error.response?.data?.message ||
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
  cargarCompras()
})
</script>

<template>
  <v-container fluid class="pa-6">

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center justify-space-between mb-6">
      <div>
        <div class="text-h4 font-weight-bold">
          Pagos a proveedores
        </div>

        <div class="text-body-2 text-medium-emphasis mt-1">
          Administra las cuentas pendientes y los abonos de tus proveedores.
        </div>
      </div>

      <v-btn icon="mdi-refresh" variant="tonal" :loading="loading" @click="cargarCompras" />
    </div>

    <!-- RESUMEN -->
    <v-row class="mb-4">

      <v-col cols="12" sm="6" md="4">
        <v-card rounded="xl" elevation="0" border class="summary-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="error" variant="tonal" size="48">
                <v-icon>
                  mdi-cash-minus
                </v-icon>
              </v-avatar>

              <div class="ml-4">
                <div class="text-body-2 text-medium-emphasis">
                  Por pagar
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ formatCurrency(totalPorPagar) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card rounded="xl" elevation="0" border class="summary-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="success" variant="tonal" size="48">
                <v-icon>
                  mdi-cash-check
                </v-icon>
              </v-avatar>

              <div class="ml-4">
                <div class="text-body-2 text-medium-emphasis">
                  Total pagado
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
        <v-card rounded="xl" elevation="0" border class="summary-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="warning" variant="tonal" size="48">
                <v-icon>
                  mdi-file-document-alert
                </v-icon>
              </v-avatar>

              <div class="ml-4">
                <div class="text-body-2 text-medium-emphasis">
                  Cuentas pendientes
                </div>

                <div class="text-h5 font-weight-bold">
                  {{ cantidadPendientes }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

    <!-- FILTROS -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-text>
        <v-row align="center">

          <v-col cols="12" md="5">
            <v-text-field v-model="search" label="Buscar compra o proveedor" placeholder="COMP-000001"
              prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>

          <v-col cols="12" md="4">
            <v-select v-model="filtroEstado" :items="estados" label="Estado del pago" variant="outlined"
              density="comfortable" hide-details />
          </v-col>

          <v-col cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis">
              {{ comprasFiltradas.length }}
              compra(s) encontrada(s)
            </div>
          </v-col>

        </v-row>
      </v-card-text>
    </v-card>

    <!-- TABLA -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex align-center pa-5">
        <v-icon class="mr-2">
          mdi-credit-card-clock
        </v-icon>

        Cuentas de proveedores
      </v-card-title>

      <v-divider />

      <v-data-table :headers="[
        {
          title: 'Compra',
          key: 'numeroCompra',
        },
        {
          title: 'Proveedor',
          key: 'proveedor',
        },
        {
          title: 'Fecha',
          key: 'fechaCompra',
        },
        {
          title: 'Total',
          key: 'total',
          align: 'end',
        },
        {
          title: 'Pagado',
          key: 'montoPagado',
          align: 'end',
        },
        {
          title: 'Pendiente',
          key: 'pendiente',
          align: 'end',
        },
        {
          title: 'Estado',
          key: 'estadoPago',
          align: 'center',
        },
        {
          title: 'Acciones',
          key: 'actions',
          sortable: false,
          align: 'end',
        },
      ]" :items="comprasFiltradas" :loading="loading" item-value="id" hover>

        <!-- COMPRA -->
        <template #item.numeroCompra="{ item }">
          <div class="font-weight-bold">
            {{ item.numeroCompra }}
          </div>
        </template>

        <!-- PROVEEDOR -->
        <template #item.proveedor="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ item.proveedor?.nombre || 'Sin proveedor' }}
            </div>

            <div v-if="item.proveedor?.telefono" class="text-caption text-medium-emphasis">
              {{ item.proveedor.telefono }}
            </div>
          </div>
        </template>

        <!-- FECHA -->
        <template #item.fechaCompra="{ item }">
          {{ formatDate(item.fechaCompra) }}
        </template>

        <!-- TOTAL -->
        <template #item.total="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.total) }}
          </span>
        </template>

        <!-- PAGADO -->
        <template #item.montoPagado="{ item }">
          <span class="text-success font-weight-medium">
            {{ formatCurrency(item.montoPagado) }}
          </span>
        </template>

        <!-- PENDIENTE -->
        <template #item.pendiente="{ item }">
          <span :class="getPendiente(item) > 0
              ? 'text-error font-weight-bold'
              : 'text-success font-weight-bold'
            ">
            {{ formatCurrency(getPendiente(item)) }}
          </span>
        </template>

        <!-- ESTADO -->
        <template #item.estadoPago="{ item }">
          <v-chip :color="getEstadoColor(item.estadoPago)" size="small" variant="tonal">
            {{ getEstadoText(item.estadoPago) }}
          </v-chip>
        </template>

        <!-- ACCIONES -->
        <template #item.actions="{ item }">

          <div class="d-flex justify-end ga-1">

            <v-btn size="small" variant="text" @click="verDetalle(item)">
              <v-icon>
                mdi-eye
              </v-icon>

              <v-tooltip activator="parent">
                Ver pagos
              </v-tooltip>
            </v-btn>

            <v-btn v-if="
              item.estado !== 'ANULADA' &&
              getPendiente(item) > 0
            " size="small" color="primary" variant="tonal" @click="abrirPago(item)">
              <v-icon>
                mdi-cash-plus
              </v-icon>

              <v-tooltip activator="parent">
                Registrar pago
              </v-tooltip>
            </v-btn>

          </div>

        </template>

        <!-- SIN DATOS -->
        <template #no-data>
          <div class="pa-10 text-center">
            <v-icon size="52" color="grey" class="mb-3">
              mdi-cash-remove
            </v-icon>

            <div class="text-h6">
              No hay cuentas para mostrar
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              No se encontraron compras con los filtros actuales.
            </div>
          </div>
        </template>

      </v-data-table>
    </v-card>

    <!-- =========================
         DIALOG DETALLE
    ========================== -->

    <v-dialog v-model="showDetalleDialog" max-width="800">
      <v-card rounded="xl">

        <v-card-title class="pa-5">
          <div>
            <div class="text-h5 font-weight-bold">
              {{ selectedCompra?.numeroCompra }}
            </div>

            <div class="text-body-2 text-medium-emphasis">
              {{ selectedCompra?.proveedor?.nombre }}
            </div>
          </div>

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="showDetalleDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">

          <!-- RESUMEN -->
          <v-row>

            <v-col cols="12" sm="4">
              <div class="text-caption text-medium-emphasis">
                Total
              </div>

              <div class="text-h6 font-weight-bold">
                {{ formatCurrency(selectedCompra?.total) }}
              </div>
            </v-col>

            <v-col cols="12" sm="4">
              <div class="text-caption text-medium-emphasis">
                Pagado
              </div>

              <div class="text-h6 font-weight-bold text-success">
                {{ formatCurrency(selectedCompra?.montoPagado) }}
              </div>
            </v-col>

            <v-col cols="12" sm="4">
              <div class="text-caption text-medium-emphasis">
                Pendiente
              </div>

              <div class="text-h6 font-weight-bold text-error">
                {{ formatCurrency(
                  selectedCompra
                    ? getPendiente(selectedCompra)
                    : 0
                ) }}
              </div>
            </v-col>

          </v-row>

          <v-divider class="my-5" />

          <div class="d-flex align-center justify-space-between mb-4">

            <div class="text-h6 font-weight-bold">
              Historial de pagos
            </div>

            <v-btn v-if="
              selectedCompra &&
              selectedCompra.estado !== 'ANULADA' &&
              getPendiente(selectedCompra) > 0
            " color="primary" prepend-icon="mdi-cash-plus" @click="abrirPago(selectedCompra)">
              Registrar abono
            </v-btn>

          </div>

          <!-- LOADING -->
          <div v-if="loadingPagos" class="d-flex justify-center pa-8">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <!-- PAGOS -->
          <v-list v-else-if="pagos.length" lines="two" class="pa-0">

            <v-list-item v-for="pago in pagos" :key="pago.id" class="payment-item mb-2">

              <template #prepend>
                <v-avatar color="success" variant="tonal">
                  <v-icon>
                    mdi-cash-check
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-title>
                <span class="font-weight-bold">
                  {{ formatCurrency(pago.monto) }}
                </span>

                <v-chip size="x-small" variant="tonal" class="ml-2">
                  {{ pago.metodoPago }}
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ formatDate(pago.createdAt) }}

                <span v-if="pago.observacion">
                  · {{ pago.observacion }}
                </span>
              </v-list-item-subtitle>

              <template #append>
                <div v-if="pago.creadoPor" class="text-caption text-medium-emphasis">
                  {{ pago.creadoPor.nombre }}
                </div>
              </template>

            </v-list-item>

          </v-list>

          <!-- SIN PAGOS -->
          <div v-else class="text-center pa-8">
            <v-icon size="48" color="grey" class="mb-2">
              mdi-cash-clock
            </v-icon>

            <div class="text-body-1">
              Esta compra todavía no tiene pagos.
            </div>
          </div>

        </v-card-text>

      </v-card>
    </v-dialog>

    <!-- =========================
         DIALOG REGISTRAR PAGO
    ========================== -->

    <v-dialog v-model="showPagoDialog" max-width="500" persistent>
      <v-card rounded="xl">

        <v-card-title class="pa-5">
          Registrar pago
        </v-card-title>

        <v-card-text>

          <div v-if="selectedCompra" class="payment-summary mb-5">
            <div class="text-body-2 text-medium-emphasis">
              {{ selectedCompra.numeroCompra }}
            </div>

            <div class="font-weight-bold">
              {{ selectedCompra.proveedor?.nombre }}
            </div>

            <div class="d-flex justify-space-between mt-3">
              <span>
                Pendiente
              </span>

              <strong class="text-error">
                {{ formatCurrency(
                  getPendiente(selectedCompra)
                ) }}
              </strong>
            </div>
          </div>

          <v-text-field v-model.number="pagoForm.monto" type="number" label="Monto del pago" prefix="$"
            variant="outlined" min="0" />

          <v-select v-model="pagoForm.metodoPago" :items="metodosPago" label="Método de pago" variant="outlined" />

          <v-textarea v-model="pagoForm.observacion" label="Observación" placeholder="Ej: Abono proveedor"
            variant="outlined" rows="3" auto-grow />

        </v-card-text>

        <v-card-actions class="pa-5">

          <v-spacer />

          <v-btn variant="text" :disabled="savingPago" @click="cerrarPago">
            Cancelar
          </v-btn>

          <v-btn color="primary" variant="flat" :loading="savingPago" prepend-icon="mdi-cash-check"
            @click="registrarPago">
            Registrar pago
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =========================
         SNACKBAR
    ========================== -->

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3500">
      {{ snackbarMessage }}

      <template #actions>
        <v-btn variant="text" @click="snackbar = false">
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
