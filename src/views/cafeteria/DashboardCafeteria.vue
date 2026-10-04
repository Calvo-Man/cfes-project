<template>
  <v-container fluid class="dashboard-container">

    <!-- =========================================================
         HEADER
    ========================================================== -->

    <div class="dashboard-header">

      <div>
        <div class="dashboard-eyebrow">
          <v-icon
            icon="mdi-view-dashboard-outline"
            size="16"
          />

          PANEL DE CONTROL
        </div>

        <h1 class="dashboard-title">
          Cafetería
        </h1>

        <p class="dashboard-subtitle">
          Resumen financiero y operativo
        </p>
      </div>

      <div class="header-actions">

        <v-chip
          :color="dashboard.caja?.abierta ? 'success' : 'error'"
          variant="tonal"
          :prepend-icon="
            dashboard.caja?.abierta
              ? 'mdi-lock-open-outline'
              : 'mdi-lock-outline'
          "
        >
          {{ dashboard.caja?.abierta ? 'Caja abierta' : 'Caja cerrada' }}
        </v-chip>

        <v-btn
          icon="mdi-refresh"
          variant="tonal"
          :loading="loading"
          @click="cargarDashboard"
        />

      </div>

    </div>


    <!-- =========================================================
         LOADING
    ========================================================== -->

    <div
      v-if="loading && !dashboard.fecha"
      class="loading-container"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="44"
      />
    </div>


    <template v-else>

      <!-- =======================================================
           KPIs PRINCIPALES
      ======================================================== -->

      <v-row>

        <!-- DINERO DISPONIBLE -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="metric-card metric-card-primary"
            elevation="0"
          >

            <v-card-text>

              <div class="metric-header">

                <span class="metric-label">
                  Dinero disponible
                </span>

                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="42"
                >
                  <v-icon icon="mdi-wallet-outline" />
                </v-avatar>

              </div>

              <div class="metric-value">
                {{ formatoMoneda(dineroDisponible) }}
              </div>

              <div class="metric-footer">

                <span>
                  Todas las cuentas
                </span>

                <v-icon
                  icon="mdi-arrow-right"
                  size="15"
                />

              </div>

            </v-card-text>

          </v-card>

        </v-col>


        <!-- VENTAS -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="metric-card"
            elevation="0"
          >

            <v-card-text>

              <div class="metric-header">

                <span class="metric-label">
                  Ventas de hoy
                </span>

                <v-avatar
                  color="success"
                  variant="tonal"
                  size="42"
                >
                  <v-icon icon="mdi-chart-line" />
                </v-avatar>

              </div>

              <div class="metric-value">
                {{ formatoMoneda(dashboard.ventasHoy) }}
              </div>

              <div class="metric-footer success-text">

                <v-icon
                  icon="mdi-cart-outline"
                  size="15"
                />

                {{ dashboard.cantidadVentasHoy || 0 }}
                ventas

              </div>

            </v-card-text>

          </v-card>

        </v-col>


        <!-- COMPRAS -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="metric-card"
            elevation="0"
          >

            <v-card-text>

              <div class="metric-header">

                <span class="metric-label">
                  Compras de hoy
                </span>

                <v-avatar
                  color="orange"
                  variant="tonal"
                  size="42"
                >
                  <v-icon icon="mdi-truck-outline" />
                </v-avatar>

              </div>

              <div class="metric-value">
                {{ formatoMoneda(dashboard.comprasHoy) }}
              </div>

              <div class="metric-footer">

                <v-icon
                  icon="mdi-package-down"
                  size="15"
                />

                {{ dashboard.cantidadComprasHoy || 0 }}
                compras

              </div>

            </v-card-text>

          </v-card>

        </v-col>


        <!-- UTILIDAD -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="metric-card"
            elevation="0"
          >

            <v-card-text>

              <div class="metric-header">

                <span class="metric-label">
                  Utilidad estimada
                </span>

                <v-avatar
                  :color="utilidad >= 0 ? 'success' : 'error'"
                  variant="tonal"
                  size="42"
                >
                  <v-icon
                    :icon="
                      utilidad >= 0
                        ? 'mdi-trending-up'
                        : 'mdi-trending-down'
                    "
                  />
                </v-avatar>

              </div>

              <div
                class="metric-value"
                :class="
                  utilidad >= 0
                    ? 'success-text'
                    : 'error-text'
                "
              >
                {{ formatoMoneda(utilidad) }}
              </div>

              <div class="metric-footer">

                Margen:

                <strong>
                  {{ margenUtilidad }}%
                </strong>

              </div>

            </v-card-text>

          </v-card>

        </v-col>

      </v-row>


      <!-- =======================================================
           CUENTAS FINANCIERAS
      ======================================================== -->

      <v-row class="section-row">

        <v-col cols="12">

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-bank-outline"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Dinero disponible
                  </div>

                  <small>
                    Saldo actual por cuenta
                  </small>

                </div>

              </div>

              <v-btn
                variant="text"
                color="primary"
                size="small"
                to="/cafeteria/cuentas"
                append-icon="mdi-arrow-right"
              >
                Ver cuentas
              </v-btn>

            </v-card-title>

            <v-divider />

            <v-card-text>

              <v-row>

                <v-col
                  v-for="cuenta in cuentasFinancieras"
                  :key="cuenta.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="2.4"
                >

                  <div class="account-item">

                    <div class="account-icon">

                      <v-icon
                        :icon="iconoCuenta(cuenta.tipo)"
                        size="19"
                      />

                    </div>

                    <div class="account-info">

                      <div class="account-name">
                        {{ cuenta.nombre }}
                      </div>

                      <div class="account-balance">
                        {{ formatoMoneda(cuenta.saldo) }}
                      </div>

                    </div>

                  </div>

                </v-col>

                <v-col
                  v-if="cuentasFinancieras.length === 0"
                  cols="12"
                >

                  <div class="empty-state">
                    No hay cuentas financieras disponibles.
                  </div>

                </v-col>

              </v-row>

            </v-card-text>

          </v-card>

        </v-col>

      </v-row>


      <!-- =======================================================
           VENTAS + MÉTODOS DE PAGO
      ======================================================== -->

      <v-row class="section-row">

        <!-- VENTAS RECIENTES -->

        <v-col
          cols="12"
          xl="8"
        >

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-receipt-text-outline"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Ventas recientes
                  </div>

                  <small>
                    Últimas operaciones realizadas
                  </small>

                </div>

              </div>

              <v-btn
                variant="text"
                color="primary"
                size="small"
                to="/cafeteria/ventas"
                append-icon="mdi-arrow-right"
              >
                Ver todas
              </v-btn>

            </v-card-title>

            <v-divider />

            <v-table class="modern-table">

              <thead>

                <tr>

                  <th>
                    Venta
                  </th>

                  <th>
                    Fecha
                  </th>

                  <th>
                    Método
                  </th>

                  <th>
                    Estado
                  </th>

                  <th class="text-right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr
                  v-for="venta in dashboard.ventasRecientes"
                  :key="venta.id"
                >

                  <td>

                    <span class="sale-number">
                      {{ venta.numeroVenta }}
                    </span>

                  </td>

                  <td>
                    {{ formatFecha(venta.createdAt) }}
                  </td>

                  <td>

                    <v-chip
                      size="small"
                      variant="tonal"
                      :prepend-icon="
                        iconoMetodoPago(venta.metodoPago)
                      "
                    >
                      {{ venta.metodoPago }}
                    </v-chip>

                  </td>

                  <td>

                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="
                        venta.estado === 'COMPLETADA'
                          ? 'success'
                          : 'error'
                      "
                    >
                      {{ venta.estado }}
                    </v-chip>

                  </td>

                  <td class="text-right">

                    <span class="sale-total">
                      {{ formatoMoneda(venta.total) }}
                    </span>

                  </td>

                </tr>

                <tr
                  v-if="
                    dashboard.ventasRecientes.length === 0
                  "
                >

                  <td
                    colspan="5"
                    class="empty-table"
                  >
                    No hay ventas registradas.
                  </td>

                </tr>

              </tbody>

            </v-table>

          </v-card>

        </v-col>


        <!-- MÉTODOS DE PAGO -->

        <v-col
          cols="12"
          xl="4"
        >

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="success"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-credit-card-outline"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Métodos de pago
                  </div>

                  <small>
                    Ventas de hoy
                  </small>

                </div>

              </div>

            </v-card-title>

            <v-divider />

            <v-card-text>

              <div
                v-if="metodosPago.length"
                class="payment-list"
              >

                <div
                  v-for="metodo in metodosPago"
                  :key="metodo.metodo"
                  class="payment-item"
                >

                  <div class="payment-info">

                    <div class="payment-icon">

                      <v-icon
                        :icon="iconoMetodoPago(metodo.metodo)"
                        size="18"
                      />

                    </div>

                    <div>

                      <div class="payment-name">
                        {{ metodo.metodo }}
                      </div>

                      <div class="payment-count">
                        {{ metodo.cantidad || 0 }} ventas
                      </div>

                    </div>

                  </div>

                  <div class="payment-value">
                    {{ formatoMoneda(metodo.total) }}
                  </div>

                </div>

              </div>

              <div
                v-else
                class="empty-state"
              >
                No hay información de pagos disponible.
              </div>

            </v-card-text>

          </v-card>

        </v-col>

      </v-row>


      <!-- =======================================================
           PRODUCTOS + STOCK
      ======================================================== -->

      <v-row class="section-row">

        <!-- MÁS VENDIDOS -->

        <v-col
          cols="12"
          lg="7"
        >

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="info"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-chart-bar"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Productos más vendidos
                  </div>

                  <small>
                    Rendimiento de hoy
                  </small>

                </div>

              </div>

            </v-card-title>

            <v-divider />

            <v-card-text>

              <div
                v-if="productosMasVendidos.length"
                class="products-list"
              >

                <div
                  v-for="(producto, index) in productosMasVendidos"
                  :key="producto.id"
                  class="product-row"
                >

                  <div class="product-position">
                    {{ index + 1 }}
                  </div>

                  <div class="product-data">

                    <div class="product-name">
                      {{ producto.nombre }}
                    </div>

                    <div class="product-progress">

                      <div
                        class="product-progress-bar"
                        :style="{
                          width: `${porcentajeProducto(producto.cantidad)}%`
                        }"
                      />

                    </div>

                  </div>

                  <div class="product-quantity">

                    <strong>
                      {{ formatoStock(
                        producto.cantidad,
                        producto.unidad
                      ) }}
                    </strong>

                    <span>
                      vendidos
                    </span>

                  </div>

                </div>

              </div>

              <div
                v-else
                class="empty-state"
              >
                Todavía no hay información de productos vendidos.
              </div>

            </v-card-text>

          </v-card>

        </v-col>


        <!-- STOCK BAJO -->

        <v-col
          cols="12"
          lg="5"
        >

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="error"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-alert-outline"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Stock bajo
                  </div>

                  <small>
                    Requiere atención
                  </small>

                </div>

              </div>

              <v-chip
                v-if="dashboard.productosStockBajo.length"
                color="error"
                size="small"
                variant="tonal"
              >
                {{ dashboard.productosStockBajo.length }}
              </v-chip>

            </v-card-title>

            <v-divider />

            <v-list
              v-if="
                dashboard.productosStockBajo.length
              "
              class="stock-list"
            >

              <v-list-item
                v-for="producto in dashboard.productosStockBajo"
                :key="producto.id"
              >

                <template #prepend>

                  <v-avatar
                    color="error"
                    variant="tonal"
                    size="38"
                  >
                    <v-icon
                      icon="mdi-package-variant"
                      size="19"
                    />
                  </v-avatar>

                </template>

                <v-list-item-title class="font-weight-medium">
                  {{ producto.nombre }}
                </v-list-item-title>

                <v-list-item-subtitle>

                  Mínimo:

                  {{
                    formatoStock(
                      producto.stockMinimo,
                      producto.unidad
                    )
                  }}

                </v-list-item-subtitle>

                <template #append>

                  <div class="stock-current">

                    {{ formatoStock(
                      producto.stockActual,
                      producto.unidad
                    ) }}

                  </div>

                </template>

              </v-list-item>

            </v-list>

            <div
              v-else
              class="empty-state stock-empty"
            >

              <v-icon
                icon="mdi-check-circle-outline"
                size="38"
                color="success"
                class="mb-2"
              />

              <div>
                Inventario en niveles normales.
              </div>

            </div>

          </v-card>

        </v-col>

      </v-row>


      <!-- =======================================================
           CRÉDITOS + ACTIVIDAD
      ======================================================== -->

      <v-row class="section-row">

        <!-- CRÉDITOS -->

        <v-col
          cols="12"
          md="5"
        >

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="warning"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-account-cash-outline"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Cuentas por cobrar
                  </div>

                  <small>
                    Estado del crédito
                  </small>

                </div>

              </div>

            </v-card-title>

            <v-divider />

            <v-card-text>

              <div class="credit-summary">

                <div class="credit-main">

                  <span>
                    Saldo pendiente
                  </span>

                  <strong>
                    {{
                      formatoMoneda(
                        dashboard.creditos?.saldoPendiente
                      )
                    }}
                  </strong>

                </div>

                <div class="credit-stats">

                  <div>

                    <span>
                      Pendientes
                    </span>

                    <strong>
                      {{
                        dashboard.creditos?.pendientes || 0
                      }}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Parciales
                    </span>

                    <strong>
                      {{
                        dashboard.creditos?.parciales || 0
                      }}
                    </strong>

                  </div>

                </div>

              </div>

              <v-btn
                class="mt-4"
                variant="tonal"
                color="primary"
                block
                to="/cafeteria/cuentas-por-cobrar"
              >
                Gestionar créditos
              </v-btn>

            </v-card-text>

          </v-card>

        </v-col>


        <!-- ACTIVIDAD -->

        <v-col
          cols="12"
          md="7"
        >

          <v-card
            class="dashboard-card"
            elevation="0"
          >

            <v-card-title class="section-title">

              <div class="section-title-left">

                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="36"
                >
                  <v-icon
                    icon="mdi-history"
                    size="19"
                  />
                </v-avatar>

                <div>

                  <div>
                    Actividad reciente
                  </div>

                  <small>
                    Últimos movimientos financieros
                  </small>

                </div>

              </div>

            </v-card-title>

            <v-divider />

            <v-list
              v-if="actividadReciente.length"
              class="activity-list"
            >

              <v-list-item
                v-for="movimiento in actividadReciente"
                :key="movimiento.id"
              >

                <template #prepend>

                  <v-avatar
                    :color="
                      movimiento.tipo === 'INGRESO'
                        ? 'success'
                        : 'error'
                    "
                    variant="tonal"
                    size="38"
                  >

                    <v-icon
                      :icon="
                        movimiento.tipo === 'INGRESO'
                          ? 'mdi-arrow-down'
                          : 'mdi-arrow-up'
                      "
                      size="18"
                    />

                  </v-avatar>

                </template>

                <v-list-item-title>

                  {{ movimiento.concepto }}

                </v-list-item-title>

                <v-list-item-subtitle>

                  {{ movimiento.cuenta?.nombre || 'Cuenta' }}

                  ·

                  {{ formatFecha(movimiento.createdAt) }}

                </v-list-item-subtitle>

                <template #append>

                  <span
                    :class="
                      movimiento.tipo === 'INGRESO'
                        ? 'activity-income'
                        : 'activity-expense'
                    "
                  >

                    {{
                      movimiento.tipo === 'INGRESO'
                        ? '+'
                        : '-'
                    }}

                    {{ formatoMoneda(movimiento.monto) }}

                  </span>

                </template>

              </v-list-item>

            </v-list>

            <div
              v-else
              class="empty-state"
            >
              No hay movimientos recientes.
            </div>

          </v-card>

        </v-col>

      </v-row>


      <!-- =======================================================
           ACCIONES RÁPIDAS
      ======================================================== -->

      <v-row class="section-row">

        <v-col cols="12">

          <v-card
            class="quick-actions-card"
            elevation="0"
          >

            <v-card-text>

              <div class="quick-actions">

                <div>

                  <div class="quick-title">
                    Acciones rápidas
                  </div>

                  <div class="quick-subtitle">
                    Accede rápidamente a las operaciones principales.
                  </div>

                </div>

                <div class="quick-buttons">

                  <v-btn
                    color="primary"
                    prepend-icon="mdi-cart-plus"
                    to="/cafeteria/ventas"
                  >
                    Nueva venta
                  </v-btn>

                  <v-btn
                    variant="tonal"
                    color="primary"
                    prepend-icon="mdi-truck-plus"
                    to="/cafeteria/compras"
                  >
                    Nueva compra
                  </v-btn>

                  <v-btn
                    variant="tonal"
                    prepend-icon="mdi-package-variant"
                    to="/cafeteria/inventario"
                  >
                    Inventario
                  </v-btn>

                  <v-btn
                    variant="tonal"
                    prepend-icon="mdi-bank-outline"
                    to="/cafeteria/cuentas"
                  >
                    Cuentas
                  </v-btn>

                  <v-btn
                    variant="tonal"
                    prepend-icon="mdi-cash-register"
                    to="/cafeteria/caja"
                  >
                    Caja
                  </v-btn>

                </div>

              </div>

            </v-card-text>

          </v-card>

        </v-col>

      </v-row>

    </template>

  </v-container>
</template>


<script setup>

import {
  ref,
  computed,
  onMounted,
} from 'vue'

import api from '@/plugins/axios'


/* =========================================================
   ESTADO
========================================================= */

const loading = ref(false)

const dashboard = ref({

  fecha: null,

  ventasHoy: 0,
  comprasHoy: 0,

  cantidadVentasHoy: 0,
  cantidadComprasHoy: 0,

  costoVentasHoy: 0,

  productos: 0,

  caja: {
    abierta: false,
    sesionId: null,
    saldoInicial: 0,
    ingresos: 0,
    egresos: 0,
    saldoActual: 0,
  },

  cuentas: [],

  metodosPago: [],

  productosMasVendidos: [],

  productosStockBajo: [],

  ventasRecientes: [],

  movimientosRecientes: [],

  creditos: {
    saldoPendiente: 0,
    pendientes: 0,
    parciales: 0,
  },

})


/* =========================================================
   COMPUTED
========================================================= */

const cuentasFinancieras = computed(() => {

  return dashboard.value.cuentas || []

})


const dineroDisponible = computed(() => {

  return cuentasFinancieras.value.reduce(
    (total, cuenta) =>
      total + Number(cuenta.saldo || 0),
    0
  )

})


const utilidad = computed(() => {

  const ventas =
    Number(dashboard.value.ventasHoy) || 0

  const costo =
    Number(dashboard.value.costoVentasHoy) || 0

  return ventas - costo

})


const margenUtilidad = computed(() => {

  const ventas =
    Number(dashboard.value.ventasHoy) || 0

  if (!ventas) return '0.0'

  return (
    (utilidad.value / ventas) *
    100
  ).toFixed(1)

})


const metodosPago = computed(() => {

  return dashboard.value.metodosPago || []

})


const productosMasVendidos = computed(() => {

  return dashboard.value.productosMasVendidos || []

})


const actividadReciente = computed(() => {

  return dashboard.value.movimientosRecientes || []

})


/* =========================================================
   CARGAR DASHBOARD
========================================================= */

onMounted(() => {

  cargarDashboard()

})


async function cargarDashboard() {

  try {

    loading.value = true

    const { data } =
      await api.get('/cafeteria/dashboard')

    dashboard.value = {
      ...dashboard.value,
      ...data,

      caja: {
        ...dashboard.value.caja,
        ...(data.caja || {}),
      },

      creditos: {
        ...dashboard.value.creditos,
        ...(data.creditos || {}),
      },

    }

  } catch (error) {

    console.error(
      'Error cargando dashboard de cafetería:',
      error
    )

  } finally {

    loading.value = false

  }

}


/* =========================================================
   FORMATEADORES
========================================================= */

function formatoMoneda(valor) {

  return new Intl.NumberFormat(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }
  ).format(
    Number(valor) || 0
  )

}


function formatFecha(fecha) {

  if (!fecha) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat(
    'es-CO',
    {
      dateStyle: 'short',
      timeStyle: 'short',
    }
  ).format(
    new Date(fecha)
  )

}


function formatoStock(
  cantidad,
  unidad
) {

  const valor =
    Number(cantidad) || 0

  if (unidad === 'UNIDAD') {

    return `${Math.trunc(valor)}`

  }

  return valor.toLocaleString(
    'es-CO',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }
  )

}


/* =========================================================
   PRODUCTOS
========================================================= */

function porcentajeProducto(cantidad) {

  const productos =
    productosMasVendidos.value

  if (!productos.length) {
    return 0
  }

  const maximo =
    Math.max(
      ...productos.map(
        producto =>
          Number(producto.cantidad) || 0
      )
    )

  if (!maximo) {
    return 0
  }

  return (
    (Number(cantidad) / maximo) *
    100
  )

}


/* =========================================================
   ICONOS
========================================================= */

function iconoCuenta(tipo) {

  const iconos = {

    EFECTIVO:
      'mdi-cash',

    NEQUI:
      'mdi-cellphone',

    DAVIPLATA:
      'mdi-cellphone-link',

    TRANSFERENCIA:
      'mdi-bank-transfer',

    TARJETA:
      'mdi-credit-card-outline',

  }

  return (
    iconos[tipo] ||
    'mdi-wallet-outline'
  )

}


function iconoMetodoPago(metodo) {

  const iconos = {

    EFECTIVO:
      'mdi-cash',

    NEQUI:
      'mdi-cellphone',

    DAVIPLATA:
      'mdi-cellphone-link',

    TARJETA:
      'mdi-credit-card-outline',

    TRANSFERENCIA:
      'mdi-bank-transfer',

    CREDITO:
      'mdi-account-cash-outline',

  }

  return (
    iconos[metodo] ||
    'mdi-cash-register'
  )

}

</script>


<style scoped>

/* =========================================================
   CONTENEDOR
========================================================= */

.dashboard-container {
  padding: 28px !important;
  max-width: 1800px;
  margin: 0 auto;
}


/* =========================================================
   HEADER
========================================================= */

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
}

.dashboard-eyebrow {
  display: flex;
  align-items: center;
  gap: 6px;

  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;

  color: rgb(var(--v-theme-primary));

  margin-bottom: 5px;
}

.dashboard-title {
  margin: 0;

  font-size: 30px;
  line-height: 1.15;

  font-weight: 750;

  letter-spacing: -0.025em;
}

.dashboard-subtitle {
  margin: 6px 0 0;

  color: rgba(0, 0, 0, 0.55);

  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}


/* =========================================================
   LOADING
========================================================= */

.loading-container {
  min-height: 500px;

  display: flex;
  align-items: center;
  justify-content: center;
}


/* =========================================================
   METRIC CARDS
========================================================= */

.metric-card {
  height: 100%;

  border: 1px solid rgba(0, 0, 0, 0.07);

  border-radius: 16px;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  background: white;
}

.metric-card:hover {
  transform: translateY(-2px);

  border-color:
    rgba(25, 118, 210, 0.2);

  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.06) !important;
}

.metric-card-primary {
  border-color:
    rgba(25, 118, 210, 0.18);

  background:
    linear-gradient(
      145deg,
      rgba(25, 118, 210, 0.035),
      white
    );
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 10px;
}

.metric-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.58);
  font-weight: 500;
}

.metric-value {
  margin-top: 13px;

  font-size: 25px;
  line-height: 1.1;

  font-weight: 750;

  letter-spacing: -0.02em;
}

.metric-footer {
  display: flex;
  align-items: center;
  gap: 5px;

  margin-top: 12px;

  color: rgba(0, 0, 0, 0.48);

  font-size: 12px;
}

.success-text {
  color: rgb(var(--v-theme-success)) !important;
}

.error-text {
  color: rgb(var(--v-theme-error)) !important;
}


/* =========================================================
   SECTIONS
========================================================= */

.section-row {
  margin-top: 20px;
}

.dashboard-card {
  height: 100%;

  border: 1px solid rgba(0, 0, 0, 0.07);

  border-radius: 16px;

  background: white;

  overflow: hidden;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.dashboard-card:hover {
  border-color:
    rgba(25, 118, 210, 0.16);

  box-shadow:
    0 6px 22px rgba(0, 0, 0, 0.045) !important;
}

.section-title {
  min-height: 68px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 11px;
}

.section-title-left > div:last-child > div {
  font-size: 15px;
  font-weight: 650;
}

.section-title-left small {
  display: block;

  margin-top: 2px;

  font-size: 11px;

  color: rgba(0, 0, 0, 0.46);
}


/* =========================================================
   CUENTAS
========================================================= */

.account-item {
  display: flex;
  align-items: center;
  gap: 11px;

  min-height: 62px;
}

.account-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background:
    rgba(25, 118, 210, 0.08);

  color:
    rgb(var(--v-theme-primary));
}

.account-name {
  font-size: 12px;

  color:
    rgba(0, 0, 0, 0.52);
}

.account-balance {
  margin-top: 2px;

  font-size: 15px;

  font-weight: 700;
}


/* =========================================================
   TABLE
========================================================= */

.modern-table {
  font-size: 13px;
}

.modern-table th {
  height: 42px !important;

  font-size: 11px !important;

  font-weight: 650 !important;

  text-transform: uppercase;

  letter-spacing: 0.03em;

  color:
    rgba(0, 0, 0, 0.46) !important;

  background:
    rgba(0, 0, 0, 0.018);
}

.modern-table td {
  height: 58px !important;
}

.modern-table tbody tr {
  transition:
    background 0.15s ease;
}

.modern-table tbody tr:hover {
  background:
    rgba(25, 118, 210, 0.025);
}

.sale-number {
  font-weight: 650;
}

.sale-total {
  font-weight: 700;
}


/* =========================================================
   PAGOS
========================================================= */

.payment-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 2px;

  border-bottom:
    1px solid rgba(0, 0, 0, 0.055);
}

.payment-item:last-child {
  border-bottom: 0;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-icon {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    rgba(25, 118, 210, 0.07);

  color:
    rgb(var(--v-theme-primary));
}

.payment-name {
  font-size: 13px;
  font-weight: 600;
}

.payment-count {
  margin-top: 2px;

  font-size: 11px;

  color:
    rgba(0, 0, 0, 0.45);
}

.payment-value {
  font-size: 13px;
  font-weight: 700;
}


/* =========================================================
   PRODUCTOS
========================================================= */

.products-list {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-position {
  width: 28px;
  height: 28px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    rgba(25, 118, 210, 0.07);

  color:
    rgb(var(--v-theme-primary));

  font-size: 12px;
  font-weight: 700;
}

.product-data {
  flex: 1;
  min-width: 0;
}

.product-name {
  margin-bottom: 6px;

  font-size: 13px;
  font-weight: 600;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-progress {
  height: 5px;

  overflow: hidden;

  border-radius: 10px;

  background:
    rgba(0, 0, 0, 0.06);
}

.product-progress-bar {
  height: 100%;

  border-radius: inherit;

  background:
    rgb(var(--v-theme-primary));

  transition:
    width 0.4s ease;
}

.product-quantity {
  min-width: 65px;

  text-align: right;
}

.product-quantity strong {
  display: block;

  font-size: 13px;
}

.product-quantity span {
  font-size: 10px;

  color:
    rgba(0, 0, 0, 0.42);
}


/* =========================================================
   STOCK
========================================================= */

.stock-list {
  padding: 0;
}

.stock-list :deep(.v-list-item) {
  min-height: 65px;
}

.stock-current {
  padding: 5px 9px;

  border-radius: 7px;

  background:
    rgba(211, 47, 47, 0.08);

  color:
    rgb(var(--v-theme-error));

  font-size: 12px;
  font-weight: 700;
}

.stock-empty {
  min-height: 180px;
}


/* =========================================================
   CREDITOS
========================================================= */

.credit-summary {
  padding: 4px 0;
}

.credit-main span {
  display: block;

  font-size: 12px;

  color:
    rgba(0, 0, 0, 0.5);
}

.credit-main strong {
  display: block;

  margin-top: 6px;

  font-size: 27px;

  font-weight: 750;
}

.credit-stats {
  display: flex;

  gap: 45px;

  margin-top: 24px;

  padding-top: 17px;

  border-top:
    1px solid rgba(0, 0, 0, 0.07);
}

.credit-stats span {
  display: block;

  font-size: 11px;

  color:
    rgba(0, 0, 0, 0.45);
}

.credit-stats strong {
  display: block;

  margin-top: 4px;

  font-size: 17px;
}


/* =========================================================
   ACTIVIDAD
========================================================= */

.activity-list {
  padding: 0;
}

.activity-list :deep(.v-list-item) {
  min-height: 68px;
}

.activity-income {
  color:
    rgb(var(--v-theme-success));

  font-weight: 700;

  font-size: 13px;
}

.activity-expense {
  color:
    rgb(var(--v-theme-error));

  font-weight: 700;

  font-size: 13px;
}


/* =========================================================
   EMPTY
========================================================= */

.empty-state {
  min-height: 150px;

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;

  padding: 25px;

  color:
    rgba(0, 0, 0, 0.42);

  font-size: 13px;
}

.empty-table {
  padding: 30px !important;

  text-align: center;

  color:
    rgba(0, 0, 0, 0.42);
}


/* =========================================================
   QUICK ACTIONS
========================================================= */

.quick-actions-card {
  border-radius: 16px;

  border: 1px solid
    rgba(25, 118, 210, 0.12);

  background:
    linear-gradient(
      120deg,
      rgba(25, 118, 210, 0.035),
      white
    );
}

.quick-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 25px;
}

.quick-title {
  font-size: 15px;
  font-weight: 700;
}

.quick-subtitle {
  margin-top: 4px;

  font-size: 12px;

  color:
    rgba(0, 0, 0, 0.48);
}

.quick-buttons {
  display: flex;
  flex-wrap: wrap;

  gap: 8px;
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .dashboard-container {
    padding: 20px !important;
  }

  .dashboard-header {
    align-items: flex-start;
  }

  .quick-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .quick-buttons {
    width: 100%;
  }

}


@media (max-width: 600px) {

  .dashboard-container {
    padding: 14px !important;
  }

  .dashboard-header {
    flex-direction: column;
    margin-bottom: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-title {
    font-size: 26px;
  }

  .metric-value {
    font-size: 23px;
  }

  .section-row {
    margin-top: 14px;
  }

  .section-title {
    min-height: 60px;
  }

  .modern-table {
    min-width: 650px;
  }

}

</style>