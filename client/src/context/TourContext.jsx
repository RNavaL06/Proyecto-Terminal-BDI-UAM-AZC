import { createContext, useContext, useState } from 'react';

const TourContext = createContext();

export const useTour = () => {
  return useContext(TourContext);
};

export const TourProvider = ({ children }) => {
  const [runTour, setRunTour] = useState(false);

  const iniciarTour = () => {
    setRunTour(true);
  };

  const detenerTour = () => {
    setRunTour(false);
  };

  return (
    <TourContext.Provider value={{ runTour, iniciarTour, detenerTour }}>
      {children}
    </TourContext.Provider>
  );
};
