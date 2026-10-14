import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Contacto = () => {
  const [usuario, setUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    tipoContacto: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar si hay usuario logueado
    const usuarioString = localStorage.getItem('usuarioChicaeme');
    if (usuarioString) {
      const user = JSON.parse(usuarioString);
      setUsuario(user);
      // Pre-llenar datos
      setFormData({
        nombre: user.nombres || '',
        telefono: user.telefono || '',
        email: user.email || '',
        tipoContacto: '',
        asunto: '',
        mensaje: ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones básicas
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      setError('El nombre debe tener mínimo 3 caracteres');
      return;
    }

    if (!formData.telefono || formData.telefono.trim().length < 7) {
      setError('El teléfono debe tener mínimo 7 caracteres');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('El email no es válido');
      return;
    }

    if (!formData.mensaje || formData.mensaje.trim().length < 10) {
      setError('El mensaje debe tener mínimo 10 caracteres');
      return;
    }

    // Preparar payload
    const payload = {
      nombre: formData.nombre,
      telefono: formData.telefono,
      email: formData.email,
      tipoContacto: formData.tipoContacto || null,
      asunto: formData.asunto || null,
      mensaje: formData.mensaje,
      usuarioId: usuario?.id || null // NULL si no está logueado
    };

    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/api/contactos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        // Limpiar formulario
        setFormData({
          nombre: usuario?.nombres || '',
          telefono: usuario?.telefono || '',
          email: usuario?.email || '',
          tipoContacto: '',
          asunto: '',
          mensaje: ''
        });
        // Mostrar mensaje de éxito por 4 segundos
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || 'Error al enviar el mensaje. Intenta de nuevo.');
      }
    } catch (e) {
      console.error(e);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '700px',
      margin: '60px auto',
      padding: '40px 20px',
      fontFamily: "'Inter', sans-serif",
      color: '#0f172a'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px'
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '0 0 10px',
      color: '#0f172a'
    },
    subtitle: {
      fontSize: '16px',
      color: '#64748b',
      margin: 0,
      lineHeight: '1.6'
    },
    alert: {
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '14px',
      animation: 'fadeIn 0.3s ease'
    },
    successAlert: {
      background: '#dcfce7',
      border: '0.5px solid #86efac',
      color: '#15803d'
    },
    errorAlert: {
      background: '#fee2e2',
      border: '0.5px solid #fca5a5',
      color: '#b91c1c'
    },
    infoAlert: {
      background: '#dbeafe',
      border: '0.5px solid #93c5fd',
      color: '#1e40af'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#0f172a'
    },
    required: {
      color: '#ef4444'
    },
    input: {
      padding: '10px 12px',
      border: '0.5px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
      background: '#fff'
    },
    inputFocus: {
      borderColor: '#059669',
      boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.1)',
      outline: 'none'
    },
    textarea: {
      padding: '10px 12px',
      border: '0.5px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      minHeight: '140px',
      resize: 'vertical',
      transition: 'border-color 0.2s',
      background: '#fff'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '10px'
    },
    submitBtn: {
      flex: 1,
      padding: '12px 24px',
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'opacity 0.2s',
      fontFamily: 'inherit'
    },
    resetBtn: {
      flex: 1,
      padding: '12px 24px',
      background: '#f1f5f9',
      color: '#64748b',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background 0.2s',
      fontFamily: 'inherit'
    },
    helpText: {
      fontSize: '12px',
      color: '#94a3b8',
      marginTop: '4px'
    },
    userBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: '#ecfdf5',
      border: '0.5px solid #86efac',
      color: '#059669',
      padding: '8px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Contáctanos</h1>
        <p style={styles.subtitle}>
          {usuario 
            ? `Hola ${usuario.nombres.split(' ')[0]}, ¿en qué podemos ayudarte?`
            : 'Completa el formulario y nos pondremos en contacto pronto'
          }
        </p>
      </div>

      {/* Alertas */}
      {usuario && (
        <div style={{ ...styles.alert, ...styles.infoAlert }}>
          ✓ Estás identificado. Tus datos se enviarán con tu información de usuario.
        </div>
      )}

      {success && (
        <div style={{ ...styles.alert, ...styles.successAlert }}>
          ✓ Mensaje enviado correctamente. Pronto nos comunicaremos contigo.
        </div>
      )}

      {error && (
        <div style={{ ...styles.alert, ...styles.errorAlert }}>
          ✗ {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Fila 1: Nombre y Teléfono */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Nombre <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre o empresa"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
              disabled={loading}
            />
            <span style={styles.helpText}>Mínimo 3 caracteres</span>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Teléfono <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+57 300 123 4567"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
              disabled={loading}
            />
            <span style={styles.helpText}>Mínimo 7 caracteres</span>
          </div>
        </div>

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Email <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            style={styles.input}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
            disabled={loading}
          />
          <span style={styles.helpText}>Usaremos esto para responderte</span>
        </div>

        {/* Fila 2: Tipo y Asunto */}
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Tipo de contacto (opcional)</label>
            <select
              name="tipoContacto"
              value={formData.tipoContacto}
              onChange={handleChange}
              style={{ ...styles.input }}
              disabled={loading}
            >
              <option value="">-- Selecciona un tema --</option>
              <option value="Consulta General">Consulta General</option>
              <option value="Cotización">Cotización</option>
              <option value="Soporte">Soporte</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Asunto (opcional)</label>
            <input
              type="text"
              name="asunto"
              value={formData.asunto}
              onChange={handleChange}
              placeholder="Breve resumen"
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
              disabled={loading}
            />
          </div>
        </div>

        {/* Mensaje */}
        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            Mensaje <span style={styles.required}>*</span>
          </label>
          <textarea
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Cuéntanos tu consulta, solicitud o comentario..."
            style={styles.textarea}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
            disabled={loading}
          />
          <span style={styles.helpText}>Mínimo 10 caracteres</span>
        </div>

        {/* Botones */}
        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={styles.submitBtn}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = '1')}
          >
            {loading ? '⏳ Enviando...' : '✓ Enviar mensaje'}
          </button>
          <button
            type="reset"
            style={styles.resetBtn}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#e2e8f0')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#f1f5f9')}
          >
            Limpiar
          </button>
        </div>
      </form>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:disabled,
        textarea:disabled,
        select:disabled {
          background-color: #f8fafc;
          cursor: not-allowed;
          opacity: 0.7;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default Contacto;