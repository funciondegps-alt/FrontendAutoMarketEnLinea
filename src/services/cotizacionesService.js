import { authFetch } from './http';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/cotizaciones`;

export const obtenerCotizaciones = async () => {
  const response = await authFetch(API_URL);
  return await response.json();
};

export const crearCotizacion = async (cotizacion) => {
  const response = await authFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cotizacion),
  });
  return response;
};

export const actualizarCotizacion = async (id, cotizacion) => {
  const response = await authFetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cotizacion),
  });
  return response;
};

export const eliminarCotizacion = async (id) => {
  const response = await authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
  return response;
};

export const cambiarEstadoCotizacion = async (id, nuevoEstado) => {
  const response = await authFetch(
    `${API_URL}/${id}/estado?estado=${encodeURIComponent(nuevoEstado)}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
  );
  return response;
};

/** Confirma entrega → estado "En evento" */
export const confirmarEntrega = async (id, ajustes = null) => {
  const response = await authFetch(`${API_URL}/${id}/confirmar-entrega`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: ajustes ? JSON.stringify(ajustes) : undefined,
  });
  return response;
};

/**
 * detalles = [{ id, cantidadDevueltaBuena, cantidadDanada, cantidadPerdida }, ...]
 * finalizar = true → Finalizado; false → En lavado
 */
export const registrarDevolucion = async (id, detalles, finalizar = false) => {
  const response = await authFetch(`${API_URL}/${id}/devolucion`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ detalles, finalizar }),
  });
  return response;
};

export const marcarLavadoTerminado = async (id) => {
  const response = await authFetch(`${API_URL}/${id}/lavado-terminado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  return response;
};
