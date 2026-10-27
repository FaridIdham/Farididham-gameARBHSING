import React, { useState, useEffect } from 'react';
import { GameResult, AnswerRecord } from '../types/game';
import { exportSingleResultToCSV, getSessionAttempts, MAX_ATTEMPTS } from '../utils/storage';
import { getFinalStatusLabel, canRetry } from '../utils/gameLogic';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  BookOpen, 
  Printer, 
  Download, 
  Home, 
  Sparkles, 
  Clock, 
  Calendar, 
  User, 
  School, 
  Volume2, 
  TrendingUp, 
  AlertTriangle, 
  Lock, 
  Award,
  Star,
  X
} from 'lucide-react';

import { PrintCertificateModal } from './PrintCertificateModal';
import { calculatePoints, calculateStars } from '../utils/gameLogic';

interface ResultDashboardProps {
  result: GameResult;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard?: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  result,
  onRestart,
  onHome,
  onOpenLeaderboard
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'mistakes' | 'correct'>('all');
  const [sessionHistory, setSessionHistory] = useState<GameResult[]>([]);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showMistakesModal, setShowMistakesModal] = useState<boolean>(false);
  const [retriedWords, setRetriedWords] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const tableRef = React.useRef<HTMLDivElement>(null);

  const handleOpenMistakes = () => {
    setShowMistakesModal(true);
    setFilterMode('mistakes');
  };

  const handleScrollToTable = () => {
    setShowMistakesModal(false);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const attemptNum = result.attemptNumber || 1;
  const isFinalAttempt = attemptNum >= MAX_ATTEMPTS;
  const isRetriable = canRetry(attemptNum, result.passed && result.isMinimumMet, MAX_ATTEMPTS);
  const statusInfo = getFinalStatusLabel(result.passed && result.isMinimumMet, attemptNum, MAX_ATTEMPTS, result.correctCount);
  const totalPoints = calculatePoints(result.correctCount);
  const starsCount = result.starsEarned !== undefined 
    ? result.starsEarned 
    : calculateStars(result.scorePercentage, result.passed && result.isMinimumMet);

  useEffect(() => {
    // Check session attempts
    const history = getSessionAttempts(result.student.nis);
    setSessionHistory(history);

    // If passed, launch celebratory confetti and fanfare!
    if (result.passed && result.isMinimumMet) {
      soundManager.playFanfare();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 60,
            origin: { x: 0.1, y: 0.6 }
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 60,
            origin: { x: 0.9, y: 0.6 }
          });
        }, 300);
      } catch {
        // Safe fallback if canvas not available
      }
    } else if (isFinalAttempt) {
      soundManager.playIncorrect();
    }
  }, [result, isFinalAttempt]);

  const filteredAnswers = result.answers.filter((ans) => {
    if (filterMode === 'mistakes') return !ans.isCorrect;
    if (filterMode === 'correct') return ans.isCorrect;
    return true;
  });

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleExportCSV = () => {
    exportSingleResultToCSV(result);
  };

  const tenseLabel = (cat: string) => {
    switch (cat) {
      case 'PRESENT': return 'Simple Present';
      case 'PAST': return 'Simple Past';
      case 'FUTURE': return 'Simple Future';
      default: return cat;
    }
  };

  return (
    <div className="min-h-screen bg-game-grid text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Certificate / Result Header Banner */}
        <div className={`p-6 sm:p-8 rounded-3xl border-2 backdrop-blur-xl shadow-2xl relative overflow-hidden print-card ${
          result.passed && result.isMinimumMet
            ? 'bg-gradient-to-br from-emerald-950/90 via-slate-900/90 to-teal-950/90 border-emerald-500/60 shadow-emerald-500/20'
            : isFinalAttempt
            ? 'bg-gradient-to-br from-rose-950/90 via-slate-900/90 to-red-950/90 border-rose-500/80 shadow-rose-500/30 ring-2 ring-rose-500/40'
            : 'bg-gradient-to-br from-amber-950/90 via-slate-900/90 to-orange-950/90 border-amber-500/60 shadow-amber-500/20'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-xl ${
                result.passed && result.isMinimumMet
                  ? 'bg-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-400/50'
                  : isFinalAttempt
                  ? 'bg-rose-600 text-white shadow-rose-600/40 ring-4 ring-rose-400/50'
                  : 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-4 ring-amber-400/50'
              }`}>
                {result.passed && result.isMinimumMet ? (
                  <Trophy className="w-10 h-10" />
                ) : isFinalAttempt ? (
                  <Lock className="w-10 h-10" />
                ) : (
                  <AlertTriangle className="w-10 h-10" />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    result.passed && result.isMinimumMet
                      ? 'bg-emerald-400 text-slate-950'
                      : isFinalAttempt
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-400 text-slate-950'
                  }`}>
                    {statusInfo.label === 'LULUS' ? '★ LULUS KOMPETENSI' : statusInfo.label === 'TIDAK LULUS' ? '✕ KEPUTUSAN FINAL: TIDAK LULUS' : '⚠ BELUM LULUS (REMEDIAL WAJIB)'}
                  </span>

                  {/* Attempt tracker badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isFinalAttempt
                      ? 'bg-rose-950 text-rose-300 border-rose-500/60'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}>
                    Percobaan {attemptNum} dari {MAX_ATTEMPTS} {isFinalAttempt ? '(Batas Maksimal)' : ''}
                  </span>

                  {!result.isMinimumMet && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-500/50">
                      Belum Memenuhi Minimal 10 Soal ({result.totalAnswered}/10)
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {result.passed && result.isMinimumMet
                    ? 'Selamat! Anda Dinyatakan LULUS!'
                    : isFinalAttempt
                    ? 'Batas 3 Kali Percobaan Telah Tercapai'
                    : 'Belum Mencapai KKM, Silakan Mengulang'}
                </h1>

                <p className="text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {statusInfo.message}
                </p>
              </div>
            </div>

            {/* Score circle & Nilai Akhir */}
            <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-700/80 p-5 rounded-2xl min-w-[170px] shadow-xl">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">NILAI AKHIR</span>
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight my-1 ${
                result.passed && result.isMinimumMet ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {result.scorePercentage.toFixed(1)}%
              </span>

              {/* Star Rating System */}
              <div className="flex items-center gap-1 my-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-4 h-4 ${
                      starIdx <= starsCount
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.9)] animate-pulse'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <span>Poin: <strong className="text-emerald-400 font-mono">{totalPoints} Pts</strong></span>
              </div>
              <span className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                result.passed && result.isMinimumMet ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {result.passed && result.isMinimumMet ? 'MEMENUHI KKM' : 'DI BAWAH KKM'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 REKAP KARTU UTAMA: TOTAL NILAI, JAWABAN BENAR, JAWABAN SALAH, NILAI AKHIR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 print-card">
          {/* Card 1: Total Kata Dijawab */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400">Total Kata Dijawab</span>
              <p className="text-3xl sm:text-4xl font-black text-white mt-1">{result.totalAnswered}</p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Target Minimal: <strong className="text-white">10 Kata</strong>
              <span className={`block font-semibold mt-0.5 ${result.isMinimumMet ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.isMinimumMet ? '✓ Syarat Terpenuhi' : '✗ Kurang Soal'}
              </span>
            </div>
          </div>

          {/* Card 2: Jawaban Benar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-300 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jawaban Benar (+10 Pts)
              </span>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">{result.correctCount}</p>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-500/30 text-[11px] text-emerald-300/80">
              Total Poin: <strong className="text-emerald-300 text-xs">{totalPoints} / 100 Poin</strong>
              <span className="block font-semibold mt-0.5">
                {result.correctCount >= 6 ? '✓ Memenuhi Minimal 6 Kata' : '✗ Butuh Minimal 6 Benar'}
              </span>
            </div>
          </div>

          {/* Card 3: Jawaban Salah */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-center flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase font-bold text-rose-300 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Jawaban Salah
              </span>
              <p className="text-3xl sm:text-4xl font-black text-rose-400 mt-1">{result.incorrectCount}</p>
            </div>
            <div className="mt-2 pt-2 border-t border-rose-500/30 text-[11px] text-rose-300/80">
              Kekeliruan: <strong className="text-rose-300">{result.incorrectCount} / {result.totalAnswered}</strong>
              <span className="block font-semibold mt-0.5">
                {result.totalAnswered > 0 ? ((result.incorrectCount / result.totalAnswered) * 100).toFixed(0) : 0}% Salah
              </span>
            </div>
          </div>

          {/* Card 4: Nilai Akhir & Status Kelulusan */}
          <div className={`p-4 sm:p-5 rounded-2xl border text-center flex flex-col justify-between shadow-lg ${
            result.passed && result.isMinimumMet
              ? 'bg-teal-950/40 border-teal-500/50'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              <span className="text-xs uppercase font-bold text-slate-300 flex items-center justify-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Nilai Akhir
              </span>
              <p className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${
                result.passed && result.isMinimumMet ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {result.scorePercentage.toFixed(1)}%
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px]">
              Status: <strong className={result.passed && result.isMinimumMet ? 'text-emerald-400' : 'text-rose-400'}>
                {statusInfo.label}
              </strong>
              <span className="block text-slate-400 text-[10px] mt-0.5">
                {result.correctCount >= 10 ? '★ 10 Kata Benar = 100 Poin' : isFinalAttempt ? 'Nilai Mutlak (Final)' : `Percobaan ${attemptNum}/3`}
              </span>
            </div>
          </div>
        </div>

        {/* Student & Session Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm print-card">
          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-400" /> Nama Siswa
            </span>
            <p className="font-bold text-white truncate">{result.student.fullName}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-blue-400" /> NIS & Kelas
            </span>
            <p className="font-bold text-white">{result.student.nis} &bull; {result.student.className}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Durasi & Mode
            </span>
            <p className="font-bold text-white">
              {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s &bull; {result.mode}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Tanggal
            </span>
            <p className="font-bold text-white">
              {new Date(result.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar with Retry Enforcement (no-print) */}
        <div className="p-4 sm:p-5 bg-slate-900/90 rounded-2xl border border-slate-800 no-print space-y-3">
          {/* Attempt limitation alert */}
          {isFinalAttempt && !result.passed && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                <strong>Batas 3 Kali Percobaan Telah Habis:</strong> Sesuai ketentuan, Anda tidak dapat mengulang kembali. Nilai akhir yang diambil adalah <strong>{result.scorePercentage.toFixed(1)}%</strong> dan dinyatakan <strong>TIDAK LULUS</strong>.
              </span>
            </div>
          )}

          {isRetriable && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  Nilai Anda belum mencapai KKM 75% atau belum memenuhi 10 soal. Kesempatan remedial tersisa: <strong>{MAX_ATTEMPTS - attemptNum} kali lagi</strong>.
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              {/* Ulangi Permainan button: only enabled if retriable! */}
              {isRetriable ? (
                <button
                  onClick={onRestart}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ulangi Permainan (Kesempatan ke-{attemptNum + 1} dari {MAX_ATTEMPTS})</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-not-allowed"
                  title="Batas maksimal 3 kali percobaan telah tercapai"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Pengulangan Terkunci (Batas 3x Selesai)</span>
                </button>
              )}

              <button
                onClick={handleOpenMistakes}
                className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10"
                title="Buka modul pembahasan dan review kesalahan tata bahasa"
              >
                <BookOpen className="w-4 h-4 text-rose-400" />
                <span>Pelajari Kesalahan ({result.incorrectCount})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Cetak lembar evaluasi ini"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak Hasil</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Unduh laporan dalam format CSV"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Unduh CSV</span>
              </button>

              {onOpenLeaderboard && (
                <button
                  onClick={onOpenLeaderboard}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Lihat Papan Peringkat Siswa"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Papan Peringkat</span>
                </button>
              )}

              <button
                onClick={onHome}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Home className="w-4 h-4 text-purple-400" />
                <span>Halaman Utama</span>
              </button>
            </div>
          </div>
        </div>

        {/* Previous Attempts Progression (Max 3 attempts tracker) */}
        <div className="p-4 sm:p-5 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Riwayat 3 Kali Percobaan Siswa: {result.student.fullName}
            </h3>
            <span className="text-[11px] text-slate-400">
              Percobaan Terpakai: <strong className="text-white">{sessionHistory.length} dari {MAX_ATTEMPTS}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((slotNum) => {
              // Find the attempt matching slotNum
              // sessionHistory has attempts in order
              const attemptData = sessionHistory.find(h => h.attemptNumber === slotNum) || sessionHistory[sessionHistory.length - slotNum];
              const isCurrent = slotNum === attemptNum;

              if (attemptData) {
                return (
                  <div
                    key={slotNum}
                    className={`p-3.5 rounded-xl border transition ${
                      isCurrent
                        ? 'bg-slate-800 border-emerald-500/80 ring-2 ring-emerald-500/30'
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-300">
                        Percobaan #{slotNum} {isCurrent && '(Sesi Ini)'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        attemptData.passed && attemptData.isMinimumMet
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : slotNum >= MAX_ATTEMPTS
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {attemptData.passed && attemptData.isMinimumMet
                          ? 'LULUS'
                          : slotNum >= MAX_ATTEMPTS
                          ? 'TIDAK LULUS'
                          : 'BELUM LULUS'}
                      </span>
                    </div>

                    <div className="my-2">
                      <span className="text-2xl font-mono font-black text-white">
                        {attemptData.scorePercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Benar: {attemptData.correctCount} / {attemptData.totalAnswered}</span>
                      <span>Salah: {attemptData.incorrectCount}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={slotNum} className="p-3.5 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center flex flex-col justify-center items-center text-slate-500">
                  <span className="text-xs font-semibold">Percobaan #{slotNum}</span>
                  <span className="text-[11px] text-slate-600 mt-1">Belum Digunakan</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Answers Review Table */}
        <div ref={tableRef} className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl print-card scroll-mt-6">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Rincian Jawaban & Pembahasan Tata Bahasa</h2>
              <p className="text-xs text-slate-400">Tinjau setiap kata yang telah dinilai dan pelajari aturan tenses-nya.</p>
            </div>

            {/* Table filter tabs (no-print) */}
            <div className="flex gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 no-print">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterMode === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({result.answers.length})
              </button>
              <button
                onClick={() => setFilterMode('mistakes')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterMode === 'mistakes' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Salah ({result.incorrectCount})
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterMode === 'correct' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Benar ({result.correctCount})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 sm:px-4">No</th>
                  <th className="py-3 px-3 sm:px-4">Kata / Frasa</th>
                  <th className="py-3 px-3 sm:px-4">Bentuk Dasar</th>
                  <th className="py-3 px-3 sm:px-4">Jawaban Anda</th>
                  <th className="py-3 px-3 sm:px-4">Kunci Tense</th>
                  <th className="py-3 px-3 sm:px-4">Status</th>
                  <th className="py-3 px-3 sm:px-4">Contoh & Penjelasan Tata Bahasa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAnswers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      Tidak ada data untuk filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredAnswers.map((ans, idx) => (
                    <tr
                      key={ans.questionId + idx}
                      className={ans.isCorrect ? 'hover:bg-slate-800/40' : 'bg-rose-950/15 hover:bg-rose-950/25'}
                    >
                      <td className="py-3 px-3 sm:px-4 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-3 sm:px-4 font-bold text-white flex items-center gap-1.5">
                        <span>{ans.word}</span>
                        <button
                          type="button"
                          onClick={() => soundManager.speak(ans.word)}
                          className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer no-print"
                          title="Dengarkan pelafalan kata"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-3 px-3 sm:px-4 font-mono text-slate-300">{ans.baseForm}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className="font-semibold text-slate-200">
                          {tenseLabel(ans.selectedCategory)}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          ans.correctCategory === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ans.correctCategory === 'PAST'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {tenseLabel(ans.correctCategory)}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        {ans.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Benar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold text-xs">
                            <XCircle className="w-4 h-4" /> Salah
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 sm:px-4 max-w-sm">
                        <p className="text-slate-300 font-medium text-xs leading-relaxed">{ans.explanation}</p>
                        <p className="text-[11px] italic text-slate-400 mt-1">
                          &ldquo;{ans.exampleSentence}&rdquo;
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modul Pelajari Kesalahan (Mistakes Learning Coach Modal) */}
      {showMistakesModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-2xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Modul Pelajari Kesalahan Tata Bahasa
                  </h3>
                  <p className="text-xs text-slate-400">
                    Siswa: <strong className="text-slate-200">{result.student.fullName}</strong> &bull;{' '}
                    {result.incorrectCount === 0 ? (
                      <span className="text-emerald-400 font-semibold">Tidak ada kesalahan (100% Benar)</span>
                    ) : (
                      <span className="text-rose-400 font-semibold">{result.incorrectCount} kata keliru dari {result.totalAnswered} soal</span>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMistakesModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                title="Tutup modul"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {result.incorrectCount === 0 ? (
                <div className="p-8 text-center space-y-3 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
                  <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-300">Luar Biasa! Skor Sempurna!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Anda berhasil memasukkan semua {result.correctCount} kata ke dalam keranjang tenses yang benar tanpa ada kesalahan satu pun. Pemahaman tata bahasa Anda sangat hebat!
                  </p>
                  <button
                    type="button"
                    onClick={handleScrollToTable}
                    className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700"
                  >
                    Tinjau Semua Jawaban di Tabel
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between">
                    <span>
                      Pelajari penjelasan aturan tenses di bawah ini dan uji pemahaman Anda langsung:
                    </span>
                    <button
                      type="button"
                      onClick={handleScrollToTable}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold shrink-0 ml-2 cursor-pointer"
                    >
                      Buka Tabel Lengkap
                    </button>
                  </div>

                  <div className="space-y-3">
                    {result.answers
                      .filter(ans => !ans.isCorrect)
                      .map((ans, idx) => {
                        const wordKey = ans.questionId || ans.word;
                        const retryState = retriedWords[wordKey];

                        return (
                          <div
                            key={wordKey + idx}
                            className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 shadow-md"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center border border-rose-500/30">
                                  {idx + 1}
                                </span>
                                <span className="text-lg font-extrabold text-white font-game tracking-wide">
                                  {ans.word}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => soundManager.speak(ans.word)}
                                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                                  title="Dengarkan pengucapan kata"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs text-slate-400 font-mono">
                                  (V1: {ans.baseForm})
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px]">
                                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Anda: {tenseLabel(ans.selectedCategory)}</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Kunci: {tenseLabel(ans.correctCategory)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Grammar explanation */}
                            <div className="space-y-1.5 text-xs">
                              <p className="text-slate-200 font-medium leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                                💡 <strong>Aturan Grammar:</strong> {ans.explanation}
                              </p>
                              <p className="text-slate-400 text-[11px] italic pl-2 border-l-2 border-blue-500/50">
                                Contoh kalimat: &ldquo;{ans.exampleSentence}&rdquo;
                              </p>
                            </div>

                            {/* Mini Interactive Self-Test */}
                            <div className="pt-2 border-t border-slate-800/80">
                              <p className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                Uji Pemahaman: Masukkan kata ini ke keranjang yang benar sekarang:
                              </p>

                              <div className="grid grid-cols-3 gap-2">
                                {(['PRESENT', 'PAST', 'FUTURE'] as const).map(cat => {
                                  const isSelected = retryState?.selected === cat;
                                  const isAnswerCorrect = cat === ans.correctCategory;

                                  let btnClass = 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700';
                                  if (retryState) {
                                    if (isSelected && isAnswerCorrect) {
                                      btnClass = 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30';
                                    } else if (isSelected && !isAnswerCorrect) {
                                      btnClass = 'bg-rose-600 text-white border-rose-500';
                                    } else if (isAnswerCorrect) {
                                      btnClass = 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50';
                                    }
                                  }

                                  return (
                                    <button
                                      key={cat}
                                      type="button"
                                      onClick={() => {
                                        const correct = cat === ans.correctCategory;
                                        setRetriedWords(prev => ({
                                          ...prev,
                                          [wordKey]: { selected: cat, isCorrect: correct }
                                        }));
                                        if (correct) {
                                          soundManager.playCorrect();
                                        } else {
                                          soundManager.playIncorrect();
                                        }
                                      }}
                                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${btnClass}`}
                                    >
                                      {cat === 'PRESENT' ? 'Present' : cat === 'PAST' ? 'Past' : 'Future'}
                                    </button>
                                  );
                                })}
                              </div>

                              {retryState && (
                                <p className={`text-[11px] font-semibold mt-1.5 flex items-center gap-1 ${
                                  retryState.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {retryState.isCorrect ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      Tepat sekali! Anda berhasil memahami kategori {tenseLabel(ans.correctCategory)}.
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                      Masih kurang tepat, kata "{ans.word}" termasuk {tenseLabel(ans.correctCategory)}.
                                    </>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center shrink-0">
              <span className="text-xs text-slate-400">
                Gunakan modul ini untuk persiapan remedial berikutnya.
              </span>
              <button
                type="button"
                onClick={() => setShowMistakesModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Selesai Mempelajari
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Certificate Modal */}
      {showPrintModal && (
        <PrintCertificateModal
          result={result}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
