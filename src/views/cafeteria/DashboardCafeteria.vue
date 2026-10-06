<template>
  <div class="dashboard-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <div class="eyebrow">
          PANEL DE CONTROL
        </div>

        <h1>Cafetería</h1>

        <p>
          Resumen financiero y operativo
        </p>
      </div>

      <div class="header-actions">
        <v-btn
          variant="tonal"
          class="cash-status"
          :class="dashboard.caja.abierta ? 'cash-open' : 'cash-closed'"
          :to="{ path: '/cafeteria/caja' }"
          prepend-icon="mdi-cash-register"
        >
          {{ dashboard.caja.abierta ? 'Caja abierta' : 'Caja cerrada' }}
        </v-btn>

        <v-btn
          icon
          variant="text"
          :loading="loading"
          @click="cargarDashboard"
        >
          <v-icon>mdi-refresh</v-icon>

          <v-tooltip activator="parent" location="bottom">
            Actualizar
          </v-tooltip>
        </v-btn>
      </div>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading && !dashboard.fecha"
      class="loading-container"
    >
      <v-progress-circular
        indeterminate
        size="42"
        width="3"
      />

      <span>Cargando información...</span>
    </div>

    <template v-else>
      <!-- =====================================================
           KPI PRINCIPALES
      ====================================================== -->

      <section class="kpi-grid">

        <!-- SALDO TOTAL -->
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon account-icon">
              <v-icon>mdi-wallet-outline</v-icon>
            </div>

            <span class="kpi-label">
              Saldo total
            </span>
          </div>

          <div class="kpi-value">
            {{ formatoMoneda(dashboard.dineroDisponible) }}
          </div>

          <div class="kpi-footer">
            <span>
              {{ dashboard.cuentas.length }}
              {{ dashboard.cuentas.length === 1 ? 'cuenta' : 'cuentas' }}
            </span>

            <v-icon size="16">
              mdi-chevron-right
            </v-icon>
          </div>
        </div>

        <!-- VENTAS -->
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon sales-icon">
              <v-icon>mdi-cart-outline</v-icon>
            </div>

            <span class="kpi-label">
              Ventas de hoy
            </span>
          </div>

          <div class="kpi-value">
            {{ formatoMoneda(dashboard.resumen.ventasHoy) }}
          </div>

          <div class="kpi-footer comparison-footer">
            <div
              class="comparison"
              :class="claseVariacion(
                dashboard.comparacion.ventas.variacion
              )"
            >
              <v-icon size="16">
                {{ iconoVariacion(
                  dashboard.comparacion.ventas.variacion
                ) }}
              </v-icon>

              <span>
                {{ textoVariacion(
                  dashboard.comparacion.ventas.variacion
                ) }}
              </span>
            </div>

            <span>vs. ayer</span>
          </div>
        </div>

        <!-- COMPRAS -->
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon purchase-icon">
              <v-icon>mdi-truck-outline</v-icon>
            </div>

            <span class="kpi-label">
              Compras de hoy
            </span>
          </div>

          <div class="kpi-value">
            {{ formatoMoneda(dashboard.resumen.comprasHoy) }}
          </div>

          <div class="kpi-footer">
            <span>
              {{ dashboard.resumen.cantidadComprasHoy }}
              {{
                dashboard.resumen.cantidadComprasHoy === 1
                  ? 'compra'
                  : 'compras'
              }}
            </span>
          </div>
        </div>

        <!-- UTILIDAD -->
        <div class="kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon profit-icon">
              <v-icon>mdi-chart-line</v-icon>
            </div>

            <span class="kpi-label">
              Utilidad bruta
            </span>
          </div>

          <div class="kpi-value">
            {{ formatoMoneda(dashboard.resumen.utilidadHoy) }}
          </div>

          <div class="kpi-footer">
            <span>
              Margen {{ formatoPorcentaje(dashboard.resumen.margenUtilidad) }}
            </span>

            <span
              v-if="dashboard.resumen.costoVentasHoy > 0"
              class="cost-label"
            >
              Costo {{ formatoMoneda(dashboard.resumen.costoVentasHoy) }}
            </span>
          </div>
        </div>
      </section>

      <!-- =====================================================
           FILA: CUENTAS + TICKET
      ====================================================== -->

      <section class="main-grid">

        <!-- CUENTAS -->
        <div class="dashboard-card accounts-card">
          <div class="card-header">
            <div>
              <h2>Dinero disponible</h2>
              <p>
                Saldo actual por cuenta
              </p>
            </div>

            <v-btn
              variant="text"
              size="small"
              to="/cafeteria/cuentas"
              append-icon="mdi-arrow-right"
            >
              Ver cuentas
            </v-btn>
          </div>

          <div
            v-if="dashboard.cuentas.length"
            class="accounts-list"
          >
            <div
              v-for="cuenta in dashboard.cuentas"
              :key="cuenta.id"
              class="account-row"
            >
              <div class="account-info">
                <div
                  class="account-icon-small"
                  :class="claseCuenta(cuenta.tipo)"
                >
                  <v-icon size="19">
                    {{ iconoCuenta(cuenta.tipo) }}
                  </v-icon>
                </div>

                <div>
                  <strong>{{ cuenta.nombre }}</strong>

                  <span>
                    {{ nombreTipoCuenta(cuenta.tipo) }}
                  </span>
                </div>
              </div>

              <strong class="account-balance">
                {{ formatoMoneda(cuenta.saldo) }}
              </strong>
            </div>
          </div>

          <div
            v-else
            class="empty-state compact"
          >
            <v-icon size="30">
              mdi-wallet-outline
            </v-icon>

            <span>
              No hay cuentas financieras configuradas
            </span>
          </div>
        </div>

        <!-- TICKET PROMEDIO -->
        <div class="dashboard-card ticket-card">
          <div class="card-header">
            <div>
              <h2>Ticket promedio</h2>
              <p>
                Valor promedio por venta
              </p>
            </div>

            <div class="section-icon">
              <v-icon>mdi-receipt-text-outline</v-icon>
            </div>
          </div>

          <div class="ticket-content">
            <div class="ticket-value">
              {{ formatoMoneda(dashboard.resumen.ticketPromedioHoy) }}
            </div>

            <div
              class="ticket-comparison"
              :class="claseVariacion(
                dashboard.comparacion.ticketPromedio.variacion
              )"
            >
              <v-icon size="18">
                {{ iconoVariacion(
                  dashboard.comparacion.ticketPromedio.variacion
                ) }}
              </v-icon>

              <strong>
                {{ textoVariacion(
                  dashboard.comparacion.ticketPromedio.variacion
                ) }}
              </strong>

              <span>
                vs. ayer
              </span>
            </div>

            <div class="ticket-meta">
              <div>
                <span>Ventas realizadas</span>

                <strong>
                  {{ dashboard.resumen.cantidadVentasHoy }}
                </strong>
              </div>

              <div>
                <span>Ayer</span>

                <strong>
                  {{ formatoMoneda(
                    dashboard.comparacion.ticketPromedio.anterior
                  ) }}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- =====================================================
           VENTAS RECIENTES + MÉTODOS DE PAGO
      ====================================================== -->

      <section class="main-grid sales-grid">

        <!-- VENTAS RECIENTES -->
        <div class="dashboard-card">
          <div class="card-header">
            <div>
              <h2>Ventas recientes</h2>
              <p>
                Últimas operaciones registradas
              </p>
            </div>

            <v-btn
              variant="text"
              size="small"
              to="/cafeteria/ventas"
              append-icon="mdi-arrow-right"
            >
              Ver ventas
            </v-btn>
          </div>

          <div
            v-if="dashboard.ventasRecientes.length"
            class="table-wrapper"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Estado</th>
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
                    <strong>
                      {{ venta.numeroVenta }}
                    </strong>
                  </td>

                  <td class="muted-cell">
                    {{ formatoFecha(venta.createdAt) }}
                  </td>

                  <td>
                    <div class="payment-cell">
                      <v-icon size="17">
                        {{ iconoMetodoPago(venta.metodoPago) }}
                      </v-icon>

                      <span>
                        {{ nombreMetodoPago(venta.metodoPago) }}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      class="status-badge"
                      :class="claseEstadoVenta(venta.estado)"
                    >
                      {{ nombreEstadoVenta(venta.estado) }}
                    </span>
                  </td>

                  <td class="text-right">
                    <strong>
                      {{ formatoMoneda(venta.total) }}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="empty-state"
          >
            <v-icon size="34">
              mdi-receipt-text-outline
            </v-icon>

            <span>
              No hay ventas registradas
            </span>
          </div>
        </div>

        <!-- MÉTODOS DE PAGO -->
        <div class="dashboard-card payment-card">
          <div class="card-header">
            <div>
              <h2>Ventas de hoy</h2>
              <p>
                Por método de pago
              </p>
            </div>

            <div class="section-icon">
              <v-icon>mdi-credit-card-outline</v-icon>
            </div>
          </div>

          <div
            v-if="dashboard.metodosPago.length"
            class="payment-list"
          >
            <div
              v-for="metodo in dashboard.metodosPago"
              :key="metodo.metodo"
              class="payment-row"
            >
              <div class="payment-info">
                <div
                  class="payment-icon"
                  :class="claseMetodoPago(metodo.metodo)"
                >
                  <v-icon size="18">
                    {{ iconoMetodoPago(metodo.metodo) }}
                  </v-icon>
                </div>

                <div>
                  <strong>
                    {{ nombreMetodoPago(metodo.metodo) }}
                  </strong>

                  <span>
                    {{ metodo.cantidad }}
                    {{
                      metodo.cantidad === 1
                        ? 'venta'
                        : 'ventas'
                    }}
                  </span>
                </div>
              </div>

              <strong>
                {{ formatoMoneda(metodo.total) }}
              </strong>
            </div>
          </div>

          <div
            v-else
            class="empty-state compact"
          >
            <v-icon size="30">
              mdi-credit-card-off-outline
            </v-icon>

            <span>
              No hay ventas hoy
            </span>
          </div>
        </div>
      </section>

      <!-- =====================================================
           PRODUCTOS + STOCK
      ====================================================== -->

      <section class="main-grid">

        <!-- PRODUCTOS MÁS VENDIDOS -->
        <div class="dashboard-card">
          <div class="card-header">
            <div>
              <h2>Productos más vendidos</h2>
              <p>
                Rendimiento de hoy
              </p>
            </div>

            <v-btn
              variant="text"
              size="small"
              to="/cafeteria/reportes"
              append-icon="mdi-arrow-right"
            >
              Ver reportes
            </v-btn>
          </div>

          <div
            v-if="dashboard.productosMasVendidos.length"
            class="products-list"
          >
            <div
              v-for="producto in dashboard.productosMasVendidos"
              :key="producto.id"
              class="product-row"
            >
              <div class="product-position">
                {{ posicionProducto(producto) }}
              </div>

              <div class="product-info">
                <strong>
                  {{ producto.nombre }}
                </strong>

                <div class="product-progress">
                  <div
                    class="product-progress-bar"
                    :style="{
                      width: porcentajeProducto(producto) + '%'
                    }"
                  ></div>
                </div>
              </div>

              <div class="product-quantity">
                <strong>
                  {{ formatoCantidad(producto.cantidad) }}
                </strong>

                <span>
                  {{ producto.unidad || 'und.' }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-state"
          >
            <v-icon size="34">
              mdi-chart-bar
            </v-icon>

            <span>
              No hay productos vendidos hoy
            </span>
          </div>
        </div>

        <!-- STOCK BAJO -->
        <div class="dashboard-card">
          <div class="card-header">
            <div>
              <h2>Stock bajo</h2>
              <p>
                Productos que requieren atención
              </p>
            </div>

            <v-btn
              variant="text"
              size="small"
              to="/cafeteria/inventario"
              append-icon="mdi-arrow-right"
            >
              Inventario
            </v-btn>
          </div>

          <div
            v-if="dashboard.productosStockBajo.length"
            class="stock-list"
          >
            <div
              v-for="producto in dashboard.productosStockBajo"
              :key="producto.id"
              class="stock-row"
            >
              <div class="stock-info">
                <div class="stock-product-icon">
                  <v-icon size="18">
                    mdi-package-variant-closed
                  </v-icon>
                </div>

                <div>
                  <strong>
                    {{ producto.nombre }}
                  </strong>

                  <span>
                    Mínimo:
                    {{ formatoCantidad(producto.stockMinimo) }}
                    {{ producto.unidad || '' }}
                  </span>
                </div>
              </div>

              <div
                class="stock-current"
                :class="claseStock(producto)"
              >
                <strong>
                  {{ formatoCantidad(producto.stockActual) }}
                </strong>

                <span>
                  {{ producto.unidad || 'und.' }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="empty-state"
          >
            <v-icon size="34">
              mdi-check-circle-outline
            </v-icon>

            <span>
              No hay productos con stock bajo
            </span>
          </div>
        </div>
      </section>

      <!-- =====================================================
           CUENTAS POR COBRAR + ACTIVIDAD
      ====================================================== -->

      <section class="main-grid">

        <!-- CRÉDITOS -->
        <div class="dashboard-card credit-card">
          <div class="card-header">
            <div>
              <h2>Cuentas por cobrar</h2>
              <p>
                Créditos pendientes de pago
              </p>
            </div>

            <v-btn
              variant="text"
              size="small"
              to="/cafeteria/cuentas-por-cobrar"
              append-icon="mdi-arrow-right"
            >
              Ver cuentas
            </v-btn>
          </div>

          <div class="credit-main">
            <span class="credit-label">
              Saldo pendiente
            </span>

            <strong class="credit-value">
              {{ formatoMoneda(
                dashboard.creditos.saldoPendiente
              ) }}
            </strong>
          </div>

          <div class="credit-stats">
            <div>
              <span>Sin pagos</span>

              <strong>
                {{ dashboard.creditos.pendientes }}
              </strong>
            </div>

            <div>
              <span>Pagos parciales</span>

              <strong>
                {{ dashboard.creditos.parciales }}
              </strong>
            </div>
          </div>
        </div>

        <!-- ACTIVIDAD FINANCIERA -->
        <div class="dashboard-card">
          <div class="card-header">
            <div>
              <h2>Actividad financiera</h2>
              <p>
                Últimos movimientos de cuentas
              </p>
            </div>

            <v-btn
              variant="text"
              size="small"
              to="/cafeteria/cuentas"
              append-icon="mdi-arrow-right"
            >
              Ver cuentas
            </v-btn>
          </div>

          <div
            v-if="dashboard.movimientosRecientes.length"
            class="activity-list"
          >
            <div
              v-for="movimiento in dashboard.movimientosRecientes"
              :key="movimiento.id"
              class="activity-row"
            >
              <div
                class="activity-icon"
                :class="
                  movimiento.tipo === 'INGRESO'
                    ? 'activity-income'
                    : 'activity-expense'
                "
              >
                <v-icon size="18">
                  {{
                    movimiento.tipo === 'INGRESO'
                      ? 'mdi-arrow-down-left'
                      : 'mdi-arrow-up-right'
                  }}
                </v-icon>
              </div>

              <div class="activity-info">
                <strong>
                  {{ nombreConcepto(movimiento.concepto) }}
                </strong>

                <span>
                  {{ movimiento.cuenta?.nombre || 'Cuenta' }}
                  ·
                  {{ formatoFecha(movimiento.createdAt) }}
                </span>
              </div>

              <strong
                class="activity-amount"
                :class="
                  movimiento.tipo === 'INGRESO'
                    ? 'income'
                    : 'expense'
                "
              >
                {{
                  movimiento.tipo === 'INGRESO'
                    ? '+'
                    : '-'
                }}
                {{ formatoMoneda(movimiento.monto) }}
              </strong>
            </div>
          </div>

          <div
            v-else
            class="empty-state"
          >
            <v-icon size="34">
              mdi-bank-transfer
            </v-icon>

            <span>
              No hay movimientos recientes
            </span>
          </div>
        </div>
      </section>

      <!-- =====================================================
           ACCIONES RÁPIDAS
      ====================================================== -->

      <section class="quick-actions-section">
        <div class="section-title">
          <div>
            <h2>Acciones rápidas</h2>
            <p>
              Accesos frecuentes
            </p>
          </div>
        </div>

        <div class="quick-actions">
          <v-btn
            to="/cafeteria/ventas"
            class="quick-action"
            variant="outlined"
            prepend-icon="mdi-cart-plus"
          >
            Nueva venta
          </v-btn>

          <v-btn
            to="/cafeteria/compras"
            class="quick-action"
            variant="outlined"
            prepend-icon="mdi-truck-plus"
          >
            Nueva compra
          </v-btn>

          <v-btn
            to="/cafeteria/inventario"
            class="quick-action"
            variant="outlined"
            prepend-icon="mdi-package-variant"
          >
            Inventario
          </v-btn>

          <v-btn
            to="/cafeteria/cuentas"
            class="quick-action"
            variant="outlined"
            prepend-icon="mdi-wallet-outline"
          >
            Cuentas
          </v-btn>

          <v-btn
            to="/cafeteria/caja"
            class="quick-action"
            variant="outlined"
            prepend-icon="mdi-cash-register"
          >
            Caja
          </v-btn>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/plugins/axios'

const loading = ref(false)

const dashboard = ref({
  fecha: null,

  resumen: {
    ventasHoy: 0,
    cantidadVentasHoy: 0,
    ticketPromedioHoy: 0,
    comprasHoy: 0,
    cantidadComprasHoy: 0,
    costoVentasHoy: 0,
    utilidadHoy: 0,
    margenUtilidad: 0,
  },

  comparacion: {
    ventas: {
      actual: 0,
      anterior: 0,
      variacion: 0,
    },

    cantidadVentas: {
      actual: 0,
      anterior: 0,
      variacion: 0,
    },

    ticketPromedio: {
      actual: 0,
      anterior: 0,
      variacion: 0,
    },
  },

  caja: {
    abierta: false,
    sesionId: null,
    saldoInicial: 0,
    ingresos: 0,
    egresos: 0,
    saldoActual: 0,
  },

  cuentas: [],

  dineroDisponible: 0,

  metodosPago: [],

  productosMasVendidos: [],

  productosStockBajo: [],

  ventasRecientes: [],

  movimientosRecientes: [],

  productos: 0,

  creditos: {
    saldoPendiente: 0,
    pendientes: 0,
    parciales: 0,
  },
})

/*
 * ============================================================
 * CARGAR DASHBOARD
 * ============================================================
 */

async function cargarDashboard() {
  loading.value = true

  try {
    const { data } = await api.get('/cafeteria/dashboard')

    dashboard.value = {
      ...dashboard.value,
      ...data,

      resumen: {
        ...dashboard.value.resumen,
        ...(data.resumen || {}),
      },

      comparacion: {
        ...dashboard.value.comparacion,
        ...(data.comparacion || {}),
      },

      caja: {
        ...dashboard.value.caja,
        ...(data.caja || {}),
      },

      creditos: {
        ...dashboard.value.creditos,
        ...(data.creditos || {}),
      },

      cuentas: data.cuentas || [],
      metodosPago: data.metodosPago || [],
      productosMasVendidos:
        data.productosMasVendidos || [],
      productosStockBajo:
        data.productosStockBajo || [],
      ventasRecientes:
        data.ventasRecientes || [],
      movimientosRecientes:
        data.movimientosRecientes || [],
    }
  } catch (error) {
    console.error(
      'Error cargando dashboard:',
      error,
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarDashboard()
})

/*
 * ============================================================
 * FORMATO DE MONEDA
 * ============================================================
 */

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(valor || 0))
}

/*
 * ============================================================
 * FORMATO DE PORCENTAJE
 * ============================================================
 */

function formatoPorcentaje(valor) {
  return `${Number(valor || 0).toFixed(1)}%`
}

/*
 * ============================================================
 * FORMATO DE CANTIDAD
 * ============================================================
 */

function formatoCantidad(valor) {
  const numero = Number(valor || 0)

  if (Number.isInteger(numero)) {
    return numero.toLocaleString('es-CO')
  }

  return numero.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

/*
 * ============================================================
 * FECHAS
 * ============================================================
 */

function formatoFecha(fecha) {
  if (!fecha) return '-'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha))
}

/*
 * ============================================================
 * COMPARACIONES
 * ============================================================
 */

function textoVariacion(valor) {
  const numero = Number(valor || 0)

  if (numero === 0) {
    return 'Sin cambios'
  }

  const signo = numero > 0 ? '+' : ''

  return `${signo}${numero.toFixed(1)}%`
}

function claseVariacion(valor) {
  const numero = Number(valor || 0)

  if (numero > 0) {
    return 'positive'
  }

  if (numero < 0) {
    return 'negative'
  }

  return 'neutral'
}

function iconoVariacion(valor) {
  const numero = Number(valor || 0)

  if (numero > 0) {
    return 'mdi-trending-up'
  }

  if (numero < 0) {
    return 'mdi-trending-down'
  }

  return 'mdi-minus'
}

/*
 * ============================================================
 * CUENTAS
 * ============================================================
 */

function iconoCuenta(tipo) {
  const iconos = {
    EFECTIVO: 'mdi-cash',
    NEQUI: 'mdi-cellphone',
    DAVIPLATA: 'mdi-cellphone-wireless',
    TRANSFERENCIA: 'mdi-bank-transfer',
    TARJETA: 'mdi-credit-card-outline',
  }

  return iconos[tipo] || 'mdi-wallet-outline'
}

function claseCuenta(tipo) {
  const clases = {
    EFECTIVO: 'account-cash',
    NEQUI: 'account-nequi',
    DAVIPLATA: 'account-daviplata',
    TRANSFERENCIA: 'account-transfer',
    TARJETA: 'account-card',
  }

  return clases[tipo] || 'account-default'
}

function nombreTipoCuenta(tipo) {
  const nombres = {
    EFECTIVO: 'Efectivo',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TRANSFERENCIA: 'Transferencias',
    TARJETA: 'Tarjeta',
  }

  return nombres[tipo] || tipo || 'Cuenta'
}

/*
 * ============================================================
 * MÉTODOS DE PAGO
 * ============================================================
 */

function iconoMetodoPago(metodo) {
  const iconos = {
    EFECTIVO: 'mdi-cash',
    TRANSFERENCIA: 'mdi-bank-transfer',
    NEQUI: 'mdi-cellphone',
    DAVIPLATA: 'mdi-cellphone-wireless',
    TARJETA: 'mdi-credit-card-outline',
    CREDITO: 'mdi-account-clock-outline',
    OTRO: 'mdi-wallet-outline',
  }

  return iconos[metodo] || 'mdi-cash'
}

function nombreMetodoPago(metodo) {
  const nombres = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TARJETA: 'Tarjeta',
    CREDITO: 'Crédito',
    OTRO: 'Otro',
  }

  return nombres[metodo] || metodo || 'Otro'
}

function claseMetodoPago(metodo) {
  const clases = {
    EFECTIVO: 'payment-cash',
    TRANSFERENCIA: 'payment-transfer',
    NEQUI: 'payment-nequi',
    DAVIPLATA: 'payment-daviplata',
    TARJETA: 'payment-card',
    CREDITO: 'payment-credit',
  }

  return clases[metodo] || 'payment-default'
}

/*
 * ============================================================
 * ESTADO DE VENTA
 * ============================================================
 */

function nombreEstadoVenta(estado) {
  const nombres = {
    COMPLETADA: 'Completada',
    ANULADA: 'Anulada',
  }

  return nombres[estado] || estado || 'Desconocido'
}

function claseEstadoVenta(estado) {
  const clases = {
    COMPLETADA: 'status-completed',
    ANULADA: 'status-cancelled',
  }

  return clases[estado] || 'status-default'
}

/*
 * ============================================================
 * PRODUCTOS
 * ============================================================
 */

const maxProductosVendidos = computed(() => {
  if (!dashboard.value.productosMasVendidos.length) {
    return 0
  }

  return Math.max(
    ...dashboard.value.productosMasVendidos.map(
      (producto) => Number(producto.cantidad || 0),
    ),
  )
})

function porcentajeProducto(producto) {
  if (!maxProductosVendidos.value) {
    return 0
  }

  return Math.max(
    8,
    (Number(producto.cantidad || 0) /
      maxProductosVendidos.value) *
      100,
  )
}

function posicionProducto(producto) {
  return (
    dashboard.value.productosMasVendidos.findIndex(
      (item) => item.id === producto.id,
    ) + 1
  )
}

/*
 * ============================================================
 * STOCK
 * ============================================================
 */

function claseStock(producto) {
  const actual = Number(producto.stockActual || 0)
  const minimo = Number(producto.stockMinimo || 0)

  if (actual <= 0) {
    return 'stock-danger'
  }

  if (actual < minimo) {
    return 'stock-warning'
  }

  return 'stock-low'
}

/*
 * ============================================================
 * CONCEPTOS FINANCIEROS
 * ============================================================
 */

function nombreConcepto(concepto) {
  const nombres = {
    VENTA: 'Venta',
    PAGO_CREDITO: 'Pago de crédito',
    COMPRA: 'Compra',
    PAGO_PROVEEDOR: 'Pago a proveedor',
    RETIRO: 'Retiro',
    AJUSTE: 'Ajuste',
    INGRESO_MANUAL: 'Ingreso manual',
    EGRESO_MANUAL: 'Egreso manual',
    TRANSFERENCIA: 'Transferencia',
    ANULACION_COMPRA: 'Anulación de compra',
    ANULACION_VENTA: 'Anulación de venta',
  }

  return nombres[concepto] || concepto || 'Movimiento'
}
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 28px;
}

/* ============================================================
   HEADER
============================================================ */

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #7a8190;
  margin-bottom: 7px;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.025em;
  color: #1d2433;
}

.page-header p {
  margin: 7px 0 0;
  color: #7a8190;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cash-status {
  border-radius: 10px !important;
  font-size: 13px;
  font-weight: 600;
  text-transform: none;
}

.cash-open {
  color: #287a4b !important;
}

.cash-closed {
  color: #737984 !important;
}

/* ============================================================
   LOADING
============================================================ */

.loading-container {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #7a8190;
  font-size: 14px;
}

/* ============================================================
   KPI
============================================================ */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e8eaf0;
  border-radius: 15px;
  padding: 20px;
  min-height: 150px;
  box-shadow: 0 2px 8px rgba(25, 35, 55, 0.035);
}

.kpi-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kpi-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-icon {
  background: #eef2ff;
  color: #4f5fa8;
}

.sales-icon {
  background: #edf7f1;
  color: #35845a;
}

.purchase-icon {
  background: #fff5e9;
  color: #a96c20;
}

.profit-icon {
  background: #f1edfb;
  color: #7455a8;
}

.kpi-label {
  color: #707786;
  font-size: 13px;
  font-weight: 600;
}

.kpi-value {
  margin-top: 15px;
  color: #202735;
  font-size: 25px;
  line-height: 1.1;
  font-weight: 750;
  letter-spacing: -0.025em;
}

.kpi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 13px;
  color: #858b97;
  font-size: 12px;
}

.cost-label {
  color: #9a9faa;
}

.comparison-footer {
  justify-content: flex-start;
}

.comparison {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-weight: 700;
}

.comparison.positive {
  color: #318454;
}

.comparison.negative {
  color: #c05b5b;
}

.comparison.neutral {
  color: #858b97;
}

/* ============================================================
   GRIDS
============================================================ */

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
  gap: 18px;
  margin-bottom: 18px;
}

.sales-grid {
  grid-template-columns: minmax(0, 1.55fr) minmax(350px, 0.65fr);
}

/* ============================================================
   CARDS
============================================================ */

.dashboard-card {
  background: #ffffff;
  border: 1px solid #e8eaf0;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(25, 35, 55, 0.035);
}

.card-header {
  min-height: 74px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #eef0f3;
}

.card-header h2,
.section-title h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 720;
  color: #252c3a;
}

.card-header p,
.section-title p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8a909b;
}

.card-header .v-btn {
  font-size: 12px;
  text-transform: none;
  font-weight: 600;
}

.section-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f4f7;
  color: #6f7682;
}

/* ============================================================
   ACCOUNTS
============================================================ */

.accounts-list {
  padding: 4px 20px 10px;
}

.account-row {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #f0f1f4;
}

.account-row:last-child {
  border-bottom: 0;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.account-icon-small {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-info strong {
  display: block;
  color: #313847;
  font-size: 13px;
  font-weight: 650;
}

.account-info span {
  display: block;
  margin-top: 3px;
  color: #9096a1;
  font-size: 11px;
}

.account-balance {
  white-space: nowrap;
  color: #303746;
  font-size: 13px;
}

.account-cash {
  background: #edf7f1;
  color: #35845a;
}

.account-nequi {
  background: #f0edf9;
  color: #7557a9;
}

.account-daviplata {
  background: #fff0f0;
  color: #bb5c5c;
}

.account-transfer {
  background: #edf3fb;
  color: #5079a8;
}

.account-card {
  background: #f3f4f6;
  color: #666d79;
}

.account-default {
  background: #f3f4f6;
  color: #666d79;
}

/* ============================================================
   TICKET
============================================================ */

.ticket-content {
  padding: 23px 22px 20px;
}

.ticket-value {
  font-size: 32px;
  font-weight: 760;
  letter-spacing: -0.035em;
  color: #242b39;
}

.ticket-comparison {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
  font-size: 12px;
}

.ticket-comparison span {
  margin-left: 3px;
  color: #8c929d;
}

.ticket-comparison.positive {
  color: #318454;
}

.ticket-comparison.negative {
  color: #c05b5b;
}

.ticket-comparison.neutral {
  color: #858b97;
}

.ticket-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 25px;
}

.ticket-meta > div {
  padding: 12px;
  border-radius: 9px;
  background: #f7f8fa;
}

.ticket-meta span {
  display: block;
  color: #858b97;
  font-size: 11px;
}

.ticket-meta strong {
  display: block;
  margin-top: 4px;
  color: #353b48;
  font-size: 13px;
}

/* ============================================================
   TABLE
============================================================ */

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  height: 42px;
  padding: 0 18px;
  background: #fafbfc;
  border-bottom: 1px solid #eceef2;
  color: #858b97;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: left;
  white-space: nowrap;
}

.data-table td {
  height: 57px;
  padding: 0 18px;
  border-bottom: 1px solid #f0f1f4;
  color: #464d5a;
  font-size: 12px;
  white-space: nowrap;
}

.data-table tbody tr:last-child td {
  border-bottom: 0;
}

.data-table tbody tr:hover {
  background: #fafbfc;
}

.data-table td strong {
  color: #343b49;
  font-weight: 650;
}

.text-right {
  text-align: right !important;
}

.muted-cell {
  color: #8d939d !important;
}

.payment-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #656c78;
}

/* ============================================================
   STATUS
============================================================ */

.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.status-completed {
  background: #edf7f1;
  color: #348055;
}

.status-cancelled {
  background: #fff0f0;
  color: #ba5d5d;
}

.status-default {
  background: #f1f2f4;
  color: #737984;
}

/* ============================================================
   PAYMENT METHODS
============================================================ */

.payment-list {
  padding: 5px 20px 10px;
}

.payment-row {
  min-height: 67px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #f0f1f4;
}

.payment-row:last-child {
  border-bottom: 0;
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.payment-icon {
  width: 35px;
  height: 35px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-info strong {
  display: block;
  color: #343b48;
  font-size: 12px;
}

.payment-info span {
  display: block;
  margin-top: 3px;
  color: #9096a0;
  font-size: 11px;
}

.payment-row > strong {
  color: #343b48;
  font-size: 12px;
}

.payment-cash {
  background: #edf7f1;
  color: #35845a;
}

.payment-transfer {
  background: #edf3fb;
  color: #5079a8;
}

.payment-nequi {
  background: #f0edf9;
  color: #7557a9;
}

.payment-daviplata {
  background: #fff0f0;
  color: #bb5c5c;
}

.payment-card {
  background: #f1f3f6;
  color: #666e7a;
}

.payment-credit {
  background: #fff5e9;
  color: #aa6e22;
}

.payment-default {
  background: #f1f3f6;
  color: #6f7682;
}

/* ============================================================
   PRODUCTS
============================================================ */

.products-list {
  padding: 6px 20px 12px;
}

.product-row {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f0f1f4;
}

.product-row:last-child {
  border-bottom: 0;
}

.product-position {
  width: 25px;
  color: #9a9faa;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info > strong {
  display: block;
  overflow: hidden;
  color: #3b4250;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-progress {
  width: 100%;
  height: 5px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef0f3;
}

.product-progress-bar {
  height: 100%;
  border-radius: inherit;
  background: #697487;
}

.product-quantity {
  min-width: 62px;
  text-align: right;
}

.product-quantity strong {
  display: block;
  color: #353c49;
  font-size: 12px;
}

.product-quantity span {
  display: block;
  margin-top: 2px;
  color: #9399a3;
  font-size: 10px;
}

/* ============================================================
   STOCK
============================================================ */

.stock-list {
  padding: 5px 20px 10px;
}

.stock-row {
  min-height: 65px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  border-bottom: 1px solid #f0f1f4;
}

.stock-row:last-child {
  border-bottom: 0;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.stock-product-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fff5e9;
  color: #ad7228;
}

.stock-info strong {
  display: block;
  overflow: hidden;
  color: #3c4350;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stock-info span {
  display: block;
  margin-top: 3px;
  color: #9298a2;
  font-size: 10px;
}

.stock-current {
  min-width: 50px;
  text-align: right;
}

.stock-current strong {
  display: block;
  font-size: 14px;
}

.stock-current span {
  display: block;
  margin-top: 2px;
  color: #9298a2;
  font-size: 10px;
}

.stock-danger strong {
  color: #bd5555;
}

.stock-warning strong {
  color: #ae7228;
}

.stock-low strong {
  color: #6e7682;
}

/* ============================================================
   CREDIT
============================================================ */

.credit-main {
  padding: 22px 22px 15px;
}

.credit-label {
  display: block;
  color: #858b97;
  font-size: 12px;
}

.credit-value {
  display: block;
  margin-top: 7px;
  color: #343b48;
  font-size: 27px;
  font-weight: 750;
  letter-spacing: -0.025em;
}

.credit-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 22px 20px;
}

.credit-stats > div {
  padding: 12px;
  border-radius: 9px;
  background: #f8f8fa;
}

.credit-stats span {
  display: block;
  color: #858b97;
  font-size: 11px;
}

.credit-stats strong {
  display: block;
  margin-top: 4px;
  color: #383f4c;
  font-size: 16px;
}

/* ============================================================
   ACTIVITY
============================================================ */

.activity-list {
  padding: 5px 20px 10px;
}

.activity-row {
  min-height: 66px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #f0f1f4;
}

.activity-row:last-child {
  border-bottom: 0;
}

.activity-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-income {
  background: #edf7f1;
  color: #35845a;
}

.activity-expense {
  background: #fff0f0;
  color: #ba5c5c;
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-info strong {
  display: block;
  overflow: hidden;
  color: #3b4250;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-info span {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: #9298a2;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-amount {
  white-space: nowrap;
  font-size: 12px;
}

.activity-amount.income {
  color: #35845a;
}

.activity-amount.expense {
  color: #ba5c5c;
}

/* ============================================================
   EMPTY
============================================================ */

.empty-state {
  min-height: 180px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #9a9faa;
  font-size: 12px;
}

.empty-state.compact {
  min-height: 130px;
}

/* ============================================================
   QUICK ACTIONS
============================================================ */

.quick-actions-section {
  margin-top: 5px;
  padding: 4px 0 20px;
}

.section-title {
  margin-bottom: 12px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-action {
  min-height: 42px;
  border-color: #e0e3e8 !important;
  border-radius: 9px !important;
  color: #4f5663 !important;
  font-size: 12px;
  font-weight: 600;
  text-transform: none;
}

.quick-action:hover {
  background: #f8f9fa;
}

/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .main-grid,
  .sales-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .dashboard-page {
    padding: 18px 14px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .kpi-card {
    min-height: 140px;
  }

  .card-header {
    padding: 16px;
  }

  .accounts-list,
  .payment-list,
  .products-list,
  .stock-list,
  .activity-list {
    padding-left: 16px;
    padding-right: 16px;
  }

  .data-table th,
  .data-table td {
    padding-left: 12px;
    padding-right: 12px;
  }

  .ticket-content,
  .credit-main {
    padding-left: 17px;
    padding-right: 17px;
  }

  .credit-stats {
    padding-left: 17px;
    padding-right: 17px;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .quick-action {
    width: 100%;
  }
}

@media (max-width: 430px) {
  .quick-actions {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 26px;
  }

  .kpi-value {
    font-size: 23px;
  }

  .ticket-value {
    font-size: 28px;
  }
}
</style>