import React from 'react';
import { useAppContext, CommunicationMode } from '../contexts/AppContext';
import { MessageSquare, Hash, Type, ArrowRight } from 'lucide-react';

const ModeSelectionPage: React.FC = () => {
  const { setSelectedMode, setCurrentScreen } = useAppContext();

  const handleModeSelect = (mode: CommunicationMode) => {
    setSelectedMode(mode);
    setCurrentScreen('detection');
  };

  const modes = [
    {
      id: 'keyword' as CommunicationMode,
      title: 'Keyword Mode',
      description: 'Simple yes/no responses and basic commands',
      icon: MessageSquare,
      color: 'from-green-400 to-blue-500',
      hoverColor: 'hover:from-green-500 hover:to-blue-600'
    },
    {
      id: 'number' as CommunicationMode,
      title: 'Number Mode',
      description: 'Select numbers 0-9 for numerical input',
      icon: Hash,
      color: 'from-purple-400 to-pink-500',
      hoverColor: 'hover:from-purple-500 hover:to-pink-600'
    },
    {
      id: 'letter' as CommunicationMode,
      title: 'Letter Mode',
      description: 'Select letters A-Z for text communication',
      icon: Type,
      color: 'from-orange-400 to-red-500',
      hoverColor: 'hover:from-orange-500 hover:to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Netra Vaani
          </h1>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-4">
            Choose Your Communication Mode
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select how you want to communicate using eye blink detection. Each mode is optimized for different types of interactions.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {modes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`
                  relative group cursor-pointer transform transition-all duration-300 
                  hover:scale-105 hover:-translate-y-2
                `}
              >
                {/* Card Background */}
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 h-full">
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {mode.title}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Select Button */}
                  <div className={`inline-flex items-center gap-2 text-white font-semibold bg-gradient-to-r ${mode.color} ${mode.hoverColor} px-6 py-3 rounded-xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-500/25`}>
                    <span>Select Mode</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl`} />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-400 text-sm">
            Use eye blinks to navigate: Left eye for DOWN, Right eye for UP, Both eyes for SELECT
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionPage;
