import 'regenerator-runtime/runtime';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { TourProvider } from './context/TourContext';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1082910291029-mockclientid.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <AccessibilityProvider>
            <TourProvider>
              <App />
              <Toaster
              position="top-right"
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '16px',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #c9d6f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#4f83f5',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f27a71',
                  secondary: '#ffffff',
                },
              },
            }}
          />
            </TourProvider>
          </AccessibilityProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
