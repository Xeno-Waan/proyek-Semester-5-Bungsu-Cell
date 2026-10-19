/**
 * SPK Bungsu Cell — Smartphone Schema & Repository
 * Skema validasi data smartphone, penanganan kelengkapan data minimum kriteria SAW,
 * dan operasi CRUD lokal berbasis StorageService.
 * Sesuai aturan PRD.md Bagian 6 & 7 serta IMPLEMENTATION_PLAN.md Bagian 4.
 */

const SmartphoneRepository = {
  /**
   * Menghasilkan ID unik untuk entri smartphone baru.
   * @returns {string}
   */
  generateId() {
    return 'BC-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
  },

  /**
   * Memvalidasi struktur data smartphone.
   * @param {Object} data
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate(data) {
    const errors = [];

    if (!data || typeof data !== 'object') {
      return { valid: false, errors: ['Data smartphone harus berupa objek.'] };
    }

    // Nama Smartphone
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Nama smartphone wajib diisi.');
    }

    // Merek
    if (!data.brand || typeof data.brand !== 'string' || data.brand.trim() === '') {
      errors.push('Merek smartphone wajib diisi.');
    }

    // Harga (C1)
    const price = Number(data.price);
    if (isNaN(price) || price <= 0) {
      errors.push('Harga harus berupa angka lebih dari 0.');
    }

    // RAM (C2)
    const ram = Number(data.ram);
    if (isNaN(ram) || ram <= 0) {
      errors.push('RAM harus berupa angka lebih dari 0 GB.');
    }

    // Penyimpanan Internal (C3)
    const storage = Number(data.storage);
    if (isNaN(storage) || storage <= 0) {
      errors.push('Penyimpanan internal (ROM) harus berupa angka lebih dari 0 GB.');
    }

    // Kapasitas Baterai (C5)
    const battery = Number(data.battery);
    if (isNaN(battery) || battery <= 0) {
      errors.push('Kapasitas baterai harus berupa angka lebih dari 0 mAh.');
    }

    // Skor Evaluatif Rubrik (C4, C6, C7)
    // Jika diisi, harus dalam rentang 1 - 100
    ['chipsetScore', 'cameraScore', 'screenScore'].forEach(scoreKey => {
      if (data[scoreKey] !== undefined && data[scoreKey] !== null && data[scoreKey] !== '') {
        const scoreVal = Number(data[scoreKey]);
        if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 100) {
          errors.push(`Nilai ${scoreKey} harus berupa angka antara 1 hingga 100.`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Memeriksa apakah suatu smartphone memiliki data minimum yang lengkap untuk seluruh 7 kriteria SAW.
   * Aturan SOT: Nilai kosong tidak boleh diubah diam-diam menjadi nol;
   * produk yang tidak lengkap harus dikecualikan dengan alasan yang jelas.
   * @param {Object} item
   * @returns {{ complete: boolean, missingCriteria: string[] }}
   */
  checkSawCompleteness(item) {
    const missing = [];

    if (!item.price || isNaN(Number(item.price)) || Number(item.price) <= 0) missing.push('C1: Harga');
    if (!item.ram || isNaN(Number(item.ram)) || Number(item.ram) <= 0) missing.push('C2: RAM');
    if (!item.storage || isNaN(Number(item.storage)) || Number(item.storage) <= 0) missing.push('C3: ROM');
    if (item.chipsetScore === undefined || item.chipsetScore === null || isNaN(Number(item.chipsetScore))) missing.push('C4: Skor Chipset');
    if (!item.battery || isNaN(Number(item.battery)) || Number(item.battery) <= 0) missing.push('C5: Baterai');
    if (item.cameraScore === undefined || item.cameraScore === null || isNaN(Number(item.cameraScore))) missing.push('C6: Skor Kamera');
    if (item.screenScore === undefined || item.screenScore === null || isNaN(Number(item.screenScore))) missing.push('C7: Skor Layar');

    return {
      complete: missing.length === 0,
      missingCriteria: missing
    };
  },

  /**
   * Mengambil semua smartphone dari storage lokal.
   * Mengembalikan array kosong jika belum ada data nyata yang dimuat (patuh SOT).
   * @returns {Array}
   */
  getAll() {
    if (!window.StorageService) return [];
    const list = window.StorageService.get(window.STORAGE_KEYS.SMARTPHONES, []);
    return Array.isArray(list) ? list : [];
  },

  /**
   * Mencari smartphone berdasarkan ID.
   * @param {string} id
   * @returns {Object|null}
   */
  getById(id) {
    const list = this.getAll();
    return list.find(item => item.id === id) || null;
  },

  /**
   * Menambahkan smartphone baru ke storage.
   * @param {Object} itemData
   * @returns {{ success: boolean, item?: Object, errors?: string[] }}
   */
  create(itemData) {
    const validation = this.validate(itemData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const newItem = {
      id: itemData.id || this.generateId(),
      name: itemData.name.trim(),
      brand: itemData.brand.trim(),
      price: Number(itemData.price),
      ram: Number(itemData.ram),
      storage: Number(itemData.storage),
      battery: Number(itemData.battery),
      chipsetName: itemData.chipsetName ? itemData.chipsetName.trim() : '',
      chipsetScore: (itemData.chipsetScore !== undefined && itemData.chipsetScore !== null && itemData.chipsetScore !== '') ? Number(itemData.chipsetScore) : null,
      cameraDesc: itemData.cameraDesc ? itemData.cameraDesc.trim() : '',
      cameraScore: (itemData.cameraScore !== undefined && itemData.cameraScore !== null && itemData.cameraScore !== '') ? Number(itemData.cameraScore) : null,
      screenDesc: itemData.screenDesc ? itemData.screenDesc.trim() : '',
      screenScore: (itemData.screenScore !== undefined && itemData.screenScore !== null && itemData.screenScore !== '') ? Number(itemData.screenScore) : null,
      stockStatus: itemData.stockStatus || 'Tersedia',
      image: itemData.image || '',
      updatedAt: new Date().toISOString()
    };

    const currentList = this.getAll();
    currentList.push(newItem);

    const saveRes = window.StorageService.set(window.STORAGE_KEYS.SMARTPHONES, currentList);
    if (!saveRes.success) {
      return { success: false, errors: [saveRes.error] };
    }

    return { success: true, item: newItem };
  },

  /**
   * Mengubah data smartphone yang sudah ada.
   * @param {string} id
   * @param {Object} updateData
   * @returns {{ success: boolean, item?: Object, errors?: string[] }}
   */
  update(id, updateData) {
    const validation = this.validate(updateData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const currentList = this.getAll();
    const index = currentList.findIndex(i => i.id === id);
    if (index === -1) {
      return { success: false, errors: [`Smartphone dengan ID ${id} tidak ditemukan.`] };
    }

    const updatedItem = {
      ...currentList[index],
      name: updateData.name.trim(),
      brand: updateData.brand.trim(),
      price: Number(updateData.price),
      ram: Number(updateData.ram),
      storage: Number(updateData.storage),
      battery: Number(updateData.battery),
      chipsetName: updateData.chipsetName ? updateData.chipsetName.trim() : '',
      chipsetScore: (updateData.chipsetScore !== undefined && updateData.chipsetScore !== null && updateData.chipsetScore !== '') ? Number(updateData.chipsetScore) : null,
      cameraDesc: updateData.cameraDesc ? updateData.cameraDesc.trim() : '',
      cameraScore: (updateData.cameraScore !== undefined && updateData.cameraScore !== null && updateData.cameraScore !== '') ? Number(updateData.cameraScore) : null,
      screenDesc: updateData.screenDesc ? updateData.screenDesc.trim() : '',
      screenScore: (updateData.screenScore !== undefined && updateData.screenScore !== null && updateData.screenScore !== '') ? Number(updateData.screenScore) : null,
      stockStatus: updateData.stockStatus || currentList[index].stockStatus,
      image: updateData.image !== undefined ? updateData.image : currentList[index].image,
      updatedAt: new Date().toISOString()
    };

    currentList[index] = updatedItem;
    const saveRes = window.StorageService.set(window.STORAGE_KEYS.SMARTPHONES, currentList);
    if (!saveRes.success) {
      return { success: false, errors: [saveRes.error] };
    }

    return { success: true, item: updatedItem };
  },

  /**
   * Menghapus smartphone berdasarkan ID.
   * @param {string} id
   * @returns {{ success: boolean, errors?: string[] }}
   */
  delete(id) {
    const currentList = this.getAll();
    const filtered = currentList.filter(i => i.id !== id);
    if (filtered.length === currentList.length) {
      return { success: false, errors: [`Smartphone dengan ID ${id} tidak ditemukan.`] };
    }

    const saveRes = window.StorageService.set(window.STORAGE_KEYS.SMARTPHONES, filtered);
    if (!saveRes.success) {
      return { success: false, errors: [saveRes.error] };
    }

    return { success: true };
  },

  /**
   * Mengimpor dataset smartphone dalam jumlah banyak (batch).
   * @param {Array} batchArray
   * @returns {{ success: boolean, count: number, errors?: string[] }}
   */
  importBatch(batchArray) {
    if (!Array.isArray(batchArray)) {
      return { success: false, count: 0, errors: ['Format data batch harus berupa array.'] };
    }

    const validatedItems = [];
    const allErrors = [];

    batchArray.forEach((item, idx) => {
      const v = this.validate(item);
      if (!v.valid) {
        allErrors.push(`Baris ${idx + 1} (${item.name || 'Tanpa nama'}): ${v.errors.join(', ')}`);
      } else {
        validatedItems.push({
          id: item.id || this.generateId(),
          name: item.name.trim(),
          brand: item.brand.trim(),
          price: Number(item.price),
          ram: Number(item.ram),
          storage: Number(item.storage),
          battery: Number(item.battery),
          chipsetName: item.chipsetName ? item.chipsetName.trim() : '',
          chipsetScore: (item.chipsetScore !== undefined && item.chipsetScore !== null && item.chipsetScore !== '') ? Number(item.chipsetScore) : null,
          cameraDesc: item.cameraDesc ? item.cameraDesc.trim() : '',
          cameraScore: (item.cameraScore !== undefined && item.cameraScore !== null && item.cameraScore !== '') ? Number(item.cameraScore) : null,
          screenDesc: item.screenDesc ? item.screenDesc.trim() : '',
          screenScore: (item.screenScore !== undefined && item.screenScore !== null && item.screenScore !== '') ? Number(item.screenScore) : null,
          stockStatus: item.stockStatus || 'Tersedia',
          image: item.image || '',
          updatedAt: item.updatedAt || new Date().toISOString()
        });
      }
    });

    if (allErrors.length > 0) {
      return { success: false, count: 0, errors: allErrors };
    }

    const saveRes = window.StorageService.set(window.STORAGE_KEYS.SMARTPHONES, validatedItems);
    if (!saveRes.success) {
      return { success: false, count: 0, errors: [saveRes.error] };
    }

    return { success: true, count: validatedItems.length };
  }
};

// Export ke window
window.SmartphoneRepository = SmartphoneRepository;
