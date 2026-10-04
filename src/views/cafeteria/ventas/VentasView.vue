<template>
  <v-container fluid class="ventas-page pa-4 pa-md-6">

    <!-- =====================================================
         HEADER
    ====================================================== -->
    <div class="ventas-header mb-5">
      <div>
        <div class="d-flex align-center ga-2 mb-1">
          <div class="page-icon">
            <v-icon icon="mdi-point-of-sale" size="21" />
          </div>

          <h1 class="text-h5 font-weight-bold">
            Punto de venta
          </h1>
        </div>

        <p class="text-body-2 text-medium-emphasis mb-0">
          Registra ventas y controla tus productos.
        </p>
      </div>

      <v-btn
        variant="outlined"
        color="primary"
        prepend-icon="mdi-history"
        rounded="lg"
        @click="abrirHistorial"
      >
        Historial
      </v-btn>
    </div>

    <!-- =====================================================
         CONTENIDO
    ====================================================== -->
    <v-row align="start">

      <!-- ===================================================
           PRODUCTOS
      ==================================================== -->
      <v-col cols="12" lg="8">

        <v-card
          class="productos-panel"
          border
          elevation="0"
          rounded="xl"
        >

          <!-- TOOLBAR -->
          <div class="productos-toolbar pa-4 pa-md-5">

            <div class="d-flex flex-column flex-md-row ga-3">

              <!-- BUSCADOR -->
              <v-text-field
                v-model="busqueda"
                placeholder="Buscar producto..."
                prepend-inner-icon="mdi-magnify"
                variant="solo"
                flat
                density="comfortable"
                hide-details
                clearable
                class="buscador"
              />

              <!-- CATEGORÍA -->
              <v-select
                v-model="categoriaSeleccionada"
                :items="categoriasFiltro"
                item-title="nombre"
                item-value="id"
                label="Categoría"
                prepend-inner-icon="mdi-filter-variant"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                rounded="lg"
                class="categoria-select"
              />

            </div>

            <!-- CONTADOR -->
            <div class="d-flex align-center justify-space-between mt-4">

              <div class="text-body-2 text-medium-emphasis">
                {{ productosFiltrados.length }}
                {{ productosFiltrados.length === 1 ? 'producto' : 'productos' }}
              </div>

              <v-chip
                v-if="categoriaSeleccionada || busqueda"
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="mdi-filter-check"
              >
                Filtros activos
              </v-chip>

            </div>

          </div>

          <v-divider />

          <!-- PRODUCTOS -->
          <v-card-text class="pa-4 pa-md-5">

            <!-- LOADING -->
            <div
              v-if="loadingProductos"
              class="empty-state"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                size="42"
              />

              <div class="text-body-2 text-medium-emphasis mt-4">
                Cargando productos...
              </div>
            </div>

            <!-- SIN PRODUCTOS -->
            <div
              v-else-if="productosFiltrados.length === 0"
              class="empty-state"
            >
              <div class="empty-icon">
                <v-icon
                  icon="mdi-package-variant-closed"
                  size="32"
                />
              </div>

              <div class="text-h6 font-weight-bold mt-4">
                No encontramos productos
              </div>

              <div class="text-body-2 text-medium-emphasis mt-1">
                Intenta cambiar la búsqueda o el filtro.
              </div>
            </div>

            <!-- GRID -->
            <v-row v-else>
              <v-col
                v-for="producto in productosFiltrados"
                :key="producto.id"
                cols="12"
                sm="6"
                md="4"
                xl="3"
              >

                <v-card
                  class="producto-card"
                  border
                  elevation="0"
                  rounded="xl"
                  :disabled="
                    producto.controlaInventario &&
                    Number(producto.stockActual) <= 0
                  "
                  @click="agregarAlCarrito(producto)"
                >

                  <!-- IMAGEN -->
                  <div class="producto-imagen">

                    <v-img
                      v-if="producto.imagen"
                      :src="producto.imagen"
                      height="145"
                      cover
                    />

                    <div
                      v-else
                      class="producto-placeholder"
                    >
                      <v-icon
                        icon="mdi-food-outline"
                        size="42"
                      />
                    </div>

                    <!-- STOCK -->
                    <div class="producto-stock">

                      <v-chip
                        v-if="producto.controlaInventario"
                        size="x-small"
                        :color="colorStock(producto)"
                        variant="flat"
                      >
                        {{ formatoStock(
                          producto.stockActual,
                          producto.unidad
                        ) }}
                        disponibles
                      </v-chip>

                      <v-chip
                        v-else
                        size="x-small"
                        color="primary"
                        variant="flat"
                      >
                        Sin inventario
                      </v-chip>

                    </div>

                  </div>

                  <!-- INFO -->
                  <v-card-text class="pa-3">

                    <div class="producto-categoria">
                      {{ producto.categoria?.nombre || 'Sin categoría' }}
                    </div>

                    <div
                      class="producto-nombre"
                      :title="producto.nombre"
                    >
                      {{ producto.nombre }}
                    </div>

                    <div class="d-flex align-end justify-space-between mt-3">

                      <div>
                        <div class="text-caption text-medium-emphasis">
                          Precio
                        </div>

                        <div class="producto-precio">
                          {{ formatoMoneda(producto.precioVenta) }}
                        </div>
                      </div>

                      <v-btn
                        icon="mdi-plus"
                        size="small"
                        color="primary"
                        variant="tonal"
                        @click.stop="agregarAlCarrito(producto)"
                      />

                    </div>

                  </v-card-text>

                </v-card>

              </v-col>
            </v-row>

          </v-card-text>

        </v-card>

      </v-col>

      <!-- ===================================================
           CARRITO
      ==================================================== -->
      <v-col cols="12" lg="4">

        <v-card
          class="carrito-card"
          border
          elevation="0"
          rounded="xl"
        >

          <!-- HEADER -->
          <div class="carrito-header pa-4 pa-md-5">

            <div class="d-flex align-center justify-space-between">

              <div class="d-flex align-center ga-3">

                <div class="carrito-icon">
                  <v-icon
                    icon="mdi-cart-outline"
                    size="21"
                  />
                </div>

                <div>
                  <div class="font-weight-bold">
                    Carrito
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    {{ cantidadProductosCarrito }}
                    {{ cantidadProductosCarrito === 1
                      ? 'producto'
                      : 'productos'
                    }}
                  </div>
                </div>

              </div>

              <v-btn
                v-if="carrito.length"
                icon="mdi-delete-sweep-outline"
                size="small"
                variant="text"
                color="error"
                @click="limpiarCarrito"
              />

            </div>

          </div>

          <v-divider />

          <!-- VACÍO -->
          <div
            v-if="carrito.length === 0"
            class="carrito-vacio"
          >

            <div class="empty-icon">
              <v-icon
                icon="mdi-cart-outline"
                size="34"
              />
            </div>

            <div class="text-subtitle-1 font-weight-bold mt-4">
              Tu carrito está vacío
            </div>

            <div class="text-body-2 text-medium-emphasis mt-1">
              Selecciona un producto para comenzar.
            </div>

          </div>

          <!-- CON PRODUCTOS -->
          <div v-else>

            <div class="carrito-items pa-3">

              <div
                v-for="item in carrito"
                :key="item.producto.id"
                class="carrito-item"
              >

                <!-- IMAGEN -->
                <v-avatar
                  rounded="lg"
                  size="48"
                  class="carrito-item-imagen"
                >
                  <v-img
                    v-if="item.producto.imagen"
                    :src="item.producto.imagen"
                    cover
                  />

                  <v-icon
                    v-else
                    icon="mdi-food-outline"
                    size="22"
                  />
                </v-avatar>

                <!-- INFO -->
                <div class="carrito-item-info">

                  <div class="carrito-item-nombre">
                    {{ item.producto.nombre }}
                  </div>

                  <div class="text-caption text-medium-emphasis">
                    {{ formatoMoneda(item.producto.precioVenta) }}
                  </div>

                </div>

                <!-- CONTROLES -->
                <div class="carrito-controles">

                  <div class="cantidad-control">

                    <v-btn
                      icon="mdi-minus"
                      size="x-small"
                      variant="text"
                      @click.stop="disminuirCantidad(item)"
                    />

                    <span>
                      {{ item.cantidad }}
                    </span>

                    <v-btn
                      icon="mdi-plus"
                      size="x-small"
                      variant="text"
                      :disabled="!puedeAumentar(item)"
                      @click.stop="aumentarCantidad(item)"
                    />

                  </div>

                  <div class="carrito-subtotal">
                    {{
                      formatoMoneda(
                        Number(item.producto.precioVenta) *
                        item.cantidad
                      )
                    }}
                  </div>

                </div>

              </div>

            </div>

            <v-divider />

            <!-- RESUMEN -->
            <div class="carrito-resumen pa-4 pa-md-5">

              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2 text-medium-emphasis">
                  Subtotal
                </span>

                <span class="font-weight-medium">
                  {{ formatoMoneda(subtotal) }}
                </span>
              </div>

              <div
                v-if="descuentoAplicado > 0"
                class="d-flex justify-space-between mb-2"
              >
                <span class="text-body-2 text-medium-emphasis">
                  Descuento
                </span>

                <span class="text-error font-weight-medium">
                  -{{ formatoMoneda(descuentoAplicado) }}
                </span>
              </div>

              <v-divider class="my-4" />

              <div class="d-flex align-end justify-space-between">

                <span class="text-body-1 font-weight-medium">
                  Total
                </span>

                <span class="total-carrito">
                  {{ formatoMoneda(total) }}
                </span>

              </div>

              <v-btn
                block
                color="primary"
                size="large"
                rounded="lg"
                class="mt-5"
                prepend-icon="mdi-arrow-right-circle-outline"
                @click="procederAVenta"
              >
                Proceder a venta
              </v-btn>

            </div>

          </div>

        </v-card>

      </v-col>

    </v-row>

    <!-- =====================================================
         DIALOGO REGISTRAR VENTA
    ====================================================== -->
    <v-dialog
      v-model="ventaDialog"
      max-width="620"
      persistent
    >
      <v-card rounded="xl">

        <v-card-title class="dialog-header pa-5">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon">
              <v-icon icon="mdi-receipt-text-outline" />
            </div>

            <div>
              <div class="text-h6 font-weight-bold">
                Registrar venta
              </div>

              <div class="text-caption text-medium-emphasis">
                Completa los datos de la operación
              </div>
            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="guardandoVenta"
            @click="cerrarVentaDialog"
          />

        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">

          <!-- RESUMEN -->
          <div class="venta-resumen mb-5">

            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-medium-emphasis">
                Productos
              </span>

              <strong>
                {{ cantidadProductosCarrito }}
              </strong>
            </div>

            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2 text-medium-emphasis">
                Subtotal
              </span>

              <strong>
                {{ formatoMoneda(subtotal) }}
              </strong>
            </div>

            <div
              v-if="descuentoAplicado > 0"
              class="d-flex justify-space-between mb-2"
            >
              <span class="text-body-2 text-medium-emphasis">
                Descuento
              </span>

              <strong class="text-error">
                -{{ formatoMoneda(descuentoAplicado) }}
              </strong>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex align-center justify-space-between">

              <span class="text-body-1 font-weight-bold">
                Total a pagar
              </span>

              <span class="venta-total">
                {{ formatoMoneda(total) }}
              </span>

            </div>

          </div>

          <!-- DESCUENTO -->
          <v-text-field
            v-model.number="descuento"
            label="Descuento"
            type="number"
            min="0"
            :max="subtotal"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-tag-outline"
            class="mb-5"
            hide-details
          />

          <!-- METODO DE PAGO -->
          <div class="section-label mb-2">
            Método de pago
          </div>

          <v-btn-toggle
            v-model="metodoPago"
            mandatory
            divided
            class="metodo-pago-grid w-100 mb-5"
          >

            <v-btn value="EFECTIVO">
              <v-icon icon="mdi-cash" />
              <span>Efectivo</span>
            </v-btn>

            <v-btn value="TRANSFERENCIA">
              <v-icon icon="mdi-bank-transfer" />
              <span>Transferencia</span>
            </v-btn>

            <v-btn value="NEQUI">
              <v-icon icon="mdi-cellphone" />
              <span>Nequi</span>
            </v-btn>

            <v-btn value="DAVIPLATA">
              <v-icon icon="mdi-cellphone" />
              <span>Daviplata</span>
            </v-btn>

            <v-btn value="TARJETA">
              <v-icon icon="mdi-credit-card-outline" />
              <span>Tarjeta</span>
            </v-btn>

            <v-btn value="CREDITO">
              <v-icon icon="mdi-account-clock-outline" />
              <span>Crédito</span>
            </v-btn>

          </v-btn-toggle>

          <!-- CLIENTE -->
          <v-expand-transition>

            <div
              v-if="metodoPago === 'CREDITO'"
              class="mb-5"
            >

              <v-alert
                type="info"
                variant="tonal"
                density="comfortable"
                icon="mdi-account-credit-card-outline"
                class="mb-3"
              >
                Esta venta quedará registrada como cuenta por cobrar.
              </v-alert>

              <!-- CLIENTE SELECCIONADO -->
              <v-card
                v-if="clienteSeleccionado"
                border
                rounded="lg"
                class="cliente-seleccionado pa-3"
              >

                <div class="d-flex align-center">

                  <v-avatar
                    color="primary"
                    size="42"
                    class="mr-3"
                  >
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

                    <div
                      v-if="clienteSeleccionado.telefono"
                      class="text-caption text-medium-emphasis"
                    >
                      {{ clienteSeleccionado.telefono }}
                    </div>

                  </div>

                  <v-btn
                    icon="mdi-close"
                    size="small"
                    variant="text"
                    @click="clienteSeleccionado = null"
                  />

                </div>

                <v-divider class="my-3" />

                <div class="d-flex justify-space-between">
                  <span class="text-body-2 text-medium-emphasis">
                    Deuda generada
                  </span>

                  <strong class="text-primary">
                    {{ formatoMoneda(total) }}
                  </strong>
                </div>

              </v-card>

              <!-- BUSCAR CLIENTE -->
              <v-btn
                v-else
                block
                variant="outlined"
                color="primary"
                rounded="lg"
                prepend-icon="mdi-account-search-outline"
                @click="abrirSelectorCliente"
              >
                Buscar cliente
              </v-btn>

              <v-btn
                block
                variant="text"
                color="primary"
                prepend-icon="mdi-account-plus-outline"
                class="mt-2"
                @click="abrirRegistrarCliente"
              >
                Registrar nuevo cliente
              </v-btn>

            </div>

          </v-expand-transition>

          <!-- OBSERVACIÓN -->
          <v-textarea
            v-model="observacion"
            label="Observación"
            placeholder="Opcional"
            variant="outlined"
            density="comfortable"
            rows="2"
            auto-grow
            maxlength="500"
            hide-details
          />

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-btn
            variant="text"
            :disabled="guardandoVenta"
            @click="cerrarVentaDialog"
          >
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn
            color="primary"
            size="large"
            rounded="lg"
            :loading="guardandoVenta"
            :disabled="
              total <= 0 ||
              (metodoPago === 'CREDITO' && !clienteSeleccionado)
            "
            prepend-icon="mdi-check"
            @click="registrarVenta"
          >
            Registrar venta
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         HISTORIAL
    ====================================================== -->
    <v-dialog
      v-model="mostrarHistorial"
      max-width="1050"
      scrollable
    >
      <v-card rounded="xl">

        <v-card-title class="dialog-header pa-5">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon">
              <v-icon icon="mdi-history" />
            </div>

            <div>
              <div class="text-h6 font-weight-bold">
                Historial de ventas
              </div>

              <div class="text-caption text-medium-emphasis">
                Consulta las operaciones registradas
              </div>
            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="mostrarHistorial = false"
          />

        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0">

          <v-progress-linear
            v-if="loadingHistorial"
            indeterminate
            color="primary"
          />

          <v-data-table
            :headers="headersHistorial"
            :items="ventas"
            :loading="loadingHistorial"
            item-value="id"
            density="comfortable"
            hover
          >

            <template #item.numeroVenta="{ item }">
              <span class="font-weight-medium">
                {{ item.numeroVenta }}
              </span>
            </template>

            <template #item.total="{ item }">
              <span class="font-weight-bold">
                {{ formatoMoneda(item.total) }}
              </span>
            </template>

            <template #item.metodoPago="{ item }">
              <v-chip
                size="small"
                variant="tonal"
              >
                {{ textoMetodoPago(item.metodoPago) }}
              </v-chip>
            </template>

            <template #item.estado="{ item }">
              <v-chip
                size="small"
                :color="
                  item.estado === 'COMPLETADA'
                    ? 'success'
                    : 'error'
                "
                variant="tonal"
              >
                {{ item.estado }}
              </v-chip>
            </template>

            <template #item.createdAt="{ item }">
              <span class="text-body-2">
                {{ formatoFecha(item.createdAt) }}
              </span>
            </template>

            <template #item.acciones="{ item }">
              <v-btn
                icon="mdi-eye-outline"
                size="small"
                variant="text"
                color="primary"
                @click="verVenta(item)"
              />
            </template>

          </v-data-table>

        </v-card-text>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         DETALLE VENTA
    ====================================================== -->
    <v-dialog
      v-model="mostrarDetalle"
      max-width="620"
    >
      <v-card rounded="xl">

        <v-card-title class="dialog-header pa-5">

          <div>
            <div class="text-caption text-medium-emphasis">
              Venta
            </div>

            <div class="text-h6 font-weight-bold">
              #{{ ventaSeleccionada?.numeroVenta }}
            </div>
          </div>

          <v-chip
            v-if="ventaSeleccionada"
            size="small"
            :color="
              ventaSeleccionada.estado === 'COMPLETADA'
                ? 'success'
                : 'error'
            "
            variant="tonal"
          >
            {{ ventaSeleccionada.estado }}
          </v-chip>

        </v-card-title>

        <v-divider />

        <v-card-text
          v-if="ventaSeleccionada"
          class="pa-5"
        >

          <!-- PRODUCTOS -->
          <div class="section-label mb-3">
            Productos vendidos
          </div>

          <div
            v-for="detalle in ventaSeleccionada.detalles || []"
            :key="detalle.id"
            class="detalle-producto"
          >

            <div class="flex-grow-1">

              <div class="font-weight-medium">
                {{ detalle.producto?.nombre || `Producto #${detalle.productoId}` }}
              </div>

              <div class="text-caption text-medium-emphasis">
                {{ detalle.cantidad }}
                ×
                {{ formatoMoneda(detalle.precioUnitario) }}
              </div>

            </div>

            <strong>
              {{ formatoMoneda(detalle.subtotal) }}
            </strong>

          </div>

          <v-divider class="my-5" />

          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">
              Subtotal
            </span>

            <strong>
              {{ formatoMoneda(ventaSeleccionada.subtotal) }}
            </strong>
          </div>

          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2 text-medium-emphasis">
              Descuento
            </span>

            <strong
              :class="
                Number(ventaSeleccionada.descuento) > 0
                  ? 'text-error'
                  : ''
              "
            >
              {{
                Number(ventaSeleccionada.descuento) > 0
                  ? '-' +
                    formatoMoneda(ventaSeleccionada.descuento)
                  : formatoMoneda(0)
              }}
            </strong>
          </div>

          <div class="detalle-total mt-4">

            <span class="text-body-1 font-weight-bold">
              Total
            </span>

            <span class="text-h5 font-weight-bold text-primary">
              {{ formatoMoneda(ventaSeleccionada.total) }}
            </span>

          </div>

        </v-card-text>

        <v-card-actions class="pa-4">

          <v-btn
            variant="text"
            @click="mostrarDetalle = false"
          >
            Cerrar
          </v-btn>

          <v-spacer />

          <v-btn
            v-if="
              ventaSeleccionada &&
              ventaSeleccionada.estado === 'COMPLETADA'
            "
            color="error"
            variant="tonal"
            :loading="anulandoVenta"
            @click="anularVenta"
          >
            Anular venta
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         BUSCAR CLIENTE
    ====================================================== -->
    <v-dialog
      v-model="clienteDialog"
      max-width="450"
    >
      <v-card rounded="xl">

        <v-card-title class="dialog-header pa-5">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon">
              <v-icon icon="mdi-account-search-outline" />
            </div>

            <span class="font-weight-bold">
              Buscar cliente
            </span>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            @click="clienteDialog = false"
          />

        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">

          <div class="text-body-2 text-medium-emphasis mb-4">
            Ingresa la cédula del cliente para buscarlo.
          </div>

          <v-text-field
            v-model="cedulaCliente"
            label="Cédula"
            placeholder="Número de identificación"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-card-account-details-outline"
            :error-messages="errorCliente"
            :loading="buscandoCliente"
            @keyup.enter="buscarCliente"
          />

          <v-btn
            block
            variant="text"
            color="primary"
            prepend-icon="mdi-account-plus-outline"
            class="mt-2"
            @click="abrirRegistrarCliente"
          >
            Registrar nuevo cliente
          </v-btn>

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-btn
            variant="text"
            @click="clienteDialog = false"
          >
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn
            color="primary"
            variant="flat"
            :loading="buscandoCliente"
            :disabled="!cedulaCliente.trim()"
            prepend-icon="mdi-magnify"
            @click="buscarCliente"
          >
            Buscar
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         REGISTRAR CLIENTE
    ====================================================== -->
    <v-dialog
      v-model="registrarClienteDialog"
      max-width="500"
    >
      <v-card rounded="xl">

        <v-card-title class="dialog-header pa-5">

          <div class="d-flex align-center ga-3">

            <div class="dialog-icon">
              <v-icon icon="mdi-account-plus-outline" />
            </div>

            <div>
              <div class="text-h6 font-weight-bold">
                Registrar cliente
              </div>

              <div class="text-caption text-medium-emphasis">
                Datos del cliente
              </div>
            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="guardandoCliente"
            @click="registrarClienteDialog = false"
          />

        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">

          <div class="text-body-2 text-medium-emphasis mb-5">
            Registra los datos del cliente para asociarlo
            a la venta a crédito.
          </div>

          <v-text-field
            v-model="nuevoCliente.cedula"
            label="Cédula"
            placeholder="Número de identificación"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-card-account-details-outline"
            :error-messages="erroresCliente.cedula"
            class="mb-2"
          />

          <v-text-field
            v-model="nuevoCliente.nombre"
            label="Nombre"
            placeholder="Nombre del cliente"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            :error-messages="erroresCliente.nombre"
            class="mb-2"
          />

          <v-text-field
            v-model="nuevoCliente.apellido"
            label="Apellido"
            placeholder="Apellido del cliente"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            :error-messages="erroresCliente.apellido"
            class="mb-2"
          />

          <v-text-field
            v-model="nuevoCliente.telefono"
            label="Teléfono"
            placeholder="Número de teléfono"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-phone-outline"
            :error-messages="erroresCliente.telefono"
            @keyup.enter="registrarCliente"
          />

          <v-alert
            v-if="erroresCliente.general"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mt-4"
          >
            {{ erroresCliente.general }}
          </v-alert>

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">

          <v-btn
            variant="text"
            :disabled="guardandoCliente"
            @click="registrarClienteDialog = false"
          >
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn
            color="primary"
            variant="flat"
            :loading="guardandoCliente"
            prepend-icon="mdi-content-save-outline"
            @click="registrarCliente"
          >
            Guardar cliente
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- =====================================================
         SNACKBAR
    ====================================================== -->
    <v-snackbar
      v-model="snackbar.visible"
      :color="snackbar.color"
      timeout="3500"
    >
      {{ snackbar.mensaje }}

      <template #actions>
        <v-btn
          variant="text"
          @click="snackbar.visible = false"
        >
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
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TARJETA: 'Tarjeta',
    CREDITO: 'Crédito',
    OTRO: 'Otro',
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
/* =========================================================
   PAGE
========================================================= */

.ventas-page {
  max-width: 1700px;
  margin: 0 auto;
}

/* =========================================================
   HEADER
========================================================= */

.ventas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(25, 118, 210, 0.1);
  color: rgb(25, 118, 210);
}

/* =========================================================
   PRODUCTOS
========================================================= */

.productos-panel,
.carrito-card {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.productos-toolbar {
  background: rgba(248, 250, 252, 0.7);
}

.buscador {
  min-width: 0;
}

.categoria-select {
  max-width: 240px;
}

/* =========================================================
   EMPTY STATES
========================================================= */

.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #f3f5f7;
  color: #8a929b;
}

/* =========================================================
   PRODUCT CARD
========================================================= */

.producto-card {
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.producto-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(25, 118, 210, 0.3) !important;
}

.producto-imagen {
  position: relative;
  height: 145px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f5f7fa;
}

.producto-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0a7af;
}

.producto-stock {
  position: absolute;
  left: 10px;
  bottom: 10px;
}

.producto-categoria {
  font-size: 11px;
  font-weight: 600;
  color: rgb(25, 118, 210);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.producto-nombre {
  font-size: 15px;
  font-weight: 650;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.producto-precio {
  font-size: 17px;
  font-weight: 750;
  color: rgb(25, 118, 210);
}

/* =========================================================
   CARRITO
========================================================= */

.carrito-card {
  position: sticky;
  top: 20px;
}

.carrito-header {
  background: rgba(248, 250, 252, 0.65);
}

.carrito-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(25, 118, 210, 0.1);
  color: rgb(25, 118, 210);
}

.carrito-vacio {
  min-height: 350px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.carrito-items {
  max-height: 430px;
  overflow-y: auto;
}

.carrito-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 6px;
  border-radius: 12px;
  transition: background 0.15s ease;
}

.carrito-item:hover {
  background: #f7f8fa;
}

.carrito-item:last-child {
  margin-bottom: 0;
}

.carrito-item-imagen {
  flex-shrink: 0;
  background: #f1f3f5;
}

.carrito-item-info {
  min-width: 0;
  flex: 1;
}

.carrito-item-nombre {
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.carrito-controles {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.cantidad-control {
  height: 28px;
  display: flex;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: white;
}

.cantidad-control span {
  min-width: 24px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
}

.carrito-subtotal {
  font-size: 12px;
  font-weight: 700;
}

.total-carrito {
  font-size: 25px;
  line-height: 1;
  font-weight: 800;
  color: rgb(25, 118, 210);
}

/* =========================================================
   DIALOGOS
========================================================= */

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialog-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: rgba(25, 118, 210, 0.1);
  color: rgb(25, 118, 210);
}

.venta-resumen {
  padding: 16px;
  border-radius: 14px;
  background: #f7f9fb;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.venta-total {
  font-size: 25px;
  font-weight: 800;
  color: rgb(25, 118, 210);
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

/* =========================================================
   METODOS DE PAGO
========================================================= */

.metodo-pago-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  height: auto !important;
  gap: 8px;
}

.metodo-pago-grid :deep(.v-btn) {
  min-height: 64px;
  height: auto !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 10px !important;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
}

.metodo-pago-grid :deep(.v-btn .v-icon) {
  font-size: 21px;
}

.metodo-pago-grid :deep(.v-btn--active) {
  border-color: rgb(25, 118, 210) !important;
}

/* =========================================================
   CLIENTE
========================================================= */

.cliente-seleccionado {
  border-color: rgba(25, 118, 210, 0.25) !important;
  background: rgba(25, 118, 210, 0.03);
}

/* =========================================================
   DETALLE
========================================================= */

.detalle-producto {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 11px 0;
}

.detalle-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  background: #f7f9fb;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 959px) {
  .carrito-card {
    position: static;
  }

  .categoria-select {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .ventas-page {
    padding: 12px !important;
  }

  .ventas-header {
    align-items: flex-start;
  }

  .ventas-header .v-btn {
    min-width: auto;
  }

  .metodo-pago-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .carrito-items {
    max-height: none;
  }

  .producto-imagen {
    height: 160px;
  }
}
</style>