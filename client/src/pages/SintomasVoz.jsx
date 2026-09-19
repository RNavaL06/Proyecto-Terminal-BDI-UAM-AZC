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
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Consulta y Captura de Síntomas por Voz
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Cuéntanos cómo te sientes usando tus propias palabras. Analizaremos tus síntomas para sugerirte qué medicamentos de tu botiquín podrían ayudarte, basándonos en tus recetas anteriores.
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
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/30 p-12 shadow-sm animate-fade-in">
          <div className="bg-blue-100 p-4 rounded-full mb-4 shadow-sm">
            <Activity className="w-10 h-10 text-[#4f83f5]" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Esperando síntomas</h2>
          <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">
            Toca el micrófono arriba y dicta tus síntomas para ver los diagnósticos sugeridos.
          </p>
        </div>
      )}

    </div>
  );
}
