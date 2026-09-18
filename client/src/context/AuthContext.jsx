import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bdi_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Restaurar sesión al cargar
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bdi_token');
      const storedUser = localStorage.getItem('bdi_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verificar contra el servidor
          const res = await api.get('/auth/me');
          if (res.usuario) {
            setUser(res.usuario);
            localStorage.setItem('bdi_user', JSON.stringify(res.usuario));
          }
        } catch (err) {
          console.warn('Sesión expirada o token inválido:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGoogle = async (credential) => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/google', { credential });
      if (res.exito && res.token) {
        localStorage.setItem('bdi_token', res.token);
        localStorage.setItem('bdi_user', JSON.stringify(res.usuario));
        setToken(res.token);
        setUser(res.usuario);
        toast.success(`¡Bienvenido, ${res.usuario.nombre_completo}!`);
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.message || 'Fallo al iniciar sesión con Google.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Inicio de sesión demo para pruebas académicas rápidas
  const loginDemo = async () => {
    try {
      setIsLoading(true);
      const res = await api.post('/auth/google', {
        credential: 'mock_demo_credential_token_jwt',
      });
      if (res.exito && res.token) {
        localStorage.setItem('bdi_token', res.token);
        localStorage.setItem('bdi_user', JSON.stringify(res.usuario));
        setToken(res.token);
        setUser(res.usuario);
        toast.success('Sesión iniciada en Modo Demostración');
        return true;
      }
    } catch (err) {
      toast.error('Error al iniciar modo demo.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bdi_token');
    localStorage.removeItem('bdi_user');
    setToken(null);
    setUser(null);
    toast.success('Sesión cerrada correctamente');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        loginWithGoogle,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
