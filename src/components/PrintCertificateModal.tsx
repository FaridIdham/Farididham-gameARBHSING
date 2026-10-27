import React, { useState } from 'react';
import { GameResult } from '../types/game';
import { calculatePoints, POINTS_PER_CORRECT_ANSWER } from '../utils/gameLogic';
import { 
  Printer, 
  X, 
  Download, 
  Copy, 
  Check, 
  Award, 
  School, 
  Calendar, 
  User, 
  FileText,
  ExternalLink
} from 'lucide-react';

interface PrintCertificateModalProps {
  result: GameResult;
  onClose: () => void;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  result,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const totalPoints = calculatePoints(result.correctCount);
  const tenseLabel = (cat: string) => {
    switch (cat) {
      case 'PRESENT': return 'Simple Present';
      case 'PAST': return 'Simple Past';
      case 'FUTURE': return 'Simple Future';
      default: return cat;
    }
  };

  // Safe window print with iframe fallback
  const handleDirectPrint = () => {
    try {
      window.print();
    } catch {
      // If iframe blocks window.print, fallback to HTML download
      handleDownloadPrintableHTML();
    }
  };

  // Generate self-contained, print-perfect HTML document that can be opened anywhere
  const generatePrintableHTML = () => {
    const rows = result.answers
      .map(
        (a, i) => `
        <tr style="border-bottom: 1px solid #e2e8f0; ${!a.isCorrect ? 'background-color: #fff1f2;' : ''}">
          <td style="padding: 8px 10px; font-weight: bold;">${i + 1}</td>
          <td style="padding: 8px 10px; font-weight: bold;">${a.word}</td>
          <td style="padding: 8px 10px; font-family: monospace;">${a.baseForm}</td>
          <td style="padding: 8px 10px;">${tenseLabel(a.selectedCategory)}</td>
          <td style="padding: 8px 10px; font-weight: bold;">${tenseLabel(a.correctCategory)}</td>
          <td style="padding: 8px 10px; font-weight: bold; color: ${a.isCorrect ? '#059669' : '#e11d48'};">
            ${a.isCorrect ? '✓ BENAR (+10 Poin)' : '✗ SALAH (0 Poin)'}
          </td>
          <td style="padding: 8px 10px; font-size: 11px;">${a.explanation}</td>
        </tr>
      `
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Lembar Hasil Evaluasi - ${result.student.fullName} (${result.student.nis})</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; font-size: 13px; }
    .header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; color: #0f172a; }
    .header h2 { margin: 4px 0; font-size: 15px; color: #0284c7; }
    .header p { margin: 2px 0; font-size: 11px; color: #64748b; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; }
    .score-banner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; text-align: center; }
    .score-card { padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: #ffffff; }
    .score-card .val { font-size: 24px; font-weight: 900; margin-top: 4px; font-family: monospace; }
    .passed { color: #059669; border-color: #10b981; background: #ecfdf5; }
    .failed { color: #e11d48; border-color: #f43f5e; background: #fff1f2; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; }
    .signatures { display: flex; justify-content: space-between; margin-top: 30px; page-break-inside: avoid; }
    .sig-box { text-align: center; width: 200px; }
    .sig-line { margin-top: 50px; border-top: 1px solid #000; padding-top: 4px; font-weight: bold; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>KEMENTERIAN PENDIDIKAN & KEBUDAYAAN</h1>
    <h2>LEMBAR EVALUASI & SERTIFIKAT KOMPETENSI TENSES</h2>
    <p>Aplikasi English Tense Catcher: Augmented Reality & 2D Learning Game</p>
  </div>

  <div class="info-grid">
    <div><strong>Nama Siswa:</strong> ${result.student.fullName}</div>
    <div><strong>Nomor Induk Siswa (NIS):</strong> ${result.student.nis}</div>
    <div><strong>Kelas:</strong> ${result.student.className}</div>
    <div><strong>Mata Pelajaran:</strong> ${result.student.subject}</div>
    <div><strong>Semester:</strong> ${result.student.semester}</div>
    <div><strong>Waktu Pengerjaan:</strong> ${new Date(result.timestamp).toLocaleString('id-ID')}</div>
    <div><strong>Mode Permainan:</strong> ${result.mode}</div>
    <div><strong>Percobaan Ke:</strong> ${result.attemptNumber} dari 3 (Maksimal)</div>
  </div>

  <div class="score-banner">
    <div class="score-card">
      <div style="font-size: 11px; color: #64748b; font-weight: bold;">TOTAL KATA DIJAWAB</div>
      <div class="val" style="color: #0f172a;">${result.totalAnswered} Kata</div>
    </div>
    <div class="score-card">
      <div style="font-size: 11px; color: #059669; font-weight: bold;">JAWABAN BENAR (+10 Pts)</div>
      <div class="val" style="color: #059669;">${result.correctCount} Kata</div>
    </div>
    <div class="score-card">
      <div style="font-size: 11px; color: #e11d48; font-weight: bold;">JAWABAN SALAH</div>
      <div class="val" style="color: #e11d48;">${result.incorrectCount} Kata</div>
    </div>
    <div class="score-card ${result.passed ? 'passed' : 'failed'}">
      <div style="font-size: 11px; font-weight: bold;">NILAI AKHIR / STATUS</div>
      <div class="val">${result.scorePercentage.toFixed(1)}%</div>
      <div style="font-size: 10px; font-weight: bold; margin-top: 2px;">
        ${result.passed ? 'LULUS (TUNTAS)' : 'BELUM / TIDAK LULUS'}
      </div>
    </div>
  </div>

  <h3 style="margin-bottom: 6px; font-size: 14px;">Rincian Hasil Pengerjaan Soal</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 30px;">No</th>
        <th>Kata / Frasa</th>
        <th>Bentuk Dasar</th>
        <th>Jawaban Siswa</th>
        <th>Kunci Tense</th>
        <th>Hasil</th>
        <th>Penjelasan Tata Bahasa</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">
      <p>Siswa Yang Bersangkutan,</p>
      <div class="sig-line">${result.student.fullName}</div>
      <p style="font-size: 11px; margin: 2px 0;">NIS: ${result.student.nis}</p>
    </div>
    <div class="sig-box">
      <p>Guru Pengampu Bahasa Inggris,</p>
      <div class="sig-line">Guru Pengajar / Pembina</div>
      <p style="font-size: 11px; margin: 2px 0;">NIP / NUPTK.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog if opened in new window
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;
  };

  const handleDownloadPrintableHTML = () => {
    const htmlContent = generatePrintableHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Cetak_${result.student.nis}_${result.student.fullName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const htmlContent = generatePrintableHTML();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      // If popup blocker intervened, fallback to downloading html file
      handleDownloadPrintableHTML();
    }
  };

  const handleCopyTextReport = () => {
    const textReport = `=====================================================
LEMBAR HASIL EVALUASI - ENGLISH TENSE CATCHER
=====================================================
Nama Siswa     : ${result.student.fullName}
NIS            : ${result.student.nis}
Kelas          : ${result.student.className}
Mata Pelajaran : ${result.student.subject}
Semester       : ${result.student.semester}
Waktu Ujian    : ${new Date(result.timestamp).toLocaleString('id-ID')}
Mode           : ${result.mode}
Percobaan Ke   : ${result.attemptNumber} dari 3

HASIL PENILAIAN:
- Total Kata Dijawab : ${result.totalAnswered} kata
- Jawaban Benar      : ${result.correctCount} kata (${totalPoints} Poin)
- Jawaban Salah      : ${result.incorrectCount} kata
- Nilai Akhir        : ${result.scorePercentage.toFixed(1)}% (KKM: 75% / Min 6 Benar)
- Status Kelulusan   : ${result.passed ? 'LULUS (MEMENUHI KKM)' : result.attemptNumber >= 3 ? 'TIDAK LULUS (MUTLAK)' : 'BELUM LULUS'}

RINCIAN JAWABAN:
${result.answers.map((a, i) => `${i + 1}. [${a.isCorrect ? 'BENAR' : 'SALAH'}] "${a.word}" -> Jawaban: ${tenseLabel(a.selectedCategory)} | Kunci: ${tenseLabel(a.correctCategory)}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(textReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-8 shadow-2xl my-auto text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-game text-white">
                Cetak Lembar Laporan & Sertifikat Resmi
              </h2>
              <p className="text-xs text-slate-400">
                Pilih metode cetak langsung, buka di tab baru, atau download file rapor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div className="my-5 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm space-y-4">
          <div className="text-center border-b border-slate-800 pb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Kementerian Pendidikan & Kebudayaan
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              LEMBAR LAPORAN KELULUSAN TENSES
            </h3>
            <p className="text-xs text-emerald-400 font-medium">English Tense Catcher: AR Game</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Nama: <strong className="text-white">{result.student.fullName}</strong></div>
            <div>NIS: <strong className="text-white">{result.student.nis}</strong></div>
            <div>Kelas: <strong className="text-white">{result.student.className}</strong></div>
            <div>Semester: <strong className="text-white">{result.student.semester}</strong></div>
          </div>

          {/* 4 Score Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400">Total Soal</span>
              <p className="text-lg font-black text-white">{result.totalAnswered}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-300">Benar (+10 Pts)</span>
              <p className="text-lg font-black text-emerald-400">{result.correctCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40">
              <span className="text-[10px] text-rose-300">Salah</span>
              <p className="text-lg font-black text-rose-400">{result.incorrectCount}</p>
            </div>
            <div className={`p-2.5 rounded-xl border ${result.passed ? 'bg-teal-950/60 border-teal-500/40' : 'bg-slate-900 border-slate-800'}`}>
              <span className="text-[10px] text-amber-300">Nilai Akhir</span>
              <p className={`text-lg font-black font-mono ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.scorePercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="text-center pt-1 text-xs">
            Status Kelulusan:{' '}
            <strong className={result.passed ? 'text-emerald-400' : 'text-rose-400'}>
              {result.passed ? 'LULUS (MEMENUHI KKM)' : result.attemptNumber >= 3 ? 'TIDAK LULUS (FINAL)' : 'BELUM LULUS'}
            </strong>{' '}
            &bull; Percobaan {result.attemptNumber} dari 3
          </div>
        </div>

        {/* Action Buttons for Printing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleOpenInNewTab}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka & Cetak di Tab Baru</span>
          </button>

          <button
            onClick={handleDownloadPrintableHTML}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Download File Cetak (.html)</span>
          </button>

          <button
            onClick={handleCopyTextReport}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Teks Laporan'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-3">
          File HTML yang didownload atau dibuka di tab baru dapat dicetak langsung ke printer fisik atau disimpan sebagai PDF (Ctrl + P).
        </p>
      </div>
    </div>
  );
};
