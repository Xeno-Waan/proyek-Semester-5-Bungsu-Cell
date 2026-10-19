# Product Requirements Document (PRD) — SPK Bungsu Cell

- **Versi:** v0.2.0
- **Status:** APPROVED
- **Produk:** Sistem Pendukung Keputusan Pemilihan Smartphone Berdasarkan Kebutuhan Pelanggan Menggunakan Metode SAW Berbasis Web pada Bungsu Cell
- **Tanggal:** 19 Oktober 2026 (Revisi Pembobotan ROC)

## 1. Ringkasan produk

SPK Bungsu Cell adalah aplikasi web untuk membantu pelanggan memilih smartphone berdasarkan kebutuhan, batas anggaran, dan prioritas spesifikasi. Sistem menghitung rekomendasi menggunakan metode Simple Additive Weighting (SAW), menampilkan ranking, serta menjelaskan skor berdasarkan kriteria yang digunakan.

Mekanisme penentuan bobot kriteria pada panel admin menggunakan metode Rank Order Centroid (ROC). Admin cukup mengurutkan prioritas kepentingan kriteria dari yang paling penting hingga paling tidak penting (peringkat 1 s/d m), dan sistem secara otomatis menghitung bobot matematis yang terdistribusi obyektif dengan total tepat 100%. Metode perankingan alternatif smartphone tetap menggunakan Simple Additive Weighting (SAW).

Aplikasi juga menyediakan katalog smartphone, detail spesifikasi, perbandingan produk, dan panel admin untuk mengelola data smartphone serta prioritas/bobot kriteria.

## 2. Tujuan

1. Membantu pelanggan menemukan smartphone yang sesuai kebutuhan dan anggaran.
2. Menyediakan peringkat rekomendasi yang dapat dijelaskan dan dihitung ulang.
3. Menyediakan katalog produk yang dapat dicari, difilter, dan dibandingkan.
4. Memungkinkan pengelola memperbarui data smartphone dan kriteria tanpa mengubah kode perhitungan.
5. Menghasilkan laporan hasil perhitungan dan data katalog.

## 3. Pengguna dan peran

### Pelanggan / pengunjung
- Melihat katalog dan detail produk.
- Mencari dan memfilter smartphone.
- Membandingkan 2–3 smartphone.
- Mengisi preferensi dan batas anggaran.
- Melihat hasil ranking, skor, dan kontribusi kriteria.

### Pengelola / admin
- Melihat ringkasan data pada dashboard.
- Menambah, mengubah, dan menghapus data smartphone.
- Mengelola kriteria, bobot, dan tipe benefit/cost.
- Mencetak atau mengekspor laporan.

**Catatan keamanan:** pada arsitektur front-end-only, panel admin bukan batas keamanan yang kuat. Jangan menyimpan rahasia atau data sensitif di kode klien. Jika diperlukan kontrol akses yang aman, itu membutuhkan keputusan arsitektur terpisah dan persetujuan pemilik proyek.

## 4. Ruang lingkup fitur

### 4.1 Fitur inti SPK
- Form preferensi pelanggan.
- Input batas anggaran.
- Pengaturan prioritas/bobot kriteria.
- Engine SAW untuk normalisasi, pembobotan, dan ranking.
- Hasil rekomendasi dengan skor dan persentase skor.
- Penjelasan kontribusi per kriteria.
- Penanganan data tidak lengkap atau tidak valid.

### 4.2 Katalog publik
- Landing page.
- Katalog smartphone dengan foto, nama, dan harga.
- Detail produk dan spesifikasi.
- Search berdasarkan nama/merek.
- Filter merek dan rentang harga.
- Compare 2–3 produk.

### 4.3 Panel admin
- Dashboard ringkasan data smartphone, kriteria, dan statistik penggunaan yang tersedia secara lokal.
- CRUD data smartphone.
- Manajemen prioritas kriteria, penentuan bobot otomatis berbasis Rank Order Centroid (ROC), dan konfigurasi tipe benefit/cost.
- Cetak/ekspor laporan.

## 5. Kriteria penilaian awal & Mekanisme Pembobotan ROC

### 5.1 Kriteria awal
Kriteria awal yang direncanakan:
1. Harga — cost.
2. RAM — benefit.
3. Penyimpanan internal — benefit.
4. Performa chipset — benefit.
5. Kapasitas baterai — benefit.
6. Kualitas kamera — benefit.
7. Kualitas layar — benefit.

Untuk performa chipset, kualitas kamera, dan kualitas layar, gunakan skor evaluasi dengan rubrik yang konsisten. Jangan menyimpulkan kualitas hanya dari satu angka spesifikasi yang tidak cukup mewakili kualitas.

### 5.2 Mekanisme Pembobotan Rank Order Centroid (ROC)
Untuk menghindari keharusan admin menghitung persentase bobot secara manual, sistem menggunakan metode **Rank Order Centroid (ROC)**:
- Admin cukup menentukan urutan prioritas kriteria dari yang paling penting (peringkat 1) hingga yang paling tidak penting (peringkat $m$, di mana $m = 7$).
- Sistem secara otomatis menghitung bobot matematis untuk kriteria berperingkat ke-$j$ ($w_j$) menggunakan formula:
  $$w_j = \frac{1}{m} \sum_{k=j}^{m} \frac{1}{k}$$
- Total bobot yang dihasilkan dijamin secara matematis bernilai tepat 1 (100%).
- **Pemisahan Peran:** ROC berfungsi semata-mata sebagai **mekanisme pembobotan kriteria** (menghasilkan vektor bobot $W$), sedangkan **Simple Additive Weighting (SAW)** tetap menjadi metode perankingan alternatif smartphone.

Daftar ini adalah rancangan awal kriteria dan urutan prioritas. Perubahan urutan prioritas kriteria harus divalidasi dan disimpan sebelum dipakai menghitung ranking.

## 6. Aturan data nyata

- Data operasional harus berasal dari data nyata yang diberikan pemilik proyek atau sumber yang secara eksplisit disetujui pemilik proyek.
- Jangan membuat nama produk, harga, stok, foto, spesifikasi, skor kriteria, atau statistik toko fiktif lalu menyajikannya sebagai data nyata Bungsu Cell.
- Jika data yang diperlukan belum tersedia, minta daftar data tersebut kepada pemilik proyek sebelum menggunakannya.
- Data sintetis hanya boleh digunakan untuk pengujian teknis jika pemilik proyek menyetujuinya; data harus diberi label `TEST DATA` dan dipisahkan dari katalog nyata.
- Data yang tidak diketahui harus ditandai belum tersedia atau dikecualikan dari perhitungan yang memerlukannya. Jangan mengubah nilai kosong menjadi nol secara diam-diam.
- Catat sumber dan tanggal pembaruan data jika informasi itu diberikan.

## 7. Aturan bisnis SAW & Pembobotan

- Bobot kriteria diturunkan melalui metode Rank Order Centroid (ROC) atau konfigurasi bobot ternormalisasi yang valid dengan total tepat 1.0 (100%).
- Anggaran adalah filter kelayakan yang terpisah dari bobot SAW.
- Produk di atas batas anggaran tidak boleh ditampilkan sebagai produk yang memenuhi anggaran.
- Produk yang tidak memenuhi kelengkapan data minimum tidak ikut dihitung dan harus memiliki alasan pengecualian yang jelas.
- Ranking diurutkan dari skor SAW tertinggi ke terendah.
- Tie-break deterministik: harga lebih rendah, lalu nama produk secara alfabetis.
- Skor dan persentase skor harus diberi label yang tepat; persentase bukan jaminan kecocokan sempurna.

## 8. Di luar ruang lingkup

- POS/kasir dan transaksi penjualan.
- Manajemen stok gudang yang terintegrasi.
- Pengelolaan servis/perbaikan HP.
- Isi saldo, top-up, pembayaran listrik, atau transaksi non-tunai.
- Marketplace, checkout, pembayaran online, dan CRM.
- Backend, database server, autentikasi server, serta integrasi API eksternal, kecuali diputuskan melalui revisi SOT dan persetujuan eksplisit.

## 9. Kriteria penerimaan produk

- Pengunjung dapat mencari, memfilter, membuka detail, dan membandingkan produk.
- Pelanggan dapat memasukkan anggaran dan preferensi lalu melihat ranking yang konsisten.
- Perhitungan SAW mengikuti rumus dan aturan validasi yang ditetapkan.
- Admin dapat mengelola data smartphone dan kriteria serta melihat perubahan yang tersimpan pada browser.
- Laporan konsisten dengan data dan hasil perhitungan.
- UI responsif pada layar ponsel dan desktop.
- Data nyata tidak tercampur dengan data uji.
- Fitur tidak menyatakan sukses jika operasi penyimpanan gagal.
