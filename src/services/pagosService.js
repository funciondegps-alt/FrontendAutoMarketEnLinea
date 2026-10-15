import { authFetch } from './http';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/pagos`;

export const obtenerPagos = async () => {
  const res = await authFetch(API_URL);
  if (!res.ok) throw new Error('No se pudieron cargar los pagos');
  return res.json();
};

export const obtenerPagosPorCotizacion = async (cotizacionId) => {
  const res = await authFetch(`${API_URL}/cotizacion/${cotizacionId}`);
  if (!res.ok) throw new Error('No se pudieron cargar los pagos del pedido');
  return res.json();
};

/**
 * pago = {
 *   monto, metodoPago, comprobantePago?, notas?, fechaPago? (yyyy-MM-dd),
 *   cotizacion: { id }
 * }
 */
export const registrarPago = async (pago) => {
  const res = await authFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pago),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || 'Error al registrar el pago');
  }
  return res.json();
};

export const eliminarPago = async (id) => {
  const res = await authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('No se pudo eliminar el pago');
  return res;
};

/** fechaVencimiento = 'yyyy-MM-dd' */
export const marcarCredito = async (cotizacionId, fechaVencimiento) => {
  const res = await authFetch(`${API_URL}/credito/${cotizacionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fechaVencimiento }),
  });
  if (!res.ok) throw new Error('No se pudo marcar como crédito');
  return res.json();
};
