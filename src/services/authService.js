// src/services/authService.js
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/usuarios`;

const TOKEN_KEY = 'chicaeme_token';
const USUARIO_KEY = 'usuarioChicaeme'; // se mantiene el mismo nombre que ya usa el resto del proyecto

// Evita la página de advertencia de ngrok (plan gratuito). Con cualquier valor basta.
// Se puede quitar cuando el backend ya no esté detrás de ngrok.
export const NGROK_HEADER = { 'ngrok-skip-browser-warning': 'true' };

export const loginUsuario = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...NGROK_HEADER
            },
            body: JSON.stringify({ email, password })
        });

        // Si el servidor responde con error (ej. 401 Unauthorized)
        if (!response.ok) {
            throw new Error('Correo o contraseña incorrectos');
        }

        // /login devuelve { token, usuario }
        const data = await response.json();

        // Guardamos el token (lo necesita cada petición protegida) y el usuario
        // por separado, usando la MISMA clave 'usuarioChicaeme' que ya usa el
        // resto de la app para no tener que tocar cada página que lo lee.
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario));

        return data.usuario;

    } catch (error) {
        console.error("Error en el login:", error);
        throw error; // Rebotamos el error para mostrarlo en la interfaz
    }
};

// Login/registro con Google. idToken es el JWT que entrega el botón de Google
// (window.google.accounts.id...). aceptoTerminos solo importa si la cuenta es
// nueva — si el correo ya existe, el backend lo ignora y loguea esa cuenta tal cual.
export const loginConGoogle = async (idToken, aceptoTerminos = false) => {
    const response = await fetch(`${API_URL}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...NGROK_HEADER },
        body: JSON.stringify({ idToken, aceptoTerminos })
    });

    if (!response.ok) {
        // 401 = token de Google inválido/expirado. 400 = cuenta nueva sin aceptar términos.
        const mensaje = await response.text();
        throw new Error(mensaje || 'No se pudo iniciar sesión con Google.');
    }

    // Misma forma que el login normal: { token, usuario }
    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(data.usuario));

    return data.usuario;
};

// Pide el enlace de recuperación. El backend SIEMPRE responde con el mismo
// texto (exista o no el correo), y en TEXTO PLANO, no JSON — por eso .text()
// y no .json().
export const solicitarRecuperacion = async (email) => {
    const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...NGROK_HEADER },
        body: JSON.stringify({ email })
    });
    return await response.text();
};

// Restablece la contraseña con el token que llegó por correo.
// También responde en texto plano, y aquí SÍ nos interesa si fue error o no
// (token vencido/inválido), por eso revisamos response.ok.
export const restablecerPassword = async (token, password) => {
    const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...NGROK_HEADER },
        body: JSON.stringify({ token, password })
    });

    const mensaje = await response.text();

    if (!response.ok) {
        throw new Error(mensaje || 'El enlace no es válido o ya expiró.');
    }

    return mensaje;
};

export const logoutUsuario = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

// Headers listos para cualquier fetch (lo usa authFetch en http.js).
// Siempre incluye el header de ngrok; el token solo se agrega si hay sesión,
// así no rompe los endpoints públicos.
export const authHeader = () => {
    const token = getToken();
    return {
        ...NGROK_HEADER,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};