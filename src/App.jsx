import { Routes, Route } from 'react-router-dom'
import Inicio from './Inicio'
import Cuenta from './Cuenta'
import CrearProducto from './CrearProducto'
import Navbar from './Navbar'

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
      </Routes>
    </>
  )
}

export default App