import React, { memo } from 'react';
import { Eye, ArrowUp, ArrowDown, MousePointer } from 'lucide-react';

interface StatusDisplayProps {
  currentAction: string;
  selectProgress: number;
}

const StatusDisplay: React.FC<StatusDisplayProps> = memo(({
  currentAction,
  selectProgress
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'UP':
        return <ArrowUp className="w-8 h-8" />;
      case 'DOWN':
        return <ArrowDown className="w-8 h-8" />;
      case 'SELECT':
        return <MousePointer className="w-8 h-8" />;
      default:
        return <Eye className="w-8 h-8" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'UP':
        return 'from-green-500 to-emerald-600';
      case 'DOWN':
        return 'from-blue-500 to-cyan-600';
      case 'SELECT':
        return 'from-purple-500 to-violet-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">Status</h3>
      
      <div className="space-y-6">
        {/* Current Action Display */}
        <div className="text-center">
          <div 
            key={currentAction || 'waiting'}
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${getActionColor(currentAction)} mb-4 shadow-lg transition-all duration-300 ease-out transform`}
            style={{ transform: 'translateZ(0)' }} // Force hardware acceleration
          >
            <div className="text-white transition-all duration-200">
              {getActionIcon(currentAction)}
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-2 transition-all duration-200">
            {currentAction || 'Waiting...'}
          </div>
          <div className="text-gray-400 text-sm transition-all duration-200">
            {currentAction ? 'Action Detected' : 'No action detected'}
          </div>
        </div>

        {/* Select Progress Bar */}
        {selectProgress > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">SELECT Progress</span>
              <span className="text-purple-400 text-sm">{Math.round(selectProgress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600 transition-all duration-300 ease-out transform"
                style={{ 
                  width: `${Math.min(selectProgress * 100, 100)}%`,
                  transform: `translateZ(0)` // Force hardware acceleration
                }}
              />
            </div>
            <div className="text-gray-400 text-xs mt-2 text-center">
              Hold both eyes closed for 2 seconds
            </div>
          </div>
        )}

        {/* Action History */}
        <div className="bg-gray-800 rounded-xl p-4">
          <h4 className="text-white font-medium mb-3">Recent Actions</h4>
          <div className="space-y-2 min-h-[2.5rem]"> {/* Fixed minimum height */}
            <div className="flex items-center gap-3 text-sm transition-all duration-300 ease-out">
              {currentAction ? (
                <>
                  <div 
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${getActionColor(currentAction)} transition-all duration-300`}
                    style={{ transform: 'translateZ(0)' }}
                  ></div>
                  <span className="text-gray-300 transition-all duration-300">{currentAction}</span>
                  <span className="text-gray-500 ml-auto transition-all duration-300">Just now</span>
                </>
              ) : (
                <span className="text-gray-500 text-center py-1 w-full transition-all duration-300">
                  No recent actions
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

StatusDisplay.displayName = 'StatusDisplay';

export default StatusDisplay;