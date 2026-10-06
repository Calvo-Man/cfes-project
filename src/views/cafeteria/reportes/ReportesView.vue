<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue'
import { Chart, registerables } from 'chart.js'
import api from '@/plugins/axios'

Chart.register(...registerables)

// ==========================================
// ESTADO
// ==========================================

const loading = ref(true)
const error = ref(null)

const periodo = ref('mes')
const mostrarFechas = ref(false)

const fechaDesde = ref('')
const fechaHasta = ref('')

// Datos de los endpoints
const resumen = ref(null)
const ventas = ref([])
const productos = ref([])
const metodosPago = ref([])
const cuentasPorCobrar = ref(null)
const cuentas = ref([])

// Chart
const chartCanvas = ref(null)
let ventasChart = null

// ==========================================
// FECHAS
// ==========================================

function formatearFechaLocal(fecha) {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function obtenerRangoPeriodo() {
  const hoy = new Date()
  const hasta = formatearFechaLocal(hoy)

  let desde

  switch (periodo.value) {
    case 'hoy':
      desde = hasta
      break

    case '7dias': {
      const fecha = new Date()
      fecha.setDate(fecha.getDate() - 6)
      desde = formatearFechaLocal(fecha)
      break
    }

    case 'mes':
      desde = `${hoy.getFullYear()}-${String(
        hoy.getMonth() + 1,
      ).padStart(2, '0')}-01`
      break

    case 'personalizado':
      return {
        desde: fechaDesde.value,
        hasta: fechaHasta.value,
      }

    default:
      desde = hasta
  }

  return {
    desde,
    hasta,
  }
}

// ==========================================
// FORMATO
// ==========================================

function moneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor || 0))
}

function numero(valor) {
  return new Intl.NumberFormat('es-CO').format(
    Number(valor || 0),
  )
}

function porcentaje(valor) {
  return `${Number(valor || 0).toFixed(1)}%`
}

function formatearFecha(fecha) {
  if (!fecha) return '-'

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha))
}

function formatearFechaGrafico(fecha) {
  if (!fecha) return ''

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(fecha))
}

// ==========================================
// COMPARACIONES
// ==========================================

function variacion(valor) {
  return Number(valor || 0)
}

function textoVariacion(valor) {
  const valorNumerico = variacion(valor)

  if (valorNumerico === 0) {
    return 'Sin cambios'
  }

  const signo = valorNumerico > 0 ? '+' : ''

  return `${signo}${valorNumerico.toFixed(1)}%`
}

function claseVariacion(valor) {
  const valorNumerico = variacion(valor)

  if (valorNumerico > 0) {
    return 'positive'
  }

  if (valorNumerico < 0) {
    return 'negative'
  }

  return 'neutral'
}

function iconoVariacion(valor) {
  const valorNumerico = variacion(valor)

  if (valorNumerico > 0) {
    return 'mdi-trending-up'
  }

  if (valorNumerico < 0) {
    return 'mdi-trending-down'
  }

  return 'mdi-minus'
}

function etiquetaComparacion() {
  return 'vs. período anterior'
}

// ==========================================
// CARGAR REPORTES
// ==========================================

async function cargarReportes() {
  loading.value = true
  error.value = null

  try {
    const rango = obtenerRangoPeriodo()

    const params = {
      desde: rango.desde,
      hasta: rango.hasta,
    }

    const [
      resumenResponse,
      ventasResponse,
      productosResponse,
      metodosResponse,
      cuentasCobrarResponse,
      cuentasResponse,
    ] = await Promise.all([
      api.get('/cafeteria/reportes/resumen', {
        params,
      }),

      api.get('/cafeteria/reportes/ventas', {
        params,
      }),

      api.get('/cafeteria/reportes/productos', {
        params,
      }),

      api.get('/cafeteria/reportes/metodos-pago', {
        params,
      }),

      api.get('/cafeteria/reportes/cuentas-por-cobrar', {
        params,
      }),

      api.get('/cafeteria/reportes/cuentas', {
        params,
      }),
    ])

    resumen.value = resumenResponse.data
    ventas.value = ventasResponse.data
    productos.value = productosResponse.data
    metodosPago.value = metodosResponse.data
    cuentasPorCobrar.value = cuentasCobrarResponse.data
    cuentas.value = cuentasResponse.data

    loading.value = false

    await nextTick()

    actualizarGrafico()
  } catch (err) {
    console.error(
      'Error cargando reportes:',
      err,
    )

    error.value =
      err.response?.data?.message ||
      'No se pudieron cargar los reportes.'

    loading.value = false
  }
}

// ==========================================
// FILTROS
// ==========================================

function cambiarPeriodo(valor) {
  periodo.value = valor

  if (valor !== 'personalizado') {
    mostrarFechas.value = false
    cargarReportes()
  } else {
    mostrarFechas.value = true
  }
}

function aplicarFechas() {
  if (!fechaDesde.value || !fechaHasta.value) {
    return
  }

  cargarReportes()
}

// ==========================================
// CHART
// ==========================================

async function actualizarGrafico() {
  await nextTick()

  if (!chartCanvas.value) {
    console.warn(
      'No existe el canvas del gráfico',
    )
    return
  }

  if (ventasChart) {
    ventasChart.destroy()
    ventasChart = null
  }

  const labels = ventas.value.map((item) =>
    formatearFechaGrafico(item.fecha),
  )

  const valores = ventas.value.map((item) =>
    Number(item.total || 0),
  )

  ventasChart = new Chart(chartCanvas.value, {
    type: 'line',

    data: {
      labels,

      datasets: [
        {
          label: 'Ventas',
          data: valores,
          tension: 0.35,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label(context) {
              return moneda(context.raw)
            },
          },
        },
      },

      scales: {
        y: {
          beginAtZero: true,

          ticks: {
            callback(value) {
              return moneda(value)
            },
          },
        },

        x: {
          grid: {
            display: false,
          },
        },
      },
    },
  })
}

// ==========================================
// COMPUTADOS
// ==========================================

const totalCuentas = computed(() => {
  return cuentas.value.reduce(
    (total, cuenta) =>
      total + Number(cuenta.saldo || 0),
    0,
  )
})

const productosTop = computed(() => {
  return productos.value.slice(0, 5)
})

const totalMetodosPago = computed(() => {
  return metodosPago.value.reduce(
    (total, metodo) =>
      total + Number(metodo.total || 0),
    0,
  )
})

function porcentajeMetodo(total) {
  if (!totalMetodosPago.value) {
    return 0
  }

  return (
    (Number(total || 0) /
      totalMetodosPago.value) *
    100
  )
}

// ==========================================
// ICONOS
// ==========================================

function iconoMetodo(metodo) {
  const iconos = {
    EFECTIVO: 'mdi-cash',
    TRANSFERENCIA: 'mdi-bank-transfer',
    NEQUI: 'mdi-cellphone',
    DAVIPLATA: 'mdi-cellphone',
    TARJETA: 'mdi-credit-card-outline',
    CREDITO: 'mdi-account-clock-outline',
    OTRO: 'mdi-dots-horizontal-circle-outline',
  }

  return (
    iconos[metodo] ||
    'mdi-cash-multiple'
  )
}

function nombreMetodo(metodo) {
  const nombres = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    TARJETA: 'Tarjeta',
    CREDITO: 'Crédito',
    OTRO: 'Otro',
  }

  return nombres[metodo] || metodo
}

// ==========================================
// CICLO DE VIDA
// ==========================================

onMounted(() => {
  cargarReportes()
})

onBeforeUnmount(() => {
  if (ventasChart) {
    ventasChart.destroy()
  }
})
</script>

<template>
  <div class="reportes-page">

    <!-- =====================================
         HEADER
    ====================================== -->

    <div class="page-header">

      <div>
        <h1 class="page-title">
          Reportes
        </h1>

        <p class="page-subtitle">
          Analiza el rendimiento de tu cafetería
        </p>
      </div>

      <v-btn
        variant="outlined"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="cargarReportes"
      >
        Actualizar
      </v-btn>

    </div>

    <!-- =====================================
         FILTROS
    ====================================== -->

    <v-card
      class="filter-card"
      elevation="0"
    >

      <div class="filter-content">

        <div class="period-buttons">

          <v-btn
            :variant="
              periodo === 'hoy'
                ? 'flat'
                : 'text'
            "
            @click="
              cambiarPeriodo('hoy')
            "
          >
            Hoy
          </v-btn>

          <v-btn
            :variant="
              periodo === '7dias'
                ? 'flat'
                : 'text'
            "
            @click="
              cambiarPeriodo('7dias')
            "
          >
            7 días
          </v-btn>

          <v-btn
            :variant="
              periodo === 'mes'
                ? 'flat'
                : 'text'
            "
            @click="
              cambiarPeriodo('mes')
            "
          >
            Este mes
          </v-btn>

          <v-btn
            :variant="
              periodo === 'personalizado'
                ? 'flat'
                : 'text'
            "
            @click="
              cambiarPeriodo(
                'personalizado',
              )
            "
          >
            Personalizado
          </v-btn>

        </div>

        <div
          v-if="mostrarFechas"
          class="date-filters"
        >

          <v-text-field
            v-model="fechaDesde"
            type="date"
            label="Desde"
            density="compact"
            variant="outlined"
            hide-details
          />

          <v-text-field
            v-model="fechaHasta"
            type="date"
            label="Hasta"
            density="compact"
            variant="outlined"
            hide-details
          />

          <v-btn
            color="primary"
            @click="aplicarFechas"
          >
            Aplicar
          </v-btn>

        </div>

      </div>

    </v-card>

    <!-- =====================================
         ERROR
    ====================================== -->

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-5"
    >
      {{ error }}
    </v-alert>

    <!-- =====================================
         LOADING
    ====================================== -->

    <div
      v-if="loading"
      class="loading-container"
    >

      <v-progress-circular
        indeterminate
        size="45"
      />

      <span>
        Cargando reportes...
      </span>

    </div>

    <template v-else>

      <!-- =====================================
           KPIs
      ====================================== -->

      <v-row class="mb-2">

        <!-- VENTAS -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="stat-card"
            elevation="0"
          >

            <div class="stat-icon sales">
              <v-icon>
                mdi-cart-outline
              </v-icon>
            </div>

            <div class="stat-content">

              <span class="stat-label">
                Ventas
              </span>

              <strong class="stat-value">
                {{
                  moneda(
                    resumen.ventas.total,
                  )
                }}
              </strong>

              <div
                v-if="resumen.comparacion"
                class="comparison"
                :class="
                  claseVariacion(
                    resumen.comparacion
                      .ventas.variacion,
                  )
                "
              >
                <v-icon size="14">
                  {{
                    iconoVariacion(
                      resumen.comparacion
                        .ventas.variacion,
                    )
                  }}
                </v-icon>

                <span>
                  {{
                    textoVariacion(
                      resumen.comparacion
                        .ventas.variacion,
                    )
                  }}
                </span>

                <small>
                  {{ etiquetaComparacion() }}
                </small>
              </div>

              <span class="stat-detail">
                {{
                  numero(
                    resumen.ventas.cantidad,
                  )
                }}
                ventas · Ticket
                {{
                  moneda(
                    resumen.ventas
                      .ticketPromedio,
                  )
                }}
              </span>

              <span
                v-if="resumen.comparacion"
                class="stat-subdetail"
              >
                {{
                  textoVariacion(
                    resumen.comparacion
                      .ticketPromedio.variacion,
                  )
                }}
                en ticket promedio
              </span>

            </div>

          </v-card>

        </v-col>

        <!-- DINERO DISPONIBLE -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="stat-card"
            elevation="0"
          >

            <div class="stat-icon income">
              <v-icon>
                mdi-wallet-outline
              </v-icon>
            </div>

            <div class="stat-content">

              <span class="stat-label">
                Dinero disponible
              </span>

              <strong class="stat-value">
                {{ moneda(totalCuentas) }}
              </strong>

              <span class="stat-detail">
                En cuentas financieras
              </span>

            </div>

          </v-card>

        </v-col>

        <!-- UTILIDAD -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="stat-card"
            elevation="0"
          >

            <div class="stat-icon profit">
              <v-icon>
                mdi-chart-line
              </v-icon>
            </div>

            <div class="stat-content">

              <span class="stat-label">
                Utilidad bruta
              </span>

              <strong class="stat-value">
                {{
                  moneda(
                    resumen.rentabilidad
                      .utilidadBruta,
                  )
                }}
              </strong>

              <div
                v-if="resumen.comparacion"
                class="comparison"
                :class="
                  claseVariacion(
                    resumen.comparacion
                      .utilidad.variacion,
                  )
                "
              >
                <v-icon size="14">
                  {{
                    iconoVariacion(
                      resumen.comparacion
                        .utilidad.variacion,
                    )
                  }}
                </v-icon>

                <span>
                  {{
                    textoVariacion(
                      resumen.comparacion
                        .utilidad.variacion,
                    )
                  }}
                </span>

                <small>
                  {{ etiquetaComparacion() }}
                </small>
              </div>

              <span class="stat-detail">
                {{
                  porcentaje(
                    resumen.rentabilidad
                      .margen,
                  )
                }}
                margen
              </span>

            </div>

          </v-card>

        </v-col>

        <!-- POR COBRAR -->

        <v-col
          cols="12"
          sm="6"
          lg="3"
        >

          <v-card
            class="stat-card"
            elevation="0"
          >

            <div class="stat-icon debt">
              <v-icon>
                mdi-account-clock-outline
              </v-icon>
            </div>

            <div class="stat-content">

              <span class="stat-label">
                Por cobrar
              </span>

              <strong class="stat-value">
                {{
                  moneda(
                    cuentasPorCobrar
                      .totalPendiente,
                  )
                }}
              </strong>

              <span class="stat-detail">
                {{
                  cuentasPorCobrar.cantidad
                }}
                cuentas pendientes
              </span>

            </div>

          </v-card>

        </v-col>

      </v-row>

      <!-- =====================================
           RESUMEN DE COMPARACIÓN
      ====================================== -->

      <v-row
        v-if="resumen.comparacion"
        class="comparison-row"
      >

        <v-col cols="12">

          <v-card
            class="comparison-card"
            elevation="0"
          >

            <div class="comparison-header">

              <div>
                <span class="comparison-title">
                  Comparación con el período anterior
                </span>

                <span class="comparison-description">
                  Cómo cambió el rendimiento de tu cafetería
                </span>
              </div>

            </div>

            <div class="comparison-grid">

              <!-- VENTAS -->

              <div class="comparison-item">

                <div class="comparison-item-icon">
                  <v-icon>
                    mdi-cash-multiple
                  </v-icon>
                </div>

                <div class="comparison-item-content">

                  <span>
                    Ventas
                  </span>

                  <strong>
                    {{
                      moneda(
                        resumen.comparacion
                          .ventas.actual,
                      )
                    }}
                  </strong>

                  <small
                    :class="
                      claseVariacion(
                        resumen.comparacion
                          .ventas.variacion,
                      )
                    "
                  >
                    {{
                      textoVariacion(
                        resumen.comparacion
                          .ventas.variacion,
                      )
                    }}
                    vs.
                    {{
                      moneda(
                        resumen.comparacion
                          .ventas.anterior,
                      )
                    }}
                  </small>

                </div>

              </div>

              <!-- CANTIDAD DE VENTAS -->

              <div class="comparison-item">

                <div class="comparison-item-icon">
                  <v-icon>
                    mdi-cart-outline
                  </v-icon>
                </div>

                <div class="comparison-item-content">

                  <span>
                    Número de ventas
                  </span>

                  <strong>
                    {{
                      numero(
                        resumen.comparacion
                          .cantidadVentas.actual,
                      )
                    }}
                  </strong>

                  <small
                    :class="
                      claseVariacion(
                        resumen.comparacion
                          .cantidadVentas.variacion,
                      )
                    "
                  >
                    {{
                      textoVariacion(
                        resumen.comparacion
                          .cantidadVentas.variacion,
                      )
                    }}
                    vs.
                    {{
                      numero(
                        resumen.comparacion
                          .cantidadVentas.anterior,
                      )
                    }}
                  </small>

                </div>

              </div>

              <!-- TICKET -->

              <div class="comparison-item">

                <div class="comparison-item-icon">
                  <v-icon>
                    mdi-receipt-text-outline
                  </v-icon>
                </div>

                <div class="comparison-item-content">

                  <span>
                    Ticket promedio
                  </span>

                  <strong>
                    {{
                      moneda(
                        resumen.comparacion
                          .ticketPromedio.actual,
                      )
                    }}
                  </strong>

                  <small
                    :class="
                      claseVariacion(
                        resumen.comparacion
                          .ticketPromedio.variacion,
                      )
                    "
                  >
                    {{
                      textoVariacion(
                        resumen.comparacion
                          .ticketPromedio.variacion,
                      )
                    }}
                    vs.
                    {{
                      moneda(
                        resumen.comparacion
                          .ticketPromedio.anterior,
                      )
                    }}
                  </small>

                </div>

              </div>

              <!-- PRODUCTOS -->

              <div class="comparison-item">

                <div class="comparison-item-icon">
                  <v-icon>
                    mdi-package-variant-closed
                  </v-icon>
                </div>

                <div class="comparison-item-content">

                  <span>
                    Productos vendidos
                  </span>

                  <strong>
                    {{
                      numero(
                        resumen.comparacion
                          .productosVendidos.actual,
                      )
                    }}
                  </strong>

                  <small
                    :class="
                      claseVariacion(
                        resumen.comparacion
                          .productosVendidos.variacion,
                      )
                    "
                  >
                    {{
                      textoVariacion(
                        resumen.comparacion
                          .productosVendidos.variacion,
                      )
                    }}
                    vs.
                    {{
                      numero(
                        resumen.comparacion
                          .productosVendidos.anterior,
                      )
                    }}
                  </small>

                </div>

              </div>

            </div>

          </v-card>

        </v-col>

      </v-row>

      <!-- =====================================
           GRÁFICO + CUENTAS
      ====================================== -->

      <v-row>

        <!-- GRÁFICO -->

        <v-col
          cols="12"
          lg="8"
        >

          <v-card
            class="content-card"
            elevation="0"
          >

            <div class="card-header">

              <div>
                <h2>
                  Ventas del período
                </h2>

                <p>
                  Evolución de las ventas
                </p>
              </div>

            </div>

            <div class="chart-container">
              <canvas ref="chartCanvas" />
            </div>

          </v-card>

        </v-col>

        <!-- CUENTAS -->

        <v-col
          cols="12"
          lg="4"
        >

          <v-card
            class="content-card"
            elevation="0"
          >

            <div class="card-header">

              <div>
                <h2>
                  Dinero disponible
                </h2>

                <p>
                  Saldo actual por cuenta
                </p>
              </div>

              <strong class="total-money">
                {{ moneda(totalCuentas) }}
              </strong>

            </div>

            <div class="accounts-list">

              <div
                v-for="cuenta in cuentas"
                :key="cuenta.id"
                class="account-item"
              >

                <div class="account-info">

                  <div class="account-icon">
                    <v-icon>
                      {{
                        iconoMetodo(
                          cuenta.tipo,
                        )
                      }}
                    </v-icon>
                  </div>

                  <div>

                    <strong>
                      {{ cuenta.nombre }}
                    </strong>

                    <span>
                      {{ cuenta.tipo }}
                    </span>

                  </div>

                </div>

                <strong>
                  {{ moneda(cuenta.saldo) }}
                </strong>

              </div>

              <div
                v-if="!cuentas.length"
                class="empty-state"
              >
                No hay cuentas registradas.
              </div>

            </div>

          </v-card>

        </v-col>

      </v-row>

      <!-- =====================================
           PRODUCTOS + MÉTODOS DE PAGO
      ====================================== -->

      <v-row>

        <!-- PRODUCTOS -->

        <v-col
          cols="12"
          lg="7"
        >

          <v-card
            class="content-card"
            elevation="0"
          >

            <div class="card-header">

              <div>
                <h2>
                  Productos más vendidos
                </h2>

                <p>
                  Los productos con mayor movimiento
                </p>
              </div>

              <span class="header-count">
                {{
                  numero(
                    resumen.productos
                      .cantidadVendida,
                  )
                }}
                vendidos
              </span>

            </div>

            <div class="products-list">

              <div
                v-for="(
                  producto,
                  index
                ) in productosTop"
                :key="producto.productoId"
                class="product-row"
              >

                <div class="product-rank">
                  {{ index + 1 }}
                </div>

                <div class="product-info">

                  <strong>
                    {{ producto.producto }}
                  </strong>

                  <span>
                    {{
                      numero(
                        producto.cantidad,
                      )
                    }}
                    unidades vendidas
                  </span>

                </div>

                <div class="product-values">

                  <strong>
                    {{ moneda(producto.ventas) }}
                  </strong>

                  <span>
                    Utilidad:
                    {{
                      moneda(
                        producto.utilidad,
                      )
                    }}
                  </span>

                </div>

              </div>

              <div
                v-if="!productosTop.length"
                class="empty-state"
              >
                No hay ventas en este período.
              </div>

            </div>

          </v-card>

        </v-col>

        <!-- MÉTODOS DE PAGO -->

        <v-col
          cols="12"
          lg="5"
        >

          <v-card
            class="content-card"
            elevation="0"
          >

            <div class="card-header">

              <div>
                <h2>
                  Métodos de pago
                </h2>

                <p>
                  Distribución de las ventas
                </p>
              </div>

              <span class="header-count">
                {{ moneda(totalMetodosPago) }}
              </span>

            </div>

            <div class="payment-list">

              <div
                v-for="metodo in metodosPago"
                :key="metodo.metodoPago"
                class="payment-item"
              >

                <div class="payment-header">

                  <div class="payment-name">

                    <v-icon>
                      {{
                        iconoMetodo(
                          metodo.metodoPago,
                        )
                      }}
                    </v-icon>

                    <span>
                      {{
                        nombreMetodo(
                          metodo.metodoPago,
                        )
                      }}
                    </span>

                  </div>

                  <strong>
                    {{
                      moneda(
                        metodo.total,
                      )
                    }}
                  </strong>

                </div>

                <v-progress-linear
                  :model-value="
                    porcentajeMetodo(
                      metodo.total,
                    )
                  "
                  rounded
                  height="7"
                />

                <span class="payment-percent">
                  {{
                    porcentaje(
                      porcentajeMetodo(
                        metodo.total,
                      ),
                    )
                  }}
                  ·
                  {{
                    metodo.cantidad
                  }}
                  ventas
                </span>

              </div>

              <div
                v-if="!metodosPago.length"
                class="empty-state"
              >
                No hay datos de pagos.
              </div>

            </div>

          </v-card>

        </v-col>

      </v-row>

      <!-- =====================================
           CUENTAS POR COBRAR
      ====================================== -->

      <v-row>

        <v-col cols="12">

          <v-card
            class="content-card"
            elevation="0"
          >

            <div class="card-header">

              <div>

                <h2>
                  Cuentas por cobrar
                </h2>

                <p>
                  Ventas a crédito pendientes
                </p>

              </div>

              <div class="receivable-total">

                <span>
                  Total pendiente
                </span>

                <strong>
                  {{
                    moneda(
                      cuentasPorCobrar
                        .totalPendiente,
                    )
                  }}
                </strong>

              </div>

            </div>

            <v-table
              v-if="
                cuentasPorCobrar.ventas.length
              "
              class="report-table"
            >

              <thead>

                <tr>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Pagado</th>
                  <th>Pendiente</th>
                </tr>

              </thead>

              <tbody>

                <tr
                  v-for="venta in cuentasPorCobrar.ventas"
                  :key="venta.ventaId"
                >

                  <td>
                    <strong>
                      {{ venta.numeroVenta }}
                    </strong>
                  </td>

                  <td>
                    {{ venta.cliente }}
                  </td>

                  <td>
                    {{ formatearFecha(venta.fecha) }}
                  </td>

                  <td>
                    {{ moneda(venta.total) }}
                  </td>

                  <td class="paid">
                    {{ moneda(venta.pagado) }}
                  </td>

                  <td class="pending">
                    {{
                      moneda(
                        venta.pendiente,
                      )
                    }}
                  </td>

                </tr>

              </tbody>

            </v-table>

            <div
              v-else
              class="empty-large"
            >

              <v-icon size="45">
                mdi-check-circle-outline
              </v-icon>

              <strong>
                No hay cuentas pendientes
              </strong>

              <span>
                Todas las ventas a crédito
                están al día.
              </span>

            </div>

          </v-card>

        </v-col>

      </v-row>

    </template>
  </div>
</template>

<style scoped>
.reportes-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  margin: 5px 0 0;
  color: #777;
  font-size: 14px;
}

.filter-card,
.stat-card,
.content-card,
.comparison-card {
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 14px !important;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-content {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.period-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.date-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 420px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  height: 100%;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.sales {
  background: rgba(25, 118, 210, 0.1);
}

.stat-icon.income {
  background: rgba(46, 125, 50, 0.1);
}

.stat-icon.profit {
  background: rgba(123, 31, 162, 0.1);
}

.stat-icon.debt {
  background: rgba(239, 108, 0, 0.1);
}

.stat-content {
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #777;
  margin-bottom: 3px;
}

.stat-value {
  display: block;
  font-size: 21px;
  line-height: 1.2;
  white-space: nowrap;
}

.stat-detail {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.stat-subdetail {
  display: block;
  font-size: 11px;
  color: #888;
  margin-top: 3px;
}

/* ==========================================
   COMPARACIONES
========================================== */

.comparison {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 5px;
  font-size: 12px;
  font-weight: 650;
}

.comparison small {
  margin-left: 3px;
  font-size: 10px;
  font-weight: 400;
  color: #999;
}

.comparison.positive {
  color: #2e7d32;
}

.comparison.negative {
  color: #d32f2f;
}

.comparison.neutral {
  color: #777;
}

.comparison-row {
  margin-top: 0;
}

.comparison-card {
  padding: 20px 22px;
  margin-bottom: 20px;
}

.comparison-header {
  margin-bottom: 18px;
}

.comparison-title {
  display: block;
  font-size: 16px;
  font-weight: 650;
}

.comparison-description {
  display: block;
  margin-top: 4px;
  color: #888;
  font-size: 12px;
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.comparison-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 11px;
  background: rgba(0, 0, 0, 0.025);
}

.comparison-item-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(25, 118, 210, 0.08);
}

.comparison-item-content {
  min-width: 0;
}

.comparison-item-content span {
  display: block;
  font-size: 11px;
  color: #888;
}

.comparison-item-content strong {
  display: block;
  font-size: 15px;
  margin-top: 2px;
}

.comparison-item-content small {
  display: block;
  font-size: 11px;
  margin-top: 3px;
}

.comparison-item-content small.positive {
  color: #2e7d32;
}

.comparison-item-content small.negative {
  color: #d32f2f;
}

.comparison-item-content small.neutral {
  color: #777;
}

/* ==========================================
   CONTENIDO
========================================== */

.content-card {
  height: 100%;
  overflow: hidden;
}

.card-header {
  padding: 20px 22px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.card-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 650;
}

.card-header p {
  margin: 4px 0 0;
  color: #888;
  font-size: 13px;
}

.header-count {
  font-size: 13px;
  font-weight: 600;
  color: #777;
  white-space: nowrap;
}

.chart-container {
  height: 330px;
  padding: 0 20px 20px;
}

.total-money {
  font-size: 18px;
  white-space: nowrap;
}

.accounts-list {
  padding: 0 20px 20px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.account-item:last-child {
  border-bottom: none;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
}

.account-info strong {
  display: block;
  font-size: 14px;
}

.account-info span {
  display: block;
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.products-list {
  padding: 0 20px 20px;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.product-row:last-child {
  border-bottom: none;
}

.product-rank {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 650;
  font-size: 13px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-info strong {
  display: block;
  font-size: 14px;
}

.product-info span {
  display: block;
  color: #888;
  font-size: 12px;
  margin-top: 3px;
}

.product-values {
  text-align: right;
}

.product-values strong {
  display: block;
  font-size: 14px;
}

.product-values span {
  display: block;
  font-size: 11px;
  color: #777;
  margin-top: 3px;
}

.payment-list {
  padding: 0 22px 20px;
}

.payment-item {
  margin-bottom: 18px;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 7px;
}

.payment-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.payment-name .v-icon {
  opacity: 0.7;
}

.payment-header strong {
  font-size: 14px;
}

.payment-percent {
  display: block;
  text-align: right;
  margin-top: 3px;
  font-size: 11px;
  color: #888;
}

.receivable-total {
  text-align: right;
}

.receivable-total span {
  display: block;
  font-size: 11px;
  color: #888;
}

.receivable-total strong {
  display: block;
  font-size: 20px;
  margin-top: 2px;
}

.report-table {
  padding: 0 15px 15px;
}

.report-table th {
  font-size: 12px !important;
  color: #777 !important;
  font-weight: 600 !important;
}

.report-table td {
  font-size: 13px !important;
}

.paid {
  color: #2e7d32;
}

.pending {
  font-weight: 650;
}

.empty-state {
  padding: 25px 10px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.empty-large {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999;
}

.empty-large strong {
  color: #666;
}

.loading-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #777;
}

/* ==========================================
   RESPONSIVE
========================================== */

@media (max-width: 1100px) {
  .comparison-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 700px) {
  .reportes-page {
    padding: 15px;
  }

  .page-header {
    align-items: flex-start;
  }

  .page-title {
    font-size: 23px;
  }

  .date-filters {
    min-width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .chart-container {
    height: 260px;
  }

  .product-values {
    display: none;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .comparison-card {
    padding: 18px;
  }

  .comparison-item {
    padding: 13px;
  }
}
</style>