/**
 * SPK Bungsu Cell — Unit Tests for Phase D (SAW Engine & Preferences)
 * Pengujian ketat formula SAW, normalisasi benefit & cost, filter kelayakan anggaran,
 * penanganan data kosong/tidak lengkap, dan tie-break deterministik.
 * Sesuai PRD.md Bagian 7 & IMPLEMENTATION_PLAN.md Bagian 6 & 8.
 */

const SawTests = {
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
    console.log('--- Memulai Pengujian Unit Phase D: Engine SAW ---');

    const criteria = CriteriaRepository.getDefaults();
    // Default weights: C1: 0.20, C2: 0.15, C3: 0.15, C4: 0.15, C5: 0.15, C6: 0.10, C7: 0.10

    // 1. Uji Normalisasi Benefit (r_ij = x_ij / max)
    // Kriteria C2 (RAM): 4GB, 8GB, 16GB -> max = 16
    const sampleItems = [
      { id: 'T1', name: 'Phone 1', brand: 'B', price: 2000000, ram: 4, storage: 64, chipsetScore: 70, battery: 4000, cameraScore: 70, screenScore: 70 },
      { id: 'T2', name: 'Phone 2', brand: 'B', price: 4000000, ram: 8, storage: 128, chipsetScore: 80, battery: 5000, cameraScore: 80, screenScore: 80 },
      { id: 'T3', name: 'Phone 3', brand: 'B', price: 6000000, ram: 16, storage: 256, chipsetScore: 90, battery: 6000, cameraScore: 90, screenScore: 90 },
    ];

    const minMax = SawEngine.calculateMinMax(sampleItems, criteria);
    this.assert('MinMax benefit mendeteksi nilai maksimum dengan benar', minMax.C2.max === 16);
    this.assert('MinMax cost mendeteksi nilai minimum dengan benar', minMax.C1.min === 2000000);

    const normalized = SawEngine.normalize(sampleItems, criteria, minMax);
    // C2 normalisasi: T1 = 4/16 = 0.25, T2 = 8/16 = 0.5, T3 = 16/16 = 1.0
    this.assert('Normalisasi kriteria benefit sesuai formula r_ij = x_ij / max', 
      normalized[0].normalizedValues.C2 === 0.25 &&
      normalized[1].normalizedValues.C2 === 0.5 &&
      normalized[2].normalizedValues.C2 === 1.0);

    // 2. Uji Normalisasi Cost (r_ij = min / x_ij)
    // C1 (Harga): min = 2000000. T1 = 2M/2M = 1.0, T2 = 2M/4M = 0.5, T3 = 2M/6M = 0.3333...
    const normCostT1 = normalized[0].normalizedValues.C1;
    const normCostT2 = normalized[1].normalizedValues.C1;
    const normCostT3 = Number(normalized[2].normalizedValues.C1.toFixed(4));
    this.assert('Normalisasi kriteria cost sesuai formula r_ij = min / x_ij', 
      normCostT1 === 1.0 && normCostT2 === 0.5 && Math.abs(normCostT3 - 0.3333) < 0.001);

    // 3. Uji Filter Kelayakan Anggaran (Eligibility Filter)
    const budgetTest = SawEngine.execute({
      items: sampleItems,
      budget: 4500000, // Phone 3 (6jt) harus tereksklusi
      rawWeights: { C1: 20, C2: 15, C3: 15, C4: 15, C5: 15, C6: 10, C7: 10 },
      criteriaList: criteria
    });

    this.assert('Produk di atas anggaran otomatis disaring ke daftar excluded.overBudget', 
      budgetTest.excluded.overBudget.length === 1 && budgetTest.excluded.overBudget[0].item.id === 'T3');
    this.assert('Hanya produk sesuai anggaran yang masuk evaluasi SAW', 
      budgetTest.ranking.length === 2 && budgetTest.ranking.every(r => r.item.price <= 4500000));

    // 4. Uji Penanganan Data Tidak Lengkap (Incomplete Data Protection)
    const incompleteItems = [
      { id: 'INC-1', name: 'Incomplete Phone', brand: 'B', price: 3000000, ram: 8, storage: 128, battery: 5000, chipsetScore: null, cameraScore: 80, screenScore: 80 },
      { id: 'VAL-1', name: 'Valid Phone', brand: 'B', price: 3000000, ram: 8, storage: 128, battery: 5000, chipsetScore: 85, cameraScore: 80, screenScore: 80 }
    ];

    const incompleteTest = SawEngine.execute({
      items: incompleteItems,
      budget: 5000000,
      rawWeights: { C1: 20, C2: 15, C3: 15, C4: 15, C5: 15, C6: 10, C7: 10 },
      criteriaList: criteria
    });

    this.assert('Produk yang tidak memiliki data lengkap untuk 7 kriteria tidak dihitung dan masuk excluded.incomplete', 
      incompleteTest.excluded.incomplete.length === 1 && incompleteTest.excluded.incomplete[0].item.id === 'INC-1');
    this.assert('Alasan pengecualian data tidak lengkap dicatat secara transparan', 
      incompleteTest.excluded.incomplete[0].reason.includes('C4'));

    // 5. Uji Tie-Break Deterministik:
    // Dua alternatif memiliki skor preferensi yang identik persis
    const tieBreakItems = [
      // Keduanya memiliki spesifikasi identik, tetapi Phone Beta harganya lebih murah dari Phone Alpha
      { id: 'TB-1', name: 'Phone Alpha', brand: 'BrandA', price: 3500000, ram: 8, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
      { id: 'TB-2', name: 'Phone Beta', brand: 'BrandB', price: 3200000, ram: 8, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
    ];

    // Beri bobot hanya pada kriteria non-harga untuk mensimulasikan skor sama persis
    const tieBreakWeights = { C1: 0, C2: 20, C3: 20, C4: 20, C5: 20, C6: 10, C7: 10 };
    const tieTest = SawEngine.execute({
      items: tieBreakItems,
      budget: 4000000,
      rawWeights: tieBreakWeights,
      criteriaList: criteria
    });

    this.assert('Tie-break deterministik: jika skor SAW sama, harga lebih murah menempati peringkat lebih tinggi', 
      tieTest.ranking[0].item.id === 'TB-2' && tieTest.ranking[0].rank === 1);

    // Tie-break jika skor sama dan harga sama persis -> Urut alfabetis nama (A-Z)
    const tieAlphabetItems = [
      { id: 'TA-2', name: 'Zeta Mobile', brand: 'BrandZ', price: 3000000, ram: 8, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
      { id: 'TA-1', name: 'Acro Mobile', brand: 'BrandA', price: 3000000, ram: 8, storage: 128, battery: 5000, chipsetScore: 80, cameraScore: 80, screenScore: 80 },
    ];
    const tieAlphaTest = SawEngine.execute({
      items: tieAlphabetItems,
      budget: 4000000,
      rawWeights: tieBreakWeights,
      criteriaList: criteria
    });

    this.assert('Tie-break deterministik: jika skor dan harga sama, nama urut alfabetis (A-Z)', 
      tieAlphaTest.ranking[0].item.name === 'Acro Mobile' && tieAlphaTest.ranking[1].item.name === 'Zeta Mobile');

    // 6. Uji Pembagian Nol & Keamanan Numerik
    const zeroTestResult = SawEngine.normalize([
      { id: 'Z1', name: 'Zero Phone', brand: 'B', price: 0, ram: 0, storage: 0, battery: 0, chipsetScore: 0, cameraScore: 0, screenScore: 0 }
    ], criteria, { C1: { min: 0, max: 0 }, C2: { min: 0, max: 0 } });

    this.assert('Engine SAW aman dari Division by Zero atau NaN pada nilai 0', 
      !isNaN(zeroTestResult[0].normalizedValues.C1) && zeroTestResult[0].normalizedValues.C1 === 0);

    console.log(`--- Pengujian SAW Selesai: ${this.results.filter(r => r.passed).length}/${this.results.length} Lulus ---`);
    return this.results;
  }
};

window.SawTests = SawTests;
