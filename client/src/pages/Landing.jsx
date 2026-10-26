import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  User, 
  Mail, 
  GraduationCap, 
  MapPin, 
  Building, 
  ShieldCheck, 
  HeartPulse, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export default function Landing() {
  const [mostrarEquipo, setMostrarEquipo] = useState(false);
  const equipoRef = useRef(null);

  const handleToggleEquipo = () => {
    const nuevoEstado = !mostrarEquipo;
    setMostrarEquipo(nuevoEstado);
    if (nuevoEstado) {
      setTimeout(() => {
        equipoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">

      {/* --- HERO SECTION --- */}
      <section className="relative w-full bg-[#4f83f5] overflow-hidden pt-12 pb-24 px-6 sm:px-12 rounded-b-[40px] shadow-lg">
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute top-[20%] right-[10%] w-20 h-20 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] -left-[5%] w-64 h-64 bg-white/10 rounded-full pointer-events-none"></div>
        <div className="absolute top-[40%] right-[30%] w-12 h-12 bg-white/10 rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center pt-8">
          <span className="inline-block bg-white/20 text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 backdrop-blur-md border border-white/30">
            Universidad Autónoma Metropolitana
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-wider uppercase mb-6 drop-shadow-md">
            Botiquín Digital Inteligente
          </h1>

          <p className="text-white/90 text-sm sm:text-lg font-medium max-w-2xl leading-relaxed">
            Una plataforma inteligente para organizar tus medicamentos, digitalizar recetas y gestionar tratamientos médicos en el hogar.
          </p>
        </div>
      </section>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-20 pb-16 flex-1 w-full">

        {/* El Problema y La Propuesta (Tarjetas Blancas) */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Tarjeta Problema */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
                <HeartPulse className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-[#2e2b3c] uppercase tracking-wider mb-2">El Problema</h3>
              <div className="w-10 h-1.5 bg-[#4f83f5] rounded-full mb-5"></div>
              <p className="text-slate-500 font-medium leading-relaxed">
                El abandono de tratamientos, la caducidad oculta de medicamentos en casa y la pérdida de recetas físicas provocan graves riesgos a la salud pública y enormes pérdidas económicas para los pacientes y el sistema de salud.
              </p>
            </div>
          </div>

          {/* Tarjeta Solución */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-xl font-black text-[#2e2b3c] uppercase tracking-wider mb-2">La Propuesta</h3>
              <div className="w-10 h-1.5 bg-[#4f83f5] rounded-full mb-5"></div>
              <p className="text-slate-500 font-medium leading-relaxed">
                Desarrollamos el BDI, una herramienta tecnológica que automatiza inventarios, procesa recetas con inteligencia artificial y brinda trazabilidad clínica fundamentada en el catálogo CIE-10 de la OMS.
              </p>
            </div>
          </div>
        </div>

        {/* --- ACCIONES CENTRALES --- */}
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-6">
          {/* Botón Principal: Comenzar / Iniciar Sesión */}
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#4f83f5] hover:bg-blue-600 text-white font-black uppercase tracking-wider px-10 py-4 rounded-full shadow-lg shadow-blue-300/40 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-sm sm:text-base"
          >
            Comenzar e Iniciar Sesión <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Botón para Desplegar / Ocultar Equipo Académico */}
          <button
            type="button"
            onClick={handleToggleEquipo}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-600 hover:text-[#4f83f5] bg-white hover:bg-blue-50/70 border border-slate-200/80 shadow-sm transition-all duration-200 hover:border-blue-200 active:scale-95 cursor-pointer mt-2"
          >
            <span>{mostrarEquipo ? 'Ocultar información académica' : 'Conoce al equipo académico y asesores'}</span>
            {mostrarEquipo ? (
              <ChevronUp className="w-4 h-4 text-[#4f83f5]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#4f83f5]" />
            )}
          </button>
        </div>

        {/* --- SECCIÓN DESPLEGABLE: EQUIPO ACADÉMICO --- */}
        {mostrarEquipo && (
          <div
            ref={equipoRef}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mt-8 animate-fade-in transition-all"
          >
            <div className="text-center mb-10">
              <span className="text-[#4f83f5] font-bold text-xs sm:text-sm tracking-widest uppercase mb-2 block">Proyecto Terminal</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#2e2b3c] uppercase tracking-wider">Equipo Académico</h2>
              <div className="w-16 h-1.5 bg-[#4f83f5] rounded-full mx-auto mt-4"></div>
              <p className="text-slate-500 font-medium mt-4 text-sm sm:text-base">
                División de Ciencias Básicas e Ingeniería (CBI)
              </p>
            </div>

            {/* Listado de Autores */}
            <div className="mb-12">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                <GraduationCap className="text-[#4f83f5] w-6 h-6" /> Autores
              </h3>
              <div className="grid md:grid-cols-2 gap-6">

                {/* Autor 1 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0 border border-slate-200">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg uppercase">Cristian Emanuel Ceron Franco</h4>
                      <p className="text-sm font-bold text-[#4f83f5]">Ingeniería en Computación</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
                      Matrícula: 2232002614
                    </span>
                  </div>
                </div>

                {/* Autor 2 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0 border border-slate-200">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-lg uppercase">Ricardo Nava Lima</h4>
                      <p className="text-sm font-bold text-[#4f83f5]">Ingeniería en Computación</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <span className="bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
                      Matrícula: 2232000209
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Listado de Asesores */}
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-6 flex items-center gap-2">
                <Building className="text-emerald-500 w-6 h-6" /> Dirección Académica
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Asesor 1 */}
                <div className="bg-white border-l-4 border-[#4f83f5] rounded-r-2xl p-6 shadow-sm border-y border-r border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#4f83f5] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md mb-4 inline-block">
                      Asesora Principal
                    </span>
                    <h4 className="font-black text-slate-800 text-base sm:text-lg mb-1 uppercase">Dra. Angeles Belém Priego Sánchez</h4>
                    <p className="text-sm text-slate-500 font-bold mb-6">Profesora Titular</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span>Departamento de Sistemas, UAM Azcapotzalco</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>abps@azc.uam.mx</span>
                    </div>
                  </div>
                </div>

                {/* Asesor 2 */}
                <div className="bg-white border-l-4 border-emerald-400 rounded-r-2xl p-6 shadow-sm border-y border-r border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md mb-4 inline-block">
                      Coasesor
                    </span>
                    <h4 className="font-black text-slate-800 text-base sm:text-lg mb-1 uppercase">Dr. Aron de la Cruz Vázquez</h4>
                    <p className="text-sm text-slate-500 font-bold mb-6">Profesor Titular</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">Escuela de Tecnologías Digitales y Aplicadas, UNACH</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>aron.cruz@unach.mx</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer Minimalista */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
        © {new Date().getFullYear()} Botiquín Digital Inteligente — UAM Azcapotzalco
      </footer>
    </div>
  );
}
