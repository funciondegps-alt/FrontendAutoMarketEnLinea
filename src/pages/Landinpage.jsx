import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerArticulos } from '../services/articulosService';

// ─── Google Fonts loader ──────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body { font-family: 'Inter', sans-serif; background: #FAFAF8; color: #0F172A; }

    /* ── Navbar ── */
    .chi-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 6vw; height: 68px;
      background: rgba(250,250,248,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 0.5px solid #E2E8F0;
      transition: box-shadow 0.2s;
    }
    .chi-nav.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
    .chi-nav-logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700; color: #0F172A;
      text-decoration: none; letter-spacing: -0.3px;
    }
    .chi-nav-logo span { color: #059669; }
    .chi-nav-links {
      display: flex; align-items: center; gap: 32px; list-style: none;
    }
    .chi-nav-links a {
      font-size: 14px; font-weight: 500; color: #475569;
      text-decoration: none; transition: color 0.15s;
    }
    .chi-nav-links a:hover { color: #059669; }
    .chi-btn-primary {
      padding: 9px 20px; background: #059669; color: #fff;
      border: none; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
      transition: background 0.15s;
      text-decoration: none; display: inline-flex; align-items: center;
    }
    .chi-btn-primary:hover { background: #047857; }
    .chi-btn-outline {
      padding: 9px 20px; background: transparent; color: #059669;
      border: 1.5px solid #059669; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
      transition: all 0.15s; text-decoration: none;
      display: inline-flex; align-items: center;
    }
    .chi-btn-outline:hover { background: #059669; color: #fff; }

    /* ── User dropdown ── */
    .chi-user-btn {
      display: flex; align-items: center; gap: 8px;
      background: none; border: 0.5px solid #E2E8F0; border-radius: 24px;
      padding: 4px 12px 4px 4px; cursor: pointer; position: relative;
      font-family: 'Inter', sans-serif; transition: border-color 0.15s;
    }
    .chi-user-btn:hover { border-color: #059669; }
    .chi-avatar {
      width: 32px; height: 32px; border-radius: 50%; background: #059669;
      color: #fff; font-size: 13px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .chi-user-name { font-size: 13px; font-weight: 600; color: #0F172A; }
    .chi-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: #fff; border: 0.5px solid #E2E8F0; border-radius: 12px;
      padding: 6px; min-width: 180px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.10);
      animation: dropIn 0.15s ease;
    }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    .chi-dropdown-item {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 12px; border-radius: 8px; cursor: pointer;
      font-size: 13px; font-weight: 500; color: #334155;
      transition: background 0.1s; border: none; background: none;
      font-family: 'Inter', sans-serif; width: 100%; text-align: left;
    }
    .chi-dropdown-item:hover { background: #F8FAFC; }
    .chi-dropdown-item.danger { color: #B91C1C; }
    .chi-dropdown-item.danger:hover { background: #FEF2F2; }
    .chi-dropdown-divider { height: 0.5px; background: #F1F5F9; margin: 4px 0; }

    /* ── Badge notificación ── */
    .chi-badge {
      position: absolute; top: -4px; right: -4px;
      background: #10B981; color: #fff; font-size: 10px; font-weight: 700;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid #FAFAF8;
    }

    /* ── Hero ── */
    .chi-hero {
      padding-top: 68px; min-height: 100vh;
      display: flex; align-items: center;
      background: #FAFAF8;
      position: relative; overflow: hidden;
    }
    .chi-hero-pattern {
      position: absolute; inset: 0;
      background-image:
        repeating-linear-gradient(45deg, #05966910 0, #05966910 1px, transparent 0, transparent 50%),
        repeating-linear-gradient(-45deg, #05966910 0, #05966910 1px, transparent 0, transparent 50%);
      background-size: 28px 28px;
      opacity: 0.55;
    }
    .chi-hero-inner {
      position: relative; max-width: 1180px; margin: 0 auto;
      padding: 80px 6vw; display: grid;
      grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    }
    .chi-hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      background: #ECFDF5; color: #059669; border: 0.5px solid #6EE7B7;
      border-radius: 20px; padding: 5px 14px;
      font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
      margin-bottom: 20px;
    }
    .chi-hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(36px, 5vw, 58px); font-weight: 700;
      color: #0F172A; line-height: 1.12; letter-spacing: -1px;
      margin-bottom: 20px;
    }
    .chi-hero-title em { color: #059669; font-style: normal; }
    .chi-hero-desc {
      font-size: 16px; line-height: 1.7; color: #475569;
      margin-bottom: 32px; max-width: 440px;
    }
    .chi-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .chi-hero-btn-main {
      padding: 14px 28px; background: #059669; color: #fff;
      border: none; border-radius: 10px; cursor: pointer;
      font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 16px rgba(5,150,105,0.28);
      transition: background 0.15s, transform 0.1s;
    }
    .chi-hero-btn-main:hover { background: #047857; transform: translateY(-1px); }
    .chi-hero-btn-sec {
      padding: 14px 28px; background: transparent; color: #0F172A;
      border: 1.5px solid #CBD5E1; border-radius: 10px; cursor: pointer;
      font-size: 15px; font-weight: 600; font-family: 'Inter', sans-serif;
      transition: border-color 0.15s;
    }
    .chi-hero-btn-sec:hover { border-color: #059669; color: #059669; }
    .chi-hero-stats {
      display: flex; gap: 28px; margin-top: 40px; padding-top: 32px;
      border-top: 0.5px solid #E2E8F0;
    }
    .chi-stat-item {}
    .chi-stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 28px; font-weight: 700; color: #0F172A; line-height: 1;
    }
    .chi-stat-lbl { font-size: 12px; color: #94A3B8; margin-top: 3px; font-weight: 500; }

    /* Hero visual */
    .chi-hero-visual {
      display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    }
    .chi-hero-card {
      background: #fff; border: 0.5px solid #E2E8F0; border-radius: 16px;
      overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .chi-hero-card:nth-child(1) { grid-column: span 2; }
    .chi-hero-card img { width: 100%; height: 160px; object-fit: cover; display: block; }
    .chi-hero-card:nth-child(1) img { height: 200px; }
    .chi-hero-card-body { padding: 10px 14px 12px; }
    .chi-hero-card-name { font-size: 13px; font-weight: 600; color: #0F172A; }
    .chi-hero-card-price { font-size: 12px; color: #059669; font-weight: 600; margin-top: 2px; }

    /* ── Sección artículos ── */
    .chi-section { padding: 80px 6vw; max-width: 1180px; margin: 0 auto; }
    .chi-section-eyebrow {
      font-size: 11px; font-weight: 700; color: #059669; letter-spacing: 0.1em;
      text-transform: uppercase; margin-bottom: 10px;
    }
    .chi-section-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(26px, 3.5vw, 38px); font-weight: 700;
      color: #0F172A; letter-spacing: -0.5px; line-height: 1.2;
    }
    .chi-section-sub {
      font-size: 15px; color: #64748B; margin-top: 10px; max-width: 520px; line-height: 1.6;
    }
    .chi-section-header {
      display: flex; justify-content: space-between; align-items: flex-end;
      margin-bottom: 40px; flex-wrap: wrap; gap: 16px;
    }
    .chi-products-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;
    }
    .chi-product-card {
      background: #fff; border: 0.5px solid #E2E8F0; border-radius: 16px;
      overflow: hidden; transition: box-shadow 0.2s, transform 0.2s;
      cursor: pointer;
    }
    .chi-product-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10); transform: translateY(-3px); }
    .chi-product-card img {
      width: 100%; height: 180px; object-fit: cover; display: block;
      transition: transform 0.3s;
    }
    .chi-product-card:hover img { transform: scale(1.04); }
    .chi-product-img-wrap { overflow: hidden; position: relative; }
    .chi-product-body { padding: 16px 18px 18px; }
    .chi-product-name { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 4px; }
    .chi-product-desc {
      font-size: 12px; color: #64748B; line-height: 1.5; margin-bottom: 12px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .chi-product-footer { display: flex; justify-content: space-between; align-items: center; }
    .chi-product-price { font-size: 16px; font-weight: 700; color: #059669; }
    .chi-product-price-lbl { font-size: 11px; color: #94A3B8; font-weight: 400; }
    .chi-add-btn {
      padding: 7px 14px; background: #F0FDF4; color: #059669;
      border: 1px solid #6EE7B7; border-radius: 8px;
      font-size: 12px; font-weight: 600; cursor: pointer;
      font-family: 'Inter', sans-serif; transition: all 0.15s;
    }
    .chi-add-btn:hover { background: #059669; color: #fff; border-color: #059669; }

    /* ── Divider ── */
    .chi-divider { width: 100%; height: 0.5px; background: #E2E8F0; }
    .chi-full-section { background: #F1FDF7; }

    /* ── Por qué nosotros ── */
    .chi-why-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;
      margin-top: 40px;
    }
    .chi-why-card {
      background: #fff; border: 0.5px solid #E2E8F0; border-radius: 14px;
      padding: 28px 24px; text-align: center;
    }
    .chi-why-icon {
      width: 52px; height: 52px; border-radius: 14px; background: #ECFDF5;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; margin: 0 auto 16px;
    }
    .chi-why-title { font-size: 15px; font-weight: 700; color: #0F172A; margin-bottom: 8px; }
    .chi-why-desc { font-size: 13px; color: #64748B; line-height: 1.6; }

    /* ── CTA central ── */
    .chi-cta-section {
      background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%);
      padding: 80px 6vw; text-align: center; position: relative; overflow: hidden;
    }
    .chi-cta-section::before {
      content: ''; position: absolute; inset: 0;
      background-image: repeating-linear-gradient(45deg, #ffffff08 0, #ffffff08 1px, transparent 0, transparent 50%),
                        repeating-linear-gradient(-45deg, #ffffff08 0, #ffffff08 1px, transparent 0, transparent 50%);
      background-size: 24px 24px;
    }
    .chi-cta-inner { position: relative; max-width: 600px; margin: 0 auto; }
    .chi-cta-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(28px, 4vw, 44px); font-weight: 700; color: #fff;
      line-height: 1.15; margin-bottom: 16px;
    }
    .chi-cta-title span { color: #6EE7B7; }
    .chi-cta-desc { font-size: 16px; color: #94A3B8; margin-bottom: 32px; line-height: 1.6; }
    .chi-cta-btn {
      padding: 15px 36px; background: #059669; color: #fff;
      border: none; border-radius: 10px; cursor: pointer;
      font-size: 15px; font-weight: 700; font-family: 'Inter', sans-serif;
      box-shadow: 0 4px 20px rgba(5,150,105,0.4);
      transition: background 0.15s, transform 0.1s;
    }
    .chi-cta-btn:hover { background: #047857; transform: translateY(-2px); }

    /* ── Nosotros ── */
    .chi-about-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
    }
    .chi-about-img-wrap {
      border-radius: 20px; overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.12);
      aspect-ratio: 4/3;
    }
    .chi-about-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .chi-about-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
    .chi-tag {
      padding: 5px 14px; background: #F1F5F9; border-radius: 20px;
      font-size: 12px; font-weight: 600; color: #475569;
    }
    .chi-tag.green { background: #ECFDF5; color: #059669; }

    /* ── Footer ── */
    .chi-footer {
      background: #0F172A; color: #94A3B8;
      padding: 60px 6vw 28px;
    }
    .chi-footer-grid {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
      max-width: 1180px; margin: 0 auto 40px; padding-bottom: 40px;
      border-bottom: 0.5px solid #1E293B;
    }
    .chi-footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 12px;
    }
    .chi-footer-logo span { color: #059669; }
    .chi-footer-desc { font-size: 13px; line-height: 1.7; color: #64748B; max-width: 240px; }
    .chi-footer-col-title { font-size: 12px; font-weight: 700; color: #fff; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; }
    .chi-footer-links { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .chi-footer-links a { font-size: 13px; color: #64748B; text-decoration: none; transition: color 0.15s; }
    .chi-footer-links a:hover { color: #059669; }
    .chi-footer-bottom {
      max-width: 1180px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; color: #475569; flex-wrap: wrap; gap: 8px;
    }
    .chi-footer-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #1E293B; padding: 4px 12px; border-radius: 20px;
      font-size: 11px; color: #64748B;
    }

    /* ── Loader artículos ── */
    .chi-skeleton {
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
      border-radius: 8px;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* ── Modal imagen ── */
    .chi-modal-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.75);
      display: flex; align-items: center; justify-content: center; padding: 20px;
      cursor: zoom-out;
    }
    .chi-modal-box {
      background: #fff; border-radius: 16px; padding: 20px;
      max-width: 500px; width: 100%; cursor: default;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3);
      display: flex; flex-direction: column; gap: 14px;
    }
    .chi-modal-box img {
      width: 100%; max-height: 340px; object-fit: contain;
      border-radius: 10px; border: 0.5px solid #E2E8F0;
      background: #F8FAFC;
    }

    @media (max-width: 900px) {
      .chi-hero-inner { grid-template-columns: 1fr; }
      .chi-hero-visual { display: none; }
      .chi-about-grid { grid-template-columns: 1fr; }
      .chi-footer-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .chi-nav-links { display: none; }
      .chi-footer-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

const COP = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

// ─── Componente principal ─────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario]         = useState(null);
  const [aprobados, setAprobados]     = useState(0);
  const [articulos, setArticulos]     = useState([]);
  const [cargando, setCargando]       = useState(true);
  const [scrolled, setScrolled]       = useState(false);
  const [dropdown, setDropdown]       = useState(false);
  const [modal, setModal]             = useState(null);
  const dropRef                       = useRef(null);

  useEffect(() => {
    // Cargar sesión
    const raw = localStorage.getItem('usuarioChicaeme');
    if (raw) {
      const user = JSON.parse(raw);
      setUsuario(user);
      authFetch(`${API_BASE_URL}/api/cotizaciones/usuario/${user.id}`)
        .then(r => r.ok ? r.json() : [])
        .then(d => setAprobados(d.filter(c => c.estado === 'Aprobado').length))
        .catch(() => {});
    }

    // Cargar artículos
    obtenerArticulos()
      .then(data => setArticulos(data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setCargando(false));

    // Scroll listener
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    // Cerrar dropdown al click fuera
    const onClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioChicaeme');
    setUsuario(null);
    setDropdown(false);
  };

  const initials = (u) =>
    `${u.nombres?.[0] ?? ''}${u.apellidos?.[0] ?? ''}`.toUpperCase();

  // Misma regla que usan Login, Registro y RutaProtegida
  const esAdmin = ['administrador', 'admin'].includes(
    (usuario?.tipoUsuario || '').trim().toLowerCase()
  );

  // Artículos destacados para el hero (primeros 3)
  const heroArticulos = articulos.slice(0, 3);

  return (
    <>
      <FontLoader />

      {/* ── Modal imagen ── */}
      {modal && (
        <div className="chi-modal-overlay" onClick={() => setModal(null)}>
          <div className="chi-modal-box" onClick={e => e.stopPropagation()}>
            <img src={modal.src} alt={modal.nombre}
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(modal.nombre)}&background=e2e8f0&color=64748b`; }} />
            <div>
              <p style={{ fontWeight: 700, color: '#0F172A', fontSize: '15px', margin: '0 0 3px' }}>{modal.nombre}</p>
              <p style={{ fontWeight: 700, color: '#059669', fontSize: '18px', margin: 0 }}>
                {COP(modal.precio)} <span style={{ color: '#94A3B8', fontWeight: 400, fontSize: '13px' }}>/unidad</span>
              </p>
              {modal.desc && <p style={{ color: '#64748B', fontSize: '13px', marginTop: 8, lineHeight: 1.6 }}>{modal.desc}</p>}
            </div>
            <button onClick={() => setModal(null)}
              style={{ alignSelf: 'flex-end', padding: '7px 20px', borderRadius: '8px', border: '0.5px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ NAVBAR ═══ */}
      <nav className={`chi-nav${scrolled ? ' scrolled' : ''}`}>
        <a href="/" className="chi-nav-logo">Chicaeme<span>.</span></a>

        <ul className="chi-nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#catalogo">Alquileres</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {esAdmin && (
            <button className="chi-btn-outline" onClick={() => navigate('/admin')}>
              Panel de administración
            </button>
          )}
          {usuario ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button className="chi-user-btn" onClick={() => setDropdown(d => !d)}>
                {usuario.imagen
                  ? <img src={usuario.imagen} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  : <div className="chi-avatar">{initials(usuario)}</div>
                }
                <span className="chi-user-name">{usuario.nombres}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: '#94A3B8', transition: 'transform 0.15s', transform: dropdown ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {aprobados > 0 && <span className="chi-badge">{aprobados}</span>}
              </button>

              {dropdown && (
                <div className="chi-dropdown">
                  <div style={{ padding: '10px 12px 8px' }}>
                    <p style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px', margin: 0 }}>{usuario.nombres} {usuario.apellidos}</p>
                    <p style={{ color: '#94A3B8', fontSize: '11px', margin: '2px 0 0' }}>{usuario.email}</p>
                  </div>
                  <div className="chi-dropdown-divider" />
                  <button className="chi-dropdown-item" onClick={() => { navigate('/mis-pedidos'); setDropdown(false); }}>
                    📋 Mis solicitudes {aprobados > 0 && <span style={{ marginLeft: 'auto', background: '#10B981', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '20px' }}>{aprobados}</span>}
                  </button>
                  <button className="chi-dropdown-item" onClick={() => { navigate('/mis-pedidos'); setDropdown(false); }}>
                    📦 Mis pedidos
                  </button>
                  <button className="chi-dropdown-item" onClick={() => { navigate('/perfil'); setDropdown(false); }}>
                    ✏️ Editar perfil
                  </button>
                  <div className="chi-dropdown-divider" />
                  <button className="chi-dropdown-item danger" onClick={cerrarSesion}>
                    → Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="chi-btn-outline" onClick={() => navigate('/login')}>Ingresar</button>
              <button className="chi-btn-primary" onClick={() => navigate('/login')}>Solicitar ahora</button>
            </>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ HERO ═══ */}
      <section className="chi-hero" id="inicio">
        <div className="chi-hero-pattern" />
        <div className="chi-hero-inner">
          {/* Copy */}
          <div>
            <div className="chi-hero-eyebrow">
              <span>●</span> Alquiler para eventos en Colombia
            </div>
            <h1 className="chi-hero-title">
              Tu evento merece <em>lucir perfecto</em>
            </h1>
            <p className="chi-hero-desc">
              Alquilamos mobiliario, vajilla, decoración y más para bodas, grados, empresariales y todo tipo de celebraciones. Entregamos y recogemos.
            </p>
            <div className="chi-hero-actions">
              <button className="chi-hero-btn-main" onClick={() => navigate('/catalogo')}>
                Ver catálogo completo
              </button>
              <button className="chi-hero-btn-sec" onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })}>
                Conocer más
              </button>
            </div>
            <div className="chi-hero-stats">
              <div className="chi-stat-item">
                <div className="chi-stat-num">500+</div>
                <div className="chi-stat-lbl">Artículos disponibles</div>
              </div>
              <div className="chi-stat-item">
                <div className="chi-stat-num">300+</div>
                <div className="chi-stat-lbl">Eventos realizados</div>
              </div>
              <div className="chi-stat-item">
                <div className="chi-stat-num">100%</div>
                <div className="chi-stat-lbl">Entrega garantizada</div>
              </div>
            </div>
          </div>

          {/* Visual preview de artículos */}
          <div className="chi-hero-visual">
            {cargando ? (
              [0,1,2].map(i => (
                <div key={i} className="chi-hero-card" style={{ gridColumn: i === 0 ? 'span 2' : undefined }}>
                  <div className="chi-skeleton" style={{ height: i === 0 ? 200 : 160 }} />
                  <div className="chi-hero-card-body">
                    <div className="chi-skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} />
                    <div className="chi-skeleton" style={{ height: 10, width: '40%' }} />
                  </div>
                </div>
              ))
            ) : heroArticulos.map((a, i) => {
              const src = a.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nombre)}&background=e2e8f0&color=94a3b8&size=200`;
              return (
                <div key={a.id} className="chi-hero-card" style={{ gridColumn: i === 0 ? 'span 2' : undefined }}>
                  <img src={src} alt={a.nombre}
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nombre)}&background=e2e8f0&color=64748b`; }} />
                  <div className="chi-hero-card-body">
                    <div className="chi-hero-card-name">{a.nombre}</div>
                    <div className="chi-hero-card-price">{COP(a.precioAlquiler)} / unidad</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ CATÁLOGO ═══ */}
      <div className="chi-divider" />
      <section id="catalogo" style={{ padding: '80px 0', background: '#fff' }}>
        <div className="chi-section">
          <div className="chi-section-header">
            <div>
              <p className="chi-section-eyebrow">Catálogo</p>
              <h2 className="chi-section-title">Lo que tenemos para ti</h2>
              <p className="chi-section-sub">Desde sillas hasta vajilla completa. Filtra por categoría o solicita una cotización personalizada.</p>
            </div>
            <button className="chi-btn-primary" onClick={() => navigate('/catalogo')}>
              Ver todo el catálogo →
            </button>
          </div>

          <div className="chi-products-grid">
            {cargando
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ background: '#fff', border: '0.5px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
                    <div className="chi-skeleton" style={{ height: 180 }} />
                    <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="chi-skeleton" style={{ height: 14, width: '70%' }} />
                      <div className="chi-skeleton" style={{ height: 11, width: '90%' }} />
                      <div className="chi-skeleton" style={{ height: 11, width: '60%' }} />
                    </div>
                  </div>
                ))
              : articulos.map(a => {
                  const src = a.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nombre)}&background=e2e8f0&color=94a3b8&size=200`;
                  return (
                    <div key={a.id} className="chi-product-card">
                      <div className="chi-product-img-wrap">
                        <img src={src} alt={a.nombre}
                          onClick={() => setModal({ src, nombre: a.nombre, precio: a.precioAlquiler, desc: a.descripcion })}
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(a.nombre)}&background=e2e8f0&color=64748b`; }} />
                      </div>
                      <div className="chi-product-body">
                        <p className="chi-product-name">{a.nombre}</p>
                        {a.descripcion && <p className="chi-product-desc">{a.descripcion}</p>}
                        <div className="chi-product-footer">
                          <div>
                            <div className="chi-product-price">{COP(a.precioAlquiler)}</div>
                            <div className="chi-product-price-lbl">por unidad</div>
                          </div>
                          <button className="chi-add-btn" onClick={() => navigate('/catalogo')}>
                            Cotizar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ POR QUÉ ═══ */}
      <div className="chi-divider" />
      <section style={{ background: '#F1FDF7', padding: '80px 0' }}>
        <div className="chi-section">
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto 40px' }}>
            <p className="chi-section-eyebrow">¿Por qué elegirnos?</p>
            <h2 className="chi-section-title">Más que alquiler, una experiencia</h2>
          </div>
          <div className="chi-why-grid">
            {[
              { icon: '🚚', title: 'Entrega y recogida', desc: 'Llevamos todo a tu lugar del evento y lo recogemos cuando termina. Sin complicaciones.' },
              { icon: '🛡️', title: 'Artículos en perfecto estado', desc: 'Revisamos y limpiamos cada artículo antes de cada entrega. Tu evento, impecable.' },
              { icon: '💬', title: 'Cotización en minutos', desc: 'Genera tu pedido en línea y recibe confirmación rápida del equipo de Chicaeme.' },
              { icon: '🎯', title: 'Precios transparentes', desc: 'Lo que ves en el catálogo es lo que pagas. Sin cargos ocultos ni sorpresas.' },
            ].map(c => (
              <div key={c.title} className="chi-why-card">
                <div className="chi-why-icon">{c.icon}</div>
                <h3 className="chi-why-title">{c.title}</h3>
                <p className="chi-why-desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ CTA ═══ */}
      <div className="chi-cta-section">
        <div className="chi-cta-inner">
          <h2 className="chi-cta-title">¿Listo para hacer tu evento <span>inolvidable?</span></h2>
          <p className="chi-cta-desc">Explora nuestro catálogo, arma tu pedido y nosotros nos encargamos del resto. Registro opcional al cotizar.</p>
          <button className="chi-cta-btn" onClick={() => navigate('/catalogo')}>
            Ir al catálogo →
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ NOSOTROS ═══ */}
      <div className="chi-divider" />
      <section id="nosotros" style={{ padding: '80px 0', background: '#fff' }}>
        <div className="chi-section">
          <div className="chi-about-grid">
            <div>
              <p className="chi-section-eyebrow">Acerca de nosotros</p>
              <h2 className="chi-section-title">Chicaeme SAS</h2>
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.75, margin: '16px 0' }}>
                Somos una empresa colombiana especializada en alquiler de mobiliario y artículos para eventos. Con años de experiencia en el sector, hemos vestido bodas, grados, lanzamientos corporativos y celebraciones familiares en todo el país.
              </p>
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.75, marginBottom: 20 }}>
                Nuestro compromiso es entregar artículos en perfecto estado, puntual, y con la atención personalizada que cada evento merece.
              </p>
              <div className="chi-about-tags">
                <span className="chi-tag green">✓ Empresa registrada</span>
                <span className="chi-tag green">✓ Pago seguro</span>
                <span className="chi-tag">Bogotá, Colombia</span>
                <span className="chi-tag">Eventos corporativos</span>
                <span className="chi-tag">Bodas y sociales</span>
              </div>
            </div>
            <div className="chi-about-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80"
                alt="Evento Chicaeme"
                onError={e => { e.target.style.background = '#E2E8F0'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ FOOTER ═══ */}
      <footer className="chi-footer" id="contacto">
        <div className="chi-footer-grid">
          <div>
            <div className="chi-footer-logo">Chicaeme<span>.</span></div>
            <p className="chi-footer-desc">Alquiler de mobiliario y artículos para eventos en Colombia. Hacemos que tu celebración luzca perfecta.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {['📘','📷','📞'].map((ic, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, cursor: 'pointer' }}>{ic}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="chi-footer-col-title">Servicios</div>
            <ul className="chi-footer-links">
              <li><a href="#catalogo">Alquiler de mobiliario</a></li>
              <li><a href="#catalogo">Vajilla y cristalería</a></li>
              <li><a href="#catalogo">Decoración</a></li>
              <li><a href="#catalogo">Sonido e iluminación</a></li>
            </ul>
          </div>
          <div>
            <div className="chi-footer-col-title">Empresa</div>
            <ul className="chi-footer-links">
              <li><a href="#nosotros">Acerca de nosotros</a></li>
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="/login">Iniciar sesión</a></li>
              <li><a href="/login">Crear cuenta</a></li>
            </ul>
          </div>
          <div>
            <div className="chi-footer-col-title">Contacto</div>
            <ul className="chi-footer-links">
              <li><a href="#">📍 Bogotá, Colombia</a></li>
              <li><a href="#">📞 +57 300 000 0000</a></li>
              <li><a href="#">✉️ info@chicaeme.com</a></li>
              <li><a href="#">⏰ Lun–Sáb 8am–6pm</a></li>
            </ul>
          </div>
        </div>
        <div className="chi-footer-bottom">
          <span>© {new Date().getFullYear()} Chicaeme SAS — Todos los derechos reservados</span>
          <div className="chi-footer-badge">
            <span style={{ color: '#10B981' }}>●</span> Sitio seguro
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;