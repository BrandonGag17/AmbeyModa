import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './Inicio.css'

function Inicio() {
    const [productos, setProductos] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => {
        cargarProductos()
    }, [])

    async function cargarProductos() {
        setLoading(true)
        const { data, error } = await supabase
            .from('Productos')
            .select('*')

        if (error) {
            setLoading(false)
            return
        }
        setProductos(data)
        setLoading(false)
    }

    const productosFiltrados = productos.filter((prod) =>
        prod.Nombre.toLowerCase().includes(busqueda.toLowerCase())
    )

    const [esAdmin, setEsAdmin] = useState(false)

    useEffect(() => {
        const adminGuardado = localStorage.getItem('esAdmin')
        setEsAdmin(adminGuardado === 'true')
    }, [])

    function crearProducto() {
        if (!esAdmin) {
            alert('Debes iniciar sesión como administrador para crear un producto.')
            return
        }
        navigate('/crear-producto')
    }

    const formatearPrecio = (precio) => {
        const valor = Number(precio)
        if (Number.isNaN(valor)) return 'ARS 0,00'
        return valor.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS'
        })
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
                            onClick={() => navigate(`/producto/${prod.idProducto}`)}
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
                                    {prod.Descripcion || prod.Categoria || "Accesorio de moda"}
                                </p>

                                <div className="producto-card__meta">
                                    <span>{formatearPrecio(prod.Precio)}</span>
                                </div>

                            </div>

                        </button>

                    ))}

                </div>

            )}

        </div>
    )
}

export default Inicio