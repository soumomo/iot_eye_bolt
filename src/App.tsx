import React from 'react';
import EyeBlinkDetector from './components/EyeBlinkDetector';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Eye Blink Detection
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Control your interface with eye movements. Blink your left eye for DOWN, right eye for UP, and both eyes for SELECT.
          </p>
        </div>
        <EyeBlinkDetector />
      </div>
    </div>
  );
}

export default App;