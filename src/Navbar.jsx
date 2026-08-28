import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from './assets/hero.png'
import { supabase } from './supabaseClient'
import { useAuth } from './hooks/useAuth'

function Navbar() {
  const { pathname } = useLocation()
  const [nombreProducto, setNombreProducto] = useState('')
  const { session } = useAuth()
  const idProducto = pathname.match(/^\/detalle-producto\/([^/]+)/)?.[1]

  useEffect(() => {
    let cancelado = false

    if (!idProducto) {
      setNombreProducto('')
      return
    }

    async function traerNombreProducto() {
      const { data, error } = await supabase
        .from('Productos')
        .select('Nombre')
        .eq('idProducto', idProducto)
        .single()

      if (!cancelado && !error) {
        setNombreProducto(data?.Nombre || 'este producto')
      }
    }

    traerNombreProducto()

    return () => {
      cancelado = true
    }
  }, [idProducto])

  const mensajeWhatsapp = idProducto
    ? `Hola, buenas tardes. Me interesó este ${nombreProducto || 'producto'} y quisiera saber más. ¿Me podrías ayudar?`
    : 'Hola, buenas tardes, vengo desde su catálogo web y quisiera saber más. ¿Me podrías ayudar?'

  async function cerrarSesion() {
    await supabase.auth.signOut()
  }

  return (
    <>
      <nav className="navbar">
        <img
          src="/ambey.jpg"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = logo
          }}
          alt="Ambey"
          className="navbar__logo"
        />
        <Link to="/" className="navbar__link">
          Inicio
        </Link>
        <Link to="/cuenta" className="navbar__link">
          Cuenta
        </Link>
        {session && (
          <button type="button" className="navbar__logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        )}
      </nav>
      <nav className="avisos">
        <p className="avisos__texto">¡Seguinos en nuestras redes sociales y contactanos!</p>
        <div className="avisos__acciones">
          <a
            href="https://www.instagram.com/ambey_moda/"
            target="_blank"
            rel="noopener noreferrer"
            className="boton-instagram"
          >
            <img src="https://cdn.simpleicons.org/instagram/ffffff" alt="" className="avisos__icono" />
            @ambey_moda
          </a>
          <a
            href={`https://wa.me/5491169092236?text=${encodeURIComponent(mensajeWhatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="boton-whatsapp"
          >
            <img
              src="https://cdn.simpleicons.org/whatsapp/ffffff"
              alt=""
              className="avisos__icono"
            />
            Hablar por WhatsApp
          </a>
        </div>
      </nav>
    </>


  )
}

export default Navbar
