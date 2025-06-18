import axios from 'axios';

interface BlinkResult {
  action: string | null;
  selectProgress: number;
}

export class BlinkDetectionEngine {
  async initialize(): Promise<void> {
    // No-op for backend mode
  }

  async processFrame(video: HTMLVideoElement): Promise<BlinkResult | null> {
    // Capture frame from video
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

    try {
      console.log('Sending POST request to /detect with image data.'); // Added for debugging
      const response = await axios.post('http://localhost:5000/detect', {
        image: base64
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Backend response:', response.data);
      const { action } = response.data;
      return { action, selectProgress: 0 };
    } catch (error) {
      console.error('Backend error:', error);
      return null;
    }
  }
}