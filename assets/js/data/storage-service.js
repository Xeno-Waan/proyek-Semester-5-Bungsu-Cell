/**
 * SPK Bungsu Cell — Storage Service
 * Layer penyimpanan lokal berbasis localStorage dengan penanganan error dan deteksi integritas.
 * Sesuai arsitektur front-end-only pada SOT.
 */

const STORAGE_KEYS = {
  SMARTPHONES: 'bungsu_cell_smartphones_v1',
  CRITERIA: 'bungsu_cell_criteria_v1',
  COMPARE_LIST: 'bungsu_cell_compare_ids_v1',
  LAST_RECOMMENDATION: 'bungsu_cell_last_recommendation_v1',
};

const StorageService = {
  /**
   * Mengecek apakah localStorage didukung dan dapat ditulisi.
   * @returns {{ available: boolean, error?: string }}
   */
  isAvailable() {
    try {
      const testKey = '__bungsu_storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return { available: true };
    } catch (e) {
      return {
        available: false,
        error: e.name === 'QuotaExceededError' 
          ? 'Memori penyimpanan browser penuh (QuotaExceededError).' 
          : 'Penyimpanan lokal tidak diizinkan atau dinonaktifkan pada browser.'
      };
    }
  },

  /**
   * Mengambil data dan melakukan parsing JSON secara aman.
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === undefined) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.warn(`[StorageService] Data rusak pada key "${key}". Mengembalikan default.`, e);
      return defaultValue;
    }
  },

  /**
   * Menyimpan data sebagai string JSON ke localStorage.
   * @param {string} key
   * @param {*} value
   * @returns {{ success: boolean, error?: string }}
   */
  set(key, value) {
    const check = this.isAvailable();
    if (!check.available) {
      return { success: false, error: check.error };
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return { success: true };
    } catch (e) {
      console.error(`[StorageService] Gagal menyimpan data pada key "${key}".`, e);
      return {
        success: false,
        error: e.name === 'QuotaExceededError'
          ? 'Kapasitas penyimpanan browser tidak mencukupi untuk menyimpan data ini.'
          : 'Gagal menulis ke penyimpanan lokal browser.'
      };
    }
  },

  /**
   * Menghapus item dari storage.
   * @param {string} key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Menghapus seluruh data aplikasi SPK Bungsu Cell di storage lokal.
   */
  clearAllBungsuData() {
    Object.values(STORAGE_KEYS).forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        // Abaikan kegagalan individual
      }
    });
    return { success: true };
  }
};

// Export ke window untuk lingkungan browser vanilla ES6
window.STORAGE_KEYS = STORAGE_KEYS;
window.StorageService = StorageService;
