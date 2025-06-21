import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import EyeBlinkDetector from './EyeBlinkDetector';
import { ArrowLeft, Eye, Wifi, WifiOff, Monitor, Check, X, Trash2 } from 'lucide-react';
import ColorWheelSelector from './ColorWheelSelector';

// ESP32 Logic - Color and Position based letter mapping (matching your Arduino code)
const ESP32_LOGIC = {
  // Define modes (matching ESP32)
  modes: {
    LETTER: 'LETTER MODE',
    NUMBER: 'NUMBER MODE', 
    KEYWORD: 'KEYWORD MODE'
  },
  
  // Define commands (matching ESP32)
  commands: {
    UP: 'UP',
    DOWN: 'DOWN',
    BLINK: 'BLINK',
    RESET: 'RESET'
  },
  
  // Define colors in order (c1, c2, c3, c4, c5, c6 from your Arduino code)
  colors: ['YELLOW', 'BLUE', 'RED', 'BLACK', 'PINK', 'GREEN'], // c1-c6
  
  // Define positions for stepper motor (matching ESP32)
  positions: [0, 33, 67, 100, 133, 167], // position indices 0-5 matching currentPositionIndex1
  
  // Letter mapping based on color and position (matching your ESP32 Arduino code exactly)
  letterMapping: {
    'YELLOW': { 1: 'H', 2: 'T', 4: 'N', 5: 'B' },      // c1
    'BLUE': { 1: 'I', 2: 'U', 4: 'O', 5: 'C' },        // c2  
    'RED': { 1: 'L', 2: 'X', 3: 'Z', 4: 'R', 5: 'F' },  // c3
    'BLACK': { 1: 'K', 2: 'W', 3: 'Y', 4: 'Q', 5: 'E' }, // c4
    'PINK': { 1: 'J', 2: 'V', 4: 'P', 5: 'D' },        // c5
    'GREEN': { 1: 'G', 2: 'S', 4: 'M', 5: 'A' }        // c6
  },

  // Helper function to get letter based on color and position (like your Arduino logic)
  getLetterForColorPosition: function(colorIndex: number, positionIndex: number): string | null {
    const colorName = this.colors[colorIndex];
    const mapping = this.letterMapping[colorName as keyof typeof this.letterMapping];
    if (mapping && mapping[positionIndex as keyof typeof mapping]) {
      return mapping[positionIndex as keyof typeof mapping];
    }
    return null;
  }
};

// Color groups configuration (updated to match ESP32 logic)
const colorGroups = [
  { 
    name: 'Yellow', 
    color: 'bg-yellow-500', 
    border: 'border-yellow-400', 
    letters: Object.values(ESP32_LOGIC.letterMapping.YELLOW),
    esp32Color: 'YELLOW'
  },
  { 
    name: 'Blue', 
    color: 'bg-blue-500', 
    border: 'border-blue-400', 
    letters: Object.values(ESP32_LOGIC.letterMapping.BLUE),
    esp32Color: 'BLUE'
  },
  { 
    name: 'Red', 
    color: 'bg-red-500', 
    border: 'border-red-400', 
    letters: Object.values(ESP32_LOGIC.letterMapping.RED),
    esp32Color: 'RED'
  },
  { 
    name: 'Black', 
    color: 'bg-gray-900', 
    border: 'border-gray-700', 
    letters: Object.values(ESP32_LOGIC.letterMapping.BLACK),
    esp32Color: 'BLACK'
  },
  { 
    name: 'Pink', 
    color: 'bg-pink-500', 
    border: 'border-pink-400', 
    letters: Object.values(ESP32_LOGIC.letterMapping.PINK),
    esp32Color: 'PINK'
  },
  { 
    name: 'Green', 
    color: 'bg-green-500', 
    border: 'border-green-400', 
    letters: Object.values(ESP32_LOGIC.letterMapping.GREEN),
    esp32Color: 'GREEN'
  },
];

const DetectionPage: React.FC = () => {
  const { selectedMode, setCurrentScreen } = useAppContext();
  
  // State management
  const [isESP32Connected, setIsESP32Connected] = useState(false);
  const [esp32Status, setEsp32Status] = useState('Offline');
  const [currentColorGroup, setCurrentColorGroup] = useState(0);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0); // ESP32 position tracking
  const [selectionMode, setSelectionMode] = useState<'color' | 'character'>('color');
  const [outputText, setOutputText] = useState('');
  const [esp32Socket, setEsp32Socket] = useState<WebSocket | null>(null);
  const [esp32IP, setEsp32IP] = useState('192.168.1.8'); // Updated to match your current ESP32
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // ESP32 configuration
  const ESP32_PORT = 81;

  // ESP32 Logic Helper Functions (matching Arduino code pattern)
  const getCurrentColor = () => {
    return colorGroups[currentColorGroup]?.esp32Color || 'YELLOW';
  };

  const getLetterFromColorAndPosition = (colorName: string, positionIndex: number) => {
    // Find color index (like your Arduino code variables c1, c2, c3, etc.)
    const colorIndex = ESP32_LOGIC.colors.indexOf(colorName);
    
    // Use the helper function to get letter (matching your Arduino if-else logic)
    return ESP32_LOGIC.getLetterForColorPosition(colorIndex, positionIndex);
  };

  const moveStepperUp = () => {
    const newIndex = Math.min(currentPositionIndex + 1, 5);
    setCurrentPositionIndex(newIndex);
    
    const currentColor = getCurrentColor();
    const letter = getLetterFromColorAndPosition(currentColor, newIndex);
    
    // Send command to ESP32
    sendESP32Command(ESP32_LOGIC.commands.UP);
    
    setOutputText(prev => prev + (prev ? '\n' : '') + 
      `[${new Date().toLocaleTimeString()}] ⬆️ UP: Position ${newIndex} - ${currentColor}${letter ? ` (${letter})` : ''}`);
  };

  const moveStepperDown = () => {
    const newIndex = Math.max(currentPositionIndex - 1, 0);
    setCurrentPositionIndex(newIndex);
    
    const currentColor = getCurrentColor();
    const letter = getLetterFromColorAndPosition(currentColor, newIndex);
    
    // Send command to ESP32
    sendESP32Command(ESP32_LOGIC.commands.DOWN);
    
    setOutputText(prev => prev + (prev ? '\n' : '') + 
      `[${new Date().toLocaleTimeString()}] ⬇️ DOWN: Position ${newIndex} - ${currentColor}${letter ? ` (${letter})` : ''}`);
  };

  const handleBlinkSelection = () => {
    const currentColor = getCurrentColor();
    const letter = getLetterFromColorAndPosition(currentColor, currentPositionIndex);
    
    if (letter) {
      setOutputText(prev => prev + (prev ? '\n' : '') + 
        `[${new Date().toLocaleTimeString()}] 🎯 SELECTED: ${letter} (${currentColor} - Position ${currentPositionIndex})`);
      
      // Add letter to output
      addToOutput(letter);
    }
    
    // Send command to ESP32
    sendESP32Command(ESP32_LOGIC.commands.BLINK);
  };

  const resetPosition = () => {
    setCurrentPositionIndex(0);
    setCurrentColorGroup(0);
    
    // Send reset command to ESP32
    sendESP32Command(ESP32_LOGIC.commands.RESET);
    
    setOutputText(prev => prev + (prev ? '\n' : '') + 
      `[${new Date().toLocaleTimeString()}] 🔄 RESET: Position 0 - ${ESP32_LOGIC.colors[0]}`);
  };

  const connectToESP32 = () => {
    try {
      setEsp32Status('Connecting...');
      setConnectionAttempts(prev => prev + 1);
      const ws = new WebSocket(`ws://${esp32IP}:${ESP32_PORT}`);
      
      const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setEsp32Status('Connection Timeout');
          setIsESP32Connected(false);
        }
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        setEsp32Status('Online');
        setIsESP32Connected(true);
        setConnectionAttempts(0);
        setOutputText(prev => prev + (prev ? '\n' : '') + `[${new Date().toLocaleTimeString()}] ✅ ESP32 Connected to ${esp32IP}`);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('ESP32 Message:', data);
          
          if (data.type === 'status') {
            setOutputText(prev => prev + (prev ? '\n' : '') + 
              `[${new Date().toLocaleTimeString()}] 📊 Status: ${data.colorName} at ${data.currentAngle}° ${data.isMoving ? '(Moving)' : ''}`);
          } else if (data.type === 'selection') {
            setCurrentColorGroup(data.colorGroup);
            setOutputText(prev => prev + (prev ? '\n' : '') + 
              `[${new Date().toLocaleTimeString()}] 🎯 Selected: ${data.colorName} (${data.angle}°)`);
          }
        } catch (error) {
          console.error('Error parsing ESP32 message:', error);
        }
      };
      
      ws.onclose = () => {
        clearTimeout(timeout);
        setEsp32Status('Offline');
        setEsp32Socket(null);
        setIsESP32Connected(false);
        setOutputText(prev => prev + (prev ? '\n' : '') + `[${new Date().toLocaleTimeString()}] ❌ ESP32 Disconnected`);
      };
      
      ws.onerror = () => {
        clearTimeout(timeout);
        setEsp32Status('Connection Error');
        setIsESP32Connected(false);
        setOutputText(prev => prev + (prev ? '\n' : '') + 
          `[${new Date().toLocaleTimeString()}] ⚠️ Connection Failed - Check if ESP32 is on ${esp32IP}:${ESP32_PORT}`);
      };
      
      setEsp32Socket(ws);
    } catch (error) {
      setEsp32Status('Error');
      setIsESP32Connected(false);
      setOutputText(prev => prev + (prev ? '\n' : '') + `[${new Date().toLocaleTimeString()}] ❌ Connection Error: ${error}`);
    }
  };

  const disconnectFromESP32 = () => {
    if (esp32Socket) {
      esp32Socket.close();
    }
  };

  const handleBlinkDetection = (blinkData: any) => {
    // ESP32 Logic Implementation
    if (blinkData.action === 'UP') {
      if (selectionMode === 'color') {
        // Color selection mode - navigate through colors
        setCurrentColorGroup((prev) => (prev + 1) % colorGroups.length);
        setCurrentPositionIndex(0); // Reset position when changing color
        
        const newColorIndex = (currentColorGroup + 1) % colorGroups.length;
        const newColor = colorGroups[newColorIndex].esp32Color;
        
        setOutputText(prev => prev + (prev ? '\n' : '') + 
          `[${new Date().toLocaleTimeString()}] 🎨 Color UP: ${newColor}`);
        
        sendESP32Command(ESP32_LOGIC.commands.UP);
      } else if (selectionMode === 'character') {
        // Character selection mode - move stepper up
        moveStepperUp();
      }
    } else if (blinkData.action === 'DOWN') {
      if (selectionMode === 'color') {
        // Color selection mode - navigate through colors
        setCurrentColorGroup((prev) => (prev - 1 + colorGroups.length) % colorGroups.length);
        setCurrentPositionIndex(0); // Reset position when changing color
        
        const newColorIndex = (currentColorGroup - 1 + colorGroups.length) % colorGroups.length;
        const newColor = colorGroups[newColorIndex].esp32Color;
        
        setOutputText(prev => prev + (prev ? '\n' : '') + 
          `[${new Date().toLocaleTimeString()}] 🎨 Color DOWN: ${newColor}`);
        
        sendESP32Command(ESP32_LOGIC.commands.DOWN);
      } else if (selectionMode === 'character') {
        // Character selection mode - move stepper down
        moveStepperDown();
      }
    } else if (blinkData.action === 'SELECT') {
      if (selectionMode === 'color') {
        // Switch to character selection mode
        setSelectionMode('character');
        const currentColor = getCurrentColor();
        
        setOutputText(prev => prev + (prev ? '\n' : '') + 
          `[${new Date().toLocaleTimeString()}] 🎨 Selected ${currentColor} - Now select position`);
        
        sendESP32Command(ESP32_LOGIC.commands.BLINK);
      } else if (selectionMode === 'character') {
        // Select current letter and return to color mode
        handleBlinkSelection();
        setSelectionMode('color');
      }
    }
  };

  const sendESP32Command = (action: string) => {
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
      const command = {
        action: action,
        timestamp: Date.now()
      };
      esp32Socket.send(JSON.stringify(command));
      setOutputText(prev => prev + (prev ? '\n' : '') + 
        `[${new Date().toLocaleTimeString()}] 📤 Sent: ${action} to ESP32`);
    } else {
      setOutputText(prev => prev + (prev ? '\n' : '') + 
        `[${new Date().toLocaleTimeString()}] ⚠️ ESP32 not connected - command ${action} not sent`);
    }
  };

  const addToOutput = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutputText(prev => prev + (prev ? '\n' : '') + `[${timestamp}] ${text}`);
  };

  const clearOutput = () => {
    setOutputText('');
  };

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

  const toggleESP32Connection = () => {
    if (isESP32Connected) {
      // Disconnect
      disconnectFromESP32();
    } else {
      // Connect
      connectToESP32();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToModeSelection}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full text-white hover:text-blue-300 hover:bg-white/20 transition-all duration-300 group shadow-2xl shadow-blue-500/10"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-semibold tracking-wide">Back to Mode Selection</span>
          </button>
          
          {/* Header Controls */}
          <div className="flex items-center gap-4">
            {/* Current Mode Display */}
            <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 text-blue-300 shadow-blue-500/25 rounded-full backdrop-blur-lg shadow-2xl transition-all duration-500 transform hover:scale-105">
              <div className="w-4 h-4 bg-blue-400 rounded-full shadow-lg animate-pulse" />
              <span className="font-semibold text-sm tracking-wide">{getModeTitle()}</span>
            </div>



            {/* IP Address Input */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/30 px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">ESP32 IP:</span>
              <input
                type="text"
                value={esp32IP}
                onChange={(e) => setEsp32IP(e.target.value)}
                className="bg-transparent text-white text-sm font-mono px-2 py-1 border-none outline-none placeholder-gray-400 w-36"
                placeholder="192.168.x.x"
                disabled={isESP32Connected}
              />
            </div>

            <div className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-lg shadow-2xl transition-all duration-500 transform hover:scale-105 ${
              esp32Status === 'Online' 
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400/50 text-green-300 shadow-green-500/25' 
                : esp32Status === 'Connecting...'
                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/50 text-yellow-300 shadow-yellow-500/25 animate-pulse'
                : esp32Status === 'Connection Timeout' || esp32Status === 'Connection Error'
                ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-400/50 text-orange-300 shadow-orange-500/25'
                : 'bg-gradient-to-r from-red-500/30 to-rose-500/30 border-red-400/50 text-red-300 shadow-red-500/25'
            }`}>
              <div className={`w-4 h-4 rounded-full ${
                esp32Status === 'Online' ? 'bg-green-400 animate-pulse' : 
                esp32Status === 'Connecting...' ? 'bg-yellow-400 animate-ping' : 
                'bg-red-400'
              } shadow-lg`} />
              <span className="font-semibold text-sm tracking-wide">{esp32Status}</span>
              <button
                onClick={toggleESP32Connection}
                className={`ml-2 p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isESP32Connected 
                    ? 'hover:bg-red-500/20 text-red-300' 
                    : 'hover:bg-green-500/20 text-green-300'
                }`}
                title={isESP32Connected ? 'Disconnect from ESP32' : `Connect to ESP32 (${esp32IP}:${ESP32_PORT})`}
              >
                {isESP32Connected ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Main Camera Section - Full Width */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
            <h3 className="text-white font-bold text-2xl mb-8 flex items-center gap-4">
              <Eye className="w-8 h-8 text-blue-300" />
              Eye Detection System
            </h3>
            <EyeBlinkDetector onBlinkDetected={handleBlinkDetection} />
          </div>
        </div>

        {/* Controls and Output Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Color Wheel Selector */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  🎨
                </div>
                Color Selection
              </h3>
              <div className="flex items-center justify-center gap-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm">
                <ColorWheelSelector
                  colorGroups={colorGroups}
                  currentColorGroup={currentColorGroup}
                  onColorSelect={setCurrentColorGroup}
                  size={48}
                />
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">
                    {colorGroups[currentColorGroup].name}
                  </div>
                  <div className="text-gray-300 text-sm mt-1">
                    Current Color Group
                  </div>
                </div>
              </div>
            </div>

            {/* ESP32 Connection Panel */}
            {!isESP32Connected && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    📡
                  </div>
                  ESP32 Connection
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 font-medium">IP Address:</span>
                    <input
                      type="text"
                      value={esp32IP}
                      onChange={(e) => setEsp32IP(e.target.value)}
                      className="flex-1 bg-white/5 text-white text-sm font-mono px-3 py-2 border border-white/20 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      placeholder="192.168.x.x"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 font-medium">Port:</span>
                    <span className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded-lg">{ESP32_PORT}</span>
                  </div>
                  <button
                    onClick={connectToESP32}
                    disabled={esp32Status === 'Connecting...'}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {esp32Status === 'Connecting...' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-5 h-5" />
                        Connect to ESP32
                      </>
                    )}
                  </button>
                  {esp32Status !== 'Offline' && esp32Status !== 'Connecting...' && (
                    <div className={`text-center text-sm font-medium ${
                      esp32Status === 'Online' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Status: {esp32Status}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ESP32 Character Selection */}
            {selectionMode === 'character' && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    🎯
                  </div>
                  ESP32 Position Selection ({getCurrentColor()})
                </h3>
                
                {/* Current Position Display */}
                <div className="mb-6 p-4 bg-black/40 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Current Position:</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-mono text-xl">{currentPositionIndex}</span>
                      <span className="text-gray-400">({ESP32_LOGIC.positions[currentPositionIndex]}°)</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Available Letter:</span>
                    <span className="text-yellow-300 font-mono text-2xl font-bold">
                      {getLetterFromColorAndPosition(getCurrentColor(), currentPositionIndex) || 'None'}
                    </span>
                  </div>
                </div>

                {/* Position Control Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    onClick={moveStepperUp}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ⬆️ UP
                  </button>
                  <button
                    onClick={handleBlinkSelection}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ✓ SELECT
                  </button>
                  <button
                    onClick={moveStepperDown}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ⬇️ DOWN
                  </button>
                </div>

                {/* Available Letters for Current Color */}
                <div className="mb-4">
                  <h4 className="text-gray-300 text-sm mb-3">All Available Letters for {getCurrentColor()}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ESP32_LOGIC.letterMapping[getCurrentColor() as keyof typeof ESP32_LOGIC.letterMapping] || {}).map(([pos, letter]) => (
                      <div 
                        key={pos}
                        className={`px-3 py-2 rounded-lg border text-sm font-mono ${
                          currentPositionIndex === parseInt(pos) 
                            ? `${colorGroups[currentColorGroup].color} text-white border-white/50 shadow-lg` 
                            : 'bg-white/10 text-gray-300 border-white/20'
                        }`}
                      >
                        Pos {pos}: {letter}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    className="text-sm text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-300 flex items-center gap-2"
                    onClick={() => setSelectionMode('color')}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Color Selection
                  </button>
                  <button
                    onClick={resetPosition}
                    className="text-sm text-orange-300 hover:text-orange-200 font-semibold transition-colors duration-300 flex items-center gap-2"
                  >
                    🔄 Reset Position
                  </button>
                </div>
              </div>
            )}

            {/* ESP32 Control Panel */}
            {isESP32Connected && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-orange-500/10">
                <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    🎮
                  </div>
                  ESP32 Controls
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => sendESP32Command('UP')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ↑ UP
                  </button>
                  <button
                    onClick={() => sendESP32Command('DOWN')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ↓ DOWN
                  </button>
                  <button
                    onClick={() => sendESP32Command('SELECT')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    ✓ SELECT
                  </button>
                  <button
                    onClick={() => sendESP32Command('RESET')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    🔄 RESET
                  </button>
                </div>
              </div>
            )}

            {/* Quick Status Panel */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                System Status
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <span className="text-gray-300 font-medium">ESP32 Connection:</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${esp32Status === 'Online' ? 'bg-green-400 animate-pulse' : 'bg-red-400'} shadow-lg`} />
                    <span className="text-white font-semibold">{esp32Status}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <span className="text-gray-300 font-medium">ESP32 Address:</span>
                  <span className="text-white font-semibold font-mono text-xs">{esp32IP}:{ESP32_PORT}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <span className="text-gray-300 font-medium">Connection Attempts:</span>
                  <span className="text-white font-semibold">{connectionAttempts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <span className="text-gray-300 font-medium">Active Color Group:</span>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colorGroups[currentColorGroup].color} shadow-lg ring-2 ring-white/30`} />
                    <span className="text-white font-semibold">{colorGroups[currentColorGroup].name}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <span className="text-gray-300 font-medium">ESP32 Position:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold font-mono">{currentPositionIndex}</span>
                    <span className="text-gray-400 text-xs">({ESP32_LOGIC.positions[currentPositionIndex]}°)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl backdrop-blur-sm">
                  <span className="text-gray-300 font-medium">Available Letter:</span>
                  <span className="text-yellow-300 font-mono text-lg font-bold">
                    {getLetterFromColorAndPosition(getCurrentColor(), currentPositionIndex) || 'None'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Output & Instructions */}
          <div className="space-y-6">
            {/* Output Display Panel */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl shadow-green-500/10">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  🧾
                </div>
                Output Display
              </h3>
              <div className="bg-black/60 rounded-xl p-6 h-64 overflow-y-auto font-mono text-sm mb-6 border border-green-500/20 shadow-inner backdrop-blur-sm">
                {outputText ? (
                  <div className="text-green-300 whitespace-pre-wrap leading-relaxed">{outputText}</div>
                ) : (
                  <div className="text-gray-400 italic text-center flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-2xl mb-2">💬</div>
                      <div>Your selections will appear here...</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => addToOutput('YES')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm font-semibold"
                >
                  <Check className="w-5 h-5" />
                  YES
                </button>
                <button
                  onClick={() => addToOutput('NO')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm font-semibold"
                >
                  <X className="w-5 h-5" />
                  NO
                </button>
                <button
                  onClick={clearOutput}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm font-semibold"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetectionPage;
