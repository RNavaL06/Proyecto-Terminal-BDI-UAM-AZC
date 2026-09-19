import { useState, useEffect } from 'react';
import { Volume2, Square, AlertTriangle, Pill, Clock, Activity, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ResultadosDiagnostico({ resultados = [], historial = [] }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  if (!resultados || resultados.length === 0) return null;

  // Extraemos palabras clave
  let todasPalabrasClave = [];
  resultados.forEach(item => {
    let kw = [];
    try {
      kw = typeof item.keywords === 'string' ? JSON.parse(item.keywords) : (item.keywords || []);
    } catch (e) { }
    todasPalabrasClave = [...todasPalabrasClave, ...kw];
  });
  const palabrasUnicas = [...new Set(todasPalabrasClave)];

  const textoSintomas = palabrasUnicas.length > 0
    ? palabrasUnicas.slice(0, 3).join(", ")
    : "los malestares que mencionaste";

  // Función para Fuzzy Matching por palabras clave
  const matchDiagnostico = (terminoIA, diagnosticoReceta) => {
    if (!diagnosticoReceta) return false;
    const cleanIA = terminoIA.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
    const cleanReceta = diagnosticoReceta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);

    return cleanIA.some(word => cleanReceta.includes(word));
  };

  const textoMeds = (historial && historial.length > 0)
    ? historial.slice(0, 2).map(h => h.medicamento).join(" y ")
    : "analgésicos de libre venta";

  const medsPorAgotarse = historial ? historial.filter(h => h.cantidad_disponible < 5) : [];
  const alertaVozAgotado = medsPorAgotarse.length > 0
    ? ` Ten cuidado, noté que algunos medicamentos están por agotarse en tu botiquín.`
    : "";

  const generarGuion = () => {
    let base = `He terminado de escuchar tus malestares. Hemos registrado síntomas como: ${textoSintomas}. `;
    if (historial && historial.length > 0) {
      base += `Al revisar tu expediente real, notamos que anteriormente has tenido recetas de ${textoMeds}.`;
    } else {
      base += `No encontramos recetas previas recientes, pero te sugerimos mantener reposo y buscar ${textoMeds}.`;
    }
    base += alertaVozAgotado;
    base += ` Si necesitas surtir medicamentos, puedes buscar las farmacias más cercanas.`;
    return base;
  };

  const toggleAudio = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(generarGuion());
      utterance.lang = 'es-MX';
      utterance.rate = 0.9;
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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4f83f5] flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Resumen de Síntomas</h3>
            <p className="text-xs text-slate-400">Procesamiento de Lenguaje Natural + Algoritmo de Relevancia</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleAudio}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all shadow-sm ${isSpeaking
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300'
              : 'bg-blue-50 text-[#4f83f5] hover:bg-blue-100 border border-blue-200'
            }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> Detener Voz
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" /> Escuchar
            </>
          )}
        </button>
      </div>

      {/* Aviso Médico Legal */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Aviso importante:</strong> Los resultados presentados a continuación son únicamente informativos y <span className="underline decoration-amber-400">no sustituyen bajo ninguna circunstancia el diagnóstico, consulta la opinión de un profesional certificado</span>.
        </p>
      </div>

      {/* Sección: Lo que detectamos */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Malestares registrados</h4>
        <div className="flex flex-wrap gap-2">
          {palabrasUnicas.length > 0 ? (
            palabrasUnicas.map((kw, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-xs border border-slate-200 font-semibold shadow-sm">
                {kw}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs italic">No se detectaron palabras clave específicas.</span>
          )}
        </div>
      </div>

      {/* Sección: Historial y Recomendación agrupado por diagnóstico */}
      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#4f83f5]" /> Tu Historial Médico (Relacionado)
        </h4>
        <p className="text-slate-500 text-xs mb-4">
          De acuerdo con tu expediente, buscamos qué te recetaron anteriormente para cada padecimiento actual:
        </p>

        <div className="space-y-6">
          {resultados.map((resultadoIA, idxDiag) => {
            const diagIA = resultadoIA.termino_medico;
            // Encontrar historial que haga match con tokens
            const historialRelacionado = historial ? historial.filter(item => matchDiagnostico(diagIA, item.diagnostico)) : [];

            return (
              <div key={idxDiag} className={`p-5 rounded-2xl border transition-all ${idxDiag === 0
                  ? 'bg-gradient-to-r from-blue-50/50 to-white border-blue-200 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200'
                }`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#4f83f5] text-white">
                    {resultadoIA.codigo_cie10}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Para: {diagIA}
                  </h4>
                </div>

                {historialRelacionado.length > 0 ? (
                  <div className="space-y-2">
                    {historialRelacionado.map((item, idx) => {
                      const cant = item.cantidad_disponible || 0;
                      const sinStock = cant === 0;
                      const bajoStock = cant >= 1 && cant <= 5;

                      return (
                        <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-2.5">
                            <Pill className="w-4 h-4 text-[#4f83f5] flex-shrink-0" />
                            <div>
                              <span className="font-bold text-sm text-slate-800">{item.medicamento}</span>
                              <p className="text-xs text-slate-400 italic">En base a receta de: {item.diagnostico}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            {sinStock ? (
                              <span className="badge-caducado flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> Agotado (0)
                              </span>
                            ) : bajoStock ? (
                              <span className="badge-por_vencer flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" /> Por agotarse ({cant})
                              </span>
                            ) : (
                              <span className="badge-vigente flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> En inventario ({cant})
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-medium text-slate-400 italic">No tienes un historial previo registrado para este padecimiento.</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  );
}

