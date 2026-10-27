import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FloatingWord, QuestionItem, TenseCategory } from '../types/game';
import { handTracker, HandGestureState } from '../utils/handTracking';
import { soundManager } from '../utils/audio';
import { 
  Camera, 
  Volume2, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  Hand, 
  Sparkles,
  HelpCircle,
  X
} from 'lucide-react';

interface PlayArenaARProps {
  floatingWords: FloatingWord[];
  selectedWordId: string | null;
  onSelectWord: (word: FloatingWord) => void;
  onPronounce: (text: string) => void;
  onFallbackTo2D: () => void;
  onDropOnBasket?: (category: TenseCategory) => void;
  activeToast: {
    word: string;
    isCorrect: boolean;
    correctTense: TenseCategory;
    explanation: string;
    sentence: string;
  } | null;
}

export const PlayArenaAR: React.FC<PlayArenaARProps> = ({
  floatingWords,
  selectedWordId,
  onSelectWord,
  onPronounce,
  onFallbackTo2D,
  onDropOnBasket,
  activeToast
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [cameraState, setCameraState] = useState<'prompt' | 'granted' | 'denied' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tilt, setTilt] = useState<{ gamma: number; beta: number }>({ gamma: 0, beta: 0 });

  // Hand tracking states
  const [handTrackingReady, setHandTrackingReady] = useState<boolean>(false);
  const [handState, setHandState] = useState<HandGestureState>({
    isHandDetected: false,
    handX: 50,
    handY: 50,
    isPinching: false,
    pinchDistance: 1,
    landmarks: null,
    gestureLabel: 'NO_HAND'
  });

  const [grabbedWord, setGrabbedWord] = useState<FloatingWord | null>(null);
  const [hoveredBasket, setHoveredBasket] = useState<TenseCategory | null>(null);
  const [showGestureGuide, setShowGestureGuide] = useState<boolean>(false);

  // Refs to avoid stale closures in RAF loop
  const floatingWordsRef = useRef<FloatingWord[]>(floatingWords);
  floatingWordsRef.current = floatingWords;

  const grabbedWordRef = useRef<FloatingWord | null>(grabbedWord);
  grabbedWordRef.current = grabbedWord;

  const wasPinchingRef = useRef<boolean>(false);

  // Gyroscopic parallax
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const g = Math.max(-25, Math.min(25, e.gamma));
        const b = Math.max(-25, Math.min(25, e.beta - 45));
        setTilt({ gamma: g * 0.4, beta: b * 0.4 });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Initialize camera
  const requestCamera = async () => {
    try {
      setCameraState('prompt');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraState('granted');
    } catch (err: unknown) {
      console.warn('Camera request error:', err);
      const message = err instanceof Error ? err.message : 'Kamera tidak dapat diakses atau diblokir.';
      setErrorMessage(message);
      setCameraState('denied');
    }
  };

  useEffect(() => {
    requestCamera();

    // Initialize hand tracking model
    handTracker.initialize().then((ready) => {
      setHandTrackingReady(ready);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Hand tracking & gesture processing loop
  useEffect(() => {
    if (cameraState !== 'granted') return;

    let animId: number;

    const processFrame = () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const state = handTracker.detectHand(videoRef.current);
        setHandState(state);

        // Draw hand skeleton on canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (state.isHandDetected && state.landmarks) {
              const lm = state.landmarks;
              const w = canvas.width;
              const h = canvas.height;

              // Landmark bone connections
              const fingerBones = [
                [0, 1, 2, 3, 4],       // Thumb
                [0, 5, 6, 7, 8],       // Index
                [0, 9, 10, 11, 12],    // Middle
                [0, 13, 14, 15, 16],   // Ring
                [0, 17, 18, 19, 20],   // Pinky
                [5, 9, 13, 17, 0]      // Palm base
              ];

              // Draw bones
              ctx.lineWidth = 3;
              ctx.lineCap = 'round';
              ctx.strokeStyle = state.isPinching ? 'rgba(251, 191, 36, 0.8)' : 'rgba(56, 189, 248, 0.6)';

              fingerBones.forEach((bone) => {
                ctx.beginPath();
                ctx.moveTo(lm[bone[0]].x * w, lm[bone[0]].y * h);
                for (let i = 1; i < bone.length; i++) {
                  ctx.lineTo(lm[bone[i]].x * w, lm[bone[i]].y * h);
                }
                ctx.stroke();
              });

              // Draw joints
              lm.forEach((pt, idx) => {
                const px = pt.x * w;
                const py = pt.y * h;
                ctx.beginPath();
                ctx.arc(px, py, idx === 4 || idx === 8 ? 7 : 4, 0, 2 * Math.PI);
                if (idx === 4 || idx === 8) {
                  // Thumb or Index tip
                  ctx.fillStyle = state.isPinching ? '#fbbf24' : '#38bdf8';
                  ctx.shadowColor = state.isPinching ? '#f59e0b' : '#0284c7';
                  ctx.shadowBlur = 10;
                } else {
                  ctx.fillStyle = '#10b981';
                  ctx.shadowBlur = 0;
                }
                ctx.fill();
              });

              // If pinching, draw energetic pinch beam between thumb (4) and index (8)
              if (state.isPinching) {
                const tX = lm[4].x * w;
                const tY = lm[4].y * h;
                const iX = lm[8].x * w;
                const iY = lm[8].y * h;

                ctx.beginPath();
                ctx.moveTo(tX, tY);
                ctx.lineTo(iX, iY);
                ctx.lineWidth = 5;
                ctx.strokeStyle = '#fef08a';
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 15;
                ctx.stroke();

                // Golden pinch circle
                ctx.beginPath();
                ctx.arc((tX + iX) / 2, (tY + iY) / 2, 14, 0, 2 * Math.PI);
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.stroke();
              }
            }
          }
        }

        // --- GESTURE INTERACTION: PINCH / CUBIT KATA ---
        const hX = state.handX;
        const hY = state.handY;
        const isCurrentlyPinching = state.isPinching && state.isHandDetected;

        // Check if hand is anywhere in the lower half (easier to reach on camera)
        let targetBasket: TenseCategory | null = null;
        if (hY > 48) {
          if (hX < 36) {
            targetBasket = 'PRESENT';
          } else if (hX < 64) {
            targetBasket = 'PAST';
          } else {
            targetBasket = 'FUTURE';
          }
        }
        setHoveredBasket(targetBasket);

        // Transition: Hand started pinching (Cubit kata)
        if (isCurrentlyPinching && !wasPinchingRef.current) {
          if (!grabbedWordRef.current) {
            // Find closest word to hand position (generous 28% radius for easy grabbing)
            const words = floatingWordsRef.current;
            let closest: FloatingWord | null = null;
            let minDist = 28;

            words.forEach((w) => {
              const dx = w.x - hX;
              const dy = w.y - hY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDist) {
                minDist = dist;
                closest = w;
              }
            });

            if (closest) {
              setGrabbedWord(closest);
              onSelectWord(closest);
              soundManager.playGrab();
            }
          }
        }

        // Transition: Hand released / opened (Lepas kata ke ring basket)
        if (!isCurrentlyPinching && wasPinchingRef.current) {
          if (grabbedWordRef.current) {
            if (targetBasket && onDropOnBasket) {
              // SLAM DUNK INTO BASKETBALL HOOP VIA HAND GESTURE!
              soundManager.playSwish();
              onDropOnBasket(targetBasket);
              setGrabbedWord(null);
            } else {
              // Released in arena space
              setGrabbedWord(null);
            }
          }
        }

        wasPinchingRef.current = isCurrentlyPinching;
      }

      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animId);
  }, [cameraState, onDropOnBasket, onSelectWord]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex-1 overflow-hidden select-none bg-black">
      {/* Video Background Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover -scale-x-100 transition-opacity duration-500 ${
          cameraState === 'granted' ? 'opacity-90' : 'opacity-10'
        }`}
      />

      {/* Canvas for holographic hand skeleton */}
      <canvas
        ref={canvasRef}
        width={typeof window !== 'undefined' ? window.innerWidth : 1280}
        height={typeof window !== 'undefined' ? window.innerHeight : 720}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* AR HUD Overlay Grids & Indicators */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Corner Reticles */}
        <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-emerald-400/70" />
        <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-emerald-400/70" />
        <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-emerald-400/70" />
        <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-emerald-400/70" />

        {/* Top Hand Gesture Status Bar */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-700 text-xs font-mono flex items-center gap-2.5 shadow-xl backdrop-blur-md">
          {handState.isHandDetected ? (
            handState.isPinching ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                👌 MENCUBIT KATA {grabbedWord ? `"${grabbedWord.question.word}"` : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                ✋ TANGAN TERDETEKSI (Cubit untuk Menangkap)
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-ping" />
              Arahkan tangan ke kamera untuk mencubit kata
            </span>
          )}
        </div>

        {/* Hovered basket indicator beam when carrying word */}
        {grabbedWord && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-lg px-3 pointer-events-auto z-40">
            <div className="p-2 rounded-2xl bg-slate-950/90 border-2 border-amber-400/80 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
              <span className="text-[11px] font-bold text-amber-300 animate-pulse flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bawa ke Ring Basket atau Ketuk Target di Bawah:</span>
              </span>
              <div className="grid grid-cols-3 gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (onDropOnBasket) {
                      soundManager.playSwish();
                      onDropOnBasket('PRESENT');
                      setGrabbedWord(null);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center ${
                    hoveredBasket === 'PRESENT'
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-300 scale-105'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60'
                  }`}
                >
                  <span className="text-sm">🏀</span>
                  <span>Ring Present</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onDropOnBasket) {
                      soundManager.playSwish();
                      onDropOnBasket('PAST');
                      setGrabbedWord(null);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center ${
                    hoveredBasket === 'PAST'
                      ? 'bg-orange-500 text-slate-950 ring-4 ring-orange-300 scale-105'
                      : 'bg-orange-950/80 text-orange-300 border border-orange-500/60'
                  }`}
                >
                  <span className="text-sm">🏀</span>
                  <span>Ring Past</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onDropOnBasket) {
                      soundManager.playSwish();
                      onDropOnBasket('FUTURE');
                      setGrabbedWord(null);
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center ${
                    hoveredBasket === 'FUTURE'
                      ? 'bg-blue-500 text-slate-950 ring-4 ring-blue-300 scale-105'
                      : 'bg-blue-950/80 text-blue-300 border border-blue-500/60'
                  }`}
                >
                  <span className="text-sm">🏀</span>
                  <span>Ring Future</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hand Gesture Help Guide Button */}
      <button
        onClick={() => setShowGestureGuide(!showGestureGuide)}
        className="absolute top-3 right-4 z-30 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
        title="Petunjuk Gerakan Tangan"
      >
        <Hand className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">Cara Mencubit Kata</span>
      </button>

      {/* Floating Holographic Words in AR space */}
      {cameraState === 'granted' &&
        floatingWords.map((item) => {
          const isSelected = selectedWordId === item.id || grabbedWord?.id === item.id;
          const isGrabbed = grabbedWord?.id === item.id;

          // If grabbed by hand, attach directly to hand coordinates!
          const posX = isGrabbed ? handState.handX : Math.max(5, Math.min(85, item.x + tilt.gamma));
          const posY = isGrabbed ? handState.handY : Math.max(10, Math.min(65, item.y + tilt.beta));

          return (
            <div
              key={item.id}
              onClick={() => onSelectWord(item)}
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${isGrabbed ? 1.25 : isSelected ? 1.15 : item.scale})`,
                transition: isGrabbed ? 'none' : 'transform 0.1s ease-out'
              }}
              className={`absolute cursor-pointer p-3 sm:p-4 rounded-2xl backdrop-blur-lg shadow-2xl select-none touch-manipulation ${
                isGrabbed
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black ring-4 ring-white shadow-[0_0_40px_rgba(251,191,36,1)] z-40 animate-pulse'
                  : isSelected
                  ? 'bg-amber-400 text-slate-950 font-black ring-4 ring-white shadow-[0_0_30px_rgba(251,191,36,0.8)] z-30'
                  : 'bg-slate-950/85 text-white border-2 border-cyan-400/80 hover:border-amber-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-game text-base sm:text-xl font-bold tracking-wide">
                  {item.question.word}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPronounce(item.question.word);
                  }}
                  className={`p-1 rounded-lg transition cursor-pointer ${
                    isGrabbed || isSelected ? 'text-slate-900 hover:text-black' : 'text-cyan-300 hover:text-white'
                  }`}
                  title="Dengarkan pengucapan kata"
                >
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                  isGrabbed || isSelected ? 'bg-black/20 text-slate-950 font-bold' : 'bg-cyan-950/80 text-cyan-300'
                }`}>
                  {isGrabbed ? 'TERCUBIT (PINCHED)' : 'AR TARGET'}
                </span>
                <span className={`text-[9px] font-bold ${isGrabbed || isSelected ? 'text-slate-900' : 'text-amber-300'}`}>
                  {isGrabbed ? '✊ MEMBAWA...' : '👌 CUBIT KATA'}
                </span>
              </div>
            </div>
          );
        })}

      {/* Gesture Help Modal Guide */}
      {showGestureGuide && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGestureGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Hand className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Cara Menggunakan Tangan untuk Mencubit Kata</h3>
            <p className="text-xs text-slate-300 mb-4">
              Kamera mendeteksi gerakan jari Anda secara langsung di browser:
            </p>

            <div className="space-y-3 text-xs text-slate-200 mb-6">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex items-start gap-3">
                <span className="text-xl">✋</span>
                <div>
                  <strong className="text-white block">1. Arahkan Tangan ke Layar</strong>
                  <span>Buka telapak tangan menghadap kamera. Anda akan melihat rangka sendi virtual hijau.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
                <span className="text-xl">👌</span>
                <div>
                  <strong className="text-amber-300 block">2. Cubit (Pinch) Kata</strong>
                  <span>Dekatkan ujung ibu jari dan telunjuk Anda di depan kata kerja yang ingin ditangkap. Kata akan langsung menempel!</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-start gap-3">
                <span className="text-xl">🧺</span>
                <div>
                  <strong className="text-blue-300 block">3. Geser & Buka Jari di Keranjang</strong>
                  <span>Tetap cubit sambil mengarahkan tangan ke keranjang Present (Hijau), Past (Oranye), atau Future (Biru). Buka jari untuk memasukkannya!</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGestureGuide(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs"
            >
              Saya Mengerti, Mulai Cubit Kata!
            </button>
          </div>
        </div>
      )}

      {/* Camera Permission / Error Fallback Dialog */}
      {cameraState !== 'granted' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Izin Kamera untuk Mode AR & Deteksi Tangan</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Kamera digunakan untuk mendeteksi gerakan tangan Anda (mencubit & menangkap kata di udara).
              Video diproses secara lokal di browser Anda dan tidak pernah disimpan atau direkam.
            </p>

            {cameraState === 'denied' && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Kamera tidak dapat diakses ({errorMessage || 'Izin ditolak oleh peramban'}).</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={requestCamera}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Coba Akses Kamera Lagi</span>
              </button>

              <button
                onClick={onFallbackTo2D}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Beralih ke Mode 2D (Tanpa Kamera)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating feedback toast */}
      {activeToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 max-w-lg w-[92%] sm:w-auto z-50 animate-in fade-in duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-xl ${
            activeToast.isCorrect
              ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.7)]'
              : 'bg-rose-950/95 border-rose-400 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.7)]'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                activeToast.isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-rose-400 text-slate-950'
              }`}>
                {activeToast.isCorrect ? '✓ AR PINCH: BENAR' : '✗ AR PINCH: SALAH'}
              </span>
              <span className="font-bold text-sm text-white">"{activeToast.word}"</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">
              {activeToast.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
