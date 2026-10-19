/**
 * SPK Bungsu Cell — Compare Module
 * Menangani perbandingan berdampingan 2 hingga 3 smartphone.
 * Sesuai PRD.md Bagian 4.2 & IMPLEMENTATION_PLAN.md Fase E.
 */

const CompareModule = {
  init() {
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const btnClear = document.getElementById('btnClearCompare');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.clearAll();
      });
    }
  },

  getCompareItems() {
    if (!window.StorageService || !window.SmartphoneRepository) return [];
    const ids = window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []);
    if (!Array.isArray(ids)) return [];

    return ids.map(id => window.SmartphoneRepository.getById(id)).filter(Boolean);
  },

  render() {
    const container = document.getElementById('compareTableContainer');
    const btnClear = document.getElementById('btnClearCompare');
    if (!container) return;

    const items = this.getCompareItems();

    // Update visibility tombol bersihkan
    if (btnClear) {
      if (items.length > 0) {
        btnClear.classList.remove('d-none');
      } else {
        btnClear.classList.add('d-none');
      }
    }

    // Kasus 1: Kurang dari 2 produk dipilih (SOT rule: perbandingan 2-3 smartphone)
    if (items.length < 2) {
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="bi bi-arrow-left-right empty-state-icon"></i>
          <h2 class="empty-state-title">${items.length === 0 ? 'Belum Ada Produk yang Dipilih' : 'Pilih Minimal 1 Produk Lagi'}</h2>
          <p class="empty-state-desc">
            ${items.length === 0 
              ? 'Fitur perbandingan memerlukan <strong>2 hingga 3 smartphone</strong> untuk dibandingkan secara berdampingan. Silakan pilih smartphone dari katalog produk toko.'
              : `Saat ini baru ada <strong>1 produk (${items[0].name})</strong> yang dipilih. Silakan pilih minimal 1 smartphone lagi dari katalog untuk membandingkan spesifikasinya.`}
          </p>
          <a href="catalog.html" class="btn btn-bungsu-primary btn-sm">
            <i class="bi bi-grid me-1"></i> Buka Katalog Smartphone
          </a>
        </div>
      `;
      return;
    }

    // Kasus 2: 2 atau 3 produk dipilih -> Render Tabel Komparasi Berdampingan
    // Hitung highlight nilai terbaik (Best value indicators)
    const minPrice = Math.min(...items.map(i => i.price));
    const maxRam = Math.max(...items.map(i => i.ram));
    const maxStorage = Math.max(...items.map(i => i.storage));
    const maxBattery = Math.max(...items.map(i => i.battery));
    const maxChipset = Math.max(...items.map(i => i.chipsetScore || 0));
    const maxCamera = Math.max(...items.map(i => i.cameraScore || 0));
    const maxScreen = Math.max(...items.map(i => i.screenScore || 0));

    const colWidth = items.length === 2 ? 'width: 38%;' : 'width: 25%;';

    let headerCols = '';
    let priceRows = '';
    let ramRows = '';
    let storageRows = '';
    let batteryRows = '';
    let chipsetRows = '';
    let cameraRows = '';
    let screenRows = '';
    let stockRows = '';
    let actionRows = '';

    items.forEach(item => {
      const formattedPrice = window.formatRupiah ? window.formatRupiah(item.price) : `Rp ${item.price}`;
      const isBestPrice = item.price === minPrice;
      const isBestRam = item.ram === maxRam;
      const isBestStorage = item.storage === maxStorage;
      const isBestBattery = item.battery === maxBattery;
      const isBestChipset = (item.chipsetScore || 0) === maxChipset && maxChipset > 0;
      const isBestCamera = (item.cameraScore || 0) === maxCamera && maxCamera > 0;
      const isBestScreen = (item.screenScore || 0) === maxScreen && maxScreen > 0;

      // Header Card
      headerCols += `
        <th style="${colWidth}" class="text-center bg-white p-3 border">
          <div class="position-relative">
            <button 
              type="button" 
              class="btn-close position-absolute top-0 end-0" 
              title="Hapus produk dari perbandingan"
              onclick="CompareModule.removeItem('${item.id}')"></button>
            <span class="badge bg-secondary mb-2">${item.brand}</span>
            <div class="my-2">
              <i class="bi bi-phone fs-1 text-success"></i>
            </div>
            <h3 class="h6 fw-bold mb-1 text-truncate" title="${item.name}">${item.name}</h3>
            <div class="fs-5 fw-extrabold text-success mb-2">${formattedPrice}</div>
            <a href="product-detail.html?id=${item.id}" class="btn btn-bungsu-outline btn-sm w-100 py-1">
              Detail Lengkap
            </a>
          </div>
        </th>
      `;

      // Price Row (Cost)
      priceRows += `
        <td class="text-center align-middle p-3 ${isBestPrice ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          ${formattedPrice}
          ${isBestPrice ? '<div class="badge bg-success mt-1 d-block"><i class="bi bi-star-fill me-1"></i>Paling Terjangkau</div>' : ''}
        </td>
      `;

      // RAM Row (Benefit)
      ramRows += `
        <td class="text-center align-middle p-3 ${isBestRam ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          ${item.ram} GB
          ${isBestRam && items.length > 1 ? '<div class="badge bg-success mt-1 d-block">Tertinggi</div>' : ''}
        </td>
      `;

      // ROM Row (Benefit)
      storageRows += `
        <td class="text-center align-middle p-3 ${isBestStorage ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          ${item.storage} GB
          ${isBestStorage && items.length > 1 ? '<div class="badge bg-success mt-1 d-block">Terbesar</div>' : ''}
        </td>
      `;

      // Baterai Row (Benefit)
      batteryRows += `
        <td class="text-center align-middle p-3 ${isBestBattery ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          ${item.battery} mAh
          ${isBestBattery && items.length > 1 ? '<div class="badge bg-success mt-1 d-block">Terbesar</div>' : ''}
        </td>
      `;

      // Chipset Row
      chipsetRows += `
        <td class="text-center align-middle p-3 ${isBestChipset ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          <div class="fw-semibold">${item.chipsetName || 'Standar'}</div>
          <div class="small text-muted mt-1">
            Skor Rubrik: ${item.chipsetScore !== null ? `<strong>${item.chipsetScore}/100</strong>` : '<span class="text-muted">Belum dinilai</span>'}
          </div>
        </td>
      `;

      // Kamera Row
      cameraRows += `
        <td class="text-center align-middle p-3 ${isBestCamera ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          <div class="small">${item.cameraDesc || 'Standar'}</div>
          <div class="small text-muted mt-1">
            Skor Rubrik: ${item.cameraScore !== null ? `<strong>${item.cameraScore}/100</strong>` : '<span class="text-muted">Belum dinilai</span>'}
          </div>
        </td>
      `;

      // Layar Row
      screenRows += `
        <td class="text-center align-middle p-3 ${isBestScreen ? 'table-success bg-opacity-25 fw-bold text-success' : ''}">
          <div class="small">${item.screenDesc || 'Standar'}</div>
          <div class="small text-muted mt-1">
            Skor Rubrik: ${item.screenScore !== null ? `<strong>${item.screenScore}/100</strong>` : '<span class="text-muted">Belum dinilai</span>'}
          </div>
        </td>
      `;

      // Stok Row
      stockRows += `
        <td class="text-center align-middle p-3">
          <span class="badge ${item.stockStatus === 'Tersedia' ? 'bg-success' : 'bg-warning text-dark'}">
            ${item.stockStatus || 'Tersedia'}
          </span>
        </td>
      `;

      // Action Row
      actionRows += `
        <td class="text-center align-middle p-3">
          <a href="recommendation.html?budget=${item.price}" class="btn btn-bungsu-accent btn-sm w-100 py-1">
            <i class="bi bi-calculator me-1"></i> Hitung di SPK
          </a>
        </td>
      `;
    });

    container.innerHTML = `
      <div class="bungsu-card overflow-hidden shadow-sm mb-4">
        <div class="table-responsive">
          <table class="table table-bordered align-middle mb-0">
            <thead>
              <tr>
                <th style="width: 24%;" class="bg-light align-middle p-3">
                  <div class="fw-bold text-dark">Smartphone (${items.length}/3)</div>
                  <div class="small text-muted">Perbandingan Spesifikasi</div>
                </th>
                ${headerCols}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C1: Harga Smartphone</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Cost (Biaya)</div>
                </th>
                ${priceRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C2: Kapasitas RAM</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Benefit</div>
                </th>
                ${ramRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C3: Penyimpanan Internal (ROM)</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Benefit</div>
                </th>
                ${storageRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C4: Performa Chipset</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Benefit (Skor Rubrik)</div>
                </th>
                ${chipsetRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C5: Kapasitas Baterai</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Benefit</div>
                </th>
                ${batteryRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C6: Kualitas Kamera</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Benefit (Skor Rubrik)</div>
                </th>
                ${cameraRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">C7: Kualitas Layar</div>
                  <div class="text-muted" style="font-size:0.75rem;">Kriteria Benefit (Skor Rubrik)</div>
                </th>
                ${screenRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">Status Stok</div>
                  <div class="text-muted" style="font-size:0.75rem;">Ketersediaan Toko</div>
                </th>
                ${stockRows}
              </tr>
              <tr>
                <th class="bg-light p-3 small">
                  <div class="fw-bold">Tindakan SPK</div>
                  <div class="text-muted" style="font-size:0.75rem;">Rekomendasi Cepat</div>
                </th>
                ${actionRows}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        ${items.length < 3 ? `
          <a href="catalog.html" class="btn btn-bungsu-outline btn-sm">
            <i class="bi bi-plus-lg me-1"></i> Tambah 1 Smartphone Lagi dari Katalog
          </a>
        ` : `
          <span class="small text-muted"><i class="bi bi-check-circle text-success me-1"></i> Maksimal 3 produk telah dipilih untuk dibandingkan.</span>
        `}
        <a href="recommendation.html" class="btn btn-bungsu-primary btn-sm">
          <i class="bi bi-magic me-1"></i> Buka Halaman Konsultasi SPK
        </a>
      </div>
    `;
  },

  removeItem(id) {
    if (!window.StorageService) return;
    let list = window.StorageService.get(window.STORAGE_KEYS.COMPARE_LIST, []);
    if (!Array.isArray(list)) list = [];

    list = list.filter(item => item !== id);
    window.StorageService.set(window.STORAGE_KEYS.COMPARE_LIST, list);

    if (window.CatalogModule) {
      window.CatalogModule.updateCompareBadge();
    }
    this.render();
  },

  clearAll() {
    if (!window.StorageService) return;
    window.StorageService.set(window.STORAGE_KEYS.COMPARE_LIST, []);
    if (window.CatalogModule) {
      window.CatalogModule.updateCompareBadge();
    }
    this.render();
  }
};

window.CompareModule = CompareModule;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('compareTableContainer')) {
      CompareModule.init();
    }
  });
}
