import React from 'react';
import { NavLink } from 'react-router-dom';
import { Pill, Activity, Scan, DollarSign, Home } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe md:hidden">
      <nav 
        aria-label="Navegación móvil inferior"
        className="bg-white w-full shadow-[0_-4px_10px_rgba(0,0,0,0.06)]"
      >
        <div className="flex justify-evenly items-center h-[72px] px-2 max-w-md mx-auto relative">
          <NavItem to="/" icon={<Home />} label="Inicio" />
          <NavItem to="/botiquin" icon={<Pill />} label="Botiquín" />
          <NavItem to="/escanear-receta" icon={<Scan />} label="Escanear" />
          <NavItem to="/sintomas-voz" icon={<Activity />} label="Síntomas" />
          <NavItem to="/farmacias" icon={<DollarSign />} label="Precios" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className="relative flex items-center justify-center w-[64px] h-[72px] group focus:outline-none"
    >
      {({ isActive }) => (
        <>
          {/* Bulge Background for active state */}
          <div 
            className={`absolute -top-[20px] w-[56px] h-[56px] bg-white rounded-full transition-all duration-300 ease-out z-0 ${
              isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0 translate-y-4'
            }`}
          />
          
          {/* Icon Container */}
          <div 
            className={`absolute z-10 flex items-center justify-center transition-all duration-300 ease-out ${
              isActive 
                ? 'top-[-12px] w-[40px] h-[40px] bg-gradient-to-tr from-[#4f83f5] to-blue-400 text-white rounded-full shadow-md shadow-blue-500/30' 
                : 'top-[16px] w-[32px] h-[32px] text-slate-400 bg-transparent'
            }`}
          >
            {React.cloneElement(icon, { 
              className: `transition-all duration-300 ${
                isActive ? 'w-5 h-5 stroke-[2.5]' : 'w-6 h-6 stroke-[1.8] group-hover:text-slate-600'
              }` 
            })}
          </div>

          {/* Label */}
          <span 
            className={`absolute bottom-[10px] text-[10px] tracking-tight transition-all duration-300 ${
              isActive 
                ? 'font-bold text-slate-800' 
                : 'font-medium text-slate-400 group-hover:text-slate-600'
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
