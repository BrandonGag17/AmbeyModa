import { Navigate, Route, Routes } from 'react-router-dom'
import Inicio from './Inicio'
import Cuenta from './Cuenta'
import CrearProducto from './CrearProducto'
import Navbar from './Navbar'
import DetalleProducto from './DetalleProducto'
import EditarCategoria from './editarCategoria'
import { useAuth } from './hooks/useAuth'

function Header() {
  return (
    <Navbar />
  )
}

function RutaProtegida({ children }) {
  const { session, cargando } = useAuth()

  if (cargando) return <p>Cargando sesión...</p>
  if (!session) return <Navigate to="/cuenta" replace />

  return children
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route
          path="/crear-producto"
          element={<RutaProtegida><CrearProducto /></RutaProtegida>}
        />
        <Route path="/detalle-producto/:id" element={<DetalleProducto />} />
        <Route
          path="/editarCategoria/:id"
          element={<RutaProtegida><EditarCategoria /></RutaProtegida>}
        />
      </Routes>
    </>
  )
}

export default App