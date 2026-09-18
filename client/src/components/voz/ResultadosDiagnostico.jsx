import { useState, useEffect } from 'react';
import { Volume2, Square, AlertTriangle, Pill, Clock, Activity, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ResultadosDiagnostico({ resultados = [], historial = [] }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancelar locución de voz si el usuario desmonta la pantalla
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  if (!resultados || resultados.length === 0) return null;

  // Extraer palabras clave de los diagnósticos
  let todasPalabrasClave = [];
  resultados.forEach((item) => {
    let kw = [];
    try {
      kw = typeof item.keywords === 'string' ? JSON.parse(item.keywords) : item.keywords || [];
    } catch (e) {
      kw = [];
    }
    todasPalabrasClave = [...todasPalabrasClave, ...kw];
  });
  const palabrasUnicas = [...new Set(todasPalabrasClave)].slice(0, 6);

  const textoSintomas = palabrasUnicas.length > 0 ? palabrasUnicas.join(', ') : 'los malestares descritos';

  // Generar guion dinámico para el sintetizador de voz (TTS)
  const generarGuionVoz = () => {
    const diagPrincipal = resultados[0]?.termino_medico || 'un malestar general';
    let guion = `He analizado tus síntomas. El diagnóstico más probable de acuerdo con la clasificación CIE-10 es: ${diagPrincipal}. `;

    if (historial && historial.length > 0) {
      const medsPasados = historial.slice(0, 2).map((h) => h.medicamento).join(' y ');
      guion += `Al revisar tu expediente médico previo, notamos recetas anteriores de ${medsPasados}. `;

      const medsAgotados = historial.filter((h) => h.cantidad_disponible < 4);
      if (medsAgotados.length > 0) {
        guion += `Atención: noté que algunos de estos medicamentos están por agotarse en tu botiquín personal. `;
      }
    } else {
      guion += `No encontramos recetas previas para este padecimiento. Te sugerimos mantener reposo y consultar con un médico. `;
    }

    guion += `Recuerda que esta información es de carácter orientativo y no sustituye una consulta médica profesional.`;
    return guion;
  };

  const toggleAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(generarGuionVoz());
      utterance.lang = 'es-MX';
      utterance.rate = 0.9; // Velocidad pausada para mayor comprensión
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 overflow-hidden animate-fade-in">
      
      {/* Encabezado con Botón de Voz TTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#497dfe] flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Diagnósticos Sugeridos (CIE-10)</h3>
            <p className="text-xs text-slate-400">Procesamiento de Lenguaje Natural + Algoritmo de Relevancia</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleAudio}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all shadow-sm ${
            isSpeaking
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300'
              : 'bg-blue-50 text-[#497dfe] hover:bg-blue-100 border border-blue-200'
          }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> Detener Voz
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" /> Escuchar Diagnóstico en Voz Alta
            </>
          )}
        </button>
      </div>

      {/* Aviso Médico Legal */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Aviso Sanitario:</strong> Los resultados presentados son de carácter exclusivamente orientativo e informativo
          mediante IA simbólica y estadística. <span className="underline decoration-amber-400">No reemplazan el diagnóstico ni la valoración de un profesional de la salud certificado.</span>
        </p>
      </div>

      {/* Lista de Diagnósticos con Probabilidad y Coincidencias */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 3 Diagnósticos Oficiales</h4>
        <div className="grid grid-cols-1 gap-3">
          {resultados.map((diag, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-gradient-to-r from-blue-50/50 to-white border-blue-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#497dfe] text-white">
                      {diag.codigo_cie10}
                    </span>
                    <h5 className="font-bold text-slate-800 text-sm sm:text-base">
                      {diag.termino_medico}
                    </h5>
                  </div>
                  {diag.capitulo && (
                    <p className="text-xs text-slate-400 mt-1 pl-1">{diag.capitulo}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500">Certeza:</span>
                    <span className="text-sm font-extrabold text-[#497dfe] ml-1.5">
                      {diag.probabilidad}%
                    </span>
                  </div>
                  <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#497dfe] h-full rounded-full transition-all"
                      style={{ width: `${diag.probabilidad}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cruce con el Historial Médico e Inventario */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#497dfe]" /> Cruce con tu Historial Clínico y Botiquín
        </h4>

        {historial && historial.length > 0 ? (
          <div className="space-y-2">
            {historial.map((rec, i) => {
              const stock = rec.cantidad_disponible || 0;
              const bajoStock = stock > 0 && stock <= 3;
              const sinStock = stock === 0;

              return (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-[#497dfe] flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm text-slate-800">{rec.medicamento}</span>
                      <p className="text-xs text-slate-400">Recetado para: {rec.diagnostico}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {sinStock ? (
                      <span className="badge-caducado flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Sin existencia en casa
                      </span>
                    ) : bajoStock ? (
                      <span className="badge-por_vencer flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Por agotarse ({stock} {rec.unidad || 'uds.'})
                      </span>
                    ) : (
                      <span className="badge-vigente flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> En botiquín ({stock} {rec.unidad || 'uds.'})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 italic">
            No se encontraron tratamientos previos registrados en tu expediente para este tipo de diagnóstico.
          </div>
        )}
      </div>

    </div>
  );
}
