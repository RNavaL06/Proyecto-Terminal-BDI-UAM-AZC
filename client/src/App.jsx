import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import BottomNav from './components/layout/BottomNav';
import AppTour from './components/layout/AppTour';
import Dashboard from './pages/Dashboard';
import EscanerReceta from './pages/EscanerReceta';
import HistorialRecetas from './pages/HistorialRecetas';
import RecetaDetalle from './pages/RecetaDetalle';
import Botiquin from './pages/Botiquin';
import SintomasVoz from './pages/SintomasVoz';
import Farmacias from './pages/Farmacias';
import Configuracion from './pages/Configuracion';
import Login from './pages/Login';

// Componente para proteger rutas privadas
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Verificando sesión...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <AppTour />
      {isAuthenticated && <Navbar />}

      <main className={`flex-1 ${isAuthenticated ? 'pb-24 md:pb-8' : ''}`}>
        <Routes>
          {/* Ruta pública */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/escanear-receta"
            element={
              <PrivateRoute>
                <EscanerReceta />
              </PrivateRoute>
            }
          />
          <Route
            path="/recetas"
            element={
              <PrivateRoute>
                <HistorialRecetas />
              </PrivateRoute>
            }
          />
          <Route
            path="/recetas/:id"
            element={
              <PrivateRoute>
                <RecetaDetalle />
              </PrivateRoute>
            }
          />
          <Route
            path="/botiquin"
            element={
              <PrivateRoute>
                <Botiquin />
              </PrivateRoute>
            }
          />
          <Route
            path="/sintomas-voz"
            element={
              <PrivateRoute>
                <SintomasVoz />
              </PrivateRoute>
            }
          />
          <Route
            path="/farmacias"
            element={
              <PrivateRoute>
                <Farmacias />
              </PrivateRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <PrivateRoute>
                <Configuracion />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Pie de página en escritorio */}
      {isAuthenticated && (
        <footer className="hidden md:block bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400">
          <p>Botiquín Digital Inteligente (BDI) — Universidad Autónoma Metropolitana (CBI)</p>
        </footer>
      )}

      {/* Barra de navegación inferior en móviles (Estilo Ricardo) */}
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
