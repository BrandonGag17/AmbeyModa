import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Inicio.css'
import './editarCategoria.css'

function EditarCategoria() {

    const { id } = useParams()
    const navigate = useNavigate()

    const [categoria, setCategoria] = useState(null)
    const [nombre, setNombre] = useState('')
    const [productos, setProductos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [loading, setLoading] = useState(true)
    const [guardandoNombre, setGuardandoNombre] = useState(false)

    const [productoSeleccionado, setProductoSeleccionado] = useState(null)
    const [nuevaCategoria, setNuevaCategoria] = useState('')

    useEffect(() => {
        cargarDatos()
    }, [id])

    async function cargarDatos() {

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
                .select('idProducto, Nombre, Descripcion, ImagenUrl')
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
    }

    async function guardarNombre() {

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

        </div>
    )
}

export default EditarCategoria