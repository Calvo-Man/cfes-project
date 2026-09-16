<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from '@/plugins/axios'

// ─────────────────────────────────────────────
// DATOS
// ─────────────────────────────────────────────

const compras = ref([])
const proveedores = ref([])
const productos = ref([])

const loading = ref(false)
const loadingForm = ref(false)
const loadingDetalle = ref(false)

// ─────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────

const search = ref('')
const estadoFiltro = ref('TODOS')
const pagoFiltro = ref('TODOS')

// ─────────────────────────────────────────────
// DIALOGS
// ─────────────────────────────────────────────

const compraDialog = ref(false)
const detalleDialog = ref(false)
const anularDialog = ref(false)

// ─────────────────────────────────────────────
// ESTADO FORMULARIO
// ─────────────────────────────────────────────

const compraSeleccionada = ref(null)
const detalleCompra = ref(null)

const formulario = ref({
  proveedorId: null,
  numeroFactura: '',
  observaciones: '',
  descuento: 0,
  estadoPago: 'PAGADO',
  metodoPago: 'EFECTIVO',
  detalles: [],
})

// ─────────────────────────────────────────────
// PRODUCTO TEMPORAL
// ─────────────────────────────────────────────

const nuevoDetalle = ref({
  productoId: null,
  cantidad: 1,
  precioCompra: 0,
})

// ─────────────────────────────────────────────
// SNACKBAR
// ─────────────────────────────────────────────

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// ─────────────────────────────────────────────
// OPCIONES
// ─────────────────────────────────────────────

const estadosPago = [
  {
    title: 'Pagado',
    value: 'PAGADO',
  },
  {
    title: 'Pendiente',
    value: 'PENDIENTE',
  },
    {
        title: 'Parcial',
        value: 'PARCIAL',
    }
]

const metodosPago = [
  {
    title: 'Efectivo',
    value: 'EFECTIVO',
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

const estadosCompra = [
  {
    title: 'Todas',
    value: 'TODOS',
  },
  {
    title: 'Confirmadas',
    value: 'CONFIRMADA',
  },
  {
    title: 'Anuladas',
    value: 'ANULADA',
  },
]

// ─────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────

const proveedoresActivos = computed(() => {
  return proveedores.value.filter(
    (proveedor) => proveedor.activo,
  )
})

const productosActivos = computed(() => {
  return productos.value.filter(
    (producto) => producto.activo,
  )
})

const comprasFiltradas = computed(() => {
  const texto = search.value
    .trim()
    .toLowerCase()

  return compras.value.filter((compra) => {
    const coincideBusqueda =
      !texto ||
      compra.numeroCompra
        ?.toLowerCase()
        .includes(texto) ||
      compra.numeroFactura
        ?.toLowerCase()
        .includes(texto) ||
      compra.proveedor?.nombre
        ?.toLowerCase()
        .includes(texto)

    const coincideEstado =
      estadoFiltro.value === 'TODOS' ||
      compra.estado === estadoFiltro.value

    const coincidePago =
      pagoFiltro.value === 'TODOS' ||
      compra.estadoPago === pagoFiltro.value

    return (
      coincideBusqueda &&
      coincideEstado &&
      coincidePago
    )
  })
})

const totalCompras = computed(() => {
  return compras.value.length
})

const comprasConfirmadas = computed(() => {
  return compras.value.filter(
    (compra) =>
      compra.estado === 'CONFIRMADA',
  ).length
})

const comprasPendientes = computed(() => {
  return compras.value.filter(
    (compra) =>
      compra.estadoPago === 'PENDIENTE' &&
      compra.estado !== 'ANULADA',
  ).length
})

const totalComprado = computed(() => {
  return compras.value
    .filter(
      (compra) =>
        compra.estado !== 'ANULADA',
    )
    .reduce(
      (total, compra) =>
        total + Number(compra.total || 0),
      0,
    )
})

const totalForm = computed(() => {
  const subtotal = formulario.value.detalles.reduce(
    (total, detalle) =>
      total + Number(detalle.subtotal || 0),
    0,
  )

  const descuento =
    Number(formulario.value.descuento) || 0

  return Math.max(
    0,
    subtotal - descuento,
  )
})

const subtotalForm = computed(() => {
  return formulario.value.detalles.reduce(
    (total, detalle) =>
      total + Number(detalle.subtotal || 0),
    0,
  )
})

// ─────────────────────────────────────────────
// CARGAR DATOS
// ─────────────────────────────────────────────

async function cargarCompras() {
  loading.value = true

  try {
    const response = await axios.get('/compras')

    compras.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar las compras',
    )
  } finally {
    loading.value = false
  }
}

async function cargarProveedores() {
  try {
    const response = await axios.get(
      '/proveedor/activos',
    )

    proveedores.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar los proveedores',
    )
  }
}

async function cargarProductos() {
  try {
    const response = await axios.get(
      '/producto/activos',
    )

    productos.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar los productos',
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

// ─────────────────────────────────────────────
// FORMULARIO
// ─────────────────────────────────────────────

function formularioInicial() {
  return {
    proveedorId: null,
    numeroFactura: '',
    observaciones: '',
    descuento: 0,
    estadoPago: 'PAGADO',
    metodoPago: 'EFECTIVO',
    detalles: [],
  }
}

function abrirNuevaCompra() {
  formulario.value = formularioInicial()

  nuevoDetalle.value = {
    productoId: null,
    cantidad: 1,
    precioCompra: 0,
  }

  compraDialog.value = true
}

// ─────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────

function productoSeleccionado() {
  return productos.value.find(
    (producto) =>
      producto.id ===
      Number(nuevoDetalle.value.productoId),
  )
}

function actualizarPrecioProducto() {
  const producto = productoSeleccionado()

  if (!producto) {
    nuevoDetalle.value.precioCompra = 0
    return
  }

  const precio =
    Number(producto.precioCompra) || 0

  nuevoDetalle.value.precioCompra = precio
}

function agregarDetalle() {
  const producto = productoSeleccionado()

  if (!producto) {
    mostrarMensaje(
      'Selecciona un producto',
      'warning',
    )
    return
  }

  const cantidad =
    Number(nuevoDetalle.value.cantidad)

  const precio =
    Number(nuevoDetalle.value.precioCompra)

  if (!cantidad || cantidad <= 0) {
    mostrarMensaje(
      'La cantidad debe ser mayor que cero',
      'warning',
    )
    return
  }

  if (precio < 0) {
    mostrarMensaje(
      'El precio de compra no puede ser negativo',
      'warning',
    )
    return
  }

  const existente =
    formulario.value.detalles.find(
      (detalle) =>
        detalle.productoId === producto.id,
    )

  if (existente) {
    existente.cantidad =
      Number(existente.cantidad) +
      cantidad

    existente.subtotal =
      Number(existente.cantidad) *
      Number(existente.precioCompra)

    mostrarMensaje(
      'Se actualizó la cantidad del producto',
      'success',
    )
  } else {
    formulario.value.detalles.push({
      productoId: producto.id,
      producto,
      cantidad,
      precioCompra: precio,
      subtotal: cantidad * precio,
    })
  }

  nuevoDetalle.value = {
    productoId: null,
    cantidad: 1,
    precioCompra: 0,
  }
}

function eliminarDetalle(index) {
  formulario.value.detalles.splice(
    index,
    1,
  )
}

function actualizarSubtotal(detalle) {
  detalle.subtotal =
    Number(detalle.cantidad || 0) *
    Number(detalle.precioCompra || 0)
}

// ─────────────────────────────────────────────
// GUARDAR COMPRA
// ─────────────────────────────────────────────

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
      'Selecciona el estado de pago',
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

  const descuento =
    Number(form.descuento) || 0

  if (descuento < 0) {
    mostrarMensaje(
      'El descuento no puede ser negativo',
      'warning',
    )
    return
  }

  if (descuento > subtotalForm.value) {
    mostrarMensaje(
      'El descuento no puede ser mayor al subtotal',
      'warning',
    )
    return
  }

  for (const detalle of form.detalles) {
    if (
      !detalle.cantidad ||
      Number(detalle.cantidad) <= 0
    ) {
      mostrarMensaje(
        'Todas las cantidades deben ser mayores que cero',
        'warning',
      )
      return
    }

    if (
      Number(detalle.precioCompra) < 0
    ) {
      mostrarMensaje(
        'Los precios de compra no pueden ser negativos',
        'warning',
      )
      return
    }
  }

  loadingForm.value = true

  try {
    const payload = {
      proveedorId:
        Number(form.proveedorId),

      estadoPago:
        form.estadoPago,

      metodoPago:
        form.metodoPago,

      descuento,

      detalles:
        form.detalles.map((detalle) => ({
          productoId:
            Number(detalle.productoId),

          cantidad:
            Number(detalle.cantidad),

          precioCompra:
            Number(detalle.precioCompra),
        })),
    }

    if (form.numeroFactura.trim()) {
      payload.numeroFactura =
        form.numeroFactura.trim()
    }

    if (form.observaciones.trim()) {
      payload.observaciones =
        form.observaciones.trim()
    }

    await axios.post(
      '/compras',
      payload,
    )

    compraDialog.value = false

    mostrarMensaje(
      'Compra registrada correctamente',
      'success',
    )

    await cargarTodo()
  } catch (error) {
    mostrarError(
      error,
      'No se pudo registrar la compra',
    )
  } finally {
    loadingForm.value = false
  }
}

// ─────────────────────────────────────────────
// DETALLE
// ─────────────────────────────────────────────

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
    mostrarError(
      error,
      'No se pudo cargar el detalle',
    )

    detalleDialog.value = false
  } finally {
    loadingDetalle.value = false
  }
}

// ─────────────────────────────────────────────
// ANULAR
// ─────────────────────────────────────────────

function abrirAnular(compra) {
  compraSeleccionada.value = compra
  anularDialog.value = true
}

function cerrarAnular() {
  if (loadingForm.value) {
    return
  }

  anularDialog.value = false
}

async function anularCompra() {
  if (!compraSeleccionada.value) {
    return
  }

  loadingForm.value = true

  try {
    await axios.patch(
      `/compras/${compraSeleccionada.value.id}/anular`,
    )

    anularDialog.value = false

    mostrarMensaje(
      'Compra anulada correctamente',
      'success',
    )

    await cargarTodo()
  } catch (error) {
    mostrarError(
      error,
      'No se pudo anular la compra',
    )
  } finally {
    loadingForm.value = false
  }
}

// ─────────────────────────────────────────────
// FORMATO
// ─────────────────────────────────────────────

function formatoMoneda(valor) {
  return Number(valor || 0).toLocaleString(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    },
  )
}

function formatoFecha(fecha) {
  if (!fecha) {
    return '-'
  }

  return new Date(fecha).toLocaleDateString(
    'es-CO',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  )
}

function formatoCantidad(valor) {
  return Number(valor || 0).toLocaleString(
    'es-CO',
    {
      maximumFractionDigits: 3,
    },
  )
}

function textoEstadoCompra(estado) {
  const estados = {
    CONFIRMADA: 'Confirmada',
    ANULADA: 'Anulada',
  }

  return estados[estado] || estado
}

function colorEstadoCompra(estado) {
  return estado === 'CONFIRMADA'
    ? 'success'
    : 'error'
}

function textoEstadoPago(estado) {
  const estados = {
    PAGADO: 'Pagado',
    PENDIENTE: 'Pendiente',
    PARCIAL: 'Parcial',
  }

  return estados[estado] || estado
}

function colorEstadoPago(estado) {
  return estado === 'PAGADA'
    ? 'success'
    : 'warning'
}

function textoMetodoPago(metodo) {
  const metodos = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
  }

  return metodos[metodo] || metodo
}

function nombreProveedor(compra) {
  return (
    compra?.proveedor?.nombre ||
    'Sin proveedor'
  )
}

// ─────────────────────────────────────────────
// SNACKBAR
// ─────────────────────────────────────────────

function mostrarMensaje(
  mensaje,
  color = 'success',
) {
  snackbarMessage.value = mensaje
  snackbarColor.value = color
  snackbar.value = true
}

function mostrarError(error, mensaje) {
  console.error(error)

  const mensajeBackend =
    error?.response?.data?.message

  snackbarMessage.value =
    Array.isArray(mensajeBackend)
      ? mensajeBackend.join(', ')
      : mensajeBackend || mensaje

  snackbarColor.value = 'error'
  snackbar.value = true
}

// ─────────────────────────────────────────────
// INICIO
// ─────────────────────────────────────────────

onMounted(() => {
  cargarTodo()
})
</script>

<template>
  <div class="compras-page">

<!-- HEADER -->

<div class="page-header">

  <div>

    <div class="eyebrow">
      CAFETERÍA
    </div>

    <h1>
      Compras
    </h1>

    <p>
      Gestiona las compras y abastecimiento
      de la cafetería
    </p>

  </div>

  <div class="header-actions">

    <v-btn
      variant="outlined"
      prepend-icon="mdi-refresh"
      :loading="loading"
      @click="cargarTodo"
    >
      Actualizar
    </v-btn>

    <v-btn
      color="primary"
      prepend-icon="mdi-cart-plus"
      @click="abrirNuevaCompra"
    >
      Nueva compra
    </v-btn>

  </div>

</div>

<!-- RESUMEN -->

<div class="summary-grid">

  <div class="summary-card">

    <div class="summary-icon">
      <v-icon
        icon="mdi-cart-outline"
      />
    </div>

    <div>
      <span>
        Compras
      </span>

      <strong>
        {{ totalCompras }}
      </strong>
    </div>

  </div>

  <div class="summary-card">

    <div
      class="summary-icon success-icon"
    >
      <v-icon
        icon="mdi-check-circle-outline"
      />
    </div>

    <div>
      <span>
        Confirmadas
      </span>

      <strong>
        {{ comprasConfirmadas }}
      </strong>
    </div>

  </div>

  <div class="summary-card">

    <div
      class="summary-icon warning-icon"
    >
      <v-icon
        icon="mdi-clock-outline"
      />
    </div>

    <div>
      <span>
        Pagos pendientes
      </span>

      <strong>
        {{ comprasPendientes }}
      </strong>
    </div>

  </div>

  <div class="summary-card">

    <div
      class="summary-icon money-icon"
    >
      <v-icon
        icon="mdi-cash-multiple"
      />
    </div>

    <div>
      <span>
        Total comprado
      </span>

      <strong>
        {{ formatoMoneda(totalComprado) }}
      </strong>
    </div>

  </div>

</div>

<!-- TABLA -->

<v-card
  class="main-card"
  elevation="0"
>

  <div class="card-header">

    <div>

      <h2>
        Historial de compras
      </h2>

      <p>
        Registro de compras realizadas a proveedores
      </p>

    </div>

  </div>

  <div class="filters">

    <v-text-field
      v-model="search"
      label="Buscar compra"
      placeholder="Número, factura o proveedor..."
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="comfortable"
      hide-details
      clearable
    />

    <v-select
      v-model="estadoFiltro"
      :items="estadosCompra"
      item-title="title"
      item-value="value"
      label="Estado"
      variant="outlined"
      density="comfortable"
      hide-details
    />

    <v-select
      v-model="pagoFiltro"
      :items="[
        {
          title: 'Todos los pagos',
          value: 'TODOS',
        },
        ...estadosPago,
      ]"
      item-title="title"
      item-value="value"
      label="Pago"
      variant="outlined"
      density="comfortable"
      hide-details
    />

  </div>

  <v-data-table
    :headers="[
      {
        title: 'Compra',
        key: 'numeroCompra',
      },
      {
        title: 'Fecha',
        key: 'fechaCompra',
      },
      {
        title: 'Proveedor',
        key: 'proveedor',
      },
      {
        title: 'Factura',
        key: 'numeroFactura',
      },
      {
        title: 'Total',
        key: 'total',
        align: 'end',
      },
      {
        title: 'Pago',
        key: 'estadoPago',
      },
      {
        title: 'Estado',
        key: 'estado',
      },
      {
        title: 'Acciones',
        key: 'acciones',
        sortable: false,
        align: 'end',
      },
    ]"
    :items="comprasFiltradas"
    :loading="loading"
    item-value="id"
    hover
    class="purchases-table"
  >

    <template
      #item.numeroCompra="{ item }"
    >

      <div class="purchase-number">

        <strong>
          {{ item.numeroCompra }}
        </strong>

        <span>
          {{ textoMetodoPago(item.metodoPago) }}
        </span>

      </div>

    </template>

    <template
      #item.fechaCompra="{ item }"
    >
      {{ formatoFecha(item.fechaCompra) }}
    </template>

    <template
      #item.proveedor="{ item }"
    >

      <div class="provider-cell">

        <div class="provider-avatar">
          {{
            nombreProveedor(item)
              .charAt(0)
              .toUpperCase()
          }}
        </div>

        <strong>
          {{ nombreProveedor(item) }}
        </strong>

      </div>

    </template>

    <template
      #item.numeroFactura="{ item }"
    >
      {{ item.numeroFactura || '-' }}
    </template>

    <template #item.total="{ item }">

      <strong class="total-value">
        {{ formatoMoneda(item.total) }}
      </strong>

    </template>

    <template
      #item.estadoPago="{ item }"
    >

      <v-chip
        :color="
          colorEstadoPago(
            item.estadoPago,
          )
        "
        size="small"
        variant="tonal"
      >
        {{
          textoEstadoPago(
            item.estadoPago,
          )
        }}
      </v-chip>

    </template>

    <template #item.estado="{ item }">

      <v-chip
        :color="
          colorEstadoCompra(
            item.estado,
          )
        "
        size="small"
        variant="tonal"
      >
        {{
          textoEstadoCompra(
            item.estado,
          )
        }}
      </v-chip>

    </template>

    <template
      #item.acciones="{ item }"
    >

      <div class="actions">

        <v-tooltip text="Ver detalle">

          <template #activator="{ props }">

            <v-btn
              v-bind="props"
              icon="mdi-eye-outline"
              variant="text"
              size="small"
              @click="
                abrirDetalle(item)
              "
            />

          </template>

        </v-tooltip>

        <v-tooltip
          v-if="
            item.estado ===
            'CONFIRMADA'
          "
          text="Anular compra"
        >

          <template #activator="{ props }">

            <v-btn
              v-bind="props"
              icon="mdi-close-circle-outline"
              variant="text"
              color="error"
              size="small"
              @click="
                abrirAnular(item)
              "
            />

          </template>

        </v-tooltip>

      </div>

    </template>

    <template #no-data>

      <div class="empty-state">

        <v-icon
          icon="mdi-cart-outline"
          size="44"
        />

        <strong>
          No hay compras
        </strong>

        <span>
          No se encontraron compras con
          los filtros actuales.
        </span>

      </div>

    </template>

  </v-data-table>

</v-card>

<!-- DIALOG NUEVA COMPRA -->

<v-dialog
  v-model="compraDialog"
  max-width="1050"
  persistent
>

  <v-card>

    <v-card-title
      class="dialog-title"
    >

      <div>

        <span>
          CAFETERÍA
        </span>

        <h2>
          Nueva compra
        </h2>

      </div>

      <v-btn
        icon="mdi-close"
        variant="text"
        :disabled="loadingForm"
        @click="
          compraDialog = false
        "
      />

    </v-card-title>

    <v-divider />

    <v-card-text>

      <v-form
        @submit.prevent="
          guardarCompra
        "
      >

        <!-- DATOS GENERALES -->

        <div class="section-title">
          <div class="section-icon">
            <v-icon
              icon="mdi-file-document-outline"
            />
          </div>

          <div>
            <strong>
              Información de la compra
            </strong>

            <span>
              Datos generales y forma de pago
            </span>
          </div>
        </div>

        <v-row>

          <v-col
            cols="12"
            md="6"
          >

            <v-select
              v-model="
                formulario.proveedorId
              "
              :items="
                proveedoresActivos
              "
              item-title="nombre"
              item-value="id"
              label="Proveedor *"
              prepend-inner-icon="
                mdi-truck-outline
              "
              variant="outlined"
              :disabled="loadingForm"
              hide-details="auto"
              clearable
            />

          </v-col>

          <v-col
            cols="12"
            md="6"
          >

            <v-text-field
              v-model="
                formulario.numeroFactura
              "
              label="Número de factura"
              placeholder="Opcional"
              prepend-inner-icon="
                mdi-receipt-text-outline
              "
              variant="outlined"
              :disabled="loadingForm"
              maxlength="50"
              hide-details="auto"
            />

          </v-col>

          <v-col
            cols="12"
            md="4"
          >

            <v-select
              v-model="
                formulario.estadoPago
              "
              :items="estadosPago"
              item-title="title"
              item-value="value"
              label="Estado del pago *"
              prepend-inner-icon="
                mdi-cash-check
              "
              variant="outlined"
              :disabled="loadingForm"
              hide-details="auto"
            />

          </v-col>

          <v-col
            cols="12"
            md="4"
          >

            <v-select
              v-model="
                formulario.metodoPago
              "
              :items="metodosPago"
              item-title="title"
              item-value="value"
              label="Método de pago *"
              prepend-inner-icon="
                mdi-credit-card-outline
              "
              variant="outlined"
              :disabled="loadingForm"
              hide-details="auto"
            />

          </v-col>

          <v-col
            cols="12"
            md="4"
          >

            <v-text-field
              v-model.number="
                formulario.descuento
              "
              label="Descuento"
              type="number"
              min="0"
              step="100"
              prepend-inner-icon="
                mdi-tag-outline
              "
              prefix="$"
              variant="outlined"
              :disabled="loadingForm"
              hide-details="auto"
            />

          </v-col>

        </v-row>

        <!-- PRODUCTOS -->

        <div
          class="section-title product-section-title"
        >

          <div class="section-icon">
            <v-icon
              icon="mdi-package-variant"
            />
          </div>

          <div>
            <strong>
              Productos
            </strong>

            <span>
              Agrega los productos incluidos
              en la compra
            </span>
          </div>

        </div>

        <div class="add-product-box">

          <v-row
            align="center"
          >

            <v-col
              cols="12"
              md="5"
            >

              <v-select
                v-model="
                  nuevoDetalle.productoId
                "
                :items="
                  productosActivos
                "
                item-title="nombre"
                item-value="id"
                label="Producto"
                prepend-inner-icon="
                  mdi-package-variant
                "
                variant="outlined"
                :disabled="
                  loadingForm
                "
                hide-details="auto"
                clearable
                @update:model-value="
                  actualizarPrecioProducto
                "
              />

            </v-col>

            <v-col
              cols="12"
              sm="6"
              md="2"
            >

              <v-text-field
                v-model.number="
                  nuevoDetalle.cantidad
                "
                label="Cantidad"
                type="number"
                min="0.001"
                step="0.001"
                prepend-inner-icon="
                  mdi-counter
                "
                variant="outlined"
                :disabled="
                  loadingForm
                "
                hide-details="auto"
              />

            </v-col>

            <v-col
              cols="12"
              sm="6"
              md="3"
            >

              <v-text-field
                v-model.number="
                  nuevoDetalle.precioCompra
                "
                label="Precio de compra"
                type="number"
                min="0"
                step="0.01"
                prepend-inner-icon="
                  mdi-currency-usd
                "
                prefix="$"
                variant="outlined"
                :disabled="
                  loadingForm
                "
                hide-details="auto"
              />

            </v-col>

            <v-col
              cols="12"
              md="2"
              class="add-product-action"
            >

              <v-btn
                color="primary"
                block
                prepend-icon="mdi-plus"
                :disabled="
                  loadingForm
                "
                @click="
                  agregarDetalle
                "
              >
                Agregar
              </v-btn>

            </v-col>

          </v-row>

        </div>

        <!-- DETALLES -->

        <div
          v-if="
            formulario.detalles.length
          "
          class="details-table"
        >

          <div class="details-header">

            <span>
              Producto
            </span>

            <span>
              Cantidad
            </span>

            <span>
              Precio
            </span>

            <span>
              Subtotal
            </span>

            <span>
            </span>

          </div>

          <div
            v-for="(
              detalle,
              index
            ) in formulario.detalles"
            :key="
              detalle.productoId
            "
            class="detail-row"
          >

            <div class="detail-product">

              <div class="mini-product-icon">
                <v-icon
                  icon="
                    mdi-package-variant
                  "
                />
              </div>

              <div>

                <strong>
                  {{
                    detalle.producto
                      ?.nombre
                  }}
                </strong>

                <span>
                  {{
                    detalle.producto
                      ?.unidad ||
                    ''
                  }}
                </span>

              </div>

            </div>

            <div>

              <v-text-field
                v-model.number="
                  detalle.cantidad
                "
                type="number"
                min="0.001"
                step="0.001"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="
                  loadingForm
                "
                @update:model-value="
                  actualizarSubtotal(
                    detalle,
                  )
                "
              />

            </div>

            <div>

              <v-text-field
                v-model.number="
                  detalle.precioCompra
                "
                type="number"
                min="0"
                step="0.01"
                density="compact"
                variant="outlined"
                prefix="$"
                hide-details
                :disabled="
                  loadingForm
                "
                @update:model-value="
                  actualizarSubtotal(
                    detalle,
                  )
                "
              />

            </div>

            <div class="detail-subtotal">

              {{
                formatoMoneda(
                  detalle.subtotal,
                )
              }}

            </div>

            <div class="detail-remove">

              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                :disabled="
                  loadingForm
                "
                @click="
                  eliminarDetalle(index)
                "
              />

            </div>

          </div>

        </div>

        <div
          v-else
          class="no-details"
        >

          <v-icon
            icon="mdi-cart-plus"
            size="32"
          />

          <span>
            Agrega productos para
            construir la compra
          </span>

        </div>

        <!-- TOTALES -->

        <div class="purchase-total">

          <div>

            <span>
              Subtotal
            </span>

            <strong>
              {{
                formatoMoneda(
                  subtotalForm,
                )
              }}
            </strong>

          </div>

          <div>

            <span>
              Descuento
            </span>

            <strong>
              {{
                formatoMoneda(
                  formulario.descuento,
                )
              }}
            </strong>

          </div>

          <div class="grand-total">

            <span>
              Total
            </span>

            <strong>
              {{
                formatoMoneda(
                  totalForm,
                )
              }}
            </strong>

          </div>

        </div>

        <!-- OBSERVACIONES -->

        <v-textarea
          v-model="
            formulario.observaciones
          "
          label="Observaciones"
          placeholder="Notas adicionales de la compra..."
          prepend-inner-icon="
            mdi-note-text-outline
          "
          variant="outlined"
          rows="2"
          maxlength="1000"
          :disabled="loadingForm"
          hide-details="auto"
          class="mt-5"
        />

        <div class="dialog-actions">

          <v-btn
            variant="text"
            :disabled="loadingForm"
            @click="
              compraDialog = false
            "
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            type="submit"
            prepend-icon="mdi-check"
            :loading="loadingForm"
          >
            Registrar compra
          </v-btn>

        </div>

      </v-form>

    </v-card-text>

  </v-card>

</v-dialog>

<!-- DIALOG DETALLE -->

<v-dialog
  v-model="detalleDialog"
  max-width="900"
>

  <v-card>

    <v-card-title
      class="dialog-title"
    >

      <div>

        <span>
          DETALLE DE COMPRA
        </span>

        <h2>
          {{
            detalleCompra
              ?.numeroCompra ||
            'Compra'
          }}
        </h2>

      </div>

      <v-btn
        icon="mdi-close"
        variant="text"
        @click="
          detalleDialog = false
        "
      />

    </v-card-title>

    <v-divider />

    <v-card-text>

      <div
        v-if="loadingDetalle"
        class="loading-container"
      >

        <v-progress-circular
          indeterminate
          size="42"
        />

      </div>

      <template
        v-else-if="detalleCompra"
      >

        <div class="detail-summary">

          <div>

            <span>
              Proveedor
            </span>

            <strong>
              {{
                nombreProveedor(
                  detalleCompra,
                )
              }}
            </strong>

          </div>

          <div>

            <span>
              Fecha
            </span>

            <strong>
              {{
                formatoFecha(
                  detalleCompra
                    .fechaCompra,
                )
              }}
            </strong>

          </div>

          <div>

            <span>
              Estado
            </span>

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

            <span>
              Pago
            </span>

            <v-chip
              :color="
                colorEstadoPago(
                  detalleCompra
                    .estadoPago,
                )
              "
              size="small"
              variant="tonal"
            >
              {{
                textoEstadoPago(
                  detalleCompra
                    .estadoPago,
                )
              }}
            </v-chip>

          </div>

        </div>

        <div
          v-if="
            detalleCompra.numeroFactura
          "
          class="invoice-info"
        >

          <v-icon
            icon="
              mdi-receipt-text-outline
            "
            size="18"
          />

          <span>
            Factura:
          </span>

          <strong>
            {{
              detalleCompra
                .numeroFactura
            }}
          </strong>

        </div>

        <div class="detail-list">

          <div class="detail-list-header">

            <span>
              Producto
            </span>

            <span>
              Cantidad
            </span>

            <span>
              Precio
            </span>

            <span>
              Subtotal
            </span>

          </div>

          <div
            v-for="detalle in
              detalleCompra.detalles"
            :key="detalle.id"
            class="detail-list-row"
          >

            <div>

              <strong>
                {{
                  detalle.producto
                    ?.nombre ||
                  '-'
                }}
              </strong>

              <span>
                {{
                  detalle.producto
                    ?.unidad ||
                  ''
                }}
              </span>

            </div>

            <span>
              {{
                formatoCantidad(
                  detalle.cantidad,
                )
              }}
            </span>

            <span>
              {{
                formatoMoneda(
                  detalle.precioCompra,
                )
              }}
            </span>

            <strong>
              {{
                formatoMoneda(
                  detalle.subtotal,
                )
              }}
            </strong>

          </div>

        </div>

        <div class="detail-totals">

          <div>

            <span>
              Subtotal
            </span>

            <strong>
              {{
                formatoMoneda(
                  detalleCompra.subtotal,
                )
              }}
            </strong>

          </div>

          <div>

            <span>
              Descuento
            </span>

            <strong>
              {{
                formatoMoneda(
                  detalleCompra.descuento,
                )
              }}
            </strong>

          </div>

          <div class="detail-grand-total">

            <span>
              Total
            </span>

            <strong>
              {{
                formatoMoneda(
                  detalleCompra.total,
                )
              }}
            </strong>

          </div>

        </div>

        <div
          v-if="
            detalleCompra.observaciones
          "
          class="observation-box"
        >

          <span>
            Observaciones
          </span>

          <p>
            {{
              detalleCompra
                .observaciones
            }}
          </p>

        </div>

      </template>

    </v-card-text>

  </v-card>

</v-dialog>

<!-- DIALOG ANULAR -->

<v-dialog
  v-model="anularDialog"
  max-width="480"
>

  <v-card>

    <v-card-title
      class="confirm-title"
    >

      <div class="confirm-icon">

        <v-icon
          icon="mdi-alert-outline"
        />

      </div>

      <div>

        <h2>
          Anular compra
        </h2>

        <p>
          Esta acción revertirá el inventario
          y, si corresponde, el movimiento de caja.
        </p>

      </div>

    </v-card-title>

    <v-card-text>

      <p class="confirm-text">

        ¿Deseas anular la compra

        <strong>
          {{
            compraSeleccionada
              ?.numeroCompra
          }}
        </strong>?

      </p>

      <v-alert
        type="warning"
        variant="tonal"
      >
        Los productos de esta compra serán
        descontados nuevamente del inventario.

      </v-alert>

    </v-card-text>

    <v-card-actions
      class="confirm-actions"
    >

      <v-btn
        variant="text"
        :disabled="loadingForm"
        @click="cerrarAnular"
      >
        Cancelar
      </v-btn>

      <v-btn
        color="error"
        prepend-icon="
          mdi-close-circle-outline
        "
        :loading="loadingForm"
        @click="anularCompra"
      >
        Anular compra
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
```

  </div>
</template>

<style scoped>
.compras-page {
  padding: 28px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.6px;
  color: #1976d2;
  margin-bottom: 6px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 750;
  color: #172033;
}

.page-header p {
  margin: 6px 0 0;
  color: #687386;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 14px;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 30px
    rgba(30, 50, 80, 0.07);
}

.summary-card span {
  display: block;
  font-size: 13px;
  color: #778195;
  margin-bottom: 4px;
}

.summary-card strong {
  display: block;
  font-size: 22px;
  color: #172033;
}

.summary-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #eaf3ff;
  color: #1976d2;
}

.success-icon {
  background: #eaf8ef;
  color: #2e7d32;
}

.warning-icon {
  background: #fff6df;
  color: #c78300;
}

.money-icon {
  background: #eef0ff;
  color: #4b5bd5;
}

.main-card {
  overflow: hidden;
  border:
    1px solid #e7ebf1 !important;
  border-radius:
    14px !important;
}

.card-header {
  padding: 22px 24px 8px;
}

.card-header h2 {
  margin: 0;
  font-size: 19px;
  color: #172033;
}

.card-header p {
  margin: 5px 0 0;
  color: #7a8496;
  font-size: 13px;
}

.filters {
  display: grid;
  grid-template-columns:
    1.6fr 0.7fr 0.7fr;
  gap: 14px;
  padding: 18px 24px 20px;
}

.purchase-number {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.purchase-number strong {
  color: #172033;
}

.purchase-number span {
  font-size: 12px;
  color: #8992a2;
}

.provider-cell {
  display: flex;
  align-items: center;
  gap: 9px;
}

.provider-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #eaf3ff;
  color: #1976d2;
  font-size: 13px;
  font-weight: 700;
}

.total-value {
  color: #172033;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.empty-state {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 7px;
  color: #8a94a6;
}

.empty-state strong {
  color: #465064;
}

.dialog-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
}

.dialog-title span {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.4px;
  color: #1976d2;
}

.dialog-title h2 {
  margin: 3px 0 0;
  font-size: 20px;
  color: #172033;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 18px;
}

.section-title strong {
  display: block;
  font-size: 15px;
  color: #172033;
}

.section-title span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #7a8496;
}

.section-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #eaf3ff;
  color: #1976d2;
}

.product-section-title {
  margin-top: 28px;
}

.add-product-box {
  padding: 18px;
  background: #f7f9fc;
  border: 1px solid #e5eaf1;
  border-radius: 12px;
}

.add-product-action {
  display: flex;
  align-items: center;
}

.details-table {
  margin-top: 16px;
  border: 1px solid #e5eaf1;
  border-radius: 11px;
  overflow: hidden;
}

.details-header,
.detail-row {
  display: grid;
  grid-template-columns:
    2fr 0.8fr 1fr 1fr 48px;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}

.details-header {
  background: #f7f9fc;
  border-bottom: 1px solid #e5eaf1;
  color: #737e91;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-row {
  border-bottom: 1px solid #edf0f4;
}

.detail-row:last-child {
  border-bottom: 0;
}

.detail-product {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-product > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-product strong {
  color: #172033;
  font-size: 13px;
}

.detail-product span {
  color: #8992a2;
  font-size: 11px;
}

.mini-product-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #eef4fb;
  color: #1976d2;
}

.detail-subtotal {
  font-weight: 700;
  color: #172033;
}

.detail-remove {
  display: flex;
  justify-content: center;
}

.no-details {
  min-height: 130px;
  margin-top: 16px;
  border: 1px dashed #d7dde7;
  border-radius: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #8a94a6;
}

.purchase-total {
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  margin-top: 20px;
  border-top: 1px solid #e5eaf1;
  padding-top: 18px;
  gap: 28px;
}

.purchase-total > div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.purchase-total span {
  font-size: 12px;
  color: #7a8496;
}

.purchase-total strong {
  font-size: 16px;
  color: #172033;
}

.purchase-total .grand-total {
  min-width: 160px;
  padding-left: 28px;
  border-left: 1px solid #e5eaf1;
}

.purchase-total .grand-total strong {
  font-size: 23px;
  color: #1976d2;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.loading-container {
  min-height: 260px;
  display: grid;
  place-items: center;
}

.detail-summary {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.detail-summary > div {
  padding: 14px;
  background: #f7f9fc;
  border-radius: 10px;
}

.detail-summary span {
  display: block;
  margin-bottom: 5px;
  font-size: 11px;
  color: #7a8496;
}

.detail-summary strong {
  color: #172033;
  font-size: 14px;
}

.invoice-info {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 14px;
  margin-bottom: 18px;
  background: #f7f9fc;
  border-radius: 9px;
  color: #687386;
  font-size: 13px;
}

.invoice-info strong {
  color: #172033;
}

.detail-list {
  border: 1px solid #e5eaf1;
  border-radius: 10px;
  overflow: hidden;
}

.detail-list-header,
.detail-list-row {
  display: grid;
  grid-template-columns:
    2fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 15px;
}

.detail-list-header {
  background: #f7f9fc;
  color: #737e91;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-list-row {
  border-top: 1px solid #edf0f4;
  font-size: 13px;
  color: #566174;
}

.detail-list-row > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-list-row strong {
  color: #172033;
}

.detail-list-row span {
  font-size: 11px;
  color: #8992a2;
}

.detail-totals {
  display: flex;
  justify-content: flex-end;
  gap: 30px;
  margin-top: 18px;
}

.detail-totals > div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.detail-totals span {
  font-size: 12px;
  color: #7a8496;
}

.detail-totals strong {
  font-size: 15px;
  color: #172033;
}

.detail-grand-total {
  padding-left: 25px;
  border-left: 1px solid #e5eaf1;
}

.detail-grand-total strong {
  color: #1976d2 !important;
  font-size: 21px !important;
}

.observation-box {
  margin-top: 18px;
  padding: 14px 16px;
  background: #f7f9fc;
  border-radius: 10px;
}

.observation-box span {
  display: block;
  font-size: 11px;
  color: #7a8496;
  margin-bottom: 5px;
}

.observation-box p {
  margin: 0;
  color: #4e596d;
  font-size: 13px;
  white-space: pre-wrap;
}

.confirm-title {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px;
}

.confirm-title h2 {
  margin: 0;
  font-size: 20px;
  color: #172033;
}

.confirm-title p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #7a8496;
}

.confirm-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #fff4df;
  color: #c78300;
}

.confirm-text {
  color: #596579;
  margin-bottom: 16px;
}

.confirm-text strong {
  color: #172033;
}

.confirm-actions {
  justify-content: flex-end;
  padding: 8px 22px 20px;
}

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .detail-summary {
    grid-template-columns:
      repeat(2, 1fr);
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

  .header-actions .v-btn {
    flex: 1;
  }

  .details-header {
    display: none;
  }

  .detail-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .detail-remove {
    justify-content: flex-end;
  }

  .purchase-total {
    flex-direction: column;
    align-items: flex-end;
  }

  .purchase-total .grand-total {
    border-left: 0;
    border-top: 1px solid #e5eaf1;
    padding-left: 0;
    padding-top: 12px;
  }
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .header-actions {
    flex-direction: column;
  }

  .header-actions .v-btn {
    width: 100%;
  }

  .detail-summary {
    grid-template-columns: 1fr;
  }

  .detail-list-header {
    display: none;
  }

  .detail-list-row {
    grid-template-columns: 1fr 1fr;
  }

  .detail-totals {
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
