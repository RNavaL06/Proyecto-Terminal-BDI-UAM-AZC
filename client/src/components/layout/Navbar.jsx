import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useTour } from '../../context/TourContext';
import { useToasterStore } from 'react-hot-toast';
import {
  Activity,
  Camera,
  FileText,
  Pill,
  Mic,
  MapPin,
  Bell,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { iniciarTour } = useTour();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const profileRef = useRef(null);
  const alertsRef = useRef(null);

  // Capturar notificaciones globales
  const { toasts } = useToasterStore();
  const [alertas, setAlertas] = useState([]);
  const seenToastIds = useRef(new Set());

  useEffect(() => {
    const newAlerts = toasts.filter(t => !seenToastIds.current.has(t.id));
    if (newAlerts.length > 0) {
      newAlerts.forEach(t => seenToastIds.current.add(t.id));
      const formattedAlerts = newAlerts.map(t => ({ ...t, isRead: false }));
      setAlertas(prev => [...formattedAlerts, ...prev].slice(0, 15)); // Guardar últimas 15
    }
  }, [toasts]);

  const hasUnread = alertas.some(a => !a.isRead);

  const markAllAsRead = () => {
    setAlertas(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const deleteAlert = (e, id) => {
    e.stopPropagation();
    setAlertas(prev => prev.filter(a => a.id !== id));
  };

  const deleteAllAlerts = () => {
    setAlertas([]);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target)) {
        setIsAlertsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollability, 300);
    }
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: Activity, tourClass: '' },
    { path: '/escanear-receta', label: 'Escanear Receta', icon: Camera, tourClass: 'tour-escanear' },
    { path: '/recetas', label: 'Historial Recetas', icon: FileText, tourClass: '' },
    { path: '/botiquin', label: 'Mi Botiquín', icon: Pill, tourClass: 'tour-botiquin' },
    { path: '/sintomas-voz', label: 'Consulta por Voz', icon: Mic, tourClass: 'tour-sintomas' },
    { path: '/farmacias', label: 'Farmacias y Precios', icon: MapPin, tourClass: 'tour-farmacias' },
  ];

  return (
    <header className="sticky top-0 z-40 transition-colors duration-300 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo y Nombre */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform bg-gradient-to-tr from-[#4f83f5] to-blue-500 text-white">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black tracking-tight leading-none text-slate-900">BDI</span>
                <span className="text-xl font-bold tracking-tight leading-none text-[#4f83f5]">Salud</span>
              </div>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase mt-1 leading-none text-slate-400">Botiquín Digital</span>
            </div>
          </Link>

          {/* Enlaces de Navegación con Scroll (Desktop & Tablet) */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 items-center min-w-0 max-w-3xl mx-auto relative px-8">
              {/* Left Arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 z-10 p-1 bg-white text-slate-500 hover:text-[#4f83f5] transition-colors flex items-center justify-center rounded-full hover:bg-slate-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScrollability}
                className="flex-1 overflow-x-auto scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <nav className="flex items-center gap-2 border-b-4 border-slate-100 pb-1 w-max">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all ${item.tourClass} ${isActive
                            ? 'text-[#4f83f5] border-b-4 border-[#4f83f5] -mb-[5px]'
                            : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#4f83f5]' : 'text-slate-400'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right Arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 z-10 p-1 bg-white text-slate-500 hover:text-[#4f83f5] transition-colors flex items-center justify-center rounded-full hover:bg-slate-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* CSS to hide scrollbar for webkit */}
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          )}

          {/* Menú Usuario / Salir (Mobile & Desktop) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Enlace rápido a Recetas en móvil */}
                <Link
                  to="/recetas"
                  title="Historial de recetas"
                  className="md:hidden p-2 rounded-full transition-colors text-slate-500 hover:text-[#4f83f5] hover:bg-blue-50"
                >
                  <FileText className="w-5 h-5" />
                </Link>

                {/* Dropdown de Alertas (Campana) */}
                <div className="relative" ref={alertsRef}>
                  <button
                    onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                    title="Alertas y Notificaciones"
                    className="p-2 rounded-full transition-colors relative focus:outline-none text-slate-500 hover:text-amber-500 hover:bg-amber-50 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <Bell className="w-5 h-5" />
                    <span className={`absolute top-1.5 right-2 w-2 h-2 rounded-full border-2 bg-[#f27a71] border-white ${hasUnread ? 'animate-pulse' : 'hidden'}`}></span>
                  </button>

                  {isAlertsOpen && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[80vh]">
                      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <p className="text-sm font-bold text-slate-800">Alertas Recientes</p>
                        <div className="flex gap-3">
                          {hasUnread && (
                            <span
                              className="text-xs text-[#4f83f5] font-semibold cursor-pointer hover:underline"
                              onClick={markAllAsRead}
                            >
                              Marcar leídas
                            </span>
                          )}
                          {alertas.length > 0 && (
                            <span
                              className="text-xs text-rose-500 font-semibold cursor-pointer hover:underline"
                              onClick={deleteAllAlerts}
                            >
                              Eliminar todas
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-2.5 max-h-[50vh] custom-scrollbar">
                        {alertas.length === 0 ? (
                          <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-xs font-medium">No hay notificaciones recientes.</p>
                          </div>
                        ) : (
                          alertas.map(alerta => (
                            <div
                              key={alerta.id}
                              onClick={() => {
                                if (!alerta.isRead) {
                                  setAlertas(prev => prev.map(a => a.id === alerta.id ? { ...a, isRead: true } : a));
                                }
                              }}
                              className={`p-3 rounded-xl transition-colors cursor-pointer border shadow-sm relative overflow-hidden group ${!alerta.isRead ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 opacity-80'
                                } ${alerta.type === 'error' ? 'border-[#f27a71]/30' :
                                  alerta.type === 'success' ? 'border-[#4f83f5]/30' :
                                    'border-[#c9d6f0]/60'
                                }`}
                            >
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${alerta.type === 'error' ? 'bg-[#f27a71]' :
                                  alerta.type === 'success' ? 'bg-[#4f83f5]' :
                                    'bg-[#c9d6f0]'
                                }`}></div>

                              <div className="flex justify-between items-start ml-1">
                                <p className={`text-[11px] font-bold flex items-center gap-1.5 ${!alerta.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                                  {alerta.type === 'error' ? 'Alerta Importante' : alerta.type === 'success' ? 'Operación Exitosa' : 'Notificación'}
                                  {!alerta.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#f27a71] ml-1"></span>}
                                </p>
                                <button
                                  onClick={(e) => deleteAlert(e, alerta.id)}
                                  className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                  title="Eliminar notificación"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className={`text-xs mt-1 ml-1 leading-relaxed pr-2 ${!alerta.isRead ? 'text-slate-600' : 'text-slate-400'}`}>{String(alerta.message)}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-2 ml-1 uppercase tracking-wider">Hace un momento</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-slate-100 p-2 bg-slate-50 text-center">
                        <Link to="/configuracion" onClick={() => setIsAlertsOpen(false)} className="text-xs font-semibold text-[#4f83f5] hover:underline">
                          Configurar Alertas
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1 sm:pl-2 p-1 rounded-full transition-colors focus:outline-none hover:bg-slate-50 focus:ring-2 focus:ring-[#4f83f5]/20"
                  >
                    {user?.foto_perfil ? (
                      <img
                        src={user.foto_perfil}
                        alt={user.nombre_completo}
                        className="w-8 h-8 rounded-full border object-cover shadow-sm border-slate-200"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${isHome ? 'bg-white/20 text-white border-white/30' : 'bg-blue-50 text-[#4f83f5] border-blue-200'}`}>
                        {user?.nombre_completo?.charAt(0) || <User className="w-4 h-4" />}
                      </div>
                    )}
                    <span className={`hidden lg:block text-xs font-bold max-w-[130px] truncate mr-1 ${isHome ? 'text-white' : 'text-slate-700'}`}>
                      {user?.nombre_completo}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50 py-1">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user?.nombre_completo}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'Usuario BDI'}</p>
                      </div>

                      <Link
                        to="/configuracion"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-[#4f83f5] hover:bg-blue-50 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configuración
                      </Link>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          iniciarTour();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:text-[#4f83f5] hover:bg-blue-50 transition-colors text-left"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Ayuda / Tutorial
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
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
