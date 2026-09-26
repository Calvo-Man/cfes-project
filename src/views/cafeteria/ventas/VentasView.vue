<template>
  <v-container fluid class="pa-4">
    <!-- ENCABEZADO -->
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
        <h1 class="text-h5 font-weight-bold">
          Ventas
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Punto de venta de la cafetería
        </p>
      </div>

      <v-btn color="primary" variant="outlined" prepend-icon="mdi-history" @click="abrirHistorial">
        Historial
      </v-btn>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <v-row>
      <!-- PRODUCTOS -->
      <v-col cols="12" lg="8">
        <v-card rounded="lg" border elevation="0">
          <v-card-title class="pa-4">
            <div class="d-flex flex-column flex-md-row ga-3 w-100">
              <!-- BUSCADOR -->
              <v-text-field v-model="busqueda" label="Buscar producto" placeholder="Ej. Papas, jugo, agua..."
                prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable
                class="flex-grow-1" />

              <!-- CATEGORÍA -->
              <v-select v-model="categoriaSeleccionada" :items="categoriasFiltro" item-title="nombre" item-value="id"
                label="Categoría" prepend-inner-icon="mdi-filter-variant" variant="outlined" density="comfortable"
                hide-details clearable style="max-width: 240px" />
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <!-- LOADING -->
            <div v-if="loadingProductos" class="d-flex justify-center align-center py-12">
              <div class="text-center">
                <v-progress-circular indeterminate color="primary" size="40" />

                <div class="text-body-2 text-medium-emphasis mt-3">
                  Cargando productos...
                </div>
              </div>
            </div>

            <!-- SIN PRODUCTOS -->
            <div v-else-if="productosFiltrados.length === 0" class="text-center py-12">
              <v-icon icon="mdi-package-variant-closed" size="60" color="grey" />

              <div class="text-h6 mt-3">
                No encontramos productos
              </div>

              <div class="text-body-2 text-medium-emphasis mt-1">
                Intenta cambiar la búsqueda o el filtro.
              </div>
            </div>

            <!-- PRODUCTOS -->
            <v-row v-else>
              <v-col v-for="producto in productosFiltrados" :key="producto.id" cols="12" sm="6" md="4" xl="3">
                <v-card class="producto-card h-100" border elevation="0" rounded="lg"
                  :disabled="producto.controlaInventario && Number(producto.stockActual) <= 0"
                  @click="agregarAlCarrito(producto)">
                  <!-- IMAGEN -->
                  <div class="producto-imagen">
                    <v-img v-if="producto.imagen" :src="producto.imagen" height="130" cover />

                    <v-icon v-else icon="mdi-food-outline" size="48" color="grey-lighten-1" />
                  </div>

                  <v-card-text class="pa-3">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">
                      {{ producto.nombre }}
                    </div>

                    <div class="text-caption text-medium-emphasis mb-2">
                      {{ producto.categoria?.nombre || 'Sin categoría' }}
                    </div>

                    <div class="d-flex align-center justify-space-between">
                      <span class="text-h6 font-weight-bold text-primary">
                        {{ formatoMoneda(producto.precioVenta) }}
                      </span>

                      <v-chip v-if="producto.controlaInventario" size="x-small" :color="colorStock(producto)"
                        variant="tonal">
                        {{ formatoStock(producto.stockActual, producto.unidad) }}
                      </v-chip>

                      <v-chip v-else size="x-small" color="blue" variant="tonal">
                        Sin inventario
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <!-- CARRITO -->
      <v-col cols="12" lg="4">
        <v-card rounded="lg" border elevation="0" class="carrito-card">
          <!-- HEADER -->
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center ga-2">
              <v-icon icon="mdi-cart-outline" />

              <span class="font-weight-bold">
                Carrito
              </span>
            </div>

            <v-chip v-if="carrito.length" color="primary" size="small" variant="tonal">
              {{ cantidadProductosCarrito }} productos
            </v-chip>
          </v-card-title>

          <v-divider />

          <!-- CARRITO VACÍO -->
          <div v-if="carrito.length === 0" class="text-center py-12 px-4">
            <v-icon icon="mdi-cart-outline" size="64" color="grey-lighten-1" />

            <div class="text-h6 mt-3">
              Carrito vacío
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              Selecciona productos para comenzar una venta.
            </div>
          </div>

          <!-- CARRITO CON PRODUCTOS -->
          <div v-else>
            <!-- PRODUCTOS -->
            <v-list class="pa-2" lines="two">
              <v-list-item v-for="item in carrito" :key="item.producto.id" class="mb-1" rounded="lg">
                <template #prepend>
                  <v-avatar rounded="lg" color="grey-lighten-4" size="48">
                    <v-img v-if="item.producto.imagen" :src="item.producto.imagen" cover />

                    <v-icon v-else icon="mdi-food-outline" color="grey" />
                  </v-avatar>
                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ item.producto.nombre }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  {{ formatoMoneda(item.producto.precioVenta) }}
                  × {{ item.cantidad }}
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center ga-1">
                    <v-btn icon="mdi-minus" size="x-small" variant="tonal" @click.stop="disminuirCantidad(item)" />

                    <span class="cantidad">
                      {{ item.cantidad }}
                    </span>

                    <v-btn icon="mdi-plus" size="x-small" variant="tonal" :disabled="!puedeAumentar(item)"
                      @click.stop="aumentarCantidad(item)" />

                    <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text"
                      @click.stop="eliminarDelCarrito(item)" />
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <v-divider />

            <!-- RESUMEN -->
            <div class="pa-4">

              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-medium-emphasis">
                  Subtotal
                </span>

                <strong>
                  {{ formatoMoneda(subtotal) }}
                </strong>
              </div>

              <div class="d-flex justify-space-between align-center mb-4">
                <span class="text-h6 font-weight-bold">
                  Total
                </span>

                <span class="text-h5 font-weight-bold text-primary">
                  {{ formatoMoneda(subtotal) }}
                </span>
              </div>

              <!-- PROCEDER -->
              <v-btn color="primary" size="large" block prepend-icon="mdi-arrow-right-circle-outline"
                :disabled="carrito.length === 0" @click="procederAVenta">
                Proceder a venta
              </v-btn>

              <!-- VACIAR -->
              <v-btn v-if="carrito.length" variant="text" color="error" block class="mt-2" @click="limpiarCarrito">
                Vaciar carrito
              </v-btn>

            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <!-- DIÁLOGO REGISTRAR VENTA -->
    <v-dialog v-model="ventaDialog" max-width="600" persistent>
      <v-card rounded="lg">

        <!-- HEADER -->
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-receipt-text-outline" class="mr-2" />

          <span class="font-weight-bold">
            Registrar venta
          </span>

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" :disabled="guardandoVenta" @click="cerrarVentaDialog" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">

          <!-- RESUMEN DE VENTA -->
          <v-card variant="tonal" rounded="lg" class="pa-4 mb-5">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">
                Productos
              </span>

              <strong>
                {{ cantidadProductosCarrito }}
              </strong>
            </div>

            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">
                Subtotal
              </span>

              <strong>
                {{ formatoMoneda(subtotal) }}
              </strong>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex justify-space-between align-center">
              <span class="text-h6 font-weight-bold">
                Total
              </span>

              <span class="text-h5 font-weight-bold text-primary">
                {{ formatoMoneda(total) }}
              </span>
            </div>
          </v-card>

          <!-- DESCUENTO -->
          <v-text-field v-model.number="descuento" label="Descuento" type="number" min="0" :max="subtotal"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-tag-outline" class="mb-4" hide-details />

          <!-- MÉTODO DE PAGO -->
          <div class="text-subtitle-2 font-weight-bold mb-2">
            Método de pago
          </div>

          <v-btn-toggle v-model="metodoPago" mandatory divided class="w-100 mb-4 metodo-pago">
            <v-btn value="EFECTIVO" class="metodo-pago-btn">
              <v-icon icon="mdi-cash" class="mr-1" />
              Efectivo
            </v-btn>

            <v-btn value="TRANSFERENCIA" class="metodo-pago-btn">
              <v-icon icon="mdi-bank-transfer" class="mr-1" />
              Transferencia
            </v-btn>

            <v-btn value="NEQUI" class="metodo-pago-btn">
              <v-icon icon="mdi-cellphone" class="mr-1" />
              Nequi
            </v-btn>

            <v-btn value="DAVIPLATA" class="metodo-pago-btn">
              <v-icon icon="mdi-cellphone" class="mr-1" />
              Daviplata
            </v-btn>

            <v-btn value="TARJETA" class="metodo-pago-btn">
              <v-icon icon="mdi-credit-card-outline" class="mr-1" />
              Tarjeta
            </v-btn>

            <v-btn value="CREDITO" class="metodo-pago-btn">
              <v-icon icon="mdi-account-clock-outline" class="mr-1" />
              Crédito
            </v-btn>
          </v-btn-toggle>

          <!-- CLIENTE -->
          <v-expand-transition>
            <div v-if="metodoPago === 'CREDITO'" class="mb-4">
              <v-alert type="info" variant="tonal" density="comfortable" icon="mdi-account-credit-card-outline"
                class="mb-3">
                Esta venta quedará registrada como cuenta por cobrar.
              </v-alert>

              <v-card v-if="clienteSeleccionado" variant="tonal" rounded="lg" class="pa-3">
                <div class="d-flex align-center">

                  <v-avatar color="primary" size="42" class="mr-3">
                    <v-icon icon="mdi-account" />
                  </v-avatar>

                  <div class="flex-grow-1">

                    <div class="font-weight-medium">
                      {{ clienteSeleccionado.nombre }}
                      {{ clienteSeleccionado.apellido }}
                    </div>

                    <div class="text-caption text-medium-emphasis">
                      C.C. {{ clienteSeleccionado.cedula }}
                    </div>

                    <div v-if="clienteSeleccionado.telefono" class="text-caption text-medium-emphasis">
                      {{ clienteSeleccionado.telefono }}
                    </div>

                  </div>

                  <v-btn icon="mdi-close" size="small" variant="text" @click="clienteSeleccionado = null" />

                </div>

                <v-divider class="my-3" />

                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2 text-medium-emphasis">
                    Deuda generada
                  </span>

                  <strong class="text-primary">
                    {{ formatoMoneda(total) }}
                  </strong>
                </div>
              </v-card>

              <!-- BUSCAR CLIENTE -->
              <v-btn v-else block variant="outlined" color="primary" prepend-icon="mdi-account-search-outline"
                @click="abrirSelectorCliente">
                Buscar cliente
              </v-btn>

              <v-btn block variant="text" color="primary" prepend-icon="mdi-account-plus-outline" class="mt-2"
                @click="abrirRegistrarCliente">
                Registrar nuevo cliente
              </v-btn>
            </div>
          </v-expand-transition>

          <!-- OBSERVACIÓN -->
          <v-textarea v-model="observacion" label="Observación" placeholder="Opcional" variant="outlined"
            density="comfortable" rows="2" auto-grow maxlength="500" hide-details />

        </v-card-text>

        <v-divider />

        <!-- ACCIONES -->
        <v-card-actions class="pa-4">

          <v-btn variant="text" :disabled="guardandoVenta" @click="cerrarVentaDialog">
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn color="primary" variant="flat" :loading="guardandoVenta" :disabled="total <= 0 ||
            (metodoPago === 'CREDITO' && !clienteSeleccionado)
            " prepend-icon="mdi-check" @click="registrarVenta">
            Registrar venta
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>
    <!-- DIALOGO HISTORIAL -->
    <v-dialog v-model="mostrarHistorial" max-width="1000" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>
            Historial de ventas
          </span>

          <v-btn icon="mdi-close" variant="text" @click="mostrarHistorial = false" />
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-progress-linear v-if="loadingHistorial" indeterminate color="primary" class="mb-4" />

          <v-data-table :headers="headersHistorial" :items="ventas" :loading="loadingHistorial" item-value="id"
            density="comfortable">
            <template #item.total="{ item }">
              {{ formatoMoneda(item.total) }}
            </template>

            <template #item.metodoPago="{ item }">
              <v-chip size="small" variant="tonal">
                {{ textoMetodoPago(item.metodoPago) }}
              </v-chip>
            </template>

            <template #item.estado="{ item }">
              <v-chip size="small" :color="item.estado === 'COMPLETADA' ? 'success' : 'error'" variant="tonal">
                {{ item.estado }}
              </v-chip>
            </template>

            <template #item.createdAt="{ item }">
              {{ formatoFecha(item.createdAt) }}
            </template>

            <template #item.acciones="{ item }">
              <v-btn icon="mdi-eye-outline" size="small" variant="text" @click="verVenta(item)" />
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- DETALLE DE VENTA -->
    <v-dialog v-model="mostrarDetalle" max-width="600">
      <v-card rounded="lg">
        <v-card-title>
          Detalle de venta
        </v-card-title>

        <v-divider />

        <v-card-text v-if="ventaSeleccionada">
          <div class="d-flex justify-space-between mb-4">
            <span class="text-body-2">
              Venta #{{ ventaSeleccionada.numeroVenta }}
            </span>

            <v-chip size="small" :color="ventaSeleccionada.estado === 'COMPLETADA'
              ? 'success'
              : 'error'
              " variant="tonal">
              {{ ventaSeleccionada.estado }}
            </v-chip>
          </div>

          <div v-for="detalle in ventaSeleccionada.detalles || []" :key="detalle.id"
            class="d-flex justify-space-between mb-3">
            <div>
              <div class="font-weight-medium">
                {{ detalle.producto?.nombre || `Producto #${detalle.productoId}` }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ detalle.cantidad }} ×
                {{ formatoMoneda(detalle.precioUnitario) }}
              </div>
            </div>

            <strong>
              {{ formatoMoneda(detalle.subtotal) }}
            </strong>
          </div>

          <v-divider class="my-4" />

          <div class="d-flex justify-space-between mb-2">
            <span>Subtotal</span>
            <strong>
              {{ formatoMoneda(ventaSeleccionada.subtotal) }}
            </strong>
          </div>

          <div class="d-flex justify-space-between mb-2">
            <span>Descuento</span>
            <strong>
              {{ formatoMoneda(ventaSeleccionada.descuento) }}
            </strong>
          </div>

          <div class="d-flex justify-space-between text-h6">
            <span>Total</span>
            <strong class="text-primary">
              {{ formatoMoneda(ventaSeleccionada.total) }}
            </strong>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />

          <v-btn variant="text" @click="mostrarDetalle = false">
            Cerrar
          </v-btn>

          <v-btn v-if="
            ventaSeleccionada &&
            ventaSeleccionada.estado === 'COMPLETADA'
          " color="error" variant="tonal" :loading="anulandoVenta" @click="anularVenta">
            Anular venta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="clienteDialog" max-width="450">
      <v-card rounded="lg">

        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-account-search-outline" class="mr-2" />

          <span class="font-weight-bold">
            Buscar cliente
          </span>

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" @click="clienteDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">

          <div class="text-body-2 text-medium-emphasis mb-4">
            Ingresa la cédula del cliente para buscarlo.
          </div>

          <v-text-field v-model="cedulaCliente" label="Cédula" placeholder="Ej. 1234567890" variant="outlined"
            density="comfortable" prepend-inner-icon="mdi-card-account-details-outline" :error-messages="errorCliente"
            :loading="buscandoCliente" @keyup.enter="buscarCliente" />

          <v-btn block variant="text" color="primary" prepend-icon="mdi-account-plus-outline" class="mt-2"
            @click="abrirRegistrarCliente">
            Registrar nuevo cliente
          </v-btn>

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-btn variant="text" @click="clienteDialog = false">
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn color="primary" variant="flat" :loading="buscandoCliente" :disabled="!cedulaCliente.trim()"
            prepend-icon="mdi-magnify" @click="buscarCliente">
            Buscar
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- REGISTRAR CLIENTE -->
    <v-dialog v-model="registrarClienteDialog" max-width="500">
      <v-card rounded="lg">

        <!-- HEADER -->
        <v-card-title class="d-flex align-center pa-4">
          <v-icon icon="mdi-account-plus-outline" class="mr-2" />

          <span class="font-weight-bold">
            Registrar cliente
          </span>

          <v-spacer />

          <v-btn icon="mdi-close" variant="text" :disabled="guardandoCliente" @click="registrarClienteDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">

          <div class="text-body-2 text-medium-emphasis mb-4">
            Registra los datos del cliente para asociarlo a la venta a crédito.
          </div>

          <!-- CÉDULA -->
          <v-text-field v-model="nuevoCliente.cedula" label="Cédula" placeholder="Número de identificación"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-card-account-details-outline"
            :error-messages="erroresCliente.cedula" class="mb-2" />

          <!-- NOMBRE -->
          <v-text-field v-model="nuevoCliente.nombre" label="Nombre" placeholder="Nombre del cliente" variant="outlined"
            density="comfortable" prepend-inner-icon="mdi-account-outline" :error-messages="erroresCliente.nombre"
            class="mb-2" />

          <!-- APELLIDO -->
          <v-text-field v-model="nuevoCliente.apellido" label="Apellido" placeholder="Apellido del cliente"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-account-outline"
            :error-messages="erroresCliente.apellido" class="mb-2" />

          <!-- TELÉFONO -->
          <v-text-field v-model="nuevoCliente.telefono" label="Teléfono" placeholder="Número de teléfono"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-phone-outline"
            :error-messages="erroresCliente.telefono" @keyup.enter="registrarCliente" />

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-btn variant="text" :disabled="guardandoCliente" @click="registrarClienteDialog = false">
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn color="primary" variant="flat" :loading="guardandoCliente" prepend-icon="mdi-content-save-outline"
            @click="registrarCliente">
            Guardar cliente
          </v-btn>

        </v-card-actions>
        <v-alert v-if="erroresCliente.general" type="error" variant="tonal" density="comfortable" class="mb-4">
          {{ erroresCliente.general }}
        </v-alert>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3500">
      {{ snackbar.mensaje }}

      <template #actions>
        <v-btn variant="text" @click="snackbar.visible = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '@/plugins/axios'

// --------------------------------------------------
// ESTADO
// --------------------------------------------------

const productos = ref([])
const carrito = ref([])

const busqueda = ref('')
const categoriaSeleccionada = ref(null)

const descuento = ref(0)
const metodoPago = ref('EFECTIVO')
const observacion = ref('')

const clienteDialog = ref(false)

const clienteSeleccionado = ref(null)

const cedulaCliente = ref('')
const buscandoCliente = ref(false)
const errorCliente = ref('')

const loadingProductos = ref(false)
const guardandoVenta = ref(false)

const mostrarHistorial = ref(false)
const mostrarDetalle = ref(false)

const loadingHistorial = ref(false)
const anulandoVenta = ref(false)

const ventas = ref([])
const ventaSeleccionada = ref(null)
const ventaDialog = ref(false)


const registrarClienteDialog = ref(false)

const guardandoCliente = ref(false)

const nuevoCliente = ref({
  cedula: '',
  nombre: '',
  apellido: '',
  telefono: '',
})

const erroresCliente = ref({})

const abrirRegistrarCliente = () => {
  nuevoCliente.value = {
    cedula: cedulaCliente.value.trim(),
    nombre: '',
    apellido: '',
    telefono: '',
  }

  erroresCliente.value = {}

  clienteDialog.value = false
  registrarClienteDialog.value = true
}



const abrirSelectorCliente = () => {
  cedulaCliente.value = ''
  errorCliente.value = ''
  clienteDialog.value = true
}

const snackbar = ref({
  visible: false,
  mensaje: '',
  color: 'success',
})

const procederAVenta = () => {
  if (!carrito.value.length) return

  descuento.value = 0
  metodoPago.value = 'EFECTIVO'
  observacion.value = ''
  clienteSeleccionado.value = null

  ventaDialog.value = true
}

const cerrarVentaDialog = () => {
  if (guardandoVenta.value) return

  ventaDialog.value = false
}
watch(metodoPago, (nuevoMetodo) => {
  if (nuevoMetodo !== 'CREDITO') {
    clienteSeleccionado.value = null
  }
})
// --------------------------------------------------
// HISTORIAL
// --------------------------------------------------

const headersHistorial = [
  {
    title: 'Venta',
    key: 'numeroVenta',
  },
  {
    title: 'Método',
    key: 'metodoPago',
  },
  {
    title: 'Total',
    key: 'total',
  },
  {
    title: 'Estado',
    key: 'estado',
  },
  {
    title: 'Fecha',
    key: 'createdAt',
  },
  {
    title: '',
    key: 'acciones',
    sortable: false,
  },
]

// --------------------------------------------------
// COMPUTED
// --------------------------------------------------

const categoriasFiltro = computed(() => {
  const mapa = new Map()

  productos.value.forEach((producto) => {
    if (producto.categoria) {
      mapa.set(
        producto.categoria.id,
        producto.categoria
      )
    }
  })

  return Array.from(mapa.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )
})

const productosFiltrados = computed(() => {
  let resultado = [...productos.value]

  if (categoriaSeleccionada.value) {
    resultado = resultado.filter(
      (producto) =>
        producto.categoria?.id === categoriaSeleccionada.value
    )
  }

  if (busqueda.value?.trim()) {
    const texto = busqueda.value.trim().toLowerCase()

    resultado = resultado.filter((producto) =>
      producto.nombre.toLowerCase().includes(texto)
    )
  }

  return resultado
})

const subtotal = computed(() => {
  return carrito.value.reduce((total, item) => {
    return (
      total +
      Number(item.producto.precioVenta) * item.cantidad
    )
  }, 0)
})

const descuentoAplicado = computed(() => {
  const valor = Number(descuento.value) || 0

  return Math.min(
    Math.max(valor, 0),
    subtotal.value
  )
})

const total = computed(() => {
  return Math.max(
    subtotal.value - descuentoAplicado.value,
    0
  )
})

const cantidadProductosCarrito = computed(() => {
  return carrito.value.reduce(
    (total, item) => total + item.cantidad,
    0
  )
})

const buscarCliente = async () => {
  if (!cedulaCliente.value.trim()) {
    errorCliente.value = 'Ingresa una cédula'
    return
  }

  buscandoCliente.value = true
  errorCliente.value = ''

  try {
    const response = await api.get(
      `/cafeteria/clientes/cedula/${cedulaCliente.value.trim()}`
    )

    clienteSeleccionado.value = response.data
    clienteDialog.value = false

  } catch (error) {
    if (error.response?.status === 404) {
      errorCliente.value = 'No encontramos un cliente con esa cédula'
    } else {
      errorCliente.value = 'No fue posible buscar el cliente'
    }
  } finally {
    buscandoCliente.value = false
  }
}
const registrarCliente = async () => {
  erroresCliente.value = {}

  if (!nuevoCliente.value.cedula.trim()) {
    erroresCliente.value.cedula = 'La cédula es obligatoria'
  }

  if (!nuevoCliente.value.nombre.trim()) {
    erroresCliente.value.nombre = 'El nombre es obligatorio'
  }

  if (!nuevoCliente.value.apellido.trim()) {
    erroresCliente.value.apellido = 'El apellido es obligatorio'
  }

  if (!nuevoCliente.value.telefono.trim()) {
    erroresCliente.value.telefono = 'El teléfono es obligatorio'
  }

  if (Object.keys(erroresCliente.value).length > 0) {
    return
  }

  guardandoCliente.value = true

  try {
    const response = await api.post(
      '/cafeteria/clientes',
      {
        cedula: nuevoCliente.value.cedula.trim(),
        nombre: nuevoCliente.value.nombre.trim(),
        apellido: nuevoCliente.value.apellido.trim(),
        telefono: nuevoCliente.value.telefono.trim(),
      }
    )

    // Seleccionar automáticamente el cliente creado
    clienteSeleccionado.value = response.data

    // Cerrar registro
    registrarClienteDialog.value = false

    // Limpiar formulario
    nuevoCliente.value = {
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
    }

  } catch (error) {

    if (error.response?.status === 400) {
      erroresCliente.value.general =
        error.response.data?.message ||
        'No fue posible registrar el cliente'
    } else {
      erroresCliente.value.general =
        'Ocurrió un error al registrar el cliente'
    }

  } finally {
    guardandoCliente.value = false
  }
}
// --------------------------------------------------
// PRODUCTOS
// --------------------------------------------------

async function cargarProductos() {
  loadingProductos.value = true

  try {
    const { data } = await api.get('/producto/activos')

    productos.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando productos:', error)

    mostrarMensaje(
      error.response?.data?.message ||
      'No se pudieron cargar los productos.',
      'error'
    )
  } finally {
    loadingProductos.value = false
  }
}

// --------------------------------------------------
// CARRITO
// --------------------------------------------------

function agregarAlCarrito(producto) {
  if (
    producto.controlaInventario &&
    Number(producto.stockActual) <= 0
  ) {
    mostrarMensaje(
      'Este producto no tiene stock disponible.',
      'warning'
    )

    return
  }

  const existente = carrito.value.find(
    (item) => item.producto.id === producto.id
  )

  if (existente) {
    if (!puedeAumentar(existente)) {
      mostrarMensaje(
        'No hay más unidades disponibles.',
        'warning'
      )

      return
    }

    existente.cantidad++
    return
  }

  carrito.value.push({
    producto,
    cantidad: 1,
  })
}

function aumentarCantidad(item) {
  if (!puedeAumentar(item)) {
    mostrarMensaje(
      'No hay más stock disponible.',
      'warning'
    )

    return
  }

  item.cantidad++
}

function disminuirCantidad(item) {
  if (item.cantidad <= 1) {
    eliminarDelCarrito(item)
    return
  }

  item.cantidad--
}

function eliminarDelCarrito(item) {
  carrito.value = carrito.value.filter(
    (actual) => actual.producto.id !== item.producto.id
  )
}

function limpiarCarrito() {
  carrito.value = []
  descuento.value = 0
  observacion.value = ''
  metodoPago.value = 'EFECTIVO'
}

function puedeAumentar(item) {
  if (!item.producto.controlaInventario) {
    return true
  }

  return (
    item.cantidad <
    Number(item.producto.stockActual)
  )
}

// --------------------------------------------------
// CREAR VENTA
// --------------------------------------------------

const registrarVenta = async () => {
  if (!carrito.value.length) {
    return
  }

  if (
    metodoPago.value === 'CREDITO' &&
    !clienteSeleccionado.value
  ) {
    return
  }

  guardandoVenta.value = true

  try {
    const payload = {
      metodoPago: metodoPago.value,
      descuento: Number(descuento.value || 0),
      observacion: observacion.value?.trim() || undefined,

      detalles: carrito.value.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      })),

      ...(metodoPago.value === 'CREDITO'
        ? {
            clienteId: clienteSeleccionado.value.id,
          }
        : {}),
    }

    const response = await api.post(
      '/cafeteria/ventas',
      payload
    )

    console.log('Venta registrada:', response.data)

    ventaDialog.value = false

    carrito.value = []

    // limpiar formulario
    descuento.value = 0
    metodoPago.value = 'EFECTIVO'
    observacion.value = ''
    clienteSeleccionado.value = null

    // aquí puedes mostrar snackbar de éxito
    mostrarMensaje(
      `Venta registrada correctamente. Total: ${formatoMoneda(response.data.total)}`,
      'success',
    )


  } catch (error) {
    console.error('Error registrando venta:', error)

    // aquí manejamos el mensaje del backend
    mostrarMensaje(
      error.response?.data?.message ||
      'No se pudo registrar la venta.',
      'error'
    )
  } finally {
    guardandoVenta.value = false
  }
}

// --------------------------------------------------
// HISTORIAL
// --------------------------------------------------

async function cargarHistorial() {
  loadingHistorial.value = true

  try {
    const { data } = await api.get('/cafeteria/ventas')

    ventas.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando historial:', error)

    mostrarMensaje(
      error.response?.data?.message ||
      'No se pudo cargar el historial.',
      'error'
    )
  } finally {
    loadingHistorial.value = false
  }
}

async function verVenta(venta) {
  try {
    const { data } = await api.get(
      `/cafeteria/ventas/${venta.id}`
    )

    ventaSeleccionada.value = data
    mostrarDetalle.value = true
  } catch (error) {
    console.error('Error obteniendo venta:', error)

    mostrarMensaje(
      error.response?.data?.message ||
      'No se pudo cargar el detalle.',
      'error'
    )
  }
}

async function anularVenta() {
  if (!ventaSeleccionada.value) {
    return
  }

  anulandoVenta.value = true

  try {
    await api.post(
      `/cafeteria/ventas/${ventaSeleccionada.value.id}/anular`
    )

    mostrarMensaje(
      'Venta anulada correctamente.',
      'success'
    )

    mostrarDetalle.value = false

    await cargarHistorial()
    await cargarProductos()
  } catch (error) {
    console.error('Error anulando venta:', error)

    mostrarMensaje(
      error.response?.data?.message ||
      'No se pudo anular la venta.',
      'error'
    )
  } finally {
    anulandoVenta.value = false
  }
}

// --------------------------------------------------
// FORMATEOS
// --------------------------------------------------

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)
}

function formatoStock(cantidad, unidad) {
  const valor = Number(cantidad) || 0

  if (unidad === 'UNIDAD') {
    return `${Math.trunc(valor)}`
  }

  return valor.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

function colorStock(producto) {
  const stock = Number(producto.stockActual)
  const minimo = Number(producto.stockMinimo)

  if (stock <= 0) {
    return 'error'
  }

  if (stock <= minimo) {
    return 'warning'
  }

  return 'success'
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

function textoMetodoPago(metodo) {
  const textos = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
  }

  return textos[metodo] || metodo
}

// --------------------------------------------------
// MENSAJES
// --------------------------------------------------

function mostrarMensaje(mensaje, color = 'success') {
  snackbar.value = {
    visible: true,
    mensaje,
    color,
  }
}

// --------------------------------------------------
// HISTORIAL AUTOMÁTICO
// --------------------------------------------------

async function abrirHistorial() {
  await cargarHistorial()
  mostrarHistorial.value = true
}

// --------------------------------------------------
// INIT
// --------------------------------------------------

onMounted(() => {
  cargarProductos()
})
</script>

<style scoped>
.producto-card {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.producto-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08) !important;
}

.producto-imagen {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  overflow: hidden;
}

.carrito-card {
  position: sticky;
  top: 20px;
}

.cantidad {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
}

.metodo-pago {
  display: flex;
  flex-wrap: wrap;
  height: auto;
  gap: 10px;
}

.metodo-pago-btn {
  flex: 1 1 45%;
  min-width: 0;
}
</style>
