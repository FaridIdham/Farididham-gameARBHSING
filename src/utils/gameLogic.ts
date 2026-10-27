import { QuestionItem, TenseCategory } from '../types/game';

export const POINTS_PER_CORRECT_ANSWER = 10;
export const MINIMUM_CORRECT_TO_PASS = 6; // Minimal 6 kata yang benar
export const TARGET_CORRECT_AUTO_PASS = 10; // 10 kata benar = 100 poin (otomatis lulus maksimal)

/**
 * Calculates grade percentage from correct answers and total questions evaluated.
 * Formula: (Jumlah Benar / Total Soal Dinilai) * 100
 */
export function calculateScore(correctCount: number, totalAnswered: number): number {
  if (totalAnswered <= 0) return 0;
  return Number(((correctCount / totalAnswered) * 100).toFixed(1));
}

/**
 * Calculates stars earned (0 to 3 stars) based on passing score:
 * - 3 Stars: 90% - 100% (Excellent mastery)
 * - 2 Stars: 75% - 89% (Good competence)
 * - 1 Star: 60% - 74% (Sufficient / Basic pass)
 * - 0 Stars: < 60% (Needs Remedial)
 */
export function calculateStars(scorePercentage: number, passed: boolean): number {
  if (!passed) return 0;
  if (scorePercentage >= 90) return 3;
  if (scorePercentage >= 75) return 2;
  return 1;
}

/**
 * Calculates total points earned based on 10 points per correct word.
 */
export function calculatePoints(correctCount: number): number {
  return correctCount * POINTS_PER_CORRECT_ANSWER;
}

/**
 * Checks passing status according to the updated school curriculum rules:
 * - Setiap kata yang benar bernilai 10 poin (10 kata benar = 100 poin).
 * - Minimal 6 kata yang benar dimasukkan ke keranjang untuk bisa dinyatakan LULUS.
 * - Nilai akhir = (Jumlah Benar / Total Soal Dinilai) * 100%
 */
export function checkPassingStatus(
  scorePercentage: number,
  totalAnswered: number,
  minimumRequired: number = 10,
  passingGrade: number = 60, // Minimal 60% (setara 6 kata benar dari 10 soal)
  correctCount?: number
): { passed: boolean; isMinimumMet: boolean; points: number } {
  const isMinimumMet = totalAnswered >= minimumRequired;
  const count = correctCount !== undefined ? correctCount : Math.round((scorePercentage / 100) * totalAnswered);
  const points = count * POINTS_PER_CORRECT_ANSWER;

  // Syarat lulus: minimal 6 kata benar DAN nilai akhir memenuhi standar
  const passed = count >= MINIMUM_CORRECT_TO_PASS && scorePercentage >= passingGrade && isMinimumMet;

  return { passed, isMinimumMet, points };
}

/**
 * Checks whether student is allowed to retry the game.
 * Rule: Maximum 3 attempts allowed.
 */
export function canRetry(attemptNumber: number, passed: boolean, maxAttempts: number = 3): boolean {
  if (passed) return false;
  return attemptNumber < maxAttempts;
}

/**
 * Determines conclusive status label based on score, correct count, and attempt count.
 */
export function getFinalStatusLabel(
  passed: boolean, 
  attemptNumber: number, 
  maxAttempts: number = 3,
  correctCount: number = 0
): {
  label: 'LULUS' | 'TIDAK LULUS' | 'BELUM LULUS';
  isFinal: boolean;
  message: string;
} {
  if (passed) {
    const isPerfect = correctCount >= TARGET_CORRECT_AUTO_PASS;
    return {
      label: 'LULUS',
      isFinal: true,
      message: isPerfect
        ? 'Sempurna! Anda berhasil memasukkan 10 kata benar (100 Poin) dan dinyatakan LULUS otomatis!'
        : `Selamat! Anda berhasil memasukkan ${correctCount} kata benar (minimal 6) dan dinyatakan LULUS!`
    };
  }

  if (attemptNumber >= maxAttempts) {
    return {
      label: 'TIDAK LULUS',
      isFinal: true,
      message: `Batas maksimal ${maxAttempts} kali percobaan telah tercapai (${correctCount}/6 kata benar). Nilai akhir ini diambil secara mutlak dan dinyatakan TIDAK LULUS.`
    };
  }

  const remaining = maxAttempts - attemptNumber;
  return {
    label: 'BELUM LULUS',
    isFinal: false,
    message: `Jumlah jawaban benar (${correctCount} kata) belum memenuhi syarat minimal 6 kata benar (KKM 60%/75%). Sisa kesempatan mengulang: ${remaining} kali.`
  };
}

/**
 * Checks whether user chosen tense matches the true tense category of the question.
 */
export function validateAnswer(
  targetCategory: TenseCategory,
  chosenCategory: TenseCategory
): boolean {
  return targetCategory === chosenCategory;
}

/**
 * Validates student identity fields.
 */
export function validateStudentIdentity(data: {
  fullName: string;
  nis: string;
  className: string;
  subject: string;
}): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.fullName = 'Nama lengkap minimal 3 karakter';
  }
  if (!data.nis || data.nis.trim().length < 3) {
    errors.nis = 'NIS minimal 3 karakter';
  }
  if (!data.className || !data.className.trim()) {
    errors.className = 'Kelas wajib diisi';
  }
  if (!data.subject || !data.subject.trim()) {
    errors.subject = 'Mata pelajaran wajib diisi';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Shuffles questions ensuring varied tense presentation.
 */
export function shuffleQuestions(items: QuestionItem[]): QuestionItem[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
