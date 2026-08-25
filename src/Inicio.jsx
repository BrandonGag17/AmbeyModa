import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useIsAdmin } from './hooks/useIsAdmin'
import './Inicio.css'

function Inicio() {
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const [categorias, setCategorias] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [busqueda, setBusqueda] = useState('')
    const navigate = useNavigate()
    const esAdmin = useIsAdmin()

    useEffect(() => {
        cargarProductos()
        traerCategorias()
    }, [])

    async function traerCategorias() {
        const { data, error } = await supabase
            .from('categorias')
            .select('idcategoria, nombre')
            .order('nombre', { ascending: true })

        if (error) {
            console.error('Error cargando categorías', error)
            return
        }

        setCategorias(data || [])
    }

    async function cargarProductos(categoriaId = null) {
        setLoading(true)
        let query = supabase.from('Productos').select('idProducto, Nombre, Descripcion, ImagenUrl, idCategoria')
        if (categoriaId) query = query.eq('idCategoria', Number(categoriaId))

        const { data, error } = await query

        if (error) {
            setLoading(false)
            console.error('Error cargando productos', error)
            return
        }
        setProductos(data || [])
        setLoading(false)
    }

    const productosFiltrados = useMemo(() => 
        productos.filter((prod) =>
            prod.Nombre.toLowerCase().includes(busqueda.toLowerCase())
        ),
        [productos, busqueda]
    )

    function crearProducto() {
        if (!esAdmin) {
            alert('Debes iniciar sesión como administrador para crear un producto.')
            return
        }
        navigate('/crear-producto')
    }

    return (
        <div className="inicio-page">

            <section className="inicio-hero">
                <div className="inicio-header">
                    <h1>AMBEY MODA</h1>
                </div>
            </section>

            <div className="productos-toolbar">
                <input
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                {esAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={crearProducto}
                    >
                        Crear producto
                    </button>
                )}
            </div>

            {/* Botones de categorías */}
            <div className="categorias-bar">
                <button
                    className={`btn-categoria ${selectedCategory === null ? 'active' : ''}`}
                    onClick={() => {
                        setSelectedCategory(null)
                        cargarProductos()
                    }}
                >
                    Todos
                </button>

                {categorias.map((cat) => (
                    <div className="categoria-item" key={cat.idcategoria}>
                        <button
                            className={`btn-categoria ${selectedCategory === cat.idcategoria ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(cat.idcategoria)
                                cargarProductos(cat.idcategoria)
                            }}
                        >
                            {cat.nombre}
                        </button>

                        {esAdmin && (
                            <button
                                className="btn-editar-categoria"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/editarCategoria/${cat.idcategoria}`)
                                }}
                                title="Editar categoría"
                            >
                                ✎
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {loading ? (

                <div className="loading-state">
                    <div className="spinner" />
                    <p>Cargando productos...</p>
                </div>

            ) : productos.length === 0 ? (

                <div className="empty-state">
                    <h2>Todavía no hay productos</h2>


                </div>

            ) : productosFiltrados.length === 0 ? (

                <div className="empty-state">
                    <h2>No encontramos ese producto</h2>
                    <p>Probá con otro nombre.</p>
                </div>

            ) : (

                <div className="productos-grid">

                    {productosFiltrados.map((prod) => (

                        <button
                            className="producto-card"
                            key={prod.idProducto}
                            onClick={() => navigate(`/detalle-producto/${prod.idProducto}`)}
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
                                    {prod.Descripcion || "Accesorio de moda"}
                                </p>

                            </div>

                        </button>

                    ))}

                </div>

            )}

        </div>
    )


}

export default Inicio