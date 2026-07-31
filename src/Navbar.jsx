import { Link } from 'react-router-dom'
import './Navbar.css'
import logo from './assets/hero.png'

function Navbar() {
  return (
    <>
      <nav className="navbar">
        <img src={logo} alt="Ambey" className="navbar__logo" />
        <Link to="/" className="navbar__link">
          Inicio
        </Link>
        <Link to="/cuenta" className="navbar__link">
          Cuenta
        </Link>
      </nav>
      <nav className="avisos">
        <p className="avisos__texto">¡Seguinos en nuestras redes sociales!</p>
        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384015.png" alt="Instagram" className="avisos__icono" />
        <p className="avisos__texto">@ambey_moda</p>
      </nav>
    </>


  )
}

export default Navbar
