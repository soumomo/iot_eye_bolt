# ESP32 Eye Blink Letter Selection System

This backend contains the ESP32 Arduino code for the eye blink letter selection system that works with the React frontend.

## Hardware Requirements

- **ESP32 DevKit** (any variant)
- **MG995 Continuous Rotation Servo** connected to GPIO 13
- **Status LED** (optional) connected to GPIO 12
- **WiFi Connection**

## Software Requirements

### Arduino IDE Setup:
1. Install **ESP32 Board Package** in Arduino IDE
2. Install the following libraries:
   - `WiFi` (built-in with ESP32)
   - `WebSocketsServer` by Markus Sattler
   - `ArduinoJson` by Benoit Blanchon
   - `ESP32Servo` library

## Configuration

### WiFi Setup:
Update these lines in `esp32_arduino_code.ino`:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### Hardware Connections:
```
ESP32 Pin 13  -> Servo Signal Wire (Orange/Yellow)
ESP32 Pin 12  -> Status LED (optional)
ESP32 5V      -> Servo Power (Red)
ESP32 GND     -> Servo Ground (Brown/Black)
```

## Features

### 6-Color Letter Selection System:
- **YELLOW (c1)**: H(1), T(2), N(4), B(5)
- **BLUE (c2)**: I(1), U(2), O(4), C(5)
- **RED (c3)**: L(1), X(2), Z(3), R(4), F(5)
- **BLACK (c4)**: K(1), W(2), Y(3), Q(4), E(5)
- **PINK (c5)**: J(1), V(2), P(4), D(5)
- **GREEN (c6)**: G(1), S(2), M(4), A(5)

### Servo Control:
- **Precise angle control** (60° steps)
- **6 color positions** (0°, 60°, 120°, 180°, 240°, 300°)
- **Continuous rotation servo** support

### WebSocket Communication:
- **Port 81** for React frontend connection
- **Real-time status updates**
- **Command processing** (UP, DOWN, SELECT, RESET)

## Usage

1. **Upload Code**: Flash `esp32_arduino_code.ino` to your ESP32
2. **Open Serial Monitor**: Set baud rate to 115200
3. **Note IP Address**: The ESP32 will display its IP address
4. **Update React Frontend**: Set the ESP32 IP in the React app
5. **Connect**: The React app will connect via WebSocket

## Commands

### From React Frontend:
- **UP**: Navigate position up or next color
- **DOWN**: Navigate position down or previous color
- **SELECT/BLINK**: Choose current letter + servo feedback
- **RESET**: Return to initial state (YELLOW c1, position 1)

### Serial Monitor Functions:
- `printCurrentState()` - Show current status
- `testCompleteSystem()` - Test all colors and positions
- `printAvailableLetters()` - Show letter mapping

## Troubleshooting

### WiFi Connection Issues:
- Check SSID and password
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)
- Check signal strength

### Servo Issues:
- Verify connections (Power, Ground, Signal)
- Check servo power supply (5V recommended)
- Ensure proper PWM pin (GPIO 13)

### React Connection Issues:
- Verify ESP32 IP address
- Check port 81 is open
- Ensure both devices on same network

## Status Indicators

### LED Patterns:
- **Solid ON**: WiFi connected
- **Blinking**: Servo movement
- **Fast blinks**: Letter selection

### Serial Output:
- Connection status
- Command processing
- Current color/position/letter
- Servo movement progress

## Final Setup

✅ **Clean ESP32 code** - `esp32_arduino_code.ino`  
✅ **Your working servo control** - MG995, GPIO 13, precise angles  
✅ **6-color letter system** - Exact Arduino logic pattern  
✅ **React integration** - WebSocket communication  
✅ **Your WiFi credentials** - Pre-configured  

Ready to upload and use! 🚀
