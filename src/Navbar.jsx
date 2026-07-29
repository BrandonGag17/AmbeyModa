import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar__link">
        Inicio
      </Link>
      <Link to="/cuenta" className="navbar__link">
        Cuenta
      </Link>
    </nav>
  )
}

export default Navbar
