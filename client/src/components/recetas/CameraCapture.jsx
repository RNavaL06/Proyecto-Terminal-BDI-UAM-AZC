import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, X, FlipHorizontal, Sparkles } from 'lucide-react';

export default function CameraCapture({ onCapture, onCancel, isProcessing }) {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' o 'user'
  const [fotoTomada, setFotoTomada] = useState(null);

  const capturarFoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setFotoTomada(imageSrc);
    } else {
      console.warn("No se pudo capturar la imagen. Verifica que la cámara esté lista.");
    }
  }, [webcamRef]);

  const alternarCamara = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const videoConstraints = {
    width: { ideal: 1920, min: 640 },
    height: { ideal: 1080, min: 480 },
    facingMode,
  };

  if (isProcessing) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-8 shadow-xl flex flex-col items-center justify-center space-y-6 min-h-[400px] sm:min-h-[500px] animate-fade-in text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-[#4f83f5] rounded-full animate-spin"></div>
          <Sparkles className="w-6 h-6 text-[#4f83f5] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-white">Doctor IA Analizando...</h3>
          <p className="text-sm text-slate-400 max-w-[260px] mx-auto leading-relaxed">
            Estamos extrayendo la información clínica de tu imagen utilizando inteligencia artificial.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#4f83f5]" />
          <span className="font-bold text-sm">{fotoTomada ? 'Vista Previa' : 'Cámara Web en Vivo'}</span>
        </div>

        <div className="flex items-center gap-2">
          {!fotoTomada && (
            <button
              type="button"
              onClick={alternarCamara}
              title="Cambiar de cámara"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] sm:aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
        {fotoTomada ? (
          <img src={fotoTomada} alt="Vista previa de captura" className="w-full h-full object-contain" />
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
            {/* Guía visual para centrar la receta */}
            <div className="absolute inset-8 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="bg-black/60 text-white/90 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-sm font-medium">
                Enfoca la receta o empaque dentro del cuadro
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
        {fotoTomada ? (
          <>
            <button
              type="button"
              onClick={() => onCapture(fotoTomada)}
              className="btn-rose py-3 px-8 text-sm font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Procesar con IA
            </button>
            <button
              type="button"
              onClick={() => setFotoTomada(null)}
              className="py-3 px-6 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 rounded-full font-bold text-sm transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Tomar Otra
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={capturarFoto}
              className="btn-rose py-3 px-8 text-sm font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <Camera className="w-5 h-5" /> Tomar Fotografía
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-6 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 rounded-full font-bold text-sm transition-all"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
