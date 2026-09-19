import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, X, FlipHorizontal } from 'lucide-react';

export default function CameraCapture({ onCapture, onCancel }) {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' o 'user'

  const capturarFoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const alternarCamara = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode,
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#4f83f5]" />
          <span className="font-bold text-sm">Cámara Web en Vivo</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={alternarCamara}
            title="Cambiar de cámara"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
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
      </div>

      <div className="flex items-center justify-center gap-4 pt-2">
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
      </div>
    </div>
  );
}
