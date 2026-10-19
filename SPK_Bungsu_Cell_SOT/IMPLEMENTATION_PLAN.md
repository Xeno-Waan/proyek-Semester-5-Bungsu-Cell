# IMPLEMENTATION_PLAN — SPK Bungsu Cell

- **Versi:** v0.2.0
- **Status:** APPROVED
- **Tanggal:** 19 Oktober 2026 (Revisi Pembobotan ROC)
- **Batas fase:** dokumen ini mengizinkan perencanaan, bukan implementasi otomatis. Mulai coding hanya setelah pemilik proyek memberi instruksi eksplisit.

## 1. Tujuan

Membangun aplikasi web SPK pemilihan smartphone yang menggabungkan katalog, detail, compare, form preferensi, pembobotan ROC, engine SAW, ranking, panel admin, dan laporan, tanpa memperluas ruang lingkup menjadi aplikasi operasional toko umum.

## 2. Stack yang ditetapkan

- HTML5.
- CSS3 dan Bootstrap 5.
- Vanilla JavaScript ES6+.
- `localStorage` untuk persistensi lokal.
- SweetAlert2 untuk dialog/notifikasi.
- Chart.js untuk visualisasi bila relevan.
- Pengujian manual dan unit test ringan tanpa menambahkan framework kecuali disetujui.

Tidak menggunakan React, TypeScript, PHP, database server, backend, atau API eksternal pada ruang lingkup saat ini.

## 3. Arsitektur

### Presentation layer
Halaman publik, form preferensi, hasil rekomendasi, compare, dashboard admin, CRUD, dan laporan.

### Application layer
Validasi, search/filter, compare, pembobotan kriteria ROC, normalisasi dan perhitungan SAW, ranking, serta ekspor laporan.

### Data layer
Dataset lokal yang diberikan pemilik proyek, repository JavaScript, dan `localStorage` untuk perubahan pada browser.

Perubahan yang disimpan di `localStorage` hanya tersedia pada browser/perangkat tersebut. Data tidak otomatis tersinkronisasi ke perangkat lain dan dapat hilang jika data browser dihapus. Jangan menyebutnya sebagai database terpusat.

## 4. Aturan sumber data — wajib

1. Data operasional harus berasal dari data nyata yang diberikan pemilik proyek atau sumber yang secara eksplisit disetujui pemilik proyek.
2. Jangan mengarang produk, harga, stok, foto, spesifikasi, skor kriteria, atau statistik dan menyajikannya sebagai data nyata.
3. Sebelum implementasi membutuhkan data yang belum tersedia, minta data tersebut dengan daftar kolom/format yang jelas.
4. Jika data belum diberikan, siapkan struktur dan validasi tanpa mengisi nilai fiktif sebagai data operasional.
5. Data sintetis untuk uji hanya boleh dibuat dengan persetujuan pemilik proyek; beri label `TEST DATA`, simpan terpisah, dan cegah agar tidak muncul pada katalog nyata.
6. Nilai tidak diketahui harus tetap ditandai tidak tersedia atau menyebabkan produk dikecualikan dari perhitungan yang memerlukannya.
7. Jika pemilik proyek menghendaki pengambilan data dari sumber eksternal, minta persetujuan atas sumber dan cara penggunaannya terlebih dahulu.

## 5. Struktur folder yang direncanakan

```text
bungsu-cell-spk/
├── index.html
├── catalog.html
├── product-detail.html
├── compare.html
├── recommendation.html
├── admin/
│   ├── index.html
│   ├── smartphones.html
│   ├── criteria.html
│   └── reports.html
├── assets/
│   ├── css/
│   ├── js/
│   │   ├── core/
│   │   ├── data/
│   │   ├── modules/
│   │   └── saw/
│   └── images/
└── tests/
```

Struktur dapat dirapikan sebelum coding, tetapi perubahan besar pada arsitektur harus diminta untuk disetujui. Folder di atas adalah rencana, bukan aplikasi yang telah dibuat.

## 6. Kontrak matematis: Pembobotan ROC & Perankingan SAW

Kriteria awal ($m = 7$):
1. Harga — cost.
2. RAM — benefit.
3. Penyimpanan internal — benefit.
4. Performa chipset — benefit.
5. Kapasitas baterai — benefit.
6. Kualitas kamera — benefit.
7. Kualitas layar — benefit.

### 6.1 Mekanisme Pembobotan: Rank Order Centroid (ROC)
Metode ROC digunakan untuk menghasilkan vektor bobot kriteria ($W = [w_1, w_2, \dots, w_m]$) dari urutan prioritas ordinal kriteria yang ditentukan oleh admin/pengguna:
$$w_j = \frac{1}{m} \sum_{k=j}^{m} \frac{1}{k}$$
Keterangan:
- $m$: Jumlah total kriteria ($m = 7$).
- $j$: Peringkat prioritas kriteria ke-$j$ ($j = 1, 2, \dots, m$), di mana $j=1$ adalah kriteria paling penting.
- $w_j$: Bobot ternormalisasi kriteria pada peringkat ke-$j$.
- Sifat: $\sum_{j=1}^m w_j = 1$ (100%) dan $w_1 > w_2 > \dots > w_m > 0$.

### 6.2 Perankingan Alternatif: Simple Additive Weighting (SAW)
Metode SAW tetap menjadi algoritma perankingan alternatif smartphone:

Normalisasi Benefit:
`r_ij = x_ij / max(x_j)`

Normalisasi Cost:
`r_ij = min(x_j) / x_ij`

Nilai Preferensi Akhir:
`V_i = sum(w_j * r_ij)`

### 6.3 Aturan validasi
- Bobot kriteria diturunkan melalui ROC atau bernilai ternormalisasi valid ($\sum w_j = 1.0$).
- Anggaran adalah filter kelayakan, bukan bobot SAW.
- Produk di atas anggaran tidak boleh ditampilkan sebagai memenuhi anggaran.
- Jangan menghitung produk yang tidak memiliki data minimum yang valid.
- Tangani pembagi nol, nilai kosong, nilai nonnumerik, dan bobot tidak valid.
- Urutkan skor tertinggi ke terendah.
- Tie-break: harga lebih rendah, kemudian nama alfabetis.
- Persentase yang ditampilkan adalah `V_i × 100%`, dijelaskan sebagai skor berbobot pada skala normalisasi, bukan jaminan kecocokan sempurna.
- Admin mengelola urutan prioritas default kriteria (dikonversi via ROC); pelanggan dapat menyesuaikan preferensi pada form rekomendasi.

## 7. Tahapan implementasi

### Phase A — Fondasi
Struktur halaman, navigasi, design tokens, layout responsif, dan pola komponen.
**Selesai bila:** navigasi dan kerangka halaman berfungsi serta sesuai UI-GUIDELINE.

### Phase B — Data dan persistensi
Skema smartphone/kriteria, repository, formula kalkulator ROC, pemuatan dataset nyata, dan penyimpanan lokal.
**Selesai bila:** data yang diberikan dimuat tervalidasi, perubahan tersimpan, dan kegagalan penyimpanan ditangani.

### Phase C — Katalog
Kartu produk, pencarian, filter, dan detail.
**Selesai bila:** semua operasi menggunakan data sumber yang sama dan empty state/error jelas.

### Phase D — Form preferensi dan SAW
Validasi input, bobot, filter anggaran, normalisasi, skor, dan ranking.
**Selesai bila:** kasus uji SAW lulus dan hasil bisa dijelaskan.

### Phase E — Compare dan hasil
Compare 2–3 produk, Top 3, skor, persentase, dan kontribusi kriteria.
**Selesai bila:** nilai yang ditampilkan cocok dengan engine SAW dan spesifikasi produk.

### Phase F — Admin
Dashboard, CRUD smartphone, dan pengelolaan prioritas kriteria berbasis Rank Order Centroid (ROC) dengan preview bobot otomatis.
**Selesai bila:** validasi, konfirmasi tindakan destruktif, dan persistensi berjalan.

### Phase G — Laporan
Cetak/ekspor data katalog dan hasil SPK.
**Selesai bila:** laporan sesuai data aktual dan ranking yang dihitung.

### Phase H — Pengujian terpadu
Uji fungsional, perhitungan ROC, edge case SAW, responsivitas, persistensi, dan regresi.
**Selesai bila:** kriteria penerimaan terpenuhi dan masalah yang diketahui dicatat.

Setiap fase memerlukan pemeriksaan hasil sebelum lanjut. Jangan mengerjakan fase berikutnya diam-diam sebelum fase sebelumnya selesai.

## 8. Pengujian minimum

- Perhitungan bobot ROC (monoton menurun, total bobot tepat 1.0 / 100%).
- SAW benefit dan cost.
- Bobot nol, negatif, kosong, nonnumerik, atau total tidak valid.
- Nilai kriteria kosong, tidak valid, dan seluruh nilai sama.
- Produk tepat di batas anggaran serta di atas/bawah batas.
- Skor sama dan tie-break deterministik.
- Search/filter tanpa hasil.
- Compare di luar batas 2–3 produk.
- CRUD, refresh, localStorage gagal, dan data rusak.
- Konsistensi laporan dengan hasil SAW.
- Tampilan desktop dan mobile.

## 9. Kriteria penerimaan akhir

- Semua fitur dalam PRD tersedia dan berfungsi.
- Tidak ada kontrol UI yang tidak berfungsi.
- Perhitungan SAW dapat diuji ulang.
- Data nyata dan data uji tidak tercampur.
- Sumber data operasional dapat ditelusuri.
- UI responsif dan memenuhi pedoman desain.
- Error, empty state, dan kegagalan penyimpanan ditangani.
- Tidak ada fitur di luar ruang lingkup yang disisipkan.
