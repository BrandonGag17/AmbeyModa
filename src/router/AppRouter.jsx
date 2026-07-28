import { Routes, Route } from "react-router-dom";

import Inicio from "../Inicio";
import Cuenta from "../Cuenta";
import DetalleProducto from "../DetalleProducto";
import CrearProducto from "../CrearProducto";
import EditarProducto from "../EditarProducto";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/cuenta" element={<Cuenta />} />
      <Route path="/producto/:id" element={<DetalleProducto />} />
      <Route path="/producto/nuevo" element={<CrearProducto />} />
      <Route path="/producto/editar/:id" element={<EditarProducto />} />
    </Routes>
  );
}

export default AppRouter;