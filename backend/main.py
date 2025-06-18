import cv2
import numpy as np
import mediapipe as mp
from math import hypot
import time

# Initialize camera and detector
cap = cv2.VideoCapture(0)
# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5)

# Check if camera opened successfully
if not cap.isOpened():
    raise Exception("Could not open video device")

# Font for displaying text
font = cv2.FONT_HERSHEY_SIMPLEX

def get_blinking_ratio(eye_points, face_landmarks, frame):
    h, w, _ = frame.shape
    left_point = (int(face_landmarks.landmark[eye_points[0]].x * w), int(face_landmarks.landmark[eye_points[0]].y * h))
    right_point = (int(face_landmarks.landmark[eye_points[3]].x * w), int(face_landmarks.landmark[eye_points[3]].y * h))
    center_top = midpoint_mp(face_landmarks.landmark[eye_points[1]], face_landmarks.landmark[eye_points[2]], w, h)
    center_bottom = midpoint_mp(face_landmarks.landmark[eye_points[5]], face_landmarks.landmark[eye_points[4]], w, h)

    hor_line_length = hypot((left_point[0] - right_point[0]), (left_point[1] - right_point[1]))
    ver_line_length = hypot((center_top[0] - center_bottom[0]), (center_top[1] - center_bottom[1]))

    ratio = hor_line_length / ver_line_length if ver_line_length != 0 else 0
    return ratio

def midpoint_mp(p1, p2, w, h):
    return int((p1.x + p2.x) * w / 2), int((p1.y + p2.y) * h / 2)

# State variables for blink detection
last_blink_time = 0
blink_cooldown = 0.5  # seconds between blinks
display_text = ""
display_time = 0
text_duration = 2.0  # seconds to show text

# New state for select blink hold
select_blink_start = None
select_blink_duration = 2.0  # seconds to hold both eyes closed for SELECT

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    frame = cv2.flip(frame, 1)
    
    # Process the frame with MediaPipe
    results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    current_time = time.time()
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            # Calculate blink ratios for both eyes
            left_eye_ratio = get_blinking_ratio([33, 160, 158, 133, 153, 144], face_landmarks, frame)
            right_eye_ratio = get_blinking_ratio([362, 385, 387, 263, 373, 380], face_landmarks, frame)
            # Check for blinks
            if left_eye_ratio > 4.5 and right_eye_ratio > 4.5:
                if select_blink_start is None:
                    select_blink_start = current_time
                elif current_time - select_blink_start >= select_blink_duration and current_time - last_blink_time > blink_cooldown:
                    display_text = "SELECT"
                    display_time = current_time
                    last_blink_time = current_time
                    print("Both eyes blink detected - SELECT")
                    select_blink_start = None  # Reset after select
            else:
                select_blink_start = None  # Reset if eyes open
                # Right eye blink detection (right eye closed, left eye open)
                if right_eye_ratio > 4.5 and left_eye_ratio < 4.0 and current_time - last_blink_time > blink_cooldown:
                    display_text = "UP"
                    display_time = current_time
                    last_blink_time = current_time
                    print("Right eye blink detected - UP")
                # Left eye blink detection (left eye closed, right eye open)
                elif left_eye_ratio > 4.5 and right_eye_ratio < 4.0 and current_time - last_blink_time > blink_cooldown:
                    display_text = "DOWN"
                    display_time = current_time
                    last_blink_time = current_time
                    print("Left eye blink detected - DOWN")
    
    # Display the current text if within display duration
    if current_time - display_time < text_duration and display_text:
        text_size = cv2.getTextSize(display_text, font, 3, 3)[0]
        text_x = (frame.shape[1] - text_size[0]) // 2
        text_y = (frame.shape[0] + text_size[1]) // 2
        
        # Add background rectangle for better visibility
        cv2.rectangle(frame, (text_x - 20, text_y - text_size[1] - 20), 
                     (text_x + text_size[0] + 20, text_y + 20), (0, 0, 0), -1)
        cv2.putText(frame, display_text, (text_x, text_y), font, 3, (0, 255, 0), 3)
    elif current_time - display_time >= text_duration:
        display_text = ""
      # Show instructions
    cv2.putText(frame, "Right eye blink = UP", (10, 30), font, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, "Left eye blink = DOWN", (10, 60), font, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, "Both eyes blink = SELECT", (10, 90), font, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, "Press ESC to exit", (10, 120), font, 0.7, (255, 255, 255), 2)
    
    cv2.imshow("Eye Blink Detection", frame)
    
    # Exit on ESC key
    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()

