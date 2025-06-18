import { useState, useRef, useCallback, useEffect } from 'react';

interface StableActionOptions {
  debounceMs?: number;
  clearDelayMs?: number;
  minChangeThreshold?: number;
}

export function useStableAction(options: StableActionOptions = {}) {
  const {
    debounceMs = 300,
    clearDelayMs = 3000,
    minChangeThreshold = 0.05
  } = options;

  const [currentAction, setCurrentAction] = useState<string>('');
  const [selectProgress, setSelectProgress] = useState<number>(0);
  
  const lastActionRef = useRef<string>('');
  const lastProgressRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const actionTimeRef = useRef<number>(0);
  const clearTimeoutRef = useRef<number | null>(null);

  const updateAction = useCallback((action: string, progress: number = 0) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Check if we should update based on debouncing
    if (timeSinceLastUpdate < debounceMs) {
      return;
    }

    const actionChanged = action !== lastActionRef.current;
    const progressChanged = Math.abs(progress - lastProgressRef.current) > minChangeThreshold;

    if (actionChanged || progressChanged) {
      // Clear any existing timeout
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
        clearTimeoutRef.current = null;
      }

      if (actionChanged && action) {
        setCurrentAction(action);
        lastActionRef.current = action;
        actionTimeRef.current = now;
        
        // Set up automatic clearing
        clearTimeoutRef.current = setTimeout(() => {
          setCurrentAction('');
          lastActionRef.current = '';
          clearTimeoutRef.current = null;
        }, clearDelayMs);
      }

      if (progressChanged) {
        setSelectProgress(progress);
        lastProgressRef.current = progress;
      }

      lastUpdateRef.current = now;
    }
  }, [debounceMs, clearDelayMs, minChangeThreshold]);

  const clearAction = useCallback(() => {
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
    setCurrentAction('');
    lastActionRef.current = '';
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentAction,
    selectProgress,
    updateAction,
    clearAction
  };
}
