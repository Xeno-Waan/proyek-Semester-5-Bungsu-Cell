/**
 * SPK Bungsu Cell — Admin Dashboard Module
 * Menghitung ringkasan statistik riil toko langsung dari repositori data lokal.
 * Sesuai PRD.md Bagian 4.3 & UI-GUIDELINE.md Bagian 4.
 */

const AdminDashboard = {
  init() {
    this.renderStats();
  },

  renderStats() {
    if (!window.SmartphoneRepository || !window.CriteriaRepository) return;

    const smartphones = window.SmartphoneRepository.getAll();
    const criteria = window.CriteriaRepository.getAll();

    // 1. Total Smartphone
    const statPhoneEl = document.getElementById('statSmartphoneCount');
    if (statPhoneEl) {
      statPhoneEl.textContent = smartphones.length;
    }

    // 2. Total Kriteria
    const statCritEl = document.getElementById('statCriteriaCount');
    if (statCritEl) {
      statCritEl.textContent = criteria.length;
    }

    // 3. Status Penyimpanan
    const storageCheck = window.StorageService ? window.StorageService.isAvailable() : { available: false };
    const statStorageEl = document.getElementById('statStorageStatus');
    if (statStorageEl) {
      statStorageEl.textContent = storageCheck.available ? 'Aktif (Lokal)' : 'Terbatas';
    }

    // 4. Hitung kelengkapan data smartphone riil
    const completeCount = smartphones.filter(s => window.SmartphoneRepository.checkSawCompleteness(s).complete).length;
    const statCompleteEl = document.getElementById('statCompleteCount');
    if (statCompleteEl) {
      statCompleteEl.textContent = `${completeCount}/${smartphones.length}`;
    }
  }
};

window.AdminDashboard = AdminDashboard;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('statSmartphoneCount')) {
      AdminDashboard.init();
    }
  });
}
