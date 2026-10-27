import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types/game';
import { getSavedStudent, saveCurrentStudent } from '../utils/storage';
import { User, Hash, School, BookOpen, Calendar, Sparkles, ArrowRight, CheckCircle2, Trophy } from 'lucide-react';

interface StudentFormProps {
  onComplete: (student: StudentProfile) => void;
  onOpenTeacherDashboard: () => void;
  onOpenLeaderboard?: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ 
  onComplete, 
  onOpenTeacherDashboard,
  onOpenLeaderboard 
}) => {
  const [formData, setFormData] = useState<StudentProfile>({
    fullName: '',
    nis: '',
    className: 'VIII-A',
    subject: 'Bahasa Inggris',
    semester: 'Ganjil'
  });

  const [savedProfile, setSavedProfile] = useState<StudentProfile | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = getSavedStudent();
    if (saved) {
      setSavedProfile(saved);
      // Auto populate if available
      setFormData(saved);
    }
  }, []);

  const errors = {
    fullName: !formData.fullName.trim() ? 'Nama lengkap wajib diisi' : formData.fullName.trim().length < 3 ? 'Nama minimal 3 karakter' : '',
    nis: !formData.nis.trim() ? 'NIS wajib diisi' : formData.nis.trim().length < 3 ? 'NIS minimal 3 karakter' : '',
    className: !formData.className.trim() ? 'Kelas wajib diisi' : '',
    subject: !formData.subject.trim() ? 'Mata pelajaran wajib diisi' : ''
  };

  const isValid = !errors.fullName && !errors.nis && !errors.className && !errors.subject;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ fullName: true, nis: true, className: true, subject: true });
      return;
    }
    saveCurrentStudent(formData);
    onComplete(formData);
  };

  const handleApplySaved = () => {
    if (savedProfile) {
      setFormData(savedProfile);
    }
  };

  return (
    <div className="min-h-screen bg-game-grid text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Header bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-orange-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-game text-xl sm:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-blue-400">
              ENGLISH TENSE CATCHER
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">Augmented Reality & 2D Learning Game</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-white border border-amber-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Papan</span> Peringkat
            </button>
          )}

          <button
            onClick={onOpenTeacherDashboard}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <School className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Portal</span> Guru
          </button>
        </div>
      </header>

      {/* Main card */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Tagline & Welcome */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Registrasi Identitas Siswa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Catch the Words, Master the Tenses!</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              Silakan lengkapi data diri Anda sebelum memulai petualangan menangkap kata kerja bahasa Inggris.
            </p>
          </div>

          {savedProfile && savedProfile.fullName && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2 text-xs sm:text-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-slate-300">Profil Sesi Sebelumnya Terdeteksi:</span>{' '}
                    <strong className="text-emerald-400">{savedProfile.fullName}</strong>{' '}
                    <span className="text-slate-400">(NIS: {savedProfile.nis} &bull; {savedProfile.className})</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fitur <strong>&ldquo;Gunakan Data Ini&rdquo;</strong> berguna untuk mengisi formulir secara otomatis (autofill) menggunakan identitas siswa yang tersimpan di perangkat ini, sehingga Anda tidak perlu mengetik ulang nama, NIS, dan kelas.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleApplySaved}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Isi Otomatis (Gunakan Data Ini)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSavedProfile(null)}
                  className="text-xs text-slate-400 hover:text-slate-300 underline cursor-pointer"
                >
                  Bukan Anda? Ketik Data Baru
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                Nama Lengkap Siswa <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onBlur={() => setTouched({ ...touched, fullName: true })}
                placeholder="Contoh: Muhammad Farid Idham"
                className={`w-full px-4 py-3 rounded-xl bg-slate-800/90 border ${
                  touched.fullName && errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                } text-white placeholder-slate-500 outline-none transition-all text-sm`}
              />
              {touched.fullName && errors.fullName && (
                <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* NIS & Kelas grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-orange-400" />
                  Nomor Induk Siswa (NIS) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  onBlur={() => setTouched({ ...touched, nis: true })}
                  placeholder="Contoh: 20268491"
                  className={`w-full px-4 py-3 rounded-xl bg-slate-800/90 border ${
                    touched.nis && errors.nis ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  } text-white placeholder-slate-500 outline-none transition-all text-sm`}
                />
                {touched.nis && errors.nis && (
                  <p className="text-xs text-rose-400 mt-1">{errors.nis}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-400" />
                  Kelas <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    onBlur={() => setTouched({ ...touched, className: true })}
                    placeholder="Contoh: VIII-A / IX-B / X-1"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-800/90 border ${
                      touched.className && errors.className ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    } text-white placeholder-slate-500 outline-none transition-all text-sm`}
                  />
                </div>
                {/* Quick chip presets */}
                <div className="flex gap-1.5 mt-1.5">
                  {['VII-A', 'VIII-A', 'IX-A', 'X-MIPA', 'XI'].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setFormData({ ...formData, className: cls })}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mata Pelajaran & Semester */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Mata Pelajaran <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Semester <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  isValid
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white shadow-emerald-500/25 hover:scale-[1.01]'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <span>Lanjut ke Petunjuk Permainan</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        English Tense Catcher: AR Game &bull; Standar Kelulusan 75% &bull; Kementerian Pendidikan & Kebudayaan
      </footer>
    </div>
  );
};
