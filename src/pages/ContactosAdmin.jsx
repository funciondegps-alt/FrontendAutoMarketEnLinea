import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useState, useEffect, useMemo } from 'react';

const TIPOS = ['Consulta General', 'Cotización', 'Soporte', 'Otro'];

const ContactosAdmin = () => {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroOrigen, setFiltroOrigen] = useState(''); // '', 'logueado', 'anonimo'

  const [seleccionado, setSeleccionado] = useState(null); // contacto en modal de detalle
  const [eliminando, setEliminando] = useState(null); // id en proceso de borrado
  const [confirmarEliminar, setConfirmarEliminar] = useState(null); // id pendiente de confirmar

  const fetchContactos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(`${API_BASE_URL}/api/contactos`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Más recientes primero
        const ordenados = [...data.contactos].sort(
          (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );
        setContactos(ordenados);
      } else {
        setError(data.error || 'No se pudieron cargar los contactos.');
      }
    } catch (e) {
      console.error(e);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  const handleEliminar = async (id) => {
    try {
      setEliminando(id);
      const res = await authFetch(`${API_BASE_URL}/api/contactos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setContactos((prev) => prev.filter((c) => c.id !== id));
        if (seleccionado?.id === id) setSeleccionado(null);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'No se pudo eliminar el contacto.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al eliminar.');
    } finally {
      setEliminando(null);
      setConfirmarEliminar(null);
    }
  };

  const contactosFiltrados = useMemo(() => {
    return contactos.filter((c) => {
      const matchBusqueda =
        busqueda.trim() === '' ||
        c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono?.toLowerCase().includes(busqueda.toLowerCase());

      const matchTipo = filtroTipo === '' || c.tipoContacto === filtroTipo;

      const matchOrigen =
        filtroOrigen === '' ||
        (filtroOrigen === 'logueado' && c.usuario != null) ||
        (filtroOrigen === 'anonimo' && c.usuario == null);

      return matchBusqueda && matchTipo && matchOrigen;
    });
  }, [contactos, busqueda, filtroTipo, filtroOrigen]);

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return '—';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const styles = {
    page: { fontFamily: "'Inter', system-ui, sans-serif" },
    headerRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '12px',
    },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '2px' },
    headerTitle: { fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: 0 },
    headerSubtitle: { fontSize: '13px', color: '#64748B', margin: 0 },
    toolbar: {
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      marginBottom: '18px',
    },
    input: {
      padding: '9px 12px',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'inherit',
      background: '#fff',
      color: '#0F172A',
      outline: 'none',
      minWidth: '220px',
    },
    select: {
      padding: '9px 12px',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'inherit',
      background: '#fff',
      color: '#0F172A',
      outline: 'none',
      cursor: 'pointer',
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      background: '#F8FAFC',
      color: '#64748B',
      fontWeight: '600',
      fontSize: '11px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      borderBottom: '1px solid #E2E8F0',
    },
    td: {
      padding: '13px 16px',
      borderBottom: '1px solid #F1F5F9',
      color: '#1E293B',
      verticalAlign: 'middle',
    },
    rowHover: { cursor: 'pointer' },
    badgeTipo: {
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      background: '#EEF2FF',
      color: '#4F46E5',
      whiteSpace: 'nowrap',
    },
    badgeOrigenLogueado: {
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      background: '#ECFDF5',
      color: '#059669',
      whiteSpace: 'nowrap',
    },
    badgeOrigenAnonimo: {
      display: 'inline-block',
      padding: '3px 9px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      background: '#F1F5F9',
      color: '#64748B',
      whiteSpace: 'nowrap',
    },
    actionBtn: {
      background: 'none',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      padding: '5px 9px',
      fontSize: '12px',
      cursor: 'pointer',
      color: '#64748B',
      marginRight: '6px',
    },
    deleteBtn: {
      background: 'none',
      border: '1px solid #FCA5A5',
      borderRadius: '6px',
      padding: '5px 9px',
      fontSize: '12px',
      cursor: 'pointer',
      color: '#EF4444',
    },
    emptyState: {
      padding: '60px 20px',
      textAlign: 'center',
      color: '#94A3B8',
      fontSize: '14px',
    },
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      background: '#fff',
      borderRadius: '14px',
      maxWidth: '560px',
      width: '100%',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #F1F5F9',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    modalBody: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' },
    modalField: { display: 'flex', flexDirection: 'column', gap: '4px' },
    modalLabel: { fontSize: '11px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' },
    modalValue: { fontSize: '14px', color: '#0F172A' },
    modalMensaje: { fontSize: '14px', color: '#1E293B', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #F1F5F9' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '20px', lineHeight: 1, padding: '2px' },
    modalFooter: { padding: '16px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    confirmRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div style={styles.headerLeft}>
          <p style={styles.headerTitle}>
            {contactosFiltrados.length} contacto{contactosFiltrados.length !== 1 ? 's' : ''}
            {filtroTipo || filtroOrigen || busqueda ? ' (filtrados)' : ''}
          </p>
          <p style={styles.headerSubtitle}>Mensajes recibidos a través del formulario de contacto</p>
        </div>
        <button
          style={{ ...styles.actionBtn, padding: '8px 14px' }}
          onClick={fetchContactos}
          disabled={loading}
        >
          {loading ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </div>

      <div style={styles.toolbar}>
        <input
          style={styles.input}
          placeholder="Buscar por nombre, email o teléfono…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select style={styles.select} value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select style={styles.select} value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)}>
          <option value="">Logueados y anónimos</option>
          <option value="logueado">Solo logueados</option>
          <option value="anonimo">Solo anónimos</option>
        </select>
      </div>

      <div style={styles.card}>
        {error && (
          <div style={{ padding: '16px 24px', color: '#B91C1C', fontSize: '13px', background: '#FEE2E2' }}>
            ✗ {error}
          </div>
        )}

        {!error && loading && (
          <div style={styles.emptyState}>Cargando contactos…</div>
        )}

        {!error && !loading && contactosFiltrados.length === 0 && (
          <div style={styles.emptyState}>
            {contactos.length === 0
              ? 'Todavía no has recibido ningún mensaje de contacto.'
              : 'Ningún contacto coincide con los filtros aplicados.'}
          </div>
        )}

        {!error && !loading && contactosFiltrados.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Origen</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contactosFiltrados.map((c) => (
                <tr key={c.id} style={styles.rowHover}>
                  <td style={styles.td}>{formatearFecha(c.fechaCreacion)}</td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '600' }}>{c.nombre}</div>
                    {c.asunto && (
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{c.asunto}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div>{c.email}</div>
                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{c.telefono}</div>
                  </td>
                  <td style={styles.td}>
                    {c.tipoContacto ? (
                      <span style={styles.badgeTipo}>{c.tipoContacto}</span>
                    ) : (
                      <span style={{ color: '#CBD5E1', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {c.usuario ? (
                      <span style={styles.badgeOrigenLogueado}>Logueado</span>
                    ) : (
                      <span style={styles.badgeOrigenAnonimo}>Anónimo</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => setSeleccionado(c)}>
                      Ver
                    </button>
                    {confirmarEliminar === c.id ? (
                      <span style={styles.confirmRow}>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>¿Seguro?</span>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleEliminar(c.id)}
                          disabled={eliminando === c.id}
                        >
                          {eliminando === c.id ? '…' : 'Sí'}
                        </button>
                        <button style={styles.actionBtn} onClick={() => setConfirmarEliminar(null)}>
                          No
                        </button>
                      </span>
                    ) : (
                      <button style={styles.deleteBtn} onClick={() => setConfirmarEliminar(c.id)}>
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalle */}
      {seleccionado && (
        <div style={styles.modalOverlay} onClick={() => setSeleccionado(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{seleccionado.nombre}</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                  {formatearFecha(seleccionado.fechaCreacion)}
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setSeleccionado(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {seleccionado.tipoContacto && (
                  <span style={styles.badgeTipo}>{seleccionado.tipoContacto}</span>
                )}
                {seleccionado.usuario ? (
                  <span style={styles.badgeOrigenLogueado}>Usuario logueado (ID {seleccionado.usuario.id})</span>
                ) : (
                  <span style={styles.badgeOrigenAnonimo}>Contacto anónimo</span>
                )}
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Email</span>
                <span style={styles.modalValue}>{seleccionado.email}</span>
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Teléfono</span>
                <span style={styles.modalValue}>{seleccionado.telefono}</span>
              </div>

              {seleccionado.asunto && (
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Asunto</span>
                  <span style={styles.modalValue}>{seleccionado.asunto}</span>
                </div>
              )}

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Mensaje</span>
                <div style={styles.modalMensaje}>{seleccionado.mensaje}</div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.actionBtn} onClick={() => setSeleccionado(null)}>
                Cerrar
              </button>
              <button
                style={styles.deleteBtn}
                onClick={() => {
                  setConfirmarEliminar(seleccionado.id);
                  setSeleccionado(null);
                }}
              >
                Eliminar contacto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactosAdmin;