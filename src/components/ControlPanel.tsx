import React from 'react';
import { Play, Square, Loader2 } from 'lucide-react';

interface ControlPanelProps {
  isActive: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isActive,
  isLoading,
  onStart,
  onStop
}) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">Controls</h3>
      
      <div className="space-y-4">
        {!isActive ? (
          <button
            onClick={onStart}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Detection
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Square className="w-5 h-5" />
            Stop Detection
          </button>
        )}
        
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-white font-medium mb-3">Instructions</h4>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <span>Blink right eye for UP command</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span>Blink left eye for DOWN command</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
              <span>Hold both eyes closed for 2s to SELECT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;