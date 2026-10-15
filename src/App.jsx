import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importamos el Layout (para el admin) y las páginas de cliente
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import Inicio from './pages/Inicio';
import Usuarios from './pages/Usuarios';
import Cotizaciones from './pages/Cotizaciones';
import Pagos from './pages/Pagos';
import Servicios from './pages/Servicios';
import ArticulosAlquiler from './pages/ArticulosAlquiler';
import GestionarProductos from './pages/GestionarProductos';

import FormularioAlquiler from './pages/FormularioAlquiler';
import SolicitudCotizacion from './pages/Solicitudcotizacion';
import Login from './pages/Login';
import MisPedidos from './pages/MisPedidos';
import EditarPedido from './pages/EditarPedido';
import Landinpage from './pages/Landinpage';
import Perfil from './pages/Perfil';

import Contacto from './pages/Contactos';
import ContactosAdmin from './pages/ContactosAdmin';

import Registro from './pages/Registro';
import Terminos from './pages/Terminos';
import OlvidePassword from './pages/OlvidePassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landinpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/olvide-password" element={<OlvidePassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/catalogo" element={<FormularioAlquiler />} />
        <Route path="/confirmar-cotizacion" element={<SolicitudCotizacion />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/editar-pedido/:id" element={<EditarPedido />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/contacto" element={<Contacto />} />

        <Route path="/admin" element={<RutaProtegida soloAdmin><Layout /></RutaProtegida>}>
          <Route index element={<Inicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="cotizaciones" element={<Cotizaciones />} />
          <Route path="pagos" element={<Pagos />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="articulos" element={<ArticulosAlquiler />} />
          <Route path="pedido/:id/productos" element={<GestionarProductos />} />
          <Route path="contactos" element={<ContactosAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
