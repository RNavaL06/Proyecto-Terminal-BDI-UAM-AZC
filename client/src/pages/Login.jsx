import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import loginImage from '../assets/login.webp';

export default function Login() {
  const { loginWithGoogle, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('¡Bienvenido al Botiquín Digital!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Error al iniciar sesión con Google.');
    }
  };

  const handleDemoClick = async () => {
    try {
      await loginDemo();
      toast.success('Sesión de demostración iniciada.');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Error al ingresar en modo demo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center w-full px-0 sm:px-4 sm:py-6">
      <div className="flex flex-col w-full h-[100dvh] sm:h-auto max-w-md mx-auto overflow-hidden bg-white sm:shadow-2xl sm:rounded-3xl border-0 sm:border border-slate-100">
        
        {/* --- SECCIÓN SUPERIOR: Fondo Azul Brand y Doctora (Diseño Ricardo) --- */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] bg-[#497dfe] flex items-end justify-center overflow-hidden">
          
          {/* Círculos decorativos de fondo */}
          <div className="absolute top-[10%] left-[12%] w-24 h-24 bg-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute top-[18%] right-[10%] w-14 h-14 bg-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[22%] -left-[8%] w-36 h-36 bg-white/10 rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[14%] right-[14%] w-16 h-16 bg-white/10 rounded-full pointer-events-none"></div>

          {/* Imagen de Doctora anclada al pie del bloque azul */}
          <img 
            src={loginImage} 
            alt="Doctora Asistente BDI" 
            className="relative z-10 w-[92%] max-w-[340px] h-[92%] object-contain object-bottom pointer-events-none select-none drop-shadow-md"
          />
        </div>

        {/* --- SECCIÓN INFERIOR: Textos y Botones de Acceso --- */}
        <div className="shrink-0 bg-white flex flex-col items-center justify-start px-6 sm:px-8 pt-6 pb-8 z-20">
          
          {/* Título Principal */}
          <h1 className="text-2xl sm:text-3xl font-black text-[#2e2b3c] tracking-wider uppercase mb-2 text-center leading-tight">
            Botiquín Digital
          </h1>
          
          {/* Línea Divisoria Decorativa */}
          <div className="w-14 h-[3px] bg-[#497dfe] rounded-full mb-4"></div>
          
          {/* Subtítulo descriptivo */}
          <p className="text-xs sm:text-sm text-slate-500 text-center leading-relaxed max-w-[280px] mb-6 font-medium">
            Administra tus medicamentos, compara precios y encuentra farmacias cercanas desde tu dispositivo móvil.
          </p>

          {/* Botón Principal: Google OAuth */}
          <div className="w-full max-w-[270px] flex justify-center mb-3">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => toast.error('Error al conectar con Google.')}
              shape="pill"
              size="large"
              width="270"
              text="continue_with"
            />
          </div>

          {/* Separador */}
          <div className="relative flex items-center justify-center w-full max-w-[270px] my-2">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
              O modo evaluador
            </span>
          </div>

          {/* Botón Modo Demostración */}
          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full max-w-[270px] py-3 px-4 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 font-bold rounded-full text-xs transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
          >
            <UserCheck className="w-4 h-4 text-[#497dfe]" />
            Acceso Rápido (Modo Demo)
          </button>

          {/* Pie Académico */}
          <div className="mt-5 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              UAM Azcapotzalco (CBI) — Proyecto Terminal
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
