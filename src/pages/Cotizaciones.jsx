import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCotizaciones, crearCotizacion, actualizarCotizacion, eliminarCotizacion, cambiarEstadoCotizacion } from '../services/cotizacionesService';

const API_USUARIOS = `${API_BASE_URL}/api/usuarios`;

const ESTADO_CONFIG = {
  Aprobado:  { bg: '#dcfce7', color: '#15803d', border: '#86efac', dot: '#22c55e', label: 'Aprobado' },
  Rechazado: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', dot: '#ef4444', label: 'Rechazado' },
  Pendiente: { bg: '#fef9c3', color: '#854d0e', border: '#fde047', dot: '#eab308', label: 'Pendiente' },
  Finalizado:{ bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd', dot: '#3b82f6', label: 'Finalizado' },
};

const S = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  // ── Stats bar ──────────────────────────────────────────
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  statCard: (accent) => ({
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px 20px',
    borderLeft: `3px solid ${accent}`,
  }),
  statNumber: { fontSize: '22px', fontWeight: '700', color: '#0f172a', lineHeight: 1 },
  statLabel: { fontSize: '11px', fontWeight: '500', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  // ── Main grid ──────────────────────────────────────────
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  // ── Form panel ─────────────────────────────────────────
  formCard: {
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  formHeader: (editing) => ({
    padding: '16px 20px',
    borderBottom: '0.5px solid #f1f5f9',
    background: editing ? '#fffbeb' : '#fafafa',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }),
  formDot: (editing) => ({
    width: '8px', height: '8px', borderRadius: '50%',
    background: editing ? '#f59e0b' : '#6366f1',
    flexShrink: 0,
  }),
  formTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 },
  formBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%', padding: '9px 12px', fontSize: '13px',
    border: '0.5px solid #cbd5e1', borderRadius: '8px',
    background: '#fff', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  btnPrimary: (editing) => ({
    padding: '10px 16px', background: editing ? '#f59e0b' : '#6366f1',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600', width: '100%',
    transition: 'opacity 0.15s',
  }),
  btnCancel: {
    padding: '9px 16px', background: 'transparent',
    border: '0.5px solid #cbd5e1', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', color: '#64748b',
    width: '100%', fontFamily: 'inherit',
  },
  // ── Table panel ────────────────────────────────────────
  tableCard: {
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
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
    padding: '10px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    background: '#fafafa', borderBottom: '0.5px solid #f1f5f9',
  },
  td: { padding: '14px 16px', borderBottom: '0.5px solid #f8fafc', verticalAlign: 'middle' },
  // ── Badge ──────────────────────────────────────────────
  badge: (cfg) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px',
    background: cfg.bg, color: cfg.color,
    border: `0.5px solid ${cfg.border}`,
    fontSize: '11px', fontWeight: '600',
  }),
  badgeDot: (cfg) => ({
    width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, flexShrink: 0,
  }),
  // ── Action buttons ─────────────────────────────────────
  actionsRow: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'nowrap' },
  actionBtn: (bg, color, border) => ({
    padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
    background: bg, color: color, border: `0.5px solid ${border}`,
    cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
    transition: 'opacity 0.1s',
  }),
  iconBtn: (bg, color) => ({
    width: '28px', height: '28px', borderRadius: '6px',
    background: bg, color: color, border: 'none',
    cursor: 'pointer', fontSize: '14px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }),
  divider: { width: '1px', height: '20px', background: '#e2e8f0', flexShrink: 0 },
};

const Cotizaciones = () => {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [usuariosDb, setUsuariosDb] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  const emptyForm = { fechaEvento: '', cantidadPersonas: '', usuario: { id: '' } };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      setCotizaciones(await obtenerCotizaciones());
      const res = await authFetch(API_USUARIOS);
      setUsuariosDb(await res.json());
    } catch (e) { console.error(e); }
  };

  // Stats derivadas
  const stats = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter(c => c.estado === 'Pendiente').length,
    aprobadas: cotizaciones.filter(c => c.estado === 'Aprobado').length,
    totalValor: cotizaciones.reduce((acc, c) => acc + Number(c.total || 0), 0),
  };

  const contactarClienteWhatsApp = (cot) => {
    const tel = cot.usuario?.telefono || cot.usuario?.celular;
    if (!tel) { alert('Este cliente no tiene número registrado.'); return; }
    const msg = `Hola ${cot.usuario.nombres}, te contactamos de Chicaeme SAS sobre tu cotización #${cot.id} para el ${cot.fechaEvento}.`;
    window.open(`https://wa.me/57${tel}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const manejarEstado = async (id, nuevoEstado, mensaje) => {
    if (!window.confirm(mensaje)) return;
    try {
      const res = await cambiarEstadoCotizacion(id, nuevoEstado);
      if (res.ok) cargarDatos();
      else alert('Error: ' + await res.text());
    } catch (err) { console.error(err); }
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
      if (res.ok) { cancelarEdicion(); cargarDatos(); }
      else alert('Error en la operación.');
    } catch (err) { console.error(err); }
  };

  const prepararEdicion = (cot) => {
    setModoEdicion(true); setIdEdicion(cot.id);
    setFormData({ fechaEvento: cot.fechaEvento, cantidadPersonas: cot.cantidadPersonas, usuario: { id: cot.usuario?.id ?? '' } });
  };

  const cancelarEdicion = () => { setModoEdicion(false); setIdEdicion(null); setFormData(emptyForm); };

  const manejarEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta cotización?')) return;
    const res = await eliminarCotizacion(id);
    if (res.ok) cargarDatos();
  };

  return (
    <div style={S.page}>

      {/* ── Barra de métricas ── */}
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

      {/* ── Grid principal ── */}
      <div style={S.mainGrid}>

        {/* ── Formulario ── */}
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
                  {usuariosDb.map(u => (
                    <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                  ))}
                </select>
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Fecha del evento</label>
                <input type="date" name="fechaEvento" value={formData.fechaEvento} onChange={manejarCambio} required style={S.input} />
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Cantidad de personas</label>
                <input type="number" name="cantidadPersonas" value={formData.cantidadPersonas} onChange={manejarCambio} required style={{ ...S.input, width: '100%' }} min="1" />
              </div>

              <button type="submit" style={S.btnPrimary(modoEdicion)}>
                {modoEdicion ? '💾 Guardar cambios' : '+ Generar cotización'}
              </button>
              {modoEdicion && (
                <button type="button" onClick={cancelarEdicion} style={S.btnCancel}>
                  Cancelar
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ── Tabla ── */}
        <div style={S.tableCard}>
          <div style={S.tableHeader}>
            <div>
              <p style={S.tableTitle}>Cotizaciones y Eventos</p>
              <p style={S.tableSubtitle}>{cotizaciones.length} registros en total</p>
            </div>
          </div>

          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>#</th>
                <th style={S.th}>Cliente / Fecha</th>
                <th style={S.th}>Total</th>
                <th style={S.th}>Estado</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cotizaciones.map(cot => {
                const cfg = ESTADO_CONFIG[cot.estado] ?? ESTADO_CONFIG.Pendiente;
                return (
                  <tr key={cot.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={S.td}>
                      <span style={{ fontWeight: '700', color: '#475569', fontSize: '12px' }}>#{cot.id}</span>
                    </td>

                    <td style={S.td}>
                      <span style={{ fontWeight: '600', color: '#0f172a', display: 'block' }}>
                        {cot.usuario?.nombres} {cot.usuario?.apellidos}
                      </span>
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>{cot.fechaEvento}</span>
                    </td>

                    <td style={S.td}>
                      <span style={{ fontWeight: '700', color: '#059669', fontSize: '14px' }}>
                        ${Number(cot.total).toLocaleString('es-CO')}
                      </span>
                    </td>

                    <td style={S.td}>
                      <span style={S.badge(cfg)}>
                        <span style={S.badgeDot(cfg)} />
                        {cfg.label}
                      </span>
                    </td>

                    <td style={{ ...S.td, textAlign: 'right' }}>
                      <div style={{ ...S.actionsRow, justifyContent: 'flex-end' }}>
                        {/* Acciones de estado */}
                        {cot.estado === 'Pendiente' && (
                          <>
                            <button
                              onClick={() => manejarEstado(cot.id, 'Aprobado', '¿Aprobar pedido? (Descontará stock)')}
                              style={S.actionBtn('#f0fdf4', '#15803d', '#86efac')}
                            >Aprobar</button>
                            <button
                              onClick={() => manejarEstado(cot.id, 'Rechazado', '¿Rechazar este pedido?')}
                              style={S.actionBtn('#fef2f2', '#b91c1c', '#fca5a5')}
                            >Rechazar</button>
                          </>
                        )}
                        {cot.estado === 'Aprobado' && (
                          <>
                            <button
                              onClick={() => manejarEstado(cot.id, 'Finalizado', '¿Finalizar evento?')}
                              style={S.actionBtn('#eff6ff', '#1d4ed8', '#93c5fd')}
                            >Finalizar</button>
                            <button
                              onClick={() => manejarEstado(cot.id, 'Pendiente', '¿Volver a Pendiente?')}
                              style={S.actionBtn('#fefce8', '#854d0e', '#fde047')}
                            >Pendiente</button>
                          </>
                        )}

                        {/* Separador */}
                        <div style={S.divider} />

                        {/* Botones icono */}
                        <button
                          onClick={() => contactarClienteWhatsApp(cot)}
                          title="Contactar por WhatsApp"
                          style={S.iconBtn('#dcfce7', '#15803d')}
                        >💬</button>

                        <button
                          onClick={() => navigate(`/admin/pedido/${cot.id}/productos`)}
                          title="Ver productos"
                          style={S.iconBtn('#eff6ff', '#1d4ed8')}
                        >🛍️</button>

                        <button
                          onClick={() => prepararEdicion(cot)}
                          title="Editar"
                          style={S.iconBtn('#f1f5f9', '#475569')}
                        >✏️</button>

                        <button
                          onClick={() => manejarEliminar(cot.id)}
                          title="Eliminar"
                          style={S.iconBtn('#fef2f2', '#b91c1c')}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {cotizaciones.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '13px' }}>
                    No hay cotizaciones registradas aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Cotizaciones;