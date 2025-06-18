from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import mediapipe as mp
from math import hypot
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app)

mp_face_mesh = mp.solutions.face_mesh

# Helper functions from your main.py

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

@app.route('/detect', methods=['POST'])
def detect():
    try:
        print('Received /detect request')
        data = request.json
        if not data or 'image' not in data:
            print("Error: Invalid JSON or missing 'image' key.")
            return jsonify({"error": "Invalid JSON or missing 'image' key"}), 400

        # Create a new FaceMesh instance for each request to avoid corruption
        face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5)

        img_data = data['image']
        img_bytes = base64.b64decode(img_data)
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        frame = np.array(img)
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        
        action = None
        left_eye_ratio = right_eye_ratio = 0

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                left_eye_ratio = get_blinking_ratio([33, 160, 158, 133, 153, 144], face_landmarks, frame)
                right_eye_ratio = get_blinking_ratio([362, 385, 387, 263, 373, 380], face_landmarks, frame)
                print(f"Left: {left_eye_ratio:.2f}, Right: {right_eye_ratio:.2f}")

                if left_eye_ratio > 4.5 and right_eye_ratio > 4.5:
                    action = "SELECT"
                elif right_eye_ratio > 4.5 and left_eye_ratio < 4.0:
                    action = "UP"
                elif left_eye_ratio > 4.5 and right_eye_ratio < 4.0:
                    action = "DOWN"
        
        # Clean up the FaceMesh instance
        face_mesh.close()
        
        print(f"Action detected: {action}")
        return jsonify({"action": action, "left_eye_ratio": left_eye_ratio, "right_eye_ratio": right_eye_ratio})
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
