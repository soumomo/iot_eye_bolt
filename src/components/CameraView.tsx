import React, { memo } from 'react';
import { Camera, AlertCircle, Loader2, Play, Square, Info } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  cameraError: string;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

const CameraView: React.FC<CameraViewProps> = memo(({
  videoRef,
  canvasRef,
  isActive,
  cameraError,
  isLoading,
  onStart,
  onStop
}) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-semibold text-white">Camera Feed</h2>
        </div>
        
        {/* Camera Controls with Instructions */}
        <div className="flex items-center gap-3">
          {/* Camera On/Off Button */}
          {!isActive ? (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}
          
          {/* Instructions Menu */}
          <div className="relative group">
            <button className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 backdrop-blur-lg border border-purple-400/50 rounded-xl shadow-lg shadow-purple-500/25 hover:scale-105 transition-all duration-300 text-purple-300 hover:text-purple-200">
              <Info className="w-5 h-5" />
            </button>
            
            {/* Floating Instructions Menu */}
            <div className="absolute top-12 right-0 w-72 bg-black/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-2xl shadow-purple-500/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
              <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                  💡
                </div>
                Instructions
              </h4>
              <div className="text-xs text-gray-200 space-y-2">
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span><span className="font-bold text-green-300">Right eye blink:</span> Navigate UP</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span><span className="font-bold text-blue-300">Left eye blink:</span> Navigate DOWN</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span><span className="font-bold text-purple-300">Both eyes blink:</span> SELECT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 text-lg font-medium mb-2">Camera Error</p>
              <p className="text-gray-400 text-sm max-w-sm">{cameraError}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-blue-400 text-lg font-medium">Initializing Camera...</p>
            </div>
          </div>
        ) : !isActive ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Camera is off</p>
              <p className="text-gray-500 text-sm mt-2">Click "Start Detection" to begin</p>
            </div>
          </div>
        ) : null}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-0"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Instructions overlay */}
        {isActive && (
          <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 text-white text-sm space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Right eye blink = UP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Left eye blink = DOWN</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Both eyes blink = SELECT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CameraView.displayName = 'CameraView';

export default CameraView;