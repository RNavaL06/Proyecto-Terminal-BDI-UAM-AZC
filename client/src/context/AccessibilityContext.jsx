import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  return useContext(AccessibilityContext);
};

export const AccessibilityProvider = ({ children }) => {
  // Estados iniciales buscando en localStorage
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('bdi_fontSize') || 'normal'; // 'normal', 'grande', 'extragrande'
  });
  
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('bdi_highContrast') === 'true';
  });

  const [voiceFeedback, setVoiceFeedback] = useState(() => {
    return localStorage.getItem('bdi_voiceFeedback') === 'true';
  });

  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    return localStorage.getItem('bdi_voiceSpeed') || 'normal'; // 'lenta', 'normal'
  });

  // Efecto para Tamaño de Letra
  useEffect(() => {
    localStorage.setItem('bdi_fontSize', fontSize);
    
    // Removemos clases previas
    document.documentElement.classList.remove('font-size-normal', 'font-size-grande', 'font-size-extragrande');
    // Agregamos la nueva clase
    document.documentElement.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  // Efecto para Alto Contraste
  useEffect(() => {
    localStorage.setItem('bdi_highContrast', highContrast);
    
    if (highContrast) {
      document.documentElement.classList.add('theme-high-contrast');
    } else {
      document.documentElement.classList.remove('theme-high-contrast');
    }
  }, [highContrast]);

  // Efectos para Voz (Solo se guarda en Storage, la lógica de lectura la manejan los componentes o aquí mismo)
  useEffect(() => {
    localStorage.setItem('bdi_voiceFeedback', voiceFeedback);
  }, [voiceFeedback]);

  useEffect(() => {
    localStorage.setItem('bdi_voiceSpeed', voiceSpeed);
  }, [voiceSpeed]);

  // Función global para leer textos en voz alta
  const speak = (text) => {
    if (!voiceFeedback) return;
    if (!('speechSynthesis' in window)) return;

    // Cancelar lecturas previas
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = voiceSpeed === 'lenta' ? 0.7 : 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const value = {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    voiceFeedback,
    setVoiceFeedback,
    voiceSpeed,
    setVoiceSpeed,
    speak
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
