# ENGLISH TENSE CATCHER: AUGMENTED REALITY LEARNING GAME
> *Catch the Words, Master the Tenses!*

A web-based Augmented Reality (AR) & 2D educational game designed for junior and senior high school students to learn, categorize, and master English verb tenses:
1. **Simple Present Tense** (Keranjang Hijau)
2. **Simple Past Tense** (Keranjang Oranye)
3. **Simple Future Tense** (Keranjang Biru)

---

## 🚀 Fitur Utama

- **Mode AR (Augmented Reality)**: Memanfaatkan kamera perangkat dan giroskop ponsel untuk memproyeksikan kata kerja melayang di ruang nyata dengan HUD scanner & targeting reticle.
- **Mode 2D Klasik**: Mode interaktif yang ringan, responsif, dan siap jalan di semua laptop, PC, dan smartphone tanpa memerlukan kamera.
- **3 Keranjang Tense Berwarna & Interaktif**:
  - 🟢 **Keranjang Hijau**: Simple Present Tense (V1 / V1 + s/es/ies).
  - 🟠 **Keranjang Oranye**: Simple Past Tense (V2 / regular -ed / irregular).
  - 🔵 **Keranjang Biru**: Simple Future Tense (frasa lengkap *will + base verb*).
- **Bank Soal Kaya & Edukatif**:
  - 90 item kata kerja lengkap (30 Present, 30 Past, 30 Future).
  - Dilengkapi contoh kalimat kontekstual, bentuk dasar, bentuk lampau, serta penjelasan tata bahasa dwibahasa.
- **Sistem Suara & Umpan Balik Instan**:
  - Web Audio API Synthesizer (Zero-latency offline chime, buzzer, grab whoosh, warning beeps, & victory fanfare).
  - Web Speech API: Ucap "Correct! You are right!" dan "Incorrect! Try again!" dengan pelafalan kata bahasa Inggris.
- **Standar KKM Kelulusan 75%**:
  - Nilai minimal kelulusan 75% dari minimal 20 soal yang dievaluasi.
  - Siswa yang belum lulus wajib mengikuti remedial / mengulang kuis.
  - Riwayat peningkatan nilai per percobaan (*Attempt #1, #2, #3*).
- **Hasil & Evaluasi Lengkap**:
  - Rincian tabel per kata, filter *Pelajari Kesalahan*, cetak lembar nilai (*print-friendly*), dan ekspor CSV.
- **Portal & Dashboard Guru**:
  - Rekapitulasi nilai siswa lintas kelas & semester.
  - Analisis grafis tense yang paling banyak salah (*Present vs Past vs Future*).
  - Pengelola bank soal & penyesuaian standar KKM.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend Framework**: React 19 + TypeScript + Vite.
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans & Fredoka fonts.
- **Animasi & Interaksi**: Motion + HTML5 Drag & Drop + Touch Events + Canvas Confetti.
- **Audio**: Web Speech Synthesis API + Web Audio Synthesizer.
- **Penyimpanan**: LocalStorage / IndexedDB (mode mandiri tanpa server) + Skema Supabase PostgreSQL siap pakai (`supabase_schema.sql`).

---

## 📂 Struktur Folder

```
/
├── index.html                 # Entry point HTML dengan font & meta tags
├── metadata.json              # Konfigurasi aplikasi & izin frame kamera
├── package.json               # Dependensi & skrip npm
├── supabase_schema.sql        # Skema database & RLS Supabase (opsional)
├── tsconfig.json              # TypeScript compiler options
├── vite.config.ts             # Vite build configuration
└── src/
    ├── App.tsx                # State machine & game coordinator
    ├── main.tsx               # Root renderer
    ├── index.css              # Tailwind CSS, font game & print styling
    ├── types/
    │   └── game.ts            # Type definitions & interface data
    ├── data/
    │   └── questionBank.ts    # 90+ Bank soal lengkap (Present, Past, Future)
    ├── utils/
    │   ├── audio.ts           # Synthesizer & Web Speech manager
    │   ├── storage.ts         # Session storage, settings & CSV exporter
    │   ├── gameLogic.ts       # Pure scoring & validation functions
    │   └── gameLogic.test.ts  # Unit testing suite
    └── components/
        ├── StudentForm.tsx        # Registrasi identitas siswa
        ├── InstructionModal.tsx   # Petunjuk 10 langkah & panduan tenses
        ├── GameHUD.tsx            # Top status bar, timer & controls
        ├── BasketDropZone.tsx     # 3 Keranjang tense interaktif
        ├── PlayArena2D.tsx        # Arena bermain mode 2D
        ├── PlayArenaAR.tsx        # Arena bermain mode AR Kamera
        ├── ResultDashboard.tsx    # Dashboard nilai, cetak & ekspor CSV
        └── TeacherDashboard.tsx   # Portal guru & analitik kuis
```

---

## 🏃 Menjalankan Aplikasi Secara Lokal

1. **Instalasi Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Unit Testing**:
   ```bash
   npm test
   ```

3. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan terbuka pada port `http://localhost:3000`.

4. **Build untuk Production**:
   ```bash
   npm run build
   ```

---

## 🌐 Petunjuk Deployment Gratis

### 1. Vercel
1. Unggah repository ke GitHub.
2. Masuk ke [vercel.com](https://vercel.com) dan klik **Add New Project**.
3. Pilih repository `english-tense-catcher`.
4. Framework Preset akan otomatis terdeteksi sebagai **Vite**.
5. Klik **Deploy**.

### 2. Netlify
1. Masuk ke [netlify.com](https://netlify.com).
2. Seret folder `dist` hasil `npm run build` ke dashboard Netlify Drop, atau hubungkan repository GitHub.
3. Build command: `npm run build`
4. Publish directory: `dist`

### 3. Cloudflare Pages
1. Hubungkan repo GitHub ke Cloudflare Pages.
2. Build preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.

---

## ✅ Checklist Pengujian

- [x] Validasi form identitas siswa (Nama, NIS, Kelas, Mapel, Semester).
- [x] Petunjuk 10 langkah dan panduan 3 keranjang tense.
- [x] Transisi mulus antara Mode 2D dan Mode AR.
- [x] Izin kamera diminta secara eksplisit sebelum mengakses stream video.
- [x] Interaksi Drag & Drop (desktop) dan Tap-Select-Drop (ponsel/tablet).
- [x] Kunci jawaban 90 soal terverifikasi (30 Present, 30 Past, 30 Future).
- [x] Umpan balik visual hijau (benar) dan merah (salah).
- [x] Umpan balik audio: Web Speech synthesis + Web Audio synthesizer.
- [x] Countdown timer dengan peringatan 30 detik dan 10 detik.
- [x] Perhitungan akurat nilai KKM 75% dan minimal 20 soal.
- [x] Peringatan wajib remedial ketika nilai di bawah 75%.
- [x] Ekspor CSV hasil evaluasi siswa dan rekap guru.
- [x] Cetak hasil evaluasi (*print preview* bersih tanpa elemen UI yang tidak relevan).
