import React, { useState, useEffect } from 'react';
import { GameResult, QuestionItem, GameSettings, TenseCategory } from '../types/game';
import { 
  getAllResults, 
  deleteGameResult,
  deleteStudentResults,
  clearAllGameResults,
  exportTeacherAllResultsCSV, 
  getActiveQuestionBank, 
  saveCustomQuestionBank, 
  resetQuestionBankToDefault,
  clearAllLocalData,
  clearLeaderboard,
  saveSettings
} from '../utils/storage';
import { 
  School, 
  Users, 
  Award, 
  BarChart3, 
  Download, 
  Settings, 
  Trash2, 
  ArrowLeft, 
  Search, 
  Plus, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileSpreadsheet,
  Trophy
} from 'lucide-react';

interface TeacherDashboardProps {
  onBack: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onBack,
  settings,
  onUpdateSettings
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'analytics' | 'questions' | 'settings'>('results');
  const [results, setResults] = useState<GameResult[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form for adding new question
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState<Partial<QuestionItem>>({
    word: '',
    category: 'PRESENT',
    baseForm: '',
    pastForm: '',
    futurePhrase: '',
    exampleSentence: '',
    explanation: '',
    difficulty: 'EASY',
    verbType: 'regular'
  });

  useEffect(() => {
    setResults(getAllResults());
    setQuestions(getActiveQuestionBank());
  }, []);

  // Filtered results
  const filteredResults = results.filter((r) => {
    const matchClass = selectedClass === 'ALL' || r.student.className === selectedClass;
    const matchSem = selectedSemester === 'ALL' || r.student.semester === selectedSemester;
    const matchSearch = searchQuery === '' || 
      r.student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student.nis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSem && matchSearch;
  });

  // Calculate stats
  const totalSubmissions = filteredResults.length;
  const passCount = filteredResults.filter(r => r.passed && r.isMinimumMet).length;
  const passRate = totalSubmissions > 0 ? (passCount / totalSubmissions) * 100 : 0;
  const averageScore = totalSubmissions > 0
    ? filteredResults.reduce((acc, r) => acc + r.scorePercentage, 0) / totalSubmissions
    : 0;

  // Analytics on missed tenses
  const mistakeCounts = { PRESENT: 0, PAST: 0, FUTURE: 0 };
  let totalMistakes = 0;
  filteredResults.forEach((res) => {
    res.answers.forEach((ans) => {
      if (!ans.isCorrect) {
        mistakeCounts[ans.correctCategory]++;
        totalMistakes++;
      }
    });
  });

  const uniqueClasses = Array.from(new Set(results.map(r => r.student.className)));

  const handleExportCSV = () => {
    exportTeacherAllResultsCSV(filteredResults);
  };

  // Delete Confirmation state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'single' | 'studentAll' | 'all';
    result?: GameResult;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'single' && deleteConfirmTarget.result) {
      const resId = deleteConfirmTarget.result.id;
      const studentName = deleteConfirmTarget.result.student.fullName;
      deleteGameResult(resId);
      setResults(prev => prev.filter(r => r.id !== resId));
      showToast(`Data ujian ${studentName} berhasil dihapus.`);
    } else if (deleteConfirmTarget.type === 'studentAll' && deleteConfirmTarget.result) {
      const nis = deleteConfirmTarget.result.student.nis;
      const studentName = deleteConfirmTarget.result.student.fullName;
      const count = deleteStudentResults(nis);
      setResults(prev => prev.filter(r => r.student.nis !== nis));
      showToast(`Semua (${count}) riwayat nilai ${studentName} (NIS: ${nis}) berhasil dihapus.`);
    } else if (deleteConfirmTarget.type === 'all') {
      clearAllGameResults();
      setResults([]);
      showToast('Seluruh rekapitulasi nilai siswa berhasil dikosongkan.');
    }
    setDeleteConfirmTarget(null);
  };

  const handleClearHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh data riwayat ujian siswa? Tindakan ini tidak dapat dibatalkan.')) {
      clearAllLocalData();
      setResults([]);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.word || !newQuestion.baseForm || !newQuestion.exampleSentence) {
      alert('Mohon isi kata kerja, bentuk dasar, dan contoh kalimat.');
      return;
    }

    const item: QuestionItem = {
      id: `custom-${Date.now()}`,
      word: newQuestion.word.trim(),
      category: newQuestion.category as TenseCategory,
      baseForm: newQuestion.baseForm.trim(),
      pastForm: newQuestion.pastForm?.trim() || newQuestion.baseForm.trim() + 'ed',
      futurePhrase: newQuestion.futurePhrase?.trim() || `will ${newQuestion.baseForm.trim()}`,
      exampleSentence: newQuestion.exampleSentence.trim(),
      explanation: newQuestion.explanation?.trim() || `Penjelasan aturan kata ${newQuestion.word}`,
      difficulty: newQuestion.difficulty || 'MEDIUM',
      verbType: newQuestion.verbType || 'regular'
    };

    const updated = [item, ...questions];
    setQuestions(updated);
    saveCustomQuestionBank(updated);
    setShowAddModal(false);
    setNewQuestion({
      word: '',
      category: 'PRESENT',
      baseForm: '',
      pastForm: '',
      futurePhrase: '',
      exampleSentence: '',
      explanation: '',
      difficulty: 'EASY',
      verbType: 'regular'
    });
  };

  const handleResetBank = () => {
    if (confirm('Kembalikan bank soal ke 90 soal bawaan aplikasi?')) {
      resetQuestionBankToDefault();
      setQuestions(getActiveQuestionBank());
    }
  };

  return (
    <div className="min-h-screen bg-game-grid text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-game text-white flex items-center gap-2">
                <School className="w-6 h-6 text-amber-400" />
                PORTAL & DASHBOARD GURU
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Kelola penilaian, rekapitulasi nilai siswa, dan bank soal tenses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredResults.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Ekspor Rekap CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'results', label: 'Rekap Nilai Siswa', icon: Users },
            { id: 'analytics', label: 'Analisis Kelemahan Tense', icon: BarChart3 },
            { id: 'questions', label: `Bank Soal (${questions.length})`, icon: HelpCircle },
            { id: 'settings', label: 'Konfigurasi Standar KKM', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Rekap Nilai Siswa */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {/* Filter row */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 rounded-xl text-xs sm:text-sm border border-slate-700 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-xl text-xs sm:text-sm border border-slate-700 text-white outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Kelas ({uniqueClasses.length})</option>
                  {uniqueClasses.map((c) => (
                    <option key={c} value={c}>Kelas {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 rounded-xl text-xs sm:text-sm border border-slate-700 text-white outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Semester</option>
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-slate-400">Total Ujian Masuk</span>
                <p className="text-2xl font-bold text-white mt-1">{totalSubmissions}</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center">
                <span className="text-xs text-emerald-300">Tingkat Kelulusan</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{passRate.toFixed(1)}%</p>
                <span className="text-[10px] text-slate-400">{passCount} siswa lulus KKM</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/40 text-center">
                <span className="text-xs text-blue-300">Rata-rata Nilai</span>
                <p className="text-2xl font-bold text-blue-400 mt-1">{averageScore.toFixed(1)}%</p>
                <span className="text-[10px] text-slate-400">Standar KKM {settings.passingGrade}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center">
                <span className="text-xs text-rose-300">Wajib Remedial</span>
                <p className="text-2xl font-bold text-rose-400 mt-1">{totalSubmissions - passCount}</p>
                <span className="text-[10px] text-slate-400">Nilai &lt; 75% atau &lt; 10 soal</span>
              </div>
            </div>

            {/* Summary info & Clear Actions */}
            <div className="flex flex-wrap justify-between items-center text-xs text-slate-400 px-1 gap-2">
              <span>Menampilkan <strong className="text-white">{filteredResults.length}</strong> data riwayat ujian siswa</span>
              {results.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget({ type: 'all' })}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1.5 cursor-pointer bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Seluruh Rekap Nilai</span>
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">NIS</th>
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Percobaan</th>
                      <th className="py-3 px-4">Benar/Total</th>
                      <th className="py-3 px-4">Nilai</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500">
                          Belum ada riwayat pengerjaan siswa yang tersimpan.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((res) => {
                        const att = res.attemptNumber || 1;
                        const isFinal = att >= 3;
                        return (
                          <tr key={res.id} className="hover:bg-slate-800/40">
                            <td className="py-3 px-4 text-slate-400 text-xs">
                              {new Date(res.timestamp).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4 font-bold text-white">{res.student.fullName}</td>
                            <td className="py-3 px-4 font-mono text-slate-300">{res.student.nis}</td>
                            <td className="py-3 px-4 text-slate-300">{res.student.className}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                                {res.mode}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isFinal ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {att}/3 {isFinal && '(Final)'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {res.correctCount} / {res.totalAnswered}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                {res.scorePercentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {res.passed && res.isMinimumMet ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  LULUS
                                </span>
                              ) : isFinal ? (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600/30 text-rose-300 border border-rose-500/50">
                                  TIDAK LULUS
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  BELUM LULUS
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmTarget({ type: 'single', result: res })}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition cursor-pointer"
                                title="Hapus riwayat nilai siswa ini"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Analytics on Problematic Tenses */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h2 className="text-base font-bold text-white mb-1">
                Tingkat Kekeliruan Per Kategori Tense
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Data ini membantu guru menentukan materi pengayaan dan remedial yang paling mendesak diajarkan kembali.
              </p>

              {totalMistakes === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Belum ada data kekeliruan tenses dari siswa.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Present Errors */}
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
                    <h3 className="font-bold text-emerald-400 text-sm">SIMPLE PRESENT TENSE</h3>
                    <p className="text-2xl font-bold text-white my-1">{mistakeCounts.PRESENT} kesalahan</p>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(mistakeCounts.PRESENT / totalMistakes) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {((mistakeCounts.PRESENT / totalMistakes) * 100).toFixed(1)}% dari total kesalahan
                    </span>
                    <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg">
                      Sering keliru pada imbuhan orang ketiga tunggal (-s/-es/-ies).
                    </p>
                  </div>

                  {/* Past Errors */}
                  <div className="p-4 rounded-2xl bg-orange-950/30 border border-orange-500/40">
                    <h3 className="font-bold text-orange-400 text-sm">SIMPLE PAST TENSE</h3>
                    <p className="text-2xl font-bold text-white my-1">{mistakeCounts.PAST} kesalahan</p>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${(mistakeCounts.PAST / totalMistakes) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {((mistakeCounts.PAST / totalMistakes) * 100).toFixed(1)}% dari total kesalahan
                    </span>
                    <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg">
                      Siswa sering belum hafal bentuk kata kerja tidak beraturan (irregular verbs).
                    </p>
                  </div>

                  {/* Future Errors */}
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/40">
                    <h3 className="font-bold text-blue-400 text-sm">SIMPLE FUTURE TENSE</h3>
                    <p className="text-2xl font-bold text-white my-1">{mistakeCounts.FUTURE} kesalahan</p>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(mistakeCounts.FUTURE / totalMistakes) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {((mistakeCounts.FUTURE / totalMistakes) * 100).toFixed(1)}% dari total kesalahan
                    </span>
                    <p className="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg">
                      Perhatikan penggunaan modal "will" yang selalu diikuti kata kerja bentuk dasar (V1).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Question Bank Manager */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Bank Soal ({questions.length} Kata Kerja)</h2>
                <p className="text-xs text-slate-400">Total soal aktif yang diacak secara dinamis selama permainan.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Soal Baru
                </button>

                <button
                  onClick={handleResetBank}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Kembalikan ke 90 soal awal"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Reset ke Bawaan
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Kata / Frasa</th>
                    <th className="py-2.5 px-3">Kategori Tense</th>
                    <th className="py-2.5 px-3">Bentuk Dasar</th>
                    <th className="py-2.5 px-3">Tingkat</th>
                    <th className="py-2.5 px-3">Contoh Kalimat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-white">{q.word}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.category === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : q.category === 'PAST'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {q.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">{q.baseForm}</td>
                      <td className="py-2 px-3 text-slate-400">{q.difficulty}</td>
                      <td className="py-2 px-3 text-slate-300 italic max-w-xs truncate">{q.exampleSentence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Settings Configuration */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Konfigurasi Aturan & Kelulusan KKM</h2>
              <p className="text-xs text-slate-400 mt-1">
                Atur standar penilaian permainan agar sesuai dengan kurikulum sekolah.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Ambang Kelulusan Minimal (KKM): {settings.passingGrade}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={settings.passingGrade}
                  onChange={(e) => {
                    const updated = { ...settings, passingGrade: Number(e.target.value) };
                    onUpdateSettings(updated);
                    saveSettings(updated);
                  }}
                  className="w-full cursor-pointer accent-emerald-500"
                />
                <span className="text-[11px] text-slate-400">Rekomendasi standar: 75%</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Target Jumlah Soal Minimal: {settings.minimumQuestions} kata
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={settings.minimumQuestions}
                  onChange={(e) => {
                    const updated = { ...settings, minimumQuestions: Number(e.target.value) };
                    onUpdateSettings(updated);
                    saveSettings(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none"
                />
                <span className="text-[11px] text-slate-400">Rekomendasi standar: 10 kata</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Filter Tingkat Kesulitan Awal
                </label>
                <select
                  value={settings.difficultyFilter}
                  onChange={(e) => {
                    const updated = { ...settings, difficultyFilter: e.target.value as any };
                    onUpdateSettings(updated);
                    saveSettings(updated);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Tingkat (Mudah & Sedang)</option>
                  <option value="EASY">Hanya Tingkat Dasar (Easy)</option>
                  <option value="MEDIUM">Tingkat Menengah (Medium)</option>
                </select>
              </div>

              {/* Leaderboard Toggle for Teachers */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-white flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Papan Peringkat Siswa (Leaderboard)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {settings.leaderboardEnabled
                        ? 'Aktif: Siswa dapat melihat peringkat skor dan medali terbaik.'
                        : 'Nonaktif: Papan peringkat disembunyikan agar siswa belajar tanpa tekanan.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, leaderboardEnabled: !settings.leaderboardEnabled };
                      onUpdateSettings(updated);
                      saveSettings(updated);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      settings.leaderboardEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-700 text-slate-400 border-slate-600'
                    }`}
                  >
                    {settings.leaderboardEnabled ? 'AKTIF' : 'NONAKTIF'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Bersihkan data peringkat leaderboard siswa? Riwayat riil ujian siswa tetap tersimpan.')) {
                        clearLeaderboard();
                        alert('Data papan peringkat telah dibersihkan.');
                      }
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
                  >
                    <span>Reset / Bersihkan Data Leaderboard</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleClearHistory}
                  className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Seluruh Riwayat Data Lokal Siswa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Soal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white mb-3">Tambah Item Kata Kerja Baru</h3>
              <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Kata / Frasa yang Muncul di Layar:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: will study / studied / studies"
                    value={newQuestion.word}
                    onChange={(e) => setNewQuestion({ ...newQuestion, word: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Kunci Kategori Tense:</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value as TenseCategory })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                    >
                      <option value="PRESENT">Simple Present Tense</option>
                      <option value="PAST">Simple Past Tense</option>
                      <option value="FUTURE">Simple Future Tense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Bentuk Dasar (V1):</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: study"
                      value={newQuestion.baseForm}
                      onChange={(e) => setNewQuestion({ ...newQuestion, baseForm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Contoh Kalimat Bahasa Inggris:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: She studies English every day."
                    value={newQuestion.exampleSentence}
                    onChange={(e) => setNewQuestion({ ...newQuestion, exampleSentence: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Penjelasan Aturan Tata Bahasa:</label>
                  <textarea
                    rows={2}
                    placeholder="Penjelasan aturan grammar untuk siswa..."
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    Simpan Soal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus Nilai Siswa */}
        {deleteConfirmTarget && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Konfirmasi Penghapusan Data</h3>
                  <p className="text-xs text-slate-400">Tindakan ini permanen dan akan memperbarui rekap nilai.</p>
                </div>
              </div>

              {deleteConfirmTarget.type === 'single' && deleteConfirmTarget.result && (
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <p className="text-slate-300">
                    Anda akan menghapus data ujian berikut:
                  </p>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 space-y-1">
                    <p className="font-bold text-white text-sm">
                      {deleteConfirmTarget.result.student.fullName}
                    </p>
                    <p className="text-slate-400">
                      NIS: <span className="font-mono text-slate-200">{deleteConfirmTarget.result.student.nis}</span> &bull; Kelas: {deleteConfirmTarget.result.student.className}
                    </p>
                    <p className="text-slate-400">
                      Nilai: <strong className={deleteConfirmTarget.result.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {deleteConfirmTarget.result.scorePercentage.toFixed(1)}%
                      </strong> ({deleteConfirmTarget.result.correctCount}/{deleteConfirmTarget.result.totalAnswered} Benar)
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Tanggal: {new Date(deleteConfirmTarget.result.timestamp).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              {deleteConfirmTarget.type === 'all' && (
                <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200">
                  <p className="font-semibold text-rose-300 mb-1">Peringatan: Seluruh Rekapitulasi Nilai Akan Dihapus!</p>
                  <p className="text-slate-400">
                    Semua riwayat nilai pengerjaan siswa ({results.length} rekaman) dan papan peringkat akan dikosongkan. Bank soal dan pengaturan KKM tetap aman.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="w-full sm:w-auto flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition text-center"
                >
                  Batal
                </button>

                {deleteConfirmTarget.type === 'single' && deleteConfirmTarget.result && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmTarget({
                        type: 'studentAll',
                        result: deleteConfirmTarget.result
                      });
                    }}
                    className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold cursor-pointer transition text-center"
                    title="Hapus seluruh percobaan siswa ini"
                  >
                    Hapus Semua Sesi Siswa Ini
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer transition text-center"
                >
                  {deleteConfirmTarget.type === 'all' ? 'Ya, Kosongkan Semua' : 'Ya, Hapus Data Ini'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-800/95 border border-emerald-500/60 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
