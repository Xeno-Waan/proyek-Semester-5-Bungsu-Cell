/**
 * SPK Bungsu Cell — Simple Additive Weighting (SAW) Engine
 * Algoritma SAW murni yang terpisah sepenuhnya dari DOM/UI.
 * Mengimplementasikan normalisasi benefit & cost, filter kelayakan anggaran,
 * penanganan data tidak lengkap, pembagi nol, dan tie-break deterministik.
 * Sesuai PRD.md Bagian 7 & IMPLEMENTATION_PLAN.md Bagian 6.
 */

const SawEngine = {
  /**
   * Mengambil nilai numerik smartphone untuk suatu kriteria.
   * @param {Object} item
   * @param {string} criterionCode
   * @returns {number|null}
   */
  getCriterionValue(item, criterionCode) {
    if (!item) return null;

    switch (criterionCode) {
      case 'C1': // Harga
        return (item.price !== undefined && item.price !== null && !isNaN(Number(item.price)) && Number(item.price) > 0)
          ? Number(item.price)
          : null;
      case 'C2': // RAM
        return (item.ram !== undefined && item.ram !== null && !isNaN(Number(item.ram)) && Number(item.ram) > 0)
          ? Number(item.ram)
          : null;
      case 'C3': // ROM
        return (item.storage !== undefined && item.storage !== null && !isNaN(Number(item.storage)) && Number(item.storage) > 0)
          ? Number(item.storage)
          : null;
      case 'C4': // Chipset Score (Rubrik)
        return (item.chipsetScore !== undefined && item.chipsetScore !== null && !isNaN(Number(item.chipsetScore)) && Number(item.chipsetScore) >= 1)
          ? Number(item.chipsetScore)
          : null;
      case 'C5': // Baterai
        return (item.battery !== undefined && item.battery !== null && !isNaN(Number(item.battery)) && Number(item.battery) > 0)
          ? Number(item.battery)
          : null;
      case 'C6': // Kamera Score (Rubrik)
        return (item.cameraScore !== undefined && item.cameraScore !== null && !isNaN(Number(item.cameraScore)) && Number(item.cameraScore) >= 1)
          ? Number(item.cameraScore)
          : null;
      case 'C7': // Layar Score (Rubrik)
        return (item.screenScore !== undefined && item.screenScore !== null && !isNaN(Number(item.screenScore)) && Number(item.screenScore) >= 1)
          ? Number(item.screenScore)
          : null;
      default:
        return null;
    }
  },

  /**
   * Memisahkan produk yang lengkap untuk semua kriteria dengan yang tidak lengkap.
   * Aturan SOT: Tidak boleh mengubah nilai kosong menjadi nol secara diam-diam.
   * Produk yang tidak lengkap harus dikecualikan dengan alasan yang jelas.
   * @param {Array} items
   * @param {Array} criteriaList
   * @returns {{ evaluable: Array, incomplete: Array }}
   */
  filterCompleteness(items, criteriaList) {
    const evaluable = [];
    const incomplete = [];

    items.forEach(item => {
      const missing = [];
      criteriaList.forEach(crit => {
        const val = this.getCriterionValue(item, crit.code);
        if (val === null) {
          missing.push(`${crit.code} (${crit.name})`);
        }
      });

      if (missing.length === 0) {
        evaluable.push(item);
      } else {
        incomplete.push({
          item,
          reason: `Data kriteria belum lengkap: ${missing.join(', ')}`
        });
      }
    });

    return { evaluable, incomplete };
  },

  /**
   * Menghitung nilai minimum dan maksimum dari setiap kriteria di antara alternatif yang memenuhi syarat.
   * @param {Array} items
   * @param {Array} criteriaList
   * @returns {Object} minMaxMap - { C1: { min: number, max: number }, ... }
   */
  calculateMinMax(items, criteriaList) {
    const minMaxMap = {};

    criteriaList.forEach(crit => {
      const values = items.map(item => this.getCriterionValue(item, crit.code)).filter(v => v !== null);
      if (values.length > 0) {
        minMaxMap[crit.code] = {
          min: Math.min(...values),
          max: Math.max(...values)
        };
      } else {
        minMaxMap[crit.code] = { min: 0, max: 0 };
      }
    });

    return minMaxMap;
  },

  /**
   * Melakukan normalisasi matriks keputusan.
   * Benefit: r_ij = x_ij / max(x_j)
   * Cost:    r_ij = min(x_j) / x_ij
   * @param {Array} items
   * @param {Array} criteriaList
   * @param {Object} minMaxMap
   * @returns {Array} normalizedAlternatives
   */
  normalize(items, criteriaList, minMaxMap) {
    return items.map(item => {
      const normalizedRow = {};

      criteriaList.forEach(crit => {
        const val = this.getCriterionValue(item, crit.code);
        const minMax = minMaxMap[crit.code] || { min: 0, max: 0 };

        if (val === null || val <= 0) {
          normalizedRow[crit.code] = 0;
          return;
        }

        if (crit.type === 'benefit') {
          // Benefit: x_ij / max(x_j)
          normalizedRow[crit.code] = minMax.max > 0 ? (val / minMax.max) : 0;
        } else if (crit.type === 'cost') {
          // Cost: min(x_j) / x_ij
          normalizedRow[crit.code] = val > 0 ? (minMax.min / val) : 0;
        } else {
          normalizedRow[crit.code] = 0;
        }
      });

      return {
        item,
        normalizedValues: normalizedRow
      };
    });
  },

  /**
   * Menghitung nilai preferensi V_i = sum(w_j * r_ij) dan rincian kontribusi kriteria.
   * @param {Array} normalizedItems
   * @param {Array} criteriaList
   * @param {Object} normalizedWeightsMap
   * @returns {Array} scoredItems
   */
  calculateScores(normalizedItems, criteriaList, normalizedWeightsMap) {
    return normalizedItems.map(({ item, normalizedValues }) => {
      let finalScore = 0;
      const contributions = {};

      criteriaList.forEach(crit => {
        const r_ij = normalizedValues[crit.code] || 0;
        const w_j = normalizedWeightsMap[crit.code] !== undefined ? normalizedWeightsMap[crit.code] : 0;
        const contrib = w_j * r_ij;

        contributions[crit.code] = {
          code: crit.code,
          name: crit.name,
          type: crit.type,
          weight: w_j,
          normalizedValue: Number(r_ij.toFixed(4)),
          weightedScore: Number(contrib.toFixed(4))
        };

        finalScore += contrib;
      });

      const scoreRounded = Number(finalScore.toFixed(4));
      const percentageScore = Number((scoreRounded * 100).toFixed(2));

      return {
        item,
        finalScore: scoreRounded,
        percentageScore,
        contributions
      };
    });
  },

  /**
   * Pengurutan deterministik (Ranking & Tie-break):
   * 1. Skor SAW tertinggi ke terendah.
   * 2. Tie-break 1: Harga lebih rendah lebih unggul.
   * 3. Tie-break 2: Nama produk urut alfabetis (A-Z).
   * @param {Array} scoredItems
   * @returns {Array} rankedItems
   */
  rankWithDeterministicTieBreak(scoredItems) {
    const sorted = [...scoredItems].sort((a, b) => {
      // Prioritas 1: Skor SAW
      if (Math.abs(b.finalScore - a.finalScore) > 0.00001) {
        return b.finalScore - a.finalScore;
      }

      // Prioritas 2 (Tie-break 1): Harga lebih rendah
      const priceA = Number(a.item.price) || 0;
      const priceB = Number(b.item.price) || 0;
      if (priceA !== priceB) {
        return priceA - priceB;
      }

      // Prioritas 3 (Tie-break 2): Nama produk secara alfabetis
      const nameA = a.item.name || '';
      const nameB = b.item.name || '';
      return nameA.localeCompare(nameB);
    });

    // Beri nomor urut ranking
    return sorted.map((entry, idx) => ({
      ...entry,
      rank: idx + 1
    }));
  },

  /**
   * Eksekutor Utama Pipeline SAW.
   * @param {Object} params
   * @param {Array} params.items - Daftar smartphone
   * @param {number} params.budget - Batas anggaran maksimal
   * @param {Object} params.rawWeights - Peta bobot { C1: 20, C2: 15, ... }
   * @param {Array} [params.criteriaList] - Daftar kriteria (opsional, default ke kriteria sistem)
   * @returns {Object} Hasil evaluasi lengkap
   */
  execute({ items, budget, rawWeights, criteriaList }) {
    const criteria = criteriaList || (window.CriteriaRepository ? window.CriteriaRepository.getAll() : []);
    
    // Validasi parameter awal
    if (!Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        error: 'Tidak ada data smartphone untuk dihitung.',
        ranking: [],
        excluded: { overBudget: [], incomplete: [] }
      };
    }

    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      return {
        success: false,
        error: 'Batas anggaran harus berupa angka positif lebih dari 0.',
        ranking: [],
        excluded: { overBudget: [], incomplete: [] }
      };
    }

    // Step 1: Filter Kelayakan Anggaran (Eligibility Filter terpisah dari SAW)
    const overBudget = [];
    const withinBudget = [];

    items.forEach(item => {
      const price = Number(item.price);
      if (!isNaN(price) && price <= budgetNum) {
        withinBudget.push(item);
      } else {
        overBudget.push({
          item,
          reason: `Harga (${window.formatRupiah ? window.formatRupiah(price) : price}) melebihi batas anggaran (${window.formatRupiah ? window.formatRupiah(budgetNum) : budgetNum})`
        });
      }
    });

    if (withinBudget.length === 0) {
      return {
        success: true,
        message: 'Tidak ada smartphone yang memenuhi batas anggaran maksimal Anda.',
        ranking: [],
        excluded: {
          overBudget,
          incomplete: []
        },
        summary: {
          totalEvaluated: 0,
          totalOverBudget: overBudget.length,
          totalIncomplete: 0
        }
      };
    }

    // Step 2: Filter Kelengkapan Data Minimum 7 Kriteria
    const { evaluable, incomplete } = this.filterCompleteness(withinBudget, criteria);

    if (evaluable.length === 0) {
      return {
        success: true,
        message: 'Semua smartphone yang memenuhi anggaran belum memiliki data kriteria yang lengkap untuk evaluasi SAW.',
        ranking: [],
        excluded: {
          overBudget,
          incomplete
        },
        summary: {
          totalEvaluated: 0,
          totalOverBudget: overBudget.length,
          totalIncomplete: incomplete.length
        }
      };
    }

    // Step 3: Normalisasi Bobot Kriteria
    const normalizedWeights = window.CriteriaRepository
      ? window.CriteriaRepository.normalizeWeights(rawWeights)
      : this.simpleNormalizeWeights(rawWeights, criteria);

    // Step 4: Hitung Min & Max untuk Tiap Kriteria
    const minMaxMap = this.calculateMinMax(evaluable, criteria);

    // Step 5: Normalisasi Matriks Keputusan
    const normalizedItems = this.normalize(evaluable, criteria, minMaxMap);

    // Step 6: Hitung Skor Preferensi V_i dan Kontribusi
    const scoredItems = this.calculateScores(normalizedItems, criteria, normalizedWeights);

    // Step 7: Urutkan dengan Deterministic Tie-Break
    const ranking = this.rankWithDeterministicTieBreak(scoredItems);

    return {
      success: true,
      budget: budgetNum,
      ranking,
      excluded: {
        overBudget,
        incomplete
      },
      summary: {
        totalEvaluated: ranking.length,
        totalOverBudget: overBudget.length,
        totalIncomplete: incomplete.length
      },
      minMaxMap,
      normalizedWeights
    };
  },

  simpleNormalizeWeights(rawWeights, criteriaList) {
    const keys = criteriaList.map(c => c.code);
    let sum = 0;
    keys.forEach(k => { sum += (parseFloat(rawWeights[k]) || 0); });
    const norm = {};
    keys.forEach(k => {
      const val = parseFloat(rawWeights[k]) || 0;
      norm[k] = sum > 0 ? (val / sum) : (1 / keys.length);
    });
    return norm;
  }
};

// Export ke window
window.SawEngine = SawEngine;
