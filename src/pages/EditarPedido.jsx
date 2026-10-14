import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerInventarioParaCotizar } from '../services/inventarioService';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const COP = (n) =>
  Number(n || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const imagenFallback = (nombre) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || '?')}&background=e2e8f0&color=94a3b8&size=200`;

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    padding: '32px 24px',
  },
  wrap: { maxWidth: '760px', margin: '0 auto' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'none', border: 'none', color: '#64748b',
    fontSize: '13px', fontWeight: '500', cursor: 'pointer',
    marginBottom: '24px', padding: 0, fontFamily: 'inherit',
  },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' },
  pageSubtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 28px' },

  card: {
    background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: '16px',
    padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  cardTitle: { margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#0f172a' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%', padding: '10px 12px', fontSize: '13px',
    border: '0.5px solid #cbd5e1', borderRadius: '8px',
    background: '#fff', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  errorText: { color: '#ef4444', fontSize: '12px', margin: '4px 0 0' },

  // ── Producto ──
  itemRow: (sinStock) => ({
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px', borderRadius: '12px',
    background: sinStock ? '#fef2f2' : '#f8fafc',
    border: sinStock ? '0.5px solid #fecaca' : '0.5px solid transparent',
    marginBottom: '10px',
  }),
  itemImg: {
    width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover',
    cursor: 'zoom-in', flexShrink: 0, border: '0.5px solid #e2e8f0',
    background: '#fff', transition: 'transform 0.15s',
  },
  itemImgSkeleton: {
    width: '56px', height: '56px', borderRadius: '10px', flexShrink: 0,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%', animation: 'brillo 1.4s infinite',
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemName: {
    margin: 0, fontWeight: '700', color: '#0f172a', fontSize: '13.5px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  itemUnitPrice: { margin: '2px 0 0', color: '#94a3b8', fontSize: '11.5px' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  qtyBtn: {
    width: '26px', height: '26px', borderRadius: '7px', border: '0.5px solid #cbd5e1',
    background: '#fff', color: '#475569', cursor: 'pointer', fontSize: '14px',
    fontWeight: '700', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
    justifyContent: 'center', lineHeight: 1, padding: 0,
  },
  qtyInput: {
    width: '44px', padding: '6px 4px', fontSize: '13px', textAlign: 'center',
    border: '0.5px solid #cbd5e1', borderRadius: '7px', outline: 'none',
    fontFamily: 'inherit', color: '#0f172a',
  },
  itemSubtotal: { width: '92px', textAlign: 'right', flexShrink: 0, fontWeight: '700', color: '#059669', fontSize: '13px' },
  removeItemBtn: {
    background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer',
    fontSize: '17px', padding: '0 2px', lineHeight: 1, flexShrink: 0, fontFamily: 'inherit',
    transition: 'color 0.15s',
  },
  stockWarning: { fontSize: '10.5px', color: '#b91c1c', fontWeight: '600', margin: '2px 0 0' },

  emptyDetails: { textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px 0' },

  totalBox: {
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
    border: '0.5px solid #86efac', borderRadius: '12px', padding: '14px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px',
  },
  totalLabel: { color: '#15803d', fontWeight: '700', fontSize: '13px' },
  totalValue: { color: '#0f172a', fontWeight: '800', fontSize: '20px' },

  actionsRow: { display: 'flex', gap: '12px', marginTop: '4px' },
  cancelLink: {
    flex: 1, padding: '14px', background: '#fff', color: '#64748b',
    border: '0.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '600', fontSize: '14px', fontFamily: 'inherit',
  },
  submitBtn: (disabled) => ({
    flex: 2, padding: '14px',
    background: disabled ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: disabled ? '#94a3b8' : '#fff',
    border: 'none', borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '700', fontSize: '14px', fontFamily: 'inherit',
    boxShadow: disabled ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
  }),

  // ── Agregar artículos ──
  addToggleBtn: {
    width: '100%', padding: '11px', marginTop: '4px',
    background: '#f8fafc', color: '#10b981', border: '1.5px dashed #86efac',
    borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
    fontFamily: 'inherit', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px', transition: 'background 0.15s',
  },
  addPanel: {
    marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #f1f5f9',
  },
  addSearchWrap: { position: 'relative', marginBottom: '12px' },
  addSearchInput: {
    width: '100%', padding: '10px 36px 10px 36px', fontSize: '13px',
    border: '0.5px solid #e2e8f0', borderRadius: '10px', background: '#fff',
    color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  addSearchIcon: {
    position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
    color: '#94a3b8', fontSize: '13px', pointerEvents: 'none',
  },
  addList: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    maxHeight: '280px', overflowY: 'auto', paddingRight: '2px',
  },
  addRow: (yaAgregado) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px',
    borderRadius: '10px', background: yaAgregado ? '#f0fdf4' : '#fff',
    border: yaAgregado ? '0.5px solid #bbf7d0' : '0.5px solid #f1f5f9',
  }),
  addItemName: { margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '13px' },
  addItemPrice: { margin: '1px 0 0', color: '#94a3b8', fontSize: '11.5px' },
  addItemBtn: (deshabilitado) => ({
    padding: '6px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '7px',
    border: 'none', cursor: deshabilitado ? 'not-allowed' : 'pointer',
    background: deshabilitado ? '#e2e8f0' : '#10b981',
    color: deshabilitado ? '#94a3b8' : '#fff', fontFamily: 'inherit', flexShrink: 0,
  }),
  addEmptyState: { textAlign: 'center', color: '#94a3b8', fontSize: '12.5px', padding: '20px 0' },

  // ── Estados de carga / error ──
  centerState: {
    minHeight: '60vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '12px',
    color: '#94a3b8', fontSize: '14px',
  },
  spinner: {
    width: '28px', height: '28px', borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTopColor: '#6366f1',
    animation: 'girar 0.8s linear infinite',
  },
  retryBtn: {
    background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
  },

  // ── Modal de imagen ──
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'zoom-out', padding: '20px',
  },
  modalBox: {
    background: '#fff', borderRadius: '16px', padding: '20px',
    maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column',
    gap: '14px', boxShadow: '0 25px 60px rgba(0,0,0,0.35)', cursor: 'default',
  },
};

const EstiloGlobal = () => (
  <style>{`
    @keyframes girar { to { transform: rotate(360deg); } }
    @keyframes brillo { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  `}</style>
);

// Miniatura con manejo de carga/error individual, evita que un solo fallo rompa toda la fila
const Miniatura = ({ src, alt, onClick }) => {
  const [cargada, setCargada] = useState(false);
  const [fuente, setFuente] = useState(src);

  return (
    <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
      {!cargada && <div style={S.itemImgSkeleton} />}
      <img
        src={fuente}
        alt={alt}
        onClick={onClick}
        onLoad={() => setCargada(true)}
        onError={() => { setFuente(imagenFallback(alt)); setCargada(true); }}
        style={{ ...S.itemImg, position: 'absolute', top: 0, left: 0, display: cargada ? 'block' : 'none' }}
        onMouseEnter={e => { e.target.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; }}
      />
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const EditarPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});
  const [imagenModal, setImagenModal] = useState(null);

  // ── Agregar artículos ──
  const [inventario, setInventario]       = useState([]);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [busquedaInventario, setBusquedaInventario] = useState('');

  useEffect(() => { cargarPedido(); }, [id]);
  useEffect(() => { cargarInventario(); }, []);

  const cargarInventario = async () => {
    try {
      const data = await obtenerInventarioParaCotizar();
      setInventario(data);
    } catch (e) {
      console.error('No se pudo cargar el inventario para agregar artículos:', e);
    }
  };

  const cargarPedido = () => {
    setLoading(true);
    setError(null);
    authFetch(`${API_BASE_URL}/api/cotizaciones/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el pedido');
        return res.json();
      })
      .then(data => {
        setPedido(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('No pudimos cargar este pedido. Verifica tu conexión e intenta de nuevo.');
        setLoading(false);
      });
  };

  const recalcularTotales = (detalles) => {
    const nuevoTotal = detalles.reduce((acc, item) => acc + item.subtotal, 0);
    return nuevoTotal;
  };

  const manejarCambioCantidad = (index, nuevaCantidadStr) => {
    const detalle = pedido.detalles[index];
    const stockMax = Number(detalle.articuloAlquiler?.stockTotal ?? detalle.articuloAlquiler?.stockDisponible ?? Infinity);

    let nuevaCantidad = parseInt(nuevaCantidadStr, 10);
    if (Number.isNaN(nuevaCantidad)) nuevaCantidad = 0;
    if (nuevaCantidad < 0) nuevaCantidad = 0;

    const nuevosDetalles = [...pedido.detalles];
    nuevosDetalles[index] = {
      ...detalle,
      cantidad: nuevaCantidad,
      subtotal: nuevaCantidad * detalle.precioUnitario,
    };

    setPedido({ ...pedido, detalles: nuevosDetalles, total: recalcularTotales(nuevosDetalles) });

    // Validación de stock en vivo
    setErrores(prev => {
      const nuevos = { ...prev };
      if (stockMax !== Infinity && nuevaCantidad > stockMax) {
        nuevos[index] = `Solo hay ${stockMax} disponibles`;
      } else {
        delete nuevos[index];
      }
      return nuevos;
    });
  };

  const incrementar = (index) => {
    const actual = pedido.detalles[index].cantidad;
    manejarCambioCantidad(index, actual + 1);
  };

  const decrementar = (index) => {
    const actual = pedido.detalles[index].cantidad;
    if (actual > 0) manejarCambioCantidad(index, actual - 1);
  };

  const quitarArticulo = (index) => {
    const nuevosDetalles = pedido.detalles.filter((_, i) => i !== index);
    setPedido({ ...pedido, detalles: nuevosDetalles, total: recalcularTotales(nuevosDetalles) });
    setErrores(prev => {
      const nuevos = { ...prev };
      delete nuevos[index];
      return nuevos;
    });
  };

  // IDs de artículos ya presentes en el pedido, para no duplicar filas
  // (usa optional chaining porque este hook se ejecuta también en el primer
  // render, cuando "pedido" todavía es null mientras carga la petición)
  const idsEnPedido = useMemo(
    () => new Set((pedido?.detalles || []).map(d => d.articuloAlquiler?.id)),
    [pedido]
  );

  const inventarioFiltrado = useMemo(() => {
    const texto = busquedaInventario.trim().toLowerCase();
    return inventario.filter(item => {
      if (!texto) return true;
      return (
        item.nombre?.toLowerCase().includes(texto) ||
        item.descripcion?.toLowerCase().includes(texto)
      );
    });
  }, [inventario, busquedaInventario]);

  const agregarArticulo = (articulo) => {
    const stockMax = Number(articulo.stockTotal ?? articulo.stockDisponible ?? Infinity);
    const yaExiste = pedido.detalles.find(d => d.articuloAlquiler?.id === articulo.id);
    let nuevosDetalles;
    let indexAfectado;

    if (yaExiste) {
      const cantidadNueva = yaExiste.cantidad + 1;
      nuevosDetalles = pedido.detalles.map((d, i) => {
        if (d.articuloAlquiler?.id === articulo.id) {
          indexAfectado = i;
          return { ...d, cantidad: cantidadNueva, subtotal: cantidadNueva * d.precioUnitario };
        }
        return d;
      });

      if (stockMax !== Infinity && cantidadNueva > stockMax) {
        setErrores(prev => ({ ...prev, [indexAfectado]: `Solo hay ${stockMax} disponibles` }));
      }
    } else {
      const nuevoDetalle = {
        id: `nuevo-${articulo.id}-${Date.now()}`, // id temporal solo para key de React
        articuloAlquiler: articulo,
        cantidad: 1,
        precioUnitario: articulo.precioAlquiler,
        subtotal: articulo.precioAlquiler,
      };
      nuevosDetalles = [...pedido.detalles, nuevoDetalle];
    }

    setPedido({ ...pedido, detalles: nuevosDetalles, total: recalcularTotales(nuevosDetalles) });
  };

  const hayErroresDeStock = Object.keys(errores).length > 0;
  const hayArticulosEnCero = pedido?.detalles?.some(d => d.cantidad <= 0) ?? false;

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!pedido.fechaEvento) {
      alert('Selecciona la fecha del evento.');
      return;
    }
    if (pedido.detalles.length === 0) {
      alert('Tu pedido debe tener al menos un artículo. Si quieres cancelarlo por completo, hazlo desde "Mis pedidos".');
      return;
    }
    if (hayArticulosEnCero) {
      alert('Hay artículos con cantidad 0. Quítalos del pedido o ajusta la cantidad.');
      return;
    }
    if (hayErroresDeStock) {
      alert('Hay artículos que superan el stock disponible. Ajusta las cantidades antes de guardar.');
      return;
    }

    setGuardando(true);
    try {
      // Quita los ids temporales de los artículos recién agregados (el backend los asigna al crear)
      const payload = {
        ...pedido,
        detalles: pedido.detalles.map(d => {
          const esNuevo = typeof d.id === 'string' && d.id.startsWith('nuevo-');
          const { id: _descartado, ...resto } = d;
          return esNuevo
            ? { ...resto, articuloAlquiler: { id: d.articuloAlquiler.id } }
            : { ...d, articuloAlquiler: { id: d.articuloAlquiler.id } };
        }),
      };

      const response = await authFetch(`${API_BASE_URL}/api/cotizaciones/${id}`, {        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Pedido actualizado correctamente. El estado volvió a Pendiente.');
        navigate('/mis-pedidos');
      } else {
        alert('Ocurrió un error al actualizar el pedido. Intenta de nuevo.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // ── Estados de carga / error ──
  if (loading) {
    return (
      <div style={S.page}>
        <EstiloGlobal />
        <div style={S.centerState}>
          <div style={S.spinner} />
          <span>Cargando pedido...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={S.page}>
        <EstiloGlobal />
        <div style={S.centerState}>
          <span>{error}</span>
          <button style={S.retryBtn} onClick={cargarPedido}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!pedido) return null;

  return (
    <div style={S.page}>
      <EstiloGlobal />

      {/* ── Modal de imagen en grande ── */}
      {imagenModal && (
        <div style={S.modalOverlay} onClick={() => setImagenModal(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <img
              src={imagenModal.src}
              alt={imagenModal.nombre}
              style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '10px', border: '0.5px solid #e2e8f0', background: '#f8fafc' }}
              onError={e => { e.target.src = imagenFallback(imagenModal.nombre); }}
            />
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>
                {imagenModal.nombre}
              </p>
              <p style={{ margin: 0, color: '#059669', fontWeight: '700', fontSize: '17px' }}>
                {COP(imagenModal.precio)}
                <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '13px' }}> / unidad</span>
              </p>
              {imagenModal.descripcion && (
                <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>
                  {imagenModal.descripcion}
                </p>
              )}
            </div>
            <button
              onClick={() => setImagenModal(null)}
              style={{ alignSelf: 'flex-end', padding: '7px 20px', borderRadius: '8px', border: '0.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
            >Cerrar</button>
          </div>
        </div>
      )}

      <div style={S.wrap}>
        <button style={S.backBtn} onClick={() => navigate('/mis-pedidos')}>← Volver</button>
        <h1 style={S.pageTitle}>Editar pedido #{id}</h1>
        <p style={S.pageSubtitle}>Ajusta las cantidades o la fecha. Al guardar, el pedido volverá a estado Pendiente para una nueva revisión.</p>

        <form onSubmit={handleGuardar} style={{ display: 'grid', gap: '20px' }}>

          {/* ── Fecha del evento ── */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>Datos del evento</h3>
            <div style={S.fieldGroup}>
              <label style={S.label}>Fecha del evento</label>
              <input
                type="date"
                value={pedido.fechaEvento || ''}
                onChange={e => setPedido({ ...pedido, fechaEvento: e.target.value })}
                style={S.input}
                required
              />
            </div>
          </div>

          {/* ── Productos ── */}
          <div style={S.card}>
            <h3 style={S.cardTitle}>Productos ({pedido.detalles.length})</h3>

            {pedido.detalles.length === 0 ? (
              <p style={S.emptyDetails}>No quedan artículos en este pedido.</p>
            ) : (
              pedido.detalles.map((detalle, index) => {
                const articulo = detalle.articuloAlquiler || {};
                const imgSrc = articulo.fotoUrl || imagenFallback(articulo.nombre);
                const sinStock = !!errores[index];

                return (
                  <div key={detalle.id ?? index} style={S.itemRow(sinStock)}>
                    <Miniatura
                      src={imgSrc}
                      alt={articulo.nombre}
                      onClick={() => setImagenModal({
                        src: imgSrc,
                        nombre: articulo.nombre,
                        precio: detalle.precioUnitario,
                        descripcion: articulo.descripcion,
                      })}
                    />

                    <div style={S.itemInfo}>
                      <p style={S.itemName}>{articulo.nombre || 'Artículo'}</p>
                      <p style={S.itemUnitPrice}>{COP(detalle.precioUnitario)} / unidad</p>
                      {sinStock && <p style={S.stockWarning}>{errores[index]}</p>}
                    </div>

                    <div style={S.qtyControl}>
                      <button type="button" style={S.qtyBtn} onClick={() => decrementar(index)}>−</button>
                      <input
                        type="number"
                        min="0"
                        value={detalle.cantidad}
                        onChange={e => manejarCambioCantidad(index, e.target.value)}
                        style={{
                          ...S.qtyInput,
                          borderColor: sinStock ? '#ef4444' : '#cbd5e1',
                          color: sinStock ? '#ef4444' : '#0f172a',
                        }}
                      />
                      <button type="button" style={S.qtyBtn} onClick={() => incrementar(index)}>+</button>
                    </div>

                    <span style={S.itemSubtotal}>{COP(detalle.subtotal)}</span>

                    <button
                      type="button"
                      style={S.removeItemBtn}
                      onClick={() => quitarArticulo(index)}
                      onMouseEnter={e => { e.target.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.target.style.color = '#cbd5e1'; }}
                      title="Quitar artículo"
                    >×</button>
                  </div>
                );
              })
            )}

            <div style={S.totalBox}>
              <span style={S.totalLabel}>Total estimado</span>
              <span style={S.totalValue}>{COP(pedido.total)}</span>
            </div>

            {/* ── Agregar artículos ── */}
            <button
              type="button"
              style={S.addToggleBtn}
              onClick={() => setMostrarAgregar(v => !v)}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
            >
              {mostrarAgregar ? '− Ocultar catálogo' : '+ Agregar artículos'}
            </button>

            {mostrarAgregar && (
              <div style={S.addPanel}>
                <div style={S.addSearchWrap}>
                  <span style={S.addSearchIcon}>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar en el catálogo..."
                    value={busquedaInventario}
                    onChange={e => setBusquedaInventario(e.target.value)}
                    style={S.addSearchInput}
                  />
                </div>

                {inventario.length === 0 ? (
                  <p style={S.addEmptyState}>Cargando catálogo disponible...</p>
                ) : inventarioFiltrado.length === 0 ? (
                  <p style={S.addEmptyState}>No encontramos artículos que coincidan con tu búsqueda.</p>
                ) : (
                  <div style={S.addList}>
                    {inventarioFiltrado.map(item => {
                      const stock = Number(item.stockTotal ?? item.stockDisponible ?? 0);
                      const agotado = stock === 0;
                      const yaAgregado = idsEnPedido.has(item.id);

                      return (
                        <div key={item.id} style={S.addRow(yaAgregado)}>
                          <Miniatura
                            src={item.fotoUrl || imagenFallback(item.nombre)}
                            alt={item.nombre}
                            onClick={() => setImagenModal({
                              src: item.fotoUrl || imagenFallback(item.nombre),
                              nombre: item.nombre,
                              precio: item.precioAlquiler,
                              descripcion: item.descripcion,
                            })}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={S.addItemName}>{item.nombre}</p>
                            <p style={S.addItemPrice}>
                              {COP(item.precioAlquiler)} / unidad
                              {agotado && <span style={{ color: '#b91c1c', fontWeight: '600' }}> · Sin stock</span>}
                            </p>
                          </div>
                          <button
                            type="button"
                            style={S.addItemBtn(agotado)}
                            disabled={agotado}
                            onClick={() => agregarArticulo(item)}
                          >
                            {yaAgregado ? '+1 más' : 'Agregar'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Acciones ── */}
          <div style={S.actionsRow}>
            <button type="button" style={S.cancelLink} onClick={() => navigate('/mis-pedidos')}>
              Descartar
            </button>
            <button
              type="submit"
              style={S.submitBtn(guardando || hayErroresDeStock || pedido.detalles.length === 0)}
              disabled={guardando || hayErroresDeStock || pedido.detalles.length === 0}
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPedido;