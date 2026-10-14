import { authFetch } from '../services/http';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COP = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '32px 24px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '24px',
    padding: 0,
    fontFamily: 'inherit',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 20px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 380px',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    alignItems: 'start',
  },
  // ── Form section ──
  formSection: {
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
  },
  formSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 18px',
    paddingBottom: '12px',
    borderBottom: '0.5px solid #f1f5f9',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    fontSize: '13px',
    border: '0.5px solid #cbd5e1',
    borderRadius: '8px',
    background: '#fff',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  inputFocus: {
    borderColor: '#10b981',
    boxShadow: '0 0 0 3px rgba(16,185,129,0.1)',
  },
  // ── Order panel ──
  panel: {
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'sticky',
    top: '24px',
  },
  panelHeader: {
    padding: '18px 20px',
    borderBottom: '0.5px solid #f1f5f9',
    background: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  panelDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  panelBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#f8fafc',
    padding: '10px 12px',
    borderRadius: '8px',
    gap: '8px',
  },
  cartItemName: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: '13px',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cartItemQty: {
    color: '#6366f1',
    fontWeight: '700',
    fontSize: '13px',
  },
  cartItemPrice: {
    color: '#059669',
    fontWeight: '600',
    fontSize: '12px',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
    lineHeight: 1,
    fontFamily: 'inherit',
    transition: 'color 0.1s',
  },
  totalBox: {
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
    border: '0.5px solid #86efac',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#15803d',
    fontWeight: '700',
    fontSize: '13px',
  },
  totalValue: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '20px',
  },
  submitBtn: (disabled) => ({
    width: '100%',
    padding: '14px',
    background: disabled ? '#e2e8f0' : 'linear-gradient(135deg, #10b981, #059669)',
    color: disabled ? '#94a3b8' : '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxShadow: disabled ? 'none' : '0 4px 14px rgba(16,185,129,0.3)',
    transition: 'opacity 0.15s',
  }),
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px',
    padding: '24px 0',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const SolicitudCotizacion = () => {
  const [carrito, setCarrito] = useState([]);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [fechaEvento, setFechaEvento] = useState('');
  const [cantidadPersonas, setCantidadPersonas] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación
    const usuarioString = localStorage.getItem('usuarioChicaeme');
    if (!usuarioString) {
      alert('Debes iniciar sesión para acceder a esta página');
      navigate('/login');
      return;
    }

    const usuario = JSON.parse(usuarioString);
    setUsuarioLogueado(usuario);

    // Cargar carrito
    const carritoGuardado = localStorage.getItem('carritoAlquiler');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, [navigate]);

  const totalCarrito = carrito.reduce((s, i) => s + i.cantidad * i.precioAlquiler, 0);

  const quitarDelCarrito = (id) => {
    const nuevoCarrito = carrito.filter(i => i.id !== id);
    setCarrito(nuevoCarrito);
    localStorage.setItem('carritoAlquiler', JSON.stringify(nuevoCarrito));
  };

  const enviarSolicitud = async () => {
    if (carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega artículos antes de continuar.');
      return;
    }
    if (!fechaEvento) {
      alert('Por favor completa la fecha del evento.');
      return;
    }
    if (!cantidadPersonas || parseInt(cantidadPersonas) <= 0) {
      alert('Por favor completa la cantidad de personas.');
      return;
    }

    const payload = {
      fechaEvento,
      cantidadPersonas: parseInt(cantidadPersonas),
      estado: 'Pendiente',
      total: 0,
      observaciones: observaciones || '',
      usuario: { id: usuarioLogueado.id },
      detalles: carrito.map(i => ({
        articuloAlquiler: { id: i.id },
        cantidad: Number(i.cantidad),
        precioUnitario: Number(i.precioAlquiler),
      })),
    };

    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        // Limpiar carrito
        localStorage.removeItem('carritoAlquiler');
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate('/mis-pedidos');
        }, 2000);
      } else {
        alert('Ocurrió un error al enviar la solicitud. Intenta de nuevo.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!usuarioLogueado) {
    return (
      <div style={S.page}>
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0' }}>
          Verificando sesión...
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={S.page}>
        <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h1 style={S.pageTitle}>¡Cotización enviada!</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
            Tu solicitud ha sido recibida. Te redirigiremos a tus pedidos en unos momentos.
          </p>
          <button
            onClick={() => navigate('/mis-pedidos')}
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: 'inherit',
            }}
          >
            Ver mis pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button style={S.backBtn} onClick={() => navigate('/catalogo')}>
          ← Volver al catálogo
        </button>
        <h1 style={S.pageTitle}>Completa tu cotización</h1>
        <p style={S.pageSubtitle}>
          Hola <strong>{usuarioLogueado?.nombre || 'Usuario'}</strong>, completa los datos de tu evento para finalizar tu solicitud.
        </p>
      </div>

      {/* ── Main layout ── */}
      <div style={S.layout}>

        {/* ── Formulario ── */}
        <div>
          {/* Datos del evento */}
          <div style={S.formSection}>
            <h2 style={S.formSectionTitle}>Información del evento</h2>

            <div style={S.fieldGroup}>
              <label style={S.label}>Fecha del evento *</label>
              <input
                type="date"
                value={fechaEvento}
                onChange={e => setFechaEvento(e.target.value)}
                style={S.input}
                onFocus={e => Object.assign(e.target.style, S.inputFocus)}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              />
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                Selecciona la fecha en que necesitas los artículos
              </small>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Cantidad de personas *</label>
              <input
                type="number"
                placeholder="Ej: 50"
                min="1"
                value={cantidadPersonas}
                onChange={e => setCantidadPersonas(e.target.value)}
                style={S.input}
                onFocus={e => Object.assign(e.target.style, S.inputFocus)}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              />
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                Esto nos ayuda a ajustar la propuesta
              </small>
            </div>

            <div style={S.fieldGroup}>
              <label style={S.label}>Observaciones adicionales</label>
              <textarea
                placeholder="Cuéntanos más detalles sobre tu evento (opcional)"
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                style={{
                  ...S.input,
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                onFocus={e => Object.assign(e.target.style, S.inputFocus)}
                onBlur={e => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              />
              <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                Especificaciones, preferencias o requerimientos especiales
              </small>
            </div>
          </div>

          {/* Resumen artículos */}
          <div style={{ ...S.formSection, marginTop: '24px' }}>
            <h2 style={S.formSectionTitle}>Artículos seleccionados</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {carrito.length === 0 ? (
                <div style={S.emptyState}>
                  No hay artículos en el carrito
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} style={S.cartItem}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={S.cartItemName}>{item.nombre}</p>
                      <p style={{ ...S.cartItemPrice, margin: 0 }}>
                        {COP(item.precioAlquiler)} × {item.cantidad} = {COP(item.precioAlquiler * item.cantidad)}
                      </p>
                    </div>
                    <span style={S.cartItemQty}>×{item.cantidad}</span>
                    <button
                      onClick={() => quitarDelCarrito(item.id)}
                      style={S.removeBtn}
                      onMouseEnter={e => { e.target.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.target.style.color = '#94a3b8'; }}
                      title="Quitar artículo"
                    >×</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Resumen ── */}
        <div style={S.panel}>
          <div style={S.panelHeader}>
            <div style={S.panelDot} />
            <h3 style={S.panelTitle}>Resumen</h3>
          </div>

          <div style={S.panelBody}>
            {/* User info */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '0 0 4px' }}>USUARIO</p>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {usuarioLogueado?.nombre}
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                {usuarioLogueado?.email}
              </p>
            </div>

            {/* Evento info preview */}
            {(fechaEvento || cantidadPersonas) && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', margin: '0 0 4px' }}>EVENTO</p>
                {fechaEvento && (
                  <p style={{ fontSize: '12px', color: '#0f172a', margin: '0 0 3px' }}>
                    📅 {new Date(fechaEvento).toLocaleDateString('es-CO')}
                  </p>
                )}
                {cantidadPersonas && (
                  <p style={{ fontSize: '12px', color: '#0f172a', margin: 0 }}>
                    👥 {cantidadPersonas} persona{cantidadPersonas !== '1' ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '0.5px solid #f1f5f9', margin: '4px 0' }} />

            {/* Artículos */}
            <div>
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                Artículos ({carrito.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {carrito.map(item => (
                  <div key={item.id} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#0f172a', fontWeight: '500' }}>{item.nombre}</span>
                    <span style={{ color: '#059669', fontWeight: '700' }}>
                      ×{item.cantidad}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            {carrito.length > 0 && (
              <>
                <div style={{ borderTop: '0.5px solid #f1f5f9', margin: '0' }}></div>
                <div style={S.totalBox}>
                  <span style={S.totalLabel}>Total estimado</span>
                  <span style={S.totalValue}>{COP(totalCarrito)}</span>
                </div>
              </>
            )}

            {/* Botón confirmar */}
            <button
              onClick={enviarSolicitud}
              disabled={loading || carrito.length === 0 || !fechaEvento || !cantidadPersonas}
              style={S.submitBtn(loading || carrito.length === 0 || !fechaEvento || !cantidadPersonas)}
            >
              {loading ? '⏳ Enviando...' : `Confirmar cotización`}
            </button>

            <p style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
              Recibirás confirmación en tu correo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudCotizacion;