import { useState } from 'react';
import DictadorVoz from '../components/voz/DictadorVoz';
import ResultadosDiagnostico from '../components/voz/ResultadosDiagnostico';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Activity, Mic, Sparkles } from 'lucide-react';

export default function SintomasVoz() {
  const [analizando, setAnalizando] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [historial, setHistorial] = useState([]);

  const handleAnalizarSintomas = async (frase) => {
    setAnalizando(true);
    setResultados([]);
    setHistorial([]);

    try {
      const res = await api.post('/sintomas/analizar', { frase });
      if (res.exito) {
        setResultados(res.resultados || []);
        setHistorial(res.historial || []);

        if ((res.resultados || []).length > 0) {
          toast.success('Síntomas procesados con éxito.');
        } else {
          toast('No se encontraron términos médicos específicos para esta descripción.', { icon: 'ℹ️' });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error al procesar síntomas por voz.');
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Encabezado */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
          <Mic className="w-3.5 h-3.5 text-rose-500" /> Accesibilidad por Voz Bidireccional (STT & TTS)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Consulta y Captura de Síntomas por Voz
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Dicta en tu lenguaje habitual cómo te sientes. Nuestro motor de Inteligencia Artificial (NLP)
          estandarizará tus síntomas a códigos CIE-10 y te responderá auditivamente con tu historial y recomendaciones.
        </p>
      </div>

      {/* Componente de Dictador con Micrófono y Fallback Manual */}
      <DictadorVoz
        onAnalizarSintomas={handleAnalizarSintomas}
        isLoading={analizando}
      />

      {/* Resultados de Diagnóstico y Síntesis TTS */}
      {resultados.length > 0 ? (
        <ResultadosDiagnostico
          resultados={resultados}
          historial={historial}
        />
      ) : !analizando && (
        <div className="card p-8 border-dashed border-slate-200 text-center space-y-2 text-slate-400">
          <Sparkles className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-semibold">Toca el micrófono para comenzar la captura de síntomas.</p>
          <p className="text-[11px] text-slate-400">El sistema filtra ruidos ambientales y permite correcciones de texto antes de procesar.</p>
        </div>
      )}

    </div>
  );
}
