import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BlinkDetectionEngine } from '../utils/blinkDetection';
import StatusDisplay from './StatusDisplay';
import ControlPanel from './ControlPanel';
import CameraView from './CameraView';

const EyeBlinkDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionEngineRef = useRef<BlinkDetectionEngine | null>(null);
  const animationFrameRef = useRef<number>();

  const [isActive, setIsActive] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [actionTime, setActionTime] = useState<number>(0);
  const [selectProgress, setSelectProgress] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Add refs to track previous values to prevent unnecessary re-renders
  const lastActionRef = useRef<string>('');
  const lastProgressRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setCameraError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(void 0);
          }
        });
      }
      
      // Initialize detection engine
      detectionEngineRef.current = new BlinkDetectionEngine();
      await detectionEngineRef.current.initialize();
      
      setIsActive(true);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsActive(false);
    setCurrentAction('');
    setSelectProgress(0);
  }, []);

  const startDetection = useCallback(() => {
    let lastProcessTime = 0;
    const TARGET_FPS = 15; // Reduce from 30fps to 15fps to prevent UI shaking
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    
    const detect = async () => {
      console.log("1. Detect loop started.");
      if (!videoRef.current || !canvasRef.current || !detectionEngineRef.current || !isActive) {
        console.log("2. Bailing out: refs or isActive is false.");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const now = performance.now();
      
      console.log(`3. Video ready state: ${video.readyState}`);
      if (!ctx || video.readyState < 2) { // HAVE_CURRENT_DATA
        console.log("4. Bailing out: no context or not enough video data.");
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // Throttle processing to target FPS
      if (now - lastProcessTime < FRAME_INTERVAL) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }
      
      lastProcessTime = now;

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw flipped video frame
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Process frame for blink detection
      try {
        console.log("5. Calling processFrame.");
        const result = await detectionEngineRef.current.processFrame(video);
        console.log("6. processFrame finished. Result:", result);
        
        if (result) {
          const { action, selectProgress: progress } = result;
          const now = Date.now();
          
          // Only update if there's a significant change to prevent rapid re-renders
          const actionChanged = action !== lastActionRef.current;
          const progressChanged = Math.abs(progress - lastProgressRef.current) > 0.01; // 1% threshold
          const shouldUpdate = now - lastUpdateRef.current > 100; // Max 10 updates per second
          
          if ((actionChanged || progressChanged) && shouldUpdate) {
            if (actionChanged && action) {
              setCurrentAction(action);
              setActionTime(now);
              lastActionRef.current = action;
            }
            
            if (progressChanged) {
              setSelectProgress(progress);
              lastProgressRef.current = progress;
            }
            
            lastUpdateRef.current = now;
          }
          
          // Clear action after 2 seconds
          if (currentAction && now - actionTime > 2000) {
            setCurrentAction('');
            lastActionRef.current = '';
          }
        }
      } catch (error) {
        console.error('Detection error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [isActive, currentAction, actionTime]);

  useEffect(() => {
    if (isActive) {
      startDetection();
    }
  }, [isActive, startDetection]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera View */}
        <div className="lg:col-span-2">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isActive={isActive}
            cameraError={cameraError}
            isLoading={isLoading}
          />
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          <ControlPanel
            isActive={isActive}
            isLoading={isLoading}
            onStart={startCamera}
            onStop={stopCamera}
          />
          
          <StatusDisplay
            currentAction={currentAction}
            selectProgress={selectProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default EyeBlinkDetector;