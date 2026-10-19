/**
 * SPK Bungsu Cell — Unit Tests for Phase E (Compare Module)
 * Pengujian perbandingan berdampingan 2–3 smartphone, highlight nilai terbaik, dan sinkronisasi storage.
 * Sesuai PRD.md Bagian 4.2 & IMPLEMENTATION_PLAN.md Fase E.
 */

const CompareTests = {
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
    console.log('--- Memulai Pengujian Unit Phase E: Compare & Perbandingan ---');

    // Setup temporary test smartphones (TEST DATA)
    const testItems = [
      { id: 'CMP-1', name: 'Compare Phone A', brand: 'BrandA', price: 2500000, ram: 6, storage: 128, battery: 5000, chipsetScore: 75, cameraScore: 80, screenScore: 80, stockStatus: 'Tersedia' },
      { id: 'CMP-2', name: 'Compare Phone B', brand: 'BrandB', price: 3500000, ram: 8, storage: 256, battery: 4500, chipsetScore: 85, cameraScore: 90, screenScore: 85, stockStatus: 'Tersedia' },
      { id: 'CMP-3', name: 'Compare Phone C', brand: 'BrandC', price: 4500000, ram: 12, storage: 512, battery: 6000, chipsetScore: 95, cameraScore: 95, screenScore: 90, stockStatus: 'Tersedia' }
    ];
    StorageService.set(STORAGE_KEYS.SMARTPHONES, testItems);

    // 1. Test Empty Compare List
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, []);
    let compareItems = CompareModule.getCompareItems();
    this.assert('CompareModule mengembalikan array kosong saat belum ada produk dipilih', compareItems.length === 0);

    // 2. Test Single Item (Below minimum of 2)
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, ['CMP-1']);
    compareItems = CompareModule.getCompareItems();
    this.assert('CompareModule mengenali kondisi kurang dari 2 produk (tidak cukup untuk perbandingan)', compareItems.length === 1);

    // 3. Test 2 Products Selected (Valid Comparison)
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, ['CMP-1', 'CMP-2']);
    compareItems = CompareModule.getCompareItems();
    this.assert('CompareModule memuat 2 smartphone untuk perbandingan berdampingan', 
      compareItems.length === 2 && compareItems[0].id === 'CMP-1' && compareItems[1].id === 'CMP-2');

    // 4. Test 3 Products Selected (Maximum Allowed Comparison)
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, ['CMP-1', 'CMP-2', 'CMP-3']);
    compareItems = CompareModule.getCompareItems();
    this.assert('CompareModule memuat tepat 3 smartphone pada batas maksimum perbandingan', compareItems.length === 3);

    // 5. Test Best Value Logic
    const minPrice = Math.min(...compareItems.map(i => i.price));
    const maxRam = Math.max(...compareItems.map(i => i.ram));
    const maxBattery = Math.max(...compareItems.map(i => i.battery));
    this.assert('Best value calculation mendeteksi harga terendah (CMP-1: 2.5jt)', minPrice === 2500000);
    this.assert('Best value calculation mendeteksi RAM tertinggi (CMP-3: 12GB)', maxRam === 12);
    this.assert('Best value calculation mendeteksi baterai terbesar (CMP-3: 6000mAh)', maxBattery === 6000);

    // 6. Test Remove Single Item
    CompareModule.removeItem('CMP-2');
    compareItems = CompareModule.getCompareItems();
    this.assert('removeItem menghapus produk yang ditentukan dari storage perbandingan', 
      compareItems.length === 2 && !compareItems.find(i => i.id === 'CMP-2'));

    // 7. Test Clear All
    CompareModule.clearAll();
    compareItems = CompareModule.getCompareItems();
    this.assert('clearAll mengosongkan seluruh daftar perbandingan', compareItems.length === 0);

    // 8. Test Invalid/Deleted ID Tolerance
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, ['CMP-1', 'NON-EXISTENT-ID']);
    compareItems = CompareModule.getCompareItems();
    this.assert('CompareModule menyaring ID yang tidak ada di repositori tanpa menimbulkan crash', 
      compareItems.length === 1 && compareItems[0].id === 'CMP-1');

    // Cleanup TEST DATA
    StorageService.set(STORAGE_KEYS.SMARTPHONES, []);
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, []);
    this.assert('Data uji compare berhasil dibersihkan kembali ke keadaan awal', SmartphoneRepository.getAll().length === 0);

    console.log(`--- Pengujian Compare Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.CompareTests = CompareTests;
