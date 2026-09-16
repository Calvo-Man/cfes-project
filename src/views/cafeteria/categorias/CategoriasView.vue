<template>
    <div class="categorias-page">
        <!-- HEADER -->
        <div class="page-header">
            <div>
                <div class="eyebrow">
                    <v-icon size="16">mdi-shape-outline</v-icon>
                    CAFETERÍA
                </div>

                <h1>Categorías</h1>

                <p>
                    Organiza los productos de la cafetería por categorías.
                </p>
            </div>

            <v-btn color="primary" size="large" prepend-icon="mdi-plus" elevation="0" @click="abrirCrear">
                Nueva categoría
            </v-btn>
        </div>

        <!-- RESUMEN -->
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-icon">
                    <v-icon>mdi-shape-outline</v-icon>
                </div>

                <div>
                    <span>Total categorías</span>
                    <strong>{{ categorias.length }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon active">
                    <v-icon>mdi-check-circle-outline</v-icon>
                </div>

                <div>
                    <span>Categorías activas</span>

                    <strong class="categorias-lista">
                        <span v-for="categoria in categoriasActivas" :key="categoria.id">
                            {{ categoria.nombre }}
                        </span>
                    </strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <v-icon>mdi-package-variant</v-icon>
                </div>

                <div>
                    <span>Productos asociados</span>
                    <strong>{{ totalProductos }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon warning">
                    <v-icon>mdi-eye-off-outline</v-icon>
                </div>

                <div>
                    <span>Inactivas</span>
                    <strong>{{ categoriasInactivas }}</strong>
                </div>
            </div>
        </div>

        <!-- FILTROS -->
        <v-card class="filters-card" elevation="0">
            <div class="filters-grid">
                <v-text-field v-model="busqueda" label="Buscar categoría" placeholder="Nombre..."
                    prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable />

                <v-select v-model="estadoFiltro" :items="estadosFiltro" item-title="title" item-value="value"
                    label="Estado" prepend-inner-icon="mdi-filter-variant" variant="outlined" density="comfortable"
                    hide-details />

                <v-btn variant="outlined" color="primary" size="large" prepend-icon="mdi-refresh" :loading="cargando"
                    @click="cargarCategorias">
                    Actualizar
                </v-btn>
            </div>
        </v-card>

        <!-- TABLA -->
        <v-card class="table-card" elevation="0">
            <div class="table-header">
                <div>
                    <h2>Listado de categorías</h2>

                    <span>
                        {{ categoriasFiltradas.length }}
                        categoría{{
                            categoriasFiltradas.length === 1 ? '' : 's'
                        }}
                    </span>
                </div>
            </div>

            <v-divider />

            <v-data-table :headers="headers" :items="categoriasFiltradas" :loading="cargando" item-value="id" hover
                class="categories-table" no-data-text="No hay categorías que coincidan con los filtros"
                loading-text="Cargando categorías...">
                <!-- NOMBRE -->
                <template #item.nombre="{ item }">
                    <div class="category-cell">
                        <div class="category-icon">
                            <v-icon size="22">
                                mdi-shape-outline
                            </v-icon>
                        </div>

                        <div>
                            <strong>{{ item.nombre }}</strong>

                            <span v-if="item.descripcion">
                                {{ item.descripcion }}
                            </span>

                            <small>
                                ID #{{ item.id }}
                            </small>
                        </div>
                    </div>
                </template>

                <!-- PRODUCTOS -->
                <template #item.productos="{ item }">
                    <v-chip size="small" variant="tonal" color="primary">
                        <v-icon start size="15">
                            mdi-package-variant
                        </v-icon>

                        {{ cantidadProductos(item) }}
                    </v-chip>
                </template>

                <!-- ESTADO -->
                <template #item.activo="{ item }">
                    <v-chip size="small" :color="item.activo ? 'success' : 'grey'" variant="tonal">
                        <v-icon start size="15">
                            {{
                                item.activo
                                    ? 'mdi-check-circle-outline'
                                    : 'mdi-close-circle-outline'
                            }}
                        </v-icon>

                        {{ item.activo ? 'Activa' : 'Inactiva' }}
                    </v-chip>
                </template>

                <!-- ACCIONES -->
                <template #item.acciones="{ item }">
                    <div class="actions">
                        <v-btn icon variant="text" size="small" color="primary" title="Editar"
                            @click="abrirEditar(item)">
                            <v-icon>
                                mdi-pencil-outline
                            </v-icon>
                        </v-btn>

                        <v-btn v-if="item.activo" icon variant="text" size="small" color="error" title="Desactivar"
                            @click="confirmarDesactivar(item)">
                            <v-icon>
                                mdi-eye-off-outline
                            </v-icon>
                        </v-btn>

                        <v-btn v-else icon variant="text" size="small" color="success" title="Activar"
                            @click="activarCategoria(item)">
                            <v-icon>
                                mdi-eye-outline
                            </v-icon>
                        </v-btn>
                    </div>
                </template>

                <template #bottom>
                    <div class="table-bottom">
                        Mostrando
                        {{ categoriasFiltradas.length }}
                        de
                        {{ categorias.length }}
                    </div>
                </template>
            </v-data-table>
        </v-card>

        <!-- DIALOG CREAR / EDITAR -->
        <v-dialog v-model="dialogCategoria" max-width="550" persistent>
            <v-card class="category-dialog">
                <v-card-title class="dialog-title">
                    <div>
                        <span class="dialog-eyebrow">
                            {{ modoEdicion ? 'EDITAR' : 'NUEVA' }}
                        </span>

                        <h2>
                            {{
                                modoEdicion
                                    ? 'Editar categoría'
                                    : 'Crear categoría'
                            }}
                        </h2>
                    </div>

                    <v-btn icon variant="text" @click="cerrarDialogo">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formCategoria" @submit.prevent="guardarCategoria">
                        <v-text-field v-model="form.nombre" label="Nombre" placeholder="Ej. Bebidas" variant="outlined"
                            density="comfortable" maxlength="100" counter :rules="[reglas.requerido]" required />

                        <v-textarea v-model="form.descripcion" label="Descripción"
                            placeholder="Descripción de la categoría..." variant="outlined" density="comfortable"
                            rows="4" maxlength="500" counter class="mt-3" />

                        <v-switch v-model="form.activo" color="success" label="Categoría activa" hide-details
                            class="mt-2" />
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="dialog-actions">
                    <v-btn variant="text" @click="cerrarDialogo">
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn color="primary" size="large" prepend-icon="mdi-content-save-outline" :loading="guardando"
                        @click="guardarCategoria">
                        {{
                            modoEdicion
                                ? 'Guardar cambios'
                                : 'Crear categoría'
                        }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- DIALOG DESACTIVAR -->
        <v-dialog v-model="dialogDesactivar" max-width="460">
            <v-card>
                <v-card-title>
                    Desactivar categoría
                </v-card-title>

                <v-card-text>
                    ¿Seguro que quieres desactivar
                    <strong>
                        {{ categoriaSeleccionada?.nombre }}
                    </strong>?

                    <div class="warning-box">
                        <v-icon size="20">
                            mdi-information-outline
                        </v-icon>

                        La categoría se conservará en el historial,
                        pero dejará de estar disponible para nuevos
                        productos.
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn variant="text" @click="dialogDesactivar = false">
                        Cancelar
                    </v-btn>

                    <v-btn color="error" variant="flat" :loading="desactivando" @click="desactivarCategoria">
                        Desactivar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- SNACKBAR -->
        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" location="bottom right" timeout="3500">
            {{ snackbar.text }}

            <template #actions>
                <v-btn variant="text" @click="snackbar.visible = false">
                    Cerrar
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '@/plugins/axios'

const categorias = ref([])

const cargando = ref(false)
const guardando = ref(false)
const desactivando = ref(false)

const busqueda = ref('')
const estadoFiltro = ref('ACTIVAS')

const dialogCategoria = ref(false)
const dialogDesactivar = ref(false)

const modoEdicion = ref(false)
const categoriaSeleccionada = ref(null)

const formCategoria = ref(null)

const form = reactive({
    nombre: '',
    descripcion: '',
    activo: true,
})

const snackbar = reactive({
    visible: false,
    text: '',
    color: 'success',
})

const estadosFiltro = [
    {
        title: 'Activas',
        value: 'ACTIVAS',
    },
    {
        title: 'Inactivas',
        value: 'INACTIVAS',
    },
    {
        title: 'Todas',
        value: 'TODAS',
    },
]

const headers = [
    {
        title: 'Categoría',
        key: 'nombre',
        sortable: true,
        minWidth: '320px',
    },
    {
        title: 'Productos',
        key: 'productos',
        sortable: false,
        align: 'center',
    },
    {
        title: 'Estado',
        key: 'activo',
        sortable: false,
    },
    {
        title: '',
        key: 'acciones',
        sortable: false,
        align: 'end',
    },
]

const reglas = {
    requerido: (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return 'Este campo es obligatorio'
        }

        return true
    },
}

const categoriasActivas = computed(() => {
    return categorias.value.filter(categoria => categoria.activo)
})

const nombresCategoriasActivas = computed(() => {
    return categoriasActivas.value.map(categoria => categoria.nombre)
})

const categoriasInactivas = computed(() => {
    return categorias.value.filter(
        (categoria) => !categoria.activo,
    ).length
})

const totalProductos = computed(() => {
    return categorias.value.reduce(
        (total, categoria) =>
            total + cantidadProductos(categoria),
        0,
    )
})

const categoriasFiltradas = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()

    return categorias.value.filter((categoria) => {
        const coincideBusqueda =
            !texto ||
            categoria.nombre?.toLowerCase().includes(texto) ||
            categoria.descripcion
                ?.toLowerCase()
                .includes(texto)

        let coincideEstado = true

        if (estadoFiltro.value === 'ACTIVAS') {
            coincideEstado = categoria.activo === true
        }

        if (estadoFiltro.value === 'INACTIVAS') {
            coincideEstado = categoria.activo === false
        }

        return coincideBusqueda && coincideEstado
    })
})

function cantidadProductos(categoria) {
    if (Array.isArray(categoria.productos)) {
        return categoria.productos.length
    }

    return 0
}

function mostrarMensaje(text, color = 'success') {
    snackbar.text = text
    snackbar.color = color
    snackbar.visible = true
}

function manejarError(error, mensajePorDefecto) {
    const mensaje =
        error?.response?.data?.message ||
        mensajePorDefecto

    const texto = Array.isArray(mensaje)
        ? mensaje.join(', ')
        : mensaje

    mostrarMensaje(texto, 'error')
}

async function cargarCategorias() {
    cargando.value = true

    try {
        const { data } = await api.get(
            '/categoria-producto',
        )

        categorias.value = Array.isArray(data)
            ? data
            : []
    } catch (error) {
        manejarError(
            error,
            'No se pudieron cargar las categorías.',
        )
    } finally {
        cargando.value = false
    }
}

function resetFormulario() {
    form.nombre = ''
    form.descripcion = ''
    form.activo = true
}

function abrirCrear() {
    modoEdicion.value = false
    categoriaSeleccionada.value = null

    resetFormulario()

    dialogCategoria.value = true
}

function abrirEditar(categoria) {
    modoEdicion.value = true
    categoriaSeleccionada.value = categoria

    form.nombre = categoria.nombre || ''
    form.descripcion = categoria.descripcion || ''
    form.activo = categoria.activo ?? true

    dialogCategoria.value = true
}

function cerrarDialogo() {
    if (guardando.value) return

    dialogCategoria.value = false
    categoriaSeleccionada.value = null

    resetFormulario()
}

async function guardarCategoria() {
    const resultado =
        await formCategoria.value?.validate()

    if (resultado && !resultado.valid) {
        mostrarMensaje(
            'Revisa los campos obligatorios.',
            'error',
        )

        return
    }

    guardando.value = true

    try {
        if (modoEdicion.value) {
            await api.patch(
                `/categoria-producto/${categoriaSeleccionada.value.id}`,
                {
                    nombre: form.nombre.trim(),
                    descripcion:
                        form.descripcion?.trim() || undefined,
                    activo: form.activo,
                },
            )

            mostrarMensaje(
                'Categoría actualizada correctamente.',
            )
        } else {
            await api.post('/categoria-producto', {
                nombre: form.nombre.trim(),
                descripcion:
                    form.descripcion?.trim() || undefined,
                activo: form.activo,
            })

            mostrarMensaje(
                'Categoría creada correctamente.',
            )
        }

        dialogCategoria.value = false

        resetFormulario()

        categoriaSeleccionada.value = null

        await cargarCategorias()
    } catch (error) {
        manejarError(
            error,
            modoEdicion.value
                ? 'No se pudo actualizar la categoría.'
                : 'No se pudo crear la categoría.',
        )
    } finally {
        guardando.value = false
    }
}

function confirmarDesactivar(categoria) {
    categoriaSeleccionada.value = categoria
    dialogDesactivar.value = true
}

async function desactivarCategoria() {
    if (!categoriaSeleccionada.value) return

    desactivando.value = true

    try {
        await api.delete(
            `/categoria-producto/${categoriaSeleccionada.value.id}`,
        )

        mostrarMensaje(
            'Categoría desactivada correctamente.',
        )

        dialogDesactivar.value = false

        await cargarCategorias()
    } catch (error) {
        manejarError(
            error,
            'No se pudo desactivar la categoría.',
        )
    } finally {
        desactivando.value = false
    }
}

async function activarCategoria(categoria) {
    try {
        await api.patch(
            `/categoria-producto/${categoria.id}`,
            {
                activo: true,
            },
        )

        mostrarMensaje(
            'Categoría activada correctamente.',
        )

        await cargarCategorias()
    } catch (error) {
        manejarError(
            error,
            'No se pudo activar la categoría.',
        )
    }
}

onMounted(() => {
    cargarCategorias()
})
</script>

<style scoped>
.categorias-page {
    padding: 28px;
    max-width: 1500px;
    margin: 0 auto;
}

/* HEADER */

.page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
}

.eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;
    color: #1976d2;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1.2px;
    margin-bottom: 6px;
}

.page-header h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 700;
    color: #172033;
}

.page-header p {
    margin: 7px 0 0;
    color: #6b7280;
    font-size: 14px;
}

/* SUMMARY */

.summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
}

.summary-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: white;
    border: 1px solid #e7ebf1;
    border-radius: 14px;
    padding: 18px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow:
        0 8px 25px rgba(15, 23, 42, 0.07);
}

.summary-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eaf3ff;
    color: #1976d2;
}

.summary-icon.active {
    background: #eaf8f0;
    color: #18864b;
}

.summary-icon.warning {
    background: #fff6df;
    color: #b77900;
}

.summary-card span {
    display: block;
    color: #6b7280;
    font-size: 12px;
    margin-bottom: 3px;
}

.summary-card strong {
    font-size: 21px;
    color: #172033;
}

/* FILTERS */

.filters-card {
    padding: 18px;
    border: 1px solid #e7ebf1;
    border-radius: 14px;
    margin-bottom: 20px;
}

.filters-grid {
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    gap: 12px;
    align-items: center;
}

/* TABLE */

.table-card {
    border: 1px solid #e7ebf1;
    border-radius: 14px;
    overflow: hidden;
    background: white;
}

.table-header {
    padding: 20px 22px;
}

.table-header h2 {
    margin: 0 0 3px;
    font-size: 17px;
    color: #172033;
}

.table-header span {
    color: #7a8391;
    font-size: 13px;
}

.category-cell {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 5px 0;
}

.category-icon {
    width: 46px;
    height: 46px;
    min-width: 46px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #eaf3ff;
    color: #1976d2;
}

.category-cell strong {
    display: block;
    color: #172033;
    font-size: 14px;
    font-weight: 650;
}

.category-cell span {
    display: block;
    color: #6b7280;
    font-size: 12px;
    max-width: 420px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}

.category-cell small {
    display: block;
    color: #9aa2ad;
    font-size: 10px;
    margin-top: 2px;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 2px;
}

.table-bottom {
    padding: 14px 20px;
    color: #7a8391;
    font-size: 12px;
    border-top: 1px solid #edf0f4;
}

/* DIALOG */

.category-dialog {
    border-radius: 16px !important;
}

.dialog-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 22px;
}

.dialog-eyebrow {
    display: block;
    color: #1976d2;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.1px;
    margin-bottom: 3px;
}

.dialog-title h2 {
    margin: 0;
    font-size: 20px;
    color: #172033;
}

.dialog-actions {
    padding: 16px 22px;
}

.warning-box {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #fff8e7;
    color: #805d12;
    font-size: 13px;
    line-height: 1.45;
}

.categorias-lista {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .filters-grid {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 700px) {
    .categorias-page {
        padding: 16px;
    }

    .page-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .page-header .v-btn {
        width: 100%;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }

    .filters-grid {
        grid-template-columns: 1fr;
    }
}
</style>
