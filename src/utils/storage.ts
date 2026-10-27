import { GameResult, QuestionItem, StudentProfile, GameSettings, LeaderboardEntry } from '../types/game';
import { INITIAL_QUESTION_BANK } from '../data/questionBank';

const STORAGE_KEYS = {
  CURRENT_STUDENT: 'etc_current_student',
  SESSION_ATTEMPTS: 'etc_session_attempts',
  ALL_RESULTS: 'etc_all_results',
  SETTINGS: 'etc_game_settings',
  CUSTOM_QUESTIONS: 'etc_custom_questions',
  LEADERBOARD: 'etc_leaderboard'
};

export const MAX_ATTEMPTS = 3;

export const DEFAULT_SETTINGS: GameSettings = {
  durationMinutes: 3, // 3 minutes default
  minimumQuestions: 10, // target minimal 10 soal
  passingGrade: 75, // 75% passing threshold
  soundEnabled: true,
  speechEnabled: true,
  volume: 0.8,
  difficultyFilter: 'ALL',
  leaderboardEnabled: true, // Guru dapat menyalakan/mematikan leaderboard
  selectedLevel: 1, // Level 1: Beginner, Level 2: Intermediate, Level 3: Advanced
  sessionType: 'EXAM' // 'EXAM' or 'PRACTICE'
};

// 1. Current Student Profile
export function getSavedStudent(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentStudent(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save student profile', e);
  }
}

// 2. Game Settings
export function getSavedSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// 3. Game Results & Session History
export function getAllResults(): GameResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_RESULTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSessionAttempts(nis: string): GameResult[] {
  const all = getAllResults();
  return all.filter(r => r.student.nis === nis);
}

export function saveGameResult(result: GameResult): void {
  try {
    const all = getAllResults();
    all.unshift(result); // prepend latest
    localStorage.setItem(STORAGE_KEYS.ALL_RESULTS, JSON.stringify(all));

    // Also auto add to leaderboard if passed or exam mode
    if (result.passed && result.isMinimumMet) {
      saveLeaderboardEntry({
        id: result.id,
        studentName: result.student.fullName,
        nis: result.student.nis,
        className: result.student.className,
        scorePercentage: result.scorePercentage,
        points: result.correctCount * 10,
        stars: result.starsEarned || (result.scorePercentage >= 90 ? 3 : result.scorePercentage >= 75 ? 2 : 1),
        timeSpentSeconds: result.timeSpentSeconds,
        level: result.level || 1,
        mode: result.mode,
        sessionType: result.sessionType,
        timestamp: result.timestamp
      });
    }
  } catch (e) {
    console.error('Failed to save game result', e);
  }
}

export function deleteGameResult(resultId: string): boolean {
  try {
    const all = getAllResults();
    const updated = all.filter(r => r.id !== resultId);
    localStorage.setItem(STORAGE_KEYS.ALL_RESULTS, JSON.stringify(updated));

    // Also remove from leaderboard if matching
    const leaderboard = getLeaderboard();
    const updatedLeaderboard = leaderboard.filter(e => e.id !== resultId);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updatedLeaderboard));
    return true;
  } catch (e) {
    console.error('Failed to delete game result', e);
    return false;
  }
}

export function deleteStudentResults(nis: string): number {
  try {
    const all = getAllResults();
    const beforeCount = all.length;
    const updated = all.filter(r => r.student.nis !== nis);
    const removedCount = beforeCount - updated.length;
    localStorage.setItem(STORAGE_KEYS.ALL_RESULTS, JSON.stringify(updated));

    // Also clean from leaderboard
    const leaderboard = getLeaderboard();
    const updatedLeaderboard = leaderboard.filter(e => e.nis !== nis);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(updatedLeaderboard));
    return removedCount;
  } catch (e) {
    console.error('Failed to delete student results', e);
    return 0;
  }
}

export function clearAllGameResults(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ALL_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
  } catch (e) {
    console.error('Failed to clear all results', e);
  }
}

// Leaderboard Storage
export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (!raw) return [];
    const list: LeaderboardEntry[] = JSON.parse(raw);
    // Sort descending by points, then scorePercentage, then lowest time
    return list.sort((a, b) => b.points - a.points || b.scorePercentage - a.scorePercentage || a.timeSpentSeconds - b.timeSpentSeconds);
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): void {
  try {
    const list = getLeaderboard();
    // Check if student already has entry with lower score, update if better
    const existingIdx = list.findIndex(e => e.nis === entry.nis);
    if (existingIdx >= 0) {
      if (entry.points > list[existingIdx].points || (entry.points === list[existingIdx].points && entry.timeSpentSeconds < list[existingIdx].timeSpentSeconds)) {
        list[existingIdx] = entry;
      }
    } else {
      list.push(entry);
    }
    // Sort and keep top 50
    list.sort((a, b) => b.points - a.points || b.scorePercentage - a.scorePercentage || a.timeSpentSeconds - b.timeSpentSeconds);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(list.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save leaderboard entry', e);
  }
}

export function clearLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
}

// 4. Custom Questions Management
export function getActiveQuestionBank(): QuestionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    if (!raw) return INITIAL_QUESTION_BANK;
    const custom = JSON.parse(raw);
    return Array.isArray(custom) && custom.length > 0 ? custom : INITIAL_QUESTION_BANK;
  } catch {
    return INITIAL_QUESTION_BANK;
  }
}

export function saveCustomQuestionBank(bank: QuestionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(bank));
  } catch (e) {
    console.error('Failed to save question bank', e);
  }
}

export function resetQuestionBankToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
}

// 5. Clear All Data (Privacy compliance)
export function clearAllLocalData(): void {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// 6. CSV Exporters
export function exportSingleResultToCSV(result: GameResult): void {
  const headers = [
    'No',
    'Word / Verb Phrase',
    'Base Form',
    'Student Answer',
    'Correct Category',
    'Result',
    'Example Sentence',
    'Grammar Explanation'
  ];

  const metaRows = [
    ['--- LAPORAN HASIL EVALUASI ENGLISH TENSE CATCHER ---'],
    ['Nama Siswa', `"${result.student.fullName}"`],
    ['NIS', `"${result.student.nis}"`],
    ['Kelas', `"${result.student.className}"`],
    ['Mata Pelajaran', `"${result.student.subject}"`],
    ['Semester', `"${result.student.semester}"`],
    ['Waktu Pengerjaan', `"${new Date(result.timestamp).toLocaleString('id-ID')}"`],
    ['Mode Permainan', result.mode],
    ['Durasi Bermain', `${Math.floor(result.timeSpentSeconds / 60)}m ${result.timeSpentSeconds % 60}s`],
    ['Percobaan Ke', `"${result.attemptNumber} dari ${MAX_ATTEMPTS}"`],
    ['Total Kata Dijawab', result.totalAnswered],
    ['Jumlah Benar', result.correctCount],
    ['Jumlah Salah', result.incorrectCount],
    ['Nilai Akhir', `${result.scorePercentage.toFixed(1)}%`],
    ['Status Kelulusan', result.passed ? 'LULUS (Passed)' : result.attemptNumber >= MAX_ATTEMPTS ? 'TIDAK LULUS (Final - Batas 3x Tercapai)' : 'BELUM LULUS (Wajib Remedial)'],
    ['Syarat Minimal 10 Soal', result.isMinimumMet ? 'Terpenuhi' : 'Belum Memenuhi Minimum 10 Soal'],
    [''],
    headers
  ];

  const answerRows = result.answers.map((ans, idx) => [
    idx + 1,
    `"${ans.word}"`,
    `"${ans.baseForm}"`,
    ans.selectedCategory,
    ans.correctCategory,
    ans.isCorrect ? 'BENAR' : 'SALAH',
    `"${ans.exampleSentence.replace(/"/g, '""')}"`,
    `"${ans.explanation.replace(/"/g, '""')}"`
  ]);

  const csvContent = [...metaRows, ...answerRows].map(e => e.join(',')).join('\n');
  downloadBlob(csvContent, `Hasil_${result.student.nis}_${result.student.fullName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

export function exportTeacherAllResultsCSV(results: GameResult[]): void {
  const headers = [
    'Timestamp',
    'Nama Siswa',
    'NIS',
    'Kelas',
    'Semester',
    'Mode',
    'Waktu (detik)',
    'Total Dijawab',
    'Benar',
    'Salah',
    'Nilai (%)',
    'Status Lulus',
    'Syarat Minimal'
  ];

  const rows = results.map(r => [
    `"${new Date(r.timestamp).toLocaleString('id-ID')}"`,
    `"${r.student.fullName.replace(/"/g, '""')}"`,
    `"${r.student.nis}"`,
    `"${r.student.className}"`,
    `"${r.student.semester}"`,
    r.mode,
    r.timeSpentSeconds,
    r.totalAnswered,
    r.correctCount,
    r.incorrectCount,
    r.scorePercentage.toFixed(1),
    r.passed ? 'LULUS' : 'BELUM LULUS',
    r.isMinimumMet ? 'Ya' : 'Tidak'
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
  downloadBlob(csvContent, `Rekap_Nilai_Siswa_EnglishTenseCatcher_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

function downloadBlob(content: string, fileName: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
