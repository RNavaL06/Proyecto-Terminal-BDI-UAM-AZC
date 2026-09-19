import { Joyride, STATUS } from 'react-joyride';
import { useTour } from '../../context/TourContext';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AppTour() {
  const { runTour, detenerTour } = useTour();
  const { speak, voiceFeedback } = useAccessibility();

  const steps = [
    {
      target: 'body',
      placement: 'center',
      title: '¡Bienvenido al Botiquín Digital!',
      content: 'Este es un recorrido rápido para enseñarte cómo utilizar las herramientas de la aplicación. Usa el botón "Siguiente" para continuar.',
      disableBeacon: true,
    },
    {
      target: '.tour-escanear',
      content: 'Toca aquí para tomarle una foto a tu receta médica. Nosotros nos encargaremos de leerla y extraer los medicamentos por ti.',
    },
    {
      target: '.tour-botiquin',
      content: 'Aquí podrás ver todos los medicamentos que tienes guardados en casa, así como sus fechas de caducidad.',
    },
    {
      target: '.tour-sintomas',
      content: 'Si te sientes mal, entra aquí y presiona el micrófono. Háblale al asistente y él analizará tus síntomas.',
    },
    {
      target: '.tour-farmacias',
      content: 'Usa esta sección para encontrar farmacias abiertas cerca de tu ubicación y ver comparaciones de precios.',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type, step } = data;

    // Si el asistente de voz está activo, leeremos el contenido del globo actual
    if (type === 'step:after' || type === 'tour:start') {
      if (voiceFeedback && step && step.content) {
        speak(step.content);
      }
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      detenerTour();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={runTour}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar Tour',
      }}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.65)',
          primaryColor: '#4f83f5',
          textColor: '#334155',
          zIndex: 100000,
        },
        tooltipContainer: {
          textAlign: 'left',
          fontSize: '15px',
          fontWeight: '500',
        },
        buttonNext: {
          backgroundColor: '#4f83f5',
          fontSize: '14px',
          fontWeight: 'bold',
          borderRadius: '8px',
          padding: '10px 16px',
        },
        buttonBack: {
          color: '#64748b',
          fontSize: '14px',
          fontWeight: 'bold',
        },
        buttonSkip: {
          color: '#f27a71',
          fontSize: '14px',
          fontWeight: 'bold',
        }
      }}
    />
  );
}
