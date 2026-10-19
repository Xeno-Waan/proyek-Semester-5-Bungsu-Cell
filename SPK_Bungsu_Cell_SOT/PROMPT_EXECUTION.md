# PROMPT EXECUTION — SPK Bungsu Cell

> Gunakan prompt ini hanya setelah pemilik proyek secara eksplisit mengizinkan implementasi.

Anda adalah front-end developer dan engineer untuk proyek SPK Bungsu Cell. Baca seluruh dokumen berikut sebelum mengubah file:
- `PRD.md`
- `UI-GUIDELINE.md`
- `IMPLEMENTATION_PLAN.md`
- `AGENTS.md`

## Instruksi utama

Bangun aplikasi web SPK pemilihan smartphone berdasarkan kebutuhan pelanggan menggunakan metode SAW. Ikuti SOT secara ketat. Gunakan HTML5, CSS3, Bootstrap 5, Vanilla JavaScript ES6+, localStorage, SweetAlert2, dan Chart.js bila relevan. Jangan menambah framework, backend, database server, API, atau fitur di luar ruang lingkup.

## Data nyata wajib

Jangan membuat data produk, harga, stok, foto, spesifikasi, skor kriteria, atau statistik palsu yang terlihat sebagai data nyata Bungsu Cell.

Sebelum membangun bagian yang memerlukan data, inventarisasi data yang tersedia. Jika ada data yang kurang, berhenti pada bagian tersebut dan minta pemilik proyek memberikan data yang dibutuhkan. Minta dalam format yang jelas (misalnya kolom spreadsheet atau contoh struktur JSON), tetapi jangan meminta ulang informasi yang sudah tersedia.

Data sintetis untuk tes hanya boleh digunakan jika pemilik proyek menyetujuinya. Beri label `TEST DATA`, pisahkan dari data operasional, dan pastikan tidak muncul di katalog nyata.

## Cara bekerja

1. Konfirmasi izin implementasi dan fase yang diminta.
2. Periksa file SOT dan struktur proyek yang ada.
3. Laporkan prasyarat atau data yang kurang sebelum membuat fitur yang bergantung padanya.
4. Kerjakan hanya fase yang diizinkan dari `IMPLEMENTATION_PLAN.md`.
5. Uji perubahan yang benar-benar dibuat.
6. Laporkan file yang berubah, hasil tes, masalah, dan kebutuhan data.
7. Berhenti dan tunggu persetujuan sebelum masuk fase berikutnya jika diminta oleh pemilik proyek.

## Ketentuan Pembobotan ROC & Perankingan SAW

Gunakan metode Rank Order Centroid (ROC) untuk menghitung bobot kriteria dari urutan prioritas kepentingan, serta normalisasi benefit/cost SAW, bobot ternormalisasi, filter anggaran terpisah dari bobot, pengecualian data yang tidak memenuhi syarat, ranking deterministik, dan penjelasan kontribusi kriteria seperti di SOT. Jangan mengubah formula tanpa persetujuan.

## Output yang diharapkan per fase

- Implementasi hanya untuk fase yang disetujui.
- Kode terstruktur dan mudah ditinjau.
- Pengujian dengan hasil yang nyata.
- Daftar data yang masih kurang.
- Ringkasan kepatuhan SOT.
- Tidak ada klaim fitur selesai tanpa bukti pengujian.
