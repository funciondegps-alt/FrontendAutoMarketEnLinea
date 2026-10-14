import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COP = (n) =>
  Number(n || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return 'Sin fecha';
  try {
    const [y, m, d] = fechaStr.split('-').map(Number);
    if (!y || !m || !d) return fechaStr;
    const fecha = new Date(y, m - 1, d);
    return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return fechaStr;
  }
};

// Calcula el total real a partir de los detalles, por si "total" llega en 0 desde el backend
const calcularTotalPedido = (pedido) => {
  if (pedido.total && pedido.total > 0) return pedido.total;
  if (!Array.isArray(pedido.detalles)) return 0;
  return pedido.detalles.reduce((sum, d) => {
    const sub = d.subtotal ?? (Number(d.cantidad || 0) * Number(d.precioUnitario || 0));
    return sum + sub;
  }, 0);
};

const ESTILOS_ESTADO = {
  Pendiente: { border: '#f59e0b', bg: '#fef9c3', text: '#854d0e', dot: '#f59e0b' },
  Aprobado:  { border: '#10b981', bg: '#dcfce7', text: '#15803d', dot: '#10b981' },
  Rechazado: { border: '#ef4444', bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' },
};
const obtenerEstiloEstado = (estado) =>
  ESTILOS_ESTADO[estado] || { border: '#cbd5e1', bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };

const FILTROS = ['Todos', 'Pendiente', 'Aprobado', 'Rechazado'];

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '32px 24px',
  },
  wrap: { maxWidth: '800px', margin: '0 auto' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', color: '#64748b',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    marginBottom: '24px', padding: 0, fontFamily: 'inherit',
  },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
  pageSubtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 24px' },

  // ── Toolbar (búsqueda + filtros) ──
  toolbar: { display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' },
  searchWrap: { position: 'relative' },
  searchInput: {
    width: '100%', padding: '12px 40px 12px 40px', fontSize: '14px',
    border: '0.5px solid #e2e8f0', borderRadius: '12px', background: '#fff',
    color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  searchIcon: {
    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
    color: '#94a3b8', fontSize: '15px', pointerEvents: 'none',
  },
  searchClear: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    background: '#f1f5f9', border: 'none', borderRadius: '50%',
    width: '22px', height: '22px', cursor: 'pointer', color: '#64748b',
    fontSize: '13px', lineHeight: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: 'inherit',
  },
  filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterChip: (activo, color) => ({
    padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    border: activo ? `1.5px solid ${color}` : '0.5px solid #e2e8f0',
    background: activo ? `${color}1A` : '#fff',
    color: activo ? color : '#64748b',
  }),
  resultsCount: { fontSize: '12px', color: '#94a3b8', margin: '-8px 0 0 2px' },

  // ── Banner de error ──
  errorBanner: {
    background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '12px',
    padding: '14px 16px', marginBottom: '20px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', gap: '12px',
  },
  errorText: { color: '#b91c1c', fontSize: '13px', fontWeight: '500', margin: 0 },
  retryBtn: {
    background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    fontFamily: 'inherit', flexShrink: 0,
  },

  // ── Estados vacíos / carga ──
  centerState: {
    textAlign: 'center', color: '#94a3b8', padding: '64px 0', fontSize: '14px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
  },
  spinner: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTopColor: '#10b981',
    animation: 'girar 0.8s linear infinite',
  },
  linkBtn: {
    background: 'none', border: 'none', color: '#10b981', fontWeight: '600',
    fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
  },

  // ── Tarjeta de pedido ──
  card: (color) => ({
    background: '#fff', padding: '22px', borderRadius: '16px',
    border: '0.5px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${color}`,
  }),
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  cardId: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  cardDate: { color: '#94a3b8', fontSize: '12px', margin: '3px 0 0' },
  statusBadge: (estilo) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
    background: estilo.bg, color: estilo.text, whiteSpace: 'nowrap',
  }),
  statusDot: (color) => ({ width: '6px', height: '6px', borderRadius: '50%', background: color }),

  infoRow: { display: 'flex', gap: '20px', margin: '16px 0', flexWrap: 'wrap' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
  infoLabel: { fontSize: '10px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  infoValue: { fontSize: '13px', fontWeight: '600', color: '#334155' },

  detailsBox: { background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', marginTop: '4px' },
  detailsTitle: { margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: '13px',
    padding: '5px 0', color: '#334155', borderBottom: '0.5px solid #e2e8f0',
  },
  detailRowLast: { borderBottom: 'none' },
  detailQty: { color: '#6366f1', fontWeight: '700' },

  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #f1f5f9',
  },
  totalLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600' },
  totalValue: { color: '#0f172a', fontSize: '18px', fontWeight: '800' },

  actions: { marginTop: '16px', display: 'flex', gap: '10px' },
  editBtn: {
    flex: 1, padding: '11px', background: '#334155', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
  },
  cancelBtn: {
    flex: 1, padding: '11px', background: '#fff', color: '#ef4444',
    border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '13px', fontFamily: 'inherit', transition: 'background 0.15s',
  },
  whatsappBtn: {
    flex: 1, padding: '12px', background: '#25d366', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
    boxShadow: '0 4px 14px rgba(37,211,102,0.25)', fontFamily: 'inherit',
  },
  rejectedNote: {
    padding: '12px', background: '#fef2f2', borderRadius: '8px', textAlign: 'center',
  },
  rejectedText: { color: '#b91c1c', fontSize: '12.5px', fontWeight: '500' },

  // ── Modal confirmación cancelar ──
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  modalBox: {
    background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '380px',
    width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
  },
  modalTitle: { margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#0f172a' },
  modalText: { margin: '0 0 20px', fontSize: '13px', color: '#64748b', lineHeight: '1.6' },
  modalActions: { display: 'flex', gap: '10px' },
  modalCancel: {
    flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
  },
  modalConfirm: {
    flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none',
    borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit',
  },
};

// Inyecta el keyframe del spinner una sola vez
const EstiloGlobal = () => (
  <style>{`@keyframes girar { to { transform: rotate(360deg); } }`}</style>
);

const WhatsAppIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
const MisPedidos = () => {
  const [pedidos, setPedidos]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [busqueda, setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [pedidoACancelar, setPedidoACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioString = localStorage.getItem('usuarioChicaeme');
    if (!usuarioString) {
      navigate('/login');
      return;
    }
    const usuario = JSON.parse(usuarioString);
    cargarPedidos(usuario.id);
  }, [navigate]);

  const cargarPedidos = async (usuarioId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch(`${API_BASE_URL}/api/cotizaciones/usuario/${usuarioId}`);
      if (!response.ok) throw new Error('Error al cargar pedidos');
      const data = await response.json();
      // Más reciente primero
      const ordenados = [...data].sort((a, b) => (b.id || 0) - (a.id || 0));
      setPedidos(ordenados);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError('No pudimos cargar tus pedidos. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const reintentar = () => {
    const usuarioString = localStorage.getItem('usuarioChicaeme');
    if (usuarioString) cargarPedidos(JSON.parse(usuarioString).id);
  };

  const contactarWhatsApp = (pedido) => {
    const telefonoDonPedro = '573028283730';
    const usuarioString = localStorage.getItem('usuarioChicaeme');
    const nombreCliente = usuarioString ? JSON.parse(usuarioString).nombres : 'Un cliente';
    const total = calcularTotalPedido(pedido);

    const mensaje = `Hola Don Pedro, soy ${nombreCliente}. Me comunico para coordinar el pago y la entrega de mi pedido #${pedido.id} programado para el ${pedido.fechaEvento}, el cual ya fue aprobado en la plataforma. El total estimado es de $${total.toLocaleString('es-CO')} COP.`;

    const url = `https://wa.me/${telefonoDonPedro}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const confirmarCancelacion = async () => {
    if (!pedidoACancelar) return;
    setCancelando(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/cotizaciones/${pedidoACancelar.id}`, {        method: 'DELETE',
      });
      if (!res.ok) throw new Error('No se pudo cancelar el pedido');
      setPedidos(prev => prev.filter(p => p.id !== pedidoACancelar.id));
      setPedidoACancelar(null);
    } catch (err) {
      console.error(err);
      alert('No pudimos cancelar el pedido. Intenta de nuevo en unos momentos.');
    } finally {
      setCancelando(false);
    }
  };

  // Filtra por estado y por texto de búsqueda (id, fecha o nombre de artículos)
  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return pedidos.filter(p => {
      const pasaEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
      if (!pasaEstado) return false;
      if (!texto) return true;
      const enId = String(p.id).includes(texto);
      const enFecha = (p.fechaEvento || '').toLowerCase().includes(texto);
      const enArticulos = Array.isArray(p.detalles) && p.detalles.some(d =>
        d.articuloAlquiler?.nombre?.toLowerCase().includes(texto)
      );
      return enId || enFecha || enArticulos;
    });
  }, [pedidos, busqueda, filtroEstado]);

  const conteoPorEstado = useMemo(() => {
    const c = { Todos: pedidos.length, Pendiente: 0, Aprobado: 0, Rechazado: 0 };
    pedidos.forEach(p => { if (c[p.estado] !== undefined) c[p.estado] += 1; });
    return c;
  }, [pedidos]);

  return (
    <div style={S.page}>
      <EstiloGlobal />

      {/* ── Modal confirmación de cancelación ── */}
      {pedidoACancelar && (
        <div style={S.modalOverlay} onClick={() => !cancelando && setPedidoACancelar(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>¿Cancelar pedido #{pedidoACancelar.id}?</h3>
            <p style={S.modalText}>
              Esta acción no se puede deshacer. Tu solicitud de alquiler para el{' '}
              {formatearFecha(pedidoACancelar.fechaEvento)} será eliminada.
            </p>
            <div style={S.modalActions}>
              <button style={S.modalCancel} onClick={() => setPedidoACancelar(null)} disabled={cancelando}>
                Volver
              </button>
              <button style={S.modalConfirm} onClick={confirmarCancelacion} disabled={cancelando}>
                {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={S.wrap}>
        <button style={S.backBtn} onClick={() => navigate('/')}>← Volver al inicio</button>
        <h1 style={S.pageTitle}>Mis solicitudes de alquiler</h1>
        <p style={S.pageSubtitle}>Consulta el estado de tus pedidos y coordina la entrega cuando sean aprobados.</p>

        {/* ── Banner de error ── */}
        {error && (
          <div style={S.errorBanner}>
            <p style={S.errorText}>{error}</p>
            <button style={S.retryBtn} onClick={reintentar}>Reintentar</button>
          </div>
        )}

        {/* ── Toolbar: búsqueda + filtros (solo si hay pedidos) ── */}
        {!loading && !error && pedidos.length > 0 && (
          <div style={S.toolbar}>
            <div style={S.searchWrap}>
              <span style={S.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Buscar por número, fecha o artículo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={S.searchInput}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
              />
              {busqueda && (
                <button style={S.searchClear} onClick={() => setBusqueda('')} title="Limpiar búsqueda">×</button>
              )}
            </div>

            <div style={S.filterRow}>
              {FILTROS.map(f => {
                const color = f === 'Todos' ? '#0f172a' : obtenerEstiloEstado(f).text;
                return (
                  <button
                    key={f}
                    style={S.filterChip(filtroEstado === f, color)}
                    onClick={() => setFiltroEstado(f)}
                  >
                    {f} {conteoPorEstado[f] !== undefined ? `(${conteoPorEstado[f]})` : ''}
                  </button>
                );
              })}
            </div>

            {(busqueda || filtroEstado !== 'Todos') && (
              <p style={S.resultsCount}>
                {pedidosFiltrados.length} de {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* ── Contenido principal ── */}
        {loading ? (
          <div style={S.centerState}>
            <div style={S.spinner} />
            <span>Cargando tus pedidos...</span>
          </div>
        ) : error && pedidos.length === 0 ? null /* el banner ya cubre este caso */ : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pedidos.length === 0 ? (
              <div style={S.centerState}>
                <span>No tienes solicitudes realizadas aún.</span>
                <button style={S.linkBtn} onClick={() => navigate('/catalogo')}>
                  Explorar el catálogo →
                </button>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div style={S.centerState}>
                <span>No encontramos pedidos que coincidan con tu búsqueda.</span>
                <button style={S.linkBtn} onClick={() => { setBusqueda(''); setFiltroEstado('Todos'); }}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              pedidosFiltrados.map(pedido => {
                const estilo = obtenerEstiloEstado(pedido.estado);
                const total = calcularTotalPedido(pedido);
                const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];

                return (
                  <div key={pedido.id} style={S.card(estilo.border)}>
                    <div style={S.cardHeader}>
                      <div>
                        <h2 style={S.cardId}>Pedido #{pedido.id}</h2>
                        <p style={S.cardDate}>Solicitado el {formatearFecha(pedido.fechaCreacion)}</p>
                      </div>
                      <span style={S.statusBadge(estilo)}>
                        <span style={S.statusDot(estilo.dot)} />
                        {pedido.estado}
                      </span>
                    </div>

                    <div style={S.infoRow}>
                      <div style={S.infoItem}>
                        <span style={S.infoLabel}>Fecha del evento</span>
                        <span style={S.infoValue}>{formatearFecha(pedido.fechaEvento)}</span>
                      </div>
                      {pedido.cantidadPersonas && (
                        <div style={S.infoItem}>
                          <span style={S.infoLabel}>Personas</span>
                          <span style={S.infoValue}>{pedido.cantidadPersonas}</span>
                        </div>
                      )}
                      <div style={S.infoItem}>
                        <span style={S.infoLabel}>Artículos</span>
                        <span style={S.infoValue}>{detalles.length}</span>
                      </div>
                    </div>

                    {detalles.length > 0 && (
                      <div style={S.detailsBox}>
                        <h4 style={S.detailsTitle}>Productos solicitados</h4>
                        {detalles.map((d, idx) => (
                          <div
                            key={d.id ?? idx}
                            style={idx === detalles.length - 1 ? { ...S.detailRow, ...S.detailRowLast } : S.detailRow}
                          >
                            <span>
                              {d.articuloAlquiler?.nombre || 'Artículo'}{' '}
                              <span style={S.detailQty}>×{d.cantidad}</span>
                            </span>
                            <span>{COP(d.subtotal ?? (d.cantidad * d.precioUnitario))}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={S.totalRow}>
                      <span style={S.totalLabel}>Total estimado</span>
                      <span style={S.totalValue}>{COP(total)}</span>
                    </div>

                    {/* ── Acciones según estado ── */}
                    {pedido.estado === 'Pendiente' && (
                      <div style={S.actions}>
                        <button style={S.editBtn} onClick={() => navigate(`/editar-pedido/${pedido.id}`)}>
                          Editar pedido
                        </button>
                        <button
                          style={S.cancelBtn}
                          onClick={() => setPedidoACancelar(pedido)}
                          onMouseEnter={e => { e.target.style.background = '#fef2f2'; }}
                          onMouseLeave={e => { e.target.style.background = '#fff'; }}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}

                    {pedido.estado === 'Aprobado' && (
                      <div style={{ marginTop: '16px' }}>
                        <button style={S.whatsappBtn} onClick={() => contactarWhatsApp(pedido)}>
                          <WhatsAppIcon />
                          Coordinar pago / entrega
                        </button>
                      </div>
                    )}

                    {pedido.estado === 'Rechazado' && (
                      <div style={{ marginTop: '16px', ...S.rejectedNote }}>
                        <span style={S.rejectedText}>
                          Lo sentimos, no contamos con disponibilidad de inventario para esta fecha.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidos;