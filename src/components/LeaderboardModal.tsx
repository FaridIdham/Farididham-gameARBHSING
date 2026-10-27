import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types/game';
import { getLeaderboard } from '../utils/storage';
import { 
  Trophy, 
  Medal, 
  Star, 
  X, 
  Clock, 
  Award, 
  Sparkles, 
  Filter,
  Users
} from 'lucide-react';

interface LeaderboardModalProps {
  onClose: () => void;
  isTeacherEnabled?: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  isTeacherEnabled = true
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(0); // 0 = all

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const filtered = entries.filter((e) => selectedLevel === 0 || e.level === selectedLevel);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-game text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200">
                PAPAN PERINGKAT & BINTANG SISWA
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Siswa terbaik berdasarkan poin perolehan, akurasi tenses, dan kecepatan waktu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isTeacherEnabled ? (
          <div className="p-8 text-center my-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400">
            <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <p className="text-base font-bold text-slate-300">Papan Peringkat Dinonaktifkan Sementara</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Guru menonaktifkan fitur peringkat publik agar seluruh siswa dapat fokus belajar dengan nyaman tanpa tekanan kompetisi.
            </p>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            {/* Level Filter Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                <button
                  onClick={() => setSelectedLevel(0)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedLevel === 0 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua Level ({entries.length})
                </button>
                <button
                  onClick={() => setSelectedLevel(1)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedLevel === 1 ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Level 1 (Dasar)
                </button>
                <button
                  onClick={() => setSelectedLevel(2)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedLevel === 2 ? 'bg-orange-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Level 2 (Menengah)
                </button>
                <button
                  onClick={() => setSelectedLevel(3)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedLevel === 3 ? 'bg-blue-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Level 3 (Mahir)
                </button>
              </div>

              <div className="text-xs text-slate-400 hidden sm:block">
                ★ 10 Kata Benar = 100 Poin (Maks. 3 Bintang)
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] font-semibold sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Rank</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas</th>
                    <th className="py-2.5 px-3 text-center">Bintang</th>
                    <th className="py-2.5 px-3 text-center">Poin</th>
                    <th className="py-2.5 px-3 text-center">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Belum ada data nilai tersimpan untuk level ini. Mainkan game untuk mencatat rekor!
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, idx) => {
                      const isTop1 = idx === 0;
                      const isTop2 = idx === 1;
                      const isTop3 = idx === 2;

                      return (
                        <tr
                          key={item.id + idx}
                          className={`hover:bg-slate-800/40 transition ${
                            isTop1 ? 'bg-amber-500/10' : isTop2 ? 'bg-slate-300/10' : isTop3 ? 'bg-amber-700/10' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-bold font-mono">
                            {isTop1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                                🥇 1
                              </span>
                            ) : isTop2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-md">
                                🥈 2
                              </span>
                            ) : isTop3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs shadow-md">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-slate-400">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white">
                            <div>{item.studentName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">NIS: {item.nis}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">{item.className}</td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  className={`w-3.5 h-3.5 ${
                                    starIdx <= item.stars
                                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {item.points} Pts
                            </span>
                            <span className="block text-[10px] text-slate-400">({item.scorePercentage.toFixed(0)}%)</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-300 text-xs">
                            {Math.floor(item.timeSpentSeconds / 60)}m {item.timeSpentSeconds % 60}s
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Tutup Papan Peringkat
          </button>
        </div>
      </div>
    </div>
  );
};
