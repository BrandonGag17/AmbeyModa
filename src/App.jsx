import { Routes, Route } from 'react-router-dom'
import Inicio from './Inicio'
import Cuenta from './Cuenta'
import CrearProducto from './CrearProducto'
import Navbar from './Navbar'
import DetalleProducto from './DetalleProducto'

function Header() {
  return (
    <Navbar />
  )
}

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/cuenta" element={<Cuenta />} />
        <Route path="/crear-producto" element={<CrearProducto />} />
        <Route path="/detalle-producto/:id" element={<DetalleProducto />} />
      </Routes>
    </>
  )
}

export default App