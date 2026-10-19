/**
 * SPK Bungsu Cell — Unit Tests for Phase C (Catalog & Product Detail)
 * Pengujian logika filter katalog, pencarian, pengurutan, perbandingan, dan detail produk.
 */

const CatalogTests = {
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
    console.log('--- Memulai Pengujian Unit Phase C: Katalog & Detail ---');

    // Setup isolated test catalog (TEST DATA)
    const testItems = [
      { id: 'TEST-P1', name: 'Alpha 5G', brand: 'BrandA', price: 3000000, ram: 6, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 85, screenScore: 75 },
      { id: 'TEST-P2', name: 'Beta Pro', brand: 'BrandB', price: 5000000, ram: 8, storage: 256, battery: 4500, chipsetScore: 90, cameraScore: 90, screenScore: 85 },
      { id: 'TEST-P3', name: 'Gamma Plus', brand: 'BrandA', price: 2000000, ram: 4, storage: 64, battery: 6000, chipsetScore: null, cameraScore: null, screenScore: null }
    ];

    // Save test items temporarily
    StorageService.set(STORAGE_KEYS.SMARTPHONES, testItems);

    // 1. Test Filter Brand
    CatalogModule.currentFilter = { search: '', brand: 'BrandA', maxPrice: 'all', minRam: 'all', sort: 'default' };
    const brandFiltered = CatalogModule.getFilteredData();
    this.assert('Filter brand mengembalikan hanya produk dari brand yang dipilih', 
      brandFiltered.length === 2 && brandFiltered.every(i => i.brand === 'BrandA'));

    // 2. Test Search Input
    CatalogModule.currentFilter = { search: 'beta', brand: 'all', maxPrice: 'all', minRam: 'all', sort: 'default' };
    const searchFiltered = CatalogModule.getFilteredData();
    this.assert('Pencarian teks menemukan produk berdasarkan nama (case-insensitive)', 
      searchFiltered.length === 1 && searchFiltered[0].id === 'TEST-P2');

    // 3. Test Max Price Filter
    CatalogModule.currentFilter = { search: '', brand: 'all', maxPrice: '3000000', minRam: 'all', sort: 'default' };
    const priceFiltered = CatalogModule.getFilteredData();
    this.assert('Filter harga maksimum menyaring produk di atas batas', 
      priceFiltered.length === 2 && priceFiltered.every(i => i.price <= 3000000));

    // 4. Test Min RAM Filter
    CatalogModule.currentFilter = { search: '', brand: 'all', maxPrice: 'all', minRam: '8', sort: 'default' };
    const ramFiltered = CatalogModule.getFilteredData();
    this.assert('Filter RAM minimum menyaring produk di bawah kapasitas', 
      ramFiltered.length === 1 && ramFiltered[0].ram >= 8);

    // 5. Test Sorting Price Ascending
    CatalogModule.currentFilter = { search: '', brand: 'all', maxPrice: 'all', minRam: 'all', sort: 'price_asc' };
    const sortedAsc = CatalogModule.getFilteredData();
    this.assert('Pengurutan harga terendah mengurutkan produk dari termurah', 
      sortedAsc[0].price === 2000000 && sortedAsc[2].price === 5000000);

    // 6. Test Sorting Price Descending
    CatalogModule.currentFilter = { search: '', brand: 'all', maxPrice: 'all', minRam: 'all', sort: 'price_desc' };
    const sortedDesc = CatalogModule.getFilteredData();
    this.assert('Pengurutan harga tertinggi mengurutkan produk dari termahal', 
      sortedDesc[0].price === 5000000 && sortedDesc[2].price === 2000000);

    // 7. Test Compare Toggle & Limit
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, []);
    CatalogModule.toggleCompare('TEST-P1');
    let compList = StorageService.get(STORAGE_KEYS.COMPARE_LIST, []);
    this.assert('Toggle compare dapat menambahkan produk ke daftar perbandingan', compList.includes('TEST-P1'));

    CatalogModule.toggleCompare('TEST-P2');
    CatalogModule.toggleCompare('TEST-P3');
    compList = StorageService.get(STORAGE_KEYS.COMPARE_LIST, []);
    this.assert('Daftar perbandingan dapat menampung hingga 3 produk', compList.length === 3);

    // Attempt adding 4th product
    CatalogModule.toggleCompare('TEST-P4');
    compList = StorageService.get(STORAGE_KEYS.COMPARE_LIST, []);
    this.assert('Sistem menolak penambahan lebih dari 3 produk pada perbandingan', compList.length === 3);

    // Toggle remove
    CatalogModule.toggleCompare('TEST-P1');
    compList = StorageService.get(STORAGE_KEYS.COMPARE_LIST, []);
    this.assert('Toggle compare dapat menghapus produk yang sudah ada di daftar', !compList.includes('TEST-P1') && compList.length === 2);

    // 8. Test Product Detail Completeness
    const detailP1 = SmartphoneRepository.getById('TEST-P1');
    const compP1 = SmartphoneRepository.checkSawCompleteness(detailP1);
    this.assert('Detail produk mendeteksi data lengkap untuk evaluasi SAW', compP1.complete === true);

    const detailP3 = SmartphoneRepository.getById('TEST-P3');
    const compP3 = SmartphoneRepository.checkSawCompleteness(detailP3);
    this.assert('Detail produk mendeteksi data tidak lengkap dengan alasan jelas', 
      compP3.complete === false && compP3.missingCriteria.length === 3);

    // Cleanup: restore empty catalog
    StorageService.set(STORAGE_KEYS.SMARTPHONES, []);
    StorageService.set(STORAGE_KEYS.COMPARE_LIST, []);
    CatalogModule.resetFilters();
    this.assert('Katalog uji berhasil dibersihkan kembali ke keadaan awal', SmartphoneRepository.getAll().length === 0);

    console.log(`--- Pengujian Katalog Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.CatalogTests = CatalogTests;
