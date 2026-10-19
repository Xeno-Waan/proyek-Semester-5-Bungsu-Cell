# UI-GUIDELINE — SPK Bungsu Cell

- **Versi:** v0.2.0
- **Status:** APPROVED
- **Tanggal:** 19 Oktober 2026 (Revisi Pembobotan ROC)

## 1. Arah visual

Modern futuristic SaaS: rapi, terpercaya, responsif, dan berorientasi pada pemilihan smartphone. Gunakan layout bersih, hirarki informasi yang jelas, kartu produk, ruang kosong yang cukup, ikon konsisten, dan animasi secukupnya.

## 2. Identitas warna

| Token | Hex | Penggunaan |
|---|---|---|
| Forest Green | `#0B3D2E` | Warna utama, navigasi, CTA utama |
| Golden Yellow | `#F2C94C` | Aksen dan tindakan penting |
| Soft Background | `#F7F9F7` | Latar halaman terang |
| Dark Text | `#17231D` | Teks utama |
| Muted Text | `#52645A` | Teks sekunder |
| Border | `#DCE5DF` | Batas komponen |

Pastikan kontras teks memadai. Jangan menggunakan warna sebagai satu-satunya penanda status; sertakan label atau ikon.

## 3. Tipografi dan komponen

- Gunakan tipografi sans-serif yang mudah dibaca.
- Utamakan judul halaman, judul bagian, label, nilai utama, dan helper text yang berbeda jelas.
- Tombol harus memakai label aksi yang spesifik.
- Input memiliki label terlihat, petunjuk yang relevan, dan pesan validasi.
- Gunakan Bootstrap 5 untuk grid dan komponen responsif, lalu CSS khusus untuk identitas Bungsu Cell.
- SweetAlert2 digunakan untuk konfirmasi atau notifikasi yang memang membutuhkan dialog.
- Chart.js bersifat pelengkap dan hanya digunakan bila grafik membantu memahami skor.

## 4. Struktur halaman

### Public
- Landing page: hero, CTA ke rekomendasi, pintasan katalog.
- Katalog: pencarian, filter merek/harga, kartu produk.
- Detail produk: foto, harga, spesifikasi, tindakan compare/rekomendasi.
- Compare: 2–3 produk ditampilkan berdampingan.
- Form preferensi: anggaran, prioritas kriteria, validasi bobot.
- Hasil rekomendasi: Top 3, ranking, skor SAW, persentase skor, kontribusi kriteria.

### Admin
- Dashboard: jumlah data yang benar-benar tersedia dan statistik yang benar-benar tercatat.
- Manajemen smartphone: tabel/list, tambah, edit, hapus.
- Manajemen kriteria: pengurutan prioritas (peringkat 1 s/d m), perhitungan otomatis bobot Rank Order Centroid (ROC), pratinjau persentase bobot realtime, dan konfigurasi tipe benefit/cost.
- Laporan: ringkasan, cetak, dan ekspor.

## 5. Pola UX

- Search dan filter harus mudah ditemukan.
- Tampilkan empty state yang jelas jika tidak ada hasil.
- Sediakan tombol kembali, reset preferensi, dan kemampuan mengubah pilihan sebelum menghitung.
- Berikan konfirmasi sebelum penghapusan data.
- Tampilkan indikator loading hanya untuk operasi yang memang membutuhkan waktu.
- Tampilkan error dan keberhasilan secara akurat.
- Untuk data belum tersedia, gunakan label “Belum tersedia”, bukan nilai rekaan.
- Jelaskan jika produk dikecualikan dari perhitungan karena data kriteria tidak lengkap.
- Jangan menyebut skor SAW sebagai jaminan bahwa produk pasti cocok.

## 6. Responsivitas dan aksesibilitas

- Desktop: gunakan ruang untuk katalog, panel filter, tabel, dan grafik.
- Mobile: susun kartu satu kolom atau dua kolom sesuai lebar; tabel yang lebar dapat digulir horizontal.
- Tombol dan input memiliki ukuran sentuh yang memadai.
- Gunakan elemen HTML semantik, label input, fokus keyboard yang terlihat, dan teks alternatif gambar.
- Perbandingan 2–3 produk harus tetap terbaca di layar kecil.

## 7. Status dan visualisasi data

- Gunakan format harga Rupiah yang konsisten.
- Kapasitas harus menyertakan satuan (GB, mAh, dan sebagainya).
- Skor, bobot, dan persentase harus memiliki label yang jelas.
- Bobot kriteria menampilkan peringkat prioritas (#1, #2, dst.) dan persentase bobot hasil konversi ROC secara jelas.
- Grafik tidak boleh menyiratkan data yang tidak tersedia.
- Statistik dashboard harus dihitung dari data aktual yang tersimpan, bukan angka contoh yang tampil seolah-olah nyata.

## 8. Larangan desain

- Jangan menambah modul di luar PRD.
- Jangan menampilkan data produk fiktif sebagai data toko.
- Jangan menggunakan grafik dekoratif tanpa sumber data.
- Jangan membuat tombol atau kontrol yang tidak memiliki fungsi.
- Jangan mengubah identitas Forest Green `#0B3D2E` dan Golden Yellow `#F2C94C` tanpa persetujuan.
