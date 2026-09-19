import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraCapture from '../components/recetas/CameraCapture';
import FormularioValidacion from '../components/recetas/FormularioValidacion';
import api from '../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Package, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

export default function EscanerReceta() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('receta'); // 'receta' o 'caja'
  const [modoCamara, setModoCamara] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [analizando, setAnalizando] = useState(false);
  const [datosExtraidos, setDatosExtraidos] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para escaneo de caja
  const [cajaData, setCajaData] = useState(null);

  // Manejador de carga de archivo local
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido (JPEG, PNG o WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagenSeleccionada(reader.result);
      setDatosExtraidos(null);
    };
    reader.readAsDataURL(file);
  };

  // Manejador de captura por webcam
  const handleCameraCapture = (dataUrl) => {
    setImagenSeleccionada(dataUrl);
    setModoCamara(false);
    setDatosExtraidos(null);
  };

  // Enviar a análisis con IA multimodal
  const handleAnalizar = async () => {
    if (!imagenSeleccionada) {
      toast.error('Primero debes tomar una foto o subir una imagen de la receta.');
      return;
    }

    setAnalizando(true);
    try {
      const res = await api.post('/recetas/analizar', {
        imagenBase64: imagenSeleccionada,
      });

      if (res.exito && res.datos_clinicos) {
        setDatosExtraidos(res.datos_clinicos);
        toast.success('¡Receta analizada con éxito! Revisa los datos.');
      } else {
        toast.error('No se pudieron extraer datos de la receta.');
      }
    } catch (err) {
      toast.error(err.message || 'Error al procesar la imagen con IA.');
    } finally {
      setAnalizando(false);
    }
  };

  // Enviar caja a análisis con IA
  const handleAnalizarCaja = async (imgData) => {
    const dataToProcess = imgData || imagenSeleccionada;
    if (!dataToProcess) {
      toast.error('Primero debes tomar una foto o seleccionar la imagen de la caja.');
      return;
    }

    setAnalizando(true);
    try {
      const res = await api.post('/inventario/analizar', {
        imageBase64: dataToProcess,
      });

      if (res.exito && res.data) {
        setCajaData(res.data);
        toast.success('¡Datos de la caja extraídos con éxito!');
      } else {
        toast.error('No se pudieron extraer datos del empaque.');
      }
    } catch (err) {
      toast.error(err.message || 'Error al procesar la caja con IA.');
    } finally {
      setAnalizando(false);
    }
  };

  // Guardar caja en el botiquín
  const handleGuardarCajaEnBotiquin = async (e) => {
    e.preventDefault();
    if (!cajaData?.nombre_medicamento) return;
    setGuardando(true);
    try {
      await api.post('/inventario', {
        nombre_medicamento: cajaData.nombre_medicamento,
        sustancia_activa: cajaData.sustancia_activa || '',
        formato: cajaData.formato || 'Tabletas',
        fecha_caducidad: cajaData.fecha_caducidad || '',
        cantidad_disponible: 10,
        unidad: 'piezas',
      });
      await Swal.fire({
        title: '¡Medicamento Guardado!',
        text: 'El medicamento se ha añadido correctamente a tu botiquín digital.',
        icon: 'success',
        confirmButtonColor: '#4f83f5',
        confirmButtonText: 'Ver Botiquín',
        customClass: { container: 'font-sans' }
      });
      navigate('/botiquin');
    } catch (err) {
      toast.error(err.message || 'Error al guardar en el botiquín.');
    } finally {
      setGuardando(false);
    }
  };

  // Guardar receta validada en la base de datos
  const handleGuardarReceta = async (formData) => {
    setGuardando(true);
    try {
      const res = await api.post('/recetas/guardar', {
        datos_clinicos: formData,
      });

      if (res.exito) {
        await Swal.fire({
          title: '¡Receta Guardada!',
          text: 'Se ha registrado la receta y los medicamentos en tu historial.',
          icon: 'success',
          confirmButtonColor: '#4f83f5',
          confirmButtonText: 'Ver Detalles',
          customClass: { container: 'font-sans' }
        });
        navigate(`/recetas/${res.id_receta}`);
      }
    } catch (err) {
      toast.error(err.message || 'Error al guardar la receta en la base de datos.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Encabezado */}
      <div className="text-center space-y-1">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4f83f5]">
          Digitalización Asistida por IA
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Escanear {activeTab === 'receta' ? 'Receta Médica' : 'Caja de Medicamento'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {activeTab === 'receta'
            ? 'Toma una foto de tu receta médica y registraremos tus medicamentos automáticamente.'
            : 'Escanea el empaque de tu medicamento para detectar su nombre, sustancia y fecha de caducidad de forma automática.'}
        </p>
      </div>

      {/* Selector de Modo (Estilo Ricardo) */}
      <div className="flex bg-white p-1 rounded-full max-w-xs mx-auto w-full shadow-sm border border-slate-100">
        <button
          type="button"
          onClick={() => {
            setActiveTab('receta');
            setImagenSeleccionada(null);
            setDatosExtraidos(null);
            setCajaData(null);
          }}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            activeTab === 'receta'
              ? 'bg-blue-50 text-[#4f83f5] shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          Receta
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('caja');
            setImagenSeleccionada(null);
            setDatosExtraidos(null);
            setCajaData(null);
          }}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            activeTab === 'caja'
              ? 'bg-blue-50 text-[#4f83f5] shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-3.5 h-3.5 mr-1.5" />
          Caja / Fármaco
        </button>
      </div>

      {/* Selector de Modo de Captura o Cámara en Vivo */}
      {modoCamara ? (
        <CameraCapture
          onCapture={(dataUrl) => {
            handleCameraCapture(dataUrl);
            if (activeTab === 'caja') {
              handleAnalizarCaja(dataUrl);
            }
          }}
          onCancel={() => setModoCamara(false)}
        />
      ) : activeTab === 'receta' ? (
        /* VISTA: ESCANEAR RECETA */
        !datosExtraidos ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto space-y-6 text-center p-6 sm:p-8">
            
            {imagenSeleccionada ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-[400px] flex items-center justify-center">
                  <img
                    src={imagenSeleccionada}
                    alt="Receta médica seleccionada"
                    className="w-full h-full object-contain max-h-[400px]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleAnalizar}
                    disabled={analizando}
                    className="btn-rose w-full sm:w-auto py-3.5 px-8 text-sm shadow-md"
                  >
                    {analizando ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Analizando receta con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Procesar Receta con IA
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setImagenSeleccionada(null)}
                    disabled={analizando}
                    className="btn-secondary w-full sm:w-auto text-xs py-3"
                  >
                    Cambiar Imagen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 text-[#4f83f5] flex items-center justify-center mx-auto shadow-sm">
                  <Camera className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800">Digitalizar Receta Médica</h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mt-1">
                    Toma una foto de tu receta o selecciona un archivo de tu galería.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
                  <label className="btn-rose w-full py-3.5 px-4 text-xs sm:text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={analizando}
                    />
                    <ImageIcon className="w-5 h-5" />
                    Seleccionar de Galería
                  </label>

                  <button
                    type="button"
                    onClick={() => setModoCamara(true)}
                    className="btn-secondary w-full py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-[#4f83f5]" />
                    Abrir Cámara en Vivo
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 pt-2">
                  Formatos soportados: JPEG, PNG y WEBP.
                </p>
              </div>
            )}

          </div>
        ) : (
          /* Formulario de Validación de Receta */
          <div className="space-y-6">
            <FormularioValidacion
              initialData={datosExtraidos}
              imagenProcesada={imagenSeleccionada}
              onConfirm={handleGuardarReceta}
              onCancel={() => setDatosExtraidos(null)}
              isSaving={guardando}
            />
          </div>
        )
      ) : (
        /* VISTA: ESCANEAR CAJA DE MEDICAMENTO */
        !cajaData ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto space-y-6 text-center p-6 sm:p-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
              <Package className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">Escanear Caja de Medicina</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mt-1">
                Apunta hacia el frente del empaque para leer el nombre comercial y fecha de vencimiento.
              </p>
            </div>

            {analizando ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#4f83f5] animate-spin" />
                <p className="text-xs font-bold text-slate-600">Extrayendo datos de la caja con IA...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => setModoCamara(true)}
                  className="btn-rose w-full py-3.5 px-4 text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Escanear con Cámara
                </button>

                <label className="btn-secondary w-full py-3 px-4 text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => handleAnalizarCaja(reader.result);
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                    disabled={analizando}
                  />
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  Subir Foto de la Caja
                </label>
              </div>
            )}
          </div>
        ) : (
          /* Formulario de Confirmación de Caja Escaneada */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 pb-2 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">Información Extraída del Empaque</h3>
            </div>

            <form onSubmit={handleGuardarCajaEnBotiquin} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={cajaData.nombre_medicamento || ''}
                  onChange={(e) => setCajaData({ ...cajaData, nombre_medicamento: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sustancia Activa</label>
                <input
                  type="text"
                  value={cajaData.sustancia_activa || ''}
                  onChange={(e) => setCajaData({ ...cajaData, sustancia_activa: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Presentación</label>
                  <input
                    type="text"
                    value={cajaData.formato || 'Tabletas'}
                    onChange={(e) => setCajaData({ ...cajaData, formato: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Caducidad</label>
                  <input
                    type="date"
                    value={cajaData.fecha_caducidad || ''}
                    onChange={(e) => setCajaData({ ...cajaData, fecha_caducidad: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4f83f5]"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-4">
                <button
                  type="submit"
                  disabled={guardando}
                  className="btn-rose flex-1 py-3 text-xs font-bold"
                >
                  {guardando ? 'Guardando...' : 'Guardar en Botiquín'}
                </button>
                <button
                  type="button"
                  onClick={() => setCajaData(null)}
                  className="btn-secondary py-3 px-4 text-xs font-bold"
                >
                  Reintentar
                </button>
              </div>
            </form>
          </div>
        )
      )}

    </div>
  );
}
