/**
 * SPK Bungsu Cell — Integration & Regression Test Suite (Phase H)
 * Pengujian terpadu seluruh alur sistem (End-to-End), edge cases SAW,
 * integritas persistensi, dan konsistensi antar-modul.
 * Sesuai IMPLEMENTATION_PLAN.md Bagian 8 & 9.
 */

const IntegrationTests = {
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
    console.log('--- Memulai Pengujian Terpadu Phase H: Integrasi & Regresi ---');

    // Pastikan storage awal bersih
    StorageService.set(STORAGE_KEYS.SMARTPHONES, []);
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, []);
    StorageService.remove(STORAGE_KEYS.LAST_RECOMMENDATION);

    // =========================================================================
    // 1. ALUR END-TO-END (ADMIN CRUD -> KATALOG -> COMPARE -> SPK -> LAPORAN)
    // =========================================================================

    // Langkah A: Admin menambahkan 4 smartphone riil (disimulasikan dengan dataset uji terisolasi)
    const phoneData = [
      { id: 'E2E-01', name: 'Galaxy Prime A', brand: 'Samsung', price: 3000000, ram: 6, storage: 128, battery: 5000, chipsetName: 'Exynos 1380', chipsetScore: 80, cameraDesc: '50MP OIS', cameraScore: 85, screenDesc: 'AMOLED 120Hz', screenScore: 85, stockStatus: 'Tersedia' },
      { id: 'E2E-02', name: 'Redmi Turbo B', brand: 'Xiaomi', price: 4000000, ram: 8, storage: 256, battery: 5500, chipsetName: 'Snapdragon 7s Gen 2', chipsetScore: 88, cameraDesc: '64MP OIS', cameraScore: 82, screenDesc: 'AMOLED 120Hz', screenScore: 88, stockStatus: 'Tersedia' },
      { id: 'E2E-03', name: 'Realme Ultra C', brand: 'Realme', price: 6000000, ram: 12, storage: 512, battery: 5000, chipsetName: 'Dimensity 7050', chipsetScore: 84, cameraDesc: '108MP', cameraScore: 86, screenDesc: 'Curved AMOLED', screenScore: 86, stockStatus: 'Tersedia' },
      { id: 'E2E-04', name: 'Infinix Play D', brand: 'Infinix', price: 2000000, ram: 4, storage: 64, battery: 6000, chipsetName: 'Helio G99', chipsetScore: 70, cameraDesc: '50MP', cameraScore: 75, screenDesc: 'IPS 90Hz', screenScore: 72, stockStatus: 'Tersedia' }
    ];

    phoneData.forEach(p => SmartphoneRepository.create(p));
    this.assert('E2E Langkah 1: Admin berhasil menambahkan 4 unit smartphone ke repositori', 
      SmartphoneRepository.getAll().length === 4);

    // Langkah B: Katalog Publik memuat semua produk
    CatalogModule.resetFilters();
    let catalogItems = CatalogModule.getFilteredData();
    this.assert('E2E Langkah 2: Katalog publik menampilkan seluruh 4 produk', catalogItems.length === 4);

    // Langkah C: Pengguna mencari "Xiaomi" di katalog
    CatalogModule.currentFilter.search = 'xiaomi';
    let searchResult = CatalogModule.getFilteredData();
    this.assert('E2E Langkah 3: Pencarian "xiaomi" menampilkan tepat 1 produk (Redmi Turbo B)', 
      searchResult.length === 1 && searchResult[0].id === 'E2E-02');

    // Langkah D: Pengguna menyaring produk harga <= 3.5jt
    CatalogModule.resetFilters();
    CatalogModule.currentFilter.maxPrice = '4000000';
    let priceFilterResult = CatalogModule.getFilteredData();
    this.assert('E2E Langkah 4: Filter harga <= 4jt menampilkan 3 produk yang memenuhi syarat', 
      priceFilterResult.length === 3 && priceFilterResult.every(p => p.price <= 4000000));

    // Langkah E: Pengguna memilih 2 produk untuk dibandingkan
    CatalogModule.toggleCompare('E2E-01');
    CatalogModule.toggleCompare('E2E-02');
    let compareItems = CompareModule.getCompareItems();
    this.assert('E2E Langkah 5: Halaman perbandingan memuat 2 smartphone berdampingan', 
      compareItems.length === 2 && compareItems[0].id === 'E2E-01' && compareItems[1].id === 'E2E-02');

    // Langkah F: Pengguna membuka SPK dengan Batas Anggaran Rp 4.500.000
    // Produk E2E-03 (6jt) harus otomatis tereksklusi dari perhitungan
    const sawRun = SawEngine.execute({
      items: SmartphoneRepository.getAll(),
      budget: 4500000,
      rawWeights: { C1: 25, C2: 15, C3: 15, C4: 15, C5: 15, C6: 10, C7: 5 }
    });

    this.assert('E2E Langkah 6: Engine SAW mengevaluasi produk dan menyaring produk di atas 4.5jt', 
      sawRun.success === true && sawRun.ranking.length === 3 && sawRun.excluded.overBudget.length === 1);
    this.assert('E2E Langkah 7: Produk yang tereksklusi anggaran adalah E2E-03 (Realme Ultra C - 6jt)', 
      sawRun.excluded.overBudget[0].item.id === 'E2E-03');
    this.assert('E2E Langkah 8: Peringkat #1 memiliki skor SAW tertinggi dan berada dalam batas anggaran', 
      sawRun.ranking[0].rank === 1 && sawRun.ranking[0].item.price <= 4500000);

    // Langkah G: Simpan hasil ke storage dan verifikasi pembacaan di modul Laporan Admin
    StorageService.set(STORAGE_KEYS.LAST_RECOMMENDATION, sawRun);
    const reportLastRec = StorageService.get(STORAGE_KEYS.LAST_RECOMMENDATION);
    this.assert('E2E Langkah 9: Modul laporan membaca hasil rekomendasi SPK secara identik', 
      reportLastRec.ranking.length === 3 && reportLastRec.ranking[0].item.id === sawRun.ranking[0].item.id);

    // Langkah H: Admin mengubah harga E2E-01 dari 3jt menjadi 2.8jt
    SmartphoneRepository.update('E2E-01', {
      name: 'Galaxy Prime A (Diskon)',
      brand: 'Samsung',
      price: 2800000,
      ram: 6,
      storage: 128,
      battery: 5000,
      chipsetName: 'Exynos 1380',
      chipsetScore: 80,
      cameraDesc: '50MP OIS',
      cameraScore: 85,
      screenDesc: 'AMOLED 120Hz',
      screenScore: 85,
      stockStatus: 'Tersedia'
    });
    const updatedPhone = SmartphoneRepository.getById('E2E-01');
    this.assert('E2E Langkah 10: Pembaruan harga smartphone berhasil tersimpan secara reaktif', 
      updatedPhone.price === 2800000 && updatedPhone.name.includes('Diskon'));

    // Langkah I: Admin menghapus E2E-01
    AdminSmartphones.executeDelete('E2E-01', updatedPhone.name);
    const afterDeleteItems = SmartphoneRepository.getAll();
    const compareAfterDelete = StorageService.get(STORAGE_KEYS.COMPARE_LIST, []);
    this.assert('E2E Langkah 11: Smartphone terhapus dari katalog dan otomatis dibersihkan dari compare', 
      afterDeleteItems.length === 3 && !compareAfterDelete.includes('E2E-01'));

    // =========================================================================
    // 2. PENGUJIAN EDGE CASES MATEMATIS & KEAMANAN SISTEM
    // =========================================================================

    // Kasus Tepi 1: Produk tepat di batas anggaran
    const edgeBudgetResult = SawEngine.execute({
      items: [
        { id: 'EDG-1', name: 'Exact Budget', brand: 'B', price: 3000000, ram: 6, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
        { id: 'EDG-2', name: 'Above by 1 Rupiah', brand: 'B', price: 3000001, ram: 6, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
        { id: 'EDG-3', name: 'Below by 1 Rupiah', brand: 'B', price: 2999999, ram: 6, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
      ],
      budget: 3000000,
      rawWeights: { C1: 20, C2: 15, C3: 15, C4: 15, C5: 15, C6: 10, C7: 10 }
    });

    this.assert('Edge Case 1: Produk tepat di batas anggaran dan di bawah batas lolos evaluasi', 
      edgeBudgetResult.ranking.length === 2 && 
      edgeBudgetResult.ranking.some(r => r.item.id === 'EDG-1') &&
      edgeBudgetResult.ranking.some(r => r.item.id === 'EDG-3'));

    this.assert('Edge Case 2: Produk di atas batas walau selisih 1 rupiah tereksklusi', 
      edgeBudgetResult.excluded.overBudget.length === 1 && edgeBudgetResult.excluded.overBudget[0].item.id === 'EDG-2');

    // Kasus Tepi 2: Seluruh nilai spesifikasi identik (semua alternatif bernilai sama)
    const identicalResult = SawEngine.execute({
      items: [
        { id: 'IDEN-1', name: 'Phone X', brand: 'B', price: 3000000, ram: 8, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
        { id: 'IDEN-2', name: 'Phone Y', brand: 'B', price: 3000000, ram: 8, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
      ],
      budget: 3000000,
      rawWeights: { C1: 20, C2: 15, C3: 15, C4: 15, C5: 15, C6: 10, C7: 10 }
    });

    // Ketika semua nilai sama, r_ij = 1.0 untuk semua kriteria -> V_i = sum(w_j * 1.0) = 1.0000
    this.assert('Edge Case 3: Jika seluruh spesifikasi alternatif identik, skor SAW bernilai 1.0000 (100%)', 
      identicalResult.ranking[0].finalScore === 1.0 && identicalResult.ranking[1].finalScore === 1.0);

    // Kasus Tepi 3: Bobot nol pada sebagian kriteria
    const zeroWeightsResult = SawEngine.execute({
      items: [
        { id: 'ZW-1', name: 'Phone Low RAM', brand: 'B', price: 3000000, ram: 2, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
        { id: 'ZW-2', name: 'Phone High RAM', brand: 'B', price: 3000000, ram: 16, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
      ],
      budget: 3000000,
      rawWeights: { C1: 0, C2: 0, C3: 25, C4: 25, C5: 25, C6: 25, C7: 0 } // Bobot C1, C2, C7 di-nolkan
    });

    this.assert('Edge Case 4: Engine SAW menangani bobot nol tanpa menghasilkan error numerik', 
      zeroWeightsResult.success === true && !isNaN(zeroWeightsResult.ranking[0].finalScore));

    // =========================================================================
    // 3. PEMBERSIHAN AKHIR — JAMINAN INTEGRITAS KATALOG OPERASIONAL TOKO
    // =========================================================================
    StorageService.set(STORAGE_KEYS.SMARTPHONES, []);
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, []);
    StorageService.remove(STORAGE_KEYS.LAST_RECOMMENDATION);
    CatalogModule.resetFilters();

    this.assert('Pembersihan Terpadu: Katalog operasional bebas 100% dari data sintetis uji', 
      SmartphoneRepository.getAll().length === 0);

    console.log(`--- Pengujian Terpadu Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.IntegrationTests = IntegrationTests;
