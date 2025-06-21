/*
 * ESP32 Eye Blink Letter Selection System
 * Compatible with React Frontend DetectionPage.tsx
 * Integrates 6-color letter system with precise servo control
 * 
 * Hardware Requirements:
 * - ESP32 DevKit
 * - MG995 Continuous Rotation Servo (GPIO 13)
 * - Status LED (GPIO 12)
 * - WiFi connection
 * 
 * Features:
 * - 6-color letter selection system (c1-c6)
 * - Position-based letter mapping (exact Arduino logic)
 * - Precise angle-based servo control
 * - WebSocket communication with React frontend
 */

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>

// WiFi credentials - UPDATE THESE!
const char* ssid = "RH-2.4G-691C60";
const char* password = "44953B691C60";
// const char* ssid = "mi 11i";
// const char* password = "12345678";
// const char* ssid = "NARZO 70 Pro 5G";
// const char* password = "k3g6cju2";

// WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);

// Servo motor setup - MG995 Continuous Rotation with Angle Precision
Servo motorServo;
const int SERVO_PIN = 13;  // GPIO pin for servo

// MG995 Continuous Rotation Control Values
const int STOP_PULSE = 90;     // 1.5ms pulse = stop
const int CW_PULSE = 120;      // Clockwise rotation
const int CCW_PULSE = 60;      // Counter-clockwise rotation
const int STEP_DURATION = 250; // Time per 60° step

// 6-Color Letter Selection System
const int c1 = 1;  // YELLOW
const int c2 = 2;  // BLUE  
const int c3 = 3;  // RED
const int c4 = 4;  // BLACK
const int c5 = 5;  // PINK
const int c6 = 6;  // GREEN

// Current state variables
int currentColorIndex = 1;        // Current color (c1-c6)
int currentPositionIndex1 = 1;    // Current position (1-5)
int colour = c1;                  // Active color variable
char letter = ' ';                // Selected letter

// Angle-based position tracking
int currentAngle = 0;          // Current angle (0-359°)
int targetAngle = 0;           // Target angle
unsigned long moveStartTime = 0;
bool isMoving = false;
int stepsToMove = 0;           // Number of 60° steps to move
bool moveClockwise = true;     // Direction of movement

// 6-Color system: positions every 60°
const int COLOR_ANGLES[] = {0, 60, 120, 180, 240, 300}; // c1-c6 positions
const String COLOR_NAMES[] = {"YELLOW", "BLUE", "RED", "BLACK", "PINK", "GREEN"}; // c1-c6

// Position angles for letter selection within each color
const int POSITION_ANGLES[] = {0, 33, 67, 100, 133, 167}; // Sub-positions within color

// LED for status indication
const int STATUS_LED = 12;  // Built-in LED

void setup() {
  Serial.begin(115200);
  // Initialize servo - MG995 starts stopped
  motorServo.attach(SERVO_PIN);
  motorServo.write(STOP_PULSE);  // Stop the continuous rotation
  currentAngle = 0;
  targetAngle = 0;
  
  // Initialize LED
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("ESP32 Eye Blink Letter Selection System");
  Serial.println("6-Color Letter System with Position Control");
  Serial.println("==========================================");
  
  // Initialize state
  colour = c1;
  currentColorIndex = 1;
  currentPositionIndex1 = 1;
  
  // Connect to WiFi
  connectToWiFi();
  
  // Start WebSocket server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  
  Serial.println("WebSocket server started on port 81");
  Serial.println("Motor initialized at 0° (YELLOW - c1)");
  Serial.println("Ready for eye blink commands...");
  Serial.println("Letter Selection System Active!");
  Serial.println("Colors: YELLOW(c1), BLUE(c2), RED(c3), BLACK(c4), PINK(c5), GREEN(c6)");
  Serial.println("Positions: 1-5 for each color");
  
  // Print available letters
  printAvailableLetters();
  
  // Blink LED to show ready
  blinkStatusLED(3);
}

void loop() {
  webSocket.loop();
  
  // Handle precise angle-based motor movement
  handleAngleMovement();
  
  // Update letter selection (no spam)
  selectLetterBasedOnColorAndPosition();
  
  delay(10); // Small delay for smooth operation
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected successfully!");
    Serial.print("ESP32 IP address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(STATUS_LED, HIGH); // Turn on LED when connected
  } else {
    Serial.println();
    Serial.println("Failed to connect to WiFi!");
    Serial.println("Please check your credentials and try again.");
  }
}

// YOUR EXACT ARDUINO LETTER SELECTION LOGIC
void selectLetterBasedOnColorAndPosition() {
  // Reset letter
  letter = ' ';
  
  // Your exact Arduino logic pattern
  if (colour == c1) {
    if (currentPositionIndex1 == 1) {
      letter = 'H';
    } else if (currentPositionIndex1 == 2) {
      letter = 'T';
    } else if (currentPositionIndex1 == 4) {
      letter = 'N';
    } else if (currentPositionIndex1 == 5) {
      letter = 'B';
    }
  } else if (colour == c2) {
    if (currentPositionIndex1 == 1) {
      letter = 'I';
    } else if (currentPositionIndex1 == 2) {
      letter = 'U';
    } else if (currentPositionIndex1 == 4) {
      letter = 'O';
    } else if (currentPositionIndex1 == 5) {
      letter = 'C';
    }
  } else if (colour == c3) {
    if (currentPositionIndex1 == 1) {
      letter = 'L';
    } else if (currentPositionIndex1 == 2) {
      letter = 'X';
    } else if (currentPositionIndex1 == 3) {
      letter = 'Z';
    } else if (currentPositionIndex1 == 4) {
      letter = 'R';
    } else if (currentPositionIndex1 == 5) {
      letter = 'F';
    }
  } else if (colour == c4) {
    if (currentPositionIndex1 == 1) {
      letter = 'K';
    } else if (currentPositionIndex1 == 2) {
      letter = 'W';
    } else if (currentPositionIndex1 == 3) {
      letter = 'Y';
    } else if (currentPositionIndex1 == 4) {
      letter = 'Q';
    } else if (currentPositionIndex1 == 5) {
      letter = 'E';
    }
  } else if (colour == c5) {
    if (currentPositionIndex1 == 1) {
      letter = 'J';
    } else if (currentPositionIndex1 == 2) {
      letter = 'V';
    } else if (currentPositionIndex1 == 4) {
      letter = 'P';
    } else if (currentPositionIndex1 == 5) {
      letter = 'D';
    }
  } else if (colour == c6) {
    if (currentPositionIndex1 == 1) {
      letter = 'G';
    } else if (currentPositionIndex1 == 2) {
      letter = 'S';
    } else if (currentPositionIndex1 == 4) {
      letter = 'M';
    } else if (currentPositionIndex1 == 5) {
      letter = 'A';
    }
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Client disconnected\n", num);
      break;
      
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] React app connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
      
      // Send connection confirmation
      sendStatusUpdate(num);
      break;
    }
    
    case WStype_TEXT: {
      Serial.printf("[%u] Received: %s\n", num, payload);
      
      // Parse JSON command
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);
      
      String action = doc["action"];
      processBlinkCommand(action, num);
      break;
    }
    
    default:
      break;
  }
}

void processBlinkCommand(String action, uint8_t clientNum) {
  Serial.println("Processing command: " + action);
  
  if (action == "UP") {
    handleUpCommand();
    
  } else if (action == "DOWN") {
    handleDownCommand();
    
  } else if (action == "BLINK" || action == "SELECT") {
    handleSelectCommand();
    
  } else if (action == "RESET") {
    handleResetCommand();
  }
  
  // Send status update back to client
  sendStatusUpdate(clientNum);
}

void handleUpCommand() {
  Serial.println("UP Command Received");
  
  // Move position up within current color
  if (currentPositionIndex1 < 5) {
    currentPositionIndex1++;
    Serial.print("Position UP -> ");
    Serial.println(currentPositionIndex1);
  } else {
    // If at max position, cycle to next color
    nextColor();
  }
  
  // Update letter and print status
  selectLetterBasedOnColorAndPosition();
  printCurrentStatus();
}

void handleDownCommand() {
  Serial.println("DOWN Command Received");
  
  // Move position down within current color
  if (currentPositionIndex1 > 1) {
    currentPositionIndex1--;
    Serial.print("Position DOWN -> ");
    Serial.println(currentPositionIndex1);
  } else {
    // If at min position, cycle to previous color
    previousColor();
  }
  
  // Update letter and print status
  selectLetterBasedOnColorAndPosition();
  printCurrentStatus();
}

void handleSelectCommand() {
  Serial.println("SELECT Command Received");
  
  // Select current letter
  selectLetterBasedOnColorAndPosition();
  
  if (letter != ' ') {
    Serial.print("SELECTED LETTER: ");
    Serial.println(letter);
    
    // Move servo to represent the selection (visual feedback)
    int colorAngle = COLOR_ANGLES[currentColorIndex - 1];
    moveToAngle(colorAngle);
    
    // Send letter selection to React frontend
    sendLetterSelection(letter);
    
    // Flash LED to indicate selection
    blinkStatusLED(2);
  } else {
    Serial.println("No letter available at this position");
  }
}

void handleResetCommand() {
  Serial.println("RESET Command Received");
  
  // Reset to initial state
  colour = c1;
  currentColorIndex = 1;
  currentPositionIndex1 = 1;
  
  // Move servo to initial position
  targetAngle = 0;
  moveToAngle(targetAngle);
  
  Serial.println("System RESET - Color: YELLOW (c1), Position: 1");
  selectLetterBasedOnColorAndPosition();
  printCurrentStatus();
}

void nextColor() {
  currentColorIndex++;
  if (currentColorIndex > 6) {
    currentColorIndex = 1;
  }
  
  colour = currentColorIndex;
  currentPositionIndex1 = 1; // Reset position when changing color
  
  // Move servo to new color position
  int colorAngle = COLOR_ANGLES[currentColorIndex - 1];
  moveToAngle(colorAngle);
  
  Serial.print("Color changed to: ");
  Serial.print(COLOR_NAMES[currentColorIndex - 1]);
  Serial.print(" (c");
  Serial.print(colour);
  Serial.println(")");
}

void previousColor() {
  currentColorIndex--;
  if (currentColorIndex < 1) {
    currentColorIndex = 6;
  }
  
  colour = currentColorIndex;
  currentPositionIndex1 = 1; // Reset position when changing color
  
  // Move servo to new color position
  int colorAngle = COLOR_ANGLES[currentColorIndex - 1];
  moveToAngle(colorAngle);
  
  Serial.print("Color changed to: ");
  Serial.print(COLOR_NAMES[currentColorIndex - 1]);
  Serial.print(" (c");
  Serial.print(colour);
  Serial.println(")");
}

// SERVO CONTROL FUNCTIONS (from your working code)
void moveToAngle(int angle) {
  if (isMoving) return; // Already moving
  
  // Calculate shortest path
  int angleDiff = angle - currentAngle;
  
  // Normalize angle difference to -180 to +180 range
  while (angleDiff > 180) angleDiff -= 360;
  while (angleDiff < -180) angleDiff += 360;
  
  if (angleDiff == 0) return; // Already at target
  
  // Determine direction and steps
  moveClockwise = (angleDiff > 0);
  stepsToMove = abs(angleDiff) / 60; // Each step is 60°
  
  if (stepsToMove > 0) {
    startAngleMovement();
    Serial.println("Moving " + String(abs(angleDiff)) + "° " + 
                   (moveClockwise ? "clockwise" : "counter-clockwise") + 
                   " in " + String(stepsToMove) + " steps");
  }
}

void startAngleMovement() {
  if (!isMoving && stepsToMove > 0) {
    isMoving = true;
    moveStartTime = millis();
    
    // Start rotation based on tested values
    if (moveClockwise) {
      motorServo.write(CW_PULSE); // 120
      Serial.println("Step rotation: Clockwise");
    } else {
      motorServo.write(CCW_PULSE); // 60
      Serial.println("Step rotation: Counter-clockwise");
    }
    
    // Turn on status LED during movement
    digitalWrite(STATUS_LED, HIGH);
  }
}

void handleAngleMovement() {
  if (isMoving) {
    // Check if step duration has elapsed (250ms)
    if (millis() - moveStartTime >= STEP_DURATION) {
      // Stop the motor
      motorServo.write(STOP_PULSE);
      digitalWrite(STATUS_LED, LOW);
      
      // Update current angle
      if (moveClockwise) {
        currentAngle = (currentAngle + 60) % 360;
      } else {
        currentAngle = (currentAngle - 60 + 360) % 360;
      }
      
      stepsToMove--;
      Serial.println("Completed step - Current angle: " + String(currentAngle) + "°");
      
      // Check if more steps needed
      if (stepsToMove > 0) {
        // Small pause between steps
        delay(300);
        // Start next step
        moveStartTime = millis();
        if (moveClockwise) {
          motorServo.write(CW_PULSE);
        } else {
          motorServo.write(CCW_PULSE);
        }
        digitalWrite(STATUS_LED, HIGH);
      } else {
        // Movement complete
        isMoving = false;
        Serial.println("Reached target: " + String(currentAngle) + "° (" + COLOR_NAMES[currentColorIndex - 1] + ")");
      }
    }
  }
}

// COMMUNICATION FUNCTIONS
void sendLetterSelection(char selectedLetter) {
  DynamicJsonDocument doc(512);
  doc["type"] = "selection";
  doc["letter"] = String(selectedLetter);
  doc["colorIndex"] = currentColorIndex - 1; // 0-based for React
  doc["colorName"] = COLOR_NAMES[currentColorIndex - 1];
  doc["position"] = currentPositionIndex1;
  doc["angle"] = currentAngle;
  doc["timestamp"] = millis();
  
  String message;
  serializeJson(doc, message);
  webSocket.broadcastTXT(message);
  
  Serial.print("Sent letter selection: ");
  Serial.println(selectedLetter);
}

void sendStatusUpdate(uint8_t clientNum) {
  DynamicJsonDocument doc(512);
  doc["type"] = "status";
  doc["currentAngle"] = currentAngle;
  doc["targetAngle"] = targetAngle;
  doc["colorGroup"] = currentColorIndex - 1; // 0-based for React
  doc["colorName"] = COLOR_NAMES[currentColorIndex - 1];
  doc["position"] = currentPositionIndex1;
  doc["availableLetter"] = String(letter);
  doc["isMoving"] = isMoving;
  doc["ip"] = WiFi.localIP().toString();
  
  String message;
  serializeJson(doc, message);
  webSocket.sendTXT(clientNum, message);
}

void blinkStatusLED(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(100);
    digitalWrite(STATUS_LED, LOW);
    delay(100);
  }
}

// HELPER FUNCTIONS
void printAvailableLetters() {
  Serial.println("=== Available Letters by Color ===");
  Serial.println("YELLOW (c1): H(1), T(2), N(4), B(5)");
  Serial.println("BLUE (c2): I(1), U(2), O(4), C(5)");
  Serial.println("RED (c3): L(1), X(2), Z(3), R(4), F(5)");
  Serial.println("BLACK (c4): K(1), W(2), Y(3), Q(4), E(5)");
  Serial.println("PINK (c5): J(1), V(2), P(4), D(5)");
  Serial.println("GREEN (c6): G(1), S(2), M(4), A(5)");
  Serial.println("==================================");
}

void printCurrentStatus() {
  Serial.print("Status: ");
  Serial.print(COLOR_NAMES[currentColorIndex - 1]);
  Serial.print(" (c");
  Serial.print(colour);
  Serial.print("), Position: ");
  Serial.print(currentPositionIndex1);
  Serial.print(" -> Letter: ");
  Serial.print(letter != ' ' ? String(letter) : "None");
  Serial.print(" | Angle: ");
  Serial.print(currentAngle);
  Serial.println("°");
}

void printCurrentState() {
  Serial.println("=== Current State ===");
  Serial.print("Color: ");
  Serial.print(COLOR_NAMES[currentColorIndex - 1]);
  Serial.print(" (c");
  Serial.print(colour);
  Serial.println(")");
  Serial.print("Position: ");
  Serial.print(currentPositionIndex1);
  Serial.print(" Angle: ");
  Serial.print(currentAngle);
  Serial.println("°");
  Serial.print("Available Letter: ");
  Serial.println(letter != ' ' ? String(letter) : "None");
  Serial.println("===================");
}

// Function to test the complete system
void testCompleteSystem() {
  Serial.println("Testing Complete 6-Color Letter Selection System...");
  
  // Test each color and positions
  for (int colorTest = 1; colorTest <= 6; colorTest++) {
    colour = colorTest;
    currentColorIndex = colorTest;
    
    Serial.println("Testing Color: " + COLOR_NAMES[colorTest - 1] + " (c" + String(colorTest) + ")");
    
    // Test positions 1, 2, 3, 4, 5 for each color
    for (int pos = 1; pos <= 5; pos++) {
      currentPositionIndex1 = pos;
      selectLetterBasedOnColorAndPosition();
      
      if (letter != ' ') {
        Serial.print("  Position ");
        Serial.print(currentPositionIndex1);
        Serial.print(" -> Letter: ");
        Serial.println(letter);
      }
    }
    
    // Move servo to color position
    int colorAngle = COLOR_ANGLES[colorTest - 1];
    moveToAngle(colorAngle);
    
    // Wait for movement to complete
    while (isMoving) {
      handleAngleMovement();
      delay(10);
    }
    
    delay(1000); // Pause between colors
  }
  
  Serial.println("Complete system test finished!");
}
