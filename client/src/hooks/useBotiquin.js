import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export const useBotiquin = () => {
  const [inventario, setInventario] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalAgregar, setModalAgregar] = useState(false);

  // Formulario
  const [editId, setEditId] = useState(null);
  const [formMed, setFormMed] = useState({
    nombre_medicamento: '',
    sustancia_activa: '',
    formato: 'Tabletas',
    cantidad_disponible: 10,
    unidad: 'piezas',
    fecha_caducidad: '',
    lote: '',
    notas: '',
  });

  const cargarInventario = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventario');
      if (res.data) setInventario(res.data);
      if (res.resumen) setResumen(res.resumen);
    } catch (err) {
      console.error('Error al cargar botiquín:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const handleGuardarMedicamento = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/inventario/${editId}`, formMed);
        await Swal.fire({
          title: '¡Actualizado!',
          text: 'Medicamento actualizado exitosamente.',
          icon: 'success',
          confirmButtonColor: '#4f83f5',
          customClass: { container: 'font-sans' }
        });
      } else {
        await api.post('/inventario', formMed);
        await Swal.fire({
          title: '¡Guardado!',
          text: 'Medicamento agregado al botiquín.',
          icon: 'success',
          confirmButtonColor: '#4f83f5',
          customClass: { container: 'font-sans' }
        });
      }
      cerrarModalAgregar();
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al guardar medicamento.');
    }
  };

  const handleEditar = (item) => {
    setEditId(item.id_botiquin);
    setFormMed({
      nombre_medicamento: item.nombre_comercial || '',
      sustancia_activa: item.sustancia_activa || '',
      formato: item.formato || 'Tabletas',
      cantidad_disponible: item.cantidad_disponible || 0,
      unidad: item.unidad || 'piezas',
      fecha_caducidad: item.fecha_caducidad ? item.fecha_caducidad.split('T')[0] : '',
      lote: item.lote || '',
      notas: item.notas || '',
    });
    setModalAgregar(true);
  };

  const handleEliminar = async (id, nombre) => {
    const result = await Swal.fire({
      title: '¿Retirar medicamento?',
      text: `Se eliminará ${nombre || 'este medicamento'} de tu botiquín actual.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, retirar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'font-sans'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/inventario/${id}`);
      toast.success('Medicamento eliminado del inventario.');
      cargarInventario();
    } catch (err) {
      toast.error(err.message || 'Error al eliminar.');
    }
  };

  // handleEscanearCaja se eliminó ya que ahora se navega a /escanear

  const abrirModalNuevo = () => {
    setEditId(null);
    setFormMed({
      nombre_medicamento: '',
      sustancia_activa: '',
      formato: 'Tabletas',
      cantidad_disponible: 10,
      unidad: 'piezas',
      fecha_caducidad: '',
      lote: '',
      notas: '',
    });
    setModalAgregar(true);
  };

  const cerrarModalAgregar = () => {
    setModalAgregar(false);
    setEditId(null);
  };

  const inventarioFiltrado = inventario.filter((item) => {
    const coincideEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
    const coincideBusqueda =
      !busqueda.trim() ||
      item.nombre_comercial.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.sustancia_activa && item.sustancia_activa.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideBusqueda;
  });

  return {
    inventario: inventarioFiltrado,
    resumen,
    filtroEstado,
    setFiltroEstado,
    busqueda,
    setBusqueda,
    loading,
    modalAgregar,
    formMed,
    setFormMed,
    editId,
    abrirModalNuevo,
    cerrarModalAgregar,
    handleGuardarMedicamento,
    handleEditar,
    handleEliminar
  };
};
