import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import EyeBlinkDetector from './EyeBlinkDetector';
import { ArrowLeft, Eye } from 'lucide-react';

const DetectionPage: React.FC = () => {
  const { selectedMode, setCurrentScreen } = useAppContext();

  const handleBackToModeSelection = () => {
    setCurrentScreen('mode-selection');
  };

  const getModeTitle = () => {
    switch (selectedMode) {
      case 'keyword':
        return 'Keyword Mode';
      case 'number':
        return 'Number Mode';
      case 'letter':
        return 'Letter Mode';
      default:
        return 'Detection Mode';
    }
  };

  const getModeDescription = () => {
    switch (selectedMode) {
      case 'keyword':
        return 'Use eye blinks for yes/no responses and basic commands';
      case 'number':
        return 'Select numbers 0-9 using eye blink patterns';
      case 'letter':
        return 'Select letters A-Z using eye blink combinations';
      default:
        return 'Control your interface with eye movements';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToModeSelection}
            className="inline-flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Mode Selection</span>
          </button>
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm font-medium">{getModeTitle()}</span>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Eye Blink Detection
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {getModeDescription()}. Blink your left eye for DOWN, right eye for UP, and both eyes for SELECT.
          </p>
        </div>

        {/* Detection Component */}
        <EyeBlinkDetector />
      </div>
    </div>
  );
};

export default DetectionPage;
