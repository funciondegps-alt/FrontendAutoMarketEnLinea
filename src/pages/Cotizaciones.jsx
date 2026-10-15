import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  obtenerCotizaciones,
  crearCotizacion,
  actualizarCotizacion,
  eliminarCotizacion,
  cambiarEstadoCotizacion,
  confirmarEntrega,
  registrarDevolucion,
  marcarLavadoTerminado,
} from '../services/cotizacionesService';

const API_USUARIOS = `${API_BASE_URL}/api/usuarios`;

const ESTADO_CONFIG = {
  Pendiente: { bg: '#fef9c3', color: '#854d0e', border: '#fde047', dot: '#eab308', label: 'Pendiente' },
  Aprobado: { bg: '#dcfce7', color: '#15803d', border: '#86efac', dot: '#22c55e', label: 'Aprobado' },
  'En evento': { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc', dot: '#6366f1', label: 'En evento' },
  'En lavado': { bg: '#ffedd5', color: '#9a3412', border: '#fdba74', dot: '#f97316', label: 'En lavado' },
  Finalizado: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd', dot: '#3b82f6', label: 'Finalizado' },
  Rechazado: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', dot: '#ef4444', label: 'Rechazado' },
};

const EDITABLES = new Set(['Pendiente', 'Rechazado']);

const S = {
  page: { display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "'Inter', system-ui, sans-serif" },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  statCard: (accent) => ({
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    borderLeft: `3px solid ${accent}`,
  }),
  statNumber: { fontSize: '22px', fontWeight: '700', color: '#0f172a', lineHeight: 1 },
  statLabel: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  mainGrid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' },
  formCard: { background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  formHeader: (editing) => ({
    padding: '16px 20px',
    borderBottom: '0.5px solid #f1f5f9',
    background: editing ? '#fffbeb' : '#fafafa',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }),
  formDot: (editing) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: editing ? '#f59e0b' : '#6366f1',
  }),
  formTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 },
  formBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
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
  btnPrimary: (editing) => ({
    padding: '10px 16px',
    background: editing ? '#f59e0b' : '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    width: '100%',
  }),
  btnCancel: {
    padding: '9px 16px',
    background: 'transparent',
    border: '0.5px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#64748b',
    width: '100%',
    fontFamily: 'inherit',
  },
  tableCard: { background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: {
    padding: '16px 20px',
    borderBottom: '0.5px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 },
  tableSubtitle: { fontSize: '12px', color: '#94a3b8' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#fafafa',
    borderBottom: '0.5px solid #f1f5f9',
  },
  td: { padding: '14px 16px', borderBottom: '0.5px solid #f8fafc', verticalAlign: 'middle' },
  badge: (cfg) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    borderRadius: '20px',
    background: cfg.bg,
    color: cfg.color,
    border: `0.5px solid ${cfg.border}`,
    fontSize: '11px',
    fontWeight: '600',
  }),
  badgeDot: (cfg) => ({
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: cfg.dot,
    flexShrink: 0,
  }),
  actionsRow: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' },
  actionBtn: (bg, color, border) => ({
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    background: bg,
    color,
    border: `0.5px solid ${border}`,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  }),
  iconBtn: (bg, color) => ({
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: bg,
    color,
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  divider: { width: '1px', height: '20px', background: '#e2e8f0', flexShrink: 0 },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 16,
  },
  modal: {
    background: '#fff',
    borderRadius: 14,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
};

const emptyForm = {
  fechaEvento: '',
  fechaSalida: '',
  fechaRetorno: '',
  cantidadPersonas: '',
  usuario: { id: '' },
};

const Cotizaciones = () => {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [usuariosDb, setUsuariosDb] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [modalDevolucion, setModalDevolucion] = useState(null); // cotizacion completa
  const [lineasDev, setLineasDev] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCotizaciones(await obtenerCotizaciones());
      const res = await authFetch(API_USUARIOS);
      setUsuariosDb(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const stats = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter((c) => c.estado === 'Pendiente').length,
    aprobadas: cotizaciones.filter((c) => c.estado === 'Aprobado').length,
    totalValor: cotizaciones.reduce((acc, c) => acc + Number(c.total || 0), 0),
  };

  const contactarClienteWhatsApp = (cot) => {
    const tel = cot.usuario?.telefono || cot.usuario?.celular;
    if (!tel) {
      alert('Este cliente no tiene número registrado.');
      return;
    }
    const msg = `Hola ${cot.usuario.nombres}, te contactamos de Chicaeme SAS sobre tu cotización #${cot.id} para el ${cot.fechaEvento}.`;
    window.open(`https://wa.me/57${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const manejarEstado = async (id, nuevoEstado, mensaje) => {
    if (!window.confirm(mensaje)) return;
    try {
      const res = await cambiarEstadoCotizacion(id, nuevoEstado);
      if (res.ok) cargarDatos();
      else alert('Error: ' + (await res.text()));
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const onConfirmarEntrega = async (id) => {
    if (!window.confirm('¿Confirmar que el material se entregó? Pasará a "En evento".')) return;
    try {
      const res = await confirmarEntrega(id);
      if (res.ok) cargarDatos();
      else alert('Error: ' + (await res.text()) + '\n\nSi el backend aún no tiene este endpoint, hay que desplegar los .java del paquete anterior.');
    } catch (e) {
      console.error(e);
      alert('Error. ¿El backend tiene PUT /api/cotizaciones/{id}/confirmar-entrega?');
    }
  };

  const abrirDevolucion = (cot) => {
    const detalles = (cot.detalles || []).map((d) => ({
      id: d.id,
      nombre: d.articuloAlquiler?.nombre || d.servicio?.nombre || `Ítem #${d.id}`,
      cantidad: d.cantidad,
      cantidadDevueltaBuena: d.cantidad,
      cantidadDanada: 0,
      cantidadPerdida: 0,
    }));
    setLineasDev(detalles);
    setModalDevolucion(cot);
  };

  const guardarDevolucion = async (finalizar) => {
    for (const l of lineasDev) {
      const sum = Number(l.cantidadDevueltaBuena) + Number(l.cantidadDanada) + Number(l.cantidadPerdida);
      if (sum > l.cantidad) {
        alert(`En "${l.nombre}" las cantidades superan lo alquilado (${l.cantidad}).`);
        return;
      }
    }
    try {
      const payload = lineasDev.map((l) => ({
        id: l.id,
        cantidadDevueltaBuena: Number(l.cantidadDevueltaBuena) || 0,
        cantidadDanada: Number(l.cantidadDanada) || 0,
        cantidadPerdida: Number(l.cantidadPerdida) || 0,
      }));
      const res = await registrarDevolucion(modalDevolucion.id, payload, finalizar);
      if (res.ok) {
        setModalDevolucion(null);
        cargarDatos();
      } else {
        alert('Error: ' + (await res.text()));
      }
    } catch (e) {
      console.error(e);
      alert('Error al registrar devolución (¿endpoint en backend?)');
    }
  };

  const onLavadoTerminado = async (id) => {
    if (!window.confirm('¿Marcar lavado terminado? El pedido pasará a Finalizado.')) return;
    try {
      const res = await marcarLavadoTerminado(id);
      if (res.ok) cargarDatos();
      else alert('Error: ' + (await res.text()));
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === 'usuarioId') setFormData({ ...formData, usuario: { id: value } });
    else setFormData({ ...formData, [name]: value });
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    try {
      const res = modoEdicion
        ? await actualizarCotizacion(idEdicion, formData)
        : await crearCotizacion(formData);
      if (res.ok) {
        cancelarEdicion();
        cargarDatos();
      } else alert('Error: ' + (await res.text()));
    } catch (err) {
      console.error(err);
    }
  };

  const prepararEdicion = (cot) => {
    if (!EDITABLES.has(cot.estado)) {
      alert('Solo se puede editar en estado Pendiente o Rechazado. Si está Aprobado, recházala primero.');
      return;
    }
    setModoEdicion(true);
    setIdEdicion(cot.id);
    setFormData({
      fechaEvento: cot.fechaEvento || '',
      fechaSalida: cot.fechaSalida || '',
      fechaRetorno: cot.fechaRetorno || '',
      cantidadPersonas: cot.cantidadPersonas || '',
      usuario: { id: cot.usuario?.id ?? '' },
    });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setFormData(emptyForm);
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta cotización?')) return;
    const res = await eliminarCotizacion(id);
    if (res.ok) cargarDatos();
  };

  return (
    <div style={S.page}>
      <div style={S.statsRow}>
        <div style={S.statCard('#6366f1')}>
          <div style={S.statNumber}>{stats.total}</div>
          <div style={S.statLabel}>Total cotizaciones</div>
        </div>
        <div style={S.statCard('#eab308')}>
          <div style={S.statNumber}>{stats.pendientes}</div>
          <div style={S.statLabel}>Pendientes</div>
        </div>
        <div style={S.statCard('#22c55e')}>
          <div style={S.statNumber}>{stats.aprobadas}</div>
          <div style={S.statLabel}>Aprobadas</div>
        </div>
        <div style={S.statCard('#3b82f6')}>
          <div style={{ ...S.statNumber, fontSize: '18px' }}>
            ${stats.totalValor.toLocaleString('es-CO')}
          </div>
          <div style={S.statLabel}>Valor total</div>
        </div>
      </div>

      <div style={S.mainGrid}>
        <div style={S.formCard}>
          <div style={S.formHeader(modoEdicion)}>
            <div style={S.formDot(modoEdicion)} />
            <h2 style={S.formTitle}>
              {modoEdicion ? `Editar cotización #${idEdicion}` : 'Nueva cotización'}
            </h2>
          </div>
          <div style={S.formBody}>
            <form onSubmit={enviarFormulario} style={{ display: 'contents' }}>
              <div style={S.fieldGroup}>
                <label style={S.label}>Cliente</label>
                <select
                  name="usuarioId"
                  value={formData.usuario.id}
                  onChange={manejarCambio}
                  required
                  style={S.input}
                >
                  <option value="">Seleccionar cliente...</option>
                  {usuariosDb.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombres} {u.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Fecha del evento</label>
                <input
                  type="date"
                  name="fechaEvento"
                  value={formData.fechaEvento}
                  onChange={manejarCambio}
                  required
                  style={S.input}
                />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Fecha salida / entrega</label>
                <input
                  type="date"
                  name="fechaSalida"
                  value={formData.fechaSalida}
                  onChange={manejarCambio}
                  style={S.input}
                />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Fecha retorno</label>
                <input
                  type="date"
                  name="fechaRetorno"
                  value={formData.fechaRetorno}
                  onChange={manejarCambio}
                  style={S.input}
                />
              </div>
              <div style={S.fieldGroup}>
                <label style={S.label}>Cantidad de personas</label>
                <input
                  type="number"
                  name="cantidadPersonas"
                  value={formData.cantidadPersonas}
                  onChange={manejarCambio}
                  required
                  style={S.input}
                  min="1"
                />
              </div>
              <button type="submit" style={S.btnPrimary(modoEdicion)}>
                {modoEdicion ? 'Guardar cambios' : '+ Generar cotización'}
              </button>
              {modoEdicion && (
                <button type="button" onClick={cancelarEdicion} style={S.btnCancel}>
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>

        <div style={S.tableCard}>
          <div style={S.tableHeader}>
            <div>
              <p style={S.tableTitle}>Cotizaciones y Eventos</p>
              <p style={S.tableSubtitle}>{cotizaciones.length} registros en total</p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Cliente / Fechas</th>
                  <th style={S.th}>Total</th>
                  <th style={S.th}>Estado</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cotizaciones.map((cot) => {
                  const cfg = ESTADO_CONFIG[cot.estado] ?? ESTADO_CONFIG.Pendiente;
                  return (
                    <tr key={cot.id}>
                      <td style={S.td}>
                        <span style={{ fontWeight: '700', color: '#475569', fontSize: '12px' }}>
                          #{cot.id}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>
                          {cot.usuario?.nombres} {cot.usuario?.apellidos}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>
                          Evento: {cot.fechaEvento}
                        </span>
                        {(cot.fechaSalida || cot.fechaRetorno) && (
                          <span style={{ color: '#64748b', fontSize: '11px' }}>
                            {cot.fechaSalida ? `Salida ${cot.fechaSalida}` : ''}
                            {cot.fechaSalida && cot.fechaRetorno ? ' · ' : ''}
                            {cot.fechaRetorno ? `Retorno ${cot.fechaRetorno}` : ''}
                          </span>
                        )}
                      </td>
                      <td style={S.td}>
                        <span style={{ fontWeight: '700', color: '#059669', fontSize: '14px' }}>
                          ${Number(cot.total || 0).toLocaleString('es-CO')}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={S.badge(cfg)}>
                          <span style={S.badgeDot(cfg)} />
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <div style={S.actionsRow}>
                          {cot.estado === 'Pendiente' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  manejarEstado(cot.id, 'Aprobado', '¿Aprobar? Descontará stock.')
                                }
                                style={S.actionBtn('#f0fdf4', '#15803d', '#86efac')}
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() => manejarEstado(cot.id, 'Rechazado', '¿Rechazar?')}
                                style={S.actionBtn('#fef2f2', '#b91c1c', '#fca5a5')}
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {cot.estado === 'Aprobado' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onConfirmarEntrega(cot.id)}
                                style={S.actionBtn('#eef2ff', '#3730a3', '#a5b4fc')}
                              >
                                Confirmar entrega
                              </button>
                              <button
                                type="button"
                                onClick={() => manejarEstado(cot.id, 'Rechazado', '¿Rechazar y liberar stock?')}
                                style={S.actionBtn('#fef2f2', '#b91c1c', '#fca5a5')}
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {cot.estado === 'En evento' && (
                            <button
                              type="button"
                              onClick={() => abrirDevolucion(cot)}
                              style={S.actionBtn('#ffedd5', '#9a3412', '#fdba74')}
                            >
                              Registrar devolución
                            </button>
                          )}

                          {cot.estado === 'En lavado' && (
                            <button
                              type="button"
                              onClick={() => onLavadoTerminado(cot.id)}
                              style={S.actionBtn('#eff6ff', '#1d4ed8', '#93c5fd')}
                            >
                              Lavado terminado
                            </button>
                          )}

                          <div style={S.divider} />

                          <button
                            type="button"
                            onClick={() => contactarClienteWhatsApp(cot)}
                            title="WhatsApp"
                            style={S.iconBtn('#dcfce7', '#15803d')}
                          >
                            💬
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/pedido/${cot.id}/productos`)}
                            title="Productos"
                            style={S.iconBtn('#eff6ff', '#1d4ed8')}
                          >
                            🛍️
                          </button>
                          {EDITABLES.has(cot.estado) && (
                            <button
                              type="button"
                              onClick={() => prepararEdicion(cot)}
                              title="Editar"
                              style={S.iconBtn('#f1f5f9', '#475569')}
                            >
                              ✏️
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => manejarEliminar(cot.id)}
                            title="Eliminar"
                            style={S.iconBtn('#fef2f2', '#b91c1c')}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {cotizaciones.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ ...S.td, textAlign: 'center', padding: 48, color: '#94a3b8' }}>
                      No hay cotizaciones registradas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalDevolucion && (
        <div style={S.modalOverlay} onClick={() => setModalDevolucion(null)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17 }}>Devolución — pedido #{modalDevolucion.id}</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Indica cuántas unidades volvieron bien, dañadas o perdidas. Solo las buenas regresan al stock.
            </p>
            {lineasDev.map((l, idx) => (
              <div
                key={l.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                  {l.nombre} <span style={{ color: '#94a3b8' }}>(alquiladas: {l.cantidad})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div>
                    <label style={S.label}>Buenas</label>
                    <input
                      type="number"
                      min="0"
                      max={l.cantidad}
                      value={l.cantidadDevueltaBuena}
                      onChange={(e) => {
                        const next = [...lineasDev];
                        next[idx] = { ...l, cantidadDevueltaBuena: e.target.value };
                        setLineasDev(next);
                      }}
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Dañadas</label>
                    <input
                      type="number"
                      min="0"
                      max={l.cantidad}
                      value={l.cantidadDanada}
                      onChange={(e) => {
                        const next = [...lineasDev];
                        next[idx] = { ...l, cantidadDanada: e.target.value };
                        setLineasDev(next);
                      }}
                      style={S.input}
                    />
                  </div>
                  <div>
                    <label style={S.label}>Perdidas</label>
                    <input
                      type="number"
                      min="0"
                      max={l.cantidad}
                      value={l.cantidadPerdida}
                      onChange={(e) => {
                        const next = [...lineasDev];
                        next[idx] = { ...l, cantidadPerdida: e.target.value };
                        setLineasDev(next);
                      }}
                      style={S.input}
                    />
                  </div>
                </div>
              </div>
            ))}
            {lineasDev.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>
                Este pedido no tiene detalles cargados. Abre productos del pedido primero.
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => guardarDevolucion(false)}
                style={S.actionBtn('#ffedd5', '#9a3412', '#fdba74')}
              >
                Guardar → En lavado
              </button>
              <button
                type="button"
                onClick={() => guardarDevolucion(true)}
                style={S.actionBtn('#eff6ff', '#1d4ed8', '#93c5fd')}
              >
                Guardar y finalizar
              </button>
              <button type="button" onClick={() => setModalDevolucion(null)} style={S.btnCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cotizaciones;
