/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StudentProfile, 
  GameSettings, 
  QuestionItem, 
  FloatingWord, 
  GameResult, 
  AnswerRecord, 
  TenseCategory 
} from './types/game';
import { 
  getSavedSettings, 
  saveSettings, 
  getSavedStudent, 
  getActiveQuestionBank, 
  saveGameResult,
  getSessionAttempts
} from './utils/storage';
import { soundManager } from './utils/audio';
import { calculateStars } from './utils/gameLogic';

// Components
import { StudentForm } from './components/StudentForm';
import { InstructionModal } from './components/InstructionModal';
import { GameHUD } from './components/GameHUD';
import { PlayArena2D } from './components/PlayArena2D';
import { PlayArenaAR } from './components/PlayArenaAR';
import { BasketDropZone } from './components/BasketDropZone';
import { ResultDashboard } from './components/ResultDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { LeaderboardModal } from './components/LeaderboardModal';

export default function App() {
  // App views: 'REGISTER' | 'INSTRUCTIONS' | 'PLAYING' | 'RESULTS' | 'TEACHER'
  const [currentView, setCurrentView] = useState<'REGISTER' | 'INSTRUCTIONS' | 'PLAYING' | 'RESULTS' | 'TEACHER'>('REGISTER');

  // Student Profile & Settings
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [settings, setSettings] = useState<GameSettings>(getSavedSettings());
  const [gameMode, setGameMode] = useState<'2D' | 'AR'>('2D');
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Gameplay State
  const [activeQueue, setActiveQueue] = useState<QuestionItem[]>([]);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<FloatingWord | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(180);
  const [totalDuration, setTotalDuration] = useState<number>(180);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [attemptCount, setAttemptCount] = useState<number>(1);

  // Active basket visual & toast feedback
  const [activeBasketFeedback, setActiveBasketFeedback] = useState<{
    basketCategory: TenseCategory;
    isCorrect: boolean;
  } | null>(null);

  const [activeToast, setActiveToast] = useState<{
    word: string;
    isCorrect: boolean;
    correctTense: TenseCategory;
    explanation: string;
    sentence: string;
  } | null>(null);

  // Latest Game Result
  const [latestResult, setLatestResult] = useState<GameResult | null>(null);

  // Sound manager sync
  useEffect(() => {
    soundManager.setConfig(settings.soundEnabled, settings.speechEnabled, settings.volume);
  }, [settings]);

  // Check saved student profile on load
  useEffect(() => {
    const saved = getSavedStudent();
    if (saved) {
      setStudent(saved);
    }
  }, []);

  // Shuffle helper with balanced tense distribution and level filtering
  const initializeGameSession = useCallback(() => {
    const fullBank = getActiveQuestionBank();
    let eligible = fullBank;

    // Filter by Level (Level 1: Beginner, Level 2: Intermediate, Level 3: Advanced)
    const lvl = settings.selectedLevel || 1;
    if (lvl === 1) {
      eligible = fullBank.filter(q => q.difficulty === 'EASY');
    } else if (lvl === 2) {
      eligible = fullBank.filter(q => q.difficulty === 'EASY' || q.difficulty === 'MEDIUM');
    } else {
      eligible = fullBank.filter(q => q.difficulty === 'HARD' || q.verbType === 'irregular');
    }

    if (eligible.length < 15) {
      eligible = fullBank;
    }

    // Shuffle array
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    setActiveQueue(shuffled);

    // Initial 4 words in arena
    const initialWords: FloatingWord[] = shuffled.slice(0, 4).map((q, idx) => ({
      id: `${q.id}-${Date.now()}-${idx}`,
      question: q,
      x: 18 + (idx % 2) * 55 + (Math.random() * 8 - 4),
      y: 20 + Math.floor(idx / 2) * 35 + (Math.random() * 8 - 4),
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      scale: 1,
      rotation: (Math.random() - 0.5) * 6
    }));

    setFloatingWords(initialWords);
    setActiveQueue(shuffled.slice(4));
    setAnswers([]);
    setSelectedWord(null);
    setActiveBasketFeedback(null);
    setActiveToast(null);
    setIsPaused(false);

    const isPractice = settings.sessionType === 'PRACTICE';
    const durationSecs = isPractice ? 0 : settings.durationMinutes * 60;
    setTotalDuration(durationSecs);
    setTimeRemaining(durationSecs);
    setGameStartTime(Date.now());

    if (student) {
      const priorAttempts = getSessionAttempts(student.nis).filter(r => r.sessionType !== 'PRACTICE');
      setAttemptCount(isPractice ? 1 : priorAttempts.length + 1);
    }
  }, [settings, student]);

  // Floating Words Animation Tick Loop
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentView !== 'PLAYING' || isPaused) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;

      setFloatingWords((prev) =>
        prev.map((item) => {
          let nx = item.x + item.vx * (delta / 16);
          let ny = item.y + item.vy * (delta / 16);
          let nvx = item.vx;
          let nvy = item.vy;

          // Boundary bouncing (percentages of container)
          if (nx < 8) {
            nx = 8;
            nvx = Math.abs(nvx);
          } else if (nx > 88) {
            nx = 88;
            nvx = -Math.abs(nvx);
          }

          if (ny < 12) {
            ny = 12;
            nvy = Math.abs(nvy);
          } else if (ny > 68) {
            ny = 68;
            nvy = -Math.abs(nvy);
          }

          return {
            ...item,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            rotation: item.rotation + 0.04
          };
        })
      );

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentView, isPaused]);

  // Replenish floating words when less than 3
  useEffect(() => {
    if (currentView !== 'PLAYING') return;

    if (floatingWords.length < 3 && activeQueue.length > 0) {
      const nextQ = activeQueue[0];
      const newWord: FloatingWord = {
        id: `${nextQ.id}-${Date.now()}`,
        question: nextQ,
        x: 20 + Math.random() * 60,
        y: 15 + Math.random() * 45,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        scale: 1,
        rotation: (Math.random() - 0.5) * 8
      };

      setFloatingWords((prev) => [...prev, newWord]);
      setActiveQueue((prev) => prev.slice(1));
    }
  }, [floatingWords.length, activeQueue, currentView]);

  // Countdown Timer Hook
  useEffect(() => {
    if (currentView !== 'PLAYING' || isPaused || totalDuration <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }

        // Warning alerts at 30s and 10s
        if (prev === 31 || prev === 11) {
          soundManager.playWarning();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentView, isPaused, totalDuration]);

  // Answer Evaluation Logic
  const handleDropOnBasket = (targetCategory: TenseCategory) => {
    if (!selectedWord) return;

    const currentWord = selectedWord;
    const isCorrect = currentWord.question.category === targetCategory;

    // Visual basket reaction
    setActiveBasketFeedback({
      basketCategory: targetCategory,
      isCorrect
    });
    setTimeout(() => setActiveBasketFeedback(null), 850);

    // Audio & Speech response
    if (isCorrect) {
      soundManager.speakCorrect();
    } else {
      soundManager.speakIncorrect();
    }

    // Explanation Toast
    setActiveToast({
      word: currentWord.question.word,
      isCorrect,
      correctTense: currentWord.question.category,
      explanation: currentWord.question.explanation,
      sentence: currentWord.question.exampleSentence
    });
    setTimeout(() => setActiveToast(null), 4000);

    // Record answer
    const answerRecord: AnswerRecord = {
      questionId: currentWord.question.id,
      word: currentWord.question.word,
      baseForm: currentWord.question.baseForm,
      selectedCategory: targetCategory,
      correctCategory: currentWord.question.category,
      isCorrect,
      exampleSentence: currentWord.question.exampleSentence,
      explanation: currentWord.question.explanation,
      timestamp: new Date().toISOString()
    };

    const newAnswers = [...answers, answerRecord];
    setAnswers(newAnswers);

    // Remove word from arena
    setFloatingWords((prev) => prev.filter((w) => w.id !== currentWord.id));
    setSelectedWord(null);

    // If target reaches 10 correct words (100 Points), automatically finish and declare PASS!
    const newCorrectCount = newAnswers.filter(a => a.isCorrect).length;
    if (newCorrectCount >= 10) {
      soundManager.speak("Congratulations! You reached ten correct words and scored one hundred points!");
      setTimeout(() => {
        finishGame(newAnswers);
      }, 1400);
    }
  };

  // Drag-and-drop start
  const handleDragStart = (e: React.DragEvent, word: FloatingWord) => {
    setSelectedWord(word);
    soundManager.playGrab();
    e.dataTransfer.setData('text/plain', word.id);
  };

  // Word selection tap
  const handleSelectWord = (word: FloatingWord) => {
    if (selectedWord?.id === word.id) {
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
      soundManager.playGrab();
    }
  };

  // Complete and calculate results
  const finishGame = (explicitAnswers?: AnswerRecord[]) => {
    if (!student) return;

    const currentAnswers = explicitAnswers || answers;
    const totalAnswered = currentAnswers.length;
    const correctCount = currentAnswers.filter((a) => a.isCorrect).length;
    const incorrectCount = totalAnswered - correctCount;
    const scorePercentage = totalAnswered > 0 ? Number(((correctCount / totalAnswered) * 100).toFixed(1)) : 0;
    
    // Ketentuan Kelulusan:
    // - Jika 10 kata benar -> Otomatis Lulus (100 Poin)
    // - Minimal 6 kata yang benar dimasukkan ke ring basket
    const isMinimumMet = totalAnswered >= 6;
    const passed = correctCount >= 10 || (correctCount >= 6 && scorePercentage >= 60 && isMinimumMet);
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));
    const starsEarned = calculateStars(scorePercentage, passed && isMinimumMet);

    const result: GameResult = {
      id: `res-${Date.now()}`,
      student,
      timestamp: new Date().toISOString(),
      mode: gameMode,
      sessionType: settings.sessionType || 'EXAM',
      level: settings.selectedLevel || 1,
      starsEarned,
      durationConfigMinutes: settings.sessionType === 'PRACTICE' ? 0 : settings.durationMinutes,
      timeSpentSeconds,
      totalAnswered,
      correctCount,
      incorrectCount,
      scorePercentage,
      passed,
      isMinimumMet,
      attemptNumber: attemptCount,
      answers: currentAnswers
    };

    saveGameResult(result);
    setLatestResult(result);
    setCurrentView('RESULTS');
  };

  // Navigation handlers
  const handleStudentComplete = (profile: StudentProfile) => {
    setStudent(profile);
    setCurrentView('INSTRUCTIONS');
  };

  const handleStartGame = (mode: '2D' | 'AR') => {
    setGameMode(mode);
    initializeGameSession();
    setCurrentView('PLAYING');
  };

  const handleRestartFromResults = () => {
    if (student) {
      const priorAttempts = getSessionAttempts(student.nis);
      if (priorAttempts.length >= 3) {
        alert('Batas maksimal 3 kali percobaan telah tercapai. Nilai Anda sudah difinalisasi.');
        return;
      }
    }
    initializeGameSession();
    setCurrentView('PLAYING');
  };

  const correctAnswersCount = answers.filter((a) => a.isCorrect).length;
  const incorrectAnswersCount = answers.length - correctAnswersCount;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* 1. Student Identity Registration */}
      {currentView === 'REGISTER' && (
        <StudentForm
          onComplete={handleStudentComplete}
          onOpenTeacherDashboard={() => setCurrentView('TEACHER')}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* 2. Instructions & Game Configuration */}
      {currentView === 'INSTRUCTIONS' && student && (
        <InstructionModal
          student={student}
          settings={settings}
          onUpdateSettings={(updated) => {
            setSettings(updated);
            saveSettings(updated);
          }}
          onBack={() => setCurrentView('REGISTER')}
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* 3. Active Gameplay (2D or AR Mode) */}
      {currentView === 'PLAYING' && student && (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-game-grid">
          {/* Top HUD */}
          <GameHUD
            student={student}
            mode={gameMode}
            sessionType={settings.sessionType}
            level={settings.selectedLevel}
            onToggleMode={() => setGameMode((m) => (m === '2D' ? 'AR' : '2D'))}
            timeRemainingSeconds={timeRemaining}
            totalDurationSeconds={totalDuration}
            isPaused={isPaused}
            onTogglePause={() => setIsPaused((p) => !p)}
            evaluatedCount={answers.length}
            minimumRequired={settings.minimumQuestions}
            correctCount={correctAnswersCount}
            incorrectCount={incorrectAnswersCount}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => {
              const updated = { ...settings, soundEnabled: !settings.soundEnabled };
              setSettings(updated);
              saveSettings(updated);
            }}
            onOpenHelp={() => setIsPaused(true)}
            onQuitGame={() => {
              if (confirm('Akhiri permainan dan hitung nilai sekarang?')) {
                finishGame();
              }
            }}
            attemptNumber={attemptCount}
            maxAttempts={3}
          />

          {/* Arena: 2D or AR */}
          <div className="flex-1 relative flex flex-col justify-between overflow-hidden">
            {gameMode === '2D' ? (
              <PlayArena2D
                floatingWords={floatingWords}
                selectedWordId={selectedWord?.id || null}
                onSelectWord={handleSelectWord}
                onDragStart={handleDragStart}
                onPronounce={(txt) => soundManager.speakWord(txt)}
                activeToast={activeToast}
              />
            ) : (
              <PlayArenaAR
                floatingWords={floatingWords}
                selectedWordId={selectedWord?.id || null}
                onSelectWord={handleSelectWord}
                onPronounce={(txt) => soundManager.speakWord(txt)}
                onFallbackTo2D={() => setGameMode('2D')}
                onDropOnBasket={handleDropOnBasket}
                activeToast={activeToast}
              />
            )}

            {/* Bottom 3 Distinctive Tense Baskets */}
            <div className="relative z-20 pb-2 sm:pb-4">
              <BasketDropZone
                onDropOnBasket={handleDropOnBasket}
                activeFeedback={activeBasketFeedback}
                selectedWordId={selectedWord?.id || null}
              />
            </div>
          </div>

          {/* Pause Overlay Modal */}
          {isPaused && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
                <h3 className="text-2xl font-bold font-game text-white mb-2">Permainan Dijeda</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Waktu dihentikan sementara. Anda dapat melanjutkan atau melihat ringkasan tenses.
                </p>

                <div className="space-y-2.5 text-xs text-left mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <p><strong className="text-emerald-400">Ring Hijau:</strong> Simple Present (V1 / V1+s/es)</p>
                  <p><strong className="text-orange-400">Ring Oranye:</strong> Simple Past (V2 / ed)</p>
                  <p><strong className="text-blue-400">Ring Biru:</strong> Simple Future (will + V1)</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg cursor-pointer"
                  >
                    Lanjutkan Permainan
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Akhiri sesi permainan sekarang?')) {
                        setIsPaused(false);
                        finishGame();
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Selesaikan & Lihat Nilai
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Results Dashboard */}
      {currentView === 'RESULTS' && latestResult && (
        <ResultDashboard
          result={latestResult}
          onRestart={handleRestartFromResults}
          onHome={() => setCurrentView('REGISTER')}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* 5. Teacher Portal & Dashboard */}
      {currentView === 'TEACHER' && (
        <TeacherDashboard
          onBack={() => setCurrentView('REGISTER')}
          settings={settings}
          onUpdateSettings={(updated) => {
            setSettings(updated);
            saveSettings(updated);
          }}
        />
      )}

      {/* 6. Global Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          isTeacherEnabled={settings.leaderboardEnabled}
        />
      )}
    </div>
  );
}
