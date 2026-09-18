import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, 
  Camera, 
  FileText, 
  Pill, 
  Mic, 
  MapPin, 
  Bell, 
  LogOut,
  User
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/escanear-receta', label: 'Escanear Receta', icon: Camera },
    { path: '/recetas', label: 'Historial Recetas', icon: FileText },
    { path: '/botiquin', label: 'Mi Botiquín', icon: Pill },
    { path: '/sintomas-voz', label: 'Consulta por Voz', icon: Mic },
    { path: '/farmacias', label: 'Farmacias y Precios', icon: MapPin },
    { path: '/notificaciones', label: 'Alertas', icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#497dfe] to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                BDI <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-[#497dfe] font-bold border border-blue-200">Salud</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">Botiquín Digital</p>
            </div>
          </Link>

          {/* Enlaces de Navegación (Desktop) */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-[#497dfe] border border-blue-200/60 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#497dfe]' : 'text-slate-400'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Menú Usuario / Salir (Mobile & Desktop) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Enlace rápido a Recetas / Alertas en móvil */}
                <Link
                  to="/recetas"
                  title="Historial de recetas"
                  className="md:hidden p-2 text-slate-500 hover:text-[#497dfe] hover:bg-blue-50 rounded-full transition-colors"
                >
                  <FileText className="w-5 h-5" />
                </Link>

                <Link
                  to="/notificaciones"
                  title="Alertas de caducidad"
                  className="md:hidden p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-1 sm:pl-2">
                  {user?.foto_perfil ? (
                    <img
                      src={user.foto_perfil}
                      alt={user.nombre_completo}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#497dfe] flex items-center justify-center font-bold text-xs border border-blue-200">
                      {user?.nombre_completo?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="hidden lg:block text-xs font-bold text-slate-700 max-w-[130px] truncate">
                    {user?.nombre_completo}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-xs sm:text-sm py-2 px-5">
                Iniciar Sesión
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
