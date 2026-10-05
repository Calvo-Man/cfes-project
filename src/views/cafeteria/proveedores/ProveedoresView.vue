<script setup>
import { computed, onMounted, ref } from 'vue'
import axios from '@/plugins/axios'

// ─────────────────────────────────────────────
// DATOS
// ─────────────────────────────────────────────

const proveedores = ref([])

const loading = ref(false)
const saving = ref(false)

// ─────────────────────────────────────────────
// FILTROS
// ─────────────────────────────────────────────

const search = ref('')
const estadoFiltro = ref('TODOS')

// ─────────────────────────────────────────────
// DIALOGS
// ─────────────────────────────────────────────

const proveedorDialog = ref(false)
const eliminarDialog = ref(false)

// ─────────────────────────────────────────────
// EDICIÓN
// ─────────────────────────────────────────────

const editando = ref(false)
const proveedorSeleccionado = ref(null)

// ─────────────────────────────────────────────
// FORMULARIO
// ─────────────────────────────────────────────

const formulario = ref({
  nombre: '',
  nit: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
  activo: true,
})

// ─────────────────────────────────────────────
// SNACKBAR
// ─────────────────────────────────────────────

const snackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// ─────────────────────────────────────────────
// COMPUTED
// ─────────────────────────────────────────────

const proveedoresFiltrados = computed(() => {
  const texto = search.value
    .trim()
    .toLowerCase()

  return proveedores.value.filter((proveedor) => {
    const coincideBusqueda =
      !texto ||
      proveedor.nombre
        ?.toLowerCase()
        .includes(texto) ||
      proveedor.nit
        ?.toLowerCase()
        .includes(texto) ||
      proveedor.contacto
        ?.toLowerCase()
        .includes(texto) ||
      proveedor.telefono
        ?.toLowerCase()
        .includes(texto)

    const coincideEstado =
      estadoFiltro.value === 'TODOS' ||
      (estadoFiltro.value === 'ACTIVOS'
        ? proveedor.activo
        : !proveedor.activo)

    return coincideBusqueda && coincideEstado
  })
})

const totalProveedores = computed(() => {
  return proveedores.value.length
})

const proveedoresActivos = computed(() => {
  return proveedores.value.filter(
    (proveedor) => proveedor.activo,
  ).length
})

const proveedoresInactivos = computed(() => {
  return proveedores.value.filter(
    (proveedor) => !proveedor.activo,
  ).length
})

// ─────────────────────────────────────────────
// CARGAR
// ─────────────────────────────────────────────

async function cargarProveedores() {
  loading.value = true

  try {
    const response = await axios.get('/cafeteria/proveedor')

    proveedores.value = Array.isArray(response.data)
      ? response.data
      : []
  } catch (error) {
    mostrarError(
      error,
      'No se pudieron cargar los proveedores',
    )
  } finally {
    loading.value = false
  }
}

// ─────────────────────────────────────────────
// FORMULARIO
// ─────────────────────────────────────────────

function formularioInicial() {
  return {
    nombre: '',
    nit: '',
    contacto: '',
    telefono: '',
    correo: '',
    direccion: '',
    activo: true,
  }
}

function abrirCrear() {
  editando.value = false
  proveedorSeleccionado.value = null

  formulario.value = formularioInicial()

  proveedorDialog.value = true
}

function abrirEditar(proveedor) {
  editando.value = true
  proveedorSeleccionado.value = proveedor

  formulario.value = {
    nombre: proveedor.nombre || '',
    nit: proveedor.nit || '',
    contacto: proveedor.contacto || '',
    telefono: proveedor.telefono || '',
    correo: proveedor.correo || '',
    direccion: proveedor.direccion || '',
    activo: proveedor.activo ?? true,
  }

  proveedorDialog.value = true
}

function cerrarDialog() {
  if (saving.value) {
    return
  }

  proveedorDialog.value = false
}

// ─────────────────────────────────────────────
// GUARDAR
// ─────────────────────────────────────────────

async function guardarProveedor() {
  const form = formulario.value

  if (!form.nombre.trim()) {
    mostrarMensaje(
      'El nombre del proveedor es obligatorio',
      'warning',
    )
    return
  }

  if (!form.nit.trim()) {
    mostrarMensaje(
      'El NIT es obligatorio',
      'warning',
    )
    return
  }

  if (
    form.correo &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.correo.trim(),
    )
  ) {
    mostrarMensaje(
      'Ingresa un correo electrónico válido',
      'warning',
    )
    return
  }

  saving.value = true

  try {
    const payload = {
      nombre: form.nombre.trim(),
      nit: form.nit.trim(),
      activo: form.activo,
    }

    if (form.contacto.trim()) {
      payload.contacto =
        form.contacto.trim()
    }

    if (form.telefono.trim()) {
      payload.telefono =
        form.telefono.trim()
    }

    if (form.correo.trim()) {
      payload.correo =
        form.correo.trim()
    }

    if (form.direccion.trim()) {
      payload.direccion =
        form.direccion.trim()
    }

    if (editando.value) {
      await axios.patch(
        `/cafeteria/proveedor/${proveedorSeleccionado.value.id}`,
        payload,
      )

      mostrarMensaje(
        'Proveedor actualizado correctamente',
        'success',
      )
    } else {
      await axios.post(
        '/cafeteria/proveedor',
        payload,
      )

      mostrarMensaje(
        'Proveedor creado correctamente',
        'success',
      )
    }

    proveedorDialog.value = false

    await cargarProveedores()
  } catch (error) {
    mostrarError(
      error,
      editando.value
        ? 'No se pudo actualizar el proveedor'
        : 'No se pudo crear el proveedor',
    )
  } finally {
    saving.value = false
  }
}

// ─────────────────────────────────────────────
// DESACTIVAR
// ─────────────────────────────────────────────

function confirmarEliminar(proveedor) {
  proveedorSeleccionado.value = proveedor
  eliminarDialog.value = true
}

function cerrarEliminar() {
  if (saving.value) {
    return
  }

  eliminarDialog.value = false
}

async function desactivarProveedor() {
  if (!proveedorSeleccionado.value) {
    return
  }

  saving.value = true

  try {
    await axios.delete(
      `/cafeteria/proveedor/${proveedorSeleccionado.value.id}`,
    )

    eliminarDialog.value = false

    mostrarMensaje(
      'Proveedor desactivado correctamente',
      'success',
    )

    await cargarProveedores()
  } catch (error) {
    mostrarError(
      error,
      'No se pudo desactivar el proveedor',
    )
  } finally {
    saving.value = false
  }
}

// ─────────────────────────────────────────────
// FORMATO
// ─────────────────────────────────────────────

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
  cargarProveedores()
})
</script>

<template>
  <div class="proveedores-page">

    <!-- HEADER -->
    <header class="page-header">
      <div class="header-content">

        <div class="eyebrow">
          <span class="eyebrow-icon">
            <v-icon size="15">
              mdi-truck-outline
            </v-icon>
          </span>

          CAFETERÍA
        </div>

        <h1>Proveedores</h1>

        <p>
          Administra proveedores, contactos y datos de abastecimiento.
        </p>

      </div>

      <div class="header-actions">

        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-refresh"
          :loading="loading"
          class="refresh-btn"
          @click="cargarProveedores"
        >
          Actualizar
        </v-btn>

        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          elevation="0"
          class="new-provider-btn"
          @click="abrirCrear"
        >
          Nuevo proveedor
        </v-btn>

      </div>
    </header>


    <!-- RESUMEN -->
    <section class="summary-grid">

      <div class="summary-card">

        <div class="summary-icon">
          <v-icon size="21">
            mdi-truck-outline
          </v-icon>
        </div>

        <div class="summary-content">
          <span>Proveedores</span>
          <strong>{{ totalProveedores }}</strong>
        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon success-icon">
          <v-icon size="21">
            mdi-check-circle-outline
          </v-icon>
        </div>

        <div class="summary-content">
          <span>Activos</span>
          <strong>{{ proveedoresActivos }}</strong>
        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon danger-icon">
          <v-icon size="21">
            mdi-close-circle-outline
          </v-icon>
        </div>

        <div class="summary-content">
          <span>Inactivos</span>
          <strong>{{ proveedoresInactivos }}</strong>
        </div>

      </div>

    </section>


    <!-- DIRECTORIO -->
    <v-card
      class="main-card"
      elevation="0"
    >

      <!-- CARD HEADER -->
      <div class="card-header">

        <div class="card-heading">

          <div class="card-heading-icon">
            <v-icon size="19">
              mdi-contacts-outline
            </v-icon>
          </div>

          <div>
            <h2>Directorio de proveedores</h2>

            <p>
              Empresas y personas que suministran productos a la cafetería.
            </p>
          </div>

        </div>

        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          class="provider-count"
        >
          {{ proveedoresFiltrados.length }}
          {{ proveedoresFiltrados.length === 1 ? 'proveedor' : 'proveedores' }}
        </v-chip>

      </div>


      <!-- FILTERS -->
      <div class="filters">

        <v-text-field
          v-model="search"
          label="Buscar proveedor"
          placeholder="Nombre, NIT, contacto o teléfono..."
          prepend-inner-icon="mdi-magnify"
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
              title: 'Activos',
              value: 'ACTIVOS',
            },
            {
              title: 'Inactivos',
              value: 'INACTIVOS',
            },
          ]"
          item-title="title"
          item-value="value"
          label="Estado"
          prepend-inner-icon="mdi-list-status"
          variant="outlined"
          density="comfortable"
          hide-details
        />

      </div>


      <v-divider />


      <!-- TABLE -->
      <v-data-table
        :headers="[
          {
            title: 'Proveedor',
            key: 'nombre',
            minWidth: '250px',
          },
          {
            title: 'NIT',
            key: 'nit',
            minWidth: '130px',
          },
          {
            title: 'Contacto',
            key: 'contacto',
            minWidth: '150px',
          },
          {
            title: 'Teléfono',
            key: 'telefono',
            minWidth: '135px',
          },
          {
            title: 'Correo',
            key: 'correo',
            minWidth: '210px',
          },
          {
            title: 'Estado',
            key: 'activo',
            minWidth: '100px',
            sortable: false,
          },
          {
            title: 'Registrado',
            key: 'createdAt',
            minWidth: '125px',
          },
          {
            title: '',
            key: 'acciones',
            sortable: false,
            align: 'end',
            width: '90px',
          },
        ]"
        :items="proveedoresFiltrados"
        :loading="loading"
        item-value="id"
        hover
        class="providers-table"
      >

        <!-- PROVEEDOR -->
        <template #item.nombre="{ item }">

          <div class="provider-name">

            <div class="provider-avatar">
              {{
                item.nombre
                  ?.charAt(0)
                  ?.toUpperCase()
              }}
            </div>

            <div class="provider-info">

              <strong>
                {{ item.nombre }}
              </strong>

              <span v-if="item.direccion">
                <v-icon size="12">
                  mdi-map-marker-outline
                </v-icon>

                {{ item.direccion }}
              </span>

            </div>

          </div>

        </template>


        <!-- NIT -->
        <template #item.nit="{ item }">

          <span class="nit">
            {{ item.nit || '-' }}
          </span>

        </template>


        <!-- CONTACTO -->
        <template #item.contacto="{ item }">

          <div
            v-if="item.contacto"
            class="contact-person"
          >
            <v-icon size="15">
              mdi-account-outline
            </v-icon>

            <span>
              {{ item.contacto }}
            </span>
          </div>

          <span
            v-else
            class="empty-value"
          >
            -
          </span>

        </template>


        <!-- TELEFONO -->
        <template #item.telefono="{ item }">

          <a
            v-if="item.telefono"
            :href="`tel:${item.telefono}`"
            class="contact-link"
          >
            <span class="contact-icon">
              <v-icon size="14">
                mdi-phone-outline
              </v-icon>
            </span>

            {{ item.telefono }}
          </a>

          <span
            v-else
            class="empty-value"
          >
            -
          </span>

        </template>


        <!-- CORREO -->
        <template #item.correo="{ item }">

          <a
            v-if="item.correo"
            :href="`mailto:${item.correo}`"
            class="contact-link email-link"
          >
            <span class="contact-icon">
              <v-icon size="14">
                mdi-email-outline
              </v-icon>
            </span>

            <span class="email-text">
              {{ item.correo }}
            </span>
          </a>

          <span
            v-else
            class="empty-value"
          >
            -
          </span>

        </template>


        <!-- ESTADO -->
        <template #item.activo="{ item }">

          <v-chip
            :color="item.activo ? 'success' : 'grey'"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            <span
              class="status-dot"
              :class="{ inactive: !item.activo }"
            />

            {{ item.activo ? 'Activo' : 'Inactivo' }}
          </v-chip>

        </template>


        <!-- FECHA -->
        <template #item.createdAt="{ item }">

          <span class="date-text">
            {{ formatoFecha(item.createdAt) }}
          </span>

        </template>


        <!-- ACCIONES -->
        <template #item.acciones="{ item }">

          <div class="actions">

            <v-tooltip text="Editar">
              <template #activator="{ props }">

                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  color="primary"
                  aria-label="Editar proveedor"
                  @click="abrirEditar(item)"
                />

              </template>
            </v-tooltip>


            <v-tooltip
              v-if="item.activo"
              text="Desactivar"
            >
              <template #activator="{ props }">

                <v-btn
                  v-bind="props"
                  icon="mdi-eye-off-outline"
                  variant="text"
                  size="small"
                  color="error"
                  aria-label="Desactivar proveedor"
                  @click="confirmarEliminar(item)"
                />

              </template>
            </v-tooltip>

          </div>

        </template>


        <!-- EMPTY -->
        <template #no-data>

          <div class="empty-state">

            <div class="empty-icon">
              <v-icon size="28">
                mdi-truck-outline
              </v-icon>
            </div>

            <strong>
              No hay proveedores
            </strong>

            <span>
              No se encontraron proveedores con los filtros actuales.
            </span>

          </div>

        </template>


      </v-data-table>

    </v-card>


    <!-- DIALOG CREAR / EDITAR -->
    <v-dialog
      v-model="proveedorDialog"
      max-width="700"
      persistent
    >

      <v-card class="provider-dialog">

        <div class="dialog-header">

          <div class="dialog-heading">

            <div class="dialog-icon">
              <v-icon>
                {{
                  editando
                    ? 'mdi-pencil-outline'
                    : 'mdi-truck-plus-outline'
                }}
              </v-icon>
            </div>

            <div>

              <span class="dialog-eyebrow">
                {{ editando ? 'EDITAR PROVEEDOR' : 'NUEVO PROVEEDOR' }}
              </span>

              <h2>
                {{
                  editando
                    ? 'Editar proveedor'
                    : 'Nuevo proveedor'
                }}
              </h2>

            </div>

          </div>

          <v-btn
            icon="mdi-close"
            variant="text"
            :disabled="saving"
            aria-label="Cerrar"
            @click="cerrarDialog"
          />

        </div>


        <v-divider />


        <v-card-text class="dialog-content">

          <v-form
            @submit.prevent="guardarProveedor"
          >

            <!-- IDENTIDAD -->
            <div class="form-section">

              <div class="section-heading">

                <div class="section-number">
                  01
                </div>

                <div>
                  <h3>Información del proveedor</h3>
                  <span>
                    Identificación y datos principales
                  </span>
                </div>

              </div>


              <v-row>

                <v-col cols="12">

                  <v-text-field
                    v-model="formulario.nombre"
                    label="Nombre del proveedor *"
                    placeholder="Ej. Distribuciones ABC"
                    prepend-inner-icon="mdi-domain"
                    variant="outlined"
                    :disabled="saving"
                    maxlength="150"
                    counter="150"
                    hide-details="auto"
                  />

                </v-col>


                <v-col
                  cols="12"
                  md="6"
                >

                  <v-text-field
                    v-model="formulario.nit"
                    label="NIT *"
                    placeholder="Ej. 900123456-7"
                    prepend-inner-icon="mdi-card-account-details-outline"
                    variant="outlined"
                    :disabled="saving"
                    maxlength="30"
                    counter="30"
                    hide-details="auto"
                  />

                </v-col>


                <v-col
                  cols="12"
                  md="6"
                >

                  <v-text-field
                    v-model="formulario.contacto"
                    label="Persona de contacto"
                    placeholder="Nombre del contacto"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    :disabled="saving"
                    maxlength="120"
                    counter="120"
                    hide-details="auto"
                  />

                </v-col>

              </v-row>

            </div>


            <!-- CONTACTO -->
            <div class="form-section">

              <div class="section-heading">

                <div class="section-number">
                  02
                </div>

                <div>
                  <h3>Información de contacto</h3>
                  <span>
                    Canales para comunicarse con el proveedor
                  </span>
                </div>

              </div>


              <v-row>

                <v-col
                  cols="12"
                  md="6"
                >

                  <v-text-field
                    v-model="formulario.telefono"
                    label="Teléfono"
                    placeholder="Ej. 3001234567"
                    prepend-inner-icon="mdi-phone-outline"
                    variant="outlined"
                    :disabled="saving"
                    maxlength="20"
                    counter="20"
                    hide-details="auto"
                  />

                </v-col>


                <v-col
                  cols="12"
                  md="6"
                >

                  <v-text-field
                    v-model="formulario.correo"
                    label="Correo electrónico"
                    placeholder="proveedor@empresa.com"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    :disabled="saving"
                    maxlength="150"
                    counter="150"
                    type="email"
                    hide-details="auto"
                  />

                </v-col>


                <v-col cols="12">

                  <v-textarea
                    v-model="formulario.direccion"
                    label="Dirección"
                    placeholder="Dirección del proveedor"
                    prepend-inner-icon="mdi-map-marker-outline"
                    variant="outlined"
                    :disabled="saving"
                    maxlength="200"
                    counter="200"
                    rows="2"
                    hide-details="auto"
                  />

                </v-col>

              </v-row>

            </div>


            <!-- ESTADO -->
            <div class="form-section last-section">

              <div class="section-heading">

                <div class="section-number">
                  03
                </div>

                <div>
                  <h3>Estado</h3>
                  <span>
                    Disponibilidad para nuevas operaciones
                  </span>
                </div>

              </div>


              <div class="status-setting">

                <div
                  class="status-setting-icon"
                  :class="{ inactive: !formulario.activo }"
                >
                  <v-icon size="19">
                    {{
                      formulario.activo
                        ? 'mdi-check-circle-outline'
                        : 'mdi-eye-off-outline'
                    }}
                  </v-icon>
                </div>


                <div class="status-setting-content">

                  <strong>
                    {{
                      formulario.activo
                        ? 'Proveedor activo'
                        : 'Proveedor inactivo'
                    }}
                  </strong>

                  <span>
                    {{
                      formulario.activo
                        ? 'Disponible para nuevas operaciones de compra.'
                        : 'No estará disponible para nuevas operaciones.'
                    }}
                  </span>

                </div>


                <v-spacer />


                <v-switch
                  v-model="formulario.activo"
                  color="success"
                  inset
                  :disabled="saving"
                  hide-details
                />

              </div>

            </div>


            <div class="dialog-actions">

              <v-btn
                variant="text"
                :disabled="saving"
                @click="cerrarDialog"
              >
                Cancelar
              </v-btn>

              <v-btn
                color="primary"
                type="submit"
                :loading="saving"
                prepend-icon="mdi-check"
              >
                {{
                  editando
                    ? 'Guardar cambios'
                    : 'Crear proveedor'
                }}
              </v-btn>

            </div>

          </v-form>

        </v-card-text>

      </v-card>

    </v-dialog>


    <!-- DIALOG DESACTIVAR -->
    <v-dialog
      v-model="eliminarDialog"
      max-width="460"
    >

      <v-card class="confirm-dialog">

        <div class="confirm-header">

          <div class="confirm-icon">
            <v-icon>
              mdi-eye-off-outline
            </v-icon>
          </div>

          <div>
            <h2>Desactivar proveedor</h2>

            <span>
              El historial se conservará.
            </span>
          </div>

        </div>


        <v-card-text>

          <p class="confirm-text">
            ¿Deseas desactivar a
            <strong>
              {{ proveedorSeleccionado?.nombre }}
            </strong>?
          </p>


          <div class="warning-box">

            <v-icon size="19">
              mdi-information-outline
            </v-icon>

            <span>
              El proveedor dejará de estar disponible
              para nuevas operaciones, pero sus registros
              anteriores se conservarán.
            </span>

          </div>

        </v-card-text>


        <v-card-actions class="confirm-actions">

          <v-btn
            variant="text"
            :disabled="saving"
            @click="cerrarEliminar"
          >
            Cancelar
          </v-btn>

          <v-spacer />

          <v-btn
            color="error"
            :loading="saving"
            prepend-icon="mdi-eye-off-outline"
            @click="desactivarProveedor"
          >
            Desactivar
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>


    <!-- SNACKBAR -->
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
.proveedores-page {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 28px;
  color: #172033;
}

/* =========================================
   HEADER
========================================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.header-content {
  min-width: 0;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1976d2;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 1.25px;
  margin-bottom: 7px;
}

.eyebrow-icon {
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #eaf3ff;
  color: #1976d2;
}

.page-header h1 {
  margin: 0;
  color: #172033;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 720;
  letter-spacing: -0.4px;
}

.page-header p {
  margin: 7px 0 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}

.refresh-btn,
.new-provider-btn {
  height: 42px !important;
}

/* =========================================
   SUMMARY
========================================= */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e9ef;
  border-radius: 12px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  border-color: #d9e1eb;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.summary-icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eaf3ff;
  color: #1976d2;
}

.success-icon {
  background: #eaf8f0;
  color: #18864b;
}

.danger-icon {
  background: #fff0f0;
  color: #d14343;
}

.summary-content span {
  display: block;
  margin-bottom: 3px;
  color: #737d8d;
  font-size: 11px;
  line-height: 1.3;
}

.summary-content strong {
  display: block;
  color: #172033;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
}

/* =========================================
   MAIN CARD
========================================= */

.main-card {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e5e9ef !important;
  border-radius: 12px !important;
}

.card-header {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 15px 20px;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.card-heading-icon {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f1f6fc;
  color: #1976d2;
}

.card-heading h2 {
  margin: 0;
  color: #172033;
  font-size: 15px;
  font-weight: 700;
}

.card-heading p {
  margin: 2px 0 0;
  color: #8992a0;
  font-size: 11px;
}

.provider-count {
  flex-shrink: 0;
  font-size: 11px !important;
  font-weight: 600;
}

/* =========================================
   FILTERS
========================================= */

.filters {
  display: grid;
  grid-template-columns: 2fr 0.8fr;
  gap: 11px;
  padding: 0 20px 17px;
}

/* =========================================
   TABLE
========================================= */

.providers-table {
  border-radius: 0;
}

:deep(.providers-table .v-data-table__th) {
  height: 44px !important;
  background: #f8fafc !important;
  color: #667085 !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  border-bottom: 1px solid #e8edf2 !important;
}

:deep(.providers-table .v-data-table__td) {
  height: 66px !important;
  border-bottom: 1px solid #edf0f4 !important;
  color: #4b5563;
  font-size: 12px;
}

:deep(.providers-table tbody tr:hover) {
  background: #fafcff !important;
}

:deep(
  .providers-table
  .v-data-table__tr:last-child
  .v-data-table__td
) {
  border-bottom: none !important;
}

/* =========================================
   PROVIDER
========================================= */

.provider-name {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.provider-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #eaf3ff;
  color: #1976d2;
  border: 1px solid #dceafb;
  font-size: 14px;
  font-weight: 750;
}

.provider-info {
  min-width: 0;
}

.provider-info strong {
  display: block;
  max-width: 240px;
  overflow: hidden;
  color: #202939;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.provider-info span {
  display: flex;
  align-items: center;
  gap: 3px;
  max-width: 240px;
  overflow: hidden;
  margin-top: 3px;
  color: #8992a0;
  font-size: 10px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================
   NIT
========================================= */

.nit {
  color: #596273;
  font-family: monospace;
  font-size: 12px;
}

/* =========================================
   CONTACT
========================================= */

.contact-person {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #596273;
  white-space: nowrap;
}

.contact-person .v-icon {
  color: #8992a0;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 210px;
  color: #526176;
  text-decoration: none;
  transition: color 0.15s ease;
}

.contact-link:hover {
  color: #1976d2;
}

.contact-icon {
  width: 25px;
  height: 25px;
  min-width: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
}

.email-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-value {
  color: #a1a8b3;
}

/* =========================================
   STATUS
========================================= */

.status-chip {
  font-size: 10px !important;
  font-weight: 650;
}

.status-dot {
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #18864b;
}

.status-dot.inactive {
  background: #7b8490;
}

/* =========================================
   DATE
========================================= */

.date-text {
  color: #6b7280;
  font-size: 11px;
  white-space: nowrap;
}

/* =========================================
   ACTIONS
========================================= */

.actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
}

.actions .v-btn {
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.actions .v-btn:hover {
  transform: translateY(-1px);
}

/* =========================================
   EMPTY
========================================= */

.empty-state {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 30px;
}

.empty-icon {
  width: 54px;
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #94a3b8;
}

.empty-state strong {
  color: #465064;
  font-size: 13px;
}

.empty-state span {
  color: #929aa7;
  font-size: 11px;
  text-align: center;
}

/* =========================================
   DIALOG
========================================= */

.provider-dialog {
  overflow: hidden;
  border-radius: 14px !important;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 17px 20px;
}

.dialog-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.dialog-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #eaf3ff;
  color: #1976d2;
}

.dialog-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: #1976d2;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 1px;
}

.dialog-heading h2 {
  margin: 0;
  color: #172033;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
}

.dialog-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 22px 20px !important;
}

/* =========================================
   FORM SECTIONS
========================================= */

.form-section {
  padding: 19px 0;
}

.form-section + .form-section {
  border-top: 1px solid #edf0f4;
}

.last-section {
  padding-bottom: 5px;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 15px;
}

.section-number {
  width: 27px;
  height: 27px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  background: #f1f6fc;
  color: #1976d2;
  font-size: 9px;
  font-weight: 750;
}

.section-heading h3 {
  margin: 0;
  color: #263143;
  font-size: 13px;
  font-weight: 700;
}

.section-heading span {
  display: block;
  margin-top: 1px;
  color: #8a93a1;
  font-size: 10px;
}

/* =========================================
   STATUS SETTING
========================================= */

.status-setting {
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  border: 1px solid #e4e8ed;
  border-radius: 9px;
  background: #fafbfc;
}

.status-setting-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eaf8f0;
  color: #18864b;
}

.status-setting-icon.inactive {
  background: #f1f3f5;
  color: #7b8490;
}

.status-setting-content {
  min-width: 0;
}

.status-setting-content strong {
  display: block;
  color: #293343;
  font-size: 12px;
}

.status-setting-content span {
  display: block;
  margin-top: 2px;
  color: #8a93a1;
  font-size: 10px;
}

/* =========================================
   DIALOG ACTIONS
========================================= */

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 18px;
}

/* =========================================
   CONFIRM DIALOG
========================================= */

.confirm-dialog {
  overflow: hidden;
  border-radius: 14px !important;
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 20px 20px 10px;
}

.confirm-icon {
  width: 38px;
  height: 38px;
  min-width: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #fff1f1;
  color: #d14343;
}

.confirm-header h2 {
  margin: 0;
  color: #202939;
  font-size: 17px;
  font-weight: 700;
}

.confirm-header span {
  display: block;
  margin-top: 2px;
  color: #8a93a1;
  font-size: 10px;
}

.confirm-text {
  margin: 7px 0 15px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.55;
}

.confirm-text strong {
  color: #202939;
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 13px;
  border: 1px solid #dce9f8;
  border-radius: 8px;
  background: #f3f8fe;
  color: #526176;
  font-size: 11px;
  line-height: 1.5;
}

.warning-box .v-icon {
  flex-shrink: 0;
  color: #1976d2;
}

.confirm-actions {
  min-height: 64px;
  padding: 10px 20px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .filters {
    grid-template-columns: 1.5fr 1fr;
  }
}

@media (max-width: 850px) {
  .proveedores-page {
    padding: 20px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-btn,
  .new-provider-btn {
    flex: 1;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  :deep(.providers-table .v-data-table__wrapper) {
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .proveedores-page {
    padding: 14px;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .header-actions {
    flex-direction: column;
  }

  .refresh-btn,
  .new-provider-btn {
    width: 100%;
    flex: none;
  }

  .card-header {
    padding: 13px 15px;
  }

  .provider-count {
    display: none;
  }

  .filters {
    padding: 0 15px 15px;
  }

  .dialog-content {
    max-height: 66vh;
    padding: 0 17px 18px !important;
  }

  .status-setting {
    align-items: flex-start;
  }

  .status-setting .v-spacer {
    display: none;
  }

  .status-setting .v-switch {
    margin-left: auto;
  }
}
</style>