/**
 * SPK Bungsu Cell — Unit Tests for Phase B (Data & Persistence)
 * Pengujian manual & otomatis ringan tanpa dependensi eksternal.
 */

const DataTests = {
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
    console.log('--- Memulai Pengujian Unit Phase B: Data & Persistensi ---');

    // 1. StorageService Tests
    const avail = StorageService.isAvailable();
    this.assert('StorageService dapat mendeteksi ketersediaan localStorage', avail.available === true);

    const testKey = '__test_key_temp__';
    StorageService.set(testKey, { num: 42, str: 'Bungsu' });
    const retrieved = StorageService.get(testKey);
    this.assert('StorageService dapat menyimpan dan membaca objek JSON', retrieved && retrieved.num === 42 && retrieved.str === 'Bungsu');

    StorageService.remove(testKey);
    const afterRemove = StorageService.get(testKey);
    this.assert('StorageService dapat menghapus data', afterRemove === null);

    // Corrupted JSON recovery test
    localStorage.setItem('__corrupt_test__', '{ invalid_json_syntax');
    const corruptRetrieved = StorageService.get('__corrupt_test__', 'FALLBACK');
    this.assert('StorageService menangani JSON rusak dengan mengembalikan fallback default', corruptRetrieved === 'FALLBACK');
    localStorage.removeItem('__corrupt_test__');

    // 2. CriteriaRepository Tests
    const defaults = CriteriaRepository.getDefaults();
    this.assert('CriteriaRepository memiliki tepat 7 kriteria kanonikal', defaults.length === 7);

    const defaultValidation = CriteriaRepository.validate(defaults);
    this.assert('Kriteria default lolos validasi dengan total bobot 100% (1.0)', defaultValidation.valid === true && defaultValidation.sum === 1.0);

    // Test invalid criteria (wrong sum)
    const invalidCriteria = [
      { code: 'C1', name: 'Harga', type: 'cost', defaultWeight: 0.10 }
    ];
    const invalidValidation = CriteriaRepository.validate(invalidCriteria);
    this.assert('CriteriaRepository menolak kriteria dengan total bobot bukan 100%', invalidValidation.valid === false);

    // Test weight normalization
    const rawWeights = { C1: 30, C2: 30, C3: 40 };
    const norm = CriteriaRepository.normalizeWeights(rawWeights);
    const sumNorm = Number((norm.C1 + norm.C2 + norm.C3).toFixed(4));
    this.assert('CriteriaRepository dapat menormalisasi bobot mentah ke skala 1.0', sumNorm === 1.0);

    // Test ROC (Rank Order Centroid) weight calculation
    const rocWeights7 = CriteriaRepository.calculateRocWeights(7);
    this.assert('Kalkulator ROC menghasilkan tepat 7 bobot kriteria', rocWeights7.length === 7);

    const sumRoc = Number(rocWeights7.reduce((a, b) => a + b, 0).toFixed(4));
    this.assert('Total bobot ROC m=7 bernilai tepat 1.0000 (100%)', sumRoc === 1.0);

    const isDecreasing = rocWeights7.every((w, i) => i === 0 || w < rocWeights7[i - 1]);
    this.assert('Bobot ROC bersifat monoton menurun sesuai urutan prioritas (w1 > w2 > ... > w7)', isDecreasing === true);
    this.assert('Bobot ROC peringkat #1 bernilai ~37.04% (0.3704)', Math.abs(rocWeights7[0] - 0.3704) < 0.001);

    // Test applyRocRanks
    const reordered = [
      { code: 'C2', name: 'RAM', priorityRank: 1 },
      { code: 'C1', name: 'Harga', priorityRank: 2 }
    ];
    const applied = CriteriaRepository.applyRocRanks(reordered);
    this.assert('applyRocRanks berhasil menetapkan bobot ROC sesuai prioritas kriteria', 
      applied[0].code === 'C2' && applied[0].defaultWeight > applied[1].defaultWeight);

    // 3. SmartphoneRepository Validation Tests
    const emptyValidation = SmartphoneRepository.validate({});
    this.assert('SmartphoneRepository menolak data kosong', emptyValidation.valid === false && emptyValidation.errors.length > 0);

    const negativePriceValidation = SmartphoneRepository.validate({
      name: 'Test Phone',
      brand: 'TestBrand',
      price: -500000,
      ram: 8,
      storage: 128,
      battery: 5000
    });
    this.assert('SmartphoneRepository menolak harga negatif atau 0', negativePriceValidation.valid === false);

    const invalidScoreValidation = SmartphoneRepository.validate({
      name: 'Test Phone',
      brand: 'TestBrand',
      price: 3000000,
      ram: 8,
      storage: 128,
      battery: 5000,
      chipsetScore: 150 // Melebihi 100
    });
    this.assert('SmartphoneRepository menolak skor evaluatif di luar rentang 1-100', invalidScoreValidation.valid === false);

    // 4. SawCompleteness Checker Tests (SOT Compliance)
    const incompleteItem = {
      price: 3000000,
      ram: 8,
      storage: 128,
      battery: 5000,
      // missing chipsetScore, cameraScore, screenScore
    };
    const compCheck = SmartphoneRepository.checkSawCompleteness(incompleteItem);
    this.assert('Completeness checker mendeteksi kriteria yang belum terisi tanpa mengubah nilai ke 0 secara diam-diam', 
      compCheck.complete === false && compCheck.missingCriteria.length === 3);

    // 5. Temporary CRUD Cycle Isolation Test (Uses TEST DATA, cleaned up immediately)
    const initialCount = SmartphoneRepository.getAll().length;
    const testCreate = SmartphoneRepository.create({
      id: 'TEST-DATA-01',
      name: 'TEST DATA Phone A',
      brand: 'BrandX',
      price: 2500000,
      ram: 6,
      storage: 128,
      battery: 5000,
      chipsetScore: 75,
      cameraScore: 80,
      screenScore: 70
    });
    this.assert('SmartphoneRepository dapat membuat item baru tervalidasi', testCreate.success === true && testCreate.item.id === 'TEST-DATA-01');

    const retrievedItem = SmartphoneRepository.getById('TEST-DATA-01');
    this.assert('SmartphoneRepository dapat menemukan item yang baru dibuat', retrievedItem && retrievedItem.price === 2500000);

    const testUpdate = SmartphoneRepository.update('TEST-DATA-01', {
      name: 'TEST DATA Phone A Updated',
      brand: 'BrandX',
      price: 2400000,
      ram: 6,
      storage: 128,
      battery: 5000
    });
    this.assert('SmartphoneRepository dapat memperbarui data item', testUpdate.success === true && testUpdate.item.price === 2400000);

    // Cleanup test data immediately so catalog remains clean!
    SmartphoneRepository.delete('TEST-DATA-01');
    const finalCount = SmartphoneRepository.getAll().length;
    this.assert('SmartphoneRepository membersihkan data uji sehingga katalog nyata tetap murni', finalCount === initialCount);

    console.log(`--- Pengujian Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.DataTests = DataTests;
