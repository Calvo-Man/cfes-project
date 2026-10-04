<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from '@/plugins/axios'

// ─────────────────────────────────────────────
// DATOS
// ─────────────────────────────────────────────

const productos = ref([])
const categorias = ref([])
const movimientos = ref([])

const loading = ref(false)
const loadingMovimientos = ref(false)
const movimientoLoading = ref(false)
const kardexLoading = ref(false)

// ─────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────

const search = ref('')
const categoriaFiltro = ref(null)
const estadoFiltro = ref('TODOS')

// ─────────────────────────────────────────────
// DIALOGS
// ─────────────────────────────────────────────

const movimientoDialog = ref(false)
const kardexDialog = ref(false)

// ─────────────────────────────────────────────
// FORMULARIO MOVIMIENTO
// ─────────────────────────────────────────────

const movimientoForm = ref({
  productoId: null,
  tipo: null,
  cantidad: null,
  observacion: '',
  numeroReferencia: '',
  referenciaId: null,
})

// ─────────────────────────────────────────────
// KARDEX
// ─────────────────────────────────────────────

const kardex = ref(null)

// ─────────────────────────────────────────────
// SNACKBAR
// ─────────────────────────────────────────────

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// ─────────────────────────────────────────────
// TIPOS DE MOVIMIENTO MANUAL
// ─────────────────────────────────────────────

const tiposMovimientoManual = [
  {
    title: 'Inventario inicial',
    value: 'INVENTARIO_INICIAL',
  },
  {
    title: 'Ajuste positivo',
    value: 'AJUSTE_POSITIVO',
  },
  {
    title: 'Ajuste negativo',
    value: 'AJUSTE_NEGATIVO',
  },
  {
    title: 'Donación',
    value: 'DONACION',
  },
  {
    title: 'Vencimiento',
    value: 'VENCIMIENTO',
  },
  {
    title: 'Consumo interno',
    value: 'CONSUMO_INTERNO',
  },
]

// ─────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────

const categoriasActivas = computed(() => {
  return categorias.value.filter(
    (categoria) => categoria.activo,
  )
})

const productosActivos = computed(() => {
  return productos.value.filter(
    (producto) => producto.activo,
  )
})

const productosFiltrados = computed(() => {
  const texto = search.value.trim().toLowerCase()

  return productos.value.filter((producto) => {
    const coincideBusqueda =
      !texto ||
      producto.nombre
        ?.toLowerCase()
        .includes(texto)

    const coincideCategoria =
      !categoriaFiltro.value ||
      producto.categoria?.id === categoriaFiltro.value

    const estado = obtenerEstado(producto)

    const coincideEstado =
      estadoFiltro.value === 'TODOS' ||
      estado === estadoFiltro.value

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincideEstado
    )
  })
})

const totalProductos = computed(() => {
  return productos.value.length
})

const productosBajoStock = computed(() => {
  return productos.value.filter(
    (producto) =>
      obtenerEstado(producto) === 'BAJO',
  ).length
})

const productosAgotados = computed(() => {
  return productos.value.filter(
    (producto) =>
      obtenerEstado(producto) === 'AGOTADO',
  ).length
})

const productosStockNormal = computed(() => {
  return productos.value.filter(
    (producto) =>
      obtenerEstado(producto) === 'NORMAL',
  ).length
})

const productoSeleccionado = computed(() => {
  if (!movimientoForm.value.productoId) {
    return null
  }

  return productos.value.find(
    (producto) =>
      producto.id ===
      Number(movimientoForm.value.productoId),
  )
})

// ─────────────────────────────────────────────
// CARGAR PRODUCTOS
// ─────────────────────────────────────────────

async function cargarProductos() {
  loading.value = true

  try {
    const response = await axios.get('/producto')

    productos.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar los productos',
    )
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────
// CARGAR CATEGORÍAS
// ─────────────────────────────────────────────

async function cargarCategorias() {
  try {
    const response = await axios.get(
      '/categoria-producto',
    )

    categorias.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar las categorías',
    )
  }
}

// ─────────────────────────────────────────────
// CARGAR MOVIMIENTOS
// ─────────────────────────────────────────────

async function cargarMovimientos() {
  loadingMovimientos.value = true

  try {
    const response = await axios.get(
      '/cafeteria/inventario',
    )

    movimientos.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar los movimientos',
    )
  } finally {
    loadingMovimientos.value = false
  }
}

// ─────────────────────────────────────────────
// CARGAR TODO
// ─────────────────────────────────────────────

async function cargarTodo() {
  await Promise.all([
    cargarProductos(),
    cargarCategorias(),
    cargarMovimientos(),
  ])
}

// ─────────────────────────────────────────────
// ESTADO DEL PRODUCTO
// ─────────────────────────────────────────────

function obtenerEstado(producto) {
  if (!producto.controlaInventario) {
    return 'NO_CONTROLADO'
  }

  const stock =
    Number(producto.stockActual) || 0

  const minimo =
    Number(producto.stockMinimo) || 0

  if (stock <= 0) {
    return 'AGOTADO'
  }

  if (stock <= minimo) {
    return 'BAJO'
  }

  return 'NORMAL'
}

function textoEstado(producto) {
  const estados = {
    NORMAL: 'Normal',
    BAJO: 'Stock bajo',
    AGOTADO: 'Agotado',
    NO_CONTROLADO: 'No controlado',
  }

  return (
    estados[obtenerEstado(producto)] ||
    obtenerEstado(producto)
  )
}

function colorEstado(producto) {
  const colores = {
    NORMAL: 'success',
    BAJO: 'warning',
    AGOTADO: 'error',
    NO_CONTROLADO: 'grey',
  }

  return (
    colores[obtenerEstado(producto)] ||
    'grey'
  )
}

function iconoEstado(producto) {
  const iconos = {
    NORMAL: 'mdi-check-circle-outline',
    BAJO: 'mdi-alert-circle-outline',
    AGOTADO: 'mdi-close-circle-outline',
    NO_CONTROLADO: 'mdi-infinity',
  }

  return (
    iconos[obtenerEstado(producto)] ||
    'mdi-help-circle-outline'
  )
}

// ─────────────────────────────────────────────
// MOVIMIENTOS
// ─────────────────────────────────────────────

function esEntrada(tipo) {
  return [
    'INVENTARIO_INICIAL',
    'COMPRA',
    'DONACION',
    'AJUSTE_POSITIVO',
    'ANULACION_VENTA',
  ].includes(tipo)
}

function cantidadMovimiento(movimiento) {
  const cantidad =
    Number(movimiento.cantidad) || 0

  return esEntrada(movimiento.tipo)
    ? cantidad
    : -cantidad
}

function textoTipoMovimiento(tipo) {
  const tipos = {
    INVENTARIO_INICIAL:
      'Inventario inicial',

    COMPRA:
      'Compra',

    VENTA:
      'Venta',

    ANULACION_VENTA:
      'Anulación de venta',

    AJUSTE_POSITIVO:
      'Ajuste positivo',

    AJUSTE_NEGATIVO:
      'Ajuste negativo',

    DONACION:
      'Donación',

    VENCIMIENTO:
      'Vencimiento',

    CONSUMO_INTERNO:
      'Consumo interno',

    ANULACION_COMPRA:
      'Anulación de compra',
  }

  return tipos[tipo] || tipo
}

function colorTipoMovimiento(tipo) {
  return esEntrada(tipo)
    ? 'success'
    : 'error'
}

function iconoMovimiento(tipo) {
  const iconos = {
    INVENTARIO_INICIAL:
      'mdi-package-variant-plus',

    COMPRA:
      'mdi-cart-plus',

    VENTA:
      'mdi-cart-minus',

    ANULACION_VENTA:
      'mdi-cart-arrow-up',

    AJUSTE_POSITIVO:
      'mdi-plus-circle-outline',

    AJUSTE_NEGATIVO:
      'mdi-minus-circle-outline',

    DONACION:
      'mdi-gift-outline',

    VENCIMIENTO:
      'mdi-calendar-remove-outline',

    CONSUMO_INTERNO:
      'mdi-account-minus-outline',

    ANULACION_COMPRA:
      'mdi-cart-arrow-up',
  }

  return (
    iconos[tipo] ||
    'mdi-swap-vertical'
  )
}

// ─────────────────────────────────────────────
// FORMULARIO MOVIMIENTO
// ─────────────────────────────────────────────

function abrirMovimiento() {
  movimientoForm.value = {
    productoId: null,
    tipo: null,
    cantidad: null,
    observacion: '',
    numeroReferencia: '',
    referenciaId: null,
  }

  movimientoDialog.value = true
}

function cerrarMovimiento() {
  if (movimientoLoading.value) {
    return
  }

  movimientoDialog.value = false
}

async function registrarMovimiento() {
  const form = movimientoForm.value

  if (!form.productoId) {
    mostrarMensaje(
      'Selecciona un producto',
      'warning',
    )
    return
  }

  if (!form.tipo) {
    mostrarMensaje(
      'Selecciona el tipo de movimiento',
      'warning',
    )
    return
  }

  if (
    !form.cantidad ||
    Number(form.cantidad) <= 0
  ) {
    mostrarMensaje(
      'La cantidad debe ser mayor que cero',
      'warning',
    )
    return
  }

  const producto = productos.value.find(
    (item) =>
      item.id === Number(form.productoId),
  )

  if (!producto) {
    mostrarMensaje(
      'El producto seleccionado no existe',
      'error',
    )
    return
  }

  const movimientosSalida = [
    'AJUSTE_NEGATIVO',
    'VENCIMIENTO',
    'CONSUMO_INTERNO',
  ]

  if (
    movimientosSalida.includes(form.tipo) &&
    producto.controlaInventario
  ) {
    const stockActual =
      Number(producto.stockActual) || 0

    const cantidad =
      Number(form.cantidad) || 0

    if (cantidad > stockActual) {
      mostrarMensaje(
        `Stock insuficiente. Disponible: ${formatoStock(
          stockActual,
          producto.unidad,
        )} ${producto.unidad}`,
        'error',
      )
      return
    }
  }

  movimientoLoading.value = true

  try {
    const payload = {
      productoId: Number(form.productoId),

      tipo: form.tipo,

      cantidad: Number(form.cantidad),

      ...(form.observacion?.trim()
        ? {
            observacion:
              form.observacion.trim(),
          }
        : {}),

      ...(form.numeroReferencia?.trim()
        ? {
            numeroReferencia:
              form.numeroReferencia.trim(),
          }
        : {}),

      ...(form.referenciaId
        ? {
            referenciaId:
              Number(form.referenciaId),
          }
        : {}),
    }

    await axios.post(
      '/cafeteria/inventario',
      payload,
    )

    movimientoDialog.value = false

    mostrarMensaje(
      'Movimiento registrado correctamente',
      'success',
    )

    await cargarTodo()
  } catch (error) {
    mostrarError(
      error,
      'No se pudo registrar el movimiento',
    )
  } finally {
    movimientoLoading.value = false
  }
}

// ─────────────────────────────────────────────
// KARDEX
// ─────────────────────────────────────────────

async function abrirKardex(producto) {
  kardexDialog.value = true
  kardexLoading.value = true
  kardex.value = null

  try {
    const response = await axios.get(
      `/cafeteria/inventario/kardex/${producto.id}`,
    )

    kardex.value = response.data
  } catch (error) {
    mostrarError(
      error,
      'No se pudo cargar el kardex',
    )

    kardexDialog.value = false
  } finally {
    kardexLoading.value = false
  }
}

// ─────────────────────────────────────────────
// FORMATEADORES
// ─────────────────────────────────────────────

function formatoStock(cantidad, unidad) {
  const valor = Number(cantidad) || 0

  if (
    unidad === 'UNIDAD' ||
    unidad === 'CAJA' ||
    unidad === 'PAQUETE' ||
    unidad === 'BOTELLA'
  ) {
    return valor.toLocaleString('es-CO', {
      maximumFractionDigits: 0,
    })
  }

  return valor.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

function formatoFecha(fecha) {
  if (!fecha) {
    return '-'
  }

  return new Date(fecha).toLocaleString(
    'es-CO',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    },
  )
}

function nombreMiembro(miembro) {
  if (!miembro) {
    return 'Sistema'
  }

  const nombre =
    miembro.name || ''

  const apellido =
    miembro.apellido || ''

  return (
    `${nombre} ${apellido}`.trim() ||
    'Sistema'
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
  <div class="inventario-page">

    <!-- ═══════════════════════════════════════ -->
    <!-- HEADER                                  -->
    <!-- ═══════════════════════════════════════ -->

    <header class="page-header">

      <div class="page-heading">

        <div class="eyebrow">
          CAFETERÍA
        </div>

        <div class="title-row">
          <h1>Inventario</h1>

          <v-chip
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ totalProductos }} productos
          </v-chip>
        </div>

        <p>
          Control de existencias y movimientos
          de inventario.
        </p>

      </div>

      <div class="header-actions">

        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="
            loading ||
            loadingMovimientos
          "
          @click="cargarTodo"
        >
          Actualizar
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          elevation="0"
          @click="abrirMovimiento"
        >
          Nuevo movimiento
        </v-btn>

      </div>

    </header>

    <!-- ═══════════════════════════════════════ -->
    <!-- RESUMEN                                 -->
    <!-- ═══════════════════════════════════════ -->

    <section class="summary-grid">

      <!-- TOTAL -->
      <div class="summary-card">

        <div class="summary-icon blue">
          <v-icon
            icon="mdi-package-variant"
          />
        </div>

        <div class="summary-content">

          <span>Productos</span>

          <strong>
            {{ totalProductos }}
          </strong>

          <small>
            Registrados
          </small>

        </div>

      </div>

      <!-- NORMAL -->
      <div class="summary-card">

        <div class="summary-icon green">
          <v-icon
            icon="mdi-check-circle-outline"
          />
        </div>

        <div class="summary-content">

          <span>Stock normal</span>

          <strong>
            {{ productosStockNormal }}
          </strong>

          <small>
            Existencias saludables
          </small>

        </div>

      </div>

      <!-- BAJO -->
      <div class="summary-card">

        <div class="summary-icon orange">
          <v-icon
            icon="mdi-alert-outline"
          />
        </div>

        <div class="summary-content">

          <span>Stock bajo</span>

          <strong>
            {{ productosBajoStock }}
          </strong>

          <small>
            Requieren atención
          </small>

        </div>

      </div>

      <!-- AGOTADOS -->
      <div class="summary-card">

        <div class="summary-icon red">
          <v-icon
            icon="mdi-package-variant-closed-remove"
          />
        </div>

        <div class="summary-content">

          <span>Agotados</span>

          <strong>
            {{ productosAgotados }}
          </strong>

          <small>
            Sin existencias
          </small>

        </div>

      </div>

    </section>

    <!-- ═══════════════════════════════════════ -->
    <!-- EXISTENCIAS                             -->
    <!-- ═══════════════════════════════════════ -->

    <v-card
      class="main-card"
      elevation="0"
    >

      <!-- CARD HEADER -->

      <div class="card-header">

        <div class="section-heading">

          <div class="section-icon">
            <v-icon
              icon="mdi-warehouse"
            />
          </div>

          <div>
            <h2>Existencias</h2>

            <p>
              Estado actual de tus productos
            </p>
          </div>

        </div>

        <div class="result-counter">
          {{ productosFiltrados.length }}
          resultados
        </div>

      </div>

      <!-- FILTROS -->

      <div class="filters-container">

        <div class="filter-search">

          <v-text-field
            v-model="search"
            placeholder="Buscar producto..."
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            flat
            density="comfortable"
            hide-details
            clearable
          />

        </div>

        <div class="filter-select">

          <v-select
            v-model="categoriaFiltro"
            :items="categoriasActivas"
            item-title="nombre"
            item-value="id"
            placeholder="Todas las categorías"
            prepend-inner-icon="mdi-shape-outline"
            variant="solo"
            flat
            density="comfortable"
            hide-details
            clearable
          />

        </div>

        <div class="filter-select">

          <v-select
            v-model="estadoFiltro"
            :items="[
              {
                title: 'Todos los estados',
                value: 'TODOS',
              },
              {
                title: 'Normal',
                value: 'NORMAL',
              },
              {
                title: 'Stock bajo',
                value: 'BAJO',
              },
              {
                title: 'Agotados',
                value: 'AGOTADO',
              },
              {
                title: 'No controlado',
                value: 'NO_CONTROLADO',
              },
            ]"
            item-title="title"
            item-value="value"
            prepend-inner-icon="mdi-filter-outline"
            variant="solo"
            flat
            density="comfortable"
            hide-details
          />

        </div>

      </div>

      <!-- TABLA -->

      <v-data-table
        :headers="[
          {
            title: 'Producto',
            key: 'nombre',
            minWidth: 250,
          },
          {
            title: 'Categoría',
            key: 'categoria.nombre',
          },
          {
            title: 'Stock actual',
            key: 'stockActual',
            align: 'end',
          },
          {
            title: 'Mínimo',
            key: 'stockMinimo',
            align: 'end',
          },
          {
            title: 'Unidad',
            key: 'unidad',
          },
          {
            title: 'Estado',
            key: 'estado',
          },
          {
            title: '',
            key: 'acciones',
            sortable: false,
            align: 'end',
            width: 70,
          },
        ]"
        :items="productosFiltrados"
        :loading="loading"
        item-value="id"
        hover
        class="inventory-table"
      >

        <!-- PRODUCTO -->

        <template #item.nombre="{ item }">

          <div class="product-cell">

            <div
              class="product-avatar"
              :class="`avatar-${colorEstado(item)}`"
            >
              <v-icon
                :icon="
                  item.controlaInventario
                    ? 'mdi-package-variant'
                    : 'mdi-infinity'
                "
                size="20"
              />
            </div>

            <div class="product-info">

              <strong>
                {{ item.nombre }}
              </strong>

              <span
                v-if="item.descripcion"
              >
                {{ item.descripcion }}
              </span>

            </div>

          </div>

        </template>

        <!-- CATEGORÍA -->

        <template
          #item.categoria.nombre="{ item }"
        >

          <span class="category-label">
            {{
              item.categoria?.nombre ||
              'Sin categoría'
            }}
          </span>

        </template>

        <!-- STOCK ACTUAL -->

        <template
          #item.stockActual="{ item }"
        >

          <div class="stock-cell">

            <strong
              :class="{
                'stock-danger':
                  obtenerEstado(item) ===
                  'AGOTADO',

                'stock-warning':
                  obtenerEstado(item) ===
                  'BAJO',
              }"
            >
              {{
                formatoStock(
                  item.stockActual,
                  item.unidad,
                )
              }}
            </strong>

            <span>
              {{ item.unidad }}
            </span>

          </div>

        </template>

        <!-- STOCK MÍNIMO -->

        <template
          #item.stockMinimo="{ item }"
        >

          <span class="minimum-stock">
            {{
              formatoStock(
                item.stockMinimo,
                item.unidad,
              )
            }}
          </span>

        </template>

        <!-- UNIDAD -->

        <template #item.unidad="{ item }">

          <span class="unit-label">
            {{ item.unidad }}
          </span>

        </template>

        <!-- ESTADO -->

        <template #item.estado="{ item }">

          <v-chip
            :color="colorEstado(item)"
            size="small"
            variant="tonal"
            class="status-chip"
          >

            <v-icon
              start
              :icon="iconoEstado(item)"
              size="15"
            />

            {{ textoEstado(item) }}

          </v-chip>

        </template>

        <!-- ACCIONES -->

        <template
          #item.acciones="{ item }"
        >

          <v-tooltip
            text="Ver kardex"
            location="top"
          >

            <template
              #activator="{ props }"
            >

              <v-btn
                v-bind="props"
                icon="mdi-history"
                variant="text"
                size="small"
                color="primary"
                @click="
                  abrirKardex(item)
                "
              />

            </template>

          </v-tooltip>

        </template>

        <!-- SIN DATOS -->

        <template #no-data>

          <div class="empty-state">

            <div class="empty-icon">
              <v-icon
                icon="mdi-package-search-outline"
                size="30"
              />
            </div>

            <strong>
              No encontramos productos
            </strong>

            <span>
              Prueba cambiando los filtros
              de búsqueda.
            </span>

          </div>

        </template>

      </v-data-table>

    </v-card>

    <!-- ═══════════════════════════════════════ -->
    <!-- MOVIMIENTOS                             -->
    <!-- ═══════════════════════════════════════ -->

    <v-card
      class="main-card movements-card"
      elevation="0"
    >

      <div class="card-header">

        <div class="section-heading">

          <div class="section-icon">
            <v-icon
              icon="mdi-swap-vertical-circle-outline"
            />
          </div>

          <div>

            <h2>
              Últimos movimientos
            </h2>

            <p>
              Actividad reciente del inventario
            </p>

          </div>

        </div>

        <v-chip
          size="small"
          variant="tonal"
          color="primary"
        >
          Últimos 15
        </v-chip>

      </div>

      <v-data-table
        :headers="[
          {
            title: 'Fecha',
            key: 'createdAt',
          },
          {
            title: 'Producto',
            key: 'producto.nombre',
            minWidth: 220,
          },
          {
            title: 'Movimiento',
            key: 'tipo',
          },
          {
            title: 'Cantidad',
            key: 'cantidad',
            align: 'end',
          },
          {
            title: 'Stock resultante',
            key: 'stockNuevo',
            align: 'end',
          },
          {
            title: 'Realizado por',
            key: 'miembro',
          },
        ]"
        :items="
          movimientos.slice(0, 15)
        "
        :loading="loadingMovimientos"
        item-value="id"
        hover
        class="movements-table"
      >

        <!-- FECHA -->

        <template
          #item.createdAt="{ item }"
        >

          <div class="date-cell">
            <strong>
              {{
                formatoFecha(
                  item.createdAt,
                ).split(',')[0]
              }}
            </strong>

            <span>
              {{
                formatoFecha(
                  item.createdAt,
                ).split(',')[1]
              }}
            </span>
          </div>

        </template>

        <!-- PRODUCTO -->

        <template
          #item.producto.nombre="{ item }"
        >

          <div class="movement-product">

            <div class="movement-product-icon">
              <v-icon
                :icon="
                  iconoMovimiento(
                    item.tipo,
                  )
                "
                size="18"
              />
            </div>

            <strong>
              {{
                item.producto?.nombre ||
                '-'
              }}
            </strong>

          </div>

        </template>

        <!-- TIPO -->

        <template #item.tipo="{ item }">

          <v-chip
            :color="
              colorTipoMovimiento(
                item.tipo,
              )
            "
            size="small"
            variant="tonal"
          >

            <v-icon
              start
              :icon="
                iconoMovimiento(
                  item.tipo,
                )
              "
              size="15"
            />

            {{
              textoTipoMovimiento(
                item.tipo,
              )
            }}

          </v-chip>

        </template>

        <!-- CANTIDAD -->

        <template
          #item.cantidad="{ item }"
        >

          <div
            class="movement-quantity"
            :class="
              cantidadMovimiento(item) >= 0
                ? 'positive'
                : 'negative'
            "
          >

            <v-icon
              :icon="
                cantidadMovimiento(item) >= 0
                  ? 'mdi-arrow-up'
                  : 'mdi-arrow-down'
              "
              size="16"
            />

            <strong>

              {{
                formatoStock(
                  Math.abs(
                    cantidadMovimiento(
                      item,
                    ),
                  ),
                  item.producto?.unidad,
                )
              }}

            </strong>

          </div>

        </template>

        <!-- STOCK NUEVO -->

        <template
          #item.stockNuevo="{ item }"
        >

          <strong class="resulting-stock">
            {{
              formatoStock(
                item.stockNuevo,
                item.producto?.unidad,
              )
            }}
          </strong>

        </template>

        <!-- MIEMBRO -->

        <template #item.miembro="{ item }">

          <div class="member-cell">

            <div class="member-avatar">
              {{
                nombreMiembro(
                  item.miembro,
                )
                  .charAt(0)
                  .toUpperCase()
              }}
            </div>

            <span>
              {{
                nombreMiembro(
                  item.miembro,
                )
              }}
            </span>

          </div>

        </template>

        <!-- SIN DATOS -->

        <template #no-data>

          <div class="empty-state">

            <div class="empty-icon">
              <v-icon
                icon="mdi-history"
                size="30"
              />
            </div>

            <strong>
              No hay movimientos
            </strong>

            <span>
              Todavía no existen movimientos
              registrados.
            </span>

          </div>

        </template>

      </v-data-table>

    </v-card>

    <!-- ═══════════════════════════════════════ -->
    <!-- DIALOG NUEVO MOVIMIENTO                -->
    <!-- ═══════════════════════════════════════ -->

    <v-dialog
      v-model="movimientoDialog"
      max-width="680"
      persistent
    >

      <v-card class="modern-dialog">

        <div class="dialog-header">

          <div class="dialog-heading">

            <div class="dialog-icon">
              <v-icon
                icon="mdi-swap-vertical"
              />
            </div>

            <div>

              <span>
                INVENTARIO
              </span>

              <h2>
                Nuevo movimiento
              </h2>

            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            :disabled="
              movimientoLoading
            "
            @click="
              cerrarMovimiento
            "
          />

        </div>

        <v-divider />

        <v-card-text class="dialog-content">

          <div class="dialog-info">

            <v-icon
              icon="mdi-information-outline"
              size="20"
            />

            <span>
              Registra entradas o salidas
              manuales del inventario.
            </span>

          </div>

          <v-form
            @submit.prevent="
              registrarMovimiento
            "
          >

            <div class="form-section">

              <div class="form-section-title">
                Producto y movimiento
              </div>

              <v-row>

                <!-- PRODUCTO -->

                <v-col cols="12">

                  <v-select
                    v-model="
                      movimientoForm.productoId
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
                      movimientoLoading
                    "
                    hide-details="auto"
                    clearable
                  />

                </v-col>

                <!-- TIPO -->

                <v-col
                  cols="12"
                  md="6"
                >

                  <v-select
                    v-model="
                      movimientoForm.tipo
                    "
                    :items="
                      tiposMovimientoManual
                    "
                    item-title="title"
                    item-value="value"
                    label="Tipo de movimiento"
                    prepend-inner-icon="
                      mdi-swap-vertical
                    "
                    variant="outlined"
                    :disabled="
                      movimientoLoading
                    "
                    hide-details="auto"
                    clearable
                  />

                </v-col>

                <!-- CANTIDAD -->

                <v-col
                  cols="12"
                  md="6"
                >

                  <v-text-field
                    v-model.number="
                      movimientoForm.cantidad
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
                      movimientoLoading
                    "
                    hide-details="auto"
                  />

                </v-col>

              </v-row>

            </div>

            <!-- STOCK -->

            <div
              v-if="
                productoSeleccionado
              "
              class="selected-product"
            >

              <div class="selected-product-icon">
                <v-icon
                  icon="mdi-package-variant"
                />
              </div>

              <div>

                <span>
                  Stock actual
                </span>

                <strong>

                  {{
                    formatoStock(
                      productoSeleccionado.stockActual,
                      productoSeleccionado.unidad,
                    )
                  }}

                  {{
                    productoSeleccionado.unidad
                  }}

                </strong>

              </div>

              <v-chip
                :color="
                  colorEstado(
                    productoSeleccionado,
                  )
                "
                variant="tonal"
                size="small"
              >
                {{
                  textoEstado(
                    productoSeleccionado,
                  )
                }}
              </v-chip>

            </div>

            <!-- DETALLES -->

            <div class="form-section">

              <div class="form-section-title">
                Detalles
              </div>

              <v-row>

                <!-- OBSERVACIÓN -->

                <v-col cols="12">

                  <v-textarea
                    v-model="
                      movimientoForm.observacion
                    "
                    label="Observación"
                    placeholder="Describe el motivo del movimiento..."
                    rows="3"
                    variant="outlined"
                    :disabled="
                      movimientoLoading
                    "
                    hide-details="auto"
                  />

                </v-col>

                <!-- REFERENCIA -->

                <v-col
                  cols="12"
                  md="7"
                >

                  <v-text-field
                    v-model="
                      movimientoForm
                        .numeroReferencia
                    "
                    label="Número de referencia"
                    placeholder="Opcional"
                    prepend-inner-icon="
                      mdi-pound
                    "
                    variant="outlined"
                    :disabled="
                      movimientoLoading
                    "
                    hide-details="auto"
                  />

                </v-col>

                <!-- ID -->

                <v-col
                  cols="12"
                  md="5"
                >

                  <v-text-field
                    v-model.number="
                      movimientoForm
                        .referenciaId
                    "
                    label="ID referencia"
                    type="number"
                    placeholder="Opcional"
                    prepend-inner-icon="
                      mdi-identifier
                    "
                    variant="outlined"
                    :disabled="
                      movimientoLoading
                    "
                    hide-details="auto"
                  />

                </v-col>

              </v-row>

            </div>

            <!-- ACCIONES -->

            <div class="dialog-actions">

              <v-btn
                variant="text"
                :disabled="
                  movimientoLoading
                "
                @click="
                  cerrarMovimiento
                "
              >
                Cancelar
              </v-btn>

              <v-btn
                color="primary"
                type="submit"
                :loading="
                  movimientoLoading
                "
                prepend-icon="mdi-check"
                elevation="0"
              >
                Registrar movimiento
              </v-btn>

            </div>

          </v-form>

        </v-card-text>

      </v-card>

    </v-dialog>

    <!-- ═══════════════════════════════════════ -->
    <!-- DIALOG KARDEX                          -->
    <!-- ═══════════════════════════════════════ -->

    <v-dialog
      v-model="kardexDialog"
      max-width="1150"
    >

      <v-card class="modern-dialog">

        <div class="dialog-header">

          <div class="dialog-heading">

            <div class="dialog-icon">
              <v-icon
                icon="mdi-history"
              />
            </div>

            <div>

              <span>
                KARDEX
              </span>

              <h2>
                {{
                  kardex?.producto?.nombre ||
                  'Producto'
                }}
              </h2>

            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="
              kardexDialog = false
            "
          />

        </div>

        <v-divider />

        <v-card-text>

          <!-- LOADING -->

          <div
            v-if="kardexLoading"
            class="loading-container"
          >

            <v-progress-circular
              indeterminate
              size="44"
              width="3"
              color="primary"
            />

            <span>
              Cargando historial...
            </span>

          </div>

          <!-- KARDEX -->

          <template v-else-if="kardex">

            <!-- RESUMEN -->

            <div class="kardex-summary">

              <div class="kardex-product-card">

                <div class="kardex-summary-icon">
                  <v-icon
                    icon="mdi-package-variant"
                  />
                </div>

                <div>

                  <span>
                    Producto
                  </span>

                  <strong>
                    {{
                      kardex.producto.nombre
                    }}
                  </strong>

                </div>

              </div>

              <div class="kardex-stock-card">

                <div class="kardex-summary-icon">
                  <v-icon
                    icon="mdi-cube-outline"
                  />
                </div>

                <div>

                  <span>
                    Stock actual
                  </span>

                  <strong>

                    {{
                      formatoStock(
                        kardex.producto
                          .stockActual,
                        kardex.producto
                          .unidad,
                      )
                    }}

                    {{
                      kardex.producto.unidad
                    }}

                  </strong>

                </div>

              </div>

            </div>

            <!-- TABLA -->

            <div class="kardex-table-wrapper">

              <v-data-table
                :headers="[
                  {
                    title: 'Fecha',
                    key: 'fecha',
                  },
                  {
                    title: 'Movimiento',
                    key: 'tipo',
                  },
                  {
                    title: 'Cantidad',
                    key: 'cantidad',
                    align: 'end',
                  },
                  {
                    title: 'Stock anterior',
                    key: 'stockAnterior',
                    align: 'end',
                  },
                  {
                    title: 'Stock nuevo',
                    key: 'stockNuevo',
                    align: 'end',
                  },
                  {
                    title: 'Realizado por',
                    key: 'realizadoPor',
                  },
                  {
                    title: 'Observación',
                    key: 'observacion',
                  },
                ]"
                :items="
                  kardex.movimientos
                "
                density="comfortable"
                hover
              >

                <template
                  #item.fecha="{ item }"
                >

                  <div class="date-cell">

                    <strong>
                      {{
                        formatoFecha(
                          item.fecha,
                        ).split(',')[0]
                      }}
                    </strong>

                    <span>
                      {{
                        formatoFecha(
                          item.fecha,
                        ).split(',')[1]
                      }}
                    </span>

                  </div>

                </template>

                <template
                  #item.tipo="{ item }"
                >

                  <v-chip
                    :color="
                      colorTipoMovimiento(
                        item.tipo,
                      )
                    "
                    size="small"
                    variant="tonal"
                  >

                    <v-icon
                      start
                      :icon="
                        iconoMovimiento(
                          item.tipo,
                        )
                      "
                      size="15"
                    />

                    {{
                      textoTipoMovimiento(
                        item.tipo,
                      )
                    }}

                  </v-chip>

                </template>

                <template
                  #item.cantidad="{ item }"
                >

                  <div
                    class="movement-quantity"
                    :class="
                      cantidadMovimiento(
                        item,
                      ) >= 0
                        ? 'positive'
                        : 'negative'
                    "
                  >

                    <v-icon
                      :icon="
                        cantidadMovimiento(
                          item,
                        ) >= 0
                          ? 'mdi-arrow-up'
                          : 'mdi-arrow-down'
                      "
                      size="16"
                    />

                    <strong>

                      {{
                        formatoStock(
                          Math.abs(
                            cantidadMovimiento(
                              item,
                            ),
                          ),
                          kardex.producto
                            .unidad,
                        )
                      }}

                    </strong>

                  </div>

                </template>

                <template
                  #item.stockAnterior="{ item }"
                >

                  {{
                    formatoStock(
                      item.stockAnterior,
                      kardex.producto
                        .unidad,
                    )
                  }}

                </template>

                <template
                  #item.stockNuevo="{ item }"
                >

                  <strong>
                    {{
                      formatoStock(
                        item.stockNuevo,
                        kardex.producto
                          .unidad,
                      )
                    }}
                  </strong>

                </template>

                <template
                  #item.observacion="{ item }"
                >

                  <span class="observation">
                    {{
                      item.observacion || '-'
                    }}
                  </span>

                </template>

              </v-data-table>

            </div>

          </template>

        </v-card-text>

      </v-card>

    </v-dialog>

    <!-- SNACKBAR -->

    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3500"
      location="bottom right"
    >

      <div class="snackbar-content">

        <v-icon
          :icon="
            snackbarColor === 'error'
              ? 'mdi-alert-circle-outline'
              : 'mdi-check-circle-outline'
          "
        />

        {{ snackbarMessage }}

      </div>

      <template #actions>

        <v-btn
          variant="text"
          @click="
            snackbar = false
          "
        >
          Cerrar
        </v-btn>

      </template>

    </v-snackbar>

  </div>
</template>

<style scoped>

/* ═══════════════════════════════════════════
   BASE
═══════════════════════════════════════════ */

.inventario-page {
  padding: 28px;
  max-width: 1650px;
  margin: 0 auto;
  color: #172033;
}

/* ═══════════════════════════════════════════
   HEADER
═══════════════════════════════════════════ */

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}

.page-heading {
  min-width: 0;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.7px;
  color: #1976d2;
  margin-bottom: 7px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.5px;
  color: #172033;
}

.page-header p {
  margin: 7px 0 0;
  color: #778195;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ═══════════════════════════════════════════
   SUMMARY
═══════════════════════════════════════════ */

.summary-grid {
  display: grid;
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 18px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 14px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  border-color: #dce3ed;
  box-shadow:
    0 12px 30px
    rgba(30, 50, 80, 0.07);
}

.summary-icon {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 12px;
}

.summary-icon.blue {
  color: #1976d2;
  background: #edf5ff;
}

.summary-icon.green {
  color: #2e7d32;
  background: #edf8f0;
}

.summary-icon.orange {
  color: #c78300;
  background: #fff7e6;
}

.summary-icon.red {
  color: #d32f2f;
  background: #ffeded;
}

.summary-content {
  min-width: 0;
}

.summary-content span {
  display: block;
  font-size: 12px;
  color: #7b8596;
  margin-bottom: 2px;
}

.summary-content strong {
  display: block;
  font-size: 23px;
  line-height: 1.2;
  color: #172033;
}

.summary-content small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #9aa3b2;
}

/* ═══════════════════════════════════════════
   MAIN CARDS
═══════════════════════════════════════════ */

.main-card {
  overflow: hidden;
  border:
    1px solid #e6eaf0 !important;
  border-radius:
    15px !important;
  margin-bottom: 20px;
  background: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 21px 22px 16px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #edf5ff;
  color: #1976d2;
}

.card-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #172033;
}

.card-header p {
  margin: 3px 0 0;
  font-size: 12px;
  color: #8992a2;
}

.result-counter {
  padding: 6px 10px;
  border-radius: 8px;
  background: #f5f7fa;
  color: #7b8596;
  font-size: 12px;
  white-space: nowrap;
}

/* ═══════════════════════════════════════════
   FILTERS
═══════════════════════════════════════════ */

.filters-container {
  display: grid;
  grid-template-columns:
    minmax(250px, 1.5fr)
    minmax(190px, 1fr)
    minmax(190px, 1fr);
  gap: 10px;
  padding: 0 22px 18px;
}

.filters-container :deep(.v-field) {
  background: #f7f9fc !important;
  border-radius: 10px !important;
}

.filters-container :deep(.v-field__outline) {
  --v-field-border-opacity: 0;
}

/* ═══════════════════════════════════════════
   TABLE
═══════════════════════════════════════════ */

.inventory-table :deep(thead th),
.movements-table :deep(thead th) {
  background: #fafbfc;
  color: #7b8596 !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  height: 44px !important;
  border-bottom:
    1px solid #edf0f4 !important;
}

.inventory-table :deep(tbody td),
.movements-table :deep(tbody td) {
  border-bottom:
    1px solid #f0f2f5 !important;
  height: 64px !important;
}

.inventory-table :deep(tbody tr:hover),
.movements-table :deep(tbody tr:hover) {
  background: #fafcff !important;
}

/* ═══════════════════════════════════════════
   PRODUCT CELL
═══════════════════════════════════════════ */

.product-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 220px;
}

.product-avatar {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
}

.avatar-success {
  background: #edf8f0;
  color: #2e7d32;
}

.avatar-warning {
  background: #fff7e6;
  color: #c78300;
}

.avatar-error {
  background: #ffeded;
  color: #d32f2f;
}

.avatar-grey {
  background: #f0f2f5;
  color: #697386;
}

.product-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.product-info strong {
  color: #273247;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.product-info span {
  color: #98a0ae;
  font-size: 11px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-label {
  color: #687386;
  font-size: 12px;
}

.stock-cell {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 5px;
}

.stock-cell strong {
  font-size: 14px;
  color: #273247;
}

.stock-cell span {
  font-size: 10px;
  color: #9aa3b2;
}

.stock-warning {
  color: #c78300 !important;
}

.stock-danger {
  color: #d32f2f !important;
}

.minimum-stock {
  color: #7b8596;
  font-size: 13px;
}

.unit-label {
  display: inline-flex;
  padding: 4px 7px;
  border-radius: 6px;
  background: #f4f6f8;
  color: #737d8d;
  font-size: 10px;
  font-weight: 600;
}

.status-chip {
  font-weight: 600;
}

/* ═══════════════════════════════════════════
   MOVEMENTS
═══════════════════════════════════════════ */

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.date-cell strong {
  font-size: 12px;
  font-weight: 600;
  color: #3d4759;
}

.date-cell span {
  font-size: 11px;
  color: #9aa3b2;
}

.movement-product {
  display: flex;
  align-items: center;
  gap: 9px;
}

.movement-product strong {
  color: #3d4759;
  font-size: 12px;
  font-weight: 600;
}

.movement-product-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: #f2f6fb;
  color: #5d7390;
}

.movement-quantity {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 13px;
}

.movement-quantity.positive {
  color: #2e7d32;
}

.movement-quantity.negative {
  color: #d32f2f;
}

.resulting-stock {
  font-size: 13px;
  color: #3d4759;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-cell span {
  color: #687386;
  font-size: 12px;
}

.member-avatar {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #edf3fa;
  color: #55708f;
  font-size: 11px;
  font-weight: 700;
}

/* ═══════════════════════════════════════════
   EMPTY
═══════════════════════════════════════════ */

.empty-state {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 7px;
  color: #929baa;
}

.empty-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  margin-bottom: 4px;
  border-radius: 14px;
  background: #f3f5f8;
  color: #9aa3b2;
}

.empty-state strong {
  color: #465064;
  font-size: 13px;
}

.empty-state span {
  font-size: 12px;
}

/* ═══════════════════════════════════════════
   DIALOG
═══════════════════════════════════════════ */

.modern-dialog {
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 17px 20px;
}

.dialog-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.dialog-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #edf5ff;
  color: #1976d2;
}

.dialog-heading span {
  display: block;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #1976d2;
}

.dialog-heading h2 {
  margin: 3px 0 0;
  color: #172033;
  font-size: 19px;
  font-weight: 700;
}

.dialog-content {
  padding: 20px !important;
}

.dialog-info {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px 14px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: #f3f7fc;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.dialog-info .v-icon {
  flex: 0 0 auto;
  color: #1976d2;
}

.form-section {
  margin-bottom: 20px;
}

.form-section-title {
  margin-bottom: 12px;
  color: #3d4759;
  font-size: 12px;
  font-weight: 700;
}

.selected-product {
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 2px 0 20px;
  padding: 12px 14px;
  border: 1px solid #e7ebf1;
  border-radius: 11px;
  background: #fafbfd;
}

.selected-product-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #edf5ff;
  color: #1976d2;
}

.selected-product > div:nth-child(2) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.selected-product span {
  font-size: 11px;
  color: #8992a2;
}

.selected-product strong {
  font-size: 14px;
  color: #273247;
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  padding-top: 4px;
}

/* ═══════════════════════════════════════════
   KARDEX
═══════════════════════════════════════════ */

.loading-container {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #8992a2;
  font-size: 12px;
}

.kardex-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

.kardex-product-card,
.kardex-stock-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid #e7ebf1;
  border-radius: 11px;
}

.kardex-product-card {
  background: #fafcff;
}

.kardex-stock-card {
  background: #f9fcfa;
}

.kardex-summary-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  flex: 0 0 40px;
  border-radius: 10px;
  background: #edf5ff;
  color: #1976d2;
}

.kardex-stock-card
.kardex-summary-icon {
  background: #edf8f0;
  color: #2e7d32;
}

.kardex-summary span {
  display: block;
  font-size: 11px;
  color: #8992a2;
  margin-bottom: 3px;
}

.kardex-summary strong {
  display: block;
  color: #273247;
  font-size: 14px;
}

.kardex-table-wrapper {
  overflow: hidden;
  border: 1px solid #e7ebf1;
  border-radius: 11px;
}

.observation {
  display: block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #7b8596;
  font-size: 12px;
}

/* ═══════════════════════════════════════════
   SNACKBAR
═══════════════════════════════════════════ */

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 9px;
}

/* ═══════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════ */

@media (max-width: 1200px) {

  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .filters-container {
    grid-template-columns: 1fr 1fr;
  }

  .filter-search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 800px) {

  .inventario-page {
    padding: 20px;
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

  .card-header {
    padding-left: 17px;
    padding-right: 17px;
  }

  .filters-container {
    grid-template-columns: 1fr;
    padding-left: 17px;
    padding-right: 17px;
  }

  .filter-search {
    grid-column: auto;
  }

  .kardex-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {

  .inventario-page {
    padding: 14px;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .title-row {
    flex-wrap: wrap;
  }

  .header-actions {
    flex-direction: column;
  }

  .header-actions .v-btn {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-card {
    padding: 15px;
  }

  .result-counter {
    display: none;
  }

  .section-heading {
    min-width: 0;
  }

  .card-header {
    align-items: flex-start;
  }

  .card-header h2 {
    font-size: 16px;
  }

  .movements-card
  .card-header .v-chip {
    display: none;
  }

  .dialog-content {
    padding: 16px !important;
  }
}

</style>