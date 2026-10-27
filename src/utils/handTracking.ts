import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export interface HandPoint {
  x: number; // 0 to 1
  y: number; // 0 to 1
  z: number;
}

export interface HandGestureState {
  isHandDetected: boolean;
  handX: number; // 0 to 100 percentage
  handY: number; // 0 to 100 percentage
  isPinching: boolean;
  pinchDistance: number;
  landmarks: HandPoint[] | null;
  gestureLabel: 'NO_HAND' | 'OPEN_HAND' | 'PINCHING';
}

class HandTrackerService {
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;
  private lastVideoTime: number = -1;

  public async initialize(): Promise<boolean> {
    if (this.isReady && this.handLandmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    try {
      // Load wasm from fast jsdelivr cdn
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });

      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('MediaPipe HandLandmarker init error (falling back to lightweight vision):', err);
      this.isInitializing = false;
      this.isReady = false;
      return false;
    }
  }

  public detectHand(video: HTMLVideoElement): HandGestureState {
    const defaultState: HandGestureState = {
      isHandDetected: false,
      handX: 50,
      handY: 50,
      isPinching: false,
      pinchDistance: 1,
      landmarks: null,
      gestureLabel: 'NO_HAND'
    };

    if (!this.handLandmarker || !video || video.readyState < 2) {
      return defaultState;
    }

    try {
      const currentTime = video.currentTime;
      if (currentTime === this.lastVideoTime) {
        return defaultState;
      }
      this.lastVideoTime = currentTime;

      const results = this.handLandmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]; // Primary hand

        // Landmark 4 = Thumb tip, Landmark 8 = Index finger tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const palmCenter = landmarks[9]; // Middle finger MCP / palm area

        // In mirrored video, x coordinates might need inversion for intuitive control
        // Video is usually mirrored in selfie/camera preview
        const normThumbX = 1 - thumbTip.x;
        const normThumbY = thumbTip.y;
        const normIndexX = 1 - indexTip.x;
        const normIndexY = indexTip.y;

        // Euclidean distance between thumb tip and index tip in normalized space
        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dz = thumbTip.z - indexTip.z;
        const pinchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Pinch threshold: usually < 0.08 normalized distance
        const isPinching = pinchDistance < 0.085;

        // Pinpoint pinch action at the midpoint between thumb and index finger
        const pinchMidX = (normThumbX + normIndexX) / 2;
        const pinchMidY = (normThumbY + normIndexY) / 2;

        return {
          isHandDetected: true,
          handX: Math.max(5, Math.min(95, pinchMidX * 100)),
          handY: Math.max(5, Math.min(95, pinchMidY * 100)),
          isPinching,
          pinchDistance,
          landmarks: landmarks.map(lm => ({ x: 1 - lm.x, y: lm.y, z: lm.z })),
          gestureLabel: isPinching ? 'PINCHING' : 'OPEN_HAND'
        };
      }

      return defaultState;
    } catch {
      return defaultState;
    }
  }

  public getReadyStatus(): boolean {
    return this.isReady;
  }
}

export const handTracker = new HandTrackerService();
