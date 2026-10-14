import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { obtenerCotizaciones } from '../services/cotizacionesService';

const API_USUARIOS = `${API_BASE_URL}/api/usuarios`;

// ─── Tokens ──────────────────────────────────────────────────────────────────
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const ESTADO_PIE = [
  { key: 'Pendiente',  color: '#f59e0b' },
  { key: 'Aprobado',   color: '#10b981' },
  { key: 'Finalizado', color: '#3b82f6' },
  { key: 'Rechazado',  color: '#ef4444' },
];

const AVATAR_PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

const ROL_CONFIG = {
  Administrador: { bg: '#f3e8ff', color: '#7e22ce' },
  Cliente:       { bg: '#dcfce7', color: '#15803d' },
  Staff:         { bg: '#dbeafe', color: '#1d4ed8' },
};

const COP = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const initials = (u) =>
  `${u.nombres?.[0] ?? ''}${u.apellidos?.[0] ?? ''}`.toUpperCase();

// ─── Subcomponents ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div style={{
    background: '#fff',
    border: '0.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '18px 20px',
    borderLeft: `3px solid ${accent}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontFamily: FONT,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: accent + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px',
      }}>
        {icon}
      </div>
    </div>
    <div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
          {sub}
        </div>
      )}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e2e8f0',
      borderRadius: '8px', padding: '10px 14px',
      fontSize: '13px', fontFamily: FONT,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <div style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}>{label}</div>
      <div style={{ color: '#0f172a', fontWeight: '600' }}>
        {typeof val === 'number' && val > 999 ? COP(val) : val}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const Inicio = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [usuarios, setUsuarios]         = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([cargarCotizaciones(), cargarUsuarios()]).finally(() => setLoading(false));
  }, []);

  const cargarCotizaciones = async () => {
    try {
      const data = await obtenerCotizaciones();
      setCotizaciones(data);
    } catch (e) { console.error(e); }
  };

  const cargarUsuarios = async () => {
    try {
      const res  = await authFetch(API_USUARIOS);
      const data = await res.json();
      setTotalUsuarios(data.length);
      // Últimos 5 más recientes
      setUsuarios([...data].reverse().slice(0, 5));
    } catch (e) { console.error(e); }
  };

  // ── Métricas derivadas ──
  const ingresoConfirmado = cotizaciones
    .filter(c => c.estado === 'Aprobado' || c.estado === 'Finalizado')
    .reduce((s, c) => s + Number(c.total || 0), 0);

  const pendientes  = cotizaciones.filter(c => c.estado === 'Pendiente').length;
  const aprobadas   = cotizaciones.filter(c => c.estado === 'Aprobado').length;
  const finalizadas = cotizaciones.filter(c => c.estado === 'Finalizado').length;
  const rechazadas  = cotizaciones.filter(c => c.estado === 'Rechazado').length;

  // Bar chart: últimas 8 cotizaciones con total > 0
  const dataBar = cotizaciones
    .filter(c => Number(c.total) > 0)
    .slice(-8)
    .map(c => ({ name: `#${c.id}`, total: Number(c.total) }));

  // Pie chart: distribución de estados (solo los que tienen valor)
  const dataPie = ESTADO_PIE
    .map(e => ({ name: e.key, value: cotizaciones.filter(c => c.estado === e.key).length, color: e.color }))
    .filter(d => d.value > 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontFamily: FONT, gap: '10px', fontSize: '14px' }}>
      <span style={{ fontSize: '20px' }}>⏳</span> Cargando dashboard...
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: FONT }}>

      {/* ── Header ── */}
      <div>
        <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Panel de control
        </p>
        <h2 style={{ margin: '4px 0 0', fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
          Dashboard
        </h2>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <StatCard
          label="Ingresos confirmados"
          value={COP(ingresoConfirmado)}
          sub="Aprobados + Finalizados"
          accent="#6366f1"
          icon="💰"
        />
        <StatCard
          label="Cotizaciones"
          value={cotizaciones.length}
          sub={`${aprobadas} aprobadas · ${finalizadas} finalizadas`}
          accent="#10b981"
          icon="📋"
        />
        <StatCard
          label="Pendientes"
          value={pendientes}
          sub="Requieren revisión"
          accent="#f59e0b"
          icon="⏳"
        />
        <StatCard
          label="Usuarios registrados"
          value={totalUsuarios}
          sub={`${totalUsuarios > 0 ? totalUsuarios : '—'} en total`}
          accent="#0ea5e9"
          icon="👥"
        />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        {/* Bar chart */}
        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: '12px', padding: '22px' }}>
          <div style={{ marginBottom: '18px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ingresos
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
              Por cotización (últimas 8)
            </p>
          </div>
          {dataBar.length === 0 ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Sin datos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dataBar} barCategoryGap="38%">
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: FONT }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: FONT }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={42} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#6366f108' }} />
                <Bar dataKey="total" fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: '12px', padding: '22px' }}>
          <div style={{ marginBottom: '18px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Distribución
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
              Estado de cotizaciones
            </p>
          </div>
          {dataPie.length === 0 ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Sin datos aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataPie} dataKey="value" nameKey="name"
                  cx="50%" cy="44%" outerRadius={82} innerRadius={46} paddingAngle={3}
                >
                  {dataPie.map((d, i) => <Cell key={i} fill={d.color} strokeWidth={0} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={7}
                  formatter={v => <span style={{ fontSize: '12px', color: '#64748b', fontFamily: FONT }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Resumen rápido de estados ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Pendientes',  value: pendientes,  accent: '#f59e0b', bg: '#fef9c3' },
          { label: 'Aprobadas',   value: aprobadas,   accent: '#10b981', bg: '#dcfce7' },
          { label: 'Finalizadas', value: finalizadas, accent: '#3b82f6', bg: '#dbeafe' },
          { label: 'Rechazadas',  value: rechazadas,  accent: '#ef4444', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} style={{
            background: s.bg,
            border: `0.5px solid ${s.accent}30`,
            borderRadius: '10px', padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: s.accent }}>{s.label}</span>
            <span style={{ fontSize: '20px', fontWeight: '800', color: s.accent }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Usuarios recientes ── */}
      <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: '0.5px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Usuarios
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
              Registros recientes
            </p>
          </div>
          <a
            href="/admin/usuarios"
            style={{ fontSize: '12px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Ver todos →
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {usuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
              Sin usuarios registrados
            </div>
          ) : usuarios.map((u, i) => {
            const rolCfg = ROL_CONFIG[u.tipoUsuario] ?? { bg: '#f1f5f9', color: '#475569' };
            const avatarColor = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
            return (
              <div
                key={u.id}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 20px', borderBottom: '0.5px solid #f8fafc', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar */}
                {u.imagen ? (
                  <img
                    src={u.imagen}
                    alt={u.nombres}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #e2e8f0', flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: avatarColor + '20', color: avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                  }}>
                    {initials(u)}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.nombres} {u.apellidos}
                  </p>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.email}
                  </p>
                </div>

                {/* Rol badge */}
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px',
                  borderRadius: '20px', flexShrink: 0,
                  background: rolCfg.bg, color: rolCfg.color,
                }}>
                  {u.tipoUsuario}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Inicio;