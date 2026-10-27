import React, { useState } from 'react';
import { StudentProfile, GameSettings, PlaySessionType } from '../types/game';
import { 
  ArrowLeft, 
  Play, 
  HelpCircle, 
  Volume2, 
  Clock, 
  Award, 
  Camera, 
  Smartphone, 
  Info,
  CheckCircle,
  Sparkles,
  Layers,
  GraduationCap,
  Trophy,
  Flame,
  Zap,
  Target
} from 'lucide-react';

interface InstructionModalProps {
  student: StudentProfile;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onBack: () => void;
  onStartGame: (selectedMode: '2D' | 'AR') => void;
  onOpenLeaderboard?: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({
  student,
  settings,
  onUpdateSettings,
  onBack,
  onStartGame,
  onOpenLeaderboard
}) => {
  const [selectedMode, setSelectedMode] = useState<'2D' | 'AR'>('2D');
  const [selectedDuration, setSelectedDuration] = useState<number>(settings.durationMinutes);
  const [sessionType, setSessionType] = useState<PlaySessionType>(settings.sessionType || 'EXAM');
  const [selectedLevel, setSelectedLevel] = useState<number>(settings.selectedLevel || 1);
  const [activeTab, setActiveTab] = useState<'rules' | 'tenses' | 'demo'>('rules');

  const steps = [
    { num: 1, title: 'Identitas Siswa', desc: 'Identitas Anda telah tersimpan secara otomatis untuk sesi ini.' },
    { num: 2, title: 'Pilih Mode: Ujian / Latihan', desc: 'Mode Ujian dinilai dengan batas waktu & KKM. Mode Latihan santai tanpa batas waktu untuk eksplorasi.' },
    { num: 3, title: 'Pilih Level (1, 2, atau 3)', desc: 'Level 1: Dasar, Level 2: Menengah, Level 3: Mahir (variasi irregular verbs).' },
    { num: 4, title: 'Pilih Tampilan (AR / 2D)', desc: 'Mode AR menggunakan kamera live di ruangan Anda, atau Mode 2D interaktif standar.' },
    { num: 5, title: 'Mulai Permainan', desc: 'Klik tombol "Mulai Bermain" untuk memunculkan kata-kata bergerak di area bermain.' },
    { num: 6, title: 'Tangkap / Cubit Kata', desc: 'Di Mode AR, cubit (pinch) jari di udara untuk menangkap kata. Di Mode 2D, klik & seret atau cubit 2 jari.' },
    { num: 7, title: 'Ring Bola Basket', desc: 'Ring Hijau (Present), Ring Oranye (Past), Ring Biru (Future). Lepas kata ke dalam jaring!' },
    { num: 8, title: 'Umpan Balik Instan', desc: 'Dengarkan suara dan amati perubahan warna hijau/merah beserta penjelasannya.' },
    { num: 9, title: '10 Poin Tiap Kata Benar', desc: 'Setiap kata benar bernilai 10 poin. Minimal 6 kata benar untuk lulus, atau capai 10 kata benar untuk otomatis lulus 100 Poin!' },
    { num: 10, title: 'Batas 3x Kesempatan Ujian', desc: 'Pada Mode Ujian, pengulangan dibatasi maksimal 3 kali. Setelah percobaan ke-3, nilai akhir mutlak menentukan kelulusan.' }
  ];

  const handleStart = () => {
    onUpdateSettings({ 
      ...settings, 
      durationMinutes: sessionType === 'PRACTICE' ? 0 : selectedDuration,
      sessionType,
      selectedLevel
    });
    onStartGame(selectedMode);
  };

  return (
    <div className="min-h-screen bg-game-grid text-white flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Top Header */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-3">
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Papan Peringkat</span>
            </button>
          )}

          <div className="text-right">
            <p className="text-[10px] text-slate-400">Siswa:</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-400">{student.fullName} ({student.className})</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl w-full mx-auto my-6 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-game text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-blue-400">
            PETUNJUK PERMAINAN & PENGATURAN
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pelajari cara bermain dan sesuaikan mode sebelum masuk ke arena permainan.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/80 p-1 rounded-2xl flex gap-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'rules' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              10 Langkah Bermain
            </button>
            <button
              onClick={() => setActiveTab('tenses')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tenses' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Panduan 3 Keranjang
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'demo' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Contoh Interaksi
            </button>
          </div>
        </div>

        {/* Tab 1: Rules & Steps */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-h-[380px] overflow-y-auto pr-2">
            {steps.map((st) => (
              <div
                key={st.num}
                className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3 hover:border-slate-600 transition"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow">
                  {st.num}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{st.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Tenses Guide */}
        {activeTab === 'tenses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Basket 1: Present */}
            <div className="rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-emerald-400">KERANJANG HIJAU</h3>
              <p className="text-xs font-bold text-white mt-0.5">SIMPLE PRESENT TENSE</p>
              <div className="mt-3 text-xs text-slate-300 space-y-1.5">
                <p><strong>Fungsi:</strong> Rutinitas harian, kebiasaan, dan fakta umum ilmiah.</p>
                <p><strong>Ciri Kata:</strong> Kata kerja dasar (V1) atau berakhiran <em>-s / -es / -ies</em>.</p>
                <p className="text-emerald-300 font-mono text-[11px] pt-1">Contoh: plays, eats, goes, writes, fixes</p>
              </div>
            </div>

            {/* Basket 2: Past */}
            <div className="rounded-2xl bg-orange-950/40 border-2 border-orange-500/50 p-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-orange-400">KERANJANG ORANGE</h3>
              <p className="text-xs font-bold text-white mt-0.5">SIMPLE PAST TENSE</p>
              <div className="mt-3 text-xs text-slate-300 space-y-1.5">
                <p><strong>Fungsi:</strong> Peristiwa atau tindakan yang sudah selesai di masa lampau.</p>
                <p><strong>Ciri Kata:</strong> Akhiran <em>-ed</em> (reguler) atau bentuk V2 irregular.</p>
                <p className="text-orange-300 font-mono text-[11px] pt-1">Contoh: played, ate, went, wrote, bought</p>
              </div>
            </div>

            {/* Basket 3: Future */}
            <div className="rounded-2xl bg-blue-950/40 border-2 border-blue-500/50 p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-blue-400">KERANJANG BIRU</h3>
              <p className="text-xs font-bold text-white mt-0.5">SIMPLE FUTURE TENSE</p>
              <div className="mt-3 text-xs text-slate-300 space-y-1.5">
                <p><strong>Fungsi:</strong> Rencana masa depan, janji, perkiraan peristiwa esok hari.</p>
                <p><strong>Ciri Kata:</strong> Frasa lengkap modal <em>will + kata kerja dasar (V1)</em>.</p>
                <p className="text-blue-300 font-mono text-[11px] pt-1">Contoh: will play, will eat, will go, will write</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Demo Simulation */}
        {activeTab === 'demo' && (
          <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 sm:p-6 mb-6 text-center">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">Simulasi Penangkapan Kata</h4>
            <p className="text-xs text-slate-400 mb-4">
              Setiap kata kerja akan melayang di layar. Anda dapat mengklik/menyeretnya langsung ke keranjang di bawah ini.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-xs font-bold animate-bounce">
                eats ➔ Keranjang Hijau
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/60 text-orange-300 text-xs font-bold animate-bounce delay-100">
                ate ➔ Keranjang Orange
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/60 text-blue-300 text-xs font-bold animate-bounce delay-200">
                will eat ➔ Keranjang Biru
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-400 max-w-md mx-auto flex items-center justify-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Suara pengucapan & umpan balik kata otomatis diputar saat dinilai.</span>
            </div>
          </div>
        )}

        {/* Game Mode, Level & Duration Selectors */}
        <div className="border-t border-slate-800 pt-6 space-y-6">
          {/* 1. Session Type: Mode Ujian vs Mode Latihan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Pilih Jenis Sesi Permainan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSessionType('EXAM')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                  sessionType === 'EXAM'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-sm sm:text-base text-white">Mode Ujian (Dinilai & KKM)</span>
                  </div>
                  {sessionType === 'EXAM' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Batas waktu riil, sertifikat kelulusan resmi, bintang skor, dan dibatasi <strong>maksimal 3 kali kesempatan</strong>.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-semibold pt-1">
                  <span>★ KKM: Minimal 6 kata benar</span>
                  <span>&bull;</span>
                  <span>10 Benar = 100 Poin</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSessionType('PRACTICE')}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1.5 ${
                  sessionType === 'PRACTICE'
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm sm:text-base text-white">Mode Latihan (Santai / Mandiri)</span>
                  </div>
                  {sessionType === 'PRACTICE' && <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Tanpa batas waktu</strong>, bebas mencoba berulang kali tanpa mengurangi kuota ujian, serta penjelasan tata bahasa instan pada setiap kata.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-amber-300 font-semibold pt-1">
                  <span>Eksplorasi grammar santai & panduan lengkap</span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Level System: Level 1, 2, 3 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-400" />
              Pilih Tingkat Kesulitan (Level)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  lvl: 1,
                  title: 'Level 1: Dasar',
                  subtitle: 'Beginner',
                  color: 'emerald',
                  desc: 'Kata kerja beraturan (regular verbs) & kata sehari-hari yang mudah dipahami.',
                  badge: 'Cocok untuk Kelas VII & pengenalan dasar'
                },
                {
                  lvl: 2,
                  title: 'Level 2: Menengah',
                  subtitle: 'Intermediate',
                  color: 'orange',
                  desc: 'Campuran regular dan irregular verbs umum (ate, went, drank, wrote, spoke).',
                  badge: 'Standar Kelas VIII - IX SMP'
                },
                {
                  lvl: 3,
                  title: 'Level 3: Mahir',
                  subtitle: 'Advanced',
                  color: 'blue',
                  desc: 'Kata kerja irregular kompleks, frasa future variatif, dan tantangan kata cepat.',
                  badge: 'Tantangan penguasaan tingkat lanjut'
                }
              ].map((item) => {
                const isSelected = selectedLevel === item.lvl;
                return (
                  <button
                    key={item.lvl}
                    type="button"
                    onClick={() => setSelectedLevel(item.lvl)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/40 text-white'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{item.title}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight mb-2">{item.desc}</p>
                    </div>
                    <span className="text-[10px] text-blue-300/90 font-medium bg-slate-900/60 px-2 py-1 rounded-lg">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Display Mode & Duration in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800/60">
            {/* Display Mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Pilih Mode Tampilan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMode('2D')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    selectedMode === '2D'
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Mode 2D Klasik</span>
                    {selectedMode === '2D' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    Animasi interaktif 2D ringan & lancar di semua perangkat tanpa kamera.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode('AR')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                    selectedMode === 'AR'
                      ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/40 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-blue-400" /> Mode AR Kamera
                    </span>
                    {selectedMode === 'AR' && <CheckCircle className="w-4 h-4 text-blue-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    Kamera live melacak gerakan cubitan tangan di udara untuk menangkap kata.
                  </span>
                </button>
              </div>
            </div>

            {/* Duration (only if Mode Ujian) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-400" />
                {sessionType === 'EXAM' ? 'Durasi Waktu Ujian' : 'Durasi Waktu'}
              </label>

              {sessionType === 'EXAM' ? (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { min: 1, label: '1 Menit' },
                      { min: 3, label: '3 Menit' },
                      { min: 5, label: '5 Menit' },
                      { min: 10, label: '10 Menit' }
                    ].map((dur) => (
                      <button
                        key={dur.min}
                        type="button"
                        onClick={() => setSelectedDuration(dur.min)}
                        className={`py-2.5 px-1 text-center rounded-xl text-xs font-bold transition cursor-pointer border ${
                          selectedDuration === dur.min
                            ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Target: <strong className="text-white">10 kata</strong> (Maks. 3x coba)</span>
                    <span className="text-emerald-400 font-semibold">10 Benar = 100 Pts (Lulus)</span>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-2xl flex items-center gap-2.5 text-xs text-slate-300">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold text-white">Mode Latihan: Bebas Waktu</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Waktu tidak dibatasi agar siswa dapat mencerna konsep tenses secara mendalam.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition cursor-pointer"
          >
            Kembali ke Registrasi
          </button>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Saya Siap Bermain!</span>
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 py-2">
        Izin kamera diminta hanya saat Mode AR dipilih. Anda dapat beralih ke Mode 2D kapan saja.
      </div>
    </div>
  );
};
