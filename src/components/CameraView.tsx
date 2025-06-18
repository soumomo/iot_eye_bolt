import React from 'react';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  cameraError: string;
  isLoading: boolean;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  isActive,
  cameraError,
  isLoading
}) => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-semibold text-white">Camera Feed</h2>
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
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-0"
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
};

export default CameraView;