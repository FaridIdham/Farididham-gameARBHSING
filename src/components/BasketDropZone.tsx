import React from 'react';
import { TenseCategory } from '../types/game';
import { Clock, History, Rocket, Check, X, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BasketDropZoneProps {
  onDropOnBasket: (category: TenseCategory) => void;
  activeFeedback?: {
    basketCategory: TenseCategory;
    isCorrect: boolean;
  } | null;
  selectedWordId: string | null;
}

export const BasketDropZone: React.FC<BasketDropZoneProps> = ({
  onDropOnBasket,
  activeFeedback,
  selectedWordId
}) => {
  const hoops: Array<{
    id: TenseCategory;
    name: string;
    subtext: string;
    badge: string;
    formula: string;
    colorCode: string;
    backboardBorder: string;
    rimColor: string;
    glowBorder: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'PRESENT',
      name: 'SIMPLE PRESENT',
      subtext: 'Rutinitas & Fakta (V1 / V1+s/es)',
      badge: 'RING BASKET 1 (HIJAU)',
      formula: 'Subject + V1 (s/es)',
      colorCode: '#10b981',
      backboardBorder: 'border-emerald-400/80',
      rimColor: 'bg-emerald-500 border-emerald-300',
      glowBorder: 'ring-4 ring-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.8)]',
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
    },
    {
      id: 'PAST',
      name: 'SIMPLE PAST',
      subtext: 'Tindakan Selesai Lampau (V2)',
      badge: 'RING BASKET 2 (ORANGE)',
      formula: 'Subject + V2 (ed/irregular)',
      colorCode: '#f97316',
      backboardBorder: 'border-orange-400/80',
      rimColor: 'bg-orange-500 border-orange-300',
      glowBorder: 'ring-4 ring-orange-400 shadow-[0_0_40px_rgba(249,115,22,0.8)]',
      icon: <History className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" />
    },
    {
      id: 'FUTURE',
      name: 'SIMPLE FUTURE',
      subtext: 'Rencana Masa Depan (will + V1)',
      badge: 'RING BASKET 3 (BIRU)',
      formula: 'Subject + will + V1',
      colorCode: '#3b82f6',
      backboardBorder: 'border-blue-400/80',
      rimColor: 'bg-blue-500 border-blue-300',
      glowBorder: 'ring-4 ring-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.8)]',
      icon: <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
    }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, category: TenseCategory) => {
    e.preventDefault();
    soundManager.playSwish();
    onDropOnBasket(category);
  };

  const handleClick = (category: TenseCategory) => {
    soundManager.playSwish();
    onDropOnBasket(category);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 pt-1 pb-3">
      {/* Visual Shoot Hint when word is grabbed or selected */}
      {selectedWordId && (
        <div className="text-center mb-2 animate-bounce">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg ring-2 ring-white/60">
            🏀 Ketuk atau lepas kata ke Ring Basket di bawah ini untuk SLAM DUNK!
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5">
        {hoops.map((h) => {
          const isFeedbackTarget = activeFeedback?.basketCategory === h.id;
          const isFeedbackCorrect = activeFeedback?.isCorrect;

          let feedbackAnimation = '';
          if (isFeedbackTarget) {
            if (isFeedbackCorrect) {
              feedbackAnimation = 'ring-4 ring-emerald-400 scale-[1.04] bg-emerald-950/90 shadow-[0_0_40px_rgba(16,185,129,0.9)]';
            } else {
              feedbackAnimation = 'ring-4 ring-rose-500 scale-[0.98] bg-rose-950/90 animate-shake shadow-[0_0_40px_rgba(244,63,94,0.9)]';
            }
          }

          return (
            <div
              key={h.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, h.id)}
              onClick={() => handleClick(h.id)}
              className={`relative group rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 text-center cursor-pointer transition-all duration-200 border-2 backdrop-blur-md flex flex-col justify-between select-none ${
                isFeedbackTarget
                  ? feedbackAnimation
                  : `bg-slate-900/85 hover:bg-slate-800/95 ${h.backboardBorder} hover:scale-[1.02] shadow-2xl`
              } ${selectedWordId ? 'ring-2 ring-white/50 animate-pulse' : ''}`}
            >
              {/* Top: Basketball Backboard Header */}
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10">
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-950/80 text-slate-300 border border-slate-700/80">
                  {h.badge}
                </span>

                {isFeedbackTarget ? (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    isFeedbackCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {isFeedbackCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    {h.icon}
                  </div>
                )}
              </div>

              {/* Backboard Inner Target Square */}
              <div className="relative mx-auto my-1 w-full max-w-[200px] py-1 px-2 rounded-xl bg-slate-950/60 border border-dashed border-white/20 flex flex-col items-center">
                <h3 className="font-game text-xs sm:text-base font-extrabold text-white tracking-wide">
                  {h.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium hidden sm:block">
                  {h.subtext}
                </p>
              </div>

              {/* REALISTIC 3D BASKETBALL HOOP & NET GRAPHIC */}
              <div className="relative my-2 flex flex-col items-center justify-center">
                {/* Metal Mounting Bracket */}
                <div className="w-6 h-2 bg-slate-600 rounded-t-sm" />

                {/* Basketball Rim (Ring Besi Basket) */}
                <div className={`relative w-24 sm:w-32 md:w-36 h-6 sm:h-8 rounded-[50%] border-4 shadow-lg flex items-center justify-center z-10 transition-transform group-hover:scale-105 ${
                  h.id === 'PRESENT'
                    ? 'border-emerald-400 bg-emerald-500/20 shadow-emerald-500/40'
                    : h.id === 'PAST'
                    ? 'border-orange-400 bg-orange-500/20 shadow-orange-500/40'
                    : 'border-blue-400 bg-blue-500/20 shadow-blue-500/40'
                }`}>
                  {/* Basketball Hoop Hole Opening Indicator */}
                  <span className="text-[9px] sm:text-[10px] font-black uppercase text-white/90 drop-shadow">
                    {isFeedbackTarget && isFeedbackCorrect ? '★ SWISH!' : 'MASUKKAN SINI'}
                  </span>
                </div>

                {/* Basketball Woven Net (Jaring Basket Anyam) */}
                <div className={`relative -mt-2 w-20 sm:w-28 md:w-32 h-14 sm:h-18 transition-all ${
                  isFeedbackTarget && isFeedbackCorrect ? 'animate-bounce' : ''
                }`}>
                  <svg
                    viewBox="0 0 100 70"
                    className="w-full h-full drop-shadow-md"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Woven Net Mesh Lines */}
                    <path
                      d="M 5,0 L 20,70 M 20,0 L 32,70 M 35,0 L 44,70 M 50,0 L 50,70 M 65,0 L 56,70 M 80,0 L 68,70 M 95,0 L 80,70"
                      stroke={h.colorCode}
                      strokeWidth="2"
                      strokeOpacity="0.8"
                    />
                    <path
                      d="M 95,0 L 80,70 M 80,0 L 68,70 M 65,0 L 56,70 M 50,0 L 50,70 M 35,0 L 44,70 M 20,0 L 32,70 M 5,0 L 20,70"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeOpacity="0.75"
                    />
                    {/* Horizontal Rope Rings */}
                    <path d="M 8,15 Q 50,22 92,15" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
                    <path d="M 12,32 Q 50,38 88,32" stroke={h.colorCode} strokeWidth="1.5" strokeOpacity="0.8" />
                    <path d="M 16,50 Q 50,55 84,50" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
                    <ellipse cx="50" cy="68" rx="30" ry="3" stroke={h.colorCode} strokeWidth="2.5" />
                  </svg>
                </div>
              </div>

              {/* Bottom Quick Shoot Button */}
              <div className="pt-1.5 border-t border-white/10">
                <button
                  type="button"
                  className={`w-full py-1 sm:py-1.5 rounded-xl font-bold text-[10px] sm:text-xs text-white transition-all shadow ${
                    h.id === 'PRESENT'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : h.id === 'PAST'
                      ? 'bg-orange-600 hover:bg-orange-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  🏀 Masukkan ke Ring Ini
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
