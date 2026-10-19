# Rule: Git Auto Sync & Commit

Setiap kali agent selesai mengimplementasikan fitur, melakukan perubahan file, perbaikan bug, atau pembaruan dokumen SOT atas instruksi pengguna:
1. Agent wajib memastikan integritas kode dan pengujian tidak mengalami regresi.
2. Agent HARUS otomatis melakukan staging berkas (`git add .`), membuat commit yang rapi dan deskriptif (`git commit -m "..."`), dan melakukan push ke repository GitHub (`git push origin main`) agar repository jarak jauh selalu tersinkronisasi tanpa memerlukan instruksi tambahan dari pengguna.
