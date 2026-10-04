<template>
    <div class="productos-page">

        <!-- HEADER -->
        <header class="page-header">
            <div class="header-content">
                <div class="eyebrow">
                    <span class="eyebrow-icon">
                        <v-icon size="15">mdi-package-variant-closed</v-icon>
                    </span>
                    CAFETERÍA
                </div>

                <h1>Productos</h1>

                <p>
                    Administra productos, precios, categorías e inventario desde un
                    solo lugar.
                </p>
            </div>

            <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-plus"
                elevation="0"
                class="new-product-btn"
                @click="abrirCrear"
            >
                Nuevo producto
            </v-btn>
        </header>

        <!-- RESUMEN -->
        <section class="summary-grid">

            <div class="summary-card">
                <div class="summary-icon">
                    <v-icon size="21">mdi-package-variant</v-icon>
                </div>

                <div class="summary-content">
                    <span>Total productos</span>
                    <strong>{{ productos.length }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon active">
                    <v-icon size="21">mdi-check-circle-outline</v-icon>
                </div>

                <div class="summary-content">
                    <span>Productos activos</span>
                    <strong>{{ productosActivos }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon warning">
                    <v-icon size="21">mdi-alert-circle-outline</v-icon>
                </div>

                <div class="summary-content">
                    <span>Stock bajo</span>
                    <strong>{{ productosStockBajo }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon category">
                    <v-icon size="21">mdi-shape-outline</v-icon>
                </div>

                <div class="summary-content">
                    <span>Categorías</span>
                    <strong>{{ categorias.length }}</strong>
                </div>
            </div>

        </section>

        <!-- FILTROS -->
        <v-card
            class="filters-card"
            elevation="0"
        >
            <div class="filters-header">
                <div class="filters-title">
                    <div class="filters-title-icon">
                        <v-icon size="18">mdi-filter-variant</v-icon>
                    </div>

                    <div>
                        <strong>Filtros</strong>
                        <span>Encuentra rápidamente un producto</span>
                    </div>
                </div>
            </div>

            <div class="filters-grid">

                <v-text-field
                    v-model="busqueda"
                    label="Buscar producto"
                    placeholder="Nombre o descripción..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                />

                <v-select
                    v-model="categoriaFiltro"
                    :items="categorias"
                    item-title="nombre"
                    item-value="id"
                    label="Categoría"
                    prepend-inner-icon="mdi-shape-outline"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                />

                <v-select
                    v-model="estadoFiltro"
                    :items="estadosFiltro"
                    item-title="title"
                    item-value="value"
                    label="Estado"
                    prepend-inner-icon="mdi-list-status"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                />

                <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    prepend-icon="mdi-refresh"
                    :loading="cargando"
                    class="refresh-btn"
                    @click="cargarDatos"
                >
                    Actualizar
                </v-btn>

            </div>
        </v-card>

        <!-- TABLA -->
        <v-card
            class="table-card"
            elevation="0"
        >

            <div class="table-header">

                <div class="table-title">
                    <div class="table-title-icon">
                        <v-icon size="19">mdi-format-list-bulleted</v-icon>
                    </div>

                    <div>
                        <h2>Listado de productos</h2>

                        <span>
                            {{ productosFiltrados.length }}
                            producto{{ productosFiltrados.length === 1 ? '' : 's' }}
                            encontrado{{ productosFiltrados.length === 1 ? '' : 's' }}
                        </span>
                    </div>
                </div>

                <v-chip
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="result-chip"
                >
                    {{ productosFiltrados.length }}
                </v-chip>

            </div>

            <v-divider />

            <v-data-table
                :headers="headers"
                :items="productosFiltrados"
                :loading="cargando"
                item-value="id"
                hover
                class="products-table"
                no-data-text="No hay productos que coincidan con los filtros"
                loading-text="Cargando productos..."
            >

                <!-- PRODUCTO -->
                <template #item.producto="{ item }">
                    <div class="product-cell">

                        <div class="product-image">
                            <v-img
                                v-if="item.imagen"
                                :src="item.imagen"
                                cover
                                height="52"
                                width="52"
                            />

                            <v-icon
                                v-else
                                size="24"
                            >
                                mdi-food-variant
                            </v-icon>
                        </div>

                        <div class="product-info">
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

                <!-- CATEGORIA -->
                <template #item.categoria="{ item }">
                    <v-chip
                        size="small"
                        variant="tonal"
                        color="primary"
                        class="category-chip"
                    >
                        <v-icon
                            start
                            size="14"
                        >
                            mdi-shape-outline
                        </v-icon>

                        {{ item.categoria?.nombre || 'Sin categoría' }}
                    </v-chip>
                </template>

                <!-- PRECIO COMPRA -->
                <template #item.precioCompra="{ item }">
                    <span class="money purchase-price">
                        {{ formatoMoneda(item.precioCompra) }}
                    </span>
                </template>

                <!-- PRECIO VENTA -->
                <template #item.precioVenta="{ item }">
                    <span class="money sale-price">
                        {{ formatoMoneda(item.precioVenta) }}
                    </span>
                </template>

                <!-- STOCK -->
                <template #item.stock="{ item }">
                    <div class="stock-cell">

                        <div class="stock-main">
                            <v-icon
                                v-if="
                                    item.controlaInventario &&
                                    Number(item.stockActual) <= Number(item.stockMinimo)
                                "
                                size="15"
                                class="stock-warning-icon"
                            >
                                mdi-alert-circle-outline
                            </v-icon>

                            <strong
                                :class="{
                                    'stock-low':
                                        item.controlaInventario &&
                                        Number(item.stockActual) <= Number(item.stockMinimo),
                                }"
                            >
                                {{
                                    item.controlaInventario
                                        ? formatoStock(item.stockActual, item.unidad)
                                        : '∞'
                                }}
                            </strong>
                        </div>

                        <span v-if="item.controlaInventario">
                            mín. {{ formatoStock(item.stockMinimo, item.unidad) }}
                        </span>

                        <span v-else class="no-control">
                            Sin control
                        </span>

                    </div>
                </template>

                <!-- UNIDAD -->
                <template #item.unidad="{ item }">
                    <span class="unit-text">
                        {{ nombreUnidad(item.unidad) }}
                    </span>
                </template>

                <!-- ESTADO -->
                <template #item.activo="{ item }">
                    <v-chip
                        size="small"
                        :color="item.activo ? 'success' : 'grey'"
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

                <!-- ACCIONES -->
                <template #item.acciones="{ item }">
                    <div class="actions">

                        <v-btn
                            icon
                            variant="text"
                            size="small"
                            color="primary"
                            title="Editar producto"
                            aria-label="Editar producto"
                            @click="abrirEditar(item)"
                        >
                            <v-icon size="19">
                                mdi-pencil-outline
                            </v-icon>
                        </v-btn>

                        <v-btn
                            v-if="item.activo"
                            icon
                            variant="text"
                            size="small"
                            color="error"
                            title="Desactivar producto"
                            aria-label="Desactivar producto"
                            @click="confirmarDesactivar(item)"
                        >
                            <v-icon size="19">
                                mdi-eye-off-outline
                            </v-icon>
                        </v-btn>

                        <v-btn
                            v-else
                            icon
                            variant="text"
                            size="small"
                            color="success"
                            title="Activar producto"
                            aria-label="Activar producto"
                            @click="activarProducto(item)"
                        >
                            <v-icon size="19">
                                mdi-eye-outline
                            </v-icon>
                        </v-btn>

                    </div>
                </template>

                <!-- PAGINACIÓN -->
                <template #bottom>
                    <div class="table-bottom">
                        <span>
                            Mostrando
                            <strong>{{ productosFiltrados.length }}</strong>
                            de
                            <strong>{{ productos.length }}</strong>
                            productos
                        </span>
                    </div>
                </template>

            </v-data-table>

        </v-card>

        <!-- DIALOG CREAR / EDITAR -->
        <v-dialog
            v-model="dialogProducto"
            max-width="720"
            persistent
        >
            <v-card class="product-dialog">

                <div class="dialog-header">
                    <div class="dialog-heading">

                        <div class="dialog-icon">
                            <v-icon>
                                {{
                                    modoEdicion
                                        ? 'mdi-pencil-outline'
                                        : 'mdi-package-variant-plus'
                                }}
                            </v-icon>
                        </div>

                        <div>
                            <span class="dialog-eyebrow">
                                {{ modoEdicion ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO' }}
                            </span>

                            <h2>
                                {{ modoEdicion ? 'Editar producto' : 'Crear producto' }}
                            </h2>
                        </div>

                    </div>

                    <v-btn
                        icon
                        variant="text"
                        aria-label="Cerrar"
                        @click="cerrarDialogo"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>

                <v-divider />

                <v-card-text class="dialog-content">

                    <v-form
                        ref="formProducto"
                        @submit.prevent="guardarProducto"
                    >

                        <!-- INFORMACIÓN GENERAL -->
                        <div class="form-section">

                            <div class="section-heading">
                                <div class="section-number">01</div>

                                <div>
                                    <h3>Información general</h3>
                                    <span>Datos básicos del producto</span>
                                </div>
                            </div>

                            <div class="form-grid">

                                <v-text-field
                                    v-model="form.nombre"
                                    label="Nombre"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="[reglas.requerido]"
                                    maxlength="120"
                                    counter
                                    required
                                />

                                <v-select
                                    v-model="form.categoriaId"
                                    :items="categoriasActivas"
                                    item-title="nombre"
                                    item-value="id"
                                    label="Categoría"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="[reglas.requerido]"
                                    required
                                />

                                <v-textarea
                                    v-model="form.descripcion"
                                    label="Descripción"
                                    variant="outlined"
                                    density="comfortable"
                                    rows="3"
                                    maxlength="500"
                                    counter
                                    class="full-width"
                                />

                            </div>

                        </div>

                        <!-- PRECIOS -->
                        <div class="form-section">

                            <div class="section-heading">
                                <div class="section-number">02</div>

                                <div>
                                    <h3>Precios</h3>
                                    <span>Costos y precio de venta</span>
                                </div>
                            </div>

                            <div class="form-grid">

                                <v-text-field
                                    v-model.number="form.precioCompra"
                                    label="Precio de compra"
                                    type="number"
                                    min="0"
                                    prefix="$"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]"
                                    required
                                />

                                <v-text-field
                                    v-model.number="form.precioVenta"
                                    label="Precio de venta"
                                    type="number"
                                    min="0"
                                    prefix="$"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]"
                                    required
                                />

                            </div>

                        </div>

                        <!-- INVENTARIO -->
                        <div class="form-section">

                            <div class="section-heading">
                                <div class="section-number">03</div>

                                <div>
                                    <h3>Inventario</h3>
                                    <span>Existencias y unidad de medida</span>
                                </div>
                            </div>

                            <div class="form-grid">

                                <v-text-field
                                    v-if="!modoEdicion"
                                    v-model.number="form.stockActual"
                                    label="Stock inicial"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]"
                                />

                                <v-text-field
                                    v-else
                                    :model-value="form.stockActual"
                                    label="Stock actual"
                                    variant="outlined"
                                    density="comfortable"
                                    readonly
                                    hint="El stock se modifica desde Inventario."
                                    persistent-hint
                                />

                                <v-text-field
                                    v-model.number="form.stockMinimo"
                                    label="Stock mínimo"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    variant="outlined"
                                    density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]"
                                />

                                <v-select
                                    v-model="form.unidad"
                                    :items="unidades"
                                    item-title="title"
                                    item-value="value"
                                    label="Unidad"
                                    variant="outlined"
                                    density="comfortable"
                                />

                                <div class="switch-field">
                                    <v-switch
                                        v-model="form.controlaInventario"
                                        color="primary"
                                        label="Controlar inventario"
                                        hide-details
                                    />

                                    <span>
                                        Activa el seguimiento de existencias
                                    </span>
                                </div>

                            </div>

                        </div>

                        <!-- ESTADO -->
                        <div class="form-section last-section">

                            <div class="section-heading">
                                <div class="section-number">04</div>

                                <div>
                                    <h3>Estado</h3>
                                    <span>Disponibilidad del producto</span>
                                </div>
                            </div>

                            <div class="status-setting">
                                <div class="status-setting-icon">
                                    <v-icon size="19">
                                        {{
                                            form.activo
                                                ? 'mdi-check-circle-outline'
                                                : 'mdi-eye-off-outline'
                                        }}
                                    </v-icon>
                                </div>

                                <div>
                                    <strong>
                                        {{ form.activo ? 'Producto activo' : 'Producto inactivo' }}
                                    </strong>

                                    <span>
                                        {{
                                            form.activo
                                                ? 'Disponible para realizar ventas.'
                                                : 'No aparecerá entre los productos disponibles.'
                                        }}
                                    </span>
                                </div>

                                <v-spacer />

                                <v-switch
                                    v-model="form.activo"
                                    color="success"
                                    hide-details
                                />
                            </div>

                        </div>

                    </v-form>

                </v-card-text>

                <v-divider />

                <v-card-actions class="dialog-actions">

                    <v-btn
                        variant="text"
                        @click="cerrarDialogo"
                    >
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="primary"
                        size="large"
                        :loading="guardando"
                        prepend-icon="mdi-content-save-outline"
                        @click="guardarProducto"
                    >
                        {{ modoEdicion ? 'Guardar cambios' : 'Crear producto' }}
                    </v-btn>

                </v-card-actions>

            </v-card>
        </v-dialog>

        <!-- DIALOG DESACTIVAR -->
        <v-dialog
            v-model="dialogDesactivar"
            max-width="460"
        >
            <v-card class="confirm-dialog">

                <div class="confirm-header">
                    <div class="confirm-icon">
                        <v-icon>mdi-eye-off-outline</v-icon>
                    </div>

                    <div>
                        <h2>Desactivar producto</h2>
                        <span>Esta acción no elimina el historial.</span>
                    </div>
                </div>

                <v-card-text>

                    <p class="confirm-text">
                        ¿Seguro que quieres desactivar
                        <strong>{{ productoSeleccionado?.nombre }}</strong>?
                    </p>

                    <div class="warning-box">
                        <v-icon size="19">
                            mdi-information-outline
                        </v-icon>

                        <span>
                            El producto dejará de aparecer en las ventas,
                            pero su historial se conservará.
                        </span>
                    </div>

                </v-card-text>

                <v-card-actions class="confirm-actions">

                    <v-btn
                        variant="text"
                        @click="dialogDesactivar = false"
                    >
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn
                        color="error"
                        variant="flat"
                        :loading="desactivando"
                        prepend-icon="mdi-eye-off-outline"
                        @click="desactivarProducto"
                    >
                        Desactivar
                    </v-btn>

                </v-card-actions>

            </v-card>
        </v-dialog>

        <!-- SNACKBAR -->
        <v-snackbar
            v-model="snackbar.visible"
            :color="snackbar.color"
            location="bottom right"
            timeout="3500"
            class="product-snackbar"
        >
            {{ snackbar.text }}

            <template #actions>
                <v-btn
                    variant="text"
                    @click="snackbar.visible = false"
                >
                    Cerrar
                </v-btn>
            </template>
        </v-snackbar>

    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import api from '@/plugins/axios'

const productos = ref([])
const categorias = ref([])

const cargando = ref(false)
const guardando = ref(false)
const desactivando = ref(false)

const busqueda = ref('')
const categoriaFiltro = ref(null)
const estadoFiltro = ref('ACTIVOS')

const dialogProducto = ref(false)
const dialogDesactivar = ref(false)

const modoEdicion = ref(false)
const productoSeleccionado = ref(null)

const formProducto = ref(null)

const snackbar = reactive({
    visible: false,
    text: '',
    color: 'success',
})

const estadosFiltro = [
    {
        title: 'Activos',
        value: 'ACTIVOS',
    },
    {
        title: 'Inactivos',
        value: 'INACTIVOS',
    },
    {
        title: 'Todos',
        value: 'TODOS',
    },
]

const unidades = [
    {
        title: 'Unidad',
        value: 'UNIDAD',
    },
    {
        title: 'Kilogramo',
        value: 'KG',
    },
    {
        title: 'Gramo',
        value: 'GRAMO',
    },
    {
        title: 'Litro',
        value: 'LITRO',
    },
    {
        title: 'Mililitro',
        value: 'MILILITRO',
    },
    {
        title: 'Paquete',
        value: 'PAQUETE',
    },
    {
        title: 'Caja',
        value: 'CAJA',
    },
    {
        title: 'Botella',
        value: 'BOTELLA',
    },
]

const headers = [
    {
        title: 'Producto',
        key: 'producto',
        sortable: false,
        minWidth: '260px',
    },
    {
        title: 'Categoría',
        key: 'categoria',
        sortable: false,
    },
    {
        title: 'Compra',
        key: 'precioCompra',
        align: 'end',
    },
    {
        title: 'Venta',
        key: 'precioVenta',
        align: 'end',
    },
    {
        title: 'Stock',
        key: 'stock',
        sortable: false,
    },
    {
        title: 'Unidad',
        key: 'unidad',
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

const formInicial = () => ({
    nombre: '',
    descripcion: '',
    precioCompra: 0,
    precioVenta: 0,
    costo: 0,
    stockActual: 0,
    stockMinimo: 0,
    unidad: 'UNIDAD',
    categoriaId: null,
    activo: true,
    controlaInventario: true,
})

const form = reactive(formInicial())

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

    numeroNoNegativo: (value) => {
        const numero = Number(value)

        if (Number.isNaN(numero)) {
            return 'Debe ser un número válido'
        }

        if (numero < 0) {
            return 'No puede ser negativo'
        }

        return true
    },
}

const productosActivos = computed(() => {
    return productos.value.filter((producto) => producto.activo).length
})

const productosStockBajo = computed(() => {
    return productos.value.filter((producto) => {
        if (!producto.activo || !producto.controlaInventario) {
            return false
        }

        return (
            Number(producto.stockActual) <=
            Number(producto.stockMinimo)
        )
    }).length
})

const categoriasActivas = computed(() => {
    return categorias.value.filter((categoria) => categoria.activo)
})

const productosFiltrados = computed(() => {
    const texto = busqueda.value.trim().toLowerCase()

    return productos.value.filter((producto) => {
        const coincideBusqueda =
            !texto ||
            producto.nombre?.toLowerCase().includes(texto) ||
            producto.descripcion?.toLowerCase().includes(texto)

        const coincideCategoria =
            !categoriaFiltro.value ||
            producto.categoria?.id === categoriaFiltro.value

        let coincideEstado = true

        if (estadoFiltro.value === 'ACTIVOS') {
            coincideEstado = producto.activo === true
        }

        if (estadoFiltro.value === 'INACTIVOS') {
            coincideEstado = producto.activo === false
        }

        return (
            coincideBusqueda &&
            coincideCategoria &&
            coincideEstado
        )
    })
})

function mostrarMensaje(text, color = 'success') {
    snackbar.text = text
    snackbar.color = color
    snackbar.visible = true
}

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

function nombreUnidad(unidad) {
    const encontrada = unidades.find(
        (item) => item.value === unidad,
    )

    return encontrada?.title || unidad || 'Unidad'
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

async function cargarProductos() {
    try {
        const { data } = await api.get('/producto')
        productos.value = Array.isArray(data) ? data : []
    } catch (error) {
        manejarError(
            error,
            'No se pudieron cargar los productos.',
        )
    }
}

async function cargarCategorias() {
    try {
        const { data } = await api.get('/categoria-producto')
        categorias.value = Array.isArray(data) ? data : []
    } catch (error) {
        manejarError(
            error,
            'No se pudieron cargar las categorías.',
        )
    }
}

async function cargarDatos() {
    cargando.value = true

    try {
        await Promise.all([
            cargarProductos(),
            cargarCategorias(),
        ])
    } finally {
        cargando.value = false
    }
}

function resetFormulario() {
    Object.assign(form, formInicial())
}

function abrirCrear() {
    modoEdicion.value = false
    productoSeleccionado.value = null

    resetFormulario()

    dialogProducto.value = true
}

function abrirEditar(producto) {
    modoEdicion.value = true
    productoSeleccionado.value = producto

    Object.assign(form, {
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precioCompra: Number(producto.precioCompra) || 0,
        precioVenta: Number(producto.precioVenta) || 0,
        costo: Number(producto.costo) || 0,
        stockActual: Number(producto.stockActual) || 0,
        stockMinimo: Number(producto.stockMinimo) || 0,
        unidad: producto.unidad || 'UNIDAD',
        categoriaId: producto.categoria?.id || null,
        activo: producto.activo ?? true,
        controlaInventario:
            producto.controlaInventario ?? true,
    })

    dialogProducto.value = true
}

function cerrarDialogo() {
    if (guardando.value) return

    dialogProducto.value = false
    productoSeleccionado.value = null

    resetFormulario()
}

async function guardarProducto() {
    const resultado = await formProducto.value?.validate()

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
            const payload = {
                nombre: form.nombre.trim(),
                descripcion: form.descripcion?.trim() || undefined,
                precioCompra: Number(form.precioCompra),
                precioVenta: Number(form.precioVenta),
                costo: Number(form.costo) || 0,
                stockMinimo: Number(form.stockMinimo) || 0,
                unidad: form.unidad,
                categoriaId: Number(form.categoriaId),
                activo: form.activo,
            }

            await api.patch(
                `/producto/${productoSeleccionado.value.id}`,
                payload,
            )

            mostrarMensaje(
                'Producto actualizado correctamente.',
            )
        } else {
            const payload = {
                nombre: form.nombre.trim(),
                descripcion: form.descripcion?.trim() || undefined,
                precioCompra: Number(form.precioCompra),
                precioVenta: Number(form.precioVenta),
                costo: Number(form.costo) || 0,
                stockActual: Number(form.stockActual) || 0,
                stockMinimo: Number(form.stockMinimo) || 0,
                unidad: form.unidad,
                categoriaId: Number(form.categoriaId),
                activo: form.activo,
            }

            await api.post('/producto', payload)

            mostrarMensaje(
                'Producto creado correctamente.',
            )
        }

        dialogProducto.value = false

        await cargarProductos()

        resetFormulario()
        productoSeleccionado.value = null
    } catch (error) {
        manejarError(
            error,
            modoEdicion.value
                ? 'No se pudo actualizar el producto.'
                : 'No se pudo crear el producto.',
        )
    } finally {
        guardando.value = false
    }
}

function confirmarDesactivar(producto) {
    productoSeleccionado.value = producto
    dialogDesactivar.value = true
}

async function desactivarProducto() {
    if (!productoSeleccionado.value) return

    desactivando.value = true

    try {
        await api.delete(
            `/producto/${productoSeleccionado.value.id}`,
        )

        mostrarMensaje(
            'Producto desactivado correctamente.',
        )

        dialogDesactivar.value = false

        await cargarProductos()
    } catch (error) {
        manejarError(
            error,
            'No se pudo desactivar el producto.',
        )
    } finally {
        desactivando.value = false
    }
}

async function activarProducto(producto) {
    try {
        await api.patch(`/producto/${producto.id}`, {
            activo: true,
        })

        mostrarMensaje(
            'Producto activado correctamente.',
        )

        await cargarProductos()
    } catch (error) {
        manejarError(
            error,
            'No se pudo activar el producto.',
        )
    }
}

onMounted(() => {
    cargarDatos()
})
</script>

<style scoped>
.productos-page {
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

.new-product-btn {
    flex-shrink: 0;
}

/* =========================================
   SUMMARY
========================================= */

.summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 18px;
}

.summary-card {
    min-width: 0;
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

.summary-icon.active {
    background: #eaf8f0;
    color: #18864b;
}

.summary-icon.warning {
    background: #fff6df;
    color: #b77900;
}

.summary-icon.category {
    background: #f0edff;
    color: #6856c9;
}

.summary-content {
    min-width: 0;
}

.summary-content span {
    display: block;
    color: #737d8d;
    font-size: 11px;
    line-height: 1.3;
    margin-bottom: 3px;
}

.summary-content strong {
    display: block;
    color: #172033;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 700;
}

/* =========================================
   FILTERS
========================================= */

.filters-card {
    padding: 17px;
    margin-bottom: 18px;
    border: 1px solid #e5e9ef;
    border-radius: 12px;
    background: #ffffff;
}

.filters-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.filters-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.filters-title-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #f1f6fc;
    color: #1976d2;
}

.filters-title strong {
    display: block;
    color: #273142;
    font-size: 13px;
    font-weight: 700;
}

.filters-title span {
    display: block;
    margin-top: 1px;
    color: #8a93a1;
    font-size: 11px;
}

.filters-grid {
    display: grid;
    grid-template-columns: 2fr 1.2fr 1fr auto;
    gap: 11px;
    align-items: center;
}

.refresh-btn {
    height: 48px !important;
}

/* =========================================
   TABLE
========================================= */

.table-card {
    overflow: hidden;
    background: #ffffff;
    border: 1px solid #e5e9ef;
    border-radius: 12px;
}

.table-header {
    min-height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 15px 20px;
}

.table-title {
    display: flex;
    align-items: center;
    gap: 11px;
}

.table-title-icon {
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #f1f6fc;
    color: #1976d2;
}

.table-title h2 {
    margin: 0;
    color: #172033;
    font-size: 15px;
    font-weight: 700;
}

.table-title span {
    display: block;
    margin-top: 2px;
    color: #8992a0;
    font-size: 11px;
}

.result-chip {
    min-width: 32px;
    justify-content: center;
}

.products-table {
    border-radius: 0;
}

:deep(.products-table .v-data-table__th) {
    height: 44px !important;
    background: #f8fafc !important;
    color: #667085 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.35px;
    border-bottom: 1px solid #e8edf2 !important;
}

:deep(.products-table .v-data-table__td) {
    height: 68px !important;
    border-bottom: 1px solid #edf0f4 !important;
    color: #374151;
    font-size: 13px;
}

:deep(.products-table tbody tr:hover) {
    background: #fafcff !important;
}

:deep(.products-table .v-data-table__tr:last-child .v-data-table__td) {
    border-bottom: none !important;
}

/* =========================================
   PRODUCT
========================================= */

.product-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 3px 0;
}

.product-image {
    width: 48px;
    height: 48px;
    min-width: 48px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background: #f1f5f9;
    color: #64748b;
    border: 1px solid #e7ebf0;
}

.product-info {
    min-width: 0;
}

.product-info strong {
    display: block;
    max-width: 280px;
    overflow: hidden;
    color: #202939;
    font-size: 13px;
    font-weight: 650;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.product-info span {
    display: block;
    max-width: 280px;
    overflow: hidden;
    margin-top: 2px;
    color: #7b8492;
    font-size: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.product-info small {
    display: block;
    margin-top: 2px;
    color: #a0a7b2;
    font-size: 9px;
    line-height: 1;
}

/* =========================================
   MONEY
========================================= */

.money {
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
}

.purchase-price {
    color: #596273;
}

.sale-price {
    color: #172033;
    font-weight: 700;
}

/* =========================================
   CATEGORY
========================================= */

.category-chip {
    font-size: 11px !important;
    font-weight: 600;
}

/* =========================================
   STOCK
========================================= */

.stock-cell {
    min-width: 75px;
}

.stock-main {
    display: flex;
    align-items: center;
    gap: 4px;
}

.stock-cell strong {
    color: #202939;
    font-size: 13px;
    font-weight: 700;
}

.stock-cell span {
    display: block;
    margin-top: 2px;
    color: #8b94a2;
    font-size: 10px;
}

.stock-cell .stock-low {
    color: #d97706;
}

.stock-warning-icon {
    color: #d97706;
}

.stock-cell .no-control {
    color: #9aa2ad;
    font-style: italic;
}

/* =========================================
   UNIT / STATUS
========================================= */

.unit-text {
    color: #596273;
    font-size: 12px;
}

.status-chip {
    font-size: 11px !important;
    font-weight: 600;
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

.table-bottom {
    display: flex;
    align-items: center;
    min-height: 46px;
    padding: 0 20px;
    border-top: 1px solid #edf0f4;
    color: #7a8391;
    font-size: 11px;
}

.table-bottom strong {
    color: #4b5563;
    font-weight: 650;
}

/* =========================================
   PRODUCT DIALOG
========================================= */

.product-dialog {
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
    padding: 0 22px !important;
}

.form-section {
    padding: 19px 0;
}

.form-section + .form-section {
    border-top: 1px solid #edf0f4;
}

.last-section {
    padding-bottom: 6px;
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

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 13px;
}

.full-width {
    grid-column: 1 / -1;
}

.switch-field {
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 11px;
    border: 1px solid #dfe4ea;
    border-radius: 4px;
}

.switch-field .v-switch {
    flex-shrink: 0;
}

.switch-field > span {
    color: #667085;
    font-size: 11px;
    line-height: 1.3;
}

.status-setting {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 60px;
    padding: 10px 13px;
    border: 1px solid #e4e8ed;
    border-radius: 9px;
    background: #fafbfc;
}

.status-setting-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: #eaf8f0;
    color: #18864b;
}

.status-setting strong {
    display: block;
    color: #293343;
    font-size: 12px;
}

.status-setting span {
    display: block;
    margin-top: 2px;
    color: #8a93a1;
    font-size: 10px;
}

.dialog-actions {
    min-height: 70px;
    padding: 13px 20px;
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
    margin: 7px 0 0;
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
    margin-top: 15px;
    padding: 11px 13px;
    border: 1px solid #f2dfad;
    border-radius: 8px;
    background: #fff9eb;
    color: #805d12;
    font-size: 11px;
    line-height: 1.5;
}

.warning-box .v-icon {
    flex-shrink: 0;
}

.confirm-actions {
    min-height: 64px;
    padding: 10px 20px;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1200px) {
    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .filters-grid {
        grid-template-columns: 1.5fr 1fr;
    }

    .refresh-btn {
        width: 100%;
    }
}

@media (max-width: 800px) {
    .productos-page {
        padding: 20px;
    }

    .page-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .new-product-btn {
        width: 100%;
    }

    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .filters-grid {
        grid-template-columns: 1fr;
    }

    .filters-title {
        align-items: flex-start;
    }

    .table-card {
        overflow: hidden;
    }

    :deep(.products-table .v-data-table__wrapper) {
        overflow-x: auto;
    }
}

@media (max-width: 600px) {
    .productos-page {
        padding: 14px;
    }

    .page-header {
        margin-bottom: 18px;
    }

    .page-header h1 {
        font-size: 25px;
    }

    .summary-grid {
        grid-template-columns: 1fr;
        gap: 9px;
    }

    .summary-card {
        padding: 13px;
    }

    .filters-card {
        padding: 13px;
    }

    .table-header {
        padding: 13px 15px;
    }

    .table-title-icon {
        width: 32px;
        height: 32px;
    }

    .result-chip {
        display: none;
    }

    .dialog-content {
        max-height: 66vh;
        padding: 0 17px !important;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .full-width {
        grid-column: auto;
    }

    .switch-field {
        min-height: 52px;
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

    .dialog-actions {
        padding: 11px 16px;
    }
}
</style>