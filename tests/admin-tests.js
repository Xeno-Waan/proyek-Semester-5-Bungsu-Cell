/**
 * SPK Bungsu Cell — Unit Tests for Phase F (Admin Modules)
 * Pengujian operasi CRUD smartphone admin, validasi form, manajemen bobot kriteria, dan reset default.
 * Sesuai PRD.md Bagian 4.3 & IMPLEMENTATION_PLAN.md Fase F.
 */

const AdminTests = {
  results: [],

  assert(desc, condition, details = '') {
    const passed = Boolean(condition);
    this.results.push({ desc, passed, details });
    if (passed) {
      console.log(`%c[PASS]%c ${desc}`, 'color: green; font-weight: bold;', 'color: inherit;');
    } else {
      console.error(`[FAIL] ${desc} — ${details}`);
    }
  },

  async runAll() {
    this.results = [];
    console.log('--- Memulai Pengujian Unit Phase F: Panel Admin ---');

    // 1. Uji Tambah Smartphone Baru (Create)
    const addRes = SmartphoneRepository.create({
      id: 'ADM-TEST-1',
      name: 'Admin Test Phone X',
      brand: 'AdminBrand',
      price: 3500000,
      ram: 8,
      storage: 256,
      battery: 5000,
      chipsetName: 'TestChip',
      chipsetScore: 80,
      cameraDesc: '50MP',
      cameraScore: 85,
      screenDesc: 'AMOLED',
      screenScore: 80,
      stockStatus: 'Tersedia'
    });

    this.assert('Admin dapat menambahkan data smartphone baru tervalidasi', addRes.success === true && addRes.item.id === 'ADM-TEST-1');

    // 2. Uji Ubah Smartphone (Update)
    const updateRes = SmartphoneRepository.update('ADM-TEST-1', {
      name: 'Admin Test Phone X Updated',
      brand: 'AdminBrand',
      price: 3200000,
      ram: 8,
      storage: 256,
      battery: 5000,
      chipsetName: 'TestChip Pro',
      chipsetScore: 85,
      cameraDesc: '50MP OIS',
      cameraScore: 90,
      screenDesc: 'AMOLED 120Hz',
      screenScore: 85,
      stockStatus: 'Tersedia'
    });

    this.assert('Admin dapat memperbarui data smartphone dan spesifikasinya', 
      updateRes.success === true && updateRes.item.price === 3200000 && updateRes.item.chipsetScore === 85);

    // 3. Uji Filter & Pencarian di Admin
    AdminSmartphones.searchQuery = 'phone x';
    AdminSmartphones.filterBrand = 'all';
    const adminFiltered = AdminSmartphones.getFilteredData();
    this.assert('Admin dapat mencari smartphone berdasarkan query teks', 
      adminFiltered.length === 1 && adminFiltered[0].id === 'ADM-TEST-1');

    // 4. Uji Hapus Smartphone (Delete & Compare Sync)
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, ['ADM-TEST-1']);
    AdminSmartphones.executeDelete('ADM-TEST-1', 'Admin Test Phone X');
    const afterDelete = SmartphoneRepository.getById('ADM-TEST-1');
    const compAfterDelete = StorageService.get(STORAGE_KEYS.COMPARE_LIST, []);

    this.assert('Admin dapat menghapus smartphone dan otomatis membersihkan dari daftar perbandingan', 
      afterDelete === null && !compAfterDelete.includes('ADM-TEST-1'));

    // 5. Uji Pengubahan Bobot Kriteria Admin
    const currentCriteria = CriteriaRepository.getAll();
    const wC1 = currentCriteria.find(c => c.code === 'C1').defaultWeight;
    const wC2 = currentCriteria.find(c => c.code === 'C2').defaultWeight;
    const modifiedCriteria = currentCriteria.map(c => {
      if (c.code === 'C1') return { ...c, defaultWeight: wC2, priorityRank: 2 };
      if (c.code === 'C2') return { ...c, defaultWeight: wC1, priorityRank: 1 };
      return c;
    });

    const saveCritRes = CriteriaRepository.saveAll(modifiedCriteria);
    this.assert('Admin dapat menyimpan konfigurasi bobot kriteria baru yang valid (total 100%)', saveCritRes.success === true);

    const savedCrit = CriteriaRepository.getAll();
    this.assert('Bobot kriteria yang disimpan tersimpan di storage lokal', 
      savedCrit.find(c => c.code === 'C1').defaultWeight === wC2);

    // 6. Uji Penolakan Bobot Tidak Valid
    const invalidWeightCrit = currentCriteria.map(c => {
      if (c.code === 'C1') return { ...c, defaultWeight: 0.80 }; // Total > 100%
      return c;
    });
    const invalidSaveRes = CriteriaRepository.saveAll(invalidWeightCrit);
    this.assert('Admin menolak penyimpanan bobot jika total tidak sama dengan 100%', invalidSaveRes.success === false);

    // 7. Uji Reset Bobot ke Default Toko
    CriteriaRepository.resetToDefault();
    const resetCrit = CriteriaRepository.getAll();
    this.assert('Admin dapat mereset konfigurasi bobot kembali ke nilai kanonikal default (C1: Rank 1 ~37.04%)', 
      resetCrit.find(c => c.code === 'C1').defaultWeight === 0.3704);

    // 8. Uji Pengurutan Prioritas ROC oleh Admin
    AdminCriteria.modalWorkingList = JSON.parse(JSON.stringify(resetCrit));
    // Tukar posisi: buat RAM (C2) menjadi prioritas #1 dan Harga (C1) menjadi prioritas #2
    AdminCriteria.swapItems(0, 1);
    this.assert('Admin dapat menukar urutan prioritas kriteria', 
      AdminCriteria.modalWorkingList[0].code === 'C2' && AdminCriteria.modalWorkingList[1].code === 'C1');
    this.assert('Urutan prioritas baru otomatis mendapatkan bobot ROC peringkat #1 (37.04%) untuk C2', 
      AdminCriteria.modalWorkingList[0].defaultWeight === 0.3704);

    // Kembalikan ke default toko
    CriteriaRepository.resetToDefault();

    // Cleanup: Reset filters & ensure clean storage
    AdminSmartphones.searchQuery = '';
    AdminSmartphones.filterBrand = 'all';
    this.assert('Data uji admin berhasil dibersihkan kembali ke keadaan awal', SmartphoneRepository.getAll().length === 0);

    console.log(`--- Pengujian Admin Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.AdminTests = AdminTests;
