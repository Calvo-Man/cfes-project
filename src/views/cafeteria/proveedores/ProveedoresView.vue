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
    const response = await axios.get('/proveedor')

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
        `/proveedor/${proveedorSeleccionado.value.id}`,
        payload,
      )

      mostrarMensaje(
        'Proveedor actualizado correctamente',
        'success',
      )
    } else {
      await axios.post(
        '/proveedor',
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
      `/proveedor/${proveedorSeleccionado.value.id}`,
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

<div class="page-header">

  <div>
    <div class="eyebrow">
      CAFETERÍA
    </div>

    <h1>
      Proveedores
    </h1>

    <p>
      Administra los proveedores de la cafetería
    </p>
  </div>

  <div class="header-actions">

    <v-btn
      variant="outlined"
      prepend-icon="mdi-refresh"
      :loading="loading"
      @click="cargarProveedores"
    >
      Actualizar
    </v-btn>

    <v-btn
      color="primary"
      prepend-icon="mdi-plus"
      @click="abrirCrear"
    >
      Nuevo proveedor
    </v-btn>

  </div>

</div>

<!-- RESUMEN -->

<div class="summary-grid">

  <div class="summary-card">

    <div class="summary-icon">
      <v-icon
        icon="mdi-truck-outline"
      />
    </div>

    <div>
      <span>
        Proveedores
      </span>

      <strong>
        {{ totalProveedores }}
      </strong>
    </div>

  </div>

  <div class="summary-card">

    <div class="summary-icon success-icon">
      <v-icon
        icon="mdi-check-circle-outline"
      />
    </div>

    <div>
      <span>
        Activos
      </span>

      <strong>
        {{ proveedoresActivos }}
      </strong>
    </div>

  </div>

  <div class="summary-card">

    <div class="summary-icon danger-icon">
      <v-icon
        icon="mdi-close-circle-outline"
      />
    </div>

    <div>
      <span>
        Inactivos
      </span>

      <strong>
        {{ proveedoresInactivos }}
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
        Directorio de proveedores
      </h2>

      <p>
        Empresas y personas que suministran productos
      </p>
    </div>

  </div>

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
      variant="outlined"
      density="comfortable"
      hide-details
    />

  </div>

  <v-data-table
    :headers="[
      {
        title: 'Proveedor',
        key: 'nombre',
      },
      {
        title: 'NIT',
        key: 'nit',
      },
      {
        title: 'Contacto',
        key: 'contacto',
      },
      {
        title: 'Teléfono',
        key: 'telefono',
      },
      {
        title: 'Correo',
        key: 'correo',
      },
      {
        title: 'Estado',
        key: 'activo',
      },
      {
        title: 'Registrado',
        key: 'createdAt',
      },
      {
        title: 'Acciones',
        key: 'acciones',
        sortable: false,
        align: 'end',
      },
    ]"
    :items="proveedoresFiltrados"
    :loading="loading"
    item-value="id"
    hover
    class="providers-table"
  >

    <template #item.nombre="{ item }">

      <div class="provider-name">

        <div class="provider-avatar">
          {{
            item.nombre
              ?.charAt(0)
              ?.toUpperCase()
          }}
        </div>

        <div>

          <strong>
            {{ item.nombre }}
          </strong>

          <span
            v-if="item.direccion"
          >
            {{ item.direccion }}
          </span>

        </div>

      </div>

    </template>

    <template #item.nit="{ item }">

      <span class="nit">
        {{ item.nit }}
      </span>

    </template>

    <template #item.contacto="{ item }">

      {{
        item.contacto || '-'
      }}

    </template>

    <template #item.telefono="{ item }">

      <a
        v-if="item.telefono"
        :href="`tel:${item.telefono}`"
        class="contact-link"
      >
        <v-icon
          icon="mdi-phone-outline"
          size="15"
        />

        {{ item.telefono }}
      </a>

      <span v-else>
        -
      </span>

    </template>

    <template #item.correo="{ item }">

      <a
        v-if="item.correo"
        :href="`mailto:${item.correo}`"
        class="contact-link"
      >
        <v-icon
          icon="mdi-email-outline"
          size="15"
        />

        {{ item.correo }}
      </a>

      <span v-else>
        -
      </span>

    </template>

    <template #item.activo="{ item }">

      <v-chip
        :color="
          item.activo
            ? 'success'
            : 'grey'
        "
        size="small"
        variant="tonal"
      >
        {{
          item.activo
            ? 'Activo'
            : 'Inactivo'
        }}
      </v-chip>

    </template>

    <template #item.createdAt="{ item }">

      {{ formatoFecha(item.createdAt) }}

    </template>

    <template #item.acciones="{ item }">

      <div class="actions">

        <v-tooltip text="Editar">

          <template #activator="{ props }">

            <v-btn
              v-bind="props"
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              @click="
                abrirEditar(item)
              "
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
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              color="error"
              @click="
                confirmarEliminar(item)
              "
            />

          </template>

        </v-tooltip>

      </div>

    </template>

    <template #no-data>

      <div class="empty-state">

        <v-icon
          icon="mdi-truck-outline"
          size="44"
        />

        <strong>
          No hay proveedores
        </strong>

        <span>
          No se encontraron proveedores
          con los filtros actuales.
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

  <v-card>

    <v-card-title class="dialog-title">

      <div>

        <span>
          PROVEEDORES
        </span>

        <h2>
          {{
            editando
              ? 'Editar proveedor'
              : 'Nuevo proveedor'
          }}
        </h2>

      </div>

      <v-btn
        icon="mdi-close"
        variant="text"
        :disabled="saving"
        @click="cerrarDialog"
      />

    </v-card-title>

    <v-divider />

    <v-card-text>

      <v-form
        @submit.prevent="
          guardarProveedor
        "
      >

        <v-row>

          <v-col cols="12">

            <v-text-field
              v-model="
                formulario.nombre
              "
              label="Nombre del proveedor *"
              placeholder="Ej. Distribuciones ABC"
              prepend-inner-icon="
                mdi-domain
              "
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
              v-model="
                formulario.nit
              "
              label="NIT *"
              placeholder="Ej. 900123456-7"
              prepend-inner-icon="
                mdi-card-account-details-outline
              "
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
              v-model="
                formulario.contacto
              "
              label="Persona de contacto"
              placeholder="Nombre del contacto"
              prepend-inner-icon="
                mdi-account-outline
              "
              variant="outlined"
              :disabled="saving"
              maxlength="120"
              counter="120"
              hide-details="auto"
            />

          </v-col>

          <v-col
            cols="12"
            md="6"
          >

            <v-text-field
              v-model="
                formulario.telefono
              "
              label="Teléfono"
              placeholder="Ej. 3001234567"
              prepend-inner-icon="
                mdi-phone-outline
              "
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
              v-model="
                formulario.correo
              "
              label="Correo electrónico"
              placeholder="proveedor@empresa.com"
              prepend-inner-icon="
                mdi-email-outline
              "
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
              v-model="
                formulario.direccion
              "
              label="Dirección"
              placeholder="Dirección del proveedor"
              prepend-inner-icon="
                mdi-map-marker-outline
              "
              variant="outlined"
              :disabled="saving"
              maxlength="200"
              counter="200"
              rows="2"
              hide-details="auto"
            />

          </v-col>

          <v-col cols="12">

            <v-switch
              v-model="
                formulario.activo
              "
              label="Proveedor activo"
              color="primary"
              inset
              :disabled="saving"
              hide-details
            />

          </v-col>

        </v-row>

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

  <v-card>

    <v-card-title class="confirm-title">

      <div class="confirm-icon">
        <v-icon
          icon="mdi-alert-outline"
        />
      </div>

      <div>
        <h2>
          Desactivar proveedor
        </h2>

        <p>
          Esta acción no elimina los registros
          históricos.
        </p>
      </div>

    </v-card-title>

    <v-card-text>

      <p class="confirm-text">

        ¿Deseas desactivar a
        <strong>
          {{ proveedorSeleccionado?.nombre }}
        </strong>?

      </p>

      <v-alert
        type="info"
        variant="tonal"
      >
        El proveedor dejará de estar disponible
        para nuevas operaciones, pero sus
        registros anteriores se conservarán.

      </v-alert>

    </v-card-text>

    <v-card-actions
      class="confirm-actions"
    >

      <v-btn
        variant="text"
        :disabled="saving"
        @click="cerrarEliminar"
      >
        Cancelar
      </v-btn>

      <v-btn
        color="error"
        :loading="saving"
        prepend-icon="mdi-close-circle-outline"
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
.proveedores-page {
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
  grid-template-columns: repeat(3, 1fr);
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

.success-icon {
  background: #eaf8ef;
  color: #2e7d32;
}

.danger-icon {
  background: #ffebeb;
  color: #d32f2f;
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
  grid-template-columns: 1.8fr 0.8fr;
  gap: 14px;
  padding: 18px 24px 20px;
}

.provider-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-name > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.provider-name strong {
  color: #172033;
}

.provider-name span {
  font-size: 12px;
  color: #8992a2;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: #eaf3ff;
  color: #1976d2;
  font-weight: 700;
  font-size: 15px;
}

.nit {
  font-family: monospace;
  font-size: 13px;
  color: #4c5669;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #526176;
  text-decoration: none;
}

.contact-link:hover {
  color: #1976d2;
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

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
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

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .proveedores-page {
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
