
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import axios from '@/plugins/axios'

/* =========================================================
   ESTADO
========================================================= */

const compras = ref([])
const proveedores = ref([])
const productos = ref([])

const loading = ref(false)
const loadingForm = ref(false)
const loadingDetalle = ref(false)

const search = ref('')
const estadoFiltro = ref('TODOS')
const pagoFiltro = ref('TODOS')

const compraDialog = ref(false)
const detalleDialog = ref(false)
const anularDialog = ref(false)

const compraSeleccionada = ref(null)
const detalleCompra = ref(null)

/* =========================================================
   FORMULARIO COMPRA
========================================================= */

const formulario = ref(formularioInicial())

function formularioInicial() {
  return {
    proveedorId: null,
    numeroFactura: '',
    observaciones: '',
    descuento: 0,

    estadoPago: 'PAGADO',
    metodoPago: 'EFECTIVO',
    montoPagado: 0,

    detalles: [],
  }
}

/* =========================================================
   NUEVO DETALLE
========================================================= */

const nuevoDetalle = ref({
  productoId: null,
  cantidad: 1,
  precioCompra: 0,
})

/* =========================================================
   SNACKBAR
========================================================= */

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

function mostrarMensaje(message, color = 'success') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbar.value = true
}

/* =========================================================
   OPCIONES
========================================================= */

const estadosPago = [
  { title: 'Pagado', value: 'PAGADO' },
  { title: 'Pendiente', value: 'PENDIENTE' },
  { title: 'Parcial', value: 'PARCIAL' },
]

const metodosPago = [
  { title: 'Efectivo', value: 'EFECTIVO' },
  { title: 'Nequi', value: 'NEQUI' },
  { title: 'Daviplata', value: 'DAVIPLATA' },
  { title: 'Transferencia', value: 'TRANSFERENCIA' },
  { title: 'Tarjeta', value: 'TARJETA' },
  { title: 'Crédito / Fiado', value: 'CREDITO' },
]

const estadosCompra = [
  { title: 'Todas', value: 'TODOS' },
  { title: 'Confirmadas', value: 'CONFIRMADA' },
  { title: 'Anuladas', value: 'ANULADA' },
]

/* =========================================================
   COMPUTED
========================================================= */

const proveedoresActivos = computed(() => {
  return proveedores.value.filter((proveedor) => proveedor.activo !== false)
})

const productosActivos = computed(() => {
  return productos.value.filter((producto) => producto.activo !== false)
})

const comprasFiltradas = computed(() => {
  const texto = search.value.trim().toLowerCase()

  return compras.value.filter((compra) => {
    const coincideTexto =
      !texto ||
      String(compra.numeroCompra || '')
        .toLowerCase()
        .includes(texto) ||
      String(compra.numeroFactura || '')
        .toLowerCase()
        .includes(texto) ||
      String(compra.proveedor?.nombre || '')
        .toLowerCase()
        .includes(texto)

    const coincideEstado =
      estadoFiltro.value === 'TODOS' ||
      compra.estado === estadoFiltro.value

    const coincidePago =
      pagoFiltro.value === 'TODOS' ||
      compra.estadoPago === pagoFiltro.value

    return coincideTexto && coincideEstado && coincidePago
  })
})

const totalCompras = computed(() => compras.value.length)

const comprasConfirmadas = computed(() => {
  return compras.value.filter(
    (compra) => compra.estado === 'CONFIRMADA',
  ).length
})

const comprasPendientes = computed(() => {
  return compras.value.filter(
    (compra) =>
      compra.estadoPago === 'PENDIENTE' ||
      compra.estadoPago === 'PARCIAL',
  ).length
})

const totalComprado = computed(() => {
  return compras.value
    .filter((compra) => compra.estado !== 'ANULADA')
    .reduce((total, compra) => {
      return total + Number(compra.total || 0)
    }, 0)
})

const subtotalForm = computed(() => {
  return formulario.value.detalles.reduce((total, detalle) => {
    const cantidad = Number(detalle.cantidad) || 0
    const precio = Number(detalle.precioCompra) || 0

    return total + cantidad * precio
  }, 0)
})

const totalForm = computed(() => {
  const subtotal = subtotalForm.value
  const descuento = Number(formulario.value.descuento) || 0

  return Math.max(0, subtotal - descuento)
})

const saldoPendienteForm = computed(() => {
  const total = totalForm.value
  const pagado = Number(formulario.value.montoPagado) || 0

  return Math.max(0, total - pagado)
})

const productoSeleccionado = computed(() => {
  if (!nuevoDetalle.value.productoId) {
    return null
  }

  return productos.value.find(
    (producto) =>
      producto.id === Number(nuevoDetalle.value.productoId),
  )
})

/* =========================================================
   WATCHERS
========================================================= */

watch(
  () => formulario.value.estadoPago,
  (nuevoEstado) => {
    if (nuevoEstado === 'PENDIENTE') {
      formulario.value.montoPagado = 0
      formulario.value.metodoPago = 'CREDITO'
      return
    }

    if (nuevoEstado === 'PAGADO') {
      if (totalForm.value > 0) {
        formulario.value.montoPagado = totalForm.value
      }

      if (formulario.value.metodoPago === 'CREDITO') {
        formulario.value.metodoPago = 'EFECTIVO'
      }

      return
    }

    if (nuevoEstado === 'PARCIAL') {
      if (
        formulario.value.montoPagado <= 0 ||
        formulario.value.montoPagado >= totalForm.value
      ) {
        formulario.value.montoPagado = 0
      }

      if (formulario.value.metodoPago === 'CREDITO') {
        formulario.value.metodoPago = 'EFECTIVO'
      }
    }
  },
)

watch(
  () => totalForm.value,
  (nuevoTotal) => {
    if (formulario.value.estadoPago === 'PAGADO') {
      formulario.value.montoPagado = nuevoTotal
      return
    }

    if (
      Number(formulario.value.montoPagado) > nuevoTotal
    ) {
      formulario.value.montoPagado = nuevoTotal
    }
  },
)

/*
 * Crédito significa que NO entra dinero todavía.
 * El pago posterior se registra desde la vista de
 * cuentas por pagar.
 */
watch(
  () => formulario.value.metodoPago,
  (nuevoMetodo) => {
    if (nuevoMetodo === 'CREDITO') {
      formulario.value.estadoPago = 'PENDIENTE'
      formulario.value.montoPagado = 0
    }
  },
)

/* =========================================================
   CARGAR INFORMACIÓN
========================================================= */

async function cargarCompras() {
  loading.value = true

  try {
    const response = await axios.get('/compras')
    compras.value = response.data
  } catch (error) {
    console.error(error)

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudieron cargar las compras',
      'error',
    )
  } finally {
    loading.value = false
  }
}

async function cargarProveedores() {
  try {
    const response = await axios.get('/proveedor')
    proveedores.value = response.data
  } catch (error) {
    console.error(error)

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudieron cargar los proveedores',
      'error',
    )
  }
}

async function cargarProductos() {
  try {
    const response = await axios.get('/producto')
    productos.value = response.data
  } catch (error) {
    console.error(error)

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudieron cargar los productos',
      'error',
    )
  }
}

async function cargarTodo() {
  await Promise.all([
    cargarCompras(),
    cargarProveedores(),
    cargarProductos(),
  ])
}

/* =========================================================
   DIALOG NUEVA COMPRA
========================================================= */

function abrirNuevaCompra() {
  formulario.value = formularioInicial()

  nuevoDetalle.value = {
    productoId: null,
    cantidad: 1,
    precioCompra: 0,
  }

  compraDialog.value = true
}

function cerrarCompraDialog() {
  if (loadingForm.value) return

  compraDialog.value = false
  formulario.value = formularioInicial()

  nuevoDetalle.value = {
    productoId: null,
    cantidad: 1,
    precioCompra: 0,
  }
}

/* =========================================================
   PRODUCTOS
========================================================= */

function actualizarPrecioProducto() {
  if (!productoSeleccionado.value) {
    nuevoDetalle.value.precioCompra = 0
    return
  }

  /*
   * Usa el precio de compra registrado en el producto
   * si existe.
   */
  nuevoDetalle.value.precioCompra = Number(
    productoSeleccionado.value.precioCompra ||
      productoSeleccionado.value.costo ||
      0,
  )
}

function agregarDetalle() {
  const productoId = Number(nuevoDetalle.value.productoId)
  const cantidad = Number(nuevoDetalle.value.cantidad)
  const precioCompra = Number(nuevoDetalle.value.precioCompra)

  if (!productoId) {
    mostrarMensaje('Selecciona un producto', 'warning')
    return
  }

  if (cantidad <= 0) {
    mostrarMensaje(
      'La cantidad debe ser mayor que cero',
      'warning',
    )
    return
  }

  if (precioCompra < 0) {
    mostrarMensaje(
      'El precio de compra no puede ser negativo',
      'warning',
    )
    return
  }

  const producto = productos.value.find(
    (item) => item.id === productoId,
  )

  if (!producto) {
    mostrarMensaje('Producto no encontrado', 'error')
    return
  }

  const existente = formulario.value.detalles.find(
    (detalle) =>
      Number(detalle.productoId) === productoId,
  )

  if (existente) {
    existente.cantidad =
      Number(existente.cantidad) + cantidad

    existente.precioCompra = precioCompra

    actualizarSubtotal(existente)
  } else {
    formulario.value.detalles.push({
      productoId,
      producto,
      cantidad,
      precioCompra,
      subtotal: cantidad * precioCompra,
    })
  }

  nuevoDetalle.value = {
    productoId: null,
    cantidad: 1,
    precioCompra: 0,
  }
}

function eliminarDetalle(index) {
  formulario.value.detalles.splice(index, 1)
}

function actualizarSubtotal(detalle) {
  detalle.subtotal =
    (Number(detalle.cantidad) || 0) *
    (Number(detalle.precioCompra) || 0)
}

/* =========================================================
   GUARDAR COMPRA
========================================================= */

async function guardarCompra() {
  const form = formulario.value

  if (!form.proveedorId) {
    mostrarMensaje(
      'Selecciona un proveedor',
      'warning',
    )
    return
  }

  if (!form.estadoPago) {
    mostrarMensaje(
      'Selecciona el estado del pago',
      'warning',
    )
    return
  }

  if (!form.metodoPago) {
    mostrarMensaje(
      'Selecciona el método de pago',
      'warning',
    )
    return
  }

  if (!form.detalles.length) {
    mostrarMensaje(
      'Agrega al menos un producto a la compra',
      'warning',
    )
    return
  }

  const descuento = Number(form.descuento) || 0
  const total = Number(totalForm.value)
  const montoPagado = Number(form.montoPagado) || 0

  if (descuento < 0) {
    mostrarMensaje(
      'El descuento no puede ser negativo',
      'warning',
    )
    return
  }

  if (descuento > subtotalForm.value) {
    mostrarMensaje(
      'El descuento no puede superar el subtotal',
      'warning',
    )
    return
  }

  for (const detalle of form.detalles) {
    if (Number(detalle.cantidad) <= 0) {
      mostrarMensaje(
        'Todas las cantidades deben ser mayores que cero',
        'warning',
      )
      return
    }

    if (Number(detalle.precioCompra) < 0) {
      mostrarMensaje(
        'Los precios de compra no pueden ser negativos',
        'warning',
      )
      return
    }
  }

  /*
   * =======================================================
   * REGLAS DEL PAGO INICIAL
   * =======================================================
   */

  if (
    form.estadoPago === 'PENDIENTE' &&
    form.metodoPago !== 'CREDITO'
  ) {
    form.metodoPago = 'CREDITO'
  }

  if (
    form.estadoPago !== 'PENDIENTE' &&
    form.metodoPago === 'CREDITO'
  ) {
    mostrarMensaje(
      'Una compra con crédito debe quedar pendiente',
      'warning',
    )
    return
  }

  if (montoPagado < 0) {
    mostrarMensaje(
      'El monto pagado no puede ser negativo',
      'warning',
    )
    return
  }

  if (montoPagado > total) {
    mostrarMensaje(
      'El monto pagado no puede superar el total',
      'warning',
    )
    return
  }

  if (
    form.estadoPago === 'PAGADO' &&
    montoPagado !== total
  ) {
    mostrarMensaje(
      'Una compra pagada debe tener el monto total',
      'warning',
    )
    return
  }

  if (
    form.estadoPago === 'PENDIENTE' &&
    montoPagado !== 0
  ) {
    mostrarMensaje(
      'Una compra pendiente no puede tener un pago inicial',
      'warning',
    )
    return
  }

  if (
    form.estadoPago === 'PARCIAL' &&
    (montoPagado <= 0 || montoPagado >= total)
  ) {
    mostrarMensaje(
      'Una compra parcial debe tener un pago inicial menor al total',
      'warning',
    )
    return
  }

  if (total <= 0) {
    mostrarMensaje(
      'El total de la compra debe ser mayor que cero',
      'warning',
    )
    return
  }

  loadingForm.value = true

  try {
    const payload = {
      proveedorId: Number(form.proveedorId),

      estadoPago: form.estadoPago,
      metodoPago: form.metodoPago,
      montoPagado,

      descuento,

      detalles: form.detalles.map((detalle) => ({
        productoId: Number(detalle.productoId),
        cantidad: Number(detalle.cantidad),
        precioCompra: Number(detalle.precioCompra),
      })),
    }

    if (form.numeroFactura?.trim()) {
      payload.numeroFactura =
        form.numeroFactura.trim()
    }

    if (form.observaciones?.trim()) {
      payload.observaciones =
        form.observaciones.trim()
    }

    await axios.post('/compras', payload)

    cerrarCompraDialog()

    mostrarMensaje(
      'Compra registrada correctamente',
      'success',
    )

    await cargarTodo()
  } catch (error) {
    console.error(error)

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo registrar la compra',
      'error',
    )
  } finally {
    loadingForm.value = false
  }
}

/* =========================================================
   DETALLE
========================================================= */

async function abrirDetalle(compra) {
  detalleDialog.value = true
  loadingDetalle.value = true
  detalleCompra.value = null

  try {
    const response = await axios.get(
      `/compras/${compra.id}`,
    )

    detalleCompra.value = response.data
  } catch (error) {
    console.error(error)

    detalleDialog.value = false

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo cargar el detalle de la compra',
      'error',
    )
  } finally {
    loadingDetalle.value = false
  }
}

function cerrarDetalle() {
  if (loadingDetalle.value) return

  detalleDialog.value = false
  detalleCompra.value = null
}

/* =========================================================
   ANULAR COMPRA
========================================================= */

function abrirAnular(compra) {
  compraSeleccionada.value = compra
  anularDialog.value = true
}

function cerrarAnular() {
  if (loadingForm.value) return

  anularDialog.value = false
  compraSeleccionada.value = null
}

async function anularCompra() {
  if (!compraSeleccionada.value) return

  loadingForm.value = true

  try {
    await axios.patch(
      `/compras/${compraSeleccionada.value.id}/anular`,
    )

    cerrarAnular()

    mostrarMensaje(
      'Compra anulada correctamente',
      'success',
    )

    await cargarTodo()
  } catch (error) {
    console.error(error)

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudo anular la compra',
      'error',
    )
  } finally {
    loadingForm.value = false
  }
}

/* =========================================================
   FORMATO
========================================================= */

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)
}

function formatearFecha(fecha) {
  if (!fecha) return '-'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function textoEstadoPago(estado) {
  const estados = {
    PAGADO: 'Pagado',
    PENDIENTE: 'Pendiente',
    PARCIAL: 'Parcial',
  }

  return estados[estado] || estado || '-'
}

function colorEstadoPago(estado) {
  const colores = {
    PAGADO: 'success',
    PARCIAL: 'warning',
    PENDIENTE: 'error',
  }

  return colores[estado] || 'default'
}

function textoMetodoPago(metodo) {
  const metodos = {
    EFECTIVO: 'Efectivo',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
    CREDITO: 'Crédito / Fiado',
  }

  return metodos[metodo] || metodo || '-'
}

function colorEstadoCompra(estado) {
  return estado === 'ANULADA'
    ? 'error'
    : 'success'
}

function textoEstadoCompra(estado) {
  return estado === 'ANULADA'
    ? 'Anulada'
    : 'Confirmada'
}

function inicialProveedor(proveedor) {
  const nombre = proveedor?.nombre || 'P'

  return nombre
    .trim()
    .charAt(0)
    .toUpperCase()
}

function nombreProducto(detalle) {
  return (
    detalle.producto?.nombre ||
    detalle.producto?.nombreProducto ||
    `Producto #${detalle.productoId}`
  )
}

/* =========================================================
   INICIO
========================================================= */

onMounted(() => {
  cargarTodo()
})
</script>

<template>
  <div class="compras-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <div class="page-header">
      <div>
        <div class="breadcrumb">
          CAFETERÍA
          <span>/</span>
          COMPRAS
        </div>

        <h1>Compras</h1>

        <p>
          Control de compras, proveedores e inventario
        </p>
      </div>

      <div class="header-actions">
        <v-btn
          icon="mdi-refresh"
          variant="tonal"
          :loading="loading"
          @click="cargarTodo"
        />

        <v-btn
          color="primary"
          prepend-icon="mdi-cart-plus"
          @click="abrirNuevaCompra"
        >
          Nueva compra
        </v-btn>
      </div>
    </div>

    <!-- =====================================================
         RESUMEN
    ====================================================== -->

    <div class="summary-grid">

      <div class="summary-card">
        <div class="summary-icon blue">
          <v-icon>mdi-cart-outline</v-icon>
        </div>

        <div>
          <span>Total compras</span>
          <strong>{{ totalCompras }}</strong>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon green">
          <v-icon>mdi-check-circle-outline</v-icon>
        </div>

        <div>
          <span>Confirmadas</span>
          <strong>{{ comprasConfirmadas }}</strong>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon orange">
          <v-icon>mdi-clock-outline</v-icon>
        </div>

        <div>
          <span>Pagos pendientes</span>
          <strong>{{ comprasPendientes }}</strong>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon purple">
          <v-icon>mdi-cash-multiple</v-icon>
        </div>

        <div>
          <span>Total comprado</span>
          <strong>{{ formatearMoneda(totalComprado) }}</strong>
        </div>
      </div>

    </div>

    <!-- =====================================================
         TABLA
    ====================================================== -->

    <v-card class="main-card" elevation="0">

      <div class="filters">

        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar compra, factura o proveedor"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />

        <v-select
          v-model="estadoFiltro"
          :items="estadosCompra"
          label="Estado"
          variant="outlined"
          density="comfortable"
          hide-details
        />

        <v-select
          v-model="pagoFiltro"
          :items="[
            { title: 'Todos los pagos', value: 'TODOS' },
            ...estadosPago,
          ]"
          label="Pago"
          variant="outlined"
          density="comfortable"
          hide-details
        />

      </div>

      <v-divider />

      <v-data-table
        :headers="[
          {
            title: 'Compra',
            key: 'numeroCompra',
            sortable: true,
          },
          {
            title: 'Fecha',
            key: 'createdAt',
            sortable: true,
          },
          {
            title: 'Proveedor',
            key: 'proveedor',
            sortable: false,
          },
          {
            title: 'Factura',
            key: 'numeroFactura',
            sortable: false,
          },
          {
            title: 'Total',
            key: 'total',
            sortable: true,
            align: 'end',
          },
          {
            title: 'Pago',
            key: 'estadoPago',
            sortable: false,
          },
          {
            title: 'Estado',
            key: 'estado',
            sortable: false,
          },
          {
            title: 'Acciones',
            key: 'acciones',
            sortable: false,
            align: 'center',
          },
        ]"
        :items="comprasFiltradas"
        :loading="loading"
        item-value="id"
        class="purchases-table"
      >

        <!-- COMPRA -->

        <template #item.numeroCompra="{ item }">
          <div class="purchase-number">
            <strong>
              {{ item.numeroCompra }}
            </strong>

            <span>
              {{ textoMetodoPago(item.metodoPago) }}
            </span>
          </div>
        </template>

        <!-- FECHA -->

        <template #item.createdAt="{ item }">
          <span class="date-text">
            {{ formatearFecha(item.createdAt) }}
          </span>
        </template>

        <!-- PROVEEDOR -->

        <template #item.proveedor="{ item }">
          <div class="provider-cell">

            <v-avatar
              size="36"
              color="primary"
              variant="tonal"
            >
              <span>
                {{ inicialProveedor(item.proveedor) }}
              </span>
            </v-avatar>

            <div>
              <strong>
                {{ item.proveedor?.nombre || 'Sin proveedor' }}
              </strong>

              <span>
                {{ item.proveedor?.telefono || '' }}
              </span>
            </div>

          </div>
        </template>

        <!-- FACTURA -->

        <template #item.numeroFactura="{ item }">
          <span class="invoice-number">
            {{ item.numeroFactura || 'Sin factura' }}
          </span>
        </template>

        <!-- TOTAL -->

        <template #item.total="{ item }">
          <strong class="money-value">
            {{ formatearMoneda(item.total) }}
          </strong>
        </template>

        <!-- PAGO -->

        <template #item.estadoPago="{ item }">
          <div class="payment-cell">

            <v-chip
              :color="colorEstadoPago(item.estadoPago)"
              size="small"
              variant="tonal"
            >
              {{ textoEstadoPago(item.estadoPago) }}
            </v-chip>

            <span>
              {{ textoMetodoPago(item.metodoPago) }}
            </span>

          </div>
        </template>

        <!-- ESTADO -->

        <template #item.estado="{ item }">
          <v-chip
            :color="colorEstadoCompra(item.estado)"
            size="small"
            variant="tonal"
          >
            {{ textoEstadoCompra(item.estado) }}
          </v-chip>
        </template>

        <!-- ACCIONES -->

        <template #item.acciones="{ item }">
          <div class="table-actions">

            <v-tooltip text="Ver detalle">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="abrirDetalle(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip
              v-if="item.estado !== 'ANULADA'"
              text="Anular compra"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-cancel"
                  variant="text"
                  size="small"
                  color="error"
                  @click="abrirAnular(item)"
                />
              </template>
            </v-tooltip>

          </div>
        </template>

        <!-- SIN DATOS -->

        <template #no-data>
          <div class="empty-state">
            <v-icon size="52">
              mdi-cart-outline
            </v-icon>

            <strong>No hay compras</strong>

            <span>
              Las compras registradas aparecerán aquí.
            </span>
          </div>
        </template>

      </v-data-table>

    </v-card>

    <!-- =====================================================
         DIALOG NUEVA COMPRA
    ====================================================== -->

    <v-dialog
      v-model="compraDialog"
      max-width="1100"
      persistent
    >
      <v-card class="purchase-dialog">

        <div class="dialog-header">
          <div>
            <span class="dialog-kicker">
              CAFETERÍA
            </span>

            <h2>Nueva compra</h2>

            <p>
              Registra la compra y su pago inicial.
            </p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="cerrarCompraDialog"
          />
        </div>

        <v-divider />

        <v-card-text>

          <!-- INFORMACIÓN GENERAL -->

          <div class="section-title">
            <div class="section-icon">
              <v-icon>mdi-information-outline</v-icon>
            </div>

            <div>
              <strong>Información general</strong>
              <span>Datos del proveedor y factura</span>
            </div>
          </div>

          <v-row>

            <v-col
              cols="12"
              md="6"
            >
              <v-select
                v-model="formulario.proveedorId"
                :items="proveedoresActivos"
                item-title="nombre"
                item-value="id"
                label="Proveedor *"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="formulario.numeroFactura"
                label="Número de factura"
                placeholder="Opcional"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

          </v-row>

          <!-- PRODUCTOS -->

          <div class="section-title">
            <div class="section-icon">
              <v-icon>mdi-package-variant-closed</v-icon>
            </div>

            <div>
              <strong>Productos</strong>
              <span>Agrega los productos recibidos</span>
            </div>
          </div>

          <div class="add-product-box">

            <v-row align="center">

              <v-col
                cols="12"
                md="5"
              >
                <v-autocomplete
                  v-model="nuevoDetalle.productoId"
                  :items="productosActivos"
                  item-title="nombre"
                  item-value="id"
                  label="Producto"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  clearable
                  @update:model-value="actualizarPrecioProducto"
                />
              </v-col>

              <v-col
                cols="6"
                md="2"
              >
                <v-text-field
                  v-model.number="nuevoDetalle.cantidad"
                  label="Cantidad"
                  type="number"
                  min="0.001"
                  step="0.001"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>

              <v-col
                cols="6"
                md="3"
              >
                <v-text-field
                  v-model.number="nuevoDetalle.precioCompra"
                  label="Precio compra"
                  type="number"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  prefix="$"
                />
              </v-col>

              <v-col
                cols="12"
                md="2"
              >
                <v-btn
                  block
                  color="primary"
                  prepend-icon="mdi-plus"
                  height="48"
                  @click="agregarDetalle"
                >
                  Agregar
                </v-btn>
              </v-col>

            </v-row>

          </div>

          <!-- DETALLES -->

          <div
            v-if="formulario.detalles.length"
            class="details-table"
          >

            <div class="details-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Subtotal</span>
              <span></span>
            </div>

            <div
              v-for="(detalle, index) in formulario.detalles"
              :key="index"
              class="detail-row"
            >

              <div class="product-info">
                <v-avatar
                  size="34"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon size="18">
                    mdi-package-variant
                  </v-icon>
                </v-avatar>

                <strong>
                  {{ nombreProducto(detalle) }}
                </strong>
              </div>

              <v-text-field
                v-model.number="detalle.cantidad"
                type="number"
                min="0.001"
                step="0.001"
                density="compact"
                variant="outlined"
                hide-details
                @input="actualizarSubtotal(detalle)"
              />

              <v-text-field
                v-model.number="detalle.precioCompra"
                type="number"
                min="0"
                density="compact"
                variant="outlined"
                hide-details
                prefix="$"
                @input="actualizarSubtotal(detalle)"
              />

              <strong>
                {{ formatearMoneda(detalle.subtotal) }}
              </strong>

              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click="eliminarDetalle(index)"
              />

            </div>

          </div>

          <div
            v-else
            class="empty-products"
          >
            <v-icon size="38">
              mdi-package-variant-closed
            </v-icon>

            <span>
              No has agregado productos a la compra.
            </span>
          </div>

          <!-- TOTALES -->

          <div class="purchase-totals">

            <div>
              <span>Subtotal</span>
              <strong>
                {{ formatearMoneda(subtotalForm) }}
              </strong>
            </div>

            <div class="discount-row">

              <v-text-field
                v-model.number="formulario.descuento"
                label="Descuento"
                type="number"
                min="0"
                variant="outlined"
                density="compact"
                hide-details
                prefix="$"
                style="max-width: 180px"
              />

            </div>

            <div class="total-row">
              <span>Total</span>

              <strong>
                {{ formatearMoneda(totalForm) }}
              </strong>
            </div>

          </div>

          <!-- PAGO INICIAL -->

          <div class="section-title payment-section-title">
            <div class="section-icon">
              <v-icon>mdi-cash-check</v-icon>
            </div>

            <div>
              <strong>Pago inicial</strong>
              <span>
                Define cuánto se paga al registrar la compra
              </span>
            </div>
          </div>

          <v-alert
            v-if="formulario.estadoPago === 'PENDIENTE'"
            type="info"
            variant="tonal"
            class="mb-5"
            icon="mdi-information-outline"
          >
            Esta compra quedará como crédito. El dinero no se
            registra en ninguna cuenta financiera hasta que se
            realice un abono desde la vista de cuentas por pagar.
          </v-alert>

          <v-row>

            <v-col
              cols="12"
              md="4"
            >
              <v-select
                v-model="formulario.estadoPago"
                :items="estadosPago"
                item-title="title"
                item-value="value"
                label="Estado del pago"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col
              cols="12"
              md="4"
            >
              <v-select
                v-model="formulario.metodoPago"
                :items="metodosPago"
                item-title="title"
                item-value="value"
                label="Método de pago"
                variant="outlined"
                density="comfortable"
                :disabled="
                  formulario.estadoPago === 'PENDIENTE'
                "
              />
            </v-col>

            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model.number="formulario.montoPagado"
                label="Monto pagado"
                type="number"
                min="0"
                :max="totalForm"
                variant="outlined"
                density="comfortable"
                prefix="$"
                :disabled="
                  formulario.estadoPago === 'PENDIENTE' ||
                  formulario.estadoPago === 'PAGADO'
                "
              />
            </v-col>

          </v-row>

          <!-- RESUMEN PAGO -->

          <div class="payment-summary">

            <div>
              <span>Total compra</span>
              <strong>
                {{ formatearMoneda(totalForm) }}
              </strong>
            </div>

            <div>
              <span>Pago inicial</span>
              <strong class="payment-value">
                {{ formatearMoneda(formulario.montoPagado) }}
              </strong>
            </div>

            <div>
              <span>Saldo pendiente</span>
              <strong class="pending-value">
                {{ formatearMoneda(saldoPendienteForm) }}
              </strong>
            </div>

          </div>

          <!-- OBSERVACIONES -->

          <div class="section-title">
            <div class="section-icon">
              <v-icon>mdi-note-text-outline</v-icon>
            </div>

            <div>
              <strong>Observaciones</strong>
              <span>Información adicional de la compra</span>
            </div>
          </div>

          <v-textarea
            v-model="formulario.observaciones"
            label="Observaciones"
            placeholder="Notas sobre la compra..."
            variant="outlined"
            rows="3"
            auto-grow
          />

        </v-card-text>

        <v-divider />

        <v-card-actions class="dialog-actions">

          <v-btn
            variant="text"
            @click="cerrarCompraDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="loadingForm"
            @click="guardarCompra"
          >
            Registrar compra
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         DIALOG DETALLE
    ====================================================== -->

    <v-dialog
      v-model="detalleDialog"
      max-width="950"
    >
      <v-card class="detail-dialog">

        <div class="dialog-header">

          <div>
            <span class="dialog-kicker">
              DETALLE DE COMPRA
            </span>

            <h2>
              {{ detalleCompra?.numeroCompra || 'Compra' }}
            </h2>

            <p>
              Información completa de la compra
            </p>
          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="cerrarDetalle"
          />

        </div>

        <v-divider />

        <v-card-text>

          <div
            v-if="loadingDetalle"
            class="loading-detail"
          >
            <v-progress-circular
              indeterminate
              color="primary"
            />

            <span>
              Cargando detalle...
            </span>
          </div>

          <template v-else-if="detalleCompra">

            <!-- RESUMEN -->

            <div class="detail-summary">

              <div>
                <span>Proveedor</span>

                <strong>
                  {{
                    detalleCompra.proveedor?.nombre ||
                    'Sin proveedor'
                  }}
                </strong>
              </div>

              <div>
                <span>Fecha</span>

                <strong>
                  {{ formatearFecha(detalleCompra.createdAt) }}
                </strong>
              </div>

              <div>
                <span>Estado</span>

                <v-chip
                  :color="
                    colorEstadoCompra(
                      detalleCompra.estado,
                    )
                  "
                  size="small"
                  variant="tonal"
                >
                  {{
                    textoEstadoCompra(
                      detalleCompra.estado,
                    )
                  }}
                </v-chip>
              </div>

              <div>
                <span>Pago</span>

                <v-chip
                  :color="
                    colorEstadoPago(
                      detalleCompra.estadoPago,
                    )
                  "
                  size="small"
                  variant="tonal"
                >
                  {{
                    textoEstadoPago(
                      detalleCompra.estadoPago,
                    )
                  }}
                </v-chip>
              </div>

            </div>

            <div
              v-if="detalleCompra.numeroFactura"
              class="invoice-detail"
            >
              <v-icon>mdi-receipt-text-outline</v-icon>

              <span>Factura:</span>

              <strong>
                {{ detalleCompra.numeroFactura }}
              </strong>
            </div>

            <!-- PRODUCTOS -->

            <div class="detail-section">

              <div class="detail-section-title">
                <v-icon>
                  mdi-package-variant
                </v-icon>

                <strong>
                  Productos
                </strong>
              </div>

              <div class="detail-items">

                <div
                  v-for="detalle in detalleCompra.detalles"
                  :key="detalle.id"
                  class="detail-item"
                >

                  <div class="detail-product">
                    <v-avatar
                      size="36"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon>
                        mdi-package-variant
                      </v-icon>
                    </v-avatar>

                    <div>
                      <strong>
                        {{ nombreProducto(detalle) }}
                      </strong>

                      <span>
                        {{ detalle.cantidad }}
                        ×
                        {{
                          formatearMoneda(
                            detalle.precioCompra,
                          )
                        }}
                      </span>
                    </div>
                  </div>

                  <strong>
                    {{
                      formatearMoneda(
                        detalle.subtotal,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </div>

            <!-- TOTALES -->

            <div class="detail-totals">

              <div>
                <span>Subtotal</span>

                <strong>
                  {{
                    formatearMoneda(
                      detalleCompra.subtotal,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Descuento</span>

                <strong>
                  {{
                    formatearMoneda(
                      detalleCompra.descuento,
                    )
                  }}
                </strong>
              </div>

              <div class="grand-total">
                <span>Total</span>

                <strong>
                  {{
                    formatearMoneda(
                      detalleCompra.total,
                    )
                  }}
                </strong>
              </div>

              <div>
                <span>Pago inicial</span>

                <strong>
                  {{
                    formatearMoneda(
                      detalleCompra.montoPagado,
                    )
                  }}
                </strong>
              </div>

              <div class="pending-total">
                <span>Saldo pendiente</span>

                <strong>
                  {{
                    formatearMoneda(
                      Number(detalleCompra.total || 0) -
                      Number(
                        detalleCompra.montoPagado || 0,
                      ),
                    )
                  }}
                </strong>
              </div>

            </div>

            <!-- MÉTODO -->

            <div class="payment-method-detail">

              <v-icon>
                mdi-credit-card-outline
              </v-icon>

              <div>
                <span>Método de pago inicial</span>

                <strong>
                  {{
                    textoMetodoPago(
                      detalleCompra.metodoPago,
                    )
                  }}
                </strong>
              </div>

            </div>

            <!-- OBSERVACIONES -->

            <div
              v-if="detalleCompra.observaciones"
              class="observations"
            >
              <span>Observaciones</span>

              <p>
                {{ detalleCompra.observaciones }}
              </p>
            </div>

          </template>

        </v-card-text>

        <v-card-actions class="dialog-actions">

          <v-spacer />

          <v-btn
            variant="text"
            @click="cerrarDetalle"
          >
            Cerrar
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         DIALOG ANULAR
    ====================================================== -->

    <v-dialog
      v-model="anularDialog"
      max-width="500"
    >
      <v-card class="cancel-dialog">

        <div class="cancel-icon">
          <v-icon>
            mdi-alert-outline
          </v-icon>
        </div>

        <v-card-title>
          Anular compra
        </v-card-title>

        <v-card-text>

          <p>
            ¿Estás seguro de que deseas anular la compra
            <strong>
              {{ compraSeleccionada?.numeroCompra }}
            </strong>?
          </p>

          <v-alert
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            Al anular la compra se revertirán los movimientos
            de inventario y los movimientos financieros
            asociados a sus pagos iniciales.
          </v-alert>

          <p class="cancel-warning">
            Esta acción no elimina la compra y no puede
            deshacerse automáticamente.
          </p>

        </v-card-text>

        <v-card-actions class="dialog-actions">

          <v-btn
            variant="text"
            @click="cerrarAnular"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="error"
            prepend-icon="mdi-cancel"
            :loading="loadingForm"
            @click="anularCompra"
          >
            Anular compra
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         SNACKBAR
    ====================================================== -->

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      location="bottom right"
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

  </div>
</template>

<style scoped>
/* =========================================================
   PAGE
========================================================= */

.compras-page {
  padding: 28px;
  min-height: 100%;
  background: #f7f9fc;
}

/* =========================================================
   HEADER
========================================================= */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7b8794;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 7px;
}

.breadcrumb span {
  color: #b7c0cc;
}

.page-header h1 {
  margin: 0;
  color: #172b4d;
  font-size: 30px;
  font-weight: 750;
  line-height: 1.2;
}

.page-header p {
  margin: 7px 0 0;
  color: #7b8794;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* =========================================================
   SUMMARY
========================================================= */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 96px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid #e7ebf0;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(24, 39, 75, 0.035);
}

.summary-card > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.summary-card span {
  color: #7b8794;
  font-size: 12px;
  font-weight: 600;
}

.summary-card strong {
  color: #172b4d;
  font-size: 20px;
  font-weight: 750;
}

.summary-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
}

.summary-icon.blue {
  background: #eaf2ff;
  color: #246bce;
}

.summary-icon.green {
  background: #eaf8f0;
  color: #239b61;
}

.summary-icon.orange {
  background: #fff4e5;
  color: #d98218;
}

.summary-icon.purple {
  background: #f1edff;
  color: #7454c8;
}

/* =========================================================
   MAIN CARD
========================================================= */

.main-card {
  overflow: hidden;
  border: 1px solid #e7ebf0 !important;
  border-radius: 17px !important;
  background: #fff;
}

.filters {
  display: grid;
  grid-template-columns: minmax(250px, 1fr) 190px 190px;
  gap: 12px;
  padding: 18px;
}

/* =========================================================
   TABLE
========================================================= */

.purchases-table :deep(th) {
  height: 48px !important;
  background: #fafbfd !important;
  color: #6b7785 !important;
  font-size: 11px !important;
  font-weight: 750 !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.purchases-table :deep(td) {
  height: 70px !important;
  border-bottom: 1px solid #edf0f4 !important;
}

.purchase-number {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.purchase-number strong {
  color: #172b4d;
  font-size: 13px;
}

.purchase-number span {
  color: #8995a3;
  font-size: 11px;
}

.date-text,
.invoice-number {
  color: #667382;
  font-size: 13px;
}

.provider-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.provider-cell > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-cell strong {
  color: #26374d;
  font-size: 13px;
}

.provider-cell span {
  color: #8a96a3;
  font-size: 11px;
}

.money-value {
  color: #172b4d;
  font-size: 13px;
}

.payment-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.payment-cell span {
  color: #8995a3;
  font-size: 10px;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 2px;
}

/* =========================================================
   EMPTY
========================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 55px 20px;
  color: #9aa5b1;
}

.empty-state strong {
  color: #667382;
  font-size: 14px;
}

.empty-state span {
  font-size: 12px;
}

/* =========================================================
   DIALOG
========================================================= */

.purchase-dialog,
.detail-dialog,
.cancel-dialog {
  border-radius: 20px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
  padding: 23px 25px 20px;
}

.dialog-kicker {
  display: block;
  margin-bottom: 5px;
  color: #3478d4;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.dialog-header h2 {
  margin: 0;
  color: #172b4d;
  font-size: 22px;
  font-weight: 750;
}

.dialog-header p {
  margin: 5px 0 0;
  color: #8995a3;
  font-size: 13px;
}

.dialog-actions {
  padding: 16px 24px 20px !important;
  gap: 8px;
}

/* =========================================================
   SECTION TITLES
========================================================= */

.section-title {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 6px 0 17px;
}

.section-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #edf4ff;
  color: #2c70cf;
}

.section-title > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-title strong {
  color: #26374d;
  font-size: 14px;
}

.section-title span {
  color: #8995a3;
  font-size: 11px;
}

.payment-section-title {
  margin-top: 30px;
}

/* =========================================================
   ADD PRODUCT
========================================================= */

.add-product-box {
  padding: 16px;
  margin-bottom: 18px;
  border: 1px solid #e6ebf1;
  border-radius: 13px;
  background: #fafbfd;
}

/* =========================================================
   DETAILS TABLE
========================================================= */

.details-table {
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid #e7ebf0;
  border-radius: 12px;
}

.details-header,
.detail-row {
  display: grid;
  grid-template-columns: minmax(200px, 1.8fr) 100px 150px 140px 45px;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
}

.details-header {
  background: #f8fafc;
  color: #7c8896;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.detail-row {
  min-height: 64px;
  border-top: 1px solid #edf0f4;
}

.detail-row > strong {
  color: #26374d;
  font-size: 13px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 9px;
}

.product-info strong {
  color: #26374d;
  font-size: 13px;
}

.empty-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 30px;
  margin-bottom: 20px;
  border: 1px dashed #dce2e9;
  border-radius: 12px;
  color: #9aa5b1;
  font-size: 12px;
}

/* =========================================================
   TOTALS
========================================================= */

.purchase-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  padding: 18px 4px;
  border-top: 1px solid #edf0f4;
}

.purchase-totals > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  min-width: 330px;
}

.purchase-totals span {
  color: #7b8794;
  font-size: 13px;
}

.purchase-totals strong {
  color: #26374d;
  font-size: 14px;
}

.purchase-totals .total-row {
  padding-top: 12px;
  border-top: 1px solid #e3e8ee;
}

.purchase-totals .total-row span {
  color: #172b4d;
  font-size: 15px;
  font-weight: 700;
}

.purchase-totals .total-row strong {
  color: #172b4d;
  font-size: 21px;
  font-weight: 800;
}

/* =========================================================
   PAYMENT
========================================================= */

.payment-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;
  margin-top: 5px;
  border: 1px solid #e4e9ef;
  border-radius: 13px;
  background: #f9fbfd;
}

.payment-summary > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-summary span {
  color: #7d8996;
  font-size: 11px;
}

.payment-summary strong {
  color: #26374d;
  font-size: 17px;
}

.payment-summary .payment-value {
  color: #238957;
}

.payment-summary .pending-value {
  color: #c47718;
}

/* =========================================================
   DETAIL
========================================================= */

.detail-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e7ebf0;
  border-radius: 13px;
  background: #fafbfd;
}

.detail-summary > div {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.detail-summary span {
  color: #8995a3;
  font-size: 10px;
  font-weight: 650;
  text-transform: uppercase;
}

.detail-summary strong {
  color: #26374d;
  font-size: 13px;
}

.invoice-detail {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 14px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: #f7f9fc;
  color: #697685;
  font-size: 12px;
}

.invoice-detail strong {
  color: #26374d;
}

.detail-section {
  margin-top: 20px;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #26374d;
  font-size: 14px;
}

.detail-items {
  overflow: hidden;
  border: 1px solid #e7ebf0;
  border-radius: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 12px 15px;
  border-bottom: 1px solid #edf0f4;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-product {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-product > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-product strong {
  color: #26374d;
  font-size: 13px;
}

.detail-product span {
  color: #8995a3;
  font-size: 11px;
}

.detail-item > strong {
  color: #26374d;
  font-size: 13px;
}

.detail-totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding: 18px 5px;
}

.detail-totals > div {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  min-width: 300px;
}

.detail-totals span {
  color: #7b8794;
  font-size: 12px;
}

.detail-totals strong {
  color: #26374d;
  font-size: 13px;
}

.detail-totals .grand-total {
  padding-top: 10px;
  border-top: 1px solid #e3e8ee;
}

.detail-totals .grand-total span {
  color: #172b4d;
  font-weight: 700;
}

.detail-totals .grand-total strong {
  color: #172b4d;
  font-size: 20px;
  font-weight: 800;
}

.detail-totals .pending-total strong {
  color: #c47718;
}

.payment-method-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  margin-top: 5px;
  border-radius: 11px;
  background: #f5f8fc;
}

.payment-method-detail > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.payment-method-detail span {
  color: #8995a3;
  font-size: 10px;
}

.payment-method-detail strong {
  color: #26374d;
  font-size: 13px;
}

.observations {
  padding: 15px;
  margin-top: 15px;
  border-radius: 11px;
  background: #fafbfd;
}

.observations > span {
  color: #7d8996;
  font-size: 11px;
  font-weight: 700;
}

.observations p {
  margin: 6px 0 0;
  color: #4c5b6c;
  font-size: 13px;
  white-space: pre-wrap;
}

.loading-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 300px;
  color: #8995a3;
  font-size: 13px;
}

/* =========================================================
   CANCEL
========================================================= */

.cancel-dialog {
  text-align: center;
}

.cancel-icon {
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 25px auto 5px;
  border-radius: 50%;
  background: #fff1f1;
  color: #d74444;
}

.cancel-dialog .v-card-title {
  padding-bottom: 5px;
  color: #26374d;
  font-size: 20px;
  font-weight: 750;
}

.cancel-dialog .v-card-text {
  color: #687585;
  font-size: 13px;
}

.cancel-dialog .dialog-actions {
  justify-content: flex-end;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 800px) {
  .compras-page {
    padding: 18px;
  }

  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .v-btn:last-child {
    flex: 1;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .details-header {
    display: none;
  }

  .detail-row {
    grid-template-columns: 1fr 1fr;
    padding: 14px;
  }

  .detail-row .product-info {
    grid-column: 1 / -1;
  }

  .payment-summary {
    grid-template-columns: 1fr;
  }

  .purchase-totals > div {
    min-width: 100%;
  }

  .detail-totals > div {
    min-width: 100%;
  }
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .detail-summary {
    grid-template-columns: 1fr;
  }

  .provider-cell > div:last-child span {
    display: none;
  }

  .purchase-totals {
    align-items: stretch;
  }

  .purchase-totals > div {
    gap: 15px;
  }
}
</style>
