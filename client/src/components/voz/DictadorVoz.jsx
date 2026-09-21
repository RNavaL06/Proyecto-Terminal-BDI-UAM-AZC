import { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, RefreshCw, Send, AlertCircle } from 'lucide-react';

export default function DictadorVoz({ onAnalizarSintomas, isLoading = false }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [textoManual, setTextoManual] = useState('');
  const [permisoDenegado, setPermisoDenegado] = useState(false);

  // Sincronizar transcripción hablada con la caja de texto editable
  useEffect(() => {
    if (transcript) {
      setTextoManual(transcript);
    }
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="card bg-amber-50 border-amber-200 text-amber-800 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Navegador sin soporte de voz nativo</p>
            <p className="text-xs mt-1">
              Tu navegador no soporta el reconocimiento de voz web. Puedes escribir tus síntomas directamente en la caja inferior.
              (Para experiencia completa de dictado se recomienda Google Chrome o Microsoft Edge).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toggleEscucha = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      setPermisoDenegado(false);
      resetTranscript();
      setTextoManual('');
      // Iniciar directamente sin await para evitar perder el contexto de interacción en móviles
      SpeechRecognition.startListening({ continuous: true, language: 'es-MX' });
    }
  };

  const handleEnviar = () => {
    if (textoManual.trim().length > 0) {
      if (listening) SpeechRecognition.stopListening();
      onAnalizarSintomas(textoManual.trim());
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto p-6 sm:p-8 space-y-6">
      {permisoDenegado && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 flex items-center gap-3">
          <MicOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-xs uppercase tracking-wider">Micrófono no disponible</p>
            <p className="text-xs mt-0.5">Permite el acceso al micrófono en los ajustes del navegador o escribe tus síntomas manualmente.</p>
          </div>
        </div>
      )}

      {/* Botón Central de Micrófono con Pulso */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative">
          {listening && !permisoDenegado && (
            <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-75"></div>
          )}
          <button
            type="button"
            onClick={toggleEscucha}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-lg ${
              permisoDenegado
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : listening
                ? 'bg-rose-500 text-white hover:bg-rose-600 scale-105 ring-4 ring-rose-200 shadow-rose-300/50'
                : 'bg-[#4f83f5] text-white hover:bg-blue-600 shadow-blue-200/60'
            }`}
          >
            {listening && !permisoDenegado ? (
              <Mic className="w-9 h-9 animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </button>
        </div>

        <p className={`mt-3 font-bold text-base transition-colors ${
          permisoDenegado ? 'text-slate-400' : listening ? 'text-rose-500 font-extrabold' : 'text-slate-700'
        }`}>
          {permisoDenegado
            ? 'Micrófono desactivado'
            : listening
            ? 'Escuchando síntomas...'
            : 'Toca para dictar síntomas'}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Ej: "Tengo calentura, dolor de cabeza y tos seca"</p>
      </div>

      {/* Caja de Transcripción Editable */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Transcripción en tiempo real / Entrada manual
          </label>
          <button
            type="button"
            onClick={() => {
              resetTranscript();
              setTextoManual('');
            }}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> Limpiar
          </button>
        </div>

        <textarea
          rows={3}
          value={textoManual}
          onChange={(e) => setTextoManual(e.target.value)}
          placeholder="Dicta con el micrófono o escribe aquí tus síntomas..."
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4f83f5] focus:bg-white text-sm sm:text-base resize-none transition-all"
        />
      </div>

      {/* Botón de Análisis (Estilo Ricardo) */}
      <button
        type="button"
        onClick={handleEnviar}
        disabled={textoManual.trim().length === 0 || isLoading}
        className="btn-rose w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-md"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Analizando Síntomas Clínicos...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Analizar Síntomas
          </>
        )}
      </button>
    </div>
  );
}
