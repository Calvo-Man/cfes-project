
<template>
    <div class="productos-page">
        <!-- HEADER -->
        <div class="page-header">
            <div>
                <div class="eyebrow">
                    <v-icon size="16">mdi-package-variant-closed</v-icon>
                    CAFETERÍA
                </div>

                <h1>Productos</h1>

                <p>
                    Administra los productos, precios, categorías e inventario de la
                    cafetería.
                </p>
            </div>

            <v-btn color="primary" size="large" prepend-icon="mdi-plus" elevation="0" @click="abrirCrear">
                Nuevo producto
            </v-btn>
        </div>

        <!-- RESUMEN -->
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-icon">
                    <v-icon>mdi-package-variant</v-icon>
                </div>

                <div>
                    <span>Total productos</span>
                    <strong>{{ productos.length }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon active">
                    <v-icon>mdi-check-circle-outline</v-icon>
                </div>

                <div>
                    <span>Productos activos</span>
                    <strong>{{ productosActivos }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon warning">
                    <v-icon>mdi-alert-circle-outline</v-icon>
                </div>

                <div>
                    <span>Stock bajo</span>
                    <strong>{{ productosStockBajo }}</strong>
                </div>
            </div>

            <div class="summary-card">
                <div class="summary-icon">
                    <v-icon>mdi-shape-outline</v-icon>
                </div>

                <div>
                    <span>Categorías</span>
                    <strong>{{ categorias.length }}</strong>
                </div>
            </div>
        </div>

        <!-- FILTROS -->
        <v-card class="filters-card" elevation="0">
            <div class="filters-grid">
                <v-text-field v-model="busqueda" label="Buscar producto" placeholder="Nombre del producto..."
                    prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable />

                <v-select v-model="categoriaFiltro" :items="categorias" item-title="nombre" item-value="id"
                    label="Categoría" prepend-inner-icon="mdi-shape-outline" variant="outlined" density="comfortable"
                    hide-details clearable />

                <v-select v-model="estadoFiltro" :items="estadosFiltro" item-title="title" item-value="value"
                    label="Estado" prepend-inner-icon="mdi-filter-variant" variant="outlined" density="comfortable"
                    hide-details />

                <v-btn variant="outlined" color="primary" size="large" prepend-icon="mdi-refresh" :loading="cargando"
                    @click="cargarDatos">
                    Actualizar
                </v-btn>
            </div>
        </v-card>

        <!-- TABLA -->
        <v-card class="table-card" elevation="0">
            <div class="table-header">
                <div>
                    <h2>Listado de productos</h2>
                    <span>
                        {{ productosFiltrados.length }} producto{{
                            productosFiltrados.length === 1 ? '' : 's'
                        }}
                    </span>
                </div>
            </div>

            <v-divider />

            <v-data-table :headers="headers" :items="productosFiltrados" :loading="cargando" item-value="id" hover
                class="products-table" no-data-text="No hay productos que coincidan con los filtros"
                loading-text="Cargando productos...">
                <!-- PRODUCTO -->
                <template #item.producto="{ item }">
                    <div class="product-cell">
                        <div class="product-image">
                            <v-img v-if="item.imagen" :src="item.imagen" cover height="52" width="52" />

                            <v-icon v-else size="25">
                                mdi-food-variant
                            </v-icon>
                        </div>

                        <div class="product-info">
                            <strong>{{ item.nombre }}</strong>

                            <span v-if="item.descripcion">
                                {{ item.descripcion }}
                            </span>

                            <small>ID #{{ item.id }}</small>
                        </div>
                    </div>
                </template>

                <!-- CATEGORIA -->
                <template #item.categoria="{ item }">
                    <v-chip size="small" variant="tonal" color="primary">
                        {{ item.categoria?.nombre || 'Sin categoría' }}
                    </v-chip>
                </template>

                <!-- PRECIO COMPRA -->
                <template #item.precioCompra="{ item }">
                    <span class="money">
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
                        <strong :class="{
                            'stock-low':
                                item.controlaInventario &&
                                Number(item.stockActual) <= Number(item.stockMinimo),
                        }">
                            {{
                                item.controlaInventario
                                    ? formatoStock(item.stockActual, item.unidad)
                            : '∞'
                            }}
                        </strong>

                        <span v-if="item.controlaInventario">
                            mín. {{ formatoStock(item.stockMinimo, item.unidad) }}
                        </span>

                        <span v-else>
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
                    <v-chip size="small" :color="item.activo ? 'success' : 'grey'" variant="tonal">
                        <v-icon start size="15">
                            {{
                                item.activo
                                    ? 'mdi-check-circle-outline'
                                    : 'mdi-close-circle-outline'
                            }}
                        </v-icon>

                        {{ item.activo ? 'Activo' : 'Inactivo' }}
                    </v-chip>
                </template>

                <!-- ACCIONES -->
                <template #item.acciones="{ item }">
                    <div class="actions">
                        <v-btn icon variant="text" size="small" color="primary" title="Editar"
                            @click="abrirEditar(item)">
                            <v-icon>mdi-pencil-outline</v-icon>
                        </v-btn>

                        <v-btn v-if="item.activo" icon variant="text" size="small" color="error" title="Desactivar"
                            @click="confirmarDesactivar(item)">
                            <v-icon>mdi-eye-off-outline</v-icon>
                        </v-btn>

                        <v-btn v-else icon variant="text" size="small" color="success" title="Activar"
                            @click="activarProducto(item)">
                            <v-icon>mdi-eye-outline</v-icon>
                        </v-btn>
                    </div>
                </template>

                <!-- PAGINACIÓN -->
                <template #bottom>
                    <div class="table-bottom">
                        <span>
                            Mostrando {{ productosFiltrados.length }} de
                            {{ productos.length }}
                        </span>
                    </div>
                </template>
            </v-data-table>
        </v-card>

        <!-- DIALOG CREAR / EDITAR -->
        <v-dialog v-model="dialogProducto" max-width="720" persistent>
            <v-card class="product-dialog">
                <v-card-title class="dialog-title">
                    <div>
                        <span class="dialog-eyebrow">
                            {{ modoEdicion ? 'EDITAR' : 'NUEVO' }}
                        </span>

                        <h2>
                            {{ modoEdicion ? 'Editar producto' : 'Crear producto' }}
                        </h2>
                    </div>

                    <v-btn icon variant="text" @click="cerrarDialogo">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text>
                    <v-form ref="formProducto" @submit.prevent="guardarProducto">
                        <div class="form-section">
                            <h3>Información general</h3>

                            <div class="form-grid">
                                <v-text-field v-model="form.nombre" label="Nombre" variant="outlined"
                                    density="comfortable" :rules="[reglas.requerido]" maxlength="120" counter
                                    required />

                                <v-select v-model="form.categoriaId" :items="categoriasActivas" item-title="nombre"
                                    item-value="id" label="Categoría" variant="outlined" density="comfortable"
                                    :rules="[reglas.requerido]" required />

                                <v-textarea v-model="form.descripcion" label="Descripción" variant="outlined"
                                    density="comfortable" rows="3" maxlength="500" counter class="full-width" />
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Precios</h3>

                            <div class="form-grid">
                                <v-text-field v-model.number="form.precioCompra" label="Precio de compra" type="number"
                                    min="0" prefix="$" variant="outlined" density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]" required />

                                <v-text-field v-model.number="form.precioVenta" label="Precio de venta" type="number"
                                    min="0" prefix="$" variant="outlined" density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]" required />
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Inventario</h3>

                            <div class="form-grid">
                                <v-text-field v-if="!modoEdicion" v-model.number="form.stockActual"
                                    label="Stock inicial" type="number" min="0" step="0.001" variant="outlined"
                                    density="comfortable" :rules="[reglas.numeroNoNegativo]" />

                                <v-text-field v-else :model-value="form.stockActual" label="Stock actual"
                                    variant="outlined" density="comfortable" readonly
                                    hint="El stock se modifica desde Inventario." persistent-hint />

                                <v-text-field v-model.number="form.stockMinimo" label="Stock mínimo" type="number"
                                    min="0" step="0.001" variant="outlined" density="comfortable"
                                    :rules="[reglas.numeroNoNegativo]" />

                                <v-select v-model="form.unidad" :items="unidades" item-title="title" item-value="value"
                                    label="Unidad" variant="outlined" density="comfortable" />

                                <v-switch v-model="form.controlaInventario" color="primary" label="Controlar inventario"
                                    hide-details class="inventory-switch" />
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>Estado</h3>

                            <v-switch v-model="form.activo" color="success" label="Producto activo" hide-details />
                        </div>
                    </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="dialog-actions">
                    <v-btn variant="text" @click="cerrarDialogo">
                        Cancelar
                    </v-btn>

                    <v-spacer />

                    <v-btn color="primary" size="large" :loading="guardando" prepend-icon="mdi-content-save-outline"
                        @click="guardarProducto">
                        {{ modoEdicion ? 'Guardar cambios' : 'Crear producto' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- DIALOG DESACTIVAR -->
        <v-dialog v-model="dialogDesactivar" max-width="460">
            <v-card>
                <v-card-title>
                    Desactivar producto
                </v-card-title>

                <v-card-text>
                    ¿Seguro que quieres desactivar
                    <strong>{{ productoSeleccionado?.nombre }}</strong>?

                    <div class="warning-box">
                        <v-icon size="20">mdi-information-outline</v-icon>

                        El producto dejará de aparecer en las ventas, pero su historial
                        se conservará.
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer />

                    <v-btn variant="text" @click="dialogDesactivar = false">
                        Cancelar
                    </v-btn>

                    <v-btn color="error" variant="flat" :loading="desactivando" @click="desactivarProducto">
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
    padding: 28px;
    max-width: 1600px;
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
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(15, 23, 42, 0.07);
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
    grid-template-columns: 2fr 1.2fr 1fr auto;
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

.products-table {
    border-radius: 0;
}

.product-cell {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 5px 0;
}

.product-image {
    width: 52px;
    height: 52px;
    min-width: 52px;
    border-radius: 10px;
    overflow: hidden;
    background: #f1f5f9;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
}

.product-info {
    min-width: 0;
}

.product-info strong {
    display: block;
    color: #172033;
    font-size: 14px;
    font-weight: 650;
}

.product-info span {
    display: block;
    color: #6b7280;
    font-size: 12px;
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
}

.product-info small {
    display: block;
    color: #9aa2ad;
    font-size: 10px;
    margin-top: 2px;
}

.money {
    font-weight: 600;
    color: #4b5563;
}

.sale-price {
    color: #172033;
    font-weight: 700;
}

.stock-cell strong {
    display: block;
    font-size: 14px;
    color: #172033;
}

.stock-cell span {
    display: block;
    color: #8a919d;
    font-size: 11px;
    margin-top: 2px;
}

.stock-cell .stock-low {
    color: #d97706;
}

.unit-text {
    font-size: 13px;
    color: #596273;
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

.product-dialog {
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

.form-section {
    padding: 20px 0;
}

.form-section+.form-section {
    border-top: 1px solid #edf0f4;
}

.form-section h3 {
    font-size: 14px;
    color: #172033;
    margin: 0 0 15px;
    font-weight: 700;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
}

.full-width {
    grid-column: 1 / -1;
}

.inventory-switch {
    align-self: center;
    margin-top: 2px;
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
    .productos-page {
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

    .form-grid {
        grid-template-columns: 1fr;
    }

    .full-width {
        grid-column: auto;
    }
}
</style>
