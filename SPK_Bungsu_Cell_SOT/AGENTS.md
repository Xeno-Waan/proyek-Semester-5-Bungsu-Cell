# AGENTS.md — Kontrak Kerja Coding Agent

## 1. Prioritas sumber kebenaran

Ikuti urutan berikut:
1. Instruksi eksplisit terbaru dari pemilik proyek.
2. `PRD.md`.
3. `UI-GUIDELINE.md`.
4. `IMPLEMENTATION_PLAN.md`.
5. `AGENTS.md` ini.
6. `PROMPT_EXECUTION.md`.

Jika ada konflik, hentikan pekerjaan pada bagian yang terdampak dan minta klarifikasi. Jangan menebak keputusan produk.

## 2. Izin kerja

- Paket ini adalah kontrak dan dokumentasi, bukan izin otomatis untuk coding.
- Mulai implementasi hanya setelah pemilik proyek memberi instruksi eksplisit.
- Kerjakan satu fase pada satu waktu.
- Jangan melewati fase atau menambah scope tanpa persetujuan.
- Jangan membuat atau mengganti ZIP final aplikasi tanpa diminta.

## 3. Stack yang diizinkan

HTML5, CSS3, Bootstrap 5, Vanilla JavaScript ES6+, localStorage, SweetAlert2, dan Chart.js bila diperlukan.

Dilarang menambahkan React, TypeScript, framework lain, PHP/backend, database server, atau API eksternal tanpa revisi SOT yang disetujui.

## 4. Kebijakan data

- Jangan mengarang data operasional Bungsu Cell.
- Minta data nyata kepada pemilik proyek saat diperlukan.
- Jangan mengasumsikan stok, harga, spesifikasi, gambar, atau skor kriteria.
- Jangan mengisi data kosong dengan nol tanpa aturan eksplisit.
- Data sintetis hanya boleh dipakai untuk tes bila disetujui; beri label `TEST DATA` dan pisahkan dari data operasional.
- Jangan menyajikan statistik contoh sebagai statistik nyata.
- Jika sumber atau makna data tidak jelas, hentikan bagian terkait dan minta klarifikasi.

## 5. Implementasi Pembobotan ROC & Ranking SAW

- Pisahkan kalkulator bobot ROC dan engine SAW dari DOM/UI.
- Gunakan metode ROC ($w_j = \frac{1}{m} \sum_{k=j}^m \frac{1}{k}$) untuk pembobotan kriteria dan formula benefit/cost SAW dalam `IMPLEMENTATION_PLAN.md` untuk perankingan smartphone.
- Validasi urutan prioritas, bobot ternormalisasi, nilai kriteria, anggaran, dan pembagi nol.
- Jangan menghitung alternatif yang tidak memenuhi data minimum.
- Ranking harus deterministik.
- Skor dan persentase harus diberi label secara akurat.
- Tambahkan tes untuk perhitungan ROC, normalisasi SAW, pembobotan, ranking, nilai kosong, dan kasus tepi.

## 6. Kualitas kode

- Gunakan nama variabel dan fungsi yang deskriptif.
- Hindari duplikasi logika.
- Pisahkan data, aturan bisnis, dan presentasi.
- Tangani error penyimpanan dengan jujur.
- Jangan menambahkan dependensi baru tanpa alasan dan izin.
- Jangan menyatakan tes lulus jika belum dijalankan.
- Jangan membuat tombol palsu atau interaksi dekoratif yang tidak berfungsi.
- Jaga aksesibilitas dasar: label, fokus keyboard, teks alternatif, dan kontras.

## 7. Pelaporan per fase

Di akhir setiap fase, laporkan:
1. File yang dibuat/diubah.
2. Fitur yang selesai.
3. Pengujian yang benar-benar dijalankan beserta hasilnya.
4. Masalah atau data yang masih dibutuhkan.
5. Kesesuaian dengan SOT.
6. Pertanyaan/keputusan yang memerlukan persetujuan.

Berhenti setelah laporan fase dan tunggu instruksi jika kelanjutan membutuhkan persetujuan pemilik proyek.
