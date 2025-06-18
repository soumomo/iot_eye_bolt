import React from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import ModeSelectionPage from './components/ModeSelectionPage';
import DetectionPage from './components/DetectionPage';

const AppContent: React.FC = () => {
  const { currentScreen } = useAppContext();

  return (
    <>
      {currentScreen === 'mode-selection' && <ModeSelectionPage />}
      {currentScreen === 'detection' && <DetectionPage />}
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;