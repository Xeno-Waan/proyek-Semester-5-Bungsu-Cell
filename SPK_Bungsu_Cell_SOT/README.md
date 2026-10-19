# SPK Bungsu Cell — Paket Final SOT

**Versi paket:** v0.2.0  
**Status paket:** Dokumen SOT disetujui (Revisi Pembobotan ROC)  
**Tanggal paket:** 19 Oktober 2026  
**Peringatan:** Paket ini berisi dokumen SOT dan kontrak eksekusi sistem pendukung keputusan Bungsu Cell.

## Isi paket

- `PRD.md` — Product Requirements Document
- `UI-GUIDELINE.md` — pedoman desain antarmuka
- `IMPLEMENTATION_PLAN.md` — rencana teknis dan tahapan implementasi
- `AGENTS.md` — kontrak kerja untuk coding agent
- `PROMPT_EXECUTION.md` — prompt awal untuk memulai proyek setelah data dan instruksi tersedia
- `PREVIEW.md` — ringkasan visual dan struktur seluruh dokumen

## Cara menggunakan

1. Ekstrak ZIP ini ke folder proyek.
2. Tinjau kembali seluruh dokumen sebagai satu sumber kebenaran (Source of Truth / SOT).
3. Sebelum implementasi, siapkan data nyata Bungsu Cell yang diperlukan. Jika belum tersedia, minta kepada pemilik proyek.
4. Gunakan `AGENTS.md` sebagai kontrak dan `PROMPT_EXECUTION.md` sebagai prompt awal ketika pemilik proyek mengizinkan implementasi.
5. Kerjakan fase satu per satu. Jangan melompati gerbang persetujuan.

## Batas penting

- Tidak ada katalog nyata yang dapat dianggap lengkap sebelum pemilik proyek memberikan datanya.
- Data sintetis hanya boleh digunakan untuk pengujian terisolasi apabila disetujui, dan harus diberi label jelas.
- Jangan menyajikan data sintetis sebagai data Bungsu Cell.
- Dokumen ini tidak mengizinkan coding agent untuk langsung membangun aplikasi; izin implementasi harus diberikan secara eksplisit.
