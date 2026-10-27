import React, { useRef, useState } from 'react';
import { FloatingWord, QuestionItem, TenseCategory } from '../types/game';
import { Volume2, Move, Sparkles, Hand } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PlayArena2DProps {
  floatingWords: FloatingWord[];
  selectedWordId: string | null;
  onSelectWord: (word: FloatingWord) => void;
  onDragStart: (e: React.DragEvent, word: FloatingWord) => void;
  onPronounce: (text: string) => void;
  activeToast: {
    word: string;
    isCorrect: boolean;
    correctTense: TenseCategory;
    explanation: string;
    sentence: string;
  } | null;
}

export const PlayArena2D: React.FC<PlayArena2DProps> = ({
  floatingWords,
  selectedWordId,
  onSelectWord,
  onDragStart,
  onPronounce,
  activeToast
}) => {
  const initialTouchDistRef = useRef<number | null>(null);

  // Handle multi-touch pinch on word cards
  const handleTouchStart = (e: React.TouchEvent, word: FloatingWord) => {
    if (e.touches.length === 2) {
      // 2-finger pinch gesture started
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      initialTouchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent, word: FloatingWord) => {
    if (e.touches.length === 2 && initialTouchDistRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      // Pinching inward (closing fingers)
      if (initialTouchDistRef.current - currentDist > 25) {
        onSelectWord(word);
        soundManager.playGrab();
        initialTouchDistRef.current = null;
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[440px] flex-1 overflow-hidden select-none">
      {/* Dynamic floating word elements */}
      {floatingWords.map((item) => {
        const isSelected = selectedWordId === item.id;

        return (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            onClick={() => onSelectWord(item)}
            onTouchStart={(e) => handleTouchStart(e, item)}
            onTouchMove={(e) => handleTouchMove(e, item)}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
              transition: 'transform 0.05s ease-out, box-shadow 0.2s ease'
            }}
            className={`absolute cursor-grab active:cursor-grabbing p-3 sm:p-4 rounded-2xl backdrop-blur-md transition-all shadow-xl select-none group touch-manipulation ${
              isSelected
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold ring-4 ring-white shadow-[0_0_30px_rgba(251,191,36,0.8)] z-30 scale-110'
                : 'bg-slate-900/85 hover:bg-slate-800/95 text-white border-2 border-slate-600/70 hover:border-amber-400/80 z-10 hover:z-20 hover:scale-105'
            }`}
          >
            {/* Word Badge */}
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
                  isSelected ? 'text-slate-900 hover:text-black' : 'text-slate-400 hover:text-amber-400'
                }`}
                title="Dengarkan pengucapan kata"
              >
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Quick helper clue */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isSelected ? 'bg-black/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {item.question.difficulty}
              </span>
              <span className={`text-[9px] uppercase font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                {isSelected ? 'Terpilih!' : 'Ketuk / Cubit 2 Jari'}
              </span>
            </div>
          </div>
        );
      })}

      {/* When no floating words are left */}
      {floatingWords.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <Sparkles className="w-10 h-10 text-amber-400 animate-spin mb-2" />
          <p className="font-bold text-sm">Menyiapkan kata berikutnya...</p>
        </div>
      )}

      {/* Real-time feedback toast explaining the answered question */}
      {activeToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-lg w-[92%] sm:w-auto z-40 animate-in fade-in zoom-in-95 duration-200">
          <div className={`p-4 rounded-2xl shadow-2xl border-2 backdrop-blur-xl ${
            activeToast.isCorrect
              ? 'bg-emerald-950/95 border-emerald-400 text-emerald-100 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
              : 'bg-rose-950/95 border-rose-400 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.5)]'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                    activeToast.isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-rose-400 text-slate-950'
                  }`}>
                    {activeToast.isCorrect ? '✓ BENAR (Correct!)' : '✗ SALAH (Incorrect!)'}
                  </span>
                  <span className="font-bold text-sm text-white">"{activeToast.word}"</span>
                </div>

                <p className="text-xs font-semibold text-white/90 mt-1">
                  Kunci: <strong className="underline">{activeToast.correctTense === 'PRESENT' ? 'Simple Present' : activeToast.correctTense === 'PAST' ? 'Simple Past' : 'Simple Future'}</strong>
                </p>

                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {activeToast.explanation}
                </p>

                <p className="text-[11px] italic text-slate-300 mt-1.5 border-t border-white/10 pt-1">
                  &ldquo;{activeToast.sentence}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
