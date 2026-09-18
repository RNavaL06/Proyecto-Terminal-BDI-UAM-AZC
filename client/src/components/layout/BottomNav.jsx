import React from 'react';
import { NavLink } from 'react-router-dom';
import { Pill, Activity, Scan, DollarSign, Home, Bell } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav 
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe md:hidden"
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {/* Inicio */}
        <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Inicio" />

        {/* Botiquín */}
        <NavItem to="/botiquin" icon={<Pill className="w-5 h-5" />} label="Botiquín" />

        {/* Botón Central Elevado - Escáner (Estilo Ricardo) */}
        <NavLink
          to="/escanear-receta"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center -mt-6 group focus:outline-none`
          }
        >
          <div className="bg-rose-400 hover:bg-rose-500 active:scale-95 text-white p-3.5 rounded-full shadow-lg shadow-rose-400/40 transition-all duration-200 ring-4 ring-white">
            <Scan className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-1 tracking-tight">Escanear</span>
        </NavLink>

        {/* Síntomas por voz */}
        <NavItem to="/sintomas-voz" icon={<Activity className="w-5 h-5" />} label="Síntomas" />

        {/* Farmacias y Precios */}
        <NavItem to="/farmacias" icon={<DollarSign className="w-5 h-5" />} label="Precios" />
      </div>
    </nav>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-14 py-1 gap-1 transition-all duration-200 active:scale-95 ${
          isActive 
            ? 'text-[#497dfe] font-bold' 
            : 'text-slate-400 hover:text-slate-600 font-medium'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-50 text-[#497dfe]' : ''}`}>
            {icon}
          </div>
          <span className="text-[10px] tracking-tight truncate w-full text-center leading-none">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
