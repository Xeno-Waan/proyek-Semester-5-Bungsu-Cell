/**
 * SPK Bungsu Cell — Criteria Schema & Repository
 * Definisi 7 kriteria standar SAW, mekanisme pembobotan Rank Order Centroid (ROC),
 * aturan validasi bobot, dan persistensi kriteria.
 * Sesuai PRD.md Bagian 5 & IMPLEMENTATION_PLAN.md Bagian 6.
 */

const DEFAULT_CRITERIA = [
  {
    code: 'C1',
    name: 'Harga Smartphone',
    type: 'cost',
    unit: 'IDR',
    priorityRank: 1,
    defaultWeight: 0.3704,
    evalMethod: 'direct_numeric',
    description: 'Biaya pembelian smartphone (kriteria biaya: semakin rendah semakin baik).'
  },
  {
    code: 'C2',
    name: 'Kapasitas RAM',
    type: 'benefit',
    unit: 'GB',
    priorityRank: 2,
    defaultWeight: 0.2276,
    evalMethod: 'direct_numeric',
    description: 'Besaran memori akses acak multitasking (kriteria manfaat: semakin besar semakin baik).'
  },
  {
    code: 'C3',
    name: 'Penyimpanan Internal (ROM)',
    type: 'benefit',
    unit: 'GB',
    priorityRank: 3,
    defaultWeight: 0.1561,
    evalMethod: 'direct_numeric',
    description: 'Kapasitas penyimpanan data & aplikasi (kriteria manfaat: semakin besar semakin baik).'
  },
  {
    code: 'C4',
    name: 'Performa Chipset',
    type: 'benefit',
    unit: 'score',
    priorityRank: 4,
    defaultWeight: 0.1085,
    evalMethod: 'rubric_score',
    description: 'Skor performa komputasi dan grafis berdasarkan rubrik evaluasi terstandar.'
  },
  {
    code: 'C5',
    name: 'Kapasitas Baterai',
    type: 'benefit',
    unit: 'mAh',
    priorityRank: 5,
    defaultWeight: 0.0728,
    evalMethod: 'direct_numeric',
    description: 'Daya tahan baterai perangkat (kriteria manfaat: semakin besar semakin baik).'
  },
  {
    code: 'C6',
    name: 'Kualitas Kamera',
    type: 'benefit',
    unit: 'score',
    priorityRank: 6,
    defaultWeight: 0.0442,
    evalMethod: 'rubric_score',
    description: 'Skor evaluasi kemampuan sensor, optik, dan pemrosesan gambar kamera.'
  },
  {
    code: 'C7',
    name: 'Kualitas Layar',
    type: 'benefit',
    unit: 'score',
    priorityRank: 7,
    defaultWeight: 0.0204,
    evalMethod: 'rubric_score',
    description: 'Skor evaluasi tipe panel (AMOLED/IPS), refresh rate, dan ketajaman layar.'
  }
];

const CriteriaRepository = {
  /**
   * Mengembalikan daftar kriteria kanonikal default.
   * @returns {Array}
   */
  getDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_CRITERIA));
  },

  /**
   * Menghitung bobot Rank Order Centroid (ROC) untuk m kriteria.
   * Rumus: w_j = (1/m) * sum_{k=j}^m (1/k) untuk peringkat j = 1..m
   * @param {number} m - Jumlah total kriteria
   * @returns {number[]} Array bobot desimal [w_1, w_2, ..., w_m] dengan total tepat 1.0
   */
  calculateRocWeights(m) {
    if (!m || m <= 0) return [];
    if (m === 1) return [1.0];

    const weights = [];
    for (let j = 1; j <= m; j++) {
      let sumReciprocal = 0;
      for (let k = j; k <= m; k++) {
        sumReciprocal += (1 / k);
      }
      const rawW = sumReciprocal / m;
      weights.push(Number(rawW.toFixed(4)));
    }

    // Koreksi presisi pembulatan agar total persis 1.0000
    const total = weights.reduce((acc, val) => acc + val, 0);
    const diff = Number((1.0 - total).toFixed(4));
    if (diff !== 0 && weights.length > 0) {
      weights[0] = Number((weights[0] + diff).toFixed(4));
    }

    return weights;
  },

  /**
   * Mengaplikasikan bobot ROC berdasarkan urutan priorityRank kriteria.
   * Mengurutkan kriteria berdasarkan priorityRank (1..m),
   * lalu mengisikan defaultWeight sesuai nilai ROC.
   * @param {Array} criteriaList
   * @returns {Array} criteriaList yang telah diperbarui bobotnya
   */
  applyRocRanks(criteriaList) {
    if (!Array.isArray(criteriaList) || criteriaList.length === 0) return [];

    const m = criteriaList.length;
    const rocWeights = this.calculateRocWeights(m);

    // Salin array
    const sorted = [...criteriaList].sort((a, b) => {
      const rankA = typeof a.priorityRank === 'number' ? a.priorityRank : 999;
      const rankB = typeof b.priorityRank === 'number' ? b.priorityRank : 999;
      return rankA - rankB;
    });

    // Petakan bobot ROC ke setiap kriteria sesuai peringkatnya
    sorted.forEach((item, index) => {
      item.priorityRank = index + 1;
      item.defaultWeight = rocWeights[index];
    });

    return sorted;
  },

  /**
   * Memvalidasi array kriteria dan bobot.
   * Total bobot harus = 1.0 (atau 100%).
   * @param {Array} criteriaList
   * @returns {{ valid: boolean, sum: number, errors: string[] }}
   */
  validate(criteriaList) {
    const errors = [];
    if (!Array.isArray(criteriaList) || criteriaList.length === 0) {
      return { valid: false, sum: 0, errors: ['Daftar kriteria tidak boleh kosong.'] };
    }

    let sum = 0;
    criteriaList.forEach((c, idx) => {
      if (!c.code || !c.name || !c.type) {
        errors.push(`Kriteria pada indeks ${idx} tidak memiliki atribut wajib (code, name, type).`);
      }
      if (!['benefit', 'cost'].includes(c.type)) {
        errors.push(`Kriteria ${c.code || idx} memiliki tipe tidak valid: "${c.type}". Harus 'benefit' atau 'cost'.`);
      }
      const weight = typeof c.defaultWeight === 'number' ? c.defaultWeight : parseFloat(c.defaultWeight);
      if (isNaN(weight) || weight < 0) {
        errors.push(`Kriteria ${c.code || idx} memiliki bobot tidak valid.`);
      } else {
        sum += weight;
      }
    });

    // Cek toleransi floating point total bobot
    // Mendukung baik skala 0-1 (toleransi 0.001) maupun skala persentase 0-100 (toleransi 0.1)
    const isDecimalScale = sum <= 1.05;
    const targetSum = isDecimalScale ? 1.0 : 100.0;
    const tolerance = isDecimalScale ? 0.005 : 0.5;

    if (Math.abs(sum - targetSum) > tolerance) {
      errors.push(`Total bobot (${sum.toFixed(2)}) tidak bernilai ${targetSum}. Total bobot kriteria harus tepat 100%.`);
    }

    return {
      valid: errors.length === 0,
      sum: Number(sum.toFixed(4)),
      isDecimalScale,
      errors
    };
  },

  /**
   * Menormalisasi sekumpulan bobot positif sehingga totalnya persis 1.0 (100%).
   * @param {Object} rawWeightsMap - Contoh: { C1: 20, C2: 15, ... }
   * @returns {Object} normalizedWeightsMap - Contoh: { C1: 0.20, C2: 0.15, ... }
   */
  normalizeWeights(rawWeightsMap) {
    const keys = Object.keys(rawWeightsMap);
    let totalRaw = 0;
    keys.forEach(k => {
      const val = parseFloat(rawWeightsMap[k]) || 0;
      if (val > 0) totalRaw += val;
    });

    const normalized = {};
    if (totalRaw <= 0) {
      // Jika semua nol, bagi rata
      const equalShare = 1 / keys.length;
      keys.forEach(k => { normalized[k] = equalShare; });
      return normalized;
    }

    keys.forEach(k => {
      const val = parseFloat(rawWeightsMap[k]) || 0;
      normalized[k] = val > 0 ? (val / totalRaw) : 0;
    });

    return normalized;
  },

  /**
   * Mengambil kriteria aktif dari storage, atau menggunakan default jika belum ada/rusak.
   * @returns {Array}
   */
  getAll() {
    const stored = window.StorageService ? window.StorageService.get(window.STORAGE_KEYS.CRITERIA) : null;
    if (stored && Array.isArray(stored)) {
      const validation = this.validate(stored);
      if (validation.valid) return stored;
    }
    return this.getDefaults();
  },

  /**
   * Menyimpan kriteria dan bobot yang telah divalidasi ke storage.
   * @param {Array} criteriaList
   * @returns {{ success: boolean, errors?: string[] }}
   */
  saveAll(criteriaList) {
    const validation = this.validate(criteriaList);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    if (!window.StorageService) {
      return { success: false, errors: ['StorageService tidak tersedia.'] };
    }

    const res = window.StorageService.set(window.STORAGE_KEYS.CRITERIA, criteriaList);
    if (!res.success) {
      return { success: false, errors: [res.error] };
    }

    return { success: true };
  },

  /**
   * Mengembalikan konfigurasi kriteria ke default.
   */
  resetToDefault() {
    const defaults = this.getDefaults();
    return this.saveAll(defaults);
  }
};

// Export ke window
window.DEFAULT_CRITERIA = DEFAULT_CRITERIA;
window.CriteriaRepository = CriteriaRepository;
