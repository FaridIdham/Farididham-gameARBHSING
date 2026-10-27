import React from 'react';
import { StudentProfile, PlaySessionType } from '../types/game';
import { 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  RotateCcw, 
  Camera, 
  Smartphone, 
  Clock, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Zap,
  Target
} from 'lucide-react';

interface GameHUDProps {
  student: StudentProfile;
  mode: '2D' | 'AR';
  sessionType?: PlaySessionType;
  level?: number;
  onToggleMode: () => void;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  evaluatedCount: number;
  minimumRequired: number;
  correctCount: number;
  incorrectCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onQuitGame: () => void;
  attemptNumber?: number;
  maxAttempts?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  student,
  mode,
  sessionType = 'EXAM',
  level = 1,
  onToggleMode,
  timeRemainingSeconds,
  totalDurationSeconds,
  isPaused,
  onTogglePause,
  evaluatedCount,
  minimumRequired,
  correctCount,
  incorrectCount,
  soundEnabled,
  onToggleSound,
  onOpenHelp,
  onQuitGame,
  attemptNumber = 1,
  maxAttempts = 3
}) => {
  const formatTime = (secs: number) => {
    if (secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 30 && timeRemainingSeconds > 10;
  const isCriticalTime = timeRemainingSeconds <= 10 && timeRemainingSeconds > 0;

  const currentScorePct = evaluatedCount > 0 ? (correctCount / evaluatedCount) * 100 : 0;
  const progressRatio = Math.min(100, (evaluatedCount / minimumRequired) * 100);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-700/80 px-3 sm:px-6 py-2.5 shadow-lg select-none">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Student & Mode Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 font-semibold leading-none">{student.className} &bull; {student.nis}</p>
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[180px]">{student.fullName}</p>
          </div>

          {/* Session Type & Level Badge */}
          <div className="flex items-center gap-1.5">
            {sessionType === 'PRACTICE' ? (
              <span className="px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Latihan (Lvl {level})</span>
              </span>
            ) : (
              <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 ${
                attemptNumber >= maxAttempts
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                <span>Ujian (Lvl {level}) &bull; Coba {attemptNumber}/{maxAttempts}</span>
                {attemptNumber >= maxAttempts && (
                  <span className="hidden sm:inline text-[9px] text-amber-400 font-extrabold">(Final)</span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onToggleMode}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'AR'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
            title="Klik untuk beralih mode AR / 2D"
          >
            {mode === 'AR' ? (
              <>
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Mode AR</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Mode 2D</span>
              </>
            )}
          </button>
        </div>

        {/* Center: Timer & Accuracy */}
        <div className="flex items-center gap-3">
          {/* Timer */}
          {totalDurationSeconds > 0 ? (
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isCriticalTime
                ? 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse font-extrabold ring-2 ring-rose-500'
                : isLowTime
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}>
              <Clock className={`w-4 h-4 ${isCriticalTime ? 'text-rose-400 animate-spin' : 'text-amber-400'}`} />
              <span className="font-mono text-xs sm:text-base font-bold">
                {formatTime(timeRemainingSeconds)}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold">
              Mode Latihan
            </div>
          )}

          {/* Score & Progress */}
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm">
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{correctCount}</span>
            </div>
            <div className="flex items-center gap-1 text-rose-400 font-bold">
              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{incorrectCount}</span>
            </div>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-slate-400 text-xs">Nilai:</span>
              <span className={`font-bold font-mono ${currentScorePct >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {currentScorePct.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Progress to minimum required */}
          <div className="hidden lg:flex flex-col gap-1 w-28">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Target: {evaluatedCount}/{minimumRequired}</span>
              <span>{progressRatio.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-300 ${evaluatedCount >= minimumRequired ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Controls (Sound, Pause, Help, Quit) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title={soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onTogglePause}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title={isPaused ? 'Lanjutkan Permainan' : 'Jeda Permainan'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-current" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            title="Bantuan & Petunjuk"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
          </button>

          <button
            onClick={onQuitGame}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition cursor-pointer"
            title="Selesaikan & Hitung Nilai"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
