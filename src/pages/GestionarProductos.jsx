import { API_BASE_URL } from '../config';
import { authFetch } from '../services/http';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GestionarProductos = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pedido, setPedido] = useState(null);
  const [articulosInventario, setArticulosInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const resPedido = await authFetch(`${API_BASE_URL}/api/cotizaciones/${id}`);
      const dataPedido = await resPedido.json();
      
      setPedido({
        ...dataPedido,
        detalles: dataPedido.detalles || []
      });

      const resArticulos = await authFetch(`${API_BASE_URL}/api/articulos`);
      if (resArticulos.ok) {
        const dataArticulos = await resArticulos.json();
        setArticulosInventario(dataArticulos);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const recalcularTotal = (detalles) => {
    return detalles.reduce((suma, item) => suma + (item.subtotal || 0), 0);
  };

  const manejarCambioCantidad = (index, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad) || 1;
    const nuevosDetalles = [...pedido.detalles];
    
    nuevosDetalles[index].cantidad = cantidad;
    nuevosDetalles[index].subtotal = cantidad * (nuevosDetalles[index].precioUnitario || 0);
    
    setPedido({
      ...pedido,
      detalles: nuevosDetalles,
      total: recalcularTotal(nuevosDetalles)
    });
  };

  const eliminarDetalle = (index) => {
    const nuevosDetalles = pedido.detalles.filter((_, i) => i !== index);
    setPedido({
      ...pedido,
      detalles: nuevosDetalles,
      total: recalcularTotal(nuevosDetalles)
    });
  };

  const agregarProducto = () => {
    if (!articuloSeleccionado) {
        alert("Selecciona un artículo primero");
        return;
    }

    const idSeleccionado = parseInt(articuloSeleccionado, 10);
    const articulo = articulosInventario.find(a => a.id === idSeleccionado);
    
    if (!articulo) return;

    const yaExiste = pedido.detalles.some(d => d.articuloAlquiler?.id === articulo.id);
    if (yaExiste) {
      alert("Este artículo ya está en el pedido. Modifica su cantidad en la tabla.");
      return;
    }

    const nuevoDetalle = {
      articuloAlquiler: articulo,
      cantidad: 1,
      precioUnitario: articulo.precioAlquiler || articulo.precio || 0,
      subtotal: articulo.precioAlquiler || articulo.precio || 0
    };

    const nuevosDetalles = [...pedido.detalles, nuevoDetalle];
    setPedido({
      ...pedido,
      detalles: nuevosDetalles,
      total: recalcularTotal(nuevosDetalles)
    });
    setArticuloSeleccionado('');
  };

  const guardarCambios = async () => {
    const payload = {
        ...pedido,
        estado: "Pendiente",
        detalles: pedido.detalles.map(d => ({
            articuloAlquiler: { id: d.articuloAlquiler.id },
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario
        }))
    };

    try {
      const response = await authFetch(`${API_BASE_URL}/api/cotizaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        alert("¡Pedido actualizado correctamente!");
        navigate('/cotizaciones'); 
      } else {
        const err = await response.text();
        alert("Error al guardar: " + err);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando datos...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '950px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#64748b' }}>← Volver</button>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#1e293b' }}>Gestionar Pedido #{pedido.id}</h2>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#059669', background: '#ecfdf5', padding: '8px 16px', borderRadius: '8px' }}>
              Total: ${pedido.total.toLocaleString()}
            </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
            <select value={articuloSeleccionado} onChange={(e) => setArticuloSeleccionado(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="">Seleccione artículo para agregar...</option>
                {articulosInventario.map(art => <option key={art.id} value={art.id}>{art.nombre}</option>)}
            </select>
            <button onClick={agregarProducto} style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Añadir</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Foto</th>
                    <th style={{ padding: '12px' }}>Artículo</th>
                    <th style={{ padding: '12px' }}>Cantidad</th>
                    <th style={{ padding: '12px' }}>Subtotal</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Acción</th>
                </tr>
            </thead>
            <tbody>
                {pedido.detalles.map((detalle, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>
                          <img 
                            src={detalle.articuloAlquiler?.fotoUrl || 'https://via.placeholder.com/60?text=Sin+Foto'} 
                            alt={detalle.articuloAlquiler?.nombre}
                            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          />
                        </td>
                        <td style={{ padding: '10px', fontWeight: '500', color: '#334155' }}>{detalle.articuloAlquiler?.nombre || "Producto"}</td>
                        <td style={{ padding: '10px' }}>
                            <input type="number" value={detalle.cantidad} onChange={(e) => manejarCambioCantidad(index, e.target.value)} style={{ width: '60px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        </td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>${(detalle.subtotal || 0).toLocaleString()}</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                            <button onClick={() => eliminarDetalle(index)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Quitar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        <button onClick={guardarCambios} style={{ marginTop: '25px', padding: '14px 28px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '16px' }}>
            Guardar cambios del pedido
        </button>
      </div>
    </div>
  );
};

export default GestionarProductos;