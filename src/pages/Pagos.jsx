import React, { useEffect, useState } from 'react';
import { obtenerCotizaciones } from '../services/cotizacionesService';
import { obtenerPagos, registrarPago, marcarCredito } from '../services/pagosService';

const COP = (n) =>
  Number(n || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

const badgePago = (estado) => {
  const map = {
    'Sin pago': { bg: '#f1f5f9', color: '#64748b' },
    Parcial: { bg: '#fef9c3', color: '#854d0e' },
    Pagado: { bg: '#dcfce7', color: '#15803d' },
    Credito: { bg: '#dbeafe', color: '#1e40af' },
    Vencido: { bg: '#fee2e2', color: '#b91c1c' },
  };
  const s = map[estado] || map['Sin pago'];
  return {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    background: s.bg,
    color: s.color,
  };
};

const Pagos = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { cotizacion }
  const [form, setForm] = useState({
    monto: '',
    metodoPago: 'Transferencia',
    comprobantePago: '',
    notas: '',
    fechaPago: new Date().toISOString().slice(0, 10),
  });
  const [msg, setMsg] = useState(null);

  const cargar = async () => {
    setLoading(true);
    try {
      const [cots, pags] = await Promise.all([
        obtenerCotizaciones(),
        obtenerPagos().catch(() => []),
      ]);
      setCotizaciones(Array.isArray(cots) ? cots : []);
      setPagos(Array.isArray(pags) ? pags : []);
    } catch (e) {
      console.error(e);
      setMsg('Error cargando datos de pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const conSaldo = cotizaciones.filter((c) => {
    const saldo = (c.total || 0) - (c.montoPagado || 0);
    if (filtro === 'por_cobrar') return saldo > 0;
    if (filtro === 'pagados') return (c.estadoPago || '') === 'Pagado';
    if (filtro === 'vencidos') return (c.estadoPago || '') === 'Vencido';
    if (filtro === 'parcial') return (c.estadoPago || '') === 'Parcial';
    return true;
  });

  const totalPorCobrar = cotizaciones.reduce(
    (s, c) => s + Math.max(0, (c.total || 0) - (c.montoPagado || 0)),
    0
  );
  const totalVencido = cotizaciones
    .filter((c) => c.estadoPago === 'Vencido')
    .reduce((s, c) => s + Math.max(0, (c.total || 0) - (c.montoPagado || 0)), 0);

  const abrirRegistrar = (c) => {
    setModal(c);
    setForm({
      monto: '',
      metodoPago: 'Transferencia',
      comprobantePago: '',
      notas: '',
      fechaPago: new Date().toISOString().slice(0, 10),
    });
  };

  const enviarPago = async (e) => {
    e.preventDefault();
    if (!modal) return;
    try {
      await registrarPago({
        monto: Number(form.monto),
        metodoPago: form.metodoPago,
        comprobantePago: form.comprobantePago || null,
        notas: form.notas || null,
        fechaPago: form.fechaPago,
        cotizacion: { id: modal.id },
      });
      setModal(null);
      setMsg('Pago registrado');
      await cargar();
    } catch (err) {
      alert(err.message || 'Error al registrar pago');
    }
  };

  const marcarComoCredito = async (c) => {
    const fecha = prompt('Fecha de vencimiento (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
    if (!fecha) return;
    try {
      await marcarCredito(c.id, fecha);
      setMsg('Marcado como crédito');
      await cargar();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 32, color: '#64748b' }}>Cargando pagos…</div>;
  }

  return (
    <div style={{ padding: '24px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#0f172a' }}>Pagos y cuentas por cobrar</h2>
      <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>
        Abonos por pedido, saldos y créditos.
      </p>

      {msg && (
        <div
          style={{
            background: '#dcfce7',
            color: '#15803d',
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}

      {/* Tarjetas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={cardStyle}>
          <div style={cardLabel}>Por cobrar</div>
          <div style={cardValue}>{COP(totalPorCobrar)}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardLabel}>Vencidos</div>
          <div style={{ ...cardValue, color: '#b91c1c' }}>{COP(totalVencido)}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardLabel}>Pedidos</div>
          <div style={cardValue}>{cotizaciones.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={cardLabel}>Abonos registrados</div>
          <div style={cardValue}>{pagos.length}</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          ['todos', 'Todos'],
          ['por_cobrar', 'Por cobrar'],
          ['parcial', 'Parciales'],
          ['pagados', 'Pagados'],
          ['vencidos', 'Vencidos'],
        ].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFiltro(k)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: filtro === k ? '1px solid #6366f1' : '1px solid #e2e8f0',
              background: filtro === k ? '#eef2ff' : '#fff',
              color: filtro === k ? '#4338ca' : '#64748b',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
              <th style={th}>#</th>
              <th style={th}>Cliente</th>
              <th style={th}>Total</th>
              <th style={th}>Pagado</th>
              <th style={th}>Saldo</th>
              <th style={th}>Estado pago</th>
              <th style={th}>Vence</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conSaldo.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                  No hay registros con este filtro
                </td>
              </tr>
            )}
            {conSaldo.map((c) => {
              const saldo = Math.max(0, (c.total || 0) - (c.montoPagado || 0));
              const nombre =
                c.usuario
                  ? `${c.usuario.nombres || ''} ${c.usuario.apellidos || ''}`.trim()
                  : '—';
              return (
                <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={td}>#{c.id}</td>
                  <td style={td}>{nombre}</td>
                  <td style={td}>{COP(c.total)}</td>
                  <td style={td}>{COP(c.montoPagado)}</td>
                  <td style={{ ...td, fontWeight: 700, color: saldo > 0 ? '#b91c1c' : '#15803d' }}>
                    {COP(saldo)}
                  </td>
                  <td style={td}>
                    <span style={badgePago(c.estadoPago || 'Sin pago')}>
                      {c.estadoPago || 'Sin pago'}
                    </span>
                  </td>
                  <td style={td}>{c.fechaVencimientoPago || '—'}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {saldo > 0 && (
                        <button type="button" style={btnPrimary} onClick={() => abrirRegistrar(c)}>
                          Registrar pago
                        </button>
                      )}
                      {saldo > 0 && c.estadoPago !== 'Credito' && (
                        <button type="button" style={btnGhost} onClick={() => marcarComoCredito(c)}>
                          Crédito
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal registrar pago */}
      {modal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 16,
          }}
          onClick={() => setModal(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={enviarPago}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 24,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>Registrar pago</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Pedido #{modal.id} — saldo {COP(Math.max(0, (modal.total || 0) - (modal.montoPagado || 0)))}
            </p>

            <label style={label}>Monto *</label>
            <input
              required
              type="number"
              min="1"
              step="1"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              style={input}
            />

            <label style={label}>Método *</label>
            <select
              value={form.metodoPago}
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
              style={input}
            >
              <option>Transferencia</option>
              <option>Efectivo</option>
              <option>Consignacion</option>
              <option>Cheque</option>
              <option>Otro</option>
            </select>

            <label style={label}>Fecha</label>
            <input
              type="date"
              value={form.fechaPago}
              onChange={(e) => setForm({ ...form, fechaPago: e.target.value })}
              style={input}
            />

            <label style={label}>Comprobante / referencia</label>
            <input
              value={form.comprobantePago}
              onChange={(e) => setForm({ ...form, comprobantePago: e.target.value })}
              style={input}
              placeholder="Nº transferencia, etc."
            />

            <label style={label}>Notas</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
              style={{ ...input, minHeight: 70 }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="submit" style={{ ...btnPrimary, flex: 1, padding: '10px 14px' }}>
                Guardar pago
              </button>
              <button type="button" style={btnGhost} onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: '14px 16px',
};
const cardLabel = { fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' };
const cardValue = { fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 4 };
const th = { padding: '12px 14px', fontSize: 11, color: '#64748b', fontWeight: 600 };
const td = { padding: '12px 14px', color: '#0f172a' };
const label = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', margin: '10px 0 4px' };
const input = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  fontSize: 13,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
const btnPrimary = {
  background: '#6366f1',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};
const btnGhost = {
  background: '#f1f5f9',
  color: '#475569',
  border: 'none',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

export default Pagos;
