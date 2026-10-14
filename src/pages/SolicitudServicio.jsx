import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SolicitudServicio = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [aprobados, setAprobados] = useState(0);

  useEffect(() => {
    // 1. Al cargar la página, buscamos el "carnet" en la memoria
    const usuarioGuardado = localStorage.getItem('usuarioChicaeme');
    
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      setUsuario(user);

      // 2. Consulta rápida para saber si Don Pedro aprobó algo
      const revisarEstadoPedidos = async () => {
        try {
          const response = await authFetch(`${API_BASE_URL}/api/cotizaciones/usuario/${user.id}`);
          if (response.ok) {
            const data = await response.json();
            // Filtramos solo las que están "Aprobado" para avisarle al cliente
            const countAprobados = data.filter(c => c.estado === 'Aprobado').length;
            setAprobados(countAprobados);
          }
        } catch (error) {
          console.error("Error al consultar el estado de los pedidos:", error);
        }
      };

      revisarEstadoPedidos();

    } else {
      // PROTECCIÓN: Si alguien intenta entrar sin loguearse
      navigate('/login');
    }
  }, [navigate]);

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioChicaeme');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px', fontFamily: 'Inter' }}>
      
      {/* --- BARRA SUPERIOR DE USUARIO --- */}
      {usuario && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', maxWidth: '1000px', margin: '0 auto', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: 'auto' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {usuario.nombres.charAt(0)}
            </div>
            <span style={{ color: '#334155', fontWeight: '500' }}>Hola, {usuario.nombres}</span>
          </div>

          {/* BOTÓN: MIS PEDIDOS (CON INDICADOR DE APROBACIÓN) */}
          <button 
            onClick={() => navigate('/mis-pedidos')}
            style={{ 
              position: 'relative', 
              background: '#6366F1', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              fontWeight: '500', 
              fontSize: '13px' 
            }}
          >
            Mis solicitudes
            
            {/* Si hay pedidos aprobados, mostramos una pequeña burbuja verde */}
            {aprobados > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#10B981', // Verde éxito
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid #F8FAFC',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {aprobados}
              </span>
            )}
          </button>

          {/* BOTÓN: CERRAR SESIÓN */}
          <button 
            onClick={handleCerrarSesion}
            style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}
          >
            Salir
          </button>
        </div>
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '28px' }}>Chicaeme SAS - Solicitud de Servicios</h1>
        <p style={{ color: '#64748B' }}>Seleccione la categoría de su evento</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/catalogo')} style={cardStyle}>📦 Alquiler</button>
        <button onClick={() => navigate('/solicitar/catering')} style={cardStyle}>🍽️ Catering</button>
        <button onClick={() => navigate('/solicitar/eventos')} style={cardStyle}>✨ Eventos</button>
      </div>
    </div>
  );
};

const cardStyle = {
  background: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #E2E8F0',
  cursor: 'pointer', fontSize: '18px', fontWeight: '600', color: '#334155',
  transition: 'transform 0.2s', width: '200px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
};

export default SolicitudServicio;