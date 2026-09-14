<template>
  <v-container fluid class="pa-6">

    <!-- ENCABEZADO -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">
          Cafetería
        </h1>

        <p class="text-body-2 text-medium-emphasis mt-1">
          Resumen de operaciones de la cafetería
        </p>
      </div>

      <v-chip
        :color="dashboard.caja.abierta ? 'success' : 'error'"
        variant="tonal"
        :prepend-icon="
          dashboard.caja.abierta
            ? 'mdi-cash-register'
            : 'mdi-cash-register-off'
        "
      >
        {{ dashboard.caja.abierta ? 'Caja abierta' : 'Caja cerrada' }}
      </v-chip>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="d-flex justify-center py-12"
    >
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
      />
    </div>

    <template v-else>

      <!-- TARJETAS PRINCIPALES -->
      <v-row>

        <!-- VENTAS -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="dashboard-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">

                <div>
                  <div class="text-body-2 text-medium-emphasis">
                    Ventas de hoy
                  </div>

                  <div class="text-h5 font-weight-bold mt-2">
                    {{ formatoMoneda(dashboard.ventasHoy) }}
                  </div>
                </div>

                <v-avatar
                  color="primary"
                  variant="tonal"
                  size="48"
                >
                  <v-icon icon="mdi-cart-outline" />
                </v-avatar>

              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- COMPRAS -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="dashboard-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">

                <div>
                  <div class="text-body-2 text-medium-emphasis">
                    Compras de hoy
                  </div>

                  <div class="text-h5 font-weight-bold mt-2">
                    {{ formatoMoneda(dashboard.comprasHoy) }}
                  </div>
                </div>

                <v-avatar
                  color="orange"
                  variant="tonal"
                  size="48"
                >
                  <v-icon icon="mdi-truck-outline" />
                </v-avatar>

              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- CAJA -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="dashboard-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">

                <div>
                  <div class="text-body-2 text-medium-emphasis">
                    Saldo en caja
                  </div>

                  <div class="text-h5 font-weight-bold mt-2">
                    {{ formatoMoneda(dashboard.caja.saldoActual) }}
                  </div>
                </div>

                <v-avatar
                  color="success"
                  variant="tonal"
                  size="48"
                >
                  <v-icon icon="mdi-cash-multiple" />
                </v-avatar>

              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- PRODUCTOS -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="dashboard-card" elevation="0">
            <v-card-text>
              <div class="d-flex align-center justify-space-between">

                <div>
                  <div class="text-body-2 text-medium-emphasis">
                    Productos activos
                  </div>

                  <div class="text-h5 font-weight-bold mt-2">
                    {{ dashboard.productos }}
                  </div>
                </div>

                <v-avatar
                  color="info"
                  variant="tonal"
                  size="48"
                >
                  <v-icon icon="mdi-package-variant-closed" />
                </v-avatar>

              </div>
            </v-card-text>
          </v-card>
        </v-col>

      </v-row>

      <!-- SEGUNDA SECCIÓN -->
      <v-row class="mt-2">

        <!-- VENTAS RECIENTES -->
        <v-col cols="12" lg="8">
          <v-card class="dashboard-card" elevation="0">

            <v-card-title class="d-flex align-center">
              <v-icon
                icon="mdi-receipt-text-outline"
                class="mr-2"
              />

              Ventas recientes
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">

              <v-table>
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
                    <td class="font-weight-medium">
                      {{ venta.numeroVenta }}
                    </td>

                    <td>
                      {{ formatFecha(venta.createdAt) }}
                    </td>

                    <td>
                      <v-chip
                        size="small"
                        variant="tonal"
                      >
                        {{ venta.metodoPago }}
                      </v-chip>
                    </td>

                    <td>
                      <v-chip
                        size="small"
                        :color="
                          venta.estado === 'COMPLETADA'
                            ? 'success'
                            : 'error'
                        "
                        variant="tonal"
                      >
                        {{ venta.estado }}
                      </v-chip>
                    </td>

                    <td class="text-right font-weight-bold">
                      {{ formatoMoneda(venta.total) }}
                    </td>
                  </tr>

                  <tr
                    v-if="dashboard.ventasRecientes.length === 0"
                  >
                    <td
                      colspan="5"
                      class="text-center py-8 text-medium-emphasis"
                    >
                      No hay ventas registradas
                    </td>
                  </tr>

                </tbody>
              </v-table>

            </v-card-text>
          </v-card>
        </v-col>

        <!-- STOCK BAJO -->
        <v-col cols="12" lg="4">
          <v-card class="dashboard-card" elevation="0">

            <v-card-title class="d-flex align-center">
              <v-icon
                icon="mdi-alert-outline"
                class="mr-2"
              />

              Stock bajo
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">

              <v-list
                v-if="dashboard.productosStockBajo.length > 0"
              >
                <v-list-item
                  v-for="producto in dashboard.productosStockBajo"
                  :key="producto.id"
                >

                  <template #prepend>
                    <v-avatar
                      color="error"
                      variant="tonal"
                    >
                      <v-icon icon="mdi-package-variant" />
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    {{ producto.nombre }}
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    Mínimo:
  {{ formatoStock(producto.stockMinimo, producto.unidad) }}
                    
                  </v-list-item-subtitle>

                  <template #append>
             <v-chip
  color="error"
  size="small"
  variant="tonal"
>
  {{ formatoStock(producto.stockActual, producto.unidad) }}
</v-chip>
                  </template>

                </v-list-item>
              </v-list>

              <div
                v-else
                class="text-center py-8 text-medium-emphasis"
              >
                <v-icon
                  icon="mdi-check-circle-outline"
                  size="40"
                  class="mb-2"
                />

                <div>
                  No hay productos con stock bajo
                </div>
              </div>

            </v-card-text>
          </v-card>
        </v-col>

      </v-row>

      <!-- RESUMEN DE CAJA -->
      <v-row class="mt-2">

        <v-col cols="12">
          <v-card class="dashboard-card" elevation="0">

            <v-card-title>
              <v-icon
                icon="mdi-cash-register"
                class="mr-2"
              />

              Resumen de caja
            </v-card-title>

            <v-divider />

            <v-card-text>
              <v-row>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <div class="text-body-2 text-medium-emphasis">
                    Saldo inicial
                  </div>

                  <div class="text-h6 font-weight-bold">
                    {{ formatoMoneda(dashboard.caja.saldoInicial) }}
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <div class="text-body-2 text-medium-emphasis">
                    Ingresos
                  </div>

                  <div class="text-h6 font-weight-bold text-success">
                    + {{ formatoMoneda(dashboard.caja.ingresos) }}
                  </div>
                </v-col>

                <v-col
                  cols="12"
                  sm="4"
                >
                  <div class="text-body-2 text-medium-emphasis">
                    Egresos
                  </div>

                  <div class="text-h6 font-weight-bold text-error">
                    - {{ formatoMoneda(dashboard.caja.egresos) }}
                  </div>
                </v-col>

              </v-row>
            </v-card-text>

          </v-card>
        </v-col>

      </v-row>

      <!-- ACCIONES RÁPIDAS -->
      <v-row class="mt-2">

        <v-col cols="12">
          <v-card class="dashboard-card" elevation="0">

            <v-card-title>
              Acciones rápidas
            </v-card-title>

            <v-card-text>

              <div class="d-flex flex-wrap ga-3">

                <v-btn
                  color="primary"
                  prepend-icon="mdi-cart-plus"
                  to="/cafeteria/ventas"
                >
                  Nueva venta
                </v-btn>

                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-truck-plus"
                  to="/cafeteria/compras"
                >
                  Nueva compra
                </v-btn>

                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-package-variant"
                  to="/cafeteria/inventario"
                >
                  Inventario
                </v-btn>

                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-cash-register"
                  to="/cafeteria/caja"
                >
                  Caja
                </v-btn>

              </div>

            </v-card-text>

          </v-card>
        </v-col>

      </v-row>

    </template>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/plugins/axios'

const loading = ref(false)

const dashboard = ref({
  fecha: null,

  ventasHoy: 0,
  comprasHoy: 0,
  productos: 0,

  caja: {
    abierta: false,
    sesionId: null,
    saldoInicial: 0,
    ingresos: 0,
    egresos: 0,
    saldoActual: 0,
  },

  productosStockBajo: [],

  ventasRecientes: [],
})

onMounted(() => {
  cargarDashboard()
})

async function cargarDashboard() {
  try {
    loading.value = true

    const { data } = await api.get('/cafeteria/dashboard')

    dashboard.value = data
  } catch (error) {
    console.error(
      'Error cargando dashboard de cafetería:',
      error
    )
  } finally {
    loading.value = false
  }
}

function formatoMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0)
}

function formatFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

function formatoStock(cantidad, unidad) {
  const valor = Number(cantidad) || 0

  // Productos vendidos por unidad
  if (unidad === 'UNIDAD') {
    return `${Math.trunc(valor)}`
  }

  // Productos que pueden manejar cantidades decimales
  return valor.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}
</script>

<style scoped>
.dashboard-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  height: 100%;
  transition: 0.2s ease;
}

.dashboard-card:hover {
  border-color: rgba(25, 118, 210, 0.25);
  transform: translateY(-1px);
}
</style>