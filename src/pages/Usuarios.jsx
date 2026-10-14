import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import { solicitarRecuperacion } from '../services/authService';
import SubidaImagen from '../components/SubidaImagen';
import React, { useState, useEffect } from 'react';

const API_URL = `${API_BASE_URL}/api/usuarios`;

const ROL_CONFIG = {
  Administrador: { bg: '#f3e8ff', color: '#7e22ce', border: '#d8b4fe', dot: '#a855f7' },
  Cliente:       { bg: '#dcfce7', color: '#15803d', border: '#86efac', dot: '#22c55e' },
  Staff:         { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd', dot: '#3b82f6' },
};

const S = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    minWidth: 0,
  },
  // ── Stats ──
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
  // ── Grid ──
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '300px minmax(0, 1fr)',
    gap: '20px',
    alignItems: 'start',
    minWidth: 0,
  },
  // ── Form ──
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
  formBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%', padding: '9px 12px', fontSize: '13px',
    border: '0.5px solid #cbd5e1', borderRadius: '8px',
    background: '#fff', color: '#0f172a', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  btnPrimary: (editing) => ({
    padding: '10px 16px',
    background: editing ? '#f59e0b' : '#6366f1',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    width: '100%', fontFamily: 'inherit',
  }),
  btnCancel: {
    padding: '9px 16px', background: 'transparent',
    border: '0.5px solid #cbd5e1', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', color: '#64748b',
    width: '100%', fontFamily: 'inherit',
  },
  // ── Table ──
  tableCard: {
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    minWidth: 0,
  },
  tableScroll: {
    overflowX: 'auto',
    width: '100%',
  },
  tableHeader: {
    padding: '16px 20px',
    borderBottom: '0.5px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableTitle: { fontSize: '14px', fontWeight: '600', color: '#0f172a', margin: 0 },
  tableSubtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: {
    padding: '10px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: '600', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    background: '#fafafa', borderBottom: '0.5px solid #f1f5f9',
  },
  td: { padding: '14px 16px', borderBottom: '0.5px solid #f8fafc', verticalAlign: 'middle' },
  badge: (cfg) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '3px 10px', borderRadius: '20px',
    background: cfg.bg, color: cfg.color,
    border: `0.5px solid ${cfg.border}`,
    fontSize: '11px', fontWeight: '600',
  }),
  badgeDot: (cfg) => ({
    width: '5px', height: '5px', borderRadius: '50%',
    background: cfg.dot, flexShrink: 0,
  }),
  iconBtn: (bg, color, border) => ({
    padding: '5px 10px', borderRadius: '6px',
    fontSize: '11px', fontWeight: '600',
    background: bg, color: color,
    border: `0.5px solid ${border ?? 'transparent'}`,
    cursor: 'pointer', fontFamily: 'inherit',
  }),
  reloadBtn: {
    padding: '6px 14px', borderRadius: '8px',
    fontSize: '12px', fontWeight: '600',
    background: '#f1f5f9', color: '#475569',
    border: '0.5px solid #e2e8f0', cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

const emptyForm = {
  nombres: '', apellidos: '', direccion: '', ciudad: '',
  telefono: '', email: '', password: '', tipoUsuario: '', imagen: '',
};

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [avatarModal, setAvatarModal] = useState(null); // { src, nombre }
  const [enviandoReset, setEnviandoReset] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await authFetch(API_URL);
      setUsuarios(await res.json());
    } catch (e) { console.error(e); }
  };

  const manejarCambio = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const enviarFormulario = async (e) => {
    e.preventDefault();
    try {
      const url = modoEdicion ? `${API_URL}/${idEdicion}` : API_URL;
      const res = await authFetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) { cancelarEdicion(); cargarUsuarios(); }
      else alert('Error en la operación. Revisa los datos.');
    } catch (e) { console.error(e); }
  };

  const prepararEdicion = (u) => {
    setModoEdicion(true);
    setIdEdicion(u.id);
    setResetEnviado(false);
    setFormData({
      nombres: u.nombres, apellidos: u.apellidos,
      direccion: u.direccion, ciudad: u.ciudad,
      telefono: u.telefono, email: u.email,
      password: '', tipoUsuario: u.tipoUsuario,
      imagen: u.imagen || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // El admin ya no escribe contraseñas ajenas a mano: dispara el mismo correo
  // de recuperación que usa cualquier usuario que olvidó su contraseña.
  const enviarResetPassword = async () => {
    setEnviandoReset(true);
    try {
      await solicitarRecuperacion(formData.email);
      setResetEnviado(true);
    } catch (e) {
      alert('No se pudo enviar el enlace. Intenta de nuevo.');
    } finally {
      setEnviandoReset(false);
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false); setIdEdicion(null); setFormData(emptyForm); setResetEnviado(false);
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    await authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarUsuarios();
  };

  // Stats
  const admins  = usuarios.filter(u => u.tipoUsuario === 'Administrador').length;
  const clientes = usuarios.filter(u => u.tipoUsuario === 'Cliente').length;
  const staff   = usuarios.filter(u => u.tipoUsuario === 'Staff').length;

  return (
    <div style={S.page}>

      {/* ── Modal avatar ── */}
      {avatarModal && (
        <div
          onClick={() => setAvatarModal(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '16px',
              padding: '24px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '14px', maxWidth: '340px', width: '90%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={avatarModal.src}
              alt={avatarModal.nombre}
              style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e2e8f0' }}
            />
            <p style={{ margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>{avatarModal.nombre}</p>
            <button
              onClick={() => setAvatarModal(null)}
              style={{ padding: '7px 20px', borderRadius: '8px', border: '0.5px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
            >Cerrar</button>
          </div>
        </div>
      )}

      {/* ── Métricas ── */}
      <div style={S.statsRow}>
        <div style={S.statCard('#6366f1')}>
          <div style={S.statNumber}>{usuarios.length}</div>
          <div style={S.statLabel}>Total usuarios</div>
        </div>
        <div style={S.statCard('#a855f7')}>
          <div style={S.statNumber}>{admins}</div>
          <div style={S.statLabel}>Administradores</div>
        </div>
        <div style={S.statCard('#22c55e')}>
          <div style={S.statNumber}>{clientes}</div>
          <div style={S.statLabel}>Clientes</div>
        </div>
        <div style={S.statCard('#3b82f6')}>
          <div style={S.statNumber}>{staff}</div>
          <div style={S.statLabel}>Staff</div>
        </div>
      </div>

      {/* ── Grid principal ── */}
      <div style={S.mainGrid}>

        {/* ── Formulario ── */}
        <div style={S.formCard}>
          <div style={S.formHeader(modoEdicion)}>
            <div style={S.formDot(modoEdicion)} />
            <h2 style={S.formTitle}>
              {modoEdicion ? `Editando usuario #${idEdicion}` : 'Nuevo usuario'}
            </h2>
          </div>

          <div style={S.formBody}>
            <form onSubmit={enviarFormulario} style={{ display: 'contents' }}>

              <div style={S.twoCol}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Nombres</label>
                  <input name="nombres" value={formData.nombres} onChange={manejarCambio} required style={S.input} placeholder="Ej: Juan" />
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Apellidos</label>
                  <input name="apellidos" value={formData.apellidos} onChange={manejarCambio} required style={S.input} placeholder="Ej: Pérez" />
                </div>
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Dirección</label>
                <input name="direccion" value={formData.direccion} onChange={manejarCambio} required style={S.input} placeholder="Calle 123 # 45-67" />
              </div>

              <div style={S.twoCol}>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Ciudad</label>
                  <input name="ciudad" value={formData.ciudad} onChange={manejarCambio} required style={S.input} placeholder="Bogotá" />
                </div>
                <div style={S.fieldGroup}>
                  <label style={S.label}>Teléfono</label>
                  <input name="telefono" value={formData.telefono} onChange={manejarCambio} required style={S.input} placeholder="300 000 0000" />
                </div>
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Correo electrónico</label>
                <input type="email" name="email" value={formData.email} onChange={manejarCambio} required style={S.input} placeholder="correo@ejemplo.com" />
              </div>

              {!modoEdicion && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Contraseña</label>
                  <input type="password" name="password" value={formData.password} onChange={manejarCambio} required minLength={8} style={S.input} placeholder="Mínimo 8 caracteres" />
                </div>
              )}

              {modoEdicion && (
                <div style={S.fieldGroup}>
                  <label style={S.label}>Contraseña</label>
                  {resetEnviado ? (
                    <div style={{ fontSize: '13px', color: '#15803d', padding: '9px 12px', background: '#f0fdf4', borderRadius: '8px' }}>
                      ✓ Enlace enviado a {formData.email}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={enviarResetPassword}
                      disabled={enviandoReset}
                      style={{ ...S.btnCancel, textAlign: 'left', cursor: enviandoReset ? 'not-allowed' : 'pointer' }}
                    >
                      {enviandoReset ? 'Enviando...' : '✉️ Enviar enlace para restablecer contraseña'}
                    </button>
                  )}
                </div>
              )}

              <div style={S.fieldGroup}>
                <SubidaImagen
                  label="Foto de perfil"
                  value={formData.imagen}
                  onChange={(url) => setFormData({ ...formData, imagen: url })}
                />
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Rol</label>
                <select name="tipoUsuario" value={formData.tipoUsuario} onChange={manejarCambio} required style={{ ...S.input, background: '#fff' }}>
                  <option value="">Seleccionar rol...</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <button type="submit" style={S.btnPrimary(modoEdicion)}>
                {modoEdicion ? '💾 Guardar cambios' : '+ Crear usuario'}
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
              <p style={S.tableTitle}>Directorio de Usuarios</p>
              <p style={S.tableSubtitle}>{usuarios.length} usuarios registrados</p>
            </div>
            <button onClick={cargarUsuarios} style={S.reloadBtn}>↻ Recargar</button>
          </div>

          <div style={S.tableScroll}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, minWidth: '180px' }}>Usuario</th>
                <th style={{ ...S.th, minWidth: '180px' }}>Contacto</th>
                <th style={{ ...S.th, minWidth: '140px' }}>Ubicación</th>
                <th style={{ ...S.th, minWidth: '110px' }}>Rol</th>
                <th style={{ ...S.th, textAlign: 'right', minWidth: '140px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...S.td, textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    No hay usuarios registrados aún.
                  </td>
                </tr>
              ) : (
                usuarios.map(u => {
                  const rolCfg = ROL_CONFIG[u.tipoUsuario] ?? ROL_CONFIG.Cliente;
                  const avatarUrl = u.imagen
                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombres + ' ' + u.apellidos)}&background=random&color=fff&size=80`;

                  return (
                    <tr
                      key={u.id}
                      style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Usuario */}
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={avatarUrl}
                            alt={u.nombres}
                            title="Ver foto"
                            onClick={() => setAvatarModal({ src: avatarUrl, nombre: `${u.nombres} ${u.apellidos}` })}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #e2e8f0', flexShrink: 0, cursor: 'zoom-in', transition: 'transform 0.15s, box-shadow 0.15s' }}
                            onMouseEnter={e => { e.target.style.transform = 'scale(1.1)'; e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
                            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombres)}&background=6366f1&color=fff`; }}
                          />
                          <div>
                            <p style={{ fontWeight: '600', color: '#0f172a', margin: 0, fontSize: '13px' }}>
                              {u.nombres} {u.apellidos}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>ID #{u.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td style={S.td}>
                        <p style={{ margin: 0, color: '#334155', fontSize: '12px' }}>{u.email}</p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px' }}>{u.telefono}</p>
                      </td>

                      {/* Ubicación */}
                      <td style={S.td}>
                        <p style={{ margin: 0, color: '#334155', fontSize: '12px' }}>{u.ciudad || '—'}</p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.direccion || ''}
                        </p>
                      </td>

                      {/* Rol */}
                      <td style={S.td}>
                        <span style={S.badge(rolCfg)}>
                          <span style={S.badgeDot(rolCfg)} />
                          {u.tipoUsuario}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ ...S.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => prepararEdicion(u)}
                            style={S.iconBtn('#fffbeb', '#92400e', '#fde047')}
                          >✏️ Editar</button>
                          <button
                            onClick={() => eliminarUsuario(u.id)}
                            style={S.iconBtn('#fef2f2', '#b91c1c', '#fca5a5')}
                          >🗑️ Borrar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuarios;