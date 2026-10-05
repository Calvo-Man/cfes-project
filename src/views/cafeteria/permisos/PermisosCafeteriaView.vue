```vue
<template>
  <div class="permisos-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <div class="page-header">

      <div>
        <div class="page-title">
          <span class="material-icons">
            admin_panel_settings
          </span>

          <div>
            <h1>Permisos de cafetería</h1>

            <p>
              Administra el acceso de los miembros
              a los módulos de la cafetería.
            </p>
          </div>
        </div>
      </div>

    </div>


    <!-- =====================================================
         CONTENIDO
    ====================================================== -->

    <div class="content-grid">

      <!-- =================================================
           MIEMBRO
      ================================================== -->

      <section class="card member-card">

        <div class="card-header">

          <div class="header-icon">
            <span class="material-icons">
              person
            </span>
          </div>

          <div>
            <h2>Miembro</h2>

            <p>
              Selecciona el usuario al que deseas
              administrar los permisos.
            </p>
          </div>

        </div>


        <div class="member-select">

          <label>
            Miembro
          </label>

          <select
            v-model="miembroSeleccionado"
            :disabled="cargandoMiembros"
          >

            <option
              :value="null"
              disabled
            >
              {{
                cargandoMiembros
                  ? 'Cargando miembros...'
                  : 'Selecciona un miembro'
              }}
            </option>

            <option
              v-for="miembro in miembros"
              :key="miembro.id"
              :value="miembro.id"
            >
              {{ nombreMiembro(miembro) }}
            </option>

          </select>

        </div>


        <!-- Información del miembro -->

        <div
          v-if="miembroActual"
          class="member-info"
        >

          <div class="avatar">
            {{ inicialesMiembro(miembroActual) }}
          </div>

          <div class="member-data">

            <strong>
              {{ nombreMiembro(miembroActual) }}
            </strong>

            <span>
              {{ miembroActual.user || 'Sin usuario' }}
            </span>

          </div>

        </div>

      </section>


      <!-- =================================================
           PERMISOS
      ================================================== -->

      <section class="card permissions-card">

        <div class="card-header">

          <div class="header-icon">
            <span class="material-icons">
              lock_open
            </span>
          </div>

          <div class="permissions-heading">

            <div>
              <h2>Permisos</h2>

              <p>
                Define qué módulos puede utilizar este miembro.
              </p>
            </div>

            <div
              v-if="miembroSeleccionado"
              class="permission-count"
            >
              {{ permisosSeleccionados.length }}
              /
              {{ permisos.length }}
            </div>

          </div>

        </div>


        <!-- =================================================
             SIN MIEMBRO
        ================================================== -->

        <div
          v-if="!miembroSeleccionado"
          class="empty-state"
        >

          <span class="material-icons">
            person_search
          </span>

          <h3>
            Selecciona un miembro
          </h3>

          <p>
            Los permisos disponibles aparecerán
            después de seleccionar un miembro.
          </p>

        </div>


        <!-- =================================================
             CARGANDO PERMISOS
        ================================================== -->

        <div
          v-else-if="cargandoPermisos"
          class="loading-state"
        >

          <span class="material-icons spinning">
            sync
          </span>

          <span>
            Cargando permisos...
          </span>

        </div>


        <!-- =================================================
             PERMISOS
        ================================================== -->

        <template
          v-else
        >

          <div class="permission-actions">

            <button
              type="button"
              class="secondary-button"
              :disabled="guardando || permisos.length === 0"
              @click="seleccionarTodos"
            >
              <span class="material-icons">
                select_all
              </span>

              Seleccionar todos
            </button>


            <button
              type="button"
              class="secondary-button"
              :disabled="guardando || permisosSeleccionados.length === 0"
              @click="deseleccionarTodos"
            >
              <span class="material-icons">
                deselect
              </span>

              Quitar todos
            </button>

          </div>


          <div class="permissions-list">

            <div
              v-for="permiso in permisos"
              :key="permiso.id"
              class="permission-item"
              :class="{
                active:
                  tienePermiso(permiso.id),
              }"
              @click="togglePermiso(permiso)"
            >

              <div class="permission-checkbox">

                <span
                  v-if="tienePermiso(permiso.id)"
                  class="material-icons"
                >
                  check
                </span>

              </div>


              <div class="permission-content">

                <div class="permission-name">
                  {{ permiso.nombre }}
                </div>

                <div class="permission-code">
                  {{ permiso.codigo }}
                </div>

                <div
                  v-if="permiso.descripcion"
                  class="permission-description"
                >
                  {{ permiso.descripcion }}
                </div>

              </div>

            </div>

          </div>


          <!-- =================================================
               GUARDAR
          ================================================== -->

          <div class="save-section">

            <div class="save-info">

              <span class="material-icons">
                info
              </span>

              <span>
                Los cambios se aplican inmediatamente
                al usuario.
              </span>

            </div>


            <button
              type="button"
              class="save-button"
              :disabled="guardando || !hayCambios"
              @click="guardarPermisos"
            >

              <span
                v-if="guardando"
                class="material-icons spinning"
              >
                sync
              </span>

              <span
                v-else
                class="material-icons"
              >
                save
              </span>

              {{
                guardando
                  ? 'Guardando...'
                  : 'Guardar permisos'
              }}

            </button>

          </div>

        </template>

      </section>

    </div>


    <!-- =====================================================
         MENSAJE
    ====================================================== -->

    <transition name="notification">

      <div
        v-if="mensaje.texto"
        class="notification"
        :class="mensaje.tipo"
      >

        <span class="material-icons">
          {{
            mensaje.tipo === 'success'
              ? 'check_circle'
              : 'error'
          }}
        </span>

        {{ mensaje.texto }}

      </div>

    </transition>

  </div>
</template>


<script setup>

import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import api from '@/plugins/axios'


/*
|--------------------------------------------------------------------------
| Estado
|--------------------------------------------------------------------------
*/

const miembros = ref([])

const permisos = ref([])

const miembroSeleccionado = ref(null)

const permisosSeleccionados = ref([])

const permisosOriginales = ref([])

const cargandoMiembros = ref(false)

const cargandoPermisos = ref(false)

const guardando = ref(false)

const mensaje = ref({
  texto: '',
  tipo: '',
})


/*
|--------------------------------------------------------------------------
| Miembro actual
|--------------------------------------------------------------------------
*/

const miembroActual = computed(() => {

  if (!miembroSeleccionado.value) {
    return null
  }

  return miembros.value.find(
    (miembro) =>
      miembro.id === miembroSeleccionado.value,
  ) || null
})


/*
|--------------------------------------------------------------------------
| Nombre del miembro
|--------------------------------------------------------------------------
*/

const nombreMiembro = (miembro) => {

  if (!miembro) {
    return 'Sin nombre'
  }

  const nombreCompleto = [
    miembro.name,
    miembro.apellido,
  ]
    .filter(Boolean)
    .join(' ')

  if (nombreCompleto) {
    return nombreCompleto
  }

  return (
    miembro.nombreCompleto ||
    miembro.name ||
    miembro.user ||
    `Miembro #${miembro.id}`
  )
}


/*
|--------------------------------------------------------------------------
| Iniciales
|--------------------------------------------------------------------------
*/

const inicialesMiembro = (miembro) => {

  const nombre = nombreMiembro(miembro)

  const partes = nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (partes.length === 1) {
    return partes[0]
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    partes[0][0] +
    partes[partes.length - 1][0]
  ).toUpperCase()
}


/*
|--------------------------------------------------------------------------
| Mensajes
|--------------------------------------------------------------------------
*/

const mostrarMensaje = (
  texto,
  tipo = 'success',
) => {

  mensaje.value = {
    texto,
    tipo,
  }

  setTimeout(() => {
    mensaje.value = {
      texto: '',
      tipo: '',
    }
  }, 3500)
}


/*
|--------------------------------------------------------------------------
| Cargar miembros
|--------------------------------------------------------------------------
*/

const cargarMiembros = async () => {

  cargandoMiembros.value = true

  try {

    const response =
      await api.get('/miembros')

    /*
     * Soportamos respuestas directas
     * y respuestas dentro de data.
     */

    const data =
      response.data?.data ??
      response.data

    miembros.value =
      Array.isArray(data)
        ? data
        : data?.miembros || []

  } catch (error) {

    console.error(
      'Error cargando miembros:',
      error,
    )

    mostrarMensaje(
      'No se pudieron cargar los miembros.',
      'error',
    )

  } finally {

    cargandoMiembros.value = false
  }
}


/*
|--------------------------------------------------------------------------
| Cargar permisos disponibles
|--------------------------------------------------------------------------
*/

const cargarPermisos = async () => {

  try {

    const response =
      await api.get('/permisos')

    const data =
      response.data?.data ??
      response.data

    permisos.value =
      Array.isArray(data)
        ? data
        : data?.permisos || []

  } catch (error) {

    console.error(
      'Error cargando permisos:',
      error,
    )

    mostrarMensaje(
      'No se pudieron cargar los permisos de cafetería.',
      'error',
    )
  }
}


/*
|--------------------------------------------------------------------------
| Cargar permisos del miembro
|--------------------------------------------------------------------------
*/

const cargarPermisosMiembro = async (
  miembroId,
) => {

  if (!miembroId) {
    permisosSeleccionados.value = []
    permisosOriginales.value = []
    return
  }

  cargandoPermisos.value = true

  try {

    const response =
      await api.get(
        `/permisos/miembro/${miembroId}`,
      )

    const data =
      response.data?.data ??
      response.data

    /*
     * El servicio puede devolver:
     *
     * [
     *   { id, codigo, nombre }
     * ]
     *
     * o relaciones como:
     *
     * [
     *   { permiso: { id, codigo, nombre } }
     * ]
     */

    const permisosMiembro =
      Array.isArray(data)
        ? data
        : data?.permisos || []

    const ids =
      permisosMiembro
        .map((item) => {

          if (item?.permiso?.id) {
            return item.permiso.id
          }

          return item?.id

        })
        .filter(Boolean)

    permisosSeleccionados.value = [...ids]

    permisosOriginales.value = [...ids]

  } catch (error) {

    console.error(
      'Error cargando permisos del miembro:',
      error,
    )

    permisosSeleccionados.value = []
    permisosOriginales.value = []

    mostrarMensaje(
      'No se pudieron cargar los permisos del miembro.',
      'error',
    )

  } finally {

    cargandoPermisos.value = false
  }
}


/*
|--------------------------------------------------------------------------
| Cuando cambia el miembro
|--------------------------------------------------------------------------
*/

watch(
  miembroSeleccionado,
  async (nuevoMiembro) => {

    await cargarPermisosMiembro(
      nuevoMiembro,
    )
  },
)


/*
|--------------------------------------------------------------------------
| Comprobar permiso
|--------------------------------------------------------------------------
*/

const tienePermiso = (permisoId) => {

  return permisosSeleccionados.value.includes(
    permisoId,
  )
}


/*
|--------------------------------------------------------------------------
| Cambiar permiso
|--------------------------------------------------------------------------
*/

const togglePermiso = (permiso) => {

  if (guardando.value) {
    return
  }

  const index =
    permisosSeleccionados.value.indexOf(
      permiso.id,
    )

  if (index === -1) {

    permisosSeleccionados.value.push(
      permiso.id,
    )

  } else {

    permisosSeleccionados.value.splice(
      index,
      1,
    )
  }
}


/*
|--------------------------------------------------------------------------
| Seleccionar todos
|--------------------------------------------------------------------------
*/

const seleccionarTodos = () => {

  permisosSeleccionados.value =
    permisos.value.map(
      (permiso) => permiso.id,
    )
}


/*
|--------------------------------------------------------------------------
| Quitar todos
|--------------------------------------------------------------------------
*/

const deseleccionarTodos = () => {

  permisosSeleccionados.value = []
}


/*
|--------------------------------------------------------------------------
| Detectar cambios
|--------------------------------------------------------------------------
*/

const hayCambios = computed(() => {

  const actuales =
    [...permisosSeleccionados.value]
      .sort((a, b) => a - b)

  const originales =
    [...permisosOriginales.value]
      .sort((a, b) => a - b)

  return (
    JSON.stringify(actuales) !==
    JSON.stringify(originales)
  )
})


/*
|--------------------------------------------------------------------------
| Guardar permisos
|--------------------------------------------------------------------------
*/

const guardarPermisos = async () => {

  if (
    !miembroSeleccionado.value ||
    guardando.value
  ) {
    return
  }

  guardando.value = true

  try {

    const originales =
      new Set(
        permisosOriginales.value,
      )

    const actuales =
      new Set(
        permisosSeleccionados.value,
      )


    /*
     * Permisos que debemos agregar.
     */

    const agregar = permisos.value
      .filter(
        (permiso) =>
          actuales.has(permiso.id) &&
          !originales.has(permiso.id),
      )


    /*
     * Permisos que debemos eliminar.
     */

    const eliminar = permisos.value
      .filter(
        (permiso) =>
          !actuales.has(permiso.id) &&
          originales.has(permiso.id),
      )


    /*
     * Asignar nuevos permisos.
     */

    for (const permiso of agregar) {

      await api.post(
        `/permisos/miembro/${miembroSeleccionado.value}/${permiso.id}`,
      )
    }


    /*
     * Quitar permisos eliminados.
     */

    for (const permiso of eliminar) {

      await api.delete(
        `/permisos/miembro/${miembroSeleccionado.value}/${permiso.id}`,
      )
    }


    /*
     * Actualizamos el estado original.
     */

    permisosOriginales.value =
      [...permisosSeleccionados.value]


    mostrarMensaje(
      'Permisos actualizados correctamente.',
      'success',
    )

  } catch (error) {

    console.error(
      'Error guardando permisos:',
      error,
    )

    mostrarMensaje(
      error.response?.data?.message ||
        'No se pudieron actualizar los permisos.',
      'error',
    )

  } finally {

    guardando.value = false
  }
}


/*
|--------------------------------------------------------------------------
| Inicialización
|--------------------------------------------------------------------------
*/

onMounted(async () => {

  await Promise.all([
    cargarMiembros(),
    cargarPermisos(),
  ])
})

</script>


<style scoped lang="scss">

.permisos-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}


/* =========================================================
   HEADER
========================================================= */

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-title > .material-icons {
  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  background: rgba(11, 71, 117, 0.10);

  color: #0b4775;

  font-size: 27px;
}

.page-title h1 {
  margin: 0;

  color: #172033;

  font-size: 24px;
  font-weight: 700;
}

.page-title p {
  margin: 4px 0 0;

  color: #718096;

  font-size: 13px;
}


/* =========================================================
   GRID
========================================================= */

.content-grid {
  display: grid;

  grid-template-columns:
    minmax(280px, 350px)
    minmax(0, 1fr);

  gap: 20px;

  align-items: start;
}


/* =========================================================
   CARD
========================================================= */

.card {
  background: white;

  border: 1px solid #e8edf3;

  border-radius: 16px;

  box-shadow:
    0 4px 18px rgba(15, 23, 42, 0.05);

  overflow: hidden;
}

.card-header {
  display: flex;

  gap: 12px;

  padding: 20px;

  border-bottom: 1px solid #edf1f5;
}

.header-icon {
  width: 40px;
  height: 40px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 11px;

  background: #f1f6fa;

  color: #0b4775;
}

.header-icon .material-icons {
  font-size: 21px;
}

.card-header h2 {
  margin: 0;

  color: #172033;

  font-size: 16px;
  font-weight: 700;
}

.card-header p {
  margin: 4px 0 0;

  color: #7b8797;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================================================
   MEMBER SELECT
========================================================= */

.member-select {
  padding: 20px;
}

.member-select label {
  display: block;

  margin-bottom: 7px;

  color: #4a5568;

  font-size: 12px;
  font-weight: 600;
}

.member-select select {
  width: 100%;

  height: 44px;

  padding: 0 12px;

  border: 1px solid #dce3eb;

  border-radius: 9px;

  outline: none;

  background: white;

  color: #273449;

  font-family: inherit;

  font-size: 13px;

  cursor: pointer;

  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.member-select select:focus {
  border-color: #0b4775;

  box-shadow:
    0 0 0 3px rgba(11, 71, 117, 0.08);
}

.member-select select:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* =========================================================
   MEMBER INFO
========================================================= */

.member-info {
  display: flex;

  align-items: center;

  gap: 12px;

  margin: 0 20px 20px;

  padding: 13px;

  background: #f7f9fb;

  border: 1px solid #edf1f5;

  border-radius: 11px;
}

.avatar {
  width: 40px;
  height: 40px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #0b4775;

  color: white;

  font-size: 12px;
  font-weight: 700;
}

.member-data {
  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 2px;
}

.member-data strong {
  overflow: hidden;

  color: #273449;

  font-size: 13px;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.member-data span {
  color: #8994a3;

  font-size: 11px;
}


/* =========================================================
   PERMISSIONS HEADER
========================================================= */

.permissions-heading {
  width: 100%;

  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;
}

.permission-count {
  flex-shrink: 0;

  padding: 5px 9px;

  border-radius: 20px;

  background: #eef5f9;

  color: #0b4775;

  font-size: 11px;
  font-weight: 700;
}


/* =========================================================
   ACTIONS
========================================================= */

.permission-actions {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 16px 20px;

  border-bottom: 1px solid #edf1f5;
}

.secondary-button,
.save-button {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 7px;

  min-height: 38px;

  padding: 0 13px;

  border-radius: 8px;

  font-family: inherit;

  font-size: 12px;
  font-weight: 600;

  cursor: pointer;

  transition:
    background .2s ease,
    border-color .2s ease,
    opacity .2s ease,
    transform .15s ease;
}

.secondary-button {
  border: 1px solid #dce3eb;

  background: white;

  color: #526173;
}

.secondary-button:hover:not(:disabled) {
  background: #f7f9fb;

  border-color: #c9d3df;
}

.secondary-button:disabled,
.save-button:disabled {
  opacity: .45;

  cursor: not-allowed;
}

.secondary-button .material-icons,
.save-button .material-icons {
  font-size: 17px;
}


/* =========================================================
   PERMISSION LIST
========================================================= */

.permissions-list {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 10px;

  padding: 20px;
}

.permission-item {
  display: flex;

  align-items: flex-start;

  gap: 11px;

  padding: 13px;

  border: 1px solid #e5eaf0;

  border-radius: 11px;

  cursor: pointer;

  transition:
    border-color .2s ease,
    background .2s ease,
    box-shadow .2s ease;
}

.permission-item:hover {
  border-color: #c9d7e4;

  background: #fafcfd;
}

.permission-item.active {
  border-color: #8eb2ca;

  background: #f3f8fb;

  box-shadow:
    0 2px 7px rgba(11, 71, 117, 0.05);
}

.permission-checkbox {
  width: 20px;
  height: 20px;

  flex-shrink: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  margin-top: 1px;

  border: 1.5px solid #cbd5e1;

  border-radius: 5px;

  background: white;

  color: white;

  transition:
    background .2s ease,
    border-color .2s ease;
}

.permission-item.active
.permission-checkbox {
  background: #0b4775;

  border-color: #0b4775;
}

.permission-checkbox .material-icons {
  font-size: 15px;
}

.permission-content {
  min-width: 0;
}

.permission-name {
  color: #273449;

  font-size: 13px;
  font-weight: 650;
}

.permission-code {
  margin-top: 2px;

  color: #8994a3;

  font-family: monospace;

  font-size: 10px;
}

.permission-description {
  margin-top: 5px;

  color: #7b8797;

  font-size: 11px;

  line-height: 1.4;
}


/* =========================================================
   SAVE
========================================================= */

.save-section {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding: 16px 20px;

  border-top: 1px solid #edf1f5;

  background: #fbfcfd;
}

.save-info {
  display: flex;

  align-items: center;

  gap: 7px;

  color: #8994a3;

  font-size: 11px;
}

.save-info .material-icons {
  font-size: 16px;
}

.save-button {
  min-height: 40px;

  padding: 0 17px;

  border: 0;

  background: #0b4775;

  color: white;
}

.save-button:hover:not(:disabled) {
  background: #08385f;

  transform: translateY(-1px);
}


/* =========================================================
   EMPTY
========================================================= */

.empty-state {
  min-height: 300px;

  display: flex;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-state .material-icons {
  margin-bottom: 12px;

  color: #b8c3cf;

  font-size: 42px;
}

.empty-state h3 {
  margin: 0;

  color: #4a5568;

  font-size: 15px;
}

.empty-state p {
  max-width: 320px;

  margin: 7px 0 0;

  color: #929dab;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================================================
   LOADING
========================================================= */

.loading-state {
  min-height: 300px;

  display: flex;

  align-items: center;
  justify-content: center;

  gap: 10px;

  color: #7b8797;

  font-size: 13px;
}

.spinning {
  animation: spin .9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================================================
   NOTIFICATION
========================================================= */

.notification {
  position: fixed;

  right: 25px;
  bottom: 25px;

  z-index: 3000;

  display: flex;

  align-items: center;

  gap: 9px;

  max-width: 380px;

  padding: 13px 16px;

  border-radius: 10px;

  box-shadow:
    0 8px 30px rgba(15, 23, 42, 0.15);

  font-size: 12px;
  font-weight: 600;
}

.notification.success {
  background: #edf8f1;

  border: 1px solid #c9ead5;

  color: #237447;
}

.notification.error {
  background: #fff1f1;

  border: 1px solid #f0cccc;

  color: #a43838;
}

.notification .material-icons {
  font-size: 19px;
}


/* =========================================================
   TRANSITION
========================================================= */

.notification-enter-active,
.notification-leave-active {
  transition:
    opacity .25s ease,
    transform .25s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;

  transform: translateY(10px);
}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 900px) {

  .content-grid {
    grid-template-columns: 1fr;
  }

  .permissions-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {

  .permisos-page {
    padding: 15px;
  }

  .page-title h1 {
    font-size: 20px;
  }

  .permission-actions {
    flex-direction: column;

    align-items: stretch;
  }

  .secondary-button {
    width: 100%;
  }

  .save-section {
    flex-direction: column;

    align-items: stretch;
  }

  .save-info {
    justify-content: center;

    text-align: center;
  }

  .save-button {
    width: 100%;
  }
}

</style>
```
