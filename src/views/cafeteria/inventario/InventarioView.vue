```vue
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
  const texto = search.value
    .trim()
    .toLowerCase()

  return productos.value.filter((producto) => {
    const coincideBusqueda =
      !texto ||
      producto.nombre
        ?.toLowerCase()
        .includes(texto)

    const coincideCategoria =
      !categoriaFiltro.value ||
      producto.categoria?.id ===
        categoriaFiltro.value

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
  const estado = obtenerEstado(producto)

  const estados = {
    NORMAL: 'Normal',
    BAJO: 'Stock bajo',
    AGOTADO: 'Agotado',
    NO_CONTROLADO: 'No controlado',
  }

  return estados[estado] || estado
}

function colorEstado(producto) {
  const estado = obtenerEstado(producto)

  const colores = {
    NORMAL: 'success',
    BAJO: 'warning',
    AGOTADO: 'error',
    NO_CONTROLADO: 'grey',
  }

  return colores[estado] || 'grey'
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

  // Validación visual antes de llegar al backend
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

    <!-- HEADER -->
    <div class="page-header">

      <div>
        <div class="eyebrow">
          CAFETERÍA
        </div>

        <h1>
          Inventario
        </h1>

        <p>
          Control de existencias y movimientos
        </p>
      </div>

      <div class="header-actions">

        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="
            loading || loadingMovimientos
          "
          @click="cargarTodo"
        >
          Actualizar
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="abrirMovimiento"
        >
          Nuevo movimiento
        </v-btn>

      </div>

    </div>

    <!-- RESUMEN -->
    <div class="summary-grid">

      <!-- Productos -->
      <div class="summary-card">

        <div class="summary-icon">
          <v-icon
            icon="mdi-package-variant"
          />
        </div>

        <div>
          <span>
            Productos
          </span>

          <strong>
            {{ totalProductos }}
          </strong>
        </div>

      </div>

      <!-- Bajo stock -->
      <div class="summary-card">

        <div
          class="
            summary-icon
            warning-icon
          "
        >
          <v-icon
            icon="mdi-alert-outline"
          />
        </div>

        <div>
          <span>
            Stock bajo
          </span>

          <strong>
            {{ productosBajoStock }}
          </strong>
        </div>

      </div>

      <!-- Agotados -->
      <div class="summary-card">

        <div
          class="
            summary-icon
            danger-icon
          "
        >
          <v-icon
            icon="
              mdi-package-variant-closed-remove
            "
          />
        </div>

        <div>
          <span>
            Agotados
          </span>

          <strong>
            {{ productosAgotados }}
          </strong>
        </div>

      </div>

      <!-- Normal -->
      <div class="summary-card">

        <div
          class="
            summary-icon
            success-icon
          "
        >
          <v-icon
            icon="mdi-check-circle-outline"
          />
        </div>

        <div>
          <span>
            Stock normal
          </span>

          <strong>
            {{ productosStockNormal }}
          </strong>
        </div>

      </div>

    </div>

    <!-- INVENTARIO ACTUAL -->
    <v-card
      class="main-card"
      elevation="0"
    >

      <div class="card-header">

        <div>
          <h2>
            Existencias
          </h2>

          <p>
            Estado actual de los productos
          </p>
        </div>

      </div>

      <!-- FILTROS -->
      <div class="filters">

        <v-text-field
          v-model="search"
          label="Buscar producto"
          placeholder="Nombre del producto..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />

        <v-select
          v-model="categoriaFiltro"
          :items="categoriasActivas"
          item-title="nombre"
          item-value="id"
          label="Categoría"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />

        <v-select
          v-model="estadoFiltro"
          :items="[
            {
              title: 'Todos',
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
          label="Estado"
          variant="outlined"
          density="comfortable"
          hide-details
        />

      </div>

      <!-- TABLA INVENTARIO -->
      <v-data-table
        :headers="[
          {
            title: 'Producto',
            key: 'nombre',
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
            title: 'Stock mínimo',
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
            title: 'Acciones',
            key: 'acciones',
            sortable: false,
            align: 'end',
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

          <div class="product-name">

            <strong>
              {{ item.nombre }}
            </strong>

            <span
              v-if="item.descripcion"
            >
              {{ item.descripcion }}
            </span>

          </div>

        </template>

        <!-- CATEGORÍA -->
        <template
          #item.categoria.nombre="{ item }"
        >
          {{
            item.categoria?.nombre ||
            'Sin categoría'
          }}
        </template>

        <!-- STOCK -->
        <template
          #item.stockActual="{ item }"
        >

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

        </template>

        <!-- STOCK MÍNIMO -->
        <template
          #item.stockMinimo="{ item }"
        >
          {{
            formatoStock(
              item.stockMinimo,
              item.unidad,
            )
          }}
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
          >
            {{ textoEstado(item) }}
          </v-chip>

        </template>

        <!-- ACCIONES -->
        <template
          #item.acciones="{ item }"
        >

          <v-tooltip
            text="Ver kardex"
          >

            <template
              #activator="{ props }"
            >

              <v-btn
                v-bind="props"
                icon="mdi-history"
                variant="text"
                size="small"
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

            <v-icon
              icon="mdi-package-variant"
              size="42"
            />

            <strong>
              No hay productos
            </strong>

            <span>
              No se encontraron productos
              con los filtros actuales.
            </span>

          </div>

        </template>

      </v-data-table>

    </v-card>

    <!-- ÚLTIMOS MOVIMIENTOS -->
    <v-card
      class="
        main-card
        movements-card
      "
      elevation="0"
    >

      <div class="card-header">

        <div>
          <h2>
            Últimos movimientos
          </h2>

          <p>
            Historial reciente del inventario
          </p>
        </div>

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
      >

        <!-- FECHA -->
        <template
          #item.createdAt="{ item }"
        >
          {{ formatoFecha(item.createdAt) }}
        </template>

        <!-- PRODUCTO -->
        <template
          #item.producto.nombre="{ item }"
        >
          {{
            item.producto?.nombre || '-'
          }}
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

          <strong
            :class="
              cantidadMovimiento(item) >= 0
                ? 'movement-positive'
                : 'movement-negative'
            "
          >

            {{
              cantidadMovimiento(item) >= 0
                ? '+'
                : ''
            }}{{
              formatoStock(
                Math.abs(
                  cantidadMovimiento(item),
                ),
                item.producto?.unidad,
              )
            }}

          </strong>

        </template>

        <!-- STOCK NUEVO -->
        <template
          #item.stockNuevo="{ item }"
        >

          {{
            formatoStock(
              item.stockNuevo,
              item.producto?.unidad,
            )
          }}

        </template>

        <!-- MIEMBRO -->
        <template #item.miembro="{ item }">

          {{ nombreMiembro(item.miembro) }}

        </template>

        <!-- SIN DATOS -->
        <template #no-data>

          <div class="empty-state">

            <v-icon
              icon="mdi-history"
              size="42"
            />

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
      max-width="650"
      persistent
    >

      <v-card>

        <v-card-title
          class="dialog-title"
        >

          <div>

            <span>
              INVENTARIO
            </span>

            <h2>
              Nuevo movimiento
            </h2>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="
              movimientoLoading
            "
            @click="
              cerrarMovimiento
            "
          />

        </v-card-title>

        <v-divider />

        <v-card-text>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-5"
          >
            Utiliza esta opción para
            registrar ajustes, donaciones,
            vencimientos, consumo interno
            o el inventario inicial.
          </v-alert>

          <v-form
            @submit.prevent="
              registrarMovimiento
            "
          >

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

              <!-- STOCK ACTUAL -->
              <v-col
                v-if="
                  movimientoForm.productoId
                "
                cols="12"
              >

                <div
                  class="current-stock"
                >

                  <span>
                    Stock actual
                  </span>

                  <strong>

                    {{
                      formatoStock(
                        productos.find(
                          p =>
                            p.id ===
                            Number(
                              movimientoForm.productoId,
                            ),
                        )?.stockActual,
                        productos.find(
                          p =>
                            p.id ===
                            Number(
                              movimientoForm.productoId,
                            ),
                        )?.unidad,
                      )
                    }}

                    {{
                      productos.find(
                        p =>
                          p.id ===
                          Number(
                            movimientoForm.productoId,
                          ),
                      )?.unidad
                    }}

                  </strong>

                </div>

              </v-col>

              <!-- OBSERVACIÓN -->
              <v-col cols="12">

                <v-textarea
                  v-model="
                    movimientoForm.observacion
                  "
                  label="Observación"
                  placeholder="
                    Motivo del movimiento...
                  "
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
                  variant="outlined"
                  :disabled="
                    movimientoLoading
                  "
                  hide-details="auto"
                />

              </v-col>

              <!-- ID REFERENCIA -->
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
                  variant="outlined"
                  :disabled="
                    movimientoLoading
                  "
                  hide-details="auto"
                />

              </v-col>

            </v-row>

            <!-- ACCIONES -->
            <div
              class="dialog-actions"
            >

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
      max-width="1100"
    >

      <v-card>

        <v-card-title
          class="dialog-title"
        >

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

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="
              kardexDialog = false
            "
          />

        </v-card-title>

        <v-divider />

        <v-card-text>

          <!-- LOADING -->
          <div
            v-if="kardexLoading"
            class="loading-container"
          >

            <v-progress-circular
              indeterminate
              size="42"
            />

          </div>

          <!-- KARDEX -->
          <template
            v-else-if="kardex"
          >

            <!-- RESUMEN KARDEX -->
            <div
              class="kardex-summary"
            >

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

            <!-- TABLA KARDEX -->
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

                {{
                  formatoFecha(
                    item.fecha,
                  )
                }}

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

                <strong
                  :class="
                    cantidadMovimiento(
                      item,
                    ) >= 0
                      ? 'movement-positive'
                      : 'movement-negative'
                  "
                >

                  {{
                    cantidadMovimiento(
                      item,
                    ) >= 0
                      ? '+'
                      : ''
                  }}{{
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

                {{
                  formatoStock(
                    item.stockNuevo,
                    kardex.producto
                      .unidad,
                  )
                }}

              </template>

              <template
                #item.observacion="{ item }"
              >

                {{
                  item.observacion || '-'
                }}

              </template>

            </v-data-table>

          </template>

        </v-card-text>

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
.inventario-page {
  padding: 28px;
  max-width: 1600px;
  margin: 0 auto;
}

/* ─────────────────────────────────────────────
   HEADER
───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   RESUMEN
───────────────────────────────────────────── */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  font-size: 25px;
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

.warning-icon {
  background: #fff6df;
  color: #c78300;
}

.danger-icon {
  background: #ffebeb;
  color: #d32f2f;
}

.success-icon {
  background: #eaf8ef;
  color: #2e7d32;
}

/* ─────────────────────────────────────────────
   CARDS
───────────────────────────────────────────── */

.main-card {
  overflow: hidden;
  border:
    1px solid #e7ebf1 !important;
  border-radius:
    14px !important;
  margin-bottom: 22px;
}

.card-header {
  display: flex;
  justify-content: space-between;
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

/* ─────────────────────────────────────────────
   FILTROS
───────────────────────────────────────────── */

.filters {
  display: grid;
  grid-template-columns:
    1.5fr 1fr 1fr;
  gap: 14px;
  padding:
    18px 24px 20px;
}

/* ─────────────────────────────────────────────
   PRODUCTO
───────────────────────────────────────────── */

.product-name {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.product-name strong {
  color: #172033;
}

.product-name span {
  font-size: 12px;
  color: #8992a2;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unit-label {
  font-size: 12px;
  color: #667085;
}

/* ─────────────────────────────────────────────
   STOCK
───────────────────────────────────────────── */

.stock-warning {
  color: #c78300;
}

.stock-danger {
  color: #d32f2f;
}

/* ─────────────────────────────────────────────
   MOVIMIENTOS
───────────────────────────────────────────── */

.movement-positive {
  color: #2e7d32;
}

.movement-negative {
  color: #d32f2f;
}

/* ─────────────────────────────────────────────
   EMPTY
───────────────────────────────────────────── */

.empty-state {
  min-height: 180px;
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

/* ─────────────────────────────────────────────
   DIALOG
───────────────────────────────────────────── */

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

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.current-stock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 10px;
  background: #f5f8fc;
  border: 1px solid #e5eaf1;
}

.current-stock span {
  font-size: 13px;
  color: #758095;
}

.current-stock strong {
  font-size: 17px;
  color: #172033;
}

/* ─────────────────────────────────────────────
   KARDEX
───────────────────────────────────────────── */

.loading-container {
  min-height: 250px;
  display: grid;
  place-items: center;
}

.kardex-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.kardex-summary > div {
  padding: 15px;
  background: #f7f9fc;
  border-radius: 10px;
}

.kardex-summary span {
  display: block;
  font-size: 12px;
  color: #7b8596;
  margin-bottom: 4px;
}

.kardex-summary strong {
  font-size: 16px;
  color: #172033;
}

/* ─────────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────────── */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .filters {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .inventario-page {
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

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .kardex-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
  }

  .header-actions .v-btn {
    width: 100%;
  }
}
</style>
```

### Ruta

Si todavía no la agregaste:

```js
{
  path: 'cafeteria/inventario',
  name: 'Inventario cafetería',
  component: () =>
    import('../views/cafeteria/inventario/InventarioView.vue'),
},
```

### Y este frontend espera este POST

```text
POST /cafeteria/inventario
```

con:

```json
{
  "productoId": 1,
  "tipo": "AJUSTE_NEGATIVO",
  "cantidad": 2,
  "observacion": "Diferencia encontrada durante conteo físico"
}
```

Por ahora, si todavía no implementaste el `POST` en NestJS, **todo lo demás de la pantalla debería funcionar**. El botón de movimiento naturalmente fallará hasta que exista ese endpoint.
