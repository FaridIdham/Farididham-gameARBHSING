export type TenseCategory = 'PRESENT' | 'PAST' | 'FUTURE';

export type VerbType = 'regular' | 'irregular' | 'phrase';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type PlaySessionType = 'PRACTICE' | 'EXAM';

export interface QuestionItem {
  id: string;
  word: string;
  category: TenseCategory;
  baseForm: string;
  pastForm: string;
  futurePhrase: string;
  exampleSentence: string;
  explanation: string;
  difficulty: DifficultyLevel;
  verbType: VerbType;
}

export interface StudentProfile {
  fullName: string;
  nis: string;
  className: string;
  subject: string;
  semester: 'Ganjil' | 'Genap';
}

export interface AnswerRecord {
  questionId: string;
  word: string;
  baseForm: string;
  selectedCategory: TenseCategory;
  correctCategory: TenseCategory;
  isCorrect: boolean;
  exampleSentence: string;
  explanation: string;
  timestamp: string;
}

export interface GameResult {
  id: string;
  student: StudentProfile;
  timestamp: string;
  mode: '2D' | 'AR';
  sessionType: PlaySessionType;
  level: number;
  starsEarned: number; // 0, 1, 2, or 3 stars
  durationConfigMinutes: number;
  timeSpentSeconds: number;
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  passed: boolean;
  isMinimumMet: boolean;
  attemptNumber: number;
  answers: AnswerRecord[];
}

export interface GameSettings {
  durationMinutes: number; // 0 for untimed
  minimumQuestions: number; // default 10
  passingGrade: number; // default 60 / 75
  soundEnabled: boolean;
  speechEnabled: boolean;
  volume: number; // 0 to 1
  difficultyFilter: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  leaderboardEnabled: boolean; // Guru dapat toggle on/off
  selectedLevel: number; // 1, 2, 3
  sessionType: PlaySessionType; // PRACTICE or EXAM
}

export interface FloatingWord {
  id: string;
  question: QuestionItem;
  x: number; // percentage 5% - 85%
  y: number; // percentage 10% - 65%
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  nis: string;
  className: string;
  scorePercentage: number;
  points: number;
  stars: number;
  timeSpentSeconds: number;
  level: number;
  mode: '2D' | 'AR';
  sessionType: PlaySessionType;
  timestamp: string;
}
