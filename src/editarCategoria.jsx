import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Inicio.css'
import './editarCategoria.css'
import { useIsAdmin } from './hooks/useIsAdmin'

function EditarCategoria() {

    const { id } = useParams()
    const navigate = useNavigate()
    const esAdmin = useIsAdmin()

    const [categoria, setCategoria] = useState(null)
    const [nombre, setNombre] = useState('')
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [guardandoNombre, setGuardandoNombre] = useState(false)

    const [productoSeleccionado, setProductoSeleccionado] = useState(null)
    const [nuevaCategoria, setNuevaCategoria] = useState('')
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)
    const [mostrarNuevaCategoriaReemplazo, setMostrarNuevaCategoriaReemplazo] = useState(false)
    const [nombreCategoriaReemplazo, setNombreCategoriaReemplazo] = useState('')
    const [eliminandoCategoria, setEliminandoCategoria] = useState(false)

    const cargarDatos = useCallback(async () => {

        setLoading(true)

        // Categoría actual
        const { data: categoriaData, error: categoriaError } =
            await supabase
                .from('categorias')
                .select('idcategoria, nombre')
                .eq('idcategoria', Number(id))
                .single()

        if (categoriaError) {
            console.error('Error cargando categoría:', categoriaError)
            setLoading(false)
            return
        }

        setCategoria(categoriaData)
        setNombre(categoriaData.nombre)

        // Productos de la categoría - solo campos necesarios
        const { data: productosData, error: productosError } =
            await supabase
                .from('Productos')
                .select('idProducto, Nombre, Descripcion, ImagenUrl, enStock')
                .eq('idCategoria', Number(id))

        if (productosError) {
            console.error('Error cargando productos:', productosError)
            setLoading(false)
            return
        }

        setProductos(productosData || [])

        // Todas las categorías
        const { data: categoriasData, error: categoriasError } =
            await supabase
                .from('categorias')
                .select('idcategoria, nombre')
                .order('nombre', { ascending: true })

        if (categoriasError) {
            console.error('Error cargando categorías:', categoriasError)
            setLoading(false)
            return
        }

        setCategorias(categoriasData || [])

        setLoading(false)
    }, [id])

    useEffect(() => {
        cargarDatos()
    }, [cargarDatos])

    async function guardarNombre() {
        if (!esAdmin) return

        if (!nombre.trim()) {
            alert('El nombre de la categoría no puede estar vacío.')
            return
        }

        setGuardandoNombre(true)

        const { error } = await supabase
            .from('categorias')
            .update({
                nombre: nombre.trim()
            })
            .eq('idcategoria', Number(id))

        if (error) {
            console.error('Error actualizando categoría:', error)
            alert('No se pudo actualizar el nombre.')
            setGuardandoNombre(false)
            return
        }

        setCategoria({
            ...categoria,
            nombre: nombre.trim()
        })

        alert('Nombre actualizado correctamente.')

        setGuardandoNombre(false)
    }

    function eliminarDeCategoria(producto) {

        const confirmar = window.confirm(
            `¿Querés quitar "${producto.Nombre}" de la categoría "${categoria.nombre}"?`
        )

        if (!confirmar) return

        setProductoSeleccionado(producto)
        setNuevaCategoria('')
    }

    async function moverProducto() {
        if (!esAdmin) return

        if (!nuevaCategoria) {
            alert('Seleccioná una categoría.')
            return
        }

        const { error } = await supabase
            .from('Productos')
            .update({
                idCategoria: Number(nuevaCategoria)
            })
            .eq('idProducto', productoSeleccionado.idProducto)

        if (error) {
            console.error('Error moviendo producto:', error)
            alert('No se pudo mover el producto.')
            return
        }

        setProductos((productosActuales) =>
            productosActuales.filter(
                (producto) =>
                    producto.idProducto !== productoSeleccionado.idProducto
            )
        )

        setProductoSeleccionado(null)
        setNuevaCategoria('')
    }

    function iniciarEliminacionCategoria() {
        if (!esAdmin || eliminandoCategoria) return

        if (productos.length === 0) {
            eliminarCategoria()
            return
        }

        setMostrarConfirmacionEliminar(true)
    }

    async function eliminarProductosDeCategoria() {
        const idsProductos = productos.map((producto) => producto.idProducto)

        if (idsProductos.length === 0) return true

        // Se eliminan primero las fotos para soportar bases de datos sin
        // eliminación en cascada configurada en FotosProducto.
        const { error: errorFotos } = await supabase
            .from('FotosProducto')
            .delete()
            .in('idProducto', idsProductos)

        if (errorFotos) {
            console.error('Error eliminando fotos de productos:', errorFotos)
            alert('No se pudieron eliminar las fotos de los productos.')
            return false
        }

        const { error: errorProductos } = await supabase
            .from('Productos')
            .delete()
            .eq('idCategoria', Number(id))

        if (errorProductos) {
            console.error('Error eliminando productos:', errorProductos)
            alert('No se pudieron eliminar los productos de la categoría.')
            return false
        }

        return true
    }

    async function eliminarCategoria({ eliminarProductos = false } = {}) {
        if (!esAdmin || eliminandoCategoria) return

        setEliminandoCategoria(true)

        if (eliminarProductos) {
            const productosEliminados = await eliminarProductosDeCategoria()
            if (!productosEliminados) {
                setEliminandoCategoria(false)
                return
            }
        }

        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('idcategoria', Number(id))

        if (error) {
            console.error('Error eliminando categoría:', error)
            alert('No se pudo eliminar la categoría.')
            setEliminandoCategoria(false)
            return
        }

        navigate('/')
    }

    async function crearCategoriaYReasignarProductos() {
        if (!esAdmin || eliminandoCategoria) return

        const nombreNueva = nombreCategoriaReemplazo.trim()
        if (!nombreNueva) {
            alert('Escribí un nombre para la nueva categoría.')
            return
        }

        setEliminandoCategoria(true)

        const { data: categoriaNueva, error: errorCreacion } = await supabase
            .from('categorias')
            .insert({ nombre: nombreNueva })
            .select('idcategoria, nombre')
            .single()

        if (errorCreacion || !categoriaNueva) {
            console.error('Error creando categoría de reemplazo:', errorCreacion)
            alert('No se pudo crear la nueva categoría.')
            setEliminandoCategoria(false)
            return
        }

        const { error: errorMovimiento } = await supabase
            .from('Productos')
            .update({ idCategoria: categoriaNueva.idcategoria })
            .eq('idCategoria', Number(id))

        if (errorMovimiento) {
            console.error('Error reasignando productos:', errorMovimiento)
            alert('La nueva categoría fue creada, pero no se pudieron mover los productos. La categoría original no fue eliminada.')
            setEliminandoCategoria(false)
            return
        }

        const { error: errorEliminacion } = await supabase
            .from('categorias')
            .delete()
            .eq('idcategoria', Number(id))

        if (errorEliminacion) {
            console.error('Error eliminando categoría original:', errorEliminacion)
            alert('Los productos fueron movidos, pero no se pudo eliminar la categoría original.')
            setEliminandoCategoria(false)
            return
        }

        navigate('/')
    }

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner" />
                <p>Cargando categoría...</p>
            </div>
        )
    }

    if (!categoria) {
        return (
            <div className="empty-state">
                <h2>No encontramos la categoría</h2>
            </div>
        )
    }

    return (
        <div className="inicio-page">

            <section className="inicio-hero">
                <div className="inicio-header">
                    <h1>Editar categoría</h1>
                </div>
            </section>

            {/* EDITAR NOMBRE */}

            <div className="editar-categoria-nombre">

                <span className="campo-label">
                    Nombre de la categoría
                </span>

                <div className="editar-categoria-nombre__fila">

                    <input
                        className="campo-input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />

                    <button
                        className="btn btn-primary"
                        onClick={guardarNombre}
                        disabled={guardandoNombre}
                    >
                        {guardandoNombre
                            ? 'Guardando...'
                            : 'Guardar nombre'}
                    </button>

                    <button
                        className="btn btn-danger"
                        onClick={iniciarEliminacionCategoria}
                        disabled={eliminandoCategoria}
                    >
                        {eliminandoCategoria ? 'Eliminando...' : 'Eliminar categoría'}
                    </button>

                </div>

            </div>

            {/* PRODUCTOS */}

            <div className="productos-toolbar">

                <h2>Productos de esta categoría</h2>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                >
                    ← Volver
                </button>

            </div>

            {productos.length === 0 ? (

                <div className="empty-state">
                    <h2>No hay productos en esta categoría</h2>
                </div>

            ) : (

                <div className="productos-grid">

                    {productos.map((prod) => (

                        <div
                            className="producto-card"
                            key={prod.idProducto}
                        >

                            <div className="producto-card__image">

                                {prod.ImagenUrl && (
                                    <img
                                        src={prod.ImagenUrl}
                                        alt={prod.Nombre}
                                    />
                                )}

                            </div>

                            <div className="producto-card__body">

                                <h3>{prod.Nombre}</h3>

                                <p className="producto-card__subtitle">
                                    {prod.Descripcion || 'Accesorio de moda'}
                                </p>

                                <button
                                    className="btn-eliminar-categoria"
                                    onClick={() =>
                                        eliminarDeCategoria(prod)
                                    }
                                >
                                    Quitar de categoría
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {/* MODAL PARA MOVER PRODUCTO */}

            {productoSeleccionado && (

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Mover producto</h2>

                        <p>
                            ¿A qué categoría querés mover
                            <strong>
                                {' '}{productoSeleccionado.Nombre}
                            </strong>?
                        </p>

                        <select
                            className="campo-input"
                            value={nuevaCategoria}
                            onChange={(e) =>
                                setNuevaCategoria(e.target.value)
                            }
                        >

                            <option value="">
                                Seleccionar categoría
                            </option>

                            {categorias
                                .filter(
                                    (cat) =>
                                        cat.idcategoria !== Number(id)
                                )
                                .map((cat) => (

                                    <option
                                        key={cat.idcategoria}
                                        value={cat.idcategoria}
                                    >
                                        {cat.nombre}
                                    </option>

                                ))}

                        </select>

                        <div className="modal-acciones">

                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setProductoSeleccionado(null)
                                    setNuevaCategoria('')
                                }}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={moverProducto}
                            >
                                Mover producto
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {mostrarConfirmacionEliminar && (

                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="eliminar-categoria-titulo">

                    <div className="modal">

                        <h2 id="eliminar-categoria-titulo">Eliminar categoría</h2>

                        <p>
                            La categoría que querés eliminar tiene productos, ¿deseás crear una nueva categoría en su lugar?
                        </p>

                        <p className="modal-advertencia">
                            Si no creás una nueva categoría, los productos que se encuentran en la categoría actual también van a ser eliminados.
                        </p>

                        <div className="modal-acciones">

                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false)
                                    setNombreCategoriaReemplazo('')
                                    setMostrarNuevaCategoriaReemplazo(true)
                                }}
                            >
                                Sí
                            </button>

                            <button
                                className="btn btn-danger"
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false)
                                    eliminarCategoria({ eliminarProductos: true })
                                }}
                            >
                                No, eliminar todo
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {mostrarNuevaCategoriaReemplazo && (

                <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="nueva-categoria-titulo">

                    <div className="modal">

                        <h2 id="nueva-categoria-titulo">Crear nueva categoría</h2>

                        <p>
                            Los {productos.length} producto{productos.length === 1 ? '' : 's'} de <strong>{categoria.nombre}</strong> se moverán automáticamente a esta nueva categoría.
                        </p>

                        <label className="campo-label" htmlFor="nombre-categoria-reemplazo">
                            Nombre de la nueva categoría
                        </label>

                        <input
                            id="nombre-categoria-reemplazo"
                            className="campo-input"
                            value={nombreCategoriaReemplazo}
                            onChange={(e) => setNombreCategoriaReemplazo(e.target.value)}
                            placeholder="Ej. Camperas"
                            autoFocus
                        />

                        <div className="modal-acciones">

                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setMostrarNuevaCategoriaReemplazo(false)
                                    setNombreCategoriaReemplazo('')
                                }}
                                disabled={eliminandoCategoria}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={crearCategoriaYReasignarProductos}
                                disabled={eliminandoCategoria}
                            >
                                {eliminandoCategoria ? 'Guardando...' : 'Crear, mover y eliminar'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    )
}

export default EditarCategoria
