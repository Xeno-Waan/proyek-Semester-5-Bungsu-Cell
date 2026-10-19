# Preview Dokumen SOT — SPK Bungsu Cell

Preview ini adalah ringkasan cepat isi dokumen. Dokumen lengkap berada di file Markdown masing-masing.

## 1. PRD.md — v0.2.0 · APPROVED
Mendefinisikan tujuan produk, pengguna, fitur inti SPK, katalog, panel admin, kriteria awal, mekanisme pembobotan kriteria Rank Order Centroid (ROC), aturan perankingan SAW, batasan ruang lingkup, kebijakan data nyata, dan kriteria penerimaan.

**Fitur:** form preferensi, pembobotan ROC, ranking SAW, katalog, detail, search/filter, compare 2–3 smartphone, dashboard, CRUD, manajemen prioritas kriteria, cetak/ekspor laporan.

## 2. UI-GUIDELINE.md — v0.2.0 · APPROVED
Menetapkan arah visual modern futuristic SaaS, warna Forest Green `#0B3D2E` dan Golden Yellow `#F2C94C`, tipografi, struktur halaman, pola UX, responsivitas, aksesibilitas, antarmuka penentuan prioritas kriteria berbasis ROC dengan pratinjau persentase bobot realtime, dan larangan menampilkan data fiktif sebagai data nyata.

**Arah visual:** tampilan bersih, kartu produk, hirarki jelas, navigasi responsif, dan status yang tidak hanya mengandalkan warna.

## 3. IMPLEMENTATION_PLAN.md — v0.2.0 · APPROVED
Menetapkan stack, arsitektur front-end-only, struktur folder rencana, kebijakan sumber data, formula matematis pembobotan ROC ($w_j = \frac{1}{m} \sum_{k=j}^m \frac{1}{k}$) dan perankingan SAW, delapan fase implementasi, pengujian minimum, dan kriteria penerimaan.

**Stack:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript ES6+, localStorage, SweetAlert2, Chart.js bila relevan.

## 4. AGENTS.md
Kontrak kerja coding agent: urutan sumber kebenaran, izin kerja, stack yang diizinkan, kebijakan data nyata, aturan SAW, kualitas kode, dan laporan per fase.

## 5. PROMPT_EXECUTION.md
Prompt eksekusi awal untuk digunakan setelah pemilik proyek memberi izin implementasi. Menginstruksikan agent membaca seluruh SOT, meminta data yang kurang, mengerjakan satu fase pada satu waktu, menguji, dan melaporkan hasil.

## Catatan status
Paket ini adalah dokumentasi SOT final. **Tidak ada source code aplikasi, katalog nyata, atau data produk yang dibuat dalam paket ini.** Data operasional harus disediakan pemilik proyek atau berasal dari sumber yang secara eksplisit disetujui.
