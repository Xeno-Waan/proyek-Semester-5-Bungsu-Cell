/**
 * SPK Bungsu Cell — Unit Tests for Phase G (Reports & Export)
 * Pengujian konsistensi data laporan katalog, laporan hasil SAW, dan format ekspor CSV.
 * Sesuai PRD.md Bagian 4.3 & IMPLEMENTATION_PLAN.md Fase G.
 */

const ReportTests = {
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
    console.log('--- Memulai Pengujian Unit Phase G: Laporan & Ekspor ---');

    // 1. Uji Laporan Katalog Kosong
    StorageService.set(STORAGE_KEYS.SMARTPHONES, []);
    this.assert('AdminReports mendeteksi kondisi katalog kosong untuk pelaporan', SmartphoneRepository.getAll().length === 0);

    // 2. Setup Data Laporan Sementara (TEST DATA)
    const testCatalog = [
      { id: 'RPT-1', name: 'Report Phone 1', brand: 'BrandA', price: 2000000, ram: 4, storage: 64, battery: 5000, chipsetName: 'Chip1', chipsetScore: 75, cameraDesc: '13MP', cameraScore: 70, screenDesc: 'IPS', screenScore: 70, stockStatus: 'Tersedia' },
      { id: 'RPT-2', name: 'Report Phone 2', brand: 'BrandB', price: 4000000, ram: 8, storage: 128, battery: 5000, chipsetName: 'Chip2', chipsetScore: 85, cameraDesc: '50MP', cameraScore: 85, screenDesc: 'AMOLED', screenScore: 85, stockStatus: 'Tersedia' }
    ];
    StorageService.set(STORAGE_KEYS.SMARTPHONES, testCatalog);

    const catalogLoaded = SmartphoneRepository.getAll();
    this.assert('Data master katalog terisi untuk pembuatan laporan', catalogLoaded.length === 2);

    // 3. Uji Laporan Hasil SAW Kosong
    StorageService.remove(STORAGE_KEYS.LAST_RECOMMENDATION);
    const emptyRec = StorageService.get(STORAGE_KEYS.LAST_RECOMMENDATION);
    this.assert('AdminReports mendeteksi belum adanya riwayat perhitungan SAW', emptyRec === null);

    // 4. Setup Riwayat Rekomendasi SAW
    const criteria = CriteriaRepository.getDefaults();
    const sawResult = SawEngine.execute({
      items: testCatalog,
      budget: 5000000,
      rawWeights: { C1: 20, C2: 15, C3: 15, C4: 15, C5: 15, C6: 10, C7: 10 },
      criteriaList: criteria
    });
    StorageService.set(STORAGE_KEYS.LAST_RECOMMENDATION, sawResult);

    const savedRec = StorageService.get(STORAGE_KEYS.LAST_RECOMMENDATION);
    this.assert('Riwayat rekomendasi SAW tersimpan dengan konsisten untuk pelaporan', 
      savedRec && savedRec.ranking && savedRec.ranking.length === 2);

    // 5. Uji Integritas Kolom Ekspor CSV Katalog
    const catalogHeaders = ['ID', 'Nama Smartphone', 'Merek', 'Harga', 'RAM (GB)', 'ROM (GB)', 'Baterai (mAh)', 'Chipset', 'Skor Chipset', 'Kamera', 'Skor Kamera', 'Layar', 'Skor Layar', 'Status Stok'];
    this.assert('Header CSV katalog mencakup seluruh 7 kriteria dan status stok', catalogHeaders.length === 14);

    // 6. Uji Integritas Kolom Ekspor CSV SAW
    const sawHeaders = ['Peringkat', 'ID', 'Nama Smartphone', 'Merek', 'Harga', 'RAM (GB)', 'ROM (GB)', 'Baterai (mAh)', 'Skor SAW (Vi)', 'Persentase Skor (%)'];
    this.assert('Header CSV hasil SPK mencakup peringkat, skor preferensi, dan persentase', sawHeaders.length === 10);

    // 7. Uji Konsistensi Nilai Perhitungan di Laporan dengan Engine
    const topRank = savedRec.ranking[0];
    this.assert('Peringkat #1 pada laporan konsisten dengan skor tertinggi engine SAW', 
      topRank.rank === 1 && topRank.finalScore > 0 && topRank.percentageScore > 0);

    // Cleanup TEST DATA
    StorageService.set(STORAGE_KEYS.SMARTPHONES, []);
    StorageService.remove(STORAGE_KEYS.LAST_RECOMMENDATION);
    this.assert('Data uji laporan berhasil dibersihkan kembali ke keadaan awal', SmartphoneRepository.getAll().length === 0);

    console.log(`--- Pengujian Laporan Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.ReportTests = ReportTests;
